/**
 * StatusBar.js
 * Renders the bottom status bar of the VS Code-style application.
 */

class StatusBar {
    render() {
        return `
        <!-- Status Bar -->
        <footer id="status-bar" role="contentinfo" aria-label="Status bar">
            <div class="status-left">
                <div class="status-item status-branch" title="Git Branch" aria-label="Git branch: main">
                    <i class="fas fa-code-branch"></i>
                    <span>main</span>
                </div>
                <div class="status-item" title="No Problems" aria-label="No problems">
                    <i class="fas fa-times-circle"></i>
                    <span>0</span>
                    <i class="fas fa-exclamation-triangle" style="margin-left:4px;"></i>
                    <span>0</span>
                </div>
            </div>
            <div class="status-right">
                <div class="status-item" id="status-metric-1" style="display:none;"></div>
                <div class="status-item" id="status-metric-2" style="display:none;"></div>
                <div class="status-item" id="status-metric-3" style="display:none;"></div>
                <div class="status-item" id="status-metric-4" style="display:none;"></div>
                <div class="status-item" id="status-lang" aria-label="Language mode">Markdown</div>
                <div class="status-item status-github" title="View on GitHub" aria-label="View on GitHub">
                    <i class="fab fa-github"></i>
                    <a href="https://github.com/akashprajapati1232" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">akashprajapati1232</a>
                </div>
                <div class="status-item" title="Portfolio Version" aria-label="Portfolio version">v2.1.0</div>
            </div>
        </footer>
        `;
    }
}

export const statusBar = new StatusBar();
