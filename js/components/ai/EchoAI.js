/**
 * EchoAI.js
 * ECHO Bot — Predefined Q&A System
 * Provides curated, professional answers to common questions about the portfolio.
 */

import { eventBus } from '../../core/EventBus.js';
import { dataService } from '../../services/DataService.js';

class EchoAI {
  constructor() {
    this.BOT_NAME = 'ECHO Bot';
    this.THINK_DELAY = 600; // Delay before bot starts typing
    this.TYPE_SPEED = 12; // Milliseconds per character for typing effect

    this.container = null;
    this.qaData = [];
    this.busy = false;

    this.handleQuestionClick = this.handleQuestionClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  ts() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scroll() {
    if (this.container) {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        this.container.scrollTop = this.container.scrollHeight;
      });
    }
  }

  // ── DOM Helpers ───────────────────────────────────────────────────────────

  appendMsg(sender, html) {
    const wrap = document.createElement('div');
    wrap.className = `echo-msg echo-msg--${sender} echo-msg--entering`;

    wrap.innerHTML = `<div class="echo-msg-body">
  <div class="echo-msg-content">${html}</div>
  <div class="echo-msg-time">${this.ts()}</div>
</div>`;

    this.container.appendChild(wrap);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('echo-msg--entering')));
    this.scroll();
    return wrap.querySelector('.echo-msg-content');
  }

  showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'echo-msg echo-msg--bot echo-msg--typing echo-msg--entering';
    wrap.innerHTML = `<div class="echo-msg-body">
  <div class="echo-msg-content">
    <div class="echo-typing">
      <span></span><span></span><span></span>
    </div>
  </div>
</div>`;
    this.container.appendChild(wrap);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('echo-msg--entering')));
    this.scroll();
    return () => wrap.remove();
  }

  /**
   * Typewriter effect that preserves HTML tags.
   * It parses the HTML, hides all text content, appends the DOM structure,
   * and then reveals the text character by character.
   */
  async typeWriterHtml(element, htmlContent, speed) {
    element.innerHTML = htmlContent;

    // Find all text nodes that have content
    const textNodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      // Only animate non-empty text nodes
      if (text.trim() !== '') {
        textNodes.push({
          node: node,
          text: text,
          current: ''
        });
        node.nodeValue = ''; // hide initially
      }
    }

    // Add blinking cursor to the element
    const cursor = document.createElement('span');
    cursor.className = 'echo-cursor';
    element.appendChild(cursor);

    // Reveal text nodes character by character
    for (const tn of textNodes) {
      for (let i = 0; i < tn.text.length; i++) {
        tn.current += tn.text[i];
        tn.node.nodeValue = tn.current;

        // Keep cursor at the end, scroll down if needed
        this.scroll();

        // Small delay per character
        await new Promise(r => setTimeout(r, speed));
      }
    }

    // Remove cursor when done
    cursor.remove();
  }

  // ── Q&A Logic ─────────────────────────────────────────────────────────────

  renderWelcomeMenu() {
    const starterQuestions = [
      "Tell me about yourself.",
      "Why should we hire you?",
      "What technologies do you know?",
      "Which project should I explore first?",
      "What services do you offer?",
      "How can I contact you?"
    ];

    let menuHtml = `<p><strong>Hello!</strong> I'm <strong>${this.BOT_NAME}</strong>.</p>
<p>I'm here to help you quickly find the information you need. Please select a question below:</p>`;

    menuHtml += `<div class="echo-qa-category">
  <div class="echo-qa-list">
    ${starterQuestions.map(sq => {
      const found = this.qaData.find(q => q.question === sq);
      return found ? `<button class="echo-qa-btn" data-id="${found.id}">${sq}</button>` : '';
    }).join('')}
  </div>
</div>`;

    const el = this.appendMsg('bot', menuHtml);
    this.attachQuestionListeners(el);
    this.scroll();
  }

  attachQuestionListeners(el) {
    el.querySelectorAll('.echo-qa-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleQuestionClick(e.currentTarget.dataset.id));
    });

    el.querySelectorAll('.echo-back-btn').forEach(btn => {
      btn.addEventListener('click', this.handleBackClick);
    });
  }

  async handleQuestionClick(id) {
    if (this.busy) return;

    const qItem = this.qaData.find(q => q.id === id);
    if (!qItem) return;

    this.busy = true;

    // 1. Show user's question immediately
    this.appendMsg('user', `<p>${qItem.question}</p>`);

    // 2. Show bouncing typing indicator for realism
    const rm = this.showTyping();

    // 3. Wait for "thinking" delay
    await new Promise(r => setTimeout(r, this.THINK_DELAY));

    // Remove typing indicator
    rm();

    // 4. Create empty message bubble for bot
    const el = this.appendMsg('bot', '');

    // 5. Run HTML typewriter effect on the answer
    await this.typeWriterHtml(el, qItem.answer, this.TYPE_SPEED);

    // 6. Render related questions if any
    const related = (qItem.relatedQuestions || []).filter(rq => {
      return this.qaData.find(q => q.question === rq);
    });

    let followUpHtml = '';
    if (related.length > 0) {
      followUpHtml = `<div class="echo-related-section">
  <div class="echo-related-title">You might also ask:</div>
  <div class="echo-qa-list">
    ${related.map(rq => {
        const found = this.qaData.find(q => q.question === rq);
        return found ? `<button class="echo-qa-btn echo-qa-btn--small" data-id="${found.id}">${rq}</button>` : '';
      }).join('')}
  </div>
</div>`;
    }

    // 7. After typing finishes, append related questions
    if (followUpHtml) {
      el.insertAdjacentHTML('beforeend', followUpHtml);
      this.attachQuestionListeners(el);
    }

    this.scroll();
    this.busy = false;
  }

    handleBackClick() {
      if (this.busy) return;
      this.renderWelcomeMenu();
    }

    // ── HTML Render Template ──────────────────────────────────────────────

    render() {
      return `
<!-- Right Sidebar / ECHO Bot Panel -->
<aside id="right-sidebar" class="hidden" role="complementary" aria-label="ECHO Bot Q&A">
  <div id="echo-panel" class="panel-content active">

    <div class="echo-header">
      <div class="echo-header-left">
        <div class="echo-header-icon">
          <i class="fas fa-robot"></i>
        </div>
        <div class="echo-header-info">
          <span class="echo-header-name">ECHO Bot</span>
          <span class="echo-header-status">
            <span class="echo-status-dot"></span>
            Online
          </span>
        </div>
      </div>
      <div class="echo-header-actions">
        <button class="echo-action-btn" title="Reset Chat" id="clear-echo" aria-label="Reset Chat">
          <i class="fas fa-rotate-left"></i>
        </button>
        <button class="echo-action-btn" title="Close" id="close-echo" aria-label="Close ECHO Bot">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="echo-body">
      <!-- The entire area is now just for messages, no input box -->
      <div class="echo-messages" id="echo-messages" style="padding-bottom: 20px;"></div>
    </div>

  </div>
</aside>
`;
    }

    // ── Init ──────────────────────────────────────────────────────────────

    init() {
      this.container = document.getElementById('echo-messages');
      this.clearBtn = document.getElementById('clear-echo');

      if (!this.container) return;

      const allData = dataService.getData();
      this.qaData = allData?.echoQa || [];

      if (this.qaData.length > 0) {
        this.renderWelcomeMenu();
      } else {
        // Fallback if data fails to load
        this.appendMsg('bot', '<p>Sorry, I am unable to load my question database right now.</p>');
      }

      // Clear button resets to welcome menu
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', () => {
          if (this.busy) return;
          this.container.innerHTML = '';
          this.renderWelcomeMenu();
        });
      }

      // Close button
      document.getElementById('close-echo')?.addEventListener('click', () => {
        const sidebar = document.getElementById('right-sidebar');
        if (sidebar) sidebar.classList.add('hidden');
      });
    }
  }

  export const echoAI = new EchoAI();
