"""A fake SoulSync server for Museck's tests.

Implements the exact HTTP contracts Museck's SoulSyncService relies on,
with payload shapes copied from SoulSync's real API v1 serializers and
web routes (envelope, field names, duration in ms, no artwork on track
payloads). Runs in-process so tests can flip failure flags and inspect
what Museck actually sent.

Also serves a minimal Subsonic /rest/ping so the generic live-status
path can be regression-tested against a second backend.
"""

import io
import json
import math
import struct
import threading
import urllib.parse
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

API_KEY = "sk_test123"

ARTISTS = {
    11: {"id": 11, "name": "The Testers", "thumb_url": "https://cdn.example.com/testers.jpg"},
    12: {"id": 12, "name": "Second Artist", "thumb_url": ""},
}

ALBUMS = {
    101: {"id": 101, "artist_id": 11, "title": "Rock Album", "year": 2020,
          "thumb_url": "https://cdn.example.com/art-rock.jpg", "genres": ["Rock"]},
    102: {"id": 102, "artist_id": 11, "title": "Jazz Album", "year": 2021,
          "thumb_url": "http://192.168.1.50:32400/library/metadata/99/thumb/123",
          "genres": ["Jazz"]},
    103: {"id": 103, "artist_id": 12, "title": "Quiet Ballads", "year": 2019,
          "thumb_url": "/api/image-cache/abc123", "genres": ["rock", "Pop"]},
}

# Track rows carry the joined names, like the search DB query returns.
TRACKS = {
    1001: {"id": 1001, "album_id": 101, "artist_id": 11, "title": "Song One",
           "track_number": 1, "duration": 200000,
           "file_path": "/music/Testers/Rock Album/01 - Song One.flac",
           "artist_name": "The Testers", "album_title": "Rock Album"},
    1002: {"id": 1002, "album_id": 101, "artist_id": 11, "title": "Song Two",
           "track_number": 2, "duration": 180000,
           "file_path": "/music/Testers/Rock Album/02 - Song Two.flac",
           "artist_name": "The Testers", "album_title": "Rock Album"},
    1003: {"id": 1003, "album_id": 102, "artist_id": 11, "title": "Jazz Hands",
           "track_number": 1, "duration": 240000,
           "file_path": "/music/Testers/Jazz Album/01 - Jazz Händs.flac",
           "artist_name": "The Testers", "album_title": "Jazz Album"},
    1004: {"id": 1004, "album_id": 103, "artist_id": 12, "title": "Ballad of Tests",
           "track_number": 1, "duration": 60000,
           "file_path": "/music/Second/Quiet Ballads/01 - Ballad of Tests.wav",
           "artist_name": "Second Artist", "album_title": "Quiet Ballads"},
    1005: {"id": 1005, "album_id": 101, "artist_id": 11, "title": "Ghost Track",
           "track_number": 3, "duration": 100000, "file_path": "",
           "artist_name": "The Testers", "album_title": "Rock Album"},
}

CURATED_PLAYLISTS = {
    1: {"id": 1, "name": "Curated Mix", "track_count": 3, "tracks": [1001, 1005, 1002]},
    9: {"id": 9, "name": "Short Set", "track_count": 1, "tracks": [1004]},
}
MIRRORED_PLAYLISTS = {
    7: {"id": 7, "name": "Mirrored Mix", "track_count": 1,
        "cover_url": "https://cdn.example.com/mirror-cover.jpg", "tracks": [1003]},
}

# Real serve-time per file path: the stream serves this many seconds of
# audio regardless of the (metadata) duration above.
STREAM_SECONDS = {TRACKS[1004]["file_path"]: 5}
DEFAULT_STREAM_SECONDS = 3

JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"fake-jpeg-payload" + b"\xff\xd9"

