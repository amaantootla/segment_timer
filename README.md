# Segment Timer

A modern, user-friendly webapp timer built with Node.js and JavaScript. Supports multiple sequential timers, each with a name, advanced UI/UX, and timer set management.

---

## 🕒 For Morning Routines & Maladaptive Daydreaming

**Do you lose track of time during your morning routine?**
**Do you struggle with maladaptive daydreaming and want to stay on task?**

Segment Timer is designed to help you:
- Stay focused and on schedule during routine tasks
- Break your morning into manageable, timed segments
- Use visual and audio cues to gently bring your attention back if you drift
- Build better habits and reduce time lost to daydreaming

### How to Use for Routines & Focus
1. **List your morning tasks** (e.g., shower, breakfast, getting dressed).
2. **Add each as a timer segment** with a realistic time limit.
3. **Start the timer sequence** and follow along.
4. **When the alert sounds or appears, move to the next task.**
5. If you catch yourself daydreaming, use the timer's cues to gently refocus.

**Tip:** Use every day for best results. Over time, you'll build awareness and structure into your mornings.

---

## Features
- Circular countdown timer with SVG animation
- Add multiple sequential timers, each with a name
- Track overtime/undertime for each timer
- Save, load, and manage multiple named timer sets (localStorage)
- Minimal, responsive, light/dark adaptive UI
- Mobile-friendly and highly usable
- Results summary after all timers

## Getting Started (with Docker)

This project is designed to run in a [dev container](https://containers.dev/) using the official `mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye` image.

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) (recommended)

### Quick Start
1. **Clone the repository:**
   ```bash
   git clone https://github.com/amaantootla/segment_timer.git
   cd segment_timer/app
   ```
2. **Open in VS Code:**
   - Open the folder in VS Code.
   - When prompted, "Reopen in Container" (or use the Command Palette: `Dev Containers: Reopen in Container`).
   - The container will build automatically using the provided `devcontainer.json`.
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run the app:**
   ```bash
   node server.js
   ```
5. **Open your browser at:**
   ```
   http://localhost:3000
   ```

### Running with Docker (without VS Code)
If you want to run the app directly with Docker:

```bash
docker run -it --rm -p 3000:3000 -v $(pwd):/workspace -w /workspace mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye bash -c "npm install && node server.js"
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- Add timers by entering a name and time, then click `+`.
- Use the 📋 button to manage timer sets (save/load/delete).
- Click `Start` to begin the sequence.
- Use `DONE` to finish a timer and track overtime/undertime.
- View results and reset as needed.

## Project Structure
- `public/` — Static frontend (HTML, CSS, JS)
- `server.js` — Node.js/Express static server
- `package.json` — Project metadata and dependencies
- `.devcontainer/` — Dev container configuration

## License
MIT
