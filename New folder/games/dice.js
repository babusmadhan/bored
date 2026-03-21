class DiceGame {
    constructor(app) {
        this.app = app;
        this.title = "Quantum Roll";
        this.description = "Bet on the outcome of two dice. Higher, Lower, or Same?";
        this.score = 0;
        this.rounds = 5;
        this.currentRound = 0;
        this.lastRoll = null;
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎲</div>
            <h2 style="color: var(--accent-primary)">Quantum Roll</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Predict if the next roll is Higher, Lower, or the Same.</p>
            <button class="btn-primary" id="start-dice">INITIALIZE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-dice').onclick = () => {
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
        this.infoEl.style.marginBottom = '1rem';
        this.infoEl.innerHTML = `ROUND: <span id="dice-round">1/${this.rounds}</span> | SCORE: <span id="dice-score">0</span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.diceContainer = document.createElement('div');
        this.diceContainer.style.fontSize = '4rem';
        this.diceContainer.style.marginBottom = '2rem';
        this.diceContainer.style.display = 'flex';
        this.diceContainer.style.gap = '1rem';
        this.app.canvasArea.appendChild(this.diceContainer);

        this.controls = document.createElement('div');
        this.controls.style.display = 'flex';
        this.controls.style.gap = '1rem';
        
        ['LOWER', 'SAME', 'HIGHER'].forEach(type => {
            const btn = document.createElement('button');
            btn.textContent = type;
            btn.className = 'btn-primary';
            btn.onclick = () => this.makeBet(type);
            this.controls.appendChild(btn);
        });
        
        this.controls.style.display = 'none'; // hidden till first roll
        
        this.msgEl = document.createElement('div');
        this.msgEl.style.marginTop = '1rem';
        this.msgEl.style.minHeight = '2rem';
        
        this.app.canvasArea.appendChild(this.controls);
        this.app.canvasArea.appendChild(this.msgEl);

        this.rollDice(true);
    }

    getFace(val) {
        return ['⚀','⚁','⚂','⚃','⚄','⚅'][val-1];
    }

    rollDice(initial = false, bet = null) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;

        this.diceContainer.innerHTML = `<span>${this.getFace(d1)}</span><span>${this.getFace(d2)}</span>`;
        this.app.playTone(400, 0.1);

        if (!initial) {
            let correct = false;
            if (bet === 'HIGHER' && total > this.lastRoll) correct = true;
            if (bet === 'LOWER' && total < this.lastRoll) correct = true;
            if (bet === 'SAME' && total === this.lastRoll) correct = true;

            if (correct) {
                this.score += (bet === 'SAME' ? 500 : 200);
                this.msgEl.textContent = "CORRECT PREDICTION!";
                this.msgEl.style.color = "var(--accent-primary)";
                this.app.playTone(800, 0.1, 'square');
            } else {
                this.msgEl.textContent = "INCORRECT!";
                this.msgEl.style.color = "#ff0055";
                this.app.playTone(200, 0.1, 'sawtooth');
            }
            
            this.currentRound++;
            document.getElementById('dice-round').textContent = `${Math.min(this.currentRound+1, this.rounds)}/${this.rounds}`;
            document.getElementById('dice-score').textContent = this.score;

            if (this.currentRound >= this.rounds) {
                this.controls.style.display = 'none';
                setTimeout(() => this.gameOver(), 1000);
            }
        } else {
            this.controls.style.display = 'flex';
            this.msgEl.textContent = "Predict next roll!";
            this.msgEl.style.color = "var(--text-main)";
        }

        this.lastRoll = total;
    }

    makeBet(type) {
        this.rollDice(false, type);
    }

    gameOver() {
        this.app.playVictory();
        this.app.updateScore(this.score);
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>SESSION COMPLETE</h3><p>Points earned: ${this.score}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.app.canvasArea.innerHTML = '';
    }
}
