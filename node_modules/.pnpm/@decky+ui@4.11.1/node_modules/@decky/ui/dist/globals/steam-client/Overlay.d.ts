import type { EBrowserType, ESteamRealm, EUIComposition, EUIMode, Unregisterable } from "./shared";
export interface Overlay {
    DestroyGamePadUIDesktopConfiguratorWindow(): void;
    GetOverlayBrowserInfo(): Promise<OverlayBrowserInfo[]>;
    HandleGameWebCallback(url: string): void;
    HandleProtocolForOverlayBrowser(appId: number, protocol: string): void;
    RegisterForActivateOverlayRequests(callback: (request: ActivateOverlayRequest) => void): Unregisterable;
    RegisterForMicroTxnAuth(callback: (appId: number, microTxnId: string, realm: ESteamRealm, microTxnUrl: string) => void): Unregisterable;
    RegisterForMicroTxnAuthDismiss(callback: (appId: number, microTxnId: string) => void): Unregisterable;
    RegisterForNotificationPositionChanged(callback: (appId: number, position: ENotificationPosition, horizontalInset: number, verticalInset: number) => void): Unregisterable;
    RegisterForOverlayActivated(callback: (overlayProcessPid: number, appId: number, active: boolean, param3: boolean) => void): Unregisterable;
    RegisterForOverlayBrowserProtocols(callback: (browseProtocols: OverlayBrowserProtocols) => void): Unregisterable;
    RegisterOverlayBrowserInfoChanged(callback: () => void): Unregisterable;
    SetOverlayState(appId: string, state: EUIComposition): void;
}
type OverlayRequestDialog_t = 'achievements' | 'asyncnotificationsrequested' | 'chat' | 'community' | 'friendadd' | 'friendremove' | 'friendrequestaccept' | 'friendrequestignore' | 'friendremove' | 'jointrade' | 'leaderboards' | 'lobbyinvite' | 'lobbyinviteconnectstring' | 'officialgamegroup' | 'requestplaytime' | 'remoteplaytogether' | 'remoteplaytogetherinvite' | 'settings' | 'stats' | 'steamid' | 'store';
export declare enum ENotificationPosition {
    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}
export interface ActivateOverlayRequest {
    appid: number;
    bWebPage: boolean;
    eFlag: EOverlayToStoreFlag;
    eWebPageMode: EActivateGameOverlayToWebPageMode;
    steamidTarget: string;
    strConnectString: string;
    strDialog: OverlayRequestDialog_t;
    unRequestingAppID: number;
}
export interface OverlayBrowserInfo {
    appID: number;
    eBrowserType: EBrowserType;
    eUIMode: EUIMode;
    flDisplayScale?: number;
    gameID: string;
    nBrowserID: number;
    nScreenHeight: number;
    nScreenWidth: number;
    unPID: number;
}
export interface OverlayBrowserProtocols {
    unAppID: number;
    strScheme: string;
    bAdded: boolean;
}
export declare enum EActivateGameOverlayToWebPageMode {
    Default = 0,
    Modal = 1
}
export declare enum EOverlayToStoreFlag {
    None = 0,
    AddToCart = 1,
    AddToCartAndShow = 2
}
export {};
