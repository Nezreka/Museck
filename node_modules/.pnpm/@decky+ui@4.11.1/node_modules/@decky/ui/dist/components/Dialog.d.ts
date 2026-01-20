import { CSSProperties, FC, ReactNode, RefAttributes } from 'react';
import { FooterLegendProps } from './FooterLegend';
export interface DialogCommonProps extends RefAttributes<HTMLDivElement> {
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
}
export interface DialogButtonProps extends DialogCommonProps, FooterLegendProps {
    noFocusRing?: boolean;
    disabled?: boolean;
    focusable?: boolean;
    onClick?(e: MouseEvent): void;
    onPointerDown?(e: PointerEvent): void;
    onPointerUp?(e: PointerEvent): void;
    onPointerCancel?(e: PointerEvent): void;
    onMouseDown?(e: MouseEvent): void;
    onMouseUp?(e: MouseEvent): void;
    onTouchStart?(e: TouchEvent): void;
    onTouchEnd?(e: TouchEvent): void;
    onTouchCancel?(e: TouchEvent): void;
    onSubmit?(e: SubmitEvent): void;
}
export declare const DialogHeader: FC<DialogCommonProps>;
export declare const DialogSubHeader: FC<DialogCommonProps>;
export declare const DialogFooter: FC<DialogCommonProps>;
export declare const DialogLabel: FC<DialogCommonProps>;
export declare const DialogBodyText: FC<DialogCommonProps>;
export declare const DialogBody: FC<DialogCommonProps>;
export declare const DialogControlsSection: FC<DialogCommonProps>;
export declare const DialogControlsSectionHeader: FC<DialogCommonProps>;
export declare const DialogButtonPrimary: FC<DialogButtonProps>;
export declare const DialogButtonSecondary: FC<DialogButtonProps>;
export declare const DialogButton: FC<DialogButtonProps>;
