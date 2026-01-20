import { findModuleDetailsByExport } from '../webpack';
const [mod, panelSection] = findModuleDetailsByExport((e) => e.toString()?.includes('.PanelSection'));
export const PanelSection = panelSection;
export const PanelSectionRow = Object.values(mod).filter((exp) => !exp?.toString?.()?.includes('.PanelSection'))[0];
