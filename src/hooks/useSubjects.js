
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubjects = async () => {
        try {
            const q = query(collection(db, 'subjects'));
            const querySnapshot = await getDocs(q);
            const fetchedSubjects = [];
            querySnapshot.forEach((doc) => {
                fetchedSubjects.push({ id: doc.id, ...doc.data() });
            });
            // Sort nicely (optional, could be done in query)
            fetchedSubjects.sort((a, b) => a.name.localeCompare(b.name));
            setSubjects(fetchedSubjects);
        } catch (err) {
            console.error("Error fetching subjects:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    return { subjects, loading, error, refreshSubjects: fetchSubjects };
};
