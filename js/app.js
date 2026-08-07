/**
 * app.js
 * Main application orchestrator for the modular ES6 portfolio.
 */

import { dataService } from './services/DataService.js';
import { eventBus } from './core/EventBus.js';
import { router } from './core/Router.js';
import { tabManager } from './components/tabs/TabManager.js';
import { layoutController } from './components/layout/LayoutController.js';
import { explorer } from './components/explorer/Explorer.js';
import { terminal } from './components/terminal/Terminal.js';
import { echoAI } from './components/ai/EchoAI.js';
import { panelResizer } from './components/layout/PanelResizer.js';
import { markdownRenderer } from './components/markdown/MarkdownRenderer.js';
import { titleBar } from './components/layout/TitleBar.js';
import { activityBar } from './components/layout/ActivityBar.js';
import { statusBar } from './components/layout/StatusBar.js';

class App {
    constructor() {
        this.CONTENT_BUILDERS = {
            // About/
            'README.md': this.buildAboutMe.bind(this),
            'profile.json': this.buildProfileJson.bind(this),
            'socials.db': this.buildSocialsDb.bind(this),
            // Education/
            'education.html': this.buildEducation.bind(this),
            'certifications.tsx': this.buildCertifications.bind(this),
            // Experience/
            'experience.json': this.buildExperience.bind(this),
            // Skills/
            'tech-stack.tsx': this.buildSkills.bind(this),
            // Services/
            'services.ts': this.buildServices.bind(this),
            // Achievements/
            'achievements.html': this.buildAchievements.bind(this),
            // Projects/production/ — in user-specified order (01–08)
            'imgninja.json': this.buildProductionProject.bind(this, 'imgninja.json'),
            'bitbot-college-chatbot.json': this.buildProductionProject.bind(this, 'bitbot-college-chatbot.json'),
            'brandify-creator.json': this.buildProductionProject.bind(this, 'brandify-creator.json'),
            'total-solution.json': this.buildProductionProject.bind(this, 'total-solution.json'),
            'gpt-for-bca.json': this.buildProductionProject.bind(this, 'gpt-for-bca.json'),
            'rozgarsetu.json': this.buildProductionProject.bind(this, 'rozgarsetu.json'),
            'scaleiq.json': this.buildProductionProject.bind(this, 'scaleiq.json'),
            'portfolio-v2.json': this.buildProductionProject.bind(this, 'portfolio-v2.json'),
            // Projects/micro/
            'projects-micro.json': this.buildMicroProjects.bind(this),
            // Root/Config
            'settings.yml': this.buildSettings.bind(this),
            // life/
            'lessons.md': this.buildLessonsMd.bind(this),
            'books.md': this.buildBooksMd.bind(this),
            'goals.json': this.buildGoalsJson.bind(this),
            'life.config': this.buildLifeConfig.bind(this),
            '.gitignore': this.buildGitignore.bind(this),
            'package.json': this.buildPackageJson.bind(this),
            'CHANGELOG.md': this.buildChangelogMd.bind(this),
            'LICENSE.txt': this.buildLicenseTxt.bind(this),
        };
    }

    // =========================================================================
    // Initialization & Setup
    // =========================================================================

    init() {
        this.renderUI();
        eventBus.on('portfolioDataReady', this.boot.bind(this));
        dataService.loadAll();
    }

    renderUI() {
        const appContainer = document.getElementById('vscode-app');
        if (!appContainer) return;

        appContainer.innerHTML = `
            ${titleBar.render()}
            <div id="main-layout">
                ${activityBar.render()}
                ${explorer.render()}
                <main id="editor-container" role="main" aria-label="Editor area">
                    ${tabManager.render()}
                    ${terminal.render()}
                </main>
                ${echoAI.render()}
            </div>
            ${statusBar.render()}
        `;
    }

    boot() {
        explorer.init();
        tabManager.init();
        router.init();
        terminal.init();
        echoAI.init();
        panelResizer.init();
        layoutController.init();

        window.openFile = (fileName) => {
            eventBus.emit('file:open', fileName);
        };

        eventBus.on('file:switched', this.openFile.bind(this));
        eventBus.on('file:closedAll', this.showWelcome.bind(this));

        // Start in a clean, empty state
        this.showWelcome();

        setTimeout(() => {
            const leftSidebar = document.getElementById('sidebar');
            const rightSidebar = document.getElementById('right-sidebar');
            if (leftSidebar) leftSidebar.classList.remove('collapsed');
            if (rightSidebar) rightSidebar.classList.remove('hidden');
        }, 50);
    }

    // =========================================================================
    // Editor UI State Management
    // =========================================================================

    openFile(fileName) {
        if (!fileName) { this.showWelcome(); return; }

        const editorContent = document.getElementById('editor-content');
        if (!editorContent) return;

        editorContent.querySelectorAll('.editor-pane').forEach(p => p.style.display = 'none');

        let pane = editorContent.querySelector(`.editor-pane[data-file="${fileName}"]`);
        if (!pane) {
            pane = document.createElement('div');
            pane.className = 'editor-pane';
            pane.setAttribute('data-file', fileName);
            pane.style.display = 'block';

            const builder = this.CONTENT_BUILDERS[fileName];
            if (builder) {
                pane.innerHTML = builder();
            } else {
                pane.innerHTML = `<div class="welcome-screen">
                    <div class="welcome-icon">📄</div>
                    <h2>No preview available</h2>
                    <p>This file type is not yet supported.</p>
                </div>`;
            }
            editorContent.appendChild(pane);
        } else {
            pane.style.display = 'block';
        }

        this.updateBreadcrumb(fileName);

        const editorWrap = document.getElementById('editor-wrap');
        if (editorWrap) editorWrap.scrollTop = 0;

        requestAnimationFrame(() => {
            this.updateLineNumbers(pane);
            this.updateStatusBarMetrics(fileName, pane);
        });

        router.navigate(fileName);
    }

    showWelcome() {
        const editorContent = document.getElementById('editor-content');
        if (editorContent) {
            editorContent.querySelectorAll('.editor-pane').forEach(p => p.style.display = 'none');
            let welcomePane = editorContent.querySelector('.editor-pane[data-file="welcome"]');
            if (!welcomePane) {
                welcomePane = document.createElement('div');
                welcomePane.className = 'editor-pane';
                welcomePane.setAttribute('data-file', 'welcome');
                welcomePane.innerHTML = `
                    <div class="welcome-screen">
                        <div class="welcome-icon">💻</div>
                        <h2>Welcome to Akash's Portfolio</h2>
                        <p>Click any file in the Explorer to get started</p>
                        <div style="margin-top:16px;">
                            <div class="badges-row" style="justify-content:center;gap:8px;">
                                <span class="badge badge-blue" onclick="window.openFile('README.md')" style="cursor:pointer;">📄 README.md</span>
                                <span class="badge badge-yellow" onclick="window.openFile('tech-stack.tsx')" style="cursor:pointer;">🛠️ tech-stack.tsx</span>
                                <span class="badge badge-green" onclick="window.openFile('education.html')" style="cursor:pointer;">🎓education.html</span>
                            </div>
                        </div>
                    </div>`;
                editorContent.appendChild(welcomePane);
            }
            welcomePane.style.display = 'flex';
            welcomePane.style.flexDirection = 'column';
            welcomePane.style.alignItems = 'center';
            welcomePane.style.justifyContent = 'center';
            welcomePane.style.height = '100%';
        }
        const bcFolder = document.querySelector('.bc-item.bc-folder');
        const bcFile = document.getElementById('bc-current');
        const titleFile = document.getElementById('title-current-file');
        if (bcFolder) bcFolder.textContent = '';
        if (bcFile) bcFile.textContent = 'No file open';
        if (titleFile) titleFile.textContent = 'Welcome';
    }

    updateBreadcrumb(fileName) {
        const reg = dataService.getFileRegistry() || {};
        const fileInfo = reg[fileName] || {};
        const folder = fileInfo.folder || '';
        const bcFolder = document.querySelector('.bc-item.bc-folder');
        const bcFile = document.getElementById('bc-current');
        const titleFile = document.getElementById('title-current-file');
        if (bcFolder) bcFolder.textContent = folder;
        if (bcFile) bcFile.textContent = fileName;
        if (titleFile) titleFile.textContent = fileName;
    }

