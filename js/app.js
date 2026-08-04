/**
 * app.js
 * Main application controller.
 * Orchestrates: Explorer → TabManager → ContentRenderer → Router
 * Handles status bar updates, breadcrumb, line numbers.
 */

(function () {
    'use strict';

    const data = window.PORTFOLIO_DATA;
    const md   = window.MarkdownRenderer;

    /* ─────────────────────────────────────────
       CONTENT BUILDERS
       Each function returns an HTML string
       that represents the file's content.
    ───────────────────────────────────────── */

    /* ── README.md ── */
    function buildReadme() {
        const p = data.person;
        const badgeList = [
            ['fab fa-html5',   'HTML5',      'badge-orange'],
            ['fab fa-css3-alt','CSS3',        'badge-blue'],
            ['fab fa-js',      'JavaScript', 'badge-yellow'],
            ['fab fa-python',  'Python',      'badge-green'],
            ['fab fa-react',   'React',       'badge-blue'],
            ['fab fa-node-js', 'Node.js',     'badge-green'],
            ['fas fa-database','MySQL',       'badge-purple'],
            ['fab fa-git-alt', 'Git',         'badge-red'],
            ['fab fa-wordpress','WordPress',  'badge-blue']
        ];

        const badgesHtml = badgeList.map(([ico, label, cls]) =>
            `<span class="badge ${cls}"><i class="${ico}"></i>${label}</span>`
        ).join('');

        const achievementsHtml = data.achievements.map(ach => `
            <div class="achievement-card">
                <div class="achievement-icon ${ach.icon}"><i class="${ach.iconClass}"></i></div>
                <div class="achievement-content">
                    <div class="achievement-title-text">${ach.title}</div>
                    <div class="achievement-subtitle">${ach.subtitle} &nbsp;·&nbsp; ${ach.date}</div>
                    <div class="achievement-desc">${ach.description}</div>
                    <div class="achievement-tags">${ach.tags.map(t => `<span class="ach-tag">${t}</span>`).join('')}</div>
                </div>
            </div>`).join('');

        const educationHtml = data.education.map(edu => `
            <div class="timeline-item">
                <div class="timeline-title">${edu.degree}</div>
                <div class="timeline-date">${edu.institution} · ${edu.period}</div>
                <div class="timeline-desc">${edu.description}</div>
            </div>`).join('');

        const certsHtml = data.certifications.map(cert => `
            <span class="badge badge-gray"><i class="${cert.icon}"></i>${cert.name}</span>
        `).join('');

        return `<div class="md-content">

            <!-- Profile Hero -->
            <div class="readme-hero">
                <img src="${p.avatar}" alt="${p.name}" class="readme-avatar" loading="lazy">
                <div class="readme-info">
                    <h1>${p.name}</h1>
                    <div class="title">${p.title}</div>
                    <div class="location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-row">
                <div class="stat-chip">
                    <span class="stat-number">${p.stats.projects}</span>
                    <span class="stat-label">Projects</span>
                </div>
                <div class="stat-chip">
                    <span class="stat-number">${p.stats.certifications}</span>
                    <span class="stat-label">Certifications</span>
                </div>
                <div class="stat-chip">
                    <span class="stat-number">${p.stats.experience}</span>
                    <span class="stat-label">Experience</span>
                </div>
                <div class="stat-chip">
                    <a href="${p.github}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">
                        <i class="fab fa-github" style="font-size:18px;color:#4fc1ff;"></i>
                    </a>
                    <span class="stat-label">GitHub</span>
                </div>
            </div>

            <h2 class="md-h2">👋 About Me</h2>
            ${data.person.bio.map(b => `<p class="md-p">${b}</p>`).join('')}

            <h2 class="md-h2">🛠️ Tech Stack</h2>
            <div class="badges-row">${badgesHtml}</div>

            <h2 class="md-h2">🎓 Education</h2>
            <div class="timeline">${educationHtml}</div>

            <h2 class="md-h2">🏆 Achievements</h2>
            ${achievementsHtml}

            <h2 class="md-h2">📜 Certifications</h2>
            <div class="badges-row">${certsHtml}</div>

            <h2 class="md-h2">📬 Contact</h2>
            <div class="md-p">
                <i class="fas fa-envelope" style="color:#ce9178;margin-right:6px;"></i>
                <a href="mailto:${p.email}" class="md-link">${p.email}</a>
                &nbsp;&nbsp;
                <i class="fas fa-phone" style="color:#4ec9b0;margin-right:6px;"></i>
                <span style="color:#d4d4d4;">${p.phone}</span>
            </div>
            <div class="badges-row" style="margin-top:10px;">
                <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="badge badge-gray">
                    <i class="fab fa-github"></i>GitHub
                </a>
                <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="badge badge-blue">
                    <i class="fab fa-linkedin"></i>LinkedIn
                </a>
                <a href="${p.website}" target="_blank" rel="noopener noreferrer" class="badge badge-green">
                    <i class="fas fa-globe"></i>Website
                </a>
            </div>

            <hr class="md-hr">
            <p class="md-p" style="color:var(--text-muted);font-size:12px;text-align:center;">
                Made with ❤️ by ${p.name} · <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="md-link">View Source</a>
            </p>
        </div>`;
    }

    /* ── profile.json ── */
    function buildProfileJson() {
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
            education: data.education.map(e => ({
                degree: e.degree,
                institution: e.institution,
                period: e.period
            })),
            skills: Object.fromEntries(
                Object.entries(data.skills).map(([cat, items]) => [
                    cat, items.map(s => s.name)
                ])
            ),
            certifications: data.certifications.map(c => c.name)
        };

        const highlighted = md.highlightJSON(obj);
        return `<div class="json-viewer">${highlighted}</div>`;
    }

    /* ── projects.md ── */
    function buildProjects() {
        const cards = data.projects.map(proj => {
            const tagsHtml = proj.tech.map(t => `<span class="project-card-tag">${t}</span>`).join('');
            const liveBtn = proj.live && proj.live !== '#'
                ? `<a href="${proj.live}" target="_blank" rel="noopener noreferrer" class="project-card-link link-live"><i class="fas fa-external-link-alt"></i>Live Demo</a>`
                : '';
            return `
                <div class="project-card">
                    <img src="${proj.image}" alt="${proj.title}" class="project-card-img" loading="lazy"
                         onerror="this.style.display='none'">
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

    /* ── skills.md ── */
    function buildSkills() {
        function section(title, icon, items) {
            const listHtml = items.map(skill => `
                <div class="skill-item">
                    <div class="skill-name">
                        <i class="${skill.icon}" style="font-size:14px;color:#4fc1ff;width:16px;text-align:center;"></i>
                        ${skill.name}
                    </div>
                    <div class="skill-bar-track">
                        <div class="skill-bar-fill" style="width:${skill.level}%"></div>
                    </div>
                    <span class="skill-percent">${skill.level}%</span>
                </div>`).join('');

            return `<div class="skills-section">
                <div class="skills-section-title"><i class="${icon}"></i>${title}</div>
                <div class="skills-list">${listHtml}</div>
            </div>`;
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

    /* ── work.md (experience / education) ── */
    function buildWork() {
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

    /* ── socials.json ── */
    function buildSocialsJson() {
        const p = data.person;
        const obj = {
            contact: {
                email: p.email,
                phone: p.phone
            },
            social: {
                github: p.github,
                linkedin: p.linkedin,
                website: p.website
            },
            location: p.location,
            available_for: [
                'Freelance Projects',
                'Internships',
                'Open Source Collaborations',
                'Full-time Positions (Post-graduation)'
            ],
            preferred_contact: 'email',
            response_time: 'Within 24 hours'
        };

        const contactLinksHtml = `
            <div class="md-content" style="margin-top:16px;">
                <div class="contact-card">
                    <a href="mailto:${p.email}" class="contact-item" aria-label="Email">
                        <div class="contact-icon ci-email"><i class="fas fa-envelope"></i></div>
                        <div>
                            <div class="contact-label">Email</div>
                            <div class="contact-value">${p.email}</div>
                        </div>
                    </a>
                    <a href="tel:${p.phone.replace(/\s/g, '')}" class="contact-item" aria-label="Phone">
                        <div class="contact-icon ci-phone"><i class="fas fa-phone"></i></div>
                        <div>
                            <div class="contact-label">Phone</div>
                            <div class="contact-value">${p.phone}</div>
                        </div>
                    </a>
                    <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="contact-item" aria-label="GitHub">
                        <div class="contact-icon ci-github"><i class="fab fa-github"></i></div>
                        <div>
                            <div class="contact-label">GitHub</div>
                            <div class="contact-value">akashprajapati1232</div>
                        </div>
                    </a>
                    <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-item" aria-label="LinkedIn">
                        <div class="contact-icon ci-linkedin"><i class="fab fa-linkedin"></i></div>
                        <div>
                            <div class="contact-label">LinkedIn</div>
                            <div class="contact-value">akash-prajapati1232</div>
                        </div>
                    </a>
                </div>
            </div>`;

        const highlighted = md.highlightJSON(obj);
        return `<div class="md-content">
            <h1 class="md-h1">Contact & Social Links</h1>
            ${contactLinksHtml}
            <h2 class="md-h2" style="margin-top:20px;">socials.json</h2>
            <div class="json-viewer">${highlighted}</div>
        </div>`;
    }

    /* ── LICENSE.txt ── */
    function buildLicense() {
        const year = new Date().getFullYear();
        const text = `MIT License

Copyright (c) ${year} Akash Prajapati

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
SOFTWARE.`;

        return `<pre class="plain-text">${text}</pre>`;
    }

    /* ─────────────────────────────────────────
       CONTENT DISPATCH MAP
    ───────────────────────────────────────── */
    const CONTENT_BUILDERS = {
        'README.md':    buildReadme,
        'profile.json': buildProfileJson,
        'projects.md':  buildProjects,
        'skills.md':    buildSkills,
        'work.md':      buildWork,
        'socials.json': buildSocialsJson,
        'LICENSE.txt':  buildLicense
    };

    /* ─────────────────────────────────────────
       CORE FUNCTIONS
    ───────────────────────────────────────── */

    /* Get lang label for status bar */
    function getLangLabel(fileName) {
        const reg = (window.FILE_REGISTRY || {})[fileName] || {};
        const lang = reg.lang || 'text';
        const MAP = {
            markdown: 'Markdown',
            json: 'JSON',
            text: 'Plain Text',
            js: 'JavaScript',
            html: 'HTML',
            css: 'CSS'
        };
        return MAP[lang] || 'Plain Text';
    }

    /* Update breadcrumb */
    function updateBreadcrumb(fileName) {
        const reg = (window.FILE_REGISTRY || {})[fileName] || {};
        const folder = reg.folder || '';
        const bcFolder = document.querySelector('.bc-item.bc-folder');
        const bcFile   = document.getElementById('bc-current');
        const titleFile = document.getElementById('title-current-file');

        if (bcFolder) bcFolder.textContent = folder;
        if (bcFile)   bcFile.textContent   = fileName;
        if (titleFile) titleFile.textContent = fileName;
    }

    /* Update status bar language */
    function updateStatusLang(fileName) {
        const langEl = document.getElementById('status-lang');
        if (langEl) langEl.textContent = getLangLabel(fileName);
    }

    /* Build and inject line numbers based on content height */
    function updateLineNumbers(contentEl) {
        const lineNumEl = document.getElementById('line-numbers');
        if (!lineNumEl || !contentEl) return;

        // Estimate lines from paragraph count + structure
        const approxLines = Math.max(
            40,
            Math.ceil(contentEl.scrollHeight / (14 * 1.6))
        );

        const nums = [];
        for (let i = 1; i <= approxLines; i++) {
            nums.push(i);
        }
        lineNumEl.innerHTML = nums.join('<br>');
    }

    /* Render a file into the editor */
    function openFile(fileName) {
        const editorContent = document.getElementById('editor-content');
        if (!editorContent) return;

        // Hide all existing panes
        const panes = editorContent.querySelectorAll('.editor-pane');
        panes.forEach(p => p.style.display = 'none');

        // Check if pane for this file already exists
        let pane = editorContent.querySelector(`.editor-pane[data-file="${fileName}"]`);

        if (!pane) {
            // Create new pane if it doesn't exist
            pane = document.createElement('div');
            pane.className = 'editor-pane';
            pane.setAttribute('data-file', fileName);
            pane.style.display = 'block';

            const builder = CONTENT_BUILDERS[fileName];
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
            // Show existing pane
            pane.style.display = 'block';
        }

        updateBreadcrumb(fileName);
        updateStatusLang(fileName);

        // Scroll to top
        const editorWrap = document.getElementById('editor-wrap');
        if (editorWrap) editorWrap.scrollTop = 0;

        // Update line numbers after content renders (use active pane's scrollHeight)
        requestAnimationFrame(() => updateLineNumbers(pane));

        // Update status bar position
        updateStatusPosition(1, 1);

        // Update tab/explorer state
        window.Explorer.setActiveFile(fileName);
        window.TabManager.open(fileName);
        window.Router.navigate(fileName);

        // Track cursor position on click inside editor
        pane.onclick = () => updateStatusPosition(1, 1);
    }

    /* Update status bar line/col */
    function updateStatusPosition(ln, col) {
        const posEl = document.getElementById('status-position');
        if (posEl) posEl.textContent = `Ln ${ln}, Col ${col}`;
    }

    /* Show welcome screen when no file open */
    function showWelcome() {
        const editorContent = document.getElementById('editor-content');
        if (editorContent) {
            // Hide all existing panes
            const panes = editorContent.querySelectorAll('.editor-pane');
            panes.forEach(p => p.style.display = 'none');

            // Check if welcome pane exists
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
            welcomePane.style.display = 'flex'; // Welcome screen needs flex for centering
            welcomePane.style.flexDirection = 'column';
            welcomePane.style.alignItems = 'center';
            welcomePane.style.justifyContent = 'center';
            welcomePane.style.height = '100%';
        }
        // Clear breadcrumb
        const bcFolder = document.querySelector('.bc-item.bc-folder');
        const bcFile   = document.getElementById('bc-current');
        const titleFile = document.getElementById('title-current-file');
        if (bcFolder) bcFolder.textContent = '';
        if (bcFile)   bcFile.textContent   = 'No file open';
        if (titleFile) titleFile.textContent = 'Welcome';
    }

    /* ─────────────────────────────────────────
       MOBILE SIDEBAR TOGGLE
    ───────────────────────────────────────── */
    function initMobileSidebar() {
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
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('visible');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    }


    /* ─────────────────────────────────────────
       LAYOUT CONTROLS
    ───────────────────────────────────────── */
    function initLayoutControls() {
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

        // Toggle Bottom Panel (Terminal)
        if (layoutBottom && terminalPanel) {
            layoutBottom.addEventListener('click', () => {
                if (window.Terminal) {
                    window.Terminal.toggle();
                }
            });
        }

        // Toggle Right Sidebar
        function toggleRightSidebar() {
            if (!rightSidebar || !layoutRight) return;
            const isHidden = rightSidebar.classList.toggle('hidden');
            if (isHidden) {
                layoutRight.classList.remove('active');
            } else {
                layoutRight.classList.add('active');
                // Focus the AI input when panel opens
                if (window.JarvisAI) window.JarvisAI.focusInput();
            }
        }

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

    /* ─────────────────────────────────────────
       KEYBOARD SHORTCUTS
    ───────────────────────────────────────── */
    function initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+` → toggle terminal
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                if (window.Terminal) window.Terminal.toggle();
            }
            // Ctrl+B → toggle sidebar
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('collapsed');
            }
            // Escape → close mobile sidebar
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobile-overlay');
                const hamburger = document.getElementById('mobile-hamburger');
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('visible');
                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    }

    /* ─────────────────────────────────────────
       INIT
    ───────────────────────────────────────── */
    function init() {
        // Expose openFile globally (for welcome screen badge clicks)
        window.openFile = openFile;

        // Init modules
        window.Explorer.init(openFile);

        window.TabManager.init(
            /* onTabSwitch */ function(fileName) {
                if (fileName) openFile(fileName);
                else showWelcome();
            },
            /* onTabClose  */ function(fileName) {
                if (!fileName) showWelcome();
            }
        );

        window.Router.init(openFile);
        window.Terminal.init();

        initMobileSidebar();
        initKeyboard();
        initLayoutControls();

        // Initialise the J.A.R.V.I.S AI module
        if (window.JarvisAI) window.JarvisAI.init();

        // Initialise resizable panels
        if (window.PanelResizer) window.PanelResizer.init();

        // No file is opened by default — user picks from the Explorer.
        // Only route if the URL already has a hash (e.g. deep-link).
        const hash = window.location.hash;
        if (hash && hash !== '#') {
            // Small delay to ensure DOM is settled
            setTimeout(() => openFile(decodeURIComponent(hash.slice(1))), 100);
        }
    }

    // Boot after data is loaded AND DOM is ready
    function boot() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    // dataLoader.js dispatches 'portfolioDataReady' after all JSON is fetched
    document.addEventListener('portfolioDataReady', boot);

}());
