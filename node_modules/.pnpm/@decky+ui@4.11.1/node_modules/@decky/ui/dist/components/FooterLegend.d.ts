import { ReactNode } from 'react';
export declare enum GamepadButton {
    INVALID = 0,
    OK = 1,
    CANCEL = 2,
    SECONDARY = 3,
    OPTIONS = 4,
    BUMPER_LEFT = 5,
    BUMPER_RIGHT = 6,
    TRIGGER_LEFT = 7,
    TRIGGER_RIGHT = 8,
    DIR_UP = 9,
    DIR_DOWN = 10,
    DIR_LEFT = 11,
    DIR_RIGHT = 12,
    SELECT = 13,
    START = 14,
    LSTICK_CLICK = 15,
    RSTICK_CLICK = 16,
    LSTICK_TOUCH = 17,
    RSTICK_TOUCH = 18,
    LPAD_TOUCH = 19,
    LPAD_CLICK = 20,
    RPAD_TOUCH = 21,
    RPAD_CLICK = 22,
    REAR_LEFT_UPPER = 23,
    REAR_LEFT_LOWER = 24,
    REAR_RIGHT_UPPER = 25,
    REAR_RIGHT_LOWER = 26,
    STEAM_GUIDE = 27,
    STEAM_QUICK_MENU = 28
}
export declare enum NavEntryPositionPreferences {
    FIRST = 0,
    LAST = 1,
    MAINTAIN_X = 2,
    MAINTAIN_Y = 3,
    PREFERRED_CHILD = 4
}
export interface GamepadEventDetail {
    button: number;
    is_repeat?: boolean;
    source: number;
}
export declare type ActionDescriptionMap = {
    [key in GamepadButton]?: ReactNode;
};
export declare type GamepadEvent = CustomEvent<GamepadEventDetail>;
export interface FooterLegendProps {
    navEntryPreferPosition?: NavEntryPositionPreferences;
    preferredFocus?: boolean;
    actionDescriptionMap?: ActionDescriptionMap;
    onOKActionDescription?: ReactNode;
    onCancelActionDescription?: ReactNode;
    onSecondaryActionDescription?: ReactNode;
    onOptionsActionDescription?: ReactNode;
    onMenuActionDescription?: ReactNode;
    onButtonDown?: (evt: GamepadEvent) => void;
    onButtonUp?: (evt: GamepadEvent) => void;
    onOKButton?: (evt: GamepadEvent) => void;
    onCancelButton?: (evt: GamepadEvent) => void;
    onSecondaryButton?: (evt: GamepadEvent) => void;
    onOptionsButton?: (evt: GamepadEvent) => void;
    onGamepadDirection?: (evt: GamepadEvent) => void;
    onGamepadFocus?: (evt: GamepadEvent) => void;
    onGamepadBlur?: (evt: GamepadEvent) => void;
    onMenuButton?: (evt: GamepadEvent) => void;
}
