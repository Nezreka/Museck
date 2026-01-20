import Logger from '../logger';
import { findModuleExport } from '../webpack';
export var SideMenu;
(function (SideMenu) {
    SideMenu[SideMenu["None"] = 0] = "None";
    SideMenu[SideMenu["Main"] = 1] = "Main";
    SideMenu[SideMenu["QuickAccess"] = 2] = "QuickAccess";
})(SideMenu || (SideMenu = {}));
export var QuickAccessTab;
(function (QuickAccessTab) {
    QuickAccessTab[QuickAccessTab["Notifications"] = 0] = "Notifications";
    QuickAccessTab[QuickAccessTab["RemotePlayTogetherControls"] = 1] = "RemotePlayTogetherControls";
    QuickAccessTab[QuickAccessTab["VoiceChat"] = 2] = "VoiceChat";
    QuickAccessTab[QuickAccessTab["Friends"] = 3] = "Friends";
    QuickAccessTab[QuickAccessTab["Settings"] = 4] = "Settings";
    QuickAccessTab[QuickAccessTab["Perf"] = 5] = "Perf";
    QuickAccessTab[QuickAccessTab["Help"] = 6] = "Help";
    QuickAccessTab[QuickAccessTab["Music"] = 7] = "Music";
    QuickAccessTab[QuickAccessTab["Decky"] = 999] = "Decky";
})(QuickAccessTab || (QuickAccessTab = {}));
export const Router = findModuleExport((e) => e.Navigate && e.NavigationManager);
export let Navigation = {};
const logger = new Logger("Navigation");
try {
    function createNavigationFunction(fncName, handler) {
        return (...args) => {
            let win;
            try {
                win = window.SteamUIStore.GetFocusedWindowInstance();
            }
            catch (e) {
                logger.warn("Navigation interface failed to call GetFocusedWindowInstance", e);
            }
            if (!win) {
                logger.warn("Navigation interface could not find any focused window. Falling back to Main Window Instance");
                win = Router.WindowStore?.GamepadUIMainWindowInstance || Router?.WindowStore?.SteamUIWindows?.[0];
            }
            if (win) {
                try {
                    const thisObj = handler && handler(win);
                    (thisObj || win)[fncName](...args);
                }
                catch (e) {
                    logger.error("Navigation handler failed", e);
                }
            }
            else {
                logger.error("Navigation interface could not find a window to navigate");
            }
        };
    }
    const newNavigation = {
        Navigate: createNavigationFunction("Navigate"),
        NavigateBack: createNavigationFunction("NavigateBack"),
        NavigateToAppProperties: createNavigationFunction("AppProperties", win => win.Navigator),
        NavigateToExternalWeb: createNavigationFunction("ExternalWeb", win => win.Navigator),
        NavigateToInvites: createNavigationFunction("Invites", win => win.Navigator),
        NavigateToChat: createNavigationFunction("Chat", win => win.Navigator),
        NavigateToLibraryTab: createNavigationFunction("LibraryTab", win => win.Navigator),
        NavigateToLayoutPreview: Router.NavigateToLayoutPreview?.bind(Router),
        NavigateToSteamWeb: createNavigationFunction("NavigateToSteamWeb"),
        OpenSideMenu: createNavigationFunction("OpenSideMenu", win => win.MenuStore),
        OpenQuickAccessMenu: createNavigationFunction("OpenQuickAccessMenu", win => win.MenuStore),
        OpenMainMenu: createNavigationFunction("OpenMainMenu", win => win.MenuStore),
        CloseSideMenus: createNavigationFunction("CloseSideMenus", win => win.MenuStore),
        OpenPowerMenu: Router.OpenPowerMenu?.bind(Router),
    };
    Object.assign(Navigation, newNavigation);
}
catch (e) {
    logger.error('Error initializing Navigation interface', e);
}