STATE = {
    "log_play": [],          # parsed JSON bodies of accepted log-play POSTs
    "stream_requests": [],   # query dicts of /stream/library-audio hits
    "proxy_requests": [],    # inner urls requested via /api/image-proxy
    "fail": set(),           # routes to force a 500 on: status, activity, stats,
                             # mirrored (list), albums_page (albums list, page > 1)
    "logplay_failures_left": 0,
    "jellyfin_auth_count": 0,
}


def reset_state():
    STATE["log_play"] = []
    STATE["stream_requests"] = []
    STATE["proxy_requests"] = []
    STATE["fail"] = set()
    STATE["logplay_failures_left"] = 0
    STATE["jellyfin_auth_count"] = 0


def _wav_bytes(seconds: int) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(44100)
        frames = b"".join(
            struct.pack("<h", int(8000 * math.sin(2 * math.pi * 440 * i / 44100)))
            for i in range(44100 * seconds)
        )
        w.writeframes(frames)
    return buf.getvalue()


WAV_CACHE = {}


def _envelope(data, status=200):
    return status, {"success": True, "data": data, "error": None, "pagination": None}


def _error(code, message, status):
    return status, {"success": False, "data": None,
                    "error": {"code": code, "message": message}, "pagination": None}


def _album_tracks(album_id):
    """Album track rows like the real DB join: artist_name, no album_title."""
    rows = []
    for t in TRACKS.values():
        if t["album_id"] == album_id:
            row = dict(t)
            row.pop("album_title", None)
            row.pop("album_thumb_url", None)
            rows.append(row)
    return sorted(rows, key=lambda r: r["track_number"])


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *args):
        pass

    # -- plumbing ------------------------------------------------------
    def _send(self, status, body, content_type="application/json"):
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _v1_authed(self, query):
        if self.headers.get("Authorization") == f"Bearer {API_KEY}":
            return True
        return query.get("api_key", [""])[0] == API_KEY

    def _key_authed(self, query):
        return query.get("api_key", [""])[0] == API_KEY

    # -- routes ----------------------------------------------------------
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        try:
            if path.startswith("/api/v1/"):
                if not self._v1_authed(query):
                    # The real require_api_key: 401 when no key is
                    # presented, 403 when one is presented and wrong.
                    presented = (self.headers.get("Authorization")
                                 or query.get("api_key", [""])[0])
                    if presented:
                        return self._send(*_error("FORBIDDEN", "Invalid API key", 403))
                    return self._send(*_error("UNAUTHORIZED", "API key required", 401))
                return self._v1(path[len("/api/v1"):], query)
            if path == "/System/Info/Public":
                # Jellyfin/Emby public info, for the status tests.
                return self._send(200, {
                    "ServerName": "Stubfin", "Version": "10.9.0",
                    "ProductName": "Jellyfin Server", "Id": "srv1",
                })
            if path == "/status":
                if not self._key_authed(query):
                    return self._send(401, {"error": "unauthorized"})
                if "status" in STATE["fail"]:
                    return self._send(500, {"error": "boom"})
                return self._send(200, {
                    "metadata_source": "spotify",
                    "spotify": {"connected": True},
                    "media_server": {"connected": True, "response_time": 42, "type": "plex"},
                    "soulseek": {"connected": True, "response_time": 88, "source": "soulseek"},
                    "active_media_server": "plex",
                    "enrichment": {},
                    "active_downloads": 1,
                })
            if path == "/api/server-activity":
                if not self._key_authed(query):
                    return self._send(401, {"error": "unauthorized"})
                if "activity" in STATE["fail"]:
                    return self._send(500, {"error": "boom"})
                return self._send(200, {
                    "ok": True, "reason": None, "message": "",
                    "server": {"name": "Plex", "version": "1.32.5"},
                    "summary": {"streams": 1, "transcodes": 0,
                                "total_bandwidth_kbps": 320, "wan": False},
                    "sessions": [{
                        "user": "boulder", "title": "Song One",
                        "subtitle": "The Testers", "state": "playing",
                        "media_type": "track", "progress_pct": 55,
                        "duration_ms": 200000, "offset_ms": 110000,
                    }],
                })
            if path == "/stream/library-audio":
                return self._stream(query)
            if path == "/api/image-proxy":
                if not self._key_authed(query):
                    return self._send(401, b"", "text/plain")
                inner = query.get("url", [""])[0]
                if not inner.startswith("http"):
                    return self._send(400, b"", "text/plain")
                STATE["proxy_requests"].append(inner)
                return self._send(200, JPEG_BYTES, "image/jpeg")
            if path.startswith("/api/image-cache/"):
                if not self._key_authed(query):
                    return self._send(401, b"", "text/plain")
                return self._send(200, JPEG_BYTES, "image/jpeg")
            if path == "/rest/ping":
                return self._send(200, {"subsonic-response": {
                    "status": "ok", "version": "1.16.1",
                    "type": "navidrome", "serverVersion": "0.49.0"}})
            return self._send(404, {"error": "not found"})
        except BrokenPipeError:
            pass

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        if parsed.path == "/Users/AuthenticateByName":
            STATE["jellyfin_auth_count"] += 1
            return self._send(200, {
                "AccessToken": "stub-token-1",
                "User": {"Id": "user-9", "Name": "deck"},
            })
        if parsed.path == "/api/library/log-play":
            if not self._key_authed(query):
                return self._send(401, {"success": False})
            if STATE["logplay_failures_left"] > 0:
                STATE["logplay_failures_left"] -= 1
                return self._send(500, {"success": False, "error": "boom"})
            try:
                STATE["log_play"].append(json.loads(raw.decode("utf-8")))
            except Exception:
                return self._send(400, {"success": False})
            return self._send(200, {"success": True})
        return self._send(404, {"error": "not found"})

    # -- v1 library ------------------------------------------------------
    def _v1(self, path, query):
        if path == "/system/status":
            return self._send(*_envelope({
                "uptime": "2h 3m 4s", "uptime_seconds": 7384,
                "services": {"spotify": True, "soulseek": True, "hydrabase": False},
            }))
        if path == "/system/stats":
            if "stats" in STATE["fail"]:
                return self._send(500, {"error": "boom"})
            return self._send(*_envelope({
                "library": {"artists": 2, "albums": 3, "tracks": 5},
                "database": {"size_mb": 12.5, "last_update": "2026-10-19T00:00:00"},
                "downloads": {"active": 2},
            }))
        if path == "/library/playlists":
            out = [{"id": p["id"], "name": p["name"], "track_count": p["track_count"]}
                   for p in CURATED_PLAYLISTS.values()]
            return self._send(*_envelope({"playlists": out}))
        if path.startswith("/library/playlists/") and path.endswith("/tracks"):
            pid = int(path.split("/")[3])
            # Real curated rows come from a plain tracks SELECT: the
            # payload joins NEITHER artist_name NOR album_title.
            tracks = [{k: v for k, v in TRACKS[i].items()
                       if k not in ("artist_name", "album_title")}
                      for i in CURATED_PLAYLISTS[pid]["tracks"]]
            return self._send(*_envelope({"tracks": tracks}))
        if path == "/library/mirrored-playlists":
            if "mirrored" in STATE["fail"]:
                return self._send(500, {"error": "boom"})
            out = [{"id": p["id"], "name": p["name"], "track_count": p["track_count"],
                    "cover_url": p["cover_url"]} for p in MIRRORED_PLAYLISTS.values()]
            return self._send(*_envelope({"playlists": out}))
        if path.startswith("/library/mirrored-playlists/") and path.endswith("/tracks"):
            pid = int(path.split("/")[3])
            # Real mirrored resolvers join artist_name only: the payload
            # never carries album_title.
            tracks = [{k: v for k, v in TRACKS[i].items() if k != "album_title"}
                      for i in MIRRORED_PLAYLISTS[pid]["tracks"]]
            return self._send(*_envelope({"tracks": tracks}))
        if path == "/library/tracks":
            title = query.get("title", [""])[0]
            artist = query.get("artist", [""])[0]
            if not title and not artist:
                return self._send(*_error(
                    "BAD_REQUEST", "At least one of 'title' or 'artist' is required.", 400))
            out = []
            for t in TRACKS.values():
                if title and title.lower() in t["title"].lower():
                    out.append(t)
                elif artist and artist.lower() in t["artist_name"].lower():
                    out.append(t)
            limit = int(query.get("limit", ["50"])[0])
            return self._send(*_envelope({"tracks": out[:limit], "count": len(out)}))
        if path.startswith("/library/tracks/"):
            tid = int(path.split("/")[3])
            track = TRACKS.get(tid)
            if not track:
                return self._send(*_error("NOT_FOUND", "Track not found.", 404))
            return self._send(*_envelope({"track": track}))
        if path == "/library/albums":
            search = query.get("search", [""])[0]
            albums = list(ALBUMS.values())
            if search:
                albums = [a for a in albums if search.lower() in a["title"].lower()]
            limit = int(query.get("limit", ["50"])[0])
            page = int(query.get("page", ["1"])[0])
            if "albums_page" in STATE["fail"] and page > 1:
                return self._send(500, {"error": "boom"})
            start = (page - 1) * limit
            return self._send(*_envelope({"albums": albums[start:start + limit]}))
        if path.startswith("/library/albums/"):
            aid = int(path.split("/")[3])
            album = ALBUMS.get(aid)
            if not album:
                return self._send(*_error("NOT_FOUND", "Album not found.", 404))
            return self._send(*_envelope({
                "album": album, "tracks": _album_tracks(aid)}))
        if path == "/library/artists":
            search = query.get("search", [""])[0]
            artists = list(ARTISTS.values())
            if search:
                artists = [a for a in artists if search.lower() in a["name"].lower()]
            return self._send(*_envelope({"artists": artists}))
        if path.startswith("/library/artists/"):
            aid = int(path.split("/")[3])
            artist = ARTISTS.get(aid)
            if not artist:
                return self._send(*_error("NOT_FOUND", "Artist not found.", 404))
            albums = [a for a in ALBUMS.values() if a["artist_id"] == aid]
            return self._send(*_envelope({"artist": artist, "albums": albums}))
        if path == "/library/genres":
            return self._send(*_envelope({
                "genres": [{"name": "Jazz", "count": 1},
                           {"name": "Pop", "count": 1},
                           {"name": "Rock", "count": 2}],
                "source": query.get("source", ["albums"])[0],
            }))
        return self._send(*_error("NOT_FOUND", "Unknown endpoint", 404))

    # -- streaming ---------------------------------------------------------
    def _stream(self, query):
        if not self._key_authed(query):
            return self._send(401, b"", "text/plain")
        file_path = query.get("path", [""])[0]
        if not file_path:
            return self._send(400, b"", "text/plain")
        STATE["stream_requests"].append({k: v[0] for k, v in query.items()})
        seconds = STREAM_SECONDS.get(file_path, DEFAULT_STREAM_SECONDS)
        if seconds not in WAV_CACHE:
            WAV_CACHE[seconds] = _wav_bytes(seconds)
        data = WAV_CACHE[seconds]
        range_header = self.headers.get("Range", "")
        if range_header.startswith("bytes="):
            spec = range_header[len("bytes="):]
            start_s, _, end_s = spec.partition("-")
            start = int(start_s) if start_s else 0
            end = int(end_s) if end_s else len(data) - 1
            end = min(end, len(data) - 1)
            chunk = data[start:end + 1]
            self.send_response(206)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Range", f"bytes {start}-{end}/{len(data)}")
            self.send_header("Content-Length", str(len(chunk)))
            self.end_headers()
            self.wfile.write(chunk)
            return
        return self._send(200, data, "audio/wav")


def start_server():
    """Start the stub on an ephemeral port; returns (server, base_url)."""
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    port = server.server_address[1]
    return server, f"http://127.0.0.1:{port}"
