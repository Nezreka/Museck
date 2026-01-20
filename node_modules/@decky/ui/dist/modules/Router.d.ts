import { EDisplayStatus } from "../globals/steam-client/App";
export declare enum SideMenu {
    None = 0,
    Main = 1,
    QuickAccess = 2
}
export declare enum QuickAccessTab {
    Notifications = 0,
    RemotePlayTogetherControls = 1,
    VoiceChat = 2,
    Friends = 3,
    Settings = 4,
    Perf = 5,
    Help = 6,
    Music = 7,
    Decky = 999
}
export type AppOverview = {
    appid: string;
    display_name: string;
    display_status: EDisplayStatus;
    sort_as: string;
};
export interface MenuStore {
    OpenSideMenu(sideMenu: SideMenu): void;
    OpenQuickAccessMenu(quickAccessTab?: QuickAccessTab): void;
    OpenMainMenu(): void;
}
export interface WindowRouter {
    BrowserWindow: Window;
    MenuStore: MenuStore;
    Navigate(path: string): void;
    NavigateToChat(): void;
    NavigateToSteamWeb(url: string): void;
    NavigateBack(): void;
}
export interface WindowStore {
    GamepadUIMainWindowInstance?: WindowRouter;
    SteamUIWindows: WindowRouter[];
    OverlayWindows: WindowRouter[];
}
export interface Router {
    WindowStore?: WindowStore;
    CloseSideMenus(): void;
    Navigate(path: string): void;
    NavigateToAppProperties(): void;
    NavigateToExternalWeb(url: string): void;
    NavigateToInvites(): void;
    NavigateToChat(): void;
    NavigateToLibraryTab(): void;
    NavigateToLayoutPreview(e: unknown): void;
    OpenPowerMenu(unknown?: any): void;
    get RunningApps(): AppOverview[];
    get MainRunningApp(): AppOverview | undefined;
}
export declare const Router: Router;
export interface Navigation {
    Navigate(path: string): void;
    NavigateBack(): void;
    NavigateToAppProperties(): void;
    NavigateToExternalWeb(url: string): void;
    NavigateToInvites(): void;
    NavigateToChat(): void;
    NavigateToLibraryTab(): void;
    NavigateToLayoutPreview(e: unknown): void;
    NavigateToSteamWeb(url: string): void;
    OpenSideMenu(sideMenu: SideMenu): void;
    OpenQuickAccessMenu(quickAccessTab?: QuickAccessTab): void;
    OpenMainMenu(): void;
    OpenPowerMenu(unknown?: any): void;
    CloseSideMenus(): void;
}
export declare let Navigation: Navigation;
