import os
import json
import socket
import asyncio
import subprocess
import time
import base64
import decky
# Using urllib since it's in stdlib (no external deps needed)
import urllib.request
import urllib.error
import urllib.parse
import ssl

class Plugin:
    settings_path = None
    settings = {
        "server_url": "",
        "token": ""
    }

    # Audio player control (using ffplay)
    player_process = None
    player_paused = False

    # Playback state
    playback_state = {
        "is_playing": False,
        "current_track": None,
        "position": 0,
        "duration": 0,
        "volume": 75,
        "queue": [],
        "queue_index": -1
    }

    async def _main(self):
        """Called when plugin loads"""
        decky.logger.info("Museck plugin loaded!")

        # Set up settings path
        self.settings_path = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")
        decky.logger.info(f"Settings path: {self.settings_path}")

        # Load existing settings
        await self._load_settings()

    async def _unload(self):
        """Called when plugin unloads"""
        decky.logger.info("Museck plugin unloaded!")

    async def _uninstall(self):
        """Called when plugin is uninstalled"""
        decky.logger.info("Museck plugin uninstalled!")

    async def _load_settings(self):
        """Load settings from JSON file"""
        try:
            if os.path.exists(self.settings_path):
                with open(self.settings_path, "r") as f:
                    self.settings = json.load(f)
                decky.logger.info("Settings loaded successfully")
            else:
                decky.logger.info("No settings file found, using defaults")
        except Exception as e:
            decky.logger.error(f"Failed to load settings: {e}")

    async def _save_settings(self):
        """Save settings to JSON file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.settings_path), exist_ok=True)

            with open(self.settings_path, "w") as f:
                json.dump(self.settings, f, indent=2)
            decky.logger.info("Settings saved successfully")
            return True
        except Exception as e:
            decky.logger.error(f"Failed to save settings: {e}")
            return False

    # === Frontend callable methods ===

    async def get_settings(self):
        """Get current settings"""
        return {
            "server_url": self.settings.get("server_url", ""),
            "token": self.settings.get("token", "")
        }

    async def save_settings(self, server_url: str, token: str):
        """Save Plex server settings"""
        self.settings["server_url"] = server_url.rstrip("/")  # Remove trailing slash
        self.settings["token"] = token
        return await self._save_settings()

    async def test_connection(self):
        """Test connection to Plex server"""
        server_url = self.settings.get("server_url", "")
        token = self.settings.get("token", "")

        if not server_url or not token:
            return {
                "success": False,
                "message": "Server URL and token are required"
            }

        try:
            # Build the URL to get server identity
            url = f"{server_url}/?X-Plex-Token={token}"
            decky.logger.info(f"Testing connection to: {server_url}")

            # Create SSL context that doesn't verify (for self-signed certs)
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            # Make request
            req = urllib.request.Request(
                url,
                headers={
                    "Accept": "application/json",
                    "X-Plex-Token": token
                }
            )

            with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
                if response.status == 200:
                    # Try to parse the response
                    data = response.read().decode("utf-8")

                    # Plex returns XML by default, try to extract server name
                    server_name = "Plex Server"

                    # Simple XML parsing for friendlyName
                    if 'friendlyName="' in data:
                        start = data.find('friendlyName="') + len('friendlyName="')
                        end = data.find('"', start)
                        server_name = data[start:end]

                    decky.logger.info(f"Connected to: {server_name}")
                    return {
                        "success": True,
                        "message": "Connection successful",
                        "server_name": server_name
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Server returned status {response.status}"
                    }

        except urllib.error.HTTPError as e:
            decky.logger.error(f"HTTP error: {e.code} - {e.reason}")
            if e.code == 401:
                return {
                    "success": False,
                    "message": "Invalid Plex token (401 Unauthorized)"
                }
            return {
                "success": False,
                "message": f"HTTP error: {e.code} - {e.reason}"
            }
        except urllib.error.URLError as e:
            decky.logger.error(f"URL error: {e.reason}")
            return {
                "success": False,
                "message": f"Cannot reach server: {e.reason}"
            }
        except Exception as e:
            decky.logger.error(f"Connection error: {e}")
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }

    async def discover_servers(self):
        """Discover Plex servers on local network using GDM protocol"""
        decky.logger.info("Starting Plex server discovery...")
        servers = []

        try:
            # Run the blocking socket code in a thread to not block the event loop
            loop = asyncio.get_event_loop()
            servers = await loop.run_in_executor(None, self._discover_servers_sync)
        except Exception as e:
            decky.logger.error(f"Discovery error: {e}")
            return {
                "success": False,
                "servers": [],
                "message": f"Discovery failed: {str(e)}"
            }

        decky.logger.info(f"Discovery complete. Found {len(servers)} server(s)")
        return {
            "success": True,
            "servers": servers,
            "message": f"Found {len(servers)} server(s)" if servers else "No servers found"
        }

    def _discover_servers_sync(self):
        """Synchronous server discovery (runs in thread)"""
        servers = []
        try:
            # Create UDP socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            sock.settimeout(2)  # 2 second timeout per recv

            # GDM discovery message
            gdm_msg = b"M-SEARCH * HTTP/1.1\r\n\r\n"
            gdm_port = 32414

            # Send broadcast
            sock.sendto(gdm_msg, ("255.255.255.255", gdm_port))
            decky.logger.info("Sent GDM broadcast")

            # Collect responses for up to 3 seconds
            start_time = time.time()
            while (time.time() - start_time) < 3:
                try:
                    data, addr = sock.recvfrom(1024)
                    response = data.decode("utf-8")
                    decky.logger.info(f"Got response from {addr[0]}")

                    # Parse GDM response
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
                        decky.logger.info(f"Found server: {server_info['name']} at {server_info['url']}")

                except socket.timeout:
                    break
                except Exception as e:
                    decky.logger.error(f"Error receiving: {e}")
                    break

            sock.close()
        except Exception as e:
            decky.logger.error(f"Socket error: {e}")

        return servers

    # === Audio Player Control Methods (using ffplay) ===

    async def play_track(self, track_key: str, track_info: dict = None):
        """Play a track from Plex using ffplay"""
        server_url = self.settings.get("server_url", "")
        token = self.settings.get("token", "")

        if not server_url or not token:
            return {"success": False, "message": "Server not configured"}

        # Build stream URL
        stream_url = f"{server_url}{track_key}?X-Plex-Token={token}"
        decky.logger.info(f"Playing: {stream_url}")

        # Fetch album art as base64 for the current track
        if track_info:
            thumb_path = track_info.get('thumb', '')
            if thumb_path and not thumb_path.startswith('data:'):
                decky.logger.info(f"Fetching album art for: {thumb_path}")
                base64_thumb = self._fetch_image_as_base64(thumb_path)
                if base64_thumb:
                    track_info['thumb'] = base64_thumb
                    track_info['parentThumb'] = base64_thumb
                    decky.logger.info("Album art fetched successfully")
                else:
                    decky.logger.info("Failed to fetch album art")

        # Kill existing player if running
        await self.stop()

        # Start ffplay
        try:
            # Log the stream URL for debugging (without token)
            decky.logger.info(f"Stream URL path: {track_key}")

            # Create a log file for ffplay errors
            log_path = os.path.join(decky.DECKY_PLUGIN_LOG_DIR, "ffplay.log")
            log_file = open(log_path, "w")

            # Set environment to connect to user's PulseAudio session
            env = os.environ.copy()
            env["SDL_AUDIODRIVER"] = "pulse"
            env["XDG_RUNTIME_DIR"] = "/run/user/1000"
            env["PULSE_SERVER"] = "/run/user/1000/pulse/native"
            env["PULSE_RUNTIME_PATH"] = "/run/user/1000/pulse"

            self.player_process = subprocess.Popen([
                "/usr/bin/ffplay",
                "-nodisp",        # No video display
                "-autoexit",      # Exit when done
                "-loglevel", "warning",  # Show warnings/errors
                stream_url
            ], stdout=subprocess.DEVNULL, stderr=log_file, env=env)

            self.player_paused = False
            self.playback_state["is_playing"] = True
            self.playback_state["current_track"] = track_info
            self.playback_state["position"] = 0
            self.playback_state["duration"] = (track_info.get("duration", 0) / 1000) if track_info else 0

            decky.logger.info(f"ffplay started with PID: {self.player_process.pid}")
            return {"success": True, "message": "Playing"}

        except Exception as e:
            decky.logger.error(f"Failed to start ffplay: {e}")
            return {"success": False, "message": str(e)}

    async def pause(self):
        """Pause playback using SIGSTOP"""
        import signal
        if self.player_process and self.player_process.poll() is None:
            try:
                self.player_process.send_signal(signal.SIGSTOP)
                self.player_paused = True
                self.playback_state["is_playing"] = False
            except Exception as e:
                decky.logger.error(f"Pause error: {e}")
        return {"success": True}

    async def resume(self):
        """Resume playback using SIGCONT"""
        import signal
        if self.player_process and self.player_process.poll() is None:
            try:
                self.player_process.send_signal(signal.SIGCONT)
                self.player_paused = False
                self.playback_state["is_playing"] = True
            except Exception as e:
                decky.logger.error(f"Resume error: {e}")
        return {"success": True}

    async def toggle_play_pause(self):
        """Toggle play/pause"""
        if self.player_paused:
            return await self.resume()
        else:
            return await self.pause()

    async def stop(self):
        """Stop playback"""
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

    async def seek(self, seconds: float):
        """Seek relative - ffplay doesn't support seeking, so we skip to next/prev"""
        # ffplay doesn't support runtime seeking, return message
        return {"success": False, "message": "Seeking not supported"}

    async def seek_to(self, position: float):
        """Seek to position - not supported by ffplay"""
        return {"success": False, "message": "Seeking not supported"}

    async def set_volume(self, volume: int):
        """Set volume - ffplay doesn't support runtime volume change"""
        volume = max(0, min(100, volume))
        self.playback_state["volume"] = volume
        return {"success": True, "volume": volume}

    async def get_playback_status(self):
        """Get current playback status"""
        # Check if player is still running
        if self.player_process:
            poll = self.player_process.poll()
            if poll is not None:
                # Process ended - track finished
                decky.logger.info("Track finished, playing next")
                self.player_process = None
                self.playback_state["is_playing"] = False
                # Auto-play next track
                await self._auto_next()

        return self.playback_state.copy()

    async def _auto_next(self):
        """Automatically play next track when current ends"""
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]
        if index < len(queue) - 1:
            self.playback_state["queue_index"] = index + 1
            track = queue[index + 1]
            await self.play_track(track.get("key"), track)

    # === Queue Management ===

    async def set_queue(self, tracks: list, start_index: int = 0):
        """Set the play queue and start playing"""
        self.playback_state["queue"] = tracks
        self.playback_state["queue_index"] = start_index

        if tracks and 0 <= start_index < len(tracks):
            track = tracks[start_index]
            return await self.play_track(track.get("key"), track)

        return {"success": False, "message": "Invalid queue or index"}

    async def next_track(self):
        """Play next track in queue"""
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]

        if index < len(queue) - 1:
            self.playback_state["queue_index"] = index + 1
            track = queue[index + 1]
            return await self.play_track(track.get("key"), track)

        return {"success": False, "message": "End of queue"}

    async def previous_track(self):
        """Play previous track in queue (or restart current)"""
        queue = self.playback_state["queue"]
        index = self.playback_state["queue_index"]

        # Just go to previous track (can't easily detect position with ffplay)
        if index > 0:
            self.playback_state["queue_index"] = index - 1
            track = queue[index - 1]
            return await self.play_track(track.get("key"), track)
        elif index == 0 and len(queue) > 0:
            # Restart current track
            track = queue[0]
            return await self.play_track(track.get("key"), track)

        return {"success": False, "message": "Start of queue"}

    async def get_queue(self):
        """Get current queue"""
        return {
            "queue": self.playback_state["queue"],
            "index": self.playback_state["queue_index"]
        }

    # === Plex API Methods ===

    def _plex_request(self, endpoint: str):
        """Make a request to Plex API"""
        server_url = self.settings.get("server_url", "")
        token = self.settings.get("token", "")

        if not server_url or not token:
            return None

        url = f"{server_url}{endpoint}"
        if "?" in url:
            url += f"&X-Plex-Token={token}"
        else:
            url += f"?X-Plex-Token={token}"

        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            decky.logger.error(f"Plex API error: {e}")
            return None

    async def get_music_libraries(self):
        """Get all music libraries"""
        data = self._plex_request("/library/sections")
        if not data:
            return {"success": False, "libraries": []}

        libraries = []
        for section in data.get("MediaContainer", {}).get("Directory", []):
            if section.get("type") == "artist":
                libraries.append({
                    "key": section.get("key"),
                    "title": section.get("title"),
                    "type": section.get("type")
                })

        return {"success": True, "libraries": libraries}

    async def get_recently_added(self, library_key: str = None):
        """Get recently added tracks"""
        if library_key:
            endpoint = f"/library/sections/{library_key}/recentlyAdded?type=10"
        else:
            endpoint = "/library/recentlyAdded?type=10"

        data = self._plex_request(endpoint)
        if not data:
            return {"success": False, "tracks": []}

        tracks = self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))
        return {"success": True, "tracks": tracks}

    async def get_playlists(self):
        """Get all playlists"""
        data = self._plex_request("/playlists?playlistType=audio")
        if not data:
            return {"success": False, "playlists": []}

        playlists = []
        for pl in data.get("MediaContainer", {}).get("Metadata", []):
            playlists.append({
                "key": pl.get("ratingKey"),
                "title": pl.get("title"),
                "duration": pl.get("duration", 0),
                "count": pl.get("leafCount", 0),
                "thumb": pl.get("composite", pl.get("thumb", ""))
            })

        return {"success": True, "playlists": playlists}

    async def get_playlist_tracks(self, playlist_key: str):
        """Get tracks in a playlist"""
        data = self._plex_request(f"/playlists/{playlist_key}/items")
        if not data:
            return {"success": False, "tracks": []}

        tracks = self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))
        return {"success": True, "tracks": tracks}

    async def get_artists(self, library_key: str):
        """Get all artists in a library"""
        data = self._plex_request(f"/library/sections/{library_key}/all?type=8")
        if not data:
            return {"success": False, "artists": []}

        artists = []
        for artist in data.get("MediaContainer", {}).get("Metadata", []):
            artists.append({
                "key": artist.get("ratingKey"),
                "title": artist.get("title"),
                "thumb": artist.get("thumb", "")
            })

        return {"success": True, "artists": artists}

    async def get_albums(self, artist_key: str = None, library_key: str = None):
        """Get albums by artist or all albums in library"""
        if artist_key:
            endpoint = f"/library/metadata/{artist_key}/children"
        elif library_key:
            endpoint = f"/library/sections/{library_key}/all?type=9"
        else:
            return {"success": False, "albums": []}

        data = self._plex_request(endpoint)
        if not data:
            return {"success": False, "albums": []}

        albums = []
        for album in data.get("MediaContainer", {}).get("Metadata", []):
            albums.append({
                "key": album.get("ratingKey"),
                "title": album.get("title"),
                "artist": album.get("parentTitle", ""),
                "year": album.get("year"),
                "thumb": album.get("thumb", "")
            })

        return {"success": True, "albums": albums}

    async def get_album_tracks(self, album_key: str):
        """Get tracks in an album"""
        data = self._plex_request(f"/library/metadata/{album_key}/children")
        if not data:
            return {"success": False, "tracks": []}

        tracks = self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))
        return {"success": True, "tracks": tracks}

    async def search(self, query: str, library_key: str = None):
        """Search for music"""
        if library_key:
            endpoint = f"/library/sections/{library_key}/search?type=10&query={urllib.parse.quote(query)}"
        else:
            endpoint = f"/search?type=10&query={urllib.parse.quote(query)}"

        data = self._plex_request(endpoint)
        if not data:
            return {"success": False, "results": []}

        tracks = self._parse_tracks(data.get("MediaContainer", {}).get("Metadata", []))
        return {"success": True, "results": tracks}

    def _fetch_image_as_base64(self, thumb_path: str):
        """Fetch image from Plex and convert to base64 data URL"""
        if not thumb_path:
            return ""

        server_url = self.settings.get("server_url", "")
        token = self.settings.get("token", "")

        try:
            # Use transcoder for consistent sizing
            encoded_thumb = urllib.parse.quote(thumb_path, safe='')
            url = f"{server_url}/photo/:/transcode?width=100&height=100&minSize=1&url={encoded_thumb}&X-Plex-Token={token}"

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

    def _parse_tracks(self, metadata: list):
        """Parse track metadata from Plex response"""
        tracks = []

        for track in metadata:
            # Get the media part for streaming
            media = track.get("Media", [{}])[0]
            parts = media.get("Part", [{}])[0]
            stream_key = parts.get("key", "")

            # Get thumb path (don't fetch yet - will be fetched on demand)
            thumb_path = track.get("thumb", "") or track.get("parentThumb", "")

            tracks.append({
                "key": stream_key,
                "ratingKey": track.get("ratingKey"),
                "title": track.get("title", "Unknown"),
                "artist": track.get("grandparentTitle", track.get("originalTitle", "Unknown")),
                "album": track.get("parentTitle", "Unknown"),
                "duration": track.get("duration", 0),
                "index": track.get("index", 0),
                "thumb": thumb_path,  # Store path, will convert to base64 when playing
                "parentThumb": thumb_path
            })

        return tracks

    async def get_artwork_url(self, thumb_path: str):
        """Get full artwork URL"""
        if not thumb_path:
            return ""
        server_url = self.settings.get("server_url", "")
        token = self.settings.get("token", "")
        if thumb_path.startswith("http"):
            return thumb_path
        return f"{server_url}{thumb_path}?X-Plex-Token={token}"
