import os
import json
import socket
import asyncio
import functools
import random
import re
import shutil
import signal
import subprocess
import time
import base64
import hashlib
import ssl
import threading
import stat
import sys
import decky
import urllib.request
import urllib.error
import urllib.parse


# Upper bound on how many tracks a single playlist/artist load will queue.
# Smart playlists can cover an entire library (a real one seen at 307k tracks),
# which no amount of patience will transfer, let alone queue.
MAX_QUEUE_TRACKS = 2000

# Reported to the media server when Museck identifies itself as a player.
MUSECK_VERSION = "1.0"

# Sent on every urllib request Museck makes. Without it urllib identifies
# as "Python-urllib/<version>", which Cloudflare's WAF blocks by default —
# a server behind a Cloudflare tunnel then 403s every API call (issue #11).
# (The audio stream itself is fetched by ffplay, which sends its own UA.)
USER_AGENT = f"Museck/{MUSECK_VERSION}"

# How often to re-report progress while a track plays.
PLAYBACK_REPORT_INTERVAL = 10


async def _to_thread(func, *args, **kwargs):
    """Run a blocking callable off the event loop.

    Every server call here is synchronous urllib, and the frontend polls
    playback status once a second. Running them inline stalls that poll (and
    with it auto-advance) for the whole duration of the request.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, functools.partial(func, *args, **kwargs))


def _is_counted_play(position_ms: int, duration_ms: int) -> bool:
    """Whether a play has been heard long enough to count as a play.

    The usual scrobble rule, shared by every backend that has a separate
    "count this play" call: half the track or four minutes, whichever comes
    first, and never for tracks of 30 seconds or less. Position is
    pause-adjusted listened time, so this measures hearing, not wall clock
    since the track started. When the server gave no duration at all, fall
    back to four minutes of actual listening.
    """
    if position_ms <= 0:
        return False
    if duration_ms <= 0:
        return position_ms >= 240_000
    if duration_ms <= 30_000:
        return False
    return position_ms >= min(duration_ms / 2, 240_000)


# =============================================================================
# Music Service Abstraction Layer
# =============================================================================

class MusicService:
    """Base class for all music server backends."""

    def __init__(self, config: dict):
        self.config = config
        self.server_url = config.get("server_url", "").rstrip("/")
        self._ssl_ctx = ssl.create_default_context()
        self._ssl_ctx.check_hostname = False
        self._ssl_ctx.verify_mode = ssl.CERT_NONE

    def _http_get(self, url: str, headers: dict = None, timeout: int = 10) -> bytes:
        """HTTP GET returning raw bytes."""
        merged = {"User-Agent": USER_AGENT}
        if headers:
            merged.update(headers)
        req = urllib.request.Request(url, headers=merged)
        with urllib.request.urlopen(req, timeout=timeout, context=self._ssl_ctx) as resp:
            return resp.read()

    def _http_json(self, url: str, headers: dict = None, timeout: int = 10) -> dict:
        """HTTP GET returning parsed JSON."""
        data = self._http_get(url, headers, timeout)
        return json.loads(data.decode("utf-8"))

    def _http_post(self, url: str, headers: dict, body: bytes, timeout: int = 10) -> bytes:
        """HTTP POST returning raw bytes (many reporting endpoints answer 204)."""
        merged = {"User-Agent": USER_AGENT}
        if headers:
            merged.update(headers)
        req = urllib.request.Request(url, data=body, headers=merged, method="POST")
        with urllib.request.urlopen(req, timeout=timeout, context=self._ssl_ctx) as resp:
            return resp.read()

    # --- Interface methods (must be overridden) ---

    def test_connection(self) -> dict:
        raise NotImplementedError

    def discover_servers(self) -> list:
        return []

    def get_playlists(self) -> list:
        raise NotImplementedError

    def get_playlist_tracks(self, playlist_key: str) -> list:
        raise NotImplementedError

    def search_tracks(self, query: str) -> list:
        raise NotImplementedError

    def search_albums(self, query: str) -> list:
        raise NotImplementedError

    def search_artists(self, query: str) -> list:
        raise NotImplementedError

    def get_album_tracks(self, album_key: str) -> list:
        raise NotImplementedError

    def get_artist_tracks(self, artist_key: str) -> list:
        raise NotImplementedError

    def get_stream_url(self, track_key: str) -> str:
        raise NotImplementedError

    def get_image_url(self, thumb_id: str, width: int = 100, height: int = 100) -> str:
        raise NotImplementedError

    def get_libraries(self) -> list:
        """Selectable music libraries. Empty when the backend has no concept of them."""
        return []

    def get_genres(self) -> list:
        """Available genres as [{"key", "title"}]. Empty if unsupported."""
        return []

    def get_genre_tracks(self, genre_key: str) -> list:
        raise NotImplementedError

    def report_playback(self, rating_key: str, state: str, position_ms: int, duration_ms: int):
        """Tell the server what playback is doing.

        No-op unless a backend implements it. `state` is playing, paused or
        stopped.
        """
        return

    def get_server_status(self) -> dict:
        """Live status for the status card: is the server answering, how
        fast, and what is it called.

        Backends with richer status surfaces override this and add their
        sections (library counts, uptime, live sessions) on top of the
        same base shape, so the frontend renders one normalized dict.
        """
        started = time.monotonic()
        try:
            result = self.test_connection()
        except Exception as e:
            result = {"success": False, "message": str(e)}
        status = {
            "success": True,
            "connected": bool(result.get("success")),
            "server_type": self.config.get("type", ""),
            "server_name": result.get("server_name", ""),
            "message": result.get("message", ""),
            "response_time_ms": int((time.monotonic() - started) * 1000),
            "checked_at": int(time.time()),
        }
        # Jellyfin/Emby test_connection returns the credentials its auth
        # exchange produced; pass them through so the Plugin layer can
        # persist them (the status callable pops them back out before
        # anything reaches the frontend).
        for field in ("api_key", "user_id"):
            if result.get(field):
                status[field] = result[field]
        return status


# =============================================================================
# Plex Service
# =============================================================================

class PlexService(MusicService):
    """Plex Media Server backend."""

    def __init__(self, config: dict):
        super().__init__(config)
        self.token = config.get("token", "")
        # Optional library section to confine everything to. A Plex server
        # commonly holds an audiobook library alongside music, and both are
        # made of "tracks" — unscoped, a search for "chapter" returns book
        # chapters. Empty means every audio library, as before.
        self.library_key = str(config.get("library_key") or "")
        # Stable per-installation id so Plex treats this as one returning
        # device rather than a new phantom player on every launch.
        self.client_id = config.get("client_id", "")
        # Scrobble bookkeeping (see report_playback): a Plex scrobble is a
        # counter, so it is latched once per play instance and only ever
        # touched under this lock, exactly as in SubsonicService.
        self._scrobble_track_id = ""
        self._scrobble_last_position = 0
        self._scrobble_sent = False
        self._scrobble_lock = threading.Lock()
        self._closed_track_id = ""
        self._closed_position = 0

    def _client_headers(self) -> dict:
        """Identify Museck as a player, which is what makes Plex open a session."""
        return {
            "X-Plex-Client-Identifier": self.client_id or "museck",
            "X-Plex-Product": "Museck",
            "X-Plex-Version": MUSECK_VERSION,
            "X-Plex-Platform": "Linux",
            "X-Plex-Platform-Version": "SteamOS",
            "X-Plex-Device": "Steam Deck",
            "X-Plex-Device-Name": "Museck",
            "X-Plex-Provides": "player",
            "X-Plex-Token": self.token,
            "Accept": "application/json",
        }

    def report_playback(self, rating_key: str, state: str, position_ms: int, duration_ms: int):
        """Report progress to /:/timeline, and scrobble a counted play.

        The timeline alone makes Plex open a session (Now Playing, resume
        offset, Tautulli and anything else watching sessions) — but it does
        not move the play count. Verified on a live PMS 1.43.4 (Oct 2026)
        with this exact call shape: a timeline-only full play (stopped at
        100%) left viewCount untouched, a scrobble alone set it to 1, and
        timeline + scrobble + timeline-stop set it to exactly 1, no double
        count. So a play that has been heard long enough to count (the
        shared _is_counted_play rule) is also scrobbled, exactly once per
        play instance. Note the scrobble `key` is the bare rating key —
        the /library/metadata/… path form used for the timeline key is
        answered 404 there.
        """
        if not rating_key:
            return
        position_ms = max(0, int(position_ms))
        duration_ms = max(0, int(duration_ms))
        params = {
            "ratingKey": str(rating_key),
            "key": f"/library/metadata/{rating_key}",
            "identifier": "com.plexapp.plugins.library",
            "state": state,
            "time": str(position_ms),
            "duration": str(duration_ms),
            "playbackTime": str(position_ms),
        }
        url = f"{self.server_url}/:/timeline?{urllib.parse.urlencode(params)}"
        self._http_get(url, self._client_headers(), timeout=5)

        if state not in ("playing", "stopped"):
            return
        with self._scrobble_lock:
            track_id = str(rating_key)
            # A track change, or the position jumping backwards (replay,
            # loop, re-queuing the same track), is a new play instance.
            new_instance = (track_id != self._scrobble_track_id
                            or position_ms + 2_000 < self._scrobble_last_position)
            if new_instance:
                self._scrobble_track_id = track_id
                self._scrobble_sent = False
                self._closed_track_id = ""
                self._closed_position = 0
            elif state == "playing" and position_ms <= 2_000:
                # A (re)start at the beginning, too small for the reset
                # heuristic to have caught: it still ends the closed era.
                self._closed_track_id = ""
                self._closed_position = 0
            elif (state == "playing" and track_id == self._closed_track_id
                    and position_ms > 2_000 and position_ms + 2_000 >= self._closed_position):
                # A report dispatched before this play was stopped, landing
                # after it — its backjump would otherwise read as a fresh
                # instance and scrobble a second time. (The timeline above
                # has already been sent; this guards only the counter.)
                return
            self._scrobble_last_position = position_ms
            if state == "stopped":
                self._closed_track_id = track_id
                self._closed_position = position_ms
            if self._scrobble_sent or not _is_counted_play(position_ms, duration_ms):
                return
            # Latch before the send, restore on failure (the next scheduled
            # report retries), as in SubsonicService.report_playback.
            self._scrobble_sent = True
            try:
                scrobble_params = {
                    "key": track_id,
                    "identifier": "com.plexapp.plugins.library",
                }
                scrobble_url = f"{self.server_url}/:/scrobble?{urllib.parse.urlencode(scrobble_params)}"
                self._http_get(scrobble_url, self._client_headers(), timeout=5)
            except Exception:
                self._scrobble_sent = False
                raise

    def get_libraries(self) -> list:
        data = self._api_get("/library/sections")
        libraries = []
        for section in data.get("MediaContainer", {}).get("Directory", []) or []:
            # Music libraries are type "artist" — this is also what an
            # audiobook library is registered as, hence the ambiguity.
            if section.get("type") == "artist":
                libraries.append({
                    "key": str(section.get("key")),
                    "title": section.get("title") or "Library",
                })
        return libraries

    def _search_endpoint(self, media_type: int, query: str, limit: int = 20) -> str:
        """Scope a search to the chosen library when one is set.

        Note `sectionId` on /search is silently ignored by Plex, and the
        section endpoint honours `limit` but not X-Plex-Container-Size.
        """
        encoded = urllib.parse.quote(query)
        if self.library_key:
            return (f"/library/sections/{self.library_key}/search"
                    f"?type={media_type}&query={encoded}&limit={limit}")
        return f"/search?type={media_type}&query={encoded}"

    def _api_url(self, endpoint: str) -> str:
        url = f"{self.server_url}{endpoint}"
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}X-Plex-Token={self.token}"

    def _api_get(self, endpoint: str, timeout: int = 10) -> dict:
        return self._http_json(self._api_url(endpoint), {"Accept": "application/json"}, timeout)

    def _paged_tracks(self, endpoint: str, limit: int = MAX_QUEUE_TRACKS) -> list:
        """Fetch playlist/album items a page at a time.

        Plex serialises the entire collection when asked for it unpaginated, so
        a large smart playlist simply times out and the caller sees an empty
        list — the playlist appears to do nothing when selected. Ask for
        bounded pages instead, and stop once enough tracks are collected.
        """
        tracks = []
        page_size = 200
        start = 0
        while len(tracks) < limit:
            sep = "&" if "?" in endpoint else "?"
            page = self._api_get(
                f"{endpoint}{sep}X-Plex-Container-Start={start}&X-Plex-Container-Size={page_size}",
                timeout=20,
            )
            metadata = page.get("MediaContainer", {}).get("Metadata") or []
            if not metadata:
                break
            tracks.extend(self._parse_tracks(metadata))
            # Advance by items received, not tracks kept — unplayable entries
            # are dropped by the parse but still occupy a slot in the source.
            start += len(metadata)
            if len(metadata) < page_size:
                break
        return tracks[:limit]

    def test_connection(self) -> dict:
        try:
            url = self._api_url("/")
            data = self._http_get(url, {"Accept": "application/json"}).decode("utf-8")
            server_name = "Plex Server"
            if 'friendlyName="' in data:
                start = data.find('friendlyName="') + len('friendlyName="')
                end = data.find('"', start)
                server_name = data[start:end]
            return {"success": True, "message": "Connection successful", "server_name": server_name}
        except urllib.error.HTTPError as e:
            if e.code == 401:
                return {"success": False, "message": "Invalid Plex token (401 Unauthorized)"}
            return {"success": False, "message": f"HTTP error: {e.code} - {e.reason}"}
        except urllib.error.URLError as e:
            return {"success": False, "message": f"Cannot reach server: {e.reason}"}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    def discover_servers(self) -> list:
        servers = []
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            sock.settimeout(2)
            sock.sendto(b"M-SEARCH * HTTP/1.1\r\n\r\n", ("255.255.255.255", 32414))

            start_time = time.time()
            while (time.time() - start_time) < 3:
                try:
                    data, addr = sock.recvfrom(1024)
                    response = data.decode("utf-8")
                    server_info = {
                        "ip": addr[0],
                        "port": "32400",
                        "name": "Plex Server",
                        "url": f"http://{addr[0]}:32400"
                    }
                    for line in response.split("\r\n"):
                        if line.startswith("Name:"):
                            server_info["name"] = line.split(":", 1)[1].strip()
                        elif line.startswith("Port:"):
                            server_info["port"] = line.split(":", 1)[1].strip()
                            server_info["url"] = f"http://{addr[0]}:{server_info['port']}"
                        elif line.startswith("Resource-Identifier:"):
                            server_info["id"] = line.split(":", 1)[1].strip()
                    if not any(s["ip"] == server_info["ip"] for s in servers):
                        servers.append(server_info)
                except socket.timeout:
                    break
                except Exception:
                    break
            sock.close()
        except Exception:
            pass
        return servers

    def get_playlists(self) -> list:
        data = self._api_get("/playlists?playlistType=audio")
        if not data:
            return []
        playlists = []
        for pl in data.get("MediaContainer", {}).get("Metadata", []):
            playlists.append({
                "key": pl.get("ratingKey"),
                "title": pl.get("title"),
                "duration": pl.get("duration", 0),
                "count": pl.get("leafCount", 0),
                "thumb": pl.get("composite", pl.get("thumb", ""))
            })
        return playlists

    def get_playlist_tracks(self, playlist_key: str) -> list:
        return self._paged_tracks(f"/playlists/{playlist_key}/items")

    def search_tracks(self, query: str) -> list:
        data = self._api_get(self._search_endpoint(10, query))
        if not data:
            return []
        return self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))

    def search_albums(self, query: str) -> list:
        data = self._api_get(self._search_endpoint(9, query))
        if not data:
            return []
        albums = []
        for album in data.get("MediaContainer", {}).get("Metadata", []):
            albums.append({
                "key": album.get("ratingKey"),
                "title": album.get("title", "Unknown"),
                "artist": album.get("parentTitle", "Unknown"),
                "year": album.get("year"),
                "thumb": album.get("thumb", "")
            })
        return albums

    def search_artists(self, query: str) -> list:
        data = self._api_get(self._search_endpoint(8, query))
        if not data:
            return []
        artists = []
        for artist in data.get("MediaContainer", {}).get("Metadata", []):
            artists.append({
                "key": artist.get("ratingKey"),
                "title": artist.get("title", "Unknown"),
                "thumb": artist.get("thumb", "")
            })
        return artists

    def get_album_tracks(self, album_key: str) -> list:
        data = self._api_get(f"/library/metadata/{album_key}/children")
        if not data:
            return []
        return self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))

    def get_artist_tracks(self, artist_key: str) -> list:
        albums_data = self._api_get(f"/library/metadata/{artist_key}/children")
        if not albums_data:
            return []
        all_tracks = []
        for album in albums_data.get("MediaContainer", {}).get("Metadata", []):
            album_key = album.get("ratingKey")
            if not album_key:
                continue
            all_tracks.extend(self.get_album_tracks(album_key))
            if len(all_tracks) >= MAX_QUEUE_TRACKS:
                break
        return all_tracks[:MAX_QUEUE_TRACKS]

    def _music_sections(self) -> list:
        return [self.library_key] if self.library_key else [l["key"] for l in self.get_libraries()]

    def get_genres(self) -> list:
        """Genres across the chosen library, or every music library if unset.

        Keys are section-qualified because a genre id only means something
        within its own section.
        """
        genres = {}
        for section in self._music_sections():
            try:
                data = self._api_get(f"/library/sections/{section}/genre")
            except Exception as e:
                decky.logger.error(f"Genre listing failed for section {section}: {e}")
                continue
            for entry in data.get("MediaContainer", {}).get("Directory", []) or []:
                title = entry.get("title")
                if title and title not in genres:
                    genres[title] = {"key": f"{section}:{entry.get('key')}", "title": title}
        return sorted(genres.values(), key=lambda g: g["title"].lower())

    def get_genre_tracks(self, genre_key: str) -> list:
        section, _, genre_id = str(genre_key).partition(":")
        if not genre_id:
            return []

        # Plex records a genre at whichever level the metadata agent set it, so
        # a plain track query returns nothing for genres held on the album or
        # artist instead. Its relational filters reach those in one query —
        # walking the matching albums individually took ~20s where this takes
        # a fraction of a second.
        for field in ("genre", "album.genre", "artist.genre"):
            tracks = self._paged_tracks(
                f"/library/sections/{section}/all?type=10&{field}={genre_id}")
            if tracks:
                return tracks
        return []

    def get_stream_url(self, track_key: str) -> str:
        return f"{self.server_url}{track_key}?X-Plex-Token={self.token}"

    def get_image_url(self, thumb_path: str, width: int = 100, height: int = 100) -> str:
        if not thumb_path:
            return ""
        encoded_thumb = urllib.parse.quote(thumb_path, safe='')
        return (
            f"{self.server_url}/photo/:/transcode"
            f"?width={width}&height={height}&minSize=1"
            f"&url={encoded_thumb}&X-Plex-Token={self.token}"
        )

    # Plex accepts comma-separated rating keys on /library/metadata, so
    # unresolved tracks are looked up in batches rather than one request each.
    _RESOLVE_BATCH = 50

    _DISC_DIR = re.compile(r"^(cd|disc|disk)\s*\d+$", re.IGNORECASE)

    @classmethod
    def _from_file_path(cls, file_path: str):
        """Derive (artist, album) from a media path.

        Files Plex has indexed but never matched still play, yet come back with
        no artist, album or artwork — so they show as Unknown even though the
        path on disk names them. Assumes the usual .../artist/album/[CD1]/track
        layout, and only when there is enough depth to be confident.
        """
        if not file_path:
            return "", ""
        segments = [p for p in file_path.replace("\\", "/").split("/") if p]
        dirs = segments[:-1]
        if dirs and cls._DISC_DIR.match(dirs[-1]):
            dirs = dirs[:-1]
        # Need a mount/root plus artist plus album before guessing
        if len(dirs) < 3:
            return "", ""
        artist, album = dirs[-2], dirs[-1]
        # Folders are often named "Artist - Album"; drop the redundant prefix
        if album.lower().startswith(artist.lower() + " - "):
            album = album[len(artist) + 3:]
        return artist, album

    def _parse_tracks(self, metadata: list) -> list:
        tracks = []
        unresolved = []
        for track in metadata:
            # Playlists can span libraries; their items name the section they
            # came from, so a library choice can still be honoured here.
            section = track.get("librarySectionID")
            if self.library_key and section is not None and str(section) != self.library_key:
                continue
            media_list = track.get("Media") or []
            media = media_list[0] if media_list else {}
            parts_list = media.get("Part") or []
            part = parts_list[0] if parts_list else {}
            stream_key = part.get("key", "")

            thumb_path = track.get("thumb") or track.get("parentThumb") or ""
            # `or` rather than a get() default: Plex sends these keys as null
            # for unmatched files, which a default would not catch.
            artist = track.get("grandparentTitle") or track.get("originalTitle") or ""
            album = track.get("parentTitle") or ""
            if not artist or not album:
                path_artist, path_album = self._from_file_path(part.get("file", ""))
                artist = artist or path_artist
                album = album or path_album

            entry = {
                "key": stream_key,
                "ratingKey": track.get("ratingKey"),
                "title": track.get("title") or "Unknown",
                "artist": artist or "Unknown",
                "album": album or "Unknown",
                "duration": track.get("duration", 0),
                "index": track.get("index", 0),
                "thumb": thumb_path,
                "parentThumb": thumb_path
            }
            tracks.append(entry)

            # Smart playlists may omit Media data — resolve via ratingKey
            if not stream_key and entry["ratingKey"]:
                unresolved.append(entry)

        if unresolved:
            resolved = self._resolve_part_keys([e["ratingKey"] for e in unresolved])
            for entry in unresolved:
                entry["key"] = resolved.get(str(entry["ratingKey"]), "")

        return [t for t in tracks if t["key"]]  # Drop unplayable tracks

    def _resolve_part_keys(self, rating_keys: list) -> dict:
        """Batch-fetch metadata for tracks, mapping ratingKey -> Part key."""
        resolved = {}
        for i in range(0, len(rating_keys), self._RESOLVE_BATCH):
            chunk = [str(k) for k in rating_keys[i:i + self._RESOLVE_BATCH]]
            try:
                data = self._api_get(f"/library/metadata/{','.join(chunk)}")
                for meta in data.get("MediaContainer", {}).get("Metadata") or []:
                    media_list = meta.get("Media") or []
                    if not media_list:
                        continue
                    parts_list = media_list[0].get("Part") or []
                    if not parts_list:
                        continue
                    part_key = parts_list[0].get("key", "")
                    if part_key:
                        resolved[str(meta.get("ratingKey"))] = part_key
            except Exception as e:
                decky.logger.error(f"Failed to resolve Plex part keys: {e}")
        return resolved


# =============================================================================
# Jellyfin Service
# =============================================================================

class JellyfinService(MusicService):
    """Jellyfin server backend."""

    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.user_id = config.get("user_id", "")
        self.username = config.get("username", "")
        self.password = config.get("password", "")
        self._authenticated = bool(self.api_key and self.user_id)
        # Playback-session bookkeeping for report_playback: the server keys
        # a session on the auth identity, and a play instance gets one
        # PlaySessionId, opened by /Sessions/Playing and closed by
        # /Sessions/Playing/Stopped. Reports run on executor threads and
        # start/stop ordering matters, so they are serialised by this lock.
        self._report_lock = threading.Lock()
        self._report_track_id = ""
        self._report_last_position = 0
        self._session_started = False
        self._play_session_id = ""
        self._closed_track_id = ""
        self._closed_position = 0

    def _authenticate(self) -> dict:
        """Authenticate with username/password to get access token and user ID."""
        if not self.username:
            return {"success": False, "message": "Username is required"}
        url = f"{self.server_url}/Users/AuthenticateByName"
        headers = {
            "Authorization": 'MediaBrowser Client="Museck", Device="SteamDeck", DeviceId="museck-steamdeck", Version="1.0"',
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        }
        body = json.dumps({"Username": self.username, "Pw": self.password}).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10, context=self._ssl_ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.api_key = data.get("AccessToken", "")
            self.user_id = data.get("User", {}).get("Id", "")
            self._authenticated = True
            return {
                "success": True,
                "api_key": self.api_key,
                "user_id": self.user_id,
            }

    def _ensure_auth(self):
        """Authenticate if we haven't yet."""
        if not self._authenticated:
            self._authenticate()

    def _auth_headers(self) -> dict:
        return {
            "Authorization": f'MediaBrowser Token="{self.api_key}", Client="Museck", Device="SteamDeck", DeviceId="museck-steamdeck", Version="1.0"',
        }

    def _api_url(self, endpoint: str, extra_params: dict = None) -> str:
        url = f"{self.server_url}{endpoint}"
        params = dict(extra_params) if extra_params else {}
        params["api_key"] = self.api_key
        qs = urllib.parse.urlencode(params)
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}{qs}"

    def _api_get(self, endpoint: str, extra_params: dict = None) -> dict:
        self._ensure_auth()
        try:
            return self._http_json(self._api_url(endpoint, extra_params), self._auth_headers())
        except urllib.error.HTTPError as e:
            # Access tokens expire; re-authenticate once and retry before failing.
            if e.code not in (401, 403) or not self.username:
                raise
            decky.logger.info("Access token rejected, re-authenticating")
            self._authenticated = False
            self._authenticate()
            return self._http_json(self._api_url(endpoint, extra_params), self._auth_headers())

    def _api_post(self, endpoint: str, payload: dict) -> bytes:
        """POST a JSON body, with the same token-expiry retry as _api_get."""
        self._ensure_auth()
        body = json.dumps(payload).encode("utf-8")

        def post_once():
            headers = dict(self._auth_headers())
            headers["Content-Type"] = "application/json"
            return self._http_post(self._api_url(endpoint), headers, body, timeout=5)

        try:
            return post_once()
        except urllib.error.HTTPError as e:
            if e.code not in (401, 403) or not self.username:
                raise
            decky.logger.info("Access token rejected, re-authenticating")
            self._authenticated = False
            self._authenticate()
            return post_once()

    def report_playback(self, rating_key: str, state: str, position_ms: int, duration_ms: int):
        """Report playback to the /Sessions/Playing endpoints.

        Without this the server only sees an anonymous stream download, so
        nothing is recorded: no active session on the dashboard, no play
        history, no play count. This is the standard session protocol the
        official clients use — start announces the item, progress carries
        the (pause-aware) position, stopped closes the session — and the
        server itself decides what counts as a play from the positions it
        receives. Every report carries PositionTicks: a stopped report
        without one is read by the server as "played to completion".

        Emby inherits this unchanged: same endpoints, with auth supplied by
        its own _auth_headers/_authenticate overrides.
        """
        if not rating_key:
            return
        with self._report_lock:
            self._report_playback_locked(str(rating_key), state, position_ms)

    def _report_playback_locked(self, track_id: str, state: str, position_ms):
        position_ms = max(0, int(position_ms))
        ticks = position_ms * 10_000  # 100ns ticks, the MediaBrowser unit

        # A track change, or the position jumping backwards (replay, loop,
        # re-queuing the same track), is a new play instance and session.
        new_instance = (track_id != self._report_track_id
                        or position_ms + 2_000 < self._report_last_position)
        if new_instance:
            self._report_track_id = track_id
            self._session_started = False
            self._play_session_id = os.urandom(16).hex()
            self._closed_track_id = ""
            self._closed_position = 0
        elif state == "playing" and position_ms <= 2_000:
            # A (re)start at the beginning ends the closed era, even when
            # the reset heuristic could not see it (previous position low).
            self._closed_track_id = ""
            self._closed_position = 0
        elif (state == "playing" and track_id == self._closed_track_id
                and position_ms > 2_000 and position_ms + 2_000 >= self._closed_position):
            # A report dispatched before this play was stopped, landing
            # after it: reopening would leave a zombie session on the
            # server that nothing ever closes. A genuine replay restarts
            # at position ~0, which is the reset case above.
            return
        self._report_last_position = position_ms

        if state == "playing":
            if not self._session_started:
                if not self._play_session_id:
                    # First ever play, or a fresh start after a stop closed
                    # the previous session at a position too low for the
                    # reset heuristic above to have caught.
                    self._play_session_id = os.urandom(16).hex()
                self._api_post("/Sessions/Playing", {
                    "ItemId": track_id,
                    "PlaySessionId": self._play_session_id,
                    "CanSeek": False,
                    "PlayMethod": "DirectPlay",
                })
                self._session_started = True
            else:
                self._api_post("/Sessions/Playing/Progress", {
                    "ItemId": track_id,
                    "PlaySessionId": self._play_session_id,
                    "PositionTicks": ticks,
                    "IsPaused": False,
                    "CanSeek": False,
                })
        elif state == "paused":
            if self._session_started:
                self._api_post("/Sessions/Playing/Progress", {
                    "ItemId": track_id,
                    "PlaySessionId": self._play_session_id,
                    "PositionTicks": ticks,
                    "IsPaused": True,
                    "CanSeek": False,
                })
        elif state == "stopped" and self._session_started:
            self._api_post("/Sessions/Playing/Stopped", {
                "ItemId": track_id,
                "PlaySessionId": self._play_session_id,
                "PositionTicks": ticks,
            })
            self._session_started = False
            self._play_session_id = ""
            self._closed_track_id = track_id
            self._closed_position = position_ms

    def test_connection(self) -> dict:
        try:
            # Authenticate with username/password if needed
            if self.username and not self._authenticated:
                auth_result = self._authenticate()
                if not auth_result.get("success"):
                    return {"success": False, "message": "Authentication failed - check username/password"}

            data = self._http_json(f"{self.server_url}/System/Info/Public")
            server_name = data.get("ServerName", "Jellyfin Server")
            result = {"success": True, "message": "Connection successful", "server_name": server_name}
            # Return credentials so Plugin can persist them
            if self.api_key:
                result["api_key"] = self.api_key
            if self.user_id:
                result["user_id"] = self.user_id
            return result
        except urllib.error.HTTPError as e:
            return {"success": False, "message": f"HTTP error: {e.code} - {e.reason}"}
        except urllib.error.URLError as e:
            return {"success": False, "message": f"Cannot reach server: {e.reason}"}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    def get_server_status(self) -> dict:
        status = super().get_server_status()
        if status.get("connected"):
            # /System/Info/Public is unauthenticated and carries the
            # version; the base status only surfaces the server name.
            try:
                info = self._http_json(f"{self.server_url}/System/Info/Public", timeout=5)
                if isinstance(info, dict):
                    if info.get("Version"):
                        status["version"] = info["Version"]
                    if info.get("ProductName"):
                        status["server_product"] = info["ProductName"]
            except Exception:
                pass
        return status

    def discover_servers(self) -> list:
        """Discover Jellyfin servers via UDP broadcast on port 7359."""
        servers = []
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            sock.settimeout(2)
            sock.sendto(b"Who is JellyfinServer?", ("255.255.255.255", 7359))

            start_time = time.time()
            while (time.time() - start_time) < 3:
                try:
                    data, addr = sock.recvfrom(4096)
                    info = json.loads(data.decode("utf-8"))
                    address = info.get("Address", f"http://{addr[0]}:8096")
                    server = {
                        "ip": addr[0],
                        "port": address.rsplit(":", 1)[-1] if ":" in address.rsplit("/", 1)[-1] else "8096",
                        "name": info.get("Name", "Jellyfin Server"),
                        "url": address,
                        "id": info.get("Id", ""),
                        "type": "jellyfin"
                    }
                    if not any(s["ip"] == server["ip"] for s in servers):
                        servers.append(server)
                except socket.timeout:
                    break
                except Exception:
                    continue
            sock.close()
        except Exception:
            pass
        return servers

    def get_playlists(self) -> list:
        data = self._api_get(f"/Users/{self.user_id}/Items", {
            "IncludeItemTypes": "Playlist",
            "Recursive": "true",
            "Fields": "ChildCount",
            "MediaTypes": "Audio",
        })
        playlists = []
        for item in data.get("Items", []):
            playlists.append({
                "key": item["Id"],
                "title": item.get("Name", "Unknown"),
                "duration": int(item.get("RunTimeTicks", 0) / 10_000),
                "count": item.get("ChildCount", 0),
                "thumb": item["Id"]
            })
        return playlists

    def get_playlist_tracks(self, playlist_key: str) -> list:
        data = self._api_get(f"/Playlists/{playlist_key}/Items", {
            "UserId": self.user_id,
            "Fields": "MediaSources",
            "Limit": str(MAX_QUEUE_TRACKS),
        })
        return [self._parse_track(item) for item in data.get("Items", [])]

    def search_tracks(self, query: str) -> list:
        data = self._api_get(f"/Items", {
            "SearchTerm": query,
            "IncludeItemTypes": "Audio",
            "Recursive": "true",
            "UserId": self.user_id,
            "Fields": "MediaSources",
            "Limit": "20",
        })
        return [self._parse_track(item) for item in data.get("Items", [])]

    def search_albums(self, query: str) -> list:
        data = self._api_get(f"/Items", {
            "SearchTerm": query,
            "IncludeItemTypes": "MusicAlbum",
            "Recursive": "true",
            "UserId": self.user_id,
            "Limit": "20",
        })
        albums = []
        for item in data.get("Items", []):
            albums.append({
                "key": item["Id"],
                "title": item.get("Name", "Unknown"),
                "artist": item.get("AlbumArtist", "Unknown"),
                "year": item.get("ProductionYear"),
                "thumb": item["Id"]
            })
        return albums

    def search_artists(self, query: str) -> list:
        data = self._api_get(f"/Items", {
            "SearchTerm": query,
            "IncludeItemTypes": "MusicArtist",
            "Recursive": "true",
            "UserId": self.user_id,
            "Limit": "20",
        })
        artists = []
        for item in data.get("Items", []):
            artists.append({
                "key": item["Id"],
                "title": item.get("Name", "Unknown"),
                "thumb": item["Id"]
            })
        return artists

    def get_album_tracks(self, album_key: str) -> list:
        data = self._api_get(f"/Users/{self.user_id}/Items", {
            "ParentId": album_key,
            "IncludeItemTypes": "Audio",
            "Fields": "MediaSources",
            "SortBy": "IndexNumber",
        })
        return [self._parse_track(item) for item in data.get("Items", [])]

    def get_artist_tracks(self, artist_key: str) -> list:
        data = self._api_get(f"/Users/{self.user_id}/Items", {
            "ArtistIds": artist_key,
            "IncludeItemTypes": "Audio",
            "Recursive": "true",
            "Fields": "MediaSources",
            "SortBy": "Album,IndexNumber",
            "Limit": str(MAX_QUEUE_TRACKS),
        })
        return [self._parse_track(item) for item in data.get("Items", [])]

    def get_genres(self) -> list:
        data = self._api_get("/MusicGenres", {"UserId": self.user_id, "Limit": "300"})
        return [
            {"key": item["Id"], "title": item.get("Name", "Unknown")}
            for item in data.get("Items", []) or [] if item.get("Id")
        ]

    def get_genre_tracks(self, genre_key: str) -> list:
        data = self._api_get("/Items", {
            "IncludeItemTypes": "Audio",
            "Recursive": "true",
            "UserId": self.user_id,
            "Fields": "MediaSources",
            "GenreIds": genre_key,
            "Limit": str(MAX_QUEUE_TRACKS),
        })
        return [self._parse_track(item) for item in data.get("Items", []) or []]

    def get_stream_url(self, track_key: str) -> str:
        return f"{self.server_url}/Audio/{track_key}/stream?static=true&api_key={self.api_key}"

    def get_image_url(self, thumb_id: str, width: int = 100, height: int = 100) -> str:
        if not thumb_id:
            return ""
        return (
            f"{self.server_url}/Items/{thumb_id}/Images/Primary"
            f"?maxWidth={width}&maxHeight={height}&quality=80&api_key={self.api_key}"
        )

    def _parse_track(self, item: dict) -> dict:
        item_id = item.get("Id", "")
        album_id = item.get("AlbumId", item_id)
        artists = item.get("Artists", [])
        artist_str = ", ".join(artists) if artists else item.get("AlbumArtist", "Unknown")
        return {
            "key": item_id,
            "ratingKey": item_id,
            "title": item.get("Name", "Unknown"),
            "artist": artist_str,
            "album": item.get("Album", "Unknown"),
            "duration": int(item.get("RunTimeTicks", 0) / 10_000),
            "index": item.get("IndexNumber", 0),
            "thumb": album_id,
            "parentThumb": album_id,
        }


