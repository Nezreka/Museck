import { FC, ReactNode } from 'react';
import { FooterLegendProps } from './FooterLegend';
interface PopupCreationOptions {
    bCreateHidden?: boolean;
    bModal?: boolean;
    title?: string;
}
interface MonitorOptions {
    targetMonitor: {
        flMonitorScale: number;
        nScreenLeft: number;
        nScreenTop: number;
        nScreenWidth: number;
        nScreenHeight: number;
    };
    flGamepadScale: number;
}
export interface ContextMenuPositionOptions extends PopupCreationOptions, Partial<MonitorOptions> {
    bAlwaysOnTop?: boolean;
    bDisableMouseOverlay?: boolean;
    bDisablePopTop?: boolean;
    bFitToWindow?: boolean;
    bForcePopup?: boolean;
    bGrowToElementWidth?: boolean;
    bMatchHeight?: boolean;
    bMatchWidth?: boolean;
    bNoFocusWhenShown?: boolean;
    bRetainOnHide?: boolean;
    bScreenCoordinates?: boolean;
    bOverlapHorizontal?: boolean;
    bOverlapVertical?: boolean;
    bPreferPopLeft?: boolean;
    bPreferPopTop?: boolean;
    bShiftToFitWindow?: boolean;
    bStandalone?: boolean;
    strClassName?: string;
}
interface ContextMenuInstance {
    Hide(): void;
    Show(): void;
}
export declare const showContextMenu: (children: ReactNode, parent?: EventTarget, options?: ContextMenuPositionOptions) => ContextMenuInstance;
export interface MenuProps extends FooterLegendProps {
    label: string;
    onCancel?(): void;
    cancelText?: string;
    children?: ReactNode;
}
export declare const Menu: FC<MenuProps>;
export interface MenuGroupProps {
    label: string;
    disabled?: boolean;
    children?: ReactNode;
}
export declare const MenuGroup: FC<MenuGroupProps>;
export interface MenuItemProps extends FooterLegendProps {
    bInteractableItem?: boolean;
    onClick?(evt: Event): void;
    onSelected?(evt: Event): void;
    onMouseEnter?(evt: MouseEvent): void;
    onMoveRight?(): void;
    selected?: boolean;
    disabled?: boolean;
    bPlayAudio?: boolean;
    tone?: 'positive' | 'emphasis' | 'destructive';
    children?: ReactNode;
}
export declare const MenuItem: FC<MenuItemProps>;
export declare const MenuSeparator: FC;
export {};
