/**
 * NovaOS Built-in Application Suite
 * Contains Terminal, File Explorer, NovaCode Editor, Browser, Task Manager,
 * Settings, Calculator, Games Suite, Music Player, and x86 CPU Sandbox.
 */

class AppLauncher {
    static open(appId, params = {}) {
        const km = window.kernel;
        const wm = window.wm;

        switch (appId) {
            case 'store':
                return NovaStoreApp.launch(wm, km, params);
            case 'terminal':
                return TerminalApp.launch(wm, km, params);
            case 'files':
                return FileExplorerApp.launch(wm, km, params);
            case 'editor':
                return CodeEditorApp.launch(wm, km, params);
            case 'browser':
                return BrowserApp.launch(wm, km, params);
            case 'taskmgr':
                return TaskManagerApp.launch(wm, km, params);
            case 'settings':
                return SettingsApp.launch(wm, km, params);
            case 'calc':
                return CalculatorApp.launch(wm, km, params);
            case 'games':
                return GamesApp.launch(wm, km, params);
            case 'music':
                return MusicApp.launch(wm, km, params);
            case 'cpusim':
                return CpuSandboxApp.launch(wm, km, params);
            case 'paint':
                return NovaPaintApp.launch(wm, km, params);
            case 'spaceshooter':
                return SpaceShooterApp.launch(wm, km, params);
            case 'notes':
                return StickyNotesApp.launch(wm, km, params);
            case 'piano':
                return PianoApp.launch(wm, km, params);
            case 'clock':
                return ClockApp.launch(wm, km, params);
            case 'converter':
                return DevConverterApp.launch(wm, km, params);
            default:
                wm.notify('Launcher', `Unknown application: ${appId}`, '⚠️', 'error');
        }
    }
}

window.AppLauncher = AppLauncher;

/* =========================================================================
   1. NovaCLI Terminal Application
   ========================================================================= */
class TerminalApp {
    static launch(wm, km, params = {}) {
        const win = wm.createWindow({
            id: 'app_terminal_' + Date.now(),
            title: 'NovaCLI Terminal',
            icon: '💻',
            width: 720,
            height: 480,
            content: `
                <div class="terminal-app">
                    <div class="terminal-output" id="term-output"></div>
                    <div class="terminal-input-row">
                        <span class="terminal-prompt" id="term-prompt">user@novaos:~$</span>
                        <input type="text" class="terminal-input" id="term-input" autocomplete="off" spellcheck="false" autofocus />
                    </div>
                </div>
            `
        });

        const outputEl = win.body.querySelector('#term-output');
        const inputEl = win.body.querySelector('#term-input');
        const promptEl = win.body.querySelector('#term-prompt');

        let cwd = params.path || '/home/user';
        let commandHistory = [];
        let historyIndex = -1;

        const updatePrompt = () => {
            let displayPath = cwd;
            if (displayPath.startsWith('/home/user')) {
                displayPath = '~' + displayPath.slice('/home/user'.length);
            }
            promptEl.innerText = `${km.user}@${km.hostname}:${displayPath}$`;
        };
        updatePrompt();

        const print = (text, className = '') => {
            const line = document.createElement('div');
            line.className = 'terminal-line ' + className;
            line.innerHTML = text;
            outputEl.appendChild(line);
            outputEl.scrollTop = outputEl.scrollHeight;
        };

        // Welcome banner
        print(`<span style="color:#38bdf8; font-weight:bold;">NovaOS Terminal (v3.1.0-Quantum)</span>`);
        print(`Type <span style="color:#facc15; font-weight:bold;">help</span> for a list of available commands, or <span style="color:#a855f7; font-weight:bold;">neofetch</span> for system information.\n`);

        const execCommand = async (cmdLine) => {
            const raw = cmdLine.trim();
            if (!raw) return;

            commandHistory.push(raw);
            historyIndex = commandHistory.length;

            print(`<span style="color:#94a3b8;">${promptEl.innerText}</span> <span style="color:#ffffff;">${escapeHtml(raw)}</span>`);

            // Check for redirection: cmd > file
            let outputTargetFile = null;
            let actualCmd = raw;
            if (raw.includes('>')) {
                const parts = raw.split('>');
                actualCmd = parts[0].trim();
                outputTargetFile = parts[1].trim();
            }

            // Command parser
            const tokens = actualCmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
            const cmd = (tokens[0] || '').toLowerCase();
            const args = tokens.slice(1).map(t => t.replace(/^"|"$/g, ''));

            let cmdOutput = '';
            let isCustomPrinted = false;

            switch (cmd) {
                case 'help':
                    cmdOutput = `
<span style="color:#38bdf8; font-weight:bold;">Available NovaCLI Commands:</span>
  <span style="color:#facc15;">ls [path]</span>          List files and directories
  <span style="color:#facc15;">cd &lt;path&gt;</span>          Change current directory
  <span style="color:#facc15;">pwd</span>                Print working directory
  <span style="color:#facc15;">cat &lt;file&gt;</span>         Display file contents
  <span style="color:#facc15;">echo [text]</span>        Print text to terminal or redirect (> file)
  <span style="color:#facc15;">mkdir &lt;dir&gt;</span>        Create a new directory
  <span style="color:#facc15;">touch &lt;file&gt;</span>       Create a new file
  <span style="color:#facc15;">rm [-r] &lt;path&gt;</span>     Delete file or folder
  <span style="color:#facc15;">tree [path]</span>        Display tree structure of directory
  <span style="color:#facc15;">neofetch / fetch</span>   Display OS specs and ASCII art
  <span style="color:#facc15;">ps</span>                 List active kernel processes
  <span style="color:#facc15;">kill &lt;pid&gt;</span>         Kill a process by PID
  <span style="color:#facc15;">calc &lt;math&gt;</span>        Evaluate arithmetic calculation
  <span style="color:#facc15;">matrix</span>             Enter the Matrix digital rain animation
  <span style="color:#facc15;">cowsay &lt;text&gt;</span>      ASCII cow saying your message
  <span style="color:#facc15;">theme &lt;name&gt;</span>       Change system theme (dark, cyber, glass, retro)
  <span style="color:#facc15;">fullscreen</span>         Toggle fullscreen display mode (F11)
  <span style="color:#facc15;">pkg [list|install]</span> Package Manager & NovaStore CLI
  <span style="color:#facc15;">code / nano &lt;file&gt;</span> Open file in NovaCode editor
  <span style="color:#facc15;">date / time</span>        Show system date and time
  <span style="color:#facc15;">whoami</span>             Print current user
  <span style="color:#facc15;">clear</span>              Clear terminal screen
  <span style="color:#facc15;">reboot</span>             Reboot NovaOS
                    `;
                    break;

                case 'ls': {
                    const targetPath = args[0] || cwd;
                    try {
                        const list = km.vfs.list(targetPath, cwd);
                        if (list.length === 0) {
                            cmdOutput = `<span style="color:#94a3b8;">(empty directory)</span>`;
                        } else {
                            cmdOutput = list.map(item => {
                                const isDir = item.type === 'dir';
                                const icon = isDir ? '📁' : '📄';
                                const color = isDir ? '#60a5fa; font-weight:bold;' : '#e2e8f0;';
                                return `<span style="color:${color}">${icon} ${item.name}${isDir ? '/' : ''}</span>  <span style="color:#64748b;">(${item.size} bytes)</span>`;
                            }).join('\n');
                        }
                    } catch (e) {
                        cmdOutput = `<span style="color:#f87171;">ls: ${e.message}</span>`;
                    }
                    break;
                }

                case 'cd': {
                    const targetPath = args[0] || '/home/user';
                    try {
                        const resolved = km.vfs.resolvePath(targetPath, cwd);
                        const node = km.vfs.getNode(resolved);
                        if (!node) {
                            cmdOutput = `<span style="color:#f87171;">cd: no such file or directory: ${targetPath}</span>`;
                        } else if (node.type !== 'dir') {
                            cmdOutput = `<span style="color:#f87171;">cd: not a directory: ${targetPath}</span>`;
                        } else {
                            cwd = resolved;
                            updatePrompt();
                        }
                    } catch (e) {
                        cmdOutput = `<span style="color:#f87171;">cd: ${e.message}</span>`;
                    }
                    break;
                }

                case 'pwd':
                    cmdOutput = cwd;
                    break;

                case 'cat': {
                    if (!args[0]) {
                        cmdOutput = `<span style="color:#f87171;">cat: missing filename</span>`;
                    } else {
                        try {
                            const content = km.vfs.read(args[0], cwd);
                            cmdOutput = escapeHtml(content);
                        } catch (e) {
                            cmdOutput = `<span style="color:#f87171;">cat: ${e.message}</span>`;
                        }
                    }
                    break;
                }

                case 'echo':
                    cmdOutput = args.join(' ');
                    break;

                case 'mkdir': {
                    if (!args[0]) {
                        cmdOutput = `<span style="color:#f87171;">mkdir: missing operand</span>`;
                    } else {
                        try {
                            km.vfs.mkdir(args[0], cwd);
                            km.events.emit('vfs:changed', { path: cwd });
                            cmdOutput = `<span style="color:#4ade80;">Created directory ${args[0]}</span>`;
                        } catch (e) {
                            cmdOutput = `<span style="color:#f87171;">mkdir: ${e.message}</span>`;
                        }
                    }
                    break;
                }

                case 'touch': {
                    if (!args[0]) {
                        cmdOutput = `<span style="color:#f87171;">touch: missing file operand</span>`;
                    } else {
                        try {
                            km.vfs.write(args[0], '', cwd);
                            km.events.emit('vfs:changed', { path: cwd });
                            cmdOutput = `<span style="color:#4ade80;">Created file ${args[0]}</span>`;
                        } catch (e) {
                            cmdOutput = `<span style="color:#f87171;">touch: ${e.message}</span>`;
                        }
                    }
                    break;
                }

                case 'rm': {
                    if (!args[0]) {
                        cmdOutput = `<span style="color:#f87171;">rm: missing operand</span>`;
                    } else {
                        const isRecursive = args[0] === '-r' || args[0] === '-rf';
                        const target = isRecursive ? args[1] : args[0];
                        if (!target) {
                            cmdOutput = `<span style="color:#f87171;">rm: missing file or directory name</span>`;
                        } else {
                            try {
                                km.vfs.remove(target, cwd, isRecursive);
                                km.events.emit('vfs:changed', { path: cwd });
                                cmdOutput = `<span style="color:#4ade80;">Removed ${target}</span>`;
                            } catch (e) {
                                cmdOutput = `<span style="color:#f87171;">rm: ${e.message}</span>`;
                            }
                        }
                    }
                    break;
                }

                case 'tree': {
                    const target = args[0] || cwd;
                    try {
                        const lines = km.vfs.tree(target);
                        cmdOutput = lines.join('\n');
                    } catch (e) {
                        cmdOutput = `<span style="color:#f87171;">tree: ${e.message}</span>`;
                    }
                    break;
                }

                case 'neofetch':
                case 'fetch':
                    cmdOutput = `
<span style="color:#38bdf8;">       /\_/\        </span> <span style="color:#38bdf8; font-weight:bold;">${km.user}</span>@<span style="color:#38bdf8; font-weight:bold;">${km.hostname}</span>
<span style="color:#38bdf8;">      ( o.o )       </span> -------------------------
<span style="color:#38bdf8;">       &gt; ^ &lt;        </span> <span style="color:#facc15; font-weight:bold;">OS:</span> NovaOS 3.0 Quantum Edition x86_64
<span style="color:#818cf8;">      /     \\       </span> <span style="color:#facc15; font-weight:bold;">Kernel:</span> ${km.version}
<span style="color:#818cf8;">     (_______)      </span> <span style="color:#facc15; font-weight:bold;">Uptime:</span> ${km.getUptime()}
<span style="color:#c084fc;">                    </span> <span style="color:#facc15; font-weight:bold;">Shell:</span> NovaCLI 2.4
<span style="color:#c084fc;">                    </span> <span style="color:#facc15; font-weight:bold;">Resolution:</span> ${window.innerWidth}x${window.innerHeight}
<span style="color:#f472b6;">                    </span> <span style="color:#facc15; font-weight:bold;">Memory:</span> ${km.scheduler.getTotalMem()} MB / 4096 MB
<span style="color:#f472b6;">                    </span> <span style="color:#facc15; font-weight:bold;">CPU Load:</span> ${km.scheduler.getTotalCpu()}%
                    `;
                    break;

                case 'ps': {
                    const procs = km.scheduler.list();
                    let rows = procs.map(p => {
                        return `${p.pid.toString().padEnd(6)} ${p.user.padEnd(8)} ${p.cpu.toFixed(1).padEnd(6)}% ${p.memory.toFixed(0).padEnd(6)}MB ${p.name.padEnd(16)} ${p.state}`;
                    }).join('\n');
                    cmdOutput = `<span style="color:#38bdf8; font-weight:bold;">PID    USER     CPU%    MEM    PROCESS          STATE</span>\n${rows}`;
                    break;
                }

                case 'kill': {
                    if (!args[0]) {
                        cmdOutput = `<span style="color:#f87171;">kill: missing PID</span>`;
                    } else {
                        try {
                            km.scheduler.kill(parseInt(args[0]));
                            cmdOutput = `<span style="color:#4ade80;">Process ${args[0]} terminated</span>`;
                        } catch (e) {
                            cmdOutput = `<span style="color:#f87171;">kill: ${e.message}</span>`;
                        }
                    }
                    break;
                }

                case 'calc': {
                    if (!args[0]) {
                        cmdOutput = `<span style="color:#f87171;">calc: missing expression (e.g. calc 24 * 7 + (15 / 3))</span>`;
                    } else {
                        try {
                            const expr = args.join(' ');
                            // Safe math calculation
                            const sanitized = expr.replace(/[^0-9+\-*/().%^ Math.sqrtMath.sinMath.cosMath.tanPIE]/g, '');
                            const res = Function(`'use strict'; return (${sanitized})`)();
                            cmdOutput = `<span style="color:#4ade80;">= ${res}</span>`;
                        } catch (e) {
                            cmdOutput = `<span style="color:#f87171;">calc error: ${e.message}</span>`;
                        }
                    }
                    break;
                }

                case 'matrix': {
                    isCustomPrinted = true;
                    print('<span style="color:#22c55e;">Entering the Matrix... (Press any key to exit)</span>');
                    const matrixBox = document.createElement('pre');
                    matrixBox.style.color = '#22c55e';
                    matrixBox.style.fontFamily = 'monospace';
                    matrixBox.style.lineHeight = '1.1';
                    matrixBox.style.fontSize = '12px';
                    outputEl.appendChild(matrixBox);

                    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
                    const interval = setInterval(() => {
                        let line = '';
                        for (let i = 0; i < 40; i++) {
                            line += chars[Math.floor(Math.random() * chars.length)] + ' ';
                        }
                        matrixBox.innerText = line + '\n' + matrixBox.innerText.slice(0, 500);
                        outputEl.scrollTop = outputEl.scrollHeight;
                    }, 80);

                    const stopMatrix = () => {
                        clearInterval(interval);
                        window.removeEventListener('keydown', stopMatrix);
                        print('<span style="color:#38bdf8;">Matrix session terminated.</span>');
                    };
                    window.addEventListener('keydown', stopMatrix, { once: true });
                    break;
                }

                case 'cowsay': {
                    const msg = args.join(' ') || 'NovaOS is awesome!';
                    const len = msg.length;
                    const border = '-'.repeat(len + 2);
                    cmdOutput = `
 ${border}
< ${msg} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
                    `;
                    break;
                }

                case 'code':
                case 'nano': {
                    const targetFile = args[0];
                    AppLauncher.open('editor', { file: targetFile, cwd });
                    cmdOutput = `Opening ${targetFile || 'editor'} in NovaCode...`;
                    break;
                }

                case 'theme': {
                    const themeName = args[0]?.toLowerCase();
                    if (!themeName) {
                        cmdOutput = `Usage: theme <dark|cyber|glass|retro|light>`;
                    } else {
                        SettingsApp.applyTheme(themeName);
                        cmdOutput = `<span style="color:#4ade80;">Theme set to ${themeName}</span>`;
                    }
                    break;
                }

                case 'fullscreen':
                    wm.toggleFullscreen();
                    cmdOutput = `<span style="color:#4ade80;">Toggled fullscreen mode. (Press F11 to exit)</span>`;
                    break;

                case 'pkg':
                case 'store': {
                    const sub = (args[0] || '').toLowerCase();
                    const target = (args[1] || '').toLowerCase();
                    if (!sub || sub === 'help') {
                        cmdOutput = `
<span style="color:#38bdf8; font-weight:bold;">NovaOS Package Manager (pkg):</span>
  <span style="color:#facc15;">pkg list</span>              List available and installed packages
  <span style="color:#facc15;">pkg install &lt;app&gt;</span>     Install application from NovaStore
  <span style="color:#facc15;">pkg remove &lt;app&gt;</span>      Uninstall application
  <span style="color:#facc15;">pkg open &lt;app&gt;</span>        Launch installed application
                        `;
                    } else if (sub === 'list') {
                        const catalog = NovaStoreApp.getCatalog();
                        const installed = NovaStoreApp.getInstalledApps();
                        cmdOutput = `<span style="color:#38bdf8; font-weight:bold;">Available Packages in NovaStore:</span>\n` +
                            catalog.map(a => {
                                const isInst = installed.includes(a.id) || a.isCore;
                                const status = a.isCore ? '<span style="color:#60a5fa;">[Core]</span>' : (isInst ? '<span style="color:#4ade80;">[Installed]</span>' : '<span style="color:#94a3b8;">[Available]</span>');
                                return `${a.icon} <b>${a.id.padEnd(14)}</b> ${a.name.padEnd(24)} ${a.version.padEnd(8)} ${status}`;
                            }).join('\n');
                    } else if (sub === 'install' || sub === 'add') {
                        if (!target) {
                            cmdOutput = `<span style="color:#f87171;">pkg: missing app name to install</span>`;
                        } else {
                            const res = NovaStoreApp.installApp(target);
                            cmdOutput = res.success ? `<span style="color:#4ade80;">${res.message}</span>` : `<span style="color:#f87171;">${res.message}</span>`;
                        }
                    } else if (sub === 'remove' || sub === 'uninstall') {
                        if (!target) {
                            cmdOutput = `<span style="color:#f87171;">pkg: missing app name to remove</span>`;
                        } else {
                            const res = NovaStoreApp.uninstallApp(target);
                            cmdOutput = res.success ? `<span style="color:#4ade80;">${res.message}</span>` : `<span style="color:#f87171;">${res.message}</span>`;
                        }
                    } else if (sub === 'open' || sub === 'run') {
                        if (!target) {
                            cmdOutput = `<span style="color:#f87171;">pkg: missing app name to launch</span>`;
                        } else {
                            AppLauncher.open(target);
                            cmdOutput = `Launching ${target}...`;
                        }
                    } else {
                        cmdOutput = `<span style="color:#f87171;">pkg: unknown subcommand '${sub}'. Type 'pkg help' for help.</span>`;
                    }
                    break;
                }

                case 'date':
                case 'time':
                    cmdOutput = new Date().toString();
                    break;

                case 'whoami':
                    cmdOutput = km.user;
                    break;

                case 'clear':
                    outputEl.innerHTML = '';
                    isCustomPrinted = true;
                    break;

                case 'reboot':
                    window.location.reload();
                    return;

                default:
                    cmdOutput = `<span style="color:#f87171;">Command not found: ${cmd}. Type 'help' for available commands.</span>`;
            }

            if (outputTargetFile && cmdOutput) {
                // Strip HTML tags for file output
                const plainText = cmdOutput.replace(/<[^>]*>?/gm, '');
                try {
                    km.vfs.write(outputTargetFile, plainText, cwd);
                    km.events.emit('vfs:changed', { path: cwd });
                    print(`<span style="color:#4ade80;">Output written to ${outputTargetFile}</span>`);
                } catch (e) {
                    print(`<span style="color:#f87171;">Redirection error: ${e.message}</span>`);
                }
            } else if (!isCustomPrinted && cmdOutput) {
                print(cmdOutput);
            }
        };

        // Key bindings
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = inputEl.value;
                inputEl.value = '';
                execCommand(val);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    inputEl.value = commandHistory[historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    inputEl.value = commandHistory[historyIndex] || '';
                } else {
                    historyIndex = commandHistory.length;
                    inputEl.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab autocomplete
                const val = inputEl.value.trim();
                const parts = val.split(' ');
                const last = parts[parts.length - 1];
                try {
                    const list = km.vfs.list(cwd, cwd);
                    const match = list.find(item => item.name.startsWith(last));
                    if (match) {
                        parts[parts.length - 1] = match.name;
                        inputEl.value = parts.join(' ');
                    }
                } catch (err) {}
            }
        });

        // Click anywhere in terminal to focus input
        win.body.addEventListener('click', () => inputEl.focus());

        return win;
    }
}

