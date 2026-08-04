/**
 * Terminal.js
 * xterm.js-powered terminal for the VS Code-style portfolio.
 *
 * Architecture:
 *   Terminal UI  →  xterm.js (XTerm)
 *   Input        →  CommandParser (built-in, handles history / autocomplete)
 *   Commands     →  TerminalCommands.js  →  DataService (portfolio data)
 */

import { eventBus } from '../../core/EventBus.js';
import { terminalCommands } from './TerminalCommands.js';

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const A = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    green:   '\x1b[32m',
    cyan:    '\x1b[36m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    white:   '\x1b[97m',
    gray:    '\x1b[90m',
    teal:    '\x1b[38;2;78;201;176m',   // #4ec9b0 — matches prompt colour
    blue:    '\x1b[38;2;79;193;255m',   // #4fc1ff
};

// Map the old CSS-class names coming from TerminalCommands to ANSI sequences
const CLS_TO_ANSI = {
    'term-success': A.green,
    'term-info':    A.blue,
    'term-loading': A.yellow,
    'term-error':   A.red,
};

// ─── Terminal class ───────────────────────────────────────────────────────────
class Terminal {
    constructor() {
        this.PROMPT         = `${A.teal}akash@portfolio${A.reset}${A.gray}:${A.reset}${A.blue}~${A.reset}${A.gray}$${A.reset} `;
        this.PROMPT_PLAIN   = 'akash@portfolio:~$ '; // plain text for width calc

        this.history  = [];
        this.histIdx  = -1;
        this.input    = '';          // current input buffer
        this.cursorX  = 0;          // cursor position within input

        this.suggestions = [];
        this.suggIdx     = -1;
        this.acActive    = false;

        this.booted  = false;
        this.visible = false;

        // Will be set in init()
        this.xterm    = null;
        this.fitAddon = null;
        this.panel    = null;
        this.layoutBtn = null;

        this.BOOT_SEQUENCE = [
            { type: 'pause',  ms: 400 },
            { type: 'output', text: 'Microsoft Windows [Version 10.0.19045]', cls: '' },
            { type: 'output', text: '(c) Microsoft Corporation. All rights reserved.', cls: '' },
            { type: 'pause',  ms: 200 },
            { type: 'blank' },
            { type: 'cmd',    text: 'node portfolio.js' },
            { type: 'pause',  ms: 350 },
            { type: 'output', text: '\u2713  Portfolio loaded successfully.', cls: 'term-success' },
            { type: 'output', text: '   Type  help  to see available commands.', cls: 'term-info' },
            { type: 'blank' },
        ];
    }

    // ── render ── returns the static HTML shell; xterm mounts inside #terminal-body
    render() {
        return `
            <!-- Terminal Panel -->
            <div id="terminal-panel" role="complementary" aria-label="Terminal panel">
                <div id="terminal-header">
                    <div class="terminal-tabs">
                        <div class="terminal-tab" id="term-tab-problems" title="Problems">
                            <span>PROBLEMS</span>
                        </div>
                        <div class="terminal-tab" id="term-tab-output" title="Output">
                            <span>OUTPUT</span>
                        </div>
                        <div class="terminal-tab" id="term-tab-debug" title="Debug Console">
                            <span>DEBUG CONSOLE</span>
                        </div>
                        <div class="terminal-tab active" id="term-tab" title="Terminal">
                            <span>TERMINAL</span>
                            <span class="term-tab-badge">1</span>
                        </div>
                        <div class="terminal-tab" id="term-tab-ports" title="Ports">
                            <span>PORTS</span>
                        </div>
                    </div>
                    <div class="terminal-actions">
                        <button class="term-action-btn" id="term-new" title="New Terminal"
                            aria-label="New Terminal">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 1a.5.5 0 0 1 .5.5v6h6a.5.5 0 0 1 0 1h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 8 1z" />
                            </svg>
                        </button>
                        <button class="term-action-btn" id="term-split" title="Split Terminal"
                            aria-label="Split Terminal">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="2" width="6" height="12" rx="1" />
                                <rect x="9" y="2" width="6" height="12" rx="1" />
                            </svg>
                        </button>
                        <div class="term-actions-divider"></div>
                        <button class="term-action-btn" id="term-maximize" title="Maximize Panel"
                            aria-label="Maximize Panel">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
                                <rect x="1.5" y="1.5" width="13" height="13" rx="1" />
                                <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" />
                                <line x1="10.5" y1="1.5" x2="10.5" y2="14.5" />
                            </svg>
                        </button>
                        <button class="term-action-btn" id="term-close" title="Close Panel"
                            aria-label="Close Terminal">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div id="terminal-body" aria-live="polite" aria-label="Terminal output">
                    <div id="xterm-mount"></div>
                </div>
            </div>
        `;
    }

