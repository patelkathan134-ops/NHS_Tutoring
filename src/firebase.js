import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration provided by user
const firebaseConfig = {
    apiKey: "AIzaSyA4rIeWXrfvLKFuz7Wm_qInqXOLAgImqk8",
    authDomain: "lwr-nhs-tutors.firebaseapp.com",
    projectId: "lwr-nhs-tutors",
    storageBucket: "lwr-nhs-tutors.firebasestorage.app",
    messagingSenderId: "671280563942",
    appId: "1:671280563942:web:9f9ef1e91156c965299d27"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
