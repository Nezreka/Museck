import { HTMLAttributes, ReactNode, RefAttributes, FC } from 'react';
import { FooterLegendProps } from './FooterLegend';
export interface FocusableProps extends HTMLAttributes<HTMLDivElement>, FooterLegendProps {
    children: ReactNode;
    'flow-children'?: string;
    focusClassName?: string;
    focusWithinClassName?: string;
    noFocusRing?: boolean;
    onActivate?: (e: CustomEvent) => void;
    onCancel?: (e: CustomEvent) => void;
}
export declare const Focusable: FC<FocusableProps & RefAttributes<HTMLDivElement>>;
