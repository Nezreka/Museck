import { EUIMode, Unregisterable } from "./shared";
import { EOSType } from "./system";
export interface UI {
    EnsureMainWindowCreated(): void;
    ExitBigPictureMode(): void;
    GetDesiredSteamUIWindows(): Promise<SteamWindow[]>;
    GetOSEndOfLifeInfo(): Promise<OSEndOfLifeInfo>;
    GetUIMode(): Promise<EUIMode>;
    NotifyAppInitialized(): void;
    RegisterDesiredSteamUIWindowsChanged(callback: () => void): Unregisterable;
    RegisterForClientConVar(convar: string, callback: (value: string) => void): Unregisterable;
    RegisterForErrorCondition(callback: (param0: number, param1: number) => void): Unregisterable;
    RegisterForKioskModeResetSignal(callback: () => void): Unregisterable;
    RegisterForStartupFinished(callback: () => void): Unregisterable;
    RegisterForUIModeChanged(callback: (mode: EUIMode) => void): Unregisterable;
    ResetErrorCondition(): void;
    SetUIMode(mode: EUIMode): void;
}
export declare enum EWindowType {
    MainGamepadUI = 0,
    OverlayGamepadUI = 1,
    Keyboard = 2,
    ControllerConfigurator = 3,
    VR = 4,
    MainDesktopUI = 5,
    DesktopLogin = 6,
    OverlayDesktopUI = 7,
    SteamChinaReviewLauncher = 8
}
export interface OSEndOfLifeInfo {
    bOSWillBeUnsupported: boolean;
    osType: EOSType;
}
export interface SteamWindow {
    appid: number;
    hwndParent: number;
    nBrowserID: number;
    strAppName: string;
    unID: number;
    unPID: number;
    windowType: EWindowType;
    x: number;
    y: number;
}
