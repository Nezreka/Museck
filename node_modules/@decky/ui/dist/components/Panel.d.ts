import { FC, ReactNode } from 'react';
export interface PanelSectionProps {
    title?: string;
    spinner?: boolean;
    children?: ReactNode;
}
export declare const PanelSection: FC<PanelSectionProps>;
export interface PanelSectionRowProps {
    children?: ReactNode;
}
export declare const PanelSectionRow: FC<PanelSectionRowProps>;
