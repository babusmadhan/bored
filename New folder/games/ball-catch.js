/**
 * Game 2: Ball Catch
 */

class BallCatchGame {
    constructor(app) {
        this.app = app;
        this.title = "Aqua Catch";
        this.description = "Move your mouse or use Left/Right keys to catch the falling neon orbs. Miss 3 and it's over.";
        
        this.canvas = null;
        this.ctx = null;
        this.paddle = { x: 0, y: 0, w: 100, h: 20 };
        this.balls = [];
        this.missed = 0;
        this.score = 0;
        this.animationId = null;
        this.spawnTimeout = null;
        this.running = false;
        
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎾</div>
            <h2 style="color: var(--accent-primary)">AQUA CATCH</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Move Mouse or use Arrows to move paddle.<br>
                Catch the neon orbs. Don't miss 3!
            </p>
            <button class="btn-primary" id="start-catch">START CATCHING</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-catch').onclick = () => {
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
        
        this.paddle.x = this.canvas.width / 2 - this.paddle.w / 2;
        this.paddle.y = this.canvas.height - 40;
        
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('keydown', this.handleKeyDown);
        
        this.running = true;
        this.spawnBall();
        this.loop();
    }

    spawnBall() {
        if(!this.running) return;
        
        this.balls.push({
            x: Math.random() * (this.canvas.width - 20) + 10,
            y: -20,
            r: Math.random() * 8 + 5,
            speed: Math.random() * 2 + 2 + (this.app.level * 0.5),
            color: Math.random() > 0.5 ? '#00f2ff' : '#7000ff'
        });
        
        this.spawnTimeout = setTimeout(() => this.spawnBall(), Math.max(500, 1500 - (this.app.level * 100)));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const root = document.documentElement;
        const mouseX = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) - root.scrollLeft;
        this.paddle.x = mouseX - this.paddle.w / 2;
        
        // Keep in bounds
        if(this.paddle.x < 0) this.paddle.x = 0;
        if(this.paddle.x + this.paddle.w > this.canvas.width) this.paddle.x = this.canvas.width - this.paddle.w;
    }

    handleKeyDown(e) {
        const step = 30;
        if(e.key === 'ArrowLeft') this.paddle.x -= step;
        if(e.key === 'ArrowRight') this.paddle.x += step;
        
        if(this.paddle.x < 0) this.paddle.x = 0;
        if(this.paddle.x + this.paddle.w > this.canvas.width) this.paddle.x = this.canvas.width - this.paddle.w;
    }

    loop() {
        if(!this.running) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Paddle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw Balls
        for(let i = this.balls.length - 1; i >= 0; i--) {
            const b = this.balls[i];
            b.y += b.speed;
            
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = b.color;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Collision
            if(b.y + b.r > this.paddle.y && b.x > this.paddle.x && b.x < this.paddle.x + this.paddle.w) {
                this.balls.splice(i, 1);
                this.score += 10;
                this.app.updateScore(10);
                continue;
            }
            
            // Miss
            if(b.y > this.canvas.height) {
                this.balls.splice(i, 1);
                this.missed++;
                if(this.missed >= 3) {
                    this.gameOver();
                }
            }
        }
        
        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Outfit';
        this.ctx.fillText(`MISSES: ${this.missed}/3`, 10, 20);
        
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.app.playFailure();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3>GAME OVER</h3>
            <p>Score this round: ${this.score}</p>
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
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}
