import { ReactNode } from 'react';
import { FooterLegendProps } from './FooterLegend';
export interface Tab {
    id: string;
    title: string;
    renderTabAddon?: () => ReactNode;
    content: ReactNode;
    footer?: FooterLegendProps;
}
export interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onShowTab: (tab: string) => void;
    autoFocusContents?: boolean;
}
export declare const Tabs: any;
