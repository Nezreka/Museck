import { OperationResponse } from "../../shared";
export interface Device {
    Connect(base64: string): Promise<OperationResponse>;
    Disconnect(deviceId: number): Promise<OperationResponse>;
    WirelessNetwork: WirelessNetwork;
}
export interface WirelessNetwork {
    Forget(deviceId: any, deviceWapId: any): any;
    SetAutoconnect(deviceId: any, deviceWapId: any, autoConnect: boolean): any;
}
