import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, LogOut, Calendar, BookOpen, User, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { isExpired } from '../utils/dateUtils';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { useSubjects } from '../hooks/useSubjects';
import AdminPanel from '../components/TutorDashboard/AdminPanel';
import SlotCreationForm from '../components/TutorDashboard/SlotCreationForm';
import DashboardCalendar from '../components/TutorDashboard/DashboardCalendar';




const TutorDashboard = () => {
    const navigate = useNavigate();
    const tutorId = localStorage.getItem('currentTutor');

    const { subjects, loading: subjectsLoading } = useSubjects();
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [mySlots, setMySlots] = useState([]);

    const [bookedSlots, setBookedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [bio, setBio] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!tutorId) {
            navigate('/tutor-login');
            return;
        }
        fetchTutorData();
    }, [tutorId, navigate]);

    const fetchTutorData = async () => {
        try {
            // First, fetch current tutor's data to check if admin
            const myDocRef = doc(db, 'tutors', tutorId);
            const myDocSnap = await getDoc(myDocRef);

            let currentIsAdmin = false;
            if (myDocSnap.exists()) {
                const data = myDocSnap.data();
                // Auto-migrate: Rene Mahn is always admin (for backwards compatibility)
                currentIsAdmin = data.isAdmin === true || tutorId === "Rene Mahn";
                setIsAdmin(currentIsAdmin);
                setSelectedSubjects(data.subjects || []);
                setBio(data.bio || '');
                setGradeLevel(data.gradeLevel || '');

                // If Rene Mahn but not marked as admin in DB, update it
                if (tutorId === "Rene Mahn" && !data.isAdmin) {
                    await setDoc(myDocRef, { isAdmin: true }, { merge: true });
                }
            }

            if (currentIsAdmin) {
                // Admin: fetch all bookings across all tutors
                const querySnapshot = await getDocs(collection(db, 'tutors'));
                let allBookings = [];

                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const slots = data.slots || [];
                    const booked = slots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
                    const bookedWithTutor = booked.map(s => ({ ...s, tutorName: data.name }));
                    allBookings = [...allBookings, ...bookedWithTutor];
                });

                setBookedSlots(allBookings);

            } else {
                // Non-admin: just fetch own data
                if (myDocSnap.exists()) {
                    const data = myDocSnap.data();
                    const allSlots = data.slots || [];
                    setMySlots(allSlots);
                    const booked = allSlots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
                    setBookedSlots(booked);
                    const available = allSlots.filter(s => s.status === 'Available' && !isExpired(s.expiryDate));
                    setAvailableSlots(available);
                }
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error);
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



    const handleLogout = () => {
        localStorage.removeItem('currentTutor');
        navigate('/');
    };

    if (loading || subjectsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-400">
                Error loading data: {error.message}
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
                            {message === 'error' && '✗ An error occurred. Please try again.'}
                        </p>
                    </div>
                )}

                {/* Admin Panel */}
                {isAdmin && (
                    <div className="mb-8">
                        <AdminPanel onTutorAdded={() => {
                            // Optional: refresh any list if needed
                        }} />
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
                                {subjects.map(subject => (
                                    <label
                                        key={subject.id}
                                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedSubjects.includes(subject.name)
                                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-400/50'
                                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedSubjects.includes(subject.name)
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-white/10 border-2 border-white/20'
                                            }`}>
                                            {selectedSubjects.includes(subject.name) && <Check size={16} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedSubjects.includes(subject.name)}
                                            onChange={() => handleSubjectToggle(subject.name)}
                                            className="sr-only"
                                        />
                                        <span className="text-white font-medium">{subject.name}</span>
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
                                selectedSubjects={selectedSubjects}
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
                                                            <>{slot.specificDate ? new Date(slot.specificDate).toLocaleDateString() : 'Specific Date'}</>
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
                        </div>

                        {/* SAFE Calendar Grid Component */}
                        <div className="mt-8">
                            <DashboardCalendar bookedSlots={bookedSlots} availableSlots={availableSlots} />
                        </div>
                    </GlassCard>
                </div>

                {/* Footer */}
                <Footer />
            </div >

            {/* Custom scrollbar styles */}

        </div >
    );
};

export default TutorDashboard;
