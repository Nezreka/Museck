export declare let callOriginal: symbol;
export interface PatchOptions {
    singleShot?: boolean;
}
export type GenericPatchHandler = (args: any[], ret?: any) => any;
export interface Patch {
    original: Function;
    property: string;
    object: any;
    patchedFunction: any;
    hasUnpatched: boolean;
    handler: GenericPatchHandler;
    unpatch: () => void;
}
export declare function beforePatch(object: any, property: string, handler: (args: any[]) => any, options?: PatchOptions): Patch;
export declare function afterPatch(object: any, property: string, handler: (args: any[], ret: any) => any, options?: PatchOptions): Patch;
export declare function replacePatch(object: any, property: string, handler: (args: any[]) => any, options?: PatchOptions): Patch;
