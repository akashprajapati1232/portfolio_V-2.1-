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
import { jarvisAI } from './components/ai/JarvisAI.js';
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
            'socials.yml': this.buildSocials.bind(this),
            // Education/
            'education.json': this.buildEducation.bind(this),
            'certifications.tsx': this.buildCertifications.bind(this),
            // Experience/
            'experience.json': this.buildExperience.bind(this),
            // Skills/
            'tech-stack.tsx': this.buildSkills.bind(this),
            // Services/
            'services.ts': this.buildServices.bind(this),
            // Achievements/
            'achievements.xml': this.buildAchievements.bind(this),
            // Projects/production/
            'gpt-for-bca.json': this.buildProductionProject.bind(this, 'gpt-for-bca.json'),
            'imgninja.json': this.buildProductionProject.bind(this, 'imgninja.json'),
            'brandify-creator.json': this.buildProductionProject.bind(this, 'brandify-creator.json'),
            'bitbot-college-chatbot.json': this.buildProductionProject.bind(this, 'bitbot-college-chatbot.json'),
            'rozgarsetu.json': this.buildProductionProject.bind(this, 'rozgarsetu.json'),
            'scaleiq.json': this.buildProductionProject.bind(this, 'scaleiq.json'),
            'total-solution.json': this.buildProductionProject.bind(this, 'total-solution.json'),
            'portfolio-v2.json': this.buildProductionProject.bind(this, 'portfolio-v2.json'),
            // Projects/micro/
            'projects-micro.json': this.buildMicroProjects.bind(this),
            // Root/Config
            'LICENSE.txt': this.buildLicense.bind(this),
            'settings.yml': this.buildSettings.bind(this),
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
                ${jarvisAI.render()}
            </div>
            ${statusBar.render()}
        `;
    }

    boot() {
        explorer.init();
        tabManager.init();
        router.init();
        terminal.init();
        jarvisAI.init();
        panelResizer.init();
        layoutController.init();

        window.openFile = (fileName) => {
            eventBus.emit('file:open', fileName);
        };

        eventBus.on('file:switched', this.openFile.bind(this));
        eventBus.on('file:closedAll', this.showWelcome.bind(this));

        // Open default files on load
        const defaultFiles = ['profile.json', 'tech-stack.tsx', 'projects-micro.json'];
        defaultFiles.forEach(file => eventBus.emit('file:open', file));
        eventBus.emit('file:open', 'README.md'); // Focus README.md

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
        this.updateStatusLang(fileName);

        const editorWrap = document.getElementById('editor-wrap');
        if (editorWrap) editorWrap.scrollTop = 0;

        requestAnimationFrame(() => this.updateLineNumbers(pane));
        this.updateStatusPosition(1, 1);
        pane.onclick = () => this.updateStatusPosition(1, 1);
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
                                <span class="badge badge-green" onclick="window.openFile('gpt-for-bca.json')" style="cursor:pointer;">🚀 gpt-for-bca.json</span>
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

    updateStatusLang(fileName) {
        const reg = dataService.getFileRegistry() || {};
        const fileInfo = reg[fileName] || {};
        const lang = fileInfo.lang || 'text';
        const MAP = { markdown: 'Markdown', json: 'JSON', text: 'Plain Text', js: 'JavaScript', html: 'HTML', css: 'CSS', yaml: 'YAML', tsx: 'TypeScript React', ts: 'TypeScript', xml: 'XML' };
        const langEl = document.getElementById('status-lang');
        if (langEl) langEl.textContent = MAP[lang] || 'Plain Text';
    }

    updateLineNumbers(contentEl) {
        const lineNumEl = document.getElementById('line-numbers');
        if (!lineNumEl || !contentEl) return;
        const approxLines = Math.max(40, Math.ceil(contentEl.scrollHeight / (14 * 1.6)));
        const nums = [];
        for (let i = 1; i <= approxLines; i++) nums.push(i);
        lineNumEl.innerHTML = nums.join('<br>');
    }

    updateStatusPosition(ln, col) {
        const posEl = document.getElementById('status-position');
        if (posEl) posEl.textContent = `Ln ${ln}, Col ${col}`;
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

    buildSocials() {
        const d = dataService.getData();
        const s = d.socials || {};
        const links = Object.entries(s).map(([platform, url]) => {
            const icons = { github: 'fab fa-github', linkedin: 'fab fa-linkedin', instagram: 'fab fa-instagram', website: 'fas fa-globe', twitter: 'fab fa-twitter' };
            const colors = { github: 'ci-github', linkedin: 'ci-linkedin', instagram: 'ci-instagram', website: 'ci-email' };
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="contact-item">
                <div class="contact-icon ${colors[platform] || 'ci-email'}"><i class="${icons[platform] || 'fas fa-link'}"></i></div>
                <div><div class="contact-label">${platform.charAt(0).toUpperCase() + platform.slice(1)}</div><div class="contact-value">${url}</div></div>
            </a>`;
        }).join('');
        return `<div class="md-content">
            <h1 class="md-h1">🌐 Socials</h1>
            <p class="md-p">Connect with me across the web.</p>
            <div class="contact-card">${links}</div>
        </div>`;
    }

    // =========================================================================
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

    // =========================================================================
    // Content Builders — projects/production/
    // =========================================================================

    buildProductionProject(fileName) {
        const d = dataService.getData();
        const projects = d.productionProjects || [];
        const fileKeyMap = {
            'gpt-for-bca.json': 'gpt-for-bca',
            'imgninja.json': 'imgninja',
            'brandify-creator.json': 'brandify-creator',
            'bitbot-college-chatbot.json': 'bitbot-college-chatbot',
            'rozgarsetu.json': 'rozgarsetu',
            'scaleiq.json': 'scaleiq',
            'total-solution.json': 'total-solution',
            'portfolio-v2.json': 'portfolio-v2',
        };
        const projectId = fileKeyMap[fileName];
        const proj = projects.find(p => p.id === projectId) || {};

        if (!proj.title) {
            return `<div class="welcome-screen"><div class="welcome-icon">📄</div><h2>${fileName}</h2><p>Project data not found.</p></div>`;
        }

        const tech = proj.techStack || {};
        const allTech = [
            ...(tech.frontend || []),
            ...(tech.backend || []),
            ...(tech.database || []),
            ...(tech.tools || []),
            ...(Array.isArray(tech) ? tech : []),
        ].filter(Boolean);

        const imagesArr = proj.images || (proj.thumbnail ? [proj.thumbnail] : []);
        const imagesHtml = imagesArr.length > 0 ? `
            <h2 class="md-h2">📸 Screenshots</h2>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
                ${imagesArr.slice(0, 4).map(img => `<img src="${img}" alt="${proj.title}" style="height:120px;border-radius:8px;object-fit:cover;border:1px solid var(--clr-border);" loading="lazy" onerror="this.style.display='none'">`).join('')}
            </div>` : '';

        const statusColor = proj.status === 'Completed' ? '#6a9955' : proj.status === 'In Progress' ? '#e5c07b' : '#61afef';
        const liveBtnHtml = proj.liveDemo && proj.liveDemo !== 'N/A'
            ? `<a href="${proj.liveDemo}" target="_blank" rel="noopener noreferrer" class="project-card-link link-live" style="margin-left:8px;"><i class="fas fa-external-link-alt"></i> Live Demo</a>`
            : '';
        const githubBtnHtml = proj.github && proj.github !== 'N/A' && proj.github !== 'Private'
            ? `<a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-card-link link-github"><i class="fab fa-github"></i> GitHub</a>`
            : `<span class="ach-tag">🔒 ${proj.github || 'Private'}</span>`;

        return `<div class="md-content">
            <h1 class="md-h1">${proj.title}</h1>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
                <span class="badge badge-blue">${proj.category || proj.type || ''}</span>
                <span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}55;">● ${proj.status}</span>
                ${proj.timeline ? `<span class="badge badge-yellow">📅 ${proj.timeline.startDate} – ${proj.timeline.endDate}</span>` : ''}
            </div>
            <p class="md-p">${proj.overview || proj.shortDescription || ''}</p>
            ${imagesHtml}
            <h2 class="md-h2">✨ Key Features</h2>
            <ul style="padding-left:20px;margin:0 0 16px 0;">
                ${(proj.features || []).map(f => `<li style="margin-bottom:5px;color:var(--clr-text-secondary);font-size:13px;">${f}</li>`).join('')}
            </ul>
            <h2 class="md-h2">🔧 Tech Stack</h2>
            <div class="achievement-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
                ${this._techBadges(allTech)}
            </div>
            ${proj.myRole ? `<h2 class="md-h2">👤 My Role</h2><p class="md-p">${proj.myRole}</p>` : ''}
            ${proj.challenges && proj.challenges.length > 0 ? `
            <h2 class="md-h2">⚡ Challenges & Solutions</h2>
            ${proj.challenges.map((ch, i) => `
                <div style="margin-bottom:10px;padding:10px 14px;border-left:3px solid var(--clr-accent);background:var(--clr-surface2);border-radius:0 6px 6px 0;">
                    <div style="font-size:13px;font-weight:600;color:var(--clr-text);">Challenge: ${ch}</div>
                    ${proj.solutions && proj.solutions[i] ? `<div style="font-size:12px;color:var(--clr-text-secondary);margin-top:4px;">Solution: ${proj.solutions[i]}</div>` : ''}
                </div>`).join('')}` : ''}
            <div class="project-card-links" style="margin-top:20px;">
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
            const liveBtnHtml = proj.liveDemo && proj.liveDemo !== 'N/A'
                ? `<a href="${proj.liveDemo}" target="_blank" rel="noopener noreferrer" class="project-card-link link-live"><i class="fas fa-external-link-alt"></i> Live</a>`
                : '';
            const ghBtnHtml = proj.github && proj.github !== 'N/A'
                ? `<a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-card-link link-github"><i class="fab fa-github"></i> GitHub</a>`
                : '';
            return `
                <div class="project-card">
                    ${thumbnail ? `<img src="${thumbnail}" alt="${proj.name}" class="project-card-img" loading="lazy" onerror="this.style.display='none'">` : ''}
                    <div class="project-card-body">
                        <div class="project-card-tags">${this._tagList(proj.techStack || [])}</div>
                        <div class="project-card-title">${proj.name}</div>
                        <div class="project-card-desc">${proj.description}</div>
                        <div class="project-card-links">${ghBtnHtml}${liveBtnHtml}</div>
                    </div>
                </div>`;
        }).join('');
        return `<div class="md-content">
            <h1 class="md-h1">🧪 Micro Projects</h1>
            <p class="md-p">${micro.description || 'Learning projects built while mastering core web technologies.'}</p>
            <div class="badges-row"><span class="badge badge-yellow">📦 ${projects.length} Projects</span></div>
            <div class="projects-grid">${cards}</div>
        </div>`;
    }

    // =========================================================================
    // Content Builders — Root & Config
    // =========================================================================

    buildLicense() {
        return `<div class="md-content">
            <h1 class="md-h1">📄 MIT License</h1>
            <pre style="background:var(--clr-bg-dark);padding:10px;border-radius:6px;color:#8a8a8a;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.5;">
Copyright (c) 2026 Akash Prajapati

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
            </pre>
        </div>`;
    }

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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App().init());
} else {
    new App().init();
}

