import { FC, ReactNode, RefAttributes } from 'react';
import { FooterLegendProps } from './FooterLegend';
export interface FieldProps extends FooterLegendProps {
    children?: ReactNode;
    label?: ReactNode;
    bottomSeparator?: 'standard' | 'thick' | 'none';
    description?: ReactNode;
    disabled?: boolean;
    icon?: ReactNode;
    inlineWrap?: 'keep-inline' | 'shift-children-below';
    childrenLayout?: 'below' | 'inline';
    childrenContainerWidth?: 'min' | 'max' | 'fixed';
    spacingBetweenLabelAndChild?: 'none';
    padding?: 'none' | 'standard' | 'compact';
    className?: string;
    highlightOnFocus?: boolean;
    indentLevel?: number;
    verticalAlignment?: 'center' | 'none';
    focusable?: boolean;
    onActivate?: (e: CustomEvent | MouseEvent) => void;
    onClick?: (e: CustomEvent | MouseEvent) => void;
}
export declare const Field: FC<FieldProps & RefAttributes<HTMLDivElement>>;
