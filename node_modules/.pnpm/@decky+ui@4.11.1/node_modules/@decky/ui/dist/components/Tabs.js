import { findModuleByExport } from '../webpack';
const tabsModule = findModuleByExport(e => e?.toString?.()?.includes(".TabRowTabs") && e?.toString?.()?.includes("activeTab:"));
export const Tabs = tabsModule && Object.values(tabsModule).find((e) => e?.type?.toString?.()?.includes("((function()"));
