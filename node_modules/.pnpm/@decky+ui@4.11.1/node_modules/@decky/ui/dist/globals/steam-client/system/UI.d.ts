import { Unregisterable } from "../shared";
export interface UI {
    CloseGameWindow(appId: number, windowId: number): void;
    GetGameWindowsInfo(appId: number, windowIds: number[]): Promise<GameWindowInfo>;
    RegisterForFocusChangeEvents(callback: (event: FocusChangeEvent) => void): Unregisterable;
    RegisterForOverlayGameWindowFocusChanged(callback: (appId: number, overlayPid: number) => void): Unregisterable;
    RegisterForSystemKeyEvents(callback: (event: SystemKeyEvent) => void): Unregisterable;
}
interface SystemKeyEvent {
    eKey: number;
    nControllerIndex: number;
}
export interface FocusChangeEvent {
    focusedApp: FocusedApp;
    rgFocusable: FocusedApp[];
}
export interface FocusedApp {
    appid: number;
    pid: number;
    windowid: number;
    strExeName: string;
}
export interface GameWindowInfo {
    bCanClose: boolean;
    strTitle: string;
    windowid: number;
}
export {};
