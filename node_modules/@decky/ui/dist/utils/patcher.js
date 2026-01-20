export let callOriginal = Symbol('DECKY_CALL_ORIGINAL');
export function beforePatch(object, property, handler, options = {}) {
    const orig = object[property];
    object[property] = function (...args) {
        handler.call(this, args);
        const ret = patch.original.call(this, ...args);
        if (options.singleShot) {
            patch.unpatch();
        }
        return ret;
    };
    const patch = processPatch(object, property, handler, object[property], orig);
    return patch;
}
export function afterPatch(object, property, handler, options = {}) {
    const orig = object[property];
    object[property] = function (...args) {
        let ret = patch.original.call(this, ...args);
        ret = handler.call(this, args, ret);
        if (options.singleShot) {
            patch.unpatch();
        }
        return ret;
    };
    const patch = processPatch(object, property, handler, object[property], orig);
    return patch;
}
export function replacePatch(object, property, handler, options = {}) {
    const orig = object[property];
    object[property] = function (...args) {
        const ret = handler.call(this, args);
        if (ret == callOriginal)
            return patch.original.call(this, ...args);
        if (options.singleShot) {
            patch.unpatch();
        }
        return ret;
    };
    const patch = processPatch(object, property, handler, object[property], orig);
    return patch;
}
function processPatch(object, property, handler, patchedFunction, original) {
    Object.assign(object[property], original);
    object[property].toString = () => original.toString();
    Object.defineProperty(object[property], '__deckyOrig', {
        get: () => patch.original,
        set: (val) => (patch.original = val),
    });
    const patch = {
        object,
        property,
        handler,
        patchedFunction,
        original,
        hasUnpatched: false,
        unpatch: () => unpatch(patch),
    };
    object[property].__deckyPatch = patch;
    return patch;
}
function unpatch(patch) {
    const { object, property, handler, patchedFunction, original } = patch;
    if (patch.hasUnpatched)
        throw new Error('Function is already unpatched.');
    let realProp = property;
    let realObject = object;
    console.debug('[Patcher] unpatching', {
        realObject,
        realProp,
        object,
        property,
        handler,
        patchedFunction,
        original,
        isEqual: realObject[realProp] === patchedFunction,
    });
    while (realObject[realProp] && realObject[realProp] !== patchedFunction) {
        realObject = realObject[realProp].__deckyPatch;
        realProp = 'original';
        console.debug('[Patcher] moved to next', {
            realObject,
            realProp,
            object,
            property,
            handler,
            patchedFunction,
            original,
            isEqual: realObject[realProp] === patchedFunction,
        });
    }
    realObject[realProp] = realObject[realProp].__deckyPatch.original;
    patch.hasUnpatched = true;
    console.debug('[Patcher] unpatched', {
        realObject,
        realProp,
        object,
        property,
        handler,
        patchedFunction,
        original,
        isEqual: realObject[realProp] === patchedFunction,
    });
}