    updateStatusBarMetrics(fileName, contentEl) {
        const m1 = document.getElementById('status-metric-1');
        const m2 = document.getElementById('status-metric-2');
        const m3 = document.getElementById('status-metric-3');
        const m4 = document.getElementById('status-metric-4');
        const langEl = document.getElementById('status-lang');

        if (!m1 || !m2 || !m3 || !m4 || !langEl) return;

        [m1, m2, m3, m4].forEach(el => el.style.display = 'none');

        const ext = (fileName.split('.').pop() || '').toLowerCase();
        let approxLines = 1;
        if (contentEl) {
            approxLines = Math.max(40, Math.ceil(contentEl.scrollHeight / (14 * 1.6)));
        }

        if (ext === 'md') {
            langEl.textContent = 'Markdown';
            m1.textContent = 'UTF-8'; m1.style.display = 'flex';
            m2.textContent = 'LF'; m2.style.display = 'flex';
            m3.textContent = approxLines + ' Lines'; m3.style.display = 'flex';
        } else if (ext === 'json') {
            langEl.textContent = 'JSON';
            const objCount = Math.max(2, Math.floor(approxLines / 4));
            m1.textContent = objCount + ' Objects'; m1.style.display = 'flex';
            m2.textContent = 'UTF-8'; m2.style.display = 'flex';
        } else if (ext === 'db') {
            langEl.textContent = 'SQLite';
            m1.textContent = 'Connected'; m1.style.display = 'flex';
            m2.textContent = '6 Rows'; m2.style.display = 'flex';
        } else if (ext === 'tsx' || ext === 'ts') {
            langEl.textContent = ext === 'tsx' ? 'TypeScript React' : 'TypeScript';
            m1.textContent = 'Compiled'; m1.style.display = 'flex';
            m2.textContent = 'No Errors'; m2.style.display = 'flex';
        } else if (ext === 'html') {
            langEl.textContent = 'HTML';
            m1.textContent = 'UTF-8'; m1.style.display = 'flex';
            m2.textContent = 'LF'; m2.style.display = 'flex';
            m3.textContent = 'Validated'; m3.style.display = 'flex';
        } else if (ext === 'xml') {
            langEl.textContent = 'XML';
            m1.textContent = 'Well-Formed'; m1.style.display = 'flex';
            m2.textContent = 'UTF-8'; m2.style.display = 'flex';
        } else if (ext === 'yml' || ext === 'yaml') {
            langEl.textContent = 'YAML';
            m1.textContent = 'UTF-8'; m1.style.display = 'flex';
            m2.textContent = 'Parsed'; m2.style.display = 'flex';
        } else if (ext === 'log') {
            langEl.textContent = 'Log';
            m1.textContent = 'UTF-8'; m1.style.display = 'flex';
            m2.textContent = 'Read-Only'; m2.style.display = 'flex';
            m3.textContent = approxLines + ' Lines'; m3.style.display = 'flex';
        } else {
            langEl.textContent = 'Plain Text';
            m1.textContent = 'UTF-8'; m1.style.display = 'flex';
            m2.textContent = 'LF'; m2.style.display = 'flex';
            m3.textContent = 'Ln 1, Col 1'; m3.style.display = 'flex';
        }
    }

    updateLineNumbers(contentEl) {
        const lineNumEl = document.getElementById('line-numbers');
        if (!lineNumEl || !contentEl) return;
        const approxLines = Math.max(40, Math.ceil(contentEl.scrollHeight / (14 * 1.6)));
        const nums = [];
        for (let i = 1; i <= approxLines; i++) nums.push(i);
        lineNumEl.innerHTML = nums.join('<br>');
    }

    // =========================================================================
    // Shared Helpers
    // =========================================================================

    _jsonBlock(obj) {
        return `<div class="json-viewer">${markdownRenderer.highlightJSON(obj)}</div>`;
    }

    _tagList(tags = []) {
        return tags.map(t => `<span class="project-card-tag">${t}</span>`).join('');
    }

    _techBadges(items = []) {
        return items.map(t => `<span class="ach-tag">${t}</span>`).join('');
    }

    // =========================================================================
    // Content Builders — profile/
    // =========================================================================

    buildProfileJson() {
        const d = dataService.getData();
        const p = d.profile || {};
        return `<div class="md-content">
            ${this._jsonBlock(p)}
        </div>`;
    }

    buildAboutMe() {
        const d = dataService.getData();
        const a = d.aboutme || {};

        const paras = (a.content || []).map(c => `<p class="md-p" style="font-size: 1em; line-height: 1.6;">${c}</p>`).join('');
        const philosophy = (a.learningPhilosophy || []).map(p => `<li style="margin-bottom:8px;color:var(--clr-text-secondary);"><i class="fas fa-check-circle" style="color:#6a9955;margin-right:8px;"></i>${p}</li>`).join('');
        const currentFocus = (a.currentFocus || []).map(f => `<span class="badge badge-yellow" style="margin:4px;"><i class="fas fa-crosshairs"></i> ${f}</span>`).join('');
        const interests = (a.interests || []).map(i => `<span class="badge badge-blue" style="margin:4px;"><i class="fas fa-heart"></i> ${i}</span>`).join('');
        const currentlyLearning = (a.currentlyLearning || []).map(i => `<span class="badge badge-green" style="margin:4px;"><i class="fas fa-book-open"></i> ${i}</span>`).join('');

        return `
        <style>
            .typing-cursor {
                display: inline-block;
                width: 10px;
                height: 1.1em;
                background-color: var(--clr-accent, #61afef);
                vertical-align: text-bottom;
                animation: blink 1s step-end infinite;
                margin-left: 8px;
            }
            @keyframes blink { 50% { opacity: 0; } }
            
            .github-section {
                margin: 16px 0;
                padding: 16px;
                background: var(--clr-bg-dark);
                border: 1px solid var(--clr-border);
                border-radius: 8px;
            }
            .github-section h2 {
                margin-top: 0;
                border-bottom: 1px solid var(--clr-border);
                padding-bottom: 10px;
                font-size: 1.25em;
            }
            .readme-section .md-h1::before,
            .readme-section .md-h2::before {
                display: none;
                content: none;
            }
        </style>
        <div class="md-content readme-section">
            <h1 class="md-h1" style="font-size: 2.2em; border-bottom: none; display: flex; align-items: center; margin-bottom: 10px;">
                 # AKASH PRAJAPATI<span class="typing-cursor"></span>
            </h1>
            
            <div style="margin-bottom: 20px;">
                ${paras}
            </div>

            <div class="github-section">
                <h2 class="md-h2"><i class="fas fa-brain" style="margin-right:8px; color:var(--clr-accent);"></i>Learning Philosophy</h2>
                <ul style="list-style-type:none; padding-left:0; margin-bottom:0;">${philosophy}</ul>
            </div>

            <div class="github-section">
                <h2 class="md-h2"><i class="fas fa-bullseye" style="margin-right:8px; color:#e5c07b;"></i>Current Focus</h2>
                <div style="display:flex; flex-wrap:wrap; margin-top:12px;">${currentFocus}</div>
            </div>

            <div class="github-section">
                <h2 class="md-h2"><i class="fas fa-star" style="margin-right:8px; color:#519aba;"></i>Interests</h2>
                <div style="display:flex; flex-wrap:wrap; margin-top:12px;">${interests}</div>
            </div>

            <div class="github-section">
                <h2 class="md-h2"><i class="fas fa-laptop-code" style="margin-right:8px; color:#6a9955;"></i>Currently Learning</h2>
                <div style="display:flex; flex-wrap:wrap; margin-top:12px;">${currentlyLearning}</div>
            </div>

            <div class="github-section">
                <h2 class="md-h2"><i class="fab fa-osi" style="margin-right:8px; color:#c678dd;"></i>Open Source</h2>
                <p class="md-p" style="color:var(--clr-text-secondary); margin-bottom:0;">${a.openSource || ''}</p>
            </div>

            <div class="github-section">
                <h2 class="md-h2"><i class="fas fa-users" style="margin-right:8px; color:#e06c75;"></i>Collaboration</h2>
                <p class="md-p" style="color:var(--clr-text-secondary); margin-bottom:0;">${a.collaboration || ''}</p>
            </div>
            
            <div class="github-section">
                <h2 class="md-h2"><i class="fas fa-flag-checkered" style="margin-right:8px; color:#98c379;"></i>Goal</h2>
                <p class="md-p" style="color:var(--clr-text-secondary); font-weight: 500; margin-bottom:0;">${a.goal || ''}</p>
            </div>

            <blockquote style="margin: 20px 0; padding: 16px 20px; background: rgba(97, 175, 239, 0.1); border-left: 4px solid var(--clr-accent); border-radius: 0 8px 8px 0; font-size: 1.1em; font-style: italic; color: var(--clr-accent);">
                <i class="fas fa-quote-left" style="margin-right: 10px; opacity: 0.5;"></i> ${a.quote || ''}
            </blockquote>
        </div>`;
    }

