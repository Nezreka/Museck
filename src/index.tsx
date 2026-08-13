import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  staticClasses,
  TextField,
  Navigation,
  SliderField,
  ToggleField,
  Focusable,
  DialogButton,
  Marquee,
} from "@decky/ui";
import { callable, routerHook, toaster } from "@decky/api";
import { useState, useEffect, useRef } from "react";
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
  FaPlus,
  FaTrash,
  FaCheck,
  FaExchangeAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// =============================================================================
// Types
// =============================================================================

type ServerType = "plex" | "jellyfin" | "emby" | "subsonic";

interface ServerConfig {
  id: string;
  name: string;
  type: ServerType;
  server_url: string;
  // Plex
  token?: string;
  // Jellyfin / Emby
  api_key?: string;
  user_id?: string;
  // Subsonic / Navidrome
  username?: string;
  password?: string;
}

interface SettingsData {
  servers: ServerConfig[];
  active_server_id: string;
  notify_on_track_change?: boolean;
}

interface DiscoveredServer {
  ip: string;
  port: string;
  name: string;
  url: string;
  id?: string;
  type?: ServerType;
}

interface DiscoverResult {
  success: boolean;
  servers: DiscoveredServer[];
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

// Trimmed queue entry sent with the once-a-second status poll
interface QueuePreviewItem {
  ratingKey: string;
  title: string;
  artist: string;
}

// An up-next row renders from either shape: the trimmed preview or a full
// Track once its artwork has been fetched.
type UpNextItem = QueuePreviewItem & { thumb?: string };

interface PlaybackStatus {
  is_playing: boolean;
  current_track: Track | null;
  position: number;
  duration: number;
  volume: number;
  queue_length: number;
  queue_preview: QueuePreviewItem[];
  queue_index: number;
  shuffle: boolean;
  loop: "off" | "queue" | "single";
  last_error: string | null;
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

// =============================================================================
// Backend Callable Functions
// =============================================================================

// Settings
const getSettings = callable<[], SettingsData>("get_settings");
const saveServer = callable<[ServerConfig], { success: boolean; id: string }>("save_server");
const removeServer = callable<[string], { success: boolean }>("remove_server");
const setActiveServer = callable<[string], { success: boolean }>("set_active_server");
const testConnection = callable<[string?], { success: boolean; message: string; server_name?: string }>("test_connection");
const testServerConfig = callable<[ServerConfig], { success: boolean; message: string; server_name?: string; api_key?: string; user_id?: string }>("test_server_config");
const discoverServers = callable<[], DiscoverResult>("discover_servers");
const savePreference = callable<[string, boolean], { success: boolean }>("save_preference");

// Playback
const togglePlayPause = callable<[], { success: boolean }>("toggle_play_pause");
const getPlaybackStatus = callable<[], PlaybackStatus>("get_playback_status");
const nextTrack = callable<[], { success: boolean; message: string }>("next_track");
const previousTrack = callable<[], { success: boolean; message: string }>("previous_track");
const setQueue = callable<[Track[], number], { success: boolean; message: string }>("set_queue");
const toggleShuffle = callable<[], { success: boolean; shuffle: boolean }>("toggle_shuffle");
const toggleLoop = callable<[], { success: boolean; loop: string }>("toggle_loop");
const setVolume = callable<[number], { success: boolean; volume: number }>("set_volume");

// Music API (server-agnostic)
const getPlaylists = callable<[], { success: boolean; playlists: Playlist[] }>("get_playlists");
const getPlaylistTracks = callable<[string], { success: boolean; tracks: Track[] }>("get_playlist_tracks");
const searchTracks = callable<[string], { success: boolean; results: Track[] }>("search");
const searchAlbums = callable<[string], { success: boolean; albums: Album[] }>("search_albums");
const searchArtists = callable<[string], { success: boolean; artists: Artist[] }>("search_artists");
const getAlbumTracks = callable<[string], { success: boolean; tracks: Track[] }>("get_album_tracks");
const getArtistTracks = callable<[string], { success: boolean; tracks: Track[] }>("get_artist_tracks");
const playQueueIndex = callable<[number], { success: boolean; message?: string }>("play_queue_index");
const getQueueWithImages = callable<[number, number], { success: boolean; tracks: Track[]; total: number; current_index: number }>("get_queue_with_images");

// =============================================================================
// Helpers
// =============================================================================

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SERVER_TYPE_LABELS: Record<ServerType, string> = {
  plex: "Plex",
  jellyfin: "Jellyfin",
  emby: "Emby",
  subsonic: "Navidrome",
};

const SERVER_TYPE_COLORS: Record<ServerType, string> = {
  plex: "#e5a00d",
  jellyfin: "#00a4dc",
  emby: "#52b54b",
  subsonic: "#0aa5ff",
};

// Module-level variable for passing server config to edit page
let editServerConfig: ServerConfig | null = null;

// =============================================================================
// Theme
// =============================================================================

const theme = {
  surface: "#131318",
  surfaceContainer: "#1b1b24",
  surfaceContainerHigh: "#23232f",
  surfaceContainerHighest: "#2c2c3b",
  primary: "#1ed760",
  primaryDim: "#19b84d",
  primaryContainer: "#14351f",
  onPrimary: "#06140b",
  secondary: "#b4b4c4",
  secondaryContainer: "#33334a",
  onSurface: "#f1f1f6",
  onSurfaceVariant: "#9a9aac",
  outline: "#43435a",
  error: "#ff6b6b",
  errorContainer: "#3f1d1d",
  success: "#4ade80",
  successContainer: "#163d27",
  radiusSm: "10px",
  radiusMd: "14px",
  radiusLg: "20px",
  radiusXl: "28px",
  radiusFull: "9999px",
  transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
  transitionSlow: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
};

// One type scale for the whole plugin, so a title in the panel and a title on
// a page are the same thing rather than two similar guesses.
const type = {
  hero: { fontSize: "17px", fontWeight: "600", letterSpacing: "-0.3px" } as React.CSSProperties,
  pageTitle: { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.4px" } as React.CSSProperties,
  title: { fontSize: "14px", fontWeight: "600" } as React.CSSProperties,
  body: { fontSize: "13px", fontWeight: "500" } as React.CSSProperties,
  meta: { fontSize: "11px", fontWeight: "500" } as React.CSSProperties,
  label: {
    fontSize: "11px", fontWeight: "700",
    letterSpacing: "0.8px", textTransform: "uppercase",
  } as React.CSSProperties,
};

const ellipsis: React.CSSProperties = {
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

// Focusable renders a plain div, so gamepad focus produces no visual change on
// its own — on a controller-only device that leaves no way to tell what's
// selected. Steam's navigation adds `gpfocus` to the focused element; `:focus`
// covers mouse/touch. Also defines the spinner keyframes used by the search page.
const STYLE_ELEMENT_ID = "museck-styles";
const GLOBAL_STYLES = `
@keyframes museck-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.museck-ctl, .museck-chip, .museck-row { outline: none; }
.museck-ctl:focus, .museck-ctl.gpfocus {
  transform: scale(1.12);
  filter: brightness(1.2);
  box-shadow: 0 0 0 3px ${theme.primary}, 0 6px 24px rgba(0, 0, 0, 0.45) !important;
}
.museck-chip:focus, .museck-chip.gpfocus {
  border-color: ${theme.primary} !important;
  filter: brightness(1.2);
}
.museck-row:focus, .museck-row.gpfocus {
  background: ${theme.surfaceContainerHigh} !important;
  border-color: ${theme.primary}88 !important;
  transform: translateX(2px);
}
`;

function injectGlobalStyles() {
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ELEMENT_ID;
  el.textContent = GLOBAL_STYLES;
  document.head.appendChild(el);
}

function removeGlobalStyles() {
  document.getElementById(STYLE_ELEMENT_ID)?.remove();
}

// DialogButton is Steam's real button primitive: it registers with gamepad
// navigation, draws a focus ring and activates on A. A styled Focusable div
// does none of that reliably, which is why the transport controls could not be
// reached with a controller. Its default chrome has to be flattened to keep
// the circular look.
function circleButtonStyle(size: number, background: string, color: string): React.CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    padding: 0,
    margin: 0,
    border: "none",
    borderRadius: theme.radiusFull,
    background,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: theme.transition,
  };
}

// =============================================================================
// Shared UI primitives
// =============================================================================

/** Square cover art with a placeholder underneath, so a slow or broken image
 *  degrades to an icon rather than an empty hole. */
function Art({ src, size, radius, iconSize, elevated }: {
  src?: string; size: number | string; radius?: string; iconSize?: number; elevated?: boolean;
}) {
  return (
    <div style={{
      width: typeof size === "number" ? `${size}px` : size,
      height: typeof size === "number" ? `${size}px` : size,
      borderRadius: radius || theme.radiusSm,
      background: `linear-gradient(135deg, ${theme.surfaceContainerHighest} 0%, ${theme.surfaceContainer} 100%)`,
      overflow: "hidden", flexShrink: 0, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: elevated
        ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${theme.outline}33`
        : `0 2px 8px rgba(0,0,0,0.25)`,
    }}>
      <FaMusic style={{ fontSize: `${iconSize || 18}px`, color: theme.outline }} />
      {src ? (
        <img
          src={src}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : null}
    </div>
  );
}

function SectionLabel({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "2px 2px 6px",
    }}>
      <span style={{ ...type.label, color: theme.onSurfaceVariant }}>{children}</span>
      {trailing}
    </div>
  );
}

/** A full-width list row. DialogButton keeps it controller-focusable while
 *  letting the row look like a list item rather than a Steam button. */
function RowButton({ onClick, children, actionDescription, accent }: {
  onClick: () => void; children: React.ReactNode; actionDescription?: string; accent?: string;
}) {
  return (
    <DialogButton
      className="museck-row"
      focusable={true}
      onClick={onClick}
      onOKActionDescription={actionDescription}
      style={{
        width: "100%", minWidth: 0, margin: 0, padding: "10px 12px",
        background: theme.surfaceContainer,
        border: `1px solid ${accent ? accent + "55" : theme.outline + "22"}`,
        borderRadius: theme.radiusMd,
        display: "flex", alignItems: "center", gap: "12px",
        textAlign: "left", color: theme.onSurface,
        transition: theme.transition,
      }}
    >
      {children}
    </DialogButton>
  );
}

/** Title + subtitle pair that truncates instead of wrapping the row. */
function RowText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
      <div style={{ ...type.body, color: theme.onSurface, ...ellipsis }}>{title}</div>
      {subtitle ? (
        <div style={{ ...type.meta, color: theme.onSurfaceVariant, marginTop: "2px", ...ellipsis }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px",
      color, background: color + "22", border: `1px solid ${color}33`,
      padding: "3px 8px", borderRadius: theme.radiusFull,
      flexShrink: 0, whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

/** Segmented control. Reads as one grouped switch instead of a stack of
 *  full-width buttons, and keeps left/right navigation between the segments. */
function SegmentedTabs<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string; icon: React.ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <Focusable
      style={{
        display: "flex", gap: "4px", width: "100%", padding: "4px",
        background: theme.surfaceContainer,
        border: `1px solid ${theme.outline}22`,
        borderRadius: theme.radiusFull,
      }}
      //@ts-ignore
      flow-children="horizontal"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <DialogButton
            key={option.value}
            className="museck-chip"
            focusable={true}
            onClick={() => onChange(option.value)}
            onOKActionDescription={option.label}
            style={{
              flex: 1, minWidth: 0, width: "auto", margin: 0, padding: "7px 10px",
              background: active ? theme.primary : "transparent",
              color: active ? theme.onPrimary : theme.onSurfaceVariant,
              border: "none", borderRadius: theme.radiusFull,
              fontSize: "13px", fontWeight: active ? "700" : "500",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              boxShadow: active ? `0 2px 10px ${theme.primary}55` : "none",
              transition: theme.transition,
            }}
          >
            {option.icon}
            {option.label}
          </DialogButton>
        );
      })}
    </Focusable>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px", width: "100%",
      background: `linear-gradient(180deg, ${theme.surfaceContainer} 0%, transparent 100%)`,
      borderRadius: theme.radiusLg,
    }}>
      <div style={{ fontSize: "40px", color: theme.outline, opacity: 0.35, marginBottom: "12px" }}>
        {icon}
      </div>
      <div style={{ ...type.title, color: theme.onSurfaceVariant }}>{title}</div>
      {subtitle ? (
        <div style={{ ...type.meta, color: theme.outline, marginTop: "6px" }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

type StatusKind = "none" | "success" | "error" | "info";

function StatusBanner({ kind, message }: { kind: StatusKind; message: string }) {
  if (kind === "none") return null;
  const palette = {
    success: { bg: theme.successContainer, fg: theme.success },
    info: { bg: theme.secondaryContainer, fg: theme.secondary },
    error: { bg: theme.errorContainer, fg: theme.error },
  }[kind as "success" | "info" | "error"];
  return (
    <div style={{
      width: "100%", padding: "11px 14px", borderRadius: theme.radiusMd,
      background: palette.bg, color: palette.fg,
      border: `1px solid ${palette.fg}33`,
      textAlign: "center", ...type.body,
    }}>
      {message}
    </div>
  );
}

function Spinner({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, margin: "0 auto 14px",
      borderRadius: theme.radiusFull,
      border: `3px solid ${theme.surfaceContainerHighest}`,
      borderTopColor: theme.primary,
      animation: "museck-spin 0.9s linear infinite",
    }} />
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 16px", width: "100%", color: theme.onSurfaceVariant }}>
      <Spinner />
      <div style={type.body}>{label}</div>
    </div>
  );
}

/** Page header for the full-screen routes: title, optional subtitle, and a
 *  Back control that is the first thing focus lands on. */
function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <PanelSectionRow>
        <div style={{ width: "100%", padding: "2px 0 10px" }}>
          <div style={{ ...type.pageTitle, color: theme.onSurface }}>{title}</div>
          {subtitle ? (
            <div style={{ ...type.body, color: theme.onSurfaceVariant, marginTop: "3px" }}>{subtitle}</div>
          ) : null}
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <RowButton onClick={() => Navigation.NavigateBack()} actionDescription="Back">
          <FaChevronLeft style={{ fontSize: "12px", color: theme.primary, flexShrink: 0 }} />
          <span style={{ ...type.body, color: theme.onSurface }}>Back</span>
        </RowButton>
      </PanelSectionRow>
    </>
  );
}

/** Shared scroll container for the full-screen routes. */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: "40px", height: "calc(100% - 40px)",
      overflowY: "auto", overflowX: "hidden", paddingBottom: "60px",
    }}>
      {children}
      <div style={{ height: "80px" }} />
    </div>
  );
}

function chipButtonStyle(active: boolean): React.CSSProperties {
  return {
    minWidth: "0",
    width: "auto",
    padding: "8px 16px",
    margin: 0,
    background: active ? theme.primaryContainer : theme.surfaceContainer,
    border: `1px solid ${active ? theme.primary + "44" : theme.outline + "44"}`,
    borderRadius: theme.radiusXl,
    color: active ? theme.primary : theme.onSurfaceVariant,
    fontSize: "12px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: theme.transition,
  };
}

// =============================================================================
// Now Playing Component
// =============================================================================

function NowPlaying() {
  const [status, setStatus] = useState<PlaybackStatus | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [localVolume, setLocalVolume] = useState<number | null>(null);
  // Refs, not state: the poll below is created once, so a state value would be
  // captured at its initial 0 and the grace period would never apply.
  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVolumeInteractionRef = useRef(0);
  // Up-next rows carry inlined cover art, so they are fetched only when the
  // queue window moves rather than on every status tick.
  const [upNextTracks, setUpNextTracks] = useState<Track[]>([]);
  const upNextWindowRef = useRef("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const s = await getPlaybackStatus();
        setStatus(s);
        // Hand the slider back to the backend value once the user has
        // stopped dragging, so an in-progress drag isn't yanked back.
        if (s && Date.now() - lastVolumeInteractionRef.current > 2000) {
          setLocalVolume(null);
        }

        const windowKey = `${s.queue_index}:${s.queue_length}:${s.current_track?.ratingKey ?? ""}`;
        if (windowKey !== upNextWindowRef.current) {
          upNextWindowRef.current = windowKey;
          if (s.queue_index >= 0 && s.queue_length > s.queue_index + 1) {
            const res = await getQueueWithImages(s.queue_index + 1, 4);
            if (res.success) setUpNextTracks(res.tracks);
          } else {
            setUpNextTracks([]);
          }
        }
      } catch (e) {
        console.error("Failed to get playback status:", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => {
      clearInterval(interval);
      if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    };
  }, []);

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

  const handlePlayPause = async () => { await togglePlayPause(); };
  const handleNext = async () => { await nextTrack(); };
  const handlePrevious = async () => { await previousTrack(); };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    const result = await getPlaylistTracks(playlist.key);
    if (result.success && result.tracks.length > 0) {
      await setQueue(result.tracks, 0);
    }
  };

  const handleShuffle = async () => { await toggleShuffle(); };
  const handleLoop = async () => { await toggleLoop(); };

  const handleVolumeChange = (newVal: number) => {
    setLocalVolume(newVal);
    lastVolumeInteractionRef.current = Date.now();
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = setTimeout(() => {
      volumeTimerRef.current = null;
      setVolume(newVal).catch((e) => console.error("Failed to set volume:", e));
    }, 200);
  };

  const track = status?.current_track;
  const isPlaying = status?.is_playing || false;
  const duration = status?.duration || 0;
  const position = status?.position || 0;
  const shuffleOn = status?.shuffle || false;
  const loopMode = status?.loop || "off";
  const volume = localVolume !== null ? localVolume : (status?.volume || 75);
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const queueLength = status?.queue_length || 0;
  // Show the lightweight preview immediately, then swap in the art-bearing
  // rows once they arrive, so the list never appears empty while loading.
  const upNext: UpNextItem[] =
    (upNextTracks.length ? upNextTracks : (status?.queue_preview || [])).slice(0, 4);

  return (
    <>
      <PanelSection title="Now Playing">
        {track ? (
          <>
            {/* Hero album art */}
            <PanelSectionRow>
              <div style={{
                width: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", padding: "4px 0 2px",
              }}>
                <div style={{ width: "100%", maxWidth: "168px", aspectRatio: "1 / 1" }}>
                  <Art
                    src={track.thumb || track.parentThumb}
                    size="100%"
                    radius={theme.radiusLg}
                    iconSize={44}
                    elevated
                  />
                </div>
              </div>
            </PanelSectionRow>

            {/* Track identity */}
            <PanelSectionRow>
              <div style={{ width: "100%", textAlign: "center", padding: "2px 0 6px" }}>
                <Marquee play={true} speed={26} delay={2} fadeLength={12} center={true}
                  style={{ ...type.hero, color: theme.onSurface }}>
                  {track.title}
                </Marquee>
                <div style={{ ...type.body, color: theme.onSurfaceVariant, marginTop: "3px", ...ellipsis }}>
                  {track.artist}
                </div>
                {track.album ? (
                  <div style={{ ...type.meta, color: theme.outline, marginTop: "2px", ...ellipsis }}>
                    {track.album}
                  </div>
                ) : null}
              </div>
            </PanelSectionRow>

            {/* Progress */}
            <PanelSectionRow>
              <div style={{ width: "100%", padding: "2px 0 4px" }}>
                <div style={{
                  height: "5px", background: theme.surfaceContainerHighest,
                  borderRadius: theme.radiusFull, overflow: "hidden", position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0,
                    width: `${Math.min(100, Math.max(0, progressPercent))}%`, height: "100%",
                    background: `linear-gradient(90deg, ${theme.primaryDim} 0%, ${theme.primary} 100%)`,
                    borderRadius: theme.radiusFull,
                    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 0 10px ${theme.primary}66`,
                  }} />
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", marginTop: "6px",
                  ...type.meta, color: theme.onSurfaceVariant,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  <span>{formatTime(position)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </PanelSectionRow>

            {/* Playback Controls */}
            <PanelSectionRow>
              <Focusable style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", width: "100%", padding: "8px 0" }}
                //@ts-ignore
                flow-children="horizontal"
              >
                <DialogButton
                  className="museck-ctl"
                  focusable={true}
                  onClick={handlePrevious}
                  onOKActionDescription="Previous"
                  style={{
                    ...circleButtonStyle(48, theme.surfaceContainerHigh, theme.onSurface),
                    boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                  }}
                >
                  <FaStepBackward style={{ fontSize: "16px" }} />
                </DialogButton>
                <DialogButton
                  className="museck-ctl"
                  focusable={true}
                  onClick={handlePlayPause}
                  onOKActionDescription={isPlaying ? "Pause" : "Play"}
                  style={{
                    ...circleButtonStyle(64, `linear-gradient(135deg, ${theme.primary} 0%, #19b84d 100%)`, theme.onPrimary),
                    boxShadow: `0 4px 20px ${theme.primary}55, 0 2px 8px rgba(0,0,0,0.3)`,
                  }}
                >
                  {isPlaying ? <FaPause style={{ fontSize: "24px" }} /> : <FaPlay style={{ fontSize: "24px", marginLeft: "4px" }} />}
                </DialogButton>
                <DialogButton
                  className="museck-ctl"
                  focusable={true}
                  onClick={handleNext}
                  onOKActionDescription="Next"
                  style={{
                    ...circleButtonStyle(48, theme.surfaceContainerHigh, theme.onSurface),
                    boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                  }}
                >
                  <FaStepForward style={{ fontSize: "16px" }} />
                </DialogButton>
              </Focusable>
            </PanelSectionRow>

            {/* Shuffle & Loop */}
            <PanelSectionRow>
              <Focusable style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "4px 0", width: "100%" }}
                //@ts-ignore
                flow-children="horizontal"
              >
                <DialogButton
                  className="museck-chip"
                  focusable={true}
                  onClick={handleShuffle}
                  onOKActionDescription={shuffleOn ? "Turn shuffle off" : "Turn shuffle on"}
                  style={chipButtonStyle(shuffleOn)}
                >
                  <FaRandom style={{ fontSize: "12px" }} /> Shuffle
                </DialogButton>
                <DialogButton
                  className="museck-chip"
                  focusable={true}
                  onClick={handleLoop}
                  onOKActionDescription="Change repeat mode"
                  style={chipButtonStyle(loopMode !== "off")}
                >
                  <FaRedo style={{ fontSize: "12px" }} />
                  {loopMode === "off" ? "Loop" : loopMode === "queue" ? "All" : "One"}
                </DialogButton>
              </Focusable>
            </PanelSectionRow>

            {/* Volume */}
            <PanelSectionRow>
              <SliderField label="Music Volume" description="" value={volume} min={0} max={100} step={1} showValue={true} onChange={handleVolumeChange} />
            </PanelSectionRow>

            {/* Up next */}
            {upNext.length > 0 && (
              <>
                <PanelSectionRow>
                  <SectionLabel
                    trailing={
                      <span style={{ ...type.meta, color: theme.primary }}>{queueLength} in queue</span>
                    }
                  >
                    Up Next
                  </SectionLabel>
                </PanelSectionRow>
                {upNext.map((qTrack, idx) => (
                  <PanelSectionRow key={`${qTrack.ratingKey}-${idx}`}>
                    <RowButton
                      onClick={() => playQueueIndex((status?.queue_index ?? 0) + idx + 1)}
                      actionDescription="Play"
                    >
                      <span style={{
                        ...type.meta, color: theme.outline, width: "16px",
                        fontVariantNumeric: "tabular-nums", flexShrink: 0,
                      }}>
                        {(status?.queue_index ?? 0) + idx + 2}
                      </span>
                      <Art src={qTrack.thumb} size={36} iconSize={12} />
                      <RowText title={qTrack.title} subtitle={qTrack.artist} />
                    </RowButton>
                  </PanelSectionRow>
                ))}
                <PanelSectionRow>
                  <RowButton
                    onClick={() => Navigation.Navigate("/museck-queue")}
                    actionDescription="Open queue"
                  >
                    <FaList style={{ fontSize: "13px", color: theme.primary, flexShrink: 0 }} />
                    <RowText title="View full queue" />
                    <FaChevronRight style={{ fontSize: "11px", color: theme.outline, flexShrink: 0 }} />
                  </RowButton>
                </PanelSectionRow>
              </>
            )}
          </>
        ) : (
          <PanelSectionRow>
            <EmptyState
              icon={<FaMusic />}
              title="Nothing playing"
              subtitle="Pick a playlist below, or search your library"
            />
          </PanelSectionRow>
        )}
      </PanelSection>

