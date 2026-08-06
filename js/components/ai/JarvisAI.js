/**
 * JarvisAI.js
 * J.A.R.V.I.S Portfolio AI Assistant as an ES6 Module.
 * Connects to DataService and EventBus.
 */

import { eventBus } from '../../core/EventBus.js';
import { dataService } from '../../services/DataService.js';

class JarvisAI {
    constructor() {
        this.BOT_NAME = 'J.A.R.V.I.S';
        this.STREAM_DELAY = 12;
        this.THINK_DELAY = 750;
        this.MAX_CHUNK = 3;

        this.SUGGESTED_PROMPTS = [
            'Tell me about Akash',
            'Show me your projects',
            'What are your skills?',
            'What technologies do you use?',
            'Tell me about your education',
            'Show contact information',
            'Show social links',
            'How can I hire you?'
        ];

        this.INTENTS = [
            { name: 'greeting', re: /\b(hi|hello|hey|howdy|good (morning|evening|afternoon))\b/i },
            { name: 'about', re: /\b(who (is|are)|about (akash|you|yourself)|introduce|bio|background|profile|tell me about (akash|you))\b/i },
            { name: 'projects', re: /\b(project|portfolio|work|built|made|created|developed|app|application|website|show (your|me|his) (project|work))\b/i },
            { name: 'skills', re: /\b(skill|capability|proficien|good at|expert|speciali[sz]|what (can|do) (you|he))\b/i },
            { name: 'technologies', re: /\b(tech(nolog|stack|nique)|framework|language|tool|library|stack|react|node\.?js|javascript|python|html|css|php|mysql|mongodb|wordpress)\b/i },
            { name: 'education', re: /\b(educat|degree|university|college|study|studi|school|bca|course|qualif|academic)\b/i },
            { name: 'experience', re: /\b(experience|work histor|career|professional|years|intern)\b/i },
            { name: 'achievements', re: /\b(achiev|award|winner|won|hackathon|competition|prize|recogn|accomplishment)\b/i },
            { name: 'certifications', re: /\b(certif|credential|diploma|training)\b/i },
            { name: 'contact', re: /\b(contact|email|phone|reach|get in touch|message|mail)\b/i },
            { name: 'social', re: /\b(social|github|linkedin|instagram|twitter|link|profile|follow|connect)\b/i },
            { name: 'hire', re: /\b(hire|hiring|available|open to work|freelance|job offer|opportunity|collaborate|work together)\b/i },
            { name: 'resume', re: /\b(resume|cv|curriculum vitae|download)\b/i },
            { name: 'goals', re: /\b(goal|aim|aspir|dream|future|plan|objective|ambition)\b/i },
            { name: 'services', re: /\b(service|offer|provide|what (do|can) (you|he) (do|offer))\b/i },
            { name: 'location', re: /\b(locat|where|city|country|india|from|based)\b/i }
        ];

        this.OFF_TOPIC = [
            /\b(world cup|fifa|cricket|ipl|football|sport|match|game score)\b/i,
            /\b(weather|temperature|forecast|rain)\b/i,
            /\b(recipe|cook|food|restaurant)\b/i,
            /\b(movie|film|actor|netflix|bollywood)\b/i,
            /\b(politic|election|president|prime minister)\b/i,
            /\b(stock|crypto|bitcoin|ethereum|nse)\b/i,
            /\b(news|headline|current event)\b/i,
            /\b(math|calculate|solve|equation|integral)\b/i
        ];

        this.container = null;
        this.input = null;
        this.sendBtn = null;
        this.clearBtn = null;
        this.kb = null;
        this.busy = false;

        this.handleChip = this.handleChip.bind(this);
    }

    buildKB() {
        const d = dataService.getData();
        if (!d || !d.person) return null;
        return {
            person: d.person,
            education: d.education,
            skills: d.skills,
            projects: d.projects,
            achievements: d.achievements,
            certifications: d.certifications,
            socials: d.socials,
            allSkillNames: [
                ...(d.skills.programming || []),
                ...(d.skills.web || []),
                ...(d.skills.database || []),
                ...(d.skills.tools || [])
            ].map(s => s.name)
        };
    }

