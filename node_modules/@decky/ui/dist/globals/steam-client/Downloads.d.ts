import { Unregisterable } from "./shared";
import { EAppUpdateError } from "./App";
export interface Downloads {
    EnableAllDownloads(enable: boolean): void;
    MoveAppUpdateDown(appId: number): void;
    MoveAppUpdateUp(appId: number): void;
    PauseAppUpdate(appId: number): void;
    QueueAppUpdate(appId: number): void;
    RegisterForDownloadItems(callback: (isDownloading: boolean, downloadItems: DownloadItem[]) => void): Unregisterable;
    RegisterForDownloadOverview(callback: (overview: DownloadOverview) => void): Unregisterable;
    RemoveFromDownloadList(appId: number): void;
    ResumeAppUpdate(appId: number): void;
    SetLaunchOnUpdateComplete(appId: number): void;
    SetQueueIndex(appId: number, index: number): void;
    SuspendDownloadThrottling(suspend: boolean): void;
    SuspendLanPeerContent(suspend: boolean): void;
}
export interface DownloadItem {
    active: boolean;
    appid: number;
    buildid: number;
    completed: boolean;
    completed_time: number;
    deferred_time: number;
    downloaded_bytes: number;
    launch_on_completion: boolean;
    paused: boolean;
    queue_index: number;
    target_buildid: number;
    total_bytes: number;
    update_error: string;
    update_result: EAppUpdateError;
    update_type_info: UpdateTypeInfo[];
}
export interface DownloadOverview {
    lan_peer_hostname: string;
    paused: boolean;
    throttling_suspended: boolean;
    update_appid: number;
    update_bytes_downloaded: number;
    update_bytes_processed: number;
    update_bytes_staged: number;
    update_bytes_to_download: number;
    update_bytes_to_process: number;
    update_bytes_to_stage: number;
    update_disc_bytes_per_second: number;
    update_is_install: boolean;
    update_is_prefetch_estimate: boolean;
    update_is_shader: boolean;
    update_is_upload: boolean;
    update_is_workshop: boolean;
    update_network_bytes_per_second: number;
    update_peak_network_bytes_per_second: number;
    update_seconds_remaining: number;
    update_start_time: number;
    update_state: 'None' | 'Starting' | 'Updating' | 'Stopping';
}
export interface UpdateTypeInfo {
    completed_update: boolean;
    downloaded_bytes: number;
    has_update: boolean;
    total_bytes: number;
}
