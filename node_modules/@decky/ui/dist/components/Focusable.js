import { findModuleExport } from '../webpack';
import { createPropListRegex } from '../utils';
const focusableRegex = createPropListRegex(["flow-children", "onActivate", "onCancel", "focusClassName", "focusWithinClassName"]);
export const Focusable = findModuleExport((e) => (typeof e == 'function' && e?.toString && focusableRegex.test(e.toString())) || (e?.render?.toString && focusableRegex.test(e.render.toString())));
