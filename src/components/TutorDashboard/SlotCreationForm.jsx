import React, { useState } from 'react';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { getNextDayOfWeek, calculateExpiryDate, convertTo24Hour } from '../../utils/dateUtils';
import { ELIGIBLE_TIME_SLOTS, ELIGIBLE_DAYS } from '../../utils/constants';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import { Calendar, Clock, BookOpen, Repeat, MapPin, Check } from 'lucide-react';

export default function SlotCreationForm({ tutorId, selectedSubjects = [], onSlotCreated }) {
    const [slotType, setSlotType] = useState('recurring');
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [specificDate, setSpecificDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [selectedSlotSubjects, setSelectedSlotSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleSubject = (subject) => {
        setSelectedSlotSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate subject selection
            if (selectedSlotSubjects.length === 0) {
                alert('Please select at least one subject');
                setLoading(false);
                return;
            }

            // Validate time slot selection
            if (!selectedTimeSlot) {
                alert('Please select a time slot');
                setLoading(false);
                return;
            }

            // Get the selected time slot details
            const timeSlot = ELIGIBLE_TIME_SLOTS.find(slot => slot.id === selectedTimeSlot);
            if (!timeSlot) {
                alert('Invalid time slot selected');
                setLoading(false);
                return;
            }

            const { startTime, endTime, displayStart, displayEnd } = timeSlot;

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

            // Create slots for each selected subject
            const newSlots = selectedSlotSubjects.map((subject, index) => ({
                id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`,
                slotType,
                day: slotType === 'recurring' ? dayOfWeek : specificDate,
                dayOfWeek: slotType === 'recurring' ? dayOfWeek : null,
                specificDate: slotType === 'specific_date' ? specificDate : null,
                time: `${displayStart}-${displayEnd}`,
                startTime: displayStart,
                endTime: displayEnd,
                subject,
                status: 'Available',
                nextOccurrence: nextOccurrence.toISOString(),
                expiryDate: expiryDate.toISOString(),
                maxCapacity: 1,
                bookedBy: [],
                studentName: null,
                studentEmail: null,
                createdAt: now.toISOString()
            }));

            console.log('Creating slots:', newSlots);

            // Update Firestore with all new slots (using setDoc with merge to ensure doc exists)
            const tutorRef = doc(db, 'tutors', tutorId);
            for (const slot of newSlots) {
                await setDoc(tutorRef, {
                    slots: arrayUnion(slot),
                    subjects: arrayUnion(slot.subject) // Auto-index subject
                }, { merge: true });
            }

            console.log('Slots created successfully!');
            alert(`✓ Successfully created ${newSlots.length} slot(s)!`);

            // Reset form (keep basics)
            setSelectedSlotSubjects([]);
            if (onSlotCreated) onSlotCreated();

        } catch (error) {
            console.error('Error creating slot:', error);
            alert('Error creating slot. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-1">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock size={20} />
                Create New Availability
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Slot Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setSlotType('recurring')}
                        className={`p-4 rounded-xl border transition-all ${slotType === 'recurring'
                                ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400 text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        <Repeat className="mx-auto mb-2" size={20} />
                        <div className="font-semibold text-sm">Recurring Weekly</div>
                        <div className="text-xs opacity-70 mt-1">Repeats every week</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSlotType('specific_date')}
                        className={`p-4 rounded-xl border transition-all ${slotType === 'specific_date'
                                ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400 text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        <Calendar className="mx-auto mb-2" size={20} />
                        <div className="font-semibold text-sm">Specific Date</div>
                        <div className="text-xs opacity-70 mt-1">One-time session</div>
                    </button>
                </div>

                {/* 2. Date Selection */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">
                            {slotType === 'recurring' ? 'Day of Week' : 'Select Date'}
                        </label>

                        {slotType === 'recurring' ? (
                            <select
                                value={dayOfWeek}
                                onChange={(e) => setDayOfWeek(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                            >
                                {ELIGIBLE_DAYS.map(day => (
                                    <option key={day} value={day} className="text-gray-900">{day}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="date"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                            />
                        )}
                        {slotType === 'recurring' && (
                            <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
                                <Repeat size={12} />
                                This session will repeat every {dayOfWeek} (weekdays only)
                            </p>
                        )}
                    </div>
                </div>

                {/* 3. Time Selection */}
                <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Time Slot</label>
                    <div className="relative">
                        <select
                            value={selectedTimeSlot}
                            onChange={(e) => setSelectedTimeSlot(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm appearance-none"
                        >
                            <option value="" className="text-gray-900">-- Select Time --</option>
                            {ELIGIBLE_TIME_SLOTS.map(slot => (
                                <option key={slot.id} value={slot.id} className="text-gray-900">
                                    {slot.label}
                                </option>
                            ))}
                        </select>
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={18} />
                    </div>
                    <p className="text-white/50 text-xs mt-2">
                        Only eligible time slots are available (weekdays only)
                    </p>
                </div>

                {/* 4. Subject Selection */}
                <div>
                    <label className="block text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                        <BookOpen size={16} />
                        Subjects (Select one or more)
                    </label>

                    {selectedSubjects.length === 0 ? (
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-200 text-sm flex items-start gap-3">
                            <MapPin className="shrink-0 mt-0.5" size={16} />
                            Please select your subjects in the "My Subjects" section on the left before creating slots.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                            {selectedSubjects.map(subject => (
                                <label
                                    key={subject}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedSlotSubjects.includes(subject)
                                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-400'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedSlotSubjects.includes(subject)
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-white/30'
                                        }`}>
                                        {selectedSlotSubjects.includes(subject) && <Check size={14} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedSlotSubjects.includes(subject)}
                                        onChange={() => toggleSubject(subject)}
                                        className="sr-only"
                                    />
                                    <span className="text-white text-sm">{subject}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {selectedSlotSubjects.length > 0 && (
                        <p className="text-green-400 text-xs mt-2">
                            ✓ {selectedSlotSubjects.length} subjects selected
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading || selectedSubjects.length === 0}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Creating Slots...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <SparklesIcon />
                            <span>Create Slot</span>
                        </div>
                    )}
                </Button>

            </form>
        </div>
    );
}

// Simple Sparkles icon component if not imported
const SparklesIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);
