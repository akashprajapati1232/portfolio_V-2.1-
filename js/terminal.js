/**
 * terminal.js
 * Manages the bottom terminal panel.
 * Shows a one-time startup animation sequence that types commands,
 * then leaves a blinking cursor.
 *
 * The animation only runs ONCE when the page loads.
 */

window.Terminal = (function () {
    'use strict';

    /* Animation sequence: each entry is either:
       { type: 'cmd', text: '...' }       → a command line
       { type: 'output', text: '...' }    → output text
       { type: 'pause', ms: N }           → a delay pause
       { type: 'blank' }                  → empty line
    */
    const SEQUENCE = [
        { type: 'pause',  ms: 600 },
        { type: 'cmd',    text: 'cd portfolio-vscode' },
        { type: 'pause',  ms: 300 },
        { type: 'output', text: '~/portfolio-vscode $', cls: 'term-success' },
        { type: 'pause',  ms: 400 },
        { type: 'cmd',    text: 'ls' },
        { type: 'pause',  ms: 250 },
        { type: 'output', text: 'about/    projects/    skills/    experience/    contact/    license/', cls: 'term-info' },
        { type: 'pause',  ms: 500 },
        { type: 'cmd',    text: 'cat about/README.md' },
        { type: 'pause',  ms: 300 },
        { type: 'output', text: '# Akash Prajapati', cls: '' },
        { type: 'output', text: 'BCA Student & Full-Stack Web Developer', cls: 'term-info' },
        { type: 'output', text: 'Saharanpur, UP, India', cls: '' },
        { type: 'pause',  ms: 400 },
        { type: 'cmd',    text: 'node --version' },
        { type: 'pause',  ms: 200 },
        { type: 'output', text: 'v20.11.0', cls: 'term-success' },
        { type: 'pause',  ms: 300 },
        { type: 'cmd',    text: 'echo "Loading portfolio..."' },
        { type: 'pause',  ms: 250 },
        { type: 'output', text: 'Loading portfolio...', cls: 'term-loading' },
        { type: 'pause',  ms: 600 },
        { type: 'output', text: '✓ Portfolio loaded successfully. Welcome!', cls: 'term-success' },
        { type: 'pause',  ms: 200 }
    ];

    const TYPING_SPEED = 45;  // ms per character
    const PROMPT = 'akash@portfolio:~$ ';

    let _animationDone = false;
    let _termOutput = null;
    let _termPanel  = null;

    /* ── Initialize ── */
    function init() {
        _termOutput = document.getElementById('terminal-output');
        _termPanel  = document.getElementById('terminal-panel');

        // Close button
        const closeBtn = document.getElementById('term-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }

        // Clear button
        const clearBtn = document.getElementById('term-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearOutput);
        }

        // Show terminal with slide-up animation after a short delay
        setTimeout(show, 800);
    }

    /* ── Show terminal ── */
    function show() {
        if (!_termPanel) return;
        _termPanel.classList.remove('hidden');
        _termPanel.classList.add('visible', 'animating');

        // Remove animating class after animation ends
        _termPanel.addEventListener('animationend', function () {
            _termPanel.classList.remove('animating');
        }, { once: true });

        // Start typing sequence once
        if (!_animationDone) {
            _runSequence(0);
        }
    }

    /* ── Hide terminal ── */
    function hide() {
        if (!_termPanel) return;
        _termPanel.classList.remove('visible', 'animating');
        _termPanel.classList.add('hidden');
    }

    /* ── Clear output ── */
    function clearOutput() {
        if (_termOutput) _termOutput.innerHTML = '';
    }

    /* ── Run the sequence step by step ── */
    function _runSequence(stepIdx) {
        if (stepIdx >= SEQUENCE.length) {
            // Sequence done — just keep cursor blinking (already in HTML)
            _animationDone = true;
            return;
        }

        const step = SEQUENCE[stepIdx];

        if (step.type === 'pause') {
            setTimeout(() => _runSequence(stepIdx + 1), step.ms);

        } else if (step.type === 'blank') {
            _appendBlank();
            _runSequence(stepIdx + 1);

        } else if (step.type === 'output') {
            _appendOutput(step.text, step.cls || '');
            _scrollToBottom();
            setTimeout(() => _runSequence(stepIdx + 1), 80);

        } else if (step.type === 'cmd') {
            _typeCommand(step.text, () => {
                _scrollToBottom();
                _runSequence(stepIdx + 1);
            });
        }
    }

    /* ── Type a command character by character ── */
    function _typeCommand(text, done) {
        // Create line element
        const line = document.createElement('div');
        line.className = 'term-line';
        const promptSpan = document.createElement('span');
        promptSpan.className = 'term-prompt-text';
        promptSpan.textContent = PROMPT;
        const cmdSpan = document.createElement('span');
        cmdSpan.className = 'term-cmd';

        line.appendChild(promptSpan);
        line.appendChild(cmdSpan);
        _termOutput.appendChild(line);
        _scrollToBottom();

        let charIdx = 0;
        function typeChar() {
            if (charIdx < text.length) {
                cmdSpan.textContent += text[charIdx];
                charIdx++;
                _scrollToBottom();
                setTimeout(typeChar, TYPING_SPEED + Math.random() * 20);
            } else {
                // Done typing
                setTimeout(done, 120);
            }
        }
        typeChar();
    }

    /* ── Append output line ── */
    function _appendOutput(text, extraClass) {
        const line = document.createElement('div');
        line.className = `term-line`;
        const span = document.createElement('span');
        span.className = `term-output ${extraClass}`;
        span.textContent = text;
        line.appendChild(span);
        _termOutput.appendChild(line);
    }

    /* ── Append blank line ── */
    function _appendBlank() {
        const line = document.createElement('div');
        line.className = 'term-line';
        line.innerHTML = '&nbsp;';
        _termOutput.appendChild(line);
    }

    /* ── Scroll terminal to bottom ── */
    function _scrollToBottom() {
        const body = document.getElementById('terminal-body');
        if (body) body.scrollTop = body.scrollHeight;
    }

    return { init, show, hide, clearOutput };
}());
