/**
 * Terminal.js
 * Original DOM-based terminal implementation adapted to component architecture.
 *
 * Architecture:
 *   Terminal UI  →  Vanilla DOM & HTML
 *   Input        →  CommandParser (built-in, handles history / autocomplete)
 *   Commands     →  TerminalCommands.js  →  DataService (portfolio data)
 */

import { eventBus } from '../../core/EventBus.js';
import { terminalCommands } from './TerminalCommands.js';

class Terminal {
    constructor() {
        this.PROMPT_TEXT  = 'akash@portfolio:~$ ';
        
        this.history      = [];
        this.histIdx      = -1;
        
        this.suggestions  = [];
        this.suggIdx      = -1;
        
        this.booted       = false;
        this.visible      = false;

        this.panel        = null;
        this.body         = null;
        this.output       = null;
        this.inputEl      = null;   // hidden real <input>
        this.displayLine  = null;   // visible prompt line (rendered span)
        this.cmdSpan      = null;   // the typed-text span inside display line
        this.cursorSpan   = null;   // blinking cursor span
        this.autocomplete = null;   // suggestion dropdown element
        this.layoutBtn    = null;

        this.BOOT_SEQUENCE = [
            { type: 'pause',  ms: 300 },
            { type: 'cmd',    text: 'portfolio CLI v2.0.1' },
            { type: 'pause',  ms: 200 },
            { type: 'output', text: 'Starting Portfolio Engine...', cls: '' },
            { type: 'pause',  ms: 250 },
            { type: 'output', text: '[✓] Loading workspace', cls: 'term-success' },
            { type: 'pause',  ms: 150 },
            { type: 'output', text: '[✓] Loading developer profile', cls: 'term-success' },
            { type: 'pause',  ms: 200 },
            { type: 'output', text: '[✓] Loading projects', cls: 'term-success' },
            { type: 'pause',  ms: 150 },
            { type: 'output', text: '[✓] Loading skills', cls: 'term-success' },
            { type: 'pause',  ms: 100 },
            { type: 'output', text: '[✓] Loading terminal commands', cls: 'term-success' },
            { type: 'pause',  ms: 300 },
            { type: 'output', text: 'Portfolio loaded successfully.', cls: 'term-success' },
            { type: 'output', text: "Type 'help' to see available commands.", cls: 'term-info' },
            { type: 'blank' }
        ];
    }

    render() {
        return `
            <!-- Terminal Panel -->
            <div id="terminal-panel" role="complementary" aria-label="Terminal panel">
                <div id="terminal-header">
                    <div class="terminal-tabs">
                        <div class="terminal-tab" data-target="panel-content-problems" id="term-tab-problems" title="Problems">
                            <span>PROBLEMS</span>
                        </div>
                        <div class="terminal-tab" data-target="panel-content-output" id="term-tab-output" title="Output">
                            <span>OUTPUT</span>
                        </div>
                        <div class="terminal-tab" data-target="panel-content-debug" id="term-tab-debug" title="Debug Console">
                            <span>DEBUG CONSOLE</span>
                        </div>
                        <div class="terminal-tab active" data-target="terminal-body" id="term-tab-terminal" title="Terminal">
                            <span>TERMINAL</span>
                            <span class="term-tab-badge">1</span>
                        </div>
                        <div class="terminal-tab" data-target="panel-content-ports" id="term-tab-ports" title="Ports">
                            <span>PORTS</span>
                        </div>
                    </div>
                    <div class="terminal-actions">
                        <button class="term-action-btn" id="term-new" title="New Terminal" aria-label="New Terminal">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 1a.5.5 0 0 1 .5.5v6h6a.5.5 0 0 1 0 1h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 8 1z" />
                            </svg>
                        </button>
                        <button class="term-action-btn" id="term-split" title="Split Terminal" aria-label="Split Terminal">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="2" width="6" height="12" rx="1" />
                                <rect x="9" y="2" width="6" height="12" rx="1" />
                            </svg>
                        </button>
                        <div class="term-actions-divider"></div>
                        <button class="term-action-btn" id="term-maximize" title="Maximize Panel" aria-label="Maximize Panel">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
                                <rect x="1.5" y="1.5" width="13" height="13" rx="1" />
                                <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" />
                                <line x1="10.5" y1="1.5" x2="10.5" y2="14.5" />
                            </svg>
                        </button>
                        <button class="term-action-btn" id="term-close" title="Close Panel" aria-label="Close Terminal">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- Tab contents -->
                <div id="panel-content-problems" class="panel-content-area">
                    <div class="term-line"><span class="term-output">Problems</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Errors: 0</span></div>
                    <div class="term-line"><span class="term-output">Warnings: 3</span></div>
                    <div class="term-line"><span class="term-output">Info: 2</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #cca700;">⚠ Coffee level is running low.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #cca700;">⚠ Too many project ideas, not enough weekends.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #cca700;">⚠ Curiosity exceeds recommended limits.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #6a9955;">✓ No coding issues detected.</span></div>
                </div>
                
                <div id="panel-content-output" class="panel-content-area">
                    <div class="term-line"><span class="term-output">[Portfolio Engine]</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Loading README.md...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Loading developer profile...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Loading projects...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Loading coffee...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #f48771;">Coffee not found.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Retrying...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #6a9955;">Coffee restored.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #6a9955;">Workspace loaded successfully.</span></div>
                </div>
                
                <div id="panel-content-debug" class="panel-content-area">
                    <div class="term-line"><span class="term-output" style="color: #4fc1ff;">Debugger attached.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Watching for bugs...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #6a9955;">Found 0 bugs.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output" style="color: #4fc1ff;">Found 17 new ideas.</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Stopping debugger...</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">Opening GitHub instead.</span></div>
                </div>

                <div id="terminal-body" class="panel-content-area active" aria-live="polite" aria-label="Terminal output">
                    <div id="terminal-output"></div>
                    <!-- Interactive input line injected by JS -->
                </div>

                <div id="panel-content-ports" class="panel-content-area">
                    <div class="term-line"><span class="term-output">PORT    SERVICE              STATUS</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">3000    Portfolio UI         🟢 Running</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">5432    Social Database      🟢 Connected</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">8080    Motivation API       🟡 Fluctuating</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">9999    Coffee Service       🟢 Active</span></div>
                    <div class="term-line"><span class="term-output"></span></div>
                    <div class="term-line"><span class="term-output">4040    Comfort Zone         🔴 Not Found</span></div>
                </div>
            </div>
        `;
    }

