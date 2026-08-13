import os
import json
import socket
import asyncio
import functools
import random
import shutil
import signal
import subprocess
import time
import base64
import hashlib
import ssl
import decky
import urllib.request
import urllib.error
import urllib.parse


# Upper bound on how many tracks a single playlist/artist load will queue.
# Smart playlists can cover an entire library (a real one seen at 307k tracks),
# which no amount of patience will transfer, let alone queue.
MAX_QUEUE_TRACKS = 2000


async def _to_thread(func, *args, **kwargs):
    """Run a blocking callable off the event loop.

    Every server call here is synchronous urllib, and the frontend polls
    playback status once a second. Running them inline stalls that poll (and
    with it auto-advance) for the whole duration of the request.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, functools.partial(func, *args, **kwargs))


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
        req = urllib.request.Request(url, headers=headers or {})
        with urllib.request.urlopen(req, timeout=timeout, context=self._ssl_ctx) as resp:
            return resp.read()

    def _http_json(self, url: str, headers: dict = None, timeout: int = 10) -> dict:
        """HTTP GET returning parsed JSON."""
        data = self._http_get(url, headers, timeout)
        return json.loads(data.decode("utf-8"))

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


# =============================================================================
# Plex Service
# =============================================================================

class PlexService(MusicService):
    """Plex Media Server backend."""

    def __init__(self, config: dict):
        super().__init__(config)
        self.token = config.get("token", "")

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
        data = self._api_get(f"/search?type=10&query={urllib.parse.quote(query)}")
        if not data:
            return []
        return self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))

    def search_albums(self, query: str) -> list:
        data = self._api_get(f"/search?type=9&query={urllib.parse.quote(query)}")
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
        data = self._api_get(f"/search?type=8&query={urllib.parse.quote(query)}")
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

    def _parse_tracks(self, metadata: list) -> list:
        tracks = []
        unresolved = []
        for track in metadata:
            media_list = track.get("Media") or []
            media = media_list[0] if media_list else {}
            parts_list = media.get("Part") or []
            part = parts_list[0] if parts_list else {}
            stream_key = part.get("key", "")

            thumb_path = track.get("thumb", "") or track.get("parentThumb", "")
            entry = {
                "key": stream_key,
                "ratingKey": track.get("ratingKey"),
                "title": track.get("title", "Unknown"),
                "artist": track.get("grandparentTitle", track.get("originalTitle", "Unknown")),
                "album": track.get("parentTitle", "Unknown"),
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

    def _authenticate(self) -> dict:
        """Authenticate with username/password to get access token and user ID."""
        if not self.username:
            return {"success": False, "message": "Username is required"}
        url = f"{self.server_url}/Users/AuthenticateByName"
        headers = {
            "Authorization": 'MediaBrowser Client="Museck", Device="SteamDeck", DeviceId="museck-steamdeck", Version="1.0"',
            "Content-Type": "application/json",
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

    def _api_get(self, endpoint: str, extra_params: dict = None) -> dict:
        url = self._api_url(endpoint, extra_params)
        data = self._http_json(url)
        return data.get("subsonic-response", {})

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


# =============================================================================
# Service Registry
# =============================================================================

SERVICE_CLASSES = {
    "plex": PlexService,
    "jellyfin": JellyfinService,
    "emby": EmbyService,
    "subsonic": SubsonicService,
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
        self._resolve_service()

    async def _unload(self):
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
                    self.current_service = cls(srv)
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
            if identity_changed:
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
            if result.get("success") and (result.get("api_key") or result.get("user_id")):
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

            return result
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}

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

    def _get_audio_env(self):
        env = os.environ.copy()
        env["SDL_AUDIODRIVER"] = "pulse"
        env["XDG_RUNTIME_DIR"] = "/run/user/1000"
        env["PULSE_SERVER"] = "/run/user/1000/pulse/native"
        env["PULSE_RUNTIME_PATH"] = "/run/user/1000/pulse"

        # Decky ships as a PyInstaller bundle, so plugins inherit
        # LD_LIBRARY_PATH pointing at its unpacked libs (/tmp/_MEIxxxxxx).
        # Handing that to a system binary makes it load Decky's bundled libssl
        # instead of the system one; where the two disagree (Bazzite: libcurl
        # wants OPENSSL_3.2.0) ffplay dies on startup. Every track then "plays"
        # for zero seconds, which looks like the player skipping through the
        # whole library. PyInstaller preserves any pre-existing value in
        # <VAR>_ORIG, so restore that when present and otherwise drop the var.
        for var in ("LD_LIBRARY_PATH", "LD_PRELOAD"):
            original = env.pop(f"{var}_ORIG", None)
            if original:
                env[var] = original
            else:
                env.pop(var, None)
        return env

    @staticmethod
    def _find_ffplay() -> str:
        """Locate ffplay, falling back to PATH for non-SteamOS distros."""
        for candidate in ("/usr/bin/ffplay", "/bin/ffplay", "/usr/local/bin/ffplay"):
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                return candidate
        return shutil.which("ffplay") or ""

    def _read_ffplay_log(self, max_lines: int = 10) -> str:
        try:
            log_path = os.path.join(decky.DECKY_PLUGIN_LOG_DIR, "ffplay.log")
            with open(log_path, "r") as f:
                return "".join(f.readlines()[-max_lines:]).strip()
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

            # ffplay inherits a dup of the fd, so the parent's handle can close
            # as soon as the process is spawned.
            with open(log_path, "w") as log_file:
                self.player_process = subprocess.Popen([
                    ffplay,
                    "-nodisp",
                    "-autoexit",
                    "-loglevel", "warning",
                    stream_url
                ], stdout=subprocess.DEVNULL, stderr=log_file, env=env)

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

            req = urllib.request.Request(url)
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