    buildSocialsDb() {
        return `
        <style>
            /* ── socials.db — VS Code editor style ── */
            .sdb-meta {
                background: var(--clr-surface2, #1a1a2e);
                border: 1px solid var(--clr-border, #333);
                border-radius: 6px;
                padding: 14px 18px;
                font-family: 'Fira Code', 'Consolas', monospace;
                font-size: 13px;
                color: var(--clr-text-secondary, #a0a0b0);
                margin-bottom: 20px;
                line-height: 1.8;
            }
            .sdb-meta-row { display: flex; gap: 8px; }
            .sdb-meta-key { color: #6c7086; min-width: 80px; }
            .sdb-meta-val { color: var(--clr-text, #cdd6f4); }
            .sdb-meta-val.connected { color: #a6e3a1; }

            .sdb-editor {
                background: var(--clr-bg-dark, #0d1117);
                border: 1px solid var(--clr-border, #333);
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 20px;
                font-family: 'Fira Code', 'Consolas', monospace;
            }
            .sdb-editor-bar {
                background: var(--clr-surface2, #1a1a2e);
                border-bottom: 1px solid var(--clr-border, #333);
                padding: 6px 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 11px;
                color: #6c7086;
            }
            .sdb-editor-run {
                display: flex;
                align-items: center;
                gap: 5px;
                color: #a6e3a1;
                font-size: 11px;
                cursor: pointer;
                transition: color 0.2s;
            }
            .sdb-editor-run:hover {
                color: #fff;
            }
            .sdb-editor-code {
                padding: 16px 18px;
                font-size: 13px;
                line-height: 1.8;
                color: var(--clr-text, #cdd6f4);
            }
            .sdb-kw  { color: #c678dd; font-weight: 600; }
            .sdb-id  { color: #61afef; }
            .sdb-val { color: #98c379; }
            .sdb-op  { color: #e06c75; }
            .sdb-ln  { color: #444; user-select: none; display: inline-block; width: 28px; text-align: right; margin-right: 14px; }

            .sdb-result {
                background: var(--clr-bg-dark, #0d1117);
                border: 1px solid var(--clr-border, #333);
                border-radius: 6px;
                overflow: hidden;
                font-family: 'Fira Code', 'Consolas', monospace;
                font-size: 12.5px;
            }
            .sdb-result-bar {
                background: var(--clr-surface2, #1a1a2e);
                border-bottom: 1px solid var(--clr-border, #333);
                padding: 6px 14px;
                font-size: 11px;
                color: #6c7086;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .sdb-result-bar .dot { width: 7px; height: 7px; border-radius: 50%; background: #a6e3a1; display: inline-block; }
            .sdb-hint {
                padding: 20px 18px;
                color: #6c7086;
                font-size: 12px;
                font-style: italic;
            }
            #sdb-result-panel.running .sdb-hint {
                display: none;
            }
            .sdb-loading {
                display: none;
                padding: 20px 18px;
                color: #a6e3a1;
                font-size: 12px;
            }
            #sdb-result-panel.running .sdb-loading {
                display: block;
                animation: sdbHideLoading 0s ease-in 1.6s forwards;
            }
            @keyframes sdbHideLoading {
                to { opacity: 0; height: 0; padding: 0; margin: 0; overflow: hidden; }
            }
            #sdb-result-panel.running .sdb-loading::after {
                content: 'Executing query';
                animation: sdbDots 1.6s steps(4, end) forwards;
            }
            @keyframes sdbDots {
                0%   { content: 'Executing query'; }
                25%  { content: 'Executing query.'; }
                50%  { content: 'Executing query..'; }
                75%  { content: 'Executing query...'; }
                100% { content: 'Executing query...'; }
            }
            .sdb-output {
                display: none;
                padding: 14px 18px;
                opacity: 0;
            }
            #sdb-result-panel.running .sdb-output {
                display: block;
                animation: sdbFadeIn 0.3s ease-in 1.6s forwards;
            }
            @keyframes sdbFadeIn { to { opacity: 1; } }
            .sdb-ascii {
                color: var(--clr-text-secondary, #a0a0b0);
                white-space: pre;
                line-height: 1.6;
                margin: 0;
                overflow-x: auto;
            }
            .sdb-ascii a { color: #61afef; text-decoration: none; }
            .sdb-ascii a:hover { text-decoration: underline; }
            .sdb-stat {
                margin-top: 12px;
                font-size: 11px;
                color: #585b70;
            }
            .sdb-stat .ok { color: #a6e3a1; margin-right: 8px; }
        </style>

        <div class="md-content">

            <!-- DB metadata -->
            <div class="sdb-meta">
                <div class="sdb-meta-row"><span class="sdb-meta-key">Database :</span><span class="sdb-meta-val">socials.db</span></div>
                <div class="sdb-meta-row"><span class="sdb-meta-key">Table    :</span><span class="sdb-meta-val">socials</span></div>
                <div class="sdb-meta-row"><span class="sdb-meta-key">Status   :</span><span class="sdb-meta-val connected">● Connected</span></div>
                <div class="sdb-meta-row"><span class="sdb-meta-key">Rows     :</span><span class="sdb-meta-val">6</span></div>
            </div>

            <!-- SQL editor -->
            <div class="sdb-editor">
                <div class="sdb-editor-bar">
                    <span><i class="fas fa-database" style="margin-right:6px;color:#c678dd;"></i>SQL Query Runner</span>
                    <span class="sdb-editor-run" onclick="document.getElementById('sdb-result-panel').classList.add('running')"><i class="fas fa-play"></i> Run</span>
                </div>
                <div class="sdb-editor-code">
                    <span class="sdb-ln">1</span><span class="sdb-kw">SELECT</span> <span class="sdb-id">id</span>, <span class="sdb-id">platform</span>, <span class="sdb-id">value</span><br>
                    <span class="sdb-ln">2</span><span class="sdb-kw">FROM</span>   <span class="sdb-id">socials</span><br>
                    <span class="sdb-ln">3</span><span class="sdb-kw">ORDER BY</span> <span class="sdb-id">platform</span> <span class="sdb-kw">ASC</span>;
                </div>
            </div>

            <!-- Query result -->
            <div class="sdb-result" id="sdb-result-panel">
                <div class="sdb-result-bar">
                    <span class="dot"></span>
                    <span>Results</span>
                </div>
                <div class="sdb-hint"><i class="fas fa-info-circle" style="margin-right: 6px;"></i> Click "Run" to execute query</div>
                <div class="sdb-loading"></div>
                <div class="sdb-output">
<pre class="sdb-ascii">+----+-----------+----------------------------------------------+
| id | platform  | value                                        |
+----+-----------+----------------------------------------------+
| 1  | GitHub    | <a href="https://github.com/akashprajapati1232" target="_blank" rel="noopener noreferrer">github.com/akashprajapati1232</a>                |
| 2  | LinkedIn  | <a href="https://linkedin.com/in/akash-prajapati1232" target="_blank" rel="noopener noreferrer">linkedin.com/in/akash-prajapati1232</a>          |
| 3  | Instagram | <a href="https://instagram.com/akash.prajapati1232" target="_blank" rel="noopener noreferrer">instagram.com/akash.prajapati1232</a>            |
| 4  | Email     | <a href="mailto:akashprajapati1232@gmail.com">akashprajapati1232@gmail.com</a>                 |
| 5  | Phone     | <a href="tel:+918115201583">+91 8115201583</a>                               |
| 6  | Website   | <a href="https://akashprajapati.rf.gd" target="_blank" rel="noopener noreferrer">akashprajapati.rf.gd</a>                         |
+----+-----------+----------------------------------------------+</pre>
                    <div class="sdb-stat"><span class="ok">✓</span>6 rows returned (0.002 sec)</div>
                </div>
            </div>
        </div>`;
    }


