import { ElementType, FC, ReactNode } from 'react';
export interface FocusRingProps {
    className?: string;
    rootClassName?: string;
    render?: ElementType;
    children?: ReactNode;
    NavigationManager?: any;
}
export declare const FocusRing: FC<FocusRingProps>;
