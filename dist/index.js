const manifest = {"name":"Museck"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const routerHook = api.routerHook;

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaCog (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"},"child":[]}]})(props);
}function FaList (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"},"child":[]}]})(props);
}function FaMusic (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"},"child":[]}]})(props);
}function FaPause (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"},"child":[]}]})(props);
}function FaPlay (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
}function FaPlug (props) {
  return GenIcon({"attr":{"viewBox":"0 0 384 512"},"child":[{"tag":"path","attr":{"d":"M320,32a32,32,0,0,0-64,0v96h64Zm48,128H16A16,16,0,0,0,0,176v32a16,16,0,0,0,16,16H32v32A160.07,160.07,0,0,0,160,412.8V512h64V412.8A160.07,160.07,0,0,0,352,256V224h16a16,16,0,0,0,16-16V176A16,16,0,0,0,368,160ZM128,32a32,32,0,0,0-64,0v96h64Z"},"child":[]}]})(props);
}function FaRandom (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"},"child":[]}]})(props);
}function FaRedo (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"},"child":[]}]})(props);
}function FaSearch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"},"child":[]}]})(props);
}function FaServer (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M480 160H32c-17.673 0-32-14.327-32-32V64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z"},"child":[]}]})(props);
}function FaStepBackward (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"},"child":[]}]})(props);
}function FaStepForward (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"},"child":[]}]})(props);
}

