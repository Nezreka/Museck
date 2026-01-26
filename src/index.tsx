import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  staticClasses,
  TextField,
  Navigation,
  SliderField,
} from "@decky/ui";
import { callable, routerHook, toaster } from "@decky/api";
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
const setVolume = callable<[number], { success: boolean; volume: number }>("set_volume");

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

// ============================================
// Material Design 3 / Liquid Design System
// ============================================
const theme = {
  // Surfaces - tonal dark palette
  surface: "#16161e",
  surfaceContainer: "#1e1e2a",
  surfaceContainerHigh: "#262636",
  surfaceContainerHighest: "#2e2e42",

  // Primary accent
  primary: "#1ed760",
  primaryContainer: "#1a3d2a",
  onPrimary: "#000000",

  // Secondary
  secondary: "#b4b4c4",
  secondaryContainer: "#3d3d52",

  // Text
  onSurface: "#e8e8ee",
  onSurfaceVariant: "#9898a8",
  outline: "#48485a",

  // States
  error: "#ff6b6b",
  errorContainer: "#4a2020",
  success: "#4ade80",
  successContainer: "#1a4a2a",

  // Radii - MD3 larger corners
  radiusSm: "12px",
  radiusMd: "16px",
  radiusLg: "20px",
  radiusXl: "28px",
  radiusFull: "9999px",

  // Transitions
  transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
  transitionSlow: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
};

