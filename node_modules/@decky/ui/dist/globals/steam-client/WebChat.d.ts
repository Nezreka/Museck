import { OverlayBrowserInfo } from "./Overlay";
import { EResult, EUIMode, Unregisterable } from "./shared";
export interface WebChat {
    BSuppressPopupsInRestore(): Promise<boolean>;
    GetCurrentUserAccountID(): Promise<number>;
    GetLocalAvatarBase64(): Promise<string>;
    GetLocalPersonaName(): Promise<string>;
    GetOverlayChatBrowserInfo(): Promise<OverlayBrowserInfo[]>;
    GetPrivateConnectString(param0: number): Promise<string>;
    GetPushToTalkEnabled(): Promise<PushToTalkInfo>;
    GetSignIntoFriendsOnStart(): Promise<boolean>;
    GetUIMode(): Promise<EUIMode>;
    OnGroupChatUserStateChange(chatGroupId: number, accountId: number, action: number): void;
    OnNewGroupChatMsgAdded(groupId: string, chatId: string, accountId: number, timestamp: number, param4: number, message: string): void;
    OpenURLInClient(url: string, pid: number, forceExternal: boolean): void;
    RegisterForComputerActiveStateChange(callback: (state: EComputerActiveState, time: number) => void): Unregisterable;
    RegisterForFriendPostMessage(callback: (data: FriendChatDialogData) => void): Unregisterable;
    RegisterForMouseXButtonDown(callback: (param0: number) => void): void;
    RegisterForPushToTalkStateChange(callback: (state: boolean) => void): Unregisterable;
    RegisterForUIModeChange(callback: (mode: EUIMode) => void): Unregisterable;
    RegisterOverlayChatBrowserInfoChanged(callback: () => void): Unregisterable;
    SetActiveClanChatIDs(clanChatIds: number[]): void;
    SetNumChatsWithUnreadPriorityMessages(size: number): void;
    SetPersonaName(value: string): Promise<SetPersonaNameResult>;
    SetPushToMuteEnabled(value: boolean): void;
    SetPushToTalkEnabled(value: boolean): void;
    SetPushToTalkHotKey(param0: number): void;
    SetPushToTalkMouseButton(param0: number): void;
    SetVoiceChatActive(value: boolean): void;
    SetVoiceChatStatus(muted: boolean, deafened: boolean): void;
    ShowChatRoomGroupDialog(param0: number, param1: number): void;
    ShowFriendChatDialog(steamid64: string): void;
    UnregisterForMouseXButtonDown(): void;
}
export declare enum EComputerActiveState {
    Invalid = 0,
    Active = 1,
    Idle = 2
}
export interface FriendChatDialog {
    browserid: number;
    btakefocus: string;
    command: string;
    pid: number;
    steamid: string;
}
export interface FriendChatDialogData {
    data: FriendChatDialog;
}
interface SetPersonaNameResult {
    eResult: EResult;
    strMessageToken: string;
}
export interface PushToTalkInfo {
    bEnabled: boolean;
    bPushToMute: boolean;
    vkHotKey: number;
    strKeyName: string;
}
export {};
