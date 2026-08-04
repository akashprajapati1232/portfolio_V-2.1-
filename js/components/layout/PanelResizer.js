/**
 * PanelResizer.js
 * Adds drag handles to resize panels (left sidebar, right sidebar, bottom terminal).
 */

class PanelResizer {
    constructor() {
        this.LIMITS = {
            leftSidebar:  { min: 150, max: 500 },
            rightSidebar: { min: 220, max: 520 },
            terminal:     { min: 80,  max: 420 }
        };
        this.MOBILE_BREAKPOINT = 768;
    }

    isMobile() {
        return window.innerWidth <= this.MOBILE_BREAKPOINT;
    }

    createHandle(cls) {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${cls}`;
        handle.setAttribute('aria-hidden', 'true');
        return handle;
    }

    initLeftSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const handle = this.createHandle('resize-handle-right');
        sidebar.appendChild(handle);

        let startX, startW;

        handle.addEventListener('mousedown', (e) => {
            if (this.isMobile()) return;
            e.preventDefault();
            startX = e.clientX;
            startW = sidebar.getBoundingClientRect().width;
            document.body.classList.add('resizing-h');

            const onMove = (e) => {
                const delta = e.clientX - startX;
                const newW = Math.min(this.LIMITS.leftSidebar.max,
                    Math.max(this.LIMITS.leftSidebar.min, startW + delta));
                sidebar.style.width = newW + 'px';
                document.documentElement.style.setProperty('--sidebar-width', newW + 'px');
            };

            const onUp = () => {
                document.body.classList.remove('resizing-h');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    initRightSidebar() {
        const sidebar = document.getElementById('right-sidebar');
        if (!sidebar) return;

        const handle = this.createHandle('resize-handle-left');
        sidebar.appendChild(handle);

        let startX, startW;

        handle.addEventListener('mousedown', (e) => {
            if (this.isMobile()) return;
            e.preventDefault();
            startX = e.clientX;
            startW = sidebar.getBoundingClientRect().width;
            document.body.classList.add('resizing-h');

            const onMove = (e) => {
                const delta = startX - e.clientX;
                const newW = Math.min(this.LIMITS.rightSidebar.max,
                    Math.max(this.LIMITS.rightSidebar.min, startW + delta));
                sidebar.style.width = newW + 'px';
                document.documentElement.style.setProperty('--right-sidebar-width', newW + 'px');
            };

            const onUp = () => {
                document.body.classList.remove('resizing-h');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    initTerminal() {
        const terminal = document.getElementById('terminal-panel');
        if (!terminal) return;

        const handle = this.createHandle('resize-handle-top');
        terminal.insertBefore(handle, terminal.firstChild);

        let startY, startH;

        handle.addEventListener('mousedown', (e) => {
            if (this.isMobile()) return;
            e.preventDefault();
            startY = e.clientY;
            startH = terminal.getBoundingClientRect().height;
            document.body.classList.add('resizing-v');

            const onMove = (e) => {
                const delta = startY - e.clientY;
                const newH = Math.min(this.LIMITS.terminal.max,
                    Math.max(this.LIMITS.terminal.min, startH + delta));
                terminal.style.height = newH + 'px';
                document.documentElement.style.setProperty('--terminal-height', newH + 'px');
            };

            const onUp = () => {
                document.body.classList.remove('resizing-v');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    handleWindowResize() {
        if (this.isMobile()) {
            const left  = document.getElementById('sidebar');
            const right = document.getElementById('right-sidebar');
            if (left)  left.style.width  = '';
            if (right) right.style.width = '';
            document.documentElement.style.removeProperty('--sidebar-width');
            document.documentElement.style.removeProperty('--right-sidebar-width');
        }
    }

    init() {
        this.initLeftSidebar();
        this.initRightSidebar();
        this.initTerminal();
        window.addEventListener('resize', this.handleWindowResize.bind(this));
    }
}

export const panelResizer = new PanelResizer();
