import { EResult, Unregisterable } from "./shared";
export interface FamilySharing {
    GetAvailableLenders(appId: number): Promise<Lender[]>;
    RegisterForKickedBorrower: Unregisterable;
    SetPreferredLender(appId: number, param1: number): Promise<EResult>;
}
interface LenderDLC {
    rtStoreAssetModifyTime: number;
    strHeaderFilename: string;
    strName: string;
    unAppID: number;
}
export interface Lender {
    steamid: string;
    appid: number;
    numDlc: number;
    bPreferred: boolean;
    vecDLC: LenderDLC[];
}
export {};
