import { EResult, Unregisterable } from "./shared";
import { LaunchOption } from "./App";
export interface Streaming {
    AcceptStreamingEULA(appId: number, id: string, version: number): void;
    CancelStreamGame(): void;
    RegisterForStreamingClientFinished(callback: (code: EResult, result: string) => void): Unregisterable;
    RegisterForStreamingClientLaunchProgress(callback: (actionType: string, taskDetails: string, done: number, total: number) => void): Unregisterable;
    RegisterForStreamingClientStarted(callback: (appId: number) => void): Unregisterable;
    RegisterForStreamingLaunchComplete(callback: (code: EResult, result: string) => void): Unregisterable;
    RegisterForStreamingShowEula(callback: (appId: number) => void): Unregisterable;
    RegisterForStreamingShowIntro(callback: (appId: number, param: string) => void): Unregisterable;
    RegisterForStreamingShowLaunchOptions(callback: (appId: number, launchOptions: LaunchOption[]) => void): Unregisterable;
    StreamingContinueStreamGame(): void;
    StreamingSetLaunchOption(index: number): void;
}
