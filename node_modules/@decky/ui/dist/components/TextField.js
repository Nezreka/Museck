import { CommonUIModule } from '../webpack';
export const TextField = Object.values(CommonUIModule).find((mod) => mod?.validateUrl && mod?.validateEmail);
