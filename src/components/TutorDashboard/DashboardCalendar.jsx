import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Image, File, X, Clock, BookOpen, MessageSquare, Paperclip } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function DashboardCalendar({ bookedSlots = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSession, setSelectedSession] = useState(null);

    const safeDate = (dateInput) => {
        try {
            if (!dateInput) return null;
            if (dateInput.toDate) return dateInput.toDate();
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return null;
            return d;
        } catch (e) {
            console.error("Date parsing error", e);
            return null;
        }
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return Image;
        if (type === 'application/pdf') return FileText;
        return File;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderCalendarDays = () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, month, 1).getDay();

            const days = [];

            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-white/5 rounded-xl border border-white/5" />);
            }

            for (let d = 1; d <= daysInMonth; d++) {
                const isToday = d === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

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
                        className={`min-h-[100px] p-2 rounded-xl transition-all relative ${daySessions.length > 0
                            ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                    >
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

                        <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                            {daySessions.map((session, idx) => (
                                <div
                                    key={session.id || idx}
                                    onClick={() => setSelectedSession(session)}
                                    className="text-[10px] p-1.5 rounded bg-white/10 border border-white/20 text-white/90 truncate hover:bg-white/20 hover:border-purple-400/50 transition-all cursor-pointer"
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

            {/* Session Details Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="w-full max-w-lg animate-scale-in">
                        <GlassCard hover={false} className="relative">
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-2xl font-bold text-white mb-6">Session Details</h3>

                            {/* Student Info */}
                            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/30">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                        {selectedSession.studentName?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-white">{selectedSession.studentName || 'Student'}</h4>
                                        <p className="text-white/60 text-sm">Student</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-blue-400" />
                                        <span className="text-white/70">Subject:</span>
                                        <span className="text-white font-medium">{selectedSession.subject?.name || selectedSession.subject || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-green-400" />
                                        <span className="text-white/70">Time:</span>
                                        <span className="text-white font-medium">{selectedSession.day}, {selectedSession.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Study Materials */}
                            {selectedSession.studyMaterials && (
                                <div className="mb-4">
                                    <h5 className="flex items-center gap-2 text-white font-semibold mb-2">
                                        <BookOpen size={18} className="text-blue-400" />
                                        Study Materials
                                    </h5>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-white/80 text-sm whitespace-pre-wrap">{selectedSession.studyMaterials}</p>
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Files */}
                            {selectedSession.uploadedFiles && selectedSession.uploadedFiles.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="flex items-center gap-2 text-white font-semibold mb-2">
                                        <Paperclip size={18} className="text-green-400" />
                                        Uploaded Files ({selectedSession.uploadedFiles.length})
                                    </h5>
                                    <div className="space-y-2">
                                        {selectedSession.uploadedFiles.map((file, idx) => {
                                            const IconComp = getFileIcon(file.type);
                                            return (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-400/30 transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                        <IconComp size={20} className="text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-white/50 text-xs">{formatFileSize(file.size)}</p>
                                                    </div>
                                                    <Download size={18} className="text-white/40 group-hover:text-green-400 transition-colors" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            {selectedSession.messageForTutor && (
                                <div className="mb-4">
                                    <h5 className="flex items-center gap-2 text-white font-semibold mb-2">
                                        <MessageSquare size={18} className="text-purple-400" />
                                        Message from Student
                                    </h5>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 border-l-4 border-l-purple-400">
                                        <p className="text-white/80 text-sm whitespace-pre-wrap italic">"{selectedSession.messageForTutor}"</p>
                                    </div>
                                </div>
                            )}

                            {/* No info message */}
                            {!selectedSession.studyMaterials && !selectedSession.messageForTutor && (!selectedSession.uploadedFiles || selectedSession.uploadedFiles.length === 0) && (
                                <div className="text-center py-6 text-white/50">
                                    <p>No additional materials or messages for this session.</p>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedSession(null)}
                                className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                Close
                            </button>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
}
