/**
 * Game 5: Boom
 */

class BoomGame {
    constructor(app) {
        this.app = app;
        this.title = "Cyber Defuse";
        this.description = "Click the red nodes before they explode! Don't let the timer reach zero.";
        
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.score = 0;
        this.running = false;
        this.animationId = null;
        this.lastSpawn = 0;
        
        this.handleClick = this.handleClick.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">💥</div>
            <h2 style="color: var(--accent-primary)">CYBER DEFUSE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Click the RED nodes before they grow too big!<br>
                One explosion ends the game.
            </p>
            <button class="btn-primary" id="start-boom">START DEFUSING</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-boom').onclick = () => {
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
        
        this.nodes = []; // Reset
        this.explosions = []; // Reset
        this.canvas.addEventListener('mousedown', this.handleClick);
        
        this.running = true;
        this.loop(0);
    }

    spawnNode() {
        this.nodes.push({
            x: 50 + Math.random() * (this.canvas.width - 100),
            y: 50 + Math.random() * (this.canvas.height - 100),
            r: 10,
            maxR: 40 + Math.random() * 20,
            growth: 0.2 + (this.app.level * 0.1),
            color: '#ff3333'
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) * (this.canvas.width / rect.width));
        const my = ((e.clientY - rect.top) * (this.canvas.height / rect.height));
        
        for(let i = this.nodes.length - 1; i >= 0; i--) {
            const n = this.nodes[i];
            const dist = Math.sqrt((mx - n.x)**2 + (my - n.y)**2);
            if(dist < n.r + 10) {
                this.nodes.splice(i, 1);
                this.score += 20;
                this.app.updateScore(20);
                this.createExplosion(n.x, n.y, '#00f2ff');
                return;
            }
        }
    }

    createExplosion(x, y, color) {
        // Just a visual feedback ring
        const ring = { x, y, r: 5, alpha: 1, color };
        this.explosions = this.explosions || [];
        this.explosions.push(ring);
    }

    loop(timestamp) {
        if(!this.running) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Spawn
        if(timestamp - this.lastSpawn > Math.max(400, 1000 - (this.app.level * 100))) {
            this.spawnNode();
            this.lastSpawn = timestamp;
        }
        
        // Draw Nodes
        for(let i = this.nodes.length - 1; i >= 0; i--) {
            const n = this.nodes[i];
            n.r += n.growth;
            
            // Pulse effect
            const glow = Math.sin(timestamp / 100) * 10 + 10;
            
            this.ctx.fillStyle = n.color;
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = n.color;
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Outline
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            if(n.r > n.maxR) {
                this.gameOver();
                return;
            }
        }
        
        // Final Polish: Draw feedback rings
        if(this.explosions) {
            for(let i = this.explosions.length - 1; i >= 0; i--){
                const e = this.explosions[i];
                e.r += 2;
                e.alpha -= 0.05;
                if(e.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }
                this.ctx.strokeStyle = `rgba(0, 242, 255, ${e.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
                this.ctx.stroke();
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
            <h3>KABOOM!</h3>
            <p>System Failure. Defused: ${this.score / 20}</p>
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
        this.canvas.removeEventListener('mousedown', this.handleClick);
    }
}
