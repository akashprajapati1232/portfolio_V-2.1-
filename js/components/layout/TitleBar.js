/**
 * TitleBar.js
 * Renders the top title bar of the VS Code-style application.
 */

class TitleBar {
    render() {
        return `
        <!-- Title Bar -->
        <div id="title-bar" role="banner" aria-label="Title bar">
            <!-- Window Controls (Mac style) -->
            <div class="window-controls" aria-label="Window controls">
                <span class="wc-btn wc-close" aria-label="Close"></span>
                <span class="wc-btn wc-minimize" aria-label="Minimize"></span>
                <span class="wc-btn wc-maximize" aria-label="Maximize"></span>
            </div>

            <!-- Menu Bar -->
            <nav class="menu-bar" role="menubar" aria-label="Menu bar">
                <div class="menu-item" role="menuitem" tabindex="0" aria-haspopup="true" aria-label="File menu">File</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="Edit menu">Edit</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="Selection menu">Selection</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="View menu">View</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="Go menu">Go</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="Run menu">Run</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="Terminal menu">Terminal</div>
                <div class="menu-item" role="menuitem" tabindex="0" aria-label="Help menu">Help</div>
            </nav>

            <!-- Title -->
            <div class="title-bar-title" aria-label="Window title">
                <span class="title-workspace">portfolio-akash</span>
                <span class="title-separator">—</span>
                <span class="title-file-name" id="title-current-file">README.md</span>
            </div>

            <!-- Right Controls -->
            <div class="title-bar-right" aria-label="Title bar right controls">
                <div class="layout-controls" style="display: flex; gap: 4px; margin-right: 10px;">
                    <button class="tb-icon-btn layout-btn active" id="layout-left" title="Toggle Primary Side Bar (Ctrl+B)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
                            <path class="fill-part" d="M1.5 4A1.5 1.5 0 0 1 3 2.5h2.5v11H3A1.5 1.5 0 0 1 1.5 12V4Z" fill="var(--button-primary-background, #007fd4)" />
                            <path d="M5.5 2.5v11" stroke="currentColor" stroke-width="1.2" />
                        </svg>
                    </button>
                    <button class="tb-icon-btn layout-btn active" id="layout-bottom" title="Toggle Panel (Ctrl+J)">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
                            <path class="fill-part" d="M1.5 9.5h13V12a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 1.5 12V9.5Z" fill="var(--button-primary-background, #007fd4)" />
                            <path d="M1.5 9.5h13" stroke="currentColor" stroke-width="1.2" />
                        </svg>
                    </button>
                    <button class="tb-icon-btn layout-btn active" id="layout-right" title="Toggle Secondary Side Bar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
                            <path class="fill-part" d="M10.5 2.5h2.5A1.5 1.5 0 0 1 14.5 4v8a1.5 1.5 0 0 1-1.5 1.5h-2.5V2.5Z" fill="var(--button-primary-background, #007fd4)" />
                            <path d="M10.5 2.5v11" stroke="currentColor" stroke-width="1.2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

export const titleBar = new TitleBar();
