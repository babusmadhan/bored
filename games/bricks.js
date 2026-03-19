/**
 * Game 14: Neon Bricks
 * A fast-paced breakout-style game with neon aesthetics.
 */

class BricksGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Bricks";
        this.description = "Move the paddle to bounce the ball and break all bricks. Use Mouse or Arrow keys.";
        
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.animationId = null;
        
        // Game state
        this.score = 0;
        this.ball = { x: 0, y: 0, dx: 4, dy: -4, radius: 8 };
        this.paddle = { x: 0, y: 0, width: 100, height: 12, speed: 8 };
        this.bricks = [];
        this.rowCount = 5;
        this.columnCount = 8;
        this.brickWidth = 60;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 30;

        this.keys = { left: false, right: false };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🧱</div>
            <h2 style="color: var(--accent-primary)">NEON BRICKS</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Bounce the ball to break all bricks.<br>
                Don't let the ball fall past your paddle!<br>
                Use <b>MOUSE</b> or <b>ARROW KEYS</b> to move.
            </p>
            <button class="btn-primary" id="start-bricks">IGNITE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-bricks').onclick = () => {
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

        // Reset state
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.paddle.y = this.canvas.height - 30;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 5;
        
        const speedMultiplier = 1 + (this.app.level * 0.1);
        this.ball.dx = 4 * speedMultiplier;
        this.ball.dy = -4 * speedMultiplier;

        this.initBricks();

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        this.running = true;
        this.loop();
    }

    initBricks() {
        this.bricks = [];
        const colors = ['#ff0055', '#7000ff', '#00f2ff', '#00ffaa', '#ffff00'];
        for (let c = 0; c < this.columnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.rowCount; r++) {
                this.bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: 1, 
                    color: colors[r % colors.length] 
                };
            }
        }
    }

    handleKeyDown(e) {
        if (e.key === "Right" || e.key === "ArrowRight") this.keys.right = true;
        else if (e.key === "Left" || e.key === "ArrowLeft") this.keys.left = true;
    }

    handleKeyUp(e) {
        if (e.key === "Right" || e.key === "ArrowRight") this.keys.right = false;
        else if (e.key === "Left" || e.key === "ArrowLeft") this.keys.left = false;
    }

    handleMouseMove(e) {
        const relativeX = ((e.clientX - this.canvas.getBoundingClientRect().left) * (this.canvas.width / this.canvas.getBoundingClientRect().width));
        if (relativeX > 0 && relativeX < this.canvas.width) {
            this.paddle.x = relativeX - this.paddle.width / 2;
        }
    }

    collisionDetection() {
        for (let c = 0; c < this.columnCount; c++) {
            for (let r = 0; r < this.rowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    if (this.ball.x > b.x && this.ball.x < b.x + this.brickWidth && this.ball.y > b.y && this.ball.y < b.y + this.brickHeight) {
                        this.ball.dy = -this.ball.dy;
                        b.status = 0;
                        this.score += 10;
                        this.app.updateScore(10);
                        this.app.playTone(440 + (r * 50), 0.1, 'sine', 0.1);
                        
                        if (this.checkWin()) {
                            this.victory();
                        }
                    }
                }
            }
        }
    }

    checkWin() {
        for (let c = 0; c < this.columnCount; c++) {
            for (let r = 0; r < this.rowCount; r++) {
                if (this.bricks[c][r].status === 1) return false;
            }
        }
        return true;
    }

    loop() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        this.collisionDetection();

        // Ball movement
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || this.ball.x + this.ball.dx < this.ball.radius) {
            this.ball.dx = -this.ball.dx;
            this.app.playTone(300, 0.05, 'sine', 0.05);
        }
        if (this.ball.y + this.ball.dy < this.ball.radius) {
            this.ball.dy = -this.ball.dy;
            this.app.playTone(300, 0.05, 'sine', 0.05);
        } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius - 20) {
            if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
                // Adjust angle based on where it hit the paddle
                const hitPos = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
                this.ball.dy = -Math.abs(this.ball.dy);
                this.ball.dx = hitPos * 5;
                this.app.playTone(200, 0.1, 'sine', 0.1);
            } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
                this.gameOver();
                return;
            }
        }

        if (this.keys.right && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        } else if (this.keys.left && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#fff";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#fff";
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = "var(--accent-primary)";
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "var(--accent-primary)";
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;
    }

    drawBricks() {
        for (let c = 0; c < this.columnCount; c++) {
            for (let r = 0; r < this.rowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = this.bricks[c][r].color;
                    this.ctx.shadowBlur = 5;
                    this.ctx.shadowColor = this.bricks[c][r].color;
                    this.ctx.fill();
                    this.ctx.closePath();
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    victory() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.app.playVictory();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3 style="color: var(--accent-primary)">CORE CLEARED</h3>
            <p>Score: ${this.score}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    gameOver() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.app.playFailure();
        
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3 style="color: #ff0055">CONNECTION LOST</h3>
            <p>Bricks remaining: ${this.getBricksRemaining()}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">REBOOT</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">SKIP</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    getBricksRemaining() {
        let count = 0;
        for (let c = 0; c < this.columnCount; c++) {
            for (let r = 0; r < this.rowCount; r++) {
                if (this.bricks[c][r].status === 1) count++;
            }
        }
        return count;
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
