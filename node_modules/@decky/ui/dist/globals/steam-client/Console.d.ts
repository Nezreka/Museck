import { Unregisterable } from "./shared";
export interface Console {
    ExecCommand(command: string): void;
    GetAutocompleteSuggestions(command: string): Promise<string[]>;
    RegisterForSpewOutput(callback: (output: SpewOutput) => void): Unregisterable;
}
export type SpewType_t = "assert" | "error" | "warning" | "info" | "input";
export interface SpewOutput {
    spew: string;
    spew_type: SpewType_t;
}
