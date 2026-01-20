import { findModuleExport } from '../webpack';
export const ControlsList = findModuleExport((e) => e?.toString && e.toString().includes('().ControlsListChild') && e.toString().includes('().ControlsListOuterPanel'));
