export * from './patcher';
export * from './static-classes';
export * from './react/react';
export * from './react/fc';
export * from './react/treepatcher';
declare global {
    var FocusNavController: any;
    var GamepadNavTree: any;
}
export declare function joinClassNames(...classes: string[]): string;
export declare function sleep(ms: number): Promise<unknown>;
export declare function findSP(): Window;
export declare function getFocusNavController(): any;
export declare function getGamepadNavigationTrees(): any;