    detectIntent(q) {
        for (const i of this.INTENTS) { if (i.re.test(q)) return i.name; }
        return null;
    }

    isOffTopic(q) {
        return this.OFF_TOPIC.some(p => p.test(q));
    }

    chips(list) {
        return '<div class="ai-chips">' + list.map(c =>
            `<button class="ai-chip" data-query="${c}">${c}</button>`).join('') + '</div>';
    }

    tags(list) {
        return '<div class="ai-tags">' + list.map(t =>
            `<span class="ai-tag">${t}</span>`).join('') + '</div>';
    }

    techTags(list) {
        return '<div class="ai-tags">' + list.map(t =>
            `<span class="ai-tag ai-tag-tech">${t}</span>`).join('') + '</div>';
    }

    eduItem(title, meta, desc, tagsArr) {
        return `<div class="ai-edu-item">
<div class="ai-edu-degree">${title}</div>
<div class="ai-edu-meta">${meta}</div>
${desc ? `<div class="ai-edu-desc">${desc}</div>` : ''}
${tagsArr ? this.tags(tagsArr) : ''}
</div>`;
    }

    generate(intent, kb) {
        const p = kb.person;
        switch (intent) {
            case 'greeting':
                return `<p>Hello! Great to meet you. 👋</p>
<p>I'm <strong>${this.BOT_NAME}</strong>, ${p.name}'s personal AI portfolio assistant.</p>
<p>What would you like to know?</p>
${this.chips(['Tell me about Akash', 'Show me his projects', 'What are his skills?', 'How to contact him?'])}`;

            case 'about':
                return `<p><strong>${p.name}</strong> is a <em>${p.title}</em> based in <strong>${p.location}</strong>.</p>
${p.bio.map(b => `<p>${b}</p>`).join('')}
${this.tags(p.roles)}
<p>📊 <strong>${p.stats.projects}</strong> Projects · <strong>${p.stats.certifications}</strong> Certifications · <strong>${p.stats.experience}</strong> Experience</p>`;

            case 'projects':
                return `<p>${p.name} has built <strong>${kb.projects.length}</strong> projects:</p>
${kb.projects.map(pr => {
                    const live = pr.live && pr.live !== '#' ? `<a href="${pr.live}" target="_blank" rel="noopener noreferrer" class="ai-link">🔗 Live Demo</a>` : '';
                    return `<div class="ai-project-item">
<div class="ai-project-title">📁 ${pr.title}</div>
<div class="ai-project-desc">${pr.description}</div>
<div class="ai-project-meta">
${this.techTags(pr.tech)}
<div class="ai-project-links">
<a href="${pr.github}" target="_blank" rel="noopener noreferrer" class="ai-link">⭐ GitHub</a>
${live}
</div></div></div>`;
                }).join('')}
<p>💡 <em>Open <strong>projects.md</strong> in the Explorer for a visual gallery.</em></p>`;

            case 'skills':
                return `<p>Here's ${p.name}'s technical skill breakdown:</p>
${[['💻 Programming', kb.skills.programming], ['🌐 Web Dev', kb.skills.web], ['🗄️ Databases', kb.skills.database], ['🛠️ Tools', kb.skills.tools]]
                        .map(([lbl, items]) => `<div class="ai-skill-group">
<div class="ai-skill-group-title">${lbl}</div>
<div class="ai-tags">${items.map(s => `<span class="ai-tag">${s.name} <span class="ai-tag-level">${s.level}%</span></span>`).join('')}</div>
</div>`).join('')}
<p>💡 <em>See <strong>skills.md</strong> for interactive skill bars.</em></p>`;

            case 'technologies':
                return `<p>${p.name} works with a wide range of technologies:</p>
${this.techTags(kb.allSkillNames)}
<p>Primary stack: <strong>HTML · CSS · JavaScript · React · Node.js · Python · MySQL</strong></p>`;

            case 'education':
                return `<p>${p.name}'s educational background:</p>
${kb.education.map(e => this.eduItem(`🎓 ${e.degree}`, `${e.institution}, ${e.location} · ${e.period}`, e.description)).join('')}`;

            case 'experience':
                return `<p>${p.name} has <strong>${p.stats.experience}</strong> of hands-on development experience, building real-world projects while pursuing his BCA degree.</p>
${this.tags(['Frontend Development', 'Full-Stack Projects', 'Open Source', 'Hackathon Participation'])}
<p>💡 <em>Check <strong>work.md</strong> for the full timeline.</em></p>`;

            case 'achievements':
                return `<p>Notable achievements:</p>
${kb.achievements.map(a => this.eduItem(`🏆 ${a.title}`, `${a.subtitle} · ${a.date}`, a.description, a.tags)).join('')}`;

            case 'certifications':
                return `<p>${p.name} holds <strong>${kb.certifications.length}</strong> certifications:</p>
${kb.certifications.map(c => this.eduItem(`📜 ${c.name}`, c.body, c.desc)).join('')}`;

            case 'contact':
                return `<p>Here's how to reach <strong>${p.name}</strong>:</p>
<div class="ai-contact-list">
<a href="mailto:${p.email}" class="ai-contact-item"><span class="ai-contact-icon">📧</span><span>${p.email}</span></a>
<a href="tel:${p.phone.replace(/\s/g, '')}" class="ai-contact-item"><span class="ai-contact-icon">📞</span><span>${p.phone}</span></a>
<a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>
<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">🐙</span><span>GitHub</span></a>
</div>
<p>He typically responds within <strong>24 hours</strong>. 😊</p>`;

            case 'social':
                return `<p>${p.name}'s social profiles:</p>
<div class="ai-contact-list">
<a href="${kb.socials.github}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">🐙</span><span>GitHub</span></a>
<a href="${kb.socials.linkedin}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>
<a href="${kb.socials.instagram}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">📸</span><span>Instagram</span></a>
<a href="${p.website}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">🌐</span><span>Portfolio Website</span></a>
</div>`;

            case 'hire':
                return `<p>Yes! <strong>${p.name}</strong> is open to new opportunities! 🎉</p>
${this.tags(['Freelance Projects', 'Internships', 'Open Source Collaborations', 'Full-time Opportunities'])}
<div class="ai-contact-list">
<a href="mailto:${p.email}" class="ai-contact-item"><span class="ai-contact-icon">📧</span><span>${p.email}</span></a>
<a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>
</div>`;

            case 'resume':
                return `<p>Summary of <strong>${p.name}'s</strong> profile:</p>
${this.eduItem(`👤 ${p.name}`, `${p.title} · ${p.location}`, null)}
<div class="ai-tags">
<span class="ai-tag">Projects: ${p.stats.projects}</span>
<span class="ai-tag">Certifications: ${p.stats.certifications}</span>
<span class="ai-tag">Experience: ${p.stats.experience}</span>
</div>
<p>For a full resume, <a href="mailto:${p.email}" class="ai-link">contact him</a> or connect on <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="ai-link">LinkedIn</a>.</p>`;

            case 'goals':
                return `<p>${p.name}'s goals:</p>
${this.eduItem('🎯 Short-term', '', 'Complete BCA, land a developer internship, contribute to open source.')}
${this.eduItem('🚀 Long-term', '', 'Become a skilled full-stack engineer and build products that solve real-world problems.')}
${this.tags(['Full-Stack Dev', 'Open Source', 'Innovation', 'Software Engineering'])}`;

            case 'services':
                return `<p><strong>${p.name}</strong> offers:</p>
${this.eduItem('🌐 Web Development', '', 'Modern, responsive websites using HTML, CSS, JS, React, Node.js.')}
${this.eduItem('🎨 UI/UX Design', '', 'Clean, user-friendly interfaces focused on experience and accessibility.')}
${this.eduItem('🤖 Chatbot Development', '', 'AI-powered assistants and chatbots for websites.')}
${this.eduItem('🗃️ Backend & Database', '', 'Server-side with Node.js, MySQL, and MongoDB.')}`;

            case 'location':
                return `<p><strong>${p.name}</strong> is based in <strong>${p.location}</strong> 📍</p>
<p>He works remotely and is open to local and international opportunities worldwide.</p>`;

            default:
                return `<p>I'm not sure about that. Try asking me something else:</p>
${this.chips(['About Akash', 'Projects', 'Skills', 'Education', 'Contact'])}`;
        }
    }

