import { EUIComposition } from "./shared";
export interface Window {
    BringToFront(forceOS?: EWindowBringToFront): void;
    Close(): void;
    DefaultMonitorHasFullscreenWindow(): Promise<boolean>;
    FlashWindow(): void;
    GetDefaultMonitorDimensions(): Promise<MonitorDimensions>;
    GetMousePositionDetails(): Promise<string>;
    GetWindowDetails(): Promise<WindowDetails>;
    GetWindowDimensions(): Promise<WindowDimensions>;
    GetWindowRestoreDetails(): Promise<string>;
    HideWindow(): void;
    IsWindowMaximized(): Promise<boolean>;
    IsWindowMinimized(): Promise<boolean>;
    MarkLastFocused(): void;
    Minimize(): void;
    MoveTo(x: number, y: number, dpi?: number): void;
    MoveToLocation(location: WindowLocation_t, offset?: number): void;
    PositionWindowRelative(details: string, x: number, y: number, width: number, height: number): void;
    ProcessShuttingDown(): Promise<boolean>;
    ResizeTo(width: number, height: number, applyBrowserScaleOrDPIValue: boolean | number): void;
    RestoreWindowSizeAndPosition(details: string): void;
    SetAutoDisplayScale(value: boolean): void;
    SetComposition(mode: EUIComposition, appIdCompositionQueue: number[], windowId: number): void;
    SetHideOnClose(value: boolean): void;
    SetKeyFocus(value: boolean): void;
    SetManualDisplayScaleFactor(displayScaleFactor: number): void;
    SetMaxSize(width: number, height: number): void;
    SetMinSize(width: number, height: number): void;
    SetModal(value: boolean): void;
    SetResizeGrip(width: number, height: number): void;
    SetWindowIcon(icon: WindowIcon_t): void;
    ShowWindow(): void;
    StopFlashWindow(): void;
    ToggleFullscreen(): void;
    ToggleMaximize(): void;
}
export declare enum EWindowBringToFront {
    Invalid = 0,
    AndForceOS = 1,
    WithoutForcingOS = 2
}
export type WindowLocation_t = 'upper-left' | 'lower-left' | 'center-top' | 'center-bottom' | 'upper-right' | 'lower-right';
export type WindowIcon_t = 'steam' | 'messages' | 'voice';
export interface MonitorDimensions {
    flHorizontalScale: number;
    flVerticalScale: number;
    nFullHeight: number;
    nFullLeft: number;
    nFullTop: number;
    nFullWidth: number;
    nUsableHeight: number;
    nUsableLeft: number;
    nUsableTop: number;
    nUsableWidth: number;
}
export interface WindowDetails {
    bGPUEnabled: boolean;
    bUnderlaySupported: boolean;
}
export interface WindowDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
}
