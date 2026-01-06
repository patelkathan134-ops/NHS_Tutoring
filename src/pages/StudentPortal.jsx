import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Calendar, User, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { getNextSessionDate, isExpired } from '../utils';

const SUBJECTS = [
    "Civics EOC", "Biology EOC", "Algebra 1 EOC", "Geometry EOC",
    "AP Pre-Calculus", "AP Calculus AB", "AICE Geography", "AP World History",
    "APUSH", "FAST ELA Grade 10", "AICE Spanish", "Eighth Grade Science Exam",
    "AICE Psychology", "AICE Marine Science"
];

const StudentPortal = () => {
    const navigate = useNavigate(); // Hook initialized
    const [selectedSubject, setSelectedSubject] = useState('');
    const [tutors, setTutors] = useState([]); // List of tutor docs
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Booking Modal State
    const [bookingSlot, setBookingSlot] = useState(null); // { tutorId, slotId, day, time, currentSlots, bio }
    const [studentName, setStudentName] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    const handleSearch = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        setHasSearched(true);
        setTutors([]);

        try {
            const q = query(collection(db, 'tutors'), where('subjects', 'array-contains', selectedSubject));
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            setTutors(results);
        } catch (error) {
            console.error("Error searching tutors:", error);
        } finally {
            setLoading(false);
        }
    };

    const openBookingModal = (tutor, slot) => {
        setBookingSlot({
            tutorId: tutor.id,
            slotId: slot.id,
            day: slot.day,
            time: slot.time,
            tutorName: tutor.name,
            bio: tutor.bio
        });
        setStudentName('');
    };

    const handleBookingConfirm = async (e) => {
        e.preventDefault();
        if (!studentName || !bookingSlot) return;

        setIsBooking(true);
        try {
            // 1. Fetch latest tutor data to ensure slot is still available and get full array
            const tutorRef = doc(db, 'tutors', bookingSlot.tutorId);
            const tutorSnap = await getDoc(tutorRef);

            if (!tutorSnap.exists()) {
                alert("Error: Tutor not found.");
                return;
            }

            const tutorData = tutorSnap.data();
            const slots = tutorData.slots || [];

            // 2. Find the slot and update it
            const slotIndex = slots.findIndex(s => s.id === bookingSlot.slotId);

            if (slotIndex === -1) {
                alert("Error: Slot not found.");
                return;
            }

            // Check availability (Available OR Booked-but-Expired)
            const currentSlot = slots[slotIndex];
            const expired = currentSlot.status === 'Booked' && currentSlot.expiryDate && isExpired(currentSlot.expiryDate);

            if (currentSlot.status !== 'Available' && !expired) {
                alert("This slot has already been booked by someone else.");
                // Refresh UI
                handleSearch();
                setBookingSlot(null);
                return;
            }

            // Calculate Expiration Date
            const expiryDate = getNextSessionDate(bookingSlot.day, bookingSlot.time);

            // Update the slot
            slots[slotIndex].status = 'Booked';
            slots[slotIndex].studentName = studentName;
            slots[slotIndex].subject = selectedSubject;
            slots[slotIndex].expiryDate = expiryDate;

            // 3. Write back to Firestore
            await updateDoc(tutorRef, { slots });

            alert(`Successfully booked session with ${bookingSlot.tutorName}!`);
            setBookingSlot(null);
            handleSearch(); // Refresh results to show updated status
        } catch (error) {
            console.error("Booking error:", error);
            alert("Failed to book session. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-0 left-0 flex items-center text-gray-600 hover:text-school-navy transition-colors mb-4 md:mb-0"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
            </button>

            <div className="text-center mb-8 pt-8"> {/* Added padding top for button space */}
                <h2 className="text-3xl font-bold text-school-navy mb-4">Find a Tutor</h2>
                <div className="flex justify-center max-w-xl mx-auto">
                    <div className="flex w-full shadow-sm rounded-lg overflow-hidden border border-gray-300">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="flex-grow p-3 outline-none bg-white text-gray-700"
                        >
                            <option value="">-- Select a Subject --</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                            onClick={handleSearch}
                            disabled={!selectedSubject || loading}
                            className="bg-school-navy text-white px-6 py-3 font-semibold hover:bg-blue-900 transition-colors flex items-center"
                        >
                            {loading ? 'Searching...' : <><Search size={18} className="mr-2" /> Search</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {hasSearched && tutors.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-8">
                        No tutors found for {selectedSubject}.
                    </div>
                )}

                {tutors.map(tutor => {
                    // Filter for available slots OR expired booked slots
                    const availableSlots = (tutor.slots || []).filter(s => {
                        if (s.status === 'Available') return true;
                        if (s.status === 'Booked' && s.expiryDate && isExpired(s.expiryDate)) return true;
                        return false;
                    });

                    if (availableSlots.length === 0) return null;

                    return (
                        <div key={tutor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-school-green rounded-full flex items-center justify-center text-white font-bold">
                                        {tutor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 leading-tight">{tutor.name}</h3>
                                        {tutor.gradeLevel && (
                                            <span className="text-xs text-gray-500 font-medium">{tutor.gradeLevel}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    {selectedSubject}
                                </span>
                            </div>

                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => openBookingModal(tutor, slot)}
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-school-green hover:shadow-md transition-all group bg-white"
                                    >
                                        <div className="flex items-center text-gray-600">
                                            <Calendar size={16} className="mr-2 text-school-green" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-semibold text-sm">{slot.day}</span>
                                                <span className="text-xs">{slot.time}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-school-navy group-hover:underline">Book</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Booking Modal */}
            {bookingSlot && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Booking</h3>

                        {/* Tutor Bio Snippet in Modal */}
                        {bookingSlot.bio && (
                            <div className="mb-4 text-sm text-gray-600 italic border-l-4 border-school-green pl-3">
                                "{bookingSlot.bio}"
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700">
                            <p><strong>Tutor:</strong> {bookingSlot.tutorName}</p>
                            <p><strong>Subject:</strong> {selectedSubject}</p>
                            <p><strong>Time:</strong> {bookingSlot.day}, {bookingSlot.time}</p>
                        </div>

                        <form onSubmit={handleBookingConfirm}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-school-green outline-none"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setBookingSlot(null)}
                                    className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="flex-1 py-2 bg-school-green text-white rounded-md font-semibold hover:bg-green-800"
                                >
                                    {isBooking ? 'Booking...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPortal;
