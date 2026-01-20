import { EResult, JsPbMessage, OperationResponse, Unregisterable } from "./shared";
export interface Updates {
    ApplyUpdates(base64: string): Promise<OperationResponse>;
    CheckForUpdates(): Promise<OperationResponse>;
    GetCurrentOSBranch(): Promise<OSBranch>;
    GetOSBranchList(): Promise<any[]>;
    RegisterForUpdateStateChanges(callback: (data: ArrayBuffer) => void): Unregisterable;
    SelectOSBranch(base64: string): Promise<OperationResponse>;
}
export interface OSBranch {
    eBranch: EOSBranch;
    sRawName: string;
}
export declare enum EOSBranch {
    Unknown = 0,
    Release = 1,
    ReleaseCandidate = 2,
    Beta = 3,
    BetaCandidate = 4,
    Preview = 5,
    PreviewCandidate = 6,
    Main = 7,
    Staging = 8
}
export interface MsgSystemUpdateState extends JsPbMessage {
    state(): EUpdaterState | undefined;
    progress(): UpdateProgress | undefined;
    supports_os_updates(): boolean | undefined;
    update_apply_results(): UpdateApplyResult[];
    update_check_results(): UpdateCheckResult[];
}
export interface UpdateApplyResult {
    type: EUpdaterType;
    eresult: EResult;
    requires_client_restart: boolean;
    requires_system_restart: boolean;
}
export interface UpdateCheckResult {
    type: EUpdaterType;
    eresult: EResult;
    rtime_checked: number;
    available: boolean;
}
export interface UpdateProgress {
    stage_progress: number | undefined;
    stage_size_bytes: number | undefined;
    rtime_estimated_completion: number | undefined;
}
export declare enum EUpdaterState {
    Invalid = 0,
    UpToDate = 2,
    Checking = 3,
    Available = 4,
    Applying = 5,
    ClientRestartPending = 6,
    SystemRestartPending = 7,
    RollBack = 8
}
export declare enum EUpdaterType {
    Invalid = 0,
    Client = 1,
    OS = 2,
    BIOS = 3,
    Aggregated = 4,
    Test1 = 5,
    Test2 = 6,
    Dummy = 7
}
