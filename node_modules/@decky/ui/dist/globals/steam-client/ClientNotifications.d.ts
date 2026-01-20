import { BrowserContext } from "./shared";
export interface ClientNotifications {
    DisplayClientNotification(notification: EClientUINotificationType, options: string, callback: (context: BrowserContext) => void): void;
    OnRespondToClientNotification(notificationId: number, handleAction: boolean): void;
}
export interface SteamNotificationOptions {
    body: string;
    chatroomgroupid?: number;
    chatroomid?: number;
    icon?: string;
    state: string;
    steamid: string;
    tag?: string;
    title?: string;
}
export declare enum EClientUINotificationType {
    GroupChatMessage = 1,
    FriendChatMessage = 2,
    FriendPersonaState = 3
}