    // Content Builders — education/
    // =========================================================================

    buildEducation() {
        const d = dataService.getData();
        const eduHtml = (d.education || []).map(edu => `
            <div class="timeline-item">
                <div class="timeline-title">${edu.degree}</div>
                <div class="timeline-date">${edu.institution}, ${edu.location} · ${edu.period}</div>
                <div class="timeline-desc">${edu.description}</div>
            </div>`).join('');
        return `<div class="md-content">
            <h1 class="md-h1">🎓 Education</h1>
            <p class="md-p">Academic background and qualifications.</p>
            <div class="timeline">${eduHtml}</div>
        </div>`;
    }

    buildCertifications() {
        const d = dataService.getData();
        const certs = d.certifications || [];
        const certsHtml = certs.map(c => `
            <div class="project-card">
                ${c.image ? `<img src="${c.image}" alt="${c.title}" class="project-card-img" style="object-fit: cover;" />` : ''}
                <div class="project-card-body">
                    <div class="project-card-title">${c.title}</div>
                    <div class="project-card-desc">
                        <div style="font-weight: 600; color: #4fc1ff; margin-bottom: 6px;">${c.issuer}</div>
                        ${c.category ? `<div style="margin-bottom:2px;"><strong>Category:</strong> ${c.category}</div>` : ''}
                        ${c.issueDate ? `<div style="margin-bottom:2px;"><strong>Issued:</strong> ${c.issueDate}</div>` : ''}
                        ${c.duration ? `<div style="margin-bottom:2px;"><strong>Duration:</strong> ${c.duration}</div>` : ''}
                        ${c.grade ? `<div style="margin-bottom:2px;"><strong>Grade:</strong> ${c.grade}</div>` : ''}
                        ${c.score ? `<div style="margin-bottom:2px;"><strong>Score:</strong> ${c.score}</div>` : ''}
                        ${c.credentialId ? `<div style="margin-bottom:2px;"><strong>Credential ID:</strong> ${c.credentialId}</div>` : ''}
                        ${c.achievement ? `<div style="margin-bottom:2px;"><strong>Achievement:</strong> ${c.achievement}</div>` : ''}
                        <div style="margin-top: 10px; color: var(--text-secondary); line-height: 1.5;">${c.description || ''}</div>
                    </div>
                    <div class="project-card-tags">
                        ${this._tagList(c.skills || [])}
                    </div>
                    ${c.verified ? `<div style="color: #4ec9b0; font-size: 11px; margin-top: 8px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;"><i class="fas fa-check-circle"></i> Verified Credential</div>` : ''}
                    <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="project-card-link link-live view-cert-btn" data-image="${c.image}" style="cursor: pointer; border: none; font-size: 12px; padding: 6px 14px;"><i class="fas fa-eye"></i> View</button>
                        <a href="${c.image}" download class="project-card-link link-github" style="font-size: 12px; padding: 6px 14px;"><i class="fas fa-download"></i> Download</a>
                    </div>
                </div>
            </div>`).join('');
        return `<div class="md-content">
            <h1 class="md-h1">📜 Certifications</h1>
            <p class="md-p" style="margin-bottom: 24px; color: var(--text-secondary); line-height: 1.6;">A collection of certifications, diplomas, and achievements that reflect my learning journey across Web Development, Programming, Artificial Intelligence, and Computer Applications.</p>
            <div class="projects-grid">
                ${certsHtml}
            </div>
        </div>`;
    }

    // =========================================================================
    // Content Builders — experience/
    // =========================================================================

    buildExperience() {
        const d = dataService.getData();
        const expData = d.experience || {};
        const exp = Array.isArray(expData.experience) ? expData.experience : [];
        const expHtml = exp.map(e => `
            <div class="timeline-item">
                <div class="timeline-title">${e.project}</div>
                <div class="timeline-date">${e.type}</div>
                <div class="timeline-desc">${e.description}</div>
                <div style="margin-top:8px;">
                    <div class="achievement-tags">${this._techBadges(e.technologies || [])}</div>
                </div>
                <ul style="margin:10px 0 0 16px;padding:0;">
                    ${(e.highlights || []).map(h => `<li style="margin-bottom:5px;color:var(--clr-text-secondary);font-size:13px;">${h}</li>`).join('')}
                </ul>
            </div>`).join('');
        return `<div class="md-content">
            <h1 class="md-h1">💼 ${expData.title || 'Experience'}</h1>
            <p class="md-p" style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">${expData.description || 'Project-based experience gained through building real-world applications.'}</p>
            <div class="timeline">${expHtml}</div>
        </div>`;
    }

    // =========================================================================
    // Content Builders — skills/
    // =========================================================================

    buildSkills() {
        const d = dataService.getData();
        const skillsData = d.skills || {};

        // Support both old array format and new object format
        const categories = Array.isArray(skillsData)
            ? skillsData
            : (skillsData.primaryCategories || []);

        const domainFilters = Array.isArray(skillsData)
            ? []
            : (skillsData.domainFilters || []);

        // ── Minimal Domain filter tabs HTML ──
        const tabsHtml = domainFilters.length > 0 ? `
            <div class="ts-clean-tabs">
                ${domainFilters.map((f, i) => `
                    <div class="ts-clean-tab${i === 0 ? ' active' : ''}"
                         data-domain-id="${f.id}">
                        ${f.label}
                    </div>
                `).join('')}
            </div>` : '';

        // ── Standard Category Layout (All Skills) ──
        const cardsHtml = categories.map(cat => {
            const chipsHtml = (cat.skills || [])
                .map(sk => `<span class="ts-clean-pill">${sk}</span>`)
                .join('');

            return `
                <div class="ts-clean-category" data-category-id="${cat.id}">
                    <h2 class="ts-clean-heading">${cat.emoji ? cat.emoji + ' ' : ''}${cat.category}</h2>
                    <div class="ts-clean-skills">
                        ${chipsHtml}
                    </div>
                </div>`;
        }).join('');

        // ── Pre-rendered Domain Filters ──
        const domainPanelsHtml = domainFilters.map(df => {
            if (df.id === 'all' || !df.skills) return '';
            const pills = df.skills.map(sk => `<span class="ts-clean-pill">${sk}</span>`).join('');
            return `
                <div class="ts-domain-panel hidden" id="ts-domain-${df.id}">
                    ${pills}
                </div>`;
        }).join('');

        return `<div class="md-content">
            <div class="ts-clean-section">
                ${tabsHtml}
                <div class="ts-clean-grid" id="ts-all-skills">
                    ${cardsHtml}
                </div>
                ${domainPanelsHtml}
            </div>
        </div>`;
    }

    // =========================================================================
    // Content Builders — services/
    // =========================================================================

    buildServices() {
        const d = dataService.getData();
        const services = d.services || [];
        const iconMap = {
            layers: 'fas fa-layer-group', monitor: 'fas fa-desktop', cpu: 'fas fa-microchip',
            server: 'fas fa-server', database: 'fas fa-database', code: 'fas fa-code',
            briefcase: 'fas fa-briefcase', layout: 'fas fa-th-large'
        };
        const svcHtml = services.map(s => `
            <div class="achievement-card">
                <div class="achievement-icon ach-cert"><i class="${iconMap[s.icon] || 'fas fa-star'}"></i></div>
                <div class="achievement-content">
                    <div class="achievement-title-text">${s.title}</div>
                    <div class="achievement-desc">${s.description}</div>
                </div>
            </div>`).join('');
        return `<div class="md-content">
            <h1 class="md-h1">🧰 Services</h1>
            <p class="md-p">Freelance services offered based on real project experience.</p>
            ${svcHtml}
        </div>`;
    }

