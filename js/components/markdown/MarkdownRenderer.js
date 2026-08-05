/**
 * MarkdownRenderer.js
 * A lightweight, custom Markdown renderer that produces Personal–styled HTML.
 * Converted to an ES6 Module.
 */

class MarkdownRenderer {
    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    renderInline(text) {
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>');
        text = text.replace(/__(.+?)__/g, '<strong class="md-bold">$1</strong>');
        text = text.replace(/\*(.+?)\*/g, '<em class="md-italic">$1</em>');
        text = text.replace(/_(.+?)_/g, '<em class="md-italic">$1</em>');
        text = text.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
            const safeHref = this.escapeHtml(href);
            const external = safeHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${safeHref}" class="md-link"${external}>${label}</a>`;
        });
        return text;
    }

    render(markdown) {
        const lines = markdown.split('\n');
        const htmlParts = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (/^```/.test(line)) {
                const langMatch = line.match(/^```(\w*)/);
                const lang = langMatch ? langMatch[1] : '';
                const codeLines = [];
                i++;
                while (i < lines.length && !/^```/.test(lines[i])) {
                    codeLines.push(this.escapeHtml(lines[i]));
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

            if (/^######\s/.test(line)) {
                htmlParts.push(`<h6 class="md-h3">${this.renderInline(line.slice(7))}</h6>`);
            } else if (/^#####\s/.test(line)) {
                htmlParts.push(`<h5 class="md-h3">${this.renderInline(line.slice(6))}</h5>`);
            } else if (/^####\s/.test(line)) {
                htmlParts.push(`<h4 class="md-h3">${this.renderInline(line.slice(5))}</h4>`);
            } else if (/^###\s/.test(line)) {
                htmlParts.push(`<h3 class="md-h3">${this.renderInline(line.slice(4))}</h3>`);
            } else if (/^##\s/.test(line)) {
                htmlParts.push(`<h2 class="md-h2">${this.renderInline(line.slice(3))}</h2>`);
            } else if (/^#\s/.test(line)) {
                htmlParts.push(`<h1 class="md-h1">${this.renderInline(line.slice(2))}</h1>`);
            } else if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
                htmlParts.push('<hr class="md-hr">');
            } else if (/^>\s?/.test(line)) {
                const content = this.renderInline(line.replace(/^>\s?/, ''));
                htmlParts.push(`<blockquote class="md-blockquote">${content}</blockquote>`);
            } else if (/^[\-\*\+]\s/.test(line)) {
                const items = [];
                while (i < lines.length && /^[\-\*\+]\s/.test(lines[i])) {
                    items.push(`<li class="md-li">${this.renderInline(lines[i].slice(2))}</li>`);
                    i++;
                }
                htmlParts.push(`<ul class="md-ul">${items.join('')}</ul>`);
                continue;
            } else if (/^\d+\.\s/.test(line)) {
                const items = [];
                while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                    items.push(`<li class="md-li">${this.renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
                    i++;
                }
                htmlParts.push(`<ol class="md-ol">${items.join('')}</ol>`);
                continue;
            } else if (line.trim() === '') {
                htmlParts.push('<br>');
            } else {
                htmlParts.push(`<p class="md-p">${this.renderInline(this.escapeHtml(line))}</p>`);
            }
            i++;
        }
        return htmlParts.join('\n');
    }

    highlightJSON(obj) {
        const json = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                    let cls = 'json-number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'json-key';
                            return `<span class="${cls}">${this.escapeHtml(match.slice(0, -1))}</span>:`;
                        } else {
                            cls = 'json-string';
                            const strVal = match.slice(1, -1);
                            if (/^https?:\/\//.test(strVal)) {
                                return `<span class="${cls}">"<a href="${strVal}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${this.escapeHtml(strVal)}</a>"</span>`;
                            } else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(strVal)) {
                                return `<span class="${cls}">"<a href="mailto:${strVal}" style="color: inherit; text-decoration: underline;">${this.escapeHtml(strVal)}</a>"</span>`;
                            }
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'json-boolean';
                    } else if (/null/.test(match)) {
                        cls = 'json-null';
                    }
                    return `<span class="${cls}">${this.escapeHtml(match)}</span>`;
                })
            .replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');
    }
}

export const markdownRenderer = new MarkdownRenderer();
