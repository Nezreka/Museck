import { findModuleExport } from '../webpack';
export const SteamSpinner = findModuleExport((e) => e?.toString?.()?.includes('Steam Spinner') && e?.toString?.()?.includes('src'));
