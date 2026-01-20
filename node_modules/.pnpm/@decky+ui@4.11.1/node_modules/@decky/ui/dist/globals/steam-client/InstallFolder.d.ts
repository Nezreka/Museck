import { Unregisterable } from "./shared";
import { EAppUpdateError } from "./App";
export interface InstallFolder {
    AddInstallFolder(path: string): Promise<number>;
    BrowseFilesInFolder(folderIndex: number): void;
    CancelMove(): void;
    GetInstallFolders(): Promise<SteamInstallFolder[]>;
    GetPotentialFolders(): Promise<PotentialInstallFolder[]>;
    MoveInstallFolderForApp(appId: number, folderIndex: number): void;
    RefreshFolders(): void;
    RegisterForInstallFolderChanges(callback: (change: FolderChange) => void): Unregisterable;
    RegisterForMoveContentProgress(callback: (progress: MoveContentProgress) => void): Unregisterable;
    RegisterForRepairFolderFinished(callback: (change: FolderChange) => void): Unregisterable;
    RemoveInstallFolder(folderIndex: number): void;
    RepairInstallFolder(folderIndex: number): void;
    SetDefaultInstallFolder(folderIndex: number): void;
    SetFolderLabel(folderIndex: number, label: string): void;
}
export interface SteamInstallFolder extends PotentialInstallFolder {
    nFolderIndex: number;
    strUsedSize: string;
    strDLCSize: string;
    strWorkshopSize: string;
    strStagedSize: string;
    bIsDefaultFolder: boolean;
    bIsMounted: boolean;
    vecApps: AppInfo[];
}
export interface PotentialInstallFolder {
    strFolderPath: string;
    strUserLabel: string;
    strDriveName: string;
    strCapacity: string;
    strFreeSpace: string;
    bIsFixed: boolean;
}
export interface AppInfo {
    nAppID: number;
    strAppName: string;
    strSortAs: string;
    rtLastPlayed: number;
    strUsedSize: string;
    strDLCSize: string;
    strWorkshopSize: string;
    strStagedSize: string;
}
export interface FolderChange {
    folderIndex: number;
}
export interface MoveContentProgress {
    appid: number;
    eError: EAppUpdateError;
    flProgress: number;
    strBytesMoved: string;
    strTotalBytesToMove: string;
    nFilesMoved: number;
}
