import _manifest from '@decky/manifest';
export * from "./types";
const manifest = _manifest;
const API_VERSION = 2;
if (!manifest?.name) {
    throw new Error('[@decky/api]: Failed to find plugin manifest.');
}
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
export const call = api.call;
export const callable = api.callable;
export const addEventListener = api.addEventListener;
export const removeEventListener = api.removeEventListener;
export const routerHook = api.routerHook;
export const toaster = api.toaster;
export const openFilePicker = api.openFilePicker;
export const executeInTab = api.executeInTab;
export const injectCssIntoTab = api.injectCssIntoTab;
export const removeCssFromTab = api.removeCssFromTab;
export const fetchNoCors = api.fetchNoCors;
export const getExternalResourceURL = api.getExternalResourceURL;
export const useQuickAccessVisible = api.useQuickAccessVisible;
export const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};
