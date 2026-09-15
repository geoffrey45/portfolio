# Geoffrey Hinga - Interactive Developer Portfolio

A developer-centric dual-pane interactive portfolio website.

## ✨ Features

- **Dual-Partition Architecture**:
  - **Left Partition (GUI / Monitor Display)**: Rich visual dashboard with your profile avatar, active hireable status badge, tech stack cards, project showcases with live demo links, architecture overview, and direct contact options.
  - **Right Partition (CLI / Interactive Terminal)**: Fully functional shell prompt (`guest@geoffrey:~$`) where visitors can type Unix commands to navigate and control the portfolio.
- **Bi-Directional Sync**:
  - Typing commands like `about`, `skills`, `projects`, `arch`, `contact` in the terminal immediately updates and highlights the visual GUI pane.
  - Clicking tabs or project buttons in the GUI runs the corresponding command in the terminal!
- **Interactive Shell Capabilities**:
  - Commands: `help`, `about`, `skills`, `projects`, `project <name>`, `arch`, `contact`, `cat resume`, `matrix`, `theme <name>`, `audio`, `whoami`, `date`, `uptime`, `email <msg>`, `clear`, `sudo`.
  - Command history navigation (`↑` / `↓` arrows).
  - Tab auto-completion (`Tab`).
  - Screen clear (`Ctrl + L` or `clear`).
  - Clickable quick command chips for mobile & keyboard-free navigation.
- **Themes & Sound**:
  - 4 Developer Themes: Dark Slate, Matrix Green, Cyberpunk Neon, and Dracula.
  - Built-in Web Audio API mechanical keyboard typing sound effects (with toggle).
  - Matrix digital rain animation mode (`matrix`).
- **Draggable Partition Resizer**:
  - Click and drag the vertical divider to adjust the split ratio between the GUI and the terminal.

## 🚀 How to Run Locally

Simply double-click `index.html` to open it in any web browser, or serve it with Python / Node:

```bash
# Using Python
python -m http.server 3000

# Using Node (npx serve)
npx serve .
```

## 🌐 Deploying to GitHub Pages or Vercel

1. **GitHub Pages**:
   - Push this folder to a repository named `geoffrey-portfolio` or your root repository `geoffrey45.github.io`.
   - In GitHub Settings -> Pages, select branch `main` and root `/`.
2. **Vercel**:
   - Run `npx vercel` or link the repository on [vercel.com](https://vercel.com).
