import { findModuleExport } from '../webpack';
export const DialogCheckbox = findModuleExport(e => e?.prototype &&
    typeof e?.prototype == "object" &&
    "GetPanelElementProps" in e?.prototype &&
    "SetChecked" in e?.prototype &&
    "Toggle" in e?.prototype &&
    (e?.prototype?.render?.toString?.().includes('="DialogCheckbox"') || (e.contextType &&
        e.prototype?.render?.toString?.().includes('fallback:'))));
