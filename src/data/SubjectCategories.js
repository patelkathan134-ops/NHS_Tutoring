export const CATEGORIES = [
    { id: 'all', name: 'All', label: 'All Subjects' },
    { id: 'ap', name: 'AP Courses', label: 'AP Courses' },
    { id: 'aice', name: 'AICE', label: 'AICE Programs' },
    { id: 'core', name: 'Core & EOC', label: 'Core & EOC' },
    { id: 'specialized', name: 'Specialized', label: 'Specialized' }
];

export const SUBJECTS = [
    // AP Courses
    {
        id: 'ap-precalc',
        name: 'AP Pre-Calculus',
        category: 'ap',
        icon: 'calculator',
        badge: 'AP',
        tutorCount: 3
    },
    {
        id: 'ap-calc-ab',
        name: 'AP Calculus AB',
        category: 'ap',
        icon: 'calculator',
        badge: 'AP',
        tutorCount: 2
    },
    {
        id: 'ap-world',
        name: 'AP World History',
        category: 'ap',
        icon: 'book-open',
        badge: 'AP',
        tutorCount: 2
    },
    {
        id: 'apush',
        name: 'APUSH',
        category: 'ap',
        icon: 'book-open',
        badge: 'AP',
        tutorCount: 2
    },

    // AICE Programs
    {
        id: 'aice-geo',
        name: 'AICE Geography',
        category: 'aice',
        icon: 'book-open',
        badge: 'AICE',
        tutorCount: 1
    },
    {
        id: 'aice-spanish',
        name: 'AICE Spanish',
        category: 'aice',
        icon: 'message-square',
        badge: 'AICE',
        tutorCount: 1
    },
    {
        id: 'aice-psych',
        name: 'AICE Psychology',
        category: 'aice',
        icon: 'brain',
        badge: 'AICE',
        tutorCount: 2
    },
    {
        id: 'aice-marine',
        name: 'AICE Marine Science',
        category: 'aice',
        icon: 'beaker',
        badge: 'AICE',
        tutorCount: 1
    },

    // Core & EOC
    {
        id: 'civics-eoc',
        name: 'Civics EOC',
        category: 'core',
        icon: 'book-open',
        badge: 'EOC',
        tutorCount: 2
    },
    {
        id: 'biology-eoc',
        name: 'Biology EOC',
        category: 'core',
        icon: 'beaker',
        badge: 'EOC',
        tutorCount: 3
    },
    {
        id: 'algebra1-eoc',
        name: 'Algebra 1 EOC',
        category: 'core',
        icon: 'calculator',
        badge: 'EOC',
        tutorCount: 4
    },
    {
        id: 'geometry-eoc',
        name: 'Geometry EOC',
        category: 'core',
        icon: 'calculator',
        badge: 'EOC',
        tutorCount: 3
    },

    // Specialized
    {
        id: 'fast-ela-10',
        name: 'FAST ELA Grade 10',
        category: 'specialized',
        icon: 'message-square',
        badge: null,
        tutorCount: 2
    },
    {
        id: 'eighth-science',
        name: 'Eighth Grade Science Exam',
        category: 'specialized',
        icon: 'beaker',
        badge: null,
        tutorCount: 1
    }
];

export const getSubjectsByCategory = (categoryId) => {
    if (categoryId === 'all') {
        return SUBJECTS;
    }
    return SUBJECTS.filter(subject => subject.category === categoryId);
};

export const getIconComponent = (iconName) => {
    const iconMap = {
        'calculator': 'Calculator',
        'book-open': 'BookOpen',
        'beaker': 'Beaker',
        'message-square': 'MessageSquare',
        'brain': 'Brain'
    };
    return iconMap[iconName] || 'BookOpen';
};
