"""Backend tests for Museck's SoulSyncService and the live-status paths.

Runs main.py against the fake SoulSync server in fake_soulsync.py, whose
payloads mirror SoulSync's real API v1 serializers and web routes.

Run:  python3 -m unittest discover -s tests -v
"""

import importlib.util
import json
import logging
import os
import sys
import tempfile
import types
import unittest
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fake_soulsync  # noqa: E402

# main.py imports decky, which only exists inside Decky Loader.
_decky = types.ModuleType("decky")
_decky.logger = logging.getLogger("decky-test")
_decky.DECKY_PLUGIN_SETTINGS_DIR = tempfile.mkdtemp()
_decky.DECKY_PLUGIN_LOG_DIR = tempfile.mkdtemp()
sys.modules.setdefault("decky", _decky)

_MAIN_PY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "main.py")
_spec = importlib.util.spec_from_file_location("museck_main", _MAIN_PY)
museck = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(museck)


class StubServerMixin:
    @classmethod
    def setUpClass(cls):
        cls.server, cls.base_url = fake_soulsync.start_server()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        fake_soulsync.reset_state()

    def make_service(self, **overrides):
        config = {
            "type": "soulsync",
            "server_url": self.base_url,
            "api_key": fake_soulsync.API_KEY,
        }
        config.update(overrides)
        return museck.SoulSyncService(config)


class TestConnection(StubServerMixin, unittest.TestCase):
    def test_good_key_connects(self):
        result = self.make_service().test_connection()
        self.assertTrue(result["success"])
        self.assertEqual(result["server_name"], "SoulSync")

    def test_bad_key_reports_invalid_key(self):
        result = self.make_service(api_key="sk_wrong").test_connection()
        self.assertFalse(result["success"])
        self.assertIn("Invalid SoulSync API key", result["message"])

    def test_unreachable_server(self):
        svc = self.make_service(server_url="http://127.0.0.1:1")
        result = svc.test_connection()
        self.assertFalse(result["success"])
        self.assertIn("Cannot reach server", result["message"])


class TestPlaylists(StubServerMixin, unittest.TestCase):
    def test_playlists_merge_curated_and_mirrored(self):
        playlists = self.make_service().get_playlists()
        by_key = {p["key"]: p for p in playlists}
        self.assertEqual(set(by_key), {"curated:1", "curated:9", "mirrored:7"})
        self.assertEqual(by_key["curated:1"]["title"], "Curated Mix")
        self.assertEqual(by_key["curated:1"]["count"], 3)
        self.assertEqual(by_key["mirrored:7"]["thumb"],
                         "https://cdn.example.com/mirror-cover.jpg")

    def test_curated_tracks_drop_unplayable(self):
        tracks = self.make_service().get_playlist_tracks("curated:1")
        titles = [t["title"] for t in tracks]
        # Ghost Track has no file_path: nothing to stream, so it is dropped.
        self.assertEqual(titles, ["Song One", "Song Two"])
        first = tracks[0]
        self.assertEqual(first["ratingKey"], "1001")
        self.assertEqual(first["duration"], 200000)  # already ms, unconverted
        self.assertEqual(first["index"], 1)
        self.assertTrue(first["key"].startswith("1001::"))

    def test_curated_tracks_names_filled_from_ids(self):
        # The real curated payload joins NEITHER name (the stub strips
        # both); the service must fill them from the album/artist ids,
        # or every curated playlist shows "Unknown" and play logs record
        # it into SoulSync's history.
        tracks = self.make_service().get_playlist_tracks("curated:1")
        self.assertEqual(tracks[0]["artist"], "The Testers")
        self.assertEqual(tracks[0]["album"], "Rock Album")

    def test_mirrored_tracks_album_filled_artist_from_payload(self):
        # Mirrored payloads join the artist but never the album.
        tracks = self.make_service().get_playlist_tracks("mirrored:7")
        self.assertEqual(tracks[0]["artist"], "The Testers")
        self.assertEqual(tracks[0]["album"], "Jazz Album")

    def test_one_playlist_family_failing_keeps_the_other(self):
        fake_soulsync.STATE["fail"].add("mirrored")
        playlists = self.make_service().get_playlists()
        self.assertEqual({p["key"] for p in playlists},
                         {"curated:1", "curated:9"})

    def test_unprefixed_key_treated_as_curated(self):
        tracks = self.make_service().get_playlist_tracks("1")
        self.assertEqual(len(tracks), 2)


