import type * as React from 'react';
import type * as ReactDOM from 'react-dom';
import type * as JSXRuntime from 'react/jsx-runtime';
import { Ref } from 'react';
declare global {
    interface Window {
        SP_REACT: typeof React;
        SP_REACTDOM: typeof ReactDOM;
        SP_JSX: typeof JSXRuntime;
    }
}
export declare function createPropListRegex(propList: string[], fromStart?: boolean): RegExp;
export declare let INTERNAL_HOOKS: any;
export declare function applyHookStubs(customHooks?: any): any;
export declare function removeHookStubs(): void;
export declare function fakeRenderComponent(fun: Function, customHooks?: any): any;
export declare function wrapReactType(node: any, prop?: any): any;
export declare function wrapReactClass(node: any, prop?: any): any;
export declare function getReactRoot(o: HTMLElement | Element | Node): any;
export declare function getReactInstance(o: HTMLElement | Element | Node): any;
export interface findInTreeOpts {
    walkable?: string[];
    ignore?: string[];
}
export declare type findInTreeFilter = (element: any) => boolean;
export declare const findInTree: (parent: any, filter: findInTreeFilter, opts: findInTreeOpts) => any;
export declare const findInReactTree: (node: any, filter: findInTreeFilter) => any;
export declare function getParentWindow<WindowType = Window>(elem: HTMLElement | null): WindowType | null | undefined;
export declare function useWindowRef<RefElementType extends HTMLElement, WindowType = Window>(): [Ref<RefElementType>, WindowType | null | undefined];