// Now Playing Component
function NowPlaying() {
  const [status, setStatus] = useState<PlaybackStatus | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [localVolume, setLocalVolume] = useState<number | null>(null);
  const [volumeUpdateTimer, setVolumeUpdateTimer] = useState<any>(null);
  const [lastVolumeInteraction, setLastVolumeInteraction] = useState<number>(0);

  // Poll playback status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const s = await getPlaybackStatus();
        setStatus(s);
        // Only update local volume if we aren't dragging it (timer check)
        if (s) {
          // If we recently interacted with volume (within 2s), don't overwrite local volume
          // This prevents rubber-banding while the backend catches up
          const timeSinceInteraction = Date.now() - lastVolumeInteraction;
          if (timeSinceInteraction > 2000) {
            setLocalVolume(null);
          }
        }
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

  const handleVolumeChange = (newVal: number) => {
    setLocalVolume(newVal);

    // Debounce backend calls
    if (volumeUpdateTimer) clearTimeout(volumeUpdateTimer);

    const timer = setTimeout(async () => {
      await setVolume(newVal);
      setVolumeUpdateTimer(null);
    }, 200);

    setVolumeUpdateTimer(timer);
    setLastVolumeInteraction(Date.now());
  };

  const track = status?.current_track;
  const isPlaying = status?.is_playing || false;
  const duration = status?.duration || 0;
  const position = status?.position || 0;
  const shuffleOn = status?.shuffle || false;
  const loopMode = status?.loop || "off";
  // Use local volume while dragging, otherwise backend status
  const volume = localVolume !== null ? localVolume : (status?.volume || 75);
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <>
      {/* Now Playing Section */}
      <PanelSection title="Now Playing">
        {track ? (
          <>
            {/* Album Art Card - Liquid Glass Style */}
            <PanelSectionRow>
              <div style={{
                background: `linear-gradient(135deg, ${theme.surfaceContainerHigh} 0%, ${theme.surfaceContainer} 100%)`,
                borderRadius: theme.radiusLg,
                padding: "16px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
                boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
                transition: theme.transition,
              }}>
                {/* Album Art with glow effect */}
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: theme.radiusMd,
                  backgroundColor: theme.surfaceContainerHighest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: `0 8px 32px rgba(30, 215, 96, 0.15)`,
                }}>
                  <FaMusic style={{ fontSize: "28px", color: theme.outline, position: "absolute" }} />
                  {(track.thumb || track.parentThumb) && (
                    <img
                      src={track.thumb || track.parentThumb}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "relative",
                        zIndex: 1,
                        transition: theme.transition,
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                {/* Track Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    color: theme.onSurface,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: "4px",
                    letterSpacing: "-0.2px",
                  }}>
                    {track.title}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: theme.onSurfaceVariant,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {track.artist}
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: theme.outline,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "2px",
                  }}>
                    {track.album}
                  </div>
                </div>
              </div>
            </PanelSectionRow>

            {/* Progress Bar - Liquid Pill Style */}
            <PanelSectionRow>
              <div style={{ width: "100%", padding: "4px 0" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "11px",
                  color: theme.onSurfaceVariant,
                  fontWeight: "500",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  <span style={{ width: "36px", textAlign: "right" }}>{formatTime(position)}</span>
                  <div style={{
                    flex: 1,
                    height: "6px",
                    backgroundColor: theme.surfaceContainerHighest,
                    borderRadius: theme.radiusFull,
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {/* Glow track */}
                    <div style={{
                      position: "absolute",
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${theme.primary}88 0%, ${theme.primary} 100%)`,
                      borderRadius: theme.radiusFull,
                      transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: `0 0 12px ${theme.primary}66`,
                    }} />
                  </div>
                  <span style={{ width: "36px" }}>{formatTime(duration)}</span>
                </div>
              </div>
            </PanelSectionRow>

            {/* Playback Controls - Floating Pills */}
            <PanelSectionRow>
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "8px 0",
              }}>
                {/* Previous */}
                <button
                  onClick={handlePrevious}
                  style={{
                    background: theme.surfaceContainerHigh,
                    border: "none",
                    borderRadius: theme.radiusFull,
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: theme.onSurface,
                    transition: theme.transition,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                  }}
                >
                  <FaStepBackward style={{ fontSize: "16px" }} />
                </button>

                {/* Play/Pause - Primary FAB */}
                <button
                  onClick={handlePlayPause}
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary} 0%, #19b84d 100%)`,
                    border: "none",
                    borderRadius: theme.radiusFull,
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: theme.onPrimary,
                    transition: theme.transition,
                    boxShadow: `0 4px 20px ${theme.primary}55, 0 2px 8px rgba(0,0,0,0.3)`,
                  }}
                >
                  {isPlaying ? (
                    <FaPause style={{ fontSize: "24px" }} />
                  ) : (
                    <FaPlay style={{ fontSize: "24px", marginLeft: "4px" }} />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={handleNext}
                  style={{
                    background: theme.surfaceContainerHigh,
                    border: "none",
                    borderRadius: theme.radiusFull,
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: theme.onSurface,
                    transition: theme.transition,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                  }}
                >
                  <FaStepForward style={{ fontSize: "16px" }} />
                </button>
              </div>
            </PanelSectionRow>

            {/* Shuffle & Loop - Pill Toggle Buttons */}
            <PanelSectionRow>
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
              }}>
                <button
                  onClick={handleShuffle}
                  style={{
                    background: shuffleOn ? theme.primaryContainer : theme.surfaceContainer,
                    border: `1px solid ${shuffleOn ? theme.primary + "44" : theme.outline + "44"}`,
                    borderRadius: theme.radiusXl,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    color: shuffleOn ? theme.primary : theme.onSurfaceVariant,
                    fontSize: "12px",
                    fontWeight: "500",
                    transition: theme.transition,
                  }}
                >
                  <FaRandom style={{ fontSize: "12px" }} />
                  Shuffle
                </button>
                <button
                  onClick={handleLoop}
                  style={{
                    background: loopMode !== "off" ? theme.primaryContainer : theme.surfaceContainer,
                    border: `1px solid ${loopMode !== "off" ? theme.primary + "44" : theme.outline + "44"}`,
                    borderRadius: theme.radiusXl,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    color: loopMode !== "off" ? theme.primary : theme.onSurfaceVariant,
                    fontSize: "12px",
                    fontWeight: "500",
                    transition: theme.transition,
                  }}
                >
                  <FaRedo style={{ fontSize: "12px" }} />
                  {loopMode === "off" ? "Loop" : loopMode === "queue" ? "All" : "One"}
                </button>
              </div>
            </PanelSectionRow>



            {/* Volume Mixer */}
            <PanelSectionRow>
              <SliderField
                label="Music Volume"
                description=""
                value={volume}
                min={0}
                max={100}
                step={1}
                showValue={true}
                onChange={handleVolumeChange}
              />
            </PanelSectionRow>

            {/* Mini Queue - Up Next */}
            {status?.queue && status.queue.length > 1 && (
              <>
                <PanelSectionRow>
                  <ButtonItem
                    layout="below"
                    onClick={() => Navigation.Navigate("/museck-queue")}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}>
                      <span style={{
                        fontSize: "13px",
                        color: theme.onSurfaceVariant,
                        fontWeight: "600",
                      }}>
                        Up Next
                      </span>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        color: theme.primary,
                      }}>
                        View All ({status.queue.length})
                      </span>
                    </div>
                  </ButtonItem>
                </PanelSectionRow>
                <PanelSectionRow>
                  <div style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    borderRadius: theme.radiusMd,
                    background: `linear-gradient(180deg, ${theme.surfaceContainer} 0%, ${theme.surface} 100%)`,
                    border: `1px solid ${theme.outline}22`,
                  }}>
                    {status.queue.slice(status.queue_index + 1, status.queue_index + 5).map((qTrack, idx) => (
                      <div
                        key={`${qTrack.ratingKey}-${idx}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderBottom: idx < 3 ? `1px solid ${theme.outline}22` : "none",
                          transition: theme.transition,
                        }}
                      >
                        <span style={{
                          fontSize: "11px",
                          color: theme.outline,
                          width: "18px",
                          fontWeight: "600",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {status.queue_index + idx + 2}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: theme.onSurface,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {qTrack.title}
                          </div>
                          <div style={{
                            fontSize: "11px",
                            color: theme.onSurfaceVariant,
                          }}>
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
          /* Empty State - Elegant */
          <PanelSectionRow>
            <div style={{
              textAlign: "center",
              padding: "32px 16px",
              background: `linear-gradient(135deg, ${theme.surfaceContainer} 0%, ${theme.surface} 100%)`,
              borderRadius: theme.radiusLg,
              border: `1px solid ${theme.outline}22`,
            }}>
              <FaMusic style={{
                fontSize: "36px",
                color: theme.outline,
                marginBottom: "12px",
                opacity: 0.5,
              }} />
              <div style={{
                color: theme.onSurfaceVariant,
                fontSize: "14px",
                fontWeight: "500",
              }}>
                Select a playlist to start
              </div>
            </div>
          </PanelSectionRow>
        )
        }
      </PanelSection >

      {/* Search Section */}
      < PanelSection title="Search" >
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => Navigation.Navigate("/museck-search")}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              color: theme.onSurface,
            }}>
              <FaSearch style={{ color: theme.primary }} />
              Search Music
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection >

      {/* Playlists Section */}
      < PanelSection title="Playlists" >
        {
          loading ? (
            <PanelSectionRow>
              <div style={{
                textAlign: "center",
                color: theme.onSurfaceVariant,
                padding: "24px",
              }}>
                Loading...
              </div>
            </PanelSectionRow >
          ) : playlists.length > 0 ? (
            <>
              {playlists.map((pl) => (
                <PanelSectionRow key={pl.key}>
                  <ButtonItem
                    layout="below"
                    onClick={() => handlePlayPlaylist(pl)}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      maxWidth: "100%",
                    }}>
                      {/* Playlist Icon */}
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: theme.radiusSm,
                        background: theme.primaryContainer,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <FaList style={{ fontSize: "16px", color: theme.primary }} />
                      </div>
                      {/* Playlist Info - constrained width */}
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left", overflow: "hidden" }}>
                        <div style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          color: theme.onSurface,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {pl.title}
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: theme.onSurfaceVariant,
                        }}>
                          {pl.count} tracks
                        </div>
                      </div>
                      {/* Play indicator */}
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: theme.radiusFull,
                        background: theme.primaryContainer,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <FaPlay style={{ fontSize: "10px", color: theme.primary, marginLeft: "2px" }} />
                      </div>
                    </div>
                  </ButtonItem>
                </PanelSectionRow>
              ))}
            </>
          ) : (
            <PanelSectionRow>
              <div style={{
                textAlign: "center",
                color: theme.onSurfaceVariant,
                fontSize: "13px",
                padding: "20px",
              }}>
                No playlists found
              </div>
            </PanelSectionRow>
          )}
      </PanelSection >
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
      padding: "24px",
      maxWidth: "600px",
      margin: "40px auto 0",
      color: theme.onSurface,
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "32px",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: theme.radiusMd,
          background: `linear-gradient(135deg, ${theme.primaryContainer} 0%, ${theme.surfaceContainerHighest} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <FaCog style={{ fontSize: "22px", color: theme.primary }} />
        </div>
        <h2 style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "600",
          letterSpacing: "-0.5px",
        }}>
          Settings
        </h2>
      </div>

      {/* Server URL Card */}
      <div style={{
        background: theme.surfaceContainer,
        borderRadius: theme.radiusMd,
        padding: "20px",
        marginBottom: "16px",
        border: `1px solid ${theme.outline}22`,
      }}>
        <label style={{
          display: "block",
          marginBottom: "10px",
          fontSize: "13px",
          fontWeight: "600",
          color: theme.onSurfaceVariant,
          letterSpacing: "0.5px",
        }}>
          Server URL
        </label>
        <TextField
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Token Card */}
      <div style={{
        background: theme.surfaceContainer,
        borderRadius: theme.radiusMd,
        padding: "20px",
        marginBottom: "24px",
        border: `1px solid ${theme.outline}22`,
      }}>
        <label style={{
          display: "block",
          marginBottom: "10px",
          fontSize: "13px",
          fontWeight: "600",
          color: theme.onSurfaceVariant,
          letterSpacing: "0.5px",
        }}>
          Plex Token
        </label>
        <TextField
          value={token}
          onChange={(e) => setToken(e.target.value)}
          bIsPassword={true}
          style={{ width: "100%" }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            flex: 1,
            padding: "14px 24px",
            background: `linear-gradient(135deg, ${theme.primary} 0%, #19b84d 100%)`,
            border: "none",
            borderRadius: theme.radiusXl,
            color: theme.onPrimary,
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: theme.transition,
            boxShadow: `0 4px 16px ${theme.primary}44`,
          }}
        >
          {isSaving ? "Saving..." : "Save & Return"}
        </button>
        <button
          onClick={() => Navigation.NavigateBack()}
          style={{
            padding: "14px 24px",
            background: theme.surfaceContainerHigh,
            border: `1px solid ${theme.outline}33`,
            borderRadius: theme.radiusXl,
            color: theme.onSurface,
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: theme.transition,
          }}
        >
          Cancel
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div style={{
          marginTop: "20px",
          padding: "14px 20px",
          borderRadius: theme.radiusMd,
          background: status === "Saved!" ? theme.successContainer : theme.errorContainer,
          color: status === "Saved!" ? theme.success : theme.error,
          textAlign: "center",
          fontWeight: "500",
        }}>
          {status}
        </div>
      )}
    </div>
  );
}

