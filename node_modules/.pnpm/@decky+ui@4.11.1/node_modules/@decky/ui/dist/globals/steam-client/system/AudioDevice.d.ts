import { JsPbMessage, Unregisterable } from "../shared";
export interface AudioDevice {
    RegisterForStateChanges(callback: (data: ArrayBuffer) => void): Unregisterable;
    UpdateSomething(base64: string): void;
}
export interface CMsgSystemAudioManagerState extends JsPbMessage {
    counter(): number | undefined;
    hw(): MsgSystemAudioManagerStateHW | undefined;
    rtime_filter(): number | undefined;
}
export interface MsgSystemAudioManagerStateHW {
    devices: MsgSystemAudioManagerDevice[];
    nodes: MsgSystemAudioManagerNode[];
    ports: MsgSystemAudioManagerPort[];
    links: MsgSystemAudioManagerLink[];
}
export interface MsgSystemAudioManagerDevice {
    base: MsgSystemAudioManagerObject | undefined;
    name: string | undefined;
    nick: string | undefined;
    description: string | undefined;
    api: string | undefined;
}
export interface MsgSystemAudioManagerNode {
    base: MsgSystemAudioManagerObject | undefined;
    device_id: number | undefined;
    name: string | undefined;
    nick: string | undefined;
    description: string | undefined;
    edirection: ESystemAudioDirection | undefined;
    volume: MsgSystemAudioVolume | undefined;
}
export interface MsgSystemAudioManagerPort {
    base: MsgSystemAudioManagerObject | undefined;
    node_id: number | undefined;
    name: string | undefined;
    alias: string | undefined;
    etype: ESystemAudioPortType | undefined;
    edirection: ESystemAudioPortDirection | undefined;
    is_physical: boolean | undefined;
    is_terminal: boolean | undefined;
    is_control: boolean | undefined;
    is_monitor: boolean | undefined;
}
export interface MsgSystemAudioVolume {
    entries: MsgSystemAudioVolumeChannelEntry[] | undefined;
    is_muted: boolean | undefined;
}
export interface MsgSystemAudioVolumeChannelEntry {
    echannel: ESystemAudioChannel | undefined;
    volume: number | undefined;
}
export interface MsgSystemAudioManagerLink {
    base: MsgSystemAudioManagerObject | undefined;
    output_node_id: number | undefined;
    output_port_id: number | undefined;
    input_node_id: number | undefined;
    input_port_id: number | undefined;
}
export interface MsgSystemAudioManagerObject {
    id: number | undefined;
    rtime_last_update: number | undefined;
}
export declare enum ESystemAudioDirection {
    Invalid = 0,
    Input = 1,
    Output = 2
}
export declare enum ESystemAudioPortDirection {
    Invalid = 0,
    Input = 1,
    Output = 2
}
export declare enum ESystemAudioPortType {
    Invalid = 0,
    Unknown = 1,
    Audio32f = 2,
    Midi8b = 3,
    Video32RGBA = 4
}
export declare enum ESystemAudioChannel {
    Invalid = 0,
    Aggregated = 1,
    FrontLeft = 2,
    FrontRight = 3,
    LFE = 4,
    BackLeft = 5,
    BackRight = 6,
    FrontCenter = 7,
    Unknown = 8,
    Mono = 9
}
