import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  staticClasses,
  Navigation,
  showModal,
  ModalRoot,
  DialogHeader,
  DialogBody,
  DialogButton,
  TextField,
} from "@decky/ui";
import { callable } from "@decky/api";
import { useState, useEffect, FC } from "react";
import { FaMusic, FaSave, FaPlug, FaCog, FaEdit } from "react-icons/fa";

// Backend callable functions
const getSettings = callable<[], { server_url: string; token: string }>("get_settings");
const saveSettings = callable<[string, string], boolean>("save_settings");
const testConnection = callable<[], { success: boolean; message: string; server_name?: string }>("test_connection");

// Text Input Modal Component
interface TextInputModalProps {
  closeModal: () => void;
  onSubmit: (value: string) => void;
  title: string;
  initialValue: string;
  isPassword?: boolean;
}

const TextInputModal: FC<TextInputModalProps> = ({ closeModal, onSubmit, title, initialValue, isPassword }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <ModalRoot onCancel={closeModal} onEscKeypress={closeModal}>
      <DialogHeader>{title}</DialogHeader>
      <DialogBody>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          bIsPassword={isPassword}
        />
      </DialogBody>
      <div style={{ display: "flex", gap: "10px", padding: "16px" }}>
        <DialogButton onClick={closeModal}>Cancel</DialogButton>
        <DialogButton
          onClick={() => {
            onSubmit(value);
            closeModal();
          }}
        >
          Confirm
        </DialogButton>
      </div>
    </ModalRoot>
  );
};

// Settings Component
function Settings() {
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ type: "none" | "success" | "error"; message: string }>({
    type: "none",
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load settings on mount
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
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ type: "none", message: "" });
    try {
      const success = await saveSettings(serverUrl, token);
      if (success) {
        setStatus({ type: "success", message: "Settings saved!" });
      } else {
        setStatus({ type: "error", message: "Failed to save settings" });
      }
    } catch (e) {
      setStatus({ type: "error", message: "Error saving settings" });
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatus({ type: "none", message: "" });
    try {
      // Save first, then test
      await saveSettings(serverUrl, token);
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

  const openServerUrlInput = () => {
    showModal(
      <TextInputModal
        closeModal={() => {}}
        onSubmit={(value) => setServerUrl(value)}
        title="Enter Server URL"
        initialValue={serverUrl}
      />
    );
  };

  const openTokenInput = () => {
    showModal(
      <TextInputModal
        closeModal={() => {}}
        onSubmit={(value) => setToken(value)}
        title="Enter Plex Token"
        initialValue={token}
        isPassword={true}
      />
    );
  };

  // Mask token for display
  const maskedToken = token ? "•".repeat(Math.min(token.length, 20)) : "";

  return (
    <PanelSection title="Plex Server Settings">
      {/* Server URL */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={openServerUrlInput}
          description={serverUrl || "Not set"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaEdit /> Server URL
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Plex Token */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={openTokenInput}
          description={maskedToken || "Not set"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaEdit /> Plex Token
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Save Button */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={handleSave}
          disabled={isSaving}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <FaSave />
            {isSaving ? "Saving..." : "Save Settings"}
          </div>
        </ButtonItem>
      </PanelSectionRow>

      {/* Test Connection Button */}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={handleTestConnection}
          disabled={isTesting || !serverUrl || !token}
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
              backgroundColor: status.type === "success" ? "#1a472a" : "#4a1a1a",
              color: status.type === "success" ? "#4ade80" : "#f87171",
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
      {/* Navigation - Vertical buttons for proper controller nav */}
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

  return {
    name: "Museck",
    titleView: <div className={staticClasses.Title}>Museck</div>,
    content: <Content />,
    icon: <FaMusic />,
    onDismount() {
      console.log("Museck plugin unloaded!");
    },
  };
});
