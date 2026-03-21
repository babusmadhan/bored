/**
 * Game 23: Cyber Clicker
 */
class ClickerGame {
    constructor(app) {
        this.app = app;
        this.title = "Cyber Tap";
        this.description = "CLICK the center crystal as fast as you can in 10 seconds! Reach 100 taps to win.";
        this.clicks = 0;
        this.timeLeft = 10;
        this.timer = null;
        this.running = false;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">💎</div>
            <h2 style="color: var(--accent-primary)">CRYSTAL TAP</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Max speed is required for the tap!</p>
            <button class="btn-primary" id="start-clicker">INITIATE TAP</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-clicker').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.container = document.createElement('div');
        this.container.style.width = '200px';
        this.container.style.height = '200px';
        this.container.style.background = 'radial-gradient(circle, #00f2ff 0%, transparent 70%)';
        this.container.style.borderRadius = '50%';
        this.container.style.margin = '2rem auto';
        this.container.style.cursor = 'pointer';
        this.container.style.display = 'flex';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.boxShadow = '0 0 40px #00f2ff';
        this.container.innerHTML = '<span style="font-size: 3rem;">💎</span>';
        
        this.counter = document.createElement('div');
        this.counter.style.fontSize = '3rem';
        this.counter.style.fontWeight = '800';
        this.counter.textContent = '0';
        
        this.timerEl = document.createElement('div');
        this.timerEl.style.fontSize = '1.2rem';
        this.timerEl.style.color = '#ff0055';
        this.timerEl.style.marginBottom = '1rem';
        this.timerEl.textContent = 'TIME: 10s';

        this.app.canvasArea.appendChild(this.timerEl);
        this.app.canvasArea.appendChild(this.counter);
        this.app.canvasArea.appendChild(this.container);

        this.container.onmousedown = () => this.handleTap();
        this.running = true;
        this.startTimer();
    }

    handleTap() {
        if (!this.running) return;
        this.clicks++;
        this.counter.textContent = this.clicks;
        this.app.playTone(400 + this.clicks * 2, 0.05);
        this.container.style.transform = 'scale(0.9)';
        setTimeout(() => this.container.style.transform = 'scale(1)', 50);
        this.app.updateScore(this.clicks);
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.running) return;
            this.timeLeft--;
            this.timerEl.textContent = `TIME: ${this.timeLeft}s`;
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);
    }

    gameOver() {
        this.running = false;
        clearInterval(this.timer);
        const won = this.clicks >= 100;
        if (won) this.app.playVictory();
        else this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'OVERCLOCKED' : 'SYSTEM SLOW'}</h3><p>Taps: ${this.clicks}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RE-RUN</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        clearInterval(this.timer);
    }
}
