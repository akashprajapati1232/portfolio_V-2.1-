/**
 * terminal.js – Interactive VS Code-style terminal
 * ─────────────────────────────────────────────────────────────────────────────
 * Self-contained module. Exposes window.Terminal public API:
 *   init()           – Mount and boot
 *   show()           – Show panel (syncs layout-bottom btn)
 *   hide()           – Hide panel (syncs layout-bottom btn)
 *   toggle()         – Toggle visibility
 *   focusInput()     – Focus the hidden input
 * ─────────────────────────────────────────────────────────────────────────────
 */

window.Terminal = (function () {
    'use strict';

    /* ══════════════════════════════════════════════════════════
       CONFIG
    ══════════════════════════════════════════════════════════ */
    const PROMPT_TEXT = 'akash@portfolio:~$ ';
    const PROMPT_COLOR = '#4ec9b0';

    /* ══════════════════════════════════════════════════════════
       COMMAND REGISTRY
    ══════════════════════════════════════════════════════════ */
    const COMMANDS = [
        'help','clear','ls','dir','pwd','cd','about','projects',
        'skills','education','experience','contact','social',
        'github','linkedin','email','phone','resume','whoami',
        'history','date','time','achievements','certifications',
        'technologies','goals','services','location','hire'
    ];

    /* ══════════════════════════════════════════════════════════
       STATE
    ══════════════════════════════════════════════════════════ */
    let _panel        = null;
    let _body         = null;
    let _output       = null;
    let _inputEl      = null;   // hidden real <input>
    let _displayLine  = null;   // visible prompt line (rendered span)
    let _cmdSpan      = null;   // the typed-text span inside display line
    let _cursorSpan   = null;   // blinking cursor span
    let _autocomplete = null;   // suggestion dropdown element
    let _layoutBtn    = null;   // layout-bottom button in title bar

    let _history      = [];
    let _histIdx      = -1;
    let _suggestions  = [];
    let _suggIdx      = -1;
    let _booted       = false;
    let _visible      = false;

    /* ══════════════════════════════════════════════════════════
       BOOT SEQUENCE
    ══════════════════════════════════════════════════════════ */
    const BOOT_SEQUENCE = [
        { type:'pause',  ms:400 },
        { type:'output', text:'Microsoft Windows [Version 10.0.19045]', cls:'' },
        { type:'output', text:'(c) Microsoft Corporation. All rights reserved.', cls:'' },
        { type:'pause',  ms:200 },
        { type:'blank' },
        { type:'cmd',    text:'node portfolio.js' },
        { type:'pause',  ms:350 },
        { type:'output', text:'✓  Portfolio loaded successfully.', cls:'term-success' },
        { type:'output', text:'   Type  help  to see available commands.', cls:'term-info' },
        { type:'blank' },
    ];

    const TYPING_SPEED = 42;

    /* ══════════════════════════════════════════════════════════
       PORTFOLIO DATA HELPERS
    ══════════════════════════════════════════════════════════ */
    function getData() {
        return window.PORTFOLIO_DATA || {};
    }

    /* ══════════════════════════════════════════════════════════
       COMMAND RESPONSES  (return array of { text, cls } lines)
    ══════════════════════════════════════════════════════════ */
    function cmdHelp() {
        return [
            { text:'Available commands:', cls:'term-info' },
            { text:'' },
            { text:'  about         – About Akash', cls:'' },
            { text:'  projects      – List all projects', cls:'' },
            { text:'  skills        – Show skills', cls:'' },
            { text:'  technologies  – Technologies used', cls:'' },
            { text:'  education     – Educational background', cls:'' },
            { text:'  experience    – Work experience', cls:'' },
            { text:'  achievements  – Awards & hackathons', cls:'' },
            { text:'  certifications– Certifications', cls:'' },
            { text:'  contact       – Contact information', cls:'' },
            { text:'  social        – Social media links', cls:'' },
            { text:'  github        – GitHub profile URL', cls:'' },
            { text:'  linkedin      – LinkedIn profile URL', cls:'' },
            { text:'  email         – Email address', cls:'' },
            { text:'  phone         – Phone number', cls:'' },
            { text:'  hire          – Availability for work', cls:'' },
            { text:'  resume        – Resume summary', cls:'' },
            { text:'  goals         – Career goals', cls:'' },
            { text:'  services      – Services offered', cls:'' },
            { text:'  whoami        – Who is Akash?', cls:'' },
            { text:'  ls / dir      – List portfolio files', cls:'' },
            { text:'  pwd           – Print working directory', cls:'' },
            { text:'  history       – Command history', cls:'' },
            { text:'  date          – Current date', cls:'' },
            { text:'  time          – Current time', cls:'' },
            { text:'  clear         – Clear terminal', cls:'' },
            { text:'' },
            { text:'You can also type natural-language questions,', cls:'term-info' },
            { text:'e.g.  "What are your skills?"', cls:'term-info' },
        ];
    }

    function cmdAbout() {
        const p = getData().person || {};
        const bio = p.bio || [];
        return [
            { text:`👤  ${p.name || 'Akash Prajapati'}`, cls:'term-success' },
            { text:`    ${p.title || ''}`, cls:'term-info' },
            { text:`    📍 ${p.location || ''}`, cls:'' },
            { text:'' },
            ...bio.map(b => ({ text:`    ${b}`, cls:'' })),
            { text:'' },
            { text:`    Projects: ${p.stats?.projects}  |  Certs: ${p.stats?.certifications}  |  Exp: ${p.stats?.experience}`, cls:'term-info' },
        ];
    }

    function cmdProjects() {
        const list = getData().projects || [];
        const lines = [{ text:`📁  Projects (${list.length})`, cls:'term-success' }, { text:'' }];
        list.forEach((pr, i) => {
            lines.push({ text:`  ${i+1}. ${pr.title}`, cls:'term-info' });
            lines.push({ text:`     ${pr.description}`, cls:'' });
            lines.push({ text:`     Tech: ${pr.tech.join(', ')}`, cls:'term-loading' });
            lines.push({ text:`     GitHub: ${pr.github}`, cls:'' });
            if (pr.live && pr.live !== '#') lines.push({ text:`     Live:   ${pr.live}`, cls:'' });
            lines.push({ text:'' });
        });
        return lines;
    }

    function cmdSkills() {
        const s = getData().skills || {};
        const lines = [{ text:'💻  Skills', cls:'term-success' }, { text:'' }];
        const cats = [
            ['Programming',  s.programming  || []],
            ['Web',          s.web          || []],
            ['Databases',    s.database     || []],
            ['Tools',        s.tools        || []],
        ];
        cats.forEach(([lbl, items]) => {
            lines.push({ text:`  ${lbl}:`, cls:'term-info' });
            lines.push({ text:`    ${items.map(x => `${x.name} (${x.level}%)`).join('  ·  ')}`, cls:'' });
            lines.push({ text:'' });
        });
        return lines;
    }

    function cmdTechnologies() {
        const s = getData().skills || {};
        const all = [...(s.programming||[]), ...(s.web||[]), ...(s.database||[]), ...(s.tools||[])];
        return [
            { text:'🛠️  Technologies', cls:'term-success' },
            { text:'' },
            { text:`  ${all.map(x=>x.name).join('  ·  ')}`, cls:'term-info' },
            { text:'' },
            { text:'  Primary: HTML · CSS · JavaScript · React · Node.js · Python · MySQL', cls:'' },
        ];
    }

    function cmdEducation() {
        const ed = getData().education || [];
        const lines = [{ text:'🎓  Education', cls:'term-success' }, { text:'' }];
        ed.forEach(e => {
            lines.push({ text:`  ${e.degree}`, cls:'term-info' });
            lines.push({ text:`  ${e.institution}, ${e.location}  ·  ${e.period}`, cls:'term-loading' });
            lines.push({ text:`  ${e.description}`, cls:'' });
            lines.push({ text:'' });
        });
        return lines;
    }

    function cmdExperience() {
        const p = getData().person || {};
        return [
            { text:'💼  Experience', cls:'term-success' },
            { text:'' },
            { text:`  ${p.name} has ${p.stats?.experience} of hands-on experience`, cls:'' },
            { text:'  building real-world web projects while pursuing his BCA.', cls:'' },
            { text:'' },
            { text:'  Areas:', cls:'term-info' },
            { text:'    · Frontend Development', cls:'' },
            { text:'    · Full-Stack Web Apps', cls:'' },
            { text:'    · Open Source Contributions', cls:'' },
            { text:'    · Hackathon Participation', cls:'' },
            { text:'' },
            { text:'  Open  work.md  in the Explorer for the full timeline.', cls:'term-info' },
        ];
    }

    function cmdAchievements() {
        const list = getData().achievements || [];
        const lines = [{ text:'🏆  Achievements', cls:'term-success' }, { text:'' }];
        list.forEach(a => {
            lines.push({ text:`  ${a.title}  —  ${a.subtitle}`, cls:'term-info' });
            lines.push({ text:`  ${a.date}`, cls:'term-loading' });
            lines.push({ text:`  ${a.description}`, cls:'' });
            lines.push({ text:'' });
        });
        return lines;
    }

    function cmdCertifications() {
        const list = getData().certifications || [];
        const lines = [{ text:'📜  Certifications', cls:'term-success' }, { text:'' }];
        list.forEach(c => {
            lines.push({ text:`  ${c.name}`, cls:'term-info' });
            lines.push({ text:`  ${c.body}  —  ${c.desc}`, cls:'' });
            lines.push({ text:'' });
        });
        return lines;
    }

    function cmdContact() {
        const p = getData().person || {};
        return [
            { text:'📬  Contact', cls:'term-success' },
            { text:'' },
            { text:`  Email    ${p.email || ''}`, cls:'term-info' },
            { text:`  Phone    ${p.phone || ''}`, cls:'term-info' },
            { text:`  LinkedIn ${p.linkedin || ''}`, cls:'term-info' },
            { text:`  GitHub   ${p.github  || ''}`, cls:'term-info' },
            { text:`  Website  ${p.website || ''}`, cls:'term-info' },
        ];
    }

    function cmdSocial() {
        const s = getData().socials || {};
        const p = getData().person || {};
        return [
            { text:'🔗  Social Links', cls:'term-success' },
            { text:'' },
            { text:`  GitHub     ${s.github    || p.github  || ''}`, cls:'term-info' },
            { text:`  LinkedIn   ${s.linkedin  || p.linkedin|| ''}`, cls:'term-info' },
            { text:`  Instagram  ${s.instagram || ''}`, cls:'term-info' },
            { text:`  Website    ${p.website   || ''}`, cls:'term-info' },
        ];
    }

    function cmdGithub()   { const p=getData().person||{}; return [{ text:p.github||'', cls:'term-info' }]; }
    function cmdLinkedin() { const p=getData().person||{}; return [{ text:p.linkedin||'', cls:'term-info' }]; }
    function cmdEmail()    { const p=getData().person||{}; return [{ text:p.email||'', cls:'term-info' }]; }
    function cmdPhone()    { const p=getData().person||{}; return [{ text:p.phone||'', cls:'term-info' }]; }

    function cmdWhoami() {
        const p = getData().person || {};
        return [{ text:`${p.name} — ${p.title}`, cls:'term-success' }];
    }

    function cmdLs() {
        return [
            { text:'about/      projects/    skills/     experience/    contact/    license/', cls:'term-info' },
            { text:'README.md   profile.json projects.md skills.md   work.md   socials.json', cls:'' },
        ];
    }

    function cmdPwd() { return [{ text:'/home/akash/portfolio-vscode', cls:'term-info' }]; }

    function cmdHistory() {
        if (!_history.length) return [{ text:'  (no history)', cls:'term-info' }];
        return _history.map((cmd, i) => ({ text:`  ${String(i+1).padStart(3)}  ${cmd}`, cls:'' }));
    }

    function cmdDate() {
        const d = new Date();
        return [{ text:d.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'}), cls:'term-info' }];
    }

    function cmdTime() {
        const t = new Date();
        return [{ text:t.toLocaleTimeString('en-IN'), cls:'term-info' }];
    }

    function cmdHire() {
        const p = getData().person || {};
        return [
            { text:'🎉  Availability', cls:'term-success' },
            { text:'' },
            { text:`  ${p.name} is OPEN to work!`, cls:'term-info' },
            { text:'' },
            { text:'  Available for:', cls:'' },
            { text:'    · Freelance Projects', cls:'' },
            { text:'    · Internships', cls:'' },
            { text:'    · Open Source Collaborations', cls:'' },
            { text:'    · Full-time (post-graduation)', cls:'' },
            { text:'' },
            { text:`  Contact: ${p.email}`, cls:'term-info' },
        ];
    }

    function cmdGoals() {
        return [
            { text:'🎯  Goals', cls:'term-success' },
            { text:'' },
            { text:'  Short-term:', cls:'term-info' },
            { text:'    Complete BCA, land a developer internship,', cls:'' },
            { text:'    contribute to meaningful open-source projects.', cls:'' },
            { text:'' },
            { text:'  Long-term:', cls:'term-info' },
            { text:'    Become a skilled full-stack engineer,', cls:'' },
            { text:'    build products that solve real-world problems.', cls:'' },
        ];
    }

    function cmdServices() {
        return [
            { text:'🌐  Services', cls:'term-success' },
            { text:'' },
            { text:'  Web Development      – HTML, CSS, JS, React, Node.js', cls:'' },
            { text:'  UI/UX Design         – Clean, accessible interfaces', cls:'' },
            { text:'  Chatbot Development  – AI-powered assistants', cls:'' },
            { text:'  Backend & Databases  – Node.js, MySQL, MongoDB', cls:'' },
        ];
    }

    function cmdLocation() {
        const p = getData().person || {};
        return [
            { text:`📍  ${p.location || 'Ghazipur, Uttar Pradesh, India'}`, cls:'term-info' },
            { text:'    Available for remote and local opportunities.', cls:'' },
        ];
    }

    function cmdResume() {
        const p = getData().person || {};
        return [
            { text:'📄  Resume Summary', cls:'term-success' },
            { text:'' },
            { text:`  Name       ${p.name}`, cls:'' },
            { text:`  Title      ${p.title}`, cls:'' },
            { text:`  Location   ${p.location}`, cls:'' },
            { text:`  Projects   ${p.stats?.projects}`, cls:'' },
            { text:`  Certs      ${p.stats?.certifications}`, cls:'' },
            { text:`  Exp        ${p.stats?.experience}`, cls:'' },
            { text:'' },
            { text:`  Contact ${p.email} for full resume.`, cls:'term-info' },
        ];
    }

    /* ══════════════════════════════════════════════════════════
       NLP / NATURAL LANGUAGE FALLBACK
    ══════════════════════════════════════════════════════════ */
    const NLP_RULES = [
        { re:/\b(project|work|built|made|created|developed|portfolio)\b/i, fn: cmdProjects },
        { re:/\b(skill|capable|proficien|good at|expert|speciali[sz])\b/i, fn: cmdSkills },
        { re:/\b(tech(nolog|nique|stack)|framework|language|tool|stack)\b/i, fn: cmdTechnologies },
        { re:/\b(educat|degree|university|college|study|bca|school)\b/i, fn: cmdEducation },
        { re:/\b(contact|email|phone|reach|get in touch|message)\b/i, fn: cmdContact },
        { re:/\b(social|github|linkedin|instagram|link|follow|connect)\b/i, fn: cmdSocial },
        { re:/\b(achiev|award|hackathon|competition|prize|win)\b/i, fn: cmdAchievements },
        { re:/\b(certif|credential|diploma|course|training)\b/i, fn: cmdCertifications },
        { re:/\b(hire|available|open to work|freelance|opportunit)\b/i, fn: cmdHire },
        { re:/\b(goal|aim|aspir|dream|future|plan)\b/i, fn: cmdGoals },
        { re:/\b(service|offer|provide|what (do|can) (you|he))\b/i, fn: cmdServices },
        { re:/\b(about|who (is|are)|bio|background|profile|introduce)\b/i, fn: cmdAbout },
        { re:/\b(experience|career|professional)\b/i, fn: cmdExperience },
        { re:/\b(where|locat|city|india|from|based)\b/i, fn: cmdLocation },
        { re:/\b(resume|cv|curriculum)\b/i, fn: cmdResume },
    ];

    function nlpMatch(q) {
        for (const rule of NLP_RULES) {
            if (rule.re.test(q)) return rule.fn();
        }
        return null;
    }

    /* ══════════════════════════════════════════════════════════
       COMMAND EXECUTOR
    ══════════════════════════════════════════════════════════ */
    function execute(raw) {
        const cmd = raw.trim().toLowerCase();
        if (!cmd) return;

        // Add to history (no duplicates at tail)
        if (!_history.length || _history[_history.length-1] !== cmd) {
            _history.push(cmd);
        }
        _histIdx = -1;

        // Append the prompt+command line to output
        _appendPromptLine(raw.trim());

        if (cmd === 'clear') { _output.innerHTML = ''; return; }

        let lines;
        switch (cmd) {
            case 'help':            lines = cmdHelp(); break;
            case 'about': case 'whoami': lines = cmd==='whoami' ? cmdWhoami() : cmdAbout(); break;
            case 'projects':        lines = cmdProjects(); break;
            case 'skills':          lines = cmdSkills(); break;
            case 'technologies':    lines = cmdTechnologies(); break;
            case 'education':       lines = cmdEducation(); break;
            case 'experience':      lines = cmdExperience(); break;
            case 'achievements':    lines = cmdAchievements(); break;
            case 'certifications':  lines = cmdCertifications(); break;
            case 'contact':         lines = cmdContact(); break;
            case 'social':          lines = cmdSocial(); break;
            case 'github':          lines = cmdGithub(); break;
            case 'linkedin':        lines = cmdLinkedin(); break;
            case 'email':           lines = cmdEmail(); break;
            case 'phone':           lines = cmdPhone(); break;
            case 'hire':            lines = cmdHire(); break;
            case 'goals':           lines = cmdGoals(); break;
            case 'services':        lines = cmdServices(); break;
            case 'location':        lines = cmdLocation(); break;
            case 'resume':          lines = cmdResume(); break;
            case 'ls': case 'dir':  lines = cmdLs(); break;
            case 'pwd':             lines = cmdPwd(); break;
            case 'history':         lines = cmdHistory(); break;
            case 'date':            lines = cmdDate(); break;
            case 'time':            lines = cmdTime(); break;
            default: {
                // NLP fallback
                lines = nlpMatch(cmd);
                if (!lines) {
                    lines = [
                        { text:`Command not found: ${cmd}`, cls:'term-error' },
                        { text:`Type  help  for a list of commands.`, cls:'' },
                    ];
                }
            }
        }
        _appendLines(lines);
        _scrollToBottom();
    }

    /* ══════════════════════════════════════════════════════════
       DOM OUTPUT HELPERS
    ══════════════════════════════════════════════════════════ */
    function _appendPromptLine(text) {
        const line = document.createElement('div');
        line.className = 'term-line';
        const ps = document.createElement('span');
        ps.className = 'term-prompt-text';
        ps.textContent = PROMPT_TEXT;
        const cs = document.createElement('span');
        cs.className = 'term-cmd';
        cs.textContent = text;
        line.appendChild(ps);
        line.appendChild(cs);
        _output.appendChild(line);
    }

    function _appendLines(lines) {
        lines.forEach(l => {
            if (l.text === '') {
                const blank = document.createElement('div');
                blank.className = 'term-line';
                blank.innerHTML = '&nbsp;';
                _output.appendChild(blank);
                return;
            }
            const line = document.createElement('div');
            line.className = 'term-line';
            const span = document.createElement('span');
            span.className = `term-output ${l.cls || ''}`;
            span.textContent = l.text;
            line.appendChild(span);
            _output.appendChild(line);
        });
    }

    function _scrollToBottom() {
        if (_body) _body.scrollTop = _body.scrollHeight;
    }

    /* ══════════════════════════════════════════════════════════
       AUTOCOMPLETE
    ══════════════════════════════════════════════════════════ */
    function _buildSuggestions(partial) {
        if (!partial) return [];
        return COMMANDS.filter(c => c.startsWith(partial) && c !== partial);
    }

    function _showAutocomplete(partial) {
        _suggestions = _buildSuggestions(partial);
        _suggIdx = -1;
        _autocomplete.innerHTML = '';
        if (!_suggestions.length) { _autocomplete.style.display='none'; return; }
        _suggestions.forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 'term-suggestion-item';
            item.textContent = s;
            item.addEventListener('mousedown', (e) => { e.preventDefault(); _applyCompletion(s); });
            _autocomplete.appendChild(item);
        });
        _autocomplete.style.display = 'block';
    }

    function _hideAutocomplete() {
        _autocomplete.style.display = 'none';
        _suggestions = [];
        _suggIdx = -1;
    }

    function _highlightSuggestion(idx) {
        const items = _autocomplete.querySelectorAll('.term-suggestion-item');
        items.forEach((el, i) => el.classList.toggle('active', i === idx));
    }

    function _applyCompletion(text) {
        _inputEl.value = text;
        _renderInput();
        _hideAutocomplete();
        _inputEl.focus();
    }

    /* ══════════════════════════════════════════════════════════
       INPUT RENDERING (sync hidden input → visible display)
    ══════════════════════════════════════════════════════════ */
    function _renderInput() {
        if (_cmdSpan) _cmdSpan.textContent = _inputEl.value;
    }

    /* ══════════════════════════════════════════════════════════
       KEYBOARD HANDLER
    ══════════════════════════════════════════════════════════ */
    function _onKeyDown(e) {
        const ac = _autocomplete.style.display !== 'none';

        switch (e.key) {
            case 'Enter': {
                e.preventDefault();
                if (ac && _suggIdx >= 0) {
                    _applyCompletion(_suggestions[_suggIdx]);
                } else {
                    const val = _inputEl.value;
                    _inputEl.value = '';
                    _renderInput();
                    _hideAutocomplete();
                    execute(val);
                }
                break;
            }
            case 'Tab': {
                e.preventDefault();
                const partial = _inputEl.value.trim();
                const matches = _buildSuggestions(partial);
                if (matches.length === 1) {
                    _applyCompletion(matches[0]);
                } else if (matches.length > 1) {
                    _showAutocomplete(partial);
                    _suggIdx = 0;
                    _highlightSuggestion(0);
                }
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                if (ac) {
                    _suggIdx = Math.max(0, _suggIdx - 1);
                    _highlightSuggestion(_suggIdx);
                } else {
                    // History navigation
                    if (_history.length === 0) break;
                    if (_histIdx === -1) _histIdx = _history.length - 1;
                    else _histIdx = Math.max(0, _histIdx - 1);
                    _inputEl.value = _history[_histIdx];
                    _renderInput();
                }
                break;
            }
            case 'ArrowDown': {
                e.preventDefault();
                if (ac) {
                    _suggIdx = Math.min(_suggestions.length - 1, _suggIdx + 1);
                    _highlightSuggestion(_suggIdx);
                } else {
                    if (_histIdx === -1) break;
                    _histIdx++;
                    if (_histIdx >= _history.length) { _histIdx = -1; _inputEl.value = ''; }
                    else _inputEl.value = _history[_histIdx];
                    _renderInput();
                }
                break;
            }
            case 'Escape': {
                _hideAutocomplete();
                break;
            }
            case 'l': {
                if (e.ctrlKey) { e.preventDefault(); execute('clear'); }
                break;
            }
        }
    }

    function _onInput() {
        _renderInput();
        const partial = _inputEl.value.trim();
        if (partial.length >= 1) {
            _showAutocomplete(partial);
        } else {
            _hideAutocomplete();
        }
    }

    /* ══════════════════════════════════════════════════════════
       BOOT ANIMATION
    ══════════════════════════════════════════════════════════ */
    function _runBoot(seq, idx) {
        if (idx >= seq.length) { _booted = true; return; }
        const step = seq[idx];
        const next = () => _runBoot(seq, idx + 1);

        if (step.type === 'pause') {
            setTimeout(next, step.ms);
        } else if (step.type === 'blank') {
            const b = document.createElement('div'); b.className='term-line'; b.innerHTML='&nbsp;';
            _output.appendChild(b); _scrollToBottom(); next();
        } else if (step.type === 'output') {
            const line = document.createElement('div'); line.className='term-line';
            const span = document.createElement('span'); span.className=`term-output ${step.cls||''}`;
            span.textContent = step.text;
            line.appendChild(span); _output.appendChild(line); _scrollToBottom();
            setTimeout(next, 60);
        } else if (step.type === 'cmd') {
            _appendPromptLine(step.text); _scrollToBottom();
            setTimeout(next, 80);
        }
    }

    /* ══════════════════════════════════════════════════════════
       VISIBILITY + SYNC
    ══════════════════════════════════════════════════════════ */
    function _syncBtn(open) {
        if (!_layoutBtn) _layoutBtn = document.getElementById('layout-bottom');
        if (_layoutBtn) {
            _layoutBtn.classList.toggle('active', open);
        }
    }

    function show() {
        if (!_panel) return;
        _visible = true;
        _panel.classList.remove('hidden');
        _panel.classList.add('visible', 'animating');
        _panel.addEventListener('animationend', () => _panel.classList.remove('animating'), { once: true });
        _syncBtn(true);
        if (!_booted) _runBoot(BOOT_SEQUENCE, 0);
        setTimeout(() => focusInput(), 100);
    }

    function hide() {
        if (!_panel) return;
        _visible = false;
        _panel.classList.remove('visible', 'animating');
        _panel.classList.add('hidden');
        _hideAutocomplete();
        _syncBtn(false);
    }

    function toggle() { _visible ? hide() : show(); }

    function focusInput() { if (_inputEl) _inputEl.focus(); }

    /* ══════════════════════════════════════════════════════════
       INIT
    ══════════════════════════════════════════════════════════ */
    function init() {
        _panel   = document.getElementById('terminal-panel');
        _body    = document.getElementById('terminal-body');
        _output  = document.getElementById('terminal-output');
        _layoutBtn = document.getElementById('layout-bottom');

        if (!_panel || !_body || !_output) return;

        /* ── Build interactive input line ── */
        // Remove static input line from HTML if present
        const staticLine = _body.querySelector('.terminal-input-line');
        if (staticLine) staticLine.remove();

        // Create hidden real input
        _inputEl = document.createElement('input');
        _inputEl.type = 'text';
        _inputEl.id   = 'term-real-input';
        _inputEl.autocomplete = 'off';
        _inputEl.spellcheck   = false;
        _inputEl.style.cssText = [
            'position:absolute','opacity:0','pointer-events:none',
            'width:1px','height:1px','border:none','outline:none',
            'background:transparent','color:transparent','caret-color:transparent'
        ].join(';');
        _panel.appendChild(_inputEl);

        // Build visible prompt display line
        _displayLine = document.createElement('div');
        _displayLine.className = 'terminal-input-line';
        _displayLine.id = 'term-display-line';

        const promptSpan = document.createElement('span');
        promptSpan.className = 'term-prompt';
        promptSpan.textContent = PROMPT_TEXT;

        _cmdSpan = document.createElement('span');
        _cmdSpan.className = 'term-typed';

        _cursorSpan = document.createElement('span');
        _cursorSpan.className = 'cursor';
        _cursorSpan.setAttribute('aria-hidden','true');
        _cursorSpan.textContent = '█';

        _displayLine.appendChild(promptSpan);
        _displayLine.appendChild(_cmdSpan);
        _displayLine.appendChild(_cursorSpan);
        _body.appendChild(_displayLine);

        /* ── Autocomplete dropdown ── */
        _autocomplete = document.createElement('div');
        _autocomplete.id = 'term-autocomplete';
        _autocomplete.style.display = 'none';
        _body.appendChild(_autocomplete);

        /* ── Event listeners ── */
        _inputEl.addEventListener('keydown', _onKeyDown);
        _inputEl.addEventListener('input',   _onInput);

        // Click anywhere in body → focus input
        _body.addEventListener('click', (e) => {
            if (e.target.closest('#term-autocomplete')) return;
            focusInput();
        });

        // Terminal tab click → focus
        const tab = document.getElementById('term-tab');
        if (tab) tab.addEventListener('click', focusInput);

        // Close button
        const closeBtn = document.getElementById('term-close');
        if (closeBtn) closeBtn.addEventListener('click', hide);

        // New terminal button — just re-focus
        const newBtn = document.getElementById('term-new');
        if (newBtn) newBtn.addEventListener('click', () => { execute('clear'); focusInput(); });

        // Maximize button — toggle tall class
        const maxBtn = document.getElementById('term-maximize');
        if (maxBtn) {
            maxBtn.addEventListener('click', () => {
                _panel.classList.toggle('term-maximized');
            });
        }

        // Split button — noop visual stub
        const splitBtn = document.getElementById('term-split');
        if (splitBtn) splitBtn.addEventListener('click', focusInput);

        /* ── Start hidden (revealed by layout-bottom or Ctrl+`) ── */
        _panel.classList.add('hidden');
        _visible = false;
        _syncBtn(false);
    }

    return { init, show, hide, toggle, focusInput };

}());
