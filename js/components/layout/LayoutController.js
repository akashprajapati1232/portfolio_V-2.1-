/**
 * LayoutController.js
 * Controls sidebars, panels toggling, and global keyboard shortcuts.
 */

import { eventBus } from '../../core/EventBus.js';

class LayoutController {
    constructor() {
        this.initMobileSidebar = this.initMobileSidebar.bind(this);
        this.initLayoutControls = this.initLayoutControls.bind(this);
        this.initKeyboard = this.initKeyboard.bind(this);
    }

    init() {
        this.initMobileSidebar();
        this.initLayoutControls();
        this.initKeyboard();
    }

    initMobileSidebar() {
        const hamburger = document.getElementById('mobile-hamburger');
        const overlay   = document.getElementById('mobile-overlay');
        const sidebar   = document.getElementById('sidebar');

        if (!hamburger) return;

        hamburger.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('mobile-open');
            if (isOpen) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('visible');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                sidebar.classList.add('mobile-open');
                overlay.classList.add('visible');
                hamburger.setAttribute('aria-expanded', 'true');
                hamburger.innerHTML = '<i class="fas fa-times"></i>';
            }
        });

        overlay.addEventListener('click', () => {
            if(sidebar) sidebar.classList.remove('mobile-open');
            if(overlay) overlay.classList.remove('visible');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    }

    initLayoutControls() {
        const layoutLeft = document.getElementById('layout-left');
        const layoutBottom = document.getElementById('layout-bottom');
        const layoutRight = document.getElementById('layout-right');
        const closeJarvis = document.getElementById('close-jarvis');
        
        const sidebar = document.getElementById('sidebar');
        const terminalPanel = document.getElementById('terminal-panel');
        const rightSidebar = document.getElementById('right-sidebar');

        // Toggle Left Sidebar
        if (layoutLeft && sidebar) {
            layoutLeft.addEventListener('click', () => {
                const isHidden = sidebar.classList.toggle('collapsed');
                if (isHidden) {
                    layoutLeft.classList.remove('active');
                } else {
                    layoutLeft.classList.add('active');
                }
            });
        }

        // Toggle Bottom Panel (Terminal) via EventBus
        if (layoutBottom && terminalPanel) {
            layoutBottom.addEventListener('click', () => {
                eventBus.emit('terminal:toggle');
            });
        }

        // Toggle Right Sidebar (Jarvis)
        const toggleRightSidebar = () => {
            if (!rightSidebar || !layoutRight) return;
            const isHidden = rightSidebar.classList.toggle('hidden');
            if (isHidden) {
                layoutRight.classList.remove('active');
            } else {
                layoutRight.classList.add('active');
                eventBus.emit('jarvis:focus');
            }
        };

        if (layoutRight) {
            layoutRight.addEventListener('click', toggleRightSidebar);
        }
        
        if (closeJarvis) {
            closeJarvis.addEventListener('click', () => {
                rightSidebar.classList.add('hidden');
                if (layoutRight) layoutRight.classList.remove('active');
            });
        }
    }

    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                eventBus.emit('terminal:toggle');
            }
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                const sidebar = document.getElementById('sidebar');
                if(sidebar) sidebar.classList.toggle('collapsed');
            }
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobile-overlay');
                const hamburger = document.getElementById('mobile-hamburger');
                if(sidebar) sidebar.classList.remove('mobile-open');
                if(overlay) overlay.classList.remove('visible');
                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    }
}

export const layoutController = new LayoutController();
