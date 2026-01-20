import { ReactNode, FC } from 'react';
import { ItemProps } from './Item';
import type { ContextMenuPositionOptions } from './Menu';
export interface SingleDropdownOption {
    data: any;
    label: ReactNode;
    options?: never;
}
export interface MultiDropdownOption {
    label: ReactNode;
    options: DropdownOption[];
    data?: never;
}
export type DropdownOption = SingleDropdownOption | MultiDropdownOption;
export interface DropdownProps {
    rgOptions: DropdownOption[];
    selectedOption: any;
    disabled?: boolean;
    onMenuWillOpen?(showMenu: () => void): void;
    onMenuOpened?(): void;
    onChange?(data: SingleDropdownOption): void;
    contextMenuPositionOptions?: ContextMenuPositionOptions;
    menuLabel?: string;
    strDefaultLabel?: string;
    renderButtonValue?(element: ReactNode): ReactNode;
    focusable?: boolean;
}
export declare const Dropdown: FC<DropdownProps>;
export interface DropdownItemProps extends DropdownProps, ItemProps {
}
export declare const DropdownItem: FC<DropdownItemProps>;
