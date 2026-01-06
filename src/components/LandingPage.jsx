import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-5xl font-bold text-school-green mb-4">
                    Lakewood Ranch Prep
                </h1>
                <h2 className="text-3xl font-semibold text-school-navy">
                    NHS Tutoring Club
                </h2>
                <p className="mt-4 text-gray-600 max-w-lg mx-auto">
                    Connecting students with peer tutors for academic success.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                <button
                    onClick={() => navigate('/tutor-login')}
                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-school-green text-left"
                >
                    <div className="absolute inset-0 bg-school-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-2xl font-bold text-school-green mb-2">I am a Tutor</h3>
                    <p className="text-gray-500">Log in to manage your schedule and specialties.</p>
                </button>

                <button
                    onClick={() => navigate('/student')}
                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-school-navy text-left"
                >
                    <div className="absolute inset-0 bg-school-navy/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-2xl font-bold text-school-navy mb-2">I am a Student</h3>
                    <p className="text-gray-500">Find a tutor and book a session now.</p>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
