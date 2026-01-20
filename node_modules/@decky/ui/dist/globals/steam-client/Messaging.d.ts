import { Unregisterable } from "./shared";
export interface Messaging {
    RegisterForMessages<T extends string>(message: T, callback: (message: T, section: string, args: string) => void): Unregisterable;
    PostMessage(message: string, section: string, args: string): void;
}
