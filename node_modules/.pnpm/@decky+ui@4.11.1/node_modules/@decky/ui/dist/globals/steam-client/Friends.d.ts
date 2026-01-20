import { Unregisterable } from "./shared";
export interface Friends {
    AddFriend(steamId: string): Promise<boolean>;
    GetCoplayData(): Promise<CoplayData>;
    InviteUserToCurrentGame(steam64Id: string, steamIdTarget: string): Promise<boolean>;
    InviteUserToGame(steamId: string, appId: number, connectString: string): Promise<boolean>;
    InviteUserToLobby(steam64Id: string, steamIdTarget: string): Promise<boolean>;
    InviteUserToRemotePlayTogetherCurrentGame(steam64Id: string): Promise<boolean>;
    RegisterForMultiplayerSessionShareURLChanged(appId: number, callback: (param0: string, param1: string) => void): Unregisterable;
    RegisterForVoiceChatStatus(callback: (status: VoiceChatStatus) => void): Unregisterable;
    RemoveFriend(steamId: string): Promise<boolean>;
    ShowRemotePlayTogetherUI(): void;
}
export interface CoplayData {
    currentUsers: CoplayUser[];
    recentUsers: CoplayUser[];
}
export interface CoplayUser {
    accountid: number;
    rtTimePlayed: number;
    appid: number;
}
export interface VoiceChatStatus {
    bVoiceChatActive: boolean;
    bMicMuted: boolean;
    bOutputMuted: boolean;
}
