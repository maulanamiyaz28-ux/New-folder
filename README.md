# 🪐 NovaOS 3.0 (Quantum Edition)

NovaOS is an advanced, ultra-responsive, zero-dependency Operating System running directly inside any modern web browser. It features a preemptive microkernel, a persistent Virtual File System (VFS), a Glassmorphism window compositing manager, and a comprehensive suite of productivity and entertainment applications.

---

## 🚀 Quick Start

Simply open [`index.html`](file:///c:/Users/HAJIS%20MAULANA/OneDrive/Desktop/New%20folder/index.html) in any browser (Chrome, Edge, Firefox, Safari).

---

## 🌟 Key Features

### 1. 🔬 Nova Microkernel & Core Services (`kernel.js`)
- **Process Scheduler**: Preemptive task manager tracking PIDs, priority weights, state transitions, and real-time CPU & memory usage simulation.
- **Virtual File System (VFS)**: Unix-like hierarchical file system (`/`, `/bin`, `/home/user`, `/etc`, `/tmp`, `/var`) with persistent storage across browser reloads via `LocalStorage`.
- **Audio Synthesizer Engine**: 32-bit Float WebAudio DSP sound synthesizer generating startup chimes, window clicks, system notifications, error alerts, and musical synthesis without requiring external MP3/audio files.
- **System Event Bus**: Decoupled asynchronous inter-process communication (IPC) channel.

### 2. 🪟 NovaDE Window Manager (`window_manager.js`)
- **Multi-Window Compositing**: Floating, draggable, multi-edge resizable, minimizable, and maximizable windows with dynamic z-index stacking.
- **Fullscreen Mode**: Dedicated taskbar tray button `⛶`, Quick Settings toggle, keyboard shortcut (`F11`), and terminal command (`fullscreen`).
- **Taskbar & Dock**: Running task indicators, live digital clock, system tray with Quick Settings (Volume, Brightness, Theme switcher, Fullscreen, Network indicator).
- **Start Menu**: Categorized app launcher with instant search filtering and power controls.
- **Context Menus**: Right-click context menus on Desktop, Taskbar, and File Explorer.
- **Toast Notifications**: Multi-layer notification system with sound effects.

### 3. 📦 Built-In Application Suite & NovaStore (`apps.js`)
| App | Icon | Description |
|---|---|---|
| **NovaStore Hub** | 🛍️ | Modular App Store & Package Manager with search, categories, one-click install/uninstall, and desktop sync. |
| **NovaCLI Terminal** | 💻 | Interactive shell with 25+ Unix commands (`ls`, `cat`, `echo`, `mkdir`, `rm`, `cd`, `pwd`, `neofetch`, `matrix`, `ps`, `kill`, `calc`, `tree`, `theme`, `fullscreen`, `pkg`, `cowsay`, `code`, `reboot`), tab-autocomplete, and command history. |
| **NovaPaint Studio** | 🎨 | Drawing canvas with brushes, geometric shapes, color picker, eraser, and PNG export to VFS & local PC. |
| **Space Invaders** | 🛸 | Retro 2D arcade shooter with alien fleets, particle explosions, synth lasers, waves, and high score tracking. |
| **Sticky Notes** | 🗒️ | Desktop sticky notes with pastel color customization and persistent auto-saving. |
| **NovaSynth Piano** | 🎹 | 2-octave musical piano synthesizer with waveform switching (Sine, Sawtooth, Square) and keyboard key bindings. |
| **World Clock** | ⏱️ | Multi-timezone clock (UTC, NY, Tokyo, London), lap stopwatch, and audible countdown alarm timer. |
| **DevConverter** | 🖩 | Decimal, Hex, Binary, Octal, ASCII, Base64 converter with an interactive 32-bit register bit toggler. |
| **File Explorer** | 📁 | Graphical file manager with Quick Access sidebar, breadcrumbs, grid/list view, new file/folder, rename, delete, import/export. |
| **NovaCode Editor** | 📝 | Code & text editor with line numbers, syntax formatting, multi-tab support, VFS save/load, and built-in JavaScript Code Execution Runner! |
| **Web Browser** | 🌐 | Virtual web browser with address bar, search engine, bookmarks, and reader portals. |
| **Task Manager** | 📊 | Real-time animated Canvas performance graphs (CPU% & RAM allocation), running process list with PID inspection and "End Task" controls. |
| **Control Center & Settings** | ⚙️ | Theme selector (*Nebula Dark*, *Cyber Neon*, *macOS Glass*, *Win98 Classic*, *Synthwave 80s*), custom wallpaper upload, DSP volume controls. |
| **Scientific Calculator** | 🧮 | Arithmetic, trigonometric (`sin`, `cos`, `tan`), square root, brackets, and constants (`π`). |
| **Arcade Hub** | 🎮 | Playable retro games: Retro Snake, Minesweeper (with flags & timers), and 2048 with high score tracking. |
| **NovaSynth Music Player** | 🎵 | Procedural chiptune & synthwave player with real-time animated frequency visualizer spectrum. |
| **x86 CPU Sandbox** | 🔬 | Educational CPU emulator with registers (`EAX`, `EBX`, `ECX`, `EDX`, `PC`, `FLAGS`), assembly code editor (`MOV`, `ADD`, `SUB`, `MUL`, `CMP`, `JMP`, `JNZ`, `INT`, `HLT`), instruction stepper, and virtual 16x16 VGA graphics screen! |


---

## 🛠️ File Structure

```text
├── index.html          # Main HTML entry point & Desktop UI
├── style.css           # Modern Glassmorphism CSS styling & themes
├── kernel.js           # Virtual Microkernel, VFS, Scheduler, Audio Engine
├── apps.js             # Application Suite implementations
├── window_manager.js   # Window lifecycle, Drag/Resize, Taskbar, Context Menus
└── README.md           # Documentation & Overview
```