      {/* Library */}
      <PanelSection title="Library">
        <PanelSectionRow>
          <RowButton
            onClick={() => Navigation.Navigate("/museck-search")}
            actionDescription="Search"
            accent={theme.primary}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: theme.radiusSm,
              background: theme.primaryContainer, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaSearch style={{ fontSize: "13px", color: theme.primary }} />
            </div>
            <RowText title="Search music" subtitle="Artists, albums and tracks" />
            <FaChevronRight style={{ fontSize: "11px", color: theme.outline, flexShrink: 0 }} />
          </RowButton>
        </PanelSectionRow>
      </PanelSection>

      {/* Playlists */}
      <PanelSection title="Playlists">
        {loading ? (
          <PanelSectionRow>
            <LoadingState label="Loading playlists" />
          </PanelSectionRow>
        ) : playlists.length > 0 ? (
          playlists.map((pl) => (
            <PanelSectionRow key={pl.key}>
              <RowButton onClick={() => handlePlayPlaylist(pl)} actionDescription="Play playlist">
                <Art src={pl.thumb} size={40} iconSize={14} />
                <RowText
                  title={pl.title}
                  subtitle={`${pl.count} ${pl.count === 1 ? "track" : "tracks"}`}
                />
                <div style={{
                  width: "26px", height: "26px", borderRadius: theme.radiusFull,
                  background: theme.primaryContainer, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FaPlay style={{ fontSize: "9px", color: theme.primary, marginLeft: "2px" }} />
                </div>
              </RowButton>
            </PanelSectionRow>
          ))
        ) : (
          <PanelSectionRow>
            <EmptyState
              icon={<FaList />}
              title="No playlists found"
              subtitle="Check your server connection in Settings"
            />
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
}

// =============================================================================
// Server List Page (full-screen settings)
// =============================================================================

function ServerListPage() {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadServers = async () => {
    try {
      const settings = await getSettings();
      setServers(settings.servers || []);
      setActiveId(settings.active_server_id || "");
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    setLoading(false);
  };

  useEffect(() => { loadServers(); }, []);

  const handleActivate = async (serverId: string) => {
    await setActiveServer(serverId);
    setActiveId(serverId);
  };

  const handleDelete = async (serverId: string) => {
    await removeServer(serverId);
    await loadServers();
  };

  const handleEdit = (server: ServerConfig) => {
    editServerConfig = { ...server };
    Navigation.Navigate("/museck-edit-server");
  };

  return (
    <PageShell>
      <PanelSection>
        <PageHeader
          title="Servers"
          subtitle={servers.length ? `${servers.length} configured` : undefined}
        />
        <PanelSectionRow>
          <RowButton
            onClick={() => Navigation.Navigate("/museck-add-server")}
            actionDescription="Add server"
            accent={theme.primary}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: theme.radiusSm,
              background: theme.primaryContainer, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaPlus style={{ fontSize: "12px", color: theme.primary }} />
            </div>
            <RowText title="Add server" subtitle="Plex, Jellyfin, Emby or Navidrome" />
          </RowButton>
        </PanelSectionRow>
      </PanelSection>

      {loading ? (
        <PanelSection>
          <PanelSectionRow>
            <LoadingState label="Loading servers" />
          </PanelSectionRow>
        </PanelSection>
      ) : servers.length === 0 ? (
        <PanelSection>
          <PanelSectionRow>
            <EmptyState
              icon={<FaServer />}
              title="No servers configured"
              subtitle="Add a server to get started"
            />
          </PanelSectionRow>
        </PanelSection>
      ) : (
        <PanelSection>
          {servers.map((srv) => {
            const isActive = srv.id === activeId;
            const typeColor = SERVER_TYPE_COLORS[srv.type] || theme.primary;
            return (
              <PanelSectionRow key={srv.id}>
                <div style={{
                  width: "100%", marginBottom: "10px",
                  background: theme.surfaceContainer,
                  border: `1px solid ${isActive ? theme.success + "55" : theme.outline + "22"}`,
                  borderRadius: theme.radiusMd, overflow: "hidden",
                }}>
                  {/* Identity */}
                  <div style={{ padding: "12px 13px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                      <div style={{
                        width: "7px", height: "7px", borderRadius: theme.radiusFull, flexShrink: 0,
                        backgroundColor: isActive ? theme.success : theme.outline,
                        boxShadow: isActive ? `0 0 8px ${theme.success}aa` : "none",
                      }} />
                      {isActive ? (
                        <span style={{ ...type.label, color: theme.success }}>Active</span>
                      ) : null}
                      <div style={{ marginLeft: "auto" }}>
                        <Badge color={typeColor}>{SERVER_TYPE_LABELS[srv.type]}</Badge>
                      </div>
                    </div>
                    <div style={{ ...type.title, color: theme.onSurface, ...ellipsis }}>
                      {srv.name || "Unnamed Server"}
                    </div>
                    <div style={{ ...type.meta, color: theme.onSurfaceVariant, marginTop: "2px", ...ellipsis }}>
                      {srv.server_url}
                    </div>
                  </div>

                  {/* Actions */}
                  <Focusable
                    style={{
                      display: "flex", gap: "6px", padding: "0 10px 10px",
                    }}
                    //@ts-ignore
                    flow-children="horizontal"
                  >
                    {!isActive && (
                      <DialogButton
                        className="museck-chip"
                        focusable={true}
                        onClick={() => handleActivate(srv.id)}
                        onOKActionDescription="Make active"
                        style={{
                          ...chipButtonStyle(true), flex: 1, padding: "7px 10px", fontSize: "12px",
                        }}
                      >
                        <FaCheck style={{ fontSize: "11px" }} /> Activate
                      </DialogButton>
                    )}
                    <DialogButton
                      className="museck-chip"
                      focusable={true}
                      onClick={() => handleEdit(srv)}
                      onOKActionDescription="Edit server"
                      style={{ ...chipButtonStyle(false), flex: 1, padding: "7px 10px", fontSize: "12px" }}
                    >
                      <FaCog style={{ fontSize: "11px" }} /> Edit
                    </DialogButton>
                    <DialogButton
                      className="museck-chip"
                      focusable={true}
                      onClick={() => handleDelete(srv.id)}
                      onOKActionDescription="Delete server"
                      style={{
                        ...chipButtonStyle(false), flex: 1, padding: "7px 10px", fontSize: "12px",
                        color: theme.error, border: `1px solid ${theme.error}33`,
                      }}
                    >
                      <FaTrash style={{ fontSize: "11px" }} /> Delete
                    </DialogButton>
                  </Focusable>
                </div>
              </PanelSectionRow>
            );
          })}
        </PanelSection>
      )}
    </PageShell>
  );
}

// =============================================================================
// Add / Edit Server Page
// =============================================================================

function ServerFormPage({ existingServer }: { existingServer?: ServerConfig | null }) {
  const isEditing = !!existingServer;
  const [serverType, setServerType] = useState<ServerType | null>(existingServer?.type || null);
  const [name, setName] = useState(existingServer?.name || "");
  const [serverUrl, setServerUrl] = useState(existingServer?.server_url || "");
  // Plex
  const [token, setToken] = useState(existingServer?.token || "");
  // Jellyfin / Emby / Subsonic
  const [username, setUsername] = useState(existingServer?.username || "");
  const [password, setPassword] = useState(existingServer?.password || "");

  const [status, setStatus] = useState<{ type: "none" | "success" | "error" | "info"; message: string }>({ type: "none", message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  // Track the server ID (generated by backend on save)
  const [serverId, setServerId] = useState(existingServer?.id || "");
  // Credentials obtained from a Jellyfin/Emby auth exchange
  const [credentials, setCredentials] = useState<{ api_key?: string; user_id?: string }>({
    api_key: existingServer?.api_key,
    user_id: existingServer?.user_id,
  });
  // Server discovery
  const [discoveredServers, setDiscoveredServers] = useState<DiscoveredServer[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const buildConfig = (): ServerConfig => {
    const config: ServerConfig = {
      id: serverId,
      name: name || SERVER_TYPE_LABELS[serverType!] + " Server",
      type: serverType!,
      server_url: serverUrl.replace(/\/+$/, ""),
    };
    if (serverType === "plex") {
      config.token = token;
    } else {
      // Jellyfin, Emby and Subsonic all authenticate with username/password
      config.username = username;
      config.password = password;
    }
    // Carry forward the token exchanged during Jellyfin/Emby auth so saving an
    // edit doesn't discard it. The backend drops these if credentials changed.
    if (credentials.api_key) config.api_key = credentials.api_key;
    if (credentials.user_id) config.user_id = credentials.user_id;
    return config;
  };

  const handleSave = async () => {
    if (!serverType || !serverUrl) return;
    setIsSaving(true);
    try {
      const config = buildConfig();
      const result = await saveServer(config);
      if (result.success) {
        if (result.id && result.id !== serverId) {
          setServerId(result.id);
        }
        setStatus({ type: "success", message: "Saved!" });
        setTimeout(() => Navigation.NavigateBack(), 800);
      } else {
        setStatus({ type: "error", message: "Failed to save" });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Save error" });
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    if (!serverType || !serverUrl) return;
    setIsTesting(true);
    setStatus({ type: "info", message: "Testing..." });
    try {
      // Test without saving — a failed test shouldn't leave a broken server
      // in the list (and potentially make it the active one).
      const result = await testServerConfig(buildConfig());
      if (result.success) {
        setStatus({ type: "success", message: `Connected: ${result.server_name || "OK"}` });
        if (!name && result.server_name) setName(result.server_name);
        if (result.api_key || result.user_id) {
          setCredentials({ api_key: result.api_key, user_id: result.user_id });
        }
      } else {
        setStatus({ type: "error", message: result.message || "Connection failed" });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Test failed" });
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
    }
    setIsDiscovering(false);
  };

  const handleSelectDiscovered = (server: DiscoveredServer) => {
    setServerUrl(server.url);
    if (!name) setName(server.name);
    if (server.type) setServerType(server.type);
    setDiscoveredServers([]);
  };

  const usesPassword = serverType === "jellyfin" || serverType === "emby" || serverType === "subsonic";

  return (
    <PageShell>
      <PanelSection>
        <PageHeader
          title={isEditing ? "Edit Server" : "Add Server"}
          subtitle={isEditing ? name || undefined : "Connect a music library"}
        />
      </PanelSection>

      {/* Server type */}
      {!isEditing ? (
        <PanelSection title="Server Type">
          {(["plex", "jellyfin", "emby", "subsonic"] as ServerType[]).map((option) => {
            const selected = serverType === option;
            const color = SERVER_TYPE_COLORS[option];
            return (
              <PanelSectionRow key={option}>
                <RowButton
                  onClick={() => setServerType(option)}
                  actionDescription={`Use ${SERVER_TYPE_LABELS[option]}`}
                  accent={selected ? color : undefined}
                >
                  <div style={{
                    width: "26px", height: "26px", borderRadius: theme.radiusFull, flexShrink: 0,
                    background: selected ? color + "22" : "transparent",
                    border: `1px solid ${selected ? color : theme.outline}66`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selected ? <FaCheck style={{ fontSize: "10px", color }} /> : null}
                  </div>
                  <RowText title={SERVER_TYPE_LABELS[option]} />
                  <Badge color={color}>{option === "subsonic" ? "SUBSONIC" : option.toUpperCase()}</Badge>
                </RowButton>
              </PanelSectionRow>
            );
          })}
        </PanelSection>
      ) : serverType ? (
        <PanelSection>
          <PanelSectionRow>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
              <Badge color={SERVER_TYPE_COLORS[serverType]}>{SERVER_TYPE_LABELS[serverType]}</Badge>
              <span style={{ ...type.meta, color: theme.onSurfaceVariant }}>
                Server type cannot be changed
              </span>
            </div>
          </PanelSectionRow>
        </PanelSection>
      ) : null}

      {serverType && (
        <>
          <PanelSection title="Connection">
            <PanelSectionRow>
              <TextField
                label="Server name"
                description="Shown in the server list"
                value={name}
                bShowClearAction={true}
                onChange={(e) => setName(e.target.value)}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <TextField
                label="Server URL"
                description="For example 192.168.1.10:32400"
                value={serverUrl}
                bShowClearAction={true}
                onChange={(e) => setServerUrl(e.target.value)}
              />
            </PanelSectionRow>

            {serverType === "plex" && (
              <PanelSectionRow>
                <TextField
                  label="Plex token"
                  description="Found as X-Plex-Token in any Plex web request"
                  value={token}
                  bIsPassword={true}
                  onChange={(e) => setToken(e.target.value)}
                />
              </PanelSectionRow>
            )}

            {usesPassword && (
              <>
                <PanelSectionRow>
                  <TextField
                    label="Username"
                    value={username}
                    bShowClearAction={true}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </PanelSectionRow>
                <PanelSectionRow>
                  <TextField
                    label="Password"
                    value={password}
                    bIsPassword={true}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </PanelSectionRow>
              </>
            )}
          </PanelSection>

          {/* Discovery */}
          {serverType !== "subsonic" && (
            <PanelSection title="Discovery">
              <PanelSectionRow>
                <ButtonItem layout="below" onClick={handleDiscover} disabled={isDiscovering}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    color: theme.secondary, fontWeight: "600",
                  }}>
                    <FaSearch style={{ fontSize: "12px" }} />
                    {isDiscovering ? "Scanning\u2026" : "Auto-detect servers"}
                  </div>
                </ButtonItem>
              </PanelSectionRow>
              {discoveredServers.map((srv, i) => {
                const srvType = srv.type || "plex";
                const srvColor = SERVER_TYPE_COLORS[srvType] || theme.primary;
                return (
                  <PanelSectionRow key={`${srv.url}-${i}`}>
                    <RowButton
                      onClick={() => handleSelectDiscovered(srv)}
                      actionDescription="Use this server"
                    >
                      <FaServer style={{ fontSize: "14px", color: srvColor, flexShrink: 0 }} />
                      <RowText title={srv.name} subtitle={srv.url} />
                      <Badge color={srvColor}>{SERVER_TYPE_LABELS[srvType]}</Badge>
                    </RowButton>
                  </PanelSectionRow>
                );
              })}
            </PanelSection>
          )}

          {/* Actions */}
          <PanelSection title="Actions">
            <PanelSectionRow>
              <ButtonItem layout="below" onClick={handleTest} disabled={isTesting || !serverUrl}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  color: theme.onSurface, fontWeight: "600",
                }}>
                  <FaPlug style={{ fontSize: "12px" }} />
                  {isTesting ? "Testing\u2026" : "Test connection"}
                </div>
              </ButtonItem>
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem layout="below" onClick={handleSave} disabled={isSaving || !serverUrl}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  color: theme.primary, fontWeight: "600",
                }}>
                  <FaCheck style={{ fontSize: "12px" }} />
                  {isSaving ? "Saving\u2026" : "Save server"}
                </div>
              </ButtonItem>
            </PanelSectionRow>
          </PanelSection>

          {status.type !== "none" && (
            <PanelSection>
              <PanelSectionRow>
                <StatusBanner kind={status.type} message={status.message} />
              </PanelSectionRow>
            </PanelSection>
          )}
        </>
      )}
    </PageShell>
  );
}

function AddServerPage() {
  return <ServerFormPage />;
}

function EditServerPage() {
  return <ServerFormPage existingServer={editServerConfig} />;
}

// =============================================================================
// Search Page
// =============================================================================

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
    setTracks([]);
    setAlbums([]);
    setArtists([]);
    try {
      // Fire all three but render each as it arrives instead of waiting for all
      const tracksPromise = searchTracks(query).then((res) => {
        if (res.success) setTracks(res.results.slice(0, 10));
      });
      const albumsPromise = searchAlbums(query).then((res) => {
        if (res.success) setAlbums(res.albums.slice(0, 10));
      });
      const artistsPromise = searchArtists(query).then((res) => {
        if (res.success) setArtists(res.artists.slice(0, 5));
      });
      await Promise.all([tracksPromise, albumsPromise, artistsPromise]);
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
    <PageShell>
      <PanelSection>
        <PageHeader title="Search" subtitle="Find artists, albums and tracks" />
        <PanelSectionRow>
          <TextField
            label="Search your library"
            description="Artist, album or track name"
            value={query}
            bShowClearAction={true}
            onChange={(e) => setQuery(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={handleSearch} disabled={loading || !query.trim()}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              color: query.trim() ? theme.primary : theme.onSurfaceVariant, fontWeight: "600",
            }}>
              <FaSearch style={{ fontSize: "13px" }} />
              {loading ? "Searching\u2026" : "Search"}
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {loading && (
        <PanelSection>
          <PanelSectionRow>
            <LoadingState label={`Searching for "${query}"`} />
          </PanelSectionRow>
        </PanelSection>
      )}

      {!loading && searched && (
        <>
          {artists.length > 0 && (
            <PanelSection title="Artists">
              {artists.map((artist) => (
                <PanelSectionRow key={artist.key}>
                  <RowButton onClick={() => handlePlayArtist(artist)} actionDescription="Play artist">
                    <Art src={artist.thumb} size={44} radius={theme.radiusFull} iconSize={16} />
                    <RowText title={artist.title} subtitle="Artist" />
                    <FaPlay style={{ fontSize: "10px", color: theme.primary, flexShrink: 0 }} />
                  </RowButton>
                </PanelSectionRow>
              ))}
            </PanelSection>
          )}

          {albums.length > 0 && (
            <PanelSection title="Albums">
              {albums.map((album) => (
                <PanelSectionRow key={album.key}>
                  <RowButton onClick={() => handlePlayAlbum(album)} actionDescription="Play album">
                    <Art src={album.thumb} size={44} iconSize={16} />
                    <RowText
                      title={album.title}
                      subtitle={album.year ? `${album.artist} \u2022 ${album.year}` : album.artist}
                    />
                    <FaPlay style={{ fontSize: "10px", color: theme.primary, flexShrink: 0 }} />
                  </RowButton>
                </PanelSectionRow>
              ))}
            </PanelSection>
          )}

          {tracks.length > 0 && (
            <PanelSection title="Tracks">
              {tracks.map((track) => (
                <PanelSectionRow key={track.ratingKey}>
                  <RowButton onClick={() => handlePlayTrack(track, tracks)} actionDescription="Play track">
                    <Art src={track.thumb} size={44} iconSize={16} />
                    <RowText title={track.title} subtitle={track.artist} />
                    <FaPlay style={{ fontSize: "10px", color: theme.primary, flexShrink: 0 }} />
                  </RowButton>
                </PanelSectionRow>
              ))}
            </PanelSection>
          )}

          {artists.length === 0 && albums.length === 0 && tracks.length === 0 && (
            <PanelSection>
              <PanelSectionRow>
                <EmptyState
                  icon={<FaSearch />}
                  title="No results"
                  subtitle={`Nothing matched "${query}"`}
                />
              </PanelSectionRow>
            </PanelSection>
          )}
        </>
      )}

      {!loading && !searched && (
        <PanelSection>
          <PanelSectionRow>
            <EmptyState
              icon={<FaSearch />}
              title="Search for music"
              subtitle="Find artists, albums and tracks"
            />
          </PanelSectionRow>
        </PanelSection>
      )}
    </PageShell>
  );
}

// =============================================================================
// Queue Page
// =============================================================================

function QueuePage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [totalTracks, setTotalTracks] = useState(0);
  const [upNextTracks, setUpNextTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Identifies the currently loaded window of the queue. The status poll runs
  // every 5s, but the artwork below is base64-inlined by the backend — so only
  // re-request it when the window actually moved, not on every tick.
  const loadedWindowRef = useRef<string>("");

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const s = await getPlaybackStatus();
        const total = s.queue_length || 0;
        setCurrentTrack(s.current_track);
        setCurrentIndex(s.queue_index);
        setTotalTracks(total);

        // Include the track so swapping to a different queue of the same
        // length at the same position still refreshes the list.
        const windowKey = `${s.queue_index}:${total}:${s.current_track?.ratingKey ?? ""}`;
        if (windowKey !== loadedWindowRef.current) {
          loadedWindowRef.current = windowKey;
          if (s.queue_index >= 0 && total > s.queue_index + 1) {
            const result = await getQueueWithImages(s.queue_index + 1, 30);
            if (result.success) setUpNextTracks(result.tracks);
          } else {
            setUpNextTracks([]);
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

  const handlePlayIndex = async (index: number) => { await playQueueIndex(index); };
  const remainingCount = Math.max(0, totalTracks - currentIndex - 31);
  const upcoming = Math.max(0, totalTracks - currentIndex - 1);

  return (
    <PageShell>
      <PanelSection>
        <PageHeader
          title="Queue"
          subtitle={totalTracks ? `${totalTracks} ${totalTracks === 1 ? "track" : "tracks"}` : undefined}
        />
      </PanelSection>

      {loading ? (
        <PanelSection>
          <PanelSectionRow>
            <LoadingState label="Loading queue" />
          </PanelSectionRow>
        </PanelSection>
      ) : (
        <>
          {currentTrack && (
            <PanelSection title="Now Playing">
              <PanelSectionRow>
                <div style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 13px", borderRadius: theme.radiusMd,
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDim} 100%)`,
                  boxShadow: `0 6px 24px ${theme.primary}44`,
                }}>
                  <Art src={currentTrack.thumb} size={46} iconSize={16} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...type.title, color: theme.onPrimary, ...ellipsis }}>
                      {currentTrack.title}
                    </div>
                    <div style={{
                      ...type.meta, color: "rgba(0,0,0,0.66)", marginTop: "2px", ...ellipsis,
                    }}>
                      {currentTrack.artist}
                    </div>
                  </div>
                  {/* Equaliser bars, purely decorative */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "20px", flexShrink: 0 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{
                        width: "3px", height: `${6 + i * 4}px`,
                        backgroundColor: theme.onPrimary, borderRadius: "2px", opacity: 0.75,
                      }} />
                    ))}
                  </div>
                </div>
              </PanelSectionRow>
            </PanelSection>
          )}

          {upNextTracks.length > 0 && (
            <PanelSection title={`Up Next (${upcoming})`}>
              {upNextTracks.map((track, idx) => {
                const actualIndex = currentIndex + 1 + idx;
                return (
                  <PanelSectionRow key={`${track.ratingKey}-${actualIndex}`}>
                    <RowButton
                      onClick={() => handlePlayIndex(actualIndex)}
                      actionDescription="Play from here"
                    >
                      <span style={{
                        ...type.meta, color: theme.outline, width: "22px",
                        fontVariantNumeric: "tabular-nums", flexShrink: 0,
                      }}>
                        {actualIndex + 1}
                      </span>
                      <Art src={track.thumb} size={38} iconSize={13} />
                      <RowText title={track.title} subtitle={track.artist} />
                    </RowButton>
                  </PanelSectionRow>
                );
              })}
              {remainingCount > 0 && (
                <PanelSectionRow>
                  <div style={{
                    width: "100%", textAlign: "center", padding: "12px",
                    ...type.meta, color: theme.onSurfaceVariant,
                  }}>
                    + {remainingCount} more {remainingCount === 1 ? "track" : "tracks"}
                  </div>
                </PanelSectionRow>
              )}
            </PanelSection>
          )}

          {totalTracks === 0 && (
            <PanelSection>
              <PanelSectionRow>
                <EmptyState
                  icon={<FaList />}
                  title="Queue is empty"
                  subtitle="Play a playlist to get started"
                />
              </PanelSectionRow>
            </PanelSection>
          )}
        </>
      )}
    </PageShell>
  );
}

// =============================================================================
// QAM Settings Component (Server Switcher)
// =============================================================================

function Settings() {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [activeId, setActiveId] = useState("");
  const [status, setStatus] = useState<{ type: "none" | "success" | "error" | "info"; message: string }>({ type: "none", message: "" });
  const [isTesting, setIsTesting] = useState(false);
  const [trackNotify, setTrackNotify] = useState(true);

  // Settings rarely change, but this panel stays mounted while the user edits
  // servers on the full-screen page — so keep polling, and skip the state
  // update (and the re-render it causes) when nothing actually changed.
  const lastSettingsRef = useRef<string>("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        const serialized = JSON.stringify(settings);
        if (serialized === lastSettingsRef.current) return;
        lastSettingsRef.current = serialized;
        setServers(settings.servers || []);
        setActiveId(settings.active_server_id || "");
        setTrackNotify(settings.notify_on_track_change !== false);
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
        setStatus({ type: "success", message: `Connected: ${result.server_name || "OK"}` });
      } else {
        setStatus({ type: "error", message: result.message || "Connection failed" });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Connection error" });
    }
    setIsTesting(false);
  };

  const handleSwitchServer = async (serverId: string) => {
    await setActiveServer(serverId);
    setActiveId(serverId);
    setStatus({ type: "success", message: "Switched!" });
  };

  const activeServer = servers.find(s => s.id === activeId);
  const otherServers = servers.filter(s => s.id !== activeId);

  return (
    <>
    <PanelSection title="Server">
      {/* Active server */}
      {activeServer ? (
        <PanelSectionRow>
          <div style={{
            width: "100%", background: `linear-gradient(135deg, ${theme.surfaceContainerHigh} 0%, ${theme.surfaceContainer} 100%)`,
            borderRadius: theme.radiusMd, padding: "13px 14px",
            border: `1px solid ${theme.outline}22`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px" }}>
              <div style={{
                width: "7px", height: "7px", borderRadius: theme.radiusFull,
                backgroundColor: theme.success, flexShrink: 0,
                boxShadow: `0 0 8px ${theme.success}aa`,
              }} />
              <span style={{ ...type.label, color: theme.success }}>Active</span>
              <div style={{ marginLeft: "auto" }}>
                <Badge color={SERVER_TYPE_COLORS[activeServer.type]}>
                  {SERVER_TYPE_LABELS[activeServer.type]}
                </Badge>
              </div>
            </div>
            <div style={{ ...type.title, color: theme.onSurface, ...ellipsis }}>
              {activeServer.name || "Unnamed Server"}
            </div>
            <div style={{ ...type.meta, color: theme.onSurfaceVariant, marginTop: "2px", ...ellipsis }}>
              {activeServer.server_url}
            </div>
          </div>
        </PanelSectionRow>
      ) : (
        <PanelSectionRow>
          <EmptyState
            icon={<FaServer />}
            title="No server configured"
            subtitle="Add one to start listening"
          />
        </PanelSectionRow>
      )}

      {/* Quick switch */}
      {otherServers.length > 0 && (
        <>
          <PanelSectionRow>
            <SectionLabel>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaExchangeAlt style={{ fontSize: "9px" }} /> Quick Switch
              </span>
            </SectionLabel>
          </PanelSectionRow>
          {otherServers.map((srv) => (
            <PanelSectionRow key={srv.id}>
              <RowButton
                onClick={() => handleSwitchServer(srv.id)}
                actionDescription="Switch to this server"
              >
                <div style={{
                  width: "8px", height: "8px", borderRadius: theme.radiusFull,
                  background: theme.outline, flexShrink: 0,
                }} />
                <RowText title={srv.name || "Unnamed"} subtitle={srv.server_url} />
                <Badge color={SERVER_TYPE_COLORS[srv.type]}>{SERVER_TYPE_LABELS[srv.type]}</Badge>
              </RowButton>
            </PanelSectionRow>
          ))}
        </>
      )}

      {/* Actions */}
      <PanelSectionRow>
        <RowButton
          onClick={() => Navigation.Navigate("/museck-settings")}
          actionDescription="Manage servers"
        >
          <FaCog style={{ fontSize: "13px", color: theme.primary, flexShrink: 0 }} />
          <RowText title="Manage servers" subtitle="Add, edit or remove" />
          <FaChevronRight style={{ fontSize: "11px", color: theme.outline, flexShrink: 0 }} />
        </RowButton>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleTestConnection} disabled={isTesting || !activeServer}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            color: activeServer ? theme.primary : theme.onSurfaceVariant, fontWeight: "600",
          }}>
            <FaPlug style={{ fontSize: "12px" }} />
            {isTesting ? "Testing…" : "Test Connection"}
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {status.type !== "none" && (
        <PanelSectionRow>
          <StatusBanner kind={status.type} message={status.message} />
        </PanelSectionRow>
      )}
    </PanelSection>
    <PanelSection title="Preferences">
      <PanelSectionRow>
        <ToggleField
          label="Track Change Notifications"
          checked={trackNotify}
          onChange={async (val: boolean) => {
            setTrackNotify(val);
            notifyOnTrackChange = val;
            await savePreference("notify_on_track_change", val);
          }}
        />
      </PanelSectionRow>
    </PanelSection>
    </>
  );
}

// =============================================================================
// Main Content
// =============================================================================

function Content() {
  const [view, setView] = useState<"player" | "settings">("player");

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <SegmentedTabs
            value={view}
            onChange={setView}
            options={[
              { value: "player", label: "Player", icon: <FaMusic style={{ fontSize: "12px" }} /> },
              { value: "settings", label: "Settings", icon: <FaCog style={{ fontSize: "12px" }} /> },
            ]}
          />
        </PanelSectionRow>
      </PanelSection>

      {view === "settings" ? <Settings /> : <NowPlaying />}
    </>
  );
}

// =============================================================================
// Track Change Watcher
// =============================================================================

let lastTrackKey: string | null = null;
let watcherInterval: ReturnType<typeof setInterval> | null = null;
let notifyOnTrackChange = true;
let lastErrorShown: string | null = null;

async function startTrackWatcher() {
  console.log("Museck: Starting track watcher");

  const checkTrack = async () => {
    try {
      const status = await getPlaybackStatus();
      const track = status.current_track;

      // Playback errors always surface, independent of the track-change
      // notification preference — otherwise a queue that can't play just
      // stops with no explanation.
      if (status.last_error && status.last_error !== lastErrorShown) {
        lastErrorShown = status.last_error;
        toaster.toast({
          title: "Museck",
          body: status.last_error,
          duration: 8000,
          icon: <FaMusic />,
        });
        console.error(`Museck: ${status.last_error}`);
      } else if (!status.last_error) {
        lastErrorShown = null;
      }

      if (track && track.ratingKey !== lastTrackKey) {
        lastTrackKey = track.ratingKey;
        if (notifyOnTrackChange) {
          toaster.toast({
            title: "Now Playing",
            body: `${track.title} - ${track.artist}`,
            duration: 3000,
            icon: <FaMusic />,
          });
        }
        console.log(`Museck: Now playing - ${track.title}`);
      } else if (!track && lastTrackKey) {
        lastTrackKey = null;
      }
    } catch (e) {
      console.error("Museck: Track watcher error:", e);
    }
  };

  await checkTrack();
  watcherInterval = setInterval(checkTrack, 2000);
}

function stopTrackWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
  lastTrackKey = null;
  lastErrorShown = null;
  console.log("Museck: Track watcher stopped");
}

// =============================================================================
// Plugin Entry Point
// =============================================================================

export default definePlugin(() => {
  console.log("Museck plugin loaded!");

  injectGlobalStyles();

  routerHook.addRoute("/museck-settings", () => <ServerListPage />, { exact: true });
  routerHook.addRoute("/museck-add-server", () => <AddServerPage />, { exact: true });
  routerHook.addRoute("/museck-edit-server", () => <EditServerPage />, { exact: true });
  routerHook.addRoute("/museck-search", () => <SearchPage />, { exact: true });
  routerHook.addRoute("/museck-queue", () => <QueuePage />, { exact: true });

  // Load notification preference before starting watcher
  getSettings().then((settings) => {
    notifyOnTrackChange = settings.notify_on_track_change !== false;
  }).catch(() => {});

  startTrackWatcher();

  return {
    name: "Museck",
    titleView: <div className={staticClasses.Title}>Museck</div>,
    content: <Content />,
    icon: <FaMusic />,
    onDismount() {
      console.log("Museck plugin unloaded!");
      routerHook.removeRoute("/museck-settings");
      routerHook.removeRoute("/museck-add-server");
      routerHook.removeRoute("/museck-edit-server");
      routerHook.removeRoute("/museck-search");
      routerHook.removeRoute("/museck-queue");
      stopTrackWatcher();
      removeGlobalStyles();
    },
  };
});
