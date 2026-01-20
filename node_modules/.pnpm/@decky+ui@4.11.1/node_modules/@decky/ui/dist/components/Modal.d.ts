import { FC, ReactNode } from 'react';
export interface ShowModalProps {
    browserContext?: unknown;
    bForcePopOut?: boolean;
    bHideActionIcons?: boolean;
    bHideMainWindowForPopouts?: boolean;
    bNeverPopOut?: boolean;
    fnOnClose?: () => void;
    popupHeight?: number;
    popupWidth?: number;
    promiseRenderComplete?: Promise<void>;
    strTitle?: string;
}
export interface ShowModalResult {
    Close: () => void;
    Update: (modal: ReactNode) => void;
}
export declare const showModal: (modal: ReactNode, parent?: EventTarget, props?: ShowModalProps) => ShowModalResult;
export interface ModalRootProps {
    children?: ReactNode;
    onCancel?(): void;
    closeModal?(): void;
    onOK?(): void;
    onEscKeypress?(): void;
    className?: string;
    modalClassName?: string;
    bAllowFullSize?: boolean;
    bDestructiveWarning?: boolean;
    bDisableBackgroundDismiss?: boolean;
    bHideCloseIcon?: boolean;
    bOKDisabled?: boolean;
    bCancelDisabled?: boolean;
}
export interface ConfirmModalProps extends ModalRootProps {
    onMiddleButton?(): void;
    strTitle?: ReactNode;
    strDescription?: ReactNode;
    strOKButtonText?: ReactNode;
    strCancelButtonText?: ReactNode;
    strMiddleButtonText?: ReactNode;
    bAlertDialog?: boolean;
    bMiddleDisabled?: boolean;
}
export declare const ConfirmModal: FC<ConfirmModalProps>;
export declare const ModalRoot: any;
interface SimpleModalProps {
    active?: boolean;
    children: ReactNode;
}
export declare const SimpleModal: FC<SimpleModalProps>;
export declare const ModalPosition: FC<SimpleModalProps>;
export {};
