import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, LogOut } from 'lucide-react';
import { isExpired } from '../utils';

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // New Profile State
    const [bio, setBio] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');

    // Admin State (Rene Mahn only)
    const [newTutorName, setNewTutorName] = useState('');
    const [newTutorPassword, setNewTutorPassword] = useState('');

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
                    const booked = slots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
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
                    setBio(data.bio || '');
                    setGradeLevel(data.gradeLevel || '');
                }

            } else {
                // Regular Tutor Logic
                const docRef = doc(db, 'tutors', tutorId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedSubjects(data.subjects || []);
                    setAvailability(data.rawAvailability || {});
                    setBio(data.bio || '');
                    setGradeLevel(data.gradeLevel || '');

                    // Filter for booked slots (that are NOT expired)
                    const allSlots = data.slots || [];
                    const booked = allSlots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
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
                const firstDashIndex = key.indexOf('-');
                const day = key.substring(0, firstDashIndex);
                const time = key.substring(firstDashIndex + 1);
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
                bio: bio,
                gradeLevel: gradeLevel,
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

    const handleAddTutor = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!newTutorName || !newTutorPassword) return;

        try {
            // Check if tutor already exists (optional but good)
            const newTutorRef = doc(db, 'tutors', newTutorName);
            const snap = await getDoc(newTutorRef);

            if (snap.exists()) {
                alert('A tutor with this name already exists.');
                return;
            }

            await setDoc(newTutorRef, {
                name: newTutorName,
                password: newTutorPassword,
                subjects: [],
                slots: [],
                bio: '',
                gradeLevel: '',
                rawAvailability: {}
            });

            setMessage(`Success! Created tutor account for ${newTutorName}`);
            setNewTutorName('');
            setNewTutorPassword('');
        } catch (error) {
            console.error("Error creating tutor:", error);
            setMessage('Failed to create tutor.');
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
                <div className={`p-4 mb-6 rounded-md ${message.includes('success') || message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            {/* Admin Panel for Rene Mahn */}
            {tutorId === "Rene Mahn" && (
                <div className="bg-school-navy text-white p-6 rounded-xl shadow-lg mb-8 border border-blue-900">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        Admin: Add New Tutor
                    </h3>
                    <form onSubmit={handleAddTutor} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Full Name</label>
                            <input
                                className="w-full text-gray-900 p-2 rounded focus:ring-2 focus:ring-school-green outline-none"
                                placeholder="e.g. John Doe"
                                value={newTutorName}
                                onChange={e => setNewTutorName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">Password</label>
                            <input
                                className="w-full text-gray-900 p-2 rounded focus:ring-2 focus:ring-school-green outline-none"
                                type="text"
                                placeholder="Set a unique password"
                                value={newTutorPassword}
                                onChange={e => setNewTutorPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-school-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition-colors shadow-md">
                            Create Tutor
                        </button>
                    </form>
                </div>
            )}

            {/* Profile Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-school-green border-b pb-2">My Profile</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                        <select
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-school-green focus:border-school-green"
                        >
                            <option value="">-- Select Grade --</option>
                            <option value="9th Grade">9th Grade</option>
                            <option value="10th Grade">10th Grade</option>
                            <option value="11th Grade">11th Grade</option>
                            <option value="12th Grade">12th Grade</option>
                        </select>
                    </div>
                    <div>
                        {/* Spacer or additional fields if needed */}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">About Me (Bio)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="3"
                            placeholder="Tell students about yourself, your favorite subjects, or why you love tutoring..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-school-green focus:border-school-green"
                        />
                    </div>
                </div>
            </div>

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
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-semibold text-school-navy">My Calendar</h3>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(newDate.getMonth() - 1);
                                setCurrentDate(newDate);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            ←
                        </button>
                        <span className="font-bold text-lg text-gray-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(newDate.getMonth() + 1);
                                setCurrentDate(newDate);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            →
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                    {/* Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                            {day}
                        </div>
                    ))}

                    {/* Days */}
                    {(() => {
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

                        const days = [];

                        // Empty slots for prev month
                        for (let i = 0; i < firstDayOfMonth; i++) {
                            days.push(<div key={`empty-${i}`} className="bg-white min-h-[100px]" />);
                        }

                        // Actual days
                        for (let d = 1; d <= daysInMonth; d++) {
                            const dateObj = new Date(year, month, d);
                            // Normalize to YYYY-MM-DD for comparison (local time)
                            const dateStr = dateObj.toLocaleDateString();

                            // Find sessions for this day
                            const daySessions = bookedSlots.filter(s => {
                                if (!s.expiryDate) return false;
                                const sessionDate = new Date(s.expiryDate);
                                return sessionDate.getDate() === d &&
                                    sessionDate.getMonth() === month &&
                                    sessionDate.getFullYear() === year;
                            });

                            days.push(
                                <div key={d} className={`bg-white min-h-[100px] p-2 border-t border-l border-gray-100 ${daySessions.length > 0 ? 'bg-green-50/30' : ''}`}>
                                    <div className="text-right">
                                        <span className={`text-sm font-medium ${d === new Date().getDate() &&
                                            month === new Date().getMonth() &&
                                            year === new Date().getFullYear()
                                            ? 'bg-school-navy text-white w-6 h-6 inline-flex items-center justify-center rounded-full'
                                            : 'text-gray-700'
                                            }`}>{d}</span>
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {daySessions.map(session => (
                                            <div key={session.id} className="text-xs bg-school-green/10 text-school-green p-1.5 rounded border border-school-green/20 flex flex-col gap-0.5 text-left" title={`Student: ${session.studentName || 'Unknown'}\nSubject: ${session.subject || 'N/A'}\nTime: ${session.time}`}>
                                                <div className="font-bold text-school-navy truncate w-full">{session.studentName || 'Student'}</div>
                                                <div className="truncate w-full text-gray-700">{session.subject || <span className="text-red-400 italic">No Subject</span>}</div>
                                                <div className="truncate w-full text-gray-500 text-[10px]">{session.time}</div>
                                                {session.tutorName && <div className="text-[10px] italic text-gray-400 truncate w-full">{session.tutorName}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return days;
                    })()}
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;
