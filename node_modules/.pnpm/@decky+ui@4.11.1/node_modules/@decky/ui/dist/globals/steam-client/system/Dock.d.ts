import { JsPbMessage, Unregisterable } from "../shared";
import { EUpdaterState } from "../Updates";
export interface Dock {
    DisarmSafetyNet(): void;
    RegisterForStateChanges(callback: (data: ArrayBuffer) => void): Unregisterable;
    UpdateFirmware(base64: string): any;
}
export interface MsgSystemDockState extends JsPbMessage {
    update_state(): SystemDockUpdateState | undefined;
}
export interface SystemDockUpdateState {
    state: EUpdaterState | undefined;
    rtime_last_checked: number | undefined;
    version_current: string | undefined;
    version_available: string | undefined;
    stage_progress: number | undefined;
    rtime_estimated_completion: number | undefined;
    old_fw_workaround: number | undefined;
}