// Full-screen Search Page - MD3 Design
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
      const [tracksRes, albumsRes, artistsRes] = await Promise.all([
        searchPlex(query),
        searchAlbums(query),
        searchArtists(query)
      ]);

      if (tracksRes.success) setTracks(tracksRes.results.slice(0, 10));
      if (albumsRes.success) setAlbums(albumsRes.albums.slice(0, 10));
      if (artistsRes.success) setArtists(artistsRes.artists.slice(0, 5));
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

  // Shared card style for results - with width constraints
  const resultCardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  };

  return (
    <div style={{
      marginTop: "40px",
      height: "calc(100% - 40px)",
      overflowY: "auto",
      overflowX: "hidden",
      paddingBottom: "60px",
    }}>
      <PanelSection title="Search Music">
        {/* Back Button */}
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => Navigation.NavigateBack()}>
            ← Back to Player
          </ButtonItem>
        </PanelSectionRow>

        {/* Search Input */}
        <PanelSectionRow>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </PanelSectionRow>

        {/* Search Button */}
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              color: query.trim() ? theme.primary : theme.onSurfaceVariant,
              fontWeight: "600",
            }}>
              <FaSearch style={{ fontSize: "14px" }} />
              {loading ? "Searching..." : "Search"}
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Loading State */}
      {loading && (
        <PanelSection>
          <PanelSectionRow>
            <div style={{
              textAlign: "center",
              padding: "32px",
              color: theme.onSurfaceVariant,
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                margin: "0 auto 16px",
                borderRadius: theme.radiusFull,
                border: `3px solid ${theme.surfaceContainerHighest}`,
                borderTopColor: theme.primary,
                animation: "spin 1s linear infinite",
              }} />
              Searching...
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {!loading && searched && (
        <>
          {/* Artists - Circular Avatars */}
          {artists.length > 0 && (
            <PanelSection title="Artists">
              {artists.map((artist) => (
                <PanelSectionRow key={artist.key}>
                  <ButtonItem layout="below" onClick={() => handlePlayArtist(artist)}>
                    <div style={resultCardStyle}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: theme.radiusFull,
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryContainer} 100%)`,
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px ${theme.primary}33`,
                      }}>
                        {artist.thumb ? (
                          <img src={artist.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <FaMusic style={{ color: "white", fontSize: "18px" }} />
                        )}
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: theme.onSurface,
                        }}>
                          {artist.title}
                        </div>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: theme.primary,
                        background: theme.primaryContainer,
                        padding: "4px 10px",
                        borderRadius: theme.radiusFull,
                        letterSpacing: "0.5px",
                      }}>
                        ARTIST
                      </span>
                    </div>
                  </ButtonItem>
                </PanelSectionRow>
              ))}
            </PanelSection>
          )}

          {/* Albums - Square Cards */}
          {albums.length > 0 && (
            <PanelSection title="Albums">
              {albums.map((album) => (
                <PanelSectionRow key={album.key}>
                  <ButtonItem layout="below" onClick={() => handlePlayAlbum(album)}>
                    <div style={resultCardStyle}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: theme.radiusSm,
                        backgroundColor: theme.surfaceContainerHighest,
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                      }}>
                        {album.thumb ? (
                          <img src={album.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <FaMusic style={{ color: theme.outline }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: theme.onSurface,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {album.title}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: theme.onSurfaceVariant,
                          marginTop: "2px",
                        }}>
                          {album.artist} {album.year && `• ${album.year}`}
                        </div>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: theme.secondary,
                        background: theme.secondaryContainer,
                        padding: "4px 10px",
                        borderRadius: theme.radiusFull,
                        letterSpacing: "0.5px",
                      }}>
                        ALBUM
                      </span>
                    </div>
                  </ButtonItem>
                </PanelSectionRow>
              ))}
            </PanelSection>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <PanelSection title="Tracks">
              {tracks.map((track) => (
                <PanelSectionRow key={track.ratingKey}>
                  <ButtonItem layout="below" onClick={() => handlePlayTrack(track, tracks)}>
                    <div style={resultCardStyle}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: theme.radiusSm,
                        backgroundColor: theme.surfaceContainerHighest,
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {track.thumb ? (
                          <img src={track.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <FaMusic style={{ color: theme.outline }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: theme.onSurface,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {track.title}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: theme.onSurfaceVariant,
                          marginTop: "2px",
                        }}>
                          {track.artist}
                        </div>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: theme.outline,
                        background: theme.surfaceContainerHigh,
                        padding: "4px 10px",
                        borderRadius: theme.radiusFull,
                        letterSpacing: "0.5px",
                      }}>
                        TRACK
                      </span>
                    </div>
                  </ButtonItem>
                </PanelSectionRow>
              ))}
            </PanelSection>
          )}

          {/* No Results */}
          {artists.length === 0 && albums.length === 0 && tracks.length === 0 && (
            <PanelSection>
              <PanelSectionRow>
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  background: theme.surfaceContainer,
                  borderRadius: theme.radiusLg,
                  border: `1px solid ${theme.outline}22`,
                }}>
                  <FaSearch style={{
                    fontSize: "36px",
                    color: theme.outline,
                    marginBottom: "16px",
                    opacity: 0.4,
                  }} />
                  <div style={{
                    color: theme.onSurfaceVariant,
                    fontSize: "14px",
                  }}>
                    No results found for "{query}"
                  </div>
                </div>
              </PanelSectionRow>
            </PanelSection>
          )}

          <div style={{ height: "60px" }} />
        </>
      )}

      {/* Empty State */}
      {!loading && !searched && (
        <PanelSection>
          <PanelSectionRow>
            <div style={{
              textAlign: "center",
              padding: "48px 20px",
              background: `linear-gradient(180deg, ${theme.surfaceContainer} 0%, transparent 100%)`,
              borderRadius: theme.radiusLg,
            }}>
              <FaSearch style={{
                fontSize: "48px",
                color: theme.outline,
                marginBottom: "16px",
                opacity: 0.25,
              }} />
              <div style={{
                color: theme.onSurfaceVariant,
                fontSize: "15px",
                fontWeight: "500",
              }}>
                Search for music
              </div>
              <div style={{
                color: theme.outline,
                fontSize: "13px",
                marginTop: "6px",
              }}>
                Find artists, albums, and tracks
              </div>
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}
      <div style={{ height: "80px" }} />
    </div>
  );
}

