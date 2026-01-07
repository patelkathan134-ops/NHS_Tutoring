import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, LogOut, Calendar, BookOpen, User, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { isExpired } from '../utils';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import SlotCreationForm from '../components/TutorDashboard/SlotCreationForm';

const SUBJECTS = [
    "Civics EOC", "Biology EOC", "Algebra 1 EOC", "Geometry EOC",
    "AP Pre-Calculus", "AP Calculus AB", "AICE Geography", "AP World History",
    "APUSH", "FAST ELA Grade 10", "AICE Spanish", "Eighth Grade Science Exam",
    "AICE Psychology", "AICE Marine Science"
];


const TutorDashboard = () => {
    const navigate = useNavigate();
    const tutorId = localStorage.getItem('currentTutor');

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [mySlots, setMySlots] = useState([]);

    const [bookedSlots, setBookedSlots] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [bio, setBio] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
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
                const querySnapshot = await getDocs(collection(db, 'tutors'));
                let allBookings = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const slots = data.slots || [];
                    const booked = slots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
                    const bookedWithTutor = booked.map(s => ({ ...s, tutorName: data.name }));
                    allBookings = [...allBookings, ...bookedWithTutor];
                });

                setBookedSlots(allBookings);

                const myDocRef = doc(db, 'tutors', tutorId);
                const myDocSnap = await getDoc(myDocRef);
                if (myDocSnap.exists()) {
                    const data = myDocSnap.data();
                    setSelectedSubjects(data.subjects || []);
                    // setAvailability(data.rawAvailability || {}); // Removed as part of new slot logic
                    setBio(data.bio || '');
                    setGradeLevel(data.gradeLevel || '');
                }

            } else {
                const docRef = doc(db, 'tutors', tutorId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedSubjects(data.subjects || []);
                    // setAvailability(data.rawAvailability || {}); // Removed as part of new slot logic
                    setBio(data.bio || '');
                    setGradeLevel(data.gradeLevel || '');

                    const allSlots = data.slots || [];
                    setMySlots(allSlots);
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



    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            await setDoc(doc(db, 'tutors', tutorId), {
                name: tutorId,
                subjects: selectedSubjects,
                bio: bio,
                gradeLevel: gradeLevel
            }, { merge: true });

            setMessage('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving:", error);
            setMessage('error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddTutor = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!newTutorName || !newTutorPassword) return;

        try {
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

            setMessage('tutor-added');
            setNewTutorName('');
            setNewTutorPassword('');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error creating tutor:", error);
            setMessage('error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentTutor');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 md:py-12">
            {/* Animated background orbs */}
            <div className="fixed top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float pointer-events-none"></div>
            <div className="fixed bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <GlassCard hover={false} className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                                Welcome back, <span className="gradient-text">{tutorId}</span>
                            </h1>
                            <p className="text-white/70 text-sm">Manage your schedule and help students succeed</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                            <LogOut size={18} />
                            Logout
                        </Button>
                    </GlassCard>
                </div>

                {/* Success/Error Messages */}
                {message && (
                    <div className={`mb-6 animate-slide-down ${message === 'success' || message === 'tutor-added'
                        ? 'glassmorphic border-green-400/50'
                        : 'glassmorphic border-red-400/50'
                        } p-4 rounded-xl border`}>
                        <p className={`text-center font-medium ${message === 'success' || message === 'tutor-added'
                            ? 'text-green-300'
                            : 'text-red-300'
                            }`}>
                            {message === 'success' && '✓ Settings saved successfully!'}
                            {message === 'tutor-added' && '✓ Tutor account created successfully!'}
                            {message === 'error' && '✗ An error occurred. Please try again.'}
                        </p>
                    </div>
                )}

                {/* Admin Panel */}
                {tutorId === "Rene Mahn" && (
                    <div className="mb-8 animate-slide-up">
                        <GlassCard hover={false} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <User size={24} />
                                Admin: Add New Tutor
                            </h3>
                            <form onSubmit={handleAddTutor} className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-white/90 text-sm font-medium mb-2">Full Name</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                                        placeholder="e.g. John Doe"
                                        value={newTutorName}
                                        onChange={e => setNewTutorName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-white/90 text-sm font-medium mb-2">Password</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                                        type="text"
                                        placeholder="Set password"
                                        value={newTutorPassword}
                                        onChange={e => setNewTutorPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="primary" className="md:mt-auto">
                                    Create Tutor
                                </Button>
                            </form>
                        </GlassCard>
                    </div>
                )}

                {/* Profile Section */}
                <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <GlassCard hover={false}>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <User size={24} />
                            My Profile
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-white/90 text-sm font-medium mb-2">Grade Level</label>
                                <select
                                    value={gradeLevel}
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                                >
                                    <option value="" className="text-gray-900">-- Select Grade --</option>
                                    <option value="9th Grade" className="text-gray-900">9th Grade</option>
                                    <option value="10th Grade" className="text-gray-900">10th Grade</option>
                                    <option value="11th Grade" className="text-gray-900">11th Grade</option>
                                    <option value="12th Grade" className="text-gray-900">12th Grade</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-white/90 text-sm font-medium mb-2">About Me (Bio)</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows="3"
                                    placeholder="Tell students about yourself, your favorite subjects, or why you love tutoring..."
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm resize-none"
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Subjects & Availability Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Subject Selection */}
                    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <GlassCard hover={false}>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <BookOpen size={24} />
                                My Subjects
                            </h3>
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {SUBJECTS.map(subject => (
                                    <label
                                        key={subject}
                                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedSubjects.includes(subject)
                                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-400/50'
                                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedSubjects.includes(subject)
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-white/10 border-2 border-white/20'
                                            }`}>
                                            {selectedSubjects.includes(subject) && <Check size={16} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedSubjects.includes(subject)}
                                            onChange={() => handleSubjectToggle(subject)}
                                            className="sr-only"
                                        />
                                        <span className="text-white font-medium">{subject}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Save Button moved here as it primarily relates to profile/subjects now */}
                            <div className="mt-8 pt-4 border-t border-white/10">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    variant="primary"
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span>Saving Profile...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            <span>Save Profile & Subjects</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* New Slot Creation & List */}
                    <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <GlassCard hover={false}>
                            <SlotCreationForm
                                tutorId={tutorId}
                                onSlotCreated={() => {
                                    fetchTutorData(); // Refresh list
                                    setMessage('success');
                                    setTimeout(() => setMessage(''), 3000);
                                }}
                            />
                        </GlassCard>

                        {/* Active Availability List */}
                        <div className="mt-8">
                            <GlassCard hover={false}>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar size={20} />
                                    My Active Availability
                                </h3>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {(!mySlots || mySlots.filter(s => s.status !== 'Booked').length === 0) && (
                                        <p className="text-white/50 text-center py-4">No active slots created.</p>
                                    )}
                                    {mySlots && mySlots.map((slot, idx) => {
                                        // Only show Available slots here (Booked ones are on the calendar)
                                        if (slot.status === 'Booked') return null;

                                        return (
                                            <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center group hover:bg-white/10 transition-colors">
                                                <div>
                                                    <div className="text-white font-semibold flex items-center gap-2">
                                                        {slot.slotType === 'specific_date' ? (
                                                            <span className="text-blue-300 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30">Specific Date</span>
                                                        ) : (
                                                            <span className="text-purple-300 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">Weekly</span>
                                                        )}
                                                        <span>{slot.startTime} - {slot.endTime}</span>
                                                    </div>
                                                    <div className="text-white/60 text-sm mt-1">
                                                        {slot.slotType === 'recurring' ? (
                                                            <>Every {slot.dayOfWeek}</>
                                                        ) : (
                                                            <>{new Date(slot.specificDate).toLocaleDateString()}</>
                                                        )}
                                                        <span className="mx-2">•</span>
                                                        {slot.subject}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm('Delete this slot?')) return;
                                                        try {
                                                            const newSlots = mySlots.filter(s => s !== slot);
                                                            await setDoc(doc(db, 'tutors', tutorId), { slots: newSlots }, { merge: true });
                                                            fetchTutorData(); // Refresh
                                                        } catch (e) {
                                                            console.error("Error deleting slot", e);
                                                        }
                                                    }}
                                                    className="text-white/20 hover:text-red-400 transition-colors p-2"
                                                    title="Delete Slot"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <GlassCard hover={false}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Calendar size={28} />
                                My Calendar
                            </h3>
                            <div className="flex items-center gap-4 glassmorphic px-4 py-2 rounded-xl">
                                <button
                                    onClick={() => {
                                        const newDate = new Date(currentDate);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setCurrentDate(newDate);
                                    }}
                                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-bold text-lg text-white min-w-[180px] text-center">
                                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => {
                                        const newDate = new Date(currentDate);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        setCurrentDate(newDate);
                                    }}
                                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center py-3 text-white/70 font-semibold text-sm">
                                    {day}
                                </div>
                            ))}

                            {/* Days */}
                            {(() => {
                                const year = currentDate.getFullYear();
                                const month = currentDate.getMonth();
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const firstDayOfMonth = new Date(year, month, 1).getDay();

                                const days = [];

                                // Empty slots
                                for (let i = 0; i < firstDayOfMonth; i++) {
                                    days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-white/5 rounded-xl" />);
                                }

                                // Actual days
                                for (let d = 1; d <= daysInMonth; d++) {
                                    const dateObj = new Date(year, month, d);
                                    const isToday = d === new Date().getDate() &&
                                        month === new Date().getMonth() &&
                                        year === new Date().getFullYear();

                                    const daySessions = bookedSlots.filter(s => {
                                        if (!s.expiryDate) return false;
                                        const sessionDate = new Date(s.expiryDate);
                                        return sessionDate.getDate() === d &&
                                            sessionDate.getMonth() === month &&
                                            sessionDate.getFullYear() === year;
                                    });

                                    days.push(
                                        <div
                                            key={d}
                                            className={`min-h-[100px] p-3 rounded-xl transition-all ${daySessions.length > 0
                                                ? 'bg-gradient-to-br from-green-500/20 to-teal-500/20 border-2 border-green-400/30'
                                                : 'bg-white/5 border-2 border-white/10'
                                                }`}
                                        >
                                            <div className="flex justify-end mb-2">
                                                <span className={`text-sm font-semibold ${isToday
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white w-7 h-7 flex items-center justify-center rounded-full'
                                                    : 'text-white/80'
                                                    }`}>
                                                    {d}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {daySessions.map(session => (
                                                    <div
                                                        key={session.id}
                                                        className="text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 text-white p-2 rounded-lg"
                                                    >
                                                        <div className="font-bold truncate">{session.studentName || 'Student'}</div>
                                                        <div className="text-white/70 truncate text-[10px]">{session.subject || 'No Subject'}</div>
                                                        <div className="text-white/60 text-[10px]">{session.time}</div>
                                                        {session.tutorName && <div className="text-white/50 text-[10px] italic">{session.tutorName}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return days;
                            })()}
                        </div>
                    </GlassCard>
                </div>

                {/* Footer */}
                <Footer />
            </div>

            {/* Custom scrollbar styles */}

        </div>
    );
};

export default TutorDashboard;
