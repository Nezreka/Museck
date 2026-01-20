import { CommonUIModule } from '../webpack';
export const ToggleField = Object.values(CommonUIModule).find((mod) => mod?.render?.toString?.()?.includes('ToggleField,fallback') || mod?.render?.toString?.()?.includes("ToggleField\","));
