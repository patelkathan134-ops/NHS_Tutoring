
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Config from src/firebase.js
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

async function run() {
    console.log("Fetching tutors...");
    const snapshot = await getDocs(collection(db, 'tutors'));
    let foundNami = false;

    snapshot.forEach(doc => {
        const data = doc.data();
        const slots = data.slots || [];
        const booked = slots.filter(s => s.status === 'Booked');

        if (booked.length > 0) {
            console.log(`\nTutor: ${data.name} (${doc.id})`);
            booked.forEach(s => {
                console.log(`  - Slot: ${s.day} ${s.time}`);
                console.log(`    Student: ${s.studentName}`);
                console.log(`    Subject: ${s.subject}`);
                console.log(`    ExpiryDate: ${s.expiryDate}`);

                if (s.studentName && s.studentName.toLowerCase().includes('nami')) {
                    foundNami = true;
                    console.log("    *** FOUND NAMI HERE ***");
                }
            });
        }
    });

    if (!foundNami) {
        console.log("\nWARNING: Could not find any booking for 'Nami'.");
    }
    console.log("\nDone.");
    process.exit(0);
}

run().catch(console.error);
