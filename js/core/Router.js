/**
 * Router.js
 * Lightweight hash-based router as an ES6 Module.
 * Maps URL hashes to file names and communicates via EventBus.
 */

import { eventBus } from './EventBus.js';
import { dataService } from '../services/DataService.js';

class Router {
    constructor() {
        this.ROUTES = {
            '#readme':   'README.md',
            '#profile':  'profile.json',
            '#projects': 'projects.md',
            '#skills':   'skills.md',
            '#work':     'work.md',
            '#contact':  'socials.json',
            '#license':  'LICENSE.txt'
        };
        this.handleHash = this.handleHash.bind(this);
    }

    init() {
        // Force clean state on load/refresh
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
        window.addEventListener('hashchange', this.handleHash);
    }

    handleHash() {
        const hash = window.location.hash.toLowerCase();
        if (!hash || hash === '#') return;

        const directFile = hash.slice(1); // remove #
        const registry = dataService.getFileRegistry() || {};
        const knownFiles = Object.keys(registry);
        const found = knownFiles.find(f => f.toLowerCase() === directFile);

        if (found) {
            eventBus.emit('file:open', found);
            return;
        }

        const routeFile = this.ROUTES[hash];
        if (routeFile) {
            eventBus.emit('file:open', routeFile);
        }
    }

    navigate(fileName) {
        if (!fileName) return;
        const hash = '#' + fileName.toLowerCase().replace(/\s+/g, '-');
        if (window.location.hash !== hash) {
            history.pushState(null, '', hash);
        }
    }
}

export const router = new Router();