    // ── init ──────────────────────────────────────────────────────────────────
    init() {
        this.panel     = document.getElementById('terminal-panel');
        this.layoutBtn = document.getElementById('layout-bottom');
        if (!this.panel) return;

        // Create xterm.js instance
        this.xterm = new window.Terminal({
            theme: {
                background:    '#1e1e1e',
                foreground:    '#d4d4d4',
                cursor:        '#d4d4d4',
                cursorAccent:  '#1e1e1e',
                selectionBackground: 'rgba(79,193,255,0.3)',
                black:         '#1e1e1e',
                red:           '#f44747',
                green:         '#6a9955',
                yellow:        '#dcdcaa',
                blue:          '#569cd6',
                magenta:       '#c586c0',
                cyan:          '#4ec9b0',
                white:         '#d4d4d4',
                brightBlack:   '#808080',
                brightRed:     '#f44747',
                brightGreen:   '#6a9955',
                brightYellow:  '#dcdcaa',
                brightBlue:    '#4fc1ff',
                brightMagenta: '#c586c0',
                brightCyan:    '#4ec9b0',
                brightWhite:   '#ffffff',
            },
            fontFamily:      "'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontSize:        13,
            lineHeight:      1.5,
            cursorBlink:     true,
            cursorStyle:     'block',
            scrollback:      1000,
            allowTransparency: false,
            convertEol:      true,
        });

        // FitAddon — auto-size xterm canvas to container
        this.fitAddon = new window.FitAddon.FitAddon();
        this.xterm.loadAddon(this.fitAddon);

        // Mount inside #xterm-mount
        const mountEl = document.getElementById('xterm-mount');
        this.xterm.open(mountEl);

        // Wire up key input
        this.xterm.onKey(({ key, domEvent }) => this._onKey(key, domEvent));

        // Wire header buttons
        document.getElementById('term-close')?.addEventListener('click', () => this.hide());
        document.getElementById('term-new')?.addEventListener('click', () => { this._clearScreen(); this._prompt(); this.xterm.focus(); });
        document.getElementById('term-maximize')?.addEventListener('click', () => {
            this.panel.classList.toggle('term-maximized');
            setTimeout(() => this._fit(), 50);
        });
        document.getElementById('term-split')?.addEventListener('click', () => this.xterm.focus());
        document.getElementById('term-tab')?.addEventListener('click', () => this.xterm.focus());

        // Refit on window resize
        window.addEventListener('resize', () => this._fit());

        // EventBus integration
        eventBus.on('terminal:toggle', this.toggle.bind(this));

        this.show();
    }

