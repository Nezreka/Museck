import { HTMLAttributes, ReactNode, RefAttributes, FC } from 'react';
export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
    autoFocus?: boolean;
    enableBumperPaging?: boolean;
    fnDoesItemTakeFocus?: (...unknown: any[]) => boolean;
    fnGetColumnWidth?: (...unknown: any[]) => number;
    fnGetId?: (id: number) => number;
    fnItemRenderer?: (id: number, ...unknown: any[]) => ReactNode;
    fnUpdateArrows?: (...unknown: any[]) => any;
    initialColumn?: number;
    nHeight?: number;
    nIndexLeftmost?: number;
    nItemHeight?: number;
    nItemMarginX?: number;
    nNumItems?: number;
    name?: string;
    scrollToAlignment?: 'center';
}
export declare const Carousel: FC<CarouselProps & RefAttributes<HTMLDivElement>>;
