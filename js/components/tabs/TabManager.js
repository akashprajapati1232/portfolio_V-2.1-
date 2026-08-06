/**
 * TabManager.js
 * Manages the editor tab bar logic.
 * Reacts to EventBus events for opening and closing tabs.
 */

import { eventBus } from '../../core/EventBus.js';
import { dataService } from '../../services/DataService.js';
import { getFileIcon } from '../explorer/Explorer.js';

class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTab = null;
    }

    render() {
        return `
            <!-- Tabs Bar -->
            <div id="tabs-bar" role="tablist" aria-label="Open editor tabs">
                <div id="tabs-list"></div>
                <div class="tabs-overflow-btn" aria-label="More tabs">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>

            <!-- Editor Content Area -->
            <div id="editor-area" role="tabpanel" aria-label="Editor content">
                <!-- Breadcrumb -->
                <div id="breadcrumb" aria-label="Breadcrumb navigation">
                    <span class="bc-item bc-folder">about</span>
                    <span class="bc-separator"><i class="fas fa-chevron-right"></i></span>
                    <span class="bc-item bc-file" id="bc-current">README.md</span>
                </div>

                <!-- Line numbers + Editor -->
                <div id="editor-wrap">
                    <div id="line-numbers" aria-hidden="true"></div>
                    <div id="editor-content" role="document" aria-label="File content"></div>
                </div>
            </div>
        `;
    }

    init() {
        eventBus.on('file:open', this.open.bind(this));
        eventBus.on('file:close', this.close.bind(this));
    }

    open(fileName) {
        const existing = this.tabs.find(t => t.fileName === fileName);

        if (!existing) {
            this.tabs.push({ fileName, scrollY: 0 });
            this.renderTabs();
        }

        this.setActive(fileName);
    }

    close(fileName) {
        const idx = this.tabs.findIndex(t => t.fileName === fileName);
        if (idx === -1) return;

        this.tabs.splice(idx, 1);

        if (this.activeTab === fileName) {
            if (this.tabs.length > 0) {
                const nextIdx = Math.min(idx, this.tabs.length - 1);
                this.setActive(this.tabs[nextIdx].fileName);
            } else {
                this.activeTab = null;
                this.showEmptyTabs();
                eventBus.emit('file:closedAll', null);
            }
        } else {
            this.renderTabs();
        }
    }

    setActive(fileName) {
        if (this.activeTab === fileName) return;

        if (this.activeTab && this.activeTab !== fileName) {
            const prev = this.tabs.find(t => t.fileName === this.activeTab);
            const editorWrap = document.getElementById('editor-wrap');
            if (prev && editorWrap) {
                prev.scrollY = editorWrap.scrollTop;
            }
        }

        this.activeTab = fileName;
        this.renderTabs();

        eventBus.emit('file:switched', fileName);

        requestAnimationFrame(() => {
            const tab = this.tabs.find(t => t.fileName === fileName);
            const editorWrap = document.getElementById('editor-wrap');
            if (tab && editorWrap) {
                editorWrap.scrollTop = tab.scrollY || 0;
            }
        });
    }

    renderTabs() {
        const container = document.getElementById('tabs-list');
        if (!container) return;

        container.innerHTML = '';

        if (this.tabs.length === 0) {
            this.showEmptyTabs();
            return;
        }

        this.tabs.forEach(tab => {
            const el = this.createTabElement(tab.fileName, tab.fileName === this.activeTab);
            container.appendChild(el);
        });

        const activeEl = container.querySelector('.editor-tab.active');
        if (activeEl) {
            activeEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    createTabElement(fileName, isActive) {
        const iconUrl = getFileIcon(fileName);

        const tab = document.createElement('div');
        tab.className = `editor-tab${isActive ? ' active' : ''}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('aria-label', fileName);
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
        tab.setAttribute('data-file', fileName);
        tab.title = fileName;

        tab.innerHTML = `
            <img src="${iconUrl}" class="tab-icon" style="width:14px; height:14px; margin-right:6px;" alt="" />
            <span class="tab-label">${fileName}</span>
            <button class="tab-close" aria-label="Close ${fileName}" tabindex="-1">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.setActive(fileName);
            }
        });

        tab.addEventListener('mousedown', (e) => {
            if (e.button === 1) {
                e.preventDefault();
                eventBus.emit('file:close', fileName);
            }
        });

        const closeBtn = tab.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            eventBus.emit('file:close', fileName);
        });

        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.setActive(fileName);
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                eventBus.emit('file:close', fileName);
            }
        });

        return tab;
    }

    showEmptyTabs() {
        const container = document.getElementById('tabs-list');
        if (!container) return;
        container.innerHTML = `
            <div class="tabs-hint">
                <i class="fas fa-hand-pointer" aria-hidden="true"></i>
                <span>Click a file to open it</span>
            </div>`;
    }

    getActive() {
        return this.activeTab;
    }

    getTabs() {
        return [...this.tabs];
    }
}

export const tabManager = new TabManager();