/* =========================================================================
   2. Graphical File Explorer Application
   ========================================================================= */
class FileExplorerApp {
    static launch(wm, km, params = {}) {
        let currentPath = params.path || '/home/user';
        let history = [currentPath];
        let historyIndex = 0;
        let viewMode = 'grid'; // 'grid' or 'list'

        const win = wm.createWindow({
            id: 'app_files_' + Date.now(),
            title: 'File Explorer',
            icon: '📁',
            width: 780,
            height: 520,
            content: `
                <div class="file-explorer-app">
                    <div class="fe-toolbar">
                        <div class="fe-nav-buttons">
                            <button class="fe-btn" id="fe-back-btn" title="Back">◀</button>
                            <button class="fe-btn" id="fe-forward-btn" title="Forward">▶</button>
                            <button class="fe-btn" id="fe-up-btn" title="Up">▲</button>
                        </div>
                        <div class="fe-path-bar">
                            <span class="fe-path-icon">📁</span>
                            <input type="text" id="fe-path-input" class="fe-path-input" value="${currentPath}" />
                        </div>
                        <div class="fe-actions">
                            <button class="fe-btn" id="fe-new-file" title="New File">📄+</button>
                            <button class="fe-btn" id="fe-new-folder" title="New Folder">📁+</button>
                            <button class="fe-btn" id="fe-upload-btn" title="Import from PC">⬆ Upload</button>
                            <button class="fe-btn" id="fe-view-toggle" title="Toggle Grid/List">☷</button>
                        </div>
                    </div>
                    <div class="fe-main">
                        <div class="fe-sidebar">
                            <div class="fe-sidebar-section">Quick Access</div>
                            <div class="fe-sidebar-item" data-path="/home/user/Desktop">🖥 Desktop</div>
                            <div class="fe-sidebar-item" data-path="/home/user/Documents">📄 Documents</div>
                            <div class="fe-sidebar-item" data-path="/home/user/Downloads">📥 Downloads</div>
                            <div class="fe-sidebar-item" data-path="/home/user/Pictures">🖼 Pictures</div>
                            <div class="fe-sidebar-item" data-path="/home/user/Music">🎵 Music</div>
                            <div class="fe-sidebar-section" style="margin-top:12px;">System Storage</div>
                            <div class="fe-sidebar-item" data-path="/">💾 Root (/)</div>
                            <div class="fe-sidebar-item" data-path="/etc">⚙️ /etc</div>
                            <div class="fe-sidebar-item" data-path="/var/log">📋 /var/log</div>
                        </div>
                        <div class="fe-content-area ${viewMode}-view" id="fe-items-container"></div>
                    </div>
                    <div class="fe-statusbar" id="fe-statusbar">
                        <span id="fe-status-count">0 items</span>
                        <span id="fe-status-storage">Virtual Storage: In Memory & LocalStorage</span>
                    </div>
                    <input type="file" id="fe-hidden-file-input" style="display:none" />
                </div>
            `
        });

        const itemsContainer = win.body.querySelector('#fe-items-container');
        const pathInput = win.body.querySelector('#fe-path-input');
        const statusCount = win.body.querySelector('#fe-status-count');
        const fileInput = win.body.querySelector('#fe-hidden-file-input');

        const renderDirectory = () => {
            pathInput.value = currentPath;
            itemsContainer.innerHTML = '';

            // Update sidebar active highlights
            win.body.querySelectorAll('.fe-sidebar-item').forEach(item => {
                item.classList.toggle('active', item.dataset.path === currentPath);
            });

            try {
                const list = km.vfs.list(currentPath);
                statusCount.innerText = `${list.length} item${list.length === 1 ? '' : 's'}`;

                if (list.length === 0) {
                    itemsContainer.innerHTML = `<div class="fe-empty-message">This folder is empty</div>`;
                    return;
                }

                list.forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'fe-item';
                    const isDir = item.type === 'dir';

                    let icon = '📄';
                    if (isDir) icon = '📁';
                    else if (item.name.endsWith('.js') || item.name.endsWith('.html') || item.name.endsWith('.css')) icon = '⚡';
                    else if (item.name.endsWith('.txt') || item.name.endsWith('.md')) icon = '📝';
                    else if (item.name.endsWith('.mp3') || item.name.endsWith('.wav')) icon = '🎵';
                    else if (item.name.endsWith('.png') || item.name.endsWith('.jpg')) icon = '🖼';

                    el.innerHTML = `
                        <div class="fe-item-icon">${icon}</div>
                        <div class="fe-item-name" title="${item.name}">${item.name}</div>
                        <div class="fe-item-meta">${isDir ? `${item.size} items` : `${item.size} B`}</div>
                    `;

                    // Single Click
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        itemsContainer.querySelectorAll('.fe-item').forEach(i => i.classList.remove('selected'));
                        el.classList.add('selected');
                    });

                    // Double Click
                    el.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        if (isDir) {
                            navigateTo(km.vfs.resolvePath(item.name, currentPath));
                        } else {
                            openFile(item.name);
                        }
                    });

                    // Item Context Menu
                    el.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        wm.showContextMenu(e.clientX, e.clientY, [
                            { label: isDir ? 'Open Folder' : 'Open in Editor', icon: isDir ? '📁' : '📝', action: () => isDir ? navigateTo(km.vfs.resolvePath(item.name, currentPath)) : openFile(item.name) },
                            { label: 'Download to PC', icon: '⬇️', action: () => downloadFile(item.name) },
                            { type: 'separator' },
                            { label: 'Rename', icon: '✏️', action: () => renameItem(item.name) },
                            { label: 'Delete', icon: '🗑️', action: () => deleteItem(item.name) }
                        ]);
                    });

                    itemsContainer.appendChild(el);
                });
            } catch (e) {
                itemsContainer.innerHTML = `<div class="fe-error-message">Error: ${e.message}</div>`;
            }
        };

        const navigateTo = (newPath) => {
            const resolved = km.vfs.resolvePath(newPath);
            const node = km.vfs.getNode(resolved);
            if (node && node.type === 'dir') {
                currentPath = resolved;
                history = history.slice(0, historyIndex + 1);
                history.push(currentPath);
                historyIndex = history.length - 1;
                renderDirectory();
            } else {
                wm.notify('Error', `Cannot navigate to ${newPath}`, '⚠️', 'error');
            }
        };

        const openFile = (filename) => {
            const fullPath = km.vfs.resolvePath(filename, currentPath);
            AppLauncher.open('editor', { file: fullPath });
        };

        const downloadFile = (filename) => {
            try {
                const content = km.vfs.read(filename, currentPath);
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                a.click();
                URL.revokeObjectURL(a.href);
                wm.notify('Downloaded', `Exported ${filename} to your host device`, '💾', 'success');
            } catch (e) {
                wm.notify('Export Error', e.message, '⚠️', 'error');
            }
        };

        const renameItem = (oldName) => {
            const newName = prompt(`Rename ${oldName} to:`, oldName);
            if (!newName || newName === oldName) return;
            try {
                const node = km.vfs.getNode(oldName, currentPath);
                if (!node) return;
                const parent = km.vfs.getNode(currentPath);
                if (parent && parent.children) {
                    parent.children[newName] = { ...node, name: newName, modified: Date.now() };
                    delete parent.children[oldName];
                    km.vfs.save();
                    renderDirectory();
                    km.events.emit('vfs:changed', { path: currentPath });
                    wm.notify('Renamed', `Renamed to ${newName}`, '✏️', 'info');
                }
            } catch (e) {
                wm.notify('Error', e.message, '⚠️', 'error');
            }
        };

        const deleteItem = (name) => {
            if (confirm(`Delete ${name}?`)) {
                try {
                    km.vfs.remove(name, currentPath, true);
                    km.events.emit('vfs:changed', { path: currentPath });
                    renderDirectory();
                    wm.notify('Deleted', `Deleted ${name}`, '🗑️', 'info');
                } catch (e) {
                    wm.notify('Error', e.message, '⚠️', 'error');
                }
            }
        };

        // Navigation Toolbar bindings
        win.body.querySelector('#fe-back-btn').addEventListener('click', () => {
            if (historyIndex > 0) {
                historyIndex--;
                currentPath = history[historyIndex];
                renderDirectory();
            }
        });

        win.body.querySelector('#fe-forward-btn').addEventListener('click', () => {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                currentPath = history[historyIndex];
                renderDirectory();
            }
        });

        win.body.querySelector('#fe-up-btn').addEventListener('click', () => {
            const resolved = km.vfs.resolvePath('..', currentPath);
            navigateTo(resolved);
        });

        pathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') navigateTo(pathInput.value);
        });

        // Sidebar Navigation
        win.body.querySelectorAll('.fe-sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                navigateTo(item.dataset.path);
            });
        });

        // New File / Folder Buttons
        win.body.querySelector('#fe-new-file').addEventListener('click', () => {
            const name = prompt('New file name:', 'document.txt');
            if (name) {
                try {
                    km.vfs.write(name, '', currentPath);
                    km.events.emit('vfs:changed', { path: currentPath });
                    renderDirectory();
                } catch (e) { wm.notify('Error', e.message, '⚠️', 'error'); }
            }
        });

        win.body.querySelector('#fe-new-folder').addEventListener('click', () => {
            const name = prompt('New folder name:', 'New Folder');
            if (name) {
                try {
                    km.vfs.mkdir(name, currentPath);
                    km.events.emit('vfs:changed', { path: currentPath });
                    renderDirectory();
                } catch (e) { wm.notify('Error', e.message, '⚠️', 'error'); }
            }
        });

        // Upload file from PC
        win.body.querySelector('#fe-upload-btn').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    km.vfs.write(file.name, evt.target.result, currentPath);
                    km.events.emit('vfs:changed', { path: currentPath });
                    renderDirectory();
                    wm.notify('File Imported', `Uploaded ${file.name} to ${currentPath}`, '📥', 'success');
                } catch (err) {
                    wm.notify('Upload Error', err.message, '⚠️', 'error');
                }
            };
            reader.readAsText(file);
        });

        // Toggle Grid/List view
        win.body.querySelector('#fe-view-toggle').addEventListener('click', () => {
            viewMode = viewMode === 'grid' ? 'list' : 'grid';
            itemsContainer.className = `fe-content-area ${viewMode}-view`;
        });

        // Listen for external VFS changes
        const offVfs = km.events.on('vfs:changed', () => renderDirectory());
        win.onClose = () => offVfs();

        renderDirectory();
        return win;
    }
}

/* =========================================================================
   3. NovaCode Text & Code Editor Application
   ========================================================================= */
