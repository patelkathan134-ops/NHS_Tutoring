
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { User, BookOpen, Calendar, Plus, Check } from 'lucide-react';
import GlassCard from '../GlassCard';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import { CATEGORIES } from '../../data/SubjectCategories';
import { isExpired } from '../../utils/dateUtils';

// Helper for schedule view
const ScheduleView = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, [selectedDate]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'tutors'));
            const daySchedule = [];

            // Get day of week for the selected date
            const dateObj = new Date(selectedDate);
            // Fix timezone issue by treating string as local date
            const localDate = new Date(selectedDate + 'T00:00:00');
            const dayName = localDate.toLocaleDateString('en-US', { weekday: 'long' });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const slots = data.slots || [];

                slots.forEach(slot => {
                    // Check if slot matches selected date
                    let isMatch = false;
                    if (slot.slotType === 'specific_date' && slot.specificDate === selectedDate) {
                        isMatch = true;
                    } else if (slot.slotType !== 'specific_date' && slot.day === dayName) {
                        isMatch = true;
                    }

                    if (isMatch) {
                        daySchedule.push({
                            tutorName: data.name,
                            ...slot
                        });
                    }
                });
            });

            // Sort by time
            daySchedule.sort((a, b) => {
                // simple sort by time string for now
                return a.time.localeCompare(b.time);
            });

            setSchedule(daySchedule);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            <h4 className="text-lg font-bold text-white mb-4">Daily Roster</h4>
            <div className="flex gap-4 mb-6">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button onClick={fetchSchedule} size="sm" variant="outline">Refresh</Button>
            </div>

            {loading ? <LoadingSpinner size="sm" /> : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {schedule.length === 0 ? (
                        <p className="text-white/50 text-sm">No tutors scheduled for this date.</p>
                    ) : (
                        schedule.map((session, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center">
                                <div>
                                    <span className="text-purple-400 font-bold block">{session.time}</span>
                                    <span className="text-white font-medium">{session.tutorName}</span>
                                    {session.status === 'Booked' && (
                                        <div className="text-sm text-white/60 mt-1">
                                            Student: <span className="text-green-400">{session.studentName}</span> • {session.subject?.name || 'Unknown Subject'}
                                        </div>
                                    )}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${session.status === 'Booked'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-white/10 text-white/60 border border-white/20'
                                    }`}>
                                    {session.status}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const AdminPanel = ({ onTutorAdded }) => {
    // Add Tutor State
    const [newTutorName, setNewTutorName] = useState('');
    const [newTutorPassword, setNewTutorPassword] = useState('');
    const [newTutorIsAdmin, setNewTutorIsAdmin] = useState(false);

    // Add Subject State
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCategory, setNewSubjectCategory] = useState('core');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddTutor = async (e) => {
        e.preventDefault();
        if (!newTutorName || !newTutorPassword) return;
        setLoading(true);

        try {
            const newTutorRef = doc(db, 'tutors', newTutorName);
            const snap = await getDoc(newTutorRef);

            if (snap.exists()) {
                setMessage('error:Tutor already exists');
                return;
            }

            await setDoc(newTutorRef, {
                name: newTutorName,
                password: newTutorPassword,
                subjects: [],
                slots: [],
                bio: '',
                gradeLevel: '',
                isAdmin: newTutorIsAdmin
            });

            setMessage('success:Tutor created successfully');
            setNewTutorName('');
            setNewTutorPassword('');
            setNewTutorIsAdmin(false);
            if (onTutorAdded) onTutorAdded();
        } catch (error) {
            console.error(error);
            setMessage('error:Failed to create tutor');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName) return;
        setLoading(true);

        try {
            // Generate slug ID
            const id = newSubjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            await setDoc(doc(db, 'subjects', id), {
                id,
                name: newSubjectName,
                category: newSubjectCategory,
                icon: 'book-open', // Default
                badge: null,
                tutorCount: 0
            });

            setMessage('success:Subject added successfully');
            setNewSubjectName('');
        } catch (error) {
            console.error(error);
            setMessage('error:Failed to add subject');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="animate-slide-up space-y-8">
            {/* Feedback Message */}
            {message && (
                <div className={`p-4 rounded-xl border ${message.startsWith('success') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    {message.split(':')[1]}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Add Tutor */}
                <GlassCard hover={false} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 h-full">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <User size={24} /> Add New Tutor
                    </h3>
                    <form onSubmit={handleAddTutor} className="space-y-4">
                        <div>
                            <label className="text-white/80 text-sm mb-1 block">Full Name</label>
                            <input
                                value={newTutorName}
                                onChange={e => setNewTutorName(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-white/80 text-sm mb-1 block">Password</label>
                            <input
                                value={newTutorPassword}
                                onChange={e => setNewTutorPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Set password"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newTutorIsAdmin}
                                    onChange={e => setNewTutorIsAdmin(e.target.checked)}
                                    className="rounded bg-white/10 border-white/20 checked:bg-purple-500"
                                />
                                <span className="text-white/90 text-sm">Make Admin</span>
                            </label>
                            <Button type="submit" disabled={loading} size="sm">
                                {loading ? <LoadingSpinner size="sm" /> : 'Create Tutor'}
                            </Button>
                        </div>
                    </form>
                </GlassCard>

                {/* Add Subject */}
                <GlassCard hover={false} className="bg-gradient-to-br from-blue-600/20 to-teal-600/20 h-full">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen size={24} /> Add New Subject
                    </h3>
                    <form onSubmit={handleAddSubject} className="space-y-4">
                        <div>
                            <label className="text-white/80 text-sm mb-1 block">Subject Name</label>
                            <input
                                value={newSubjectName}
                                onChange={e => setNewSubjectName(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. AP Chemistry"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-white/80 text-sm mb-1 block">Category</label>
                            <select
                                value={newSubjectCategory}
                                onChange={e => setNewSubjectCategory(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id} className="text-black">
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button type="submit" disabled={loading} size="sm" variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-400/20">
                                {loading ? <LoadingSpinner size="sm" /> : 'Add Subject'}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>

            {/* Daily Schedule View */}
            <GlassCard hover={false} className="bg-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar size={24} />
                    Tutoring Schedule
                </h3>
                <ScheduleView />
            </GlassCard>
        </div>
    );
};

export default AdminPanel;
