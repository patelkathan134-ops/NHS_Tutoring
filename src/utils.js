/**
 * Calculates the expiration timestamp (Date object) for a given slot.
 * Logic: Finds the *next* occurrence of the given day/time.
 * 
 * @param {string} dayName - e.g., "Monday"
 * @param {string} timeRange - e.g., "7:00-7:45 AM"
 * @returns {string} ISO string of the expiration date
 */
export const getNextSessionDate = (dayName, timeRange) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(dayName);

    if (targetDayIndex === -1) return null;

    // Parse end time from range (e.g. "7:00-7:45 AM" -> "7:45 AM")
    const parts = timeRange.split('-');
    if (parts.length < 2) return null;

    const endTimeStr = parts[1].trim(); // "7:45 AM"

    // Parse time
    const [time, period] = endTimeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    let targetDate = new Date();

    // Set time
    targetDate.setHours(hours, minutes, 0, 0);

    // Calculate day difference
    let dayDiff = targetDayIndex - now.getDay();

    // If today is the day but time passed, or if day is in past, move to next week
    if (dayDiff < 0 || (dayDiff === 0 && now > targetDate)) {
        dayDiff += 7;
    }

    targetDate.setDate(now.getDate() + dayDiff);

    return targetDate.toISOString();
};

/**
 * Checks if a slot is currently expired.
 * @param {string} expiryDateISO 
 * @returns {boolean}
 */
export const isExpired = (expiryDateISO) => {
    if (!expiryDateISO) return false; // Default to NOT expired if date missing (show legacy bookings)
    return new Date() > new Date(expiryDateISO);
};