class CodeEditorApp {
    static launch(wm, km, params = {}) {
        let currentFilePath = params.file || null;
        let isDirty = false;

        const defaultContent = `// NovaCode Editor
// Write JavaScript or code here and click '▶ Run' to execute.

function calculateQuantumState(n) {
    const states = [];
    for (let i = 0; i < n; i++) {
        states.push({
            qubit: i,
            amplitude: Math.cos(i * Math.PI / 4).toFixed(4),
            phase: (i * 45) + '°'
        });
    }
    return states;
}

console.log("Welcome to NovaCode!");
console.table(calculateQuantumState(4));
`;

        const win = wm.createWindow({
            id: 'app_editor_' + Date.now(),
            title: currentFilePath ? `NovaCode - ${currentFilePath}` : 'NovaCode - Untitled',
            icon: '📝',
            width: 780,
            height: 520,
            content: `
                <div class="code-editor-app">
                    <div class="editor-menubar">
                        <div class="editor-menu-item" id="editor-new-btn">📄 New</div>
                        <div class="editor-menu-item" id="editor-open-btn">📂 Open</div>
                        <div class="editor-menu-item" id="editor-save-btn">💾 Save (Ctrl+S)</div>
                        <div class="editor-menu-item" id="editor-export-btn">⬇ Export</div>
                        <div class="editor-menu-separator"></div>
                        <button class="editor-run-btn" id="editor-run-btn">▶ Run Code</button>
                    </div>
                    <div class="editor-tab-bar" id="editor-tab-bar">
                        <div class="editor-tab active" id="editor-active-tab">${currentFilePath ? currentFilePath.split('/').pop() : 'Untitled.js'}</div>
                    </div>
                    <div class="editor-main">
                        <div class="editor-gutter" id="editor-gutter">1</div>
                        <textarea class="editor-textarea" id="editor-textarea" spellcheck="false"></textarea>
                    </div>
                    <div class="editor-console-output" id="editor-console-output" style="display:none;">
                        <div class="console-header">
                            <span>Execution Output</span>
                            <button id="console-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;">✕</button>
                        </div>
                        <pre class="console-body" id="console-body"></pre>
                    </div>
                    <div class="editor-statusbar">
                        <span id="editor-pos-indicator">Ln 1, Col 1</span>
                        <span id="editor-file-status">Ready</span>
                        <span>UTF-8</span>
                        <span>JavaScript</span>
                    </div>
                </div>
            `
        });

        const textarea = win.body.querySelector('#editor-textarea');
        const gutter = win.body.querySelector('#editor-gutter');
        const posIndicator = win.body.querySelector('#editor-pos-indicator');
        const fileStatus = win.body.querySelector('#editor-file-status');
        const tabTitle = win.body.querySelector('#editor-active-tab');
        const consoleBox = win.body.querySelector('#editor-console-output');
        const consoleBody = win.body.querySelector('#console-body');

        // Load file content if path provided
        if (currentFilePath) {
            try {
                textarea.value = km.vfs.read(currentFilePath);
            } catch (e) {
                textarea.value = `// Failed to load ${currentFilePath}: ${e.message}\n`;
            }
        } else {
            textarea.value = defaultContent;
        }

        const updateGutter = () => {
            const lines = textarea.value.split('\n').length;
            let gutterText = '';
            for (let i = 1; i <= lines; i++) {
                gutterText += i + '\n';
            }
            gutter.innerText = gutterText;
        };

        const updateCursorPos = () => {
            const text = textarea.value.substr(0, textarea.selectionStart);
            const lines = text.split('\n');
            const row = lines.length;
            const col = lines[lines.length - 1].length + 1;
            posIndicator.innerText = `Ln ${row}, Col ${col}`;
        };

        textarea.addEventListener('input', () => {
            isDirty = true;
            fileStatus.innerText = '● Modified';
            updateGutter();
        });

        textarea.addEventListener('keyup', updateCursorPos);
        textarea.addEventListener('click', updateCursorPos);
        textarea.addEventListener('scroll', () => {
            gutter.scrollTop = textarea.scrollTop;
        });

        // Tab indentation support
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveCurrentFile();
            }
        });

        const saveCurrentFile = () => {
            if (!currentFilePath) {
                const name = prompt('Save file as (path):', '/home/user/Documents/script.js');
                if (!name) return;
                currentFilePath = name;
            }
            try {
                km.vfs.write(currentFilePath, textarea.value);
                isDirty = false;
                fileStatus.innerText = 'Saved';
                tabTitle.innerText = currentFilePath.split('/').pop();
                win.element.querySelector('.window-title').innerText = `NovaCode - ${currentFilePath}`;
                km.events.emit('vfs:changed', { path: currentFilePath });
                wm.notify('File Saved', `Saved to ${currentFilePath}`, '💾', 'success');
            } catch (e) {
                wm.notify('Save Failed', e.message, '⚠️', 'error');
            }
        };

        // Menu buttons
        win.body.querySelector('#editor-new-btn').addEventListener('click', () => {
            if (isDirty && !confirm('Discard unsaved changes?')) return;
            currentFilePath = null;
            textarea.value = '';
            tabTitle.innerText = 'Untitled.js';
            win.element.querySelector('.window-title').innerText = 'NovaCode - Untitled';
            updateGutter();
        });

        win.body.querySelector('#editor-open-btn').addEventListener('click', () => {
            const path = prompt('Enter file path to open:', '/home/user/Desktop/welcome.txt');
            if (path) {
                try {
                    textarea.value = km.vfs.read(path);
                    currentFilePath = path;
                    tabTitle.innerText = path.split('/').pop();
                    win.element.querySelector('.window-title').innerText = `NovaCode - ${path}`;
                    updateGutter();
                    wm.notify('File Opened', path, '📂', 'info');
                } catch (e) {
                    wm.notify('Open Error', e.message, '⚠️', 'error');
                }
            }
        });

        win.body.querySelector('#editor-save-btn').addEventListener('click', saveCurrentFile);

        win.body.querySelector('#editor-export-btn').addEventListener('click', () => {
            const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = currentFilePath ? currentFilePath.split('/').pop() : 'script.js';
            a.click();
            URL.revokeObjectURL(a.href);
        });

        // Run Code Runner
        win.body.querySelector('#editor-run-btn').addEventListener('click', () => {
            consoleBox.style.display = 'flex';
            consoleBody.innerText = 'Running script...\n';
            try {
                let logs = [];
                const customConsole = {
                    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
                    error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
                    warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
                    table: (data) => logs.push(JSON.stringify(data, null, 2))
                };
                const fn = new Function('console', 'kernel', textarea.value);
                fn(customConsole, km);
                consoleBody.innerText = logs.length > 0 ? logs.join('\n') : '(Script finished with no output)';
            } catch (err) {
                consoleBody.innerText = `Runtime Error: ${err.message}\n` + (err.stack || '');
            }
        });

        win.body.querySelector('#console-close-btn').addEventListener('click', () => {
            consoleBox.style.display = 'none';
        });

        updateGutter();
        return win;
    }
}

/* =========================================================================
   4. Virtual Web Browser Application
   ========================================================================= */
class BrowserApp {
    static launch(wm, km, params = {}) {
        const win = wm.createWindow({
            id: 'app_browser_' + Date.now(),
            title: 'NovaWeb Browser',
            icon: '🌐',
            width: 820,
            height: 560,
            content: `
                <div class="browser-app">
                    <div class="browser-tab-bar">
                        <div class="browser-tab active">
                            <span class="tab-icon">🪐</span>
                            <span class="tab-title">NovaSearch Portal</span>
                        </div>
                    </div>
                    <div class="browser-nav-bar">
                        <button class="browser-btn" id="b-back-btn">◀</button>
                        <button class="browser-btn" id="b-forward-btn">▶</button>
                        <button class="browser-btn" id="b-refresh-btn">🔄</button>
                        <button class="browser-btn" id="b-home-btn">🏠</button>
                        <div class="browser-url-bar">
                            <span class="browser-ssl-icon">🔒</span>
                            <input type="text" id="browser-url-input" class="browser-url-input" value="https://search.novaos.internal" />
                        </div>
                    </div>
                    <div class="browser-bookmarks">
                        <span class="bookmark-item" data-url="https://search.novaos.internal">🪐 NovaSearch</span>
                        <span class="bookmark-item" data-url="https://wiki.novaos.internal">📖 Wiki</span>
                        <span class="bookmark-item" data-url="https://news.novaos.internal">📰 TechNews</span>
                        <span class="bookmark-item" data-url="https://weather.novaos.internal">☀️ Weather</span>
                    </div>
                    <div class="browser-viewport" id="browser-viewport"></div>
                </div>
            `
        });

        const viewport = win.body.querySelector('#browser-viewport');
        const urlInput = win.body.querySelector('#browser-url-input');

        const pages = {
            'https://search.novaos.internal': `
                <div class="web-portal">
                    <div class="search-hero">
                        <div class="search-logo">🪐 NovaSearch</div>
                        <div class="search-box-wrap">
                            <input type="text" id="portal-search-input" class="portal-search-input" placeholder="Search the web or type a query..." />
                            <button id="portal-search-go" class="portal-search-btn">Search</button>
                        </div>
                    </div>
                    <div class="search-cards">
                        <div class="search-card">
                            <h3>🚀 NovaOS 3.0 Released</h3>
                            <p>Featuring an in-memory virtual microkernel, full window manager, and responsive WebAudio synth soundscapes.</p>
                        </div>
                        <div class="search-card">
                            <h3>🔬 x86 CPU Simulator Sandbox</h3>
                            <p>Write raw assembly code directly in your browser and step through registers in real-time.</p>
                        </div>
                        <div class="search-card">
                            <h3>🎮 Retro Arcade Hub</h3>
                            <p>Enjoy Minesweeper, 2048, and Snake with high score persistence.</p>
                        </div>
                    </div>
                </div>
            `,
            'https://wiki.novaos.internal': `
                <div class="web-article">
                    <h2>NovaOS Architecture Manual</h2>
                    <p><strong>NovaOS</strong> is built upon a layered microkernel architecture designed for speed, security, and portability.</p>
                    <h3>Core Layers:</h3>
                    <ul>
                        <li><strong>Process Scheduler:</strong> Round-robin priority scheduler with dynamic load metrics.</li>
                        <li><strong>Virtual File System (VFS):</strong> Unix-compliant node hierarchy persisted in LocalStorage.</li>
                        <li><strong>Window Compositor:</strong> Multi-layer canvas and glassmorphism styling.</li>
                    </ul>
                </div>
            `,
            'https://news.novaos.internal': `
                <div class="web-article">
                    <h2>Latest Technology Headlines</h2>
                    <div class="news-item">
                        <span class="news-date">Today</span>
                        <h4>WebAssembly and Microkernels Reach New Heights</h4>
                        <p>Developers are building complete operating system environments inside modern browsers with astonishing performance.</p>
                    </div>
                    <div class="news-item">
                        <span class="news-date">Yesterday</span>
                        <h4>Quantum Computing Emulators Now Accessible</h4>
                        <p>Simulating multi-qubit gates and state superposition in sandboxed environments.</p>
                    </div>
                </div>
            `,
            'https://weather.novaos.internal': `
                <div class="web-weather">
                    <h2>Global Atmospheric Forecast</h2>
                    <div class="weather-grid">
                        <div class="weather-box">
                            <div class="w-city">San Francisco</div>
                            <div class="w-temp">18°C ☀️</div>
                            <div class="w-desc">Sunny & Clear</div>
                        </div>
                        <div class="weather-box">
                            <div class="w-city">Tokyo</div>
                            <div class="w-temp">24°C ⛅</div>
                            <div class="w-desc">Partly Cloudy</div>
                        </div>
                        <div class="weather-box">
                            <div class="w-city">London</div>
                            <div class="w-temp">14°C 🌧️</div>
                            <div class="w-desc">Light Showers</div>
                        </div>
                    </div>
                </div>
            `
        };

        const loadURL = (url) => {
            urlInput.value = url;
            if (pages[url]) {
                viewport.innerHTML = pages[url];
                bindPortalEvents();
            } else if (url.startsWith('http://') || url.startsWith('https://')) {
                // Try iframe sandbox
                viewport.innerHTML = `<iframe src="${url}" sandbox="allow-scripts allow-same-origin" style="width:100%; height:100%; border:none;"></iframe>`;
            } else {
                // Search result generator
                viewport.innerHTML = `
                    <div class="web-article">
                        <h2>Search Results for: <em>${escapeHtml(url)}</em></h2>
                        <div class="search-result">
                            <a href="#">About "${escapeHtml(url)}" - NovaOS Knowledgebase</a>
                            <p>Here are search and documentation entries related to your query.</p>
                        </div>
                        <div class="search-result">
                            <a href="#">Community discussions on ${escapeHtml(url)}</a>
                            <p>Explore articles, code snippets, and guides provided by the community.</p>
                        </div>
                    </div>
                `;
            }
        };

        const bindPortalEvents = () => {
            const portalSearch = win.body.querySelector('#portal-search-input');
            const portalBtn = win.body.querySelector('#portal-search-go');
            if (portalSearch && portalBtn) {
                const doSearch = () => {
                    const q = portalSearch.value.trim();
                    if (q) loadURL(q);
                };
                portalBtn.addEventListener('click', doSearch);
                portalSearch.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
            }
        };

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loadURL(urlInput.value.trim());
        });

        win.body.querySelector('#b-home-btn').addEventListener('click', () => loadURL('https://search.novaos.internal'));
        win.body.querySelector('#b-refresh-btn').addEventListener('click', () => loadURL(urlInput.value));

        win.body.querySelectorAll('.bookmark-item').forEach(b => {
            b.addEventListener('click', () => loadURL(b.dataset.url));
        });

        loadURL('https://search.novaos.internal');
        return win;
    }
}

/* =========================================================================
   5. Task Manager & System Monitor Application
   ========================================================================= */
class TaskManagerApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_taskmgr',
            title: 'Task Manager',
            icon: '📊',
            width: 720,
            height: 480,
            content: `
                <div class="taskmgr-app">
                    <div class="taskmgr-tabs">
                        <button class="tm-tab active" data-tab="processes">Processes</button>
                        <button class="tm-tab" data-tab="performance">Performance</button>
                        <button class="tm-tab" data-tab="system">System Specs</button>
                    </div>
                    <div class="taskmgr-body">
                        <!-- Processes View -->
                        <div class="tm-page active" id="tm-page-processes">
                            <div class="tm-table-header">
                                <span class="tm-col-pid">PID</span>
                                <span class="tm-col-name">Process Name</span>
                                <span class="tm-col-user">User</span>
                                <span class="tm-col-cpu">CPU %</span>
                                <span class="tm-col-mem">Memory</span>
                                <span class="tm-col-action">Action</span>
                            </div>
                            <div class="tm-process-list" id="tm-process-list"></div>
                        </div>

                        <!-- Performance View -->
                        <div class="tm-page" id="tm-page-performance">
                            <div class="perf-graphs">
                                <div class="perf-graph-card">
                                    <div class="perf-graph-title">CPU Utilization: <span id="perf-cpu-val">0%</span></div>
                                    <canvas id="cpu-canvas" width="300" height="120" class="perf-canvas"></canvas>
                                </div>
                                <div class="perf-graph-card">
                                    <div class="perf-graph-title">Memory Allocation: <span id="perf-mem-val">0 MB</span></div>
                                    <canvas id="mem-canvas" width="300" height="120" class="perf-canvas"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- System Specs View -->
                        <div class="tm-page" id="tm-page-system">
                            <div class="system-specs-card">
                                <h3>NovaOS Architecture Information</h3>
                                <p><strong>Operating System:</strong> NovaOS 3.0 Quantum Edition</p>
                                <p><strong>Microkernel Build:</strong> ${km.version} (${km.build})</p>
                                <p><strong>Virtual Cores:</strong> 8 Virtual Hyperthreads</p>
                                <p><strong>Total Allocated RAM:</strong> 4096 MB Emulated RAM</p>
                                <p><strong>Storage Engine:</strong> Persistent IndexedDB / LocalStorage VFS</p>
                                <p><strong>Audio Engine:</strong> 32-bit Float WebAudio DSP Synthesizer</p>
                            </div>
                        </div>
                    </div>
                    <div class="taskmgr-footer">
                        <button class="tm-btn" id="tm-spawn-btn">+ Run New Task</button>
                    </div>
                </div>
            `
        });

        const listEl = win.body.querySelector('#tm-process-list');
        const cpuVal = win.body.querySelector('#perf-cpu-val');
        const memVal = win.body.querySelector('#perf-mem-val');
        const cpuCanvas = win.body.querySelector('#cpu-canvas');
        const memCanvas = win.body.querySelector('#mem-canvas');

        let cpuHistory = new Array(30).fill(10);
        let memHistory = new Array(30).fill(140);

        const renderProcesses = () => {
            if (!listEl) return;
            const procs = km.scheduler.list();
            listEl.innerHTML = '';

            procs.forEach(p => {
                const row = document.createElement('div');
                row.className = 'tm-process-row';
                row.innerHTML = `
                    <span class="tm-col-pid">${p.pid}</span>
                    <span class="tm-col-name">${p.name}</span>
                    <span class="tm-col-user">${p.user}</span>
                    <span class="tm-col-cpu">${p.cpu.toFixed(1)}%</span>
                    <span class="tm-col-mem">${p.memory.toFixed(0)} MB</span>
                    <span class="tm-col-action">
                        ${p.pid >= 10 ? `<button class="tm-kill-btn" data-pid="${p.pid}">End Task</button>` : `<span style="color:#64748b; font-size:11px;">Protected</span>`}
                    </span>
                `;

                const killBtn = row.querySelector('.tm-kill-btn');
                if (killBtn) {
                    killBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        try {
                            km.scheduler.kill(p.pid);
                            wm.notify('Process Ended', `Terminated PID ${p.pid} (${p.name})`, '🛑', 'info');
                            renderProcesses();
                        } catch (err) {
                            wm.notify('Error', err.message, '⚠️', 'error');
                        }
                    });
                }

                listEl.appendChild(row);
            });
        };

        const drawGraph = (canvas, history, color, maxVal = 100) => {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let y = 0; y <= h; y += 30) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Fill area
            ctx.beginPath();
            ctx.moveTo(0, h);
            const step = w / (history.length - 1);
            history.forEach((val, i) => {
                const y = h - (val / maxVal) * (h - 10);
                if (i === 0) ctx.lineTo(0, y);
                else ctx.lineTo(i * step, y);
            });
            ctx.lineTo(w, h);
            ctx.fillStyle = color + '22';
            ctx.fill();

            // Line stroke
            ctx.beginPath();
            history.forEach((val, i) => {
                const y = h - (val / maxVal) * (h - 10);
                if (i === 0) ctx.moveTo(0, y);
                else ctx.lineTo(i * step, y);
            });
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        // Tab Switching
        win.body.querySelectorAll('.tm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                win.body.querySelectorAll('.tm-tab').forEach(t => t.classList.remove('active'));
                win.body.querySelectorAll('.tm-page').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                win.body.querySelector(`#tm-page-${tab.dataset.tab}`).classList.add('active');
            });
        });

        // Spawn New Task Button
        win.body.querySelector('#tm-spawn-btn').addEventListener('click', () => {
            const name = prompt('Enter process / app name to spawn:', 'worker_thread');
            if (name) {
                km.scheduler.spawn(name, 'user', 10, 5.0, 30.0);
                renderProcesses();
                wm.notify('Spawned', `Started process ${name}`, '🚀', 'success');
            }
        });

        const tickListener = (data) => {
            renderProcesses();
            if (cpuVal) cpuVal.innerText = `${data.totalCpu}%`;
            if (memVal) memVal.innerText = `${data.totalMem} MB`;

            cpuHistory.push(data.totalCpu);
            if (cpuHistory.length > 30) cpuHistory.shift();

            memHistory.push(data.totalMem);
            if (memHistory.length > 30) memHistory.shift();

            drawGraph(cpuCanvas, cpuHistory, '#38bdf8', 100);
            drawGraph(memCanvas, memHistory, '#a855f7', 1024);
        };

        const offTick = km.events.on('scheduler:tick', tickListener);
        win.onClose = () => offTick();

        renderProcesses();
        drawGraph(cpuCanvas, cpuHistory, '#38bdf8', 100);
        drawGraph(memCanvas, memHistory, '#a855f7', 1024);

        return win;
    }
}

