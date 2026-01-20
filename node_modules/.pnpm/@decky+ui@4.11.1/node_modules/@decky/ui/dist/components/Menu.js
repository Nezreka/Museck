import { findModuleByExport, findModuleDetailsByExport, findModuleExport } from '../webpack';
export const showContextMenu = findModuleExport((e) => typeof e === 'function' &&
    e.toString().includes('GetContextMenuManagerFromWindow(') &&
    e.toString().includes('.CreateContextMenuInstance('));
const MenuModule = findModuleDetailsByExport((e) => e?.render?.toString()?.includes('bPlayAudio:') || (e?.prototype?.OnOKButton && e?.prototype?.OnMouseEnter));
export const Menu = findModuleExport((e) => e?.prototype?.HideIfSubmenu && e?.prototype?.HideMenu) ||
    Object.values(MenuModule?.[0] ?? {}).find((e) => e?.toString()?.includes?.(`useId`) && e?.toString()?.includes?.(`labelId`));
const MenuGoupModule = findModuleByExport(e => e?.prototype?.Focus && e?.prototype?.OnOKButton && e?.prototype?.render?.toString().includes?.(`"emphasis"==this.props.tone`));
export const MenuGroup = MenuGoupModule && Object.values(MenuGoupModule).find((e) => typeof e == "function" && e?.toString?.()?.includes("bInGamepadUI:"));
export const MenuItem = MenuModule?.[1];
export const MenuSeparator = findModuleExport((e) => typeof e === 'function' && /className:.+?\.ContextMenuSeparator/.test(e.toString()));
