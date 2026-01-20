import { ModuleID } from './webpack';
export interface ClassModule {
    [name: string]: string;
}
export declare const classModuleMap: Map<ModuleID, ClassModule>;
export declare const classMap: ClassModule[];
export declare function findClass(id: string, name: string): string | void;
export declare function findClassByName(name: string): string | void;
export declare function findClassModule(filter: (module: any) => boolean): ClassModule | void;
export declare function unminifyClass(minifiedClass: string): string | void;
