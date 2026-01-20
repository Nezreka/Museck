import { OperationResponse } from "./shared";
export interface Storage {
    DeleteKey(key: string): Promise<OperationResponse | undefined>;
    GetJSON(key: string): Promise<OperationResponse | string>;
    GetString(key: string): Promise<OperationResponse | string>;
    SetObject(key: string, value: object): Promise<OperationResponse | undefined>;
    SetString(key: string, value: string): Promise<OperationResponse | undefined>;
}
