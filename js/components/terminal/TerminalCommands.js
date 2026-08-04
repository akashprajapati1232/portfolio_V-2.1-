/**
 * TerminalCommands.js
 * Command registry and NLP fallback for the terminal.
 * Output format: each line is { text, cls } where cls maps to an ANSI colour
 * in Terminal.js via the CLS_TO_ANSI lookup table.
 */

import { dataService } from '../../services/DataService.js';
import { eventBus } from '../../core/EventBus.js';

class TerminalCommands {
    constructor() {
        this.registry = [
            'help','clear','ls','dir','pwd','cd','about','projects',
            'skills','education','experience','contact','social',
            'github','linkedin','email','phone','resume','whoami',
            'history','date','time','achievements','certifications',
            'technologies','goals','services','location','hire'
        ];

        this.NLP_RULES = [
            { re:/\b(project|work|built|made|created|developed|portfolio)\b/i, fn: this.cmdProjects.bind(this) },
            { re:/\b(skill|capable|proficien|good at|expert|speciali[sz])\b/i, fn: this.cmdSkills.bind(this) },
            { re:/\b(tech(nolog|nique|stack)|framework|language|tool|stack)\b/i, fn: this.cmdTechnologies.bind(this) },
            { re:/\b(educat|degree|university|college|study|bca|school)\b/i, fn: this.cmdEducation.bind(this) },
            { re:/\b(contact|email|phone|reach|get in touch|message)\b/i, fn: this.cmdContact.bind(this) },
            { re:/\b(social|github|linkedin|instagram|link|follow|connect)\b/i, fn: this.cmdSocial.bind(this) },
            { re:/\b(achiev|award|hackathon|competition|prize|win)\b/i, fn: this.cmdAchievements.bind(this) },
            { re:/\b(certif|credential|diploma|course|training)\b/i, fn: this.cmdCertifications.bind(this) },
            { re:/\b(hire|available|open to work|freelance|opportunit)\b/i, fn: this.cmdHire.bind(this) },
            { re:/\b(goal|aim|aspir|dream|future|plan)\b/i, fn: this.cmdGoals.bind(this) },
            { re:/\b(service|offer|provide|what (do|can) (you|he))\b/i, fn: this.cmdServices.bind(this) },
            { re:/\b(about|who (is|are)|bio|background|profile|introduce)\b/i, fn: this.cmdAbout.bind(this) },
            { re:/\b(experience|career|professional)\b/i, fn: this.cmdExperience.bind(this) },
            { re:/\b(where|locat|city|india|from|based)\b/i, fn: this.cmdLocation.bind(this) },
            { re:/\b(resume|cv|curriculum)\b/i, fn: this.cmdResume.bind(this) },
        ];
    }

    getData() {
        return dataService.getData() || {};
    }

    getSuggestions(partial) {
        if (!partial) return [];
        return this.registry.filter(c => c.startsWith(partial) && c !== partial);
    }

    nlpMatch(q) {
        for (const rule of this.NLP_RULES) {
            if (rule.re.test(q)) return rule.fn();
        }
        return null;
    }

