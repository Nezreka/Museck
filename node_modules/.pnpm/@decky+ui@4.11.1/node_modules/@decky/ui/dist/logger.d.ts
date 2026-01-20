export declare const log: (name: string, ...args: any[]) => void;
export declare const group: (name: string, ...args: any[]) => void;
export declare const groupEnd: (name: string, ...args: any[]) => void;
export declare const debug: (name: string, ...args: any[]) => void;
export declare const warn: (name: string, ...args: any[]) => void;
export declare const error: (name: string, ...args: any[]) => void;
declare class Logger {
    private name;
    constructor(name: string);
    log(...args: any[]): void;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    group(...args: any[]): void;
    groupEnd(...args: any[]): void;
}
export default Logger;
