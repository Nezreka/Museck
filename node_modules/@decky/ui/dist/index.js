export * from './custom-components';
export * from './custom-hooks';
export * from './components';
export * from './deck-hooks';
export * from './modules';
export * from './globals';
export * from './webpack';
export * from './utils';
export * from './class-mapper';
export const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};
