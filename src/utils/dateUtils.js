/**
 * Get the next occurrence of a specific day of the week
 * @param {string} targetDay - "Monday", "Tuesday", etc.
 * @param {string} timeString - "2:45 PM"
 * @param {Date} fromDate - Start calculating from this date (default: now)
 * @returns {Date} Next occurrence of that day+time
 */
export function getNextDayOfWeek(targetDay, timeString, fromDate = new Date()) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = daysOfWeek.indexOf(targetDay);

    if (targetDayIndex === -1) {
        throw new Error(`Invalid day: ${targetDay}`);
    }

    const currentDayIndex = fromDate.getDay();

    // Calculate days until target day
    let daysUntilTarget = targetDayIndex - currentDayIndex;

    // If target day is today or in the past, add 7 days to get next week
    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
    }

    // Create new date for next occurrence
    const nextDate = new Date(fromDate);
    nextDate.setDate(fromDate.getDate() + daysUntilTarget);

    // Apply the time
    const [hours, minutes] = convertTo24Hour(timeString);
    nextDate.setHours(hours, minutes, 0, 0);

    return nextDate;
}

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12h - "2:45 PM" or "11:30 AM"
 * @returns {Array} [hours, minutes] in 24-hour format
 */
export function convertTo24Hour(time12h) {
    const [time, period] = time12h.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Handle 12 AM (midnight) and 12 PM (noon)
    if (period === 'AM' && hours === 12) {
        hours = 0;
    } else if (period === 'PM' && hours !== 12) {
        hours += 12;
    }

    return [hours, minutes];
}

/**
 * Convert 24-hour time to 12-hour format
 * @param {number} hours - 0-23
 * @param {number} minutes - 0-59
 * @returns {string} "2:45 PM"
 */
export function convertTo12Hour(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Check if a slot has expired
 * @param {string} expiryDateISO - ISO timestamp
 * @returns {boolean}
 */
export function isSlotExpired(expiryDateISO) {
    if (!expiryDateISO) return false;

    // Handle Firestore Timestamp
    if (expiryDateISO && typeof expiryDateISO.toDate === 'function') {
        return expiryDateISO.toDate() <= new Date();
    }

    // Handle Date object or ISO string
    return new Date(expiryDateISO) <= new Date();
}

/**
 * Format a date for display
 * @param {string} isoDate - ISO timestamp
 * @returns {string} "Wednesday, January 8"
 */
export function formatDisplayDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate expiry date based on date and end time
 * @param {Date} startDate - Start date/time of session
 * @param {string} endTime - "3:45 PM"
 * @returns {Date}
 */
/**
 * Calculate expiry date based on date and end time
 * @param {Date} startDate - Start date/time of session
 * @param {string} endTime - "3:45 PM"
 * @returns {Date}
 */
export function calculateExpiryDate(startDate, endTime) {
    const expiryDate = new Date(startDate);
    const [hours, minutes] = convertTo24Hour(endTime);
    expiryDate.setHours(hours, minutes, 0, 0);
    return expiryDate;
}

// Aliases for compatibility with other components
export const isExpired = isSlotExpired;

export function getNextSessionDate(day, timeRange) {
    // Extract start time from range e.g. "2:45 PM-3:45 PM" -> "2:45 PM"
    const startTime = timeRange.includes('-') ? timeRange.split('-')[0].trim() : timeRange;
    return getNextDayOfWeek(day, startTime);
}
