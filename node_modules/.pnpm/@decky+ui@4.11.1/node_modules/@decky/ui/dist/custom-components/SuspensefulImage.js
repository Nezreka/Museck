import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useState } from 'react';
import { Spinner } from '../components';
export const SuspensefulImage = (props) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        setLoading(true);
        setError(false);
        const img = new Image();
        img.src = props.src || '';
        img.addEventListener('load', () => {
            setLoading(false);
        });
        img.addEventListener('error', () => {
            setError(true);
        });
    }, [props.src]);
    return loading ? (_jsx("div", { style: {
            width: props.suspenseWidth || props.style?.width,
            height: props.suspenseHeight || props.style?.height,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }, children: error ? 'Missing image' : _jsx(Spinner, { style: { height: '48px' } }) })) : (_jsx("img", { ...props }));
};
