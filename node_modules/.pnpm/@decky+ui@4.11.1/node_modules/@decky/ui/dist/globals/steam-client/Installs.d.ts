import { Unregisterable } from "./shared";
import { EAppUpdateError } from "./App";
export interface Installs {
    CancelInstall(): void;
    ContinueInstall(): void;
    GetInstallManagerInfo(): Promise<InstallMgrInfo>;
    OpenInstallBackup(appBackupPath: string): void;
    OpenInstallWizard(appIds: number[]): void;
    OpenUninstallWizard(appIds: number[], dontPrompt: boolean): void;
    RegisterForShowConfirmUninstall: Unregisterable;
    RegisterForShowFailedUninstall(callback: (appId: number, reason: EAppUpdateError) => void): Unregisterable;
    RegisterForShowInstallWizard(callback: (data: InstallMgrInfo) => void): Unregisterable;
    RegisterForShowRegisterCDKey: any;
    SetAppList(appIds: number[]): void;
    SetCreateShortcuts(bDesktopShortcut: boolean, bSystemMenuShortcut: boolean): void;
    SetInstallFolder(folderIndex: number): void;
}
export interface InstallMgrInfo {
    rgAppIDs: InstallInfoApps[];
    eInstallState: EInstallMgrState;
    nDiskSpaceRequired: number;
    nDiskSpaceAvailable: number;
    nCurrentDisk: number;
    nTotalDisks: number;
    bCanChangeInstallFolder: boolean;
    iInstallFolder: number;
    iUnmountedFolder: number;
    currentAppID: number;
    eAppError: EAppUpdateError;
    errorDetail: string;
    bSystemMenuShortcut: boolean;
    bDesktopShortcut: boolean;
    bIsBackupInstall: boolean;
    strPeerContentServer: string;
    bPeerContentServerOnline: boolean;
    bPeerContentServerAvailable: boolean;
}
export interface InstallInfoApps {
    nAppID: number;
    lDiskSpaceRequiredBytes: number;
}
export declare enum EInstallMgrState {
    None = 0,
    Setup = 1,
    WaitLicense = 2,
    FreeLicense = 3,
    ShowCDKey = 4,
    WaitAppInfo = 5,
    ShowPassword = 6,
    ShowConfig = 7,
    ShowEULAs = 8,
    CreateApps = 9,
    ReadFromMedia = 10,
    ShowChangeMedia = 11,
    WaitLegacyCDKeys = 12,
    ShowSignup = 13,
    Complete = 14,
    Failed = 15,
    Canceled = 16
}
