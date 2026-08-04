/**
 * tabs.js
 * Manages the editor tab bar:
 * - Open tabs (without duplicates)
 * - Switch between tabs
 * - Close tabs (with wrapping selection)
 * - Preserve scroll position per tab
 */

window.TabManager = (function () {
    'use strict';

    /* State */
    const _tabs = [];          // Array of { fileName, scrollY }
    let _activeTab = null;     // Current active file name
    let _onTabSwitch = null;   // Callback: (fileName) => void
    let _onTabClose  = null;   // Callback: (fileName) => void — inform app that content should be cleared

    /* ── Initialize ── */
    function init(onTabSwitch, onTabClose) {
        _onTabSwitch = onTabSwitch;
        _onTabClose  = onTabClose;
    }

    /* ── Open or activate a tab ── */
    function open(fileName) {
        const existing = _tabs.find(t => t.fileName === fileName);

        if (!existing) {
            // New tab
            _tabs.push({ fileName, scrollY: 0 });
            _renderTabs();
        }

        _setActive(fileName);
    }

    /* ── Close a tab ── */
    function close(fileName) {
        const idx = _tabs.findIndex(t => t.fileName === fileName);
        if (idx === -1) return;

        _tabs.splice(idx, 1);

        if (_activeTab === fileName) {
            // Activate adjacent tab
            if (_tabs.length > 0) {
                const nextIdx = Math.min(idx, _tabs.length - 1);
                _setActive(_tabs[nextIdx].fileName);
            } else {
                _activeTab = null;
                _showEmptyTabs();
                if (_onTabClose) _onTabClose(null);
            }
        }

        _renderTabs();
    }

    /* ── Set active tab ── */
    function _setActive(fileName) {
        if (_activeTab === fileName) return; // Prevent infinite recursion

        // Save scroll position of previous active tab
        if (_activeTab && _activeTab !== fileName) {
            const prev = _tabs.find(t => t.fileName === _activeTab);
            const editorWrap = document.getElementById('editor-wrap');
            if (prev && editorWrap) {
                prev.scrollY = editorWrap.scrollTop;
            }
        }

        _activeTab = fileName;
        _renderTabs();

        if (_onTabSwitch) _onTabSwitch(fileName);

        // Restore scroll position
        requestAnimationFrame(() => {
            const tab = _tabs.find(t => t.fileName === fileName);
            const editorWrap = document.getElementById('editor-wrap');
            if (tab && editorWrap) {
                editorWrap.scrollTop = tab.scrollY || 0;
            }
        });
    }

    /* ── Build and render tabs ── */
    function _renderTabs() {
        const container = document.getElementById('tabs-list');
        if (!container) return;

        container.innerHTML = '';

        if (_tabs.length === 0) {
            _showEmptyTabs();
            return;
        }

        _tabs.forEach(tab => {
            const el = _createTabElement(tab.fileName, tab.fileName === _activeTab);
            container.appendChild(el);
        });

        // Scroll active tab into view
        const activeEl = container.querySelector('.editor-tab.active');
        if (activeEl) {
            activeEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    /* ── Create a single tab DOM element ── */
    function _createTabElement(fileName, isActive) {
        const fileInfo = (window.FILE_REGISTRY || {})[fileName] || {};
        const iconClass = fileInfo.icon || 'fas fa-file';
        const iconColor = fileInfo.iconColor || '#9d9d9d';

        const tab = document.createElement('div');
        tab.className = `editor-tab${isActive ? ' active' : ''}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('aria-label', fileName);
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
        tab.setAttribute('data-file', fileName);
        tab.title = fileName;

        tab.innerHTML = `
            <i class="${iconClass} tab-icon" style="color:${iconColor};" aria-hidden="true"></i>
            <span class="tab-label">${fileName}</span>
            <button class="tab-close" aria-label="Close ${fileName}" tabindex="-1">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        // Click tab body → activate
        tab.addEventListener('click', function (e) {
            if (!e.target.closest('.tab-close')) {
                _setActive(fileName);
            }
        });

        // Middle-click → close
        tab.addEventListener('mousedown', function (e) {
            if (e.button === 1) {
                e.preventDefault();
                close(fileName);
            }
        });

        // Close button
        const closeBtn = tab.querySelector('.tab-close');
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            close(fileName);
        });

        // Keyboard navigation on tab
        tab.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                _setActive(fileName);
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                close(fileName);
            }
        });

        return tab;
    }

    /* ── Show hint when no tabs open ── */
    function _showEmptyTabs() {
        const container = document.getElementById('tabs-list');
        if (!container) return;
        container.innerHTML = `
            <div class="tabs-hint">
                <i class="fas fa-hand-pointer" aria-hidden="true"></i>
                <span>Click a file to open it</span>
            </div>`;
    }

    /* Get active tab file name */
    function getActive() {
        return _activeTab;
    }

    /* Get all open tabs */
    function getTabs() {
        return [..._tabs];
    }

    return { init, open, close, getActive, getTabs };
}());
