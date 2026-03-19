/**
 * Game 10: Snake
 */
class SnakeGame {
    constructor(app) {
        this.app = app;
        this.title = "Cyber Snake";
        this.description = "Eat the neon bits to grow. Use WASD or Arrow Keys to move. Don't hit yourself or the walls!";
        
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 5, y: 5 };
        this.dx = 1;
        this.dy = 0;
        this.nextDir = { dx: 1, dy: 0 };
        this.score = 0;
        this.running = false;
        this.lastUpdateTime = 0;
        this.gameSpeed = 100; // ms per update
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🐍</div>
            <h2 style="color: var(--accent-primary)">CYBER SNAKE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Use WASD or ARROWS to move.<br>
                Collect neon data bits to grow longer.
            </p>
            <button class="btn-primary" id="start-snake">START PROTOCOL</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-snake').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400; // Smaller grid for classic feel
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.app.canvasArea.appendChild(this.canvas);
        
        window.addEventListener('keydown', this.handleKeyDown);
        
        this.spawnFood();
        this.running = true;
        this.loop(0);
    }

    spawnFood() {
        const cols = this.canvas.width / this.gridSize;
        const rows = this.canvas.height / this.gridSize;
        this.food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        // Ensure food doesn't spawn on snake
        if (this.snake.some(s => s.x === this.food.x && s.y === this.food.y)) {
            this.spawnFood();
        }
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if ((key === 'w' || key === 'arrowup') && this.dy === 0) this.nextDir = { dx: 0, dy: -1 };
        if ((key === 's' || key === 'arrowdown') && this.dy === 0) this.nextDir = { dx: 0, dy: 1 };
        if ((key === 'a' || key === 'arrowleft') && this.dx === 0) this.nextDir = { dx: -1, dy: 0 };
        if ((key === 'd' || key === 'arrowright') && this.dx === 0) this.nextDir = { dx: 1, dy: 0 };
    }

    loop(timestamp) {
        if (!this.running) return;

        if (timestamp - this.lastUpdateTime > this.gameSpeed) {
            this.update();
            this.lastUpdateTime = timestamp;
        }

        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        this.dx = this.nextDir.dx;
        this.dy = this.nextDir.dy;

        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Wall Collision
        const cols = this.canvas.width / this.gridSize;
        const rows = this.canvas.height / this.gridSize;
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            this.gameOver();
            return;
        }

        // Self Collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Food Collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.app.updateScore(10);
            this.spawnFood();
            // Speed up slightly
            this.gameSpeed = Math.max(50, 100 - (this.score / 20));
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for(let i=0; i<this.canvas.width; i+=this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Draw Food
        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );

        // Draw Snake
        this.ctx.shadowBlur = 10;
        this.snake.forEach((segment, i) => {
            this.ctx.fillStyle = i === 0 ? '#00f2ff' : '#00aacc';
            this.ctx.shadowColor = '#00f2ff';
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        this.ctx.shadowBlur = 0;
    }

    gameOver() {
        this.running = false;
        this.app.playFailure();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3>CONNECTION LOST</h3>
            <p>Data Bits Collected: ${this.score / 10}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">REBOOT</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}
