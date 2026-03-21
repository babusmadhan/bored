class SlotsGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Slots";
        this.description = "Match 3 symbols to jack in and earn massive points.";
        this.symbols = ['🍎', '🍒', '🍋', '🔔', '💎', '7️⃣'];
        this.reels = [0, 0, 0];
        this.spinning = false;
        this.spinsLeft = 5;
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎰</div>
            <h2 style="color: var(--accent-primary)">Neon Slots</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Spin to win. 5 attempts.</p>
            <button class="btn-primary" id="start-slots">INSERT COIN</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-slots').onclick = () => {
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
        this.infoEl.style.fontSize = '1.5rem';
        this.infoEl.style.marginBottom = '2rem';
        this.infoEl.innerHTML = `SPINS LEFT: <span id="spins" style="color: #ff0055">${this.spinsLeft}</span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.machine = document.createElement('div');
        this.machine.style.display = 'flex';
        this.machine.style.gap = '1rem';
        this.machine.style.background = '#111';
        this.machine.style.padding = '2rem';
        this.machine.style.borderRadius = '10px';
        this.machine.style.border = '2px solid var(--accent-primary)';
        
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel-${i}`;
            reel.style.fontSize = '4rem';
            reel.style.width = '80px';
            reel.style.height = '100px';
            reel.style.background = '#000';
            reel.style.display = 'flex';
            reel.style.justifyContent = 'center';
            reel.style.alignItems = 'center';
            reel.style.borderRadius = '5px';
            reel.style.overflow = 'hidden';
            reel.textContent = this.symbols[Math.floor(Math.random()*this.symbols.length)];
            this.machine.appendChild(reel);
        }

        this.spinBtn = document.createElement('button');
        this.spinBtn.className = 'btn-primary';
        this.spinBtn.style.marginTop = '2rem';
        this.spinBtn.style.fontSize = '1.5rem';
        this.spinBtn.style.padding = '1rem 3rem';
        this.spinBtn.textContent = 'SPIN';
        this.spinBtn.onclick = () => this.spin();

        this.app.canvasArea.appendChild(this.machine);
        this.app.canvasArea.appendChild(this.spinBtn);
    }

    spin() {
        if (this.spinning || this.spinsLeft <= 0) return;
        this.spinning = true;
        this.spinsLeft--;
        document.getElementById('spins').textContent = this.spinsLeft;
        this.spinBtn.disabled = true;

        let spinsCompleted = 0;
        this.app.playTone(800, 0.5, 'sine');

        for (let i = 0; i < 3; i++) {
            const reel = document.getElementById(`reel-${i}`);
            let ticks = 0;
            const targetTicks = 10 + (i * 5) + Math.floor(Math.random() * 5);
            
            const int = setInterval(() => {
                const sym = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                reel.textContent = sym;
                this.reels[i] = sym; // save current
                ticks++;

                if (ticks >= targetTicks) {
                    clearInterval(int);
                    spinsCompleted++;
                    this.app.playTone(600, 0.1, 'square');
                    if (spinsCompleted === 3) {
                        this.checkWin();
                    }
                }
            }, 100);
        }
    }

    checkWin() {
        this.spinning = false;
        let won = false;
        let pts = 0;

        if (this.reels[0] === this.reels[1] && this.reels[1] === this.reels[2]) {
            won = true;
            pts = 5000;
        } else if (this.reels[0] === this.reels[1] || this.reels[1] === this.reels[2] || this.reels[0] === this.reels[2]) {
            won = true;
            pts = 500;
        }

        if (won) {
            this.app.playVictory();
            this.app.updateScore(pts);
            this.spinBtn.innerHTML = `WON ${pts}! <br> CONTINUE`;
            this.spinBtn.onclick = () => app.loadNextGame();
            this.spinBtn.disabled = false;
        } else {
            this.app.playFailure();
            if (this.spinsLeft <= 0) {
                setTimeout(() => this.gameOver(), 1000);
            } else {
                this.spinBtn.disabled = false;
            }
        }
    }

    gameOver() {
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>NO CREDITS LEFT</h3><p>Better luck next time cipher.</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.spinning = false;
        this.app.canvasArea.innerHTML = '';
    }
}