    execute(cmd, historyCmds) {
        if (cmd === 'clear') return { action: 'clear' };

        let lines;
        switch (cmd) {
            case 'help':            lines = this.cmdHelp(); break;
            case 'about':           lines = this.cmdAbout(); break;
            case 'whoami':          lines = this.cmdWhoami(); break;
            case 'projects':        lines = this.cmdProjects(); break;
            case 'skills':          lines = this.cmdSkills(); break;
            case 'technologies':    lines = this.cmdTechnologies(); break;
            case 'education':       lines = this.cmdEducation(); break;
            case 'experience':      lines = this.cmdExperience(); break;
            case 'achievements':    lines = this.cmdAchievements(); break;
            case 'certifications':  lines = this.cmdCertifications(); break;
            case 'contact':         lines = this.cmdContact(); break;
            case 'social':          lines = this.cmdSocial(); break;
            case 'github':          lines = this.cmdGithub(); break;
            case 'linkedin':        lines = this.cmdLinkedin(); break;
            case 'email':           lines = this.cmdEmail(); break;
            case 'phone':           lines = this.cmdPhone(); break;
            case 'hire':            lines = this.cmdHire(); break;
            case 'goals':           lines = this.cmdGoals(); break;
            case 'services':        lines = this.cmdServices(); break;
            case 'location':        lines = this.cmdLocation(); break;
            case 'resume':          lines = this.cmdResume(); break;
            case 'ls': case 'dir':  lines = this.cmdLs(); break;
            case 'pwd':             lines = this.cmdPwd(); break;
            case 'history':         lines = this.cmdHistory(historyCmds); break;
            case 'date':            lines = this.cmdDate(); break;
            case 'time':            lines = this.cmdTime(); break;
            case 'cd':              lines = [{ text: 'cd: no filesystem here, but feel free to explore!', cls: 'term-info' }]; break;
            default: {
                lines = this.nlpMatch(cmd);
                if (!lines) {
                    lines = [
                        { text: `Command not found: ${cmd}`, cls: 'term-error' },
                        { text: `Type  help  for a list of commands.`, cls: '' },
                    ];
                }
            }
        }
        return { action: 'print', lines };
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    cmdHelp() {
        return [
            { text: 'Available commands:', cls: 'term-info' },
            { text: '' },
            { text: '  about         \u2013 About Akash', cls: '' },
            { text: '  projects      \u2013 List all projects', cls: '' },
            { text: '  skills        \u2013 Show skills', cls: '' },
            { text: '  technologies  \u2013 Technologies used', cls: '' },
            { text: '  education     \u2013 Educational background', cls: '' },
            { text: '  experience    \u2013 Work experience', cls: '' },
            { text: '  achievements  \u2013 Awards & hackathons', cls: '' },
            { text: '  certifications\u2013 Certifications', cls: '' },
            { text: '  contact       \u2013 Contact information', cls: '' },
            { text: '  social        \u2013 Social media links', cls: '' },
            { text: '  github        \u2013 GitHub profile URL', cls: '' },
            { text: '  linkedin      \u2013 LinkedIn profile URL', cls: '' },
            { text: '  email         \u2013 Email address', cls: '' },
            { text: '  phone         \u2013 Phone number', cls: '' },
            { text: '  hire          \u2013 Availability for work', cls: '' },
            { text: '  resume        \u2013 Resume summary', cls: '' },
            { text: '  goals         \u2013 Career goals', cls: '' },
            { text: '  services      \u2013 Services offered', cls: '' },
            { text: '  whoami        \u2013 Who is Akash?', cls: '' },
            { text: '  ls / dir      \u2013 List portfolio files', cls: '' },
            { text: '  pwd           \u2013 Print working directory', cls: '' },
            { text: '  history       \u2013 Command history', cls: '' },
            { text: '  date          \u2013 Current date', cls: '' },
            { text: '  time          \u2013 Current time', cls: '' },
            { text: '  clear         \u2013 Clear terminal', cls: '' },
            { text: '' },
            { text: 'You can also type natural-language questions,', cls: 'term-info' },
            { text: 'e.g.  "What are your skills?"', cls: 'term-info' },
        ];
    }

    cmdAbout() {
        const p   = this.getData().person || {};
        const bio = p.bio || [];
        return [
            { text: `\ud83d\udc64  ${p.name || 'Akash Prajapati'}`, cls: 'term-success' },
            { text: `    ${p.title || ''}`, cls: 'term-info' },
            { text: `    \ud83d\udccd ${p.location || ''}`, cls: '' },
            { text: '' },
            ...bio.map(b => ({ text: `    ${b}`, cls: '' })),
            { text: '' },
            { text: `    Projects: ${p.stats?.projects}  |  Certs: ${p.stats?.certifications}  |  Exp: ${p.stats?.experience}`, cls: 'term-info' },
        ];
    }

    cmdProjects() {
        const list  = this.getData().projects || [];
        const lines = [{ text: `\ud83d\udcc1  Projects (${list.length})`, cls: 'term-success' }, { text: '' }];
        list.forEach((pr, i) => {
            lines.push({ text: `  ${i + 1}. ${pr.title}`, cls: 'term-info' });
            lines.push({ text: `     ${pr.description}`, cls: '' });
            lines.push({ text: `     Tech: ${pr.tech.join(', ')}`, cls: 'term-loading' });
            lines.push({ text: `     GitHub: ${pr.github}`, cls: '' });
            if (pr.live && pr.live !== '#') lines.push({ text: `     Live:   ${pr.live}`, cls: '' });
            lines.push({ text: '' });
        });
        return lines;
    }

    cmdSkills() {
        const s     = this.getData().skills || {};
        const lines = [{ text: '\ud83d\udcbb  Skills', cls: 'term-success' }, { text: '' }];
        const cats  = [
            ['Programming', s.programming || []],
            ['Web',         s.web         || []],
            ['Databases',   s.database    || []],
            ['Tools',       s.tools       || []],
        ];
        cats.forEach(([lbl, items]) => {
            lines.push({ text: `  ${lbl}:`, cls: 'term-info' });
            lines.push({ text: `    ${items.map(x => `${x.name} (${x.level}%)`).join('  \u00b7  ')}`, cls: '' });
            lines.push({ text: '' });
        });
        return lines;
    }

    cmdTechnologies() {
        const s   = this.getData().skills || {};
        const all = [...(s.programming || []), ...(s.web || []), ...(s.database || []), ...(s.tools || [])];
        return [
            { text: '\ud83d\udee0\ufe0f  Technologies', cls: 'term-success' },
            { text: '' },
            { text: `  ${all.map(x => x.name).join('  \u00b7  ')}`, cls: 'term-info' },
            { text: '' },
            { text: '  Primary: HTML \u00b7 CSS \u00b7 JavaScript \u00b7 React \u00b7 Node.js \u00b7 Python \u00b7 MySQL', cls: '' },
        ];
    }

    cmdEducation() {
        const ed    = this.getData().education || [];
        const lines = [{ text: '\ud83c\udf93  Education', cls: 'term-success' }, { text: '' }];
        ed.forEach(e => {
            lines.push({ text: `  ${e.degree}`, cls: 'term-info' });
            lines.push({ text: `  ${e.institution}, ${e.location}  \u00b7  ${e.period}`, cls: 'term-loading' });
            lines.push({ text: `  ${e.description}`, cls: '' });
            lines.push({ text: '' });
        });
        return lines;
    }

    cmdExperience() {
        const p = this.getData().person || {};
        return [
            { text: '\ud83d\udcbc  Experience', cls: 'term-success' },
            { text: '' },
            { text: `  ${p.name} has ${p.stats?.experience} of hands-on experience`, cls: '' },
            { text: '  building real-world web projects while pursuing his BCA.', cls: '' },
            { text: '' },
            { text: '  Areas:', cls: 'term-info' },
            { text: '    \u00b7 Frontend Development', cls: '' },
            { text: '    \u00b7 Full-Stack Web Apps', cls: '' },
            { text: '    \u00b7 Open Source Contributions', cls: '' },
            { text: '    \u00b7 Hackathon Participation', cls: '' },
            { text: '' },
            { text: '  Open  work.md  in the Explorer for the full timeline.', cls: 'term-info' },
        ];
    }

    cmdAchievements() {
        const list  = this.getData().achievements || [];
        const lines = [{ text: '\ud83c\udfc6  Achievements', cls: 'term-success' }, { text: '' }];
        list.forEach(a => {
            lines.push({ text: `  ${a.title}  \u2014  ${a.subtitle}`, cls: 'term-info' });
            lines.push({ text: `  ${a.date}`, cls: 'term-loading' });
            lines.push({ text: `  ${a.description}`, cls: '' });
            lines.push({ text: '' });
        });
        return lines;
    }

    cmdCertifications() {
        const list  = this.getData().certifications || [];
        const lines = [{ text: '\ud83d\udcdc  Certifications', cls: 'term-success' }, { text: '' }];
        list.forEach(c => {
            lines.push({ text: `  ${c.name}`, cls: 'term-info' });
            lines.push({ text: `  ${c.body}  \u2014  ${c.desc}`, cls: '' });
            lines.push({ text: '' });
        });
        return lines;
    }

    cmdContact() {
        const p = this.getData().person || {};
        return [
            { text: '\ud83d\udcec  Contact', cls: 'term-success' },
            { text: '' },
            { text: `  Email    ${p.email    || ''}`, cls: 'term-info' },
            { text: `  Phone    ${p.phone    || ''}`, cls: 'term-info' },
            { text: `  LinkedIn ${p.linkedin || ''}`, cls: 'term-info' },
            { text: `  GitHub   ${p.github   || ''}`, cls: 'term-info' },
            { text: `  Website  ${p.website  || ''}`, cls: 'term-info' },
        ];
    }

    cmdSocial() {
        const s = this.getData().socials || {};
        const p = this.getData().person  || {};
        return [
            { text: '\ud83d\udd17  Social Links', cls: 'term-success' },
            { text: '' },
            { text: `  GitHub     ${s.github    || p.github   || ''}`, cls: 'term-info' },
            { text: `  LinkedIn   ${s.linkedin  || p.linkedin || ''}`, cls: 'term-info' },
            { text: `  Instagram  ${s.instagram || ''}`,               cls: 'term-info' },
            { text: `  Website    ${p.website   || ''}`,               cls: 'term-info' },
        ];
    }

    cmdGithub()   { const p = this.getData().person || {}; return [{ text: p.github   || '', cls: 'term-info' }]; }
    cmdLinkedin() { const p = this.getData().person || {}; return [{ text: p.linkedin || '', cls: 'term-info' }]; }
    cmdEmail()    { const p = this.getData().person || {}; return [{ text: p.email    || '', cls: 'term-info' }]; }
    cmdPhone()    { const p = this.getData().person || {}; return [{ text: p.phone    || '', cls: 'term-info' }]; }

    cmdWhoami() {
        const p = this.getData().person || {};
        return [{ text: `${p.name} \u2014 ${p.title}`, cls: 'term-success' }];
    }

    cmdLs() {
        return [
            { text: 'about/      projects/    skills/     experience/    contact/    license/', cls: 'term-info' },
            { text: 'README.md   profile.json projects.md skills.md   work.md   socials.json', cls: '' },
        ];
    }

    cmdPwd() { return [{ text: '/home/akash/portfolio-vscode', cls: 'term-info' }]; }

    cmdHistory(historyCmds) {
        if (!historyCmds.length) return [{ text: '  (no history)', cls: 'term-info' }];
        return historyCmds.map((cmd, i) => ({ text: `  ${String(i + 1).padStart(3)}  ${cmd}`, cls: '' }));
    }

    cmdDate() {
        const d = new Date();
        return [{ text: d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), cls: 'term-info' }];
    }