class TestSearch(StubServerMixin, unittest.TestCase):
    def test_search_tracks_title(self):
        tracks = self.make_service().search_tracks("Song")
        self.assertEqual([t["title"] for t in tracks], ["Song One", "Song Two"])
        # No artwork on track payloads: the thumb defers to the album.
        self.assertEqual(tracks[0]["thumb"], "ssalbum:101")
        self.assertEqual(tracks[0]["parentThumb"], "ssalbum:101")

    def test_search_tracks_merges_and_dedupes(self):
        # "a" hits Ballad of Tests by title AND by artist (Second Artist);
        # it must appear once.
        tracks = self.make_service().search_tracks("a")
        keys = [t["ratingKey"] for t in tracks]
        self.assertEqual(keys.count("1004"), 1)
        self.assertIn("1003", keys)  # Jazz Hands, by title

    def test_search_albums_resolves_artist_name(self):
        albums = self.make_service().search_albums("Rock")
        self.assertEqual(len(albums), 1)
        self.assertEqual(albums[0]["title"], "Rock Album")
        # Album payloads carry artist_id only; the name is resolved.
        self.assertEqual(albums[0]["artist"], "The Testers")
        self.assertEqual(albums[0]["year"], 2020)
        self.assertEqual(albums[0]["thumb"], "https://cdn.example.com/art-rock.jpg")

    def test_search_artists(self):
        artists = self.make_service().search_artists("testers")
        self.assertEqual(len(artists), 1)
        self.assertEqual(artists[0]["title"], "The Testers")
        self.assertEqual(artists[0]["key"], "11")


class TestCollections(StubServerMixin, unittest.TestCase):
    def test_album_tracks_use_album_title_and_thumb(self):
        tracks = self.make_service().get_album_tracks("101")
        self.assertEqual([t["title"] for t in tracks], ["Song One", "Song Two"])
        # Ghost Track (1005) is on album 101 but has no file: dropped.
        self.assertEqual(len(tracks), 2)
        # Track rows have no album_title; the album supplies it, and its
        # artwork rides along directly instead of the ssalbum: deferral.
        self.assertTrue(all(t["album"] == "Rock Album" for t in tracks))
        self.assertTrue(all(t["thumb"] == "https://cdn.example.com/art-rock.jpg"
                            for t in tracks))

    def test_artist_tracks_assemble_albums_in_order(self):
        tracks = self.make_service().get_artist_tracks("11")
        self.assertEqual([t["title"] for t in tracks],
                         ["Song One", "Song Two", "Jazz Hands"])
        self.assertTrue(all(t["artist"] == "The Testers" for t in tracks))

    def test_genres_sorted(self):
        genres = self.make_service().get_genres()
        self.assertEqual([g["title"] for g in genres], ["Jazz", "Pop", "Rock"])
        self.assertTrue(all(g["key"] == g["title"] for g in genres))

    def test_genre_tracks_match_case_insensitively(self):
        tracks = self.make_service().get_genre_tracks("Rock")
        self.assertEqual({t["title"] for t in tracks},
                         {"Song One", "Song Two", "Ballad of Tests"})
        jazz = self.make_service().get_genre_tracks("jazz")
        self.assertEqual([t["title"] for t in jazz], ["Jazz Hands"])

    def test_genre_walk_follows_pagination(self):
        svc = self.make_service()
        svc._GENRE_PAGE_SIZE = 2  # 3 albums: Rock spans pages 1 and 2
        tracks = svc.get_genre_tracks("Rock")
        self.assertEqual({t["title"] for t in tracks},
                         {"Song One", "Song Two", "Ballad of Tests"})

    def test_genre_walk_mid_failure_keeps_gathered_tracks(self):
        svc = self.make_service()
        svc._GENRE_PAGE_SIZE = 2
        fake_soulsync.STATE["fail"].add("albums_page")
        tracks = svc.get_genre_tracks("Rock")
        # Page 2 fails (a 429 on a real server): the walk degrades to
        # page 1's matches instead of discarding them with an error.
        self.assertEqual({t["title"] for t in tracks}, {"Song One", "Song Two"})

    def test_artist_name_failure_is_not_cached(self):
        svc = self.make_service()
        real_get = svc._api_get
        calls = {"failed": False}

        def flaky(path, params=None, timeout=10):
            if path.startswith("/library/artists/") and not calls["failed"]:
                calls["failed"] = True
                raise RuntimeError("network blip")
            return real_get(path, params, timeout=timeout)

        svc._api_get = flaky
        self.assertEqual(svc._artist_name(11), "")
        # The blip is not latched: the next lookup retries and succeeds.
        self.assertEqual(svc._artist_name(11), "The Testers")


