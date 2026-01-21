import os
import json
import socket
import asyncio
import decky
# Using urllib since it's in stdlib (no external deps needed)
import urllib.request
import urllib.error
import ssl

class Plugin:
    settings_path = None
    settings = {
        "server_url": "",
        "token": ""
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
            # Create UDP socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            sock.settimeout(3)  # 3 second timeout

            # GDM discovery message
            gdm_msg = b"M-SEARCH * HTTP/1.1\r\n\r\n"
            gdm_port = 32414

            # Send broadcast
            sock.sendto(gdm_msg, ("255.255.255.255", gdm_port))
            decky.logger.info("Sent GDM broadcast")

            # Collect responses
            start_time = asyncio.get_event_loop().time()
            while (asyncio.get_event_loop().time() - start_time) < 3:
                try:
                    data, addr = sock.recvfrom(1024)
                    response = data.decode("utf-8")
                    decky.logger.info(f"Got response from {addr[0]}")

                    # Parse GDM response
                    server_info = {
                        "ip": addr[0],
                        "port": "32400",  # Default Plex port
                        "name": "Plex Server",
                        "url": f"http://{addr[0]}:32400"
                    }

                    # Extract info from response
                    for line in response.split("\r\n"):
                        if line.startswith("Name:"):
                            server_info["name"] = line.split(":", 1)[1].strip()
                        elif line.startswith("Port:"):
                            server_info["port"] = line.split(":", 1)[1].strip()
                            server_info["url"] = f"http://{addr[0]}:{server_info['port']}"
                        elif line.startswith("Resource-Identifier:"):
                            server_info["id"] = line.split(":", 1)[1].strip()

                    # Avoid duplicates
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
