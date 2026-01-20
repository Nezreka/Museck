import { findModuleExport } from '../webpack';
export const Carousel = findModuleExport((e) => e.render?.toString().includes('setFocusedColumn:'));
