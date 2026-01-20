import { EControllerType } from "./Input";
import { EParentalFeature } from "./Parental";
import { EResult, Unregisterable } from "./shared";
export interface RemotePlay {
    BCanAcceptInviteForGame(gameId: string, param1: string): Promise<boolean>;
    BCanCreateInviteForGame(gameId: string, param1: boolean): Promise<boolean>;
    BRemotePlayTogetherGuestOnPhoneOrTablet(steam64Id: string, guestId: number): Promise<boolean>;
    BRemotePlayTogetherGuestSupported(): Promise<boolean>;
    CancelInviteAndSession(steam64Id: string, param1: number): Promise<EResult>;
    CancelInviteAndSessionWithGuestID(steam64Id: string, guestId: number): Promise<EResult>;
    CancelRemoteClientPairing(): void;
    CloseGroup(): Promise<number>;
    CreateGroup(param0: string): Promise<EResult>;
    CreateInviteAndSession(steam64Id: string, param1: string): Promise<EResult>;
    CreateInviteAndSessionWithGuestID(steam64Id: string, guestId: number, param2: string): Promise<EResult>;
    GetClientID(): Promise<string>;
    GetClientStreamingBitrate(): Promise<number>;
    GetClientStreamingQuality(): Promise<number>;
    GetControllerType(controllerIndex: number): Promise<EControllerType>;
    GetGameSystemVolume(): Promise<number>;
    GetPerUserInputSettings(steam64Id: string): Promise<RemotePlayInputSettings>;
    GetPerUserInputSettingsWithGuestID(steam64Id: string, guestId: number): Promise<RemotePlayInputSettings>;
    IdentifyController(nControllerIndex: number): void;
    InstallAudioDriver(): void;
    InstallInputDriver(): void;
    MoveControllerToSlot(controllerIndex: number, slot: number): void;
    RegisterForAdditionalParentalBlocks(callback: (blocks: EParentalFeature[]) => void): Unregisterable;
    RegisterForAudioDriverPrompt(callback: () => void): Unregisterable;
    RegisterForBitrateOverride: Unregisterable;
    RegisterForClearControllers(callback: () => void): Unregisterable;
    RegisterForControllerIndexSet(callback: (steamid: string, slot: number, guestid: number) => void): Unregisterable;
    RegisterForDevicesChanges(callback: (devices: RemotePlayDevice[]) => void): Unregisterable;
    RegisterForGroupCreated(callback: (steamId: string, appId: string) => void): Unregisterable;
    RegisterForGroupDisbanded(callback: () => void): Unregisterable;
    RegisterForInputDriverPrompt(callback: () => void): Unregisterable;
    RegisterForInputDriverRestartNotice(callback: () => void): Unregisterable;
    RegisterForInputUsed(callback: (steam64Id: string, type: EClientUsedInputType, guestId: number) => void): Unregisterable;
    RegisterForInviteResult(callback: (steamId: string, param1: any, result: ERemoteClientLaunch) => void): Unregisterable;
    RegisterForNetworkUtilizationUpdate(callback: (steam64Id: string, guestId: number, networkUtilization: number, networkDuration: number) => void): Unregisterable;
    RegisterForPlaceholderStateChanged(callback: (isShowingPlaceholder: boolean) => void): Unregisterable;
    RegisterForPlayerInputSettingsChanged(callback: (steamId: string, settings: RemotePlayInputSettings, guestId: number) => void): Unregisterable;
    RegisterForQualityOverride(callback: (hostStreamingQualityOverride: number) => void): Unregisterable;
    RegisterForRemoteClientLaunchFailed(callback: (state: ERemoteClientLaunch) => void): Unregisterable;
    RegisterForRemoteClientStarted(callback: (steam64Id: string, appId: string) => void): Unregisterable;
    RegisterForRemoteClientStopped(callback: (steam64Id: string, appId: string) => void): Unregisterable;
    RegisterForRemoteDeviceAuthorizationCancelled(callback: () => void): Unregisterable;
    RegisterForRemoteDeviceAuthorizationRequested(callback: (device: string) => void): Unregisterable;
    RegisterForRemoteDevicePairingPINChanged(callback: (device: string, pin: string) => void): Unregisterable;
    RegisterForRestrictedSessionChanges(callback: (restrictedSession: boolean) => void): Unregisterable;
    RegisterForSessionStopped(callback: (steam64Id: string, guestId: number, avatarHash: string) => void): Unregisterable;
    RegisterForSessionStarted(callback: (steam64Id: string, gameId: string, guestId: number) => void): Unregisterable;
    RegisterForSessionStopped(callback: (steam64Id: string, guestId: number) => void): Unregisterable;
    RegisterForSettingsChanges(callback: (remotePlaySettings: RemotePlaySettings) => void): Unregisterable;
    SetClientStreamingBitrate(bitrate: number): void;
    SetClientStreamingQuality(quality: number): void;
    SetGameSystemVolume(volume: number): void;
    SetPerUserControllerInputEnabled(steam64Id: string, enabled: boolean): void;
    SetPerUserControllerInputEnabledWithGuestID(steam64Id: string, guestId: number, enabled: boolean): void;
    SetPerUserKeyboardInputEnabled(steam64Id: string, enabled: boolean): void;
    SetPerUserKeyboardInputEnabledWithGuestID(steam64Id: string, guestId: number, enabled: boolean): void;
    SetPerUserMouseInputEnabled(steam64Id: string, enabled: boolean): void;
    SetPerUserMouseInputEnabledWithGuestID(steam64Id: string, guestId: number, enabled: boolean): void;
    SetRemoteDeviceAuthorized(param0: boolean, param1: string): void;
    SetRemoteDevicePIN(pin: string): void;
    SetRemotePlayEnabled(enabled: boolean): void;
    SetStreamingClientConfig(base64: string, sessionId: number): void;
    SetStreamingClientConfigEnabled(value: boolean): void;
    SetStreamingDesktopToRemotePlayTogetherEnabled(enabled: boolean): void;
    SetStreamingP2PScope(scope: EStreamP2PScope): void;
    SetStreamingServerConfig(base64: string, sessionId: number): void;
    SetStreamingServerConfigEnabled(value: boolean): void;
    StopStreamingClient(): void;
    StopStreamingSession(id: number): void;
    StopStreamingSessionAndSuspendDevice(id: number): void;
    UnlockH264(): void;
    UnpairRemoteDevices(): void;
}
export declare enum EClientUsedInputType {
    Keyboard = 0,
    Mouse = 1,
    Controller = 2,
    Max = 3
}
export interface RemotePlayDevice {
    clientId: string;
    clientName: string;
    status: string;
    formFactor: number;
    unStreamingSessionID: number;
    bCanSteamVR: boolean;
    bCanSuspend: boolean;
}
interface RemotePlayInputSettings {
    bKeyboardEnabled: true;
    bMouseEnabled: true;
    bControllerEnabled: true;
}
export interface RemotePlaySettings {
    bAV1DecodeAvailable: boolean;
    bHEVCDecodeAvailable: boolean;
    bRemotePlayDisabledBySystemPolicy: boolean;
    bRemotePlaySupported: boolean;
    bRemotePlayEnabled: boolean;
    eRemotePlayP2PScope: EStreamP2PScope;
    bRemotePlayServerConfigAvailable: boolean;
    bRemotePlayServerConfigEnabled: boolean;
    bRemotePlayClientConfigEnabled: boolean;
    unStreamingSessionID: number;
    strStreamingClientName: string;
    RemotePlayClientConfig: StreamingClientConfig;
    RemotePlayServerConfig: ArrayBuffer;
    nDefaultAudioChannels: number;
    nAutomaticResolutionX: number;
    nAutomaticResolutionY: number;
}
export interface StreamingClientConfig {
    quality?: EStreamQualityPreference;
    desired_resolution_x?: number;
    desired_resolution_y?: number;
    desired_framerate_numerator?: number;
    desired_framerate_denominator?: number;
    desired_bitrate_kbps?: number;
    enable_hardware_decoding?: boolean;
    enable_performance_overlay?: boolean;
    enable_video_streaming?: boolean;
    enable_audio_streaming?: boolean;
    enable_input_streaming?: boolean;
    audio_channels?: number;
    enable_video_hevc?: boolean;
    enable_performance_icons?: boolean;
    enable_microphone_streaming?: boolean;
    controller_overlay_hotkey?: string;
    enable_touch_controller_OBSOLETE?: boolean;
    p2p_scope?: EStreamP2PScope;
    enable_audio_uncompressed?: boolean;
    display_limit?: StreamVideoLimit;
    quality_limit?: StreamVideoLimit;
    runtime_limit?: StreamVideoLimit;
    decoder_limit: StreamVideoLimit[];
}
export interface StreamingServerConfig {
    change_desktop_resolution?: boolean;
    dynamically_adjust_resolution_OBSOLETE?: boolean;
    enable_capture_nvfbc?: boolean;
    enable_hardware_encoding_nvidia_OBSOLETE?: boolean;
    enable_hardware_encoding_amd_OBSOLETE?: boolean;
    enable_hardware_encoding_intel_OBSOLETE?: boolean;
    software_encoding_threads?: number;
    enable_traffic_priority?: boolean;
    host_play_audio?: EStreamHostPlayAudioPreference;
    enable_hardware_encoding?: boolean;
}
export interface StreamVideoLimit {
    codec?: EStreamVideoCodec;
    mode?: StreamVideoMode;
    bitrate_kbps?: number;
    burst_bitrate_kbps?: number;
}
export interface StreamVideoMode {
    width?: number;
    height?: number;
    refresh_rate?: number;
    refresh_rate_numerator?: number;
    refresh_rate_denominator?: number;
}
export declare enum ERemoteClientLaunch {
    OK = 1,
    Fail = 2,
    RequiresUI = 3,
    RequiresLaunchOption = 4,
    RequiresEULA = 5,
    Timeout = 6,
    StreamTimeout = 7,
    StreamClientFail = 8,
    OtherGameRunning = 9,
    DownloadStarted = 10,
    DownloadNoSpace = 11,
    DownloadFiltered = 12,
    DownloadRequiresUI = 13,
    AccessDenied = 14,
    NetworkError = 15,
    Progress = 16,
    ParentalUnlockFailed = 17,
    ScreenLocked = 18,
    Unsupported = 19,
    DisabledLocal = 20,
    DisabledRemote = 21,
    Broadcasting = 22,
    Busy = 23,
    DriversNotInstalled = 24,
    TransportUnavailable = 25,
    Canceled = 26,
    Invisible = 27,
    RestrictedCountry = 28,
    Unauthorized = 29
}
export declare enum EStreamVideoCodec {
    None = 0,
    Raw = 1,
    VP8 = 2,
    VP9 = 3,
    H264 = 4,
    HEVC = 5,
    ORBX1 = 6,
    ORBX2 = 7,
    AV1 = 8
}
export declare enum EStreamHostPlayAudioPreference {
    Default = 0,
    Always = 1
}
export declare enum EStreamQualityPreference {
    Automatic = -1,
    Fast = 1,
    Balanced = 2,
    Beautiful = 3
}
export declare enum EStreamP2PScope {
    Automatic = 0,
    Disabled = 1,
    OnlyMe = 2,
    Friends = 3,
    Everyone = 4
}
export {};
