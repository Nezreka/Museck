import { ChangeEventHandler, HTMLAttributes, ReactNode, FC } from 'react';
export interface TextFieldProps extends HTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    requiredLabel?: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    bShowCopyAction?: boolean;
    bShowClearAction?: boolean;
    bAlwaysShowClearAction?: boolean;
    bIsPassword?: boolean;
    rangeMin?: number;
    rangeMax?: number;
    mustBeNumeric?: boolean;
    mustBeURL?: boolean;
    mustBeEmail?: boolean;
    focusOnMount?: boolean;
    tooltip?: string;
    inlineControls?: ReactNode;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    value?: string;
}
export declare const TextField: FC<TextFieldProps>;
