import { GenericPatchHandler } from '../patcher';
export type GenericNodeStep = (node: any) => any;
export type NodeStep = GenericNodeStep;
export type ReactPatchHandler = GenericPatchHandler;
export declare function setReactPatcherLoggingEnabled(value?: boolean): void;
export declare function setReactPatcherPerformanceLoggingEnabled(value?: boolean): void;
export declare function createReactTreePatcher(steps: NodeStep[], handler: GenericPatchHandler, debugName?: string): GenericPatchHandler;
