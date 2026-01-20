import { findModuleExport } from '../webpack';
export const Marquee = findModuleExport((e) => e?.toString && e.toString().includes('.Marquee') && e.toString().includes('--fade-length'));
