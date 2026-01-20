import { createElement } from 'react';
import { applyHookStubs, removeHookStubs } from './react';
import Logger from '../../logger';
let loggingEnabled = false;
export function setFCTrampolineLoggingEnabled(value = true) { loggingEnabled = value; }
;
let logger = new Logger('FCTrampoline');
export function injectFCTrampoline(component, customHooks) {
    const newComponent = function (...args) {
        loggingEnabled && logger.debug("new component rendering with props", args);
        return component.apply(this, args);
    };
    const userComponent = { component: newComponent };
    component.prototype.render = function (...args) {
        loggingEnabled && logger.debug("rendering trampoline", args, this);
        return createElement(userComponent.component, this.props, this.props.children);
    };
    component.prototype.isReactComponent = true;
    let stubsApplied = false;
    let oldCreateElement = window.SP_REACT.createElement;
    const applyStubsIfNeeded = () => {
        if (!stubsApplied) {
            loggingEnabled && logger.debug("applied stubs");
            stubsApplied = true;
            applyHookStubs(customHooks);
            window.SP_REACT.createElement = () => {
                loggingEnabled && logger.debug("createElement hook called");
                loggingEnabled && console.trace("createElement trace");
                return Object.create(component.prototype);
            };
        }
    };
    const removeStubsIfNeeded = () => {
        if (stubsApplied) {
            loggingEnabled && logger.debug("removed stubs");
            stubsApplied = false;
            removeHookStubs();
            window.SP_REACT.createElement = oldCreateElement;
        }
    };
    let renderHookStep = 0;
    if (window.SP_REACTDOM.version.startsWith("19.")) {
        Object.defineProperty(component, "contextType", {
            configurable: true,
            get: function () {
                loggingEnabled && logger.debug("get contexttype", this, this._contextType, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("contextType trace");
                if (renderHookStep == 0) {
                    renderHookStep = 1;
                }
                if (this._contextType == null) {
                    this._contextType = {};
                }
                if (!this._contextType.appliedCurrentValueHook) {
                    logger.debug("applied currentvalue hook");
                    this._contextType.appliedCurrentValueHook = true;
                    Object.defineProperty(this._contextType, "_currentValue", {
                        configurable: true,
                        get: function () {
                            loggingEnabled && logger.debug("get currentValue", this, stubsApplied, renderHookStep);
                            loggingEnabled && console.trace("currentValue trace");
                            if (renderHookStep == 1) {
                                renderHookStep = 2;
                                applyStubsIfNeeded();
                            }
                            return this.__currentValue;
                        },
                        set: function (value) {
                            return this.__currentValue = value;
                        }
                    });
                }
                return this._contextType;
            },
            set: function (value) {
                this._contextType = value;
            }
        });
        Object.defineProperty(component.prototype, "updater", {
            configurable: true,
            get: function () {
                return this._updater;
            },
            set: function (value) {
                loggingEnabled && logger.debug("set updater", this, value, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("updater trace");
                if (renderHookStep == 1 || renderHookStep == 2) {
                    renderHookStep = 0;
                    removeStubsIfNeeded();
                }
                return this._updater = value;
            }
        });
        Object.defineProperty(component, "getDerivedStateFromProps", {
            configurable: true,
            get: function () {
                loggingEnabled && logger.debug("get getDerivedStateFromProps", this, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("getDerivedStateFromProps trace");
                if (renderHookStep == 1 || renderHookStep == 2) {
                    renderHookStep = 0;
                    removeStubsIfNeeded();
                }
                return this._getDerivedStateFromProps;
            },
            set: function (value) {
                this._getDerivedStateFromProps = value;
            }
        });
    }
    else if (window.SP_REACTDOM.version.startsWith("18.")) {
        Object.defineProperty(component, "contextType", {
            configurable: true,
            get: function () {
                loggingEnabled && logger.debug("get contexttype", this, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("contextType trace");
                if (renderHookStep == 0)
                    renderHookStep = 1;
                else if (renderHookStep == 3)
                    renderHookStep = 4;
                return this._contextType;
            },
            set: function (value) {
                this._contextType = value;
            }
        });
        Object.defineProperty(component, "contextTypes", {
            configurable: true,
            get: function () {
                loggingEnabled && logger.debug("get contexttypes", this, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("contextTypes trace");
                if (renderHookStep == 1) {
                    renderHookStep = 2;
                    applyStubsIfNeeded();
                }
                ;
                return this._contextTypes;
            },
            set: function (value) {
                this._contextTypes = value;
            }
        });
        Object.defineProperty(component.prototype, "updater", {
            configurable: true,
            get: function () {
                return this._updater;
            },
            set: function (value) {
                loggingEnabled && logger.debug("set updater", this, value, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("updater trace");
                if (renderHookStep == 2) {
                    renderHookStep = 0;
                    removeStubsIfNeeded();
                }
                return this._updater = value;
            }
        });
        Object.defineProperty(component, "getDerivedStateFromProps", {
            configurable: true,
            get: function () {
                loggingEnabled && logger.debug("get getDerivedStateFromProps", this, stubsApplied, renderHookStep);
                loggingEnabled && console.trace("getDerivedStateFromProps trace");
                if (renderHookStep == 2) {
                    renderHookStep = 0;
                    removeStubsIfNeeded();
                }
                return this._getDerivedStateFromProps;
            },
            set: function (value) {
                this._getDerivedStateFromProps = value;
            }
        });
    }
    return userComponent;
}