    cmdTime() {
        return [{ text: new Date().toLocaleTimeString('en-IN'), cls: 'term-info' }];
    }

    cmdHire() {
        const p = this.getData().person || {};
        return [
            { text: '\ud83c\udf89  Availability', cls: 'term-success' },
            { text: '' },
            { text: `  ${p.name} is OPEN to work!`, cls: 'term-info' },
            { text: '' },
            { text: '  Available for:', cls: '' },
            { text: '    \u00b7 Freelance Projects', cls: '' },
            { text: '    \u00b7 Internships', cls: '' },
            { text: '    \u00b7 Open Source Collaborations', cls: '' },
            { text: '    \u00b7 Full-time (post-graduation)', cls: '' },
            { text: '' },
            { text: `  Contact: ${p.email}`, cls: 'term-info' },
        ];
    }

    cmdGoals() {
        return [
            { text: '\ud83c\udfaf  Goals', cls: 'term-success' },
            { text: '' },
            { text: '  Short-term:', cls: 'term-info' },
            { text: '    Complete BCA, land a developer internship,', cls: '' },
            { text: '    contribute to meaningful open-source projects.', cls: '' },
            { text: '' },
            { text: '  Long-term:', cls: 'term-info' },
            { text: '    Become a skilled full-stack engineer,', cls: '' },
            { text: '    build products that solve real-world problems.', cls: '' },
        ];
    }

