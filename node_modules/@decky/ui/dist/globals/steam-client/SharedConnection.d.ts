import { ESteamRealm, Unregisterable } from "./shared";
export interface SharedConnection {
    AllocateSharedConnection(): Promise<number>;
    Close(hSharedConnection: number): void;
    RegisterOnBinaryMessageReceived(hSharedConnection: number, callback: (data: ArrayBuffer) => void): Unregisterable;
    RegisterOnLogonInfoChanged(hSharedConnection: number, callback: (info: LogonInfo) => void): Unregisterable;
    RegisterOnMessageReceived(hSharedConnection: number, callback: (param0: any) => void): Unregisterable;
    SendMsg: any;
    SendMsgAndAwaitBinaryResponse: any;
    SendMsgAndAwaitResponse(hSharedConnection: number, msg: string): Promise<any>;
    SubscribeToClientServiceMethod(hSharedConnection: number, param1: any): any;
    SubscribeToEMsg(hSharedConnection: number, param1: any): any;
}
export interface LogonInfo {
    bLoggedOn: boolean;
    eUniverse: ESteamRealm;
    strAccountName: string;
    strCommunityImagesURL: string;
    strPersonaName: string;
    strSteamid: string;
    strUserCountry: string;
}
