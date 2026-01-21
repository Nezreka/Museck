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
import { FaMusic, FaSave, FaPlug, FaCog, FaSearch, FaServer } from "react-icons/fa";

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

// Backend callable functions
const getSettings = callable<[], { server_url: string; token: string }>("get_settings");
const saveSettings = callable<[string, string], boolean>("save_settings");
const testConnection = callable<[], { success: boolean; message: string; server_name?: string }>("test_connection");
const discoverServers = callable<[], DiscoverResult>("discover_servers");

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
  const [view, setView] = useState<"player" | "settings">("settings");

  return (
    <>
      {/* Navigation */}
      <PanelSection title="Navigation">
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
      {view === "player" && (
        <PanelSection title="Now Playing">
          <PanelSectionRow>
            <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              No music playing.
              <br />
              Configure your Plex server in Settings first.
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}
    </>
  );
}

export default definePlugin(() => {
  console.log("Museck plugin loaded!");

  // Register the full-screen settings route
  routerHook.addRoute("/museck-settings", () => <SettingsPage />, {
    exact: true,
  });

  return {
    name: "Museck",
    titleView: <div className={staticClasses.Title}>Museck</div>,
    content: <Content />,
    icon: <FaMusic />,
    onDismount() {
      console.log("Museck plugin unloaded!");
      // Unregister the route
      routerHook.removeRoute("/museck-settings");
    },
  };
});
