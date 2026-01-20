import { findModuleExport } from '../webpack';
export const Field = findModuleExport((e) => e?.render?.toString().includes('"shift-children-below"'));