/* =========================================================================
   6. Settings & Control Center Application
   ========================================================================= */
class SettingsApp {
    static launch(wm, km, params = {}) {
        const defaultTab = params.tab || 'appearance';

        const win = wm.createWindow({
            id: 'app_settings',
            title: 'Control Center & Settings',
            icon: '⚙️',
            width: 740,
            height: 500,
            content: `
                <div class="settings-app">
                    <div class="settings-sidebar">
                        <div class="settings-nav-item ${defaultTab === 'appearance' ? 'active' : ''}" data-tab="appearance">🎨 Appearance</div>
                        <div class="settings-nav-item ${defaultTab === 'wallpaper' ? 'active' : ''}" data-tab="wallpaper">🖼 Wallpaper</div>
                        <div class="settings-nav-item ${defaultTab === 'audio' ? 'active' : ''}" data-tab="audio">🔊 Audio & Sound</div>
                        <div class="settings-nav-item ${defaultTab === 'system' ? 'active' : ''}" data-tab="system">ℹ️ System Info</div>
                    </div>
                    <div class="settings-content">
                        <!-- Appearance Tab -->
                        <div class="settings-tab-pane ${defaultTab === 'appearance' ? 'active' : ''}" id="stab-appearance">
                            <h3>Theme & Color Scheme</h3>
                            <div class="theme-picker-grid">
                                <div class="theme-card" data-theme="dark">
                                    <div class="theme-preview theme-prev-dark"></div>
                                    <span>Nebula Dark</span>
                                </div>
                                <div class="theme-card" data-theme="cyber">
                                    <div class="theme-preview theme-prev-cyber"></div>
                                    <span>Cyber Neon</span>
                                </div>
                                <div class="theme-card" data-theme="glass">
                                    <div class="theme-preview theme-prev-glass"></div>
                                    <span>macOS Glass</span>
                                </div>
                                <div class="theme-card" data-theme="retro">
                                    <div class="theme-preview theme-prev-retro"></div>
                                    <span>Win 98 Classic</span>
                                </div>
                                <div class="theme-card" data-theme="synthwave">
                                    <div class="theme-preview theme-prev-synthwave"></div>
                                    <span>Synthwave 80s</span>
                                </div>
                            </div>
                        </div>

                        <!-- Wallpaper Tab -->
                        <div class="settings-tab-pane ${defaultTab === 'wallpaper' ? 'active' : ''}" id="stab-wallpaper">
                            <h3>Desktop Background</h3>
                            <div class="wallpaper-grid">
                                <div class="wp-card" data-wp="linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)">
                                    <div class="wp-preview" style="background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)"></div>
                                    <span>Deep Cosmos</span>
                                </div>
                                <div class="wp-card" data-wp="linear-gradient(135deg, #09090b 0%, #18181b 100%)">
                                    <div class="wp-preview" style="background:linear-gradient(135deg, #09090b 0%, #18181b 100%)"></div>
                                    <span>Midnight Dark</span>
                                </div>
                                <div class="wp-card" data-wp="linear-gradient(135deg, #064e3b 0%, #022c22 100%)">
                                    <div class="wp-preview" style="background:linear-gradient(135deg, #064e3b 0%, #022c22 100%)"></div>
                                    <span>Emerald Aurora</span>
                                </div>
                                <div class="wp-card" data-wp="linear-gradient(135deg, #4c0519 0%, #2e0854 100%)">
                                    <div class="wp-preview" style="background:linear-gradient(135deg, #4c0519 0%, #2e0854 100%)"></div>
                                    <span>Cyber Sunset</span>
                                </div>
                            </div>
                            <div style="margin-top:16px;">
                                <button class="fe-btn" id="custom-wp-upload-btn">Upload Custom Wallpaper</button>
                                <input type="file" id="custom-wp-input" accept="image/*" style="display:none;" />
                            </div>
                        </div>

                        <!-- Audio Tab -->
                        <div class="settings-tab-pane ${defaultTab === 'audio' ? 'active' : ''}" id="stab-audio">
                            <h3>Audio & DSP Synthesizer</h3>
                            <div class="settings-row">
                                <label>Master Volume:</label>
                                <input type="range" id="audio-volume-slider" min="0" max="1" step="0.05" value="${km.audio.volume}" />
                            </div>
                            <div class="settings-row">
                                <label>Sound Effects:</label>
                                <input type="checkbox" id="audio-enable-toggle" ${km.audio.enabled ? 'checked' : ''} />
                            </div>
                            <button class="tm-btn" id="audio-test-btn" style="margin-top:14px;">🔊 Play Test Chime</button>
                        </div>

                        <!-- System Info Tab -->
                        <div class="settings-tab-pane ${defaultTab === 'system' ? 'active' : ''}" id="stab-system">
                            <h3>System Information</h3>
                            <p><strong>OS Name:</strong> NovaOS Quantum Edition</p>
                            <p><strong>Kernel:</strong> ${km.version}</p>
                            <p><strong>Host Browser:</strong> ${navigator.userAgent.slice(0, 60)}...</p>
                            <p><strong>Storage:</strong> LocalStorage Virtual File System</p>
                            <button class="tm-btn" id="vfs-factory-reset-btn" style="background:#ef4444; color:#fff; margin-top:18px;">⚠️ Factory Reset VFS Filesystem</button>
                        </div>
                    </div>
                </div>
            `
        });

        // Tab Switching
        win.body.querySelectorAll('.settings-nav-item').forEach(nav => {
            nav.addEventListener('click', () => {
                win.body.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
                win.body.querySelectorAll('.settings-tab-pane').forEach(p => p.classList.remove('active'));
                nav.classList.add('active');
                win.body.querySelector(`#stab-${nav.dataset.tab}`).classList.add('active');
            });
        });

        // Theme selection
        win.body.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const t = card.dataset.theme;
                SettingsApp.applyTheme(t);
                wm.notify('Theme Applied', `Switched theme to ${t}`, '🎨', 'success');
            });
        });

        // Wallpaper selection
        win.body.querySelectorAll('.wp-card').forEach(card => {
            card.addEventListener('click', () => {
                const wp = card.dataset.wp;
                document.body.style.background = wp;
                localStorage.setItem('novaos_wallpaper', wp);
                wm.notify('Wallpaper Set', 'Desktop wallpaper updated', '🖼', 'success');
            });
        });

        // Custom Wallpaper Upload
        const wpInput = win.body.querySelector('#custom-wp-input');
        const wpUploadBtn = win.body.querySelector('#custom-wp-upload-btn');
        if (wpUploadBtn && wpInput) {
            wpUploadBtn.addEventListener('click', () => wpInput.click());
            wpInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const dataUrl = `url(${evt.target.result}) center/cover no-repeat`;
                    document.body.style.background = dataUrl;
                    localStorage.setItem('novaos_wallpaper', dataUrl);
                    wm.notify('Wallpaper Updated', 'Custom wallpaper loaded', '🖼', 'success');
                };
                reader.readAsDataURL(file);
            });
        }

        // Audio controls
        const volSlider = win.body.querySelector('#audio-volume-slider');
        if (volSlider) {
            volSlider.addEventListener('input', () => {
                km.audio.volume = parseFloat(volSlider.value);
            });
        }

        const audioToggle = win.body.querySelector('#audio-enable-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('change', () => {
                km.audio.enabled = audioToggle.checked;
            });
        }

        win.body.querySelector('#audio-test-btn').addEventListener('click', () => {
            km.audio.playStartup();
        });

        // Factory reset
        win.body.querySelector('#vfs-factory-reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all files in NovaOS to default?')) {
                km.vfs.reset();
                km.events.emit('vfs:changed', { path: '/' });
                wm.notify('VFS Reset', 'Filesystem restored to default', '🔄', 'info');
            }
        });

        return win;
    }

    static applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('novaos_theme', themeName);
    }
}

/* =========================================================================
   7. Scientific Calculator Application
   ========================================================================= */
class CalculatorApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_calc',
            title: 'Calculator',
            icon: '🧮',
            width: 360,
            height: 480,
            resizable: false,
            content: `
                <div class="calc-app">
                    <div class="calc-screen" id="calc-screen">0</div>
                    <div class="calc-grid">
                        <button class="cbtn fn" data-action="clear">C</button>
                        <button class="cbtn fn" data-action="paren-open">(</button>
                        <button class="cbtn fn" data-action="paren-close">)</button>
                        <button class="cbtn op" data-val="/">÷</button>

                        <button class="cbtn fn" data-fn="Math.sin">sin</button>
                        <button class="cbtn fn" data-fn="Math.cos">cos</button>
                        <button class="cbtn fn" data-fn="Math.sqrt">√</button>
                        <button class="cbtn op" data-val="*">×</button>

                        <button class="cbtn" data-val="7">7</button>
                        <button class="cbtn" data-val="8">8</button>
                        <button class="cbtn" data-val="9">9</button>
                        <button class="cbtn op" data-val="-">−</button>

                        <button class="cbtn" data-val="4">4</button>
                        <button class="cbtn" data-val="5">5</button>
                        <button class="cbtn" data-val="6">6</button>
                        <button class="cbtn op" data-val="+">+</button>

                        <button class="cbtn" data-val="1">1</button>
                        <button class="cbtn" data-val="2">2</button>
                        <button class="cbtn" data-val="3">3</button>
                        <button class="cbtn eq" data-action="equals">=</button>

                        <button class="cbtn" data-val="0" style="grid-column: span 2;">0</button>
                        <button class="cbtn" data-val=".">.</button>
                        <button class="cbtn fn" data-fn="Math.PI">π</button>
                    </div>
                </div>
            `
        });

        const screen = win.body.querySelector('#calc-screen');
        let currentExpr = '';

        const updateScreen = (val) => {
            screen.innerText = val || '0';
        };

        win.body.querySelectorAll('.cbtn').forEach(btn => {
            btn.addEventListener('click', () => {
                km.audio.playTone(600, 0.03, 'sine', 0.1);
                const val = btn.dataset.val;
                const action = btn.dataset.action;
                const fn = btn.dataset.fn;

                if (val) {
                    currentExpr += val;
                    updateScreen(currentExpr);
                } else if (fn) {
                    currentExpr += fn + '(';
                    updateScreen(currentExpr);
                } else if (action === 'clear') {
                    currentExpr = '';
                    updateScreen('0');
                } else if (action === 'paren-open') {
                    currentExpr += '(';
                    updateScreen(currentExpr);
                } else if (action === 'paren-close') {
                    currentExpr += ')';
                    updateScreen(currentExpr);
                } else if (action === 'equals') {
                    try {
                        const sanitized = currentExpr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
                        const res = Function(`'use strict'; return (${sanitized})`)();
                        currentExpr = String(res);
                        updateScreen(currentExpr);
                    } catch (e) {
                        updateScreen('Error');
                        currentExpr = '';
                    }
                }
            });
        });

        return win;
    }
}

/* =========================================================================
   8. Retro Arcade & Games Suite (Snake, Minesweeper, 2048)
   ========================================================================= */
class GamesApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_games',
            title: 'Nova Arcade & Games Hub',
            icon: '🎮',
            width: 580,
            height: 540,
            content: `
                <div class="games-app">
                    <div class="games-nav">
                        <button class="g-tab active" data-game="snake">🐍 Snake</button>
                        <button class="g-tab" data-game="minesweeper">💣 Minesweeper</button>
                        <button class="g-tab" data-game="2048">🎲 2048</button>
                    </div>
                    <div class="games-viewport">
                        <!-- Snake Game -->
                        <div class="game-container active" id="game-snake">
                            <div class="game-header">
                                <span>Score: <b id="snake-score">0</b></span>
                                <span>High Score: <b id="snake-highscore">0</b></span>
                                <button class="tm-btn" id="snake-restart-btn">Restart</button>
                            </div>
                            <canvas id="snake-canvas" width="400" height="360" class="game-canvas"></canvas>
                        </div>

                        <!-- Minesweeper Game -->
                        <div class="game-container" id="game-minesweeper">
                            <div class="game-header">
                                <span>Mines: <b id="ms-mines-count">10</b></span>
                                <button class="ms-face-btn" id="ms-face">🙂</button>
                                <span>Time: <b id="ms-timer">0</b>s</span>
                            </div>
                            <div class="ms-board" id="ms-board"></div>
                        </div>

                        <!-- 2048 Game -->
                        <div class="game-container" id="game-2048">
                            <div class="game-header">
                                <span>Score: <b id="g2048-score">0</b></span>
                                <button class="tm-btn" id="g2048-restart-btn">New Game</button>
                            </div>
                            <div class="g2048-board" id="g2048-board"></div>
                        </div>
                    </div>
                </div>
            `
        });

        // Tab Switching
        win.body.querySelectorAll('.g-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                win.body.querySelectorAll('.g-tab').forEach(t => t.classList.remove('active'));
                win.body.querySelectorAll('.game-container').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                win.body.querySelector(`#game-${tab.dataset.game}`).classList.add('active');
            });
        });

        // ------------------ Snake Game Logic ------------------
        const snakeCanvas = win.body.querySelector('#snake-canvas');
        const sScoreEl = win.body.querySelector('#snake-score');
        const sHighEl = win.body.querySelector('#snake-highscore');
        let sCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
        let snake = [{ x: 10, y: 10 }];
        let food = { x: 15, y: 15 };
        let dx = 1, dy = 0;
        let sScore = 0;
        let sHighScore = parseInt(localStorage.getItem('novaos_snake_high') || '0');
        if (sHighEl) sHighEl.innerText = sHighScore;
        let snakeInterval = null;

        const startSnake = () => {
            snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
            dx = 1; dy = 0;
            sScore = 0;
            sScoreEl.innerText = '0';
            placeFood();
            clearInterval(snakeInterval);
            snakeInterval = setInterval(updateSnake, 110);
        };

        const placeFood = () => {
            food = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 18)
            };
        };

        const updateSnake = () => {
            if (!sCtx) return;
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };

            // Wall Collision
            if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 18) {
                gameOverSnake();
                return;
            }

            // Self Collision
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === head.x && snake[i].y === head.y) {
                    gameOverSnake();
                    return;
                }
            }

            snake.unshift(head);

            // Eat Food
            if (head.x === food.x && head.y === food.y) {
                sScore += 10;
                sScoreEl.innerText = sScore;
                km.audio.playTone(880, 0.08, 'sine', 0.2);
                if (sScore > sHighScore) {
                    sHighScore = sScore;
                    localStorage.setItem('novaos_snake_high', sHighScore);
                    sHighEl.innerText = sHighScore;
                }
                placeFood();
            } else {
                snake.pop();
            }

            // Draw
            sCtx.fillStyle = '#0f172a';
            sCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

            // Draw Snake
            snake.forEach((part, idx) => {
                sCtx.fillStyle = idx === 0 ? '#38bdf8' : '#22c55e';
                sCtx.fillRect(part.x * 20 + 1, part.y * 20 + 1, 18, 18);
            });

            // Draw Food
            sCtx.fillStyle = '#f43f5e';
            sCtx.beginPath();
            sCtx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
            sCtx.fill();
        };

        const gameOverSnake = () => {
            clearInterval(snakeInterval);
            km.audio.playError();
            sCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            sCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
            sCtx.fillStyle = '#ef4444';
            sCtx.font = 'bold 22px sans-serif';
            sCtx.textAlign = 'center';
            sCtx.fillText('GAME OVER', snakeCanvas.width / 2, snakeCanvas.height / 2);
        };

        const keyHandler = (e) => {
            if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
            else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
            else if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
            else if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
        };
        window.addEventListener('keydown', keyHandler);

        win.body.querySelector('#snake-restart-btn').addEventListener('click', startSnake);
        startSnake();

        // ------------------ Minesweeper Game Logic ------------------
        const msBoard = win.body.querySelector('#ms-board');
        const msFace = win.body.querySelector('#ms-face');
        const msTimerEl = win.body.querySelector('#ms-timer');
        let msGrid = [];
        const ROWS = 9, COLS = 9, MINES = 10;
        let msTimer = 0;
        let msTimerInterval = null;
        let msGameOver = false;

        const initMinesweeper = () => {
            msBoard.innerHTML = '';
            msGrid = [];
            msTimer = 0;
            msTimerEl.innerText = '0';
            msGameOver = false;
            msFace.innerText = '🙂';
            clearInterval(msTimerInterval);

            for (let r = 0; r < ROWS; r++) {
                msGrid[r] = [];
                for (let c = 0; c < COLS; c++) {
                    msGrid[r][c] = { r, c, mine: false, revealed: false, flagged: false, count: 0 };
                }
            }

            // Place mines
            let placed = 0;
            while (placed < MINES) {
                let r = Math.floor(Math.random() * ROWS);
                let c = Math.floor(Math.random() * COLS);
                if (!msGrid[r][c].mine) {
                    msGrid[r][c].mine = true;
                    placed++;
                }
            }

            // Calculate counts
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (msGrid[r][c].mine) continue;
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && msGrid[nr][nc].mine) {
                                count++;
                            }
                        }
                    }
                    msGrid[r][c].count = count;
                }
            }

            // Render Board
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'ms-cell';
                    cell.dataset.r = r;
                    cell.dataset.c = c;

                    cell.addEventListener('click', () => revealCell(r, c));
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        toggleFlag(r, c);
                    });

                    msBoard.appendChild(cell);
                }
            }

            msTimerInterval = setInterval(() => {
                if (!msGameOver) {
                    msTimer++;
                    msTimerEl.innerText = msTimer;
                }
            }, 1000);
        };

        const revealCell = (r, c) => {
            if (msGameOver) return;
            const cell = msGrid[r][c];
            if (cell.revealed || cell.flagged) return;

            cell.revealed = true;
            const el = msBoard.children[r * COLS + c];
            el.classList.add('revealed');

            if (cell.mine) {
                el.classList.add('mine');
                el.innerText = '💣';
                msFace.innerText = '😵';
                msGameOver = true;
                km.audio.playError();
                return;
            }

            km.audio.playTone(500 + cell.count * 100, 0.04, 'sine', 0.1);

            if (cell.count > 0) {
                el.innerText = cell.count;
                el.classList.add(`c-${cell.count}`);
            } else {
                // Flood fill
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                            revealCell(nr, nc);
                        }
                    }
                }
            }
        };

        const toggleFlag = (r, c) => {
            if (msGameOver) return;
            const cell = msGrid[r][c];
            if (cell.revealed) return;
            cell.flagged = !cell.flagged;
            const el = msBoard.children[r * COLS + c];
            el.innerText = cell.flagged ? '🚩' : '';
        };

        msFace.addEventListener('click', initMinesweeper);
        initMinesweeper();

        // ------------------ 2048 Game Logic ------------------
        const gBoard = win.body.querySelector('#g2048-board');
        const gScoreEl = win.body.querySelector('#g2048-score');
        let gGrid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        let gScore = 0;

        const init2048 = () => {
            gGrid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
            gScore = 0;
            gScoreEl.innerText = '0';
            spawnTile2048();
            spawnTile2048();
            render2048();
        };

        const spawnTile2048 = () => {
            const empty = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (gGrid[r][c] === 0) empty.push({ r, c });
                }
            }
            if (empty.length > 0) {
                const { r, c } = empty[Math.floor(Math.random() * empty.length)];
                gGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
            }
        };

        const render2048 = () => {
            gBoard.innerHTML = '';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const tile = document.createElement('div');
                    const val = gGrid[r][c];
                    tile.className = `g-tile tile-${val}`;
                    tile.innerText = val > 0 ? val : '';
                    gBoard.appendChild(tile);
                }
            }
        };

        win.body.querySelector('#g2048-restart-btn').addEventListener('click', init2048);
        init2048();

        win.onClose = () => {
            clearInterval(snakeInterval);
            clearInterval(msTimerInterval);
            window.removeEventListener('keydown', keyHandler);
        };

        return win;
    }
}

/* =========================================================================
   9. Procedural Music & Synthesizer Player Application
   ========================================================================= */
class MusicApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_music',
            title: 'NovaSynth Media Player',
            icon: '🎵',
            width: 600,
            height: 440,
            content: `
                <div class="music-app">
                    <div class="music-visualizer-container">
                        <canvas id="music-vis-canvas" width="540" height="150" class="music-canvas"></canvas>
                    </div>
                    <div class="music-track-info">
                        <div class="music-title" id="music-track-title">Cyber Drift (Synthwave)</div>
                        <div class="music-artist">NovaOS Procedural DSP Engine</div>
                    </div>
                    <div class="music-controls">
                        <button class="m-btn" id="m-prev-btn">⏮</button>
                        <button class="m-btn m-play-btn" id="m-play-btn">▶</button>
                        <button class="m-btn" id="m-next-btn">⏭</button>
                    </div>
                    <div class="music-playlist" id="music-playlist">
                        <div class="m-track-item active" data-track="0">1. Cyber Drift (Synthwave Beats)</div>
                        <div class="m-track-item" data-track="1">2. Retro 8-Bit Quest (Chiptune)</div>
                        <div class="m-track-item" data-track="2">3. Cosmic Horizon (Ambient Space)</div>
                    </div>
                </div>
            `
        });

        const canvas = win.body.querySelector('#music-vis-canvas');
        const playBtn = win.body.querySelector('#m-play-btn');
        const titleEl = win.body.querySelector('#music-track-title');
        let isPlaying = false;
        let currentTrack = 0;
        let synthInterval = null;

        const tracks = [
            { title: 'Cyber Drift (Synthwave Beats)', notes: [220, 246.94, 261.63, 329.63, 392.00, 329.63, 261.63, 196.00], tempo: 180, type: 'sawtooth' },
            { title: 'Retro 8-Bit Quest (Chiptune)', notes: [330, 392, 493.88, 587.33, 659.25, 587.33, 493.88, 392], tempo: 140, type: 'square' },
            { title: 'Cosmic Horizon (Ambient Space)', notes: [174.61, 220, 261.63, 349.23, 440, 349.23, 261.63, 220], tempo: 350, type: 'triangle' }
        ];

        let noteIdx = 0;
        const playSong = () => {
            const track = tracks[currentTrack];
            titleEl.innerText = track.title;
            synthInterval = setInterval(() => {
                if (!isPlaying) return;
                const freq = track.notes[noteIdx % track.notes.length];
                km.audio.playTone(freq, (track.tempo / 1000) * 0.8, track.type, 0.2);
                noteIdx++;
            }, track.tempo);
        };

        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playBtn.innerText = isPlaying ? '⏸' : '▶';
            if (isPlaying) {
                playSong();
            } else {
                clearInterval(synthInterval);
            }
        });

        // Visualizer animation loop
        let animId;
        const ctx = canvas.getContext('2d');
        const drawVis = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const numBars = 32;
            const barWidth = canvas.width / numBars;

            for (let i = 0; i < numBars; i++) {
                const height = isPlaying ? Math.random() * (canvas.height - 20) + 10 : 8;
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#38bdf8');
                gradient.addColorStop(1, '#ec4899');

                ctx.fillStyle = gradient;
                ctx.fillRect(i * barWidth + 2, canvas.height - height, barWidth - 4, height);
            }
            animId = requestAnimationFrame(drawVis);
        };
        drawVis();

        win.onClose = () => {
            isPlaying = false;
            clearInterval(synthInterval);
            cancelAnimationFrame(animId);
        };

        return win;
    }
}

/* =========================================================================
   10. Educational Virtual CPU & x86 Sandbox Application
   ========================================================================= */
class CpuSandboxApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_cpusim',
            title: 'Virtual CPU & x86 Microkernel Sandbox',
            icon: '🔬',
            width: 840,
            height: 560,
            content: `
                <div class="cpusim-app">
                    <div class="cpusim-toolbar">
                        <button class="tm-btn" id="cpu-assemble-btn">⚙️ Assemble</button>
                        <button class="tm-btn" id="cpu-step-btn">▶| Step</button>
                        <button class="tm-btn" id="cpu-run-btn">▶ Run Fast</button>
                        <button class="tm-btn" id="cpu-reset-btn">🔄 Reset</button>
                        <span style="margin-left:auto; color:#94a3b8; font-size:12px;">Presets:</span>
                        <select id="cpu-preset-select" class="fe-path-input" style="width:160px; height:28px;">
                            <option value="fib">Fibonacci Sequence</option>
                            <option value="fact">Factorial (5!)</option>
                            <option value="draw">VGA Screen Pattern</option>
                        </select>
                    </div>
                    <div class="cpusim-main">
                        <div class="cpusim-editor-col">
                            <div class="cpusim-section-title">Assembly Source Code</div>
                            <textarea id="cpu-code-input" class="editor-textarea" style="height:240px; font-family:monospace; font-size:12px;"></textarea>
                            <div class="cpusim-section-title" style="margin-top:8px;">Execution Console / Output</div>
                            <div id="cpu-output-log" class="console-body" style="height:110px; overflow-y:auto;">System ready.</div>
                        </div>
                        <div class="cpusim-state-col">
                            <div class="cpusim-section-title">CPU Registers</div>
                            <div class="cpu-reg-grid">
                                <div class="reg-box"><span>EAX:</span> <b id="reg-eax">0x0000</b></div>
                                <div class="reg-box"><span>EBX:</span> <b id="reg-ebx">0x0000</b></div>
                                <div class="reg-box"><span>ECX:</span> <b id="reg-ecx">0x0000</b></div>
                                <div class="reg-box"><span>EDX:</span> <b id="reg-edx">0x0000</b></div>
                                <div class="reg-box"><span>PC:</span> <b id="reg-pc">0</b></div>
                                <div class="reg-box"><span>FLAGS:</span> <b id="reg-flags">ZF=0 CF=0</b></div>
                            </div>
                            <div class="cpusim-section-title" style="margin-top:12px;">Virtual 16x16 VGA Display</div>
                            <canvas id="vga-screen" width="160" height="160" style="background:#000; border-radius:6px; margin:0 auto; display:block;"></canvas>
                        </div>
                    </div>
                </div>
            `
        });

        const codeInput = win.body.querySelector('#cpu-code-input');
        const outputLog = win.body.querySelector('#cpu-output-log');
        const regEAX = win.body.querySelector('#reg-eax');
        const regEBX = win.body.querySelector('#reg-ebx');
        const regECX = win.body.querySelector('#reg-ecx');
        const regEDX = win.body.querySelector('#reg-edx');
        const regPC = win.body.querySelector('#reg-pc');
        const regFlags = win.body.querySelector('#reg-flags');
        const vgaCanvas = win.body.querySelector('#vga-screen');
        const vgaCtx = vgaCanvas.getContext('2d');

        const presets = {
            fib: `; Fibonacci Sequence Calculator
MOV EAX, 0    ; F(0)
MOV EBX, 1    ; F(1)
MOV ECX, 8    ; Number of iterations
LOOP:
ADD EAX, EBX  ; EAX = EAX + EBX
MOV EDX, EAX  ; Temp swap
MOV EAX, EBX
MOV EBX, EDX
DEC ECX
CMP ECX, 0
JNZ LOOP
INT 1         ; Print result (EBX contains F(8))
HLT`,
            fact: `; Factorial Calculator for 5!
MOV EAX, 5    ; Input number
MOV EBX, 1    ; Result accumulator
FACT_LOOP:
CMP EAX, 1
JLE DONE
MUL EBX, EAX  ; EBX = EBX * EAX
DEC EAX
JMP FACT_LOOP
DONE:
INT 1         ; Print Result
HLT`,
            draw: `; Draw a gradient pattern on VGA display
MOV EAX, 0    ; X coordinate
MOV EBX, 0    ; Y coordinate
DRAW_LOOP:
INT 2         ; Draw pixel at (EAX, EBX)
INC EAX
CMP EAX, 16
JNZ DRAW_LOOP
MOV EAX, 0
INC EBX
CMP EBX, 16
JNZ DRAW_LOOP
HLT`
        };

        codeInput.value = presets.fib;

        let registers = { EAX: 0, EBX: 0, ECX: 0, EDX: 0, PC: 0, ZF: 0, CF: 0 };
        let instructions = [];
        let labels = {};
        let isHalted = false;

        const log = (msg) => {
            outputLog.innerHTML += `<div>${msg}</div>`;
            outputLog.scrollTop = outputLog.scrollHeight;
        };

        const updateRegisterUI = () => {
            regEAX.innerText = `0x${registers.EAX.toString(16).toUpperCase().padStart(4, '0')} (${registers.EAX})`;
            regEBX.innerText = `0x${registers.EBX.toString(16).toUpperCase().padStart(4, '0')} (${registers.EBX})`;
            regECX.innerText = `0x${registers.ECX.toString(16).toUpperCase().padStart(4, '0')} (${registers.ECX})`;
            regEDX.innerText = `0x${registers.EDX.toString(16).toUpperCase().padStart(4, '0')} (${registers.EDX})`;
            regPC.innerText = registers.PC;
            regFlags.innerText = `ZF=${registers.ZF} CF=${registers.CF}`;
        };

        const assemble = () => {
            instructions = [];
            labels = {};
            registers = { EAX: 0, EBX: 0, ECX: 0, EDX: 0, PC: 0, ZF: 0, CF: 0 };
            isHalted = false;
            outputLog.innerHTML = '<div>Assembling program...</div>';

            const lines = codeInput.value.split('\n');
            let pcIndex = 0;

            lines.forEach((rawLine, idx) => {
                const line = rawLine.split(';')[0].trim();
                if (!line) return;

                if (line.endsWith(':')) {
                    const label = line.slice(0, -1).trim();
                    labels[label] = pcIndex;
                } else {
                    const tokens = line.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
                    instructions.push({ op: tokens[0].toUpperCase(), args: tokens.slice(1), lineNum: idx + 1 });
                    pcIndex++;
                }
            });

            log(`<span style="color:#4ade80;">Assembled ${instructions.length} instructions successfully!</span>`);
            updateRegisterUI();
        };

        const step = () => {
            if (isHalted || registers.PC >= instructions.length) {
                log('<span style="color:#facc15;">CPU Halted / End of instructions</span>');
                return;
            }

            const instr = instructions[registers.PC];
            registers.PC++;

            const getVal = (arg) => {
                if (arg in registers) return registers[arg];
                return parseInt(arg, 10) || 0;
            };

            switch (instr.op) {
                case 'MOV':
                    registers[instr.args[0]] = getVal(instr.args[1]);
                    break;
                case 'ADD':
                    registers[instr.args[0]] += getVal(instr.args[1]);
                    registers.ZF = registers[instr.args[0]] === 0 ? 1 : 0;
                    break;
                case 'SUB':
                    registers[instr.args[0]] -= getVal(instr.args[1]);
                    registers.ZF = registers[instr.args[0]] === 0 ? 1 : 0;
                    break;
                case 'MUL':
                    registers[instr.args[0]] *= getVal(instr.args[1]);
                    break;
                case 'INC':
                    registers[instr.args[0]]++;
                    break;
                case 'DEC':
                    registers[instr.args[0]]--;
                    registers.ZF = registers[instr.args[0]] === 0 ? 1 : 0;
                    break;
                case 'CMP':
                    const diff = getVal(instr.args[0]) - getVal(instr.args[1]);
                    registers.ZF = diff === 0 ? 1 : 0;
                    registers.CF = diff < 0 ? 1 : 0;
                    break;
                case 'JMP':
                    registers.PC = labels[instr.args[0]] !== undefined ? labels[instr.args[0]] : getVal(instr.args[0]);
                    break;
                case 'JNZ':
                    if (registers.ZF === 0) {
                        registers.PC = labels[instr.args[0]] !== undefined ? labels[instr.args[0]] : getVal(instr.args[0]);
                    }
                    break;
                case 'JZ':
                    if (registers.ZF === 1) {
                        registers.PC = labels[instr.args[0]] !== undefined ? labels[instr.args[0]] : getVal(instr.args[0]);
                    }
                    break;
                case 'JLE':
                    if (registers.ZF === 1 || registers.CF === 1) {
                        registers.PC = labels[instr.args[0]] !== undefined ? labels[instr.args[0]] : getVal(instr.args[0]);
                    }
                    break;
                case 'INT':
                    if (instr.args[0] === '1') {
                        log(`<span style="color:#38bdf8; font-weight:bold;">[OUTPUT] Value in EBX = ${registers.EBX}</span>`);
                    } else if (instr.args[0] === '2') {
                        // Draw pixel on VGA canvas
                        const x = registers.EAX * 10;
                        const y = registers.EBX * 10;
                        vgaCtx.fillStyle = `hsl(${(registers.EAX + registers.EBX) * 15}, 80%, 60%)`;
                        vgaCtx.fillRect(x, y, 10, 10);
                    }
                    break;
                case 'HLT':
                    isHalted = true;
                    log('<span style="color:#4ade80;">Program Halted gracefully.</span>');
                    break;
                default:
                    log(`<span style="color:#f87171;">Unknown Opcode: ${instr.op}</span>`);
            }

            km.audio.playBeep(400 + registers.PC * 20, 0.02);
            updateRegisterUI();
        };

        win.body.querySelector('#cpu-assemble-btn').addEventListener('click', assemble);
        win.body.querySelector('#cpu-step-btn').addEventListener('click', step);
        win.body.querySelector('#cpu-run-btn').addEventListener('click', () => {
            assemble();
            const runTimer = setInterval(() => {
                if (isHalted || registers.PC >= instructions.length) {
                    clearInterval(runTimer);
                } else {
                    step();
                }
            }, 50);
        });

        win.body.querySelector('#cpu-reset-btn').addEventListener('click', () => {
            registers = { EAX: 0, EBX: 0, ECX: 0, EDX: 0, PC: 0, ZF: 0, CF: 0 };
            isHalted = false;
            vgaCtx.clearRect(0, 0, vgaCanvas.width, vgaCanvas.height);
            updateRegisterUI();
            outputLog.innerHTML = '<div>System reset.</div>';
        });

        win.body.querySelector('#cpu-preset-select').addEventListener('change', (e) => {
            codeInput.value = presets[e.target.value] || '';
            assemble();
        });

        assemble();
        return win;
    }
}

