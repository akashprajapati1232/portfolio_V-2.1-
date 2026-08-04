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
            'profile.json': this.buildProfileJson.bind(this),
            'projects.md':  this.buildProjects.bind(this),
            'skills.md':    this.buildSkills.bind(this),
            'work.md':      this.buildWork.bind(this),
            'socials.json': this.buildSocialsJson.bind(this),
            'LICENSE.txt':  this.buildLicense.bind(this)
        };
    }

    init() {
        // Render the UI structure before components try to attach event listeners
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

        const defaultFiles = ['profile.json', 'projects.md', 'skills.md', 'work.md', 'socials.json', 'LICENSE.txt'];
        defaultFiles.forEach(file => eventBus.emit('file:open', file));
        eventBus.emit('file:open', 'profile.json');

        setTimeout(() => {
            const leftSidebar = document.getElementById('sidebar');
            const rightSidebar = document.getElementById('right-sidebar');
            if (leftSidebar) leftSidebar.classList.remove('collapsed');
            if (rightSidebar) rightSidebar.classList.remove('hidden');
        }, 50);
    }

    openFile(fileName) {
        if (!fileName) {
            this.showWelcome();
            return;
        }

        const editorContent = document.getElementById('editor-content');
        if (!editorContent) return;

        const panes = editorContent.querySelectorAll('.editor-pane');
        panes.forEach(p => p.style.display = 'none');

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
            const panes = editorContent.querySelectorAll('.editor-pane');
            panes.forEach(p => p.style.display = 'none');

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
                                <span class="badge badge-yellow" onclick="window.openFile('projects.md')" style="cursor:pointer;">🚀 projects.md</span>
                                <span class="badge badge-green" onclick="window.openFile('skills.md')" style="cursor:pointer;">🛠️ skills.md</span>
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
        const bcFile   = document.getElementById('bc-current');
        const titleFile = document.getElementById('title-current-file');
        if (bcFolder) bcFolder.textContent = '';
        if (bcFile)   bcFile.textContent   = 'No file open';
        if (titleFile) titleFile.textContent = 'Welcome';
    }

    updateBreadcrumb(fileName) {
        const reg = dataService.getFileRegistry() || {};
        const fileInfo = reg[fileName] || {};
        const folder = fileInfo.folder || '';
        const bcFolder = document.querySelector('.bc-item.bc-folder');
        const bcFile   = document.getElementById('bc-current');
        const titleFile = document.getElementById('title-current-file');

        if (bcFolder) bcFolder.textContent = folder;
        if (bcFile)   bcFile.textContent   = fileName;
        if (titleFile) titleFile.textContent = fileName;
    }

    updateStatusLang(fileName) {
        const reg = dataService.getFileRegistry() || {};
        const fileInfo = reg[fileName] || {};
        const lang = fileInfo.lang || 'text';
        const MAP = { markdown: 'Markdown', json: 'JSON', text: 'Plain Text', js: 'JavaScript', html: 'HTML', css: 'CSS' };
        
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

    buildProfileJson() {
        const data = dataService.getData();
        const p = data.person;
        const obj = {
            name: p.name,
            title: p.title,
            location: p.location,
            email: p.email,
            phone: p.phone,
            website: p.website,
            github: p.github,
            linkedin: p.linkedin,
            bio: p.bio,
            stats: p.stats,
            education: data.education.map(e => ({ degree: e.degree, institution: e.institution, period: e.period })),
            skills: Object.fromEntries(Object.entries(data.skills).map(([cat, items]) => [ cat, items.map(s => s.name) ])),
            certifications: data.certifications.map(c => c.name)
        };
        const highlighted = markdownRenderer.highlightJSON(obj);
        return `<div class="json-viewer">${highlighted}</div>`;
    }

    buildProjects() {
        const data = dataService.getData();
        const cards = data.projects.map(proj => {
            const tagsHtml = proj.tech.map(t => `<span class="project-card-tag">${t}</span>`).join('');
            const liveBtn = proj.live && proj.live !== '#'
                ? `<a href="${proj.live}" target="_blank" rel="noopener noreferrer" class="project-card-link link-live"><i class="fas fa-external-link-alt"></i>Live Demo</a>`
                : '';
            return `
                <div class="project-card">
                    <img src="${proj.image}" alt="${proj.title}" class="project-card-img" loading="lazy" onerror="this.style.display='none'">
                    <div class="project-card-body">
                        <div class="project-card-tags">${tagsHtml}</div>
                        <div class="project-card-title">${proj.title}</div>
                        <div class="project-card-desc">${proj.description}</div>
                        <div class="project-card-links">
                            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-card-link link-github">
                                <i class="fab fa-github"></i>GitHub
                            </a>
                            ${liveBtn}
                        </div>
                    </div>
                </div>`;
        }).join('');
        return `<div class="md-content">
            <h1 class="md-h1">My Projects</h1>
            <p class="md-p">Here are some of my recent projects that showcase my skills and passion for web development.</p>
            <div class="projects-grid">${cards}</div>
        </div>`;
    }

    buildSkills() {
        const data = dataService.getData();
        function section(title, icon, items) {
            const listHtml = items.map(skill => `
                <div class="skill-item">
                    <div class="skill-name"><i class="${skill.icon}" style="font-size:14px;color:#4fc1ff;width:16px;text-align:center;"></i>${skill.name}</div>
                    <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${skill.level}%"></div></div>
                    <span class="skill-percent">${skill.level}%</span>
                </div>`).join('');
            return `<div class="skills-section"><div class="skills-section-title"><i class="${icon}"></i>${title}</div><div class="skills-list">${listHtml}</div></div>`;
        }
        return `<div class="md-content">
            <h1 class="md-h1">Technical Skills</h1>
            <p class="md-p">I specialize in creating modern, responsive web applications with a focus on clean code and user experience. Here's my technical toolkit:</p>
            ${section('Programming Languages', 'fas fa-code', data.skills.programming)}
            ${section('Web Development', 'fab fa-html5', data.skills.web)}
            ${section('Databases', 'fas fa-database', data.skills.database)}
            ${section('Tools & Platforms', 'fas fa-tools', data.skills.tools)}
        </div>`;
    }

    buildWork() {
        const data = dataService.getData();
        const eduHtml = data.education.map(edu => `
            <div class="timeline-item">
                <div class="timeline-title">${edu.degree}</div>
                <div class="timeline-date">${edu.institution}, ${edu.location} · ${edu.period}</div>
                <div class="timeline-desc">${edu.description}</div>
            </div>`).join('');
        const certsHtml = data.certifications.map(cert => `
            <div class="achievement-card">
                <div class="achievement-icon ach-cert"><i class="${cert.icon}"></i></div>
                <div class="achievement-content">
                    <div class="achievement-title-text">${cert.name}</div>
                    <div class="achievement-subtitle">${cert.body}</div>
                    <div class="achievement-desc">${cert.desc}</div>
                </div>
            </div>`).join('');
        return `<div class="md-content">
            <h1 class="md-h1">Experience & Education</h1>
            <h2 class="md-h2">🎓 Education</h2>
            <div class="timeline">${eduHtml}</div>
            <h2 class="md-h2">📜 Certifications</h2>
            ${certsHtml}
            <h2 class="md-h2">🏆 Achievements</h2>
            ${data.achievements.map(ach => `
            <div class="achievement-card">
                <div class="achievement-icon ${ach.icon}"><i class="${ach.iconClass}"></i></div>
                <div class="achievement-content">
                    <div class="achievement-title-text">${ach.title}</div>
                    <div class="achievement-subtitle">${ach.subtitle} &nbsp;·&nbsp; ${ach.date}</div>
                    <div class="achievement-desc">${ach.description}</div>
                    <div class="achievement-tags">${ach.tags.map(t => `<span class="ach-tag">${t}</span>`).join('')}</div>
                </div>
            </div>`).join('')}
        </div>`;
    }

    buildSocialsJson() {
        const data = dataService.getData();
        const p = data.person;
        const obj = {
            contact: { email: p.email, phone: p.phone },
            social: { github: p.github, linkedin: p.linkedin, website: p.website },
            location: p.location,
            available_for: ['Freelance Projects', 'Internships', 'Open Source Collaborations', 'Full-time Positions (Post-graduation)'],
            preferred_contact: 'email',
            response_time: 'Within 24 hours'
        };
        const contactLinksHtml = `
            <div class="md-content" style="margin-top:16px;">
                <div class="contact-card">
                    <a href="mailto:${p.email}" class="contact-item" aria-label="Email">
                        <div class="contact-icon ci-email"><i class="fas fa-envelope"></i></div>
                        <div><div class="contact-label">Email</div><div class="contact-value">${p.email}</div></div>
                    </a>
                    <a href="tel:${p.phone.replace(/\s/g, '')}" class="contact-item" aria-label="Phone">
                        <div class="contact-icon ci-phone"><i class="fas fa-phone"></i></div>
                        <div><div class="contact-label">Phone</div><div class="contact-value">${p.phone}</div></div>
                    </a>
                    <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="contact-item" aria-label="GitHub">
                        <div class="contact-icon ci-github"><i class="fab fa-github"></i></div>
                        <div><div class="contact-label">GitHub</div><div class="contact-value">akashprajapati1232</div></div>
                    </a>
                    <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-item" aria-label="LinkedIn">
                        <div class="contact-icon ci-linkedin"><i class="fab fa-linkedin"></i></div>
                        <div><div class="contact-label">LinkedIn</div><div class="contact-value">akash-prajapati1232</div></div>
                    </a>
                </div>
            </div>`;
        const highlighted = markdownRenderer.highlightJSON(obj);
        return `<div class="md-content">
            <h1 class="md-h1">Contact & Social Links</h1>
            ${contactLinksHtml}
            <h2 class="md-h2" style="margin-top:20px;">socials.json</h2>
            <div class="json-viewer">${highlighted}</div>
        </div>`;
    }

    buildLicense() {
        const year = new Date().getFullYear();
        const text = `MIT License\n\nCopyright (c) ${year} Akash Prajapati\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.`;
        return `<pre class="plain-text">${text}</pre>`;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App().init());
} else {
    new App().init();
}
