class TypingGame {
    constructor(app) {
        this.app = app;
        this.title = "Terminal Typist";
        this.description = "Type the commands exactly as they appear before the system locks out.";
        this.phrases = [
            "sudo rm -rf /",
            "git commit -m 'initial commit'",
            "apt-get install python3",
            "systemctl restart nginx",
            "npm run build",
            "docker-compose up -d",
            "ssh root@192.168.1.1",
            "chmod +x script.sh"
        ];
        this.currentPhrase = "";
        this.timeLeft = 20;
        this.score = 0;
        this.timer = null;
        this.playing = false;
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">⌨️</div>
            <h2 style="color: var(--accent-primary)">Terminal Typist</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Type fast. Don't make mistakes.</p>
            <button class="btn-primary" id="start-type">CONNECT</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-type').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.app.canvasArea.style.display = 'flex';
        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.style.justifyContent = 'center';
        this.app.canvasArea.style.alignItems = 'center';

        this.infoEl = document.createElement('div');
        this.infoEl.style.fontSize = '1.2rem';
        this.infoEl.style.marginBottom = '2rem';
        this.infoEl.style.display = 'flex';
        this.infoEl.style.justifyContent = 'space-between';
        this.infoEl.style.width = '100%';
        this.infoEl.style.maxWidth = '400px';
        this.infoEl.innerHTML = `<span>TIME: <span id="type-time">20</span>s</span><span>Bypassed: <span id="type-score">0</span></span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.phraseEl = document.createElement('div');
        this.phraseEl.style.fontSize = '2rem';
        this.phraseEl.style.marginBottom = '1rem';
        this.phraseEl.style.fontFamily = 'monospace';
        this.phraseEl.style.color = 'var(--text-main)';
        this.phraseEl.style.background = '#000';
        this.phraseEl.style.padding = '10px 20px';
        this.phraseEl.style.border = '1px solid var(--accent-primary)';
        this.app.canvasArea.appendChild(this.phraseEl);

        this.inputEl = document.createElement('input');
        this.inputEl.type = 'text';
        this.inputEl.style.width = '100%';
        this.inputEl.style.maxWidth = '400px';
        this.inputEl.style.padding = '10px';
        this.inputEl.style.fontSize = '1.5rem';
        this.inputEl.style.fontFamily = 'monospace';
        this.inputEl.style.background = '#111';
        this.inputEl.style.color = '#fff';
        this.inputEl.style.border = '1px solid #333';
        this.inputEl.style.outline = 'none';
        
        this.inputEl.addEventListener('input', () => this.checkInput());

        this.app.canvasArea.appendChild(this.inputEl);

        this.playing = true;
        this.nextPhrase();

        this.timer = setInterval(() => {
            if (!this.playing) return;
            this.timeLeft--;
            document.getElementById('type-time').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);

        setTimeout(() => this.inputEl.focus(), 100);
    }

    nextPhrase() {
        this.currentPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        this.phraseEl.textContent = this.currentPhrase;
        this.inputEl.value = '';
    }

    checkInput() {
        if (!this.playing) return;
        const val = this.inputEl.value;

        if (val === this.currentPhrase) {
            this.score++;
            this.timeLeft += 3; // bonus time
            document.getElementById('type-score').textContent = this.score;
            document.getElementById('type-time').textContent = this.timeLeft;
            this.app.playTone(800, 0.1);
            this.inputEl.style.borderColor = 'var(--accent-primary)';
            this.nextPhrase();
        } else if (!this.currentPhrase.startsWith(val)) {
            this.inputEl.style.borderColor = '#ff0055';
        } else {
            this.inputEl.style.borderColor = '#333';
        }
    }

    gameOver() {
        this.playing = false;
        clearInterval(this.timer);
        this.app.playVictory();
        this.app.updateScore(this.score * 200);
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>CONNECTION LOST</h3><p>Nodes Bypassed: ${this.score}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.playing = false;
        clearInterval(this.timer);
        this.app.canvasArea.innerHTML = '';
    }
}
