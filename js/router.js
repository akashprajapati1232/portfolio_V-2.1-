/**
 * router.js
 * Lightweight hash-based router.
 * Maps URL hashes to file names so direct links work.
 * e.g. #README.md opens README.md in the editor.
 */

window.Router = (function () {
    'use strict';

    /* Map of hash → file name */
    const ROUTES = {
        '#readme':   'README.md',
        '#profile':  'profile.json',
        '#projects': 'projects.md',
        '#skills':   'skills.md',
        '#work':     'work.md',
        '#contact':  'socials.json',
        '#license':  'LICENSE.txt'
    };

    let _openFileFn = null;

    /* Register the callback that actually opens a file */
    function init(openFileFn) {
        _openFileFn = openFileFn;

        // Handle hash change
        window.addEventListener('hashchange', _handleHash);

        // Handle initial load
        _handleHash();
    }

    function _handleHash() {
        const hash = window.location.hash.toLowerCase();
        if (!hash || hash === '#') return;

        // Direct file name in hash (e.g. #README.md)
        const directFile = hash.slice(1); // remove #
        const knownFiles = Object.keys(window.FILE_REGISTRY || {});
        const found = knownFiles.find(f => f.toLowerCase() === directFile);

        if (found && _openFileFn) {
            _openFileFn(found);
            return;
        }

        // Named route
        const routeFile = ROUTES[hash];
        if (routeFile && _openFileFn) {
            _openFileFn(routeFile);
        }
    }

    /* Navigate to a specific file (updates hash) */
    function navigate(fileName) {
        if (!fileName) return;
        // Use lowercased filename as hash
        const hash = '#' + fileName.toLowerCase().replace(/\s+/g, '-');
        if (window.location.hash !== hash) {
            history.pushState(null, '', hash);
        }
    }

    return { init, navigate };
}());
