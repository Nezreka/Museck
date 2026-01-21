import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  staticClasses,
  TextField,
  Navigation,
} from "@decky/ui";
import { callable, routerHook } from "@decky/api";
import { useState, useEffect } from "react";
import {
  FaMusic,
  FaPlug,
  FaCog,
  FaSearch,
  FaServer,
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaList,
  FaRandom,
  FaRedo,
} from "react-icons/fa";

// Types
interface PlexServer {
  ip: string;
  port: string;
  name: string;
  url: string;
  id?: string;
}

interface DiscoverResult {
  success: boolean;
  servers: PlexServer[];
  message: string;
}

interface Track {
  key: string;
  ratingKey: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  index: number;
  thumb: string;
  parentThumb: string;
}

interface PlaybackStatus {
  is_playing: boolean;
  current_track: Track | null;
  position: number;
  duration: number;
  volume: number;
  queue: Track[];
  queue_index: number;
  shuffle: boolean;
  loop: "off" | "queue" | "single";
}

interface Playlist {
  key: string;
  title: string;
  duration: number;
  count: number;
  thumb: string;
}

interface Album {
  key: string;
  title: string;
  artist: string;
  year?: number;
  thumb: string;
}

interface Artist {
  key: string;
  title: string;
  thumb: string;
}

// Backend callable functions - Settings
const getSettings = callable<[], { server_url: string; token: string }>("get_settings");
const saveSettings = callable<[string, string], boolean>("save_settings");
const testConnection = callable<[], { success: boolean; message: string; server_name?: string }>("test_connection");
const discoverServers = callable<[], DiscoverResult>("discover_servers");

// Backend callable functions - Playback
const togglePlayPause = callable<[], { success: boolean }>("toggle_play_pause");
const getPlaybackStatus = callable<[], PlaybackStatus>("get_playback_status");
const nextTrack = callable<[], { success: boolean; message: string }>("next_track");
const previousTrack = callable<[], { success: boolean; message: string }>("previous_track");
const setQueue = callable<[Track[], number], { success: boolean; message: string }>("set_queue");
const toggleShuffle = callable<[], { success: boolean; shuffle: boolean }>("toggle_shuffle");
const toggleLoop = callable<[], { success: boolean; loop: string }>("toggle_loop");

// Backend callable functions - Plex API
const getPlaylists = callable<[], { success: boolean; playlists: Playlist[] }>("get_playlists");
const getPlaylistTracks = callable<[string], { success: boolean; tracks: Track[] }>("get_playlist_tracks");
const searchPlex = callable<[string], { success: boolean; results: Track[] }>("search");
const searchAlbums = callable<[string], { success: boolean; albums: Album[] }>("search_albums");
const searchArtists = callable<[string], { success: boolean; artists: Artist[] }>("search_artists");
const getAlbumTracks = callable<[string], { success: boolean; tracks: Track[] }>("get_album_tracks");
const getArtistTracks = callable<[string], { success: boolean; tracks: Track[] }>("get_artist_tracks");
const playQueueIndex = callable<[number], { success: boolean; message?: string }>("play_queue_index");
const getQueueWithImages = callable<[number, number], { success: boolean; tracks: Track[]; total: number; current_index: number }>("get_queue_with_images");