// Backend callable functions - Settings
const getSettings = callable("get_settings");
const saveSettings = callable("save_settings");
const testConnection = callable("test_connection");
const discoverServers = callable("discover_servers");
// Backend callable functions - Playback
const togglePlayPause = callable("toggle_play_pause");
const getPlaybackStatus = callable("get_playback_status");
const nextTrack = callable("next_track");
const previousTrack = callable("previous_track");
const setQueue = callable("set_queue");
const toggleShuffle = callable("toggle_shuffle");
const toggleLoop = callable("toggle_loop");
// Backend callable functions - Plex API
const getPlaylists = callable("get_playlists");
const getPlaylistTracks = callable("get_playlist_tracks");
const searchPlex = callable("search");
const searchAlbums = callable("search_albums");
const searchArtists = callable("search_artists");
const getAlbumTracks = callable("get_album_tracks");
const getArtistTracks = callable("get_artist_tracks");
const playQueueIndex = callable("play_queue_index");
const getQueueWithImages = callable("get_queue_with_images");
// Helper to format time in mm:ss
function formatTime(seconds) {
    if (!seconds || isNaN(seconds))
        return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
// Now Playing Component
function NowPlaying() {
    const [status, setStatus] = SP_REACT.useState(null);
    const [playlists, setPlaylists] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    // Poll playback status
    SP_REACT.useEffect(() => {
        const fetchStatus = async () => {
            try {
                const s = await getPlaybackStatus();
                setStatus(s);
            }
            catch (e) {
                console.error("Failed to get playback status:", e);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
    }, []);
    // Load playlists
    SP_REACT.useEffect(() => {
        const loadLibrary = async () => {
            setLoading(true);
            try {
                const playlistsRes = await getPlaylists();
                if (playlistsRes.success)
                    setPlaylists(playlistsRes.playlists);
            }
            catch (e) {
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
    const handlePlayPlaylist = async (playlist) => {
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
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSection, { title: "Now Playing", children: track ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "12px", alignItems: "center" }, children: [SP_JSX.jsxs("div", { style: {
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
                                        }, children: [SP_JSX.jsx(FaMusic, { style: { fontSize: "24px", color: "#666", position: "absolute" } }), (track.thumb || track.parentThumb) && (SP_JSX.jsx("img", { src: track.thumb || track.parentThumb, style: { width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }, onError: (e) => { e.target.style.display = 'none'; } }))] }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: { fontWeight: "bold", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: track.title }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: track.artist }), SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#666" }, children: formatTime(duration) })] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "center", gap: "8px", width: "100%" }, children: [SP_JSX.jsx("button", { onClick: handlePrevious, style: {
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
                                        }, children: SP_JSX.jsx(FaStepBackward, { style: { fontSize: "18px" } }) }), SP_JSX.jsx("button", { onClick: handlePlayPause, style: {
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
                                        }, children: isPlaying ? SP_JSX.jsx(FaPause, { style: { fontSize: "22px" } }) : SP_JSX.jsx(FaPlay, { style: { fontSize: "22px", marginLeft: "3px" } }) }), SP_JSX.jsx("button", { onClick: handleNext, style: {
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
                                        }, children: SP_JSX.jsx(FaStepForward, { style: { fontSize: "18px" } }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "center", gap: "16px", width: "100%" }, children: [SP_JSX.jsxs("button", { onClick: handleShuffle, style: {
                                            background: "transparent",
                                            border: "none",
                                            padding: "8px 12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            cursor: "pointer",
                                            color: shuffleOn ? "#1db954" : "#888",
                                            fontSize: "12px"
                                        }, children: [SP_JSX.jsx(FaRandom, { style: { fontSize: "14px" } }), "Shuffle"] }), SP_JSX.jsxs("button", { onClick: handleLoop, style: {
                                            background: "transparent",
                                            border: "none",
                                            padding: "8px 12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            cursor: "pointer",
                                            color: loopMode !== "off" ? "#1db954" : "#888",
                                            fontSize: "12px"
                                        }, children: [SP_JSX.jsx(FaRedo, { style: { fontSize: "14px" } }), loopMode === "off" ? "Loop" : loopMode === "queue" ? "Loop All" : "Loop One"] })] }) }), status?.queue && status.queue.length > 1 && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "8px 0"
                                        }, children: [SP_JSX.jsx("span", { style: { fontSize: "12px", color: "#888" }, children: "Up Next" }), SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => DFL.Navigation.Navigate("/museck-queue"), children: SP_JSX.jsxs("span", { style: { fontSize: "11px" }, children: ["View Queue (", status.queue.length, ")"] }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                            maxHeight: "150px",
                                            overflowY: "auto",
                                            borderRadius: "8px",
                                            backgroundColor: "#1a1a1a"
                                        }, children: status.queue.slice(status.queue_index + 1, status.queue_index + 6).map((qTrack, idx) => (SP_JSX.jsxs("div", { style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "8px 10px",
                                                borderBottom: idx < 4 ? "1px solid #2a2a2a" : "none"
                                            }, children: [SP_JSX.jsx("span", { style: { fontSize: "11px", color: "#666", width: "16px" }, children: status.queue_index + idx + 2 }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: {
                                                                fontSize: "12px",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap"
                                                            }, children: qTrack.title }), SP_JSX.jsx("div", { style: { fontSize: "10px", color: "#888" }, children: qTrack.artist })] })] }, `${qTrack.ratingKey}-${idx}`))) }) })] }))] })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { textAlign: "center", padding: "16px", color: "#888" }, children: "Select a playlist to start playing" }) })) }), SP_JSX.jsx(DFL.PanelSection, { title: "Search", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => DFL.Navigation.Navigate("/museck-search"), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaSearch, {}), "Search Music"] }) }) }) }), SP_JSX.jsx(DFL.PanelSection, { title: "Playlists", children: loading ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { textAlign: "center", color: "#888" }, children: "Loading..." }) })) : playlists.length > 0 ? (SP_JSX.jsx(SP_JSX.Fragment, { children: playlists.map((pl) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handlePlayPlaylist(pl), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [SP_JSX.jsx("div", { style: {
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "4px",
                                            backgroundColor: "#1a1a1a",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                        }, children: SP_JSX.jsx(FaList, { style: { fontSize: "16px", color: "#1db954" } }) }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, textAlign: "left" }, children: [SP_JSX.jsx("div", { style: {
                                                    fontSize: "13px",
                                                    fontWeight: "500",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }, children: pl.title }), SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#888" }, children: [pl.count, " tracks"] })] }), SP_JSX.jsx(FaPlay, { style: { fontSize: "12px", color: "#1db954" } })] }) }) }, pl.key))) })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { textAlign: "center", color: "#888", fontSize: "12px" }, children: "No playlists found" }) })) })] }));
}
// Full-screen Settings Page (keyboard works properly here)
function SettingsPage() {
    const [serverUrl, setServerUrl] = SP_REACT.useState("");
    const [token, setToken] = SP_REACT.useState("");
    const [status, setStatus] = SP_REACT.useState("");
    const [isSaving, setIsSaving] = SP_REACT.useState(false);
    SP_REACT.useEffect(() => {
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
            setTimeout(() => DFL.Navigation.NavigateBack(), 1000);
        }
    };
    return (SP_JSX.jsxs("div", { style: {
            padding: "20px",
            maxWidth: "600px",
            margin: "0 auto",
            color: "white"
        }, children: [SP_JSX.jsx("h2", { style: { marginBottom: "20px" }, children: "Museck Settings" }), SP_JSX.jsxs("div", { style: { marginBottom: "20px" }, children: [SP_JSX.jsx("label", { style: { display: "block", marginBottom: "8px" }, children: "Server URL" }), SP_JSX.jsx(DFL.TextField, { value: serverUrl, onChange: (e) => setServerUrl(e.target.value), style: { width: "100%" } })] }), SP_JSX.jsxs("div", { style: { marginBottom: "20px" }, children: [SP_JSX.jsx("label", { style: { display: "block", marginBottom: "8px" }, children: "Plex Token" }), SP_JSX.jsx(DFL.TextField, { value: token, onChange: (e) => setToken(e.target.value), bIsPassword: true, style: { width: "100%" } })] }), SP_JSX.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [SP_JSX.jsx("button", { onClick: handleSave, disabled: isSaving, style: {
                            padding: "10px 20px",
                            backgroundColor: "#1a9fff",
                            border: "none",
                            borderRadius: "4px",
                            color: "white",
                            cursor: "pointer"
                        }, children: isSaving ? "Saving..." : "Save & Return" }), SP_JSX.jsx("button", { onClick: () => DFL.Navigation.NavigateBack(), style: {
                            padding: "10px 20px",
                            backgroundColor: "#444",
                            border: "none",
                            borderRadius: "4px",
                            color: "white",
                            cursor: "pointer"
                        }, children: "Cancel" })] }), status && (SP_JSX.jsx("div", { style: { marginTop: "15px", color: status === "Saved!" ? "#4ade80" : "#f87171" }, children: status }))] }));
}
// Full-screen Search Page
function SearchPage() {
    const [query, setQuery] = SP_REACT.useState("");
    const [tracks, setTracks] = SP_REACT.useState([]);
    const [albums, setAlbums] = SP_REACT.useState([]);
    const [artists, setArtists] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [searched, setSearched] = SP_REACT.useState(false);
    const handleSearch = async () => {
        if (!query.trim())
            return;
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
        }
        catch (e) {
            console.error("Search failed:", e);
        }
        setLoading(false);
    };
    const handlePlayTrack = async (track, allTracks) => {
        const index = allTracks.findIndex(t => t.ratingKey === track.ratingKey);
        await setQueue(allTracks, index >= 0 ? index : 0);
        DFL.Navigation.NavigateBack();
    };
    const handlePlayAlbum = async (album) => {
        const result = await getAlbumTracks(album.key);
        if (result.success && result.tracks.length > 0) {
            await setQueue(result.tracks, 0);
            DFL.Navigation.NavigateBack();
        }
    };
    const handlePlayArtist = async (artist) => {
        const result = await getArtistTracks(artist.key);
        if (result.success && result.tracks.length > 0) {
            await setQueue(result.tracks, 0);
            DFL.Navigation.NavigateBack();
        }
    };
    return (SP_JSX.jsxs("div", { style: {
            padding: "16px",
            paddingTop: "40px",
            color: "white",
            minHeight: "100vh",
            backgroundColor: "#0e0e0e"
        }, children: [SP_JSX.jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px"
                }, children: [SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => DFL.Navigation.NavigateBack(), children: "\u2190 Back" }), SP_JSX.jsx("h2", { style: { margin: 0, fontSize: "18px", flex: 1 }, children: "Search Music" })] }), SP_JSX.jsxs("div", { style: { marginBottom: "16px" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }, children: [SP_JSX.jsx(FaSearch, { style: { color: "#1db954", fontSize: "16px" } }), SP_JSX.jsx("span", { style: { fontSize: "14px", color: "#888" }, children: "Enter search term:" })] }), SP_JSX.jsx(DFL.TextField, { value: query, onChange: (e) => setQuery(e.target.value), style: { width: "100%", fontSize: "16px" } })] }), SP_JSX.jsx("div", { style: { marginBottom: "20px" }, children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSearch, disabled: loading || !query.trim(), children: SP_JSX.jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: query.trim() ? "#1db954" : "#888"
                        }, children: [SP_JSX.jsx(FaSearch, {}), loading ? "Searching..." : "Search"] }) }) }), loading ? (SP_JSX.jsx("div", { style: { textAlign: "center", padding: "40px", color: "#888" }, children: "Searching..." })) : searched ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [artists.length > 0 && (SP_JSX.jsxs("div", { style: { marginBottom: "20px" }, children: [SP_JSX.jsx("h3", { style: { fontSize: "13px", color: "#888", marginBottom: "12px" }, children: "Artists" }), SP_JSX.jsx("div", { style: { display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }, children: artists.map((artist) => (SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handlePlayArtist(artist), children: SP_JSX.jsxs("div", { style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "8px",
                                            minWidth: "80px"
                                        }, children: [SP_JSX.jsx("div", { style: {
                                                    width: "64px",
                                                    height: "64px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#1db954",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: "2px solid #1db954"
                                                }, children: artist.thumb ? (SP_JSX.jsx("img", { src: artist.thumb, style: { width: "100%", height: "100%", objectFit: "cover" } })) : (SP_JSX.jsx(FaMusic, { style: { color: "white", fontSize: "24px" } })) }), SP_JSX.jsx("div", { style: {
                                                    fontSize: "11px",
                                                    textAlign: "center",
                                                    maxWidth: "80px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }, children: artist.title }), SP_JSX.jsx("div", { style: { fontSize: "9px", color: "#1db954" }, children: "ARTIST" })] }) }, artist.key))) })] })), albums.length > 0 && (SP_JSX.jsxs("div", { style: { marginBottom: "20px" }, children: [SP_JSX.jsx("h3", { style: { fontSize: "13px", color: "#888", marginBottom: "8px" }, children: "Albums" }), albums.map((album) => (SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handlePlayAlbum(album), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [SP_JSX.jsx("div", { style: {
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "4px",
                                                backgroundColor: "#333",
                                                overflow: "hidden",
                                                flexShrink: 0
                                            }, children: album.thumb ? (SP_JSX.jsx("img", { src: album.thumb, style: { width: "100%", height: "100%", objectFit: "cover" } })) : (SP_JSX.jsx("div", { style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }, children: SP_JSX.jsx(FaMusic, { style: { color: "#666" } }) })) }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, textAlign: "left" }, children: [SP_JSX.jsx("div", { style: { fontWeight: "bold", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: album.title }), SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#888" }, children: [album.artist, " ", album.year && `• ${album.year}`] })] }), SP_JSX.jsx("div", { style: { color: "#1db954", fontSize: "10px" }, children: "ALBUM" })] }) }, album.key)))] })), tracks.length > 0 && (SP_JSX.jsxs("div", { children: [SP_JSX.jsx("h3", { style: { fontSize: "13px", color: "#888", marginBottom: "8px" }, children: "Tracks" }), tracks.map((track) => (SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handlePlayTrack(track, tracks), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [SP_JSX.jsx("div", { style: {
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "4px",
                                                backgroundColor: "#333",
                                                overflow: "hidden",
                                                flexShrink: 0
                                            }, children: track.thumb ? (SP_JSX.jsx("img", { src: track.thumb, style: { width: "100%", height: "100%", objectFit: "cover" } })) : (SP_JSX.jsx("div", { style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }, children: SP_JSX.jsx(FaMusic, { style: { color: "#666" } }) })) }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, textAlign: "left" }, children: [SP_JSX.jsx("div", { style: { fontWeight: "bold", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: track.title }), SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#888" }, children: [track.artist, " \u2022 ", track.album] })] }), SP_JSX.jsx("div", { style: { color: "#888", fontSize: "10px" }, children: "TRACK" })] }) }, track.ratingKey)))] })), artists.length === 0 && albums.length === 0 && tracks.length === 0 && (SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "40px", color: "#888" }, children: ["No results found for \"", query, "\""] }))] })) : (SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "60px 20px", color: "#666" }, children: [SP_JSX.jsx(FaSearch, { style: { fontSize: "48px", marginBottom: "16px", opacity: 0.3 } }), SP_JSX.jsx("div", { style: { fontSize: "14px" }, children: "Search for tracks or albums" })] }))] }));
}
// Full-screen Queue Page
function QueuePage() {
    const [currentTrack, setCurrentTrack] = SP_REACT.useState(null);
    const [currentIndex, setCurrentIndex] = SP_REACT.useState(-1);
    const [queueTracks, setQueueTracks] = SP_REACT.useState([]);
    const [totalTracks, setTotalTracks] = SP_REACT.useState(0);
    const [loading, setLoading] = SP_REACT.useState(true);
    SP_REACT.useEffect(() => {
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
            }
            catch (e) {
                console.error("Failed to get queue:", e);
                setLoading(false);
            }
        };
        fetchQueue();
        // Refresh every 3 seconds
        const interval = setInterval(fetchQueue, 3000);
        return () => clearInterval(interval);
    }, []);
    const handlePlayIndex = async (index) => {
        await playQueueIndex(index);
    };
    const remainingCount = Math.max(0, totalTracks - currentIndex - 31);
    return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => DFL.Navigation.NavigateBack(), children: "\u2190 Back to Player" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "16px", fontWeight: "bold", padding: "8px 0" }, children: ["Queue (", totalTracks, " tracks)"] }) }), loading ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { textAlign: "center", padding: "20px", color: "#888" }, children: "Loading queue..." }) })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [currentTrack && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#1db954", padding: "4px 0" }, children: "Now Playing" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "10px",
                                        backgroundColor: "#1db954",
                                        borderRadius: "8px"
                                    }, children: [SP_JSX.jsx("div", { style: {
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "4px",
                                                backgroundColor: "rgba(0,0,0,0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                overflow: "hidden"
                                            }, children: currentTrack.thumb ? (SP_JSX.jsx("img", { src: currentTrack.thumb, style: { width: "100%", height: "100%", objectFit: "cover" } })) : (SP_JSX.jsx(FaMusic, { style: { color: "white", fontSize: "16px" } })) }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: { fontWeight: "bold", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: currentTrack.title }), SP_JSX.jsx("div", { style: { fontSize: "11px", opacity: 0.9 }, children: currentTrack.artist })] })] }) })] })), queueTracks.length > 0 && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "12px", color: "#888", padding: "8px 0 4px 0" }, children: ["Up Next (", totalTracks - currentIndex - 1, " tracks)"] }) }), queueTracks.map((track, idx) => {
                                const actualIndex = currentIndex + 1 + idx;
                                return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handlePlayIndex(actualIndex), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [SP_JSX.jsx("span", { style: { fontSize: "11px", color: "#666", width: "20px", textAlign: "right" }, children: actualIndex + 1 }), SP_JSX.jsx("div", { style: {
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#333",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                        overflow: "hidden"
                                                    }, children: track.thumb ? (SP_JSX.jsx("img", { src: track.thumb, style: { width: "100%", height: "100%", objectFit: "cover" } })) : (SP_JSX.jsx(FaMusic, { style: { color: "#666", fontSize: "12px" } })) }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, textAlign: "left" }, children: [SP_JSX.jsx("div", { style: { fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: track.title }), SP_JSX.jsx("div", { style: { fontSize: "10px", color: "#888" }, children: track.artist })] })] }) }) }, `${track.ratingKey}-${actualIndex}`));
                            }), remainingCount > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "8px", color: "#666", fontSize: "11px" }, children: ["+ ", remainingCount, " more tracks"] }) }))] })), totalTracks === 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "40px 20px", color: "#666" }, children: [SP_JSX.jsx(FaList, { style: { fontSize: "32px", marginBottom: "12px", opacity: 0.3 } }), SP_JSX.jsx("div", { style: { fontSize: "13px" }, children: "Queue is empty" })] }) }))] }))] }));
}
// QAM Settings Component (simplified - uses full-screen page for editing)
function Settings() {
    const [serverUrl, setServerUrl] = SP_REACT.useState("");
    const [token, setToken] = SP_REACT.useState("");
    const [status, setStatus] = SP_REACT.useState({
        type: "none",
        message: "",
    });
    const [isTesting, setIsTesting] = SP_REACT.useState(false);
    const [isDiscovering, setIsDiscovering] = SP_REACT.useState(false);
    const [discoveredServers, setDiscoveredServers] = SP_REACT.useState([]);
    // Load settings on mount and when returning from settings page
    SP_REACT.useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSettings();
                setServerUrl(settings.server_url || "");
                setToken(settings.token || "");
            }
            catch (e) {
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
            }
            else {
                setStatus({ type: "error", message: result.message || "Connection failed" });
            }
        }
        catch (e) {
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
            }
            else {
                setStatus({ type: "error", message: result.message || "No servers found" });
            }
        }
        catch (e) {
            setStatus({ type: "error", message: "Discovery failed" });
            console.error(e);
        }
        setIsDiscovering(false);
    };
    const handleSelectServer = async (server) => {
        setServerUrl(server.url);
        setDiscoveredServers([]);
        // Save immediately when selecting a server
        await saveSettings(server.url, token);
        setStatus({ type: "success", message: `Selected: ${server.name}` });
    };
    // Mask token for display
    const maskedToken = token ? "•".repeat(Math.min(token.length, 20)) : "";
    const isConfigured = serverUrl && token;
    return (SP_JSX.jsxs(DFL.PanelSection, { title: "Plex Server Settings", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { padding: "8px 0", fontSize: "12px" }, children: [SP_JSX.jsxs("div", { children: [SP_JSX.jsx("strong", { children: "Server:" }), " ", serverUrl || "Not configured"] }), SP_JSX.jsxs("div", { children: [SP_JSX.jsx("strong", { children: "Token:" }), " ", maskedToken || "Not configured"] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => DFL.Navigation.Navigate("/museck-settings"), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaCog, {}), "Edit Settings"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleDiscover, disabled: isDiscovering, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaSearch, {}), isDiscovering ? "Scanning..." : "Auto-Detect Server"] }) }) }), discoveredServers.length > 0 && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { padding: "8px 0", color: "#888", fontSize: "12px" }, children: "Select a server:" }) }), discoveredServers.map((server, index) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handleSelectServer(server), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [SP_JSX.jsx(FaServer, {}), SP_JSX.jsxs("div", { style: { textAlign: "left" }, children: [SP_JSX.jsx("div", { children: server.name }), SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#888" }, children: server.url })] })] }) }) }, index)))] })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleTestConnection, disabled: isTesting || !isConfigured, children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaPlug, {}), isTesting ? "Testing..." : "Test Connection"] }) }) }), status.type !== "none" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                        padding: "10px",
                        borderRadius: "4px",
                        backgroundColor: status.type === "success" ? "#1a472a" : status.type === "info" ? "#1a3a4a" : "#4a1a1a",
                        color: status.type === "success" ? "#4ade80" : status.type === "info" ? "#60a5fa" : "#f87171",
                        textAlign: "center",
                    }, children: status.message }) }))] }));
}
// Main Content Component
function Content() {
    const [view, setView] = SP_REACT.useState("player");
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Museck", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setView("player"), disabled: view === "player", children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaMusic, {}), " Player"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setView("settings"), disabled: view === "settings", children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaCog, {}), " Settings"] }) }) })] }), view === "settings" && SP_JSX.jsx(Settings, {}), view === "player" && SP_JSX.jsx(NowPlaying, {})] }));
}
var index = DFL.definePlugin(() => {
    console.log("Museck plugin loaded!");
    // Register the full-screen routes
    routerHook.addRoute("/museck-settings", () => SP_JSX.jsx(SettingsPage, {}), {
        exact: true,
    });
    routerHook.addRoute("/museck-search", () => SP_JSX.jsx(SearchPage, {}), {
        exact: true,
    });
    routerHook.addRoute("/museck-queue", () => SP_JSX.jsx(QueuePage, {}), {
        exact: true,
    });
    return {
        name: "Museck",
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Museck" }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaMusic, {}),
        onDismount() {
            console.log("Museck plugin unloaded!");
            // Unregister the routes
            routerHook.removeRoute("/museck-settings");
            routerHook.removeRoute("/museck-search");
            routerHook.removeRoute("/museck-queue");
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
