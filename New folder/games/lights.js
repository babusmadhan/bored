/**
 * Game 29: Lights Out
 */
class LightsOutGame {
    constructor(app) {
        this.app = app;
        this.title = "Circuit Break";
        this.description = "Switch ALL cells to DARK by clicking them. Clicking a cell toggles itself and its neighbors.";
        this.size = 5;
        this.grid = [];
        this.running = false;
        this.moves = 0;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">💡</div>
            <h2 style="color: var(--accent-primary)">CIRCUIT BREAK</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Switch all grid nodes to dark.</p>
            <button class="btn-primary" id="start-lights">BREAK CIRCUIT</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-lights').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        gridContainer.style.gap = '8px';
        gridContainer.style.width = '300px';
        gridContainer.style.margin = '1rem auto';

        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.style.width = '55px';
                cell.style.height = '55px';
                cell.style.border = '1px solid var(--glass-border)';
                cell.style.cursor = 'pointer';
                cell.style.transition = 'all 0.2s';
                cell.onclick = () => this.toggle(x, y);
                this.grid[y][x] = { active: false, el: cell };
                gridContainer.appendChild(cell);
            }
        }

        // Randomize the grid (scramble)
        for (let i = 0; i < 15; i++) {
            this.toggle(Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size), true);
        }

        this.app.canvasArea.appendChild(gridContainer);
        this.running = true;
        this.updateUI();
    }

    toggle(x, y, initial = false) {
        if (!this.running && !initial) return;
        const pts = [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        pts.forEach(([px, py]) => {
            if (px >= 0 && px < this.size && py >= 0 && py < this.size) {
                this.grid[py][px].active = !this.grid[py][px].active;
            }
        });
        
        if (!initial) {
            this.moves++;
            this.app.playTone(300, 0.05);
            this.updateUI();
            if (this.checkWin()) this.gameOver();
        }
    }

    updateUI() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const c = this.grid[y][x];
                c.el.style.background = c.active ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.02)';
                c.el.style.boxShadow = c.active ? '0 0 15px var(--accent-primary)' : 'none';
            }
        }
    }

    checkWin() {
        return this.grid.every(row => row.every(cell => !cell.active));
    }

    gameOver() {
        this.running = false;
        this.app.playVictory();
        this.app.updateScore(1800);
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>CIRCUIT BROKEN</h3><p>Moves: ${this.moves}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
