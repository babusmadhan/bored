/**
 * Game 28: Flood Fill
 */
class FloodFillGame {
    constructor(app) {
        this.app = app;
        this.title = "Cyber Infiltration";
        this.description = "Fill the entire grid with a single color. Start from the top-left and pick colors to 'infect' neighbors. Use 20 moves or less.";
        this.size = 12;
        this.grid = [];
        this.colors = ['#ff0055', '#7000ff', '#00f2ff', '#00ffaa', '#ffff00', '#ff8800'];
        this.moves = 20;
        this.running = false;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🌊</div>
            <h2 style="color: var(--accent-primary)">CORE VIRUS</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Infect the entire system grid.</p>
            <button class="btn-primary" id="start-flood">RELEASE FLOOD</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-flood').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.grid = Array.from({ length: this.size }, () => 
            Array.from({ length: this.size }, () => this.colors[Math.floor(Math.random() * this.colors.length)])
        );

        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.ctx = this.canvas.getContext('2d');
        
        this.colorDock = document.createElement('div');
        this.colorDock.style.display = 'flex';
        this.colorDock.style.gap = '10px';
        this.colorDock.style.marginTop = '1rem';
        this.colorDock.style.justifyContent = 'center';

        this.colors.forEach((c, idx) => {
            const btn = document.createElement('div');
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.background = c;
            btn.style.borderRadius = '50%';
            btn.style.cursor = 'pointer';
            btn.style.border = '2px solid transparent';
            btn.onclick = () => this.infect(c);
            this.colorDock.appendChild(btn);
        });

        this.moveCounter = document.createElement('div');
        this.moveCounter.style.fontSize = '1.2rem';
        this.moveCounter.style.color = 'var(--accent-secondary)';
        this.moveCounter.textContent = `MOVES LEFT: ${this.moves}`;

        this.app.canvasArea.appendChild(this.moveCounter);
        this.app.canvasArea.appendChild(this.canvas);
        this.app.canvasArea.appendChild(this.colorDock);
        this.running = true;
        this.draw();
    }

    infect(newColor) {
        if (!this.running || this.moves <= 0) return;
        const oldColor = this.grid[0][0];
        if (oldColor === newColor) return;

        this.flood(0, 0, oldColor, newColor);
        this.moves--;
        this.moveCounter.textContent = `MOVES LEFT: ${this.moves}`;
        this.app.playTone(300 + (20 - this.moves) * 20, 0.1);
        this.draw();

        if (this.checkWin()) this.gameOver(true);
        else if (this.moves <= 0) this.gameOver(false);
    }

    flood(x, y, oldC, newC) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
        if (this.grid[y][x] !== oldC) return;
        this.grid[y][x] = newC;
        this.flood(x + 1, y, oldC, newC);
        this.flood(x - 1, y, oldC, newC);
        this.flood(x, y + 1, oldC, newC);
        this.flood(x, y - 1, oldC, newC);
    }

    draw() {
        const cellSize = 300 / this.size;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.ctx.fillStyle = this.grid[y][x];
                this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    checkWin() {
        const c = this.grid[0][0];
        return this.grid.every(row => row.every(cell => cell === c));
    }

    gameOver(won) {
        this.running = false;
        if (won) {
            this.app.playVictory();
            this.app.updateScore(2000);
        } else {
            this.app.playFailure();
        }
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'GRID INFECTED' : 'SYSTEM DEFENDED'}</h3><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
