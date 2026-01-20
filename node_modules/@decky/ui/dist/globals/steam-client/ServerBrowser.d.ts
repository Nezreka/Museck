import { OperationResponse, Unregisterable } from "./shared";
export interface ServerBrowser {
    AddFavoriteServer(server: GameServer): Promise<string>;
    AddFavoriteServersByIP(ip: string): Promise<string>;
    CancelServerQuery(dialogId: number, queryServer: number): void;
    ConnectToServer(dialogId: number, password: string): Promise<EJoinServerError>;
    CreateFriendGameInfoDialog(pid: number, steamId: string): void;
    CreateServerGameInfoDialog(ip: string, port: number, queryPort: number): Promise<number>;
    CreateServerListRequest(appId: number, queryType: ServerBrowserTab_t, filters: string[], serverCallback: (server: GameServer) => void, requestCompletedCallback: (response: number) => void): Promise<number | OperationResponse>;
    DestroyGameInfoDialog(dialogId: number): void;
    DestroyServerListRequest(activeServerListRequestId: number): void;
    GetMultiplayerGames(): Promise<ServerBrowserGame[]>;
    GetServerListPreferences(): Promise<ServerBrowserPreferences>;
    PingServer(dialogId: number): Promise<number | OperationResponse>;
    RegisterForFavorites(callback: (list: ServerBrowserFavoritesAndHistory) => void): Unregisterable;
    RegisterForFriendGamePlayed(dialogId: number, callback: (server: ServerBrowserFriendServer) => void): Unregisterable;
    RegisterForGameInfoDialogs(callback: (dialogs: ServerBrowserDialog[]) => void): Unregisterable;
    RegisterForPlayerDetails(dialogId: number, callback: (player: PlayerDetails) => void): Unregisterable;
    RegisterForServerInfo(dialogId: number, callback: (server: GameServer) => void): Unregisterable;
    RemoveFavoriteServer(server: GameServer): void;
    RemoveHistoryServer(server: GameServer): void;
    RequestPlayerDetails(dialogId: number): Promise<number | OperationResponse>;
    SetServerListPreferences(prefs: ServerBrowserPreferences): void;
}
export type ServerBrowserTab_t = 'internet' | 'favorites' | 'history' | 'lan' | 'friends';
export interface ServerBrowserGame {
    appid: number;
    gameid: string;
    gamedir: string;
    name: string;
}
export interface ServerBrowserPreferences {
    GameList: string;
    filters: ServerBrowserTabFilters;
}
export type ServerBrowserTabFilters = {
    [tab in ServerBrowserTab_t]: ServerBrowserGameFilter;
};
export interface ServerBrowserGameFilter {
    NoEmpty: boolean;
    NoFull: boolean;
    NoPassword: boolean;
    Secure: EServerBrowserGameFilterAntiCheat;
    appid: number;
    game: string;
    map: string;
    ping: EServerBrowserGameFilterPing;
}
export declare enum EServerBrowserGameFilterAntiCheat {
    All = 0,
    Secure = 1,
    NotSecure = 2
}
export declare enum EServerBrowserGameFilterPing {
    All = 0,
    LessThan50 = 50,
    LessThan100 = 100,
    LessThan150 = 150,
    LessThan250 = 250
}
export interface ServerBrowserFavoritesAndHistory {
    favorites: GameServer[];
    history: GameServer[];
}
export interface ServerBrowserFriendServer {
    appid: number;
    bNonSteamServer: boolean;
    gameText: string;
    gameid: string;
    steamIDLobby: string;
}
export interface ServerBrowserDialog {
    dialogID: number;
    ip: number;
    port: number;
    queryPort: number;
}
export interface GameServer {
    appid: number;
    bDoNotRefresh?: boolean;
    bHadSuccessfulResponse: boolean;
    bPassword: boolean;
    bSecure: boolean;
    botPlayers: number;
    gameDesc: string;
    gameDir: string;
    gameTags: string;
    ip: string;
    lastPlayed: number;
    map: string;
    maxPlayers: number;
    name: string;
    ping: number;
    players: number;
    port: number;
    queryPort: number;
    serverVersion: number;
    steamID: string;
}
export declare enum EJoinServerError {
    PingFailed = -3,
    Connecting = -2,
    Pinging = -1,
    None = 0,
    VACBanned = 1,
    ServerFull = 2,
    ModNotInstalled = 3,
    AppNotFound = 4,
    NotInitialized = 5
}
export interface PlayerDetails {
    bSuccess: boolean;
    bRefreshComplete: boolean;
    playerName?: string;
    score?: number;
    timePlayed?: number;
}
