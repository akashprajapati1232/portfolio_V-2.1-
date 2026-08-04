/**
 * ActivityBar.js
 * Renders the left activity bar of the VS Code-style application.
 */

class ActivityBar {
    render() {
        return `
            <!-- Activity Bar -->
            <aside id="activity-bar" role="navigation" aria-label="Activity bar">
                <div class="activity-bar-top">
                    <button class="activity-btn active" id="act-explorer" data-panel="explorer"
                        title="Explorer (Ctrl+Shift+E)" aria-label="Explorer" aria-pressed="true">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="activity-btn" id="act-search" data-panel="search" title="Search (Ctrl+Shift+F)"
                        aria-label="Search" aria-pressed="false">
                        <i class="fas fa-search"></i>
                    </button>
                    <button class="activity-btn" id="act-git" data-panel="git" title="Source Control (Ctrl+Shift+G)"
                        aria-label="Source Control" aria-pressed="false">
                        <i class="fas fa-code-branch"></i>
                    </button>
                    <button class="activity-btn" id="act-run" data-panel="run" title="Run and Debug (Ctrl+Shift+D)"
                        aria-label="Run and Debug" aria-pressed="false">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="activity-btn" id="act-extensions" data-panel="extensions"
                        title="Extensions (Ctrl+Shift+X)" aria-label="Extensions" aria-pressed="false">
                        <i class="fas fa-th-large"></i>
                    </button>
                </div>
                <div class="activity-bar-bottom">
                    <button class="activity-btn" title="Settings" aria-label="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="activity-btn profile-btn" title="Akash Prajapati" aria-label="Account">
                        <img src="assets/logos/profile.png" alt="Akash Prajapati" class="profile-avatar">
                    </button>
                </div>
            </aside>
        `;
    }
}

export const activityBar = new ActivityBar();
