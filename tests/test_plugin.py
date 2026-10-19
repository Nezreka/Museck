"""Plugin-level tests: settings round-trips, service resolution, the
status/test callables, and an end-to-end playback through the real
ffplay binary against the fake SoulSync stream endpoint.

Run:  python3 -m unittest discover -s tests -v
"""

import asyncio
import importlib.util
import json
import logging
import os
import sys
import tempfile
import time
import types
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fake_soulsync  # noqa: E402

_decky = types.ModuleType("decky")
_decky.logger = logging.getLogger("decky-test")
_decky.DECKY_PLUGIN_SETTINGS_DIR = tempfile.mkdtemp()
_decky.DECKY_PLUGIN_LOG_DIR = tempfile.mkdtemp()
sys.modules.setdefault("decky", _decky)

_MAIN_PY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "main.py")
_spec = importlib.util.spec_from_file_location("museck_main", _MAIN_PY)
museck = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(museck)


def fresh_playback_state():
    return {
        "is_playing": False, "current_track": None, "position": 0,
        "duration": 0, "volume": 75, "queue": [], "queue_index": -1,
        "shuffle": False, "loop": "off", "last_error": None,
    }


class PluginTestBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server, cls.base_url = fake_soulsync.start_server()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        fake_soulsync.reset_state()
        self.plugin = museck.Plugin()
        self.plugin.settings = {"servers": [], "active_server_id": "",
                                "client_id": "test-client"}
        self.plugin.settings_path = os.path.join(
            tempfile.mkdtemp(), "settings.json")
        self.plugin.playback_state = fresh_playback_state()
        self.plugin.player_process = None
        self.plugin.player_paused = False
        self.plugin.playback_start_time = None
        self.plugin.total_paused_time = 0
        self.plugin.pause_start_time = None
        self.plugin._last_report = 0
        self.plugin._consecutive_failures = 0
        self.plugin.current_service = None
        self.plugin._image_cache = {}

    def soulsync_config(self, **overrides):
        config = {
            "id": "srv1", "name": "My SoulSync", "type": "soulsync",
            "server_url": self.base_url, "api_key": fake_soulsync.API_KEY,
        }
        config.update(overrides)
        return config

    def activate_soulsync(self):
        self.plugin.settings["servers"] = [self.soulsync_config()]
        self.plugin.settings["active_server_id"] = "srv1"
        self.plugin._resolve_service()


class TestSettingsRoundTrip(PluginTestBase):
    def test_save_server_persists_soulsync_and_resolves_service(self):
        async def run():
            config = self.soulsync_config()
            del config["id"]
            result = await self.plugin.save_server(config)
            self.assertTrue(result["success"])
            self.assertTrue(result["id"])
            with open(self.plugin.settings_path) as f:
                saved = json.load(f)
            self.assertEqual(saved["servers"][0]["type"], "soulsync")
            self.assertEqual(saved["servers"][0]["api_key"], fake_soulsync.API_KEY)
            self.assertEqual(saved["active_server_id"], result["id"])
            self.assertIsInstance(self.plugin.current_service, museck.SoulSyncService)
        asyncio.run(run())

    def test_editing_soulsync_url_keeps_the_submitted_api_key(self):
        async def run():
            await self.plugin.save_server(self.soulsync_config())
            # Edit: new URL and a rotated key. The form submits the key,
            # so the identity-change drop of exchanged credentials must
            # not delete it.
            await self.plugin.save_server(self.soulsync_config(
                server_url=self.base_url + "/", api_key="sk_rotated"))
            saved = self.plugin.settings["servers"][0]
            self.assertEqual(saved["api_key"], "sk_rotated")
        asyncio.run(run())

    def test_editing_jellyfin_password_still_drops_exchanged_credentials(self):
        async def run():
            config = {
                "id": "jf1", "name": "JF", "type": "jellyfin",
                "server_url": self.base_url, "username": "u",
                "password": "p1", "api_key": "exchanged", "user_id": "uid1",
            }
            await self.plugin.save_server(config)
            await self.plugin.save_server({**config, "password": "p2"})
            saved = self.plugin.settings["servers"][0]
            self.assertNotIn("api_key", saved)
            self.assertNotIn("user_id", saved)
        asyncio.run(run())

    def test_test_server_config_callable(self):
        async def run():
            ok = await self.plugin.test_server_config(self.soulsync_config())
            self.assertTrue(ok["success"])
            self.assertEqual(ok["server_name"], "SoulSync")
            bad = await self.plugin.test_server_config(
                self.soulsync_config(api_key="sk_wrong"))
            self.assertFalse(bad["success"])
        asyncio.run(run())

    def test_get_server_status_callable(self):
        async def run():
            self.activate_soulsync()
            status = await self.plugin.get_server_status()
            self.assertTrue(status["connected"])
            self.assertEqual(status["library"]["tracks"], 5)
            by_id = await self.plugin.get_server_status("srv1")
            self.assertTrue(by_id["connected"])
            missing = await self.plugin.get_server_status("nope")
            self.assertFalse(missing["success"])
        asyncio.run(run())

    def test_get_playlists_callable_merges_families(self):
        async def run():
            self.activate_soulsync()
            result = await self.plugin.get_playlists()
            self.assertTrue(result["success"])
            keys = {p["key"] for p in result["playlists"]}
            self.assertEqual(keys, {"curated:1", "curated:9", "mirrored:7"})
        asyncio.run(run())

    def test_jellyfin_status_poll_persists_exchanged_credentials(self):
        async def run():
            # A Jellyfin server saved with username/password only (the
            # user never pressed the form's Test button): the first
            # status poll runs the auth exchange, and its token must be
            # persisted, or every 10s poll mints a fresh server session.
            self.plugin.settings = {
                "client_id": "cid",
                "active_server_id": "jf1",
                "servers": [{
                    "id": "jf1", "name": "Stubfin", "type": "jellyfin",
                    "server_url": self.base_url,
                    "username": "deck", "password": "pw",
                }],
            }
            status = await self.plugin.get_server_status()
            self.assertTrue(status["connected"], status)
            self.assertEqual(status["version"], "10.9.0")
            # Credentials are persisted to the stored server, and NOT
            # handed to the frontend.
            self.assertNotIn("api_key", status)
            self.assertNotIn("user_id", status)
            srv = self.plugin.settings["servers"][0]
            self.assertEqual(srv["api_key"], "stub-token-1")
            self.assertEqual(srv["user_id"], "user-9")
            self.assertEqual(fake_soulsync.STATE["jellyfin_auth_count"], 1)
            # The next poll reuses the stored token: no second exchange.
            status = await self.plugin.get_server_status()
            self.assertTrue(status["connected"])
            self.assertEqual(fake_soulsync.STATE["jellyfin_auth_count"], 1)
        asyncio.run(run())