# =============================================================================
# Emby Service (inherits from Jellyfin — APIs are nearly identical)
# =============================================================================

class EmbyService(JellyfinService):
    """Emby server backend. Same API as Jellyfin with different auth header."""

    def _auth_headers(self) -> dict:
        return {"X-Emby-Token": self.api_key}

    def _authenticate(self) -> dict:
        """Authenticate with Emby using username/password."""
        if not self.username:
            return {"success": False, "message": "Username is required"}
        url = f"{self.server_url}/Users/AuthenticateByName"
        headers = {
            "X-Emby-Authorization": 'MediaBrowser Client="Museck", Device="SteamDeck", DeviceId="museck-steamdeck", Version="1.0"',
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        }
        body = json.dumps({"Username": self.username, "Pw": self.password}).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10, context=self._ssl_ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.api_key = data.get("AccessToken", "")
            self.user_id = data.get("User", {}).get("Id", "")
            self._authenticated = True
            return {
                "success": True,
                "api_key": self.api_key,
                "user_id": self.user_id,
            }

    def test_connection(self) -> dict:
        try:
            if self.username and not self._authenticated:
                auth_result = self._authenticate()
                if not auth_result.get("success"):
                    return {"success": False, "message": "Authentication failed - check username/password"}

            data = self._http_json(f"{self.server_url}/System/Info/Public")
            server_name = data.get("ServerName", "Emby Server")
            result = {"success": True, "message": "Connection successful", "server_name": server_name}
            if self.api_key:
                result["api_key"] = self.api_key
            if self.user_id:
                result["user_id"] = self.user_id
            return result
        except urllib.error.HTTPError as e:
            return {"success": False, "message": f"HTTP error: {e.code} - {e.reason}"}
        except urllib.error.URLError as e:
            return {"success": False, "message": f"Cannot reach server: {e.reason}"}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    def discover_servers(self) -> list:
        """Discover Emby servers via UDP broadcast on port 7359."""
        servers = []
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            sock.settimeout(2)
            sock.sendto(b"Who is EmbyServer?", ("255.255.255.255", 7359))

            start_time = time.time()
            while (time.time() - start_time) < 3:
                try:
                    data, addr = sock.recvfrom(4096)
                    info = json.loads(data.decode("utf-8"))
                    address = info.get("Address", f"http://{addr[0]}:8096")
                    server = {
                        "ip": addr[0],
                        "port": address.rsplit(":", 1)[-1] if ":" in address.rsplit("/", 1)[-1] else "8096",
                        "name": info.get("Name", "Emby Server"),
                        "url": address,
                        "id": info.get("Id", ""),
                        "type": "emby"
                    }
                    if not any(s["ip"] == server["ip"] for s in servers):
                        servers.append(server)
                except socket.timeout:
                    break
                except Exception:
                    continue
            sock.close()
        except Exception:
            pass
        return servers