    // ── Key handler ───────────────────────────────────────────────────────────
    _onKey(key, ev) {
        const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

        // Ctrl+C — cancel input
        if (ev.ctrlKey && ev.key === 'c') {
            this.xterm.write('^C\r\n');
            this.input   = '';
            this.cursorX = 0;
            this._prompt();
            return;
        }

        // Ctrl+L — clear
        if (ev.ctrlKey && ev.key === 'l') {
            ev.preventDefault();
            this._clearScreen();
            this._prompt();
            return;
        }

        switch (ev.key) {
            case 'Enter':
                this._hideAC();
                this.xterm.write('\r\n');
                this._execute(this.input);
                this.input   = '';
                this.cursorX = 0;
                break;

            case 'Backspace':
                if (this.cursorX > 0) {
                    // Remove char before cursor
                    this.input   = this.input.slice(0, this.cursorX - 1) + this.input.slice(this.cursorX);
                    this.cursorX--;
                    this._redrawInputLine();
                }
                break;

            case 'Delete':
                if (this.cursorX < this.input.length) {
                    this.input   = this.input.slice(0, this.cursorX) + this.input.slice(this.cursorX + 1);
                    this._redrawInputLine();
                }
                break;

            case 'ArrowLeft':
                if (this.cursorX > 0) {
                    this.cursorX--;
                    this.xterm.write('\x1b[D');
                }
                break;

            case 'ArrowRight':
                if (this.cursorX < this.input.length) {
                    this.cursorX++;
                    this.xterm.write('\x1b[C');
                }
                break;

            case 'Home':
                if (this.cursorX > 0) {
                    this.xterm.write(`\x1b[${this.cursorX}D`);
                    this.cursorX = 0;
                }
                break;

            case 'End':
                if (this.cursorX < this.input.length) {
                    const delta = this.input.length - this.cursorX;
                    this.xterm.write(`\x1b[${delta}C`);
                    this.cursorX = this.input.length;
                }
                break;

            case 'ArrowUp':
                this._hideAC();
                if (this.history.length === 0) break;
                if (this.histIdx === -1) this.histIdx = this.history.length - 1;
                else this.histIdx = Math.max(0, this.histIdx - 1);
                this._setInput(this.history[this.histIdx]);
                break;

            case 'ArrowDown':
                this._hideAC();
                if (this.histIdx === -1) break;
                this.histIdx++;
                if (this.histIdx >= this.history.length) {
                    this.histIdx = -1;
                    this._setInput('');
                } else {
                    this._setInput(this.history[this.histIdx]);
                }
                break;

            case 'Tab':
                ev.preventDefault();
                this._handleTab();
                break;

            case 'Escape':
                this._hideAC();
                break;

            default:
                if (printable && key.length === 1) {
                    this._hideAC();
                    this.input   = this.input.slice(0, this.cursorX) + key + this.input.slice(this.cursorX);
                    this.cursorX++;
                    this._redrawInputLine();
                    this._showACSuggestions();
                }
        }
    }

    // ── Input helpers ─────────────────────────────────────────────────────────

    /** Replace the in-progress input line (erase to start of line, rewrite) */
    _redrawInputLine() {
        // Move to beginning of input (after prompt) then erase to end, rewrite
        const promptLen = this.PROMPT_PLAIN.length;
        // Move cursor back to column promptLen+1 (1-based)
        this.xterm.write(`\r\x1b[${promptLen}C`);   // go to end of prompt
        this.xterm.write('\x1b[K');                   // erase from cursor to EOL
        this.xterm.write(this.input);
        // Reposition cursor
        const charsAfterCursor = this.input.length - this.cursorX;
        if (charsAfterCursor > 0) {
            this.xterm.write(`\x1b[${charsAfterCursor}D`);
        }
    }

    /** Overwrite current input entirely */
    _setInput(text) {
        this.input   = text;
        this.cursorX = text.length;
        this._redrawInputLine();
    }

    _prompt() {
        this.xterm.write(this.PROMPT);
        this.histIdx = -1;
    }

    _clearScreen() {
        this.xterm.write('\x1b[2J\x1b[H');
    }

    // ── Autocomplete ──────────────────────────────────────────────────────────

