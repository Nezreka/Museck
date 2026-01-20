import { CommonUIModule } from '../webpack';
const CommonDialogDivs = Object.values(CommonUIModule).filter((m) => typeof m === 'object' && m?.render?.toString().includes('createElement("div",{...') ||
    m?.render?.toString().includes('createElement("div",Object.assign({},'));
const MappedDialogDivs = new Map(Object.values(CommonDialogDivs).map((m) => {
    try {
        const renderedDiv = m.render({});
        return [renderedDiv.props.className.split(' ')[0], m];
    }
    catch (e) {
        console.error("[DFL:Dialog]: failed to render common dialog component", e);
        return [null, null];
    }
}));
export const DialogHeader = (MappedDialogDivs.get('DialogHeader') || Object.values(CommonUIModule).find((component) => {
    const str = component?.render?.toString?.();
    return str?.includes("role:\"heading\"") && str.includes(")(\"DialogHeader\",");
}));
export const DialogSubHeader = MappedDialogDivs.get('DialogSubHeader');
export const DialogFooter = MappedDialogDivs.get('DialogFooter');
export const DialogLabel = MappedDialogDivs.get('DialogLabel');
export const DialogBodyText = MappedDialogDivs.get('DialogBodyText');
export const DialogBody = MappedDialogDivs.get('DialogBody');
export const DialogControlsSection = MappedDialogDivs.get('DialogControlsSection');
export const DialogControlsSectionHeader = MappedDialogDivs.get('DialogControlsSectionHeader');
export const DialogButtonPrimary = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('"DialogButton","_DialogLayout","Primary"'));
export const DialogButtonSecondary = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('"DialogButton","_DialogLayout","Secondary"'));
export const DialogButton = DialogButtonSecondary;
