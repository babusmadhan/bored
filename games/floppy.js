/**
 * Game 17: Floppy Cube
 */
class FloppyGame {
    constructor(app) {
        this.app = app;
        this.title = "Floppy Cube";
        this.description = "Press SPACE or Click to flap. Don't hit the obstacles!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.player = { y: 200, vy: 0, size: 20 };
        this.pipes = [];
        this.score = 0;
        this.gravity = 0.4;
        this.jump = -7;
        this.pipeW = 50;
        this.gap = 120;
        this.animationId = null;
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        // Reset player state for fresh start
        this.player.y = 200;
        this.player.vy = 0;
        this.pipes = [];
        this.score = 0;
        this.timer = 0;
        
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🐦</div>
            <h2 style="color: var(--accent-primary)">FLOPPY CUBE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Navigate through the gaps.</p>
            <button class="btn-primary" id="start-floppy">BATTEN DOWN</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-floppy').onclick = () => {
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
            e.preventDefault();
            this.player.vy = this.jump;
            this.app.playTone(300, 0.05);
        }
    }

    spawnPipe() {
        if (!this.running) return;
        const h = 50 + Math.random() * (this.canvas.height - this.gap - 100);
        this.pipes.push({ x: this.canvas.width, h: h, scored: false });
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.player.vy += this.gravity;
        this.player.y += this.player.vy;

        if (this.player.y < 0 || this.player.y + this.player.size > this.canvas.height) {
            this.gameOver();
            return;
        }

        this.timer++;
        if (this.timer % 100 === 0) this.spawnPipe();

        this.ctx.fillStyle = '#7000ff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#7000ff';
        
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            let p = this.pipes[i];
            p.x -= 3 + (this.app.level * 0.2);

            // Draw Top
            this.ctx.fillRect(p.x, 0, this.pipeW, p.h);
            // Draw Bottom
            this.ctx.fillRect(p.x, p.h + this.gap, this.pipeW, this.canvas.height - (p.h + this.gap));

            // Collision
            const px = 100;
            if (px + this.player.size > p.x && px < p.x + this.pipeW) {
                if (this.player.y < p.h || this.player.y + this.player.size > p.h + this.gap) {
                    this.gameOver();
                    return;
                }
            }

            if (!p.scored && p.x < px) {
                p.scored = true;
                this.score += 10;
                this.app.updateScore(10);
                this.app.playTone(500, 0.1, 'sine', 0.1);
            }

            if (p.x < -this.pipeW) this.pipes.splice(i, 1);
        }

        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.fillRect(100, this.player.y, this.player.size, this.player.size);
        this.ctx.shadowBlur = 0;

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>SYSTEM CRASHED</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RETRY</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleAction);
        this.canvas.removeEventListener('mousedown', this.handleAction);
    }
}
