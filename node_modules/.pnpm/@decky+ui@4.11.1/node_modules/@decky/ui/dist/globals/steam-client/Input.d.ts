import { Unregisterable } from "./shared";
export interface Input {
    CalibrateControllerIMU(controllerIndex: any): any;
    CalibrateControllerJoystick(controllerIndex: any): any;
    CalibrateControllerTrackpads(controllerIndex: any): any;
    CancelGyroSWCalibration(): any;
    ClearSelectedConfigForApp(appId: number, controllerIndex: number): any;
    CloseDesktopConfigurator: any;
    ControllerKeyboardSendText(textToWrite: string): void;
    ControllerKeyboardSetKeyState(key: EHIDKeyboardKey, state: boolean): void;
    DecrementCloudedControllerConfigsCounter(): any;
    DeletePersonalControllerConfiguration(param0: any): any;
    DuplicateControllerConfigurationSourceMode(controllerIndex: number, param1: any): any;
    EndControllerDeviceSupportFlow(): any;
    ExportCurrentControllerConfiguration(controllerIndex: number, appId: number, param2: number, title: string, description: string, param5: string): Promise<any>;
    ForceConfiguratorFocus(param0: boolean): any;
    ForceSimpleHapticEvent(param0: number, param1: number, param2: number, param3: number, param4: number): any;
    FreeControllerConfig(m_ChordSummaryConfiguration: any): any;
    GetConfigForAppAndController(appId: number, unControllerIndex: number): any;
    GetControllerMappingString(unControllerIndex: number): Promise<string>;
    GetControllerPreviouslySeen(): Promise<number[]>;
    GetSteamControllerDongleState(): Promise<boolean>;
    GetTouchMenuIconsForApp(appId: number): Promise<any>;
    GetXboxDriverInstallState(): Promise<any>;
    IdentifyController(controllerIndex: number): any;
    InitControllerSounds(): any;
    InitializeControllerPersonalizationSettings(controllerIndex: number): any;
    ModalKeyboardDismissed(): void;
    OpenDesktopConfigurator: any;
    PreviewConfigForAppAndController(appId: number, controllerIndex: number, workshopUri: string): any;
    PreviewControllerLEDColor(flHue: number, flSaturation: number, flBrightness: number): any;
    QueryControllerConfigsForApp(appId: number, controllerIndex: number, param2: boolean): any;
    RegisterForActiveControllerChanges: Unregisterable;
    RegisterForConfigSelectionChanges(callback: (param0: number, param1: number) => void): Unregisterable;
    RegisterForControllerAccountChanges: Unregisterable;
    RegisterForControllerAnalogInputMessages(callback: (msgs: ControllerAnalogInputMessage[]) => void): Unregisterable;
    RegisterForControllerBatteryChanges(callback: any): Unregisterable;
    RegisterForControllerCommandMessages(callback: (msg: ControllerCommandMessage) => void): Unregisterable;
    RegisterForControllerConfigCloudStateChanges(callback: (state: ControllerConfigCloudState) => void): Unregisterable;
    RegisterForControllerConfigInfoMessages(callback: (msgs: ControllerConfigInfoMessageList[] | ControllerConfigInfoMessageQuery[]) => void): Unregisterable;
    RegisterForControllerInputMessages(callback: (controllerIndex: number, gamepadButton: ControllerInputGamepadButton, isButtonPressed: boolean) => void): Unregisterable;
    RegisterForControllerListChanges(callback: (controllerListChanges: ControllerInfo[]) => void): Unregisterable;
    RegisterForControllerStateChanges(callback: (changes: ControllerStateChange[]) => void): Unregisterable;
    RegisterForDualSenseUpdateNotification(callback: (m_strDualSenseUpdateProduct: string) => void): Unregisterable;
    RegisterForGameKeyboardMessages(callback: (msg: GameKeyboardMessage) => void): Unregisterable;
    RegisterForRemotePlayConfigChanges(callback: () => void): Unregisterable;
    RegisterForShowControllerLayoutPreviewMessages(callback: (data: any) => void): Unregisterable;
    RegisterForTouchMenuInputMessages(callback: (inputs: number[]) => void): Unregisterable;
    RegisterForTouchMenuMessages(callback: (msg: TouchMenuMessage) => void): Unregisterable;
    RegisterForUIVisualization(param0: any, param1: any, param2: any): Unregisterable;
    RegisterForUnboundControllerListChanges(callback: (m_unboundControllerList: any) => void): Unregisterable;
    RegisterForUserDismissKeyboardMessages(callback: (param0: any) => void): Unregisterable;
    RegisterForUserKeyboardMessages: Unregisterable;
    RequestGyroActive(controllerIndex: number, param1: boolean): any;
    RequestRemotePlayControllerConfigs(param0: any): any;
    ResetControllerBindings(param0: any): any;
    ResolveCloudedControllerConfigConflict(param0: any): any;
    RestoreControllerPersonalizationSettings(controllerIndex: number): any;
    SaveControllerCalibration(controllerIndex: number): any;
    SaveControllerPersonalizationSettings(param0: any): any;
    SaveControllerSounds: any;
    SaveEditingControllerConfiguration(controllerIndex: number, sharedConfig: boolean): any;
    SetControllerConfigurationModeShiftBinding(controllerIndex: number, param1: any): any;
    SetControllerHapticSetting(controllerIndex: number, eHapticSetting: any): any;
    SetControllerMappingString(mapping: string): void;
    SetControllerName(controllerIndex: number, controllerName: string): any;
    SetControllerNintendoLayoutSetting: any;
    SetControllerPersonalizationName: any;
    SetControllerPersonalizationSetting(param0: string, param1: number): any;
    SetControllerPersonalizationSettingFloat(param0: string, param1: number): any;
    SetControllerRumbleSetting(controllerIndex: number, rumblePreference: EControllerRumbleSetting): any;
    SetControllerUseUniversalFaceButtonGlyphs(controllerIndex: number, value: boolean): void;
    SetCursorActionset(param0: boolean): any;
    SetDualSenseUpdateNotification(param0: boolean): any;
    SetEditingControllerConfigurationActionSet(controllerIndex: number, param1: any): any;
    SetEditingControllerConfigurationInputActivator(controllerIndex: number, param1: any): any;
    SetEditingControllerConfigurationInputActivatorEnabled(controllerIndex: number, param1: any): any;
    SetEditingControllerConfigurationInputBinding(controllerIndex: number, param1: any): any;
    SetEditingControllerConfigurationMiscSetting(controllerIndex: number, param1: any): any;
    SetEditingControllerConfigurationSourceMode(controllerIndex: number, param1: any): any;
    SetGamepadKeyboardText(param0: boolean, param1: string): any;
    SetKeyboardActionset(param0: boolean, param1: boolean): any;
    SetMousePosition(pid: number, x: number, y: number): void;
    SetSelectedConfigForApp(appId: number, controllerIndex: number, url: string, param3: boolean): any;
    SetSteamControllerDonglePairingMode(bEnable: boolean, bSilent: boolean): any;
    SetVirtualMenuKeySelected(unControllerIndex: number, unMenuIndex: number, m_controllerMenuActiveMenuItem: number): any;
    SetWebBrowserActionset(param0: boolean): any;
    SetXboxDriverInstallState(param0: any): any;
    ShowControllerSettings(): void;
    StandaloneKeyboardDismissed(): any;
    StartControllerDeviceSupportFlow(param0: any, param1: any, callback: (param2: any) => void): any;
    StartEditingControllerConfigurationForAppIDAndControllerIndex(m_appId: number, m_unControllerIndex: number): Promise<any>;
    StartGyroSWCalibration(callback: () => void): any;
    StopEditingControllerConfiguration(controllerIndex: number): any;
    SwapControllerConfigurationSourceModes: any;
    SwapControllerModeInputBindings(controllerIndex: number, param1: any): any;
    SwapControllerOrder(controllerIndex1: number, controllerIndex2: number): any;
    SyncCloudedControllerConfigs(): any;
    TriggerHapticPulse(controllerIndex: number, eHapticType: number, param2: number): any;
    TriggerSimpleHapticEvent(controllerIndex: number, eHapticType: number, unIntensity: number, ndBGain: number, param4: number): any;
    UnregisterForControllerStateChanges(): void;
    UnregisterForUIVisualization(controllerIndex: number): any;
    UploadChangesForCloudedControllerConfigs(): any;
}
export declare enum EHIDKeyboardKey {
    Invalid = 0,
    BeforeFirst = 3,
    A = 4,
    B = 5,
    C = 6,
    D = 7,
    E = 8,
    F = 9,
    G = 10,
    H = 11,
    I = 12,
    J = 13,
    K = 14,
    L = 15,
    M = 16,
    N = 17,
    O = 18,
    P = 19,
    Q = 20,
    R = 21,
    S = 22,
    T = 23,
    U = 24,
    V = 25,
    W = 26,
    X = 27,
    Y = 28,
    Z = 29,
    Key_1 = 30,
    Key_2 = 31,
    Key_3 = 32,
    Key_4 = 33,
    Key_5 = 34,
    Key_6 = 35,
    Key_7 = 36,
    Key_8 = 37,
    Key_9 = 38,
    Key_0 = 39,
    Return = 40,
    Escape = 41,
    Backspace = 42,
    Tab = 43,
    Space = 44,
    Dash = 45,
    Equals = 46,
    LeftBracket = 47,
    RightBracket = 48,
    Backslash = 49,
    Unused1 = 50,
    Semicolon = 51,
    SingleQuote = 52,
    Backtick = 53,
    Comma = 54,
    Period = 55,
    ForwardSlash = 56,
    CapsLock = 57,
    F1 = 58,
    F2 = 59,
    F3 = 60,
    F4 = 61,
    F5 = 62,
    F6 = 63,
    F7 = 64,
    F8 = 65,
    F9 = 66,
    F10 = 67,
    F11 = 68,
    F12 = 69,
    PrintScreen = 70,
    ScrollLock = 71,
    Break = 72,
    Insert = 73,
    Home = 74,
    PageUp = 75,
    Delete = 76,
    End = 77,
    PageDown = 78,
    RightArrow = 79,
    LeftArrow = 80,
    DownArrow = 81,
    UpArrow = 82,
    NumLock = 83,
    KeypadForwardSlash = 84,
    KeypadAsterisk = 85,
    KeypadDash = 86,
    KeypadPlus = 87,
    KeypadEnter = 88,
    Keypad_1 = 89,
    Keypad_2 = 90,
    Keypad_3 = 91,
    Keypad_4 = 92,
    Keypad_5 = 93,
    Keypad_6 = 94,
    Keypad_7 = 95,
    Keypad_8 = 96,
    Keypad_9 = 97,
    Keypad_0 = 98,
    KeypadPeriod = 99,
    LAlt = 100,
    LShift = 101,
    LWin = 102,
    LControl = 103,
    RAlt = 104,
    RShift = 105,
    RWin = 106,
    RControl = 107,
    VolUp = 108,
    VolDown = 109,
    Mute = 110,
    Play = 111,
    Stop = 112,
    Next = 113,
    Prev = 114,
    AfterLast = 115
}
export interface ControllerAnalogInputMessage {
    nA: number;
    x: number;
    y: number;
    nC: number;
}
export interface ControllerCommandMessage {
    eAction: number;
    nControllerIndex: number;
}
export interface ControllerConfigCloudState {
    bSyncDone: boolean;
    bSyncConflict: boolean;
    bSyncError: boolean;
}
export interface ControllerConfigInfoMessage {
    appID: number;
}
export interface ControllerConfigInfoMessageQuery extends ControllerConfigInfoMessage {
    bPersonalQueryDone: boolean;
}
export interface ControllerConfigInfoMessageList extends ControllerConfigInfoMessage {
    nControllerType: number;
    publishedFileID: string;
    accountID: number;
    Title: string;
    Description: string;
    URL: string;
    timeUpdated: string;
    bOfficial: boolean;
    bProgenitorOfficial: boolean;
    bRecommended: boolean;
    bProgenitorRecommended: boolean;
    bUsesSIAPI: boolean;
    bUsesMouse: boolean;
    bUsesKeyboard: boolean;
    bUsesGamepad: boolean;
    eExportType: EControllerConfigExportType;
    playtime: string;
    bSelected: boolean;
}
export declare enum EControllerConfigExportType {
    Unknown = 0,
    PersonalLocal = 1,
    PersonalCloud = 2,
    Community = 3,
    Template = 4,
    Official = 5,
    OfficialDefault = 6
}
export declare enum EControllerRumbleSetting {
    ControllerPreference = 0,
    Off = 1,
    On = 2
}
export declare enum ControllerInputGamepadButton {
    GAMEPAD_BUTTON_A = 0,
    GAMEPAD_BUTTON_B = 1,
    GAMEPAD_BUTTON_X = 2,
    GAMEPAD_BUTTON_Y = 3,
    GAMEPAD_BUTTON_DPAD_UP = 4,
    GAMEPAD_BUTTON_DPAD_RIGHT = 5,
    GAMEPAD_BUTTON_DPAD_DOWN = 6,
    GAMEPAD_BUTTON_DPAD_LEFT = 7,
    GAMEPAD_BUTTON_MENU = 8,
    GAMEPAD_BUTTON_VIEW = 9,
    GAMEPAD_LEFTPAD_UP = 10,
    GAMEPAD_LEFTPAD_DOWN = 11,
    GAMEPAD_LEFTPAD_LEFT = 12,
    GAMEPAD_LEFTPAD_RIGHT = 13,
    GAMEPAD_LEFTPAD_ANALOG = 14,
    GAMEPAD_RIGHTPAD_UP = 15,
    GAMEPAD_RIGHTPAD_DOWN = 16,
    GAMEPAD_RIGHTPAD_LEFT = 17,
    GAMEPAD_RIGHTPAD_RIGHT = 18,
    GAMEPAD_RIGHTPAD_ANALOG = 19,
    GAMEPAD_LEFTSTICK_UP = 20,
    GAMEPAD_LEFTSTICK_DOWN = 21,
    GAMEPAD_LEFTSTICK_LEFT = 22,
    GAMEPAD_LEFTSTICK_RIGHT = 23,
    GAMEPAD_LEFTSTICK_ANALOG = 24,
    GAMEPAD_LEFTSTICK_CLICK = 25,
    GAMEPAD_LTRIGGER_ANALOG = 26,
    GAMEPAD_RTRIGGER_ANALOG = 27,
    GAMEPAD_BUTTON_LTRIGGER = 28,
    GAMEPAD_BUTTON_RTRIGGER = 29,
    GAMEPAD_BUTTON_LSHOULDER = 30,
    GAMEPAD_BUTTON_RSHOULDER = 31,
    GAMEPAD_BUTTON_LBACK = 32,
    GAMEPAD_BUTTON_RBACK = 33,
    GAMEPAD_BUTTON_GUIDE = 34,
    GAMEPAD_BUTTON_SELECT = 35,
    GAMEPAD_BUTTON_START = 36,
    GAMEPAD_BUTTON_LPAD_CLICKED = 37,
    GAMEPAD_BUTTON_LPAD_TOUCH = 38,
    GAMEPAD_BUTTON_RPAD_CLICKED = 39,
    GAMEPAD_BUTTON_RPAD_TOUCH = 40,
    GAMEPAD_RIGHTSTICK_CLICK = 41,
    GAMEPAD_RIGHTSTICK_TOUCH = 42,
    GAMEPAD_LEFTSTICK_TOUCH = 43,
    GAMEPAD_BUTTON_LBACK_UPPER = 44,
    GAMEPAD_BUTTON_RBACK_UPPER = 45,
    GAMEPAD_BUTTON_LAST = 46,
    GAMEPAD_ANALOG_SCROLL = 47,
    GAMEPAD_ANALOG_LEFT_KEYBOARD_CURSOR = 48,
    GAMEPAD_ANALOG_RIGHT_KEYBOARD_CURSOR = 49,
    GAMEPAD_ANALOG_LAST = 50
}
export declare enum EThirdPartyControllerConfiguration {
    Off = 0,
    DefaultSetting = 1,
    On = 2
}
export interface ActiveAccount {
    strActiveAccountID: string;
    strName: string;
    strAvatarHash: string;
}
export interface ControllerInfo {
    strName: string;
    eControllerType: EControllerType;
    nXInputIndex: number;
    nControllerIndex: number;
    eRumblePreference: EControllerRumbleSetting;
    bWireless: boolean;
    unUniqueID: number;
    unVendorID: number;
    unProductID: number;
    unCapabilities: number;
    strFirmwareBuildTime: string;
    strSerialNumber: string;
    strChipID: string;
    nLEDColorR: number;
    nLEDColorG: number;
    nLEDColorB: number;
    flLEDBrightness: number;
    flLEDSaturation: number;
    nTurnOnSound: number;
    nTurnOffSound: number;
    nLStickDeadzone: number;
    nRStickDeadzone: number;
    nLHapticStrength: number;
    nRHapticStrength: number;
    flLPadPressureCurve: number;
    flRPadPressureCurve: number;
    bHaptics: boolean;
    bSWAntiDrift: boolean;
    flGyroStationaryTolerance: number;
    flAccelerometerStationaryTolerance: number;
    bRemoteDevice: boolean;
    bNintendoLayout: boolean;
    bUseReversedLayout: boolean;
    ActiveAccount: ActiveAccount | undefined;
    vecAltAccounts: any[];
}
export declare enum EControllerType {
    None = -1,
    Unknown = 0,
    UnknownSteamController = 1,
    SteamController = 2,
    SteamControllerV2 = 3,
    SteamControllerNeptune = 4,
    FrontPanelBoard = 20,
    Generic = 30,
    XBox360Controller = 31,
    XBoxOneController = 32,
    PS3Controller = 33,
    PS4Controller = 34,
    WiiController = 35,
    AppleController = 36,
    AndroidController = 37,
    SwitchProController = 38,
    SwitchJoyConLeft = 39,
    SwitchJoyConRight = 40,
    SwitchJoyConPair = 41,
    SwitchProGenericInputOnlyController = 42,
    MobileTouch = 43,
    SwitchProXInputSwitchController = 44,
    PS5Controller = 45,
    XboxEliteController = 46,
    LastController = 47,
    PS5EdgeController = 48,
    GenericKeyboard = 400,
    GenericMouse = 800
}
export interface ControllerStateChange {
    unControllerIndex: number;
    unPacketNum: number;
    ulUpperButtons: number;
    ulButtons: number;
    sLeftPadX: number;
    sLeftPadY: number;
    sRightPadX: number;
    sRightPadY: number;
    sCenterPadX: number;
    sCenterPadY: number;
    sLeftStickX: number;
    sLeftStickY: number;
    sRightStickX: number;
    sRightStickY: number;
    sTriggerL: number;
    sTriggerR: number;
    flTrustedGravityVectorX: number;
    flTrustedGravityVectorY: number;
    flTrustedGravityVectorZ: number;
    flSoftwareQuatW: number;
    flSoftwareQuatX: number;
    flSoftwareQuatY: number;
    flSoftwareQuatZ: number;
    flSoftwareGyroDegreesPerSecondPitch: number;
    flSoftwareGyroDegreesPerSecondYaw: number;
    flSoftwareGyroDegreesPerSecondRoll: number;
    flHardwareQuatW: number;
    flHardwareQuatX: number;
    flHardwareQuatY: number;
    flHardwareQuatZ: number;
    flHardwareGyroDegreesPerSecondPitch: number;
    flHardwareGyroDegreesPerSecondYaw: number;
    flHardwareGyroDegreesPerSecondRoll: number;
    flGyroNoiseLength: number;
    flGyroCalibrationProgress: number;
    flGravityVectorX: number;
    flGravityVectorY: number;
    flGravityVectorZ: number;
    flAccelerometerNoiseLength: number;
    sBatteryLevel: number;
    sPressurePadLeft: number;
    sPressurePadRight: number;
    sPressureBumperLeft: number;
    sPressureBumperRight: number;
    unHardwareUpdateInMicrosec: number;
}
export interface GameKeyboardMessage {
    m_bOpen: boolean;
    nAppID: number;
    m_dwPID: number;
    m_dwOverlayPID: number;
    m_hPipe: number;
    m_eInputMode: number;
    m_eLineInputMode: number;
    m_pchDescription: string;
    m_unCharMax: number;
    m_pchExistingText: string;
}
export interface TouchMenuMessage {
    bHasVirtualMenus: boolean;
    unControllerIndex: number;
    appID: number;
}
