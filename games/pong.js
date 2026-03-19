/**
 * Game 16: Neon Pong
 */
class PongGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Pong";
        this.description = "Move YOUR paddle with the MOUSE. Defeat the AI!";
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.p1 = { y: 150, score: 0 };
        this.p2 = { y: 150, score: 0 };
        this.ball = { x: 300, y: 200, dx: 5, dy: 3 };
        this.paddleW = 10;
        this.paddleH = 80;
        this.animationId = null;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏓</div>
            <h2 style="color: var(--accent-primary)">NEON PONG</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">First to 5 wins!</p>
            <button class="btn-primary" id="start-pong">START MATCH</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-pong').onclick = () => {
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
        this.p1.y = e.clientY - rect.top - this.paddleH / 2;
    }

    loop() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, 600, 400);

        // Ball movement
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Collision Top/Bottom
        if (this.ball.y < 5 || this.ball.y > 395) {
            this.ball.dy = -this.ball.dy;
            this.app.playTone(400, 0.05);
        }

        // AI movement
        const aiSpeed = 3 + (this.app.level * 0.5);
        if (this.p2.y + this.paddleH / 2 < this.ball.y) this.p2.y += aiSpeed;
        else this.p2.y -= aiSpeed;

        // Collision P1
        if (this.ball.x < 30 && this.ball.y > this.p1.y && this.ball.y < this.p1.y + this.paddleH) {
            this.ball.dx = Math.abs(this.ball.dx) + 0.2;
            this.ball.dy += (Math.random() - 0.5) * 4;
            this.app.playTone(500, 0.1);
        }
        // Collision P2
        if (this.ball.x > 570 && this.ball.y > this.p2.y && this.ball.y < this.p2.y + this.paddleH) {
            this.ball.dx = -Math.abs(this.ball.dx) - 0.2;
            this.ball.dy += (Math.random() - 0.5) * 4;
            this.app.playTone(500, 0.1);
        }

        // Scoring
        if (this.ball.x < 0) {
            this.p2.score++;
            this.resetBall();
        } else if (this.ball.x > 600) {
            this.p1.score++;
            this.app.updateScore(50);
            this.resetBall();
        }

        this.draw();
        
        if (this.p1.score >= 5 || this.p2.score >= 5) {
            this.gameOver(this.p1.score >= 5);
        } else {
            this.animationId = requestAnimationFrame(() => this.loop());
        }
    }

    resetBall() {
        this.ball.x = 300;
        this.ball.y = 200;
        this.ball.dx = (Math.random() > 0.5 ? 4 : -4);
        this.ball.dy = (Math.random() - 0.5) * 6;
    }

    draw() {
        this.ctx.fillStyle = '#7000ff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#7000ff';
        this.ctx.fillRect(20, this.p1.y, this.paddleW, this.paddleH);
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.fillRect(570, this.p2.y, this.paddleW, this.paddleH);
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Outfit';
        this.ctx.fillText(this.p1.score, 150, 50);
        this.ctx.fillText(this.p2.score, 450, 50);
    }

    gameOver(won) {
        this.running = false;
        if (won) this.app.playVictory();
        else this.app.playFailure();
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'YOU WIN!' : 'CPU WINS'}</h3><p>Human: ${this.p1.score} | AI: ${this.p2.score}</p><button class="btn-primary" onclick="app.reloadCurrentGame()">REMATCH</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
