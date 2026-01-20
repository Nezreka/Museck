import type { EResult, JsPbMessage, OperationResponse, Unregisterable, VDFBoolean_t } from "./shared";
import type { EControllerRumbleSetting, EThirdPartyControllerConfiguration } from "./Input";
import { EUCMFilePrivacyState, Screenshot } from "./Screenshots";
export interface Apps {
    AddShortcut(appName: string, executablePath: string, directory: string, launchOptions: string): Promise<number>;
    BackupFilesForApp(appId: number, backupPath: string): Promise<number>;
    BrowseScreenshotForApp(appId: string, handle: number): void;
    BrowseScreenshotsForApp(appId: string): void;
    CancelBackup(): void;
    CancelGameAction(gameActionId: number): void;
    CancelLaunch(appId: string): void;
    ClearCustomArtworkForApp(appId: number, assetType: ELibraryAssetType): Promise<void>;
    ClearCustomLogoPositionForApp(appId: number): Promise<void>;
    ClearProton(appId: number): Promise<void>;
    ContinueGameAction(gameActionId: number, actionType: string): void;
    CreateDesktopShortcutForApp(appId: number): void;
    DownloadWorkshopItem(appId: number, itemId: string, param1: boolean): void;
    GetAchievementsInTimeRange(appId: number, start: number, end: number): Promise<AppAchievement[]>;
    GetActiveGameActions(): Promise<GameAction[]>;
    GetAvailableCompatTools(appId: number): Promise<CompatibilityTool[]>;
    GetBackupsInFolder(appBackupPath: string): Promise<string | undefined>;
    GetCachedAppDetails(appId: number): Promise<string>;
    GetCloudPendingRemoteOperations(appId: number): Promise<{
        PendingOperations: ArrayBuffer;
    }>;
    GetCompatExperiment(param0: number): Promise<string>;
    GetConflictingFileTimestamps(appId: number): Promise<ConflictingFileTimestamp>;
    GetDetailsForScreenshotUpload(appId: string, hHandle: number): Promise<ScreenshotUploadDetails>;
    GetDetailsForScreenshotUploads(appId: string, hHandles: number[]): Promise<ScreenshotUploadsDetails>;
    GetDownloadedWorkshopItems(appId: number): Promise<WorkshopItem[]>;
    GetDurationControlInfo(appId: number): Promise<{
        bApplicable: boolean;
    }>;
    GetFriendAchievementsForApp(appId: string, friendSteam64Id: string): Promise<AppAchievementResponse>;
    GetFriendsWhoPlay(appId: number): Promise<string[]>;
    GetGameActionDetails(appId: number, callback: (gameAction: GameAction) => void): void;
    GetGameActionForApp(appId: string, callback: (gameActionId: number, appId: 0 | string, taskName: AppAction_t) => void): void;
    GetLaunchOptionsForApp(appId: number): Promise<LaunchOption[]>;
    GetLibraryBootstrapData(): Promise<ArrayBuffer>;
    GetMyAchievementsForApp(appId: string): Promise<AppAchievementResponse>;
    GetPlaytime(appId: number): Promise<Playtime | undefined>;
    GetPrePurchasedApps(appIds: number[]): Promise<PrePurchaseInfo>;
    GetResolutionOverrideForApp(appId: number): Promise<string>;
    GetScreenshotInfo(appId: string, hHandle: number): Promise<Screenshot>;
    GetScreenshotsInTimeRange(appId: number, start: number, end: number): Promise<Screenshot[]>;
    GetShortcutDataForPath(pathToShortcut: string): Promise<Shortcut>;
    GetSoundtrackDetails(appId: number): Promise<SoundtrackDetails>;
    GetStoreTagLocalization(tags: number[]): Promise<StoreTagLocalization[]>;
    GetSubscribedWorkshopItemDetails(appId: number, itemIds: string[]): Promise<WorkshopItem[] | OperationResponse>;
    GetSubscribedWorkshopItems(appId: number): Promise<WorkshopItem[]>;
    InstallFlatpakAppAndCreateShortcut(appName: string, appCommandLineOptions: string): Promise<{
        appid: number;
        strInstallOutput: string;
    }>;
    JoinAppContentBeta(appId: number, name: string): Promise<EResult>;
    JoinAppContentBetaByPassword(appId: number, accessCode: string): Promise<any>;
    ListFlatpakApps(): Promise<any>;
    LoadEula(appId: number): Promise<EndUserLicenseAgreement[]>;
    MarkEulaAccepted(appId: number, id: string, version: number): void;
    MarkEulaRejected(appId: number, id: string, version: number): void;
    MoveWorkshopItemLoadOrder(appId: number, oldOrder: number, newOrder: number): void;
    OpenAppSettingsDialog(appId: number, section: string): void;
    RaiseWindowForGame(appId: number): Promise<ERaiseGameWindowResult>;
    RegisterForAchievementChanges(callback: (data: ArrayBuffer) => void): Unregisterable;
    RegisterForAppBackupStatus(callback: (status: AppBackupStatus) => void): Unregisterable;
    RegisterForAppDetails(appId: number, callback: (data: AppDetails) => void): Unregisterable;
    RegisterForAppOverviewChanges(callback: (data: ArrayBuffer) => void): void;
    RegisterForDRMFailureResponse(callback: (appid: number, eResult: EResult, errorCode: number) => void): Unregisterable;
    RegisterForGameActionEnd(callback: (gameActionId: number) => void): Unregisterable;
    RegisterForGameActionShowError(callback: (gameActionId: number, appId: string, actionName: string, error: string, param4: string) => void): Unregisterable;
    RegisterForGameActionShowUI(callback: () => void): Unregisterable;
    RegisterForGameActionStart(callback: (gameActionId: number, appId: string, action: string, param3: ELaunchSource) => void): Unregisterable;
    RegisterForGameActionTaskChange(callback: (gameActionId: number, appId: string, action: string, requestedAction: string, param4: string) => void): Unregisterable;
    RegisterForGameActionUserRequest(callback: (gameActionId: number, appId: string, action: string, requestedAction: string, appId2: string) => void): Unregisterable;
    RegisterForPrePurchasedAppChanges(callback: () => void): Unregisterable;
    RegisterForShowMarketingMessageDialog: Unregisterable;
    RegisterForWorkshopChanges(callback: (appId: number) => void): Unregisterable;
    RegisterForWorkshopItemDownloads(appId: number, callback: (appId: number, publishedFileId: string, param2: number) => void): Unregisterable;
    RegisterForWorkshopItemInstalled(callback: (item: InstalledWorkshopItem) => void): Unregisterable;
    RemoveShortcut(appId: number): void;
    ReportLibraryAssetCacheMiss(appId: number, assetType: ELibraryAssetType): void;
    ReportMarketingMessageDialogShown(): void;
    RequestIconDataForApp(appId: number): void;
    RequestLegacyCDKeysForApp(appId: number): void;
    RunGame(appId: string, launchOptions: string, param2: number, launchSource: ELaunchSource): void;
    SaveAchievementProgressCache(progress: string): Promise<void>;
    ScanForInstalledNonSteamApps(): Promise<NonSteamApp[]>;
    SetAppAutoUpdateBehavior(appId: number, mode: EAppAutoUpdateBehavior): void;
    SetAppBackgroundDownloadsBehavior(appId: number, mode: EAppAllowDownloadsWhileRunningBehavior): void;
    SetAppCurrentLanguage(appId: number, language: string): void;
    SetAppFamilyBlockedState(appIds: number[], state: boolean): void;
    SetAppLaunchOptions(appId: number, launchOptions: string): void;
    SetAppResolutionOverride(appId: number, resolution: string): void;
    SetCachedAppDetails(appId: number, details: string): Promise<void>;
    SetControllerRumblePreference(appId: number, value: EControllerRumbleSetting): void;
    SetCustomArtworkForApp(appId: number, base64: string, imageType: 'jpg' | 'png', assetType: ELibraryAssetType): Promise<void>;
    SetCustomLogoPositionForApp(appId: number, details: string): Promise<void>;
    SetDLCEnabled(appId: number, appDLCId: number, value: boolean): void;
    SetLocalScreenshotCaption(appId: string, hHandle: number, caption: string): void;
    SetLocalScreenshotPrivacy(appId: string, hHandle: number, privacy: EUCMFilePrivacyState): void;
    SetLocalScreenshotSpoiler(appId: string, hHandle: number, spoilered: boolean): void;
    SetShortcutExe(appId: number, path: string): void;
    SetShortcutIcon(appId: number, path: string): void;
    SetShortcutIsVR(appId: number, value: boolean): void;
    SetShortcutLaunchOptions(appId: number, options: string): void;
    SetShortcutName(appId: number, name: string): void;
    SetShortcutStartDir(appId: number, directory: string): void;
    SetStreamingClientForApp(appId: number, clientId: string): void;
    SetThirdPartyControllerConfiguration(appId: number, value: EThirdPartyControllerConfiguration): void;
    SetWorkshopItemsDisabledLocally(appId: number, itemIds: string[], value: boolean): void;
    SetWorkshopItemsLoadOrder(appId: number, itemIds: string[]): void;
    ShowControllerConfigurator(appId: number): void;
    ShowStore(appId: number): void;
    SpecifyCompatExperiment(appId: number, param1: string): void;
    SpecifyCompatTool(appId: number, strToolName: string): void;
    StreamGame(appId: number, clientId: string, param2: number): void;
    SubscribeWorkshopItem(appId: number, workshopId: string, subscribed: boolean): void;
    TerminateApp(appId: string, param1: boolean): void;
    ToggleAllowDesktopConfiguration(appId: number): void;
    ToggleAppSteamCloudEnabled(appId: number): void;
    ToggleAppSteamCloudSyncOnSuspendEnabled(appId: number): void;
    ToggleEnableSteamOverlayForApp(appId: number): void;
    ToggleOverrideResolutionForInternalDisplay(appId: number): void;
    UninstallFlatpakApp(app: string): Promise<boolean>;
    VerifyApp(appId: number): Promise<{
        nGameActionID: number;
    }>;
}
export declare enum ELibraryAssetType {
    Capsule = 0,
    Hero = 1,
    Logo = 2,
    Header = 3,
    Icon = 4,
    HeroBlur = 5
}
export interface AppAchievements {
    nAchieved: number;
    nTotal: number;
    vecAchievedHidden: AppAchievement[];
    vecHighlight: AppAchievement[];
    vecUnachieved: AppAchievement[];
}
export interface AppAchievement {
    bAchieved: boolean;
    bHidden: boolean;
    flMinProgress: number;
    flCurrentProgress: number;
    flMaxProgress: number;
    flAchieved: number;
    rtUnlocked: number;
    strDescription: string;
    strID: string;
    strImage: string;
    strName: string;
}
export type AppAction_t = "LaunchApp" | "VerifyApp";
export type LaunchAppTask_t = "None" | "Completed" | "Cancelled" | "Failed" | "Starting" | "ConnectingToSteam" | "RequestingLicense" | "UpdatingAppInfo" | "UpdatingAppTicket" | "UnlockingH264" | "WaitingOnWideVineUpdate" | "ShowCheckSystem" | "CheckTimedTrial" | "GetDurationControl" | "ShowDurationControl" | "ShowLaunchOption" | "ShowEula" | "ShowVR2DWarning" | "ShowVROculusOnly" | "ShowVRStreamingLaunch" | "ShowGameArgs" | "ShowCDKey" | "WaitingPrevProcess" | "DownloadingDepots" | "DownloadingWorkshop" | "UpdatingDRM" | "GettingLegacyKey" | "ProcessingInstallScript" | "RunningInstallScript" | "SynchronizingCloud" | "SynchronizingControllerConfig" | "ShowNoControllerConfig" | "ProcessingShaderCache" | "VerifyingFiles" | "KickingOtherSession" | "WaitingOpenVRAppQuit" | "SiteLicenseSeatCheckout" | "DelayLaunch" | "CreatingProcess" | "WaitingGameWindow";
export interface GameAction {
    nGameActionID: number;
    gameid: string;
    strActionName: AppAction_t;
    strTaskName: LaunchAppTask_t;
    strTaskDetails: string;
    nLaunchOption: number;
    nSecondsRemaing: number;
    strNumDone: string;
    strNumTotal: string;
    bWaitingForUI: boolean;
}
export interface ConflictingFileTimestamp {
    rtLocalTime: number;
    rtRemoteTime: number;
}
export interface CompatibilityTool {
    strToolName: string;
    strDisplayName: string;
}
export interface ScreenshotUploadDetails {
    strSizeOnDisk: string;
    strCloudAvailable: string;
    strCloudTotal: string;
}
export interface ScreenshotUploadsDetails {
    unSizeOnDisk: number;
    strCloudAvailable: string;
    strCloudTotal: string;
}
interface InstalledWorkshopItem {
    appid: number;
    legacy_content: string;
    manifestid: string;
    publishedfileid: string;
}
export interface WorkshopItem {
    unAppID: number;
    ulPublishedFileID: string;
}
export interface AppAchievementData {
    rgAchievements: AppAchievement[];
}
export interface AppAchievementResponse {
    result: EResult;
    data: AppAchievementData;
}
export interface LaunchOption {
    bIsLaunchOptionTypeExemptFromGameTheater: VDFBoolean_t;
    bIsVRLaunchOption: VDFBoolean_t;
    eType: EAppLaunchOptionType;
    nIndex: number;
    strDescription: string;
    strGameName: string;
}
export interface Playtime {
    nPlaytimeLastTwoWeeks: number;
    nPlaytimeForever: number;
    rtLastTimePlayed: number;
}
export interface PrePurchaseApp {
    nAppID: number;
    eState: EAppReleaseState;
}
export interface PrePurchaseInfo {
    apps: PrePurchaseApp[];
    lastChangeNumber: number;
}
export declare enum EAppReleaseState {
    Unknown = 0,
    Unavailable = 1,
    Prerelease = 2,
    PreloadOnly = 3,
    Released = 4,
    Disabled = 5
}
export declare enum EAppLaunchOptionType {
    None = 0,
    Default = 1,
    SafeMode = 2,
    Multiplayer = 3,
    Config = 4,
    OpenVR = 5,
    Server = 6,
    Editor = 7,
    Manual = 8,
    Benchmark = 9,
    Option1 = 10,
    Option2 = 11,
    Option3 = 12,
    OculusVR = 13,
    OpenVROverlay = 14,
    OSVR = 15,
    OpenXR = 16,
    Dialog = 1000
}
export interface SoundtrackDetails {
    tracks: SoundtrackTrack[];
    metadata: SoundtrackMetadata;
    vecAdditionalImageAssetURLs: string[];
    strCoverImageAssetURL: string;
}
export interface SoundtrackTrack {
    discNumber: number;
    trackNumber: number;
    durationSeconds: number;
    trackDisplayName: string;
}
export interface SoundtrackMetadata {
    artist: string;
}
export interface StoreTagLocalization {
    tag: number;
    string: string;
}
export interface WorkshopItem {
    children: string[];
    eresult: EResult;
    file_size: string;
    file_type: EWorkshopFileType;
    preview_url: string;
    publishedfileid: string;
    short_description: string;
    tags: string[];
    title: string;
}
export declare enum EWorkshopFileType {
    Invalid = -1,
    Community = 0,
    Microtransaction = 1,
    Collection = 2,
    Art = 3,
    Video = 4,
    Screenshot = 5,
    Game = 6,
    Software = 7,
    Concept = 8,
    WebGuide = 9,
    IntegratedGuide = 10,
    Merch = 11,
    ControllerBinding = 12,
    SteamworksAccessInvite = 13,
    SteamVideo = 14,
    GameManagedItem = 15,
    Max = 16
}
export interface EndUserLicenseAgreement {
    id: string;
    url: string;
    version: number;
}
export interface AppBackupStatus {
    appid: number;
    eError: EAppUpdateError;
    strBytesToProcess: string;
    strBytesProcessed: string;
    strTotalBytesWritten: string;
}
export declare enum EAppUpdateError {
    None = 0,
    Unspecified = 1,
    Paused = 2,
    Canceled = 3,
    Suspended = 4,
    NoSubscription = 5,
    NoConnection = 6,
    Timeout = 7,
    MissingKey = 8,
    MissingConfig = 9,
    DiskReadFailure = 10,
    DiskWriteFailure = 11,
    NotEnoughDiskSpace = 12,
    CorruptGameFiles = 13,
    WaitingForNextDisk = 14,
    InvalidInstallPath = 15,
    AppRunning = 16,
    DependencyFailure = 17,
    NotInstalled = 18,
    UpdateRequired = 19,
    Busy = 20,
    NoDownloadSources = 21,
    InvalidAppConfig = 22,
    InvalidDepotConfig = 23,
    MissingManifest = 24,
    NotReleased = 25,
    RegionRestricted = 26,
    CorruptDepotCache = 27,
    MissingExecutable = 28,
    InvalidPlatform = 29,
    InvalidFileSystem = 30,
    CorruptUpdateFiles = 31,
    DownloadDisabled = 32,
    SharedLibraryLocked = 33,
    PendingLicense = 34,
    OtherSessionPlaying = 35,
    CorruptDownload = 36,
    CorruptDisk = 37,
    FilePermissions = 38,
    FileLocked = 39,
    MissingContent = 40,
    Requires64BitOS = 41,
    MissingUpdateFiles = 42,
    NotEnoughDiskQuota = 43,
    LockedSiteLicense = 44,
    ParentalControlBlocked = 45,
    CreateProcessFailure = 46,
    SteamClientOutdated = 47,
    PlaytimeExceeded = 48,
    CorruptFileSignature = 49,
    MissingInstalledFiles = 50,
    CompatibilityToolFailure = 51,
    UnmountedUninstallPath = 52,
    InvalidBackupPath = 53,
    InvalidPasscode = 54,
    ThirdPartyUpdater = 55,
    ParentalPlaytimeExceeded = 56,
    Max = 57
}
export declare enum ESteamInputController {
    PlayStation = 1,
    Xbox = 2,
    Generic = 4,
    NintendoSwitch = 8
}
type AppPlatform_t = 'windows' | 'osx' | 'linux';
export interface AppDetails {
    achievements: AppAchievements;
    bAvailableContentOnStore: boolean;
    bCanMoveInstallFolder: boolean;
    bCloudAvailable: boolean;
    bCloudEnabledForAccount: boolean;
    bCloudEnabledForApp: boolean;
    bCloudSyncOnSuspendAvailable: boolean;
    bCloudSyncOnSuspendEnabled: boolean;
    bCommunityMarketPresence: boolean;
    bEnableAllowDesktopConfiguration: boolean;
    bFreeRemovableLicense: boolean;
    bHasAllLegacyCDKeys: boolean;
    bHasAnyLocalContent: boolean;
    bHasLockedPrivateBetas: boolean;
    bIsExcludedFromSharing: boolean;
    bIsSubscribedTo: boolean;
    bIsThirdPartyUpdater: boolean;
    bOverlayEnabled: boolean;
    bOverrideInternalResolution: boolean;
    bRequiresLegacyCDKey: boolean;
    bShortcutIsVR: boolean;
    bShowCDKeyInMenus: boolean;
    bShowControllerConfig: boolean;
    bSupportsCDKeyCopyToClipboard: boolean;
    bVRGameTheatreEnabled: boolean;
    bWorkshopVisible: boolean;
    deckDerivedProperties?: AppDeckDerivedProperties;
    eAppOwnershipFlags: number;
    eAutoUpdateValue: EAppAutoUpdateBehavior;
    eBackgroundDownloads: EAppAllowDownloadsWhileRunningBehavior;
    eCloudStatus: EAppCloudStatus;
    eCloudSync: number;
    eControllerRumblePreference: EControllerRumbleSetting;
    eDisplayStatus: EDisplayStatus;
    eEnableThirdPartyControllerConfiguration: EThirdPartyControllerConfiguration;
    eSteamInputControllerMask: number;
    iInstallFolder: number;
    lDiskSpaceRequiredBytes: number;
    lDiskUsageBytes: number;
    lDlcUsageBytes: number;
    nBuildID: number;
    nCompatToolPriority: number;
    nPlaytimeForever: number;
    nScreenshots: number;
    rtLastTimePlayed: number;
    rtLastUpdated: number;
    rtPurchased: number;
    selectedLanguage: AppLanguage;
    strCloudBytesAvailable: string;
    strCloudBytesUsed: string;
    strCompatToolDisplayName: string;
    strCompatToolName: string;
    strDeveloperName: string;
    strDeveloperURL: string;
    strDisplayName: string;
    strExternalSubscriptionURL: string;
    strFlatpakAppID: string;
    strHomepageURL: string;
    strLaunchOptions: string;
    strManualURL: string;
    strOwnerSteamID: string;
    strResolutionOverride: string;
    strSelectedBeta: string;
    strShortcutExe: string;
    strShortcutLaunchOptions: string;
    strShortcutStartDir: string;
    strSteamDeckBlogURL: string;
    unAppID: number;
    unEntitledContentApp: number;
    unTimedTrialSecondsAllowed: number;
    unTimedTrialSecondsPlayed: number;
    vecBetas: AppBeta[];
    vecChildConfigApps: number[];
    vecDLC: AppDLC[];
    vecDeckCompatTestResults: DeckCompatTestResult[];
    vecLanguages: AppLanguage[];
    vecLegacyCDKeys: LegacyCDKey[];
    vecMusicAlbums: AppSoundtrack[];
    vecPlatforms: AppPlatform_t[];
    vecScreenShots: Screenshot[];
    libraryAssets?: AppLibraryAsset;
}
interface AppAssociation {
    strName: string;
    strURL: string;
}
export interface AppAssociations {
    rgDevelopers: AppAssociation[];
    rgFranchises: AppAssociation[];
    rgPublishers: AppAssociation[];
}
export interface BadgeCard {
    nOwned: number;
    strArtworkURL: string;
    strImgURL: string;
    strMarketHash: string;
    strName: string;
    strTitle: string;
}
export interface Badge {
    bMaxed: VDFBoolean_t;
    dtNextRetry: number | null;
    nLevel: number;
    nMaxLevel: number;
    nNextLevelXP: number;
    nXP: number;
    rgCards: BadgeCard[];
    strIconURL: string;
    strName: string;
    strNextLevelName: string;
}
interface AppDescription {
    strFullDescription: string;
    strSnippet: string;
}
interface CachedAppDetailMap {
    achievementmap: string;
    achievements: AppAchievements;
    associations: AppAssociations;
    badge: Badge;
    descriptions: AppDescription;
    gameactivity: any[];
    usernews: string[];
    workshop_trendy_items: any;
}
export type CachedAppDetails = {
    [K in keyof CachedAppDetailMap]: {
        version: number;
        data: CachedAppDetailMap[K];
    };
};
export interface AppDeckDerivedProperties {
    gamescope_frame_limiter_not_supported?: boolean;
    non_deck_display_glyphs: boolean;
    primary_player_is_controller_slot_0: boolean;
    requires_h264: boolean;
    requires_internet_for_setup: boolean;
    requires_internet_for_singleplayer: boolean;
    requires_manual_keyboard_invoke: false;
    requires_non_controller_launcher_nav: false;
    small_text: boolean;
    supported_input: number;
}
export declare enum EAppOwnershipFlags {
    None = 0,
    Subscribed = 1,
    Free = 2,
    RegionRestricted = 4,
    LowViolence = 8,
    InvalidPlatform = 16,
    Borrowed = 32,
    FreeWeekend = 64,
    Retail = 128,
    Locked = 256,
    Pending = 512,
    Expired = 1024,
    Permanent = 2048,
    Recurring = 4096,
    Canceled = 8192,
    AutoGrant = 16384,
    PendingGift = 32768,
    RentalNotActivated = 65536,
    Rental = 131072,
    SiteLicense = 262144,
    LegacyFreeSub = 524288,
    InvalidOSType = 1048576,
    TimedTrial = 2097152
}
export declare enum EAppAutoUpdateBehavior {
    Always = 0,
    Launch = 1,
    HighPriority = 2
}
export declare enum EAppAllowDownloadsWhileRunningBehavior {
    UseGlobal = 0,
    AlwaysAllow = 1,
    NeverAllow = 2
}
export declare enum EDisplayStatus {
    Invalid = 0,
    Launching = 1,
    Uninstalling = 2,
    Installing = 3,
    Running = 4,
    Validating = 5,
    Updating = 6,
    Downloading = 7,
    Synchronizing = 8,
    ReadyToInstall = 9,
    ReadyToPreload = 10,
    ReadyToLaunch = 11,
    RegionRestricted = 12,
    PresaleOnly = 13,
    InvalidPlatform = 14,
    PreloadComplete = 16,
    BorrowerLocked = 17,
    UpdatePaused = 18,
    UpdateQueued = 19,
    UpdateRequired = 20,
    UpdateDisabled = 21,
    DownloadPaused = 22,
    DownloadQueued = 23,
    DownloadRequired = 24,
    DownloadDisabled = 25,
    LicensePending = 26,
    LicenseExpired = 27,
    AvailForFree = 28,
    AvailToBorrow = 29,
    AvailGuestPass = 30,
    Purchase = 31,
    Unavailable = 32,
    NotLaunchable = 33,
    CloudError = 34,
    CloudOutOfDate = 35,
    Terminating = 36,
    OwnerLocked = 37,
    DownloadFailed = 38,
    UpdateFailed = 39
}
export declare enum ESteamDeckCompatibilityTestResult {
    Invalid = 0,
    NotApplicable = 1,
    Pass = 2,
    Fail = 3,
    FailMinor = 4
}
export interface AppLanguage {
    strDisplayName: string;
    strShortName: string;
}
export interface LegacyCDKey {
    eResult: EResult;
    strKey: string;
    strName: string;
}
export interface AppBeta {
    strName: string;
    strDescription: string;
}
export interface AppDLC {
    bAvailableOnStore: boolean;
    bEnabled: boolean;
    lDiskUsageBytes: number;
    rtPurchaseDate: number;
    rtStoreAssetModifyType: number;
    strHeaderFilename: string;
    strName: string;
    strState: string;
    unAppID: number;
}
export interface DeckCompatTestResult {
    test_result: ESteamDeckCompatibilityTestResult;
    test_loc_token: string;
}
export interface AppSoundtrack {
    rtPurchaseDate: number;
    rtStoreAssetModifyType: number;
    strName: string;
    strState: string;
    unAppID: number;
}
export interface AppLibraryAsset {
    logoPosition?: LogoPosition;
    strCapsuleImage: string;
    strHeroBlurImage: string;
    strHeroImage: string;
    strLogoImage: string;
}
export interface LogoPosition {
    pinnedPosition: LogoPinPosition_t;
    nWidthPct: number;
    nHeightPct: number;
}
export type LogoPinPosition_t = 'BottomLeft' | 'UpperLeft' | 'CenterCenter' | 'UpperCenter' | 'BottomCenter';
export declare enum ELaunchSource {
    None = 0,
    _2ftLibraryDetails = 100,
    _2ftLibraryListView = 101,
    _2ftLibraryGrid = 102,
    InstallSubComplete = 103,
    DownloadsPage = 104,
    RemoteClientStartStreaming = 105,
    _2ftMiniModeList = 106,
    _10ft = 200,
    DashAppLaunchCmdLine = 300,
    DashGameIdLaunchCmdLine = 301,
    RunByGameDir = 302,
    SubCmdRunDashGame = 303,
    SteamURL_Launch = 400,
    SteamURL_Run = 401,
    SteamURL_JoinLobby = 402,
    SteamURL_RunGame = 403,
    SteamURL_RunGameIdOrJumplist = 404,
    SteamURL_RunSafe = 405,
    TrayIcon = 500,
    LibraryLeftColumnContextMenu = 600,
    LibraryLeftColumnDoubleClick = 601,
    Dota2Launcher = 700,
    IRunGameEngine = 800,
    DRMFailureResponse = 801,
    DRMDataRequest = 802,
    CloudFilePanel = 803,
    DiscoveredAlreadyRunning = 804,
    GameActionJoinParty = 900,
    AppPortraitContextMenu = 1000
}
export interface NonSteamApp {
    bIsApplication: boolean;
    strAppName: string;
    strExePath: string;
    strArguments: string;
    strCmdline: string;
    strIconDataBase64: string | undefined;
}
export interface Shortcut extends NonSteamApp {
    strShortcutPath: string | undefined;
    strSortAs: string | undefined;
}
export interface LogoPositionForApp {
    nVersion: number;
    logoPosition: LogoPosition;
}
export interface CLibraryBootstrapData extends JsPbMessage {
    app_data(): AppBootstrapData[];
    add_app_data(param0: any, param1: any): any;
    set_app_data(param0: any): any;
}
export interface AppBootstrapData {
    appid: number;
    hidden: boolean;
    user_tag: string[];
}
export interface CAppOverview_Change extends JsPbMessage {
    app_overview(): SteamAppOverview[];
    full_update(): boolean;
    removed_appid(): number[];
    update_complete(): boolean;
    add_app_overview(param0: any, param1: any): any;
    add_removed_appid(param0: any, param1: any): any;
    set_app_overview(param0: any): any;
    set_full_update(param0: any): any;
    set_removed_appid(param0: any): any;
    set_update_complete(param0: any): any;
}
export declare enum ECloudPendingRemoteOperation {
    None = 0,
    AppSessionActive = 1,
    UploadInProgress = 2,
    UploadPending = 3,
    AppSessionSuspended = 4
}
export interface CCloud_PendingRemoteOperation {
    operation(): ECloudPendingRemoteOperation;
    machine_name(): string;
    client_id(): number;
    time_last_updated(): number;
    os_type(): number;
    device_type(): number;
}
export interface CMsgCloudPendingRemoteOperations extends JsPbMessage {
    operations: CCloud_PendingRemoteOperation[];
}
export interface SteamAppOverview {
    appid: number;
    display_name: string;
    visible_in_game_list: boolean;
    sort_as: string;
    app_type: EAppType;
    mru_index: number | undefined;
    rt_recent_activity_time: number;
    minutes_playtime_forever: number;
    minutes_playtime_last_two_weeks: number;
    rt_last_time_played_or_installed: number;
    rt_last_time_played: number;
    store_tag?: number[];
    association: SteamAppOverviewAssociation[];
    store_category?: number[];
    rt_original_release_date: number;
    rt_steam_release_date: number;
    icon_hash: string;
    controller_support?: EAppControllerSupportLevel;
    vr_supported?: boolean;
    metacritic_score: number;
    size_on_disk?: number;
    third_party_mod?: boolean;
    icon_data?: string;
    icon_data_format?: string;
    gameid: string;
    library_capsule_filename?: string;
    per_client_data: SteamAppOverviewRemoteClientData[];
    most_available_clientid: string;
    selected_clientid?: string;
    rt_store_asset_mtime: number;
    rt_custom_image_mtime?: number;
    optional_parent_app_id?: number;
    owner_account_id?: number;
    review_score_with_bombs: number;
    review_percentage_with_bombs: number;
    review_score_without_bombs: number;
    review_percentage_without_bombs: number;
    library_id?: string;
    vr_only?: boolean;
    mastersub_appid?: number;
    mastersub_includedwith_logo?: string;
    site_license_site_name?: string;
    shortcut_override_appid?: number;
    steam_deck_compat_category: ESteamDeckCompatibilityCategory;
    rt_last_time_locally_played?: number;
    rt_purchased_time: number;
    header_filename?: string;
    local_cache_version?: number;
    ps4_controller_support?: EAppControllerSupportLevel;
    ps5_controller_support?: EAppControllerSupportLevel;
    gamepad_preferred?: boolean;
    canonicalAppType: number;
    local_per_client_data: SteamAppOverviewRemoteClientData;
    most_available_per_client_data: SteamAppOverviewRemoteClientData;
    selected_per_client_data: SteamAppOverviewRemoteClientData;
}
export declare enum EAppType {
    DepotOnly = -2147483648,
    Invalid = 0,
    Game = 1,
    Application = 2,
    Tool = 4,
    Demo = 8,
    Deprecated = 16,
    DLC = 32,
    Guide = 64,
    Driver = 128,
    Config = 256,
    Hardware = 512,
    Franchise = 1024,
    Video = 2048,
    Plugin = 4096,
    MusicAlbum = 8192,
    Series = 16384,
    Comic = 32768,
    Beta = 65536,
    Shortcut = 1073741824
}
export interface SteamAppOverviewAssociation {
    type: EAppAssociationType;
    name: string;
}
export declare enum EAppAssociationType {
    Invalid = 0,
    Publisher = 1,
    Developer = 2,
    Franchise = 3
}
export declare enum EAppControllerSupportLevel {
    None = 0,
    Partial = 1,
    Full = 2
}
export interface SteamAppOverviewRemoteClientData {
    clientid: string;
    client_name: string;
    display_status: EDisplayStatus;
    status_percentage: number;
    active_beta?: string;
    installed?: boolean;
    bytes_downloaded: string;
    bytes_total: string;
    streaming_to_local_client?: boolean;
    is_available_on_current_platform: boolean;
    is_invalid_os_type?: boolean;
    playtime_left?: number;
    cloud_status: EAppCloudStatus;
}
export declare enum ESteamDeckCompatibilityCategory {
    Unknown = 0,
    Unsupported = 1,
    Playable = 2,
    Verified = 3
}
export declare enum EAppCloudStatus {
    Invalid = 0,
    Disabled = 1,
    Unknown = 2,
    Synchronized = 3,
    Checking = 4,
    OutOfSync = 5,
    Uploading = 6,
    Downloading = 7,
    SyncFailed = 8,
    Conflict = 9,
    PendingElsewhere = 10
}
export declare enum ERaiseGameWindowResult {
    NotRunning = 1,
    Success = 2,
    Failure = 3
}
export {};
