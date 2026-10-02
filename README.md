# 🪐 nova-os-miyaz (NovaOS Miyaz Edition)

[![GitHub Pages](https://img.shields.io/badge/Deployment-Live%20Demo-brightgreen?logo=github)](https://maulanamiyaz28-ux.github.io/New-folder/)
[![Version](https://img.shields.io/badge/version-3.2.0--Miyaz-blue.svg)](https://github.com/maulanamiyaz28-ux/New-folder)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

**`nova-os-miyaz`** is an advanced, ultra-responsive, zero-dependency Operating System running directly inside any modern web browser. It features a preemptive virtual microkernel, persistent Virtual File System (VFS), Glassmorphism window compositing manager, customizable user identity & profile settings, and a comprehensive suite of productivity and entertainment applications.

---

## 🚀 Live Demo & Quick Start

- 🌐 **Live Web Application**: [https://maulanamiyaz28-ux.github.io/New-folder/](https://maulanamiyaz28-ux.github.io/New-folder/)
- 💻 **Local Execution**: Open [`index.html`](file:///c:/Users/HAJIS%20MAULANA/OneDrive/Desktop/New%20folder/index.html) directly in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🌟 Key Features & Architecture

### 1. 👤 User Profile & Identity Center (`nova-os-miyaz`)
- **Live Profile Preview Card**: Real-time interactive identity card with glowing avatar aura, verified badge, level badge (`LVL 9`), active status chip, and bio quotation.
- **Display Name & Handle**: Fully editable profile name and shell handle (`@miyaz`).
- **⚡ 9 Quick Persona Presets**: One-click instant switching between 9 personas (Standard User, Astro Pilot, Cyber Hacker, Quantum Coder, AI Sentinel, Cosmic Voyager, Neon Fox, Volt Accelerator, and Miyaz Sovereign 9).
- **🎭 9 Aesthetic Avatar Presets**: Selectable avatar cards plus custom emoji icon support.
- **OS-Wide Real-Time Synchronization**: Instant sync across Start Menu, Terminal prompt (`username@nova-os-miyaz:~$`), kernel event bus (`profile:updated`), `whoami`, `profile`, and `neofetch`.

### 2. 🔬 Nova Microkernel & Core Services (`kernel.js`)
- **Process Scheduler**: Preemptive task manager tracking PIDs, priority weights, state transitions, and real-time CPU & memory simulation.
- **Virtual File System (VFS)**: Unix-like hierarchical file system (`/`, `/bin`, `/home/user`, `/etc`, `/tmp`, `/var`) with persistent storage across browser reloads via `LocalStorage`.
- **Audio Synthesizer Engine**: 32-bit Float WebAudio DSP sound synthesizer generating startup chimes, window clicks, system notifications, error alerts, and musical synthesis without external audio files.
- **System Event Bus**: Decoupled asynchronous inter-process communication (IPC) channel.

### 3. 🪟 NovaDE Window Manager (`window_manager.js`)
- **Multi-Window Compositing**: Floating, draggable, multi-edge resizable, minimizable, and maximizable windows with dynamic z-index stacking.
- **Fullscreen Mode**: Dedicated taskbar tray button `⛶`, Quick Settings toggle, keyboard shortcut (`F11`), and terminal command (`fullscreen`).
- **Taskbar & Dock**: Running task indicators, live digital clock, system tray with Quick Settings (Volume, Brightness, Theme switcher, Fullscreen, Network indicator).
- **Start Menu**: Categorized app launcher with instant search filtering, profile button, and power controls.
- **Context Menus**: Right-click context menus on Desktop, Taskbar, and File Explorer.
- **Toast Notifications**: Multi-layer notification system with audio feedback.

### 4. 📦 Built-In Application Suite & NovaStore (`apps.js`)
| App | Icon | Description |
|---|---|---|
| **Control Center & Settings** | ⚙️ | **User Profile & Accounts Hub** (Display Name & Handle editor, 9 Persona Presets, 9 avatar presets, role & bio manager with real-time OS sync), Theme selector (*Nebula Dark*, *Cyber Neon*, *macOS Glass*, *Win98 Classic*, *Synthwave 80s*), custom wallpaper upload, DSP volume controls, and VFS reset. |
| **NovaCLI Terminal** | 💻 | Interactive shell with 25+ Unix commands (`ls`, `cat`, `echo`, `mkdir`, `rm`, `cd`, `pwd`, `neofetch`, `matrix`, `ps`, `kill`, `calc`, `tree`, `theme`, `fullscreen`, `pkg`, `cowsay`, `code`, `whoami`, `profile`, `reboot`), tab-autocomplete, and command history. |
| **NovaStore Hub** | 🛍️ | Modular App Store & Package Manager with search, categories, one-click install/uninstall, and desktop sync. |
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
| **Scientific Calculator** | 🧮 | Arithmetic, trigonometric (`sin`, `cos`, `tan`), square root, brackets, and constants (`π`). |
| **Arcade Hub** | 🎮 | Playable retro games: Retro Snake, Minesweeper (with flags & timers), and 2048 with high score tracking. |
| **NovaSynth Music Player** | 🎵 | Procedural chiptune & synthwave player with real-time animated frequency visualizer spectrum. |
| **x86 CPU Sandbox** | 🔬 | Educational CPU emulator with registers (`EAX`, `EBX`, `ECX`, `EDX`, `PC`, `FLAGS`), assembly code editor (`MOV`, `ADD`, `SUB`, `MUL`, `CMP`, `JMP`, `JNZ`, `INT`, `HLT`), instruction stepper, and virtual 16x16 VGA graphics screen! |

---

## 🛠️ File Structure

```text
├── index.html          # Main HTML entry point, SEO metadata & Desktop UI
├── style.css           # Glassmorphism CSS styling, themes & Profile styles
├── kernel.js           # Virtual Microkernel, VFS, Scheduler, Audio Engine, Profile state
├── apps.js             # Application Suite & User Profile Settings implementations
├── window_manager.js   # Window lifecycle, Drag/Resize, Taskbar, Context Menus
├── package.json        # Project metadata for nova-os-miyaz
└── README.md           # Project documentation & GitHub Pages guide
```

---

## 👨‍💻 Author & License

- **Author**: Miyaz ([@maulanamiyaz28-ux](https://github.com/maulanamiyaz28-ux))
- **Project Name**: `nova-os-miyaz`
- **License**: MIT
