const admin = require('firebase-admin');

// Initialize Firebase Admin (add your service account key)
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error('Failed to initialize Firebase Admin:', e);
    }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
    console.log('Running slot expiration check...');

    const now = new Date();
    const tutorsSnapshot = await db.collection('tutors').get();

    let updatedCount = 0;

    for (const tutorDoc of tutorsSnapshot.docs) {
        const tutorData = tutorDoc.data();
        let slotsUpdated = false;

        // Safety check for slots
        if (!tutorData.slots || !Array.isArray(tutorData.slots)) continue;

        const updatedSlots = tutorData.slots.map(slot => {
            // If no expiryDate, ignore or handle gracefully
            if (!slot.expiryDate) return slot;

            const expiryDate = new Date(slot.expiryDate);

            // If slot has expired
            if (now > expiryDate) {

                if (slot.slotType === 'specific_date') {
                    // Specific date slots: mark as Expired if not already
                    if (slot.status !== 'Expired') {
                        slotsUpdated = true;
                        return { ...slot, status: 'Expired' };
                    }

                } else if (slot.slotType === 'recurring') {
                    // Recurring slots: roll forward to next week
                    const nextOccurrence = getNextDayOfWeek(slot.dayOfWeek, slot.startTime, now);
                    const newExpiryDate = new Date(nextOccurrence);

                    const [hours, minutes] = convertTo24Hour(slot.endTime).split(':');
                    newExpiryDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    slotsUpdated = true;
                    updatedCount++;

                    console.log(`Renewing recurring slot: ${slot.subject} (${slot.dayOfWeek}) -> ${nextOccurrence.toISOString()}`);

                    return {
                        ...slot,
                        nextOccurrence: nextOccurrence.toISOString(),
                        expiryDate: newExpiryDate.toISOString(),
                        status: 'Available',
                        bookedBy: [],  // Reset bookings for new week
                        studentName: null,
                        studentEmail: null
                    };
                }
            }

            return slot;
        });

        // Update Firestore if changes were made
        if (slotsUpdated) {
            await tutorDoc.ref.update({ slots: updatedSlots });
        }
    }

    console.log(`Updated ${updatedCount} recurring slots`);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: `Updated ${updatedCount} slots` })
    };
};

function getNextDayOfWeek(targetDay, time, fromDate) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetIndex = days.indexOf(targetDay);
    const currentIndex = fromDate.getDay();

    let daysUntil = targetIndex - currentIndex;
    if (daysUntil <= 0) daysUntil += 7;

    const nextDate = new Date(fromDate);
    nextDate.setDate(fromDate.getDate() + daysUntil);

    const [hours, minutes] = convertTo24Hour(time).split(':');
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextDate;
}

function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

    return `${hours}:${minutes}`;
}
