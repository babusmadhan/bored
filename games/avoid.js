/**
 * Game 9: Avoid
 */
class AvoidGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Dodge";
        this.description = "Move your mouse to DODGE the falling red squares!";
        this.score = 0;
        this.running = false;
        this.canvas = null;
        this.ctx = null;
        this.player = { x: 300, y: 350, r: 10 };
        this.obstacles = [];
        this.animationId = null;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">👾</div>
            <h2 style="color: var(--accent-primary)">NEON DODGE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Avoid the RED squares at all costs.<br>
                Move your mouse to move the <span style="color:#00f2ff">CYAN</span> circle.
            </p>
            <button class="btn-primary" id="start-avoid">START DODGING</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-avoid').onclick = () => {
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
        this.player.x = e.clientX - rect.left;
        this.player.y = e.clientY - rect.top;
    }

    loop() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Spawn
        if (Math.random() < 0.1 + (this.app.level * 0.05)) {
            this.obstacles.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                size: 20,
                speed: 3 + Math.random() * 5 + (this.app.level)
            });
        }

        // Draw Player
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw and update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.y += o.speed;
            
            this.ctx.fillStyle = '#ff3355';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff3355';
            this.ctx.fillRect(o.x - o.size/2, o.y - o.size/2, o.size, o.size);

            // Collision
            const dx = this.player.x - o.x;
            const dy = this.player.y - o.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < this.player.r + o.size/2) {
                this.gameOver();
                return;
            }

            if (o.y > this.canvas.height + 20) {
                this.obstacles.splice(i, 1);
                this.score++;
                this.app.updateScore(5);
            }
        }

        this.ctx.shadowBlur = 0;
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.app.playFailure();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3>HIT!</h3>
            <p>Score: ${this.score}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">TRY AGAIN</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        if (this.canvas) this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
