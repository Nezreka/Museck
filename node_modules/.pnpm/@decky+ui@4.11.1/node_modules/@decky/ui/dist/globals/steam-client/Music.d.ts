import { Unregisterable } from "./shared";
export interface Music {
    DecreaseVolume(): void;
    IncreaseVolume(): void;
    PlayNext(): void;
    PlayPrevious(): void;
    RegisterForMusicPlaybackChanges(callback: (param0: boolean | MusicTrack) => void): Unregisterable;
    RegisterForMusicPlaybackPosition(callback: (position: number) => void): Unregisterable;
    SetPlaybackPosition(position: number): void;
    SetPlayingRepeatStatus(status: EMusicPlayingRepeatStatus): void;
    SetPlayingShuffled(value: boolean): void;
    SetVolume(volume: number): void;
    ToggleMuteVolume(): void;
    TogglePlayPause(): void;
}
export interface MusicTrack {
    uSoundtrackAppId: number;
    ePlaybackStatus: EAudioPlayback;
    eRepeatStatus: EMusicPlayingRepeatStatus;
    bShuffle: boolean;
    nVolume: number;
    nActiveTrack: number;
    nLengthInMsec: number;
}
export declare enum EAudioPlayback {
    Undefined = 0,
    Playing = 1,
    Paused = 2,
    Idle = 3
}
export declare enum EMusicPlayingRepeatStatus {
    None = 0,
    All = 1,
    Once = 2,
    Max = 3
}
