import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center max-w-2xl mb-8">
                <h2 className="text-4xl font-extrabold text-school-navy mb-4">Welcome to the NHS Tutoring Portal</h2>
                <p className="text-lg text-gray-600">Connecting students with peer tutors for academic success.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                <button
                    onClick={() => navigate('/tutor-login')}
                    className="group relative flex flex-col items-center justify-center p-12 bg-white border-2 border-school-green rounded-2xl shadow-sm hover:shadow-xl hover:bg-school-green hover:text-white transition-all duration-300"
                >
                    <GraduationCap size={64} className="mb-4 text-school-green group-hover:text-white transition-colors" />
                    <span className="text-2xl font-bold">I am a Tutor</span>
                    <span className="mt-2 text-sm text-gray-500 group-hover:text-green-100">Log in to manage your schedule</span>
                </button>

                <button
                    onClick={() => navigate('/student-portal')}
                    className="group relative flex flex-col items-center justify-center p-12 bg-white border-2 border-school-navy rounded-2xl shadow-sm hover:shadow-xl hover:bg-school-navy hover:text-white transition-all duration-300"
                >
                    <BookOpen size={64} className="mb-4 text-school-navy group-hover:text-white transition-colors" />
                    <span className="text-2xl font-bold">I am a Student</span>
                    <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-100">Find a tutor and book a session</span>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
