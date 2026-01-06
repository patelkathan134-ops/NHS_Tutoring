import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SUBJECTS, TIME_SLOTS } from '../constants';

const TutorDashboard = () => {
    const navigate = useNavigate();
    const tutorId = localStorage.getItem('currentTutorId');

    const [loading, setLoading] = useState(true);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState({}); // Key: "Day-Time", Value: Slot Object
    const [savedMessage, setSavedMessage] = useState('');

    useEffect(() => {
        if (!tutorId) {
            navigate('/tutor-login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'tutors', tutorId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSpecialties(data.specialties || []);

                    // Convert array back to object for easy lookup
                    const slotsMap = {};
                    if (data.availability) {
                        data.availability.forEach(slot => {
                            const key = `${slot.day}-${slot.time}`;
                            slotsMap[key] = slot;
                        });
                    }
                    setSelectedSlots(slotsMap);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [tutorId, navigate]);

    const toggleSpecialty = (subject) => {
        setSpecialties(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const toggleSlot = (day, time) => {
        const key = `${day}-${time}`;
        setSelectedSlots(prev => {
            const newSlots = { ...prev };
            if (newSlots[key]) {
                // If it's booked, maybe we shouldn't just delete it? 
                // For prototype, we'll just allow formatting it (removing availability).
                delete newSlots[key];
            } else {
                newSlots[key] = {
                    id: key,
                    day,
                    time,
                    status: 'Available',
                    studentName: null
                };
            }
            return newSlots;
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const availabilityArray = Object.values(selectedSlots);
            await setDoc(doc(db, 'tutors', tutorId), {
                name: tutorId, // Using ID as name for prototype
                specialties,
                availability: availabilityArray
            }, { merge: true });

            setSavedMessage('Profile updated successfully!');
            setTimeout(() => setSavedMessage(''), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            setSavedMessage('Error saving profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentTutorId');
        navigate('/');
    };

    if (loading && !tutorId) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <nav className="bg-school-green text-white p-4 fixed top-0 left-0 right-0 z-10 shadow-md flex justify-between items-center px-8">
                <span className="font-bold text-lg">Tutor Portal: {tutorId}</span>
                <button onClick={handleLogout} className="text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20">Check Out</button>
            </nav>

            <div className="max-w-4xl mx-auto mt-20 space-y-8">

                {/* Subjects Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-school-navy mb-4">Subject Specialties</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SUBJECTS.map(subject => (
                            <label key={subject} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={specialties.includes(subject)}
                                    onChange={() => toggleSpecialty(subject)}
                                    className="w-5 h-5 text-school-green rounded focus:ring-school-green"
                                />
                                <span className="text-gray-700 text-sm font-medium">{subject}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-school-navy mb-4">Weekly Availability</h2>
                    <p className="text-sm text-gray-500 mb-6">Select the times you are available to tutor. Booked slots will show the student's name.</p>

                    <div className="space-y-6">
                        {Object.entries(TIME_SLOTS).map(([day, times]) => (
                            <div key={day} className="border-b border-gray-100 pb-4 last:border-0">
                                <h3 className="font-semibold text-gray-800 mb-3">{day}</h3>
                                <div className="flex flex-wrap gap-3">
                                    {times.map(time => {
                                        const key = `${day}-${time}`;
                                        const slot = selectedSlots[key];
                                        const isSelected = !!slot;
                                        const isBooked = slot?.status === 'Booked';

                                        return (
                                            <button
                                                key={time}
                                                onClick={() => toggleSlot(day, time)}
                                                className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isBooked
                                                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-500 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-school-green text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }
                        `}
                                                title={isBooked ? `Booked by ${slot.studentName}` : ''}
                                            >
                                                {time}
                                                {isBooked && <div className="text-xs mt-1 block font-bold">Booked</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <span className="text-green-600 font-medium">{savedMessage}</span>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-school-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;
