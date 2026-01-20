import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from 'react';
import { Field, Focusable, GamepadButton } from '../components';
export function ReorderableList(props) {
    if (props.animate === undefined)
        props.animate = true;
    const [entryList, setEntryList] = useState([...props.entries].sort((a, b) => a.position - b.position));
    const [reorderEnabled, setReorderEnabled] = useState(false);
    useEffect(() => {
        setEntryList([...props.entries].sort((a, b) => a.position - b.position));
    }, [props.entries]);
    function toggleReorderEnabled() {
        let newReorderValue = !reorderEnabled;
        setReorderEnabled(newReorderValue);
        if (!newReorderValue) {
            props.onSave(entryList);
        }
    }
    function saveOnBackout(e) {
        const event = e;
        if (event.detail.button == GamepadButton.CANCEL && reorderEnabled) {
            setReorderEnabled(!reorderEnabled);
            props.onSave(entryList);
        }
    }
    return (_jsx(Fragment, { children: _jsx("div", { style: {
                width: 'inherit',
                height: 'inherit',
                flex: '1 1 1px',
                scrollPadding: '48px 0px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignContent: 'stretch',
            }, children: _jsx(Focusable, { onSecondaryButton: toggleReorderEnabled, onSecondaryActionDescription: reorderEnabled ? 'Save Order' : 'Reorder', onClick: toggleReorderEnabled, onButtonDown: saveOnBackout, children: entryList.map((entry) => (_jsx(ReorderableItem, { animate: props.animate, listData: entryList, entryData: entry, reorderEntryFunc: setEntryList, reorderEnabled: reorderEnabled, fieldProps: props.fieldProps, children: props.interactables ? _jsx(props.interactables, { entry: entry }) : null }))) }) }) }));
}
function ReorderableItem(props) {
    const [isSelected, _setIsSelected] = useState(false);
    const [isSelectedLastFrame, setIsSelectedLastFrame] = useState(false);
    const listEntries = props.listData;
    function onReorder(e) {
        if (!props.reorderEnabled)
            return;
        const event = e;
        const currentIdx = listEntries.findIndex((entryData) => entryData === props.entryData);
        const currentIdxValue = listEntries[currentIdx];
        if (currentIdx < 0)
            return;
        let targetPosition = -1;
        if (event.detail.button == GamepadButton.DIR_DOWN) {
            targetPosition = currentIdxValue.position + 1;
        }
        else if (event.detail.button == GamepadButton.DIR_UP) {
            targetPosition = currentIdxValue.position - 1;
        }
        if (targetPosition >= listEntries.length || targetPosition < 0)
            return;
        let otherToUpdate = listEntries.find((entryData) => entryData.position === targetPosition);
        if (!otherToUpdate)
            return;
        let currentPosition = currentIdxValue.position;
        currentIdxValue.position = otherToUpdate.position;
        otherToUpdate.position = currentPosition;
        props.reorderEntryFunc([...listEntries].sort((a, b) => a.position - b.position));
    }
    async function setIsSelected(val) {
        _setIsSelected(val);
        for (let i = 0; i < 3; i++)
            await new Promise((res) => requestAnimationFrame(res));
        setIsSelectedLastFrame(val);
    }
    return (_jsx("div", { style: props.animate
            ? {
                transition: isSelected || isSelectedLastFrame
                    ? ''
                    : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: !props.reorderEnabled || isSelected ? 'scale(1)' : 'scale(0.9)',
                opacity: !props.reorderEnabled || isSelected ? 1 : 0.7,
            }
            : {}, children: _jsx(Field, { label: props.entryData.label, ...props.fieldProps, focusable: !props.children, onButtonDown: onReorder, onGamepadBlur: () => setIsSelected(false), onGamepadFocus: () => setIsSelected(true), children: _jsx(Focusable, { style: { display: 'flex', width: '100%', position: 'relative' }, children: props.children }) }) }));
}
