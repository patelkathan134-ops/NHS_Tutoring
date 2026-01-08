// Eligible time slots for tutor availability
// Tutors can only create slots during these specific times on weekdays
export const ELIGIBLE_TIME_SLOTS = [
    {
        id: 'morning',
        label: '7:00-7:45 AM',
        startTime: '07:00',
        endTime: '07:45',
        displayStart: '7:00 AM',
        displayEnd: '7:45 AM'
    },
    {
        id: 'afternoon_early',
        label: '2:45-3:45 PM',
        startTime: '14:45',
        endTime: '15:45',
        displayStart: '2:45 PM',
        displayEnd: '3:45 PM'
    },
    {
        id: 'afternoon_late',
        label: '3:45-4:45 PM',
        startTime: '15:45',
        endTime: '16:45',
        displayStart: '3:45 PM',
        displayEnd: '4:45 PM'
    }
];

// Eligible days for tutoring (Monday-Friday only)
export const ELIGIBLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
