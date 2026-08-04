/**
 * data.js – All portfolio content data.
 * This file is the single source of truth for all portfolio content.
 * Loaded first so all other modules can access it.
 */

/* ============================================================
   PORTFOLIO DATA – Akash Prajapati
   ============================================================ */

window.PORTFOLIO_DATA = {

    /* ── Personal Info ── */
    person: {
        name: 'Akash Prajapati',
        title: 'BCA Student & Full-Stack Web Developer',
        location: 'Saharanpur, Uttar Pradesh, India',
        email: 'akashprajapati1232@gmail.com',
        phone: '+91 8115201583',
        github: 'https://github.com/akashprajapati1232',
        linkedin: 'https://www.linkedin.com/in/akash-prajapati1232/',
        website: 'https://akashprajapati.rf.gd/',
        bio: [
            'Aspiring web and software developer with a passion for creating innovative digital solutions. Currently pursuing a Bachelor\'s degree in Computer Applications, I aim to leverage my technical skills and creativity to develop user-friendly applications that solve real-world problems.',
            'I specialize in frontend development with a growing expertise in backend technologies. My goal is to create seamless, responsive, and accessible web experiences that make a positive impact.'
        ],
        stats: {
            projects: '7+',
            certifications: '5+',
            experience: '2+ yrs'
        },
        avatar: 'images/akash-prajapati.jpg',
        roles: ['Web Developer', 'Software Developer', 'BCA Student', 'UI/UX Enthusiast', 'Open Source Contributor']
    },

    /* ── Education ── */
    education: [
        {
            degree: 'Bachelor of Computer Applications (BCA)',
            institution: 'Maa Shakumbhari University',
            location: 'Saharanpur',
            period: '2023 – Present',
            description: 'Pursuing Bachelor of Computer Application (B.C.A) from Maa Shakumbhari University, Saharanpur.'
        },
        {
            degree: 'Higher Secondary Education (12th)',
            institution: 'U.P. Board',
            location: 'Uttar Pradesh',
            period: '2023',
            description: '12th passed with Science from U.P. Board in the year 2023.'
        },
        {
            degree: 'Secondary Education (10th)',
            institution: 'U.P. Board',
            location: 'Uttar Pradesh',
            period: '2021',
            description: '10th passed with Science from U.P. Board in the year 2021.'
        }
    ],

    /* ── Skills ── */
    skills: {
        programming: [
            { name: 'JavaScript', level: 85, icon: 'fab fa-js' },
            { name: 'Python', level: 85, icon: 'fab fa-python' },
            { name: 'C', level: 80, icon: 'fas fa-copyright' },
            { name: 'C++', level: 75, icon: 'fas fa-code' },
            { name: 'PHP', level: 65, icon: 'fab fa-php' }
        ],
        web: [
            { name: 'HTML5', level: 95, icon: 'fab fa-html5' },
            { name: 'CSS3', level: 90, icon: 'fab fa-css3-alt' },
            { name: 'React', level: 80, icon: 'fab fa-react' },
            { name: 'Node.js', level: 75, icon: 'fab fa-node-js' },
            { name: 'WordPress', level: 85, icon: 'fab fa-wordpress' }
        ],
        database: [
            { name: 'MySQL', level: 85, icon: 'fas fa-database' },
            { name: 'MongoDB', level: 70, icon: 'fas fa-leaf' }
        ],
        tools: [
            { name: 'Git', level: 85, icon: 'fab fa-git-alt' },
            { name: 'GitHub', level: 90, icon: 'fab fa-github' },
            { name: 'Canva', level: 80, icon: 'fas fa-palette' },
            { name: 'Photoshop', level: 75, icon: 'fas fa-image' },
            { name: 'VS Code', level: 95, icon: 'fas fa-code' }
        ]
    },

    /* ── Projects ── */
    projects: [
        {
            id: 'imgninja',
            title: 'ImgNinja – All-in-One Image & File Handling Tool',
            description: 'A web application – an all-in-one online tool designed to simplify image and file handling with a modern, fast, and user-friendly interface. Features include image compression, conversion, resizing, and more.',
            tech: ['HTML', 'CSS', 'JavaScript'],
            github: 'https://github.com/akashprajapati1232/ImgNinja',
            live: 'https://imagecompressor.42web.io/',
            image: 'images/ImgNinja/project-ImgNinja-01.png',
            year: '2024',
            type: 'web'
        },
        {
            id: 'snake',
            title: 'Snake Game',
            description: 'A classic Snake game built with HTML5 Canvas, CSS, and vanilla JavaScript. Features a modern design, high score tracking, multiple speed levels, and smooth animations.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Canvas API'],
            github: 'https://github.com/akashprajapati1232/snake-game',
            live: 'https://snakegame.free.nf/',
            image: 'images/snake-game/04-new-version-snake-game.png',
            year: '2024',
            type: 'game'
        },
        {
            id: 'portfolio',
            title: 'Personal Portfolio Website',
            description: 'My personal portfolio website showcasing my skills, projects, and achievements. Built with modern web technologies and featuring a clean, responsive design with interactive animations.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Responsive'],
            github: 'https://github.com/akashprajapati1232/my-portfolio',
            live: 'https://akashprajapati.rf.gd/',
            image: 'images/portfolio/01-portfolio.png',
            year: '2024',
            type: 'other'
        },
        {
            id: 'advocate',
            title: 'Advocate Atul Pal',
            description: 'Professional website for Advocate Atul Pal, featuring legal services information, case studies, and client consultation booking system. Built with modern web technologies for a professional appearance.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Legal'],
            github: 'https://github.com/akashprajapati1232/Atul-Advocate',
            live: '#',
            image: 'images/advocateatulpal/advocate-atul-pal-01.png',
            year: '2025',
            type: 'web'
        },
        {
            id: 'gptbca',
            title: 'GPT for BCA',
            description: 'An AI-powered chatbot specifically designed for BCA students. Provides assistance with programming concepts, coursework help, and academic guidance using advanced language models.',
            tech: ['HTML', 'CSS', 'JavaScript', 'AI'],
            github: 'https://github.com/akashprajapati1232/GPT-for-BCA',
            live: '#',
            image: 'images/gptforbca/gpt-for-bca-01.png',
            year: '2025',
            type: 'web'
        },
        {
            id: 'chatbot',
            title: 'My College Chatbot | BITbot Assistant',
            description: 'An intelligent chatbot assistant designed for college students. BITbot helps with college-related queries, course information, campus navigation, and provides instant support for students.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Chatbot'],
            github: 'https://github.com/akashprajapati1232/My-Collage-Chatbot',
            live: '#',
            image: 'images/clgchatbot/clg-chat-bot-01.png',
            year: '2025',
            type: 'web'
        },
        {
            id: 'brandify',
            title: 'Brandify Creator | Influencer Marketing Agency',
            description: 'A modern influencer marketing agency platform connecting brands with content creators. Features include campaign management, analytics, and collaboration tools for effective brand partnerships.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Marketing'],
            github: 'https://github.com/akashprajapati1232/brandify-creator',
            live: 'https://brandifycreator.42web.io/',
            image: 'images/brandifycreator/brandify-creator-01.png',
            year: '2025',
            type: 'web'
        }
    ],

    /* ── Achievements ── */
    achievements: [
        {
            title: 'Hackathon Participation',
            subtitle: 'Team Project',
            description: 'Participated in a 2-day hackathon and developed a QR-based Health Record System mobile app. The system allows doctors to scan a QR code from a patient\'s phone to instantly access their complete medical history and details.',
            tags: ['Hackathon', 'Mobile App', 'Healthcare', 'QR Technology'],
            date: 'Dec 2024',
            icon: 'ach-trophy',
            iconClass: 'fas fa-trophy'
        },
        {
            title: 'Quiz Competition Winner',
            subtitle: '3rd Place',
            description: 'Won third place in a technical quiz competition focused on programming and web development concepts, competing against 50+ participants.',
            tags: ['Web Development', 'Programming', 'Competition'],
            date: 'Nov 2023',
            icon: 'ach-medal',
            iconClass: 'fas fa-medal'
        },
        {
            title: 'Web Development Certifications',
            subtitle: 'Multiple Courses',
            description: 'Completed multiple certifications in web development, including HTML, CSS, JavaScript, and responsive design. Continuously expanding knowledge through online courses and practical projects.',
            tags: ['HTML/CSS', 'JavaScript', 'Responsive Design'],
            date: '2023 – 2025',
            icon: 'ach-cert',
            iconClass: 'fas fa-certificate'
        }
    ],

    /* ── Certifications ── */
    certifications: [
        {
            name: 'Web Development Fundamentals',
            body: 'Online Certification',
            icon: 'fab fa-html5',
            desc: 'HTML, CSS, and JavaScript basics'
        },
        {
            name: 'JavaScript Programming',
            body: 'Online Certification',
            icon: 'fab fa-js',
            desc: 'Advanced concepts and frameworks'
        },
        {
            name: 'Python Programming',
            body: 'Online Certification',
            icon: 'fab fa-python',
            desc: 'Core concepts and applications'
        },
        {
            name: 'ADCA Certification',
            body: 'Computer Institute',
            icon: 'fas fa-laptop-code',
            desc: 'Advanced Diploma in Computer Applications'
        }
    ],

    /* ── Social Links (for socials.json view) ── */
    socials: {
        github: 'https://github.com/akashprajapati1232',
        linkedin: 'https://www.linkedin.com/in/akash-prajapati1232/',
        email: 'akashprajapati1232@gmail.com',
        phone: '+91-8115201583',
        website: 'https://akashprajapati.rf.gd/'
    }
};

/* ── File registry: maps filename → metadata ── */
window.FILE_REGISTRY = {
    'README.md':     { lang: 'markdown', folder: 'about',      icon: 'fas fa-file-alt',  iconColor: '#519aba' },
    'profile.json':  { lang: 'json',     folder: 'about',      icon: 'fas fa-file-code', iconColor: '#cbcb41' },
    'projects.md':   { lang: 'markdown', folder: 'projects',   icon: 'fas fa-file-alt',  iconColor: '#519aba' },
    'skills.md':     { lang: 'markdown', folder: 'skills',     icon: 'fas fa-file-alt',  iconColor: '#519aba' },
    'work.md':       { lang: 'markdown', folder: 'experience', icon: 'fas fa-file-alt',  iconColor: '#519aba' },
    'socials.json':  { lang: 'json',     folder: 'contact',    icon: 'fas fa-file-code', iconColor: '#cbcb41' },
    'LICENSE.txt':   { lang: 'text',     folder: 'license',    icon: 'fas fa-file-alt',  iconColor: '#8a8a8a' }
};
