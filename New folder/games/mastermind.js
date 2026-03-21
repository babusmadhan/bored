/**
 * Game 26: Mastermind
 */
class MastermindGame {
    constructor(app) {
        this.app = app;
        this.title = "Cipher Guess";
        this.description = "Guess the 4-digit code. Each guess gives you hints: Correct digit and position (G), Correct digit but wrong position (Y).";
        this.secretCode = [];
        this.attempts = 10;
        this.currentAttempt = 0;
        this.running = false;
        this.history = [];
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
            <h2 style="color: var(--accent-primary)">CIPHER GUESS</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Crack the 4-digit numeric code.</p>
            <button class="btn-primary" id="start-mastermind">BREACH SYSTEM</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-mastermind').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.secretCode = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
        this.historyContainer = document.createElement('div');
        this.historyContainer.style.width = '350px';
        this.historyContainer.style.height = '150px';
        this.historyContainer.style.overflowY = 'auto';
        this.historyContainer.style.background = 'rgba(0,0,0,0.5)';
        this.historyContainer.style.padding = '10px';
        this.historyContainer.style.border = '1px solid var(--glass-border)';
        this.historyContainer.style.marginBottom = '1rem';
        this.historyContainer.style.fontFamily = 'monospace';
        this.historyContainer.style.fontSize = '0.9rem';

        this.inputRow = document.createElement('div');
        this.inputRow.style.display = 'flex';
        this.inputRow.style.gap = '10px';
        this.inputRow.style.justifyContent = 'center';

        const inputs = [];
        for (let i = 0; i < 4; i++) {
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.min = 0; inp.max = 9;
            inp.style.width = '40px';
            inp.style.height = '40px';
            inp.style.background = 'rgba(255, 255, 255, 0.05)';
            inp.style.border = '1px solid var(--accent-primary)';
            inp.style.color = '#fff';
            inp.style.textAlign = 'center';
            inp.style.fontSize = '1.2rem';
            inputs.push(inp);
            this.inputRow.appendChild(inp);
        }

        const submit = document.createElement('button');
        submit.className = 'btn-primary';
        submit.style.marginTop = '1rem';
        submit.textContent = 'CHECK CODE';
        submit.onclick = () => this.checkGuess(inputs.map(i => parseInt(i.value || 0)));

        this.app.canvasArea.appendChild(this.historyContainer);
        this.app.canvasArea.appendChild(this.inputRow);
        this.app.canvasArea.appendChild(submit);
        this.running = true;
    }

    checkGuess(guess) {
        if (!this.running) return;
        this.currentAttempt++;
        let green = 0;
        let yellow = 0;
        let used = Array(4).fill(false);
        let secretUsed = Array(4).fill(false);

        // Check Greens
        for (let i = 0; i < 4; i++) {
            if (guess[i] === this.secretCode[i]) {
                green++;
                used[i] = true;
                secretUsed[i] = true;
            }
        }

        // Check Yellows
        for (let i = 0; i < 4; i++) {
            if (used[i]) continue;
            for (let j = 0; j < 4; j++) {
                if (!secretUsed[j] && guess[i] === this.secretCode[j]) {
                    yellow++;
                    secretUsed[j] = true;
                    break;
                }
            }
        }

        const log = document.createElement('div');
        log.style.marginBottom = '5px';
        log.innerHTML = `<span style="color:#888">[${this.currentAttempt}]</span> GUESS:${guess.join('')} | <span style="color:#00ff88">${green}G</span> <span style="color:#ffff00">${yellow}Y</span>`;
        this.historyContainer.prepend(log);
        this.app.playTone(440 + green * 100, 0.1);

        if (green === 4) this.gameOver(true);
        else if (this.currentAttempt >= this.attempts) this.gameOver(false);
    }

    gameOver(won) {
        this.running = false;
        if (won) {
            this.app.playVictory();
            this.app.updateScore(1500);
        } else {
            this.app.playFailure();
        }
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'SYSTEM BREACHED' : 'ACCESS DENIED'}</h3><p>Secret was: ${this.secretCode.join('')}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
