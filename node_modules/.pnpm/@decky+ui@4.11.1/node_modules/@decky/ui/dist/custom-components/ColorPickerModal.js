import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ConfirmModal, SliderField } from '../components';
import { gamepadSliderClasses } from '../utils/static-classes';
export const ColorPickerModal = ({ closeModal, onConfirm = () => { }, title = 'Color Picker', defaultH = 0, defaultS = 100, defaultL = 50, defaultA = 1, }) => {
    const [H, setH] = useState(defaultH);
    const [S, setS] = useState(defaultS);
    const [L, setL] = useState(defaultL);
    const [A, setA] = useState(defaultA);
    const colorPickerCSSVars = {
        '--decky-color-picker-hvalue': `${H}`,
        '--decky-color-picker-svalue': `${S}%`,
        '--decky-color-picker-lvalue': `${L}%`,
        '--decky-color-picker-avalue': `${A}`,
    };
    return (_jsxs(ConfirmModal, { bAllowFullSize: true, onCancel: closeModal, onOK: () => {
            onConfirm(`hsla(${H}, ${S}%, ${L}%, ${A})`);
            closeModal();
        }, children: [_jsx("style", { children: `
        /* This removes the cyan track color that is behind the slider head */
        .ColorPicker_Container .${gamepadSliderClasses.SliderTrack} {
          --left-track-color: #0000;
          /* This is for compatibility with the "Colored Toggles" CSSLoader Theme*/
          --colored-toggles-main-color: #0000;
        }

        .ColorPicker_HSlider .${gamepadSliderClasses.SliderTrack} {
          background: linear-gradient(
            270deg,
            hsla(360, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(270, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(180, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(90, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(0, var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue))
          );
        }

        .ColorPicker_SSlider .${gamepadSliderClasses.SliderTrack} {
          background: linear-gradient(
            90deg,
            hsla(var(--decky-color-picker-hvalue), 0%, var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue)),
            hsla(var(--decky-color-picker-hvalue), 100%, var(--decky-color-picker-lvalue), var(--decky-color-picker-avalue))
          );
        }

        .ColorPicker_LSlider .${gamepadSliderClasses.SliderTrack} {
          background: linear-gradient(
            90deg,
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), 0%, var(--decky-color-picker-avalue)),
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), 50%, var(--decky-color-picker-avalue)),
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), 100%, var(--decky-color-picker-avalue))
          );
        }

        .ColorPicker_ASlider .${gamepadSliderClasses.SliderTrack} {
          background: linear-gradient(
            90deg,
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), 0),
            hsla(var(--decky-color-picker-hvalue), var(--decky-color-picker-svalue), var(--decky-color-picker-lvalue), 1)
          );
        }
        ` }), _jsxs("div", { className: "ColorPicker_ColorDisplayContainer", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1em',
                    marginTop: '-2.5em',
                }, children: [_jsx("div", { children: _jsx("span", { style: { fontSize: '1.5em' }, children: _jsx("b", { children: title }) }) }), _jsx("div", { style: {
                            backgroundColor: `hsla(${H}, ${S}%, ${L}%, ${A})`,
                            width: '40px',
                            height: '40px',
                        } })] }), _jsxs("div", { className: "ColorPicker_Container", style: colorPickerCSSVars, children: [_jsx("div", { className: "ColorPicker_HSlider", children: _jsx(SliderField, { showValue: true, editableValue: true, label: "Hue", value: H, min: 0, max: 360, onChange: setH }) }), _jsx("div", { className: "ColorPicker_SSlider", children: _jsx(SliderField, { showValue: true, editableValue: true, label: "Saturation", value: S, min: 0, max: 100, onChange: setS }) }), _jsx("div", { className: "ColorPicker_LSlider", children: _jsx(SliderField, { showValue: true, editableValue: true, label: "Lightness", value: L, min: 0, max: 100, onChange: setL }) }), _jsx("div", { className: "ColorPicker_ASlider", children: _jsx(SliderField, { showValue: true, editableValue: true, label: "Alpha", value: A, step: 0.1, min: 0, max: 1, onChange: setA }) })] })] }));
};
