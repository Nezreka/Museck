import { OperationResponse, Unregisterable } from "../shared";
export interface Bluetooth {
    CancelPairing(adapterId: number, deviceId: number): Promise<OperationResponse>;
    Connect(adapterId: number, deviceId: number): Promise<OperationResponse>;
    Disconnect(adapterId: number, deviceId: number): Promise<OperationResponse>;
    Pair(adapterId: number, deviceId: number): Promise<OperationResponse>;
    RegisterForStateChanges(callback: (state: BluetoothState) => void): Unregisterable;
    SetAdapterDiscovering(adapterId: number, value: boolean): Promise<OperationResponse>;
    SetEnabled(value: boolean): Promise<OperationResponse>;
    UnPair(adapterId: number, deviceId: number): Promise<OperationResponse>;
}
export interface BluetoothState {
    vecAdapters: BluetoothAdapter[];
    vecDevices: BluetoothDevice[];
    bEnabled: boolean;
}
export interface BluetoothAdapter {
    nId: number;
    sMAC: string;
    sName: string;
    bEnabled: boolean;
    bDiscovering: boolean;
}
export interface BluetoothDevice {
    nId: number;
    nAdapterId: number;
    eType: EBluetoothDeviceType;
    sMAC: string;
    sName: string;
    bConnected: boolean;
    bPaired: boolean;
    nStrengthRaw: number;
}
export declare enum EBluetoothDeviceType {
    Invalid = 0,
    Unknown = 1,
    Phone = 2,
    Computer = 3,
    Headset = 4,
    Headphones = 5,
    Speakers = 6,
    OtherAudio = 7,
    Mouse = 8,
    Joystick = 9,
    Gamepad = 10,
    Keyboard = 11
}
