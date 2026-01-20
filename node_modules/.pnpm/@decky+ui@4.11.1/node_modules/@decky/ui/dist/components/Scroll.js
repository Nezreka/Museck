import { findModuleByExport, findModuleExport } from '../webpack';
const ScrollingModule = findModuleByExport((e) => e?.render?.toString?.().includes('{case"x":'));
const ScrollingModuleProps = ScrollingModule ? Object.values(ScrollingModule) : [];
export const ScrollPanel = ScrollingModuleProps.find((prop) => prop?.render?.toString?.().includes('{case"x":'));
export const ScrollPanelGroup = findModuleExport((e) => e?.render?.toString().includes('.FocusVisibleChild()),[])'));
