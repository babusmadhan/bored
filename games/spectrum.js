/**
 * Game 11: Color Match
 */
class ColorMatchGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Spectrum";
        this.description = "Match the center color with the falling rings! Press SPACE to switch colors.";
        
        this.canvas = null;
        this.ctx = null;
        this.playerColorIdx = 0;
        this.colors = ['#00f2ff', '#ff0055', '#7000ff', '#ffff00'];
        this.rings = [];
        this.score = 0;
        this.running = false;
        this.animationId = null;
        this.lastSpawn = 0;
        
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🌈</div>
            <h2 style="color: var(--accent-primary)">NEON SPECTRUM</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Falling rings must match your center pulse!<br>
                Press <span style="color:var(--accent-primary)">SPACE</span> or <span style="color:var(--accent-primary)">CLICK</span> to swap colors.
            </p>
            <button class="btn-primary" id="start-spectrum">SYNC COLORS</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-spectrum').onclick = () => {
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
        this.loop(0);
    }

    handleAction(e) {
        if ((e.type === 'keydown' && e.code === 'Space') || e.type === 'mousedown') {
            this.playerColorIdx = (this.playerColorIdx + 1) % this.colors.length;
        }
    }

    spawnRing() {
        const colorIdx = Math.floor(Math.random() * this.colors.length);
        this.rings.push({
            y: -20,
            x: this.canvas.width / 2,
            r: 10,
            speed: 3 + (this.app.level * 0.5),
            colorIdx: colorIdx,
            color: this.colors[colorIdx]
        });
    }

    loop(timestamp) {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Spawn
        if (timestamp - this.lastSpawn > Math.max(600, 1500 - (this.app.level * 100))) {
            this.spawnRing();
            this.lastSpawn = timestamp;
        }

        const centerY = this.canvas.height - 60;
        const centerX = this.canvas.width / 2;

        // Draw Player (Target Zone)
        const pColor = this.colors[this.playerColorIdx];
        this.ctx.strokeStyle = pColor;
        this.ctx.lineWidth = 5;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = pColor;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Inner pulse
        const pulse = Math.sin(timestamp / 100) * 5 + 10;
        this.ctx.fillStyle = pColor;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw and update rings
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            r.y += r.speed;
            
            this.ctx.strokeStyle = r.color;
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = r.color;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 25, 0, Math.PI * 2);
            this.ctx.stroke();

            // Collision / Check Match
            if (r.y > centerY - 10 && r.y < centerY + 10) {
                if (r.colorIdx === this.playerColorIdx) {
                    this.rings.splice(i, 1);
                    this.score += 25;
                    this.app.updateScore(25);
                    // Visual feedback
                    this.ctx.fillStyle = '#fff';
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, 40, 0, Math.PI*2);
                    this.ctx.fill();
                } else {
                    this.gameOver();
                    return;
                }
            } else if (r.y > centerY + 40) {
                // Missed opportunity (not game over, but no points)
                this.rings.splice(i, 1);
            }
        }

        this.ctx.shadowBlur = 0;
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    }

    gameOver() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.app.playFailure();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3>DESYNC ERROR</h3>
            <p>Score: ${this.score}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">RE-SYNC</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleAction);
        this.canvas.removeEventListener('mousedown', this.handleAction);
    }
}