    // =========================================================================
    // Content Builders — achievements/
    // =========================================================================

    buildAchievements() {
        const d = dataService.getData();
        const achievements = Array.isArray(d.achievements) ? d.achievements : [];
        const achHtml = achievements.map(a => `
            <div class="achievement-card">
                <div class="achievement-icon ach-hack"><i class="fas fa-trophy"></i></div>
                <div class="achievement-content">
                    <div class="achievement-title-text">${a.title}</div>
                    <div class="achievement-subtitle">${a.event} · ${a.date} · ${a.location}</div>
                    <div class="achievement-desc">${a.description}</div>
                    <div class="achievement-tags">
                        <span class="ach-tag">📱 ${a.project}</span>
                        ${this._techBadges(a.technologies || [])}
                    </div>
                    ${a.images && a.images.length > 0 ? `
                        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                            ${a.images.map(img => `<img src="${img}" alt="${a.project}" style="height:80px;border-radius:6px;object-fit:cover;border:1px solid var(--clr-border);" loading="lazy" onerror="this.style.display='none'">`).join('')}
                        </div>` : ''}
                </div>
            </div>`).join('');
        return `<div class="md-content">
            <h1 class="md-h1">🏆 Achievements</h1>
            <p class="md-p">Real milestones and participation from my developer journey.</p>
            ${achHtml}
        </div>`;
    }

