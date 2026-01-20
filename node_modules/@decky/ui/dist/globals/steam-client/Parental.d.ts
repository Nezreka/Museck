import { EResult, Unregisterable } from "./shared";
export interface Parental {
    LockParentalLock(): void;
    RegisterForParentalPlaytimeWarnings(callback: (time: number) => void): Unregisterable;
    RegisterForParentalSettingsChanges(callback: (settings: ParentalSettings) => void): Unregisterable;
    UnlockParentalLock(pin: string, param1: boolean): Promise<EResult>;
}
export interface ParentalSettings {
    ever_enabled: boolean;
    locked: boolean;
    settings: ArrayBuffer;
    strPlaintextPassword: string;
}
export interface ParentalSettingsProtoMsg {
    steamid?: number;
    applist_base_id?: number;
    applist_base_description?: string;
    applist_base: ParentalApp[];
    applist_custom: ParentalApp[];
    passwordhashtype?: number;
    salt?: number;
    passwordhash?: number;
    is_enabled?: boolean;
    enabled_features?: number;
    recovery_email?: string;
    is_site_license_lock?: boolean;
    temporary_enabled_features?: number;
    rtime_temporary_feature_expiration?: number;
    playtime_restrictions?: ParentalPlaytimeRestrictions;
    temporary_playtime_restrictions?: ParentalTemporaryPlaytimeRestrictions;
    excluded_store_content_descriptors: number[];
    excluded_community_content_descriptors: number[];
    utility_appids: number[];
}
interface ParentalApp {
    appid: number;
    is_allowed: boolean;
}
interface ParentalPlaytimeDay {
    allowed_time_windows?: number;
    allowed_daily_minutes?: number;
}
interface ParentalPlaytimeRestrictions {
    apply_playtime_restrictions?: boolean;
    playtime_days: ParentalPlaytimeDay[];
}
interface ParentalTemporaryPlaytimeRestrictions {
    restrictions?: ParentalPlaytimeDay;
    rtime_expires?: number;
}
export declare enum EParentalFeature {
    Invalid = 0,
    Store = 1,
    Community = 2,
    Profile = 3,
    Friends = 4,
    News = 5,
    Trading = 6,
    Settings = 7,
    Console = 8,
    Browser = 9,
    ParentalSetup = 10,
    Library = 11,
    Test = 12,
    SiteLicense = 13,
    KioskMode = 14,
    Max = 15
}
export {};
