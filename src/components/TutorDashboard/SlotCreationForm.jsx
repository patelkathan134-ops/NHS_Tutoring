import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { getNextDayOfWeek, calculateExpiryDate, convertTo24Hour } from '../../utils/dateUtils';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import { Calendar, Clock, BookOpen, Repeat, MapPin } from 'lucide-react';

export default function SlotCreationForm({ tutorId, onSlotCreated }) {
    const [slotType, setSlotType] = useState('recurring');
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [specificDate, setSpecificDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let nextOccurrence, expiryDate;
            const now = new Date();

            if (slotType === 'specific_date') {
                // Specific date logic
                if (!specificDate) {
                    alert('Please select a date');
                    setLoading(false);
                    return;
                }

                // Create datetime from date + time
                const [year, month, day] = specificDate.split('-');
                nextOccurrence = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const [startHours, startMinutes] = convertTo24Hour(startTime);
                nextOccurrence.setHours(startHours, startMinutes, 0, 0);

                // Check if in future
                if (nextOccurrence <= now) {
                    alert('Please select a future date and time');
                    setLoading(false);
                    return;
                }

                expiryDate = calculateExpiryDate(nextOccurrence, endTime);

            } else {
                // Recurring weekly logic
                nextOccurrence = getNextDayOfWeek(dayOfWeek, startTime);
                expiryDate = calculateExpiryDate(nextOccurrence, endTime);
            }

            // Create new slot object
            const newSlot = {
                slotId: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                slotType,
                dayOfWeek: slotType === 'recurring' ? dayOfWeek : null,
                specificDate: slotType === 'specific_date' ? specificDate : null,
                startTime,
                endTime,
                subject,
                status: 'Available',
                nextOccurrence: nextOccurrence.toISOString(),
                expiryDate: expiryDate.toISOString(),
                maxCapacity: 1,
                bookedBy: [],
                studentName: null,
                studentEmail: null,
                createdAt: now.toISOString()
            };

            // Update Firestore
            const tutorRef = doc(db, 'tutors', tutorId);
            await updateDoc(tutorRef, {
                slots: arrayUnion(newSlot)
            });

            // Reset form
            setStartTime('');
            setEndTime('');
            setSubject('');
            setSpecificDate('');

            if (onSlotCreated) onSlotCreated();

        } catch (error) {
            console.error('Error creating slot:', error);
            alert('Error creating slot. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={24} />
                Add Availability
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Slot Type Selection */}
                <div>
                    <label className="block text-white/90 text-sm font-medium mb-3">Slot Type</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSlotType('recurring')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${slotType === 'recurring'
                                    ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400/50 shadow-glow-sm'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'
                                }`}
                        >
                            <Repeat size={24} className={slotType === 'recurring' ? 'text-white' : 'text-current'} />
                            <div className="font-semibold text-white">Recurring Weekly</div>
                            <div className="text-xs text-white/50">Repeats every week</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSlotType('specific_date')}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${slotType === 'specific_date'
                                    ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-400/50 shadow-glow-sm'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'
                                }`}
                        >
                            <MapPin size={24} className={slotType === 'specific_date' ? 'text-white' : 'text-current'} />
                            <div className="font-semibold text-white">Specific Date</div>
                            <div className="text-xs text-white/50">One-time session</div>
                        </button>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                    {/* Recurring: Day of Week Selector */}
                    {slotType === 'recurring' && (
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">Day of Week</label>
                            <select
                                value={dayOfWeek}
                                onChange={(e) => setDayOfWeek(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <option key={day} value={day} className="text-gray-900">{day}</option>
                                ))}
                            </select>
                            <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                                <Repeat size={12} />
                                This session will repeat every {dayOfWeek}
                            </p>
                        </div>
                    )}

                    {/* Specific Date: Date Picker */}
                    {slotType === 'specific_date' && (
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">Select Date</label>
                            <input
                                type="date"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm [color-scheme:dark]"
                                required
                            />
                        </div>
                    )}

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">Start Time</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm [color-scheme:dark]"
                                    required
                                />
                                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">End Time</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm [color-scheme:dark]"
                                    required
                                />
                                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">Subject</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., AP Pre-Calculus"
                                className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                                required
                            />
                            <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    className="w-full py-4 text-lg"
                    size="lg"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Creating Slot...</span>
                        </div>
                    ) : (
                        '✨ Create Slot'
                    )}
                </Button>
            </form>
        </div>
    );
}
