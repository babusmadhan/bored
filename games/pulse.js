/**
 * Game 22: Pulse Tap
 */
class PulseGame {
    constructor(app) {
        this.app = app;
        this.title = "Pulse Rythm";
        this.description = "Press SPACE or CLICK when the expanding circle reaches the outer RINGS!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.pulses = [];
        this.score = 0;
        this.timer = 0;
        this.targetRadius = 80;
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎵</div>
            <h2 style="color: var(--accent-primary)">PULSE BEAT</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Timed taps are the keys to the rhythm.</p>
            <button class="btn-primary" id="start-pulse">SYNC SYSTEMS</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-pulse').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.app.canvasArea.appendChild(this.canvas);
        window.addEventListener('keydown', this.handleAction);
        this.canvas.addEventListener('mousedown', this.handleAction);
        this.running = true;
        this.loop();
    }

    handleAction(e) {
        if ((e.type === 'keydown' && e.code === 'Space') || e.type === 'mousedown') {
            const bestPulse = this.pulses.find(p => Math.abs(p.r - this.targetRadius) < 30);
            if (bestPulse) {
                const diff = Math.abs(bestPulse.r - this.targetRadius);
                if (diff < 10) {
                    this.score += 50; this.app.showToast("PERFECT!"); this.app.playTone(800, 0.1);
                } else {
                    this.score += 20; this.app.showToast("GOOD"); this.app.playTone(600, 0.1);
                }
                this.app.updateScore(this.score);
                this.pulses = this.pulses.filter(p => p !== bestPulse);
            } else {
                this.score -= 10;
                this.app.playTone(200, 0.1, 'sawtooth');
            }
        }
    }

    spawnPulse() {
        this.pulses.push({ r: 0, speed: 2 + (this.app.level * 0.2) });
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, 600, 400);

        this.timer++;
        if (this.timer % Math.max(20, 60 - this.app.level * 4) === 0) this.spawnPulse();

        // Draw Target Ring
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(300, 200, this.targetRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        for (let i = this.pulses.length - 1; i >= 0; i--) {
            let p = this.pulses[i];
            p.r += p.speed;

            this.ctx.strokeStyle = p.r > this.targetRadius ? '#ff0055' : '#00f2ff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            this.ctx.beginPath();
            this.ctx.arc(300, 200, p.r, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            if (p.r > this.targetRadius + 40) {
                this.pulses.splice(i, 1);
                this.gameOver();
                return;
            }
        }

        requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>OUT OF SYNC</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RESYNC</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        window.removeEventListener('keydown', this.handleAction);
        this.canvas.removeEventListener('mousedown', this.handleAction);
    }
}