    offTopicResp() {
        return `<p>I'm <strong>${this.BOT_NAME}</strong>, Akash's portfolio assistant. I can only answer questions related to his portfolio.</p>
<p>Try asking about:</p>
${this.chips(['Tell me about Akash', 'What projects has he built?', 'What skills does he have?', 'How to contact him?'])}`;
    }

    ts() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    appendMsg(sender, html, empty) {
        const wrap = document.createElement('div');
        wrap.className = `jarvis-msg ${sender} jarvis-msg-entering`;
        const ico = sender === 'bot' ? 'fa-robot' : 'fa-user';
        const name = sender === 'bot' ? this.BOT_NAME : 'You';
        wrap.innerHTML = `
<div class="jarvis-msg-header">
  <div class="jarvis-msg-avatar"><i class="fas ${ico}"></i></div>
  <div class="jarvis-msg-name">${name}</div>
  <div class="jarvis-msg-time">${this.ts()}</div>
</div>
<div class="jarvis-msg-content">${empty ? '' : html}</div>`;
        this.container.appendChild(wrap);
        requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('jarvis-msg-entering')));
        this.scroll();
        return wrap.querySelector('.jarvis-msg-content');
    }

    showTyping() {
        const wrap = document.createElement('div');
        wrap.className = 'jarvis-msg bot jarvis-typing-wrap jarvis-msg-entering';
        wrap.innerHTML = `
<div class="jarvis-msg-header">
  <div class="jarvis-msg-avatar"><i class="fas fa-robot"></i></div>
  <div class="jarvis-msg-name">${this.BOT_NAME}</div>
</div>
<div class="jarvis-msg-content">
  <div class="jarvis-typing-indicator"><span></span><span></span><span></span></div>
</div>`;
        this.container.appendChild(wrap);
        requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('jarvis-msg-entering')));
        this.scroll();
        return () => wrap.remove();
    }

    stream(contentEl, html, done) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const full = tmp.innerText;
        let i = 0;
        contentEl.innerHTML = '<p></p>';
        const para = contentEl.querySelector('p');

        const tick = () => {
            const chunk = Math.min(this.MAX_CHUNK, full.length - i);
            for (let k = 0; k < chunk; k++) { para.textContent += full[i++]; }
            this.scroll();
            if (i < full.length) {
                setTimeout(tick, this.STREAM_DELAY);
            } else {
                contentEl.innerHTML = html;
                this.attachChips(contentEl);
                this.scroll();
                if (done) done();
            }
        };
        tick();
    }

    scroll() {
        if (this.container) this.container.scrollTop = this.container.scrollHeight;
    }

    attachChips(el) {
        el.querySelectorAll('.ai-chip').forEach(c => {
            c.addEventListener('click', () => this.handleChip(c.dataset.query));
        });
    }

    disableInput(v) {
        if (this.input) this.input.disabled = v;
        if (this.sendBtn) this.sendBtn.disabled = v;
        if (this.sendBtn && v) this.sendBtn.classList.remove('active');
    }

    resize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }

    renderWelcome() {
        this.container.innerHTML = '';
        if (!this.kb || !this.kb.person) return;
        const pn = this.kb.person.name.split(' ')[0];
        const html = `<p>Hello! I'm <strong>${this.BOT_NAME}</strong> — ${this.kb.person.name}'s AI portfolio assistant. 🤖</p>
<p>I can help you learn about ${pn}'s work, skills, projects, education, and more.</p>
<p>Here are some things you can ask:</p>
${this.chips(this.SUGGESTED_PROMPTS)}`;
        const el = this.appendMsg('bot', '', false);
        el.innerHTML = html;
        this.attachChips(el);
        this.scroll();
    }

    handleChip(q) {
        if (!this.busy) this.sendMsg(q);
    }

    sendMsg(query) {
        const q = query.trim();
        if (!q || this.busy) return;
        this.busy = true;
        this.disableInput(true);

        this.appendMsg('user', `<p>${this.escHtml(q)}</p>`, false);

        const rm = this.showTyping();
        setTimeout(() => {
            rm();
            let html;
            if (this.isOffTopic(q)) {
                html = this.offTopicResp();
            } else {
                const intent = this.detectIntent(q);
                html = this.generate(intent, this.kb);
            }
            const el = this.appendMsg('bot', '', true);
            this.stream(el, html, () => {
                this.busy = false;
                this.disableInput(false);
                if (this.input) this.input.focus();
            });
        }, this.THINK_DELAY);
    }

    render() {
        return `
            <!-- Right Sidebar / JARVIS Panel -->
            <aside id="right-sidebar" class="hidden" role="complementary" aria-label="J.A.R.V.I.S Assistant">
                <div id="jarvis-panel" class="panel-content active">
                    <div class="sidebar-header">
                        <span class="sidebar-title">CHAT</span>
                        <div class="sidebar-actions">
                            <button class="sidebar-action-btn" title="Clear Chat" id="clear-jarvis" aria-label="Clear Chat">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="sidebar-action-btn" title="Close" id="close-jarvis" aria-label="Close J.A.R.V.I.S">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="jarvis-chat">
                        <div class="jarvis-messages" id="jarvis-messages"></div>
                        <div class="jarvis-input-container">
                            <div class="jarvis-input-wrapper">
                                <textarea placeholder="Ask me anything..." id="jarvis-input" rows="1"></textarea>
                                <button id="jarvis-send" title="Send (Enter)"><i class="fas fa-paper-plane"></i></button>
                            </div>
                            <div class="jarvis-disclaimer">Portfolio AI · Shift+Enter for new line</div>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    }

    init() {
        this.container = document.getElementById('jarvis-messages');
        this.input = document.getElementById('jarvis-input');
        this.sendBtn = document.getElementById('jarvis-send');
        this.clearBtn = document.getElementById('clear-jarvis');
        if (!this.container || !this.input) return;

        this.kb = this.buildKB();
        if (this.kb) {
            this.renderWelcome();
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                const v = this.input.value.trim();
                if (v) { const q = v; this.input.value = ''; this.input.style.height = 'auto'; this.sendBtn.classList.remove('active'); this.sendMsg(q); }
            });
        }

        const self = this;
        this.input.addEventListener('input', function () {
            self.resize(this);
            if (self.sendBtn) self.sendBtn.classList.toggle('active', this.value.trim().length > 0);
        });

        this.input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const v = this.value.trim();
                if (v && !self.busy) {
                    const q = v; this.value = ''; this.style.height = 'auto';
                    if (self.sendBtn) self.sendBtn.classList.remove('active');
                    self.sendMsg(q);
                }
            }
        });

        if (this.clearBtn) this.clearBtn.addEventListener('click', this.clearChat.bind(this));

        this.container.addEventListener('click', e => {
            const chip = e.target.closest('.ai-chip');
            if (chip) this.handleChip(chip.dataset.query);
        });

        eventBus.on('jarvis:focus', this.focusInput.bind(this));
    }

    focusInput() {
        if (this.input && !this.input.disabled) setTimeout(() => this.input.focus(), 120);
    }

    clearChat() {
        if (this.busy) return;
        this.renderWelcome();
        if (this.input) { this.input.value = ''; this.input.style.height = 'auto'; }
        if (this.sendBtn) this.sendBtn.classList.remove('active');
    }
}

export const jarvisAI = new JarvisAI();
