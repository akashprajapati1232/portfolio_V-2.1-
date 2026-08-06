/**
 * Explorer.js
 * Manages the sidebar file explorer as an ES6 Module.
 * Integrates with EventBus to broadcast file open events.
 */

import { eventBus } from '../../core/EventBus.js';

// ── File-type icon map ────────────────────────────────────────────────────────
// Maps a file extension (or exact name) to its VS Code–style icon class + color.
// Uses Material-style icon naming aligned with Font Awesome 6.
const FILE_ICON_MAP = {
    // Extension-based
    'json':   { cls: 'fas fa-file-code',   color: '#cbcb41' },  // JSON: yellow
    'md':     { cls: 'fas fa-file-alt',    color: '#519aba' },  // Markdown: blue
    'txt':    { cls: 'fas fa-file-lines',  color: '#8a8a8a' },  // Text: gray
    'js':     { cls: 'fas fa-file-code',   color: '#e5c07b' },  // JS: amber
    'ts':     { cls: 'fas fa-file-code',   color: '#3178c6' },  // TS: blue
    'tsx':    { cls: 'fas fa-file-code',   color: '#61afef' },  // TSX: cyan
    'html':   { cls: 'fas fa-file-code',   color: '#e06c75' },  // HTML: red
    'css':    { cls: 'fas fa-file-code',   color: '#61afef' },  // CSS: light-blue
    'yaml':   { cls: 'fas fa-file-code',   color: '#6a9955' },  // YAML: green
    'xml':    { cls: 'fas fa-file-code',   color: '#e8b67a' },  // XML: orange
    'py':     { cls: 'fas fa-file-code',   color: '#4ec9b0' },  // Python: teal
    'png':    { cls: 'fas fa-file-image',  color: '#a074c4' },  // PNG: purple
    'jpg':    { cls: 'fas fa-file-image',  color: '#a074c4' },  // JPG: purple
    'jpeg':   { cls: 'fas fa-file-image',  color: '#a074c4' },  // JPEG: purple
    // Fallback
    'default': { cls: 'fas fa-file',       color: '#8a8a8a' }
};

function getFileIcon(fileName) {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    return FILE_ICON_MAP[ext] || FILE_ICON_MAP['default'];
}

// ── Tree structure definition ─────────────────────────────────────────────────
// Mirrors the actual data/ directory structure on disk.
// 'key' is the unique identifier emitted on 'file:open' to open the editor pane.
const TREE = [
    {
        type: 'folder', name: 'About', id: 'profile',
        children: [
            { type: 'file', name: 'README.md',       key: 'README.md'       },
            { type: 'file', name: 'profile.json',    key: 'profile.json'    },
            { type: 'file', name: 'socials.yml',     key: 'socials.yml'     },
        ]
    },
    {
        type: 'folder', name: 'Education', id: 'education',
        children: [
            { type: 'file', name: 'education.json',      key: 'education.json'      },
            { type: 'file', name: 'certifications.tsx',  key: 'certifications.tsx'  },
        ]
    },
    {
        type: 'folder', name: 'Experience', id: 'experience',
        children: [
            { type: 'file', name: 'experience.xml', key: 'experience.json' },
        ]
    },
    {
        type: 'folder', name: 'Skills', id: 'skills',
        children: [
            { type: 'file', name: 'tech-stack.tsx', key: 'tech-stack.tsx' },
        ]
    },
    {
        type: 'folder', name: 'Services', id: 'services',
        children: [
            { type: 'file', name: 'services.ts', key: 'services.ts' },
        ]
    },
    {
        type: 'folder', name: 'Achievements', id: 'achievements',
        children: [
            { type: 'file', name: 'achievements.xml', key: 'achievements.xml' },
        ]
    },
    {
        type: 'folder', name: 'Projects', id: 'projects',
        children: [
            {
                type: 'folder', name: 'production', id: 'projects-production',
                children: [
                    { type: 'file', name: 'project-01.imgNinja',            key: 'imgninja.json'               },
                    { type: 'file', name: 'project-02.bitBot',              key: 'bitbot-college-chatbot.json' },
                    { type: 'file', name: 'project-03.brandifyCreator',     key: 'brandify-creator.json'       },
                    { type: 'file', name: 'project-04.totalSolution',       key: 'total-solution.json'         },
                    { type: 'file', name: 'project-05.GPTforBCA',           key: 'gpt-for-bca.json'            },
                    { type: 'file', name: 'project-06.rozgarSeva',          key: 'rozgarsetu.json'             },
                    { type: 'file', name: 'project-07.scaleIQ',             key: 'scaleiq.json'                },
                    { type: 'file', name: 'project-08.portfolio (v2.0)',    key: 'portfolio-v2.json'           },
                ]
            },
            {
                type: 'folder', name: 'micro', id: 'projects-micro',
                children: [
                    { type: 'file', name: 'projects-micro.json', key: 'projects-micro.json' },
                ]
            },
        ]
    },
    {
        type: 'file', name: 'LICENSE.txt', key: 'LICENSE.txt'
    },
    {
        type: 'folder', name: 'config', id: 'config',
        children: [
            { type: 'file', name: 'settings.yml', key: 'settings.yml' }
        ]
    }
];

