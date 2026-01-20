import Logger from '../../logger';
import { afterPatch } from '../patcher';
import { wrapReactClass, wrapReactType } from './react';
let loggingEnabled = false;
let perfLoggingEnabled = false;
export function setReactPatcherLoggingEnabled(value = true) { loggingEnabled = value; }
;
export function setReactPatcherPerformanceLoggingEnabled(value = true) { perfLoggingEnabled = value; }
;
function patchComponent(node, handler, steps, step, caches, logger, prop = 'type') {
    loggingEnabled && logger.group('Patching node:', node);
    switch (typeof node?.[prop]) {
        case 'function':
            const patch = afterPatch(node, prop, steps[step + 1] ? createStepHandler(handler, steps, step + 1, caches, logger) : handler);
            loggingEnabled && logger.debug('Patched a function component', patch);
            break;
        case 'object':
            if (node[prop]?.prototype?.render) {
                wrapReactClass(node);
                const patch = afterPatch(node[prop].prototype, 'render', steps[step + 1] ? createStepHandler(handler, steps, step + 1, caches, logger) : handler);
                loggingEnabled && logger.debug('Patched class component', patch);
            }
            else {
                loggingEnabled && logger.debug('Patching forwardref/memo');
                wrapReactType(node, prop);
                patchComponent(node[prop], handler, steps, step, caches, logger, node[prop]?.render ? 'render' : 'type');
            }
            break;
        default:
            logger.error('Unhandled component type', node);
            break;
    }
    loggingEnabled && logger.groupEnd();
}
function handleStep(tree, handler, steps, step, caches, logger) {
    const startTime = (loggingEnabled || perfLoggingEnabled) ? performance.now() : 0;
    const stepHandler = steps[step];
    const cache = caches[step] || (caches[step] = new Map());
    loggingEnabled && logger.debug(`Patch step ${step} running`, { tree, stepHandler, step, caches });
    const node = stepHandler(tree);
    if (node && node.type) {
        loggingEnabled && logger.debug('Found node', node);
    }
    else if (node) {
        loggingEnabled && logger.error('Found node without type. Something is probably wrong.', node);
        return tree;
    }
    else {
        loggingEnabled && logger.warn('Found no node. Depending on your usecase, this might be fine.', node);
        return tree;
    }
    let cachedType;
    if (cachedType = cache.get(node.type)) {
        loggingEnabled && logger.debug('Found cached patched component', node);
        node.type = cachedType;
        (loggingEnabled || perfLoggingEnabled) && logger.debug(`Patch step ${step} took ${performance.now() - startTime}ms with cache`);
        return tree;
    }
    const originalType = node.type;
    patchComponent(node, handler, steps, step, caches, logger);
    cache.set(originalType, node.type);
    (loggingEnabled || perfLoggingEnabled) && logger.debug(`Patch step ${step} took ${performance.now() - startTime}ms`);
    return tree;
}
;
function createStepHandler(handler, steps, step, caches, logger) {
    loggingEnabled && logger.debug(`Creating handler for step ${step}`);
    return (_, tree) => handleStep(tree, handler, steps, step, caches, logger);
}
export function createReactTreePatcher(steps, handler, debugName = 'ReactPatch') {
    const caches = [];
    const logger = new Logger(`ReactTreePatcher -> ${debugName}`);
    loggingEnabled && logger.debug('Init with options:', steps, debugName);
    return createStepHandler(handler, steps, 0, caches, logger);
}
