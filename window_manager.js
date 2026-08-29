/**
 * NovaOS Window Manager & Desktop Environment
 * Handles windowing, taskbar, start menu, context menus, notifications, and desktop interactions.
 */

class WindowManager {
    constructor(kernel) {
        this.kernel = kernel;
        this.windows = new Map();
        this.activeWindowId = null;
        this.highestZIndex = 100;
        this.desktop = document.getElementById('desktop-area');
        this.taskbarApps = document.getElementById('taskbar-apps');
        this.startMenu = document.getElementById('start-menu');
        this.quickSettings = document.getElementById('quick-settings-panel');
        this.notificationsContainer = document.getElementById('notifications-container');

        this.initEventListeners();
        this.initDesktopSelection();
        this.initClock();
        setTimeout(() => this.syncInstalledApps(), 200);
    }

    initEventListeners() {
        // Global mouse up / touch end for drag & resize release
        window.addEventListener('mouseup', () => this.endDragOrResize());
        window.addEventListener('touchend', () => this.endDragOrResize());

        // Global mouse move / touch move
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });

        // Close start menu and quick settings on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
                this.closeStartMenu();
            }
            if (!e.target.closest('#quick-settings-panel') && !e.target.closest('#system-tray-btn')) {
                this.closeQuickSettings();
            }
            this.hideContextMenu();
        });

        // Desktop Context Menu
        if (this.desktop) {
            this.desktop.addEventListener('contextmenu', (e) => {
                if (e.target === this.desktop || e.target.id === 'desktop-icons-container') {
                    e.preventDefault();
                    this.showContextMenu(e.clientX, e.clientY, [
                        { label: 'New Text File', icon: '📝', action: () => this.createDesktopFile() },
                        { label: 'New Folder', icon: '📁', action: () => this.createDesktopFolder() },
                        { type: 'separator' },
                        { label: 'NovaStore App Hub', icon: '🛍️', action: () => window.AppLauncher.open('store') },
                        { label: 'Toggle Fullscreen (F11)', icon: '⛶', action: () => this.toggleFullscreen() },
                        { label: 'Open Terminal', icon: '💻', action: () => window.AppLauncher.open('terminal') },
                        { label: 'File Explorer', icon: '🗂️', action: () => window.AppLauncher.open('files') },
                        { label: 'Task Manager', icon: '📊', action: () => window.AppLauncher.open('taskmgr') },
                        { type: 'separator' },
                        { label: 'Change Wallpaper', icon: '🎨', action: () => window.AppLauncher.open('settings', { tab: 'appearance' }) },
                        { label: 'System Info', icon: 'ℹ️', action: () => window.AppLauncher.open('settings', { tab: 'system' }) }
                    ]);
                }
            });
        }

        // Start Button Click
        const startBtn = document.getElementById('start-button');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleStartMenu();
                this.kernel.audio.playClick();
            });
        }

        // System Tray Click
        const trayBtn = document.getElementById('system-tray-btn');
        if (trayBtn) {
            trayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleQuickSettings();
                this.kernel.audio.playClick();
            });
        }

        // Dedicated Fullscreen Tray Button
        const fullBtn = document.getElementById('tray-fullscreen-btn');
        if (fullBtn) {
            fullBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFullscreen();
                this.kernel.audio.playClick();
            });
        }

        // Quick Settings Fullscreen Button
        const qsFullBtn = document.getElementById('qs-fullscreen-btn');
        if (qsFullBtn) {
            qsFullBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFullscreen();
                this.kernel.audio.playClick();
            });
        }

        // Keyboard Shortcut: F11 for Fullscreen
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });

        // Fullscreen Change Event
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenUI(!!document.fullscreenElement);
        });
    }

    createWindow(options) {
        const {
            id = 'win_' + Math.random().toString(36).substr(2, 9),
            title = 'Application',
            icon = '📁',
            width = 650,
            height = 450,
            x = null,
            y = null,
            minWidth = 320,
            minHeight = 220,
            resizable = true,
            content = '',
            onClose = null,
            onFocus = null
        } = options;

        // If window with ID already exists, focus and restore it
        if (this.windows.has(id)) {
            const existingWin = this.windows.get(id);
            if (existingWin.isMinimized) {
                this.restoreWindow(id);
            }
            this.focusWindow(id);
            return existingWin;
        }

        // Position calculation (cascade)
        const count = this.windows.size;
        const initialX = x !== null ? x : Math.min(60 + (count % 8) * 32, window.innerWidth - width - 40);
        const initialY = y !== null ? y : Math.min(40 + (count % 8) * 32, window.innerHeight - height - 80);

        // Spawn kernel process for the window
        const proc = this.kernel.scheduler.spawn(title, 'user', 10, 1.5, 32.0, `Window UI: ${title}`);

        const winEl = document.createElement('div');
        winEl.className = 'nova-window';
        winEl.id = `window-${id}`;
        winEl.style.width = `${Math.min(width, window.innerWidth - 20)}px`;
        winEl.style.height = `${Math.min(height, window.innerHeight - 80)}px`;
        winEl.style.left = `${Math.max(10, initialX)}px`;
        winEl.style.top = `${Math.max(10, initialY)}px`;
        winEl.style.zIndex = ++this.highestZIndex;

        winEl.innerHTML = `
            <div class="window-titlebar">
                <div class="window-titlebar-left">
                    <span class="window-icon">${icon}</span>
                    <span class="window-title">${title}</span>
                </div>
                <div class="window-controls">
                    <button class="win-btn win-btn-minimize" title="Minimize">─</button>
                    <button class="win-btn win-btn-maximize" title="Maximize">□</button>
                    <button class="win-btn win-btn-close" title="Close">✕</button>
                </div>
            </div>
            <div class="window-body"></div>
            ${resizable ? `
                <div class="resize-handle rh-e"></div>
                <div class="resize-handle rh-s"></div>
                <div class="resize-handle rh-se"></div>
                <div class="resize-handle rh-w"></div>
                <div class="resize-handle rh-n"></div>
                <div class="resize-handle rh-ne"></div>
                <div class="resize-handle rh-nw"></div>
                <div class="resize-handle rh-sw"></div>
            ` : ''}
        `;

        const bodyEl = winEl.querySelector('.window-body');
        if (typeof content === 'string') {
            bodyEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            bodyEl.appendChild(content);
        }

        const winObj = {
            id,
            title,
            icon,
            element: winEl,
            body: bodyEl,
            proc,
            isMinimized: false,
            isMaximized: false,
            resizable,
            minWidth,
            minHeight,
            prevRect: null,
            onClose,
            onFocus
        };

        this.windows.set(id, winObj);
        this.desktop.appendChild(winEl);

        // Bind Window Titlebar Events
        const titlebar = winEl.querySelector('.window-titlebar');
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.startDragging(winObj, e.clientX, e.clientY);
        });
        titlebar.addEventListener('touchstart', (e) => {
            if (e.target.closest('.window-controls')) return;
            const touch = e.touches[0];
            this.startDragging(winObj, touch.clientX, touch.clientY);
        }, { passive: true });

        // Double click to maximize/restore
        titlebar.addEventListener('dblclick', (e) => {
            if (e.target.closest('.window-controls') || !resizable) return;
            this.toggleMaximize(id);
        });

        // Window Controls
        winEl.querySelector('.win-btn-minimize').addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(id);
            this.kernel.audio.playClick();
        });

        winEl.querySelector('.win-btn-maximize').addEventListener('click', (e) => {
            e.stopPropagation();
            if (resizable) this.toggleMaximize(id);
            this.kernel.audio.playClick();
        });

        winEl.querySelector('.win-btn-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(id);
            this.kernel.audio.playClick();
        });

        // Focus on click
        winEl.addEventListener('mousedown', () => this.focusWindow(id));
        winEl.addEventListener('touchstart', () => this.focusWindow(id), { passive: true });

        // Resize Handles
        if (resizable) {
            winEl.querySelectorAll('.resize-handle').forEach(handle => {
                const dir = handle.className.replace('resize-handle rh-', '');
                handle.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    this.startResizing(winObj, dir, e.clientX, e.clientY);
                });
                handle.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                    const touch = e.touches[0];
                    this.startResizing(winObj, dir, touch.clientX, touch.clientY);
                }, { passive: true });
            });
        }

        // Add to taskbar
        this.addTaskbarItem(winObj);

        // Focus newly opened window
        this.focusWindow(id);
        this.kernel.audio.playClick();

        return winObj;
    }

    focusWindow(id) {
        const win = this.windows.get(id);
        if (!win) return;

        this.highestZIndex++;
        win.element.style.zIndex = this.highestZIndex;
        this.activeWindowId = id;

        // Update active class on all windows
        this.windows.forEach(w => {
            w.element.classList.toggle('active', w.id === id);
        });

        // Update taskbar active tab
        document.querySelectorAll('.taskbar-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.windowId === id);
        });

        if (win.onFocus) win.onFocus();
    }

    startDragging(win, clientX, clientY) {
        if (win.isMaximized) return;
        this.focusWindow(win.id);
        const rect = win.element.getBoundingClientRect();
        this.dragState = {
            win,
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
        win.element.classList.add('is-dragging');
    }

    startResizing(win, dir, clientX, clientY) {
        if (win.isMaximized) return;
        this.focusWindow(win.id);
        const rect = win.element.getBoundingClientRect();
        this.resizeState = {
            win,
            dir,
            startX: clientX,
            startY: clientY,
            startLeft: rect.left,
            startTop: rect.top,
            startWidth: rect.width,
            startHeight: rect.height
        };
        win.element.classList.add('is-resizing');
    }

    handleMouseMove(e) {
        if (this.dragState) {
            const { win, offsetX, offsetY } = this.dragState;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Boundaries
            newY = Math.max(0, Math.min(newY, window.innerHeight - 80));
            newX = Math.max(-win.element.offsetWidth + 80, Math.min(newX, window.innerWidth - 80));

            win.element.style.left = `${newX}px`;
            win.element.style.top = `${newY}px`;
        } else if (this.resizeState) {
            const { win, dir, startX, startY, startLeft, startTop, startWidth, startHeight } = this.resizeState;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let w = startWidth;
            let h = startHeight;
            let x = startLeft;
            let y = startTop;

            if (dir.includes('e')) w = Math.max(win.minWidth, startWidth + dx);
            if (dir.includes('s')) h = Math.max(win.minHeight, startHeight + dy);
            if (dir.includes('w')) {
                const targetW = startWidth - dx;
                if (targetW >= win.minWidth) {
                    w = targetW;
                    x = startLeft + dx;
                }
            }
            if (dir.includes('n')) {
                const targetH = startHeight - dy;
                if (targetH >= win.minHeight) {
                    h = targetH;
                    y = startTop + dy;
                }
            }

            win.element.style.width = `${w}px`;
            win.element.style.height = `${h}px`;
            win.element.style.left = `${x}px`;
            win.element.style.top = `${y}px`;
        }
    }

    handleTouchMove(e) {
        if (this.dragState || this.resizeState) {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseMove(touch);
        }
    }

    endDragOrResize() {
        if (this.dragState) {
            this.dragState.win.element.classList.remove('is-dragging');
            this.dragState = null;
        }
        if (this.resizeState) {
            this.resizeState.win.element.classList.remove('is-resizing');
            this.resizeState = null;
        }
    }

    minimizeWindow(id) {
        const win = this.windows.get(id);
        if (!win) return;
        win.isMinimized = true;
        win.element.classList.add('minimized');

        const taskItem = document.querySelector(`.taskbar-item[data-window-id="${id}"]`);
        if (taskItem) taskItem.classList.remove('active');

        // Focus another window
        const remaining = Array.from(this.windows.values()).filter(w => !w.isMinimized);
        if (remaining.length > 0) {
            this.focusWindow(remaining[remaining.length - 1].id);
        } else {
            this.activeWindowId = null;
        }
    }

    restoreWindow(id) {
        const win = this.windows.get(id);
        if (!win) return;
        win.isMinimized = false;
        win.element.classList.remove('minimized');
        this.focusWindow(id);
    }

    toggleMaximize(id) {
        const win = this.windows.get(id);
        if (!win || !win.resizable) return;

        if (win.isMaximized) {
            // Restore
            win.isMaximized = false;
            win.element.classList.remove('maximized');
            if (win.prevRect) {
                win.element.style.left = `${win.prevRect.left}px`;
                win.element.style.top = `${win.prevRect.top}px`;
                win.element.style.width = `${win.prevRect.width}px`;
                win.element.style.height = `${win.prevRect.height}px`;
            }
            win.element.querySelector('.win-btn-maximize').innerText = '□';
        } else {
            // Maximize
            const rect = win.element.getBoundingClientRect();
            win.prevRect = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
            win.isMaximized = true;
            win.element.classList.add('maximized');
            win.element.querySelector('.win-btn-maximize').innerText = '❐';
        }
    }

    closeWindow(id) {
        const win = this.windows.get(id);
        if (!win) return;

        if (win.onClose) {
            try { win.onClose(); } catch (e) { console.error(e); }
        }

        // Kill associated process in scheduler
        if (win.proc && win.proc.pid) {
            try { this.kernel.scheduler.kill(win.proc.pid); } catch (e) {}
        }

        win.element.classList.add('closing');
        setTimeout(() => {
            if (win.element.parentNode) {
                win.element.parentNode.removeChild(win.element);
            }
            this.windows.delete(id);
            this.removeTaskbarItem(id);

            // Focus next window
            const remaining = Array.from(this.windows.values()).filter(w => !w.isMinimized);
            if (remaining.length > 0) {
                this.focusWindow(remaining[remaining.length - 1].id);
            } else {
                this.activeWindowId = null;
            }
        }, 180);
    }

    addTaskbarItem(win) {
        if (!this.taskbarApps) return;
        const item = document.createElement('button');
        item.className = 'taskbar-item active';
        item.dataset.windowId = win.id;
        item.innerHTML = `<span class="taskbar-item-icon">${win.icon}</span><span class="taskbar-item-title">${win.title}</span>`;

        item.addEventListener('click', () => {
            this.kernel.audio.playClick();
            if (win.isMinimized) {
                this.restoreWindow(win.id);
            } else if (this.activeWindowId === win.id) {
                this.minimizeWindow(win.id);
            } else {
                this.focusWindow(win.id);
            }
        });

        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY - 80, [
                { label: win.isMinimized ? 'Restore' : 'Minimize', icon: '─', action: () => win.isMinimized ? this.restoreWindow(win.id) : this.minimizeWindow(win.id) },
                { label: 'Maximize / Toggle', icon: '□', action: () => this.toggleMaximize(win.id) },
                { type: 'separator' },
                { label: 'Close Window', icon: '✕', action: () => this.closeWindow(win.id) }
            ]);
        });

        this.taskbarApps.appendChild(item);
    }

    removeTaskbarItem(id) {
        const item = document.querySelector(`.taskbar-item[data-window-id="${id}"]`);
        if (item && item.parentNode) {
            item.parentNode.removeChild(item);
        }
    }

    // Start Menu
    toggleStartMenu() {
        if (!this.startMenu) return;
        this.startMenu.classList.toggle('open');
        if (this.startMenu.classList.contains('open')) {
            const searchInput = this.startMenu.querySelector('#start-search-input');
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                this.filterStartApps('');
            }
        }
    }

    closeStartMenu() {
        if (this.startMenu) this.startMenu.classList.remove('open');
    }

    filterStartApps(query) {
        const items = this.startMenu.querySelectorAll('.start-app-item');
        const q = query.toLowerCase().trim();
        items.forEach(item => {
            const name = item.dataset.appName || item.innerText;
            if (!q || name.toLowerCase().includes(q)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Quick Settings
    toggleQuickSettings() {
        if (!this.quickSettings) return;
        this.quickSettings.classList.toggle('open');
    }

    closeQuickSettings() {
        if (this.quickSettings) this.quickSettings.classList.remove('open');
    }

    // Context Menu
    showContextMenu(x, y, items) {
        this.hideContextMenu();
        const menu = document.createElement('div');
        menu.id = 'active-context-menu';
        menu.className = 'nova-context-menu';

        // Adjust position inside viewport
        const estimatedW = 180;
        const estimatedH = items.length * 32;
        const posX = Math.min(x, window.innerWidth - estimatedW - 10);
        const posY = Math.min(y, window.innerHeight - estimatedH - 50);

        menu.style.left = `${Math.max(10, posX)}px`;
        menu.style.top = `${Math.max(10, posY)}px`;

        items.forEach(item => {
            if (item.type === 'separator') {
                const sep = document.createElement('div');
                sep.className = 'menu-separator';
                menu.appendChild(sep);
            } else {
                const btn = document.createElement('div');
                btn.className = 'menu-item';
                btn.innerHTML = `<span class="menu-icon">${item.icon || ''}</span><span class="menu-label">${item.label}</span>`;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.hideContextMenu();
                    this.kernel.audio.playClick();
                    if (item.action) item.action();
                });
                menu.appendChild(btn);
            }
        });

        document.body.appendChild(menu);
    }

    hideContextMenu() {
        const menu = document.getElementById('active-context-menu');
        if (menu && menu.parentNode) {
            menu.parentNode.removeChild(menu);
        }
    }

    // Toast Notifications
    notify(title, message, icon = '🔔', type = 'info', duration = 4500) {
        if (!this.notificationsContainer) return;
        this.kernel.audio.playNotification();

        const toast = document.createElement('div');
        toast.className = `nova-toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-msg">${message}</div>
            </div>
            <button class="toast-close">✕</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 250);
        });

        this.notificationsContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 250);
            }
        }, duration);
    }

    // Live Desktop Clock
    initClock() {
        const clockEl = document.getElementById('tray-clock');
        const dateEl = document.getElementById('tray-date');
        const update = () => {
            const now = new Date();
            if (clockEl) {
                clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            if (dateEl) {
                dateEl.innerText = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        };
        update();
        setInterval(update, 1000);
    }

    // Desktop Icon Selection & Lasso
    initDesktopSelection() {
        let isSelecting = false;
        let startX, startY;
        const lasso = document.createElement('div');
        lasso.className = 'desktop-lasso';
        document.body.appendChild(lasso);

        document.addEventListener('mousedown', (e) => {
            if (e.target === this.desktop || e.target.id === 'desktop-icons-container') {
                isSelecting = true;
                startX = e.clientX;
                startY = e.clientY;
                lasso.style.left = `${startX}px`;
                lasso.style.top = `${startY}px`;
                lasso.style.width = '0px';
                lasso.style.height = '0px';
                lasso.style.display = 'block';

                // Deselect icons if not holding ctrl
                if (!e.ctrlKey) {
                    document.querySelectorAll('.desktop-icon').forEach(icon => icon.classList.remove('selected'));
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;
            const currentX = e.clientX;
            const currentY = e.clientY;
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            lasso.style.left = `${left}px`;
            lasso.style.top = `${top}px`;
            lasso.style.width = `${width}px`;
            lasso.style.height = `${height}px`;

            // Check icon intersections
            const lassoRect = { left, top, right: left + width, bottom: top + height };
            document.querySelectorAll('.desktop-icon').forEach(icon => {
                const r = icon.getBoundingClientRect();
                const intersects = !(r.right < lassoRect.left || r.left > lassoRect.right || r.bottom < lassoRect.top || r.top > lassoRect.bottom);
                icon.classList.toggle('selected', intersects);
            });
        });

        document.addEventListener('mouseup', () => {
            if (isSelecting) {
                isSelecting = false;
                lasso.style.display = 'none';
            }
        });
    }

    createDesktopFile() {
        const name = prompt('Enter filename:', 'new_file.txt');
        if (!name) return;
        try {
            this.kernel.vfs.write(`/home/user/Desktop/${name}`, 'Hello from NovaOS Desktop!');
            this.kernel.events.emit('vfs:changed', { path: '/home/user/Desktop' });
            this.notify('File Created', `Created ${name} on Desktop`, '📝', 'success');
        } catch (e) {
            this.notify('Error', e.message, '⚠️', 'error');
        }
    }

    createDesktopFolder() {
        const name = prompt('Enter folder name:', 'New Folder');
        if (!name) return;
        try {
            this.kernel.vfs.mkdir(`/home/user/Desktop/${name}`);
            this.kernel.events.emit('vfs:changed', { path: '/home/user/Desktop' });
            this.notify('Folder Created', `Created folder ${name} on Desktop`, '📁', 'success');
        } catch (e) {
            this.notify('Error', e.message, '⚠️', 'error');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().then(() => {
                    this.updateFullscreenUI(true);
                    this.notify('Fullscreen Enabled', 'Press F11 or click Fullscreen icon to exit', '⛶', 'info');
                    this.kernel.audio.playNotification();
                }).catch(err => {
                    this.notify('Fullscreen Error', err.message, '⚠️', 'error');
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    this.updateFullscreenUI(false);
                    this.notify('Fullscreen Exited', 'Restored normal window view', '🗗', 'info');
                    this.kernel.audio.playClick();
                }).catch(() => {});
            }
        }
    }

    updateFullscreenUI(isFullscreen) {
        const trayFullBtn = document.getElementById('tray-fullscreen-btn');
        const qsFullBtn = document.getElementById('qs-fullscreen-btn');
        if (trayFullBtn) {
            trayFullBtn.innerHTML = isFullscreen ? '<span>🗗</span>' : '<span>⛶</span>';
            trayFullBtn.title = isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)';
        }
        if (qsFullBtn) {
            qsFullBtn.classList.toggle('active', isFullscreen);
            const label = qsFullBtn.querySelector('.qs-toggle-label');
            if (label) label.innerText = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
        }
    }

    addAppToDesktop(appId, name, icon) {
        const container = document.getElementById('desktop-icons-container');
        if (!container || container.querySelector(`.desktop-icon[data-app="${appId}"]`)) return;

        const el = document.createElement('div');
        el.className = 'desktop-icon app-dynamic-icon';
        el.dataset.app = appId;
        el.innerHTML = `
            <div class="desktop-icon-symbol">${icon}</div>
            <div class="desktop-icon-label">${name}</div>
        `;
        el.addEventListener('dblclick', () => window.AppLauncher.open(appId));
        let lastTouch = 0;
        el.addEventListener('touchend', () => {
            const now = Date.now();
            if (now - lastTouch < 300) window.AppLauncher.open(appId);
            lastTouch = now;
        });
        container.appendChild(el);
    }

    removeAppFromDesktop(appId) {
        const container = document.getElementById('desktop-icons-container');
        if (!container) return;
        const el = container.querySelector(`.desktop-icon[data-app="${appId}"]`);
        if (el) el.remove();
    }

    addAppToStartMenu(appId, name, icon) {
        const grid = document.getElementById('start-apps-grid');
        if (!grid || grid.querySelector(`.start-app-item[data-app="${appId}"]`)) return;

        const el = document.createElement('div');
        el.className = 'start-app-item app-dynamic-start-item';
        el.dataset.appName = name;
        el.dataset.app = appId;
        el.innerHTML = `
            <div class="start-app-icon">${icon}</div>
            <div class="start-app-name">${name}</div>
        `;
        el.addEventListener('click', () => {
            window.AppLauncher.open(appId);
            this.closeStartMenu();
        });
        grid.appendChild(el);
    }

    removeAppFromStartMenu(appId) {
        const grid = document.getElementById('start-apps-grid');
        if (!grid) return;
        const el = grid.querySelector(`.start-app-item[data-app="${appId}"]`);
        if (el) el.remove();
    }

    syncInstalledApps() {
        if (window.NovaStoreApp && typeof window.NovaStoreApp.getInstalledApps === 'function') {
            const installed = window.NovaStoreApp.getInstalledApps();
            const catalog = window.NovaStoreApp.getCatalog();
            installed.forEach(id => {
                const info = catalog.find(a => a.id === id);
                if (info && !info.isCore) {
                    this.addAppToDesktop(info.id, info.name, info.icon);
                    this.addAppToStartMenu(info.id, info.name, info.icon);
                }
            });
        }
    }
}

window.WindowManager = WindowManager;


