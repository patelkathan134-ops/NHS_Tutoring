import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative z-10 mt-16 mb-8">
            <div className="glassmorphic rounded-2xl p-6 max-w-4xl mx-auto">
                <div className="text-center space-y-3">
                    {/* School Info */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-1">
                            Lakewood Ranch Prep • National Honor Society
                        </h3>
                        <p className="text-white/70 text-sm">
                            Empowering students through peer tutoring
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/20 max-w-xs mx-auto"></div>

                    {/* Made with love */}
                    <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                        <span>Made with</span>
                        <Heart size={14} className="text-pink-400 fill-pink-400 animate-pulse" />
                        <span>for LWR Students</span>
                    </div>

                    {/* Year */}
                    <p className="text-white/50 text-xs">
                        © {new Date().getFullYear()} Lakewood Ranch Prep NHS Tutoring
                    </p>
                </div>
            </div>
        </footer>
    );
}
