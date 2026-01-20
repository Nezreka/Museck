import { FC } from 'react';
interface ColorPickerModalProps {
    closeModal: () => void;
    onConfirm?(HSLString: string): any;
    title?: string;
    defaultH?: number;
    defaultS?: number;
    defaultL?: number;
    defaultA?: number;
}
export declare const ColorPickerModal: FC<ColorPickerModalProps>;
export {};
