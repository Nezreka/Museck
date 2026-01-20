import { EResult, Unregisterable } from "./shared";
export interface Broadcast {
    ApproveViewerRequest(steamId64: string, param1: number): void;
    InviteToWatch(steamId64: string): Promise<EResult>;
    RegisterForBroadcastStatus(callback: (status: BroadcastStatus) => void): Unregisterable;
    RegisterForViewerRequests(callback: (viewerFriendCode: number, param1: number, param2: number) => void): Unregisterable;
    RejectViewerRequest(steamId64: string, param1: number): void;
    StopBroadcasting(): void;
}
export interface BroadcastStatus {
    broadcastid: string;
    nViewers: number;
    nRequests: number;
    bIsBroadcasting: boolean;
    bIsRecordingDesktop: boolean;
    eBroadcastReady: EResult;
    bBroadcastCapable: boolean;
    bMicrophoneEnabled: boolean;
    bMicrophoneActive: boolean;
    nCurrentFPS: number;
    nUploadKbps: number;
}
