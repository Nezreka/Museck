import { FC } from 'react';
import { ItemProps } from './Item';
export interface ButtonItemProps extends ItemProps {
    onClick?(e: MouseEvent): void;
    disabled?: boolean;
}
export declare const ButtonItem: FC<ButtonItemProps>;
