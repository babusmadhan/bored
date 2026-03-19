/**
 * Game 13: Neon Stack
 */
class StackGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Stack";
        this.description = "Stack the neon blocks as high as you can! Tap to drop the block.";
        
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        
        this.blocks = [];
        this.viewY = 0;
        this.targetViewY = 0;
        this.score = 0;
        this.gameState = 'ready'; // ready, playing, gameOver
        
        this.blockHeight = 30;
        this.baseWidth = 200;
        this.currentBlock = null;
        this.colors = ['#ff00ff', '#00f2ff', '#00ff88', '#ffff00', '#ff8800', '#7000ff'];
        
        this.handleAction = this.handleAction.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏢</div>
            <h2 style="color: var(--accent-primary)">NEON STACK</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Blocks slide back and forth.<br>
                Tap to drop them exactly on the stack!<br>
                Missed parts will be trimmed.
            </p>
            <button class="btn-primary" id="start-stack">START STACKING</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-stack').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 500;
        this.canvas.style.background = 'rgba(0,0,0,0.2)';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
        this.app.canvasArea.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.reset();
        this.running = true;
        this.loop();
        
        window.addEventListener('keydown', this.handleAction);
        this.canvas.addEventListener('mousedown', this.handleAction);
    }

    reset() {
        this.blocks = [
            { x: 100, y: 450, w: 200, color: this.colors[0] }
        ];
        this.score = 0;
        this.viewY = 0;
        this.targetViewY = 0;
        this.gameState = 'playing';
        this.spawnBlock();
    }

    spawnBlock() {
        const lastBlock = this.blocks[this.blocks.length - 1];
        const colorIdx = this.blocks.length % this.colors.length;
        
        this.currentBlock = {
            x: -lastBlock.w,
            y: lastBlock.y - this.blockHeight,
            w: lastBlock.w,
            color: this.colors[colorIdx],
            speed: 2 + (this.blocks.length * 0.1),
            dir: 1
        };
        
        if (this.blocks.length > 5) {
            this.targetViewY = (this.blocks.length - 5) * this.blockHeight;
        }
    }

    handleAction(e) {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
        if (this.gameState !== 'playing') return;
        
        const lastBlock = this.blocks[this.blocks.length - 1];
        const diff = this.currentBlock.x - lastBlock.x;
        
        if (Math.abs(diff) >= lastBlock.w) {
            this.gameOver();
            return;
        }
        
        // Trim block
        if (diff > 0) {
            this.currentBlock.w -= diff;
        } else {
            this.currentBlock.w += diff;
            this.currentBlock.x = lastBlock.x;
        }
        
        this.blocks.push({...this.currentBlock});
        this.score++;
        this.app.updateScore(10);
        this.app.playTone(200 + (this.score * 20), 0.1, 'sine', 0.1);
        
        this.spawnBlock();
    }

    loop() {
        if (!this.running) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.gameState === 'playing') {
            this.currentBlock.x += this.currentBlock.speed * this.currentBlock.dir;
            
            const maxRight = this.canvas.width - this.currentBlock.w;
            if (this.currentBlock.x >= maxRight) {
                this.currentBlock.x = maxRight;
                this.currentBlock.dir = -1;
            } else if (this.currentBlock.x <= 0 && this.blocks.length > 1) { 
                // Only bounce on left if we're actually on screen
                this.currentBlock.x = 0;
                this.currentBlock.dir = 1;
            }
        }
        
        // Smooth camera
        this.viewY += (this.targetViewY - this.viewY) * 0.1;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(0, this.viewY);
        
        // Draw stack
        this.blocks.forEach((b, i) => {
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = b.color;
            this.ctx.fillRect(b.x, b.y, b.w, this.blockHeight);
            
            // Add reflection/glare
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.fillRect(b.x, b.y, b.w, 2);
        });
        
        // Draw current moving block
        if (this.gameState === 'playing') {
            const b = this.currentBlock;
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = b.color;
            this.ctx.fillRect(b.x, b.y, b.w, this.blockHeight);
        }
        
        this.ctx.restore();
        
        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Outfit';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.fillText(`HEIGHT: ${this.score}`, this.canvas.width/2, 40);
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.app.playFailure();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h2>TOWER COLLAPSED</h2>
            <p style="font-size: 1.5rem">Height: ${this.score}</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 1rem;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">REBUILD</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        window.removeEventListener('keydown', this.handleAction);
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.handleAction);
        }
    }
}