    buildProductionProject(fileName) {
        const d = dataService.getData();
        const projects = d.productionProjects || [];

        // Map file key → project id
        const fileKeyMap = {
            'imgninja.json': 'imgninja',
            'bitbot-college-chatbot.json': 'bitbot-college-chatbot',
            'brandify-creator.json': 'brandify-creator',
            'total-solution.json': 'total-solution',
            'gpt-for-bca.json': 'gpt-for-bca',
            'rozgarsetu.json': 'rozgarsetu',
            'scaleiq.json': 'scaleiq',
            'portfolio-v2.json': 'portfolio-v2',
        };

        // User-specified display names in order
        const displayNameMap = {
            'imgninja.json': 'project-01.imgNinja',
            'bitbot-college-chatbot.json': 'project-02.bitBot',
            'brandify-creator.json': 'project-03.brandifyCreator',
            'total-solution.json': 'project-04.totalSolution',
            'gpt-for-bca.json': 'project-05.GPTforBCA',
            'rozgarsetu.json': 'project-06.rozgarSeva',
            'scaleiq.json': 'project-07.scaleIQ',
            'portfolio-v2.json': 'project-08.portfolio (v2.0)',
        };

        // Consistent timeline read from each JSON's own `timeline` field
        const projectId = fileKeyMap[fileName];
        const proj = projects.find(p => p.id === projectId) || {};
        const displayName = displayNameMap[fileName] || fileName;
        const yr = proj.timeline || {};

        if (!proj.title) {
            return `<div class="welcome-screen"><div class="welcome-icon">📄</div><h2>${displayName}</h2><p>Project data not found.</p></div>`;
        }

        // ── Collect all tech from any key in techStack ──
        const tech = proj.techStack || {};
        const allTech = Object.values(tech)
            .flatMap(v => Array.isArray(v) ? v : (typeof v === 'string' ? [v] : []))
            .filter(Boolean);

        // ── Gallery ──
        const gallery = (proj.images && proj.images.gallery) ? proj.images.gallery
            : (proj.images && Array.isArray(proj.images)) ? proj.images
                : [];
        const thumbnail = (proj.images && proj.images.thumbnail) || '';
        const allImages = thumbnail ? [thumbnail, ...gallery.filter(i => i !== thumbnail)] : gallery;

        const galleryHtml = allImages.length > 0 ? `
            <h2 class="md-h2">📸 Screenshots</h2>
            <div class="proj-gallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:20px;">
                ${allImages.map((img, idx) => `<img
                    src="${img}"
                    alt="${proj.title} screenshot ${idx + 1}"
                    class="proj-gallery-img"
                    data-index="${idx}"
                    data-gallery='${JSON.stringify(allImages).replace(/'/g, '&apos;')}'
                    style="width:100%;border-radius:8px;object-fit:cover;aspect-ratio:16/9;border:1px solid var(--clr-border);cursor:zoom-in;transition:opacity 0.2s;"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >`).join('')}
            </div>` : '';

        // ── Status color ──
        const projStatus = yr.status || proj.status || '';
        const statusColor = projStatus.includes('Complete') ? '#6a9955'
            : projStatus.includes('Progress') || projStatus.includes('Ongoing') ? '#e5c07b' : '#61afef';

        // ── Links ──
        const links = proj.links || {};
        const liveLink = links.liveDemo || proj.liveDemo || '';
        const ghLink = links.github || proj.github || '';
        const liveBtnHtml = liveLink && liveLink !== 'N/A'
            ? `<a href="${liveLink}" target="_blank" rel="noopener noreferrer" class="project-card-link link-live"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : '';
        const githubBtnHtml = ghLink && ghLink !== 'N/A' && ghLink !== 'Private' && ghLink !== ''
            ? `<a href="${ghLink}" target="_blank" rel="noopener noreferrer" class="project-card-link link-github"><i class="fab fa-github"></i> GitHub</a>`
            : `<span class="ach-tag">🔒 Private / No Link</span>`;

        // ── Contributors ──
        const contribHtml = (proj.contributors || []).length > 0 ? `
            <h2 class="md-h2">👥 Team Members</h2>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
                ${proj.contributors.map(c => `
                    <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--clr-surface2);border-radius:20px;border:1px solid var(--clr-border);">
                        ${c.avatar ? `<img src="${c.avatar}" style="width:24px;height:24px;border-radius:50%;">` : '<i class="fas fa-user-circle" style="color:var(--clr-text-secondary);font-size:24px;"></i>'}
                        <div style="display:flex;flex-direction:column;">
                            ${c.url ? `<a href="${c.url}" target="_blank" rel="noopener noreferrer" style="font-size:13px;color:var(--clr-accent);text-decoration:none;font-weight:600;">${c.name}</a>` : `<span style="font-size:13px;color:var(--clr-text-primary);font-weight:600;">${c.name}</span>`}
                            <span style="font-size:10px;color:var(--clr-text-secondary);text-transform:uppercase;">${c.role}</span>
                        </div>
                    </div>`).join('')}
            </div>` : '';

        // ── Tech Stack grouped ──
        const techGroupsHtml = Object.keys(tech).length > 0 ? `
            <h2 class="md-h2">🔧 Tech Stack</h2>
            <div style="margin-bottom:16px;">
                ${Object.entries(tech).map(([group, items]) => {
            const arr = Array.isArray(items) ? items : (typeof items === 'string' ? [items] : []);
            if (!arr.length) return '';
            return `<div style="margin-bottom:10px;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);margin-bottom:6px;">${group}</div>
                        <div class="achievement-tags" style="display:flex;flex-wrap:wrap;gap:6px;">${this._techBadges(arr)}</div>
                    </div>`;
        }).join('')}
            </div>` : '';

        // ── Architecture ──
        const arch = proj.architecture || {};
        const archHtml = arch.description ? `
            <h2 class="md-h2">🏗️ Architecture</h2>
            <div style="margin-bottom:16px;padding:12px 16px;background:var(--clr-surface2);border-radius:8px;border:1px solid var(--clr-border);">
                <div style="font-weight:600;color:var(--clr-accent);margin-bottom:6px;font-size:13px;">${arch.pattern || ''}</div>
                <div style="font-size:13px;color:var(--clr-text-secondary);line-height:1.6;">${arch.description}</div>
                ${(arch.pages || []).length > 0 ? `<div style="margin-top:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);margin-bottom:6px;">Pages</div><ul style="padding-left:20px;margin:0;">${arch.pages.map(p => `<li style="font-size:12px;color:var(--clr-text-secondary);margin-bottom:3px;">${p}</li>`).join('')}</ul></div>` : ''}
                ${(arch.apiEndpoints || []).length > 0 ? `<div style="margin-top:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);margin-bottom:6px;">API Endpoints</div><ul style="padding-left:20px;margin:0;">${arch.apiEndpoints.map(e => `<li style="font-size:12px;color:var(--clr-text-secondary);margin-bottom:3px;"><code style="color:var(--clr-accent);">${e.method} ${e.path}</code> — ${e.description}</li>`).join('')}</ul></div>` : ''}
                ${arch.databaseStructure && arch.databaseStructure.collections ? `<div style="margin-top:10px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);margin-bottom:6px;">Database Collections</div><ul style="padding-left:20px;margin:0;">${arch.databaseStructure.collections.map(c => `<li style="font-size:12px;color:var(--clr-text-secondary);margin-bottom:3px;">${c}</li>`).join('')}</ul></div>` : ''}
            </div>` : '';

        // ── Challenges & Solutions ──
        const challengesHtml = (proj.challenges || []).length > 0 ? `
            <h2 class="md-h2">⚡ Challenges & Solutions</h2>
            ${proj.challenges.map((ch, i) => `
                <div style="margin-bottom:10px;padding:10px 14px;border-left:3px solid var(--clr-accent);background:var(--clr-surface2);border-radius:0 6px 6px 0;">
                    <div style="font-size:13px;font-weight:600;color:var(--clr-text);">⚠ ${ch}</div>
                    ${proj.solutions && proj.solutions[i] ? `<div style="font-size:12px;color:var(--clr-text-secondary);margin-top:5px;padding-top:5px;border-top:1px solid var(--clr-border);">✅ ${proj.solutions[i]}</div>` : ''}
                </div>`).join('')}` : '';

        // ── Key Learnings ──
        const learningsHtml = (proj.keyLearnings || []).length > 0 ? `
            <h2 class="md-h2">🎓 Key Learnings</h2>
            <ul style="padding-left:20px;margin:0 0 16px 0;">
                ${proj.keyLearnings.map(l => `<li style="margin-bottom:5px;color:var(--clr-text-secondary);font-size:13px;">${l}</li>`).join('')}
            </ul>` : '';

        // ── Design Highlights ──
        const design = proj.designHighlights || {};
        const designHtml = Object.keys(design).length > 0 ? `
            <h2 class="md-h2">🎨 Design Highlights</h2>
            <div style="padding:12px 16px;background:var(--clr-surface2);border-radius:8px;border:1px solid var(--clr-border);margin-bottom:16px;">
                ${design.colorPalette ? `<div style="margin-bottom:8px;"><span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);">Color Theme:</span> <span style="font-size:13px;color:var(--clr-text);">${design.colorPalette.theme || ''}</span></div>` : ''}
                ${design.typography && (design.typography.heading || design.typography.body) ? `<div style="margin-bottom:8px;"><span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);">Typography:</span> <span style="font-size:13px;color:var(--clr-text);">${[design.typography.heading, design.typography.body].filter(Boolean).join(' / ')}</span></div>` : ''}
                ${(design.designFeatures || []).length > 0 ? `<div class="achievement-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${this._techBadges(design.designFeatures)}</div>` : ''}
            </div>` : '';

        // ── Stats ──
        const statsHtml = proj.stats ? `
            <h2 class="md-h2">📊 Project Stats</h2>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
                ${Object.entries(proj.stats).map(([k, v]) => `
                    <div style="padding:8px 14px;background:var(--clr-surface2);border-radius:8px;border:1px solid var(--clr-border);text-align:center;min-width:80px;">
                        <div style="font-size:18px;font-weight:700;color:var(--clr-accent);">${v}</div>
                        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);">${k.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>`).join('')}
            </div>` : '';

        // ── Tags ──
        const tagsHtml = (proj.tags || []).length > 0 ? `
            <h2 class="md-h2">🏷️ Tags</h2>
            <div class="project-card-tags" style="margin-bottom:16px;">${this._tagList(proj.tags)}</div>` : '';

        // ── Roadmap ──
        const roadmap = proj.roadmap || {};
        const roadmapHtml = Object.keys(roadmap).length > 0 ? `
            <h2 class="md-h2">🗺️ Roadmap</h2>
            <div style="margin-bottom:16px;">
                ${Object.entries(roadmap).map(([phase, desc]) => `
                    <div style="margin-bottom:8px;padding:8px 14px;border-left:3px solid #e5c07b;background:var(--clr-surface2);border-radius:0 6px 6px 0;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#e5c07b;margin-bottom:3px;">${phase}</div>
                        <div style="font-size:12px;color:var(--clr-text-secondary);">${desc}</div>
                    </div>`).join('')}
            </div>` : '';

        // ── Performance Benchmarks ──
        const perf = proj.performanceBenchmarks || {};
        const perfHtml = Object.keys(perf).length > 0 ? `
            <h2 class="md-h2">⚡ Performance Benchmarks</h2>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
                ${Object.entries(perf).map(([k, v]) => `
                    <div style="padding:8px 14px;background:var(--clr-surface2);border-radius:8px;border:1px solid var(--clr-border);">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--clr-text-secondary);margin-bottom:3px;">${k.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div style="font-size:13px;color:var(--clr-accent);font-weight:600;">${v}</div>
                    </div>`).join('')}
            </div>` : '';

        // ── Client ──
        const clientHtml = proj.client ? `
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(97,175,239,0.1);border-radius:6px;border:1px solid rgba(97,175,239,0.3);margin-bottom:12px;">
                <i class="fas fa-building" style="color:#61afef;"></i>
                <span style="font-size:13px;color:#61afef;font-weight:500;">Client: ${proj.client}</span>
            </div>` : '';

        return `<div class="md-content">
            <h1 class="md-h1">${displayName}</h1>
            <div style="font-size:14px;color:var(--clr-text-secondary);margin-bottom:12px;font-style:italic;">${proj.title}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
                <span class="badge badge-blue">${proj.category || proj.type || ''}</span>
                <span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}55;">● ${projStatus}</span>
                <span class="badge badge-yellow">📅 ${yr.startDate || proj.year || ''}</span>
                ${yr.members ? `<span class="badge badge-green">👥 ${yr.members}</span>` : ''}
            </div>
            ${clientHtml}
            <p class="md-p">${proj.overview || proj.shortDescription || ''}</p>
            ${galleryHtml}
            <h2 class="md-h2">✨ Key Features</h2>
            <ul style="padding-left:20px;margin:0 0 16px 0;">
                ${(proj.features || []).map(f => `<li style="margin-bottom:5px;color:var(--clr-text-secondary);font-size:13px;">${f}</li>`).join('')}
            </ul>
            ${techGroupsHtml}
            ${statsHtml}
            ${archHtml}
            ${proj.myRole ? `<h2 class="md-h2">👤 My Role</h2><p class="md-p">${proj.myRole}</p>` : ''}
            ${contribHtml}
            ${challengesHtml}
            ${learningsHtml}
            ${designHtml}
            ${perfHtml}
            ${roadmapHtml}
            ${tagsHtml}
            <div class="project-card-links" style="margin-top:24px;display:flex;flex-wrap:wrap;gap:10px;">
                ${githubBtnHtml}
                ${liveBtnHtml}
            </div>
        </div>`;
    }


    // =========================================================================
    // Content Builders — projects/micro/
    // =========================================================================

    buildMicroProjects() {
        const d = dataService.getData();
        const micro = d.projectsMicro || {};
        const projects = micro.projects || [];
        const cards = projects.map(proj => {
            const thumbnail = proj.thumbnail || (proj.gallery && proj.gallery[0]) || '';
            const allImages = thumbnail ? [thumbnail, ...(proj.gallery || []).filter(i => i !== thumbnail)] : (proj.gallery || []);

            const ghBtnHtml = proj.github && proj.github !== 'N/A'
                ? `<a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-card-link link-github"><i class="fab fa-github"></i> GitHub</a>`
                : '';

            const galleryHtml = allImages.length > 0 ? `
                <div class="proj-gallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:16px;margin-bottom:16px;">
                    ${allImages.map((img, idx) => `<img
                        src="${img}"
                        alt="${proj.name} screenshot ${idx + 1}"
                        class="proj-gallery-img"
                        data-index="${idx}"
                        data-gallery='${JSON.stringify(allImages).replace(/'/g, '&apos;')}'
                        style="width:100%;border-radius:8px;object-fit:cover;aspect-ratio:16/9;border:1px solid var(--clr-border);cursor:zoom-in;transition:opacity 0.2s;"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >`).join('')}
                </div>` : '';

            const badgesHtml = `
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                    ${proj.category ? `<span class="badge badge-blue">${proj.category}</span>` : ''}
                    ${proj.type ? `<span class="badge badge-yellow">${proj.type}</span>` : ''}
                    ${proj.status ? `<span style="font-size:11px;padding:3px 8px;border-radius:4px;background:#6a995522;color:#6a9955;border:1px solid #6a995555;">● ${proj.status}</span>` : ''}
                    ${proj.year ? `<span class="badge badge-yellow">📅 ${proj.year}</span>` : ''}
                    ${proj.featured ? `<span style="font-size:11px;padding:3px 8px;border-radius:4px;background:#c678dd22;color:#c678dd;border:1px solid #c678dd55;">⭐ Featured</span>` : ''}
                </div>`;

            const techStackHtml = (proj.techStack || []).length > 0 ? `
                <div style="margin-top:12px;">
                    <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--clr-text);">Tech Stack:</div>
                    <div class="project-card-tags">${this._tagList(proj.techStack)}</div>
                </div>` : '';

            const featuresHtml = (proj.keyFeatures || []).length > 0 ? `
                <div style="margin-top:12px;">
                    <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--clr-text);">Key Features:</div>
                    <ul style="padding-left:20px;margin:0;">
                        ${proj.keyFeatures.map(f => `<li style="font-size:13px;color:var(--clr-text-secondary);margin-bottom:4px;">${f}</li>`).join('')}
                    </ul>
                </div>` : '';

            const learningHtml = (proj.learning || []).length > 0 ? `
                <div style="margin-top:12px;">
                    <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--clr-text);">Learning Outcomes:</div>
                    <ul style="padding-left:20px;margin:0;">
                        ${proj.learning.map(f => `<li style="font-size:13px;color:var(--clr-text-secondary);margin-bottom:4px;">${f}</li>`).join('')}
                    </ul>
                </div>` : '';

            let designSystemHtml = '';
            if (proj.designSystem) {
                const colors = proj.designSystem.colors || {};
                const typo = proj.designSystem.typography || {};

                let colorsHtml = '';
                if (Object.keys(colors).length > 0) {
                    colorsHtml = `<div style="margin-bottom:6px;"><span style="font-size:12px;color:var(--clr-text-secondary);">Colors: </span>` +
                        Object.entries(colors).map(([k, v]) => `<span style="display:inline-block;width:12px;height:12px;background:${v};border-radius:50%;margin-right:4px;border:1px solid var(--clr-border);vertical-align:middle;" title="${k}: ${v}"></span>`).join('') +
                        `</div>`;
                }

                let typoHtml = '';
                if (Object.keys(typo).length > 0) {
                    typoHtml = `<div style="margin-bottom:6px;"><span style="font-size:12px;color:var(--clr-text-secondary);">Typography: </span>` +
                        `<span style="font-size:12px;color:var(--clr-text);">${Object.values(typo).join(', ')}</span></div>`;
                }

                if (colorsHtml || typoHtml) {
                    designSystemHtml = `
                        <div style="margin-top:12px;padding:10px;background:var(--clr-surface2);border-radius:6px;border:1px solid var(--clr-border);">
                            <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--clr-text);">Design System:</div>
                            ${colorsHtml}
                            ${typoHtml}
                        </div>`;
                }
            }

            return `
                <div class="project-card" style="display:flex;flex-direction:column;">
                    <div class="project-card-body" style="padding:20px;">
                        ${badgesHtml}
                        <div class="project-card-title" style="font-size:20px;margin-bottom:8px;">${proj.name}</div>
                        ${proj.description ? `<div class="project-card-desc" style="font-size:14px;color:var(--clr-text);margin-bottom:8px;font-weight:500;">${proj.description}</div>` : ''}
                        ${proj.overview ? `<div class="project-card-desc" style="font-size:13px;color:var(--clr-text-secondary);margin-bottom:12px;">${proj.overview}</div>` : ''}
                        
                        ${galleryHtml}
                        ${techStackHtml}
                        ${featuresHtml}
                        ${learningHtml}
                        ${designSystemHtml}
                        
                        ${ghBtnHtml ? `<div class="project-card-links" style="margin-top:20px;">${ghBtnHtml}</div>` : ''}
                    </div>
                </div>`;
        }).join('');
        return `<div class="md-content">
            <h1 class="md-h1">🧪 ${micro.title || 'projects.micro'}</h1>
            <p class="md-p">${micro.description || 'Learning projects built while mastering core web technologies.'}</p>
            <div class="badges-row"><span class="badge badge-yellow">📦 ${projects.length} Projects</span></div>
            <div class="projects-grid" style="grid-template-columns:1fr;gap:24px;">${cards}</div>
        </div>`;
    }

    // =========================================================================
    // Content Builders — Root & Config
    // =========================================================================

    buildSettings() {
        return `<div class="md-content">
            <h1 class="md-h1">⚙️ Settings</h1>
            <pre style="background:var(--clr-bg-dark);padding:10px;border-radius:6px;font-family:monospace;color:#61afef">
theme: "dark-modern"
editor:
  fontSize: 14
  fontFamily: "Fira Code, monospace"
  wordWrap: "on"
  lineNumbers: "on"
explorer:
  autoReveal: true
  compactFolders: false
            </pre>
        </div>`;
    }

    // =========================================================================
    // Content Builders — life/
    // =========================================================================

    buildLessonsMd() {
        const markdown = `# 📖 Lessons Learned

> Every project teaches something new.

---

## 01. Build More, Memorize Less

I realized that reading documentation is important,
but building real projects is where concepts truly become clear.

---

## 02. Bugs Are Teachers

Every bug forced me to understand how things work internally.

---

## 03. Start Before You Feel Ready

Many of my best projects started before I knew how to build them.

---

## 04. Consistency Beats Motivation

Small progress every day is better than waiting for perfect motivation.

---

## 05. Simplicity Wins

Simple solutions are easier to maintain, debug, and improve.`;

        return `<div class="md-content">
            ${markdownRenderer.render(markdown)}
        </div>`;
    }

    buildBooksMd() {
        const markdown = `# 📚 Developer Library

Books and resources that shaped the way I think.

---

## Clean Code

Status:
✔ Completed

Category:
Software Engineering

Key Takeaway:
Code is read far more often than it is written.

---

## Atomic Habits

Status:
✔ Completed

Category:
Productivity

Key Takeaway:
Focus on systems instead of goals.

---

## You Don't Know JS

Status:
📖 Reading

Category:
JavaScript

Key Takeaway:
Understanding JavaScript deeply is more valuable than memorizing syntax.

---

## Designing Data-Intensive Applications

Status:
📅 Planned

Category:
System Design`;

        return `<div class="md-content">
            ${markdownRenderer.render(markdown)}
        </div>`;
    }

    buildGoalsJson() {
        const obj = {
            "shortTerm": [
                "Master JavaScript",
                "Master React",
                "Practices Data Analyst",
                "Improve Backend Development"
            ],
            "longTerm": [
                "Build SaaS Products",
                "Contribute to Open Source",
                "Become a Full Stack Engineer",
                "Create an AI Startup"
            ],
            "currentlyWorkingOn": [
                "Portfolio v2",
                "ImgNinja",
                "AI Integration"
            ],
            "completed": [
                "Learn HTML",
                "Learn CSS",
                "Learn JavaScript Basics",
                "Build Portfolio"
            ]
        };

        return `<div class="md-content">
            ${this._jsonBlock(obj)}
        </div>`;
    }

    buildLifeConfig() {
        const configText = `# Developer Configuration

[developer]
name = Akash Prajapati
mode = learning
status = building

---
[mindset]
curiosity = high
consistency = enabled
ego = disabled
learning = infinite

---
[workflow]
coffee = optional
music = lofi
debug_before_sleep = true
ship_projects = true

---
[mission]
build_real_products = true
help_people = true
never_stop_learning = true`;

        const highlighted = configText.split('\n').map(line => {
            if (line.startsWith('#') || line.startsWith('---')) {
                return `<span style="color: #6a9955;">${line}</span>`;
            }
            if (line.startsWith('[')) {
                return `<span style="color: #c678dd;">${line}</span>`;
            }
            if (line.includes('=')) {
                const parts = line.split('=');
                const key = parts[0];
                const val = parts.slice(1).join('=');

                const valStr = val.trim();
                let valColor = '#ce9178';
                if (valStr === 'true' || valStr === 'false') valColor = '#569cd6';
                if (!isNaN(valStr) && valStr !== '') valColor = '#b5cea8';

                return `<span style="color: #9cdcfe;">${key.trimEnd()}</span> <span style="color: #d4d4d4;">=</span> <span style="color: ${valColor};">${val.trimStart()}</span>`;
            }
            return line;
        }).join('\n');

        return `<div class="md-content">
            <pre style="background:var(--clr-bg-dark);padding:16px;border-radius:6px;font-family:var(--font-mono, monospace);font-size:14px;line-height:1.6;overflow-x:auto;">${highlighted}</pre>
        </div>`;
    }

    buildGitignore() {
        const ignoreText = `# ---------------------------------------
# Life Ignore Rules
# ---------------------------------------

# Negativity
negative_people/

# Excuses
excuses.log

# Toxic Environment
toxicity/

# Fear of Failure
fear/

# Procrastination
later/

# Comparison
compare_mode/

# Fake Motivation
motivation_reels.mp4

# Copy-Paste Coding
copy_paste/

# Temporary Files
ego.tmp

# Everything ignored here makes room for learning.`;

        const highlighted = ignoreText.split('\n').map(line => {
            if (line.startsWith('#')) {
                return `<span style="color: #6a9955;">${line}</span>`;
            }
            return `<span style="color: #d4d4d4;">${line}</span>`;
        }).join('\n');

        return `<div class="md-content">
            <pre style="background:var(--clr-bg-dark);padding:16px;border-radius:6px;font-family:var(--font-mono, monospace);font-size:14px;line-height:1.6;overflow-x:auto;">${highlighted}</pre>
        </div>`;
    }

    buildPackageJson() {
        const pkgText = `{
  "name": "akash-prajapati",
  "version": "2.1.0",
  "description": "Personal Developer Portfolio",

  "author": "Akash Prajapati",

  "license": "MIT",

  "scripts": {
    "learn": "study daily",
    "build": "build real projects",
    "debug": "learn from mistakes",
    "deploy": "ship products"
  },

  "engines": {
    "node": "Always Curious",
    "brain": "Learning Mode"
  },

  "dependencies": {
    "javascript": "latest",
    "typescript": "latest",
    "react": "latest",
    "nodejs": "latest",
    "coffee": "^1.0.0"
  }
}`;
        // Passing the string directly to _jsonBlock so the MarkdownRenderer 
        // will preserve the exact newlines without JSON.stringify removing them.
        return `<div class="md-content">
            <pre style="background:var(--clr-bg-dark);padding:16px;border-radius:6px;font-family:var(--font-mono, monospace);font-size:14px;line-height:1.6;overflow-x:auto;">${markdownRenderer.highlightJSON(pkgText)}</pre>
        </div>`;
    }

    buildChangelogMd() {
        const markdown = `# Changelog

All notable changes to this developer have been documented here.

---

## v2.1.0

### Added
- Redesigned portfolio as a VS Code workspace
- Added SQL-based social database
- Improved project documentation
- Added life configuration

### Improved
- Better project structure
- Cleaner UI
- Better responsive layout

---

## v2.0.0

### Added
- Production projects
- Skills explorer
- Experience timeline

---

## v1.0.0

### Initial Release
- Started web development journey
- Built first portfolio`;

        return `<div class="md-content">
            ${markdownRenderer.render(markdown)}
        </div>`;
    }

    buildLicenseTxt() {
        const txt = `MIT License

Copyright (c) 2026 Akash Prajapati

Permission is granted to view, learn, and get inspired from this portfolio.

You may:

✔ Explore the code
✔ Learn from ideas
✔ Take inspiration

You may not:

✘ Copy the complete design
✘ Re-upload it as your own work
✘ Remove attribution

Build your own story.
Don't copy someone else's.

Happy Coding ❤️`;

        return `<div class="md-content">
            <pre style="background:var(--clr-bg-dark);padding:16px;border-radius:6px;font-family:var(--font-mono, monospace);font-size:14px;line-height:1.6;overflow-x:auto;color:var(--text-secondary);white-space:pre-wrap;">${txt}</pre>
        </div>`;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App().init());
} else {
    new App().init();
}

