/**
 * Game 4: Run
 */

class RunGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Runner";
        this.description = "Character runs automatically. Press SPACE or Click to jump over obstacles.";
        
        this.canvas = null;
        this.ctx = null;
        this.player = { x: 80, y: 0, w: 40, h: 40, vy: 0, grounded: false };
        this.obstacles = [];
        this.gravity = 0.8;
        this.jumpForce = -15;
        this.groundY = 350;
        this.score = 0;
        this.animationId = null;
        this.spawnTimeout = null;
        this.running = false;
        
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏃</div>
            <h2 style="color: var(--accent-primary)">NEON RUNNER</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Character runs automatically.<br>
                Press SPACE or Click to JUMP over obstacles.
            </p>
            <button class="btn-primary" id="start-run">START RUNNING</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-run').onclick = () => {
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
        
        this.player.y = this.groundY - this.player.h;
        this.obstacles = []; // Reset
        
        window.addEventListener('keydown', this.handleAction);
        this.canvas.addEventListener('mousedown', this.handleAction);
        
        this.running = true;
        this.spawnObstacle();
        this.loop();
    }

    spawnObstacle() {
        if(!this.running) return;
        
        const type = Math.random() > 0.5 ? 'tall' : 'wide';
        this.obstacles.push({
            x: this.canvas.width + 100,
            y: type === 'tall' ? this.groundY - 60 : this.groundY - 30,
            w: type === 'tall' ? 30 : 60,
            h: type === 'tall' ? 60 : 30,
            color: '#ff0055'
        });
        
        const nextTime = 1000 + Math.random() * 2000 - (this.app.level * 100);
        this.spawnTimeout = setTimeout(() => this.spawnObstacle(), Math.max(700, nextTime));
    }

    handleAction(e) {
        if((e.type === 'keydown' && e.code === 'Space') || e.type === 'mousedown') {
            if(this.player.grounded) {
                this.player.vy = this.jumpForce;
                this.player.grounded = false;
            }
        }
    }

    loop() {
        if(!this.running) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Ground
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        // Physics
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;
        
        if (this.player.y + this.player.h > this.groundY) {
            this.player.y = this.groundY - this.player.h;
            this.player.vy = 0;
            this.player.grounded = true;
        }

        // Obstacles
        this.ctx.shadowBlur = 10;
        const speed = 5 + (this.app.level * 0.5);
        
        for(let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.x -= speed;
            
            this.ctx.fillStyle = o.color;
            this.ctx.shadowColor = o.color;
            this.ctx.fillRect(o.x, o.y, o.w, o.h);
            
            // Collision
            if (this.player.x < o.x + o.w &&
                this.player.x + this.player.w > o.x &&
                this.player.y < o.y + o.h &&
                this.player.y + this.player.h > o.y) {
                this.gameOver();
            }
            
            if(o.x + o.w < 0) {
                this.obstacles.splice(i, 1);
                this.score += 15;
                this.app.updateScore(15);
            }
        }

        // Draw Player
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
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
            <h3>CRASHED</h3>
            <p>Distance covered: ${this.score}m</p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">TRY AGAIN</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        clearTimeout(this.spawnTimeout);
        window.removeEventListener('keydown', this.handleAction);
        this.canvas.removeEventListener('mousedown', this.handleAction);
    }
}
