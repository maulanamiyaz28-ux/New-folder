/**
 * NovaOS Virtual Microkernel
 * Manages Processes, Memory, Virtual File System (VFS), Audio Engine, and System Events.
 */

class KernelEventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try { cb(data); } catch (err) { console.error(`Error in event ${event}:`, err); }
            });
        }
    }
}

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.6;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, duration, type = 'sine', gainVal = 0.2) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio tone error:', e);
        }
    }

    playStartup() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.7, 'triangle', 0.25);
            }, i * 110);
        });
    }

    playClick() {
        this.playTone(800, 0.04, 'sine', 0.1);
    }

    playNotification() {
        this.playTone(587.33, 0.15, 'sine', 0.2); // D5
        setTimeout(() => this.playTone(880, 0.3, 'sine', 0.2), 120); // A5
    }

    playError() {
        this.playTone(220, 0.2, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(180, 0.3, 'sawtooth', 0.2), 150);
    }

    playBeep(freq = 440, dur = 0.1) {
        this.playTone(freq, dur, 'square', 0.15);
    }
}

class VirtualFileSystem {
    constructor() {
        this.STORAGE_KEY = 'novaos_vfs_v2';
        this.root = this.load() || this.createDefaultFS();
        this.currentDir = '/home/user';
    }

