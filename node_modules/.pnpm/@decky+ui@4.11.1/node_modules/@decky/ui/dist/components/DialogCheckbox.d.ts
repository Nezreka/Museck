import { FC, ReactNode } from 'react';
import { DialogCommonProps } from './Dialog';
import { FooterLegendProps } from './FooterLegend';
export interface DialogCheckboxProps extends DialogCommonProps, FooterLegendProps {
    onChange?(checked: boolean): void;
    label?: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    tooltip?: string;
    color?: string;
    highlightColor?: string;
    bottomSeparator?: 'standard' | 'thick' | 'none';
    controlled?: boolean;
    checked?: boolean;
    onClick?(evt: Event): void;
}
export declare const DialogCheckbox: FC<DialogCheckboxProps>;