    init() {
        this.panel     = document.getElementById('terminal-panel');
        this.body      = document.getElementById('terminal-body');
        this.output    = document.getElementById('terminal-output');
        this.layoutBtn = document.getElementById('layout-bottom');

        if (!this.panel || !this.body || !this.output) return;

        /* ── Build interactive input line ── */
        const staticLine = this.body.querySelector('.terminal-input-line');
        if (staticLine) staticLine.remove();

        // Create hidden real input
        this.inputEl = document.createElement('input');
        this.inputEl.type = 'text';
        this.inputEl.id   = 'term-real-input';
        this.inputEl.autocomplete = 'off';
        this.inputEl.spellcheck   = false;
        this.inputEl.style.cssText = [
            'position:absolute', 'opacity:0', 'pointer-events:none',
            'width:1px', 'height:1px', 'border:none', 'outline:none',
            'background:transparent', 'color:transparent', 'caret-color:transparent'
        ].join(';');
        this.panel.appendChild(this.inputEl);

        // Build visible prompt display line
        this.displayLine = document.createElement('div');
        this.displayLine.className = 'terminal-input-line';
        this.displayLine.id = 'term-display-line';

        const promptSpan = document.createElement('span');
        promptSpan.className = 'term-prompt';
        promptSpan.textContent = this.PROMPT_TEXT;

        this.cmdSpan = document.createElement('span');
        this.cmdSpan.className = 'term-typed';

        this.cursorSpan = document.createElement('span');
        this.cursorSpan.className = 'cursor';
        this.cursorSpan.setAttribute('aria-hidden', 'true');
        this.cursorSpan.textContent = '\u2588'; // block character

        this.displayLine.appendChild(promptSpan);
        this.displayLine.appendChild(this.cmdSpan);
        this.displayLine.appendChild(this.cursorSpan);
        this.body.appendChild(this.displayLine);

        /* ── Autocomplete dropdown ── */
        this.autocomplete = document.createElement('div');
        this.autocomplete.id = 'term-autocomplete';
        this.autocomplete.style.display = 'none';
        this.body.appendChild(this.autocomplete);

        /* ── Event listeners ── */
        this.inputEl.addEventListener('keydown', this._onKeyDown.bind(this));
        this.inputEl.addEventListener('input',   this._onInput.bind(this));

        // Click anywhere in body \u2192 focus input
        this.body.addEventListener('click', (e) => {
            if (e.target.closest('#term-autocomplete')) return;
            this.focusInput();
        });

        // Wire header buttons
        const tabs = this.panel.querySelectorAll('.terminal-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Hide all panel content areas
                this.panel.querySelectorAll('.panel-content-area').forEach(content => {
                    content.classList.remove('active');
                });

                // Show target content area
                const targetId = tab.getAttribute('data-target');
                if (targetId) {
                    const targetContent = document.getElementById(targetId);
                    if (targetContent) targetContent.classList.add('active');
                    
                    // Focus input if terminal tab is active
                    if (targetId === 'terminal-body') {
                        this.focusInput();
                    }
                }
            });
        });

        document.getElementById('term-close')?.addEventListener('click', () => this.hide());
        document.getElementById('term-new')?.addEventListener('click', () => { this._execute('clear'); this.focusInput(); });
        document.getElementById('term-maximize')?.addEventListener('click', () => {
            this.panel.classList.toggle('term-maximized');
            this._scrollToBottom();
        });
        document.getElementById('term-split')?.addEventListener('click', () => this.focusInput());

        // EventBus integration
        eventBus.on('terminal:toggle', this.toggle.bind(this));

        this.show();
    }

    // ── Input Handling ────────────────────────────────────────────────────────
    
    _onKeyDown(e) {
        const ac = this.autocomplete.style.display !== 'none';

        switch (e.key) {
            case 'Enter': {
                e.preventDefault();
                if (ac && this.suggIdx >= 0) {
                    this._applyCompletion(this.suggestions[this.suggIdx]);
                } else {
                    const val = this.inputEl.value;
                    this.inputEl.value = '';
                    this._renderInput();
                    this._hideAutocomplete();
                    this._execute(val);
                }
                break;
            }
            case 'Tab': {
                e.preventDefault();
                const partial = this.inputEl.value.trim();
                const matches = terminalCommands.getSuggestions(partial);
                if (matches.length === 1) {
                    this._applyCompletion(matches[0]);
                } else if (matches.length > 1) {
                    this._showAutocomplete(partial, matches);
                    this.suggIdx = 0;
                    this._highlightSuggestion(0);
                }
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                if (ac) {
                    this.suggIdx = Math.max(0, this.suggIdx - 1);
                    this._highlightSuggestion(this.suggIdx);
                } else {
                    if (this.history.length === 0) break;
                    if (this.histIdx === -1) this.histIdx = this.history.length - 1;
                    else this.histIdx = Math.max(0, this.histIdx - 1);
                    this.inputEl.value = this.history[this.histIdx];
                    this._renderInput();
                }
                break;
            }
            case 'ArrowDown': {
                e.preventDefault();
                if (ac) {
                    this.suggIdx = Math.min(this.suggestions.length - 1, this.suggIdx + 1);
                    this._highlightSuggestion(this.suggIdx);
                } else {
                    if (this.histIdx === -1) break;
                    this.histIdx++;
                    if (this.histIdx >= this.history.length) {
                        this.histIdx = -1;
                        this.inputEl.value = '';
                    } else {
                        this.inputEl.value = this.history[this.histIdx];
                    }
                    this._renderInput();
                }
                break;
            }
            case 'Escape': {
                this._hideAutocomplete();
                break;
            }
            case 'l': {
                if (e.ctrlKey) {
                    e.preventDefault();
                    this._execute('clear');
                }
                break;
            }
            case 'c': {
                if (e.ctrlKey) {
                    // Cancel input
                    this._appendPromptLine(this.inputEl.value + '^C');
                    this.inputEl.value = '';
                    this._renderInput();
                    this._hideAutocomplete();
                    this._scrollToBottom();
                }
                break;
            }
        }
    }

    _onInput() {
        this._renderInput();
        const partial = this.inputEl.value.trim();
        if (partial.length >= 1) {
            const matches = terminalCommands.getSuggestions(partial);
            if (matches.length > 0) {
                this._showAutocomplete(partial, matches);
            } else {
                this._hideAutocomplete();
            }
        } else {
            this._hideAutocomplete();
        }
    }

    _renderInput() {
        if (this.cmdSpan) this.cmdSpan.textContent = this.inputEl.value;
    }

    // ── Execute Command ───────────────────────────────────────────────────────
    
    _execute(raw) {
        const cmd = raw.trim();
        if (!cmd) {
            this._appendPromptLine('');
            this._scrollToBottom();
            return;
        }

        // History
        if (!this.history.length || this.history[this.history.length - 1] !== cmd) {
            this.history.push(cmd);
        }
        this.histIdx = -1;

        this._appendPromptLine(cmd);

        const response = terminalCommands.execute(cmd.toLowerCase(), this.history);

        if (response.action === 'clear') {
            this.output.innerHTML = '';
            return;
        }

        this._appendLines(response.lines);
        this._scrollToBottom();
    }

    // ── DOM Helpers ───────────────────────────────────────────────────────────
    
    _appendPromptLine(text) {
        const line = document.createElement('div');
        line.className = 'term-line';
        
        const ps = document.createElement('span');
        ps.className = 'term-prompt-text';
        ps.textContent = this.PROMPT_TEXT;
        
        const cs = document.createElement('span');
        cs.className = 'term-cmd';
        cs.textContent = text;
        
        line.appendChild(ps);
        line.appendChild(cs);
        this.output.appendChild(line);
    }

    _appendLines(lines) {
        lines.forEach(l => {
            if (!l.text && l.text !== 0) {
                const blank = document.createElement('div');
                blank.className = 'term-line';
                blank.innerHTML = '&nbsp;';
                this.output.appendChild(blank);
                return;
            }
            const line = document.createElement('div');
            line.className = 'term-line';
            const span = document.createElement('span');
            span.className = `term-output ${l.cls || ''}`;
            span.textContent = l.text;
            line.appendChild(span);
            this.output.appendChild(line);
        });
    }

    _scrollToBottom() {
        if (this.body) this.body.scrollTop = this.body.scrollHeight;
    }

    // ── Autocomplete ──────────────────────────────────────────────────────────
    
    _showAutocomplete(partial, matches) {
        this.suggestions = matches;
        this.suggIdx = -1;
        this.autocomplete.innerHTML = '';
        if (!this.suggestions.length) {
            this.autocomplete.style.display = 'none';
            return;
        }
        
        this.suggestions.forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 'term-suggestion-item';
            item.textContent = s;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this._applyCompletion(s);
            });
            this.autocomplete.appendChild(item);
        });
        this.autocomplete.style.display = 'block';
    }

    _hideAutocomplete() {
        if (this.autocomplete) this.autocomplete.style.display = 'none';
        this.suggestions = [];
        this.suggIdx = -1;
    }

    _highlightSuggestion(idx) {
        if (!this.autocomplete) return;
        const items = this.autocomplete.querySelectorAll('.term-suggestion-item');
        items.forEach((el, i) => el.classList.toggle('active', i === idx));
    }

    _applyCompletion(text) {
        this.inputEl.value = text;
        this._renderInput();
        this._hideAutocomplete();
        this.focusInput();
    }

    // ── Boot sequence ─────────────────────────────────────────────────────────

    _runBoot(seq, idx) {
        if (idx >= seq.length) {
            this.booted = true;
            this._scrollToBottom();
            this.focusInput();
            return;
        }
        const step = seq[idx];
        const next = () => this._runBoot(seq, idx + 1);

        if (step.type === 'pause') {
            setTimeout(next, step.ms);
        } else if (step.type === 'blank') {
            const b = document.createElement('div');
            b.className = 'term-line';
            b.innerHTML = '&nbsp;';
            this.output.appendChild(b);
            this._scrollToBottom();
            next();
        } else if (step.type === 'output') {
            const line = document.createElement('div');
            line.className = 'term-line';
            const span = document.createElement('span');
            span.className = `term-output ${step.cls || ''}`;
            span.textContent = step.text;
            line.appendChild(span);
            this.output.appendChild(line);
            this._scrollToBottom();
            setTimeout(next, 60);
        } else if (step.type === 'cmd') {
            this._appendPromptLine(step.text);
            this._scrollToBottom();
            setTimeout(next, 80);
        }
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
            this._scrollToBottom();
        }, { once: true });
        
        this.syncBtn(true);
        
        if (!this.booted) {
            this._runBoot(this.BOOT_SEQUENCE, 0);
        } else {
            setTimeout(() => {
                this._scrollToBottom();
                this.focusInput();
            }, 50);
        }
    }

    hide() {
        if (!this.panel) return;
        this.visible = false;
        this.panel.classList.remove('visible', 'animating');
        this.panel.classList.add('hidden');
        this._hideAutocomplete();
        this.syncBtn(false);
    }

    toggle() {
        this.visible ? this.hide() : this.show();
    }
    
    focusInput() {
        if (this.inputEl) this.inputEl.focus();
    }
}

export const terminal = new Terminal();
