/**
 * resize.js – VS Code-style resizable panel handles
 * Adds drag handles to: left sidebar, right sidebar, bottom terminal.
 * Public API via window.PanelResizer: init()
 */

window.PanelResizer = (function () {
    'use strict';

    const LIMITS = {
        leftSidebar:  { min: 150, max: 500 },
        rightSidebar: { min: 220, max: 520 },
        terminal:     { min: 80,  max: 420 }
    };

    const MOBILE_BREAKPOINT = 768;

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    /* ── Generic draggable resize handle creator ── */
    function createHandle(cls) {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${cls}`;
        handle.setAttribute('aria-hidden', 'true');
        return handle;
    }

    /* ── Left Sidebar (resize right edge) ── */
    function initLeftSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const handle = createHandle('resize-handle-right');
        sidebar.appendChild(handle);

        let startX, startW;

        handle.addEventListener('mousedown', (e) => {
            if (isMobile()) return;
            e.preventDefault();
            startX = e.clientX;
            startW = sidebar.getBoundingClientRect().width;
            document.body.classList.add('resizing-h');

            function onMove(e) {
                const delta = e.clientX - startX;
                const newW = Math.min(LIMITS.leftSidebar.max,
                    Math.max(LIMITS.leftSidebar.min, startW + delta));
                sidebar.style.width = newW + 'px';
                document.documentElement.style.setProperty('--sidebar-width', newW + 'px');
            }

            function onUp() {
                document.body.classList.remove('resizing-h');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ── Right Sidebar (resize left edge) ── */
    function initRightSidebar() {
        const sidebar = document.getElementById('right-sidebar');
        if (!sidebar) return;

        const handle = createHandle('resize-handle-left');
        sidebar.appendChild(handle);

        let startX, startW;

        handle.addEventListener('mousedown', (e) => {
            if (isMobile()) return;
            e.preventDefault();
            startX = e.clientX;
            startW = sidebar.getBoundingClientRect().width;
            document.body.classList.add('resizing-h');

            function onMove(e) {
                const delta = startX - e.clientX;
                const newW = Math.min(LIMITS.rightSidebar.max,
                    Math.max(LIMITS.rightSidebar.min, startW + delta));
                sidebar.style.width = newW + 'px';
            }

            function onUp() {
                document.body.classList.remove('resizing-h');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ── Bottom Terminal (resize top edge) ── */
    function initTerminal() {
        const terminal = document.getElementById('terminal-panel');
        if (!terminal) return;

        const handle = createHandle('resize-handle-top');
        terminal.insertBefore(handle, terminal.firstChild);

        let startY, startH;

        handle.addEventListener('mousedown', (e) => {
            if (isMobile()) return;
            e.preventDefault();
            startY = e.clientY;
            startH = terminal.getBoundingClientRect().height;
            document.body.classList.add('resizing-v');

            function onMove(e) {
                const delta = startY - e.clientY;
                const newH = Math.min(LIMITS.terminal.max,
                    Math.max(LIMITS.terminal.min, startH + delta));
                terminal.style.height = newH + 'px';
                document.documentElement.style.setProperty('--terminal-height', newH + 'px');
            }

            function onUp() {
                document.body.classList.remove('resizing-v');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ── Reset widths on mobile ── */
    function handleWindowResize() {
        if (isMobile()) {
            const left  = document.getElementById('sidebar');
            const right = document.getElementById('right-sidebar');
            if (left)  left.style.width  = '';
            if (right) right.style.width = '';
            document.documentElement.style.removeProperty('--sidebar-width');
        }
    }

    function init() {
        initLeftSidebar();
        initRightSidebar();
        initTerminal();
        window.addEventListener('resize', handleWindowResize);
    }

    return { init };
}());
