import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

const ALLOWED_TUTORS = [
    "Rene Mahn", "Madison Baggarly", "Sneha Balu", "Jett Carotti-Goldberg",
    "Jeffrey Crabtree", "Juliana CRUZ", "Charlotte Dinerstein", "Isabella Duke",
    "Anthony Gonzalez", "Arianna Leo", "Avery Mankowski", "Eleni Margioukla",
    "Kayla Moreira", "Lou-Anne Paccaud", "Kathan Patel", "Daniel Rodriguez",
    "Hanna Schulz", "Leah Serrapica", "Colby Ta", "Shaun Ulstad",
    "Sabina Vagi", "Hailey Wood"
].map(name => ({ id: name, pass: 'nhs2025' }));

const TutorLogin = () => {
    const [tutorId, setTutorId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Check Firestore first for dynamic/updated tutors
            const tutorRef = doc(db, 'tutors', tutorId);
            const tutorSnap = await getDoc(tutorRef);

            if (tutorSnap.exists() && tutorSnap.data().password) {
                if (tutorSnap.data().password === password) {
                    localStorage.setItem('currentTutor', tutorId);
                    navigate('/tutor-dashboard');
                    return;
                } else {
                    setError('Invalid Password');
                    triggerShake();
                    setLoading(false);
                    return;
                }
            }

            // 2. Fallback to Legacy Hardcoded List
            const legacyTutor = ALLOWED_TUTORS.find(t => t.id === tutorId && t.pass === password);
            if (legacyTutor) {
                localStorage.setItem('currentTutor', tutorId);
                navigate('/tutor-dashboard');
                return;
            }

            setError('Invalid Tutor ID or Password');
            triggerShake();
        } catch (err) {
            console.error("Login error:", err);
            setError('Login failed. Please try again.');
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>

            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
            </button>

            {/* Login Card */}
            <div className="w-full max-w-md relative z-10 animate-scale-in">
                <GlassCard hover={false} className={shake ? 'animate-shake' : ''}>
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50"></div>
                            <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-glow-md">
                                <Lock className="text-white" size={32} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Tutor Access</h2>
                        <p className="text-white/70 text-sm">Sign in to manage your schedule</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 backdrop-blur-sm animate-slide-down">
                            <p className="text-red-200 text-sm font-medium text-center">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Tutor ID Input */}
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                                Tutor ID
                            </label>
                            <input
                                type="text"
                                value={tutorId}
                                onChange={(e) => setTutorId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                                placeholder="Enter your full name"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm pr-12"
                                    placeholder="Enter password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Helper Text */}
                    <p className="text-white/50 text-xs text-center mt-6">
                        Use your full name as shown on the roster
                    </p>
                </GlassCard>
            </div>

            {/* Footer */}
            <Footer />

        </div>
    );
};

export default TutorLogin;
