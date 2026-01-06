import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
        const id = toastId++;
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, duration + 300); // Extra time for exit animation
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        success: (message, duration) => showToast({ message, type: 'success', duration }),
        error: (message, duration) => showToast({ message, type: 'error', duration }),
        info: (message, duration) => showToast({ message, type: 'info', duration }),
        warning: (message, duration) => showToast({ message, type: 'warning', duration }),
    };
};
