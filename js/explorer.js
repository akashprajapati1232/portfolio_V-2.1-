/**
 * explorer.js
 * Manages the sidebar file explorer: folder expand/collapse,
 * active file highlighting, keyboard navigation.
 */

window.Explorer = (function () {
    'use strict';

    let _onFileOpen = null;   // callback when a file is clicked
    let _currentFile = null;  // currently active file

    /* ── Initialize explorer ── */
    function init(onFileOpen) {
        _onFileOpen = onFileOpen;

        // Attach events to all file items
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', _handleFileClick);
            item.addEventListener('keydown', _handleFileKeydown);
        });

        // Attach events to all folder items
        const folderItems = document.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.addEventListener('click', _handleFolderClick);
            item.addEventListener('keydown', _handleFolderKeydown);
        });

        // Collapse all button
        const collapseBtn = document.getElementById('collapse-all-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', collapseAll);
        }

        // Activity bar panel switching
        const activityBtns = document.querySelectorAll('.activity-btn[data-panel]');
        activityBtns.forEach(btn => {
            btn.addEventListener('click', _handleActivityClick);
        });
    }

    /* ── File click handler ── */
    function _handleFileClick(e) {
        e.stopPropagation();
        const fileName = this.getAttribute('data-file');
        if (fileName) {
            setActiveFile(fileName);
            if (_onFileOpen) _onFileOpen(fileName);
        }
    }

    /* ── File keyboard handler (Enter / Space to open) ── */
    function _handleFileKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            _handleFileClick.call(this, e);
        }
    }

    /* ── Folder click: toggle expand/collapse ── */
    function _handleFolderClick(e) {
        e.stopPropagation();
        const folderName = this.getAttribute('data-folder');
        const isExpanded = this.classList.contains('expanded');

        if (isExpanded) {
            _collapseFolder(this, folderName);
        } else {
            _expandFolder(this, folderName);
        }
    }

    /* ── Folder keyboard ── */
    function _handleFolderKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            _handleFolderClick.call(this, e);
        }
        // Arrow right: expand if collapsed
        if (e.key === 'ArrowRight') {
            if (!this.classList.contains('expanded')) {
                _handleFolderClick.call(this, e);
            }
        }
        // Arrow left: collapse if expanded
        if (e.key === 'ArrowLeft') {
            if (this.classList.contains('expanded')) {
                _handleFolderClick.call(this, e);
            }
        }
    }

    /* ── Expand a folder ── */
    function _expandFolder(folderItem, folderName) {
        folderItem.classList.add('expanded');
        folderItem.classList.remove('collapsed');
        folderItem.setAttribute('aria-expanded', 'true');

        // Change icon to open folder
        const icon = folderItem.querySelector('.tree-icon');
        if (icon) {
            icon.classList.remove('fa-folder');
            icon.classList.add('fa-folder-open');
        }

        // Show children
        const children = document.querySelector(`.folder-children[data-parent="${folderName}"]`);
        if (children) {
            children.classList.remove('collapsed');
        }
    }

    /* ── Collapse a folder ── */
    function _collapseFolder(folderItem, folderName) {
        folderItem.classList.remove('expanded');
        folderItem.classList.add('collapsed');
        folderItem.setAttribute('aria-expanded', 'false');

        // Change icon to closed folder
        const icon = folderItem.querySelector('.tree-icon');
        if (icon) {
            icon.classList.remove('fa-folder-open');
            icon.classList.add('fa-folder');
        }

        // Hide children
        const children = document.querySelector(`.folder-children[data-parent="${folderName}"]`);
        if (children) {
            children.classList.add('collapsed');
        }
    }

    /* ── Collapse all folders ── */
    function collapseAll() {
        const folderItems = document.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            const folderName = item.getAttribute('data-folder');
            if (folderName) {
                _collapseFolder(item, folderName);
            }
        });
    }

    /* ── Set the active file highlight ── */
    function setActiveFile(fileName) {
        _currentFile = fileName;

        // Remove active from all
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active-file');
            item.removeAttribute('aria-selected');
        });

        // Set active on current
        const activeItem = document.querySelector(`.file-item[data-file="${fileName}"]`);
        if (activeItem) {
            activeItem.classList.add('active-file');
            activeItem.setAttribute('aria-selected', 'true');

            // Ensure parent folder is expanded
            const folderChildren = activeItem.closest('.folder-children');
            if (folderChildren) {
                const folderName = folderChildren.getAttribute('data-parent');
                const folderItem = document.querySelector(`.folder-item[data-folder="${folderName}"]`);
                if (folderItem && !folderItem.classList.contains('expanded')) {
                    _expandFolder(folderItem, folderName);
                }
            }
        }
    }

    /* ── Activity bar panel switching ── */
    function _handleActivityClick() {
        const panelId = this.getAttribute('data-panel');
        const sidebar = document.getElementById('sidebar');

        // Toggle sidebar if same panel clicked again
        const wasActive = this.classList.contains('active');

        // Remove active from all buttons
        document.querySelectorAll('.activity-btn[data-panel]').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        // Hide all panels
        document.querySelectorAll('.panel-content').forEach(panel => {
            panel.classList.remove('active');
        });

        if (wasActive) {
            // Toggle sidebar off
            sidebar.classList.add('collapsed');
        } else {
            // Activate new panel
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            sidebar.classList.remove('collapsed');
            const panel = document.getElementById(panelId + '-panel');
            if (panel) {
                panel.classList.add('active');
            }
        }
    }

    /* Get current active file name */
    function getActiveFile() {
        return _currentFile;
    }

    return { init, setActiveFile, getActiveFile, collapseAll };
}());
