import { CSSProperties, FC } from 'react';
export interface MarqueeProps {
    play?: boolean;
    direction?: 'left' | 'right';
    speed?: number;
    delay?: number;
    fadeLength?: number;
    center?: boolean;
    resetOnPause?: boolean;
    style?: CSSProperties;
    className?: string;
    children: React.ReactNode;
}
export declare const Marquee: FC<MarqueeProps>;
