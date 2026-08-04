/**
 * dataLoader.js
 * Async JSON-based portfolio data loader.
 * Fetches all data files in parallel, assembles window.PORTFOLIO_DATA
 * and window.FILE_REGISTRY, then dispatches 'portfolioDataReady'.
 *
 * Load order in index.html: this script first (defer), then all others.
 */

(function () {
    'use strict';

    /* ── Data file paths ── */
    const DATA_FILES = {
        profile:          'data/profile.json',
        projects:         'data/projects.json',
        skills:           'data/skills.json',
        education:        'data/education.json',
        certifications:   'data/certifications.json',
        socials:          'data/socials.json'
    };

    /**
     * Fetch a JSON file and return its parsed contents.
     * @param {string} url
     * @returns {Promise<any>}
     */
    function fetchJSON(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to load ' + url + ' (' + res.status + ')');
            }
            return res.json();
        });
    }

    /**
     * Load all data files in parallel and assemble window.PORTFOLIO_DATA.
     */
    function loadAll() {
        var keys   = Object.keys(DATA_FILES);
        var urls   = keys.map(function (k) { return DATA_FILES[k]; });
        var fetches = urls.map(fetchJSON);

        Promise.all(fetches)
            .then(function (results) {
                /* Build the data object that all other modules expect */
                var profile        = results[0];   // profile.json
                var projects       = results[1];   // projects.json
                var skills         = results[2];   // skills.json
                var educationData  = results[3];   // education.json  { education:[], achievements:[] }
                var certifications = results[4];   // certifications.json
                var socials        = results[5];   // socials.json

                /* ── Assemble the flat PORTFOLIO_DATA object ── */
                window.PORTFOLIO_DATA = {
                    person:          profile,
                    education:       educationData.education,
                    achievements:    educationData.achievements,
                    skills:          skills,
                    projects:        projects,
                    certifications:  certifications,
                    socials:         socials,
                    /* Legacy JARVIS config (retained for compatibility) */
                    jarvis: {
                        model:            'gpt-4o',
                        temperature:      0.7,
                        maxTokens:        2048,
                        presencePenalty:  0,
                        frequencyPenalty: 0
                    }
                };

                /* ── File registry: maps filename → metadata ── */
                window.FILE_REGISTRY = {
                    'README.md':    { lang: 'markdown', folder: 'about',      icon: 'fas fa-file-alt',  iconColor: '#519aba' },
                    'profile.json': { lang: 'json',     folder: 'about',      icon: 'fas fa-file-code', iconColor: '#cbcb41' },
                    'projects.md':  { lang: 'markdown', folder: 'projects',   icon: 'fas fa-file-alt',  iconColor: '#519aba' },
                    'skills.md':    { lang: 'markdown', folder: 'skills',     icon: 'fas fa-file-alt',  iconColor: '#519aba' },
                    'work.md':      { lang: 'markdown', folder: 'experience', icon: 'fas fa-file-alt',  iconColor: '#519aba' },
                    'socials.json': { lang: 'json',     folder: 'contact',    icon: 'fas fa-file-code', iconColor: '#cbcb41' },
                    'LICENSE.txt':  { lang: 'text',     folder: 'license',    icon: 'fas fa-file-alt',  iconColor: '#8a8a8a' }
                };

                /* ── Signal that data is ready ── */
                document.dispatchEvent(new CustomEvent('portfolioDataReady'));
            })
            .catch(function (err) {
                console.error('[dataLoader] Failed to load portfolio data:', err);
                /* Dispatch event anyway with empty data so the app doesn't hang */
                window.PORTFOLIO_DATA = { person: {}, education: [], achievements: [],
                    skills: {}, projects: [], certifications: [], socials: {} };
                window.FILE_REGISTRY  = {};
                document.dispatchEvent(new CustomEvent('portfolioDataReady'));
            });
    }

    /* Start loading immediately */
    loadAll();

}());