    _handleTab() {
        const partial = this.input.trim();
        const matches = terminalCommands.getSuggestions(partial);
        if (matches.length === 0) return;
        if (matches.length === 1) {
            this._setInput(matches[0]);
        } else {
            // Show inline completion hints
            this.xterm.write('\r\n');
            this.xterm.write(matches.map(m => `${A.gray}${m}${A.reset}`).join('  '));
            this.xterm.write('\r\n');
            this._prompt();
            this.xterm.write(this.input);
            this.cursorX = this.input.length;
        }
    }

    _showACSuggestions() {
        // Inline ghost hint: show the first matching suggestion greyed out
        const partial = this.input.trim();
        if (partial.length < 1) return;
        this.suggestions = terminalCommands.getSuggestions(partial);
    }

    _hideAC() {
        this.suggestions = [];
        this.suggIdx     = -1;
        this.acActive    = false;
    }

    // ── Execute a command ─────────────────────────────────────────────────────

    _execute(raw) {
        const cmd = raw.trim();
        if (!cmd) {
            this._prompt();
            return;
        }

        // History (dedup consecutive)
        if (!this.history.length || this.history[this.history.length - 1] !== cmd) {
            this.history.push(cmd);
        }
        this.histIdx = -1;

        const response = terminalCommands.execute(cmd.toLowerCase(), this.history);

        if (response.action === 'clear') {
            this._clearScreen();
            this._prompt();
            return;
        }

        // Print lines
        response.lines.forEach(l => {
            if (!l.text && l.text !== 0) {
                this.xterm.write('\r\n');
                return;
            }
            const colour = CLS_TO_ANSI[l.cls] || A.reset;
            this.xterm.write(`${colour}${l.text}${A.reset}\r\n`);
        });

        this._prompt();
    }

    // ── Boot sequence ─────────────────────────────────────────────────────────

    _runBoot(seq, idx) {
        if (idx >= seq.length) {
            this.booted = true;
            this._prompt();
            this.xterm.focus();
            return;
        }
        const step = seq[idx];
        const next = () => this._runBoot(seq, idx + 1);

        if (step.type === 'pause') {
            setTimeout(next, step.ms);
        } else if (step.type === 'blank') {
            this.xterm.write('\r\n');
            next();
        } else if (step.type === 'output') {
            const colour = CLS_TO_ANSI[step.cls] || A.reset;
            this.xterm.write(`${colour}${step.text}${A.reset}\r\n`);
            setTimeout(next, 60);
        } else if (step.type === 'cmd') {
            this.xterm.write(`${this.PROMPT}${A.white}${step.text}${A.reset}\r\n`);
            setTimeout(next, 80);
        }
    }

    // ── FitAddon helper ───────────────────────────────────────────────────────

    _fit() {
        try { this.fitAddon?.fit(); } catch (_) { /* panel may be hidden */ }
    }

    // ── Visibility ────────────────────────────────────────────────────────────

    syncBtn(open) {
        if (!this.layoutBtn) this.layoutBtn = document.getElementById('layout-bottom');
        if (this.layoutBtn) this.layoutBtn.classList.toggle('active', open);
    }

    show() {
        if (!this.panel) return;
        this.visible = true;
        this.panel.classList.remove('hidden');
        this.panel.classList.add('visible', 'animating');
        this.panel.addEventListener('animationend', () => {
            this.panel.classList.remove('animating');
            this._fit();
        }, { once: true });
        this.syncBtn(true);
        if (!this.booted) {
            this._runBoot(this.BOOT_SEQUENCE, 0);
        } else {
            setTimeout(() => { this._fit(); this.xterm?.focus(); }, 50);
        }
    }

    hide() {
        if (!this.panel) return;
        this.visible = false;
        this.panel.classList.remove('visible', 'animating');
        this.panel.classList.add('hidden');
        this.syncBtn(false);
    }

    toggle() { this.visible ? this.hide() : this.show(); }
}

export const terminal = new Terminal();