# =============================================================================
# Subsonic Service (Navidrome, Airsonic, Gonic, etc.)
# =============================================================================

class SubsonicService(MusicService):
    """Subsonic API backend (used by Navidrome, Airsonic, Gonic)."""

    def __init__(self, config: dict):
        super().__init__(config)
        self.username = config.get("username", "")
        self.password = config.get("password", "")
        # Scrobble bookkeeping for report_playback: the plugin reports every
        # 10 seconds, but a play may only be submitted once, so remember what
        # the current play instance has already sent. A play instance is
        # identified by its track plus a position that never jumps backwards;
        # a track change or a position reset (replay, loop) starts a new one.
        self._report_track_id = ""
        self._report_last_position = 0
        self._now_playing_sent = False
        self._scrobble_sent = False
        self._closed_track_id = ""
        self._closed_position = 0
        # report_playback runs on executor threads and its callers are not
        # mutually exclusive (the 1s status poll, play/pause/stop actions),
        # so the latches above are only ever touched under this lock —
        # a scrobble is a counter, not idempotent state like Plex's
        # timeline, and two overlapping reports must not both submit.
        self._report_lock = threading.Lock()

    def _auth_params(self) -> dict:
        salt = os.urandom(8).hex()
        token = hashlib.md5((self.password + salt).encode()).hexdigest()
        return {
            "u": self.username,
            "t": token,
            "s": salt,
            "v": "1.16.1",
            "c": "museck",
            "f": "json",
        }

    def _api_url(self, endpoint: str, extra_params: dict = None) -> str:
        params = self._auth_params()
        if extra_params:
            params.update(extra_params)
        qs = urllib.parse.urlencode(params)
        return f"{self.server_url}/rest/{endpoint}?{qs}"

    def _api_get(self, endpoint: str, extra_params: dict = None, timeout: int = 10) -> dict:
        url = self._api_url(endpoint, extra_params)
        data = self._http_json(url, timeout=timeout)
        return data.get("subsonic-response", {})

    @staticmethod
    def _scrobble_due(position_ms: int, duration_ms: int) -> bool:
        """Whether a play has been heard long enough to count (shared rule)."""
        return _is_counted_play(position_ms, duration_ms)

    def _send_scrobble(self, track_id: str, submission: str):
        """Call /rest/scrobble, treating a server-side rejection as a failure.

        Subsonic-style APIs often answer HTTP 200 with
        subsonic-response.status == "failed" — the latch logic below must
        see that as a failure, or the play is latched as recorded and never
        retried.
        """
        resp = self._api_get(
            "scrobble", {"id": track_id, "submission": submission}, timeout=5)
        if resp.get("status") == "failed":
            error = resp.get("error", {}) if isinstance(resp.get("error"), dict) else {}
            raise RuntimeError(
                f"scrobble rejected by server: {error.get('message', 'unknown error')}")

    def report_playback(self, rating_key: str, state: str, position_ms: int, duration_ms: int):
        """Report playback via /rest/scrobble.

        Without this the server only sees an anonymous stream download, so
        nothing is recorded: no play count, no recently-played entry, and
        nothing for the server's own Last.fm/ListenBrainz forwarding.

        `submission=false` is the "now playing" notice, sent once when a
        track starts. `submission=true` is the actual scrobble that bumps
        the play count, sent exactly once per play, when the play has been
        heard long enough to count (see _scrobble_due). The plugin reports
        every 10 seconds, so both sends are latched per play instance.
        """
        if not rating_key:
            return
        with self._report_lock:
            self._report_playback_locked(str(rating_key), state, position_ms, duration_ms)

    def _report_playback_locked(self, track_id: str, state: str, position_ms, duration_ms):
        position_ms = max(0, int(position_ms))
        duration_ms = max(0, int(duration_ms))

        # A track change, or the position jumping backwards (replay, loop,
        # re-queuing the same track), is a new play instance.
        new_instance = (track_id != self._report_track_id
                        or position_ms + 2_000 < self._report_last_position)
        if new_instance:
            self._report_track_id = track_id
            self._now_playing_sent = False
            self._scrobble_sent = False
            self._closed_track_id = ""
            self._closed_position = 0
        elif state == "playing" and position_ms <= 2_000:
            # A (re)start at the beginning ends the closed era, even when
            # the reset heuristic could not see it (previous position low).
            self._closed_track_id = ""
            self._closed_position = 0
        elif (state == "playing" and track_id == self._closed_track_id
                and position_ms > 2_000 and position_ms + 2_000 >= self._closed_position):
            # A report dispatched before this play was stopped, landing
            # after it: reopening the instance would announce (and could
            # re-submit) a play that already ended. A genuine replay is
            # never caught by this — it restarts at position ~0, which
            # clears the closed markers above, not this branch.
            return
        self._report_last_position = position_ms

        # Latches are set before the send and restored on failure: the
        # caller (Plugin._report_playback) never retries a report, so a
        # failure must leave the latch unset, while concurrent reports
        # serialised by the lock must never both submit. A failure is
        # retried by the next scheduled report, not by this call.
        if state == "playing":
            if not self._now_playing_sent:
                self._now_playing_sent = True
                try:
                    self._send_scrobble(track_id, "false")
                except Exception:
                    self._now_playing_sent = False
                    raise
            if not self._scrobble_sent and self._scrobble_due(position_ms, duration_ms):
                self._scrobble_sent = True
                try:
                    self._send_scrobble(track_id, "true")
                except Exception:
                    self._scrobble_sent = False
                    raise
        elif state == "stopped":
            # Backstop: a play that reached the threshold without a playing
            # report landing on it (e.g. the final poll raced the track end)
            # still counts. A play stopped early does not.
            if not self._scrobble_sent and self._scrobble_due(position_ms, duration_ms):
                self._scrobble_sent = True
                try:
                    self._send_scrobble(track_id, "true")
                except Exception:
                    self._scrobble_sent = False
                    raise
            # The next play must announce itself again. The scrobble latch
            # clears via the new play's position reset (or track change);
            # that always fires when a scrobble was possible, since being
            # due requires position well past the 2s reset tolerance.
            self._now_playing_sent = False
            self._closed_track_id = track_id
            self._closed_position = position_ms

    def test_connection(self) -> dict:
        try:
            resp = self._api_get("ping")
            if resp.get("status") == "ok":
                # Try to get server type from response
                server_type = resp.get("type", "Subsonic")
                server_version = resp.get("serverVersion", resp.get("version", ""))
                name = f"{server_type} {server_version}".strip()
                return {"success": True, "message": "Connection successful", "server_name": name or "Subsonic Server"}
            else:
                error = resp.get("error", {})
                return {"success": False, "message": error.get("message", "Authentication failed")}
        except urllib.error.HTTPError as e:
            return {"success": False, "message": f"HTTP error: {e.code} - {e.reason}"}
        except urllib.error.URLError as e:
            return {"success": False, "message": f"Cannot reach server: {e.reason}"}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    def get_server_status(self) -> dict:
        status = super().get_server_status()
        if status.get("connected"):
            # The ping payload names the server software and its version;
            # test_connection folds them into the display name, the status
            # card wants them as separate fields.
            try:
                resp = self._api_get("ping", timeout=5)
                version = resp.get("serverVersion") or resp.get("version")
                if version:
                    status["version"] = version
                if resp.get("type"):
                    status["server_product"] = resp["type"]
            except Exception:
                pass
        return status

    def get_playlists(self) -> list:
        resp = self._api_get("getPlaylists")
        playlists_data = resp.get("playlists", {}).get("playlist", [])
        if isinstance(playlists_data, dict):
            playlists_data = [playlists_data]
        playlists = []
        for pl in playlists_data:
            playlists.append({
                "key": str(pl.get("id", "")),
                "title": pl.get("name", "Unknown"),
                "duration": pl.get("duration", 0) * 1000,
                "count": pl.get("songCount", 0),
                "thumb": pl.get("coverArt", "")
            })
        return playlists

    def get_playlist_tracks(self, playlist_key: str) -> list:
        resp = self._api_get("getPlaylist", {"id": playlist_key})
        entries = resp.get("playlist", {}).get("entry", [])
        if isinstance(entries, dict):
            entries = [entries]
        return [self._parse_track(s) for s in entries[:MAX_QUEUE_TRACKS]]

    def search_tracks(self, query: str) -> list:
        resp = self._api_get("search3", {
            "query": query,
            "songCount": "20",
            "albumCount": "0",
            "artistCount": "0",
        })
        songs = resp.get("searchResult3", {}).get("song", [])
        if isinstance(songs, dict):
            songs = [songs]
        return [self._parse_track(s) for s in songs]

    def search_albums(self, query: str) -> list:
        resp = self._api_get("search3", {
            "query": query,
            "songCount": "0",
            "albumCount": "20",
            "artistCount": "0",
        })
        albums_data = resp.get("searchResult3", {}).get("album", [])
        if isinstance(albums_data, dict):
            albums_data = [albums_data]
        albums = []
        for album in albums_data:
            albums.append({
                "key": str(album.get("id", "")),
                "title": album.get("name", album.get("title", "Unknown")),
                "artist": album.get("artist", "Unknown"),
                "year": album.get("year"),
                "thumb": album.get("coverArt", str(album.get("id", "")))
            })
        return albums

    def search_artists(self, query: str) -> list:
        resp = self._api_get("search3", {
            "query": query,
            "songCount": "0",
            "albumCount": "0",
            "artistCount": "20",
        })
        artists_data = resp.get("searchResult3", {}).get("artist", [])
        if isinstance(artists_data, dict):
            artists_data = [artists_data]
        artists = []
        for artist in artists_data:
            artists.append({
                "key": str(artist.get("id", "")),
                "title": artist.get("name", "Unknown"),
                "thumb": artist.get("coverArt", artist.get("artistImageUrl", ""))
            })
        return artists

    def get_album_tracks(self, album_key: str) -> list:
        resp = self._api_get("getAlbum", {"id": album_key})
        songs = resp.get("album", {}).get("song", [])
        if isinstance(songs, dict):
            songs = [songs]
        return [self._parse_track(s) for s in songs]

    def get_artist_tracks(self, artist_key: str) -> list:
        resp = self._api_get("getArtist", {"id": artist_key})
        albums = resp.get("artist", {}).get("album", [])
        if isinstance(albums, dict):
            albums = [albums]
        all_tracks = []
        for album in albums:
            album_id = album.get("id")
            if album_id:
                album_resp = self._api_get("getAlbum", {"id": str(album_id)})
                songs = album_resp.get("album", {}).get("song", [])
                if isinstance(songs, dict):
                    songs = [songs]
                all_tracks.extend([self._parse_track(s) for s in songs])
                if len(all_tracks) >= MAX_QUEUE_TRACKS:
                    break
        return all_tracks[:MAX_QUEUE_TRACKS]

    def get_genres(self) -> list:
        resp = self._api_get("getGenres")
        entries = resp.get("genres", {}).get("genre", [])
        if isinstance(entries, dict):
            entries = [entries]
        genres = []
        for entry in entries:
            # Subsonic identifies a genre by its name
            name = entry.get("value") or entry.get("name")
            if name and entry.get("songCount", 1):
                genres.append({"key": name, "title": name})
        return sorted(genres, key=lambda g: g["title"].lower())

    def get_genre_tracks(self, genre_key: str) -> list:
        resp = self._api_get("getSongsByGenre", {
            "genre": genre_key, "count": str(MAX_QUEUE_TRACKS)})
        songs = resp.get("songsByGenre", {}).get("song", [])
        if isinstance(songs, dict):
            songs = [songs]
        return [self._parse_track(song) for song in songs]

    def get_stream_url(self, track_key: str) -> str:
        params = self._auth_params()
        params["id"] = track_key
        # Remove f=json for stream — we want raw audio
        params.pop("f", None)
        qs = urllib.parse.urlencode(params)
        return f"{self.server_url}/rest/stream?{qs}"

    def get_image_url(self, thumb_id: str, width: int = 100, height: int = 100) -> str:
        if not thumb_id:
            return ""
        params = self._auth_params()
        params["id"] = thumb_id
        params["size"] = str(width)
        # Remove f=json for image — we want raw bytes
        params.pop("f", None)
        qs = urllib.parse.urlencode(params)
        return f"{self.server_url}/rest/getCoverArt?{qs}"

    def _parse_track(self, song: dict) -> dict:
        song_id = str(song.get("id", ""))
        cover_art = song.get("coverArt", song.get("albumId", song_id))
        return {
            "key": song_id,
            "ratingKey": song_id,
            "title": song.get("title", "Unknown"),
            "artist": song.get("artist", "Unknown"),
            "album": song.get("album", "Unknown"),
            "duration": song.get("duration", 0) * 1000,  # seconds → ms
            "index": song.get("track", 0),
            "thumb": str(cover_art) if cover_art else "",
            "parentThumb": str(cover_art) if cover_art else "",
        }


