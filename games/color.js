class ColorGuesserGame {
    constructor(app) {
        this.app = app;
        this.title = "Cognitive Paradox";
        this.description = "Select the COLOR of the text, not what the word says! You have 20 seconds.";
        this.colors = [
            { name: 'RED', hex: '#ff0055' },
            { name: 'BLUE', hex: '#00ccff' },
            { name: 'GREEN', hex: '#00ff88' },
            { name: 'YELLOW', hex: '#ffcc00' }
        ];
        this.score = 0;
        this.timeLeft = 20;
        this.timer = null;
        this.currentColorHex = '';
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
            <h2 style="color: var(--accent-primary)">Cognitive Paradox</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Match the INK, not the WORD.</p>
            <button class="btn-primary" id="start-color">START</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-color').onclick = () => {
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
        this.infoEl.innerHTML = `TIME: <span id="color-time">20</span>s | SCORE: <span id="color-score">0</span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.wordEl = document.createElement('div');
        this.wordEl.style.fontSize = '4rem';
        this.wordEl.style.fontWeight = 'bold';
        this.wordEl.style.marginBottom = '2rem';
        this.wordEl.style.textShadow = '0 0 10px rgba(255,255,255,0.2)';
        this.app.canvasArea.appendChild(this.wordEl);

        this.btnContainer = document.createElement('div');
        this.btnContainer.style.display = 'grid';
        this.btnContainer.style.gridTemplateColumns = '1fr 1fr';
        this.btnContainer.style.gap = '10px';
        this.btnContainer.style.width = '100%';
        this.btnContainer.style.maxWidth = '300px';

        this.colors.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.textContent = c.name;
            btn.onclick = () => this.checkColor(c.hex);
            this.btnContainer.appendChild(btn);
        });

        this.app.canvasArea.appendChild(this.btnContainer);

        this.nextRound();

        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('color-time').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);
    }

    nextRound() {
        // pick random word
        const textObj = this.colors[Math.floor(Math.random() * this.colors.length)];
        // pick random color
        const colorObj = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.wordEl.textContent = textObj.name;
        this.wordEl.style.color = colorObj.hex;
        this.currentColorHex = colorObj.hex;
    }

    checkColor(selectedHex) {
        if (selectedHex === this.currentColorHex) {
            this.score++;
            document.getElementById('color-score').textContent = this.score;
            this.app.playTone(800, 0.1);
            this.nextRound();
        } else {
            this.app.playTone(300, 0.1, 'sawtooth');
            this.timeLeft -= 2; // penalty
            document.getElementById('color-time').textContent = Math.max(0, this.timeLeft);
        }
    }

    gameOver() {
        clearInterval(this.timer);
        this.app.playVictory();
        this.app.updateScore(this.score * 150);
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>PARADOX RESOLVED</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        clearInterval(this.timer);
        this.app.canvasArea.innerHTML = '';
    }
}
