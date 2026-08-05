/**
 * DataService.js
 * Handles fetching all JSON data and maintains the global data state.
 */
import { eventBus } from '../core/EventBus.js';

class DataService {
    constructor() {
        this.data = null;
        this.fileRegistry = null;
    }

    async fetchJSON(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
        return res.json();
    }

    async loadAll() {
        try {
            const [
                profile,
                aboutme,
                socials,
                education,
                certifications,
                experience,
                skills,
                services,
                achievements,
                projectsMicro,
                gptForBca,
                imgninja,
                brandify,
                bitbot,
                rozgarsetu,
                scaleiq,
                totalSolution,
                portfolioV2,
            ] = await Promise.all([
                this.fetchJSON('data/profile.json'),
                this.fetchJSON('data/aboutme.json'),
                this.fetchJSON('data/socials.json'),
                this.fetchJSON('data/education.json'),
                this.fetchJSON('data/certifications.json'),
                this.fetchJSON('data/experience.json'),
                this.fetchJSON('data/skills.json'),
                this.fetchJSON('data/services.json'),
                this.fetchJSON('data/achievements.json'),
                this.fetchJSON('data/projects-micro.json'),
                this.fetchJSON('data/projects-production/gpt-for-bca.json'),
                this.fetchJSON('data/projects-production/imgninja.json'),
                this.fetchJSON('data/projects-production/brandify-creator.json'),
                this.fetchJSON('data/projects-production/bitbot-college-chatbot.json'),
                this.fetchJSON('data/projects-production/rozgarsetu.json'),
                this.fetchJSON('data/projects-production/scaleiq.json'),
                this.fetchJSON('data/projects-production/total-solution.json'),
                this.fetchJSON('data/projects-production/portfolio-v2.json'),
            ]);

            const productionProjects = [
                gptForBca, imgninja, brandify, bitbot,
                rozgarsetu, scaleiq, totalSolution, portfolioV2
            ];

            this.data = {
                profile,
                aboutme,
                socials,
                education:       education.education || [],
                certifications:  certifications.certificates || [],
                experience,
                skills,
                services:        services.services || [],
                achievements,
                projectsMicro,
                productionProjects,
            };

            // ── File Registry ──────────────────────────────────────────────────
            // Maps every explorer 'key' to its metadata for breadcrumb + status bar.
            const fileMeta = (lang, folder) => ({ lang, folder });

            this.fileRegistry = {
                // About/
                'README.md':                   { ...fileMeta('markdown', 'About'), displayName: 'README.md' },
                'profile.json':                { ...fileMeta('json', 'About'),     displayName: 'profile.json' },
                'socials.yml':                 { ...fileMeta('yaml', 'About'),     displayName: 'socials.yml' },
                // Education/
                'education.json':              { ...fileMeta('json', 'Education'), displayName: 'education.json' },
                'certifications.tsx':          { ...fileMeta('tsx', 'Education'), displayName: 'certifications.tsx' },
                // Experience/
                'experience.json':             { ...fileMeta('xml', 'Experience'), displayName: 'experience.xml' },
                // Skills/
                'tech-stack.tsx':              { ...fileMeta('tsx', 'Skills'),     displayName: 'tech-stack.tsx' },
                // Services/
                'services.ts':                 { ...fileMeta('ts', 'Services'),    displayName: 'services.ts' },
                // Achievements/
                'achievements.xml':            { ...fileMeta('xml', 'Achievements'), displayName: 'achievements.xml' },
                // Projects/production/
                'gpt-for-bca.json':            { ...fileMeta('json', 'Projects › production'), displayName: 'gpt-for-bca.json' },
                'imgninja.json':               { ...fileMeta('json', 'Projects › production'), displayName: 'imgninja.json' },
                'brandify-creator.json':       { ...fileMeta('json', 'Projects › production'), displayName: 'brandify-creator.json' },
                'bitbot-college-chatbot.json': { ...fileMeta('json', 'Projects › production'), displayName: 'bitbot-college-chatbot.json' },
                'rozgarsetu.json':             { ...fileMeta('json', 'Projects › production'), displayName: 'rozgarsetu.json' },
                'scaleiq.json':                { ...fileMeta('json', 'Projects › production'), displayName: 'scaleiq.json' },
                'total-solution.json':         { ...fileMeta('json', 'Projects › production'), displayName: 'total-solution.json' },
                'portfolio-v2.json':           { ...fileMeta('json', 'Projects › production'), displayName: 'portfolio-v2.json' },
                // Projects/micro/
                'projects-micro.json':         { ...fileMeta('json', 'Projects › micro'),      displayName: 'projects-micro.json' },
                // Root/
                'LICENSE.txt':                 { ...fileMeta('text', ''),         displayName: 'LICENSE.txt' },
                // Config/
                'settings.yml':                { ...fileMeta('yaml', 'config'),   displayName: 'settings.yml' },
            };

            eventBus.emit('portfolioDataReady', this.data);
            return this.data;

        } catch (err) {
            console.error('[DataService] Failed to load portfolio data:', err);
            this.data = {
                profile: {}, aboutme: {}, socials: {},
                education: [], certifications: [], experience: [],
                skills: [], services: [], achievements: [],
                projectsMicro: {}, productionProjects: [],
            };
            this.fileRegistry = {};
            eventBus.emit('portfolioDataReady', this.data);
            return this.data;
        }
    }

    getData()         { return this.data;         }
    getFileRegistry() { return this.fileRegistry; }
}

export const dataService = new DataService();
