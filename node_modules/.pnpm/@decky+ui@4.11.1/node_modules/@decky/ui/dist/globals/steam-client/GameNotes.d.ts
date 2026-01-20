import { EResult, OperationResponse } from "./shared";
export interface GameNotes {
    DeleteImage(param0: string): Promise<boolean>;
    DeleteNotes(param0: string): Promise<boolean>;
    GetNotes(filenameForNotes: string, directoryForNoteImages: string): Promise<Notes>;
    GetNotesMetadata(note: string): Promise<NoteMetadata>;
    GetNumNotes(): Promise<number>;
    GetQuota: Promise<NotesQuota>;
    IterateNotes(appId: number, length: number): Promise<NoteMetadata[]>;
    ResolveSyncConflicts(param0: boolean): Promise<EResult>;
    SaveNotes(filenameForNotes: string, notes: string): Promise<EResult>;
    SyncToClient(): Promise<EResult>;
    SyncToServer(): Promise<EResult>;
    UploadImage(imageFileNamePrefix: string, mimeType: string, base64: string): Promise<EResult | OperationResponse>;
}
export interface Note {
    appid: number;
    id: string;
    content: string;
    ordinal: number;
    time_created: number;
    time_modified: number;
    title: string;
}
interface Notes {
    result: EResult;
    notes?: string;
}
interface NoteMetadata {
    filename: string;
    filesize: number;
    result: EResult;
    timestamp: number;
}
interface NotesQuota {
    bytes: number;
    bytesAvailable: number;
    numFiles: number;
    numFilesAvailable: number;
}
export {};
