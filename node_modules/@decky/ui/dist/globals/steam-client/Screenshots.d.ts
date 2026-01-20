export interface Screenshots {
    DeleteLocalScreenshot(appId: string, screenshotIndex: number): Promise<boolean>;
    DeleteLocalScreenshots(screenshots: ScreenshotToDelete[]): Promise<ScreenshotDeletionResponse>;
    GetAllAppsLocalScreenshots(): Promise<Screenshot[]>;
    GetAllAppsLocalScreenshotsCount(): Promise<number>;
    GetAllAppsLocalScreenshotsRange(start: number, end: number): Promise<Screenshot[]>;
    GetAllLocalScreenshots(): Promise<Screenshot[]>;
    GetGameWithLocalScreenshots(screenshotIndex: number): Promise<number>;
    GetLastScreenshotTaken(): Promise<Screenshot>;
    GetLocalScreenshotByHandle(appId: string, screenshotIndex: number): Promise<Screenshot>;
    GetLocalScreenshotCount(appId: number): Promise<number>;
    GetLocalScreenshotPath(appId: number, hHandle: number): Promise<string>;
    GetNumGamesWithLocalScreenshots(): Promise<number>;
    GetTotalDiskSpaceUsage(path: string): Promise<number>;
    ShowScreenshotInSystemViewer(appId: string, screenshotIndex: number): void;
    ShowScreenshotsOnDisk(appId: string): void;
    UploadLocalScreenshot(appId: string, localScreenshot_hHandle: number, filePrivacyState: EUCMFilePrivacyState): Promise<boolean>;
}
export interface Screenshot {
    nAppID: number;
    strGameID: string;
    hHandle: number;
    nWidth: number;
    nHeight: number;
    nCreated: number;
    ePrivacy: EUCMFilePrivacyState;
    strCaption: string;
    bSpoilers: boolean;
    strUrl: string;
    bUploaded: boolean;
    ugcHandle: string;
}
export interface ScreenshotToDelete {
    gameID: string;
    rgHandles: number[];
}
export interface ScreenshotDeletionResponse {
    bSuccess: boolean;
    rgFailedRequestIndices: number[];
}
export declare enum EUCMFilePrivacyState {
    Invalid = -1,
    Private = 2,
    FriendsOnly = 4,
    Public = 8,
    Unlisted = 16
}
