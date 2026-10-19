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
const toaster = api.toaster;

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
function FaCheck (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"},"child":[]}]})(props);
}function FaChevronLeft (props) {
  return GenIcon({"attr":{"viewBox":"0 0 320 512"},"child":[{"tag":"path","attr":{"d":"M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"},"child":[]}]})(props);
}function FaChevronRight (props) {
  return GenIcon({"attr":{"viewBox":"0 0 320 512"},"child":[{"tag":"path","attr":{"d":"M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"},"child":[]}]})(props);
}function FaCog (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"},"child":[]}]})(props);
}function FaExchangeAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"},"child":[]}]})(props);
}function FaGuitar (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M502.63 39L473 9.37a32 32 0 0 0-45.26 0L381.46 55.7a35.14 35.14 0 0 0-8.53 13.79L360.77 106l-76.26 76.26c-12.16-8.76-25.5-15.74-40.1-19.14-33.45-7.78-67-.88-89.88 22a82.45 82.45 0 0 0-20.24 33.47c-6 18.56-23.21 32.69-42.15 34.46-23.7 2.27-45.73 11.45-62.61 28.44C-16.11 327-7.9 409 47.58 464.45S185 528 230.56 482.52c17-16.88 26.16-38.9 28.45-62.71 1.76-18.85 15.89-36.13 34.43-42.14a82.6 82.6 0 0 0 33.48-20.25c22.87-22.88 29.74-56.36 22-89.75-3.39-14.64-10.37-28-19.16-40.2L406 151.23l36.48-12.16a35.14 35.14 0 0 0 13.79-8.53l46.33-46.32a32 32 0 0 0 .03-45.22zM208 352a48 48 0 1 1 48-48 48 48 0 0 1-48 48z"},"child":[]}]})(props);
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
}function FaPlus (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"},"child":[]}]})(props);
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
}function FaTrash (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"},"child":[]}]})(props);
}

