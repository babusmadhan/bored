/**
 * Game 15: Laser Dodge
 */
class LaserDodgeGame {
    constructor(app) {
        this.app = app;
        this.title = "Laser Dodge";
        this.description = "Move your cube with the MOUSE. Avoid the red laser beams!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.player = { x: 300, y: 200, size: 20 };
        this.lasers = [];
        this.score = 0;
        this.timer = 0;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
            <h2 style="color: var(--accent-primary)">LASER DODGE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Avoid the red beams at all costs.</p>
            <button class="btn-primary" id="start-lasers">INITIATE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-lasers').onclick = () => {
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
        this.player.x = ((e.clientX - rect.left) * (this.canvas.width / rect.width));
        this.player.y = ((e.clientY - rect.top) * (this.canvas.height / rect.height));
    }

    spawnLaser() {
        const side = Math.floor(Math.random() * 4);
        let laser = { x1: 0, y1: 0, x2: 0, y2: 0, life: 100, active: false };
        if (side === 0) { // Top
            laser.x1 = Math.random() * 600; laser.y1 = 0;
            laser.x2 = Math.random() * 600; laser.y2 = 400;
        } else if (side === 1) { // Right
            laser.x1 = 600; laser.y1 = Math.random() * 400;
            laser.x2 = 0; laser.y2 = Math.random() * 400;
        } else if (side === 2) { // Bottom
            laser.x1 = Math.random() * 600; laser.y1 = 400;
            laser.x2 = Math.random() * 600; laser.y2 = 0;
        } else { // Left
            laser.x1 = 0; laser.y1 = Math.random() * 400;
            laser.x2 = 600; laser.y2 = Math.random() * 400;
        }
        this.lasers.push(laser);
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, 600, 400);
        this.timer++;
        if (this.timer % Math.max(10, 30 - this.app.level * 2) === 0) this.spawnLaser();

        this.ctx.lineWidth = 2;
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            let l = this.lasers[i];
            l.life--;
            if (l.life > 70) { // Warning phase
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                this.ctx.setLineDash([5, 5]);
            } else { // Active phase
                l.active = true;
                this.ctx.strokeStyle = '#ff0055';
                this.ctx.setLineDash([]);
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#ff0055';
                
                // Collision check (point to line distance)
                if (this.checkCollision(this.player.x, this.player.y, l)) {
                    this.gameOver();
                }
            }
            this.ctx.beginPath();
            this.ctx.moveTo(l.x1, l.y1);
            this.ctx.lineTo(l.x2, l.y2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            if (l.life <= 0) {
                this.lasers.splice(i, 1);
                this.score += 5;
                this.app.updateScore(5);
            }
        }

        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.fillRect(this.player.x - 10, this.player.y - 10, 20, 20);
        this.ctx.shadowBlur = 0;

        requestAnimationFrame(() => this.loop());
    }

    checkCollision(px, py, l) {
        const dist = Math.abs((l.y2 - l.y1) * px - (l.x2 - l.x1) * py + l.x2 * l.y1 - l.y2 * l.x1) / Math.sqrt(Math.pow(l.y2 - l.y1, 2) + Math.pow(l.x2 - l.x1, 2));
        return dist < 12;
    }

    gameOver() {
        this.running = false;
        this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>LASER TERMINATED</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RETRY</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
