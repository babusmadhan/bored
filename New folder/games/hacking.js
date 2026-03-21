/**
 * Game 18: Hacking Simulator
 */
class HackingGame {
    constructor(app) {
        this.app = app;
        this.title = "Cyber Hacker";
        this.description = "Type the code snippets accurately to breach the system. Speed is key!";
        this.snippets = ["npm install neon", "const app = new System()", "bruteForce.start()", "packet.encrypt()", "async function breach()", "Buffer.alloc(1024)", "socket.emit('data')", "fs.readFile('/root')", "process.exit(0)", "require('crypto')"];
        this.currentSnippet = "";
        this.userInput = "";
        this.score = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.running = false;
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">💻</div>
            <h2 style="color: var(--accent-primary)">CORE BREACH</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Type the snippets precisely and fast.</p>
            <button class="btn-primary" id="start-hacking">ENTER ROOT</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-hacking').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.display = document.createElement('div');
        this.display.style.fontFamily = 'monospace';
        this.display.style.fontSize = '1.8rem';
        this.display.style.padding = '2rem';
        this.display.style.textAlign = 'center';
        this.display.style.color = '#00ff88';
        this.display.style.textShadow = '0 0 10px #00ff88';
        
        this.timerEl = document.createElement('div');
        this.timerEl.style.fontSize = '1.2rem';
        this.timerEl.style.color = '#ff0055';
        this.timerEl.style.marginBottom = '2rem';
        
        this.app.canvasArea.appendChild(this.timerEl);
        this.app.canvasArea.appendChild(this.display);
        
        this.nextSnippet();
        window.addEventListener('keydown', this.handleKeyPress);
        this.running = true;
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.running) return;
            this.timeLeft--;
            this.timerEl.textContent = `TIME REMAINING: ${this.timeLeft}s`;
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);
    }

    nextSnippet() {
        this.currentSnippet = this.snippets[Math.floor(Math.random() * this.snippets.length)];
        this.userInput = "";
        this.render();
    }

    handleKeyPress(e) {
        if (!this.running) return;
        if (e.key === "Backspace") {
            this.userInput = this.userInput.slice(0, -1);
        } else if (e.key.length === 1) {
            this.userInput += e.key;
            this.app.playTone(600 + Math.random() * 200, 0.05, 'square', 0.1);
        }
        
        if (this.userInput === this.currentSnippet) {
            this.score += 100;
            this.app.updateScore(100);
            this.app.playVictory();
            this.nextSnippet();
        } else {
            this.render();
        }
    }

    render() {
        let html = "";
        for (let i = 0; i < this.currentSnippet.length; i++) {
            if (i < this.userInput.length) {
                if (this.userInput[i] === this.currentSnippet[i]) {
                    html += `<span style="color: #00ff88">${this.currentSnippet[i]}</span>`;
                } else {
                    html += `<span style="background: #ff0055; color: #fff">${this.currentSnippet[i]}</span>`;
                }
            } else {
                html += `<span style="color: #444">${this.currentSnippet[i]}</span>`;
            }
        }
        this.display.innerHTML = html;
    }

    gameOver() {
        this.running = false;
        clearInterval(this.timer);
        this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>BREACH FAILED</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RE-ENTRY</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        clearInterval(this.timer);
        window.removeEventListener('keydown', this.handleKeyPress);
    }
}