    createDefaultFS() {
        return {
            name: '/',
            type: 'dir',
            created: Date.now(),
            modified: Date.now(),
            children: {
                bin: {
                    name: 'bin',
                    type: 'dir',
                    created: Date.now(),
                    children: {}
                },
                etc: {
                    name: 'etc',
                    type: 'dir',
                    created: Date.now(),
                    children: {
                        'os-release': {
                            name: 'os-release',
                            type: 'file',
                            content: 'NAME="NovaOS"\nVERSION="3.0 Quantum"\nID=novaos\nPRETTY_NAME="NovaOS 3.0 (Quantum Edition)"\nKERNEL="Nova Microkernel 3.1.0-web"',
                            created: Date.now()
                        },
                        'motd': {
                            name: 'motd',
                            type: 'file',
                            content: '===============================================\n  Welcome to NovaOS 3.0 Quantum Edition!\n  Type "help" to see available terminal commands.\n===============================================',
                            created: Date.now()
                        }
                    }
                },
                home: {
                    name: 'home',
                    type: 'dir',
                    created: Date.now(),
                    children: {
                        user: {
                            name: 'user',
                            type: 'dir',
                            created: Date.now(),
                            children: {
                                Desktop: {
                                    name: 'Desktop',
                                    type: 'dir',
                                    created: Date.now(),
                                    children: {
                                        'welcome.txt': {
                                            name: 'welcome.txt',
                                            type: 'file',
                                            content: 'Welcome to NovaOS!\n\nNovaOS is a next-generation desktop operating system running directly inside your browser.\n\nFeatures:\n- Preemptive multitasking kernel\n- NovaCLI interactive terminal\n- Persistent Virtual File System\n- Fluid window manager with glassmorphism\n- Code editor, Browser, Games, and x86 Sandbox.\n\nDouble click any icon to launch an application!',
                                            created: Date.now()
                                        },
                                        'ideas.md': {
                                            name: 'ideas.md',
                                            type: 'file',
                                            content: '# Project Ideas\n\n1. Write a custom assembly program in CPU Sandbox.\n2. Create cool scripts in NovaCode.\n3. Customize your wallpaper and themes in Settings.\n4. Beat the highscore in 2048 and Snake.',
                                            created: Date.now()
                                        }
                                    }
                                },
                                Documents: {
                                    name: 'Documents',
                                    type: 'dir',
                                    created: Date.now(),
                                    children: {
                                        'kernel_spec.txt': {
                                            name: 'kernel_spec.txt',
                                            type: 'file',
                                            content: 'NovaOS Microkernel Architecture:\n\n- Process Scheduler: Round-robin with priority weights\n- Memory Management: Page-based virtual simulation\n- VFS: In-memory hierarchy with LocalStorage persistence\n- IPC: EventBus message channels',
                                            created: Date.now()
                                        },
                                        'todo.txt': {
                                            name: 'todo.txt',
                                            type: 'file',
                                            content: '[x] Boot sequence initialized\n[x] Window Manager loaded\n[x] VFS mounted\n[ ] Write your next great application!',
                                            created: Date.now()
                                        }
                                    }
                                },
                                Downloads: {
                                    name: 'Downloads',
                                    type: 'dir',
                                    created: Date.now(),
                                    children: {
                                        'sample_script.js': {
                                            name: 'sample_script.js',
                                            type: 'file',
                                            content: '// NovaOS Interactive Script\nfunction greet(name) {\n    return `Hello ${name}! Welcome to NovaOS.`;\n}\n\nconsole.log(greet("Astronaut"));\n',
                                            created: Date.now()
                                        }
                                    }
                                },
                                Pictures: {
                                    name: 'Pictures',
                                    type: 'dir',
                                    created: Date.now(),
                                    children: {}
                                },
                                Music: {
                                    name: 'Music',
                                    type: 'dir',
                                    created: Date.now(),
                                    children: {}
                                }
                            }
                        }
                    }
                },
                tmp: {
                    name: 'tmp',
                    type: 'dir',
                    created: Date.now(),
                    children: {}
                },
                var: {
                    name: 'var',
                    type: 'dir',
                    created: Date.now(),
                    children: {
                        log: {
                            name: 'log',
                            type: 'dir',
                            created: Date.now(),
                            children: {
                                'syslog': {
                                    name: 'syslog',
                                    type: 'file',
                                    content: `[0.000000] Kernel: Initializing NovaOS Microkernel v3.1.0\n[0.001240] ACPI: Core hardware initialized\n[0.003410] VFS: Root filesystem mounted on /\n[0.005112] SCHED: Process scheduler active (tick: 50ms)\n[0.008921] UI: Desktop Manager ready`,
                                    created: Date.now()
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.root));
        } catch (e) {
            console.error('VFS Save failed:', e);
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('VFS Load failed:', e);
            return null;
        }
    }

    reset() {
        this.root = this.createDefaultFS();
        this.save();
    }

    resolvePath(path, cwd = this.currentDir) {
        if (!path || path === '.') return cwd;
        let parts;
        if (path.startsWith('/')) {
            parts = path.split('/').filter(Boolean);
        } else if (path.startsWith('~')) {
            parts = ['home', 'user', ...path.slice(1).split('/').filter(Boolean)];
        } else {
            parts = [...cwd.split('/').filter(Boolean), ...path.split('/').filter(Boolean)];
        }

        const resolved = [];
        for (const p of parts) {
            if (p === '.') continue;
            if (p === '..') {
                if (resolved.length > 0) resolved.pop();
            } else {
                resolved.push(p);
            }
        }
        return '/' + resolved.join('/');
    }

    getNode(path, cwd = this.currentDir) {
        const fullPath = this.resolvePath(path, cwd);
        if (fullPath === '/') return this.root;
        const parts = fullPath.split('/').filter(Boolean);
        let curr = this.root;

        for (const part of parts) {
            if (!curr.children || !curr.children[part]) {
                return null;
            }
            curr = curr.children[part];
        }
        return curr;
    }

    read(path, cwd = this.currentDir) {
        const node = this.getNode(path, cwd);
        if (!node) throw new Error(`File not found: ${path}`);
        if (node.type === 'dir') throw new Error(`Is a directory: ${path}`);
        return node.content || '';
    }

    write(path, content, cwd = this.currentDir) {
        const fullPath = this.resolvePath(path, cwd);
        const parts = fullPath.split('/').filter(Boolean);
        if (parts.length === 0) throw new Error('Cannot write to root');
        const filename = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parent = this.getNode(parentPath);

        if (!parent) throw new Error(`Directory does not exist: ${parentPath}`);
        if (parent.type !== 'dir') throw new Error(`Not a directory: ${parentPath}`);

        if (parent.children[filename] && parent.children[filename].type === 'dir') {
            throw new Error(`Cannot overwrite directory with file: ${filename}`);
        }

        parent.children[filename] = {
            name: filename,
            type: 'file',
            content: content,
            created: parent.children[filename]?.created || Date.now(),
            modified: Date.now()
        };
        this.save();
        return true;
    }

    mkdir(path, cwd = this.currentDir) {
        const fullPath = this.resolvePath(path, cwd);
        const parts = fullPath.split('/').filter(Boolean);
        if (parts.length === 0) return false;
        const dirName = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parent = this.getNode(parentPath);

        if (!parent) throw new Error(`Directory not found: ${parentPath}`);
        if (parent.type !== 'dir') throw new Error(`Not a directory: ${parentPath}`);
        if (parent.children[dirName]) throw new Error(`File or directory already exists: ${dirName}`);

        parent.children[dirName] = {
            name: dirName,
            type: 'dir',
            created: Date.now(),
            modified: Date.now(),
            children: {}
        };
        this.save();
        return true;
    }

    remove(path, cwd = this.currentDir, recursive = false) {
        const fullPath = this.resolvePath(path, cwd);
        if (fullPath === '/' || fullPath === '/home' || fullPath === '/home/user') {
            throw new Error('Permission denied: cannot delete system root directories');
        }
        const parts = fullPath.split('/').filter(Boolean);
        const target = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parent = this.getNode(parentPath);

        if (!parent || !parent.children || !parent.children[target]) {
            throw new Error(`Path not found: ${path}`);
        }

        const node = parent.children[target];
        if (node.type === 'dir' && Object.keys(node.children).length > 0 && !recursive) {
            throw new Error(`Directory not empty: ${target}`);
        }

        delete parent.children[target];
        this.save();
        return true;
    }

    list(path = this.currentDir, cwd = this.currentDir) {
        const node = this.getNode(path, cwd);
        if (!node) throw new Error(`Path not found: ${path}`);
        if (node.type !== 'dir') throw new Error(`Not a directory: ${path}`);
        return Object.values(node.children).map(child => ({
            name: child.name,
            type: child.type,
            size: child.type === 'file' ? (child.content?.length || 0) : Object.keys(child.children || {}).length,
            modified: child.modified || child.created || Date.now()
        }));
    }

    tree(path = this.currentDir, maxDepth = 3, currentDepth = 0) {
        const node = this.getNode(path);
        if (!node) return ['(not found)'];
        const lines = [];

        const traverse = (n, prefix = '', depth = 0) => {
            if (depth > maxDepth) return;
            const entries = Object.values(n.children || {});
            entries.forEach((entry, idx) => {
                const isLast = idx === entries.length - 1;
                const branch = isLast ? '└── ' : '├── ';
                lines.push(prefix + branch + entry.name + (entry.type === 'dir' ? '/' : ''));
                if (entry.type === 'dir') {
                    traverse(entry, prefix + (isLast ? '    ' : '│   '), depth + 1);
                }
            });
        };

        lines.push(path);
        traverse(node);
        return lines;
    }
}

class ProcessScheduler {
    constructor(kernel) {
        this.kernel = kernel;
        this.processes = new Map();
        this.nextPid = 100;
        this.totalTicks = 0;
        this.initSystemProcesses();
        this.startTickLoop();
    }

    initSystemProcesses() {
        this.spawn('kernel_core', 'System', 1, 12.4, 45.2, 'Kernel core services and event dispatcher');
        this.spawn('window_server', 'System', 2, 8.1, 88.5, 'Nova Window & Compositing Manager');
        this.spawn('vfs_daemon', 'System', 3, 1.2, 18.0, 'Virtual File System Cache & Sync');
        this.spawn('audio_server', 'System', 4, 0.4, 12.8, 'WebAudio Sound Engine');
    }

    spawn(name, user = 'user', priority = 10, initialCpu = 2.0, initialMem = 24.0, description = '') {
        const pid = this.nextPid++;
        const process = {
            pid,
            name,
            user,
            priority,
            state: 'running',
            cpu: initialCpu,
            memory: initialMem,
            description: description || `${name} application instance`,
            startTime: Date.now(),
            threads: 1 + Math.floor(Math.random() * 3)
        };
        this.processes.set(pid, process);
        this.kernel.events.emit('process:spawned', process);
        return process;
    }

    kill(pid) {
        if (pid < 10) {
            throw new Error(`Permission denied: PID ${pid} is a protected kernel process`);
        }
        const proc = this.processes.get(Number(pid));
        if (!proc) {
            throw new Error(`No process with PID ${pid}`);
        }
        this.processes.delete(Number(pid));
        this.kernel.events.emit('process:killed', { pid: Number(pid), name: proc.name });
        return true;
    }

    list() {
        return Array.from(this.processes.values());
    }

    startTickLoop() {
        setInterval(() => {
            this.totalTicks++;
            // Dynamically simulate natural CPU & Memory fluctuations
            this.processes.forEach(proc => {
                if (proc.state === 'running') {
                    const jitter = (Math.random() - 0.5) * 1.5;
                    proc.cpu = Math.max(0.1, Math.min(99.0, +(proc.cpu + jitter).toFixed(1)));
                }
            });
            this.kernel.events.emit('scheduler:tick', {
                ticks: this.totalTicks,
                totalCpu: this.getTotalCpu(),
                totalMem: this.getTotalMem(),
                processCount: this.processes.size
            });
        }, 1500);
    }

    getTotalCpu() {
        let total = 0;
        this.processes.forEach(p => total += p.cpu);
        return Math.min(100, Math.round(total));
    }

    getTotalMem() {
        let total = 0;
        this.processes.forEach(p => total += p.memory);
        return Math.round(total);
    }
}

class NovaKernel {
    constructor() {
        this.version = '3.2.0-Miyaz';
        this.build = '2026.10';
        this.bootTime = Date.now();
        this.events = new KernelEventBus();
        this.audio = new AudioEngine();
        this.vfs = new VirtualFileSystem();
        this.scheduler = new ProcessScheduler(this);
        this.hostname = 'nova-os-miyaz';

        // Load or initialize User Profile (Defaults to Profile 9: Miyaz Sovereign 9)
        this.profile = this.loadProfile();
        this.user = this.profile.username || 'miyaz';

        console.log(`[nova-os-miyaz Kernel] Initialized v${this.version} (${this.build}) - User: ${this.user} (${this.profile.name})`);
    }

    loadProfile() {
        const defaultProfile = {
            id: 'UID-0009',
            name: 'Miyaz Sovereign 9',
            username: 'miyaz',
            avatar: '👑',
            role: 'System Administrator (nova-os-miyaz)',
            bio: 'Creator & Administrator of nova-os-miyaz 🚀',
            status: 'Active • Online',
            created: '2026.10',
            theme: 'dark'
        };

        try {
            const saved = localStorage.getItem('novaos_profile');
            if (saved) {
                return { ...defaultProfile, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('[Kernel] Failed to parse profile from localStorage', e);
        }
        return defaultProfile;
    }

    saveProfile(newFields) {
        this.profile = { ...this.profile, ...newFields };
        if (newFields.username) {
            const sanitizedUser = newFields.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'user9';
            this.profile.username = sanitizedUser;
            this.user = sanitizedUser;
        }
        try {
            localStorage.setItem('novaos_profile', JSON.stringify(this.profile));
        } catch (e) {
            console.error('[Kernel] Failed to save profile to localStorage', e);
        }

        this.events.emit('profile:updated', this.profile);
        this.syncProfileUI();
        return this.profile;
    }

    syncProfileUI() {
        const startNameEl = document.querySelector('.start-username');
        const startAvatarEl = document.querySelector('.start-avatar');
        if (startNameEl) {
            startNameEl.textContent = `${this.profile.username}@novaos`;
            startNameEl.title = `${this.profile.name} • ${this.profile.role}`;
        }
        if (startAvatarEl) {
            startAvatarEl.textContent = this.profile.avatar || '👤';
        }
    }

    getUptime() {
        const diff = Math.floor((Date.now() - this.bootTime) / 1000);
        const hrs = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        return `${hrs}h ${mins}m ${secs}s`;
    }
}

// Global Kernel Instance
window.kernel = new NovaKernel();