// ── Global Modal Logic & Event Delegation ──
document.addEventListener('click', (e) => {
    // 1. Certificate Modal Logic
    const btn = e.target.closest('.view-cert-btn');
    if (btn) {
        const src = btn.getAttribute('data-image');
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        if (modal && modalImg && src) {
            modalImg.src = src;
            modal.style.display = 'flex';
        }
    }

    // 2. Technical Skills Domain Filtering
    const tsTab = e.target.closest('.ts-clean-tab');
    if (tsTab) {
        // Update active tab
        document.querySelectorAll('.ts-clean-tab').forEach(t => t.classList.remove('active'));
        tsTab.classList.add('active');

        const domainId = tsTab.getAttribute('data-domain-id');
        const allSkillsGrid = document.getElementById('ts-all-skills');
        const allPanels = document.querySelectorAll('.ts-domain-panel');
        
        // Hide all panels
        allPanels.forEach(p => p.classList.add('hidden'));

        if (domainId === 'all') {
            allSkillsGrid.classList.remove('hidden');
            // Trigger animation on categories
            const cats = allSkillsGrid.querySelectorAll('.ts-clean-category');
            cats.forEach(cat => {
                cat.style.animation = 'none';
                void cat.offsetHeight;
                cat.style.animation = 'fadeInUp 0.3s ease forwards';
            });
        } else {
            allSkillsGrid.classList.add('hidden');
            const targetPanel = document.getElementById(`ts-domain-${domainId}`);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                // Trigger animation on the panel
                targetPanel.style.animation = 'none';
                void targetPanel.offsetHeight;
                targetPanel.style.animation = 'fadeInUp 0.3s ease forwards';
            }
        }
    }
});

const setupModalListeners = () => {
    const modal = document.getElementById('image-modal');
    const closeBtn = document.getElementById('modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
};

// If document is already loaded, run immediately, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModalListeners);
} else {
    setupModalListeners();
}