// Full-screen Queue Page - MD3 Design
function QueuePage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [totalTracks, setTotalTracks] = useState(0);
  const [upNextTracks, setUpNextTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const s = await getPlaybackStatus();
        setCurrentTrack(s.current_track);
        setCurrentIndex(s.queue_index);
        setTotalTracks(s.queue?.length || 0);

        if (s.queue_index >= 0 && s.queue && s.queue.length > s.queue_index + 1) {
          const result = await getQueueWithImages(s.queue_index + 1, 30);
          if (result.success) {
            setUpNextTracks(result.tracks);
          }
        }
        setLoading(false);
      } catch (e) {
        console.error("Failed to get queue:", e);
        setLoading(false);
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayIndex = async (index: number) => {
    await playQueueIndex(index);
  };

  const remainingCount = Math.max(0, totalTracks - currentIndex - 31);

  return (
    <div style={{
      marginTop: "40px",
      height: "calc(100% - 40px)",
      overflowY: "auto",
      overflowX: "hidden",
      paddingBottom: "60px",
    }}>
      <PanelSection title="Queue">
        {/* Back Button */}
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => Navigation.NavigateBack()}>
            ← Back to Player
          </ButtonItem>
        </PanelSectionRow>

        {/* Queue Stats */}
        <PanelSectionRow>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: theme.onSurfaceVariant,
          }}>
            <FaList style={{ color: theme.primary }} />
            <span style={{ fontWeight: "500" }}>{totalTracks}</span> tracks in queue
          </div>
        </PanelSectionRow>
      </PanelSection>

      {loading ? (
        <PanelSection>
          <PanelSectionRow>
            <div style={{
              textAlign: "center",
              padding: "32px",
              color: theme.onSurfaceVariant,
            }}>
              Loading queue...
            </div>
          </PanelSectionRow>
        </PanelSection>
      ) : (
        <>
          {/* Now Playing - Hero Card */}
          {currentTrack && (
            <PanelSection title="Now Playing">
              <PanelSectionRow>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  background: `linear-gradient(135deg, ${theme.primary} 0%, #19b84d 100%)`,
                  borderRadius: theme.radiusMd,
                  boxShadow: `0 4px 20px ${theme.primary}44`,
                }}>
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: theme.radiusSm,
                    backgroundColor: "rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}>
                    {currentTrack.thumb ? (
                      <img src={currentTrack.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <FaMusic style={{ color: "white", fontSize: "20px" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      color: theme.onPrimary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {currentTrack.title}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "rgba(0,0,0,0.7)",
                      marginTop: "2px",
                    }}>
                      {currentTrack.artist}
                    </div>
                  </div>
                  {/* Playing indicator */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{
                        width: "3px",
                        height: `${8 + i * 4}px`,
                        backgroundColor: theme.onPrimary,
                        borderRadius: "2px",
                        opacity: 0.8,
                      }} />
                    ))}
                  </div>
                </div>
              </PanelSectionRow>
            </PanelSection>
          )}

          {/* Up Next */}
          {upNextTracks.length > 0 && (
            <PanelSection title={`Up Next (${totalTracks - currentIndex - 1})`}>
              {upNextTracks.map((track, idx) => {
                const actualIndex = currentIndex + 1 + idx;
                return (
                  <PanelSectionRow key={`${track.ratingKey}-${actualIndex}`}>
                    <ButtonItem layout="below" onClick={() => handlePlayIndex(actualIndex)}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "2px 0",
                      }}>
                        <span style={{
                          fontSize: "12px",
                          color: theme.outline,
                          width: "24px",
                          fontWeight: "600",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {actualIndex + 1}
                        </span>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: theme.radiusSm,
                          backgroundColor: theme.surfaceContainerHighest,
                          overflow: "hidden",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {track.thumb ? (
                            <img src={track.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <FaMusic style={{ color: theme.outline, fontSize: "14px" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: theme.onSurface,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {track.title}
                          </div>
                          <div style={{
                            fontSize: "11px",
                            color: theme.onSurfaceVariant,
                            marginTop: "1px",
                          }}>
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
                  <div style={{
                    textAlign: "center",
                    padding: "12px",
                    color: theme.onSurfaceVariant,
                    fontSize: "12px",
                    fontWeight: "500",
                  }}>
                    + {remainingCount} more tracks
                  </div>
                </PanelSectionRow>
              )}
              <div style={{ height: "60px" }} />
            </PanelSection>
          )}

          {/* Empty State */}
          {totalTracks === 0 && (
            <PanelSection>
              <PanelSectionRow>
                <div style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  background: `linear-gradient(180deg, ${theme.surfaceContainer} 0%, transparent 100%)`,
                  borderRadius: theme.radiusLg,
                }}>
                  <FaList style={{
                    fontSize: "48px",
                    color: theme.outline,
                    marginBottom: "16px",
                    opacity: 0.25,
                  }} />
                  <div style={{
                    color: theme.onSurfaceVariant,
                    fontSize: "15px",
                    fontWeight: "500",
                  }}>
                    Queue is empty
                  </div>
                  <div style={{
                    color: theme.outline,
                    fontSize: "13px",
                    marginTop: "6px",
                  }}>
                    Play a playlist to get started
                  </div>
                </div>
              </PanelSectionRow>
            </PanelSection>
          )}
        </>
      )}
      <div style={{ height: "80px" }} />
    </div>
  );
}

// QAM Settings Component - MD3 Design
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
    await saveSettings(server.url, token);
    setStatus({ type: "success", message: `Selected: ${server.name}` });
  };

  const maskedToken = token ? "•".repeat(Math.min(token.length, 20)) : "";
  const isConfigured = serverUrl && token;

  return (
    <PanelSection title="Plex Server">
      {/* Connection Status Card */}
      <PanelSectionRow>
        <div style={{
          background: theme.surfaceContainer,
          borderRadius: theme.radiusMd,
          padding: "14px 16px",
          border: `1px solid ${theme.outline}22`,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: theme.radiusFull,
              backgroundColor: isConfigured ? theme.success : theme.error,
              boxShadow: `0 0 8px ${isConfigured ? theme.success : theme.error}66`,
            }} />
            <span style={{
              fontSize: "12px",
              fontWeight: "600",
              color: isConfigured ? theme.success : theme.onSurfaceVariant,
            }}>
              {isConfigured ? "Configured" : "Not Configured"}
            </span>
          </div>
          <div style={{
            fontSize: "12px",
            color: theme.onSurfaceVariant,
            lineHeight: "1.6",
          }}>
            <div style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              <strong style={{ color: theme.onSurface }}>Server:</strong> {serverUrl || "—"}
            </div>
            <div>
              <strong style={{ color: theme.onSurface }}>Token:</strong> {maskedToken || "—"}
            </div>
          </div>
        </div>
      </PanelSectionRow>

      {/* Edit Settings */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => Navigation.Navigate("/museck-settings")}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: theme.onSurface,
          }}>
            <FaCog style={{ color: theme.primary }} />
            Edit Settings
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Auto-Detect */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={handleDiscover}
          disabled={isDiscovering}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: theme.onSurfaceVariant,
          }}>
            <FaSearch style={{ color: theme.secondary }} />
            {isDiscovering ? "Scanning..." : "Auto-Detect Server"}
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Discovered Servers */}
      {discoveredServers.length > 0 && (
        <>
          <PanelSectionRow>
            <div style={{
              padding: "8px 0",
              color: theme.onSurfaceVariant,
              fontSize: "12px",
              fontWeight: "600",
            }}>
              Found Servers
            </div>
          </PanelSectionRow>
          {discoveredServers.map((server, index) => (
            <PanelSectionRow key={index}>
              <ButtonItem
                layout="below"
                onClick={() => handleSelectServer(server)}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: theme.onSurface,
                  textAlign: "left",
                }}>
                  <FaServer style={{ color: theme.primary, fontSize: "18px", flexShrink: 0 }} />
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <div style={{ fontWeight: "500", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{server.name}</div>
                    <div style={{ fontSize: "11px", color: theme.onSurfaceVariant, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{server.url}</div>
                  </div>
                </div>
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </>
      )}

      {/* Test Connection */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={handleTestConnection}
          disabled={isTesting || !isConfigured}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: isConfigured ? theme.primary : theme.onSurfaceVariant,
            fontWeight: "600",
          }}>
            <FaPlug />
            {isTesting ? "Testing..." : "Test Connection"}
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Status Message */}
      {status.type !== "none" && (
        <PanelSectionRow>
          <div style={{
            padding: "12px 16px",
            borderRadius: theme.radiusMd,
            background: status.type === "success"
              ? theme.successContainer
              : status.type === "info"
                ? theme.secondaryContainer
                : theme.errorContainer,
            color: status.type === "success"
              ? theme.success
              : status.type === "info"
                ? theme.secondary
                : theme.error,
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "500",
          }}>
            {status.message}
          </div>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
}

// Main Content Component - MD3 Navigation with Controller Support
function Content() {
  const [view, setView] = useState<"player" | "settings">("player");

  return (
    <>
      {/* Navigation - Using ButtonItem for controller support */}
      <PanelSection title="Museck">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => setView("player")}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: view === "player" ? theme.primary : theme.onSurfaceVariant,
              fontWeight: view === "player" ? "600" : "500",
            }}>
              <FaMusic style={{ fontSize: "14px" }} />
              Player {view === "player" && "●"}
            </div>
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => setView("settings")}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: view === "settings" ? theme.primary : theme.onSurfaceVariant,
              fontWeight: view === "settings" ? "600" : "500",
            }}>
              <FaCog style={{ fontSize: "14px" }} />
              Settings {view === "settings" && "●"}
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Content */}
      {view === "settings" && <Settings />}
      {view === "player" && <NowPlaying />}
    </>
  );
}

// Track change watcher for toast notifications
let lastTrackKey: string | null = null;
let watcherInterval: ReturnType<typeof setInterval> | null = null;

async function startTrackWatcher() {
  console.log("Museck: Starting track watcher");

  const checkTrack = async () => {
    try {
      const status = await getPlaybackStatus();
      const track = status.current_track;

      if (track && track.ratingKey !== lastTrackKey) {
        lastTrackKey = track.ratingKey;

        // Show toast notification for new track
        toaster.toast({
          title: "Now Playing",
          body: `${track.title} - ${track.artist}`,
          duration: 3000,
          icon: <FaMusic />,
        });

        console.log(`Museck: Now playing - ${track.title}`);
      } else if (!track && lastTrackKey) {
        lastTrackKey = null;
      }
    } catch (e) {
      console.error("Museck: Track watcher error:", e);
    }
  };

  // Check immediately and then every 2 seconds
  await checkTrack();
  watcherInterval = setInterval(checkTrack, 2000);
}

function stopTrackWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
  lastTrackKey = null;
  console.log("Museck: Track watcher stopped");
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

  // Start the track watcher for toast notifications
  startTrackWatcher();

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

      // Stop the track watcher
      stopTrackWatcher();
    },
  };
});
