/**
 * Game 25: 15 Puzzle
 */
class SlidePuzzleGame {
    constructor(app) {
        this.app = app;
        this.title = "Cyber Slide";
        this.description = "Slide the tiles until the numbers are in sequential order (1-8). Click adjacent tiles to move them.";
        this.size = 3; // 3x3 for quick play
        this.grid = [];
        this.emptyPos = { x: 2, y: 2 };
        this.running = false;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🧩</div>
            <h2 style="color: var(--accent-primary)">CYBER SLIDE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Reorder the fragments (1-8).</p>
            <button class="btn-primary" id="start-slide">RE-ORDER</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-slide').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        const container = document.createElement('div');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.style.gap = '10px';
        container.style.width = '300px';
        container.style.margin = '1rem auto';

        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, null];
        this.shuffle(numbers);

        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                const val = numbers[y * this.size + x];
                const cell = document.createElement('div');
                cell.className = 'puzzle-cell';
                cell.style.width = '90px';
                cell.style.height = '90px';
                cell.style.border = '2px solid var(--glass-border)';
                cell.style.display = 'flex';
                cell.style.justifyContent = 'center';
                cell.style.alignItems = 'center';
                cell.style.fontSize = '2rem';
                cell.style.fontWeight = '800';
                cell.style.cursor = val ? 'pointer' : 'default';
                cell.style.background = val ? 'rgba(255, 255, 255, 0.05)' : 'transparent';
                cell.style.color = 'var(--accent-primary)';
                if (val) cell.textContent = val;
                else this.emptyPos = { x, y };

                cell.onclick = () => this.moveTile(x, y);
                this.grid[y][x] = { val, el: cell };
                container.appendChild(cell);
            }
        }
        this.app.canvasArea.appendChild(container);
        this.running = true;
    }

    shuffle(arr) {
        // Need to ensure solvability
        for (let i = 0; i < 100; i++) {
            const directions = [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];
            const d = directions[Math.floor(Math.random() * directions.length)];
            const nx = this.emptyPos.x + d.x;
            const ny = this.emptyPos.y + d.y;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                // Swap in logic
                const idx1 = this.emptyPos.y * this.size + this.emptyPos.x;
                const idx2 = ny * this.size + nx;
                [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
                this.emptyPos = { x: nx, y: ny };
            }
        }
    }

    moveTile(x, y) {
        if (!this.running) return;
        const dx = Math.abs(x - this.emptyPos.x);
        const dy = Math.abs(y - this.emptyPos.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            const target = this.grid[y][x];
            const empty = this.grid[this.emptyPos.y][this.emptyPos.x];
            
            // Swap in UI
            empty.el.textContent = target.val;
            empty.el.style.background = 'rgba(255, 255, 255, 0.05)';
            empty.el.style.cursor = 'pointer';
            empty.el.style.border = '2px solid var(--glass-border)';
            empty.val = target.val;
            
            target.el.textContent = '';
            target.el.style.background = 'transparent';
            target.el.style.cursor = 'default';
            target.el.style.border = '2px solid transparent';
            target.val = null;
            
            this.emptyPos = { x, y };
            this.app.playTone(400, 0.1);
            
            if (this.checkWin()) this.gameOver();
        }
    }

    checkWin() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const val = this.grid[y][x].val;
                if (y === this.size - 1 && x === this.size - 1) {
                    if (val !== null) return false;
                } else {
                    if (val !== (y * this.size + x + 1)) return false;
                }
            }
        }
        return true;
    }

    gameOver() {
        this.running = false;
        this.app.playVictory();
        this.app.updateScore(1000);
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>SEQUENCE COMPLETE</h3><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
