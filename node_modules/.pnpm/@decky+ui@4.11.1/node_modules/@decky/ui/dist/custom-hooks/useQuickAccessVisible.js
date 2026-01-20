import { useEffect, useState } from 'react';
import { getGamepadNavigationTrees } from '../utils';
function getQuickAccessWindow() {
    const navTrees = getGamepadNavigationTrees();
    return (navTrees.find((tree) => tree?.id === 'QuickAccess-NA')?.m_Root?.m_element?.ownerDocument.defaultView ?? null);
}
export function useQuickAccessVisible() {
    const [isHidden, setIsHidden] = useState(getQuickAccessWindow()?.document.hidden ?? false);
    useEffect(() => {
        const quickAccessWindow = getQuickAccessWindow();
        if (quickAccessWindow === null) {
            console.error('Could not get window of QuickAccess menu!');
            return;
        }
        const onVisibilityChange = () => setIsHidden(quickAccessWindow.document.hidden);
        quickAccessWindow.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            quickAccessWindow.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);
    return !isHidden;
}