// ── HTML generators ────────────────────────────────────────────────────────────

function renderFile(node, depth = 1) {
    const icon = getFileIcon(node.name);
    const indent = depth * 16;
    return `
        <div class="tree-item file-item" data-file="${node.key}"
            role="treeitem" aria-label="${node.name}" tabindex="0"
            style="padding-left:${indent + 8}px">
            <span class="tree-arrow" aria-hidden="true"></span>
            <i class="${icon.cls} tree-icon" style="color:${icon.color}; width:16px; text-align:center; flex-shrink:0; font-size:14px;"></i>
            <span class="tree-label">${node.name}</span>
        </div>`;
}

function renderFolder(node, depth = 1) {
    const indent = depth * 16;
    const childrenHtml = (node.children || [])
        .map(child => child.type === 'folder'
            ? renderFolder(child, depth + 1)
            : renderFile(child, depth + 1))
        .join('');

    return `
        <div class="tree-item folder-item expanded" data-type="folder" data-folder="${node.id}"
            role="treeitem" aria-expanded="true" aria-label="${node.name} folder" tabindex="0"
            style="padding-left:${indent}px">
            <span class="tree-arrow"><i class="fas fa-chevron-down" aria-hidden="true"></i></span>
            <i class="fas fa-folder-open tree-icon folder-icon" aria-hidden="true"></i>
            <span class="tree-label">${node.name}</span>
        </div>
        <div class="tree-children folder-children" data-parent="${node.id}">
            ${childrenHtml}
        </div>`;
}

function renderTree() {
    return TREE.map(node =>
        node.type === 'folder' ? renderFolder(node, 1) : renderFile(node, 0)
    ).join('\n');
}

// ── Explorer component ─────────────────────────────────────────────────────────

class Explorer {
    constructor() {
        this.currentFile = null;
    }