// ── Global Modal Logic & Event Delegation ──

/** Shared modal state */
let _modalGallery = [];
let _modalIndex = 0;

function openModal(images, index) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');
    const counter = document.getElementById('modal-counter');
    if (!modal || !img) return;

    _modalGallery = Array.isArray(images) ? images : [images];
    _modalIndex = Math.max(0, Math.min(index, _modalGallery.length - 1));

    const hasNav = _modalGallery.length > 1;

    function showImage(i) {
        _modalIndex = (i + _modalGallery.length) % _modalGallery.length;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = _modalGallery[_modalIndex];
            img.style.opacity = '1';
        }, 150);
        if (counter) {
            counter.textContent = `${_modalIndex + 1} / ${_modalGallery.length}`;
        }
    }

    if (prevBtn) {
        prevBtn.style.display = hasNav ? 'flex' : 'none';
        prevBtn.onclick = (e) => { e.stopPropagation(); showImage(_modalIndex - 1); };
    }
    if (nextBtn) {
        nextBtn.style.display = hasNav ? 'flex' : 'none';
        nextBtn.onclick = (e) => { e.stopPropagation(); showImage(_modalIndex + 1); };
    }
    if (counter) counter.style.display = hasNav ? 'block' : 'none';

    showImage(_modalIndex);
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.style.display = 'none';
    _modalGallery = [];
    _modalIndex = 0;
}

