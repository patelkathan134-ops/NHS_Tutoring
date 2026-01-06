
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

// Config
const firebaseConfig = {
    apiKey: "AIzaSyA4rIeWXrfvLKFuz7Wm_qInqXOLAgImqk8",
    authDomain: "lwr-nhs-tutors.firebaseapp.com",
    projectId: "lwr-nhs-tutors",
    storageBucket: "lwr-nhs-tutors.firebasestorage.app",
    messagingSenderId: "671280563942",
    appId: "1:671280563942:web:9f9ef1e91156c965299d27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to mimic app logic
const isExpired = (expiryDateISO) => {
    if (!expiryDateISO) return false;
    return new Date() > new Date(expiryDateISO);
};

async function run() {
    const tutorId = "Kathan"; // Using your profile for testing
    const docRef = doc(db, 'tutors', tutorId);

    console.log(`\n--- TEST START: Verifying Expiration for Tutor '${tutorId}' ---`);

    // 1. Get current slots
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        console.error("Tutor not found!");
        process.exit(1);
    }

    let slots = snap.data().slots || [];

    // 2. Create a fake "TEST BOOKING" on the first available slot
    // pass simple validation
    if (slots.length === 0) {
        console.log("No slots to test with.");
        return;
    }

    const testSlotIndex = 0;
    const originalSlot = { ...slots[testSlotIndex] }; // backup

    console.log(`\n1. Creating a TEST booking that EXPIRED 1 hour ago...`);
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    slots[testSlotIndex] = {
        ...slots[testSlotIndex],
        status: 'Booked',
        studentName: 'EXPIRATION_TEST_STUDENT',
        subject: 'Testing 101',
        expiryDate: oneHourAgo.toISOString()
    };

    // Simulate what the dashboard sees
    let visibleBookings = slots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
    let testBookingVisible = visibleBookings.find(s => s.studentName === 'EXPIRATION_TEST_STUDENT');

    if (!testBookingVisible) {
        console.log("   ✅ SUCCESS: The expired booking is HIDDEN from the dashboard logic.");
    } else {
        console.log("   ❌ FAIL: The expired booking is STILL VISIBLE.");
    }

    // 3. Update to Future
    console.log(`\n2. Updating TEST booking to expire in 1 hour (FUTURE)...`);
    const oneHourFuture = new Date();
    oneHourFuture.setHours(oneHourFuture.getHours() + 1);

    slots[testSlotIndex].expiryDate = oneHourFuture.toISOString();

    // Simulate what the dashboard sees
    visibleBookings = slots.filter(s => s.status === 'Booked' && !isExpired(s.expiryDate));
    testBookingVisible = visibleBookings.find(s => s.studentName === 'EXPIRATION_TEST_STUDENT');

    if (testBookingVisible) {
        console.log("   ✅ SUCCESS: The future booking is VISIBLE in the dashboard.");
    } else {
        console.log("   ❌ FAIL: The future booking is HIDDEN.");
    }

    console.log("\n--- TEST COMPLETE ---");
    process.exit(0);
}

run().catch(console.error);