    render() {
        return `
            <!-- Sidebar / Explorer Panel -->
            <aside id="sidebar" class="collapsed" role="complementary" aria-label="Explorer sidebar">
                <div id="explorer-panel" class="panel-content active">
                    <div class="sidebar-header">
                        <span class="sidebar-title">EXPLORER</span>
                        <div class="sidebar-actions">
                            <button class="sidebar-action-btn" title="New File" aria-label="New File">
                                <i class="fas fa-file-medical" aria-hidden="true"></i>
                            </button>
                            <button class="sidebar-action-btn" title="New Folder" aria-label="New Folder">
                                <i class="fas fa-folder-plus" aria-hidden="true"></i>
                            </button>
                            <button class="sidebar-action-btn" title="Refresh Explorer" aria-label="Refresh">
                                <i class="fas fa-rotate-right" aria-hidden="true"></i>
                            </button>
                            <button class="sidebar-action-btn" id="collapse-all-btn" title="Collapse All" aria-label="Collapse All">
                                <i class="fas fa-compress-alt" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <!-- File Tree -->
                    <div class="file-tree" id="file-tree" role="tree" aria-label="File explorer">
                        <div class="workspace-root">

                            <!-- Root workspace label -->
                            <div class="tree-item root-item" data-type="folder" role="treeitem"
                                aria-label="portfolio-akash workspace">
                                <span class="tree-arrow"><i class="fas fa-chevron-down" aria-hidden="true"></i></span>
                                <span class="tree-label">PORTFOLIO-AKASH</span>
                            </div>

                            <!-- Dynamic file tree -->
                            <div class="tree-children" id="tree-root-children">
                                ${renderTree()}
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Search Panel (static) -->
                <div id="search-panel" class="panel-content">
                    <div class="sidebar-header">
                        <span class="sidebar-title">SEARCH</span>
                    </div>
                    <div class="static-panel-msg">
                        <i class="fas fa-search" aria-hidden="true"></i>
                        <p>Search functionality</p>
                        <small>Use Explorer to navigate files</small>
                    </div>
                </div>

                <!-- Git Panel (static) -->
                <div id="git-panel" class="panel-content">
                    <div class="sidebar-header">
                        <span class="sidebar-title">SOURCE CONTROL</span>
                    </div>
                    <div class="static-panel-msg">
                        <i class="fas fa-code-branch" aria-hidden="true"></i>
                        <p>No changes</p>
                        <small>main branch</small>
                    </div>
                </div>

                <!-- Run Panel (static) -->
                <div id="run-panel" class="panel-content">
                    <div class="sidebar-header">
                        <span class="sidebar-title">RUN AND DEBUG</span>
                    </div>
                    <div class="static-panel-msg">
                        <i class="fas fa-play-circle" aria-hidden="true"></i>
                        <p>Run and Debug</p>
                        <small>No configurations</small>
                    </div>
                </div>

                <!-- Extensions Panel (static) -->
                <div id="extensions-panel" class="panel-content">
                    <div class="sidebar-header">
                        <span class="sidebar-title">EXTENSIONS</span>
                    </div>
                    <div class="extensions-list">
                        <div class="ext-item">
                            <div class="ext-icon ext-blue"><i class="fab fa-js"></i></div>
                            <div class="ext-info">
                                <span class="ext-name">JavaScript</span>
                                <span class="ext-publisher">Microsoft</span>
                            </div>
                            <span class="ext-badge installed">✓</span>
                        </div>
                        <div class="ext-item">
                            <div class="ext-icon ext-orange"><i class="fab fa-html5"></i></div>
                            <div class="ext-info">
                                <span class="ext-name">HTML5</span>
                                <span class="ext-publisher">Microsoft</span>
                            </div>
                            <span class="ext-badge installed">✓</span>
                        </div>
                        <div class="ext-item">
                            <div class="ext-icon ext-green"><i class="fab fa-python"></i></div>
                            <div class="ext-info">
                                <span class="ext-name">Python</span>
                                <span class="ext-publisher">Microsoft</span>
                            </div>
                            <span class="ext-badge installed">✓</span>
                        </div>
                        <div class="ext-item">
                            <div class="ext-icon ext-purple"><i class="fab fa-react"></i></div>
                            <div class="ext-info">
                                <span class="ext-name">React Snippets</span>
                                <span class="ext-publisher">dsznajder</span>
                            </div>
                            <span class="ext-badge installed">✓</span>
                        </div>
                        <div class="ext-item">
                            <div class="ext-icon ext-yellow"><i class="fas fa-palette"></i></div>
                            <div class="ext-info">
                                <span class="ext-name">Prettier</span>
                                <span class="ext-publisher">Prettier</span>
                            </div>
                            <span class="ext-badge installed">✓</span>
                        </div>
                        <div class="ext-item">
                            <div class="ext-icon ext-red"><i class="fas fa-code"></i></div>
                            <div class="ext-info">
                                <span class="ext-name">GitLens</span>
                                <span class="ext-publisher">GitKraken</span>
                            </div>
                            <span class="ext-badge installed">✓</span>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    }

    init() {
        // Attach click / keyboard handlers to all rendered file items
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', this.handleFileClick.bind(this));
            item.addEventListener('keydown', this.handleFileKeydown.bind(this));
        });

        // Attach expand/collapse to folder items
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', this.handleFolderClick.bind(this));
            item.addEventListener('keydown', this.handleFolderKeydown.bind(this));
        });

        // "Collapse All" toolbar button
        const collapseBtn = document.getElementById('collapse-all-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', this.collapseAll.bind(this));
        }

        // Activity bar buttons switch sidebar panels
        document.querySelectorAll('.activity-btn[data-panel]').forEach(btn => {
            btn.addEventListener('click', this.handleActivityClick.bind(this));
        });

        // Keep explorer highlight in sync with tab manager
        eventBus.on('file:switched', this.setActiveFile.bind(this));
        eventBus.on('file:closedAll', () => this.setActiveFile(null));
    }

    // ── Event handlers ──────────────────────────────────────────────────────

    handleFileClick(e) {
        e.stopPropagation();
        const item = e.currentTarget;
        const fileName = item.getAttribute('data-file');
        if (fileName) {
            eventBus.emit('file:open', fileName);
        }
    }

    handleFileKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleFileClick(e);
        }
    }

    handleFolderClick(e) {
        e.stopPropagation();
        const item = e.currentTarget;
        const folderName = item.getAttribute('data-folder');
        if (item.classList.contains('expanded')) {
            this.collapseFolder(item, folderName);
        } else {
            this.expandFolder(item, folderName);
        }
    }

    handleFolderKeydown(e) {
        const item = e.currentTarget;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleFolderClick(e);
        }
        if (e.key === 'ArrowRight' && !item.classList.contains('expanded')) {
            this.handleFolderClick(e);
        }
        if (e.key === 'ArrowLeft' && item.classList.contains('expanded')) {
            this.handleFolderClick(e);
        }
    }

    // ── Expand / Collapse ───────────────────────────────────────────────────

    expandFolder(folderItem, folderName) {
        folderItem.classList.add('expanded');
        folderItem.classList.remove('collapsed');
        folderItem.setAttribute('aria-expanded', 'true');

        const icon = folderItem.querySelector('.folder-icon');
        if (icon) {
            icon.classList.remove('fa-folder');
            icon.classList.add('fa-folder-open');
        }

        const children = document.querySelector(`.folder-children[data-parent="${folderName}"]`);
        if (children) children.classList.remove('collapsed');
    }

    collapseFolder(folderItem, folderName) {
        folderItem.classList.remove('expanded');
        folderItem.classList.add('collapsed');
        folderItem.setAttribute('aria-expanded', 'false');

        const icon = folderItem.querySelector('.folder-icon');
        if (icon) {
            icon.classList.remove('fa-folder-open');
            icon.classList.add('fa-folder');
        }

        const children = document.querySelector(`.folder-children[data-parent="${folderName}"]`);
        if (children) children.classList.add('collapsed');
    }

    collapseAll() {
        document.querySelectorAll('.folder-item').forEach(item => {
            const folderName = item.getAttribute('data-folder');
            if (folderName) this.collapseFolder(item, folderName);
        });
    }

    // ── Active file highlight ───────────────────────────────────────────────

    setActiveFile(fileName) {
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active-file');
            item.removeAttribute('aria-selected');
        });

        if (!fileName) {
            this.currentFile = null;
            return;
        }

        this.currentFile = fileName;
        const activeItem = document.querySelector(`.file-item[data-file="${fileName}"]`);
        if (activeItem) {
            activeItem.classList.add('active-file');
            activeItem.setAttribute('aria-selected', 'true');

            // Auto-expand parent folder if collapsed
            const folderChildren = activeItem.closest('.folder-children');
            if (folderChildren) {
                const folderName = folderChildren.getAttribute('data-parent');
                const folderItem = document.querySelector(`.folder-item[data-folder="${folderName}"]`);
                if (folderItem && !folderItem.classList.contains('expanded')) {
                    this.expandFolder(folderItem, folderName);
                }
            }
        }
    }

    // ── Activity bar switching ──────────────────────────────────────────────

    handleActivityClick(e) {
        const btn = e.currentTarget;
        const panelId = btn.getAttribute('data-panel');
        if (!panelId) return;

        const sidebar = document.getElementById('sidebar');
        const wasActive = btn.classList.contains('active');

        document.querySelectorAll('.activity-btn[data-panel]').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });

        document.querySelectorAll('#sidebar .panel-content').forEach(panel => {
            panel.classList.remove('active');
        });

        if (wasActive) {
            sidebar.classList.add('collapsed');
        } else {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            sidebar.classList.remove('collapsed');
            const panel = document.getElementById(panelId + '-panel');
            if (panel) {
                panel.classList.add('active');
            } else {
                const explorerPanel = document.getElementById('explorer-panel');
                if (explorerPanel) explorerPanel.classList.add('active');
            }
        }
    }

    getActiveFile() {
        return this.currentFile;
    }
}

export const explorer = new Explorer();
