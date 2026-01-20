var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { useState } from 'react';
export function createPropListRegex(propList, fromStart = true) {
    let regexString = fromStart ? "const\{" : "";
    propList.forEach((prop, propIdx) => {
        regexString += `"?${prop}"?:[a-zA-Z_$]{1,2}`;
        if (propIdx < propList.length - 1) {
            regexString += ",";
        }
    });
    return new RegExp(regexString);
}
let oldHooks = {};
export let INTERNAL_HOOKS = window.SP_REACT?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher
    .current || Object.values(window.SP_REACT?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE).find((p) => p?.useEffect);
export function applyHookStubs(customHooks = {}) {
    const hooks = INTERNAL_HOOKS;
    oldHooks = {
        useContext: hooks.useContext,
        useCallback: hooks.useCallback,
        useLayoutEffect: hooks.useLayoutEffect,
        useEffect: hooks.useEffect,
        useMemo: hooks.useMemo,
        useRef: hooks.useRef,
        useState: hooks.useState,
    };
    hooks.useCallback = (cb) => cb;
    hooks.useContext = (cb) => cb?._currentValue;
    hooks.useLayoutEffect = (_) => { };
    hooks.useMemo = (cb, _) => cb;
    hooks.useEffect = (_) => { };
    hooks.useRef = (val) => ({ current: val || {} });
    hooks.useState = (v) => {
        let val = v;
        return [val, (n) => (val = n)];
    };
    Object.assign(hooks, customHooks);
    return hooks;
}
export function removeHookStubs() {
    const hooks = INTERNAL_HOOKS;
    Object.assign(hooks, oldHooks);
    oldHooks = {};
}
export function fakeRenderComponent(fun, customHooks) {
    const hooks = applyHookStubs(customHooks);
    const res = fun(hooks);
    removeHookStubs();
    return res;
}
export function wrapReactType(node, prop = 'type') {
    if (node[prop]?.__DECKY_WRAPPED) {
        return node[prop];
    }
    else {
        return (node[prop] = { ...node[prop], __DECKY_WRAPPED: true });
    }
}
export function wrapReactClass(node, prop = 'type') {
    var _a;
    if (node[prop]?.__DECKY_WRAPPED) {
        return node[prop];
    }
    else {
        const cls = node[prop];
        const wrappedCls = (_a = class extends cls {
            },
            __setFunctionName(_a, "wrappedCls"),
            _a.__DECKY_WRAPPED = true,
            _a);
        return (node[prop] = wrappedCls);
    }
}
export function getReactRoot(o) {
    return (o[Object.keys(o).find((k) => k.startsWith('__reactContainer$'))] ||
        o['_reactRootContainer']?._internalRoot?.current);
}
export function getReactInstance(o) {
    return (o[Object.keys(o).find((k) => k.startsWith('__reactFiber'))] ||
        o[Object.keys(o).find((k) => k.startsWith('__reactInternalInstance'))]);
}
export const findInTree = (parent, filter, opts) => {
    const { walkable = null, ignore = [] } = opts ?? {};
    if (!parent || typeof parent !== 'object') {
        return null;
    }
    if (filter(parent))
        return parent;
    if (Array.isArray(parent)) {
        return parent.map((x) => findInTree(x, filter, opts)).find((x) => x);
    }
    return (walkable || Object.keys(parent))
        .map((x) => !ignore.includes(x) && findInTree(parent[x], filter, opts))
        .find((x) => x);
};
export const findInReactTree = (node, filter) => findInTree(node, filter, {
    walkable: ['props', 'children', 'child', 'sibling'],
});
export function getParentWindow(elem) {
    return elem?.ownerDocument?.defaultView;
}
export function useWindowRef() {
    const [win, setWin] = useState(null);
    return [(elem) => setWin(getParentWindow(elem)), win];
}
