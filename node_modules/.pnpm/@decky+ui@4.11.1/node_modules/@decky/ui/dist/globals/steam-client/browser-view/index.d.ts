import { Unregisterable } from "../shared";
import { BrowserViewPopup } from "./BrowserViewPopup";
export interface BrowserView {
    Create(options?: BrowserViewCreateOptions): BrowserViewPopup;
    CreatePopup(options?: BrowserViewCreateOptions): {
        strCreateURL: string;
        browserView: BrowserViewPopup;
    };
    Destroy(browserView: BrowserViewPopup): void;
    PostMessageToParent(message: string, args: string): void;
    RegisterForMessageFromParent(callback: (message: string, args: string) => void): Unregisterable;
}
export interface BrowserViewCreateOptions {
    bOnlyAllowTrustedPopups?: boolean;
    parentPopupBrowserID?: number;
    strInitialURL?: string;
    strUserAgentIdentifier?: string;
    strUserAgentOverride?: string;
    strVROverlayKey?: string;
}
