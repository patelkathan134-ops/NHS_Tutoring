import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import { SUBJECTS } from '../constants';

const StudentPortal = () => {
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState('');
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(false);

    // Booking Modal State
    const [bookingSlot, setBookingSlot] = useState(null); // { tutorId, slot }
    const [studentName, setStudentName] = useState('');
    const [bookingStatus, setBookingStatus] = useState('');

    useEffect(() => {
        const fetchTutors = async () => {
            if (!selectedSubject) {
                setTutors([]);
                return;
            }

            setLoading(true);
            try {
                const q = query(
                    collection(db, 'tutors'),
                    where('specialties', 'array-contains', selectedSubject)
                );
                const querySnapshot = await getDocs(q);

                const results = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Filter for tutors who actually have available slots
                    const availableSlots = (data.availability || []).filter(slot => slot.status === 'Available');
                    if (availableSlots.length > 0) {
                        results.push({
                            id: doc.id,
                            ...data,
                            availableSlots
                        });
                    }
                });
                setTutors(results);
            } catch (error) {
                console.error("Error fetching tutors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [selectedSubject]);

    const handleBookClick = (tutor, slot) => {
        setBookingSlot({ tutorId: tutor.id, slot });
        setStudentName('');
        setBookingStatus('');
    };

    const confirmBooking = async (e) => {
        e.preventDefault();
        if (!studentName.trim() || !bookingSlot) return;

        setBookingStatus('processing');

        try {
            await runTransaction(db, async (transaction) => {
                const tutorRef = doc(db, 'tutors', bookingSlot.tutorId);
                const tutorDoc = await transaction.get(tutorRef);

                if (!tutorDoc.exists()) throw new Error("Tutor does not exist!");

                const data = tutorDoc.data();
                const availability = data.availability || [];

                // Find the index of the slot to update
                const slotIndex = availability.findIndex(s => s.id === bookingSlot.slot.id);

                if (slotIndex === -1) throw new Error("Slot not found!");
                if (availability[slotIndex].status !== 'Available') throw new Error("Slot is no longer available!");

                // Update the slot
                availability[slotIndex].status = 'Booked';
                availability[slotIndex].studentName = studentName;

                transaction.update(tutorRef, { availability });
            });

            setBookingStatus('success');
            // Refresh the list after a short delay
            setTimeout(() => {
                setBookingSlot(null);
                // Trigger re-fetch? simpliest is to just rely on next effect or force update. 
                // For now let's just manually update local state to hide the slot immediately
                setTutors(prev => prev.map(t => {
                    if (t.id === bookingSlot.tutorId) {
                        return {
                            ...t,
                            availableSlots: t.availableSlots.filter(s => s.id !== bookingSlot.slot.id)
                        };
                    }
                    return t;
                }));
            }, 1500);

        } catch (error) {
            console.error("Booking transaction failed:", error);
            setBookingStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header */}
            <header className="mb-8 text-center pt-8">
                <button onClick={() => navigate('/')} className="mb-4 text-sm text-gray-500 hover:text-school-navy">&larr; Back Home</button>
                <h1 className="text-3xl font-bold text-school-navy">Find a Tutor</h1>
                <p className="text-gray-600 mt-2">Select a subject to see available NHS tutors.</p>
            </header>

            {/* Filter */}
            <div className="max-w-md mx-auto mb-10">
                <label className="block text-sm font-medium text-gray-700 mb-2">I need help with:</label>
                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-school-green focus:border-transparent"
                >
                    <option value="">-- Select Subject --</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Results */}
            <div className="max-w-4xl mx-auto space-y-6">
                {loading && <div className="text-center py-10 text-gray-400">Loading tutors...</div>}

                {!loading && selectedSubject && tutors.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">No tutors available for {selectedSubject} at this time.</p>
                    </div>
                )}

                {tutors.map(tutor => (
                    <div key={tutor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl text-school-navy">{tutor.name}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {selectedSubject}
                                    </span>
                                    {/* Show a few other specialties? Maybe not needed */}
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Slots</h4>
                            <div className="flex flex-wrap gap-3">
                                {tutor.availableSlots.sort((a, b) => a.day.localeCompare(b.day)).map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleBookClick(tutor, slot)}
                                        className="px-4 py-2 bg-white border border-school-green text-school-green rounded-lg hover:bg-school-green hover:text-white transition-colors text-sm font-medium shadow-sm"
                                    >
                                        {slot.day} @ {slot.time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {bookingSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setBookingSlot(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-school-navy mb-4">Book Session</h3>

                        {bookingStatus === 'success' ? (
                            <div className="text-center py-4">
                                <div className="text-4xl mb-4">✅</div>
                                <p className="font-bold text-green-600 mb-2">Booking Confirmed!</p>
                                <p className="text-sm text-gray-500">Good luck with your studying!</p>
                            </div>
                        ) : (
                            <form onSubmit={confirmBooking}>
                                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-sm text-gray-500">Subject: <span className="font-medium text-gray-800">{selectedSubject}</span></p>
                                    <p className="text-sm text-gray-500 mt-1">Time: <span className="font-medium text-gray-800">{bookingSlot.slot.day} @ {bookingSlot.slot.time}</span></p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-school-green outline-none"
                                        placeholder="Enter full name"
                                        autoFocus
                                    />
                                </div>

                                {bookingStatus === 'error' && <p className="text-red-500 text-sm mb-4">Booking failed. Slot may be taken.</p>}

                                <button
                                    type="submit"
                                    disabled={bookingStatus === 'processing'}
                                    className="w-full bg-school-green text-white py-3 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {bookingStatus === 'processing' ? 'Confirming...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentPortal;
