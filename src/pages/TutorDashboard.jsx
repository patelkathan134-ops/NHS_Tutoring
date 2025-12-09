import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, LogOut } from 'lucide-react';

const SUBJECTS = [
    "Civics EOC", "Biology EOC", "Algebra 1 EOC", "Geometry EOC",
    "AP Pre-Calculus", "AP Calculus AB", "AICE Geography", "AP World History",
    "APUSH", "FAST ELA Grade 10", "AICE Spanish", "Eighth Grade Science Exam",
    "AICE Psychology", "AICE Marine Science"
];

const WEEK_SCHEDULE = [
    { day: 'Monday', slots: ['7:00-7:45 AM', '2:45-3:45 PM', '3:45-4:45 PM'] },
    { day: 'Tuesday', slots: ['7:00-7:45 AM', '2:45-3:45 PM', '3:45-4:45 PM'] },
    { day: 'Wednesday', slots: ['2:45-3:45 PM', '3:45-4:45 PM'] },
    { day: 'Thursday', slots: ['7:00-7:45 AM', '2:45-3:45 PM', '3:45-4:45 PM'] },
];

const TutorDashboard = () => {
    const navigate = useNavigate();
    const tutorId = localStorage.getItem('currentTutor');

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [availability, setAvailability] = useState({}); // { "Monday-7:00-7:45 AM": true }
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!tutorId) {
            navigate('/tutor-login');
            return;
        }
        fetchTutorData();
    }, [tutorId, navigate]);

    const fetchTutorData = async () => {
        try {
            if (tutorId === "Rene Mahn") {
                // Master Admin Logic
                const querySnapshot = await getDocs(collection(db, 'tutors'));
                let allBookings = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const slots = data.slots || [];
                    const booked = slots.filter(s => s.status === 'Booked');
                    // Attach tutor name to the slot for display
                    const bookedWithTutor = booked.map(s => ({ ...s, tutorName: data.name }));
                    allBookings = [...allBookings, ...bookedWithTutor];
                });

                setBookedSlots(allBookings);

                // Rene might also want to set her own availability, so we still fetch her specific doc logic if needed.
                // But for now, let's assume she acts primarily as admin or just set both if her doc exists.
                const myDocRef = doc(db, 'tutors', tutorId);
                const myDocSnap = await getDoc(myDocRef);
                if (myDocSnap.exists()) {
                    const data = myDocSnap.data();
                    setSelectedSubjects(data.subjects || []);
                    setAvailability(data.rawAvailability || {});
                }

            } else {
                // Regular Tutor Logic
                const docRef = doc(db, 'tutors', tutorId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedSubjects(data.subjects || []);
                    setAvailability(data.rawAvailability || {});

                    // Filter for booked slots
                    const allSlots = data.slots || [];
                    const booked = allSlots.filter(s => s.status === 'Booked');
                    setBookedSlots(booked);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectToggle = (subject) => {
        setSelectedSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const handleSlotToggle = (day, slot) => {
        const key = `${day}-${slot}`;
        setAvailability(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        // Transform availability map into a structured array for easier querying later
        const slotsList = [];
        Object.entries(availability).forEach(([key, isAvailable]) => {
            if (isAvailable) {
                const [day, time] = key.split('-');
                slotsList.push({
                    day,
                    time,
                    status: 'Available', // Default status when tutor selects it
                    studentName: null,
                    id: key // unique ID for the slot
                });
            }
        });

        try {
            await setDoc(doc(db, 'tutors', tutorId), {
                name: tutorId,
                subjects: selectedSubjects,
                rawAvailability: availability, // Save raw map to restore UI state easily
                slots: slotsList
            }, { merge: true });
            setMessage('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving:", error);
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentTutor');
        navigate('/');
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-school-navy">Welcome, {tutorId}</h2>
                <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
                    <LogOut size={20} className="mr-2" /> Logout
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Subject Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-school-green border-b pb-2">My Subjects</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
                        {SUBJECTS.map(subject => (
                            <label key={subject} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSubjects.includes(subject)}
                                    onChange={() => handleSubjectToggle(subject)}
                                    className="w-5 h-5 text-school-green rounded border-gray-300 focus:ring-school-green"
                                />
                                <span className="text-gray-700">{subject}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Availability Scheduler */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-school-green border-b pb-2">Weekly Availability</h3>
                    <div className="space-y-6">
                        {WEEK_SCHEDULE.map(({ day, slots }) => (
                            <div key={day}>
                                <h4 className="font-medium text-gray-900 mb-2">{day}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {slots.map(slot => {
                                        const isSelected = availability[`${day}-${slot}`];
                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => handleSlotToggle(day, slot)}
                                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${isSelected
                                                    ? 'bg-school-navy text-white border-school-navy'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-school-navy'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center bg-school-green text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-md disabled:opacity-50"
                >
                    <Save size={20} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-school-navy border-b pb-2">Upcoming Booked Sessions</h3>
                {bookedSlots.length === 0 ? (
                    <p className="text-gray-500 italic">No sessions booked yet.</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookedSlots.map((slot) => (
                            <div key={slot.id} className="p-4 border-l-4 border-school-green bg-green-50 rounded shadow-sm">
                                {slot.tutorName && (
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                        Tutor: {slot.tutorName}
                                    </div>
                                )}
                                <div className="font-bold text-school-navy">{slot.day}</div>
                                <div className="text-sm text-gray-600 mb-2">{slot.time}</div>
                                <div className="text-sm font-semibold">Student: <span className="text-school-green">{slot.studentName}</span></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;