// Helper to format time in mm:ss
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Now Playing Component
function NowPlaying() {
  const [status, setStatus] = useState<PlaybackStatus | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll playback status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const s = await getPlaybackStatus();
        setStatus(s);
      } catch (e) {
        console.error("Failed to get playback status:", e);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load playlists
  useEffect(() => {
    const loadLibrary = async () => {
      setLoading(true);
      try {
        const playlistsRes = await getPlaylists();
        if (playlistsRes.success) setPlaylists(playlistsRes.playlists);
      } catch (e) {
        console.error("Failed to load library:", e);
      }
      setLoading(false);
    };
    loadLibrary();
  }, []);

  const handlePlayPause = async () => {
    await togglePlayPause();
  };

  const handleNext = async () => {
    await nextTrack();
  };

  const handlePrevious = async () => {
    await previousTrack();
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    const result = await getPlaylistTracks(playlist.key);
    if (result.success && result.tracks.length > 0) {
      await setQueue(result.tracks, 0);
    }
  };

  const handleShuffle = async () => {
    await toggleShuffle();
  };

  const handleLoop = async () => {
    await toggleLoop();
  };

  const track = status?.current_track;
  const isPlaying = status?.is_playing || false;
  const duration = status?.duration || 0;
  const shuffleOn = status?.shuffle || false;
  const loopMode = status?.loop || "off";

  return (
    <>
      {/* Now Playing Section */}
      <PanelSection title="Now Playing">
        {track ? (
          <>
            {/* Album Art & Info */}
            <PanelSectionRow>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "4px",
                  backgroundColor: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <FaMusic style={{ fontSize: "24px", color: "#666", position: "absolute" }} />
                  {(track.thumb || track.parentThumb) && (
                    <img
                      src={track.thumb || track.parentThumb}
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {formatTime(duration)}
                  </div>
                </div>
              </div>
            </PanelSectionRow>

            {/* Compact Playback Controls - All on one line */}
            <PanelSectionRow>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", width: "100%" }}>
                <button
                  onClick={handlePrevious}
                  style={{
                    background: "#1a1a1a",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  <FaStepBackward style={{ fontSize: "18px" }} />
                </button>
                <button
                  onClick={handlePlayPause}
                  style={{
                    background: "#1db954",
                    border: "none",
                    borderRadius: "50%",
                    width: "52px",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  {isPlaying ? <FaPause style={{ fontSize: "22px" }} /> : <FaPlay style={{ fontSize: "22px", marginLeft: "3px" }} />}
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    background: "#1a1a1a",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  <FaStepForward style={{ fontSize: "18px" }} />
                </button>
              </div>
            </PanelSectionRow>

            {/* Shuffle & Loop Controls */}
            <PanelSectionRow>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", width: "100%" }}>
                <button
                  onClick={handleShuffle}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    color: shuffleOn ? "#1db954" : "#888",
                    fontSize: "12px"
                  }}
                >
                  <FaRandom style={{ fontSize: "14px" }} />
                  Shuffle
                </button>
                <button
                  onClick={handleLoop}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    color: loopMode !== "off" ? "#1db954" : "#888",
                    fontSize: "12px"
                  }}
                >
                  <FaRedo style={{ fontSize: "14px" }} />
                  {loopMode === "off" ? "Loop" : loopMode === "queue" ? "Loop All" : "Loop One"}
                </button>
              </div>
            </PanelSectionRow>

            {/* Mini Queue - Up Next */}
            {status?.queue && status.queue.length > 1 && (
              <>
                <PanelSectionRow>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0"
                  }}>
                    <span style={{ fontSize: "12px", color: "#888" }}>Up Next</span>
                    <ButtonItem
                      layout="below"
                      onClick={() => Navigation.Navigate("/museck-queue")}
                    >
                      <span style={{ fontSize: "11px" }}>View Queue ({status.queue.length})</span>
                    </ButtonItem>
                  </div>
                </PanelSectionRow>
                <PanelSectionRow>
                  <div style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    borderRadius: "8px",
                    backgroundColor: "#1a1a1a"
                  }}>
                    {status.queue.slice(status.queue_index + 1, status.queue_index + 6).map((qTrack, idx) => (
                      <div
                        key={`${qTrack.ratingKey}-${idx}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 10px",
                          borderBottom: idx < 4 ? "1px solid #2a2a2a" : "none"
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#666", width: "16px" }}>
                          {status.queue_index + idx + 2}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "12px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {qTrack.title}
                          </div>
                          <div style={{ fontSize: "10px", color: "#888" }}>
                            {qTrack.artist}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelSectionRow>
              </>
            )}
          </>
        ) : (
          <PanelSectionRow>
            <div style={{ textAlign: "center", padding: "16px", color: "#888" }}>
              Select a playlist to start playing
            </div>
          </PanelSectionRow>
        )}
      </PanelSection>

      {/* Search Section */}
      <PanelSection title="Search">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => Navigation.Navigate("/museck-search")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaSearch />
              Search Music
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Playlists Section - Controller-navigable list */}
      <PanelSection title="Playlists">
        {loading ? (
          <PanelSectionRow>
            <div style={{ textAlign: "center", color: "#888" }}>Loading...</div>
          </PanelSectionRow>
        ) : playlists.length > 0 ? (
          <>
            {playlists.map((pl) => (
              <PanelSectionRow key={pl.key}>
                <ButtonItem
                  layout="below"
                  onClick={() => handlePlayPlaylist(pl)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "4px",
                      backgroundColor: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <FaList style={{ fontSize: "16px", color: "#1db954" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {pl.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {pl.count} tracks
                      </div>
                    </div>
                    <FaPlay style={{ fontSize: "12px", color: "#1db954" }} />
                  </div>
                </ButtonItem>
              </PanelSectionRow>
            ))}
          </>
        ) : (
          <PanelSectionRow>
            <div style={{ textAlign: "center", color: "#888", fontSize: "12px" }}>
              No playlists found
            </div>
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
}

// Full-screen Settings Page (keyboard works properly here)
function SettingsPage() {
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setServerUrl(settings.server_url || "");
      setToken(settings.token || "");
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveSettings(serverUrl, token);
    setStatus(success ? "Saved!" : "Failed to save");
    setIsSaving(false);
    if (success) {
      setTimeout(() => Navigation.NavigateBack(), 1000);
    }
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
      color: "white"
    }}>
      <h2 style={{ marginBottom: "20px" }}>Museck Settings</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Server URL</label>
        <TextField
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>Plex Token</label>
        <TextField
          value={token}
          onChange={(e) => setToken(e.target.value)}
          bIsPassword={true}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1a9fff",
            border: "none",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer"
          }}
        >
          {isSaving ? "Saving..." : "Save & Return"}
        </button>
        <button
          onClick={() => Navigation.NavigateBack()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#444",
            border: "none",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>

      {status && (
        <div style={{ marginTop: "15px", color: status === "Saved!" ? "#4ade80" : "#f87171" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// Full-screen Search Page
function SearchPage() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Search for tracks, albums, and artists in parallel
      const [tracksRes, albumsRes, artistsRes] = await Promise.all([
        searchPlex(query),
        searchAlbums(query),
        searchArtists(query)
      ]);

      if (tracksRes.success) {
        setTracks(tracksRes.results.slice(0, 10));
      }
      if (albumsRes.success) {
        setAlbums(albumsRes.albums.slice(0, 10));
      }
      if (artistsRes.success) {
        setArtists(artistsRes.artists.slice(0, 5));
      }
    } catch (e) {
      console.error("Search failed:", e);
    }

    setLoading(false);
  };

  const handlePlayTrack = async (track: Track, allTracks: Track[]) => {
    const index = allTracks.findIndex(t => t.ratingKey === track.ratingKey);
    await setQueue(allTracks, index >= 0 ? index : 0);
    Navigation.NavigateBack();
  };

  const handlePlayAlbum = async (album: Album) => {
    const result = await getAlbumTracks(album.key);
    if (result.success && result.tracks.length > 0) {
      await setQueue(result.tracks, 0);
      Navigation.NavigateBack();
    }
  };

  const handlePlayArtist = async (artist: Artist) => {
    const result = await getArtistTracks(artist.key);
    if (result.success && result.tracks.length > 0) {
      await setQueue(result.tracks, 0);
      Navigation.NavigateBack();
    }
  };

  return (
    <div style={{
      padding: "16px",
      paddingTop: "40px",
      color: "white",
      minHeight: "100vh",
      backgroundColor: "#0e0e0e"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px"
      }}>
        <ButtonItem
          layout="below"
          onClick={() => Navigation.NavigateBack()}
        >
          ← Back
        </ButtonItem>
        <h2 style={{ margin: 0, fontSize: "18px", flex: 1 }}>Search Music</h2>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <FaSearch style={{ color: "#1db954", fontSize: "16px" }} />
          <span style={{ fontSize: "14px", color: "#888" }}>Enter search term:</span>
        </div>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", fontSize: "16px" }}
        />
      </div>

      {/* Search Button */}
      <div style={{ marginBottom: "20px" }}>
        <ButtonItem
          layout="below"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: query.trim() ? "#1db954" : "#888"
          }}>
            <FaSearch />
            {loading ? "Searching..." : "Search"}
          </div>
        </ButtonItem>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          Searching...
        </div>
      ) : searched ? (
        <>
          {/* Artists Section - Bubble Style */}
          {artists.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Artists</h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {artists.map((artist) => (
                  <ButtonItem
                    key={artist.key}
                    layout="below"
                    onClick={() => handlePlayArtist(artist)}
                  >
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "80px"
                    }}>
                      <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        backgroundColor: "#1db954",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #1db954"
                      }}>
                        {artist.thumb ? (
                          <img src={artist.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <FaMusic style={{ color: "white", fontSize: "24px" }} />
                        )}
                      </div>
                      <div style={{
                        fontSize: "11px",
                        textAlign: "center",
                        maxWidth: "80px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {artist.title}
                      </div>
                      <div style={{ fontSize: "9px", color: "#1db954" }}>ARTIST</div>
                    </div>
                  </ButtonItem>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {albums.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Albums</h3>
              {albums.map((album) => (
                <ButtonItem
                  key={album.key}
                  layout="below"
                  onClick={() => handlePlayAlbum(album)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "4px",
                      backgroundColor: "#333",
                      overflow: "hidden",
                      flexShrink: 0
                    }}>
                      {album.thumb ? (
                        <img src={album.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaMusic style={{ color: "#666" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{ fontWeight: "bold", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {album.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {album.artist} {album.year && `• ${album.year}`}
                      </div>
                    </div>
                    <div style={{ color: "#1db954", fontSize: "10px" }}>ALBUM</div>
                  </div>
                </ButtonItem>
              ))}
            </div>
          )}

          {/* Tracks Section */}
          {tracks.length > 0 && (
            <div>
              <h3 style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Tracks</h3>
              {tracks.map((track) => (
                <ButtonItem
                  key={track.ratingKey}
                  layout="below"
                  onClick={() => handlePlayTrack(track, tracks)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "4px",
                      backgroundColor: "#333",
                      overflow: "hidden",
                      flexShrink: 0
                    }}>
                      {track.thumb ? (
                        <img src={track.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaMusic style={{ color: "#666" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{ fontWeight: "bold", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {track.artist} • {track.album}
                      </div>
                    </div>
                    <div style={{ color: "#888", fontSize: "10px" }}>TRACK</div>
                  </div>
                </ButtonItem>
              ))}
            </div>
          )}

          {/* No Results */}
          {artists.length === 0 && albums.length === 0 && tracks.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              No results found for "{query}"
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
          <FaSearch style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }} />
          <div style={{ fontSize: "14px" }}>Search for tracks or albums</div>
        </div>
      )}
    </div>
  );
}

// Full-screen Queue Page
function QueuePage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [queueTracks, setQueueTracks] = useState<Track[]>([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        // First get current status for the now playing track
        const status = await getPlaybackStatus();
        setCurrentTrack(status.current_track);
        setCurrentIndex(status.queue_index);
        setTotalTracks(status.queue?.length || 0);

        // Then fetch queue tracks with images (up to 30 tracks after current)
        if (status.queue_index >= 0) {
          const queueData = await getQueueWithImages(status.queue_index + 1, 30);
          if (queueData.success) {
            setQueueTracks(queueData.tracks);
          }
        }
        setLoading(false);
      } catch (e) {
        console.error("Failed to get queue:", e);
        setLoading(false);
      }
    };
    fetchQueue();

    // Refresh every 3 seconds
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayIndex = async (index: number) => {
    await playQueueIndex(index);
  };

  const remainingCount = Math.max(0, totalTracks - currentIndex - 31);

  return (
    <PanelSection>
      {/* Back Button */}
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => Navigation.NavigateBack()}>
          ← Back to Player
        </ButtonItem>
      </PanelSectionRow>

      {/* Header */}
      <PanelSectionRow>
        <div style={{ fontSize: "16px", fontWeight: "bold", padding: "8px 0" }}>
          Queue ({totalTracks} tracks)
        </div>
      </PanelSectionRow>

      {loading ? (
        <PanelSectionRow>
          <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>Loading queue...</div>
        </PanelSectionRow>
      ) : (
        <>
          {/* Current Track */}
          {currentTrack && (
            <>
              <PanelSectionRow>
                <div style={{ fontSize: "12px", color: "#1db954", padding: "4px 0" }}>Now Playing</div>
              </PanelSectionRow>
              <PanelSectionRow>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  backgroundColor: "#1db954",
                  borderRadius: "8px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden"
                  }}>
                    {currentTrack.thumb ? (
                      <img src={currentTrack.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <FaMusic style={{ color: "white", fontSize: "16px" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "bold", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {currentTrack.title}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.9 }}>
                      {currentTrack.artist}
                    </div>
                  </div>
                </div>
              </PanelSectionRow>
            </>
          )}

          {/* Up Next */}
          {queueTracks.length > 0 && (
            <>
              <PanelSectionRow>
                <div style={{ fontSize: "12px", color: "#888", padding: "8px 0 4px 0" }}>
                  Up Next ({totalTracks - currentIndex - 1} tracks)
                </div>
              </PanelSectionRow>

              {queueTracks.map((track, idx) => {
                const actualIndex = currentIndex + 1 + idx;
                return (
                  <PanelSectionRow key={`${track.ratingKey}-${actualIndex}`}>
                    <ButtonItem layout="below" onClick={() => handlePlayIndex(actualIndex)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#666", width: "20px", textAlign: "right" }}>
                          {actualIndex + 1}
                        </span>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "4px",
                          backgroundColor: "#333",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden"
                        }}>
                          {track.thumb ? (
                            <img src={track.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <FaMusic style={{ color: "#666", fontSize: "12px" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                          <div style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {track.title}
                          </div>
                          <div style={{ fontSize: "10px", color: "#888" }}>
                            {track.artist}
                          </div>
                        </div>
                      </div>
                    </ButtonItem>
                  </PanelSectionRow>
                );
              })}

              {remainingCount > 0 && (
                <PanelSectionRow>
                  <div style={{ textAlign: "center", padding: "8px", color: "#666", fontSize: "11px" }}>
                    + {remainingCount} more tracks
                  </div>
                </PanelSectionRow>
              )}
            </>
          )}

          {/* Empty Queue */}
          {totalTracks === 0 && (
            <PanelSectionRow>
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
                <FaList style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }} />
                <div style={{ fontSize: "13px" }}>Queue is empty</div>
              </div>
            </PanelSectionRow>
          )}
        </>
      )}
    </PanelSection>
  );
}

// QAM Settings Component (simplified - uses full-screen page for editing)
function Settings() {
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ type: "none" | "success" | "error" | "info"; message: string }>({
    type: "none",
    message: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState<PlexServer[]>([]);

  // Load settings on mount and when returning from settings page
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setServerUrl(settings.server_url || "");
        setToken(settings.token || "");
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    loadSettings();

    // Reload when QAM becomes visible (returning from settings page)
    const interval = setInterval(loadSettings, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatus({ type: "none", message: "" });
    try {
      const result = await testConnection();
      if (result.success) {
        setStatus({
          type: "success",
          message: `Connected to: ${result.server_name || "Plex Server"}`
        });
      } else {
        setStatus({ type: "error", message: result.message || "Connection failed" });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Connection error" });
      console.error(e);
    }
    setIsTesting(false);
  };

  const handleDiscover = async () => {
    setIsDiscovering(true);
    setDiscoveredServers([]);
    setStatus({ type: "info", message: "Scanning network..." });
    try {
      const result = await discoverServers();
      if (result.success && result.servers.length > 0) {
        setDiscoveredServers(result.servers);
        setStatus({ type: "success", message: `Found ${result.servers.length} server(s)` });
      } else {
        setStatus({ type: "error", message: result.message || "No servers found" });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Discovery failed" });
      console.error(e);
    }
    setIsDiscovering(false);
  };

  const handleSelectServer = async (server: PlexServer) => {
    setServerUrl(server.url);
    setDiscoveredServers([]);
    // Save immediately when selecting a server
    await saveSettings(server.url, token);
    setStatus({ type: "success", message: `Selected: ${server.name}` });
  };

  // Mask token for display
  const maskedToken = token ? "•".repeat(Math.min(token.length, 20)) : "";
  const isConfigured = serverUrl && token;

  return (
    <PanelSection title="Plex Server Settings">
      {/* Current Status */}
      <PanelSectionRow>
        <div style={{ padding: "8px 0", fontSize: "12px" }}>
          <div><strong>Server:</strong> {serverUrl || "Not configured"}</div>
          <div><strong>Token:</strong> {maskedToken || "Not configured"}</div>
        </div>
      </PanelSectionRow>

      {/* Edit Settings Button - Opens Full Screen */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => Navigation.Navigate("/museck-settings")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <FaCog />
            Edit Settings
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Auto-Detect Button */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={handleDiscover}
          disabled={isDiscovering}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <FaSearch />
            {isDiscovering ? "Scanning..." : "Auto-Detect Server"}
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Discovered Servers List */}
      {discoveredServers.length > 0 && (
        <>
          <PanelSectionRow>
            <div style={{ padding: "8px 0", color: "#888", fontSize: "12px" }}>
              Select a server:
            </div>
          </PanelSectionRow>
          {discoveredServers.map((server, index) => (
            <PanelSectionRow key={index}>
              <ButtonItem
                layout="below"
                onClick={() => handleSelectServer(server)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaServer />
                  <div style={{ textAlign: "left" }}>
                    <div>{server.name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>{server.url}</div>
                  </div>
                </div>
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </>
      )}

      {/* Test Connection Button */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={handleTestConnection}
          disabled={isTesting || !isConfigured}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <FaPlug />
            {isTesting ? "Testing..." : "Test Connection"}
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Status Message */}
      {status.type !== "none" && (
        <PanelSectionRow>
          <div
            style={{
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: status.type === "success" ? "#1a472a" : status.type === "info" ? "#1a3a4a" : "#4a1a1a",
              color: status.type === "success" ? "#4ade80" : status.type === "info" ? "#60a5fa" : "#f87171",
              textAlign: "center",
            }}
          >
            {status.message}
          </div>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
}

// Main Content Component
function Content() {
  const [view, setView] = useState<"player" | "settings">("player");

  return (
    <>
      {/* Navigation */}
      <PanelSection title="Museck">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => setView("player")}
            disabled={view === "player"}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaMusic /> Player
            </div>
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => setView("settings")}
            disabled={view === "settings"}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaCog /> Settings
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Content based on view */}
      {view === "settings" && <Settings />}
      {view === "player" && <NowPlaying />}
    </>
  );
}

export default definePlugin(() => {
  console.log("Museck plugin loaded!");

  // Register the full-screen routes
  routerHook.addRoute("/museck-settings", () => <SettingsPage />, {
    exact: true,
  });
  routerHook.addRoute("/museck-search", () => <SearchPage />, {
    exact: true,
  });
  routerHook.addRoute("/museck-queue", () => <QueuePage />, {
    exact: true,
  });

  return {
    name: "Museck",
    titleView: <div className={staticClasses.Title}>Museck</div>,
    content: <Content />,
    icon: <FaMusic />,
    onDismount() {
      console.log("Museck plugin unloaded!");
      // Unregister the routes
      routerHook.removeRoute("/museck-settings");
      routerHook.removeRoute("/museck-search");
      routerHook.removeRoute("/museck-queue");
    },
  };
});
