import { ETouchGesture } from '../Browser';
export interface BrowserViewPopup {
    AddGlass(enabled: boolean, useBackgroundColor: boolean, blur: boolean): void;
    CanGoBackward(): boolean;
    CanGoForward(): boolean;
    DialogResponse(param0: boolean): void;
    EnableSteamInput(): void;
    FindInPage(input: string, param1: boolean, previous: boolean): void;
    GetBounds(): BrowserViewBounds;
    GoBack(): void;
    GoForward(): void;
    HandleContextMenuCommand(command: number, param2: BrowserViewContextMenu): void;
    LoadURL(url: string): void;
    NotifyUserActivation(): void;
    Paste(): void;
    PostMessage(message: string, args: string): boolean;
    Reload(): void;
    ReplaceURL(url: string): void;
    SetBlockedProtocols(protocols: string): void;
    SetBounds(x: number, y: number, width: number, height: number): void;
    SetFocus(value: boolean): void;
    SetName(browserName: string): void;
    SetShowContextMenuCallback(callback: (data: BrowserViewContextMenu) => void): void;
    SetSteamURLCallback(callback: (url: string) => void): void;
    SetTouchGesturesToCancel(gestures: ETouchGesture[]): void;
    SetVRKeyboardVisibility(value: boolean): void;
    SetVisible(value: boolean): void;
    SetWindowStackingOrder(value: EWindowStackingOrder): void;
    StopFindInPage(): void;
    off<K extends keyof BrowserViewEventMap>(event: K, callback: BrowserViewEventMap[K]): void;
    on<K extends keyof BrowserViewEventMap>(event: K, callback: BrowserViewEventMap[K]): void;
}
interface BrowserViewEventMap {
    'alert-dialog': (message: string) => void;
    'before-close': () => void;
    'blocked-request': (blockedURL: string) => void;
    'can-go-back-forward-changed': (canGoBackward: boolean, canGoForward: boolean) => void;
    'confirm-dialog': (message: string) => void;
    'favicon-urls-changed': (faviconURLs: string[]) => void;
    'find-in-page-results': (results: number, activeResultIndex: number) => void;
    'finished-request': (currentURL: string, previousURL: string) => void;
    'focus-changed': (focused: boolean) => void;
    'full-screen': (fullscreen: boolean) => void;
    'history-changed': (history: BrowserViewHistory) => void;
    'load-error': (errorCode: number, errorURL: string, errorDescription: string) => void;
    'message': (message: string, args: string, currentURL: string) => void;
    'new-tab': (url: string, param1: boolean) => void;
    'node-has-focus': (elementIdOrTagName: string, elementTag: string, inputType: string, token: string, param4: boolean) => void;
    'page-security': (url: string, pageSecurity: BrowserViewPageSecurity) => void;
    'set-title': (title: string) => void;
    'start-loading': (url: string, param1: boolean) => void;
    'start-request': (url: string) => void;
    'toggle-find-in-page': () => void;
}
export interface BrowserViewBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface BrowserViewContextMenu {
    coord_x: number;
    coord_y: number;
    custom_commands: BrowserViewContextMenuCustomCommand[];
    edit_state_flags?: number;
    misspelled_word?: string;
    link_url?: string;
    page_url: string;
    selection_text?: string;
    type_flags: number;
    unfiltered_link_url?: string;
}
export interface BrowserViewContextMenuCustomCommand {
    id: number;
    label: string;
}
export declare enum EBrowserViewContextMenuTypeFlag {
    None = 0,
    Page = 1,
    Frame = 2,
    Link = 4,
    Media = 8,
    Selection = 16,
    Editable = 32
}
export declare enum EBrowserViewContextMenuEditFlag {
    None = 0,
    CanUndo = 1,
    CanRedo = 2,
    CanCut = 4,
    CanCopy = 8,
    CanPaste = 16,
    CanDelete = 32,
    CanSelectAll = 64,
    CanTranslate = 128
}
export declare enum EBrowserViewContextMenuCommand {
    Close = -1,
    OpenDevTools = 26500,
    CloseDevTools = 26501,
    InspectElement = 26502,
    OpenLinkInNewTab = 26503
}
export declare enum EWindowStackingOrder {
    Bottom = 0,
    Top = 1
}
export interface BrowserViewHistory {
    index: number;
    entries: BrowserViewHistoryEntry[];
}
export interface BrowserViewHistoryEntry {
    url: string;
}
export interface BrowserViewPageSecurity {
    bHasCertError: boolean;
    bIsEVCert: boolean;
    bIsSecure: boolean;
    certExpiry: number;
    certName: string;
    issuerName: string;
    nCertBits: number;
}
export {};
