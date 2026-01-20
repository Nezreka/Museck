import { VDFBoolean_t } from "./shared";
export interface FriendSettings {
    GetEnabledFeatures(): Promise<FriendSettingsFeatureObject[]>;
    RegisterForSettingsChanges(callback: (settings: string) => void): void;
    SetFriendSettings(details: string): void;
}
export declare enum EChatFlashMode {
    Always = 0,
    Minimized = 1,
    Never = 2
}
export interface FriendSettingsFeatureObject {
    feature: FriendSettingsFeature_t;
    bEnabled: boolean;
}
export type FriendSettingsFeature_t = "DoNotDisturb" | "FriendsFilter" | "LoaderWindowSynchronization" | "NewVoiceHotKeyState" | "NonFriendMessageHandling" | "PersonaNotifications" | "ServerVirtualizedMemberLists" | "SteamworksChatAPI";
export type FriendSettingsEnabledFeatures<T> = {
    [feature in FriendSettingsFeature_t]: T;
};
export interface FriendSettingsChange {
    bNotifications_ShowIngame: VDFBoolean_t;
    bNotifications_ShowOnline: VDFBoolean_t;
    bNotifications_ShowMessage: VDFBoolean_t;
    bNotifications_EventsAndAnnouncements: VDFBoolean_t;
    bSounds_PlayIngame: VDFBoolean_t;
    bSounds_PlayOnline: VDFBoolean_t;
    bSounds_PlayMessage: VDFBoolean_t;
    bSounds_EventsAndAnnouncements: VDFBoolean_t;
    bAlwaysNewChatWindow: VDFBoolean_t;
    bForceAlphabeticFriendSorting: VDFBoolean_t;
    nChatFlashMode: EChatFlashMode;
    bRememberOpenChats: VDFBoolean_t;
    bCompactQuickAccess: VDFBoolean_t;
    bCompactFriendsList: VDFBoolean_t;
    bNotifications_ShowChatRoomNotification: VDFBoolean_t;
    bSounds_PlayChatRoomNotification: VDFBoolean_t;
    bHideOfflineFriendsInTagGroups: VDFBoolean_t;
    bHideCategorizedFriends: VDFBoolean_t;
    bCategorizeInGameFriendsByGame: VDFBoolean_t;
    nChatFontSize: number;
    b24HourClock: VDFBoolean_t;
    bDoNotDisturbMode: VDFBoolean_t;
    bDisableEmbedInlining: VDFBoolean_t;
    bSignIntoFriends: VDFBoolean_t;
    bDisableSpellcheck: VDFBoolean_t;
    bDisableRoomEffects: VDFBoolean_t;
    bAnimatedAvatars: VDFBoolean_t;
    featuresEnabled: FriendSettingsEnabledFeatures<VDFBoolean_t>;
}