/* =========================================================================
   11. NovaStore Application & Package Hub
   ========================================================================= */
class NovaStoreApp {
    static getCatalog() {
        return [
            {
                id: 'paint',
                name: 'NovaPaint Studio',
                icon: '🎨',
                category: 'Creativity',
                version: '1.2',
                size: '42 KB',
                rating: '4.9',
                description: 'Full-featured digital art canvas with brushes, geometric shapes, color picker, eraser, and direct PNG export to VFS Pictures and host PC.',
                isCore: false
            },
            {
                id: 'spaceshooter',
                name: 'NovaSpace Invaders',
                icon: '🛸',
                category: 'Games',
                version: '2.0',
                size: '64 KB',
                rating: '5.0',
                description: 'Action-packed retro space arcade shooter with alien fleets, laser cannons, particle explosions, synth sound effects, and high scores.',
                isCore: false
            },
            {
                id: 'notes',
                name: 'Sticky Notes',
                icon: '🗒️',
                category: 'Productivity',
                version: '1.1',
                size: '18 KB',
                rating: '4.8',
                description: 'Colorful persistent desktop sticky notes with custom pastel themes, instant auto-saving, and quick organization.',
                isCore: false
            },
            {
                id: 'piano',
                name: 'NovaSynth Piano',
                icon: '🎹',
                category: 'Creativity',
                version: '1.0',
                size: '32 KB',
                rating: '4.9',
                description: 'Interactive 2-octave musical piano synthesizer with waveform modulation (Sine, Sawtooth, Square), visual keys, and keyboard binding support.',
                isCore: false
            },
            {
                id: 'clock',
                name: 'World Clock & Stopwatch',
                icon: '⏱️',
                category: 'Utilities',
                version: '1.3',
                size: '26 KB',
                rating: '4.7',
                description: 'Precision time suite featuring live global timezones (UTC, NY, London, Tokyo), millisecond stopwatch with lap tracking, and audible countdown alarm.',
                isCore: false
            },
            {
                id: 'converter',
                name: 'DevConverter Studio',
                icon: '🖩',
                category: 'Development',
                version: '1.0',
                size: '16 KB',
                rating: '4.9',
                description: 'Developer multi-base converter for Decimal, Hexadecimal, Binary, Octal, ASCII, Base64 with an interactive 32-bit register bit toggler.',
                isCore: false
            },
            {
                id: 'terminal',
                name: 'NovaCLI Terminal',
                icon: '💻',
                category: 'Development',
                version: '3.1',
                size: 'Core',
                rating: '5.0',
                description: 'Advanced Unix-like terminal shell with 25+ built-in commands, piping, redirection, and tab completion.',
                isCore: true
            },
            {
                id: 'files',
                name: 'File Explorer',
                icon: '📁',
                category: 'Utilities',
                version: '3.1',
                size: 'Core',
                rating: '4.9',
                description: 'Graphical filesystem navigator with breadcrumbs, quick access sidebar, and file management.',
                isCore: true
            },
            {
                id: 'editor',
                name: 'NovaCode Editor',
                icon: '📝',
                category: 'Development',
                version: '3.1',
                size: 'Core',
                rating: '5.0',
                description: 'Code & text editor with line numbers, multi-tab support, and built-in JavaScript runner console.',
                isCore: true
            },
            {
                id: 'browser',
                name: 'NovaWeb Browser',
                icon: '🌐',
                category: 'Utilities',
                version: '3.1',
                size: 'Core',
                rating: '4.8',
                description: 'Virtual web browser with bookmark bar, search engine portal, and sandboxed web reader.',
                isCore: true
            },
            {
                id: 'taskmgr',
                name: 'Task Manager',
                icon: '📊',
                category: 'System',
                version: '3.1',
                size: 'Core',
                rating: '4.9',
                description: 'Real-time CPU and RAM performance graphs and active process inspector with task killing.',
                isCore: true
            },
            {
                id: 'settings',
                name: 'Control Center',
                icon: '⚙️',
                category: 'System',
                version: '3.1',
                size: 'Core',
                rating: '4.9',
                description: 'System personalization suite with themes, wallpapers, sound DSP settings, and display scaling.',
                isCore: true
            },
            {
                id: 'calc',
                name: 'Scientific Calculator',
                icon: '🧮',
                category: 'Utilities',
                version: '3.1',
                size: 'Core',
                rating: '4.8',
                description: 'High-precision standard and scientific math calculator with trigonometry and roots.',
                isCore: true
            },
            {
                id: 'games',
                name: 'Arcade Hub',
                icon: '🎮',
                category: 'Games',
                version: '3.1',
                size: 'Core',
                rating: '5.0',
                description: 'Collection of classic arcade games including Retro Snake, Minesweeper, and 2048.',
                isCore: true
            },
            {
                id: 'music',
                name: 'NovaSynth Player',
                icon: '🎵',
                category: 'Media',
                version: '3.1',
                size: 'Core',
                rating: '4.9',
                description: 'Procedural synthwave & chiptune audio player with real-time frequency spectrum visualizer.',
                isCore: true
            },
            {
                id: 'cpusim',
                name: 'x86 CPU Sandbox',
                icon: '🔬',
                category: 'Development',
                version: '3.1',
                size: 'Core',
                rating: '5.0',
                description: 'Educational microkernel and assembly emulator with registers, memory dump, and 16x16 VGA screen.',
                isCore: true
            }
        ];
    }

    static getInstalledApps() {
        try {
            const saved = localStorage.getItem('novaos_installed_apps');
            return saved ? JSON.parse(saved) : ['paint', 'spaceshooter', 'notes'];
        } catch (e) {
            return ['paint', 'spaceshooter', 'notes'];
        }
    }

    static saveInstalledApps(list) {
        localStorage.setItem('novaos_installed_apps', JSON.stringify(list));
    }

    static installApp(appId) {
        const catalog = this.getCatalog();
        const app = catalog.find(a => a.id === appId);
        if (!app) return { success: false, message: `Package '${appId}' not found in NovaStore repository.` };
        if (app.isCore) return { success: true, message: `'${app.name}' is already part of the core system.` };

        const installed = this.getInstalledApps();
        if (installed.includes(appId)) {
            return { success: true, message: `'${app.name}' is already installed.` };
        }

        installed.push(appId);
        this.saveInstalledApps(installed);

        // Add to desktop and start menu dynamically
        if (window.wm) {
            window.wm.addAppToDesktop(app.id, app.name, app.icon);
            window.wm.addAppToStartMenu(app.id, app.name, app.icon);
            window.wm.notify('Package Installed', `Successfully installed ${app.name} (${app.version})`, app.icon, 'success');
            window.kernel.audio.playStartup();
        }

        window.kernel.events.emit('store:changed', { appId, action: 'installed' });
        return { success: true, message: `Successfully installed ${app.name} (${app.version})` };
    }

    static uninstallApp(appId) {
        const catalog = this.getCatalog();
        const app = catalog.find(a => a.id === appId);
        if (!app) return { success: false, message: `Package '${appId}' not found.` };
        if (app.isCore) return { success: false, message: `Cannot remove core system package '${app.name}'.` };

        let installed = this.getInstalledApps();
        if (!installed.includes(appId)) {
            return { success: false, message: `'${app.name}' is not currently installed.` };
        }

        installed = installed.filter(id => id !== appId);
        this.saveInstalledApps(installed);

        if (window.wm) {
            window.wm.removeAppFromDesktop(appId);
            window.wm.removeAppFromStartMenu(appId);
            window.wm.notify('Package Removed', `Uninstalled ${app.name}`, '🗑️', 'info');
            window.kernel.audio.playClick();
        }

        window.kernel.events.emit('store:changed', { appId, action: 'uninstalled' });
        return { success: true, message: `Successfully uninstalled ${app.name}` };
    }

