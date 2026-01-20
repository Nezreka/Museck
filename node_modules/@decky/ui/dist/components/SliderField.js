import { CommonUIModule } from '../webpack';
export const SliderField = Object.values(CommonUIModule).find((mod) => mod?.toString?.()?.includes('SliderField,fallback') || mod?.toString?.()?.includes("SliderField\","));
