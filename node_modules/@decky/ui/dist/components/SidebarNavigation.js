import { findModuleExport } from '../webpack';
import { createPropListRegex } from '../utils';
const sidebarNavigationRegex = createPropListRegex(["pages", "fnSetNavigateToPage", "disableRouteReporting"]);
export const SidebarNavigation = findModuleExport((e) => e?.toString && sidebarNavigationRegex.test(e.toString()));
