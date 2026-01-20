import { createModuleMapping } from './webpack';
export const classModuleMap = createModuleMapping((m) => {
    if (typeof m == 'object' && !m.__esModule) {
        const keys = Object.keys(m);
        if (keys.length == 1 && m.version)
            return false;
        if (keys.length > 1000 && m.AboutSettings)
            return false;
        return keys.length > 0 && keys.every((k) => !Object.getOwnPropertyDescriptor(m, k)?.get && typeof m[k] == 'string');
    }
    return false;
});
export const classMap = [...classModuleMap.values()];
export function findClass(id, name) {
    return classModuleMap.get(id)?.[name];
}
export function findClassByName(name) {
    return classMap.find((m) => m[name])?.[name];
}
export function findClassModule(filter) {
    return classMap.find((m) => filter(m));
}
export function unminifyClass(minifiedClass) {
    for (let m of classModuleMap.values()) {
        for (let className of Object.keys(m)) {
            if (m[className] == minifiedClass)
                return className;
        }
    }
}
