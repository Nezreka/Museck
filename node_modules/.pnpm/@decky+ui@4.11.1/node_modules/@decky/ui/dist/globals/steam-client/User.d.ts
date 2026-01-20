import { EResult, OperationResponse, Unregisterable } from "./shared";
export interface User {
    AuthorizeMicrotxn(txnId: number | string): void;
    CancelLogin(): void;
    CancelMicrotxn(txnId: number | string): void;
    CancelShutdown(): void;
    ChangeUser(): void;
    Connect(): Promise<OperationResponse>;
    FlipToLogin(): void;
    ForceShutdown(): void;
    ForgetPassword(accountName: string): Promise<boolean>;
    GetIPCountry(): Promise<string>;
    GetLoginProgress(callback: (param0: number, param1: number) => void): Unregisterable;
    GetLoginUsers(): Promise<LoginUser[]>;
    GoOffline(): void;
    GoOnline(): void;
    OptOutOfSurvey(): void;
    PrepareForSystemSuspend(): Promise<{
        result: EResult;
    }>;
    Reconnect(): void;
    RegisterForConnectionAttemptsThrottled(callback: (data: ConnectionAttempt) => void): Unregisterable;
    RegisterForCurrentUserChanges(callback: (user: CurrentUser) => void): void;
    RegisterForLoginStateChange(callback: (accountName: string, state: ELoginState, result: EResult, param3: number, percentage: number, emailDomain: string) => void): Unregisterable;
    RegisterForPrepareForSystemSuspendProgress(callback: (progress: SuspendProgress) => void): Unregisterable;
    RegisterForResumeSuspendedGamesProgress(callback: (progress: SuspendProgress) => void): Unregisterable;
    RegisterForShowHardwareSurvey(callback: () => void): Unregisterable;
    RegisterForShutdownDone(callback: (state: EShutdownStep, appid: number, param2: boolean) => void): Unregisterable;
    RegisterForShutdownFailed(callback: (state: EShutdownStep, appid: number, success: boolean) => void): Unregisterable;
    RegisterForShutdownStart(callback: (param0: boolean) => void): Unregisterable;
    RegisterForShutdownState(callback: (state: EShutdownStep, appid: number, allowForceQuit: boolean) => void): Unregisterable;
    RemoveUser(accountName: string): void;
    RequestSupportSystemReport(reportId: string): Promise<{
        bSuccess: boolean;
    }>;
    ResumeSuspendedGames(param0: boolean): Promise<ResumeSuspendedGamesResult>;
    RunSurvey(callback: (surveySections: SurveySection[]) => void): void;
    SendSurvey(): void;
    SetAsyncNotificationEnabled(appId: number, enable: boolean): void;
    SetLoginCredentials(accountName: string, password: string, rememberMe: boolean): void;
    SetOOBEComplete(): void;
    ShouldShowUserChooser(): Promise<boolean>;
    SignOutAndRestart(): void;
    StartLogin(): void;
    StartOffline(value: boolean): void;
    StartRestart(force: boolean): void;
    StartShutdown(force: boolean): void;
}
export interface ConnectionAttempt {
    rtCooldownExpiration: number;
}
export interface CurrentUser {
    NotificationCounts: {
        async_game_updates: number;
        comments: number;
        gifts: number;
        help_request_replies: number;
        inventory_items: number;
        invites: number;
        moderator_messages: number;
        offline_messages: number;
        trade_offers: number;
    };
    bHWSurveyPending: boolean;
    bIsLimited: boolean;
    bIsOfflineMode: boolean;
    bPromptToChangePassword: boolean;
    bSupportAckOnlyMessages: boolean;
    bSupportAlertActive: boolean;
    bSupportPopupMessage: boolean;
    clientinstanceid: string;
    strAccountBalance: string;
    strAccountBalancePending: string;
    strAccountName: string;
    strFamilyGroupID: string;
    strSteamID: string;
}
export declare enum ELoginState {
    None = 0,
    WelcomeDialog = 1,
    WaitingForCreateUser = 2,
    WaitingForCredentials = 3,
    WaitingForNetwork = 4,
    WaitingForServerResponse = 5,
    WaitingForLibraryReady = 6,
    Success = 7,
    Quit = 8
}
export declare enum EShutdownStep {
    None = 0,
    Start = 1,
    WaitForGames = 2,
    WaitForCloud = 3,
    FinishingDownload = 4,
    WaitForDownload = 5,
    WaitForServiceApps = 6,
    WaitForLogOff = 7,
    Done = 8
}
export declare enum ESuspendResumeProgressState {
    Invalid = 0,
    Complete = 1,
    CloudSync = 2,
    LoggingIn = 3,
    WaitingForApp = 4,
    Working = 5
}
export interface LoginUser {
    personaName: string;
    accountName: string;
    hasPin: boolean;
    rememberPassword: boolean;
    avatarUrl: string;
}
export interface ResumeSuspendedGamesResult {
    nAppIDPlayingElsewhere: number;
    result: EResult;
}
export interface SuspendProgress {
    bGameSuspended: boolean;
    state: ESuspendResumeProgressState;
}
export interface SurveyEntry {
    strName: string;
    vecArgs: string[];
}
export interface SurveySection {
    strSectionName: string;
    vecEntries: SurveyEntry[];
}
