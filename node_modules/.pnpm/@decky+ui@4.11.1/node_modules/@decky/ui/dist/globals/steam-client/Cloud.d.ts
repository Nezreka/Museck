export interface Cloud {
    ResolveAppSyncConflict(appId: number, keepLocal: boolean): void;
    RetryAppSync(appId: number): void;
}
