import { OperationResponse, Unregisterable } from "../shared";
export interface Audio {
    ClearDefaultDeviceOverride(audioType: number): Promise<OperationResponse>;
    GetApps(): Promise<ApplicationsAudio>;
    GetDevices(): Promise<AudioDeviceInfo>;
    RegisterForAppAdded(callback: (app: ApplicationAudio) => void): Unregisterable;
    RegisterForAppRemoved(callback: (appAudioId: number) => void): Unregisterable;
    RegisterForAppVolumeChanged(callback: (appAudioId: number, volume: number) => void): Unregisterable;
    RegisterForDeviceAdded(callback: (device: AudioDevice) => void): Unregisterable;
    RegisterForDeviceRemoved(callback: (audioDeviceId: number) => void): Unregisterable;
    RegisterForDeviceVolumeChanged(callback: (audioDeviceId: number, audioType: number, volume: number) => void): Unregisterable;
    RegisterForServiceConnectionStateChanges(callback: (param0: any) => void): Unregisterable;
    RegisterForVolumeButtonPressed(callback: (volumeUpPressed: boolean) => void): Unregisterable;
    SetAppVolume(appAudioId: number, volume: number): Promise<OperationResponse>;
    SetDefaultDeviceOverride(audioDeviceId: number, audioType: number): Promise<OperationResponse>;
    SetDeviceVolume(audioDeviceId: number, audioType: number, volume: number): Promise<OperationResponse>;
}
export interface ApplicationsAudio {
    apps: ApplicationAudio[];
}
export interface ApplicationAudio {
    id: number;
    strName: string;
    flVolume: number;
}
export interface AudioDeviceInfo {
    activeOutputDeviceId: number;
    activeInputDeviceId: number;
    overrideOutputDeviceId: number;
    overrideInputDeviceId: number;
    vecDevices: AudioDevice[];
}
export interface AudioDevice {
    id: number;
    sName: string;
    bHasOutput: boolean;
    bIsDefaultOutputDevice: boolean;
    flOutputVolume: number;
    bHasInput: boolean;
    bIsDefaultInputDevice: boolean;
    flInputVolume: number;
}
