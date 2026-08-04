/**
 * Explorer.js
 * Manages the sidebar file explorer as an ES6 Module.
 * Integrates with EventBus to broadcast file open events.
 */

import { eventBus } from '../../core/EventBus.js';

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
                            <button class="sidebar-action-btn" title="New File" aria-label="New File"><i
                                    class="fas fa-file-plus"></i></button>
                            <button class="sidebar-action-btn" title="New Folder" aria-label="New Folder"><i
                                    class="fas fa-folder-plus"></i></button>
                            <button class="sidebar-action-btn" title="Refresh" aria-label="Refresh"><i
                                    class="fas fa-sync-alt"></i></button>
                            <button class="sidebar-action-btn" title="Collapse All" id="collapse-all-btn"
                                aria-label="Collapse All"><i class="fas fa-compress-alt"></i></button>
                        </div>
                    </div>

                    <!-- File Tree -->
                    <div class="file-tree" id="file-tree" role="tree" aria-label="File explorer">
                        <div class="workspace-root">
                            <div class="tree-item root-item expanded" data-type="folder" role="treeitem"
                                aria-expanded="true" aria-label="portfolio-akash folder">
                                <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                <i class="fas fa-folder-open tree-icon folder-icon"></i>
                                <span class="tree-label">PORTFOLIO-AKASH</span>
                            </div>

                            <div class="tree-children">
                                <!-- about/ folder -->
                                <div class="tree-item folder-item expanded" data-type="folder" data-folder="about"
                                    role="treeitem" aria-expanded="true" aria-label="about folder" tabindex="0">
                                    <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                    <i class="fas fa-folder-open tree-icon folder-icon" style="color: #e8c764;"></i>
                                    <span class="tree-label">about</span>
                                </div>
                                <div class="tree-children folder-children" data-parent="about">
                                    <div class="tree-item file-item" data-file="profile.json" data-lang="json"
                                        role="treeitem" aria-label="profile.json" tabindex="0">
                                        <i class="fas fa-file-code tree-icon" style="color: #cbcb41;"></i>
                                        <span class="tree-label">profile.json</span>
                                    </div>
                                </div>

                                <!-- projects/ folder -->
                                <div class="tree-item folder-item expanded" data-type="folder" data-folder="projects"
                                    role="treeitem" aria-expanded="true" aria-label="projects folder" tabindex="0">
                                    <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                    <i class="fas fa-folder-open tree-icon folder-icon" style="color: #e8c764;"></i>
                                    <span class="tree-label">projects</span>
                                </div>
                                <div class="tree-children folder-children" data-parent="projects">
                                    <div class="tree-item file-item" data-file="projects.md" data-lang="markdown"
                                        role="treeitem" aria-label="projects.md" tabindex="0">
                                        <i class="fas fa-file-alt tree-icon" style="color: #519aba;"></i>
                                        <span class="tree-label">projects.md</span>
                                    </div>
                                </div>

                                <!-- skills/ folder -->
                                <div class="tree-item folder-item expanded" data-type="folder" data-folder="skills"
                                    role="treeitem" aria-expanded="true" aria-label="skills folder" tabindex="0">
                                    <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                    <i class="fas fa-folder-open tree-icon folder-icon" style="color: #e8c764;"></i>
                                    <span class="tree-label">skills</span>
                                </div>
                                <div class="tree-children folder-children" data-parent="skills">
                                    <div class="tree-item file-item" data-file="skills.md" data-lang="markdown"
                                        role="treeitem" aria-label="skills.md" tabindex="0">
                                        <i class="fas fa-file-alt tree-icon" style="color: #519aba;"></i>
                                        <span class="tree-label">skills.md</span>
                                    </div>
                                </div>

                                <!-- experience/ folder -->
                                <div class="tree-item folder-item expanded" data-type="folder" data-folder="experience"
                                    role="treeitem" aria-expanded="true" aria-label="experience folder" tabindex="0">
                                    <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                    <i class="fas fa-folder-open tree-icon folder-icon" style="color: #e8c764;"></i>
                                    <span class="tree-label">experience</span>
                                </div>
                                <div class="tree-children folder-children" data-parent="experience">
                                    <div class="tree-item file-item" data-file="work.md" data-lang="markdown"
                                        role="treeitem" aria-label="work.md" tabindex="0">
                                        <i class="fas fa-file-alt tree-icon" style="color: #519aba;"></i>
                                        <span class="tree-label">work.md</span>
                                    </div>
                                </div>

                                <!-- contact/ folder -->
                                <div class="tree-item folder-item expanded" data-type="folder" data-folder="contact"
                                    role="treeitem" aria-expanded="true" aria-label="contact folder" tabindex="0">
                                    <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                    <i class="fas fa-folder-open tree-icon folder-icon" style="color: #e8c764;"></i>
                                    <span class="tree-label">contact</span>
                                </div>
                                <div class="tree-children folder-children" data-parent="contact">
                                    <div class="tree-item file-item" data-file="socials.json" data-lang="json"
                                        role="treeitem" aria-label="socials.json" tabindex="0">
                                        <i class="fas fa-file-code tree-icon" style="color: #cbcb41;"></i>
                                        <span class="tree-label">socials.json</span>
                                    </div>
                                </div>

                                <!-- license/ folder -->
                                <div class="tree-item folder-item expanded" data-type="folder" data-folder="license"
                                    role="treeitem" aria-expanded="true" aria-label="license folder" tabindex="0">
                                    <span class="tree-arrow"><i class="fas fa-chevron-down"></i></span>
                                    <i class="fas fa-folder-open tree-icon folder-icon" style="color: #e8c764;"></i>
                                    <span class="tree-label">license</span>
                                </div>
                                <div class="tree-children folder-children" data-parent="license">
                                    <div class="tree-item file-item" data-file="LICENSE.txt" data-lang="text"
                                        role="treeitem" aria-label="LICENSE.txt" tabindex="0">
                                        <i class="fas fa-file-alt tree-icon" style="color: #8a8a8a;"></i>
                                        <span class="tree-label">LICENSE.txt</span>
                                    </div>
                                </div>
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
                        <i class="fas fa-search"></i>
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
                        <i class="fas fa-code-branch"></i>
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
                        <i class="fas fa-play-circle"></i>
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
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', this.handleFileClick.bind(this));
            item.addEventListener('keydown', this.handleFileKeydown.bind(this));
        });

        const folderItems = document.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.addEventListener('click', this.handleFolderClick.bind(this));
            item.addEventListener('keydown', this.handleFolderKeydown.bind(this));
        });

        const collapseBtn = document.getElementById('collapse-all-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', this.collapseAll.bind(this));
        }

        const activityBtns = document.querySelectorAll('.activity-btn[data-panel]');
        activityBtns.forEach(btn => {
            btn.addEventListener('click', this.handleActivityClick.bind(this));
        });

        // Listen for external file switches (e.g. from tab manager)
        eventBus.on('file:switched', this.setActiveFile.bind(this));
        eventBus.on('file:closedAll', () => this.setActiveFile(null));
    }

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
        const isExpanded = item.classList.contains('expanded');

        if (isExpanded) {
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
        if (e.key === 'ArrowRight') {
            if (!item.classList.contains('expanded')) {
                this.handleFolderClick(e);
            }
        }
        if (e.key === 'ArrowLeft') {
            if (item.classList.contains('expanded')) {
                this.handleFolderClick(e);
            }
        }
    }

    expandFolder(folderItem, folderName) {
        folderItem.classList.add('expanded');
        folderItem.classList.remove('collapsed');
        folderItem.setAttribute('aria-expanded', 'true');

        const icon = folderItem.querySelector('.tree-icon');
        if (icon) {
            icon.classList.remove('fa-folder');
            icon.classList.add('fa-folder-open');
        }

        const children = document.querySelector(`.folder-children[data-parent="${folderName}"]`);
        if (children) {
            children.classList.remove('collapsed');
        }
    }

    collapseFolder(folderItem, folderName) {
        folderItem.classList.remove('expanded');
        folderItem.classList.add('collapsed');
        folderItem.setAttribute('aria-expanded', 'false');

        const icon = folderItem.querySelector('.tree-icon');
        if (icon) {
            icon.classList.remove('fa-folder-open');
            icon.classList.add('fa-folder');
        }

        const children = document.querySelector(`.folder-children[data-parent="${folderName}"]`);
        if (children) {
            children.classList.add('collapsed');
        }
    }

    collapseAll() {
        const folderItems = document.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            const folderName = item.getAttribute('data-folder');
            if (folderName) {
                this.collapseFolder(item, folderName);
            }
        });
    }

    setActiveFile(fileName) {
        if (!fileName) {
            this.currentFile = null;
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active-file');
                item.removeAttribute('aria-selected');
            });
            return;
        }

        this.currentFile = fileName;
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active-file');
            item.removeAttribute('aria-selected');
        });

        const activeItem = document.querySelector(`.file-item[data-file="${fileName}"]`);
        if (activeItem) {
            activeItem.classList.add('active-file');
            activeItem.setAttribute('aria-selected', 'true');

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

    handleActivityClick(e) {
        const btn = e.currentTarget;
        const panelId = btn.getAttribute('data-panel');
        if (!panelId) return; // Ignore buttons without data-panel (e.g. Settings, Profile)

        const sidebar = document.getElementById('sidebar');
        const wasActive = btn.classList.contains('active');

        document.querySelectorAll('.activity-btn[data-panel]').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });

        // Only remove active from panels inside the left sidebar, to avoid blanking Jarvis/right sidebar
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
                // Fallback if panel is missing: re-activate explorer to avoid blank sidebar
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
