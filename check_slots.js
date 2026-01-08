import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkSlots() {
    try {
        console.log('Fetching all tutors and their slots...\n');
        const querySnapshot = await getDocs(collection(db, 'tutors'));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`\n=== Tutor: ${doc.id} ===`);
            console.log(`Subjects: ${data.subjects?.join(', ') || 'None'}`);
            console.log(`Total Slots: ${data.slots?.length || 0}`);

            if (data.slots && data.slots.length > 0) {
                console.log('\nSlots:');
                data.slots.forEach((slot, index) => {
                    console.log(`  ${index + 1}. ${slot.subject || 'No subject'}`);
                    console.log(`     - ID: ${slot.id || slot.slotId || 'No ID'}`);
                    console.log(`     - Day: ${slot.day || slot.dayOfWeek || 'No day'}`);
                    console.log(`     - Time: ${slot.time || `${slot.startTime}-${slot.endTime}` || 'No time'}`);
                    console.log(`     - Status: ${slot.status || 'Unknown'}`);
                    console.log(`     - Type: ${slot.slotType || 'Unknown'}`);
                });
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSlots();
