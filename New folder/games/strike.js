/**
 * Game 24: Cyber Strike
 */
class StrikeGame {
    constructor(app) {
        this.app = app;
        this.title = "Target Strike";
        this.description = "CLICK on the red targets as they appear. Don't let them vanish!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.targets = [];
        this.score = 0;
        this.timer = 0;
        this.missed = 0;
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
            <h2 style="color: var(--accent-primary)">TARGET STRIKE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Quick reflexes are the key to the strike.</p>
            <button class="btn-primary" id="start-strike">LOCK ON</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-strike').onclick = () => {
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
        this.canvas.addEventListener('mousedown', this.handleAction);
        this.running = true;
        this.loop();
    }

    handleAction(e) {
        if (!this.running) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) * (this.canvas.width / rect.width));
        const my = ((e.clientY - rect.top) * (this.canvas.height / rect.height));
        
        let hit = false;
        for (let i = this.targets.length - 1; i >= 0; i--) {
            let t = this.targets[i];
            const dx = mx - t.x;
            const dy = my - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < t.r) {
                this.score += 50;
                this.app.updateScore(50);
                this.app.playTone(800, 0.1);
                this.targets.splice(i, 1);
                hit = true;
                break;
            }
        }
        if (!hit) {
            this.app.playTone(200, 0.1, 'sawtooth');
            this.score -= 10;
        }
    }

    spawnTarget() {
        this.targets.push({
            x: 50 + Math.random() * 500,
            y: 50 + Math.random() * 300,
            r: 30 - this.app.level,
            life: 100 - (this.app.level * 5)
        });
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, 600, 400);

        this.timer++;
        if (this.timer % Math.max(20, 50 - this.app.level * 4) === 0) this.spawnTarget();

        for (let i = this.targets.length - 1; i >= 0; i--) {
            let t = this.targets[i];
            t.life--;

            this.ctx.strokeStyle = '#ff0055';
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff0055';
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
            this.ctx.stroke();
            // Draw life indicator
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.r - 8, 0, (Math.PI * 2) * (t.life / 100));
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            if (t.life <= 0) {
                this.targets.splice(i, 1);
                this.missed++;
                this.app.playTone(150, 0.2, 'sawtooth');
                if (this.missed >= 5) {
                    this.gameOver();
                    return;
                }
            }
        }

        requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>LOCK LOST</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RE-ENTRY</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        this.canvas.removeEventListener('mousedown', this.handleAction);
    }
}
