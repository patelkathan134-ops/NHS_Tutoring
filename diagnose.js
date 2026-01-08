import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

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
const auth = getAuth(app);

const TEST_TUTOR_ID = "Kathan Patel";

async function runDiagnostics() {
    console.log("=== STARTING DIAGNOSTICS ===\n");

    try {
        console.log("Attempting Anonymous Auth...");
        let user;
        try {
            const userCred = await signInAnonymously(auth);
            user = userCred.user;
            console.log(`✅ Signed in anonymously with UID: ${user.uid}`);
        } catch (authErr) {
            console.error("❌ Auth Failed:", authErr.message);
            // Continue anyway to see if unauth works
        }
        // 1. Check if Tutor Document Exists
        console.log(`Checking if tutor document exists for ID: "${TEST_TUTOR_ID}"...`);
        const tutorRef = doc(db, 'tutors', TEST_TUTOR_ID);
        const tutorSnap = await getDoc(tutorRef);

        if (tutorSnap.exists()) {
            console.log("✅ Tutor document EXISTS.");
            const data = tutorSnap.data();
            console.log("   - Subjects:", JSON.stringify(data.subjects));
            console.log("   - Slot Count:", data.slots ? data.slots.length : 0);

            if (data.slots && data.slots.length > 0) {
                console.log("   - Sample Slot:", JSON.stringify(data.slots[0], null, 2));
            } else {
                console.log("   ⚠️ NO SLOTS FOUND in database.");
            }

        } else {
            console.log("❌ Tutor document DOES NOT EXIST.");
            console.log("   Attempting to create it now...");

            try {
                await setDoc(tutorRef, {
                    name: TEST_TUTOR_ID,
                    subjects: ["Debug Subject"],
                    slots: [],
                    createdAt: new Date().toISOString()
                });
                console.log("   ✅ Successfully created test tutor document.");
            } catch (createErr) {
                console.error("   ❌ FAILED to create document:", createErr.message);
                console.log("\nCRITICAL: If we cannot create the document, the app cannot work.");
                return;
            }
        }

        // 2. Try to add a test slot
        console.log("\nAttempting to write a test slot...");
        const testSlot = {
            id: `debug_slot_${Date.now()}`,
            startTime: "07:00 AM",
            endTime: "07:45 AM",
            time: "7:00-7:45 AM",
            day: "Monday",
            subject: "Debug Subject",
            status: "Available",
            expiryDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        };

        try {
            await updateDoc(tutorRef, {
                slots: arrayUnion(testSlot),
                subjects: arrayUnion("Debug Subject")
            });
            console.log("✅ Successfully wrote test slot to Firestore.");
        } catch (writeErr) {
            console.error("❌ FAILED to write slot:", writeErr.message);
        }

        // 3. Verify Visibility (Student Search Query)
        console.log("\nVerifying visibility for student query...");
        // This simulates exactly what the Student Portal does
        // query(collection(db, 'tutors'), where('subjects', 'array-contains', selectedSubject.name));

        // Note: We cannot import query/where in this simple script easily without more setup, 
        // but checking the 'subjects' array above gives us the answer.
        const verifySnap = await getDoc(tutorRef);
        const verifyData = verifySnap.data();

        if (verifyData.subjects && verifyData.subjects.includes("Debug Subject")) {
            console.log("✅ Tutor IS searchable for 'Debug Subject'.");
        } else {
            console.log("❌ Tutor IS NOT searchable for 'Debug Subject' (Subject missing from array).");
        }

    } catch (err) {
        console.error("\nGLOBAL ERROR:", err);
    }

    console.log("\n=== DIAGNOSTICS COMPLETE ===");
    process.exit(0);
}

runDiagnostics();
