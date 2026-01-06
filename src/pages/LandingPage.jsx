import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ParticleField from '../components/ParticleField';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Particle Field Background */}
            <ParticleField density={40} />

            {/* Animated background orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

            {/* Hero Section */}
            <div className={`text-center max-w-4xl mb-16 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                {/* Logo with glow effect */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <img
                        src={logo}
                        alt="School Logo"
                        className="h-32 md:h-40 relative z-10 drop-shadow-2xl"
                    />
                </div>

                {/* Title with gradient text */}
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                    <span className="gradient-text">NHS Tutoring</span>
                    <br />
                    <span className="text-white drop-shadow-lg">Portal</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/90 font-light mb-4">
                    Connecting students with exceptional peer tutors
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <div className="glassmorphic px-4 py-2 rounded-full text-white/90 text-sm font-medium flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-300" />
                        15+ Subjects
                    </div>
                    <div className="glassmorphic px-4 py-2 rounded-full text-white/90 text-sm font-medium flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-300" />
                        Free Sessions
                    </div>
                    <div className="glassmorphic px-4 py-2 rounded-full text-white/90 text-sm font-medium flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-300" />
                        Flexible Schedule
                    </div>
                </div>
            </div>

            {/* Portal Selection Cards */}
            <div className={`grid md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                {/* Tutor Portal Card */}
                <GlassCard
                    onClick={() => navigate('/tutor-login')}
                    className="group relative overflow-hidden"
                >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-8">
                        {/* Icon with glow */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-glow-md">
                                <GraduationCap size={48} className="text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-white mb-3">
                            I'm a Tutor
                        </h2>

                        {/* Description */}
                        <p className="text-white/80 text-lg mb-6">
                            Manage your schedule and help fellow students succeed
                        </p>

                        {/* Action hint */}
                        <div className="text-sm text-white/60 font-medium group-hover:text-white/90 transition-colors">
                            Click to sign in →
                        </div>
                    </div>

                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-300"></div>
                </GlassCard>

                {/* Student Portal Card */}
                <GlassCard
                    onClick={() => navigate('/student')}
                    className="group relative overflow-hidden"
                >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex flex-col items-center text-center p-8">
                        {/* Icon with glow */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-teal-500 p-6 rounded-2xl shadow-glow-md">
                                <BookOpen size={48} className="text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-white mb-3">
                            I'm a Student
                        </h2>

                        {/* Description */}
                        <p className="text-white/80 text-lg mb-6">
                            Find expert tutors and book your next study session
                        </p>

                        {/* Action hint */}
                        <div className="text-sm text-white/60 font-medium group-hover:text-white/90 transition-colors">
                            Click to browse tutors →
                        </div>
                    </div>

                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-300"></div>
                </GlassCard>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
