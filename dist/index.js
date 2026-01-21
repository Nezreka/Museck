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
}function FaMusic (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"},"child":[]}]})(props);
}function FaPlug (props) {
  return GenIcon({"attr":{"viewBox":"0 0 384 512"},"child":[{"tag":"path","attr":{"d":"M320,32a32,32,0,0,0-64,0v96h64Zm48,128H16A16,16,0,0,0,0,176v32a16,16,0,0,0,16,16H32v32A160.07,160.07,0,0,0,160,412.8V512h64V412.8A160.07,160.07,0,0,0,352,256V224h16a16,16,0,0,0,16-16V176A16,16,0,0,0,368,160ZM128,32a32,32,0,0,0-64,0v96h64Z"},"child":[]}]})(props);
}function FaSearch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"},"child":[]}]})(props);
}function FaServer (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M480 160H32c-17.673 0-32-14.327-32-32V64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm112 248H32c-17.673 0-32-14.327-32-32v-64c0-17.673 14.327-32 32-32h448c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32zm-48-88c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z"},"child":[]}]})(props);
}

// Backend callable functions
const getSettings = callable("get_settings");
const saveSettings = callable("save_settings");
const testConnection = callable("test_connection");
const discoverServers = callable("discover_servers");
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
    const [view, setView] = SP_REACT.useState("settings");
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Navigation", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setView("player"), disabled: view === "player", children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaMusic, {}), " Player"] }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setView("settings"), disabled: view === "settings", children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }, children: [SP_JSX.jsx(FaCog, {}), " Settings"] }) }) })] }), view === "settings" && SP_JSX.jsx(Settings, {}), view === "player" && (SP_JSX.jsx(DFL.PanelSection, { title: "Now Playing", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { textAlign: "center", padding: "20px", color: "#888" }, children: ["No music playing.", SP_JSX.jsx("br", {}), "Configure your Plex server in Settings first."] }) }) }))] }));
}
var index = DFL.definePlugin(() => {
    console.log("Museck plugin loaded!");
    // Register the full-screen settings route
    routerHook.addRoute("/museck-settings", () => SP_JSX.jsx(SettingsPage, {}), {
        exact: true,
    });
    return {
        name: "Museck",
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Museck" }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaMusic, {}),
        onDismount() {
            console.log("Museck plugin unloaded!");
            // Unregister the route
            routerHook.removeRoute("/museck-settings");
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