    cmdServices() {
        return [
            { text: '\ud83c\udf10  Services', cls: 'term-success' },
            { text: '' },
            { text: '  Web Development      \u2013 HTML, CSS, JS, React, Node.js', cls: '' },
            { text: '  UI/UX Design         \u2013 Clean, accessible interfaces', cls: '' },
            { text: '  Chatbot Development  \u2013 AI-powered assistants', cls: '' },
            { text: '  Backend & Databases  \u2013 Node.js, MySQL, MongoDB', cls: '' },
        ];
    }

    cmdLocation() {
        const p = this.getData().person || {};
        return [
            { text: `\ud83d\udccd  ${p.location || 'Ghazipur, Uttar Pradesh, India'}`, cls: 'term-info' },
            { text: '    Available for remote and local opportunities.', cls: '' },
        ];
    }

    cmdResume() {
        const p = this.getData().person || {};
        return [
            { text: '\ud83d\udcc4  Resume Summary', cls: 'term-success' },
            { text: '' },
            { text: `  Name       ${p.name}`, cls: '' },
            { text: `  Title      ${p.title}`, cls: '' },
            { text: `  Location   ${p.location}`, cls: '' },
            { text: `  Projects   ${p.stats?.projects}`, cls: '' },
            { text: `  Certs      ${p.stats?.certifications}`, cls: '' },
            { text: `  Exp        ${p.stats?.experience}`, cls: '' },
            { text: '' },
            { text: `  Contact ${p.email} for full resume.`, cls: 'term-info' },
        ];
    }
}

export const terminalCommands = new TerminalCommands();
