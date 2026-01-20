import { Unregisterable } from "./shared";
export interface Browser {
    AddWordToDictionary(word: string): void;
    ClearAllBrowsingData(): void;
    ClearHistory(): void;
    CloseDevTools(): void;
    GetBrowserID(): Promise<number>;
    GetSpellingSuggestions(word: string): string[];
    GetSteamBrowserID(): Promise<number>;
    HideCursorUntilMouseEvent(): void;
    InspectElement(clientY: number, clientX: number): void;
    NotifyUserActivation(): void;
    OpenDevTools(): void;
    Paste(): void;
    RegisterForGestureEvents(callback: (gesture: TouchGesture) => void): Unregisterable;
    RegisterForOpenNewTab: Unregisterable;
    ReplaceMisspelling(param0: string): void;
    RestartJSContext(): void;
    SetBackgroundThrottlingDisabled(value: boolean): void;
    SetPendingFilePath(path: string): Promise<boolean>;
    SetShouldExitSteamOnBrowserClosed(value: boolean): Promise<void>;
    SetTouchGesturesToCancel(gestures: ETouchGesture[]): void;
    StartDownload(url: string): void;
}
export interface TouchGesture {
    eTouchGesture: ETouchGesture;
    x: number;
    y: number;
}
export declare enum ETouchGesture {
    None = 0,
    Touch = 1,
    Tap = 2,
    DoubleTap = 3,
    ShortPress = 4,
    LongPress = 5,
    LongTap = 6,
    TwoFingerTap = 7,
    TapCancelled = 8,
    PinchBegin = 9,
    PinchUpdate = 10,
    PinchEnd = 11,
    FlingStart = 12,
    FlingCancelled = 13
}
