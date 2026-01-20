import { FC, ImgHTMLAttributes } from 'react';
interface SuspensefulImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    suspenseWidth?: string | number;
    suspenseHeight?: string | number;
}
export declare const SuspensefulImage: FC<SuspensefulImageProps>;
export {};
