/**
 * Game 3: Jump
 */

class JumpGame {
    constructor(app) {
        this.app = app;
        this.title = "Void Jumper";
        this.description = "Press SPACE or Click to jump. Time your jumps to land on the moving platforms.";
        
        this.canvas = null;
        this.ctx = null;
        this.player = { x: 50, y: 0, w: 30, h: 30, vy: 0, grounded: false };
        this.platforms = [];
        this.gravity = 0.6;
        this.jumpForce = -12;
        this.score = 0;
        this.running = false;
        this.animationId = null;
        
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
            <h2 style="color: var(--accent-primary)">VOID JUMPER</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Press SPACE or Click to JUMP.<br>
                Land on platforms to survive. Don't fall!
            </p>
            <button class="btn-primary" id="start-jump">START JUMPING</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-jump').onclick = () => {
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
        
        this.player.y = this.canvas.height - 100;
        
        // Initial Platform
        this.platforms = []; // Reset
        this.platforms.push({ x: 40, y: this.canvas.height - 70, w: 100, h: 15, speed: 0 });
        this.spawnPlatform();
        
        window.addEventListener('keydown', this.handleAction);
        this.canvas.addEventListener('mousedown', this.handleAction);
        
        this.running = true;
        this.loop();
    }

    spawnPlatform() {
        if(!this.running) return;
        
        const last = this.platforms[this.platforms.length - 1];
        const newX = last.x + 150 + Math.random() * 100;
        const newY = this.canvas.height - 70 - (Math.random() * 100);
        
        this.platforms.push({
            x: newX,
            y: Math.min(this.canvas.height - 50, Math.max(150, newY)),
            w: 80 + Math.random() * 40,
            h: 15,
            speed: 0
        });

        if(this.platforms.length > 5) this.platforms.shift();
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
        
        // Physics
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;
        
        let onPlatform = false;
        
        // Horizontal camera follow
        const scrollSpeed = 2 + (this.app.level * 0.5);
        this.platforms.forEach(p => p.x -= scrollSpeed);
        
        // Draw and collide platforms
        this.ctx.fillStyle = '#7000ff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#7000ff';
        
        this.platforms.forEach(p => {
            this.ctx.fillRect(p.x, p.y, p.w, p.h);
            
            // Basic AABB Collision
            if (this.player.vy > 0 && 
                this.player.x + this.player.w > p.x && 
                this.player.x < p.x + p.w && 
                this.player.y + this.player.h > p.y && 
                this.player.y + this.player.h < p.y + p.h + this.player.vy) {
                
                this.player.y = p.y - this.player.h;
                this.player.vy = 0;
                this.player.grounded = true;
                onPlatform = true;
                
                if(!p.scored) {
                    p.scored = true;
                    this.score += 20;
                    this.app.updateScore(20);
                    this.spawnPlatform();
                }
            }
        });

        if(!onPlatform && this.player.y > this.canvas.height - 50) {
            this.player.grounded = false; // Falling into void
        }

        // Death condition
        if(this.player.y > this.canvas.height || this.player.x + this.player.w < 0) {
            this.gameOver();
        }

        // Draw Player
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
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
            <h3>VOID CONSUMES</h3>
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
        window.removeEventListener('keydown', this.handleAction);
        this.canvas.removeEventListener('mousedown', this.handleAction);
    }
}