// Delegated click handler
document.addEventListener('click', (e) => {
    // 1. Certificate (single image) — .view-cert-btn
    const certBtn = e.target.closest('.view-cert-btn');
    if (certBtn) {
        const src = certBtn.getAttribute('data-image');
        if (src) openModal([src], 0);
        return;
    }

    // 2. Project gallery image — .proj-gallery-img
    const projImg = e.target.closest('.proj-gallery-img');
    if (projImg) {
        const raw = projImg.getAttribute('data-gallery');
        const index = parseInt(projImg.getAttribute('data-index') || '0', 10);
        try {
            const gallery = JSON.parse(raw.replace(/&apos;/g, "'"));
            openModal(gallery, index);
        } catch {
            openModal([projImg.src], 0);
        }
        return;
    }

    // 3. Technical Skills Domain Filtering — .ts-clean-tab
    const tsTab = e.target.closest('.ts-clean-tab');
    if (tsTab) {
        document.querySelectorAll('.ts-clean-tab').forEach(t => t.classList.remove('active'));
        tsTab.classList.add('active');

        const domainId = tsTab.getAttribute('data-domain-id');
        const allSkillsGrid = document.getElementById('ts-all-skills');
        const allPanels = document.querySelectorAll('.ts-domain-panel');

        allPanels.forEach(p => p.classList.add('hidden'));

        if (domainId === 'all') {
            allSkillsGrid.classList.remove('hidden');
            allSkillsGrid.querySelectorAll('.ts-clean-category').forEach(cat => {
                cat.style.animation = 'none';
                void cat.offsetHeight;
                cat.style.animation = 'fadeInUp 0.3s ease forwards';
            });
        } else {
            allSkillsGrid.classList.add('hidden');
            const targetPanel = document.getElementById(`ts-domain-${domainId}`);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.style.animation = 'none';
                void targetPanel.offsetHeight;
                targetPanel.style.animation = 'fadeInUp 0.3s ease forwards';
            }
        }
    }
});

// Setup static modal listeners (close button + backdrop)
const setupModalListeners = () => {
    const modal = document.getElementById('image-modal');
    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('image-modal');
        if (!modal || modal.style.display === 'none') return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') document.getElementById('modal-prev')?.click();
        if (e.key === 'ArrowRight') document.getElementById('modal-next')?.click();
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModalListeners);
} else {
    setupModalListeners();
}