class TestStreaming(StubServerMixin, unittest.TestCase):
    def test_stream_url_shape(self):
        svc = self.make_service()
        track = svc.search_tracks("Song")[0]
        url = svc.get_stream_url(track["key"])
        parsed = urllib.parse.urlparse(url)
        query = urllib.parse.parse_qs(parsed.query)
        self.assertEqual(parsed.path, "/stream/library-audio")
        self.assertEqual(query["path"][0],
                         "/music/Testers/Rock Album/01 - Song One.flac")
        self.assertEqual(query["track_id"][0], "1001")
        self.assertEqual(query["api_key"][0], fake_soulsync.API_KEY)

    def test_stream_url_round_trips_unicode_path(self):
        svc = self.make_service()
        track = svc.get_playlist_tracks("mirrored:7")[0]
        url = svc.get_stream_url(track["key"])
        query = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
        self.assertEqual(query["path"][0],
                         "/music/Testers/Jazz Album/01 - Jazz Händs.flac")

    def test_stream_actually_serves_audio(self):
        svc = self.make_service()
        track = svc.search_tracks("Song")[0]
        with urllib.request.urlopen(svc.get_stream_url(track["key"]), timeout=5) as resp:
            data = resp.read()
        self.assertTrue(data.startswith(b"RIFF"))
        self.assertGreater(len(data), 100000)

    def test_stream_supports_ranges_like_ffplay_needs(self):
        svc = self.make_service()
        track = svc.search_tracks("Song")[0]
        req = urllib.request.Request(
            svc.get_stream_url(track["key"]), headers={"Range": "bytes=0-99"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 206)
            self.assertEqual(len(resp.read()), 100)


class TestImages(StubServerMixin, unittest.TestCase):
    def test_empty_thumb(self):
        self.assertEqual(self.make_service().get_image_url(""), "")

    def test_public_cdn_url_passes_through(self):
        url = "https://cdn.example.com/art-rock.jpg"
        self.assertEqual(self.make_service().get_image_url(url), url)

    def test_track_thumb_resolves_album_art(self):
        svc = self.make_service()
        self.assertEqual(svc.get_image_url("ssalbum:101"),
                         "https://cdn.example.com/art-rock.jpg")

    def test_internal_media_server_art_goes_through_proxy(self):
        svc = self.make_service()
        url = svc.get_image_url("ssalbum:102")
        parsed = urllib.parse.urlparse(url)
        query = urllib.parse.parse_qs(parsed.query)
        self.assertEqual(parsed.path, "/api/image-proxy")
        self.assertEqual(query["url"][0],
                         "http://192.168.1.50:32400/library/metadata/99/thumb/123")
        self.assertEqual(query["api_key"][0], fake_soulsync.API_KEY)
        # And the proxied URL actually serves image bytes.
        with urllib.request.urlopen(url, timeout=5) as resp:
            self.assertEqual(resp.read(), fake_soulsync.JPEG_BYTES)
        self.assertEqual(fake_soulsync.STATE["proxy_requests"],
                         ["http://192.168.1.50:32400/library/metadata/99/thumb/123"])

    def test_server_relative_api_art_gets_key(self):
        svc = self.make_service()
        url = svc.get_image_url("ssalbum:103")
        self.assertTrue(url.startswith(f"{self.base_url}/api/image-cache/abc123"))
        self.assertIn(f"api_key={fake_soulsync.API_KEY}", url)
        with urllib.request.urlopen(url, timeout=5) as resp:
            self.assertEqual(resp.read(), fake_soulsync.JPEG_BYTES)

    def test_unresolvable_relative_path_is_empty(self):
        self.assertEqual(
            self.make_service().get_image_url("/library/metadata/1/thumb/2"), "")


class TestReportPlayback(StubServerMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        self.svc = self.make_service()
        # Parse a track so its metadata is cached for log-play.
        self.track = self.svc.search_tracks("Song")[0]  # 200s duration
        self.rk = self.track["ratingKey"]

    def logs(self):
        return fake_soulsync.STATE["log_play"]

    def test_no_log_below_threshold(self):
        self.svc.report_playback(self.rk, "playing", 10_000, 200_000)
        self.svc.report_playback(self.rk, "playing", 50_000, 200_000)
        self.assertEqual(self.logs(), [])

    def test_logs_once_at_threshold_with_metadata(self):
        self.svc.report_playback(self.rk, "playing", 100_000, 200_000)
        self.assertEqual(len(self.logs()), 1)
        body = self.logs()[0]
        self.assertEqual(body["track"]["id"], 1001)
        self.assertEqual(body["track"]["title"], "Song One")
        self.assertEqual(body["track"]["artist"], "The Testers")
        self.assertEqual(body["track"]["album"], "Rock Album")
        self.assertEqual(body["duration_ms"], 200000)
        # Further reports for the same play instance do not re-log.
        self.svc.report_playback(self.rk, "playing", 150_000, 200_000)
        self.svc.report_playback(self.rk, "stopped", 200_000, 200_000)
        self.assertEqual(len(self.logs()), 1)

    def test_playlist_track_logs_real_names_not_unknown(self):
        # Parsed from a curated playlist, whose payload carries no
        # names at all: the logged history row must still carry the
        # real artist/album, never the "Unknown" placeholder.
        svc = self.make_service()
        track = svc.get_playlist_tracks("curated:1")[0]
        svc.report_playback(track["ratingKey"], "playing", 100_000, 200_000)
        self.assertEqual(len(self.logs()), 1)
        body = self.logs()[0]
        self.assertEqual(body["track"]["artist"], "The Testers")
        self.assertEqual(body["track"]["album"], "Rock Album")

    def test_stopped_backstop_counts_a_play_that_reached_threshold(self):
        self.svc.report_playback(self.rk, "playing", 30_000, 200_000)
        self.svc.report_playback(self.rk, "stopped", 120_000, 200_000)
        self.assertEqual(len(self.logs()), 1)

    def test_early_stop_does_not_count(self):
        self.svc.report_playback(self.rk, "playing", 10_000, 200_000)
        self.svc.report_playback(self.rk, "stopped", 10_000, 200_000)
        self.assertEqual(self.logs(), [])

    def test_replay_logs_again(self):
        self.svc.report_playback(self.rk, "playing", 150_000, 200_000)
        self.svc.report_playback(self.rk, "stopped", 150_000, 200_000)
        self.assertEqual(len(self.logs()), 1)
        self.svc.report_playback(self.rk, "playing", 1_000, 200_000)
        self.svc.report_playback(self.rk, "playing", 150_000, 200_000)
        self.assertEqual(len(self.logs()), 2)

    def test_short_track_never_counts(self):
        self.svc.report_playback(self.rk, "playing", 20_000, 20_000)
        self.svc.report_playback(self.rk, "stopped", 20_000, 20_000)
        self.assertEqual(self.logs(), [])

    def test_unknown_duration_counts_after_four_minutes(self):
        self.svc.report_playback(self.rk, "playing", 239_000, 0)
        self.assertEqual(self.logs(), [])
        self.svc.report_playback(self.rk, "playing", 240_000, 0)
        self.assertEqual(len(self.logs()), 1)

    def test_failed_log_is_retried_by_next_report(self):
        fake_soulsync.STATE["logplay_failures_left"] = 1
        with self.assertRaises(Exception):
            self.svc.report_playback(self.rk, "playing", 150_000, 200_000)
        self.assertEqual(self.logs(), [])
        self.svc.report_playback(self.rk, "playing", 160_000, 200_000)
        self.assertEqual(len(self.logs()), 1)

    def test_metadata_recovered_for_unparsed_track(self):
        fresh = self.make_service()  # never parsed track 1001
        fresh.report_playback("1001", "playing", 150_000, 200_000)
        self.assertEqual(len(self.logs()), 1)
        self.assertEqual(self.logs()[0]["track"]["title"], "Song One")


class TestServerStatus(StubServerMixin, unittest.TestCase):
    def test_full_status_aggregation(self):
        status = self.make_service().get_server_status()
        self.assertTrue(status["connected"])
        self.assertEqual(status["server_type"], "soulsync")
        self.assertEqual(status["server_name"], "SoulSync")
        self.assertEqual(status["uptime"], "2h 3m 4s")
        self.assertEqual(status["services"],
                         {"spotify": True, "soulseek": True, "hydrabase": False})
        self.assertEqual(status["library"], {"artists": 2, "albums": 3, "tracks": 5})
        self.assertEqual(status["database_size_mb"], 12.5)
        self.assertEqual(status["active_downloads"], 2)
        self.assertEqual(status["media_server"],
                         {"connected": True, "type": "plex", "response_time_ms": 42})
        self.assertEqual(status["active_media_server"], "plex")
        self.assertEqual(status["metadata_source"], "spotify")
        activity = status["activity"]
        self.assertTrue(activity["ok"])
        self.assertEqual(activity["server_name"], "Plex")
        self.assertEqual(activity["streams"], 1)
        self.assertEqual(activity["sessions"][0]["title"], "Song One")
        self.assertEqual(activity["sessions"][0]["user"], "boulder")
        self.assertIsInstance(status["response_time_ms"], int)

    def test_partial_failures_degrade_sections_not_status(self):
        fake_soulsync.STATE["fail"] = {"status", "activity"}
        status = self.make_service().get_server_status()
        self.assertTrue(status["connected"])
        self.assertNotIn("media_server", status)
        self.assertNotIn("activity", status)
        self.assertEqual(status["library"]["tracks"], 5)

    def test_bad_key_status_is_disconnected(self):
        status = self.make_service(api_key="sk_wrong").get_server_status()
        self.assertFalse(status["connected"])
        self.assertIn("Invalid SoulSync API key", status["message"])

    def test_generic_status_shape_for_subsonic(self):
        svc = museck.SubsonicService({
            "type": "subsonic", "server_url": self.base_url,
            "username": "u", "password": "p",
        })
        status = svc.get_server_status()
        self.assertTrue(status["connected"])
        self.assertEqual(status["server_type"], "subsonic")
        self.assertEqual(status["version"], "0.49.0")
        self.assertEqual(status["server_product"], "navidrome")


class TestRegistry(unittest.TestCase):
    def test_all_five_types_registered(self):
        self.assertEqual(set(museck.SERVICE_CLASSES),
                         {"plex", "jellyfin", "emby", "subsonic", "soulsync"})
        for cls in museck.SERVICE_CLASSES.values():
            self.assertTrue(issubclass(cls, museck.MusicService))


if __name__ == "__main__":
    unittest.main()
