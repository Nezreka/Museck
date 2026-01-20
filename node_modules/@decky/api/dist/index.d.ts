export * from "./types";
import type { DeckyRequestInit, DefinePluginFn, FilePickerRes, FileSelectionType, RouterHook, Toaster } from './types';
declare global {
    interface Window {
        __DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit?: {
            connect: (version: number, pluginName: string) => any;
        };
    }
}
export declare const call: <Args extends any[] = [], Return = void>(route: string, ...args: Args) => Promise<Return>;
export declare const callable: <Args extends any[] = [], Return = void>(route: string) => (...args: Args) => Promise<Return>;
export declare const addEventListener: <Args extends any[] = []>(event: string, listener: (...args: Args) => any) => (...args: Args) => any;
export declare const removeEventListener: <Args extends any[] = []>(event: string, listener: (...args: Args) => any) => void;
export declare const routerHook: RouterHook;
export declare const toaster: Toaster;
export declare const openFilePicker: (select: FileSelectionType, startPath: string, includeFiles?: boolean, includeFolders?: boolean, filter?: RegExp | ((file: File) => boolean), extensions?: string[], showHiddenFiles?: boolean, allowAllFiles?: boolean, max?: number) => Promise<FilePickerRes>;
export declare const executeInTab: (tab: string, runAsync: boolean, code: string) => Promise<{
    success: boolean;
    result: any;
}>;
export declare const injectCssIntoTab: (tab: string, style: string) => string;
export declare const removeCssFromTab: (tab: string, style: string) => void;
export declare const fetchNoCors: (input: string, init?: DeckyRequestInit | undefined) => Promise<Response>;
export declare const getExternalResourceURL: (url: string) => string;
export declare const useQuickAccessVisible: () => boolean;
export declare const definePlugin: (fn: DefinePluginFn) => DefinePluginFn;
