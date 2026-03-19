/**
 * Game 19: Data Catcher
 */
class CatcherGame {
    constructor(app) {
        this.app = app;
        this.title = "Data Catcher";
        this.description = "Move THE bucket with the MOUSE. Catch the neon data cubes and avoid the red glitches!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.bucket = { x: 300, w: 80, h: 20 };
        this.items = [];
        this.score = 0;
        this.timer = 0;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
            <h2 style="color: var(--accent-primary)">DATA HARVEST</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Catch cubes. Avoid red glitches.</p>
            <button class="btn-primary" id="start-catcher">RUN CAPTURE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-catcher').onclick = () => {
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
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.running = true;
        this.loop();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.bucket.x = e.clientX - rect.left - this.bucket.w / 2;
        if (this.bucket.x < 0) this.bucket.x = 0;
        if (this.bucket.x > 600 - this.bucket.w) this.bucket.x = 600 - this.bucket.w;
    }

    spawnItem() {
        const type = Math.random() > 0.2 ? 'data' : 'glitch';
        this.items.push({
            x: Math.random() * (600 - 20),
            y: -20,
            type: type,
            speed: 3 + Math.random() * 3 + (this.app.level * 0.5)
        });
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, 600, 400);

        this.timer++;
        if (this.timer % Math.max(10, 30 - this.app.level * 2) === 0) this.spawnItem();

        for (let i = this.items.length - 1; i >= 0; i--) {
            let item = this.items[i];
            item.y += item.speed;

            this.ctx.fillStyle = item.type === 'data' ? '#00f2ff' : '#ff0055';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.fillRect(item.x, item.y, 20, 20);
            this.ctx.shadowBlur = 0;

            // Collision
            if (item.y + 20 > 360 && item.x + 20 > this.bucket.x && item.x < this.bucket.x + this.bucket.w) {
                if (item.type === 'data') {
                    this.score += 15;
                    this.app.updateScore(15);
                    this.app.playTone(600, 0.1);
                    this.items.splice(i, 1);
                } else {
                    this.gameOver();
                    return;
                }
            } else if (item.y > 400) {
                this.items.splice(i, 1);
            }
        }

        this.ctx.fillStyle = '#7000ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#7000ff';
        this.ctx.fillRect(this.bucket.x, 360, this.bucket.w, this.bucket.h);
        this.ctx.shadowBlur = 0;

        requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>SYSTEM CORRUPT</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RE-RUN</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
