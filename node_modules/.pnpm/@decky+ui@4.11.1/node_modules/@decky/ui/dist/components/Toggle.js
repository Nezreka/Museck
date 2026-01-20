import { CommonUIModule } from '../webpack';
export const Toggle = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('.ToggleOff)'));
