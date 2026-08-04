/**
 * ai.js – J.A.R.V.I.S Portfolio AI Assistant
 * Self-contained, modular chat module.
 * Public API via window.JarvisAI: init(), focusInput(), clearChat()
 */

window.JarvisAI = (function () {
    'use strict';

    const BOT_NAME     = 'J.A.R.V.I.S';
    const STREAM_DELAY = 12;
    const THINK_DELAY  = 750;
    const MAX_CHUNK    = 3;

    const SUGGESTED_PROMPTS = [
        'Tell me about Akash',
        'Show me your projects',
        'What are your skills?',
        'What technologies do you use?',
        'Tell me about your education',
        'Show contact information',
        'Show social links',
        'How can I hire you?'
    ];

    /* ── KNOWLEDGE BASE ── */
    function buildKB() {
        const d = window.PORTFOLIO_DATA;
        return {
            person:         d.person,
            education:      d.education,
            skills:         d.skills,
            projects:       d.projects,
            achievements:   d.achievements,
            certifications: d.certifications,
            socials:        d.socials,
            allSkillNames:  [
                ...d.skills.programming,
                ...d.skills.web,
                ...d.skills.database,
                ...d.skills.tools
            ].map(s => s.name)
        };
    }

    /* ── INTENT DETECTION ── */
    const INTENTS = [
        { name:'greeting',       re:/\b(hi|hello|hey|howdy|good (morning|evening|afternoon))\b/i },
        { name:'about',          re:/\b(who (is|are)|about (akash|you|yourself)|introduce|bio|background|profile|tell me about (akash|you))\b/i },
        { name:'projects',       re:/\b(project|portfolio|work|built|made|created|developed|app|application|website|show (your|me|his) (project|work))\b/i },
        { name:'skills',         re:/\b(skill|capability|proficien|good at|expert|speciali[sz]|what (can|do) (you|he))\b/i },
        { name:'technologies',   re:/\b(tech(nolog|stack|nique)|framework|language|tool|library|stack|react|node\.?js|javascript|python|html|css|php|mysql|mongodb|wordpress)\b/i },
        { name:'education',      re:/\b(educat|degree|university|college|study|studi|school|bca|course|qualif|academic)\b/i },
        { name:'experience',     re:/\b(experience|work histor|career|professional|years|intern)\b/i },
        { name:'achievements',   re:/\b(achiev|award|winner|won|hackathon|competition|prize|recogn|accomplishment)\b/i },
        { name:'certifications', re:/\b(certif|credential|diploma|training)\b/i },
        { name:'contact',        re:/\b(contact|email|phone|reach|get in touch|message|mail)\b/i },
        { name:'social',         re:/\b(social|github|linkedin|instagram|twitter|link|profile|follow|connect)\b/i },
        { name:'hire',           re:/\b(hire|hiring|available|open to work|freelance|job offer|opportunity|collaborate|work together)\b/i },
        { name:'resume',         re:/\b(resume|cv|curriculum vitae|download)\b/i },
        { name:'goals',          re:/\b(goal|aim|aspir|dream|future|plan|objective|ambition)\b/i },
        { name:'services',       re:/\b(service|offer|provide|what (do|can) (you|he) (do|offer))\b/i },
        { name:'location',       re:/\b(locat|where|city|country|india|from|based)\b/i }
    ];

    const OFF_TOPIC = [
        /\b(world cup|fifa|cricket|ipl|football|sport|match|game score)\b/i,
        /\b(weather|temperature|forecast|rain)\b/i,
        /\b(recipe|cook|food|restaurant)\b/i,
        /\b(movie|film|actor|netflix|bollywood)\b/i,
        /\b(politic|election|president|prime minister)\b/i,
        /\b(stock|crypto|bitcoin|ethereum|nse)\b/i,
        /\b(news|headline|current event)\b/i,
        /\b(math|calculate|solve|equation|integral)\b/i
    ];

    function detectIntent(q) {
        for (const i of INTENTS) { if (i.re.test(q)) return i.name; }
        return null;
    }
    function isOffTopic(q) { return OFF_TOPIC.some(p => p.test(q)); }

    /* ── RESPONSE GENERATORS ── */
    function chips(list) {
        return '<div class="ai-chips">' + list.map(c =>
            `<button class="ai-chip" data-query="${c}">${c}</button>`).join('') + '</div>';
    }
    function tags(list) {
        return '<div class="ai-tags">' + list.map(t =>
            `<span class="ai-tag">${t}</span>`).join('') + '</div>';
    }
    function techTags(list) {
        return '<div class="ai-tags">' + list.map(t =>
            `<span class="ai-tag ai-tag-tech">${t}</span>`).join('') + '</div>';
    }
    function eduItem(title, meta, desc, tagsArr) {
        return `<div class="ai-edu-item">
<div class="ai-edu-degree">${title}</div>
<div class="ai-edu-meta">${meta}</div>
${desc ? `<div class="ai-edu-desc">${desc}</div>` : ''}
${tagsArr ? tags(tagsArr) : ''}
</div>`;
    }

    function generate(intent, kb) {
        const p = kb.person;
        switch (intent) {
            case 'greeting':
                return `<p>Hello! Great to meet you. 👋</p>
<p>I'm <strong>${BOT_NAME}</strong>, ${p.name}'s personal AI portfolio assistant.</p>
<p>What would you like to know?</p>
${chips(['Tell me about Akash','Show me his projects','What are his skills?','How to contact him?'])}`;

            case 'about':
                return `<p><strong>${p.name}</strong> is a <em>${p.title}</em> based in <strong>${p.location}</strong>.</p>
${p.bio.map(b=>`<p>${b}</p>`).join('')}
${tags(p.roles)}
<p>📊 <strong>${p.stats.projects}</strong> Projects · <strong>${p.stats.certifications}</strong> Certifications · <strong>${p.stats.experience}</strong> Experience</p>`;

            case 'projects':
                return `<p>${p.name} has built <strong>${kb.projects.length}</strong> projects:</p>
${kb.projects.map(pr => {
    const live = pr.live && pr.live !== '#' ? `<a href="${pr.live}" target="_blank" rel="noopener noreferrer" class="ai-link">🔗 Live Demo</a>` : '';
    return `<div class="ai-project-item">
<div class="ai-project-title">📁 ${pr.title}</div>
<div class="ai-project-desc">${pr.description}</div>
<div class="ai-project-meta">
${techTags(pr.tech)}
<div class="ai-project-links">
<a href="${pr.github}" target="_blank" rel="noopener noreferrer" class="ai-link">⭐ GitHub</a>
${live}
</div></div></div>`;
}).join('')}
<p>💡 <em>Open <strong>projects.md</strong> in the Explorer for a visual gallery.</em></p>`;

            case 'skills':
                return `<p>Here's ${p.name}'s technical skill breakdown:</p>
${[['💻 Programming',kb.skills.programming],['🌐 Web Dev',kb.skills.web],['🗄️ Databases',kb.skills.database],['🛠️ Tools',kb.skills.tools]]
.map(([lbl,items])=>`<div class="ai-skill-group">
<div class="ai-skill-group-title">${lbl}</div>
<div class="ai-tags">${items.map(s=>`<span class="ai-tag">${s.name} <span class="ai-tag-level">${s.level}%</span></span>`).join('')}</div>
</div>`).join('')}
<p>💡 <em>See <strong>skills.md</strong> for interactive skill bars.</em></p>`;

            case 'technologies':
                return `<p>${p.name} works with a wide range of technologies:</p>
${techTags(kb.allSkillNames)}
<p>Primary stack: <strong>HTML · CSS · JavaScript · React · Node.js · Python · MySQL</strong></p>`;

            case 'education':
                return `<p>${p.name}'s educational background:</p>
${kb.education.map(e=>eduItem(`🎓 ${e.degree}`,`${e.institution}, ${e.location} · ${e.period}`,e.description)).join('')}`;

            case 'experience':
                return `<p>${p.name} has <strong>${p.stats.experience}</strong> of hands-on development experience, building real-world projects while pursuing his BCA degree.</p>
${tags(['Frontend Development','Full-Stack Projects','Open Source','Hackathon Participation'])}
<p>💡 <em>Check <strong>work.md</strong> for the full timeline.</em></p>`;

            case 'achievements':
                return `<p>Notable achievements:</p>
${kb.achievements.map(a=>eduItem(`🏆 ${a.title}`,`${a.subtitle} · ${a.date}`,a.description,a.tags)).join('')}`;

            case 'certifications':
                return `<p>${p.name} holds <strong>${kb.certifications.length}</strong> certifications:</p>
${kb.certifications.map(c=>eduItem(`📜 ${c.name}`,c.body,c.desc)).join('')}`;

            case 'contact':
                return `<p>Here's how to reach <strong>${p.name}</strong>:</p>
<div class="ai-contact-list">
<a href="mailto:${p.email}" class="ai-contact-item"><span class="ai-contact-icon">📧</span><span>${p.email}</span></a>
<a href="tel:${p.phone.replace(/\s/g,'')}" class="ai-contact-item"><span class="ai-contact-icon">📞</span><span>${p.phone}</span></a>
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
${tags(['Freelance Projects','Internships','Open Source Collaborations','Full-time (Post-graduation)'])}
<div class="ai-contact-list">
<a href="mailto:${p.email}" class="ai-contact-item"><span class="ai-contact-icon">📧</span><span>${p.email}</span></a>
<a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="ai-contact-item"><span class="ai-contact-icon">💼</span><span>LinkedIn</span></a>
</div>`;

            case 'resume':
                return `<p>Summary of <strong>${p.name}'s</strong> profile:</p>
${eduItem(`👤 ${p.name}`,`${p.title} · ${p.location}`,null)}
<div class="ai-tags">
<span class="ai-tag">Projects: ${p.stats.projects}</span>
<span class="ai-tag">Certifications: ${p.stats.certifications}</span>
<span class="ai-tag">Experience: ${p.stats.experience}</span>
</div>
<p>For a full resume, <a href="mailto:${p.email}" class="ai-link">contact him</a> or connect on <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" class="ai-link">LinkedIn</a>.</p>`;

            case 'goals':
                return `<p>${p.name}'s goals:</p>
${eduItem('🎯 Short-term','','Complete BCA, land a developer internship, contribute to open source.')}
${eduItem('🚀 Long-term','','Become a skilled full-stack engineer and build products that solve real-world problems.')}
${tags(['Full-Stack Dev','Open Source','Innovation','Software Engineering'])}`;

            case 'services':
                return `<p><strong>${p.name}</strong> offers:</p>
${eduItem('🌐 Web Development','','Modern, responsive websites using HTML, CSS, JS, React, Node.js.')}
${eduItem('🎨 UI/UX Design','','Clean, user-friendly interfaces focused on experience and accessibility.')}
${eduItem('🤖 Chatbot Development','','AI-powered assistants and chatbots for websites.')}
${eduItem('🗃️ Backend & Database','','Server-side with Node.js, MySQL, and MongoDB.')}`;

            case 'location':
                return `<p><strong>${p.name}</strong> is based in <strong>${p.location}</strong> 📍</p>
<p>He works remotely and is open to local and international opportunities worldwide.</p>`;

            default:
                return `<p>I'm not sure about that. Try asking me something else:</p>
${chips(['About Akash','Projects','Skills','Education','Contact'])}`;
        }
    }

    function offTopicResp() {
        return `<p>I'm <strong>${BOT_NAME}</strong>, Akash's portfolio assistant. I can only answer questions related to his portfolio.</p>
<p>Try asking about:</p>
${chips(['Tell me about Akash','What projects has he built?','What skills does he have?','How to contact him?'])}`;
    }

    /* ── DOM & RENDERING ── */
    let _container = null, _input = null, _sendBtn = null, _clearBtn = null;
    let _kb = null, _busy = false;

    function ts() {
        return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    }

    function escHtml(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function appendMsg(sender, html, empty) {
        const wrap = document.createElement('div');
        wrap.className = `jarvis-msg ${sender} jarvis-msg-entering`;
        const ico  = sender === 'bot' ? 'fa-robot' : 'fa-user';
        const name = sender === 'bot' ? BOT_NAME : 'You';
        wrap.innerHTML = `
<div class="jarvis-msg-header">
  <div class="jarvis-msg-avatar"><i class="fas ${ico}"></i></div>
  <div class="jarvis-msg-name">${name}</div>
  <div class="jarvis-msg-time">${ts()}</div>
</div>
<div class="jarvis-msg-content">${empty ? '' : html}</div>`;
        _container.appendChild(wrap);
        requestAnimationFrame(()=>requestAnimationFrame(()=>wrap.classList.remove('jarvis-msg-entering')));
        scroll();
        return wrap.querySelector('.jarvis-msg-content');
    }

    function showTyping() {
        const wrap = document.createElement('div');
        wrap.className = 'jarvis-msg bot jarvis-typing-wrap jarvis-msg-entering';
        wrap.innerHTML = `
<div class="jarvis-msg-header">
  <div class="jarvis-msg-avatar"><i class="fas fa-robot"></i></div>
  <div class="jarvis-msg-name">${BOT_NAME}</div>
</div>
<div class="jarvis-msg-content">
  <div class="jarvis-typing-indicator"><span></span><span></span><span></span></div>
</div>`;
        _container.appendChild(wrap);
        requestAnimationFrame(()=>requestAnimationFrame(()=>wrap.classList.remove('jarvis-msg-entering')));
        scroll();
        return ()=>wrap.remove();
    }

    function stream(contentEl, html, done) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const full = tmp.innerText;
        let i = 0;
        contentEl.innerHTML = '<p></p>';
        const para = contentEl.querySelector('p');

        function tick() {
            const chunk = Math.min(MAX_CHUNK, full.length - i);
            for (let k=0;k<chunk;k++) { para.textContent += full[i++]; }
            scroll();
            if (i < full.length) {
                setTimeout(tick, STREAM_DELAY);
            } else {
                contentEl.innerHTML = html;
                attachChips(contentEl);
                scroll();
                if (done) done();
            }
        }
        tick();
    }

    function scroll() {
        if (_container) _container.scrollTop = _container.scrollHeight;
    }

    function attachChips(el) {
        el.querySelectorAll('.ai-chip').forEach(c => {
            c.addEventListener('click', () => handleChip(c.dataset.query));
        });
    }

    function disableInput(v) {
        if (_input)   _input.disabled   = v;
        if (_sendBtn) _sendBtn.disabled = v;
        if (_sendBtn && v) _sendBtn.classList.remove('active');
    }

    function resize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }

    /* ── WELCOME ── */
    function renderWelcome() {
        _container.innerHTML = '';
        const pn = _kb.person.name.split(' ')[0];
        const html = `<p>Hello! I'm <strong>${BOT_NAME}</strong> — ${_kb.person.name}'s AI portfolio assistant. 🤖</p>
<p>I can help you learn about ${pn}'s work, skills, projects, education, and more.</p>
<p>Here are some things you can ask:</p>
${chips(SUGGESTED_PROMPTS)}`;
        const el = appendMsg('bot', '', false);
        el.innerHTML = html;
        attachChips(el);
        scroll();
    }

    /* ── HANDLERS ── */
    function handleChip(q) { if (!_busy) sendMsg(q); }

    function sendMsg(query) {
        const q = query.trim();
        if (!q || _busy) return;
        _busy = true;
        disableInput(true);

        appendMsg('user', `<p>${escHtml(q)}</p>`, false);

        const rm = showTyping();
        setTimeout(() => {
            rm();
            let html;
            if (isOffTopic(q)) {
                html = offTopicResp();
            } else {
                const intent = detectIntent(q);
                html = generate(intent, _kb);
            }
            const el = appendMsg('bot', '', true);
            stream(el, html, () => {
                _busy = false;
                disableInput(false);
                if (_input) _input.focus();
            });
        }, THINK_DELAY);
    }

    /* ── PUBLIC ── */
    function init() {
        _container = document.getElementById('jarvis-messages');
        _input     = document.getElementById('jarvis-input');
        _sendBtn   = document.getElementById('jarvis-send');
        _clearBtn  = document.getElementById('clear-jarvis');
        if (!_container || !_input) return;

        _kb = buildKB();
        renderWelcome();

        if (_sendBtn) {
            _sendBtn.addEventListener('click', () => {
                const v = _input.value.trim();
                if (v) { const q=v; _input.value=''; _input.style.height='auto'; _sendBtn.classList.remove('active'); sendMsg(q); }
            });
        }

        _input.addEventListener('input', function() {
            resize(this);
            if (_sendBtn) _sendBtn.classList.toggle('active', this.value.trim().length > 0);
        });

        _input.addEventListener('keydown', function(e) {
            if (e.key==='Enter' && !e.shiftKey) {
                e.preventDefault();
                const v = this.value.trim();
                if (v && !_busy) { const q=v; this.value=''; this.style.height='auto'; if(_sendBtn)_sendBtn.classList.remove('active'); sendMsg(q); }
            }
        });

        if (_clearBtn) _clearBtn.addEventListener('click', clearChat);

        _container.addEventListener('click', e => {
            const chip = e.target.closest('.ai-chip');
            if (chip) handleChip(chip.dataset.query);
        });
    }

    function focusInput() {
        if (_input && !_input.disabled) setTimeout(() => _input.focus(), 120);
    }

    function clearChat() {
        if (_busy) return;
        renderWelcome();
        if (_input) { _input.value=''; _input.style.height='auto'; }
        if (_sendBtn) _sendBtn.classList.remove('active');
    }

    return { init, focusInput, clearChat };
}());