@unittest.skipUnless(museck.Plugin._find_ffplay(), "ffplay not available")
class TestPlaybackEndToEnd(PluginTestBase):
    def test_track_plays_and_a_counted_play_is_logged(self):
        async def run():
            self.activate_soulsync()
            # No PulseAudio in the test environment: hand ffplay SDL's
            # dummy audio driver instead of the probed Pulse socket.
            self.plugin._get_audio_env = lambda: {
                **os.environ, "SDL_AUDIODRIVER": "dummy"}

            result = await self.plugin.play_playlist("curated:9")
            self.assertTrue(result["success"], result)
            self.assertEqual(result["count"], 1)

            state = await self.plugin.get_playback_status()
            self.assertTrue(state["is_playing"])
            self.assertEqual(state["current_track"]["title"], "Ballad of Tests")

            # Artwork for the playing track resolved end to end: album
            # lookup -> server-relative image-cache URL -> base64 data.
            current = state["current_track"]
            self.assertTrue(current["thumb"].startswith("data:image/jpeg;base64,"),
                            current["thumb"][:60])

            # The stream endpoint saw the track requested, with the
            # track id the Navidrome fallback needs. (ffplay opens the
            # stream more than once: a probe pass, then the ranged read.)
            streams = fake_soulsync.STATE["stream_requests"]
            self.assertGreaterEqual(len(streams), 1)
            for request in streams:
                self.assertEqual(request["track_id"], "1004")
                self.assertEqual(
                    request["path"],
                    "/music/Second/Quiet Ballads/01 - Ballad of Tests.wav")

            # A few real seconds of a 60s track is not a counted play.
            self.assertEqual(fake_soulsync.STATE["log_play"], [])

            # Simulate the listen reaching 40s: the plugin derives the
            # position from playback_start_time, so rewinding the start
            # is exactly the state a real 40s listen produces. The next
            # poll is the 10s report tick, which must log the play once
            # (40s heard clears the half-track threshold of 30s).
            self.plugin.playback_start_time -= 40
            self.plugin._last_report = 0
            await self.plugin.get_playback_status()
            logs = fake_soulsync.STATE["log_play"]
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs[0]["track"]["id"], 1004)
            self.assertEqual(logs[0]["track"]["title"], "Ballad of Tests")
            self.assertEqual(logs[0]["track"]["artist"], "Second Artist")
            self.assertEqual(logs[0]["track"]["album"], "Quiet Ballads")
            self.assertEqual(logs[0]["duration_ms"], 60000)

            # Stopping afterwards must not log a second time (the
            # per-instance latch), even though the stop report also
            # clears the counted-play threshold.
            await self.plugin.stop()
            self.assertEqual(len(fake_soulsync.STATE["log_play"]), 1)
        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
