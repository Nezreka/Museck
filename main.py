import os
import json
import socket
import asyncio
import subprocess
import time
import base64
import hashlib
import ssl
import decky
import urllib.request
import urllib.error
import urllib.parse


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

    def _api_get(self, endpoint: str) -> dict:
        return self._http_json(self._api_url(endpoint), {"Accept": "application/json"})

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
        data = self._api_get(f"/playlists/{playlist_key}/items")
        if not data:
            return []
        return self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))

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
            if album_key:
                tracks_data = self._api_get(f"/library/metadata/{album_key}/children")
                if tracks_data:
                    all_tracks.extend(self._parse_tracks(
                        tracks_data.get("MediaContainer", {}).get("Metadata", [])
                    ))
        return all_tracks

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

    def _parse_tracks(self, metadata: list) -> list:
        tracks = []
        for track in metadata:
            media = track.get("Media", [{}])[0]
            parts = media.get("Part", [{}])[0]
            stream_key = parts.get("key", "")
            thumb_path = track.get("thumb", "") or track.get("parentThumb", "")
            tracks.append({
                "key": stream_key,
                "ratingKey": track.get("ratingKey"),
                "title": track.get("title", "Unknown"),
                "artist": track.get("grandparentTitle", track.get("originalTitle", "Unknown")),
                "album": track.get("parentTitle", "Unknown"),
                "duration": track.get("duration", 0),
                "index": track.get("index", 0),
                "thumb": thumb_path,
                "parentThumb": thumb_path
            })
        return tracks


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
        url = self._api_url(endpoint, extra_params)
        return self._http_json(url, self._auth_headers())

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
        return [self._parse_track(s) for s in entries]

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
        return all_tracks

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
        "loop": "off"
    }

    # Original queue order (for unshuffle)
    original_queue = []

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

    async def save_server(self, server_config: dict):
        """Add or update a server."""
        # Normalize URL: ensure protocol prefix
        url = server_config.get("server_url", "").strip().rstrip("/")
        if url and not url.startswith("http://") and not url.startswith("https://"):
            url = "http://" + url
            server_config["server_url"] = url

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
            servers[existing] = server_config
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
            result = service.test_connection()

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

    async def discover_servers(self):
        """Discover servers on local network (Plex, Jellyfin, Emby)."""
        all_servers = []
        try:
            # Plex (GDM on UDP 32414)
            plex = PlexService({"server_url": "", "token": ""})
            for srv in plex.discover_servers():
                srv["type"] = "plex"
                all_servers.append(srv)
        except Exception:
            pass
        try:
            # Jellyfin (UDP 7359)
            jf = JellyfinService({"server_url": "", "api_key": "", "user_id": ""})
            all_servers.extend(jf.discover_servers())
        except Exception:
            pass
        try:
            # Emby (UDP 7359)
            emby = EmbyService({"server_url": "", "api_key": "", "user_id": ""})
            all_servers.extend(emby.discover_servers())
        except Exception:
            pass
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
        return env

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

        # Fetch album art
        if track_info:
            thumb_path = track_info.get('thumb', '')
            if thumb_path and not thumb_path.startswith('data:'):
                base64_thumb = self._fetch_image_as_base64(thumb_path)
                if base64_thumb:
                    track_info['thumb'] = base64_thumb
                    track_info['parentThumb'] = base64_thumb

        # Kill existing player
        await self.stop()

        try:
            log_path = os.path.join(decky.DECKY_PLUGIN_LOG_DIR, "ffplay.log")
            log_file = open(log_path, "w")
            env = self._get_audio_env()

            self.player_process = subprocess.Popen([
                "/usr/bin/ffplay",
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

            asyncio.create_task(self._delayed_volume_set(self.player_process.pid, self.playback_state["volume"]))

            decky.logger.info(f"ffplay started with PID: {self.player_process.pid}")
            return {"success": True, "message": "Playing"}

        except Exception as e:
            decky.logger.error(f"Failed to start ffplay: {e}")
            return {"success": False, "message": str(e)}

    async def pause(self):
        import signal
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
        import signal
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
        if self.player_paused:
            return await self.resume()
        else:
            return await self.pause()

    async def stop(self):
        if self.player_process:
            try:
                self.player_process.terminate()
                self.player_process.wait(timeout=2)
            except:
                try:
                    self.player_process.kill()
                except:
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
                self.player_process = None
                self.playback_state["is_playing"] = False
                await self._auto_next()

        if self.playback_start_time and self.playback_state["is_playing"]:
            elapsed = time.time() - self.playback_start_time - self.total_paused_time
            self.playback_state["position"] = min(elapsed, self.playback_state["duration"])
        elif self.playback_start_time and self.player_paused:
            current_pause = time.time() - self.pause_start_time if self.pause_start_time else 0
            elapsed = time.time() - self.playback_start_time - self.total_paused_time - current_pause
            self.playback_state["position"] = min(elapsed, self.playback_state["duration"])

        return self.playback_state.copy()

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

    async def set_queue(self, tracks: list, start_index: int = 0):
        self.playback_state["queue"] = tracks
        self.playback_state["queue_index"] = start_index
        if tracks and 0 <= start_index < len(tracks):
            track = tracks[start_index]
            return await self.play_track(track.get("key"), track)
        return {"success": False, "message": "Invalid queue or index"}

    async def next_track(self):
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        if index < len(queue) - 1:
            self.playback_state["queue_index"] = index + 1
            track = queue[index + 1]
            return await self.play_track(track.get("key"), track)
        return {"success": False, "message": "End of queue"}

    async def previous_track(self):
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
        queue = self.playback_state["queue"]
        if 0 <= index < len(queue):
            self.playback_state["queue_index"] = index
            track = queue[index]
            return await self.play_track(track.get("key"), track)
        return {"success": False, "message": "Invalid queue index"}

    async def get_queue_with_images(self, start_index: int = 0, count: int = 20):
        queue = self.playback_state["queue"]
        current_index = self.playback_state["queue_index"]
        end_index = min(start_index + count, len(queue))
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

        return {
            "success": True,
            "tracks": tracks_slice,
            "total": len(queue),
            "current_index": current_index
        }

    async def toggle_shuffle(self):
        import random
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        current_track = queue[index] if 0 <= index < len(queue) else None

        if self.playback_state["shuffle"]:
            self.playback_state["shuffle"] = False
            if self.original_queue:
                self.playback_state["queue"] = self.original_queue.copy()
                if current_track:
                    for i, t in enumerate(self.playback_state["queue"]):
                        if t.get("ratingKey") == current_track.get("ratingKey"):
                            self.playback_state["queue_index"] = i
                            break
        else:
            self.playback_state["shuffle"] = True
            self.original_queue = queue.copy()
            if current_track and len(queue) > 1:
                other_tracks = [t for t in queue if t.get("ratingKey") != current_track.get("ratingKey")]
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

    async def get_playlists(self):
        if not self.current_service:
            return {"success": False, "playlists": []}
        try:
            playlists = self.current_service.get_playlists()
            return {"success": True, "playlists": playlists}
        except Exception as e:
            decky.logger.error(f"get_playlists error: {e}")
            return {"success": False, "playlists": []}

    async def get_playlist_tracks(self, playlist_key: str):
        if not self.current_service:
            return {"success": False, "tracks": []}
        try:
            tracks = self.current_service.get_playlist_tracks(playlist_key)
            return {"success": True, "tracks": tracks}
        except Exception as e:
            decky.logger.error(f"get_playlist_tracks error: {e}")
            return {"success": False, "tracks": []}

    async def search(self, query: str):
        if not self.current_service:
            return {"success": False, "results": []}
        try:
            tracks = self.current_service.search_tracks(query)
            # Fetch cover art for first 10
            for track in tracks[:10]:
                if track.get("thumb") and not track["thumb"].startswith("data:"):
                    img = self._fetch_image_as_base64(track["thumb"])
                    track["thumb"] = img
                    track["parentThumb"] = img
            return {"success": True, "results": tracks}
        except Exception as e:
            decky.logger.error(f"search error: {e}")
            return {"success": False, "results": []}

    async def search_albums(self, query: str):
        if not self.current_service:
            return {"success": False, "albums": []}
        try:
            albums = self.current_service.search_albums(query)
            for album in albums[:10]:
                if album.get("thumb") and not album["thumb"].startswith("data:"):
                    album["thumb"] = self._fetch_image_as_base64(album["thumb"])
            return {"success": True, "albums": albums}
        except Exception as e:
            decky.logger.error(f"search_albums error: {e}")
            return {"success": False, "albums": []}

    async def search_artists(self, query: str):
        if not self.current_service:
            return {"success": False, "artists": []}
        try:
            artists = self.current_service.search_artists(query)
            for artist in artists[:5]:
                if artist.get("thumb") and not artist["thumb"].startswith("data:"):
                    artist["thumb"] = self._fetch_image_as_base64(artist["thumb"])
            return {"success": True, "artists": artists}
        except Exception as e:
            decky.logger.error(f"search_artists error: {e}")
            return {"success": False, "artists": []}

    async def get_album_tracks(self, album_key: str):
        if not self.current_service:
            return {"success": False, "tracks": []}
        try:
            tracks = self.current_service.get_album_tracks(album_key)
            return {"success": True, "tracks": tracks}
        except Exception as e:
            decky.logger.error(f"get_album_tracks error: {e}")
            return {"success": False, "tracks": []}

    async def get_artist_tracks(self, artist_key: str):
        if not self.current_service:
            return {"success": False, "tracks": []}
        try:
            tracks = self.current_service.get_artist_tracks(artist_key)
            # Fetch art for first 20
            for track in tracks[:20]:
                if track.get("thumb") and not track["thumb"].startswith("data:"):
                    img = self._fetch_image_as_base64(track["thumb"])
                    track["thumb"] = img
                    track["parentThumb"] = img
            return {"success": True, "tracks": tracks}
        except Exception as e:
            decky.logger.error(f"get_artist_tracks error: {e}")
            return {"success": False, "tracks": []}

    # =========================================================================
    # Image Fetching (generic — service builds the URL)
    # =========================================================================

    def _fetch_image_as_base64(self, thumb_id: str) -> str:
        """Fetch image via the active service and return as base64 data URL."""
        if not thumb_id or not self.current_service:
            return ""
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
                return f"data:{content_type};base64,{b64_data}"
        except Exception as e:
            decky.logger.error(f"Failed to fetch image: {e}")
            return ""
