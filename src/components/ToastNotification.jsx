import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastNotification = ({
    message,
    type = 'info',
    duration = 4000,
    onClose
}) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        // Progress bar animation
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 50));
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 50);

        // Auto dismiss
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration, handleClose]);

    const variants = {
        success: {
            icon: CheckCircle,
            gradient: 'from-green-500 to-emerald-500',
            bg: 'bg-green-500/20',
            border: 'border-green-500/50',
            iconColor: 'text-green-400'
        },
        error: {
            icon: XCircle,
            gradient: 'from-red-500 to-rose-500',
            bg: 'bg-red-500/20',
            border: 'border-red-500/50',
            iconColor: 'text-red-400'
        },
        info: {
            icon: Info,
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/50',
            iconColor: 'text-blue-400'
        },
        warning: {
            icon: AlertTriangle,
            gradient: 'from-yellow-500 to-orange-500',
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/50',
            iconColor: 'text-yellow-400'
        }
    };

    const config = variants[type];
    const Icon = config.icon;

    return (
        <div
            className={`
                fixed top-4 right-4 z-50 
                glassmorphic rounded-xl overflow-hidden
                border ${config.border}
                min-w-[320px] max-w-md
                shadow-glow-lg
                transition-all duration-300
                ${isExiting
                    ? 'opacity-0 translate-x-full'
                    : 'opacity-100 translate-x-0 animate-slide-down'
                }
            `}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                        <Icon size={20} className="text-white" />
                    </div>
                </div>

                {/* Message */}
                <div className="flex-1 pt-1">
                    <p className="text-white text-sm font-medium">
                        {message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/10">
                <div
                    className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-50 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        transform: `translateY(${index * 10}px)`,
                        zIndex: 50 - index
                    }}
                >
                    <ToastNotification
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastNotification;
