import type { JsPbMessage, Unregisterable } from "./shared";
export interface GameRecording {
    RegisterForAudioSessionsChanged(callback: (data: ArrayBuffer) => void): Unregisterable;
    SetAudioSessionCaptureState(id: string, name: string, state: boolean): void;
}
export interface AudioSession {
    id(): string | undefined;
    name(): string | undefined;
    is_system(): boolean | undefined;
    is_muted(): boolean | undefined;
    is_active(): boolean | undefined;
    is_captured(): boolean | undefined;
    recent_peak(): number | undefined;
    is_game(): boolean | undefined;
    is_steam(): boolean | undefined;
    is_saved(): boolean | undefined;
}
export interface CGameRecording_AudioSessionsChanged_Notification extends JsPbMessage {
    sessions(): AudioSession[];
}
