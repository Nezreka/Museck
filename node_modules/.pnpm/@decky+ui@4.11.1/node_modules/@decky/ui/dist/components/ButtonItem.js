import { CommonUIModule } from '../webpack';
import { createPropListRegex } from '../utils';
const buttonItemRegex = createPropListRegex(["highlightOnFocus", "childrenContainerWidth"], false);
export const ButtonItem = Object.values(CommonUIModule).find((mod) => (mod?.render?.toString && buttonItemRegex.test(mod.render.toString())) ||
    mod?.render?.toString?.().includes('childrenContainerWidth:"min"'));