    static launch(wm, km, params = {}) {
        let currentFilter = params.category || 'All';
        let searchQuery = '';

        const win = wm.createWindow({
            id: 'app_store',
            title: 'NovaStore Package Hub',
            icon: '🛍️',
            width: 860,
            height: 580,
            content: `
                <div class="store-app">
                    <div class="store-header">
                        <div class="store-title-wrap">
                            <span class="store-logo-icon">🛍️</span>
                            <div>
                                <div class="store-title">NovaStore App Hub</div>
                                <div class="store-sub">Discover, install, and manage modular apps & packages</div>
                            </div>
                        </div>
                        <div class="store-search-wrap">
                            <input type="text" id="store-search-input" class="store-search-input" placeholder="Search apps, utilities, games..." spellcheck="false" />
                        </div>
                    </div>

                    <div class="store-nav-tabs">
                        <button class="s-tab active" data-cat="All">All Apps</button>
                        <button class="s-tab" data-cat="Featured">🌟 Featured</button>
                        <button class="s-tab" data-cat="Creativity">🎨 Creativity</button>
                        <button class="s-tab" data-cat="Games">🎮 Games</button>
                        <button class="s-tab" data-cat="Productivity">🗒️ Productivity</button>
                        <button class="s-tab" data-cat="Utilities">⚙️ Utilities</button>
                        <button class="s-tab" data-cat="Development">💻 Development</button>
                        <button class="s-tab" data-cat="Installed">📥 Installed</button>
                    </div>

                    <div class="store-body">
                        <!-- Hero Banner -->
                        <div class="store-hero-banner" id="store-hero">
                            <div class="hero-content">
                                <span class="hero-badge">FEATURED SPOTLIGHT</span>
                                <h2>NovaPaint Studio & Space Invaders</h2>
                                <p>Unleash your creativity with digital art or test your reflexes in retro arcade combat. Installed in 1-click!</p>
                            </div>
                            <div class="hero-icons">🎨 🛸 🎹</div>
                        </div>

                        <!-- App Grid Container -->
                        <div class="store-app-grid" id="store-grid"></div>
                    </div>
                </div>
            `
        });

        const grid = win.body.querySelector('#store-grid');
        const searchInput = win.body.querySelector('#store-search-input');
        const heroBanner = win.body.querySelector('#store-hero');

        const renderGrid = () => {
            const catalog = NovaStoreApp.getCatalog();
            const installed = NovaStoreApp.getInstalledApps();
            grid.innerHTML = '';

            let filtered = catalog.filter(app => {
                // Search query match
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const match = app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
                    if (!match) return false;
                }

                // Category filter
                if (currentFilter === 'All') return true;
                if (currentFilter === 'Featured') return !app.isCore && (app.id === 'paint' || app.id === 'spaceshooter' || app.id === 'piano' || app.id === 'notes');
                if (currentFilter === 'Installed') return installed.includes(app.id) || app.isCore;
                return app.category === currentFilter;
            });

            // Hide/Show hero banner based on filter
            if (currentFilter === 'All' && !searchQuery) {
                heroBanner.style.display = 'flex';
            } else {
                heroBanner.style.display = 'none';
            }

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="store-empty-message">No applications found matching your criteria.</div>`;
                return;
            }

            filtered.forEach(app => {
                const isInstalled = installed.includes(app.id) || app.isCore;
                const card = document.createElement('div');
                card.className = 'store-card';
                card.dataset.appId = app.id;

                card.innerHTML = `
                    <div class="store-card-header">
                        <div class="store-card-icon">${app.icon}</div>
                        <div class="store-card-info">
                            <div class="store-card-name">${app.name}</div>
                            <div class="store-card-meta">
                                <span class="store-cat-tag">${app.category}</span>
                                <span>⭐ ${app.rating}</span>
                                <span>v${app.version}</span>
                            </div>
                        </div>
                    </div>
                    <div class="store-card-desc">${app.description}</div>
                    <div class="store-card-footer">
                        <span class="store-card-size">${app.size}</span>
                        <div class="store-card-actions" id="action-wrap-${app.id}">
                            ${app.isCore ? `
                                <button class="store-btn store-btn-open" data-action="open">▶ Open</button>
                            ` : (isInstalled ? `
                                <button class="store-btn store-btn-open" data-action="open">▶ Launch</button>
                                <button class="store-btn store-btn-remove" data-action="uninstall" title="Uninstall">🗑️</button>
                            ` : `
                                <button class="store-btn store-btn-install" data-action="install">⬇ Install</button>
                            `)}
                        </div>
                    </div>
                `;

                // Bind card action buttons
                const openBtn = card.querySelector('[data-action="open"]');
                if (openBtn) {
                    openBtn.addEventListener('click', () => {
                        AppLauncher.open(app.id);
                    });
                }

                const installBtn = card.querySelector('[data-action="install"]');
                if (installBtn) {
                    installBtn.addEventListener('click', () => {
                        installBtn.disabled = true;
                        installBtn.innerHTML = `<span class="store-install-spinner"></span> Installing...`;
                        setTimeout(() => {
                            NovaStoreApp.installApp(app.id);
                            renderGrid();
                        }, 700);
                    });
                }

                const uninstallBtn = card.querySelector('[data-action="uninstall"]');
                if (uninstallBtn) {
                    uninstallBtn.addEventListener('click', () => {
                        if (confirm(`Uninstall ${app.name}?`)) {
                            NovaStoreApp.uninstallApp(app.id);
                            renderGrid();
                        }
                    });
                }

                grid.appendChild(card);
            });
        };

        // Category Tab switching
        win.body.querySelectorAll('.s-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                win.body.querySelectorAll('.s-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.cat;
                renderGrid();
            });
        });

        // Search input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderGrid();
        });

        const offEvent = km.events.on('store:changed', () => renderGrid());
        win.onClose = () => offEvent();

        renderGrid();
        return win;
    }
}

window.NovaStoreApp = NovaStoreApp;

/* =========================================================================
   12. NovaPaint Canvas Studio Application
   ========================================================================= */
class NovaPaintApp {
    static launch(wm, km, params = {}) {
        const win = wm.createWindow({
            id: 'app_paint_' + Date.now(),
            title: 'NovaPaint Studio',
            icon: '🎨',
            width: 780,
            height: 540,
            content: `
                <div class="paint-app">
                    <div class="paint-toolbar">
                        <div class="paint-tool-group">
                            <button class="paint-tool active" data-tool="brush" title="Brush">🖌️</button>
                            <button class="paint-tool" data-tool="eraser" title="Eraser">🧹</button>
                            <button class="paint-tool" data-tool="line" title="Line">📏</button>
                            <button class="paint-tool" data-tool="rect" title="Rectangle">⬜</button>
                            <button class="paint-tool" data-tool="circle" title="Circle">⭕</button>
                            <button class="paint-tool" data-tool="fill" title="Fill Canvas">🪣</button>
                        </div>
                        <div class="paint-sep"></div>
                        <div class="paint-size-wrap">
                            <span>Size:</span>
                            <input type="range" id="paint-size" min="1" max="40" value="4" />
                            <b id="paint-size-val">4px</b>
                        </div>
                        <div class="paint-sep"></div>
                        <div class="paint-colors-wrap">
                            <input type="color" id="paint-color-picker" value="#38bdf8" title="Custom Color" />
                            <div class="paint-swatches" id="paint-swatches">
                                <div class="swatch" style="background:#ffffff" data-color="#ffffff"></div>
                                <div class="swatch" style="background:#000000" data-color="#000000"></div>
                                <div class="swatch" style="background:#ef4444" data-color="#ef4444"></div>
                                <div class="swatch" style="background:#f97316" data-color="#f97316"></div>
                                <div class="swatch" style="background:#eab308" data-color="#eab308"></div>
                                <div class="swatch" style="background:#22c55e" data-color="#22c55e"></div>
                                <div class="swatch active" style="background:#38bdf8" data-color="#38bdf8"></div>
                                <div class="swatch" style="background:#a855f7" data-color="#a855f7"></div>
                                <div class="swatch" style="background:#ec4899" data-color="#ec4899"></div>
                            </div>
                        </div>
                        <div class="paint-sep"></div>
                        <div class="paint-actions">
                            <button class="paint-btn" id="paint-clear-btn" title="Clear Canvas">🗑️ Clear</button>
                            <button class="paint-btn" id="paint-save-btn" title="Save to VFS Pictures">💾 Save</button>
                            <button class="paint-btn" id="paint-export-btn" title="Download Image to PC">⬇ Export</button>
                        </div>
                    </div>
                    <div class="paint-canvas-container" id="paint-canvas-wrap">
                        <canvas id="paint-canvas" width="720" height="420"></canvas>
                    </div>
                </div>
            `
        });

        const canvas = win.body.querySelector('#paint-canvas');
        const ctx = canvas.getContext('2d');
        const sizeInput = win.body.querySelector('#paint-size');
        const sizeVal = win.body.querySelector('#paint-size-val');
        const colorPicker = win.body.querySelector('#paint-color-picker');

        let currentTool = 'brush';
        let currentColor = '#38bdf8';
        let currentSize = 4;
        let isDrawing = false;
        let startX = 0, startY = 0;
        let snapshot = null;

        // Initialize white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Tool selection
        win.body.querySelectorAll('.paint-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                win.body.querySelectorAll('.paint-tool').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
            });
        });

        // Color swatches
        win.body.querySelectorAll('.swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                win.body.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
                currentColor = sw.dataset.color;
                colorPicker.value = currentColor;
            });
        });

        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
            win.body.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        });

        sizeInput.addEventListener('input', (e) => {
            currentSize = parseInt(e.target.value);
            sizeVal.innerText = currentSize + 'px';
        });

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const startDraw = (e) => {
            isDrawing = true;
            const pos = getPos(e);
            startX = pos.x;
            startY = pos.y;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (currentTool === 'brush' || currentTool === 'eraser') {
                ctx.lineWidth = currentSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
                ctx.lineTo(startX, startY);
                ctx.stroke();
            } else if (currentTool === 'fill') {
                ctx.fillStyle = currentColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                isDrawing = false;
            }
        };

        const draw = (e) => {
            if (!isDrawing) return;
            const pos = getPos(e);

            if (currentTool === 'brush') {
                ctx.lineWidth = currentSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = currentColor;
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (currentTool === 'eraser') {
                ctx.lineWidth = currentSize * 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = '#ffffff';
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (snapshot) {
                ctx.putImageData(snapshot, 0, 0);
                ctx.lineWidth = currentSize;
                ctx.strokeStyle = currentColor;
                ctx.fillStyle = currentColor;

                if (currentTool === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(pos.x, pos.y);
                    ctx.stroke();
                } else if (currentTool === 'rect') {
                    ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
                } else if (currentTool === 'circle') {
                    const radius = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        };

        const stopDraw = () => {
            if (isDrawing) {
                ctx.closePath();
                isDrawing = false;
            }
        };

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDraw);

        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
        window.addEventListener('touchend', stopDraw);

        // Actions
        win.body.querySelector('#paint-clear-btn').addEventListener('click', () => {
            if (confirm('Clear the canvas?')) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        });

        win.body.querySelector('#paint-save-btn').addEventListener('click', () => {
            const dataUrl = canvas.toDataURL('image/png');
            try {
                km.vfs.write('/home/user/Pictures/artwork.png', dataUrl);
                km.events.emit('vfs:changed', { path: '/home/user/Pictures' });
                wm.notify('Artwork Saved', 'Saved drawing to /home/user/Pictures/artwork.png', '🎨', 'success');
            } catch (e) {
                wm.notify('Save Error', e.message, '⚠️', 'error');
            }
        });

        win.body.querySelector('#paint-export-btn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'novapaint_drawing.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            wm.notify('Exported', 'Saved artwork to your local device', '💾', 'success');
        });

        return win;
    }
}

/* =========================================================================
   13. NovaSpace: Retro Alien Invaders Game Application
   ========================================================================= */
class SpaceShooterApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_spaceshooter',
            title: 'NovaSpace: Cosmic Defender',
            icon: '🛸',
            width: 520,
            height: 580,
            resizable: false,
            content: `
                <div class="space-game-app">
                    <div class="space-game-header">
                        <span>Score: <b id="sg-score">0</b></span>
                        <span>Wave: <b id="sg-wave">1</b></span>
                        <span>Lives: <span id="sg-lives">❤️❤️❤️</span></span>
                        <span>High: <b id="sg-high">0</b></span>
                    </div>
                    <canvas id="space-canvas" width="480" height="460" class="space-canvas"></canvas>
                    <div class="space-game-footer">
                        <span>Controls: <kbd>◀</kbd> <kbd>▶</kbd> / <kbd>A</kbd> <kbd>D</kbd> to Move &bull; <kbd>Space</kbd> to Fire</span>
                        <button class="tm-btn" id="sg-restart-btn">Restart</button>
                    </div>
                </div>
            `
        });

        const canvas = win.body.querySelector('#space-canvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = win.body.querySelector('#sg-score');
        const waveEl = win.body.querySelector('#sg-wave');
        const livesEl = win.body.querySelector('#sg-lives');
        const highEl = win.body.querySelector('#sg-high');

        let score = 0;
        let wave = 1;
        let lives = 3;
        let highScore = parseInt(localStorage.getItem('novaos_space_high') || '0');
        highEl.innerText = highScore;

        let player = { x: canvas.width / 2 - 15, y: canvas.height - 40, width: 30, height: 24, speed: 6 };
        let lasers = [];
        let enemies = [];
        let enemyLasers = [];
        let particles = [];
        let stars = [];
        let keys = {};
        let gameOver = false;
        let animId = null;
        let alienDir = 1;
        let lastShootTime = 0;

        // Init starfield
        for (let i = 0; i < 45; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2, speed: Math.random() * 1.5 + 0.5 });
        }

        const initWave = (w) => {
            enemies = [];
            enemyLasers = [];
            wave = w;
            waveEl.innerText = wave;
            alienDir = 1;

            const rows = Math.min(5, 2 + wave);
            const cols = 7;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    enemies.push({
                        x: 50 + c * 52,
                        y: 35 + r * 34,
                        width: 28,
                        height: 20,
                        type: r % 3,
                        alive: true
                    });
                }
            }
        };

        const createExplosion = (x, y, color = '#f97316') => {
            for (let i = 0; i < 16; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    color,
                    alpha: 1.0,
                    size: Math.random() * 3 + 2
                });
            }
        };

        const updateGame = () => {
            if (gameOver) return;

            // Player movement
            if ((keys['ArrowLeft'] || keys['KeyA'] || keys['a']) && player.x > 0) player.x -= player.speed;
            if ((keys['ArrowRight'] || keys['KeyD'] || keys['d']) && player.x < canvas.width - player.width) player.x += player.speed;

            // Fire laser
            if ((keys['Space'] || keys[' ']) && Date.now() - lastShootTime > 200) {
                lasers.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 12 });
                km.audio.playTone(880, 0.04, 'square', 0.15);
                lastShootTime = Date.now();
            }

            // Update stars
            stars.forEach(s => {
                s.y += s.speed;
                if (s.y > canvas.height) s.y = 0;
            });

            // Update lasers
            lasers.forEach((l, idx) => {
                l.y -= 9;
                if (l.y < -10) lasers.splice(idx, 1);
            });

            // Update enemy lasers
            enemyLasers.forEach((el, idx) => {
                el.y += 4.5;
                // Check player hit
                if (el.x > player.x && el.x < player.x + player.width && el.y > player.y && el.y < player.y + player.height) {
                    enemyLasers.splice(idx, 1);
                    lives--;
                    livesEl.innerText = '❤️'.repeat(Math.max(0, lives));
                    createExplosion(player.x + 15, player.y + 12, '#ef4444');
                    km.audio.playError();

                    if (lives <= 0) {
                        gameOver = true;
                    }
                }
                if (el.y > canvas.height + 10) enemyLasers.splice(idx, 1);
            });

            // Update aliens
            let shouldDescend = false;
            let livingEnemies = enemies.filter(e => e.alive);

            if (livingEnemies.length === 0) {
                km.audio.playStartup();
                initWave(wave + 1);
                return;
            }

            livingEnemies.forEach(e => {
                if ((alienDir > 0 && e.x + e.width > canvas.width - 15) || (alienDir < 0 && e.x < 15)) {
                    shouldDescend = true;
                }
            });

            if (shouldDescend) {
                alienDir = -alienDir;
                livingEnemies.forEach(e => e.y += 10);
            } else {
                livingEnemies.forEach(e => e.x += alienDir * (0.8 + wave * 0.2));
            }

            // Alien shoots random lasers
            if (Math.random() < 0.035 + wave * 0.005 && livingEnemies.length > 0) {
                const shooter = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
                enemyLasers.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooter.height, width: 3, height: 10 });
            }

            // Laser vs Alien collisions
            lasers.forEach((l, lIdx) => {
                enemies.forEach(e => {
                    if (e.alive && l.x > e.x && l.x < e.x + e.width && l.y > e.y && l.y < e.y + e.height) {
                        e.alive = false;
                        lasers.splice(lIdx, 1);
                        score += 50;
                        scoreEl.innerText = score;
                        createExplosion(e.x + 14, e.y + 10, '#38bdf8');
                        km.audio.playTone(300 + score % 400, 0.05, 'sawtooth', 0.15);

                        if (score > highScore) {
                            highScore = score;
                            localStorage.setItem('novaos_space_high', highScore);
                            highEl.innerText = highScore;
                        }
                    }
                });
            });

            // Particles
            particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.035;
                if (p.alpha <= 0) particles.splice(idx, 1);
            });
        };

        const renderGame = () => {
            ctx.fillStyle = '#050713';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Stars
            ctx.fillStyle = '#ffffff';
            stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Player Ship
            if (lives > 0) {
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(player.x + player.width / 2, player.y);
                ctx.lineTo(player.x + player.width, player.y + player.height);
                ctx.lineTo(player.x + player.width / 2, player.y + player.height - 6);
                ctx.lineTo(player.x, player.y + player.height);
                ctx.closePath();
                ctx.fill();

                // Thruster flame
                ctx.fillStyle = Math.random() < 0.5 ? '#f97316' : '#eab308';
                ctx.beginPath();
                ctx.moveTo(player.x + player.width / 2 - 4, player.y + player.height - 4);
                ctx.lineTo(player.x + player.width / 2 + 4, player.y + player.height - 4);
                ctx.lineTo(player.x + player.width / 2, player.y + player.height + 6 + Math.random() * 4);
                ctx.closePath();
                ctx.fill();
            }

            // Draw Lasers
            ctx.fillStyle = '#38bdf8';
            lasers.forEach(l => ctx.fillRect(l.x, l.y, l.width, l.height));

            // Draw Enemy Lasers
            ctx.fillStyle = '#f43f5e';
            enemyLasers.forEach(el => ctx.fillRect(el.x, el.y, el.width, el.height));

            // Draw Aliens
            enemies.forEach(e => {
                if (!e.alive) return;
                ctx.fillStyle = e.type === 0 ? '#a855f7' : (e.type === 1 ? '#22c55e' : '#f59e0b');
                // Draw cool alien shape
                ctx.fillRect(e.x + 4, e.y, e.width - 8, e.height);
                ctx.fillRect(e.x, e.y + 4, e.width, e.height - 8);
                // Eyes
                ctx.fillStyle = '#000000';
                ctx.fillRect(e.x + 6, e.y + 6, 4, 4);
                ctx.fillRect(e.x + e.width - 10, e.y + 6, 4, 4);
            });

            // Draw Particles
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.globalAlpha = 1.0;
            });

            // Game Over overlay
            if (gameOver) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 10);
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px sans-serif';
                ctx.fillText(`Final Score: ${score} - Wave ${wave}`, canvas.width / 2, canvas.height / 2 + 25);
            }
        };

        const gameLoop = () => {
            updateGame();
            renderGame();
            animId = requestAnimationFrame(gameLoop);
        };

        const keyDown = (e) => { keys[e.code] = true; };
        const keyUp = (e) => { keys[e.code] = false; };
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);

        const restartGame = () => {
            score = 0;
            lives = 3;
            gameOver = false;
            scoreEl.innerText = '0';
            livesEl.innerText = '❤️❤️❤️';
            player.x = canvas.width / 2 - 15;
            lasers = [];
            initWave(1);
        };

        win.body.querySelector('#sg-restart-btn').addEventListener('click', restartGame);

        restartGame();
        gameLoop();

        win.onClose = () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('keydown', keyDown);
            window.removeEventListener('keyup', keyUp);
        };

        return win;
    }
}

/* =========================================================================
   14. Sticky Notes Application
   ========================================================================= */
class StickyNotesApp {
    static launch(wm, km) {
        const getSavedNotes = () => {
            try {
                const data = localStorage.getItem('novaos_sticky_notes');
                return data ? JSON.parse(data) : [
                    { id: 1, text: '🪐 Welcome to NovaNotes!\n- Click "+ Add Note" to create more.\n- Choose different pastel colors.', color: '#fef08a' }
                ];
            } catch (e) {
                return [];
            }
        };

        let notes = getSavedNotes();

        const win = wm.createWindow({
            id: 'app_notes_' + Date.now(),
            title: 'Sticky Notes',
            icon: '🗒️',
            width: 620,
            height: 480,
            content: `
                <div class="notes-app">
                    <div class="notes-toolbar">
                        <button class="tm-btn" id="notes-add-btn">+ Add Note</button>
                        <span style="color:#94a3b8; font-size:11.5px; margin-left:auto;">Auto-saves to system</span>
                    </div>
                    <div class="notes-grid" id="notes-grid"></div>
                </div>
            `
        });

        const grid = win.body.querySelector('#notes-grid');

        const saveNotes = () => {
            localStorage.setItem('novaos_sticky_notes', JSON.stringify(notes));
        };

        const renderNotes = () => {
            grid.innerHTML = '';
            notes.forEach((note, idx) => {
                const el = document.createElement('div');
                el.className = 'sticky-note';
                el.style.background = note.color || '#fef08a';

                el.innerHTML = `
                    <div class="note-header">
                        <div class="note-colors">
                            <span class="nc-dot" style="background:#fef08a" data-color="#fef08a"></span>
                            <span class="nc-dot" style="background:#bae6fd" data-color="#bae6fd"></span>
                            <span class="nc-dot" style="background:#bbf7d0" data-color="#bbf7d0"></span>
                            <span class="nc-dot" style="background:#fbcfe8" data-color="#fbcfe8"></span>
                            <span class="nc-dot" style="background:#e9d5ff" data-color="#e9d5ff"></span>
                        </div>
                        <button class="note-del-btn" title="Delete Note">✕</button>
                    </div>
                    <textarea class="note-textarea" placeholder="Write your note here...">${escapeHtml(note.text)}</textarea>
                `;

                const textarea = el.querySelector('.note-textarea');
                textarea.addEventListener('input', () => {
                    note.text = textarea.value;
                    saveNotes();
                });

                el.querySelectorAll('.nc-dot').forEach(dot => {
                    dot.addEventListener('click', () => {
                        note.color = dot.dataset.color;
                        el.style.background = note.color;
                        saveNotes();
                    });
                });

                el.querySelector('.note-del-btn').addEventListener('click', () => {
                    notes.splice(idx, 1);
                    saveNotes();
                    renderNotes();
                });

                grid.appendChild(el);
            });
        };

        win.body.querySelector('#notes-add-btn').addEventListener('click', () => {
            const colors = ['#fef08a', '#bae6fd', '#bbf7d0', '#fbcfe8', '#e9d5ff'];
            notes.push({
                id: Date.now(),
                text: '',
                color: colors[notes.length % colors.length]
            });
            saveNotes();
            renderNotes();
        });

        renderNotes();
        return win;
    }
}

/* =========================================================================
   15. Virtual Piano & Synthesizer Application
   ========================================================================= */
class PianoApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_piano_' + Date.now(),
            title: 'NovaSynth Piano Keyboard',
            icon: '🎹',
            width: 740,
            height: 380,
            resizable: false,
            content: `
                <div class="piano-app">
                    <div class="piano-controls">
                        <div class="piano-ctrl-group">
                            <label>Waveform:</label>
                            <select id="piano-wave-select" class="fe-path-input" style="width:130px; height:28px;">
                                <option value="sine">Grand Piano (Sine)</option>
                                <option value="sawtooth">Synth Lead (Saw)</option>
                                <option value="square">8-Bit Chip (Square)</option>
                                <option value="triangle">Warm Organ (Tri)</option>
                            </select>
                        </div>
                        <div class="piano-ctrl-group" style="margin-left:auto;">
                            <span style="color:#94a3b8; font-size:11.5px;">Click keys or use keyboard (A-K keys)</span>
                        </div>
                    </div>
                    <div class="piano-keyboard-wrap">
                        <div class="piano-keys" id="piano-keys-container"></div>
                    </div>
                </div>
            `
        });

        const container = win.body.querySelector('#piano-keys-container');
        const waveSelect = win.body.querySelector('#piano-wave-select');
        let currentWave = 'sine';

        waveSelect.addEventListener('change', (e) => {
            currentWave = e.target.value;
        });

        // 2 Octaves notes definition
        const whiteNotes = [
            { note: 'C4', freq: 261.63, key: 'A' },
            { note: 'D4', freq: 293.66, key: 'S' },
            { note: 'E4', freq: 329.63, key: 'D' },
            { note: 'F4', freq: 349.23, key: 'F' },
            { note: 'G4', freq: 392.00, key: 'G' },
            { note: 'A4', freq: 440.00, key: 'H' },
            { note: 'B4', freq: 493.88, key: 'J' },
            { note: 'C5', freq: 523.25, key: 'K' },
            { note: 'D5', freq: 587.33, key: 'L' },
            { note: 'E5', freq: 659.25, key: ';' },
            { note: 'F5', freq: 698.46, key: "'" },
            { note: 'G5', freq: 783.99, key: 'Z' },
            { note: 'A5', freq: 880.00, key: 'X' },
            { note: 'B5', freq: 987.77, key: 'C' }
        ];

        const blackNotes = [
            { note: 'C#4', freq: 277.18, key: 'W', left: 34 },
            { note: 'D#4', freq: 311.13, key: 'E', left: 82 },
            { note: 'F#4', freq: 369.99, key: 'T', left: 178 },
            { note: 'G#4', freq: 415.30, key: 'Y', left: 226 },
            { note: 'A#4', freq: 466.16, key: 'U', left: 274 },
            { note: 'C#5', freq: 554.37, key: 'O', left: 370 },
            { note: 'D#5', freq: 622.25, key: 'P', left: 418 },
            { note: 'F#5', freq: 739.99, key: ']', left: 514 },
            { note: 'G#5', freq: 830.61, key: '1', left: 562 },
            { note: 'A#5', freq: 932.33, key: '2', left: 610 }
        ];

        const playNote = (freq, keyEl) => {
            km.audio.playTone(freq, 0.45, currentWave, 0.35);
            if (keyEl) {
                keyEl.classList.add('pressed');
                setTimeout(() => keyEl.classList.remove('pressed'), 180);
            }
        };

        // Render white keys
        whiteNotes.forEach(w => {
            const keyEl = document.createElement('div');
            keyEl.className = 'piano-key white-key';
            keyEl.dataset.key = w.key;
            keyEl.innerHTML = `<span class="p-note-label">${w.note}</span><span class="p-key-hint">${w.key}</span>`;
            keyEl.addEventListener('mousedown', () => playNote(w.freq, keyEl));
            container.appendChild(keyEl);
        });

        // Render black keys
        blackNotes.forEach(b => {
            const keyEl = document.createElement('div');
            keyEl.className = 'piano-key black-key';
            keyEl.style.left = `${b.left}px`;
            keyEl.dataset.key = b.key;
            keyEl.innerHTML = `<span class="p-note-label">${b.note}</span><span class="p-key-hint">${b.key}</span>`;
            keyEl.addEventListener('mousedown', () => playNote(b.freq, keyEl));
            container.appendChild(keyEl);
        });

        // Key down listener
        const handleKeyDown = (e) => {
            const k = e.key.toUpperCase();
            const noteObj = [...whiteNotes, ...blackNotes].find(n => n.key === k);
            if (noteObj) {
                const el = container.querySelector(`[data-key="${k}"]`);
                playNote(noteObj.freq, el);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        win.onClose = () => window.removeEventListener('keydown', handleKeyDown);

        return win;
    }
}

/* =========================================================================
   16. World Clock & Stopwatch Application
   ========================================================================= */
class ClockApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_clock_' + Date.now(),
            title: 'World Clock & Stopwatch',
            icon: '⏱️',
            width: 580,
            height: 460,
            content: `
                <div class="clock-app">
                    <div class="clock-tabs">
                        <button class="c-tab active" data-tab="world">🌍 World Clock</button>
                        <button class="c-tab" data-tab="stopwatch">⏱️ Stopwatch</button>
                        <button class="c-tab" data-tab="timer">⏳ Timer</button>
                    </div>
                    <div class="clock-body">
                        <!-- World Clock Pane -->
                        <div class="clock-pane active" id="cpane-world">
                            <div class="world-clock-grid">
                                <div class="wclock-card">
                                    <div class="wclock-city">Local Device</div>
                                    <div class="wclock-time" id="wc-local">--:--:--</div>
                                    <div class="wclock-tz">System Local Time</div>
                                </div>
                                <div class="wclock-card">
                                    <div class="wclock-city">UTC / GMT</div>
                                    <div class="wclock-time" id="wc-utc">--:--:--</div>
                                    <div class="wclock-tz">Universal Coordinated</div>
                                </div>
                                <div class="wclock-card">
                                    <div class="wclock-city">New York</div>
                                    <div class="wclock-time" id="wc-ny">--:--:--</div>
                                    <div class="wclock-tz">EDT / EST</div>
                                </div>
                                <div class="wclock-card">
                                    <div class="wclock-city">Tokyo</div>
                                    <div class="wclock-time" id="wc-tokyo">--:--:--</div>
                                    <div class="wclock-tz">JST (+9)</div>
                                </div>
                            </div>
                        </div>

                        <!-- Stopwatch Pane -->
                        <div class="clock-pane" id="cpane-stopwatch">
                            <div class="stopwatch-display" id="sw-display">00:00.00</div>
                            <div class="stopwatch-controls">
                                <button class="tm-btn" id="sw-start-btn">Start</button>
                                <button class="tm-btn" id="sw-lap-btn" disabled>Lap</button>
                                <button class="tm-btn" id="sw-reset-btn">Reset</button>
                            </div>
                            <div class="stopwatch-laps" id="sw-laps"></div>
                        </div>

                        <!-- Countdown Timer Pane -->
                        <div class="clock-pane" id="cpane-timer">
                            <div class="timer-inputs-row">
                                <input type="number" id="t-min" min="0" max="99" value="1" class="timer-num-input" />
                                <span>min</span>
                                <input type="number" id="t-sec" min="0" max="59" value="0" class="timer-num-input" />
                                <span>sec</span>
                            </div>
                            <div class="timer-display" id="t-display">01:00</div>
                            <div class="stopwatch-controls">
                                <button class="tm-btn" id="t-start-btn">Start Timer</button>
                                <button class="tm-btn" id="t-reset-btn">Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });

        // Tab Switching
        win.body.querySelectorAll('.c-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                win.body.querySelectorAll('.c-tab').forEach(t => t.classList.remove('active'));
                win.body.querySelectorAll('.clock-pane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                win.body.querySelector(`#cpane-${tab.dataset.tab}`).classList.add('active');
            });
        });

        // World Clock Loop
        const updateWorldClocks = () => {
            const now = new Date();
            const format = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
            const elLocal = win.body.querySelector('#wc-local');
            const elUtc = win.body.querySelector('#wc-utc');
            const elNy = win.body.querySelector('#wc-ny');
            const elTokyo = win.body.querySelector('#wc-tokyo');

            if (elLocal) elLocal.innerText = now.toLocaleTimeString([], { hour12: false });
            if (elUtc) elUtc.innerText = format('UTC');
            if (elNy) elNy.innerText = format('America/New_York');
            if (elTokyo) elTokyo.innerText = format('Asia/Tokyo');
        };
        const clockInterval = setInterval(updateWorldClocks, 1000);
        updateWorldClocks();

        // Stopwatch Logic
        const swDisplay = win.body.querySelector('#sw-display');
        const swStartBtn = win.body.querySelector('#sw-start-btn');
        const swLapBtn = win.body.querySelector('#sw-lap-btn');
        const swResetBtn = win.body.querySelector('#sw-reset-btn');
        const swLaps = win.body.querySelector('#sw-laps');

        let swRunning = false;
        let swStartTime = 0;
        let swElapsed = 0;
        let swInterval = null;
        let laps = [];

        const formatSw = (ms) => {
            const totalSec = Math.floor(ms / 1000);
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            const cs = Math.floor((ms % 1000) / 10);
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
        };

        swStartBtn.addEventListener('click', () => {
            swRunning = !swRunning;
            swStartBtn.innerText = swRunning ? 'Pause' : 'Resume';
            swLapBtn.disabled = !swRunning;

            if (swRunning) {
                swStartTime = Date.now() - swElapsed;
                swInterval = setInterval(() => {
                    swElapsed = Date.now() - swStartTime;
                    swDisplay.innerText = formatSw(swElapsed);
                }, 20);
            } else {
                clearInterval(swInterval);
            }
        });

        swLapBtn.addEventListener('click', () => {
            laps.unshift(formatSw(swElapsed));
            swLaps.innerHTML = laps.map((l, i) => `<div class="sw-lap-row"><span>Lap ${laps.length - i}</span><b>${l}</b></div>`).join('');
        });

        swResetBtn.addEventListener('click', () => {
            swRunning = false;
            clearInterval(swInterval);
            swElapsed = 0;
            laps = [];
            swDisplay.innerText = '00:00.00';
            swStartBtn.innerText = 'Start';
            swLapBtn.disabled = true;
            swLaps.innerHTML = '';
        });

        // Timer Logic
        const tMinInput = win.body.querySelector('#t-min');
        const tSecInput = win.body.querySelector('#t-sec');
        const tDisplay = win.body.querySelector('#t-display');
        const tStartBtn = win.body.querySelector('#t-start-btn');
        const tResetBtn = win.body.querySelector('#t-reset-btn');

        let tRunning = false;
        let tRemaining = 60;
        let tInterval = null;

        const updateTimerDisplay = () => {
            const m = Math.floor(tRemaining / 60);
            const s = tRemaining % 60;
            tDisplay.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        tStartBtn.addEventListener('click', () => {
            tRunning = !tRunning;
            tStartBtn.innerText = tRunning ? 'Pause Timer' : 'Resume Timer';

            if (tRunning) {
                if (tRemaining <= 0) {
                    tRemaining = (parseInt(tMinInput.value) || 0) * 60 + (parseInt(tSecInput.value) || 0);
                }
                tInterval = setInterval(() => {
                    if (tRemaining > 0) {
                        tRemaining--;
                        updateTimerDisplay();
                    } else {
                        clearInterval(tInterval);
                        tRunning = false;
                        tStartBtn.innerText = 'Start Timer';
                        km.audio.playStartup();
                        wm.notify('Timer Finished', 'Your countdown timer has expired!', '⏳', 'info');
                    }
                }, 1000);
            } else {
                clearInterval(tInterval);
            }
        });

        tResetBtn.addEventListener('click', () => {
            tRunning = false;
            clearInterval(tInterval);
            tStartBtn.innerText = 'Start Timer';
            tRemaining = (parseInt(tMinInput.value) || 0) * 60 + (parseInt(tSecInput.value) || 0);
            updateTimerDisplay();
        });

        win.onClose = () => {
            clearInterval(clockInterval);
            clearInterval(swInterval);
            clearInterval(tInterval);
        };

        return win;
    }
}

