/**
 * Game 21: Orbital Defense
 */
class OrbitalGame {
    constructor(app) {
        this.app = app;
        this.title = "Core Defense";
        this.description = "Move YOUR shield with the MOUSE. Blocks the incoming particles before they hit the core!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.angle = 0;
        this.particles = [];
        this.score = 0;
        this.timer = 0;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
            <h2 style="color: var(--accent-primary)">CORE SHIELD</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Deflect the particles away!</p>
            <button class="btn-primary" id="start-orbital">ACTIVATE SHIELD</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-orbital').onclick = () => {
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
        const dx = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) - 300;
        const dy = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) - 200;
        this.angle = Math.atan2(dy, dx);
    }

    spawnParticle() {
        const angle = Math.random() * Math.PI * 2;
        this.particles.push({
            x: 300 + Math.cos(angle) * 350,
            y: 200 + Math.sin(angle) * 350,
            speed: 2 + (this.app.level * 0.3)
        });
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, 600, 400);

        this.timer++;
        if (this.timer % Math.max(10, 40 - this.app.level * 3) === 0) this.spawnParticle();

        // Draw Core
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.beginPath();
        this.ctx.arc(300, 200, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw Shield
        this.ctx.strokeStyle = '#7000ff';
        this.ctx.lineWidth = 10;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#7000ff';
        this.ctx.beginPath();
        this.ctx.arc(300, 200, 60, this.angle - 0.5, this.angle + 0.5);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            const dx = 300 - p.x;
            const dy = 200 - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const moveAngle = Math.atan2(dy, dx);
            
            p.x += Math.cos(moveAngle) * p.speed;
            p.y += Math.sin(moveAngle) * p.speed;

            this.ctx.fillStyle = '#ff0055';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Collision with Shield
            if (dist < 70 && dist > 50) {
                const particleAngle = Math.atan2(p.y - 200, p.x - 300);
                let diff = Math.abs(particleAngle - this.angle);
                if (diff > Math.PI) diff = 2 * Math.PI - diff;
                if (diff < 0.6) {
                    this.score += 20;
                    this.app.updateScore(20);
                    this.app.playTone(800, 0.1);
                    this.particles.splice(i, 1);
                    continue;
                }
            }

            // Collision with Core
            if (dist < 20) {
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
        msg.innerHTML = `<h3>CORE BREACH</h3><p>Score: ${this.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">RESTORE</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
