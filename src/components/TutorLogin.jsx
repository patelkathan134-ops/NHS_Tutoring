import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TUTOR_CREDENTIALS } from '../constants';

const TutorLogin = () => {
    const [tutorId, setTutorId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (TUTOR_CREDENTIALS[tutorId] === password) {
            // Successful login
            localStorage.setItem('currentTutorId', tutorId);
            navigate('/tutor-dashboard');
        } else {
            setError('Invalid ID or Password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-school-green/10 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-school-green mb-6 text-center">Tutor Login</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green focus:border-transparent outline-none"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green focus:border-transparent outline-none"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-school-green text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                    >
                        Access Portal
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-school-green">
                        &larr; Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorLogin;
