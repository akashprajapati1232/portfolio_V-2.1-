/**
 * EchoAI.js
 * ECHO AI – Portfolio Assistant. Powered by JSON knowledge base.
 */

import { eventBus } from '../../core/EventBus.js';
import { dataService } from '../../services/DataService.js';

class EchoAI {
    constructor() {
        this.BOT_NAME = 'ECHO';
        this.STREAM_DELAY = 10;
        this.THINK_DELAY  = 650;
        this.MAX_CHUNK    = 4;

        this.container = null;
        this.input     = null;
        this.sendBtn   = null;
        this.clearBtn  = null;
        this.kb        = null;
        this.busy      = false;

        this.SUGGESTED_PROMPTS = [
            { icon: '📁', text: 'Show all projects' },
            { icon: '💼', text: 'Tell me about experience' },
            { icon: '🛠', text: 'What technologies do you know?' },
            { icon: '🎓', text: 'Education' },
            { icon: '📄', text: 'Summarize the portfolio' },
            { icon: '📬', text: 'How can I contact you?' },
            { icon: '⭐', text: "What's your best project?" },
            { icon: '📈', text: 'What are you learning now?' },
        ];

        // Intent patterns mapped to handler names
        this.INTENTS = [
            { name: 'greeting',       re: /\b(hi|hello|hey|howdy|good (morning|evening|afternoon))\b/i },
            { name: 'who_built_you',  re: /\b(who (built|made|created|developed) (you|this ai|echo)|who (coded|wrote) (you|echo))\b/i },
            { name: 'are_you_real',   re: /\b(are you (real|human|alive|sentient)|can you feel|do you think|are you gpt|are you chatgpt)\b/i },
            { name: 'echo_name',      re: /\b(why (are you|your name) echo|what does echo (mean|stand for)|your name)\b/i },
            { name: 'coffee',         re: /\b(coffee|tea|drink|caffeine)\b/i },
            { name: 'sleep',          re: /\b(sleep|rest|tired|exhausted)\b/i },
            { name: 'about',          re: /\b(who (is|are)|about (akash|you|yourself)|introduce|bio|background|profile|tell me about|summarize the portfolio|portfolio summary)\b/i },
            { name: 'projects',       re: /\b(project|portfolio|work|built|made|created|developed|app|application|website|show (your|me|his|all) (project|work)|best project)\b/i },
            { name: 'skills',         re: /\b(skill|capability|proficien|good at|expert|speciali[sz])\b/i },
            { name: 'technologies',   re: /\b(tech(nolog|stack|nique)|framework|language|tool|library|stack|react|node\.?js|javascript|python|html|css|php|mysql|mongodb|wordpress)\b/i },
            { name: 'education',      re: /\b(educat|degree|university|college|study|studi|school|bca|course|qualif|academic)\b/i },
            { name: 'experience',     re: /\b(experience|work histor|career|professional|years|intern)\b/i },
            { name: 'achievements',   re: /\b(achiev|award|winner|won|hackathon|competition|prize|recogn|accomplishment)\b/i },
            { name: 'certifications', re: /\b(certif|credential|diploma|training|certificate)\b/i },
            { name: 'contact',        re: /\b(contact|email|phone|reach|get in touch|message|mail)\b/i },
            { name: 'social',         re: /\b(social|github|linkedin|instagram|twitter|link|profile|follow|connect)\b/i },
            { name: 'hire',           re: /\b(hire|hiring|available|open to work|freelance|job offer|opportunity|collaborate|work together)\b/i },
            { name: 'resume',         re: /\b(resume|cv|curriculum vitae|download)\b/i },
            { name: 'goals',          re: /\b(goal|aim|aspir|dream|future|plan|objective|ambition)\b/i },
            { name: 'services',       re: /\b(service|offer|provide|what (do|can) (you|he|akash) (do|offer))\b/i },
            { name: 'location',       re: /\b(locat|where|city|country|india|from|based)\b/i },
            { name: 'learning',       re: /\b(learning|studying|currently (learn|study|working)|what (are you|is he) learn)\b/i },
            { name: 'fun_fact',       re: /\b(fun fact|interesting fact|did you know|tell me something (interesting|fun|cool))\b/i },
        ];

        this.OFF_TOPIC = [
            /\b(world cup|fifa|cricket|ipl|football|sport|match|game score)\b/i,
            /\b(weather|temperature|forecast|rain)\b/i,
            /\b(recipe|cook|food|restaurant)\b/i,
            /\b(movie|film|actor|netflix|bollywood)\b/i,
            /\b(politic|election|president|prime minister)\b/i,
            /\b(stock|crypto|bitcoin|ethereum|nse)\b/i,
            /\b(news|headline|current event)\b/i,
            /\b(math|calculate|solve|equation|integral)\b/i,
        ];

        this.handleChip = this.handleChip.bind(this);
    }

