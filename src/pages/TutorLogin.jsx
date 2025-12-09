import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

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
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const tutor = ALLOWED_TUTORS.find(t => t.id === tutorId && t.pass === password);

        if (tutor) {
            localStorage.setItem('currentTutor', tutorId);
            navigate('/tutor-dashboard');
        } else {
            setError('Invalid Tutor ID or Password');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-school-green p-3 rounded-full mb-3">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-school-navy">Tutor Access</h2>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm font-medium border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tutor ID</label>
                        <input
                            type="text"
                            value={tutorId}
                            onChange={(e) => setTutorId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-school-green focus:border-transparent outline-none"
                            placeholder="Enter your ID"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-school-green focus:border-transparent outline-none"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-school-green text-white py-2 rounded-md font-semibold hover:bg-green-800 transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TutorLogin;
