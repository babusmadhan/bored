/**
 * Game 20: Mine Glitch
 */
class MineGlitchGame {
    constructor(app) {
        this.app = app;
        this.title = "Grid Defuser";
        this.description = "Click THE cells to reveal them. Numbers show nearby GLITCHES. Don't click a glitch!";
        this.size = 10;
        this.mines = 15;
        this.grid = [];
        this.revealedCount = 0;
        this.running = false;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">💣</div>
            <h2 style="color: var(--accent-primary)">GRID DEFUSE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Clear the system of all 15 hidden glitches.</p>
            <button class="btn-primary" id="start-mines">RUN DIAGNOSTIC</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-mines').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.grid = [];
        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.grid[y][x] = { isMine: false, revealed: false, count: 0, el: null };
            }
        }

        let placed = 0;
        while (placed < this.mines) {
            let rx = Math.floor(Math.random() * this.size);
            let ry = Math.floor(Math.random() * this.size);
            if (!this.grid[ry][rx].isMine) {
                this.grid[ry][rx].isMine = true;
                placed++;
            }
        }

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x].isMine) continue;
                let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (y + dy >= 0 && y + dy < this.size && x + dx >= 0 && x + dx < this.size) {
                            if (this.grid[y + dy][x + dx].isMine) count++;
                        }
                    }
                }
                this.grid[y][x].count = count;
            }
        }

        const container = document.createElement('div');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.style.gap = '4px';
        container.style.width = '350px';
        container.style.margin = '1rem auto';

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.style.width = '30px';
                cell.style.height = '30px';
                cell.style.background = 'rgba(255, 255, 255, 0.05)';
                cell.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                cell.style.display = 'flex';
                cell.style.justifyContent = 'center';
                cell.style.alignItems = 'center';
                cell.style.cursor = 'pointer';
                cell.style.fontSize = '0.8rem';
                cell.style.fontWeight = 'bold';
                cell.onclick = () => this.reveal(x, y);
                this.grid[y][x].el = cell;
                container.appendChild(cell);
            }
        }
        this.app.canvasArea.appendChild(container);
        this.running = true;
    }

    reveal(x, y) {
        if (!this.running || this.grid[y][x].revealed) return;
        const c = this.grid[y][x];
        c.revealed = true;
        c.el.style.background = 'rgba(255, 255, 255, 0.15)';
        c.el.style.border = '1px solid var(--accent-primary)';
        c.el.style.cursor = 'default';
        this.revealedCount++;

        if (c.isMine) {
            c.el.innerHTML = '⚡';
            c.el.style.background = '#ff0055';
            this.gameOver(false);
            return;
        }

        if (c.count > 0) {
            c.el.innerHTML = c.count;
            c.el.style.color = '#fff';
        } else {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (y + dy >= 0 && y + dy < this.size && x + dx >= 0 && x + dx < this.size) {
                        this.reveal(x + dx, y + dy);
                    }
                }
            }
        }

        this.app.playTone(400 + this.revealedCount * 10, 0.05);

        if (this.revealedCount === (this.size * this.size) - this.mines) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        this.running = false;
        if (won) {
            this.app.playVictory();
            this.app.updateScore(500);
        } else {
            this.app.playFailure();
        }
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'SYSTEM CLEARED' : 'SYSTEM CRASHED'}</h3><p>Revealed: ${this.revealedCount} cells</p><button class="btn-primary" onclick="app.reloadCurrentGame()">REBOOT</button><button class="btn-primary" onclick="app.loadNextGame()" style="background:var(--accent-secondary)">NEXT</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
    }
}
