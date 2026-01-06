import React from 'react';

const SkeletonLoader = ({
    variant = 'card',
    count = 1,
    className = ''
}) => {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    const SkeletonCard = () => (
        <div className={`glassmorphic rounded-2xl p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 shimmer" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-3/4 shimmer" />
                        <div className="h-3 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-1/2 shimmer" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-white/20 to-white/5 rounded-lg shimmer" />
                    <div className="h-3 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-5/6 shimmer" />
                    <div className="h-3 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-4/6 shimmer" />
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gradient-to-r from-white/20 to-white/5 rounded-full shimmer" />
                    <div className="h-6 w-20 bg-gradient-to-r from-white/20 to-white/5 rounded-full shimmer" />
                    <div className="h-6 w-16 bg-gradient-to-r from-white/20 to-white/5 rounded-full shimmer" />
                </div>
            </div>
        </div>
    );

    const SkeletonText = () => (
        <div className={`space-y-2 ${className}`}>
            <div className="h-4 bg-gradient-to-r from-white/20 to-white/5 rounded-lg shimmer" />
            <div className="h-4 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-5/6 shimmer" />
            <div className="h-4 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-4/6 shimmer" />
        </div>
    );

    const SkeletonAvatar = () => (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 shimmer" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-32 shimmer" />
                <div className="h-2 bg-gradient-to-r from-white/20 to-white/5 rounded-lg w-24 shimmer" />
            </div>
        </div>
    );

    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return <SkeletonCard />;
            case 'text':
                return <SkeletonText />;
            case 'avatar':
                return <SkeletonAvatar />;
            default:
                return <SkeletonCard />;
        }
    };

    return (
        <>
            {skeletons.map((i) => (
                <div key={i} className="mb-4">
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
};

export default SkeletonLoader;