class SoulSyncService(MusicService):
    """SoulSync backend.

    SoulSync is itself the server here: Museck talks to its public API v1
    (API-key auth; keys are created in SoulSync's Settings) for the
    library, and to its long-standing web routes for streaming
    (/stream/library-audio), play logging (/api/library/log-play) and
    live status (/status, /api/server-activity) — the same surfaces
    SoulSync's own UI and the Companion extension use.
    """

    # Genre play has no tracks-by-genre endpoint in the API, so albums
    # are walked page by page and filtered client-side. Bound the walk so
    # a huge library cannot turn one tap into minutes of paging.
    _GENRE_PAGE_SIZE = 200
    _GENRE_SCAN_MAX_PAGES = 25

    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        # Metadata for tracks this instance has parsed, keyed by track
        # id. report_playback only receives a rating key, but SoulSync's
        # log-play needs title/artist/album, so they are remembered at
        # parse time.
        self._track_meta = {}
        # Album id -> {title, thumb_url, artist_id}, resolved lazily:
        # track payloads carry no artwork and (on playlist endpoints) no
        # album/artist names either; album payloads carry all three.
        self._album_info_cache = {}
        # Artist id -> name. Album payloads carry artist_id, not the name.
        self._artist_names = {}
        # Play-log bookkeeping, same latch discipline as the Subsonic
        # scrobble: one log per play instance, set before the send and
        # restored on failure.
        self._report_track_id = ""
        self._report_last_position = 0
        self._log_sent = False
        self._closed_track_id = ""
        self._closed_position = 0
        self._report_lock = threading.Lock()

    # --- API plumbing ---------------------------------------------------

    def _auth_headers(self) -> dict:
        if self.api_key:
            return {"Authorization": f"Bearer {self.api_key}"}
        return {}

    def _api_get(self, path: str, params: dict = None, timeout: int = 15):
        """GET an API v1 endpoint and unwrap the {success, data} envelope."""
        url = f"{self.server_url}/api/v1{path}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        payload = self._http_json(url, headers=self._auth_headers(), timeout=timeout)
        if isinstance(payload, dict) and "success" in payload:
            if not payload.get("success"):
                error = payload.get("error") or {}
                message = error.get("message") if isinstance(error, dict) else str(error)
                raise RuntimeError(message or "SoulSync API error")
            return payload.get("data") or {}
        return payload

    def _bare_get(self, path: str, timeout: int = 10) -> dict:
        """GET a non-v1 SoulSync route (bare JSON) using api_key auth."""
        sep = "&" if "?" in path else "?"
        url = f"{self.server_url}{path}{sep}api_key={urllib.parse.quote(self.api_key)}"
        data = self._http_json(url, timeout=timeout)
        return data if isinstance(data, dict) else {}

    # --- Connection ------------------------------------------------------

    def test_connection(self) -> dict:
        try:
            # The v1 system status is the cheapest authenticated call:
            # it proves the URL answers and the key is accepted.
            self._api_get("/system/status", timeout=8)
            return {"success": True, "message": "Connection successful", "server_name": "SoulSync"}
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                return {"success": False, "message": "Invalid SoulSync API key. Create one in SoulSync under Settings, then API keys."}
            if e.code == 429:
                return {"success": False, "message": "SoulSync rate limit hit. Wait a moment and try again."}
            return {"success": False, "message": f"HTTP error: {e.code} - {e.reason}"}
        except urllib.error.URLError as e:
            return {"success": False, "message": f"Cannot reach server: {e.reason}"}
        except RuntimeError as e:
            return {"success": False, "message": str(e)}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    # --- Parsing ----------------------------------------------------------

    def _parse_track(self, track: dict, album_title: str = "", album_thumb: str = ""):
        """Convert an API v1 track payload to Museck's track shape.

        Returns None for tracks that cannot be streamed: SoulSync streams
        the file from its own disk (with a media-server fallback keyed by
        track id), so a track with no file_path has nothing to play.
        """
        if not isinstance(track, dict):
            return None
        track_id = track.get("id")
        file_path = str(track.get("file_path") or "").strip()
        if track_id is None or not file_path:
            return None
        track_id = str(track_id)
        album_id = track.get("album_id")
        thumb = track.get("album_thumb_url") or track.get("thumb_url") or album_thumb or ""
        if not thumb and album_id is not None:
            # Track payloads carry no artwork; the album's does. Defer to
            # get_image_url, which resolves and caches it per album.
            thumb = f"ssalbum:{album_id}"
        title = track.get("title") or "Unknown"
        # Keep the raw (possibly empty) names in the metadata cache:
        # playlist payloads do not join them (see _fill_track_names), and
        # log-play must never record a placeholder as if it were truth.
        artist = track.get("artist_name") or ""
        album = track.get("album_title") or album_title or ""
        if len(self._track_meta) > 5000:
            self._track_meta.clear()
        self._track_meta[track_id] = {
            "title": title, "artist": artist, "album": album,
            "album_id": album_id, "artist_id": track.get("artist_id"),
        }
        try:
            duration = int(track.get("duration") or 0)
        except (TypeError, ValueError):
            duration = 0
        return {
            # The stream endpoint needs the file path, and the plugin only
            # hands this key back to get_stream_url, so both the track id
            # and the path ride in it.
            "key": f"{track_id}::{file_path}",
            "ratingKey": track_id,
            "title": title,
            "artist": artist or "Unknown",
            "album": album or "Unknown",
            "duration": duration,  # SoulSync stores duration in ms already
            "index": track.get("track_number") or 0,
            "thumb": str(thumb),
            "parentThumb": str(thumb),
        }

    def _parse_tracks(self, tracks, album_title: str = "", album_thumb: str = "") -> list:
        parsed = []
        for track in tracks or []:
            item = self._parse_track(track, album_title, album_thumb)
            if item:
                parsed.append(item)
        return parsed

    def _artist_name(self, artist_id, budget: list = None) -> str:
        """Resolve an artist id to its name, cached, softly capped.

        Failures are NOT cached: a transient error (a network blip, a
        rate-limit 429) must not blank the name for the whole session —
        the next caller retries, like the plugin's thumb hydration does.
        `budget`, when given, is a one-element list of lookups the caller
        still allows; only cache misses spend it.
        """
        if artist_id is None:
            return ""
        key = str(artist_id)
        if key in self._artist_names:
            return self._artist_names[key]
        if len(self._artist_names) >= 64:
            return ""
        if budget is not None:
            if budget[0] <= 0:
                return ""
            budget[0] -= 1
        try:
            data = self._api_get(f"/library/artists/{key}")
        except Exception:
            return ""
        name = (data.get("artist") or {}).get("name") or ""
        self._artist_names[key] = name
        return name

    def _album_info(self, album_id, budget: list = None) -> dict:
        """Album {title, thumb_url, artist_id} by id, cached.

        Same failure/budget discipline as _artist_name: only successful
        lookups are cached.
        """
        if album_id is None:
            return {}
        key = str(album_id)
        if key in self._album_info_cache:
            return self._album_info_cache[key]
        if budget is not None:
            if budget[0] <= 0:
                return {}
            budget[0] -= 1
        try:
            data = self._api_get(f"/library/albums/{key}")
        except Exception:
            return {}
        album = data.get("album") or {}
        info = {
            "title": album.get("title") or "",
            "thumb_url": album.get("thumb_url") or "",
            "artist_id": album.get("artist_id"),
        }
        self._album_info_cache[key] = info
        return info

    def _fill_track_names(self, track: dict, budget: list):
        """Fill a parsed track's Unknown artist/album from its ids.

        Playlist payloads are the gap: curated rows join neither name,
        mirrored rows only the artist. Every row carries album_id and
        artist_id, so resolve through the cached lookups. Tracks the
        budget runs out on keep their placeholders for display; play
        reporting still recovers the real names per track (see
        _send_log_play), so history is never polluted with them.
        """
        meta = self._track_meta.get(track["ratingKey"]) or {}
        album_id = meta.get("album_id")
        artist_id = meta.get("artist_id")
        if track["album"] == "Unknown" and album_id is not None:
            info = self._album_info(album_id, budget)
            if info.get("title"):
                track["album"] = info["title"]
                meta["album"] = info["title"]
            if artist_id is None:
                artist_id = info.get("artist_id")
        if track["artist"] == "Unknown" and artist_id is not None:
            name = self._artist_name(artist_id, budget)
            if name:
                track["artist"] = name
                meta["artist"] = name

    def _parse_album(self, album: dict, resolve_artist: bool = False) -> dict:
        artist = album.get("artist_name") or ""
        if not artist and resolve_artist:
            artist = self._artist_name(album.get("artist_id"))
        return {
            "key": str(album.get("id", "")),
            "title": album.get("title", "Unknown"),
            "artist": artist or "Unknown",
            "year": album.get("year"),
            "thumb": album.get("thumb_url") or "",
        }

    # --- Library ----------------------------------------------------------

    def get_playlists(self) -> list:
        """Curated and mirrored playlists, told apart by key prefix.

        SoulSync keeps the two in separate endpoints with separate id
        spaces; the prefix routes get_playlist_tracks to the right one.
        One family failing must not hide the other.
        """
        playlists = []
        errors = []
        try:
            data = self._api_get("/library/playlists")
            for pl in data.get("playlists", []):
                playlists.append({
                    "key": f"curated:{pl.get('id')}",
                    "title": pl.get("name", "Unknown"),
                    "duration": 0,
                    "count": pl.get("track_count", 0),
                    "thumb": "",
                })
        except Exception as e:
            errors.append(e)
        try:
            data = self._api_get("/library/mirrored-playlists")
            for pl in data.get("playlists", []):
                playlists.append({
                    "key": f"mirrored:{pl.get('id')}",
                    "title": pl.get("name", "Unknown"),
                    "duration": 0,
                    "count": pl.get("track_count", 0),
                    "thumb": pl.get("cover_url") or "",
                })
        except Exception as e:
            errors.append(e)
        if errors and not playlists:
            raise errors[0]
        return playlists

    def get_playlist_tracks(self, playlist_key: str) -> list:
        kind, _, pid = str(playlist_key).partition(":")
        if kind == "mirrored":
            data = self._api_get(f"/library/mirrored-playlists/{pid}/tracks")
        else:
            data = self._api_get(f"/library/playlists/{pid or playlist_key}/tracks")
        tracks = self._parse_tracks(data.get("tracks", []))[:MAX_QUEUE_TRACKS]
        # Playlist rows lack joined names (curated: both, mirrored: the
        # album), so fill them from the album/artist lookups. The budget
        # bounds fresh lookups per load — the API allows 60 requests a
        # minute, and a huge playlist must not spend it all on names;
        # cached lookups are free and do not count against it.
        budget = [50]
        for track in tracks:
            if track["artist"] == "Unknown" or track["album"] == "Unknown":
                self._fill_track_names(track, budget)
        return tracks

    def search_tracks(self, query: str) -> list:
        """Library track search.

        The API searches one field per call (title or artist) and
        requires at least one, so a Museck search runs both and merges,
        title matches first. (The API's /search endpoints search
        external metadata providers, not the library, so they are not
        used here: their results have nothing to stream.)
        """
        results = []
        seen = set()
        errors = []
        for params in ({"title": query}, {"artist": query}):
            try:
                data = self._api_get("/library/tracks", {**params, "limit": 50})
            except Exception as e:
                errors.append(e)
                continue
            for item in self._parse_tracks(data.get("tracks", [])):
                if item["ratingKey"] not in seen:
                    seen.add(item["ratingKey"])
                    results.append(item)
        if errors and not results:
            raise errors[0]
        return results[:30]

    def search_albums(self, query: str) -> list:
        data = self._api_get("/library/albums", {"search": query, "limit": 30})
        return [self._parse_album(a, resolve_artist=True) for a in data.get("albums", [])]

    def search_artists(self, query: str) -> list:
        data = self._api_get("/library/artists", {"search": query, "limit": 30})
        artists = []
        for artist in data.get("artists", []):
            artists.append({
                "key": str(artist.get("id", "")),
                "title": artist.get("name", "Unknown"),
                "thumb": artist.get("thumb_url") or "",
            })
        return artists

    def get_album_tracks(self, album_key: str) -> list:
        # The album endpoint embeds its tracks plus the album's own
        # title and artwork, which track rows alone do not carry.
        data = self._api_get(f"/library/albums/{album_key}")
        album = data.get("album") or {}
        return self._parse_tracks(
            data.get("tracks", []),
            album_title=album.get("title", ""),
            album_thumb=album.get("thumb_url") or "",
        )[:MAX_QUEUE_TRACKS]

    def get_artist_tracks(self, artist_key: str) -> list:
        # The artist endpoint embeds the album list; each album's tracks
        # come from the album endpoint, in album order.
        data = self._api_get(f"/library/artists/{artist_key}")
        artist_name = (data.get("artist") or {}).get("name") or ""
        if artist_name:
            self._artist_names[str(artist_key)] = artist_name
        all_tracks = []
        for album in data.get("albums", []):
            try:
                album_data = self._api_get(f"/library/albums/{album.get('id')}")
            except Exception:
                continue
            album_obj = album_data.get("album") or album
            tracks = self._parse_tracks(
                album_data.get("tracks", []),
                album_title=album_obj.get("title", ""),
                album_thumb=album_obj.get("thumb_url") or "",
            )
            for track in tracks:
                if track["artist"] == "Unknown" and artist_name:
                    track["artist"] = artist_name
                    self._track_meta[track["ratingKey"]] = {
                        "title": track["title"], "artist": artist_name,
                        "album": track["album"],
                    }
            all_tracks.extend(tracks)
            if len(all_tracks) >= MAX_QUEUE_TRACKS:
                break
        return all_tracks[:MAX_QUEUE_TRACKS]

    def get_genres(self) -> list:
        data = self._api_get("/library/genres", {"source": "albums"})
        genres = []
        for entry in data.get("genres", []):
            name = entry.get("name") if isinstance(entry, dict) else entry
            if name:
                genres.append({"key": name, "title": name})
        return sorted(genres, key=lambda g: g["title"].lower())

    def get_genre_tracks(self, genre_key: str) -> list:
        """Tracks for a genre, assembled client-side.

        The API lists genres and tags albums with them, but has no
        tracks-by-genre endpoint, so walk the album list, keep albums
        tagged with the genre, and queue their tracks. The walk is
        bounded; on a library larger than the bound a genre may come
        back partial rather than complete.
        """
        wanted = str(genre_key).strip().lower()
        tracks = []
        for page in range(1, self._GENRE_SCAN_MAX_PAGES + 1):
            try:
                data = self._api_get("/library/albums", {
                    "limit": self._GENRE_PAGE_SIZE, "page": page})
            except Exception:
                # A failure mid-walk (the 60/min API budget is the usual
                # suspect on big libraries) degrades to what was already
                # gathered instead of discarding it; with nothing
                # gathered the error is the caller's to see.
                if tracks:
                    break
                raise
            albums = data.get("albums", [])
            if not albums:
                break
            for album in albums:
                genres = album.get("genres") or []
                if not any(str(g).strip().lower() == wanted for g in genres):
                    continue
                try:
                    album_data = self._api_get(f"/library/albums/{album.get('id')}")
                except Exception:
                    continue
                album_obj = album_data.get("album") or album
                tracks.extend(self._parse_tracks(
                    album_data.get("tracks", []),
                    album_title=album_obj.get("title", ""),
                    album_thumb=album_obj.get("thumb_url") or ""))
                if len(tracks) >= MAX_QUEUE_TRACKS:
                    return tracks[:MAX_QUEUE_TRACKS]
            if len(albums) < self._GENRE_PAGE_SIZE:
                break
        return tracks[:MAX_QUEUE_TRACKS]

    # --- Streaming and artwork --------------------------------------------

    def get_stream_url(self, track_key: str) -> str:
        track_id, _, file_path = str(track_key).partition("::")
        if not file_path:
            # A plain key with no embedded path: treat it as the path.
            track_id, file_path = "", track_id
        params = {"path": file_path, "api_key": self.api_key}
        if track_id:
            # Lets SoulSync fall back to its media-server proxy when the
            # file is not on its own disk.
            params["track_id"] = track_id
        qs = urllib.parse.urlencode(params)
        return f"{self.server_url}/stream/library-audio?{qs}"

    def _with_api_key(self, url: str) -> str:
        if "api_key=" in url:
            return url
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}api_key={urllib.parse.quote(self.api_key)}"

    def _proxied_image_url(self, raw_url: str) -> str:
        """Route a raw stored artwork URL through SoulSync's image proxy,
        which is what SoulSync's own UI and the extension do: the proxy
        normalizes media-server art (minting the tokens it needs)
        server-side instead of the client fetching it directly."""
        qs = urllib.parse.urlencode({"url": raw_url, "api_key": self.api_key})
        return f"{self.server_url}/api/image-proxy?{qs}"

    @staticmethod
    def _is_internal_art_url(url: str) -> bool:
        """Artwork URLs only the media server (or its LAN) serves sanely."""
        lowered = url.lower()
        if any(marker in lowered for marker in (
                "/library/metadata/", "/items/", "/rest/getcoverart")):
            return True
        host = urllib.parse.urlparse(url).hostname or ""
        if host in ("localhost", "host.docker.internal") or "." not in host:
            # Loopback aliases, Docker's host gateway, and single-label
            # LAN hostnames are all names only the server's own network
            # resolves — the same set SoulSync's own normalizer treats
            # as internal.
            return True
        if host.startswith(("127.", "10.", "192.168.")):
            return True
        if host.startswith("172."):
            try:
                return 16 <= int(host.split(".")[1]) <= 31
            except (IndexError, ValueError):
                return False
        return False

    def get_image_url(self, thumb_id: str, width: int = 100, height: int = 100) -> str:
        if not thumb_id:
            return ""
        thumb_id = str(thumb_id)
        if thumb_id.startswith("data:"):
            return thumb_id
        if thumb_id.startswith("ssalbum:"):
            return self._album_image_url(thumb_id[len("ssalbum:"):])
        if thumb_id.startswith(("http://", "https://")):
            if thumb_id.startswith(self.server_url) and "/api/" in thumb_id:
                return self._with_api_key(thumb_id)
            if self._is_internal_art_url(thumb_id):
                return self._proxied_image_url(thumb_id)
            # Public artwork (metadata-provider CDNs) fetches directly.
            return thumb_id
        if thumb_id.startswith("/"):
            if thumb_id.startswith("/api/"):
                return self._with_api_key(f"{self.server_url}{thumb_id}")
            # Media-server-relative paths (/library/..., /Items/...) have
            # no base URL resolvable from here; the art slot falls back to
            # its placeholder rather than a broken request.
            return ""
        return ""

    def _album_image_url(self, album_id: str) -> str:
        raw = self._album_info(album_id).get("thumb_url") or ""
        if not raw or raw.startswith("ssalbum:"):
            # A stored value is a real URL, never another ssalbum:
            # reference; guard anyway so corrupt data degrades to no
            # art instead of recursing.
            return ""
        # Recurse once to resolve the stored URL's own form.
        return self.get_image_url(raw)

    # --- Play reporting ------------------------------------------------------

    def report_playback(self, rating_key: str, state: str, position_ms: int, duration_ms: int):
        """Record counted plays in SoulSync's listening history.

        SoulSync's log-play is a play counter, not a session protocol:
        there is no start/progress/stop handshake, a POST simply records
        that a track was played. So, like the Subsonic scrobble, it is
        sent exactly once per play instance, when the play has been heard
        long enough to count (the shared rule in _is_counted_play), from
        either a playing report or the stopped backstop.
        """
        if not rating_key:
            return
        with self._report_lock:
            self._report_playback_locked(str(rating_key), state, position_ms, duration_ms)

    def _report_playback_locked(self, track_id: str, state: str, position_ms, duration_ms):
        position_ms = max(0, int(position_ms))
        duration_ms = max(0, int(duration_ms))

        # A track change, or the position jumping backwards (replay,
        # loop, re-queuing the same track), is a new play instance.
        new_instance = (track_id != self._report_track_id
                        or position_ms + 2_000 < self._report_last_position)
        if new_instance:
            self._report_track_id = track_id
            self._log_sent = False
            self._closed_track_id = ""
            self._closed_position = 0
        elif state == "playing" and position_ms <= 2_000:
            # A (re)start at the beginning ends the closed era, even when
            # the reset heuristic could not see it.
            self._closed_track_id = ""
            self._closed_position = 0
        elif (state == "playing" and track_id == self._closed_track_id
                and position_ms > 2_000 and position_ms + 2_000 >= self._closed_position):
            # A report dispatched before this play was stopped, landing
            # after it: the play already ended, do not log it twice.
            return
        self._report_last_position = position_ms

        if state in ("playing", "stopped"):
            # The latch is set before the send and restored on failure:
            # the caller never retries a report, so a failure must leave
            # the latch unset for the next scheduled report, while the
            # lock keeps concurrent reports from both sending.
            if not self._log_sent and _is_counted_play(position_ms, duration_ms):
                self._log_sent = True
                try:
                    self._send_log_play(track_id, duration_ms)
                except Exception:
                    self._log_sent = False
                    raise
            if state == "stopped":
                self._closed_track_id = track_id
                self._closed_position = position_ms

    def _send_log_play(self, track_id: str, duration_ms: int):
        meta = self._track_meta.get(track_id)
        if meta is None or not meta.get("artist") or not meta.get("album"):
            # Either the track was never parsed by this instance (the
            # service is re-resolved when settings change), or it was
            # parsed from a playlist payload, which joins no names. The
            # track endpoint joins both, so recover what's missing. With
            # no cached meta at all a failure propagates, so the latch
            # restores and a later report retries; with a cached title a
            # failed recovery must not lose the play itself.
            try:
                data = self._api_get(f"/library/tracks/{track_id}")
                found = data.get("track") or {}
                recovered = {
                    "title": found.get("title") or "",
                    "artist": found.get("artist_name") or "",
                    "album": found.get("album_title") or "",
                }
            except Exception:
                if meta is None:
                    raise
                recovered = {}
            if meta is None:
                meta = {**recovered, "album_id": None, "artist_id": None}
                self._track_meta[track_id] = meta
            else:
                for field in ("title", "artist", "album"):
                    if not meta.get(field) and recovered.get(field):
                        meta[field] = recovered[field]
        if not meta.get("title"):
            # log-play builds its history row from the title; with none
            # there is nothing truthful to record.
            return
        payload_track = {
            "title": meta["title"],
            "artist": meta.get("artist", ""),
            "album": meta.get("album", ""),
        }
        if track_id.isdigit():
            payload_track["id"] = int(track_id)
        body = json.dumps({
            "track": payload_track,
            "duration_ms": int(duration_ms),
        }).encode("utf-8")
        url = (f"{self.server_url}/api/library/log-play"
               f"?api_key={urllib.parse.quote(self.api_key)}")
        response = self._http_post(
            url, {"Content-Type": "application/json"}, body, timeout=5)
        # The route answers failures as HTTP 200 with
        # {"success": false}; treat that as a failure so the latch
        # restores and a later report retries, instead of recording a
        # play SoulSync actually refused.
        try:
            outcome = json.loads(response.decode("utf-8")) if response else {}
        except Exception:
            outcome = {}
        if isinstance(outcome, dict) and outcome.get("success") is False:
            raise RuntimeError("SoulSync rejected the play log")

    # --- Live status ----------------------------------------------------------

    def get_server_status(self) -> dict:
        """Live status, aggregated the way SoulSync's own UI and the
        Companion extension see it: v1 system status for uptime and
        service health, v1 stats for library size and active downloads,
        the /status payload for the media server behind SoulSync, and
        server-activity for what that server is streaming right now.

        Every section is best-effort: a section that fails is simply
        absent, never fatal to the rest.
        """
        started = time.monotonic()
        status = {
            "success": True,
            "connected": False,
            "server_type": "soulsync",
            "server_name": "SoulSync",
            "message": "",
            "checked_at": int(time.time()),
        }
        try:
            system = self._api_get("/system/status", timeout=8)
            status["connected"] = True
            status["uptime"] = system.get("uptime", "")
            status["uptime_seconds"] = system.get("uptime_seconds", 0)
            services = system.get("services") or {}
            status["services"] = {
                "spotify": bool(services.get("spotify")),
                "soulseek": bool(services.get("soulseek")),
                "hydrabase": bool(services.get("hydrabase")),
            }
        except urllib.error.HTTPError as e:
            status["message"] = ("Invalid SoulSync API key" if e.code in (401, 403)
                                 else f"HTTP error: {e.code}")
        except Exception as e:
            status["message"] = str(e)
        status["response_time_ms"] = int((time.monotonic() - started) * 1000)
        if not status["connected"]:
            return status

        try:
            stats = self._api_get("/system/stats", timeout=8)
            if stats.get("library"):
                status["library"] = stats["library"]
            database = stats.get("database") or {}
            if database.get("size_mb") is not None:
                status["database_size_mb"] = database["size_mb"]
            downloads = stats.get("downloads") or {}
            if downloads.get("active") is not None:
                status["active_downloads"] = downloads["active"]
        except Exception:
            pass

        try:
            legacy = self._bare_get("/status", timeout=8)
            media = legacy.get("media_server") or {}
            if media:
                status["media_server"] = {
                    "connected": bool(media.get("connected")),
                    "type": media.get("type", ""),
                    "response_time_ms": media.get("response_time"),
                }
            soulseek = legacy.get("soulseek") or {}
            if soulseek:
                status.setdefault("services", {})["soulseek"] = bool(soulseek.get("connected"))
                if soulseek.get("source"):
                    status["download_source"] = soulseek["source"]
            if legacy.get("active_media_server"):
                status["active_media_server"] = legacy["active_media_server"]
            if legacy.get("metadata_source"):
                status["metadata_source"] = legacy["metadata_source"]
        except Exception:
            pass

        try:
            activity = self._bare_get("/api/server-activity", timeout=8)
            if activity:
                summary = activity.get("summary") or {}
                server = activity.get("server") or {}
                status["activity"] = {
                    "ok": bool(activity.get("ok")),
                    "server_name": server.get("name", ""),
                    "server_version": server.get("version", ""),
                    "streams": summary.get("streams", 0),
                    "transcodes": summary.get("transcodes", 0),
                    "total_bandwidth_kbps": summary.get("total_bandwidth_kbps", 0),
                    "sessions": [
                        {
                            "title": s.get("title", ""),
                            "subtitle": s.get("subtitle", ""),
                            "user": s.get("user", ""),
                            "state": s.get("state", ""),
                            "progress_pct": s.get("progress_pct", 0),
                        }
                        for s in (activity.get("sessions") or [])[:5]
                        if isinstance(s, dict)
                    ],
                }
        except Exception:
            pass
        return status


