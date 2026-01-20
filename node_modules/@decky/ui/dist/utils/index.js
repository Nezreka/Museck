export * from './patcher';
export * from './static-classes';
export * from './react/react';
export * from './react/fc';
export * from './react/treepatcher';
export function joinClassNames(...classes) {
    return classes.join(' ');
}
export function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
export function findSP() {
    if (document.title == 'SP')
        return window;
    const navTrees = getGamepadNavigationTrees();
    return navTrees?.find((x) => x.m_ID == 'GamepadUI_Full_Root' || x.m_ID == 'root_1_')?.Root?.Element?.ownerDocument?.defaultView;
}
export function getFocusNavController() {
    return window.GamepadNavTree?.m_context?.m_controller || window.FocusNavController;
}
export function getGamepadNavigationTrees() {
    const focusNav = getFocusNavController();
    const context = focusNav?.m_ActiveContext || focusNav?.m_LastActiveContext;
    return context?.m_rgGamepadNavigationTrees;
}
