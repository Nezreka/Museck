# Museck

A Decky Loader plugin that streams music from your media servers on Steam Deck.

Supports **Plex**, **Jellyfin**, **Emby**, and **Navidrome** (Subsonic API).

## Features

- Stream music from multiple server types while gaming
- Control playback from Quick Access Menu
- Browse and play playlists
- Search for tracks, albums, and artists
- Queue management with shuffle and loop
- Track change notifications
- Quick-switch between servers from the QAM
- Auto-detect Plex, Jellyfin, and Emby servers on your local network

## Requirements

- Steam Deck with Decky Loader installed
- One or more of the following music servers:
  - **Plex** Media Server with a music library
  - **Jellyfin** server with music library
  - **Emby** server with music library
  - **Navidrome** or any Subsonic-compatible server

## Installation

Copy the plugin folder to `~/homebrew/plugins/Museck/` and restart Decky Loader.

To build from source:

```bash
pnpm install
pnpm run build
```

Then copy `dist/`, `main.py`, `plugin.json`, `package.json`, and `LICENSE` to the plugin directory.

## Configuration

1. Open Quick Access Menu and select Museck
2. Go to Settings
3. Tap **Manage Servers**
4. Tap **Add Server**
5. Select your server type and enter credentials:

| Server | Fields |
|--------|--------|
| **Plex** | Server URL, Plex Token |
| **Jellyfin** | Server URL, Username, Password |
| **Emby** | Server URL, Username, Password |
| **Navidrome** | Server URL, Username, Password |

6. Test connection and save

### Getting Your Plex Token

1. Open Plex Web App in a browser
2. Play any media
3. Open developer tools (F12) and go to Network tab
4. Look for `X-Plex-Token` in any request

You can also use **Auto-Detect** to find Plex, Jellyfin, and Emby servers on your local network.

### Multiple Servers

You can add multiple servers of any type. Use the **Quick Switch** section in the QAM settings to switch between them instantly.

## Usage

**Player** - Shows current track, playback controls, shuffle/loop toggles, and upcoming queue.

**Search** - Find tracks, albums, or artists. Tap to play.

**Playlists** - Lists your playlists. Tap to play.

**Queue** - View and manage the full playback queue.

## Limitations

- Seeking is not supported
- Requires local network access to your media server
- Remote access requires manual server URL configuration
- Navidrome/Subsonic servers do not support auto-detection

## License

MIT
