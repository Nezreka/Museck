import { type FC } from 'react';
export interface FCTrampoline {
    component: FC;
}
export declare function setFCTrampolineLoggingEnabled(value?: boolean): void;
export declare function injectFCTrampoline(component: FC, customHooks?: any): FCTrampoline;
