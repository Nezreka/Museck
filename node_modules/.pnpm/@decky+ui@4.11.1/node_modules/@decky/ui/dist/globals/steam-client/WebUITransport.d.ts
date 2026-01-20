import { OperationResponse } from "./shared";
export interface WebUITransport {
    GetTransportInfo(): Promise<TransportInfo>;
    NotifyTransportFailure(base64: string): Promise<OperationResponse>;
}
export interface TransportInfo {
    authKeyClientdll: string;
    authKeySteamUI: string;
    portClientdll: number;
    portSteamUI: number;
}