// =============================================================================
// Backend Callable Functions
// =============================================================================
// Settings
const getSettings = callable("get_settings");
const saveServer = callable("save_server");
const removeServer = callable("remove_server");
const setActiveServer = callable("set_active_server");
const testConnection = callable("test_connection");
const testServerConfig = callable("test_server_config");
const discoverServers = callable("discover_servers");
const getLibraries = callable("get_libraries");
const savePreference = callable("save_preference");
const getServerStatus = callable("get_server_status");
// Playback
const togglePlayPause = callable("toggle_play_pause");
const getPlaybackStatus = callable("get_playback_status");
const nextTrack = callable("next_track");
const previousTrack = callable("previous_track");
const setQueue = callable("set_queue");
const toggleShuffle = callable("toggle_shuffle");
const toggleLoop = callable("toggle_loop");
const setVolume = callable("set_volume");
// Music API (server-agnostic)
const getPlaylists = callable("get_playlists");
const searchTracks = callable("search");
const searchAlbums = callable("search_albums");
const searchArtists = callable("search_artists");
const playQueueIndex = callable("play_queue_index");
const playPlaylist = callable("play_playlist");
const playAlbum = callable("play_album");
const playArtist = callable("play_artist");
const getGenres = callable("get_genres");
const playGenre = callable("play_genre");
const getQueueWithImages = callable("get_queue_with_images");
// =============================================================================
// Helpers
// =============================================================================
function formatTime(seconds) {
    if (!seconds || isNaN(seconds))
        return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
const SERVER_TYPE_LABELS = {
    plex: "Plex",
    jellyfin: "Jellyfin",
    emby: "Emby",
    subsonic: "Navidrome",
    soulsync: "SoulSync",
};
const SERVER_TYPE_COLORS = {
    plex: "#e5a00d",
    jellyfin: "#00a4dc",
    emby: "#52b54b",
    subsonic: "#0aa5ff",
    soulsync: "#a259ff",
};
// Module-level variable for passing server config to edit page
let editServerConfig = null;
/** Leave a full-screen page and reopen the Museck panel.
 *
 *  NavigateBack alone drops the user in whatever Steam screen was underneath,
 *  so picking a track from Search felt like being thrown out of the plugin.
 *  Reopening the Decky tab returns them to where they started. */
function returnToPanel() {
    DFL.Navigation.NavigateBack();
    DFL.Navigation.OpenQuickAccessMenu(DFL.QuickAccessTab.Decky);
}
// =============================================================================
// Theme
// =============================================================================
const theme = {
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
    transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)"};
// One type scale for the whole plugin, so a title in the panel and a title on
// a page are the same thing rather than two similar guesses.
const type = {
    hero: { fontSize: "17px", fontWeight: "600", letterSpacing: "-0.3px" },
    pageTitle: { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.4px" },
    title: { fontSize: "14px", fontWeight: "600" },
    body: { fontSize: "13px", fontWeight: "500" },
    meta: { fontSize: "11px", fontWeight: "500" },
    label: {
        fontSize: "11px", fontWeight: "700",
        letterSpacing: "0.8px", textTransform: "uppercase",
    },
};
const ellipsis = {
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
// Focus styling, and why it is built this way:
//
// Steam marks the gamepad-focused element with `gpfocus`, and exactly one
// element carries it at a time. It deliberately does NOT track DOM focus —
// these buttons have no tabindex, so `:focus` lingers on whatever was last
// activated. Selecting on `:focus` therefore highlights a stale element, which
// reads as the highlight being stuck on the previous item.  Match `gpfocus`
// only.
//
// Steam's own focus style for a DialogButton is `background: #fff`, but an
// inline background on the element outranks it, so anything styled inline
// silently loses its focus indicator. These rules restate the highlight with
// `!important` so it survives inline styles, using a white ring — visible
// against both the dark rows and the green play button.
const STYLE_ELEMENT_ID = "museck-styles";
const GLOBAL_STYLES = `
@keyframes museck-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.museck-ctl, .museck-chip, .museck-row { outline: none; }

.museck-ctl.gpfocus {
  transform: scale(1.14);
  filter: brightness(1.15);
  box-shadow: 0 0 0 3px #ffffff, 0 8px 26px rgba(0, 0, 0, 0.55) !important;
}

.museck-chip.gpfocus {
  filter: brightness(1.15);
  border-color: transparent !important;
  box-shadow: 0 0 0 3px #ffffff, 0 4px 14px rgba(0, 0, 0, 0.45) !important;
}

.museck-row.gpfocus {
  background: ${theme.surfaceContainerHighest} !important;
  border-color: transparent !important;
  box-shadow: 0 0 0 3px #ffffff, 0 6px 20px rgba(0, 0, 0, 0.5) !important;
  transform: translateX(3px);
}
`;
/** Renders the stylesheet as part of the component tree.
 *
 *  Appending to `document.head` from plugin code puts the styles in
 *  SharedJSContext, but the panel actually mounts in the QuickAccess document
 *  and the routed pages in the main window — so a head-injected sheet applies
 *  to nothing. Rendering the tag inside the tree lands it in whichever
 *  document the components are in. */
function GlobalStyles() {
    return SP_JSX.jsx("style", { id: STYLE_ELEMENT_ID, dangerouslySetInnerHTML: { __html: GLOBAL_STYLES } });
}
// DialogButton is Steam's real button primitive: it registers with gamepad
// navigation, draws a focus ring and activates on A. A styled Focusable div
// does none of that reliably, which is why the transport controls could not be
// reached with a controller. Its default chrome has to be flattened to keep
// the circular look.
function circleButtonStyle(size, background, color) {
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
function Art({ src, size, radius, iconSize, elevated }) {
    return (SP_JSX.jsxs("div", { style: {
            width: typeof size === "number" ? `${size}px` : size,
            height: typeof size === "number" ? `${size}px` : size,
            borderRadius: radius || theme.radiusSm,
            background: `linear-gradient(135deg, ${theme.surfaceContainerHighest} 0%, ${theme.surfaceContainer} 100%)`,
            overflow: "hidden", flexShrink: 0, position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: elevated
                ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${theme.outline}33`
                : `0 2px 8px rgba(0,0,0,0.25)`,
        }, children: [SP_JSX.jsx(FaMusic, { style: { fontSize: `${iconSize || 18}px`, color: theme.outline } }), src ? (SP_JSX.jsx("img", { src: src, style: {
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    objectFit: "cover",
                }, onError: (e) => { e.target.style.display = "none"; } })) : null] }));
}
function SectionLabel({ children, trailing }) {
    return (SP_JSX.jsxs("div", { style: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "2px 2px 6px",
        }, children: [SP_JSX.jsx("span", { style: { ...type.label, color: theme.onSurfaceVariant }, children: children }), trailing] }));
}
/** A full-width list row. DialogButton keeps it controller-focusable while
 *  letting the row look like a list item rather than a Steam button. */
function RowButton({ onClick, children, actionDescription, accent }) {
    return (SP_JSX.jsx(DFL.DialogButton, { className: "museck-row", focusable: true, onClick: onClick, onOKActionDescription: actionDescription, style: {
            width: "100%", minWidth: 0, margin: 0, padding: "10px 12px",
            background: theme.surfaceContainer,
            border: `1px solid ${accent ? accent + "55" : theme.outline + "22"}`,
            borderRadius: theme.radiusMd,
            display: "flex", alignItems: "center", gap: "12px",
            textAlign: "left", color: theme.onSurface,
            transition: theme.transition,
        }, children: children }));
}
/** Title + subtitle pair that truncates instead of wrapping the row. */
function RowText({ title, subtitle }) {
    return (SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0, textAlign: "left" }, children: [SP_JSX.jsx("div", { style: { ...type.body, color: theme.onSurface, ...ellipsis }, children: title }), subtitle ? (SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurfaceVariant, marginTop: "2px", ...ellipsis }, children: subtitle })) : null] }));
}
function Badge({ children, color }) {
    return (SP_JSX.jsx("span", { style: {
            fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px",
            color, background: color + "22", border: `1px solid ${color}33`,
            padding: "3px 8px", borderRadius: theme.radiusFull,
            flexShrink: 0, whiteSpace: "nowrap",
        }, children: children }));
}
/** Segmented control. Reads as one grouped switch instead of a stack of
 *  full-width buttons, and keeps left/right navigation between the segments. */
function SegmentedTabs({ value, options, onChange }) {
    return (SP_JSX.jsx(DFL.Focusable, { style: {
            display: "flex", gap: "4px", width: "100%", padding: "4px",
            background: theme.surfaceContainer,
            border: `1px solid ${theme.outline}22`,
            borderRadius: theme.radiusFull,
        }, "flow-children": "horizontal", children: options.map((option) => {
            const active = option.value === value;
            return (SP_JSX.jsxs(DFL.DialogButton, { className: "museck-chip", focusable: true, onClick: () => onChange(option.value), onOKActionDescription: option.label, style: {
                    flex: 1, minWidth: 0, width: "auto", margin: 0, padding: "7px 10px",
                    background: active ? theme.primary : "transparent",
                    color: active ? theme.onPrimary : theme.onSurfaceVariant,
                    border: "none", borderRadius: theme.radiusFull,
                    fontSize: "13px", fontWeight: active ? "700" : "500",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                    boxShadow: active ? `0 2px 10px ${theme.primary}55` : "none",
                    transition: theme.transition,
                }, children: [option.icon, option.label] }, option.value));
        }) }));
}
function EmptyState({ icon, title, subtitle }) {
    return (SP_JSX.jsxs("div", { style: {
            textAlign: "center", padding: "40px 20px", width: "100%",
            background: `linear-gradient(180deg, ${theme.surfaceContainer} 0%, transparent 100%)`,
            borderRadius: theme.radiusLg,
        }, children: [SP_JSX.jsx("div", { style: { fontSize: "40px", color: theme.outline, opacity: 0.35, marginBottom: "12px" }, children: icon }), SP_JSX.jsx("div", { style: { ...type.title, color: theme.onSurfaceVariant }, children: title }), subtitle ? (SP_JSX.jsx("div", { style: { ...type.meta, color: theme.outline, marginTop: "6px" }, children: subtitle })) : null] }));
}
function StatusBanner({ kind, message }) {
    if (kind === "none")
        return null;
    const palette = {
        success: { bg: theme.successContainer, fg: theme.success },
        info: { bg: theme.secondaryContainer, fg: theme.secondary },
        error: { bg: theme.errorContainer, fg: theme.error },
    }[kind];
    return (SP_JSX.jsx("div", { style: {
            width: "100%", padding: "11px 14px", borderRadius: theme.radiusMd,
            background: palette.bg, color: palette.fg,
            border: `1px solid ${palette.fg}33`,
            textAlign: "center", ...type.body,
        }, children: message }));
}
function Spinner({ size = 36 }) {
    return (SP_JSX.jsx("div", { style: {
            width: `${size}px`, height: `${size}px`, margin: "0 auto 14px",
            borderRadius: theme.radiusFull,
            border: `3px solid ${theme.surfaceContainerHighest}`,
            borderTopColor: theme.primary,
            animation: "museck-spin 0.9s linear infinite",
        } }));
}
function LoadingState({ label }) {
    return (SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "28px 16px", width: "100%", color: theme.onSurfaceVariant }, children: [SP_JSX.jsx(Spinner, {}), SP_JSX.jsx("div", { style: type.body, children: label })] }));
}
/** Page header for the full-screen routes: title, optional subtitle, and a
 *  Back control that is the first thing focus lands on. */
function PageHeader({ title, subtitle }) {
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", padding: "2px 0 10px" }, children: [SP_JSX.jsx("div", { style: { ...type.pageTitle, color: theme.onSurface }, children: title }), subtitle ? (SP_JSX.jsx("div", { style: { ...type.body, color: theme.onSurfaceVariant, marginTop: "3px" }, children: subtitle })) : null] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: returnToPanel, actionDescription: "Back to Museck", children: [SP_JSX.jsx(FaChevronLeft, { style: { fontSize: "12px", color: theme.primary, flexShrink: 0 } }), SP_JSX.jsx("span", { style: { ...type.body, color: theme.onSurface }, children: "Back" })] }) })] }));
}
/** Shared scroll container for the full-screen routes. */
function PageShell({ children }) {
    return (SP_JSX.jsxs("div", { style: {
            marginTop: "40px", height: "calc(100% - 40px)",
            overflowY: "auto", overflowX: "hidden", paddingBottom: "60px",
        }, children: [SP_JSX.jsx(GlobalStyles, {}), children, SP_JSX.jsx("div", { style: { height: "80px" } })] }));
}
function chipButtonStyle(active) {
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
    const [status, setStatus] = SP_REACT.useState(null);
    const [playlists, setPlaylists] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    const [localVolume, setLocalVolume] = SP_REACT.useState(null);
    // Refs, not state: the poll below is created once, so a state value would be
    // captured at its initial 0 and the grace period would never apply.
    const volumeTimerRef = SP_REACT.useRef(null);
    const lastVolumeInteractionRef = SP_REACT.useRef(0);
    // Up-next rows carry inlined cover art, so they are fetched only when the
    // queue window moves rather than on every status tick.
    const [upNextTracks, setUpNextTracks] = SP_REACT.useState([]);
    const upNextWindowRef = SP_REACT.useRef("");
    SP_REACT.useEffect(() => {
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
                        if (res.success)
                            setUpNextTracks(res.tracks);
                    }
                    else {
                        setUpNextTracks([]);
                    }
                }
            }
            catch (e) {
                console.error("Failed to get playback status:", e);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        return () => {
            clearInterval(interval);
            if (volumeTimerRef.current)
                clearTimeout(volumeTimerRef.current);
        };
    }, []);
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
    const handlePlayPause = async () => { await togglePlayPause(); };
    const handleNext = async () => { await nextTrack(); };
    const handlePrevious = async () => { await previousTrack(); };
    const handlePlayPlaylist = async (playlist) => {
        const result = await playPlaylist(playlist.key);
        if (!result.success) {
            toaster.toast({ title: "Museck", body: result.message || "Could not play playlist", icon: SP_JSX.jsx(FaMusic, {}) });
        }
        else if (result.truncated) {
            toaster.toast({
                title: playlist.title,
                body: `Queued the first ${result.count} tracks`,
                icon: SP_JSX.jsx(FaMusic, {}),
            });
        }
    };
    const handleShuffle = async () => { await toggleShuffle(); };
    const handleLoop = async () => { await toggleLoop(); };
    const handleVolumeChange = (newVal) => {
        setLocalVolume(newVal);
        lastVolumeInteractionRef.current = Date.now();
        if (volumeTimerRef.current)
            clearTimeout(volumeTimerRef.current);
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
    const upNext = (upNextTracks.length ? upNextTracks : (status?.queue_preview || [])).slice(0, 4);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSection, { title: "Now Playing", children: track ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: {
                                    width: "100%", display: "flex", flexDirection: "column",
                                    alignItems: "center", padding: "4px 0 2px",
                                }, children: SP_JSX.jsx("div", { style: { width: "100%", maxWidth: "168px", aspectRatio: "1 / 1" }, children: SP_JSX.jsx(Art, { src: track.thumb || track.parentThumb, size: "100%", radius: theme.radiusLg, iconSize: 44, elevated: true }) }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", textAlign: "center", padding: "2px 0 6px" }, children: [SP_JSX.jsx(DFL.Marquee, { play: true, speed: 26, delay: 2, fadeLength: 12, center: true, style: { ...type.hero, color: theme.onSurface }, children: track.title }), SP_JSX.jsx("div", { style: { ...type.body, color: theme.onSurfaceVariant, marginTop: "3px", ...ellipsis }, children: track.artist }), track.album ? (SP_JSX.jsx("div", { style: { ...type.meta, color: theme.outline, marginTop: "2px", ...ellipsis }, children: track.album })) : null] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", padding: "2px 0 4px" }, children: [SP_JSX.jsx("div", { style: {
                                            height: "5px", background: theme.surfaceContainerHighest,
                                            borderRadius: theme.radiusFull, overflow: "hidden", position: "relative",
                                        }, children: SP_JSX.jsx("div", { style: {
                                                position: "absolute", top: 0, left: 0,
                                                width: `${Math.min(100, Math.max(0, progressPercent))}%`, height: "100%",
                                                background: `linear-gradient(90deg, ${theme.primaryDim} 0%, ${theme.primary} 100%)`,
                                                borderRadius: theme.radiusFull,
                                                transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: `0 0 10px ${theme.primary}66`,
                                            } }) }), SP_JSX.jsxs("div", { style: {
                                            display: "flex", justifyContent: "space-between", marginTop: "6px",
                                            ...type.meta, color: theme.onSurfaceVariant,
                                            fontVariantNumeric: "tabular-nums",
                                        }, children: [SP_JSX.jsx("span", { children: formatTime(position) }), SP_JSX.jsx("span", { children: formatTime(duration) })] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", width: "100%", padding: "8px 0" }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { className: "museck-ctl", focusable: true, onClick: handlePrevious, onOKActionDescription: "Previous", style: {
                                            ...circleButtonStyle(48, theme.surfaceContainerHigh, theme.onSurface),
                                            boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                                        }, children: SP_JSX.jsx(FaStepBackward, { style: { fontSize: "16px" } }) }), SP_JSX.jsx(DFL.DialogButton, { className: "museck-ctl", focusable: true, onClick: handlePlayPause, onOKActionDescription: isPlaying ? "Pause" : "Play", style: {
                                            ...circleButtonStyle(64, `linear-gradient(135deg, ${theme.primary} 0%, #19b84d 100%)`, theme.onPrimary),
                                            boxShadow: `0 4px 20px ${theme.primary}55, 0 2px 8px rgba(0,0,0,0.3)`,
                                        }, children: isPlaying ? SP_JSX.jsx(FaPause, { style: { fontSize: "24px" } }) : SP_JSX.jsx(FaPlay, { style: { fontSize: "24px", marginLeft: "4px" } }) }), SP_JSX.jsx(DFL.DialogButton, { className: "museck-ctl", focusable: true, onClick: handleNext, onOKActionDescription: "Next", style: {
                                            ...circleButtonStyle(48, theme.surfaceContainerHigh, theme.onSurface),
                                            boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                                        }, children: SP_JSX.jsx(FaStepForward, { style: { fontSize: "16px" } }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", justifyContent: "center", gap: "8px", padding: "4px 0", width: "100%" }, "flow-children": "horizontal", children: [SP_JSX.jsxs(DFL.DialogButton, { className: "museck-chip", focusable: true, onClick: handleShuffle, onOKActionDescription: shuffleOn ? "Turn shuffle off" : "Turn shuffle on", style: chipButtonStyle(shuffleOn), children: [SP_JSX.jsx(FaRandom, { style: { fontSize: "12px" } }), " Shuffle"] }), SP_JSX.jsxs(DFL.DialogButton, { className: "museck-chip", focusable: true, onClick: handleLoop, onOKActionDescription: "Change repeat mode", style: chipButtonStyle(loopMode !== "off"), children: [SP_JSX.jsx(FaRedo, { style: { fontSize: "12px" } }), loopMode === "off" ? "Loop" : loopMode === "queue" ? "All" : "One"] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Music Volume", description: "", value: volume, min: 0, max: 100, step: 1, showValue: true, onChange: handleVolumeChange }) }), upNext.length > 0 && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(SectionLabel, { trailing: SP_JSX.jsxs("span", { style: { ...type.meta, color: theme.primary }, children: [queueLength, " in queue"] }), children: "Up Next" }) }), upNext.map((qTrack, idx) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => playQueueIndex((status?.queue_index ?? 0) + idx + 1), actionDescription: "Play", children: [SP_JSX.jsx("span", { style: {
                                                    ...type.meta, color: theme.outline, width: "16px",
                                                    fontVariantNumeric: "tabular-nums", flexShrink: 0,
                                                }, children: (status?.queue_index ?? 0) + idx + 2 }), SP_JSX.jsx(Art, { src: qTrack.thumb, size: 36, iconSize: 12 }), SP_JSX.jsx(RowText, { title: qTrack.title, subtitle: qTrack.artist })] }) }, `${qTrack.ratingKey}-${idx}`))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => DFL.Navigation.Navigate("/museck-queue"), actionDescription: "Open queue", children: [SP_JSX.jsx(FaList, { style: { fontSize: "13px", color: theme.primary, flexShrink: 0 } }), SP_JSX.jsx(RowText, { title: "View full queue" }), SP_JSX.jsx(FaChevronRight, { style: { fontSize: "11px", color: theme.outline, flexShrink: 0 } })] }) })] }))] })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaMusic, {}), title: "Nothing playing", subtitle: "Pick a playlist below, or search your library" }) })) }), SP_JSX.jsxs(DFL.PanelSection, { title: "Library", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => DFL.Navigation.Navigate("/museck-search"), actionDescription: "Search", accent: theme.primary, children: [SP_JSX.jsx("div", { style: {
                                        width: "32px", height: "32px", borderRadius: theme.radiusSm,
                                        background: theme.primaryContainer, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }, children: SP_JSX.jsx(FaSearch, { style: { fontSize: "13px", color: theme.primary } }) }), SP_JSX.jsx(RowText, { title: "Search music", subtitle: "Artists, albums and tracks" }), SP_JSX.jsx(FaChevronRight, { style: { fontSize: "11px", color: theme.outline, flexShrink: 0 } })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => DFL.Navigation.Navigate("/museck-genres"), actionDescription: "Browse genres", children: [SP_JSX.jsx("div", { style: {
                                        width: "32px", height: "32px", borderRadius: theme.radiusSm,
                                        background: theme.secondaryContainer, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }, children: SP_JSX.jsx(FaGuitar, { style: { fontSize: "13px", color: theme.secondary } }) }), SP_JSX.jsx(RowText, { title: "Genres", subtitle: "Shuffle a genre from your library" }), SP_JSX.jsx(FaChevronRight, { style: { fontSize: "11px", color: theme.outline, flexShrink: 0 } })] }) })] }), SP_JSX.jsx(DFL.PanelSection, { title: "Playlists", children: loading ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(LoadingState, { label: "Loading playlists" }) })) : playlists.length > 0 ? (playlists.map((pl) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handlePlayPlaylist(pl), actionDescription: "Play playlist", children: [SP_JSX.jsx(Art, { src: pl.thumb, size: 40, iconSize: 14 }), SP_JSX.jsx(RowText, { title: pl.title, subtitle: `${pl.count} ${pl.count === 1 ? "track" : "tracks"}` }), SP_JSX.jsx("div", { style: {
                                    width: "26px", height: "26px", borderRadius: theme.radiusFull,
                                    background: theme.primaryContainer, flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }, children: SP_JSX.jsx(FaPlay, { style: { fontSize: "9px", color: theme.primary, marginLeft: "2px" } }) })] }) }, pl.key)))) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaList, {}), title: "No playlists found", subtitle: "Check your server connection in Settings" }) })) })] }));
}
// =============================================================================
// Server List Page (full-screen settings)
// =============================================================================
function ServerListPage() {
    const [servers, setServers] = SP_REACT.useState([]);
    const [activeId, setActiveId] = SP_REACT.useState("");
    const [loading, setLoading] = SP_REACT.useState(true);
    const loadServers = async () => {
        try {
            const settings = await getSettings();
            setServers(settings.servers || []);
            setActiveId(settings.active_server_id || "");
        }
        catch (e) {
            console.error("Failed to load settings:", e);
        }
        setLoading(false);
    };
    SP_REACT.useEffect(() => { loadServers(); }, []);
    const handleActivate = async (serverId) => {
        await setActiveServer(serverId);
        setActiveId(serverId);
    };
    const handleDelete = async (serverId) => {
        await removeServer(serverId);
        await loadServers();
    };
    const handleEdit = (server) => {
        editServerConfig = { ...server };
        DFL.Navigation.Navigate("/museck-edit-server");
    };
    return (SP_JSX.jsxs(PageShell, { children: [SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(PageHeader, { title: "Servers", subtitle: servers.length ? `${servers.length} configured` : undefined }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => DFL.Navigation.Navigate("/museck-add-server"), actionDescription: "Add server", accent: theme.primary, children: [SP_JSX.jsx("div", { style: {
                                        width: "32px", height: "32px", borderRadius: theme.radiusSm,
                                        background: theme.primaryContainer, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }, children: SP_JSX.jsx(FaPlus, { style: { fontSize: "12px", color: theme.primary } }) }), SP_JSX.jsx(RowText, { title: "Add server", subtitle: "Plex, Jellyfin, Emby or Navidrome" })] }) })] }), loading ? (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(LoadingState, { label: "Loading servers" }) }) })) : servers.length === 0 ? (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaServer, {}), title: "No servers configured", subtitle: "Add a server to get started" }) }) })) : (SP_JSX.jsx(DFL.PanelSection, { children: servers.map((srv) => {
                    const isActive = srv.id === activeId;
                    const typeColor = SERVER_TYPE_COLORS[srv.type] || theme.primary;
                    return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                width: "100%", marginBottom: "10px",
                                background: theme.surfaceContainer,
                                border: `1px solid ${isActive ? theme.success + "55" : theme.outline + "22"}`,
                                borderRadius: theme.radiusMd, overflow: "hidden",
                            }, children: [SP_JSX.jsxs("div", { style: { padding: "12px 13px 10px" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }, children: [SP_JSX.jsx("div", { style: {
                                                        width: "7px", height: "7px", borderRadius: theme.radiusFull, flexShrink: 0,
                                                        backgroundColor: isActive ? theme.success : theme.outline,
                                                        boxShadow: isActive ? `0 0 8px ${theme.success}aa` : "none",
                                                    } }), isActive ? (SP_JSX.jsx("span", { style: { ...type.label, color: theme.success }, children: "Active" })) : null, SP_JSX.jsx("div", { style: { marginLeft: "auto" }, children: SP_JSX.jsx(Badge, { color: typeColor, children: SERVER_TYPE_LABELS[srv.type] }) })] }), SP_JSX.jsx("div", { style: { ...type.title, color: theme.onSurface, ...ellipsis }, children: srv.name || "Unnamed Server" }), SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurfaceVariant, marginTop: "2px", ...ellipsis }, children: srv.server_url })] }), SP_JSX.jsxs(DFL.Focusable, { style: {
                                        display: "flex", gap: "6px", padding: "0 10px 10px",
                                    }, "flow-children": "horizontal", children: [!isActive && (SP_JSX.jsxs(DFL.DialogButton, { className: "museck-chip", focusable: true, onClick: () => handleActivate(srv.id), onOKActionDescription: "Make active", style: {
                                                ...chipButtonStyle(true), flex: 1, padding: "7px 10px", fontSize: "12px",
                                            }, children: [SP_JSX.jsx(FaCheck, { style: { fontSize: "11px" } }), " Activate"] })), SP_JSX.jsxs(DFL.DialogButton, { className: "museck-chip", focusable: true, onClick: () => handleEdit(srv), onOKActionDescription: "Edit server", style: { ...chipButtonStyle(false), flex: 1, padding: "7px 10px", fontSize: "12px" }, children: [SP_JSX.jsx(FaCog, { style: { fontSize: "11px" } }), " Edit"] }), SP_JSX.jsxs(DFL.DialogButton, { className: "museck-chip", focusable: true, onClick: () => handleDelete(srv.id), onOKActionDescription: "Delete server", style: {
                                                ...chipButtonStyle(false), flex: 1, padding: "7px 10px", fontSize: "12px",
                                                color: theme.error, border: `1px solid ${theme.error}33`,
                                            }, children: [SP_JSX.jsx(FaTrash, { style: { fontSize: "11px" } }), " Delete"] })] })] }) }, srv.id));
                }) }))] }));
}
// =============================================================================
// Add / Edit Server Page
// =============================================================================
function ServerFormPage({ existingServer }) {
    const isEditing = !!existingServer;
    const [serverType, setServerType] = SP_REACT.useState(existingServer?.type || null);
    const [name, setName] = SP_REACT.useState(existingServer?.name || "");
    const [serverUrl, setServerUrl] = SP_REACT.useState(existingServer?.server_url || "");
    // Plex
    const [token, setToken] = SP_REACT.useState(existingServer?.token || "");
    // SoulSync
    const [apiKey, setApiKey] = SP_REACT.useState(existingServer?.api_key || "");
    // Jellyfin / Emby / Subsonic
    const [username, setUsername] = SP_REACT.useState(existingServer?.username || "");
    const [password, setPassword] = SP_REACT.useState(existingServer?.password || "");
    const [status, setStatus] = SP_REACT.useState({ type: "none", message: "" });
    const [isSaving, setIsSaving] = SP_REACT.useState(false);
    const [isTesting, setIsTesting] = SP_REACT.useState(false);
    // Track the server ID (generated by backend on save)
    const [serverId, setServerId] = SP_REACT.useState(existingServer?.id || "");
    // Plex library scoping
    const [libraryKey, setLibraryKey] = SP_REACT.useState(existingServer?.library_key || "");
    const [libraries, setLibraries] = SP_REACT.useState([]);
    const [isLoadingLibraries, setIsLoadingLibraries] = SP_REACT.useState(false);
    // Credentials obtained from a Jellyfin/Emby auth exchange
    const [credentials, setCredentials] = SP_REACT.useState({
        api_key: existingServer?.api_key,
        user_id: existingServer?.user_id,
    });
    // Server discovery
    const [discoveredServers, setDiscoveredServers] = SP_REACT.useState([]);
    const [isDiscovering, setIsDiscovering] = SP_REACT.useState(false);
    const buildConfig = () => {
        const config = {
            id: serverId,
            name: name || SERVER_TYPE_LABELS[serverType] + " Server",
            type: serverType,
            server_url: serverUrl.replace(/\/+$/, ""),
        };
        if (serverType === "plex") {
            config.token = token;
            // Written unconditionally: an empty value is how "All libraries"
            // clears a previously saved scoping when save_server merges.
            config.library_key = libraryKey;
        }
        else if (serverType === "soulsync") {
            // SoulSync authenticates with an API key alone, no user account.
            config.api_key = apiKey;
        }
        else {
            // Jellyfin, Emby and Subsonic all authenticate with username/password
            config.username = username;
            config.password = password;
        }
        // Carry forward the token exchanged during Jellyfin/Emby auth so saving an
        // edit doesn't discard it. The backend drops these if credentials changed.
        if (serverType === "jellyfin" || serverType === "emby") {
            if (credentials.api_key)
                config.api_key = credentials.api_key;
            if (credentials.user_id)
                config.user_id = credentials.user_id;
        }
        return config;
    };
    const handleSave = async () => {
        if (!serverType || !serverUrl)
            return;
        setIsSaving(true);
        try {
            const config = buildConfig();
            const result = await saveServer(config);
            if (result.success) {
                if (result.id && result.id !== serverId) {
                    setServerId(result.id);
                }
                setStatus({ type: "success", message: "Saved!" });
                setTimeout(() => DFL.Navigation.NavigateBack(), 800);
            }
            else {
                setStatus({ type: "error", message: "Failed to save" });
            }
        }
        catch (e) {
            setStatus({ type: "error", message: "Save error" });
        }
        setIsSaving(false);
    };
    const handleTest = async () => {
        if (!serverType || !serverUrl)
            return;
        setIsTesting(true);
        setStatus({ type: "info", message: "Testing..." });
        try {
            // Test without saving — a failed test shouldn't leave a broken server
            // in the list (and potentially make it the active one).
            const result = await testServerConfig(buildConfig());
            if (result.success) {
                setStatus({ type: "success", message: `Connected: ${result.server_name || "OK"}` });
                if (!name && result.server_name)
                    setName(result.server_name);
                if (result.api_key || result.user_id) {
                    setCredentials({ api_key: result.api_key, user_id: result.user_id });
                }
            }
            else {
                setStatus({ type: "error", message: result.message || "Connection failed" });
            }
        }
        catch (e) {
            setStatus({ type: "error", message: "Test failed" });
        }
        setIsTesting(false);
    };
    const loadLibraries = async (silent = false) => {
        if (serverType !== "plex" || !serverUrl)
            return;
        setIsLoadingLibraries(true);
        try {
            const result = await getLibraries(buildConfig());
            if (result.success)
                setLibraries(result.libraries);
            else if (!silent)
                setStatus({ type: "error", message: result.message || "Could not list libraries" });
        }
        catch (e) {
            if (!silent)
                setStatus({ type: "error", message: "Could not list libraries" });
        }
        setIsLoadingLibraries(false);
    };
    // When editing an existing Plex server, fetch the list up front so the
    // current choice is visible rather than hidden behind a button press.
    // Silent, because an unreachable server here is not worth an error banner.
    SP_REACT.useEffect(() => {
        if (isEditing && existingServer?.type === "plex" && existingServer?.server_url) {
            loadLibraries(true);
        }
    }, []);
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
        }
        setIsDiscovering(false);
    };
    const handleSelectDiscovered = (server) => {
        setServerUrl(server.url);
        if (!name)
            setName(server.name);
        if (server.type)
            setServerType(server.type);
        setDiscoveredServers([]);
    };
    const usesPassword = serverType === "jellyfin" || serverType === "emby" || serverType === "subsonic";
    return (SP_JSX.jsxs(PageShell, { children: [SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(PageHeader, { title: isEditing ? "Edit Server" : "Add Server", subtitle: isEditing ? name || undefined : "Connect a music library" }) }), !isEditing ? (SP_JSX.jsx(DFL.PanelSection, { title: "Server Type", children: ["plex", "jellyfin", "emby", "subsonic", "soulsync"].map((option) => {
                    const selected = serverType === option;
                    const color = SERVER_TYPE_COLORS[option];
                    return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => setServerType(option), actionDescription: `Use ${SERVER_TYPE_LABELS[option]}`, accent: selected ? color : undefined, children: [SP_JSX.jsx("div", { style: {
                                        width: "26px", height: "26px", borderRadius: theme.radiusFull, flexShrink: 0,
                                        background: selected ? color + "22" : "transparent",
                                        border: `1px solid ${selected ? color : theme.outline}66`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }, children: selected ? SP_JSX.jsx(FaCheck, { style: { fontSize: "10px", color } }) : null }), SP_JSX.jsx(RowText, { title: SERVER_TYPE_LABELS[option] }), SP_JSX.jsx(Badge, { color: color, children: option === "subsonic" ? "SUBSONIC" : option.toUpperCase() })] }) }, option));
                }) })) : serverType ? (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", width: "100%" }, children: [SP_JSX.jsx(Badge, { color: SERVER_TYPE_COLORS[serverType], children: SERVER_TYPE_LABELS[serverType] }), SP_JSX.jsx("span", { style: { ...type.meta, color: theme.onSurfaceVariant }, children: "Server type cannot be changed" })] }) }) })) : null, serverType && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Connection", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Server name", description: "Shown in the server list", value: name, bShowClearAction: true, onChange: (e) => setName(e.target.value) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Server URL", description: "For example 192.168.1.10:32400", value: serverUrl, bShowClearAction: true, onChange: (e) => setServerUrl(e.target.value) }) }), serverType === "plex" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Plex token", description: "Found as X-Plex-Token in any Plex web request", value: token, bIsPassword: true, onChange: (e) => setToken(e.target.value) }) })), serverType === "soulsync" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "SoulSync API key", description: "Create one in SoulSync under Settings, then API keys. It starts with sk_", value: apiKey, bIsPassword: true, onChange: (e) => setApiKey(e.target.value) }) })), usesPassword && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Username", value: username, bShowClearAction: true, onChange: (e) => setUsername(e.target.value) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Password", value: password, bIsPassword: true, onChange: (e) => setPassword(e.target.value) }) })] }))] }), serverType === "plex" && (SP_JSX.jsxs(DFL.PanelSection, { title: "Music Library", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurfaceVariant, padding: "0 2px 8px" }, children: "Plex registers audiobooks as a music library too. Pick one to keep audiobooks out of search and playback." }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => loadLibraries(), disabled: isLoadingLibraries || !serverUrl || !token, children: SP_JSX.jsxs("div", { style: {
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                            color: theme.secondary, fontWeight: "600",
                                        }, children: [SP_JSX.jsx(FaList, { style: { fontSize: "12px" } }), isLoadingLibraries ? "Loading…" : libraries.length ? "Refresh libraries" : "Load libraries"] }) }) }), libraries.length > 0 && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => setLibraryKey(""), actionDescription: "Use every library", accent: !libraryKey ? theme.primary : undefined, children: [SP_JSX.jsx("div", { style: {
                                                        width: "22px", height: "22px", borderRadius: theme.radiusFull, flexShrink: 0,
                                                        background: !libraryKey ? theme.primary + "22" : "transparent",
                                                        border: `1px solid ${!libraryKey ? theme.primary : theme.outline}66`,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                    }, children: !libraryKey ? SP_JSX.jsx(FaCheck, { style: { fontSize: "9px", color: theme.primary } }) : null }), SP_JSX.jsx(RowText, { title: "All libraries", subtitle: "Previous behaviour" })] }) }), libraries.map((lib) => {
                                        const selected = libraryKey === lib.key;
                                        return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => setLibraryKey(lib.key), actionDescription: `Use ${lib.title}`, accent: selected ? theme.primary : undefined, children: [SP_JSX.jsx("div", { style: {
                                                            width: "22px", height: "22px", borderRadius: theme.radiusFull, flexShrink: 0,
                                                            background: selected ? theme.primary + "22" : "transparent",
                                                            border: `1px solid ${selected ? theme.primary : theme.outline}66`,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                        }, children: selected ? SP_JSX.jsx(FaCheck, { style: { fontSize: "9px", color: theme.primary } }) : null }), SP_JSX.jsx(RowText, { title: lib.title })] }) }, lib.key));
                                    })] }))] })), serverType !== "subsonic" && serverType !== "soulsync" && (SP_JSX.jsxs(DFL.PanelSection, { title: "Discovery", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleDiscover, disabled: isDiscovering, children: SP_JSX.jsxs("div", { style: {
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                            color: theme.secondary, fontWeight: "600",
                                        }, children: [SP_JSX.jsx(FaSearch, { style: { fontSize: "12px" } }), isDiscovering ? "Scanning\u2026" : "Auto-detect servers"] }) }) }), discoveredServers.map((srv, i) => {
                                const srvType = srv.type || "plex";
                                const srvColor = SERVER_TYPE_COLORS[srvType] || theme.primary;
                                return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handleSelectDiscovered(srv), actionDescription: "Use this server", children: [SP_JSX.jsx(FaServer, { style: { fontSize: "14px", color: srvColor, flexShrink: 0 } }), SP_JSX.jsx(RowText, { title: srv.name, subtitle: srv.url }), SP_JSX.jsx(Badge, { color: srvColor, children: SERVER_TYPE_LABELS[srvType] })] }) }, `${srv.url}-${i}`));
                            })] })), SP_JSX.jsxs(DFL.PanelSection, { title: "Actions", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleTest, disabled: isTesting || !serverUrl, children: SP_JSX.jsxs("div", { style: {
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                            color: theme.onSurface, fontWeight: "600",
                                        }, children: [SP_JSX.jsx(FaPlug, { style: { fontSize: "12px" } }), isTesting ? "Testing\u2026" : "Test connection"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSave, disabled: isSaving || !serverUrl, children: SP_JSX.jsxs("div", { style: {
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                            color: theme.primary, fontWeight: "600",
                                        }, children: [SP_JSX.jsx(FaCheck, { style: { fontSize: "12px" } }), isSaving ? "Saving\u2026" : "Save server"] }) }) })] }), status.type !== "none" && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(StatusBanner, { kind: status.type, message: status.message }) }) }))] }))] }));
}
function AddServerPage() {
    return SP_JSX.jsx(ServerFormPage, {});
}
function EditServerPage() {
    return SP_JSX.jsx(ServerFormPage, { existingServer: editServerConfig });
}
// =============================================================================
// Search Page
// =============================================================================
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
        setTracks([]);
        setAlbums([]);
        setArtists([]);
        try {
            // Fire all three but render each as it arrives instead of waiting for all
            const tracksPromise = searchTracks(query).then((res) => {
                if (res.success)
                    setTracks(res.results.slice(0, 10));
            });
            const albumsPromise = searchAlbums(query).then((res) => {
                if (res.success)
                    setAlbums(res.albums.slice(0, 10));
            });
            const artistsPromise = searchArtists(query).then((res) => {
                if (res.success)
                    setArtists(res.artists.slice(0, 5));
            });
            await Promise.all([tracksPromise, albumsPromise, artistsPromise]);
        }
        catch (e) {
            console.error("Search failed:", e);
        }
        setLoading(false);
    };
    const handlePlayTrack = async (track, allTracks) => {
        const index = allTracks.findIndex(t => t.ratingKey === track.ratingKey);
        await setQueue(allTracks, index >= 0 ? index : 0);
        returnToPanel();
    };
    const handlePlayAlbum = async (album) => {
        const result = await playAlbum(album.key);
        if (result.success)
            returnToPanel();
    };
    const handlePlayArtist = async (artist) => {
        const result = await playArtist(artist.key);
        if (result.success)
            returnToPanel();
    };
    return (SP_JSX.jsxs(PageShell, { children: [SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(PageHeader, { title: "Search", subtitle: "Find artists, albums and tracks" }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Search your library", description: "Artist, album or track name", value: query, bShowClearAction: true, onChange: (e) => setQuery(e.target.value) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSearch, disabled: loading || !query.trim(), children: SP_JSX.jsxs("div", { style: {
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                    color: query.trim() ? theme.primary : theme.onSurfaceVariant, fontWeight: "600",
                                }, children: [SP_JSX.jsx(FaSearch, { style: { fontSize: "13px" } }), loading ? "Searching\u2026" : "Search"] }) }) })] }), loading && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(LoadingState, { label: `Searching for "${query}"` }) }) })), !loading && searched && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [artists.length > 0 && (SP_JSX.jsx(DFL.PanelSection, { title: "Artists", children: artists.map((artist) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handlePlayArtist(artist), actionDescription: "Play artist", children: [SP_JSX.jsx(Art, { src: artist.thumb, size: 44, radius: theme.radiusFull, iconSize: 16 }), SP_JSX.jsx(RowText, { title: artist.title, subtitle: "Artist" }), SP_JSX.jsx(FaPlay, { style: { fontSize: "10px", color: theme.primary, flexShrink: 0 } })] }) }, artist.key))) })), albums.length > 0 && (SP_JSX.jsx(DFL.PanelSection, { title: "Albums", children: albums.map((album) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handlePlayAlbum(album), actionDescription: "Play album", children: [SP_JSX.jsx(Art, { src: album.thumb, size: 44, iconSize: 16 }), SP_JSX.jsx(RowText, { title: album.title, subtitle: album.year ? `${album.artist} \u2022 ${album.year}` : album.artist }), SP_JSX.jsx(FaPlay, { style: { fontSize: "10px", color: theme.primary, flexShrink: 0 } })] }) }, album.key))) })), tracks.length > 0 && (SP_JSX.jsx(DFL.PanelSection, { title: "Tracks", children: tracks.map((track) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handlePlayTrack(track, tracks), actionDescription: "Play track", children: [SP_JSX.jsx(Art, { src: track.thumb, size: 44, iconSize: 16 }), SP_JSX.jsx(RowText, { title: track.title, subtitle: track.artist }), SP_JSX.jsx(FaPlay, { style: { fontSize: "10px", color: theme.primary, flexShrink: 0 } })] }) }, track.ratingKey))) })), artists.length === 0 && albums.length === 0 && tracks.length === 0 && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaSearch, {}), title: "No results", subtitle: `Nothing matched "${query}"` }) }) }))] })), !loading && !searched && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaSearch, {}), title: "Search for music", subtitle: "Find artists, albums and tracks" }) }) }))] }));
}
// =============================================================================
// Genres Page
// =============================================================================
function GenresPage() {
    const [genres, setGenres] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    const [filter, setFilter] = SP_REACT.useState("");
    const [starting, setStarting] = SP_REACT.useState("");
    SP_REACT.useEffect(() => {
        const load = async () => {
            try {
                const result = await getGenres();
                if (result.success)
                    setGenres(result.genres);
            }
            catch (e) {
                console.error("Failed to load genres:", e);
            }
            setLoading(false);
        };
        load();
    }, []);
    const handlePlay = async (genre) => {
        setStarting(genre.key);
        try {
            const result = await playGenre(genre.key);
            if (result.success) {
                returnToPanel();
            }
            else {
                toaster.toast({
                    title: genre.title,
                    body: result.message || "Nothing to play in this genre",
                    icon: SP_JSX.jsx(FaMusic, {}),
                });
            }
        }
        finally {
            setStarting("");
        }
    };
    // A large library can carry hundreds of genres, so filter rather than scroll
    const needle = filter.trim().toLowerCase();
    const shown = needle
        ? genres.filter((g) => g.title.toLowerCase().includes(needle))
        : genres;
    const capped = shown.slice(0, 100);
    return (SP_JSX.jsxs(PageShell, { children: [SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(PageHeader, { title: "Genres", subtitle: genres.length ? `${genres.length} in your library` : undefined }), genres.length > 12 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.TextField, { label: "Filter genres", value: filter, bShowClearAction: true, onChange: (e) => setFilter(e.target.value) }) }))] }), loading ? (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(LoadingState, { label: "Loading genres" }) }) })) : capped.length > 0 ? (SP_JSX.jsxs(DFL.PanelSection, { children: [capped.map((genre) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handlePlay(genre), actionDescription: `Shuffle ${genre.title}`, children: [SP_JSX.jsx("div", { style: {
                                        width: "32px", height: "32px", borderRadius: theme.radiusSm,
                                        background: theme.secondaryContainer, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }, children: SP_JSX.jsx(FaGuitar, { style: { fontSize: "12px", color: theme.secondary } }) }), SP_JSX.jsx(RowText, { title: genre.title }), starting === genre.key ? (SP_JSX.jsx("span", { style: { ...type.meta, color: theme.primary }, children: "Loading\u2026" })) : (SP_JSX.jsx(FaRandom, { style: { fontSize: "11px", color: theme.primary, flexShrink: 0 } }))] }) }, genre.key))), shown.length > capped.length && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                width: "100%", textAlign: "center", padding: "12px",
                                ...type.meta, color: theme.onSurfaceVariant,
                            }, children: ["+ ", shown.length - capped.length, " more \u2014 refine the filter to narrow it down"] }) }))] })) : (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaGuitar, {}), title: needle ? "No matching genres" : "No genres found", subtitle: needle ? `Nothing matched "${filter}"` : "Your server reported none" }) }) }))] }));
}
// =============================================================================
// Queue Page
// =============================================================================
function QueuePage() {
    const [currentTrack, setCurrentTrack] = SP_REACT.useState(null);
    const [currentIndex, setCurrentIndex] = SP_REACT.useState(-1);
    const [totalTracks, setTotalTracks] = SP_REACT.useState(0);
    const [upNextTracks, setUpNextTracks] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    // Identifies the currently loaded window of the queue. The status poll runs
    // every 5s, but the artwork below is base64-inlined by the backend — so only
    // re-request it when the window actually moved, not on every tick.
    const loadedWindowRef = SP_REACT.useRef("");
    SP_REACT.useEffect(() => {
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
                        if (result.success)
                            setUpNextTracks(result.tracks);
                    }
                    else {
                        setUpNextTracks([]);
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
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, []);
    const handlePlayIndex = async (index) => { await playQueueIndex(index); };
    const remainingCount = Math.max(0, totalTracks - currentIndex - 31);
    const upcoming = Math.max(0, totalTracks - currentIndex - 1);
    return (SP_JSX.jsxs(PageShell, { children: [SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(PageHeader, { title: "Queue", subtitle: totalTracks ? `${totalTracks} ${totalTracks === 1 ? "track" : "tracks"}` : undefined }) }), loading ? (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(LoadingState, { label: "Loading queue" }) }) })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [currentTrack && (SP_JSX.jsx(DFL.PanelSection, { title: "Now Playing", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                                    padding: "12px 13px", borderRadius: theme.radiusMd,
                                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDim} 100%)`,
                                    boxShadow: `0 6px 24px ${theme.primary}44`,
                                }, children: [SP_JSX.jsx(Art, { src: currentTrack.thumb, size: 46, iconSize: 16 }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsx("div", { style: { ...type.title, color: theme.onPrimary, ...ellipsis }, children: currentTrack.title }), SP_JSX.jsx("div", { style: {
                                                    ...type.meta, color: "rgba(0,0,0,0.66)", marginTop: "2px", ...ellipsis,
                                                }, children: currentTrack.artist })] }), SP_JSX.jsx("div", { style: { display: "flex", alignItems: "flex-end", gap: "3px", height: "20px", flexShrink: 0 }, children: [1, 2, 3].map((i) => (SP_JSX.jsx("div", { style: {
                                                width: "3px", height: `${6 + i * 4}px`,
                                                backgroundColor: theme.onPrimary, borderRadius: "2px", opacity: 0.75,
                                            } }, i))) })] }) }) })), upNextTracks.length > 0 && (SP_JSX.jsxs(DFL.PanelSection, { title: `Up Next (${upcoming})`, children: [upNextTracks.map((track, idx) => {
                                const actualIndex = currentIndex + 1 + idx;
                                return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handlePlayIndex(actualIndex), actionDescription: "Play from here", children: [SP_JSX.jsx("span", { style: {
                                                    ...type.meta, color: theme.outline, width: "22px",
                                                    fontVariantNumeric: "tabular-nums", flexShrink: 0,
                                                }, children: actualIndex + 1 }), SP_JSX.jsx(Art, { src: track.thumb, size: 38, iconSize: 13 }), SP_JSX.jsx(RowText, { title: track.title, subtitle: track.artist })] }) }, `${track.ratingKey}-${actualIndex}`));
                            }), remainingCount > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                        width: "100%", textAlign: "center", padding: "12px",
                                        ...type.meta, color: theme.onSurfaceVariant,
                                    }, children: ["+ ", remainingCount, " more ", remainingCount === 1 ? "track" : "tracks"] }) }))] })), totalTracks === 0 && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaList, {}), title: "Queue is empty", subtitle: "Play a playlist to get started" }) }) }))] }))] }));
}
// =============================================================================
// QAM Settings Component (Server Switcher)
// =============================================================================
// =============================================================================
// Live Server Status
// =============================================================================
function useServerStatus(serverId, intervalMs = 10000) {
    const [status, setStatus] = SP_REACT.useState(null);
    SP_REACT.useEffect(() => {
        if (!serverId) {
            setStatus(null);
            return;
        }
        let cancelled = false;
        const poll = async () => {
            try {
                const result = await getServerStatus(serverId);
                if (!cancelled)
                    setStatus(result);
            }
            catch (e) {
                // Keep the last known status on a transient failure; the next
                // poll recovers, or the backend reports the outage itself.
            }
        };
        setStatus(null);
        poll();
        const interval = setInterval(poll, intervalMs);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [serverId, intervalMs]);
    return status;
}
function StatusLine({ label, value }) {
    return (SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: "8px", marginTop: "5px" }, children: [SP_JSX.jsx("span", { style: { ...type.meta, color: theme.onSurfaceVariant, flexShrink: 0, minWidth: "86px" }, children: label }), SP_JSX.jsx("span", { style: { ...type.meta, color: theme.onSurface, ...ellipsis }, children: value })] }));
}
function ServerStatusCard({ status }) {
    const connected = status?.connected === true;
    const dotColor = !status ? theme.outline : connected ? theme.success : theme.error;
    const library = status?.library;
    const libraryLine = library && (library.tracks != null || library.albums != null || library.artists != null)
        ? `${(library.tracks ?? 0).toLocaleString()} tracks · ${(library.albums ?? 0).toLocaleString()} albums · ${(library.artists ?? 0).toLocaleString()} artists`
        : null;
    const services = status?.services;
    const serviceChips = [];
    if (services) {
        if (services.spotify != null)
            serviceChips.push({ name: "Spotify", on: !!services.spotify });
        if (services.soulseek != null)
            serviceChips.push({ name: "Soulseek", on: !!services.soulseek });
        if (services.hydrabase != null)
            serviceChips.push({ name: "Hydrabase", on: !!services.hydrabase });
    }
    const media = status?.media_server;
    const mediaLine = media
        ? `${media.type || status?.active_media_server || "Media server"} · ${media.connected ? "Connected" : "Offline"}${media.response_time_ms != null ? ` · ${Math.round(media.response_time_ms)} ms` : ""}`
        : null;
    const activity = status?.activity;
    const activityLine = activity
        ? activity.ok
            ? (activity.streams ?? 0) > 0
                ? `${activity.streams} streaming now${activity.transcodes ? ` · ${activity.transcodes} transcoding` : ""}${activity.total_bandwidth_kbps ? ` · ${activity.total_bandwidth_kbps} kbps` : ""}`
                : "Nothing streaming right now"
            : "Media server unreachable"
        : null;
    const versionLine = [status?.server_product, status?.version ? `v${status.version}` : null]
        .filter(Boolean).join(" ");
    return (SP_JSX.jsxs("div", { style: {
            width: "100%", background: theme.surfaceContainer,
            borderRadius: theme.radiusMd, padding: "12px 14px",
            border: `1px solid ${theme.outline}22`,
        }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [SP_JSX.jsx("div", { style: {
                            width: "7px", height: "7px", borderRadius: theme.radiusFull,
                            backgroundColor: dotColor, flexShrink: 0,
                            boxShadow: status && connected ? `0 0 8px ${theme.success}aa` : undefined,
                        } }), SP_JSX.jsx("span", { style: {
                            ...type.label,
                            color: !status ? theme.onSurfaceVariant : connected ? theme.success : theme.error,
                        }, children: !status ? "Checking" : connected ? "Live" : "Offline" }), status?.response_time_ms != null && (SP_JSX.jsxs("span", { style: { ...type.meta, color: theme.onSurfaceVariant, marginLeft: "auto" }, children: [status.response_time_ms, " ms"] }))] }), !status && (SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurfaceVariant, marginTop: "6px" }, children: "Contacting the server\u2026" })), status && !connected && (SP_JSX.jsx("div", { style: { ...type.meta, color: theme.error, marginTop: "6px" }, children: status.message || "Server unreachable" })), status && connected && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [versionLine && SP_JSX.jsx(StatusLine, { label: "Version", value: versionLine }), status.uptime && SP_JSX.jsx(StatusLine, { label: "Uptime", value: status.uptime }), libraryLine && SP_JSX.jsx(StatusLine, { label: "Library", value: libraryLine }), status.active_downloads != null && (SP_JSX.jsx(StatusLine, { label: "Downloads", value: status.active_downloads > 0 ? `${status.active_downloads} active` : "Idle" })), mediaLine && SP_JSX.jsx(StatusLine, { label: "Media server", value: mediaLine }), activityLine && SP_JSX.jsx(StatusLine, { label: "Streaming", value: activityLine }), serviceChips.length > 0 && (SP_JSX.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "9px" }, children: serviceChips.map((chip) => (SP_JSX.jsxs("div", { style: {
                                display: "flex", alignItems: "center", gap: "5px",
                                padding: "3px 8px", borderRadius: theme.radiusFull,
                                background: theme.surfaceContainerHigh,
                                border: `1px solid ${theme.outline}33`,
                            }, children: [SP_JSX.jsx("div", { style: {
                                        width: "5px", height: "5px", borderRadius: theme.radiusFull,
                                        backgroundColor: chip.on ? theme.success : theme.error,
                                    } }), SP_JSX.jsx("span", { style: { ...type.meta, color: theme.onSurface }, children: chip.name })] }, chip.name))) })), activity?.sessions && activity.sessions.length > 0 && activity.sessions.map((session, i) => (SP_JSX.jsxs("div", { style: {
                            marginTop: "7px", paddingTop: "7px",
                            borderTop: `1px solid ${theme.outline}22`,
                        }, children: [SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurface, ...ellipsis }, children: session.title }), SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurfaceVariant, ...ellipsis }, children: [session.user, session.state, session.progress_pct ? `${Math.round(session.progress_pct)}%` : null]
                                    .filter(Boolean).join(" · ") })] }, i)))] })), status?.checked_at != null && (SP_JSX.jsxs("div", { style: { ...type.meta, color: theme.onSurfaceVariant, marginTop: "8px", opacity: 0.7 }, children: ["Updated ", new Date(status.checked_at * 1000).toLocaleTimeString()] }))] }));
}
function Settings() {
    const [servers, setServers] = SP_REACT.useState([]);
    const [activeId, setActiveId] = SP_REACT.useState("");
    const [status, setStatus] = SP_REACT.useState({ type: "none", message: "" });
    const [isTesting, setIsTesting] = SP_REACT.useState(false);
    const [trackNotify, setTrackNotify] = SP_REACT.useState(true);
    const [reportPlayback, setReportPlayback] = SP_REACT.useState(true);
    const liveStatus = useServerStatus(activeId);
    // Settings rarely change, but this panel stays mounted while the user edits
    // servers on the full-screen page — so keep polling, and skip the state
    // update (and the re-render it causes) when nothing actually changed.
    const lastSettingsRef = SP_REACT.useRef("");
    SP_REACT.useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSettings();
                const serialized = JSON.stringify(settings);
                if (serialized === lastSettingsRef.current)
                    return;
                lastSettingsRef.current = serialized;
                setServers(settings.servers || []);
                setActiveId(settings.active_server_id || "");
                setTrackNotify(settings.notify_on_track_change !== false);
                setReportPlayback(settings.report_playback !== false);
            }
            catch (e) {
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
            }
            else {
                setStatus({ type: "error", message: result.message || "Connection failed" });
            }
        }
        catch (e) {
            setStatus({ type: "error", message: "Connection error" });
        }
        setIsTesting(false);
    };
    const handleSwitchServer = async (serverId) => {
        await setActiveServer(serverId);
        setActiveId(serverId);
        setStatus({ type: "success", message: "Switched!" });
    };
    const activeServer = servers.find(s => s.id === activeId);
    const otherServers = servers.filter(s => s.id !== activeId);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Server", children: [activeServer ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                width: "100%", background: `linear-gradient(135deg, ${theme.surfaceContainerHigh} 0%, ${theme.surfaceContainer} 100%)`,
                                borderRadius: theme.radiusMd, padding: "13px 14px",
                                border: `1px solid ${theme.outline}22`,
                            }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px" }, children: [SP_JSX.jsx("div", { style: {
                                                width: "7px", height: "7px", borderRadius: theme.radiusFull,
                                                backgroundColor: theme.success, flexShrink: 0,
                                                boxShadow: `0 0 8px ${theme.success}aa`,
                                            } }), SP_JSX.jsx("span", { style: { ...type.label, color: theme.success }, children: "Active" }), SP_JSX.jsx("div", { style: { marginLeft: "auto" }, children: SP_JSX.jsx(Badge, { color: SERVER_TYPE_COLORS[activeServer.type], children: SERVER_TYPE_LABELS[activeServer.type] }) })] }), SP_JSX.jsx("div", { style: { ...type.title, color: theme.onSurface, ...ellipsis }, children: activeServer.name || "Unnamed Server" }), SP_JSX.jsx("div", { style: { ...type.meta, color: theme.onSurfaceVariant, marginTop: "2px", ...ellipsis }, children: activeServer.server_url })] }) })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(EmptyState, { icon: SP_JSX.jsx(FaServer, {}), title: "No server configured", subtitle: "Add one to start listening" }) })), activeServer && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(ServerStatusCard, { status: liveStatus }) })), otherServers.length > 0 && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(SectionLabel, { children: SP_JSX.jsxs("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [SP_JSX.jsx(FaExchangeAlt, { style: { fontSize: "9px" } }), " Quick Switch"] }) }) }), otherServers.map((srv) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => handleSwitchServer(srv.id), actionDescription: "Switch to this server", children: [SP_JSX.jsx("div", { style: {
                                                width: "8px", height: "8px", borderRadius: theme.radiusFull,
                                                background: theme.outline, flexShrink: 0,
                                            } }), SP_JSX.jsx(RowText, { title: srv.name || "Unnamed", subtitle: srv.server_url }), SP_JSX.jsx(Badge, { color: SERVER_TYPE_COLORS[srv.type], children: SERVER_TYPE_LABELS[srv.type] })] }) }, srv.id)))] })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(RowButton, { onClick: () => DFL.Navigation.Navigate("/museck-settings"), actionDescription: "Manage servers", children: [SP_JSX.jsx(FaCog, { style: { fontSize: "13px", color: theme.primary, flexShrink: 0 } }), SP_JSX.jsx(RowText, { title: "Manage servers", subtitle: "Add, edit or remove" }), SP_JSX.jsx(FaChevronRight, { style: { fontSize: "11px", color: theme.outline, flexShrink: 0 } })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleTestConnection, disabled: isTesting || !activeServer, children: SP_JSX.jsxs("div", { style: {
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                    color: activeServer ? theme.primary : theme.onSurfaceVariant, fontWeight: "600",
                                }, children: [SP_JSX.jsx(FaPlug, { style: { fontSize: "12px" } }), isTesting ? "Testing…" : "Test Connection"] }) }) }), status.type !== "none" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(StatusBanner, { kind: status.type, message: status.message }) }))] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Preferences", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Track Change Notifications", checked: trackNotify, onChange: async (val) => {
                                setTrackNotify(val);
                                notifyOnTrackChange = val;
                                await savePreference("notify_on_track_change", val);
                            } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Report Playback To Server", description: "Show Museck as an active session and record plays in your server's history. Needed for Tautulli and scrobbling.", checked: reportPlayback, onChange: async (val) => {
                                setReportPlayback(val);
                                await savePreference("report_playback", val);
                            } }) })] })] }));
}
// =============================================================================
// Main Content
// =============================================================================
function Content() {
    const [view, setView] = SP_REACT.useState("player");
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(GlobalStyles, {}), SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(SegmentedTabs, { value: view, onChange: setView, options: [
                            { value: "player", label: "Player", icon: SP_JSX.jsx(FaMusic, { style: { fontSize: "12px" } }) },
                            { value: "settings", label: "Settings", icon: SP_JSX.jsx(FaCog, { style: { fontSize: "12px" } }) },
                        ] }) }) }), view === "settings" ? SP_JSX.jsx(Settings, {}) : SP_JSX.jsx(NowPlaying, {})] }));
}
// =============================================================================
// Track Change Watcher
// =============================================================================
let lastTrackKey = null;
let watcherInterval = null;
let notifyOnTrackChange = true;
let lastErrorShown = null;
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
                    icon: SP_JSX.jsx(FaMusic, {}),
                });
                console.error(`Museck: ${status.last_error}`);
            }
            else if (!status.last_error) {
                lastErrorShown = null;
            }
            if (track && track.ratingKey !== lastTrackKey) {
                lastTrackKey = track.ratingKey;
                if (notifyOnTrackChange) {
                    toaster.toast({
                        title: "Now Playing",
                        body: `${track.title} - ${track.artist}`,
                        duration: 3000,
                        icon: SP_JSX.jsx(FaMusic, {}),
                    });
                }
                console.log(`Museck: Now playing - ${track.title}`);
            }
            else if (!track && lastTrackKey) {
                lastTrackKey = null;
            }
        }
        catch (e) {
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
var index = DFL.definePlugin(() => {
    console.log("Museck plugin loaded!");
    routerHook.addRoute("/museck-settings", () => SP_JSX.jsx(ServerListPage, {}), { exact: true });
    routerHook.addRoute("/museck-add-server", () => SP_JSX.jsx(AddServerPage, {}), { exact: true });
    routerHook.addRoute("/museck-edit-server", () => SP_JSX.jsx(EditServerPage, {}), { exact: true });
    routerHook.addRoute("/museck-search", () => SP_JSX.jsx(SearchPage, {}), { exact: true });
    routerHook.addRoute("/museck-queue", () => SP_JSX.jsx(QueuePage, {}), { exact: true });
    routerHook.addRoute("/museck-genres", () => SP_JSX.jsx(GenresPage, {}), { exact: true });
    // Load notification preference before starting watcher
    getSettings().then((settings) => {
        notifyOnTrackChange = settings.notify_on_track_change !== false;
    }).catch(() => { });
    startTrackWatcher();
    return {
        name: "Museck",
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Museck" }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaMusic, {}),
        onDismount() {
            console.log("Museck plugin unloaded!");
            routerHook.removeRoute("/museck-settings");
            routerHook.removeRoute("/museck-add-server");
            routerHook.removeRoute("/museck-edit-server");
            routerHook.removeRoute("/museck-search");
            routerHook.removeRoute("/museck-queue");
            routerHook.removeRoute("/museck-genres");
            stopTrackWatcher();
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
