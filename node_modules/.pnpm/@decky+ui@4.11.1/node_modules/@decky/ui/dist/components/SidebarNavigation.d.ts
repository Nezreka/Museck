import { ReactNode, FC } from 'react';
export interface SidebarNavigationPage {
    title: ReactNode;
    content: ReactNode;
    icon?: ReactNode;
    visible?: boolean;
    hideTitle?: boolean;
    identifier?: string;
    route?: string;
    link?: string;
    padding?: 'none' | 'compact';
}
export interface SidebarNavigationProps {
    title?: ReactNode;
    pages: (SidebarNavigationPage | 'separator')[];
    showTitle?: boolean;
    disableRouteReporting?: boolean;
    page?: string;
    onPageRequested?: (page: string) => void;
}
export declare const SidebarNavigation: FC<SidebarNavigationProps>;