/* =========================================================================
   17. DevConverter Base & Bitwise Studio Application
   ========================================================================= */
class DevConverterApp {
    static launch(wm, km) {
        const win = wm.createWindow({
            id: 'app_converter_' + Date.now(),
            title: 'DevConverter Studio',
            icon: '🖩',
            width: 660,
            height: 490,
            content: `
                <div class="converter-app">
                    <div class="conv-grid">
                        <div class="conv-field">
                            <label>Decimal (Base 10):</label>
                            <input type="text" id="conv-dec" class="conv-input" value="42" />
                        </div>
                        <div class="conv-field">
                            <label>Hexadecimal (Base 16):</label>
                            <input type="text" id="conv-hex" class="conv-input" value="2A" />
                        </div>
                        <div class="conv-field">
                            <label>Binary (Base 2):</label>
                            <input type="text" id="conv-bin" class="conv-input" value="101010" />
                        </div>
                        <div class="conv-field">
                            <label>Octal (Base 8):</label>
                            <input type="text" id="conv-oct" class="conv-input" value="52" />
                        </div>
                        <div class="conv-field">
                            <label>ASCII Character:</label>
                            <input type="text" id="conv-ascii" class="conv-input" value="*" />
                        </div>
                        <div class="conv-field">
                            <label>Base64 Encoded:</label>
                            <input type="text" id="conv-b64" class="conv-input" value="Kg==" />
                        </div>
                    </div>

                    <div class="conv-bit-section">
                        <div class="conv-bit-title">32-Bit Binary Visualizer (Click bits to toggle)</div>
                        <div class="bit-grid" id="conv-bit-grid"></div>
                    </div>
                </div>
            `
        });

        const decEl = win.body.querySelector('#conv-dec');
        const hexEl = win.body.querySelector('#conv-hex');
        const binEl = win.body.querySelector('#conv-bin');
        const octEl = win.body.querySelector('#conv-oct');
        const asciiEl = win.body.querySelector('#conv-ascii');
        const b64El = win.body.querySelector('#conv-b64');
        const bitGrid = win.body.querySelector('#conv-bit-grid');

        let currentValue = 42;

        const updateAllFields = (val, source = null) => {
            currentValue = val >>> 0; // unsigned 32-bit

            if (source !== 'dec') decEl.value = currentValue.toString(10);
            if (source !== 'hex') hexEl.value = currentValue.toString(16).toUpperCase();
            if (source !== 'bin') binEl.value = currentValue.toString(2);
            if (source !== 'oct') octEl.value = currentValue.toString(8);
            if (source !== 'ascii') {
                asciiEl.value = (currentValue >= 32 && currentValue <= 126) ? String.fromCharCode(currentValue) : '(non-printable)';
            }
            if (source !== 'b64') {
                try {
                    b64El.value = btoa(String.fromCharCode(currentValue & 0xFF));
                } catch (e) {
                    b64El.value = '';
                }
            }

            renderBits();
        };

        const renderBits = () => {
            bitGrid.innerHTML = '';
            for (let i = 31; i >= 0; i--) {
                const bitVal = (currentValue >> i) & 1;
                const btn = document.createElement('button');
                btn.className = `bit-btn ${bitVal ? 'on' : 'off'}`;
                btn.innerHTML = `<span class="bit-num">${i}</span><b class="bit-val">${bitVal}</b>`;

                btn.addEventListener('click', () => {
                    const toggled = currentValue ^ (1 << i);
                    updateAllFields(toggled);
                    km.audio.playTone(600 + i * 20, 0.03, 'sine', 0.1);
                });

                bitGrid.appendChild(btn);
            }
        };

        decEl.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10) || 0;
            updateAllFields(val, 'dec');
        });

        hexEl.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 16) || 0;
            updateAllFields(val, 'hex');
        });

        binEl.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 2) || 0;
            updateAllFields(val, 'bin');
        });

        octEl.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 8) || 0;
            updateAllFields(val, 'oct');
        });

        updateAllFields(42);
        return win;
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

