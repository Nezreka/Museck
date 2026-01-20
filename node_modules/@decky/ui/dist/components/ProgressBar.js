import { findModuleExport } from '../webpack';
import { createPropListRegex } from '../utils';
export const ProgressBar = findModuleExport((e) => e?.toString?.()?.includes('.ProgressBar,"standard"=='));
export const ProgressBarWithInfo = findModuleExport((e) => e?.toString?.()?.includes('.ProgressBarFieldStatus},'));
const progressBarItemRegex = createPropListRegex(["indeterminate", "nTransitionSec", "nProgress"]);
export const ProgressBarItem = findModuleExport((e) => e?.toString && progressBarItemRegex.test(e.toString()));
