import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function DashboardCalendar({ bookedSlots = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const safeDate = (dateInput) => {
        try {
            if (!dateInput) return null;
            if (dateInput.toDate) return dateInput.toDate(); // Firestore Timestamp
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return null; // Invalid Date
            return d;
        } catch (e) {
            console.error("Date parsing error", e);
            return null;
        }
    };

    const renderCalendarDays = () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, month, 1).getDay();

            const days = [];

            // Empty slots for previous month
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-white/5 rounded-xl border border-white/5" />);
            }

            // Actual days
            for (let d = 1; d <= daysInMonth; d++) {
                const isToday = d === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                // Safer filter logic
                const daySessions = bookedSlots.filter(s => {
                    const sessionDate = safeDate(s.expiryDate);
                    if (!sessionDate) return false;

                    return sessionDate.getDate() === d &&
                        sessionDate.getMonth() === month &&
                        sessionDate.getFullYear() === year;
                });

                days.push(
                    <div
                        key={d}
                        className={`min-h-[100px] p-2 rounded-xl transition-all relative group ${daySessions.length > 0
                                ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {/* Day Number */}
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-bold ${isToday
                                    ? 'bg-purple-500 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg'
                                    : 'text-white/60'
                                }`}>
                                {d}
                            </span>
                            {daySessions.length > 0 && (
                                <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full border border-green-500/30">
                                    {daySessions.length}
                                </span>
                            )}
                        </div>

                        {/* Sessions List */}
                        <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                            {daySessions.map((session, idx) => (
                                <div
                                    key={session.id || idx}
                                    className="text-[10px] p-1.5 rounded bg-white/5 border border-white/10 text-white/90 truncate hover:bg-white/10 transition-colors cursor-default"
                                    title={`${session.studentName} - ${session.subject} (${session.time})`}
                                >
                                    <div className="font-semibold truncate">{session.studentName || 'Student'}</div>
                                    <div className="opacity-70 truncate">{session.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            return days;
        } catch (err) {
            console.error("Calendar Rendering Error:", err);
            return <div className="col-span-7 p-4 text-center text-red-300">Error rendering calendar days.</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    My Calendar
                </h3>

                {/* Month Navigation */}
                <div className="flex items-center gap-2 glassmorphic px-2 py-1 rounded-lg">
                    <button
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setCurrentDate(newDate);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-semibold text-white min-w-[140px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setCurrentDate(newDate);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <GlassCard className="p-4" tilt={false}>
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-white/40 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {renderCalendarDays()}
                </div>
            </GlassCard>
        </div>
    );
}
