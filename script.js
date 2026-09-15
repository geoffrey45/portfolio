/**
 * GEOFFREY HINGA - DEVELOPER PORTFOLIO ENGINE
 * Dual-Pane Synchronization, Interactive Terminal, Web Audio SFX & Theme Engine
 */

(function() {
  'use strict';

  // --- STATE ---
  const state = {
    audioEnabled: true,
    history: [],
    historyIndex: -1,
    commands: [
      'help', 'demos', 'demo', 'crt', 'deck', 'about', 'skills', 'projects', 'project', 'contact',
      'resume', 'cat resume', 'architecture', 'arch', 'matrix',
      'theme', 'clear', 'whoami', 'date', 'uptime', 'audio', 'sudo', 'email'
    ],
    themes: ['theme-default', 'theme-matrix', 'theme-cyberpunk', 'theme-dracula'],
    matrixRunning: false,
    matrixInterval: null,
    startTime: Date.now()
  };

  // --- AUDIO SYNTHESIZER (Mechanical Keyboard Click) ---
  let audioCtx = null;

  function playKeyClick() {
    if (!state.audioEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Pitch variation for authentic click feel
      const freq = 600 + Math.random() * 400;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  }

  // --- DOM ELEMENTS ---
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');
  const soundToggle = document.getElementById('sound-toggle');
  const themeSelect = document.getElementById('theme-select');
  const liveClock = document.getElementById('live-clock');
  const uptimeDisplay = document.getElementById('uptime-display');
  const guiNavTabs = document.querySelectorAll('.nav-tab');
  const displaySections = document.querySelectorAll('.display-section');
  const paneResizer = document.getElementById('pane-resizer');
  const guiPane = document.getElementById('gui-pane');
  const terminalPane = document.getElementById('terminal-pane');

  // --- SYSTEM CLOCK & UPTIME ---
  function updateTime() {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString();

    const diff = Math.floor((Date.now() - state.startTime) / 1000);
    const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
    const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const secs = String(diff % 60).padStart(2, '0');
    uptimeDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> Uptime: ${hrs}:${mins}:${secs}`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // --- THEME SELECTOR ---
  function setTheme(themeClass) {
    state.themes.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(themeClass);
    if (themeSelect) themeSelect.value = themeClass;
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      setTheme(e.target.value);
      printTerminalOutput(`Theme changed to: <span class="term-accent">${e.target.value.replace('theme-', '')}</span>`);
    });
  }

  // --- AUDIO TOGGLE ---
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      soundToggle.innerHTML = state.audioEnabled
        ? `<i class="fa-solid fa-volume-high"></i> Audio: ON`
        : `<i class="fa-solid fa-volume-xmark"></i> Audio: OFF`;
      printTerminalOutput(`Keyboard audio: <span class="term-accent">${state.audioEnabled ? 'ENABLED' : 'DISABLED'}</span>`);
    });
  }

  // --- CRT SCANLINES TOGGLE ---
  const crtToggle = document.getElementById('crt-toggle');
  function toggleCRT(forceState) {
    const isNowActive = forceState !== undefined ? forceState : !document.body.classList.contains('crt-active');
    if (isNowActive) {
      document.body.classList.add('crt-active');
      if (crtToggle) crtToggle.innerHTML = `<i class="fa-solid fa-tv"></i> CRT: ON`;
      printTerminalOutput(`<span class="term-success">&#x2714; CRT monitor scanlines & phosphor beam: ACTIVE</span>`);
    } else {
      document.body.classList.remove('crt-active');
      if (crtToggle) crtToggle.innerHTML = `<i class="fa-solid fa-tv"></i> CRT: OFF`;
      printTerminalOutput(`<span class="term-accent">CRT scanlines: DISABLED</span>`);
    }
  }

  if (crtToggle) {
    crtToggle.addEventListener('click', () => {
      playKeyClick();
      toggleCRT();
    });
  }

  // --- FULLSCREEN TOGGLE ---
  const deckFullscreenBtn = document.getElementById('deck-fullscreen-btn');
  if (deckFullscreenBtn) {
    deckFullscreenBtn.addEventListener('click', () => {
      playKeyClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        deckFullscreenBtn.innerHTML = `<i class="fa-solid fa-compress"></i>`;
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        deckFullscreenBtn.innerHTML = `<i class="fa-solid fa-expand"></i>`;
      }
    });
  }

  // --- HARDWARE TELEMETRY OSCILLATOR ---
  const telemCpu = document.getElementById('telem-cpu');
  const telemCpuFill = document.getElementById('telem-cpu-fill');
  setInterval(() => {
    const load = Math.floor(18 + Math.random() * 24);
    if (telemCpu) telemCpu.textContent = `${load}%`;
    if (telemCpuFill) telemCpuFill.style.width = `${load}%`;
  }, 2400);

  // --- GUI TAB SWITCHER & TERMINAL SYNC ---
  function switchGuiTab(targetId, updateTerminal = true) {
    // Update active tab button
    guiNavTabs.forEach(tab => {
      if (tab.dataset.target === targetId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update active content section
    displaySections.forEach(sec => {
      if (sec.id === targetId) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Scroll GUI pane smoothly to top of content
    const scrollContainer = document.querySelector('.pane-content-scrollable');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  guiNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playKeyClick();
      const target = tab.dataset.target;
      switchGuiTab(target, false);

      // Trigger corresponding command in terminal for visual link
      const cmdMap = {
        'section-about': 'about',
        'section-skills': 'skills',
        'section-projects': 'projects',
        'section-demos': 'demos',
        'section-experience': 'arch',
        'section-contact': 'contact'
      };
      if (cmdMap[target]) {
        executeCommand(cmdMap[target], false);
      }
    });
  });

  // --- DEMO SANDBOX CONTROLS ---
  const sandboxIframe = document.getElementById('sandbox-iframe');
  const sandboxActiveUrl = document.getElementById('sandbox-active-url');
  const sandboxExternalLink = document.getElementById('sandbox-external-link');
  const sandboxRefreshBtn = document.getElementById('sandbox-refresh-btn');
  const presetButtons = document.querySelectorAll('.preset-btn');

  const demoCatalog = {
    snake: {
      title: 'Snake Game Arcade',
      url: 'https://snake-game-ruby-three.vercel.app',
      platform: 'Vercel'
    },
    website: {
      title: 'Car Sales Marketplace',
      url: 'https://website-puce-omega.vercel.app',
      platform: 'Vercel'
    },
    geoffrey: {
      title: 'Geoffrey Showcase Portal',
      url: 'https://geoffrey45.github.io/geoffrey/',
      platform: 'GitHub Pages'
    }
  };

  function loadDemoInSandbox(demoKey) {
    const demo = demoCatalog[demoKey];
    if (!demo) return false;

    if (sandboxIframe) sandboxIframe.src = demo.url;
    if (sandboxActiveUrl) sandboxActiveUrl.textContent = demo.url;
    if (sandboxExternalLink) sandboxExternalLink.href = demo.url;

    presetButtons.forEach(btn => {
      if (btn.dataset.demoId === demoKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    return true;
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playKeyClick();
      const id = btn.dataset.demoId;
      loadDemoInSandbox(id);
      executeCommand('demo ' + id, false);
    });
  });

  if (sandboxRefreshBtn) {
    sandboxRefreshBtn.addEventListener('click', () => {
      playKeyClick();
      if (sandboxIframe) {
        const currentSrc = sandboxIframe.src;
        sandboxIframe.src = '';
        setTimeout(() => { sandboxIframe.src = currentSrc; }, 100);
      }
    });
  }

  // Handle Load In Sandbox buttons in catalog
  document.querySelectorAll('.btn-demo-load').forEach(btn => {
    btn.addEventListener('click', () => {
      playKeyClick();
      const target = btn.dataset.demoTarget;
      loadDemoInSandbox(target);
      executeCommand('demo ' + target);
      const sandboxWrapper = document.querySelector('.demo-sandbox-wrapper');
      if (sandboxWrapper) {
        sandboxWrapper.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Attach buttons with [data-cmd]
  document.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playKeyClick();
      const cmd = btn.dataset.cmd;
      executeCommand(cmd);
      if (terminalInput) terminalInput.focus();
    });
  });

  // Quick Chips in Terminal
  document.querySelectorAll('.term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      playKeyClick();
      const cmd = chip.dataset.cmd;
      executeCommand(cmd);
      if (terminalInput) terminalInput.focus();
    });
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playKeyClick();
      const text = btn.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check text-success"></i>`;
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
        printTerminalOutput(`<span class="term-success">&#x2714; Copied "${text}" to clipboard.</span>`);
      });
    });
  });

  // --- PANE RESIZER (Split Screen Dragging) ---
  if (paneResizer) {
    let isDragging = false;

    paneResizer.addEventListener('mousedown', (e) => {
      isDragging = true;
      paneResizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const containerWidth = document.querySelector('.dual-workspace').offsetWidth;
      const newGuiWidth = (e.clientX / containerWidth) * 100;

      if (newGuiWidth > 20 && newGuiWidth < 80) {
        guiPane.style.flex = `0 0 ${newGuiWidth}%`;
        terminalPane.style.flex = `0 0 ${100 - newGuiWidth}%`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        paneResizer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // Window control dots on terminal
  const termClose = document.getElementById('term-close-btn');
  const termMin = document.getElementById('term-minimize-btn');
  const termMax = document.getElementById('term-maximize-btn');

  if (termClose) termClose.addEventListener('click', () => executeCommand('clear'));
  if (termMin) termMin.addEventListener('click', () => {
    guiPane.style.flex = '1 1 80%';
    terminalPane.style.flex = '1 1 20%';
  });
  if (termMax) termMax.addEventListener('click', () => {
    guiPane.style.flex = '1 1 20%';
    terminalPane.style.flex = '1 1 80%';
  });

  // --- TERMINAL OUTPUT RENDERING ---
  function printTerminalOutput(htmlContent, isCommand = false, commandStr = '') {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'term-line';

    if (isCommand) {
      lineDiv.innerHTML = `
        <div class="term-history-cmd">
          <span class="prompt-user">guest</span><span class="prompt-at">@</span><span class="prompt-host">geoffrey</span><span class="prompt-colon">:</span><span class="prompt-path">~</span><span class="prompt-symbol">$</span>
          <span style="color: var(--term-cmd-text); font-weight: 500;">${escapeHtml(commandStr)}</span>
        </div>
      `;
    }

    if (htmlContent) {
      const outDiv = document.createElement('div');
      outDiv.className = 'term-output-block';
      outDiv.innerHTML = htmlContent;
      lineDiv.appendChild(outDiv);
    }

    terminalOutput.appendChild(lineDiv);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- WELCOME BANNER ---
  function printWelcome() {
    const asciiBanner = `
  ██████╗ ███████╗ ██████╗ ███████╗███████╗██████╗ ███████╗██╗   ██╗██╗  ██╗███████╗
 ██╔════╝ ██╔════╝██╔═══██╗██╔════╝██╔════╝██╔══██╗██╔════╝╚██╗ ██╔╝██║  ██║██╔════╝
 ██║  ███╗█████╗  ██║   ██║█████╗  █████╗  ██████╔╝█████╗   ╚████╔╝ ███████║███████╗
 ██║   ██║██╔══╝  ██║   ██║██╔══╝  ██╔══╝  ██╔══██╗██╔══╝    ╚██╔╝  ╚════██║╚════██║
 ╚██████╔╝███████╗╚██████╔╝██║     ██║     ██║  ██║███████╗   ██║        ██║███████║
  ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝        ╚═╝╚══════╝
    `;
    const welcomeHtml = `
      <div class="banner-ascii">${asciiBanner}</div>
      <p><span class="term-tag">Geoffrey Hinga</span> | <span class="term-accent">Software Engineer &bull; Backend & Native Mobile Architect</span></p>
      <p style="color: var(--text-muted); margin: 6px 0;">
        Welcome to the dual-partition terminal. Type commands below to explore my projects, technical stack, architecture, and contact info. The visual GUI partition on the left will update in sync!
      </p>
      <p style="margin-bottom: 8px;">
        Type <span class="term-accent" style="font-weight: 700;">'help'</span> to inspect available commands, or click any chip above.
      </p>
    `;
    printTerminalOutput(welcomeHtml);
  }

  // --- COMMAND DEFINITIONS ---
  const commandsData = {
    help: () => {
      return `
        <p class="term-tag">AVAILABLE COMMANDS & UTILITIES:</p>
        <table class="cmd-table">
          <tr><td class="cmd-col">deck</td><td class="desc-col">Display cyberdeck hardware telemetry & system status</td></tr>
          <tr><td class="cmd-col">crt [on|off]</td><td class="desc-col">Toggle retro CRT monitor scanlines & phosphor beam</td></tr>
          <tr><td class="cmd-col">demos</td><td class="desc-col">List all interactive live application sandboxes</td></tr>
          <tr><td class="cmd-col">demo &lt;name&gt;</td><td class="desc-col">Load live demo into sandbox (e.g. <code>demo snake</code>, <code>demo website</code>)</td></tr>
          <tr><td class="cmd-col">about</td><td class="desc-col">Engineering background, focus areas & bio</td></tr>
          <tr><td class="cmd-col">skills</td><td class="desc-col">Technical languages, frameworks, databases & tools</td></tr>
          <tr><td class="cmd-col">projects</td><td class="desc-col">List all featured projects & live web apps</td></tr>
          <tr><td class="cmd-col">project &lt;id&gt;</td><td class="desc-col">Deep dive into specific project (e.g. <code>project snake-game</code>)</td></tr>
          <tr><td class="cmd-col">architecture / arch</td><td class="desc-col">Distributed systems & mobile design philosophy</td></tr>
          <tr><td class="cmd-col">contact</td><td class="desc-col">Direct email, phone, and GitHub links</td></tr>
          <tr><td class="cmd-col">cat resume / resume</td><td class="desc-col">Full resume & curriculum vitae summary</td></tr>
          <tr><td class="cmd-col">matrix</td><td class="desc-col">Launch digital rain animation inside terminal</td></tr>
          <tr><td class="cmd-col">theme &lt;name&gt;</td><td class="desc-col">Change theme: default, matrix, cyberpunk, dracula</td></tr>
          <tr><td class="cmd-col">audio</td><td class="desc-col">Toggle mechanical keyboard sound effects</td></tr>
          <tr><td class="cmd-col">email &lt;msg&gt;</td><td class="desc-col">Trigger mail client with your custom draft message</td></tr>
          <tr><td class="cmd-col">whoami</td><td class="desc-col">Current session identification</td></tr>
          <tr><td class="cmd-col">date / uptime</td><td class="desc-col">System timestamp and active uptime</td></tr>
          <tr><td class="cmd-col">clear / Ctrl+L</td><td class="desc-col">Clear the terminal display</td></tr>
          <tr><td class="cmd-col">sudo</td><td class="desc-col">Administrative privilege escalation</td></tr>
        </table>
      `;
    },

    crt: (args) => {
      const a = (args || '').toLowerCase().trim();
      if (a === 'on') toggleCRT(true);
      else if (a === 'off') toggleCRT(false);
      else toggleCRT();
      return '';
    },

    deck: () => {
      return `
        <p class="term-tag">CYBERDECK HARDWARE & SYSTEM TELEMETRY DIAGNOSTICS:</p>
        <pre style="font-family: var(--font-mono); font-size: 11.5px; color: var(--accent-secondary); line-height: 1.5; margin: 6px 0;">
+----------------------+------------------------------------+
| MODULE               | TELEMETRY STATUS                   |
+----------------------+------------------------------------+
| Cyberdeck Model      | G-45 Tactical Workstation (v2.4.0) |
| Architecture Kernel  | Distributed Web & Native Micro-Ops |
| Active Identity      | Geoffrey Hinga (@geoffrey45)       |
| Primary Stack        | C#, Java, Python, Kotlin, SQL, ASP |
| Network Ping / Edge  | 190 ms (Cloudflare Anycast CDN)    |
| Throughput Bandwidth | 124.70 Mbps DL / 27.17 Mbps UL     |
| Cryptographic Link   | TLS 1.3 / AES-256 GCM Authenticated|
| Video Subsystem      | Dual-Partition GUI + Shell Monitor |
| Live Sandboxes       | Snake Arcade, Car Portal, GH Pages |
+----------------------+------------------------------------+
        </pre>
        <p style="color: var(--text-muted);">Tip: Toggle CRT scanlines with <code>crt</code> or click the top TV button.</p>
      `;
    },

    demos: () => {
      switchGuiTab('section-demos', false);
      return `
        <p class="term-tag">INTERACTIVE LIVE DEMOS & SANDBOXES:</p>
        <table class="cmd-table" style="margin-top: 8px;">
          <tr>
            <td class="cmd-col"><a href="https://snake-game-ruby-three.vercel.app" target="_blank">demo snake</a></td>
            <td class="desc-col">[Vercel Live] Playable Snake Arcade game with Canvas rendering.</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://website-puce-omega.vercel.app" target="_blank">demo website</a></td>
            <td class="desc-col">[Vercel Live] Automotive vehicle marketplace & commercial showroom.</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://geoffrey45.github.io/geoffrey/" target="_blank">demo geoffrey</a></td>
            <td class="desc-col">[GitHub Pages] Personal static web showcase on edge CDN.</td>
          </tr>
        </table>
        <p style="margin-top: 8px; color: var(--term-accent);">Run <code>demo &lt;name&gt;</code> (e.g. <code>demo snake</code>) to load it live into the sandbox viewer on the left!</p>
        <p style="color: var(--text-dim); margin-top: 4px;">[GUI synchronized to: Live Demos view]</p>
      `;
    },

    demo: (args) => {
      const d = (args || '').toLowerCase().trim();
      switchGuiTab('section-demos', false);

      let key = '';
      if (d.includes('snake')) key = 'snake';
      else if (d.includes('web') || d.includes('car')) key = 'website';
      else if (d.includes('geoff') || d.includes('gh')) key = 'geoffrey';

      if (!key) {
        return commandsData.demos();
      }

      loadDemoInSandbox(key);
      const demo = demoCatalog[key];
      return `
        <p class="term-success">&#x25B6; Loaded <strong>${demo.title}</strong> into the interactive sandbox frame!</p>
        <p>&bull; <strong>Platform:</strong> ${demo.platform}</p>
        <p>&bull; <strong>Live URL:</strong> <a href="${demo.url}" target="_blank">${demo.url}</a></p>
        <p style="color: var(--text-dim); margin-top: 4px;">You can play and interact with it directly inside the left panel display!</p>
      `;
    },

    about: () => {
      switchGuiTab('section-about', false);
      return `
        <p class="term-tag">ABOUT GEOFFREY HINGA (Atomic_Brilliant):</p>
        <p style="margin-top: 4px; color: var(--term-out-text);">
          Software Engineer focused on building robust web architectures and native mobile applications.<br/>
          &bull; <strong>Core Focus:</strong> Distributed systems, high-throughput backend APIs, and native Android apps.<br/>
          &bull; <strong>Philosophy:</strong> Write resilient, maintainable, self-documenting code with decoupled services.<br/>
          &bull; <strong>Status:</strong> <span class="term-success">&#x25CF; Open to full-time, contract, and collaborative distributed projects.</span>
        </p>
        <p style="margin-top: 6px; color: var(--text-dim);">[GUI synchronized to: About view]</p>
      `;
    },

    skills: () => {
      switchGuiTab('section-skills', false);
      return `
        <p class="term-tag">TECHNICAL SKILLSET & TECH STACK:</p>
        <div style="margin: 6px 0; line-height: 1.7;">
          <div><span class="term-accent">&#x25B8; Languages:</span> C#, Java, Python, Kotlin, JavaScript, SQL, HTML5/CSS3</div>
          <div><span class="term-accent">&#x25B8; Backend & APIs:</span> ASP.NET Core, RESTful APIs, Microservices, Distributed Systems</div>
          <div><span class="term-accent">&#x25B8; Mobile Native:</span> Android Native Development (Kotlin, Jetpack, MVVM)</div>
          <div><span class="term-accent">&#x25B8; Databases:</span> SQL Server, PostgreSQL, Relational Schema Design & Indexing</div>
          <div><span class="term-accent">&#x25B8; DevOps & Cloud:</span> Git, Docker, Linux CLI, Cloudflare, Vercel Deployments, CI/CD</div>
        </div>
        <p style="color: var(--text-dim);">[GUI synchronized to: Skills view]</p>
      `;
    },

    projects: () => {
      switchGuiTab('section-projects', false);
      return `
        <p class="term-tag">FEATURED PROJECTS & REPOSITORIES (12+ Public Repos):</p>
        <table class="cmd-table" style="margin-top: 8px;">
          <tr>
            <td class="cmd-col"><a href="https://github.com/geoffrey45/qr-checkin-app" target="_blank">qr-checkin-app</a></td>
            <td class="desc-col">QR code attendance & verification platform. Kotlin / Android.</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://snake-game-ruby-three.vercel.app" target="_blank">snake-game</a></td>
            <td class="desc-col">Retro browser arcade game engine. [Live: <a href="https://snake-game-ruby-three.vercel.app" target="_blank">Vercel Demo</a>]</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://website-puce-omega.vercel.app" target="_blank">Website</a></td>
            <td class="desc-col">Automotive marketplace / car sales portal. [Live: <a href="https://website-puce-omega.vercel.app" target="_blank">Vercel Demo</a>]</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://github.com/geoffrey45/Road_analyzer" target="_blank">Road_analyzer</a></td>
            <td class="desc-col">Telemetry analysis tool for road metrics & structural profiling.</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://github.com/geoffrey45/Loginsystem" target="_blank">Loginsystem</a></td>
            <td class="desc-col">Enterprise authentication, password hashing, and session workflows.</td>
          </tr>
          <tr>
            <td class="cmd-col"><a href="https://github.com/geoffrey45/Creators-Team" target="_blank">Creators-Team</a></td>
            <td class="desc-col">Collaborative distributed development hub for shared libraries.</td>
          </tr>
        </table>
        <p style="color: var(--text-dim); margin-top: 6px;">Tip: Run <code>project &lt;name&gt;</code> (e.g. <code>project snake-game</code>) to inspect details.</p>
      `;
    },

    project: (args) => {
      const p = args.toLowerCase().trim();
      if (!p) {
        return `<p class="term-warn">Usage: project &lt;id&gt; (e.g. <code>project snake-game</code>, <code>project qr-checkin</code>)</p>`;
      }

      switchGuiTab('section-projects', false);

      if (p.includes('snake')) {
        return `
          <p class="term-tag">PROJECT: Snake Game Engine</p>
          <p>Classic arcade game implemented in vanilla JavaScript with HTML5 Canvas.</p>
          <p>&bull; <strong>Live Demo:</strong> <a href="https://snake-game-ruby-three.vercel.app" target="_blank">https://snake-game-ruby-three.vercel.app</a></p>
          <p>&bull; <strong>Source:</strong> <a href="https://github.com/geoffrey45/snake-game" target="_blank">https://github.com/geoffrey45/snake-game</a></p>
          <p>&bull; <strong>Features:</strong> Collision physics, dynamic speed scaling, local high-score caching.</p>
        `;
      } else if (p.includes('qr') || p.includes('checkin')) {
        return `
          <p class="term-tag">PROJECT: QR Check-in System</p>
          <p>Event and attendance management system featuring high-speed optical QR code verification.</p>
          <p>&bull; <strong>Source:</strong> <a href="https://github.com/geoffrey45/qr-checkin-app" target="_blank">https://github.com/geoffrey45/qr-checkin-app</a></p>
          <p>&bull; <strong>Tech:</strong> Kotlin, Android CameraX, REST API Integration.</p>
        `;
      } else if (p.includes('web') || p.includes('car')) {
        return `
          <p class="term-tag">PROJECT: Automotive Marketplace (Website)</p>
          <p>Online dealership portal showcasing vehicles with specifications, quotation forms, and responsive design.</p>
          <p>&bull; <strong>Live Demo:</strong> <a href="https://website-puce-omega.vercel.app" target="_blank">https://website-puce-omega.vercel.app</a></p>
          <p>&bull; <strong>Source:</strong> <a href="https://github.com/geoffrey45/Website" target="_blank">https://github.com/geoffrey45/Website</a></p>
        `;
      } else if (p.includes('road')) {
        return `
          <p class="term-tag">PROJECT: Road Analyzer</p>
          <p>Data processing and telemetry tool to assess road conditions and generate diagnostic reports.</p>
          <p>&bull; <strong>Source:</strong> <a href="https://github.com/geoffrey45/Road_analyzer" target="_blank">https://github.com/geoffrey45/Road_analyzer</a></p>
        `;
      } else if (p.includes('login')) {
        return `
          <p class="term-tag">PROJECT: Secure Login System</p>
          <p>Identity access control, authorization tokens, password security, and database session validation.</p>
          <p>&bull; <strong>Source:</strong> <a href="https://github.com/geoffrey45/Loginsystem" target="_blank">https://github.com/geoffrey45/Loginsystem</a></p>
          <p>&bull; <strong>Tech:</strong> C#, ASP.NET, SQL Server, Password Hashing.</p>
        `;
      } else {
        return `<p class="term-warn">Unknown project "${escapeHtml(p)}". Run <code>projects</code> to view available projects.</p>`;
      }
    },

    arch: () => {
      switchGuiTab('section-experience', false);
      return `
        <p class="term-tag">DISTRIBUTED SYSTEMS & ARCHITECTURAL HIGHLIGHTS:</p>
        <div style="margin: 6px 0; line-height: 1.6;">
          <p><strong>1. Decoupled Microservices:</strong> ASP.NET Core & Java services designed with stateless endpoints and clean domain-driven architecture.</p>
          <p><strong>2. Native Android Edge Computing:</strong> Kotlin applications optimized for quick offline capability, background work synchronization, and CameraX processing.</p>
          <p><strong>3. Resilience & Security:</strong> Defense-in-depth auth models, SQL parameterized pipelines, and rate limiting.</p>
        </div>
        <p style="color: var(--text-dim);">[GUI synchronized to: Architecture view]</p>
      `;
    },

    contact: () => {
      switchGuiTab('section-contact', false);
      return `
        <p class="term-tag">CONTACT & COMM CHANNELS:</p>
        <table class="cmd-table">
          <tr><td class="cmd-col"><i class="fa-solid fa-envelope"></i> Email:</td><td class="desc-col"><a href="mailto:hgmwangi100@gmail.com">hgmwangi100@gmail.com</a></td></tr>
          <tr><td class="cmd-col"><i class="fa-solid fa-phone"></i> Phone:</td><td class="desc-col"><a href="tel:+254710324997">+254 710 324 997</a></td></tr>
          <tr><td class="cmd-col"><i class="fa-brands fa-github"></i> GitHub:</td><td class="desc-col"><a href="https://github.com/geoffrey45" target="_blank">https://github.com/geoffrey45</a></td></tr>
        </table>
        <p style="color: var(--text-dim); margin-top: 6px;">[GUI synchronized to: Contact view]</p>
      `;
    },

    resume: () => {
      return `
        <p class="term-tag">CURRICULUM VITAE &mdash; GEOFFREY HINGA</p>
        <pre style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted); margin: 8px 0; line-height: 1.5;">
================================================================
NAME:      Geoffrey Hinga (Atomic_Brilliant)
ROLE:      Software Engineer | Distributed Systems & Mobile
CONTACT:   hgmwangi100@gmail.com | +254 710 324 997
GITHUB:    https://github.com/geoffrey45
STATUS:    Open for opportunities
================================================================
PROFESSIONAL SUMMARY:
Software Engineer experienced in architecting scalable backend
services and native mobile applications. Adept in distributed
computing, API optimization, and resilient systems.

TECHNICAL EXPERTISE:
- Languages:  C#, Java, Python, Kotlin, JavaScript, SQL
- Frameworks: ASP.NET Core, Android Jetpack, Entity Framework
- Concepts:   Distributed Systems, REST APIs, Microservices,
              Concurrency, Offline-first Mobile Architecture
- Tools:      Git, Docker, Linux, Cloudflare, Vercel, CI/CD

SELECTED WORK:
- QR Check-in System: Kotlin & Android verification engine
- Snake Game Engine: Vercel-deployed arcade interactive web app
- Automotive Platform: E-commerce vehicle showroom
- Secure Auth Gateway: Production identity & session management
================================================================
        </pre>
      `;
    },

    matrix: () => {
      startMatrixEffect();
      return `<p class="term-success">&#x25B6; Initiated Matrix Digital Rain. Type any command or press any key to return.</p>`;
    },

    theme: (args) => {
      const t = args.toLowerCase().trim();
      const valid = {
        'default': 'theme-default',
        'slate': 'theme-default',
        'matrix': 'theme-matrix',
        'green': 'theme-matrix',
        'cyberpunk': 'theme-cyberpunk',
        'neon': 'theme-cyberpunk',
        'dracula': 'theme-dracula',
        'purple': 'theme-dracula'
      };

      if (!t || !valid[t]) {
        return `<p class="term-warn">Usage: theme &lt;default | matrix | cyberpunk | dracula&gt;</p>`;
      }

      setTheme(valid[t]);
      return `<p class="term-success">&#x2714; Theme updated to <span class="term-accent">${valid[t].replace('theme-', '')}</span>.</p>`;
    },

    audio: () => {
      state.audioEnabled = !state.audioEnabled;
      if (soundToggle) {
        soundToggle.innerHTML = state.audioEnabled
          ? `<i class="fa-solid fa-volume-high"></i> Audio: ON`
          : `<i class="fa-solid fa-volume-xmark"></i> Audio: OFF`;
      }
      return `<p class="term-accent">&#x1F50A; Keyboard click audio is now ${state.audioEnabled ? 'ENABLED' : 'DISABLED'}.</p>`;
    },

    email: (args) => {
      const subject = encodeURIComponent("Inquiry from Portfolio Terminal");
      const body = encodeURIComponent(args || "Hi Geoffrey, I checked out your developer portfolio and would love to connect!");
      const mailto = `mailto:hgmwangi100@gmail.com?subject=${subject}&body=${body}`;
      window.open(mailto, '_blank');
      return `<p class="term-success">&#x2709; Launched your default email client for Geoffrey (hgmwangi100@gmail.com).</p>`;
    },

    whoami: () => {
      return `<p>geoffrey45 (Geoffrey Hinga &bull; Software Engineer &bull; UID: 1000)</p>`;
    },

    date: () => {
      return `<p>${new Date().toString()}</p>`;
    },

    uptime: () => {
      const diff = Math.floor((Date.now() - state.startTime) / 1000);
      return `<p>Portfolio instance running for ${diff} seconds (0 errors).</p>`;
    },

    sudo: () => {
      return `<p class="term-error">guest is not in the sudoers file. This incident will be reported to Geoffrey &#x1F60A;</p>`;
    }
  };

  // --- COMMAND EXECUTION ENGINE ---
  function executeCommand(inputStr, logToTerminal = true) {
    const raw = inputStr.trim();
    if (!raw) return;

    if (logToTerminal) {
      state.history.push(raw);
      state.historyIndex = state.history.length;
    }

    // Stop matrix if running
    if (state.matrixRunning) {
      stopMatrixEffect();
    }

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      if (logToTerminal) printTerminalOutput('', false);
      return;
    }

    // Handle compound "cat resume"
    if (raw.toLowerCase() === 'cat resume') {
      const output = commandsData.resume();
      if (logToTerminal) printTerminalOutput(output, true, raw);
      return;
    }

    let output = '';
    if (commandsData[cmd]) {
      output = commandsData[cmd](args);
    } else if (cmd === 'architecture') {
      output = commandsData.arch();
    } else {
      output = `<p class="term-error">Command not found: "${escapeHtml(cmd)}". Type <span class="term-accent">help</span> to view available commands.</p>`;
    }

    if (logToTerminal) {
      printTerminalOutput(output, true, raw);
    }
  }

  // --- MATRIX DIGITAL RAIN EFFECT ---
  let matrixCanvas = null;
  function startMatrixEffect() {
    if (state.matrixRunning) return;
    state.matrixRunning = true;

    matrixCanvas = document.getElementById('matrix-canvas');
    if (!matrixCanvas) {
      matrixCanvas = document.createElement('canvas');
      matrixCanvas.id = 'matrix-canvas';
      terminalBody.appendChild(matrixCanvas);
    }

    matrixCanvas.style.display = 'block';
    matrixCanvas.width = terminalBody.clientWidth;
    matrixCanvas.height = terminalBody.clientHeight;

    const ctx = matrixCanvas.getContext('2d');
    const chars = '0123456789ABCDEF@#$%&*+-/\\|';
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    state.matrixInterval = setInterval(draw, 33);
  }

  function stopMatrixEffect() {
    if (!state.matrixRunning) return;
    state.matrixRunning = false;
    clearInterval(state.matrixInterval);
    state.matrixInterval = null;
    if (matrixCanvas) {
      matrixCanvas.style.display = 'none';
    }
  }

  // --- INPUT EVENT HANDLER ---
  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      playKeyClick();

      // Enter key
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        executeCommand(val);
      }
      // Up Arrow (History Back)
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.history.length > 0 && state.historyIndex > 0) {
          state.historyIndex--;
          terminalInput.value = state.history[state.historyIndex];
        }
      }
      // Down Arrow (History Forward)
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          terminalInput.value = state.history[state.historyIndex];
        } else {
          state.historyIndex = state.history.length;
          terminalInput.value = '';
        }
      }
      // Tab Autocomplete
      else if (e.key === 'Tab') {
        e.preventDefault();
        const current = terminalInput.value.trim().toLowerCase();
        if (current) {
          const match = state.commands.find(c => c.startsWith(current));
          if (match) {
            terminalInput.value = match;
          }
        }
      }
      // Ctrl + L (Clear)
      else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        executeCommand('clear');
      }

      // Stop matrix on any key
      if (state.matrixRunning && e.key !== 'Enter') {
        stopMatrixEffect();
      }
    });

    // Keep focus in terminal on body click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('a') && !e.target.closest('button') && !e.target.closest('select')) {
        terminalInput.focus();
      }
    });
  }

  // Initial welcome message
  printWelcome();

})();
