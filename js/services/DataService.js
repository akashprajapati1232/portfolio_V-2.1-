/**
 * DataService.js
 * Handles fetching all JSON data and maintains the global data state.
 */
import { eventBus } from '../core/EventBus.js';

class DataService {
    constructor() {
        this.data = null;
        this.fileRegistry = null;
        this.DATA_FILES = {
            profile:          'about/profile.json',
            projects:         'data/projects.json',
            skills:           'data/skills.json',
            education:        'data/education.json',
            certifications:   'data/certifications.json',
            socials:          'data/socials.json'
        };
    }

    async fetchJSON(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
        return res.json();
    }

    async loadAll() {
        const keys = Object.keys(this.DATA_FILES);
        const urls = keys.map(k => this.DATA_FILES[k]);
        
        try {
            const results = await Promise.all(urls.map(url => this.fetchJSON(url)));
            
            const profile        = results[0];
            const projects       = results[1];
            const skills         = results[2];
            const educationData  = results[3];
            const certifications = results[4];
            const socials        = results[5];

            this.data = {
                person:          profile,
                education:       educationData.education,
                achievements:    educationData.achievements,
                skills:          skills,
                projects:        projects,
                certifications:  certifications,
                socials:         socials,
                jarvis: {
                    model:            'gpt-4o',
                    temperature:      0.7,
                    maxTokens:        2048,
                    presencePenalty:  0,
                    frequencyPenalty: 0
                }
            };

            this.fileRegistry = {
                'README.md':          { lang: 'markdown', folder: 'about',     icon: 'fas fa-file-alt',  iconColor: '#519aba' },
                'profile.json':       { lang: 'json',     folder: 'about',     icon: 'fas fa-file-code', iconColor: '#cbcb41' },
                'education.md':       { lang: 'markdown', folder: 'Education', icon: 'fas fa-file-alt',  iconColor: '#519aba' },
                'certificates.json':  { lang: 'json',     folder: 'Education', icon: 'fas fa-file-code', iconColor: '#cbcb41' },
                'skills.json':        { lang: 'json',     folder: 'Skills',    icon: 'fas fa-file-code', iconColor: '#cbcb41' },
                'projects.md':        { lang: 'markdown', folder: 'OurWork',   icon: 'fas fa-file-alt',  iconColor: '#519aba' },
            };

            eventBus.emit('portfolioDataReady', this.data);
            return this.data;
        } catch (err) {
            console.error('[DataService] Failed to load portfolio data:', err);
            this.data = { person: {}, education: [], achievements: [], skills: {}, projects: [], certifications: [], socials: {} };
            this.fileRegistry = {};
            eventBus.emit('portfolioDataReady', this.data);
            return this.data;
        }
    }

    getData() {
        return this.data;
    }

    getFileRegistry() {
        return this.fileRegistry;
    }
}

export const dataService = new DataService();