# =============================================================================
# Service Registry
# =============================================================================

SERVICE_CLASSES = {
    "plex": PlexService,
    "jellyfin": JellyfinService,
    "emby": EmbyService,
    "subsonic": SubsonicService,
    "soulsync": SoulSyncService,
}


# =============================================================================
# Plugin Class
# =============================================================================

class Plugin:
    settings_path = None
    settings = {
        "servers": [],
        "active_server_id": ""
    }

    # Current active service instance
    current_service = None

    # Audio player control (using ffplay)
    player_process = None
    player_paused = False
    _last_report = 0
    playback_start_time = None
    total_paused_time = 0
    pause_start_time = None
    _consecutive_failures = 0

    # Playback state
    playback_state = {
        "is_playing": False,
        "current_track": None,
        "position": 0,
        "duration": 0,
        "volume": 75,
        "queue": [],
        "queue_index": -1,
        "shuffle": False,
        "loop": "off",
        "last_error": None
    }

    # Original queue order (for unshuffle)
    original_queue = []

    # Cover art cache: "<server_id>::<thumb_id>" -> base64 data URL
    _image_cache = {}
    _IMAGE_CACHE_MAX = 300

    # =========================================================================
    # Lifecycle
    # =========================================================================

    async def _main(self):
        decky.logger.info("Museck plugin loaded!")
        self.settings_path = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")
        decky.logger.info(f"Settings path: {self.settings_path}")
        await self._load_settings()

        # A stable client id, generated once, so the server recognises this
        # installation across restarts instead of inventing a new player.
        if not self.settings.get("client_id"):
            self.settings["client_id"] = os.urandom(16).hex()
            await self._save_settings()

        self._resolve_service()

    async def _unload(self):
        # Leaving without a stopped report strands a phantom session on the
        # server, and an orphaned ffplay nobody can control.
        await self.stop()
        decky.logger.info("Museck plugin unloaded!")

    async def _uninstall(self):
        decky.logger.info("Museck plugin uninstalled!")

    # =========================================================================
    # Settings Management
    # =========================================================================

    async def _load_settings(self):
        try:
            if os.path.exists(self.settings_path):
                with open(self.settings_path, "r") as f:
                    loaded = json.load(f)

                # Migrate old flat format
                if "servers" not in loaded:
                    old_url = loaded.get("server_url", "")
                    old_token = loaded.get("token", "")
                    if old_url:
                        server_id = os.urandom(8).hex()
                        self.settings = {
                            "servers": [{
                                "id": server_id,
                                "name": "Plex Server",
                                "type": "plex",
                                "server_url": old_url,
                                "token": old_token,
                            }],
                            "active_server_id": server_id
                        }
                    else:
                        self.settings = {"servers": [], "active_server_id": ""}
                    await self._save_settings()
                    decky.logger.info("Migrated old settings format")
                else:
                    self.settings = loaded

                decky.logger.info("Settings loaded successfully")
            else:
                decky.logger.info("No settings file found, using defaults")
        except Exception as e:
            decky.logger.error(f"Failed to load settings: {e}")

    async def _save_settings(self):
        try:
            os.makedirs(os.path.dirname(self.settings_path), exist_ok=True)
            with open(self.settings_path, "w") as f:
                json.dump(self.settings, f, indent=2)
            decky.logger.info("Settings saved successfully")
            return True
        except Exception as e:
            decky.logger.error(f"Failed to save settings: {e}")
            return False

    def _resolve_service(self):
        """Instantiate the correct service for the active server."""
        self._image_cache.clear()
        active_id = self.settings.get("active_server_id", "")
        for srv in self.settings.get("servers", []):
            if srv.get("id") == active_id:
                cls = SERVICE_CLASSES.get(srv.get("type"))
                if cls:
                    # client_id belongs to the installation, not the server, so
                    # it is layered on here rather than stored per entry.
                    self.current_service = cls({**srv, "client_id": self.settings.get("client_id", "")})
                    decky.logger.info(f"Resolved service: {srv.get('type')} ({srv.get('name')})")
                    return
        self.current_service = None
        decky.logger.info("No active service resolved")

    def _find_server(self, server_id: str) -> dict:
        """Find a server config by ID."""
        for srv in self.settings.get("servers", []):
            if srv.get("id") == server_id:
                return srv
        return None

    # =========================================================================
    # Settings Callable Methods
    # =========================================================================

    async def get_settings(self):
        return {
            "servers": self.settings.get("servers", []),
            "active_server_id": self.settings.get("active_server_id", ""),
            "notify_on_track_change": self.settings.get("notify_on_track_change", True),
            "report_playback": self.settings.get("report_playback", True),
        }

    async def save_preference(self, key: str, value):
        """Save a single preference."""
        self.settings[key] = value
        await self._save_settings()
        return {"success": True}

    @staticmethod
    def _normalize_config(server_config: dict) -> dict:
        """Normalize a server config: ensure the URL carries a protocol prefix."""
        config = dict(server_config)
        url = config.get("server_url", "").strip().rstrip("/")
        if url and not url.startswith("http://") and not url.startswith("https://"):
            url = "http://" + url
        config["server_url"] = url
        return config

    async def save_server(self, server_config: dict):
        """Add or update a server."""
        server_config = self._normalize_config(server_config)

        servers = self.settings.get("servers", [])

        # Generate ID if new
        if not server_config.get("id"):
            server_config["id"] = os.urandom(8).hex()

        # Update existing or append
        existing = None
        for i, srv in enumerate(servers):
            if srv.get("id") == server_config["id"]:
                existing = i
                break

        if existing is not None:
            # Merge so fields the form doesn't submit (Jellyfin/Emby api_key and
            # user_id, obtained during auth) survive an edit.
            old = servers[existing]
            merged = {**old, **server_config}
            identity_changed = any(
                old.get(field) != merged.get(field)
                for field in ("type", "server_url", "username", "password")
            )
            # SoulSync is exempt: its api_key IS the credential the form
            # submits, not an exchanged token, so dropping it here would
            # delete the key the user just typed.
            if identity_changed and merged.get("type") != "soulsync":
                merged.pop("api_key", None)
                merged.pop("user_id", None)
            servers[existing] = merged
            server_config = merged
        else:
            servers.append(server_config)

        self.settings["servers"] = servers

        # If no active server, set this one
        if not self.settings.get("active_server_id"):
            self.settings["active_server_id"] = server_config["id"]

        await self._save_settings()
        self._resolve_service()
        return {"success": True, "id": server_config["id"]}

    async def remove_server(self, server_id: str):
        """Remove a server."""
        self.settings["servers"] = [
            s for s in self.settings.get("servers", []) if s.get("id") != server_id
        ]
        # If removed the active server, switch to first available
        if self.settings.get("active_server_id") == server_id:
            servers = self.settings["servers"]
            self.settings["active_server_id"] = servers[0]["id"] if servers else ""
            # Stop playback when active server removed
            await self.stop()
            self.playback_state["queue"] = []
            self.playback_state["queue_index"] = -1
        await self._save_settings()
        self._resolve_service()
        return {"success": True}

    async def set_active_server(self, server_id: str):
        """Switch the active server."""
        if self.settings.get("active_server_id") != server_id:
            # Stop current playback
            await self.stop()
            self.playback_state["queue"] = []
            self.playback_state["queue_index"] = -1
            self.playback_state["current_track"] = None

            self.settings["active_server_id"] = server_id
            await self._save_settings()
            self._resolve_service()
        return {"success": True}

    async def test_connection(self, server_id: str = None):
        """Test connection to a specific server or the active one."""
        if server_id:
            srv = self._find_server(server_id)
        else:
            srv = self._find_server(self.settings.get("active_server_id", ""))

        if not srv:
            return {"success": False, "message": "No server configured"}

        cls = SERVICE_CLASSES.get(srv.get("type"))
        if not cls:
            return {"success": False, "message": f"Unknown server type: {srv.get('type')}"}

        try:
            service = cls(srv)
            result = await _to_thread(service.test_connection)

            # Persist auto-obtained credentials (Jellyfin/Emby auth exchange)
            if result.get("success"):
                await self._persist_exchanged_credentials(srv, result)

            return result
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    async def _persist_exchanged_credentials(self, srv: dict, result: dict) -> bool:
        """Store credentials a Jellyfin/Emby auth exchange produced.

        Those backends exchange username/password for an access token;
        without persisting it, every fresh service instance exchanges
        again. Returns True when anything changed.
        """
        if not (result.get("api_key") or result.get("user_id")):
            return False
        changed = False
        if result.get("api_key") and srv.get("api_key") != result["api_key"]:
            srv["api_key"] = result["api_key"]
            changed = True
        if result.get("user_id") and srv.get("user_id") != result["user_id"]:
            srv["user_id"] = result["user_id"]
            changed = True
        if changed:
            await self._save_settings()
            self._resolve_service()
            decky.logger.info(f"Saved auth credentials for {srv.get('name')}")
        return changed

    async def test_server_config(self, server_config: dict):
        """Test an unsaved server config without persisting it.

        Lets the form's Test button validate credentials before the user
        commits, instead of writing a possibly-broken server to settings.
        """
        config = self._normalize_config(server_config)
        if not config.get("server_url"):
            return {"success": False, "message": "Server URL is required"}

        cls = SERVICE_CLASSES.get(config.get("type"))
        if not cls:
            return {"success": False, "message": f"Unknown server type: {config.get('type')}"}

        try:
            service = cls(config)
            return await _to_thread(service.test_connection)
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

    async def get_server_status(self, server_id: str = None):
        """Live status for a configured server (default: the active one).

        A fresh service instance is used so polling the status can never
        disturb the live service's playback-report latches.
        """
        if server_id:
            srv = self._find_server(server_id)
        else:
            srv = self._find_server(self.settings.get("active_server_id", ""))

        if not srv:
            return {"success": False, "connected": False, "message": "No server configured"}

        cls = SERVICE_CLASSES.get(srv.get("type"))
        if not cls:
            return {"success": False, "connected": False,
                    "message": f"Unknown server type: {srv.get('type')}"}

        try:
            service = cls({**srv, "client_id": self.settings.get("client_id", "")})
            status = await _to_thread(service.get_server_status)
            # A poll can run the Jellyfin/Emby auth exchange (a fresh
            # instance, no stored token yet): persist what it obtained,
            # like test_connection does, so the next poll reuses it
            # instead of minting a new server session every 10 seconds.
            # The credentials never reach the frontend.
            exchanged = {field: status.pop(field)
                         for field in ("api_key", "user_id") if status.get(field)}
            if exchanged and status.get("connected"):
                await self._persist_exchanged_credentials(srv, exchanged)
            return status
        except Exception as e:
            return {"success": False, "connected": False, "message": f"Status error: {str(e)}"}

    async def get_libraries(self, server_config: dict):
        """List selectable music libraries for a (possibly unsaved) config."""
        config = self._normalize_config(server_config)
        cls = SERVICE_CLASSES.get(config.get("type"))
        if not cls or not config.get("server_url"):
            return {"success": False, "libraries": [], "message": "Server not configured"}
        try:
            service = cls(config)
            libraries = await _to_thread(service.get_libraries)
            return {"success": True, "libraries": libraries}
        except Exception as e:
            decky.logger.error(f"get_libraries error: {e}")
            return {"success": False, "libraries": [], "message": str(e)}

    async def discover_servers(self):
        """Discover servers on local network (Plex, Jellyfin, Emby)."""

        def scan_plex():
            servers = PlexService({"server_url": "", "token": ""}).discover_servers()
            for srv in servers:
                srv["type"] = "plex"
            return servers

        def scan(cls):
            return cls({"server_url": "", "api_key": "", "user_id": ""}).discover_servers()

        async def safe(func, *args):
            try:
                return await _to_thread(func, *args)
            except Exception as e:
                decky.logger.error(f"Discovery scan failed: {e}")
                return []

        # Each scan blocks for ~3s waiting on UDP replies — run them together.
        results = await asyncio.gather(
            safe(scan_plex),
            safe(scan, JellyfinService),
            safe(scan, EmbyService),
        )

        all_servers = []
        seen = set()
        for srv in [s for group in results for s in group]:
            key = srv.get("url") or srv.get("ip")
            if key in seen:
                continue
            seen.add(key)
            all_servers.append(srv)

        return {
            "success": len(all_servers) > 0,
            "servers": all_servers,
            "message": f"Found {len(all_servers)} server(s)" if all_servers else "No servers found"
        }

    # === Legacy compatibility ===
    async def save_settings(self, server_url: str, token: str):
        """Legacy save for old frontend during transition. Saves as Plex server."""
        servers = self.settings.get("servers", [])
        active_id = self.settings.get("active_server_id", "")

        # Find existing active server or create new
        existing = self._find_server(active_id) if active_id else None
        if existing and existing.get("type") == "plex":
            existing["server_url"] = server_url.rstrip("/")
            existing["token"] = token
        else:
            server_id = os.urandom(8).hex()
            servers.append({
                "id": server_id,
                "name": "Plex Server",
                "type": "plex",
                "server_url": server_url.rstrip("/"),
                "token": token,
            })
            self.settings["active_server_id"] = server_id

        self.settings["servers"] = servers
        await self._save_settings()
        self._resolve_service()
        return True

    # =========================================================================
    # Audio Playback
    # =========================================================================

    # Decky's PyInstaller bundle puts its unpacked library dir on
    # LD_LIBRARY_PATH, and a system binary spawned with that env loads
    # the bundle's libraries instead of the system's. When the two
    # disagree the binary dies at startup: every track "plays" for zero
    # seconds and the queue races on in silence. That is issues #2/#5 on
    # Bazzite, and the confirmed cause of #13: the Decky store build had
    # no scrubbing at all, and Decky 3.2.9's rebundle newly ships a
    # libstdc++ capped at GLIBCXX_3.4.30, older than the one SteamOS's
    # ffmpeg stack is built against, so ffplay exits the instant it
    # starts (reproduced against the extracted 3.2.10 bundle).
    @staticmethod
    def _is_bundle_path(entry: str) -> bool:
        """Whether one path entry points inside the PyInstaller bundle."""
        if not entry:
            return False
        bundle = getattr(sys, "_MEIPASS", "") or ""
        if bundle and (entry == bundle or entry.startswith(bundle + os.sep)):
            return True
        # One-file bundles unpack to a temp dir named _MEI plus a random
        # suffix of at least 6 characters (tempfile.mkdtemp's shape). The
        # _MEIPASS check above is the precise one in production; this
        # pattern is only a fallback, and the length floor keeps it from
        # eating real directories that merely start with _MEI.
        return bool(re.search(r"(?:^|/)_MEI[0-9A-Za-z_]{6,}(?:/|$)", entry))

    @classmethod
    def _filter_bundle_entries(cls, value: str, separator: str) -> str:
        """Drop bundle entries from a separated path list.

        Empty entries are preserved: an empty element means "current
        directory" to both the dynamic linker and PATH search, and the
        pre-hardening code restored these values verbatim, so filtering
        must not quietly change the search semantics. Callers treat a
        result with nothing but separators left as an empty value.
        """
        entries = [e for e in value.split(separator)
                   if not cls._is_bundle_path(e)]
        return separator.join(entries)

    @classmethod
    def _build_child_env(cls) -> tuple[dict, list]:
        """Build the environment ffplay and pactl are spawned with.

        The env is built from a whitelist, not scrubbed from the
        inherited one: the plugin process inherits whatever Decky's
        bundle (or the next Decky rebundle) puts in the environment,
        and a scrub list can only remove variables somebody already
        knows about. Starting from nothing and copying only what the
        two consumers need means no bundle variable, known or not, can
        reach a system binary. Bundle entries found anywhere in the
        inherited path-carrying values are counted and returned,
        purely so the caller can log how much the bundle tried to
        hand down.

        Returns (env, bundle_entries_kept_out).
        """
        source = os.environ
        kept_out = []
        env = {}
        # PATH is consulted because pactl is resolved through it. It is
        # copied with bundle entries filtered out: a bundle entry could
        # otherwise shadow a system tool.
        if source.get("PATH"):
            kept_out.extend(
                e for e in source["PATH"].split(":")
                if e and cls._is_bundle_path(e))
            filtered = cls._filter_bundle_entries(source["PATH"], ":")
            if filtered.strip(":"):
                env["PATH"] = filtered
        for key in ("HOME", "USER", "LOGNAME", "LANG", "LC_ALL", "TZ",
                    "XDG_CONFIG_HOME", "PULSE_COOKIE"):
            if source.get(key):
                env[key] = source[key]
        # The one bundle-adjacent value worth restoring is the user's
        # own library path from before Decky started, which PyInstaller
        # stashes under LD_LIBRARY_PATH_ORIG (a custom ffmpeg install
        # may genuinely need it). It is filtered like everything else,
        # and the live LD_LIBRARY_PATH is never copied: on any current
        # Decky that value is the bundle dir itself.
        original_ld = source.get("LD_LIBRARY_PATH_ORIG")
        if original_ld:
            kept_out.extend(
                e for e in original_ld.split(":")
                if e and cls._is_bundle_path(e))
            filtered = cls._filter_bundle_entries(original_ld, ":")
            if filtered.strip(":"):
                env["LD_LIBRARY_PATH"] = filtered
        if source.get("LD_LIBRARY_PATH"):
            kept_out.extend(
                e for e in source["LD_LIBRARY_PATH"].split(":")
                if e and cls._is_bundle_path(e))
        # The remaining bundle-carrying values are never copied, but
        # their bundle entries still count toward the tally: the log
        # line should show everything the bundle tried to hand down,
        # not only what rode in on the consulted values.
        for var in ("SSL_CERT_DIR", "DYLD_LIBRARY_PATH",
                    "DYLD_FALLBACK_LIBRARY_PATH"):
            if source.get(var):
                kept_out.extend(
                    e for e in source[var].split(":")
                    if e and cls._is_bundle_path(e))
        for var in ("SSL_CERT_FILE",):
            if source.get(var) and cls._is_bundle_path(source[var]):
                kept_out.append(source[var])
        if source.get("LD_PRELOAD"):
            kept_out.extend(
                e for e in re.split(r"[:\s]+", source["LD_PRELOAD"])
                if e and cls._is_bundle_path(e))
        return env, kept_out

    # How long a probe verdict may be reused, keyed additionally on the
    # socket file's mtime (a recreated socket re-probes at once). Neither
    # verdict may latch for the life of the plugin: a negative from a
    # transient moment (server mid-restart, a burnt 0.5s timeout under
    # load) would otherwise skip a healthy socket forever, and a positive
    # would keep trusting a socket whose server died. Negatives expire
    # fast; positives last longer so the steady-state pactl calls stay
    # probe-free.
    _PULSE_PROBE_POSITIVE_TTL = 30.0
    _PULSE_PROBE_NEGATIVE_TTL = 2.0

    def _pulse_socket_answers(self, path: str) -> bool:
        """Whether a Pulse socket file exists and takes a connection.

        "Takes a connection" is kernel-level only: connect() completes
        when a listening socket has backlog room, before any Pulse
        handshake. That is enough to rank candidates (a socket whose
        server is gone takes nothing), not a health check of the server
        behind it.
        """
        try:
            st = os.stat(path)
        except OSError:
            return False
        if not stat.S_ISSOCK(st.st_mode):
            return False
        cache = getattr(self, "_pulse_probe_cache", None)
        if cache is None:
            cache = self._pulse_probe_cache = {}
        cached = cache.get(path)
        if cached is not None and cached[0] == st.st_mtime_ns:
            ttl = (self._PULSE_PROBE_POSITIVE_TTL if cached[1]
                   else self._PULSE_PROBE_NEGATIVE_TTL)
            if time.monotonic() - cached[2] < ttl:
                return cached[1]
        answers = False
        probe = None
        try:
            probe = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            probe.settimeout(0.5)
            probe.connect(path)
            answers = True
        except OSError:
            answers = False
        finally:
            if probe is not None:
                probe.close()
        cache[path] = (st.st_mtime_ns, answers, time.monotonic())
        return answers

    def _find_pulse_socket(self) -> str:
        """Pick the Pulse socket to use, preferring one that answers.

        Falls back to the first candidate when none answer. A probe can
        fail for reasons unrelated to playback (a server mid-restart), so
        a failed probe must never leave playback worse off than the old
        pick-the-first-glob-result behaviour. Returns "" when there are
        no candidates at all.
        """
        import glob
        candidates = sorted(glob.glob("/run/user/*/pulse/native"))
        if not candidates:
            return ""
        # This process runs as the session user, so their socket is tried
        # first. A stale socket from another session must not win just
        # because glob happened to list it first.
        own = f"/run/user/{os.getuid()}/pulse/native"
        candidates.sort(key=lambda p: (p != own, p))
        for candidate in candidates:
            if self._pulse_socket_answers(candidate):
                return candidate
        return candidates[0]

    def _get_audio_env(self):
        # Built from a whitelist (see _build_child_env): the inherited
        # env carries Decky's bundle paths, and handing any of them to a
        # system binary makes it load the bundle's libraries and die at
        # startup. What was kept out is kept for play_track's launch log.
        env, kept_out = self._build_child_env()
        self._last_bundle_kept_out = kept_out
        env["SDL_AUDIODRIVER"] = "pulse"

        # Dynamically find the correct Pulse socket for the active user
        # (Decky runs as root, but the audio server runs under the user's UID)
        pulse_socket = self._find_pulse_socket()
        if pulse_socket:
            uid = pulse_socket.split("/")[3]
            env["XDG_RUNTIME_DIR"] = f"/run/user/{uid}"
            env["PULSE_SERVER"] = pulse_socket
            env["PULSE_RUNTIME_PATH"] = f"/run/user/{uid}/pulse"
        else:
            # Fallback to 1000 if not found
            env["XDG_RUNTIME_DIR"] = "/run/user/1000"
            env["PULSE_SERVER"] = "/run/user/1000/pulse/native"
            env["PULSE_RUNTIME_PATH"] = "/run/user/1000/pulse"
        return env

    @staticmethod
    def _find_ffplay() -> str:
        """Locate ffplay, falling back to PATH for non-SteamOS distros."""
        for candidate in ("/usr/bin/ffplay", "/bin/ffplay", "/usr/local/bin/ffplay"):
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                return candidate
        return shutil.which("ffplay") or ""

    async def _report_playback(self, state: str, track: dict = None):
        """Report playback state to the active server, never fatally.

        Reporting is best-effort: a server that is slow or does not support it
        must not interrupt what is actually playing.
        """
        if not self.current_service or not self.settings.get("report_playback", True):
            return
        track = track or self.playback_state.get("current_track")
        if not track or not track.get("ratingKey"):
            return

        position_ms = int(max(0, self.playback_state.get("position") or 0) * 1000)
        duration_ms = int(track.get("duration") or 0)
        self._last_report = time.time()
        try:
            await _to_thread(
                self.current_service.report_playback,
                track["ratingKey"], state, position_ms, duration_ms,
            )
        except Exception as e:
            decky.logger.error(f"Playback report ({state}) failed: {e}")

    # Stream URLs carry credentials in their query strings (Plex tokens,
    # Subsonic auth, the SoulSync API key — a full admin credential), and
    # ffplay error lines quote the input URL. The log tail is surfaced in
    # the UI error and the plugin log, so secret parameter values are
    # scrubbed before it leaves this method.
    _LOG_SECRET_RE = re.compile(r"(?i)\b(api_key|api-key|x-plex-token|token)=[^&\s\"']+")

    def _read_ffplay_log(self, max_lines: int = 10) -> str:
        try:
            log_path = os.path.join(decky.DECKY_PLUGIN_LOG_DIR, "ffplay.log")
            with open(log_path, "r") as f:
                tail = "".join(f.readlines()[-max_lines:]).strip()
            return self._LOG_SECRET_RE.sub(r"\1=***", tail)
        except Exception:
            return ""

    async def _handle_playback_failure(self, reason: str):
        """Count a failed track, and stop auto-advancing after three in a row.

        Without the cutoff a track that can't play makes the queue race to the
        end. The reason is stored so the UI can say why, rather than leaving
        the user watching tracks flick past in silence.
        """
        log_tail = self._read_ffplay_log()
        self._consecutive_failures += 1
        decky.logger.warning(f"{reason} (consecutive failures: {self._consecutive_failures})")
        if log_tail:
            decky.logger.error(f"ffplay log: {log_tail}")

        if self._consecutive_failures >= 3:
            self._consecutive_failures = 0
            detail = log_tail.splitlines()[-1].strip() if log_tail else ""
            self.playback_state["last_error"] = (
                f"Playback failed: {detail[:160]}" if detail
                else "Playback failed: the player exited immediately."
            )
            decky.logger.warning("Stopping auto-advance: 3 consecutive playback failures")
            return
        await self._auto_next()

    async def _delayed_volume_set(self, pid: int, volume: int):
        for _ in range(10):
            await asyncio.sleep(0.2)
            if self.player_process and self.player_process.pid == pid:
                index = await self._get_sink_input_index(pid)
                if index:
                    await self._set_volume_runtime(pid, volume)
                    return
        decky.logger.warning(f"Timed out waiting for PulseAudio stream for PID {pid}")

    async def play_track(self, track_key: str, track_info: dict = None):
        """Play a track using the active service's stream URL."""
        if not self.current_service:
            return {"success": False, "message": "No server configured"}

        # Build stream URL via service
        stream_url = self.current_service.get_stream_url(track_key)
        decky.logger.info(f"Playing stream: {track_key}")

        # Fetch album art. Copy first — track_info is usually a live queue entry,
        # and embedding base64 art into it bloats the queue as tracks play.
        if track_info:
            track_info = dict(track_info)
            thumb_path = track_info.get('thumb', '')
            if thumb_path and not thumb_path.startswith('data:'):
                base64_thumb = await _to_thread(self._fetch_image_as_base64, thumb_path)
                if base64_thumb:
                    track_info['thumb'] = base64_thumb
                    track_info['parentThumb'] = base64_thumb

        # Kill existing player
        await self.stop()

        ffplay = self._find_ffplay()
        if not ffplay:
            message = "ffplay not found — install ffmpeg to play audio"
            decky.logger.error(message)
            self.playback_state["last_error"] = message
            return {"success": False, "message": message}

        try:
            log_path = os.path.join(decky.DECKY_PLUGIN_LOG_DIR, "ffplay.log")
            env = self._get_audio_env()

            # Record the launch context ffplay actually gets. When a track
            # dies instantly this line plus the ffplay.log tail say which
            # leg failed (wrong socket, a bundle path the whitelist let
            # through, a missing binary) instead of just that it failed.
            # The stream URL is never logged: it carries the server token.
            kept_out = len(getattr(self, "_last_bundle_kept_out", []))
            decky.logger.info(
                f"Launching {ffplay} with PULSE_SERVER={env.get('PULSE_SERVER')} "
                f"XDG_RUNTIME_DIR={env.get('XDG_RUNTIME_DIR')} "
                f"LD_LIBRARY_PATH={'set' if env.get('LD_LIBRARY_PATH') else 'unset'}"
                + (f" bundle_entries_kept_out={kept_out}" if kept_out else ""))

            ffplay_args = [ffplay, "-nodisp", "-autoexit", "-loglevel", "warning"]
            if stream_url.startswith(("http://", "https://")):
                # Identify as Museck, not ffplay's default Lavf agent:
                # a server (or its WAF) that accepts Museck's API calls
                # can still reject the stream fetch otherwise, the same
                # split as issue #11. HTTP inputs only: ffplay warns
                # "Option user_agent not found" for other inputs, and
                # that warning would sit in ffplay.log where a later
                # failure's reason is read from.
                ffplay_args += ["-user_agent", USER_AGENT]
            ffplay_args.append(stream_url)

            # ffplay inherits a dup of the fd, so the parent's handle can close
            # as soon as the process is spawned.
            with open(log_path, "w") as log_file:
                self.player_process = subprocess.Popen(
                    ffplay_args, stdout=subprocess.DEVNULL, stderr=log_file, env=env)

            self.player_paused = False
            self.playback_start_time = time.time()
            self.total_paused_time = 0
            self.pause_start_time = None
            self.playback_state["is_playing"] = True
            self.playback_state["current_track"] = track_info
            self.playback_state["position"] = 0
            self.playback_state["duration"] = (track_info.get("duration", 0) / 1000) if track_info else 0

            # Verify ffplay actually started and didn't immediately exit
            await asyncio.sleep(0.5)
            if self.player_process.poll() is not None:
                exit_code = self.player_process.returncode
                self.player_process = None
                self.playback_state["is_playing"] = False
                await self._handle_playback_failure(
                    f"ffplay exited immediately with code {exit_code} for stream: {track_key}"
                )
                return {"success": False, "message": f"ffplay exited immediately (code {exit_code})"}

            self.playback_state["last_error"] = None
            await self._report_playback("playing")

            asyncio.create_task(self._delayed_volume_set(self.player_process.pid, self.playback_state["volume"]))

            decky.logger.info(f"ffplay started with PID: {self.player_process.pid}")
            return {"success": True, "message": "Playing"}

        except Exception as e:
            decky.logger.error(f"Failed to start ffplay: {e}")
            return {"success": False, "message": str(e)}

    async def pause(self):
        if self.player_process and self.player_process.poll() is None:
            try:
                self.player_process.send_signal(signal.SIGSTOP)
                self.player_paused = True
                self.pause_start_time = time.time()
                self.playback_state["is_playing"] = False
                await self._report_playback("paused")
            except Exception as e:
                decky.logger.error(f"Pause error: {e}")
        return {"success": True}

    async def resume(self):
        if self.player_process and self.player_process.poll() is None:
            try:
                self.player_process.send_signal(signal.SIGCONT)
                self.player_paused = False
                if self.pause_start_time:
                    self.total_paused_time += time.time() - self.pause_start_time
                    self.pause_start_time = None
                self.playback_state["is_playing"] = True
                await self._report_playback("playing")
            except Exception as e:
                decky.logger.error(f"Resume error: {e}")
        return {"success": True}

    async def toggle_play_pause(self):
        # Nothing running (queue finished, or playback was stopped) — restart the
        # track at the current queue position instead of silently doing nothing.
        if not self.player_process or self.player_process.poll() is not None:
            queue = self.playback_state["queue"]
            index = self.playback_state["queue_index"]
            if 0 <= index < len(queue):
                self._consecutive_failures = 0
                track = queue[index]
                return await self.play_track(track.get("key"), track)
            return {"success": False, "message": "Nothing to play"}

        if self.player_paused:
            return await self.resume()
        return await self.pause()

    async def stop(self):
        # Report before clearing, while the track is still known
        if self.playback_state.get("current_track"):
            await self._report_playback("stopped")
        if self.player_process:
            try:
                # A SIGSTOPped process never handles SIGTERM, so terminating a
                # paused track would always fall through to the 2s timeout —
                # resume it first, then wait off the event loop.
                if self.player_paused:
                    self.player_process.send_signal(signal.SIGCONT)
                self.player_process.terminate()
                await _to_thread(self.player_process.wait, 2)
            except Exception:
                try:
                    self.player_process.kill()
                except Exception:
                    pass
            self.player_process = None
        self.player_paused = False
        self.playback_state["is_playing"] = False
        self.playback_state["current_track"] = None
        self.playback_state["position"] = 0
        return {"success": True}

    async def set_volume(self, volume: int):
        volume = max(0, min(100, volume))
        self.playback_state["volume"] = volume
        if self.player_process and self.playback_state["is_playing"]:
            await self._set_volume_runtime(self.player_process.pid, volume)
        return {"success": True, "volume": volume}

    # =========================================================================
    # PulseAudio Helpers
    # =========================================================================

    async def _get_sink_input_index(self, pid: int):
        try:
            process = await asyncio.create_subprocess_exec(
                "pactl", "list", "sink-inputs",
                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                env=self._get_audio_env()
            )
            stdout, stderr = await process.communicate()
            if process.returncode != 0:
                return None

            output = stdout.decode()
            inputs = output.split("Sink Input #")

            for item in inputs:
                if not item.strip():
                    continue
                lines = item.split('\n')
                input_id = lines[0].strip()
                if f'application.process.id = "{pid}"' in item:
                    return input_id

            for item in inputs:
                if not item.strip():
                    continue
                lines = item.split('\n')
                input_id = lines[0].strip()
                if 'application.name = "ffplay"' in item:
                    return input_id

            return None
        except Exception:
            return None

    async def _set_volume_runtime(self, pid: int, volume: int):
        try:
            index = await self._get_sink_input_index(pid)
            if index:
                process = await asyncio.create_subprocess_exec(
                    "pactl", "set-sink-input-volume", index, f"{volume}%",
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                    env=self._get_audio_env()
                )
                await process.wait()
        except Exception as e:
            decky.logger.error(f"Error setting volume: {e}")

    # =========================================================================
    # Playback Status & Auto-Next
    # =========================================================================

    async def get_playback_status(self):
        if self.player_process:
            poll = self.player_process.poll()
            if poll is not None:
                elapsed = time.time() - self.playback_start_time if self.playback_start_time else 0
                # A clean exit after most of the track is a completion, not a
                # failure — clamp the threshold so genuinely short tracks
                # (interludes, skits) don't trip the circuit breaker.
                duration = self.playback_state.get("duration") or 0
                min_playtime = min(3.0, max(duration - 0.5, 0)) if duration else 3.0
                is_failure = poll != 0 or elapsed < min_playtime

                self.player_process = None
                self.playback_state["is_playing"] = False

                if is_failure:
                    await self._handle_playback_failure(
                        f"Track playback failed: exit code={poll}, elapsed={elapsed:.1f}s"
                    )
                else:
                    self._consecutive_failures = 0
                    await self._auto_next()

        if self.playback_start_time and self.playback_state["is_playing"]:
            elapsed = time.time() - self.playback_start_time - self.total_paused_time
            self.playback_state["position"] = min(elapsed, self.playback_state["duration"])
        elif self.playback_start_time and self.player_paused:
            current_pause = time.time() - self.pause_start_time if self.pause_start_time else 0
            elapsed = time.time() - self.playback_start_time - self.total_paused_time - current_pause
            self.playback_state["position"] = min(elapsed, self.playback_state["duration"])

        # Keep the server's session alive while a track plays. This poll is
        # already running once a second, so no extra timer is needed.
        if (self.playback_state["is_playing"]
                and time.time() - self._last_report >= PLAYBACK_REPORT_INTERVAL):
            await self._report_playback("playing")

        # Polled once a second — send queue metadata rather than the whole
        # queue, which for a large playlist is a lot of JSON per tick.
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        state = {k: v for k, v in self.playback_state.items() if k != "queue"}
        state["queue_length"] = len(queue)
        state["queue_preview"] = [
            {
                "ratingKey": t.get("ratingKey"),
                "title": t.get("title", "Unknown"),
                "artist": t.get("artist", "Unknown"),
            }
            for t in (queue[index + 1:index + 6] if index >= 0 else [])
        ]
        return state

    async def _auto_next(self):
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        loop_mode = self.playback_state["loop"]

        if loop_mode == "single" and 0 <= index < len(queue):
            track = queue[index]
            await self.play_track(track.get("key"), track)
        elif index < len(queue) - 1:
            self.playback_state["queue_index"] = index + 1
            track = queue[index + 1]
            await self.play_track(track.get("key"), track)
        elif loop_mode == "queue" and len(queue) > 0:
            self.playback_state["queue_index"] = 0
            track = queue[0]
            await self.play_track(track.get("key"), track)
        elif self.playback_state.get("current_track"):
            # Nothing follows: the finished track is never closed out by a
            # next track's play_track -> stop(), so report its end here.
            # Backends that latch per play (scrobbles, sessions) treat this
            # as the track's one stopped report; a later manual stop()
            # re-reporting the same end is a no-op for them.
            await self._report_playback("stopped")

    # =========================================================================
    # Queue Management
    # =========================================================================

    async def _play_collection(self, fetch, label: str):
        """Load a collection and start it, without routing it via the UI.

        The frontend used to fetch every track, then send the whole list back
        to be queued. For a large playlist that is megabytes across the bridge
        twice, for data the backend already had.
        """
        if not self.current_service:
            return {"success": False, "message": "No server configured"}
        try:
            tracks = await _to_thread(fetch)
        except Exception as e:
            decky.logger.error(f"Failed to load {label}: {e}")
            return {"success": False, "message": f"Could not load this {label}"}

        if not tracks:
            return {"success": False, "message": f"No playable tracks in this {label}"}

        result = await self.set_queue(tracks, 0)
        result["count"] = len(tracks)
        result["truncated"] = len(tracks) >= MAX_QUEUE_TRACKS
        if result["truncated"]:
            decky.logger.warning(f"{label} truncated to {MAX_QUEUE_TRACKS} tracks")
        return result

    async def get_genres(self):
        if not self.current_service:
            return {"success": False, "genres": []}
        try:
            return {"success": True, "genres": await _to_thread(self.current_service.get_genres)}
        except Exception as e:
            decky.logger.error(f"get_genres error: {e}")
            return {"success": False, "genres": []}

    async def play_genre(self, genre_key: str):
        """Shuffle a genre.

        A genre is a bucket rather than a running order, so it starts shuffled;
        the toggle is set too, so the panel reflects what is happening.
        """
        self.playback_state["shuffle"] = True
        return await self._play_collection(
            lambda: self.current_service.get_genre_tracks(genre_key), "genre")

    async def play_playlist(self, playlist_key: str):
        return await self._play_collection(
            lambda: self.current_service.get_playlist_tracks(playlist_key), "playlist")

    async def play_album(self, album_key: str):
        return await self._play_collection(
            lambda: self.current_service.get_album_tracks(album_key), "album")

    async def play_artist(self, artist_key: str):
        return await self._play_collection(
            lambda: self.current_service.get_artist_tracks(artist_key), "artist")

    async def set_queue(self, tracks: list, start_index: int = 0):
        tracks = list(tracks or [])[:MAX_QUEUE_TRACKS]
        if not tracks or not (0 <= start_index < len(tracks)):
            return {"success": False, "message": "Invalid queue or index"}

        self._consecutive_failures = 0
        self.original_queue = tracks.copy()

        # Honour the shuffle toggle for newly loaded queues, otherwise turning
        # shuffle on and then picking a playlist plays it in order.
        if self.playback_state["shuffle"] and len(tracks) > 1:
            start_track = tracks[start_index]
            rest = [t for i, t in enumerate(tracks) if i != start_index]
            random.shuffle(rest)
            tracks = [start_track] + rest
            start_index = 0

        self.playback_state["queue"] = tracks
        self.playback_state["queue_index"] = start_index
        track = tracks[start_index]
        return await self.play_track(track.get("key"), track)

    async def next_track(self):
        self._consecutive_failures = 0
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        if index < len(queue) - 1:
            self.playback_state["queue_index"] = index + 1
            track = queue[index + 1]
            return await self.play_track(track.get("key"), track)
        return {"success": False, "message": "End of queue"}

    async def previous_track(self):
        self._consecutive_failures = 0
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        if index > 0:
            self.playback_state["queue_index"] = index - 1
            track = queue[index - 1]
            return await self.play_track(track.get("key"), track)
        elif index == 0 and len(queue) > 0:
            track = queue[0]
            return await self.play_track(track.get("key"), track)
        return {"success": False, "message": "Start of queue"}

    async def play_queue_index(self, index: int):
        self._consecutive_failures = 0
        queue = self.playback_state["queue"]
        if 0 <= index < len(queue):
            self.playback_state["queue_index"] = index
            track = queue[index]
            return await self.play_track(track.get("key"), track)
        return {"success": False, "message": "Invalid queue index"}

    def _queue_slice_with_images(self, start_index: int, end_index: int) -> list:
        queue = self.playback_state["queue"]
        tracks_slice = []
        for i in range(start_index, end_index):
            if i < len(queue):
                track = queue[i].copy()
                thumb_path = track.get("thumb", "")
                if thumb_path and not thumb_path.startswith("data:"):
                    base64_img = self._fetch_image_as_base64(thumb_path)
                    if base64_img:
                        track["thumb"] = base64_img
                        track["parentThumb"] = base64_img
                tracks_slice.append(track)
        return tracks_slice

    async def get_queue_with_images(self, start_index: int = 0, count: int = 20):
        queue = self.playback_state["queue"]
        current_index = self.playback_state["queue_index"]
        start_index = max(0, start_index)
        end_index = min(start_index + count, len(queue))
        tracks_slice = await _to_thread(self._queue_slice_with_images, start_index, end_index)

        return {
            "success": True,
            "tracks": tracks_slice,
            "total": len(queue),
            "current_index": current_index
        }

    async def toggle_shuffle(self):
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        current_track = queue[index] if 0 <= index < len(queue) else None

        if self.playback_state["shuffle"]:
            self.playback_state["shuffle"] = False
            if self.original_queue:
                restored = self.original_queue.copy()
                self.playback_state["queue"] = restored
                # Identity match first: shallow copies share track objects, so
                # this stays correct when a playlist repeats the same track.
                if current_track is not None:
                    for i, t in enumerate(restored):
                        if t is current_track:
                            self.playback_state["queue_index"] = i
                            break
                    else:
                        for i, t in enumerate(restored):
                            if t.get("ratingKey") == current_track.get("ratingKey"):
                                self.playback_state["queue_index"] = i
                                break
        else:
            self.playback_state["shuffle"] = True
            self.original_queue = queue.copy()
            if current_track is not None and len(queue) > 1:
                other_tracks = [t for i, t in enumerate(queue) if i != index]
                random.shuffle(other_tracks)
                self.playback_state["queue"] = [current_track] + other_tracks
                self.playback_state["queue_index"] = 0

        return {"success": True, "shuffle": self.playback_state["shuffle"]}

    async def toggle_loop(self):
        current = self.playback_state["loop"]
        if current == "off":
            self.playback_state["loop"] = "queue"
        elif current == "queue":
            self.playback_state["loop"] = "single"
        else:
            self.playback_state["loop"] = "off"
        return {"success": True, "loop": self.playback_state["loop"]}

    # =========================================================================
    # Music API Methods (delegate to service)
    # =========================================================================

    def _hydrate_thumbs(self, items: list, limit: int) -> list:
        """Replace thumb IDs with base64 data URLs for the first `limit` items."""
        for item in items[:limit]:
            thumb = item.get("thumb", "")
            if not thumb or thumb.startswith("data:"):
                continue
            img = self._fetch_image_as_base64(thumb)
            # Keep the original ID on failure so it can be retried later —
            # overwriting with "" loses the reference permanently.
            if img:
                item["thumb"] = img
                if "parentThumb" in item:
                    item["parentThumb"] = img
        return items

    async def get_playlists(self):
        if not self.current_service:
            return {"success": False, "playlists": []}

        def run():
            # Hydrate covers so the list can show real art instead of a
            # placeholder icon; repeat calls come from the image cache.
            return self._hydrate_thumbs(self.current_service.get_playlists(), 25)

        try:
            return {"success": True, "playlists": await _to_thread(run)}
        except Exception as e:
            decky.logger.error(f"get_playlists error: {e}")
            return {"success": False, "playlists": []}

    async def get_playlist_tracks(self, playlist_key: str):
        if not self.current_service:
            return {"success": False, "tracks": []}
        try:
            tracks = await _to_thread(self.current_service.get_playlist_tracks, playlist_key)
            return {"success": True, "tracks": tracks}
        except Exception as e:
            decky.logger.error(f"get_playlist_tracks error: {e}")
            return {"success": False, "tracks": []}

    async def search(self, query: str):
        if not self.current_service:
            return {"success": False, "results": []}

        def run():
            return self._hydrate_thumbs(self.current_service.search_tracks(query), 10)

        try:
            return {"success": True, "results": await _to_thread(run)}
        except Exception as e:
            decky.logger.error(f"search error: {e}")
            return {"success": False, "results": []}

    async def search_albums(self, query: str):
        if not self.current_service:
            return {"success": False, "albums": []}

        def run():
            return self._hydrate_thumbs(self.current_service.search_albums(query), 10)

        try:
            return {"success": True, "albums": await _to_thread(run)}
        except Exception as e:
            decky.logger.error(f"search_albums error: {e}")
            return {"success": False, "albums": []}

    async def search_artists(self, query: str):
        if not self.current_service:
            return {"success": False, "artists": []}

        def run():
            return self._hydrate_thumbs(self.current_service.search_artists(query), 5)

        try:
            return {"success": True, "artists": await _to_thread(run)}
        except Exception as e:
            decky.logger.error(f"search_artists error: {e}")
            return {"success": False, "artists": []}

    async def get_album_tracks(self, album_key: str):
        if not self.current_service:
            return {"success": False, "tracks": []}
        try:
            tracks = await _to_thread(self.current_service.get_album_tracks, album_key)
            return {"success": True, "tracks": tracks}
        except Exception as e:
            decky.logger.error(f"get_album_tracks error: {e}")
            return {"success": False, "tracks": []}

    async def get_artist_tracks(self, artist_key: str):
        if not self.current_service:
            return {"success": False, "tracks": []}

        def run():
            return self._hydrate_thumbs(self.current_service.get_artist_tracks(artist_key), 20)

        try:
            return {"success": True, "tracks": await _to_thread(run)}
        except Exception as e:
            decky.logger.error(f"get_artist_tracks error: {e}")
            return {"success": False, "tracks": []}

    # =========================================================================
    # Image Fetching (generic — service builds the URL)
    # =========================================================================

    def _fetch_image_as_base64(self, thumb_id: str) -> str:
        """Fetch image via the active service and return as base64 data URL.

        Results are cached — the queue view re-requests the same artwork on
        every refresh, and each miss is a round trip to the media server.
        """
        if not thumb_id or not self.current_service:
            return ""

        cache_key = f"{self.settings.get('active_server_id', '')}::{thumb_id}"
        cached = self._image_cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            url = self.current_service.get_image_url(thumb_id)
            if not url:
                return ""

            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
                image_data = response.read()
                content_type = response.headers.get('Content-Type', 'image/jpeg')
                b64_data = base64.b64encode(image_data).decode('utf-8')
                data_url = f"data:{content_type};base64,{b64_data}"

            if len(self._image_cache) >= self._IMAGE_CACHE_MAX:
                self._image_cache.pop(next(iter(self._image_cache)), None)
            self._image_cache[cache_key] = data_url
            return data_url
        except Exception as e:
            decky.logger.error(f"Failed to fetch image: {e}")
            return ""
