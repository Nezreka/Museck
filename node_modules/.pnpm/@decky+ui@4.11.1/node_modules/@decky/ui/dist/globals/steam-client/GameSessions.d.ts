import { Unregisterable } from "./shared";
import { AppAchievements } from "./App";
import { Screenshot } from "./Screenshots";
export interface GameSessions {
    RegisterForAchievementNotification(callback: (notification: AchievementNotification) => void): Unregisterable;
    RegisterForAppLifetimeNotifications(callback: (notification: AppLifetimeNotification) => void): Unregisterable;
    RegisterForScreenshotNotification(callback: (notification: ScreenshotNotification) => void): Unregisterable;
}
interface GameSessionNotificationBase {
    unAppID: number;
}
export interface AchievementNotification extends GameSessionNotificationBase {
    achievement: AppAchievements;
    nCurrentProgress: number;
    nMaxProgress: number;
}
export interface AppLifetimeNotification extends GameSessionNotificationBase {
    nInstanceID: number;
    bRunning: boolean;
}
export interface ScreenshotNotification extends GameSessionNotificationBase {
    details: Screenshot;
    hScreenshot: number;
    strOperation: "deleted" | "written";
}
export {};
