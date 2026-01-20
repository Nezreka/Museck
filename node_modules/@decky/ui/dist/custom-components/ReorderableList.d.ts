import { JSXElementConstructor, ReactElement, ReactNode } from 'react';
import { FieldProps } from '../components';
export type ReorderableEntry<T> = {
    label: ReactNode;
    data?: T;
    position: number;
};
export type ReorderableListProps<T> = {
    entries: ReorderableEntry<T>[];
    onSave: (entries: ReorderableEntry<T>[]) => void;
    interactables?: JSXElementConstructor<{
        entry: ReorderableEntry<T>;
    }>;
    fieldProps?: FieldProps;
    animate?: boolean;
};
export declare function ReorderableList<T>(props: ReorderableListProps<T>): import("react/jsx-runtime").JSX.Element;
export type ReorderableListEntryProps<T> = {
    fieldProps?: FieldProps;
    listData: ReorderableEntry<T>[];
    entryData: ReorderableEntry<T>;
    reorderEntryFunc: CallableFunction;
    reorderEnabled: boolean;
    animate: boolean;
    children: ReactElement<any> | null;
};
