# Museck

A Decky Loader plugin that plays music from your Plex server on Steam Deck.

## Features

- Stream music from Plex while gaming
- Control playback from Quick Access Menu
- Browse and play playlists
- Search for tracks, albums, and artists
- Queue management with shuffle and loop
- Track change notifications

## Requirements

- Steam Deck with Decky Loader installed
- Plex Media Server with a music library
- Plex authentication token

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
3. Enter your Plex server URL (e.g. `http://192.168.1.100:32400`)
4. Enter your Plex token
5. Test connection

### Getting Your Plex Token

1. Open Plex Web App in a browser
2. Play any media
3. Open developer tools (F12) and go to Network tab
4. Look for `X-Plex-Token` in any request

You can also use Auto-Detect to find servers on your local network.

## Usage

**Player** - Shows current track, playback controls, shuffle/loop toggles, and upcoming queue.

**Search** - Find tracks, albums, or artists. Tap to play.

**Playlists** - Lists your Plex playlists. Tap to play.

**Queue** - View and manage the full playback queue.

## Limitations

- Seeking is not supported
- Requires local network access to Plex server
- Remote access requires manual server URL configuration

## License

MIT