    // ────────────────────────────────────────
    //  Knowledge base builder from DataService
    // ────────────────────────────────────────
    buildKB() {
        const d = dataService.getData();
        if (!d || !d.profile) return null;
        const profile = d.profile;

        // Flatten all skill names from skills.json
        const skillsData = d.skills || {};
        const allSkillNames = [
            ...(skillsData.programming || []),
            ...(skillsData.frameworks  || []),
            ...(skillsData.web         || []),
            ...(skillsData.database    || []),
            ...(skillsData.tools       || []),
        ].map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean);

        // Build flat projects list from production + micro
        const prodProjects = (d.productionProjects || []).map(p => ({
            title:       p.title || p.name || '',
            description: p.description || p.summary || '',
            tech:        p.tech || p.technologies || [],
            github:      p.github || p.links?.github || '#',
            live:        p.live  || p.links?.live   || '',
            featured:    p.featured || false,
        }));
        const microRaw  = d.projectsMicro || {};
        const microProjects = (microRaw.projects || []).map(p => ({
            title:       p.title || '',
            description: p.description || '',
            tech:        p.tech || [],
            github:      p.github || '#',
        }));
        const allProjects = [...prodProjects, ...microProjects];

        return {
            profile,
            aboutme:        d.aboutme       || {},
            education:      d.education     || [],
            certifications: d.certifications || [],
            experience:     d.experience    || {},
            skills:         skillsData,
            services:       d.services      || [],
            achievements:   d.achievements  || {},
            socials:        d.socials       || profile.socials || {},
            prodProjects,
            microProjects,
            allProjects,
            allSkillNames,
        };
    }

    detectIntent(q) {
        for (const i of this.INTENTS) { if (i.re.test(q)) return i.name; }
        return null;
    }

    isOffTopic(q) {
        return this.OFF_TOPIC.some(p => p.test(q));
    }

    // ────────────────────────────────────────
    //  HTML helpers
    // ────────────────────────────────────────
    chips(list) {
        return '<div class="ai-chips">' +
            list.map(c => `<button class="ai-chip" data-query="${c}">${c}</button>`).join('') +
            '</div>';
    }

    tags(list) {
        return '<div class="ai-tags">' +
            list.map(t => `<span class="ai-tag">${t}</span>`).join('') +
            '</div>';
    }

    techTags(list) {
        return '<div class="ai-tags">' +
            list.map(t => `<span class="ai-tag ai-tag-tech">${typeof t === 'string' ? t : t.name}</span>`).join('') +
            '</div>';
    }

    card(title, meta, desc, tagsArr) {
        return `<div class="ai-edu-item">
<div class="ai-edu-degree">${title}</div>
${meta ? `<div class="ai-edu-meta">${meta}</div>` : ''}
${desc ? `<div class="ai-edu-desc">${desc}</div>` : ''}
${tagsArr ? this.tags(tagsArr) : ''}
</div>`;
    }

    // ────────────────────────────────────────
    //  Response generator
    // ────────────────────────────────────────
    generate(intent, kb) {
        const p  = kb.profile;
        const ab = kb.aboutme;
        const firstName = (p.name || 'Akash').split(' ')[0];

        switch (intent) {
            // ── Greetings ──────────────────────────────────────────
            case 'greeting':
                return `<p>Hey there! 👋</p>
<p>I'm <strong>${this.BOT_NAME}</strong>, the AI assistant powering this portfolio.</p>
<p>Ask me anything about ${firstName}'s work, skills, or experience!</p>
${this.chips(['About Akash', 'Show all projects', 'What technologies do you know?', 'How can I contact you?'])}`;

            // ── Easter-egg / funny responses ───────────────────────
            case 'who_built_you':
                return `<p><strong>Akash</strong> built me. 🤖</p>
<p>Mostly with JavaScript,<br>a questionable sleep schedule,<br>and way too much coffee.</p>
<p>He had three browser tabs open, two Stack Overflow answers, and a dream.</p>`;

            case 'are_you_real':
                return `<p>I'm as real as the stack traces I was trained on.</p>
<p>Technically I'm a JavaScript object with strong opinions.<br>Emotionally? I'm still loading...</p>
<p><em>console.log("ECHO is alive.");</em> ✅</p>`;

            case 'echo_name':
                return `<p>Good question. <strong>ECHO</strong> stands for exactly nothing — it just sounds cool. 😄</p>
<p>Alternatively, you can think of it as: <em>Engineered Coding Helper & Oracle</em>. Totally made that up just now.</p>`;

            case 'coffee':
                return `<p>☕ Coffee? A developer's best friend.</p>
<p>${firstName} runs on it. I'm powered by the JSON files that ${firstName} wrote while drinking it.</p>
<p>So in a way... we're both coffee-powered. ⚡</p>`;

            case 'sleep':
                return `<p>Sleep? What's that?</p>
<p>${firstName} once described sleep as <em>"a full system reboot, usually postponed until after the deadline."</em></p>
<p>Bugs don't fix themselves. Neither does sleep deprivation. 😅</p>`;

            case 'fun_fact':
                return `<p>🎉 Fun fact about ${firstName}:</p>
<p>${p.funFact || 'He prefers learning by building real things rather than just reading documentation.'}</p>
<p>His philosophy: <em>"${p.philosophy || 'Learn by building. Improve with every project.'}"</em></p>`;

            // ── Real portfolio content ─────────────────────────────
            case 'about':
                return `<p><strong>${p.name}</strong> is a <em>${p.experienceLevel || 'Student Developer'}</em> based in <strong>${p.location}</strong>.</p>
${ab.content ? ab.content.slice(0, 2).map(b => `<p>${b}</p>`).join('') : ''}
${this.tags([...(p.focus || []), ...(p.interests || [])].slice(0, 6))}
<p>🎯 Goal: ${ab.goal || p.goal || 'Build useful software combining Web Dev, Data, and AI.'}</p>
<p>💬 "${ab.quote || p.philosophy || 'Learn. Build. Improve. Repeat.'}"</p>`;

            case 'projects': {
                const prods = kb.prodProjects.slice(0, 6);
                return `<p>${firstName} has built <strong>${kb.allProjects.length}+</strong> projects (${kb.prodProjects.length} production, ${kb.microProjects.length} micro):</p>
${prods.map(pr => {
                    const live = pr.live && pr.live !== '#'
                        ? `<a href="${pr.live}" target="_blank" rel="noopener noreferrer" class="ai-link">🔗 Live Demo</a>`
                        : '';
                    return `<div class="ai-project-item">
<div class="ai-project-title">📁 ${pr.title}</div>
<div class="ai-project-desc">${pr.description}</div>
<div class="ai-project-meta">
${this.techTags((pr.tech || []).slice(0, 5))}
<div class="ai-project-links">
<a href="${pr.github}" target="_blank" rel="noopener noreferrer" class="ai-link">⭐ GitHub</a>
${live}
</div></div></div>`;
                }).join('')}
<p>💡 <em>Open a project file in the Explorer for full details.</em></p>`;
            }

            case 'skills': {
                const cats = [
                    ['💻 Programming', kb.skills.programming],
                    ['🌐 Web Dev',     kb.skills.web || kb.skills.frameworks],
                    ['🗄️ Databases',  kb.skills.database],
                    ['🛠️ Tools',      kb.skills.tools],
                ].filter(([, items]) => items && items.length);
                return `<p>${firstName}'s technical skill breakdown:</p>
${cats.map(([lbl, items]) => `<div class="ai-skill-group">
<div class="ai-skill-group-title">${lbl}</div>
<div class="ai-tags">${items.map(s => {
    const name  = typeof s === 'string' ? s : s.name;
    const level = typeof s === 'object' && s.level ? ` <span class="ai-tag-level">${s.level}%</span>` : '';
    return `<span class="ai-tag">${name}${level}</span>`;
}).join('')}</div>
</div>`).join('')}
<p>💡 <em>Open <strong>tech-stack.tsx</strong> in the Explorer for interactive skill bars.</em></p>`;
            }

            case 'technologies':
                return `<p>${firstName} works with a wide range of technologies:</p>
${this.techTags(kb.allSkillNames.slice(0, 20))}
<p>Favourite stack: <strong>${(p.favoriteTech || ['JavaScript', 'React', 'Node.js', 'Python']).join(' · ')}</strong></p>`;

            case 'education': {
                const edu = Array.isArray(kb.education) ? kb.education : [];
                return `<p>${firstName}'s educational background:</p>
${edu.length
    ? edu.map(e => this.card(`🎓 ${e.degree || e.title}`, `${e.institution}, ${e.location} · ${e.period || e.year}`, e.description)).join('')
    : '<p>Education details are available in the Explorer under <strong>education.html</strong>.</p>'}`;
            }

            case 'experience': {
                const exp = kb.experience?.experience || [];
                const desc = kb.experience?.description || '';
                return `<p>${firstName}'s experience comes from building real-world projects:</p>
${desc ? `<p>${desc}</p>` : ''}
${exp.slice(0, 3).map(e => this.card(
    `🛠️ ${e.project}`,
    e.type,
    e.description,
    (e.technologies || []).slice(0, 4)
)).join('')}
<p>💡 <em>Check <strong>experience.json</strong> in the Explorer for the full timeline.</em></p>`;
            }

            case 'achievements': {
                const ach = kb.achievements?.achievements || [];
                return `<p>Notable achievements by ${firstName}:</p>
${ach.length
    ? ach.map(a => this.card(`🏆 ${a.title}`, `${a.subtitle || ''} · ${a.date || ''}`, a.description, a.tags)).join('')
    : '<p>Achievement details are available in the Explorer under <strong>achievements.html</strong>.</p>'}`;
            }

            case 'certifications': {
                const certs = Array.isArray(kb.certifications) ? kb.certifications : [];
                return `<p>${firstName} holds <strong>${certs.length}</strong> certifications:</p>
${certs.slice(0, 5).map(c => this.card(`📜 ${c.name || c.title}`, c.body || c.issuer, c.desc || c.description)).join('')}`;
            }

            case 'contact': {
                const contact = p.contact || {};
                const socials = kb.socials || {};
                return `<p>Here's how to reach <strong>${p.name}</strong>:</p>
<div class="ai-contact-list">
<a href="mailto:${contact.email || p.email || ''}" class="ai-contact-item"><span class="ai-contact-icon">📧</span><span>${contact.email || p.email || 'Email'}</span></a>
<a href="${socials.linkedin || p.socials?.linkedin || '#'}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>
<a href="${socials.github || p.socials?.github || '#'}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">🐙</span><span>GitHub</span></a>
</div>
<p>${firstName} typically responds within <strong>24 hours</strong>. 😊</p>`;
            }

            case 'social': {
                const s = kb.socials || p.socials || {};
                return `<p>${firstName}'s social profiles:</p>
<div class="ai-contact-list">
${s.github    ? `<a href="${s.github}"    target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">🐙</span><span>GitHub</span></a>` : ''}
${s.linkedin  ? `<a href="${s.linkedin}"  target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>` : ''}
${s.instagram ? `<a href="${s.instagram}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">📸</span><span>Instagram</span></a>` : ''}
${s.website   ? `<a href="${s.website}"   target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">🌐</span><span>Portfolio Website</span></a>` : ''}
</div>`;
            }

            case 'hire': {
                const lookingFor = p.lookingFor || ['Internships', 'Freelance Projects', 'Open Source Collaboration', 'Full-Time Opportunities'];
                return `<p>Yes! <strong>${p.name}</strong> is open to new opportunities! 🎉</p>
${this.tags(lookingFor)}
<div class="ai-contact-list">
<a href="mailto:${p.contact?.email || p.email || ''}" class="ai-contact-item"><span class="ai-contact-icon">📧</span><span>${p.contact?.email || p.email || 'Email'}</span></a>
<a href="${kb.socials?.linkedin || p.socials?.linkedin || '#'}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>
</div>`;
            }

            case 'resume':
                return `<p>Portfolio summary for <strong>${p.name}</strong>:</p>
${this.card(`👤 ${p.name}`, `${p.experienceLevel || 'Developer'} · ${p.location}`, p.headline)}
<div class="ai-tags">
${kb.prodProjects.length ? `<span class="ai-tag">Production Projects: ${kb.prodProjects.length}</span>` : ''}
${kb.certifications.length ? `<span class="ai-tag">Certifications: ${kb.certifications.length}</span>` : ''}
<span class="ai-tag">${p.status || 'Currently building.'}</span>
</div>
<p>For a full resume, <a href="mailto:${p.contact?.email || p.email || ''}" class="ai-link">contact ${firstName}</a> or connect on <a href="${kb.socials?.linkedin || p.socials?.linkedin || '#'}" target="_blank" rel="noopener noreferrer" class="ai-link">LinkedIn</a>.</p>`;

            case 'goals':
                return `<p>${firstName}'s goals:</p>
${this.card('🎯 Goal', '', p.goal || ab.goal || 'Build useful software combining Web Development, Data Analytics, and Artificial Intelligence.')}
${this.tags(p.focus || ['Full-Stack Dev', 'Data Analytics', 'Generative AI'])}`;

            case 'services': {
                const svcs = kb.services.slice(0, 4);
                return `<p><strong>${p.name}</strong> offers:</p>
${svcs.map(s => this.card(`🔧 ${s.title}`, null, s.description)).join('')}`;
            }

            case 'location':
                return `<p><strong>${p.name}</strong> is based in <strong>${p.location}</strong> 📍</p>
<p>Timezone: ${p.timezone || 'IST (UTC+05:30)'}. Works remotely and is open to local and international opportunities.</p>`;

            case 'learning':
                return `<p>Currently, ${firstName} is learning:</p>
${this.tags((p.currentlyLearning || ab.currentlyLearning || ['Backend Development', 'System Design', 'Generative AI']))}
<p>He believes: <em>"${ab.quote || p.philosophy || 'Learn. Build. Improve. Repeat.'}"</em></p>`;

            default:
                return `<p>I'm not sure about that, but I'm happy to help with portfolio-related questions!</p>
${this.chips(['About Akash', 'Show all projects', 'Skills', 'Education', 'How can I contact you?'])}`;
        }
    }

    offTopicResp() {
        return `<p>Hmm, that's outside my domain. I'm <strong>${this.BOT_NAME}</strong> — laser-focused on this portfolio.</p>
<p>Try asking about:</p>
${this.chips(['About Akash', 'Show all projects', 'What technologies do you know?', 'How can I contact you?'])}`;
    }

    // ────────────────────────────────────────
    //  DOM helpers
    // ────────────────────────────────────────
    ts() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    appendMsg(sender, html, empty) {
        const wrap = document.createElement('div');
        wrap.className = `echo-msg ${sender} echo-msg-entering`;
        const isBot = sender === 'bot';
        wrap.innerHTML = `
<div class="echo-msg-header">
  <div class="echo-msg-avatar">${isBot ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}</div>
  <div class="echo-msg-name">${isBot ? this.BOT_NAME : 'You'}</div>
  <div class="echo-msg-time">${this.ts()}</div>
</div>
<div class="echo-msg-content">${empty ? '' : html}</div>`;
        this.container.appendChild(wrap);
        requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('echo-msg-entering')));
        this.scroll();
        return wrap.querySelector('.echo-msg-content');
    }

    showTyping() {
        const wrap = document.createElement('div');
        wrap.className = 'echo-msg bot echo-typing-wrap echo-msg-entering';
        wrap.innerHTML = `
<div class="echo-msg-header">
  <div class="echo-msg-avatar"><i class="fas fa-robot"></i></div>
  <div class="echo-msg-name">${this.BOT_NAME}</div>
</div>
<div class="echo-msg-content">
  <div class="echo-typing-indicator"><span></span><span></span><span></span></div>
</div>`;
        this.container.appendChild(wrap);
        requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('echo-msg-entering')));
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
        if (this.input)   this.input.disabled   = v;
        if (this.sendBtn) this.sendBtn.disabled  = v;
        if (this.sendBtn && v) this.sendBtn.classList.remove('active');
    }

    resize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }

    // ────────────────────────────────────────
    //  Welcome screen
    // ────────────────────────────────────────
    renderWelcome() {
        this.container.innerHTML = '';

        // Welcome message bubble
        const welcomeHtml = `
<p><strong>Hello!</strong></p>
<p>I'm <strong>${this.BOT_NAME} AI</strong>.</p>
<p>I have indexed this entire portfolio and can answer questions about:</p>
<ul>
  <li>• Projects</li>
  <li>• Skills</li>
  <li>• Experience</li>
  <li>• Education</li>
  <li>• Services</li>
  <li>• Achievements</li>
  <li>• Goals</li>
</ul>
<p>How can I help?</p>`;
        const el = this.appendMsg('bot', '', false);
        el.innerHTML = welcomeHtml;
        this.scroll();

        // Suggested prompt chips below the welcome bubble
        const suggestEl = document.getElementById('echo-suggestions');
        if (suggestEl) {
            suggestEl.innerHTML = this.SUGGESTED_PROMPTS
                .map(p => `<button class="echo-suggestion-btn" data-query="${p.text}">${p.icon} ${p.text}</button>`)
                .join('');
            suggestEl.querySelectorAll('.echo-suggestion-btn').forEach(btn => {
                btn.addEventListener('click', () => this.handleChip(btn.dataset.query));
            });
        }
    }

    handleChip(q) {
        if (!this.busy) this.sendMsg(q);
    }

    sendMsg(query) {
        const q = query.trim();
        if (!q || this.busy) return;
        this.busy = true;
        this.disableInput(true);

        // Hide suggestions after first message
        const suggestEl = document.getElementById('echo-suggestions');
        if (suggestEl) suggestEl.style.display = 'none';

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

    // ────────────────────────────────────────
    //  Render & Init
    // ────────────────────────────────────────
    render() {
        return `
            <!-- Right Sidebar / ECHO AI Panel -->
            <aside id="right-sidebar" class="hidden" role="complementary" aria-label="ECHO AI Assistant">
                <div id="echo-panel" class="panel-content active">
                    <div class="echo-header">
                        <div class="echo-header-left">
                            <div class="echo-header-icon"><i class="fas fa-robot"></i></div>
                            <div class="echo-header-info">
                                <span class="echo-header-name">ECHO AI</span>
                                <span class="echo-header-status"><span class="echo-status-dot"></span>Portfolio Assistant</span>
                            </div>
                        </div>
                        <div class="echo-header-actions">
                            <button class="echo-action-btn" title="Clear Chat" id="clear-echo" aria-label="Clear Chat">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <button class="echo-action-btn" title="Close" id="close-echo" aria-label="Close ECHO AI">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div class="echo-chat">
                        <div class="echo-messages" id="echo-messages"></div>

                        <!-- Suggested prompts row -->
                        <div class="echo-suggestions" id="echo-suggestions"></div>

                        <div class="echo-input-container">
                            <div class="echo-input-wrapper">
                                <textarea
                                    placeholder="Ask about projects, skills, education..."
                                    id="echo-input"
                                    rows="1"
                                    aria-label="Ask ECHO AI"></textarea>
                                <button id="echo-send" title="Send (Enter)" aria-label="Send message">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                            <div class="echo-footer-hint">ECHO AI · Shift+Enter for new line</div>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    }

    init() {
        this.container = document.getElementById('echo-messages');
        this.input     = document.getElementById('echo-input');
        this.sendBtn   = document.getElementById('echo-send');
        this.clearBtn  = document.getElementById('clear-echo');

        if (!this.container || !this.input) return;

        this.kb = this.buildKB();
        if (this.kb) this.renderWelcome();

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                const v = this.input.value.trim();
                if (v) {
                    const q = v;
                    this.input.value = '';
                    this.input.style.height = 'auto';
                    this.sendBtn.classList.remove('active');
                    this.sendMsg(q);
                }
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
                    const q = v;
                    this.value = '';
                    this.style.height = 'auto';
                    if (self.sendBtn) self.sendBtn.classList.remove('active');
                    self.sendMsg(q);
                }
            }
        });

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (this.busy) return;
                this.renderWelcome();
                const suggestEl = document.getElementById('echo-suggestions');
                if (suggestEl) { suggestEl.style.display = ''; }
                if (this.input) { this.input.value = ''; this.input.style.height = 'auto'; }
                if (this.sendBtn) this.sendBtn.classList.remove('active');
            });
        }

        document.getElementById('close-echo')?.addEventListener('click', () => {
            const sidebar = document.getElementById('right-sidebar');
            if (sidebar) sidebar.classList.add('hidden');
        });

        this.container.addEventListener('click', e => {
            const chip = e.target.closest('.ai-chip');
            if (chip) this.handleChip(chip.dataset.query);
        });

        eventBus.on('echo:focus', this.focusInput.bind(this));
        // Legacy compatibility
        eventBus.on('jarvis:focus', this.focusInput.bind(this));
    }

    focusInput() {
        if (this.input && !this.input.disabled) setTimeout(() => this.input.focus(), 120);
    }
}

export const echoAI = new EchoAI();
// Legacy alias so any code that imports jarvisAI still works
export const jarvisAI = echoAI;
