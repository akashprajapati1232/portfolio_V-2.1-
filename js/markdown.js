/**
 * markdown.js
 * A lightweight, custom Markdown renderer that produces VS Code–styled HTML.
 * Supports: headings, bold, italic, inline code, code blocks,
 *           lists (ordered + unordered), blockquotes, horizontal rules, links.
 *
 * IMPORTANT: This is a hand-written renderer — no external libraries.
 */

window.MarkdownRenderer = (function () {
    'use strict';

    /* ── Escape HTML special characters ── */
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ── Render inline elements (bold, italic, code, links) ── */
    function renderInline(text) {
        // Bold: **text** or __text__
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>');
        text = text.replace(/__(.+?)__/g, '<strong class="md-bold">$1</strong>');

        // Italic: *text* or _text_
        text = text.replace(/\*(.+?)\*/g, '<em class="md-italic">$1</em>');
        text = text.replace(/_(.+?)_/g, '<em class="md-italic">$1</em>');

        // Inline code: `code`
        text = text.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');

        // Links: [label](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
            const safeHref = escapeHtml(href);
            const external = safeHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${safeHref}" class="md-link"${external}>${label}</a>`;
        });

        return text;
    }

    /* ── Parse and render a markdown string to HTML ── */
    function render(markdown) {
        const lines = markdown.split('\n');
        const htmlParts = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            /* ── Fenced code block: ```lang ... ``` ── */
            if (/^```/.test(line)) {
                const langMatch = line.match(/^```(\w*)/);
                const lang = langMatch ? langMatch[1] : '';
                const codeLines = [];
                i++;
                while (i < lines.length && !/^```/.test(lines[i])) {
                    codeLines.push(escapeHtml(lines[i]));
                    i++;
                }
                const codeHtml = codeLines.join('\n');
                const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
                htmlParts.push(
                    `<div class="md-pre"><div class="md-pre-header">${langLabel}<span></span></div>` +
                    `<code class="lang-${lang || 'text'}">${codeHtml}</code></div>`
                );
                i++;
                continue;
            }

            /* ── Headings ── */
            if (/^######\s/.test(line)) {
                htmlParts.push(`<h6 class="md-h3">${renderInline(line.slice(7))}</h6>`);
            } else if (/^#####\s/.test(line)) {
                htmlParts.push(`<h5 class="md-h3">${renderInline(line.slice(6))}</h5>`);
            } else if (/^####\s/.test(line)) {
                htmlParts.push(`<h4 class="md-h3">${renderInline(line.slice(5))}</h4>`);
            } else if (/^###\s/.test(line)) {
                htmlParts.push(`<h3 class="md-h3">${renderInline(line.slice(4))}</h3>`);
            } else if (/^##\s/.test(line)) {
                htmlParts.push(`<h2 class="md-h2">${renderInline(line.slice(3))}</h2>`);
            } else if (/^#\s/.test(line)) {
                htmlParts.push(`<h1 class="md-h1">${renderInline(line.slice(2))}</h1>`);

            /* ── Horizontal rule ── */
            } else if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
                htmlParts.push('<hr class="md-hr">');

            /* ── Blockquote ── */
            } else if (/^>\s?/.test(line)) {
                const content = renderInline(line.replace(/^>\s?/, ''));
                htmlParts.push(`<blockquote class="md-blockquote">${content}</blockquote>`);

            /* ── Unordered list ── */
            } else if (/^[\-\*\+]\s/.test(line)) {
                const items = [];
                while (i < lines.length && /^[\-\*\+]\s/.test(lines[i])) {
                    items.push(`<li class="md-li">${renderInline(lines[i].slice(2))}</li>`);
                    i++;
                }
                htmlParts.push(`<ul class="md-ul">${items.join('')}</ul>`);
                continue;

            /* ── Ordered list ── */
            } else if (/^\d+\.\s/.test(line)) {
                const items = [];
                while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                    items.push(`<li class="md-li">${renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
                    i++;
                }
                htmlParts.push(`<ol class="md-ol">${items.join('')}</ol>`);
                continue;

            /* ── Empty line ── */
            } else if (line.trim() === '') {
                htmlParts.push('<br>');

            /* ── Paragraph ── */
            } else {
                htmlParts.push(`<p class="md-p">${renderInline(escapeHtml(line))}</p>`);
            }

            i++;
        }

        return htmlParts.join('\n');
    }

    /* ── Syntax highlight JSON ── */
    function highlightJSON(obj) {
        const json = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
        // Replace JSON tokens with coloured spans
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                function (match) {
                    let cls = 'json-number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'json-key';
                            // Remove trailing colon for display
                            return `<span class="${cls}">${escapeHtml(match.slice(0, -1))}</span>:`;
                        } else {
                            cls = 'json-string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'json-boolean';
                    } else if (/null/.test(match)) {
                        cls = 'json-null';
                    }
                    return `<span class="${cls}">${escapeHtml(match)}</span>`;
                })
            .replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');
    }

    /* Public API */
    return {
        render,
        highlightJSON,
        renderInline,
        escapeHtml
    };
}());
