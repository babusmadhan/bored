/**
 * Game 34: Mirror Reflector
 */
class MirrorPuzzleGame {
    constructor(app) {
        this.app = app;
        this.title = "Data Reflector";
        this.description = "Redirect the BEAM to hit the green target by clicking current MIRRORS to rotate them! (45/135 deg)";
        this.grid = [];
        this.size = 5;
        this.mirrors = [];
        this.target = { x: 4, y: 2 };
        this.source = { x: 0, y: 2, dir: 'R' };
        this.running = false;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🪞</div>
            <h2 style="color: var(--accent-primary)">CORE REFLECTOR</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Redirect the optical data beam.</p>
            <button class="btn-primary" id="start-mirror">INITIATE BEAM</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-mirror').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.grid = [];
        const container = document.createElement('div');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.style.gap = '10px';
        container.style.width = '300px';
        container.style.margin = '1rem auto';

        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.style.width = '55px';
                cell.style.height = '55px';
                cell.style.border = '1px solid var(--glass-border)';
                cell.style.display = 'flex';
                cell.style.justifyContent = 'center';
                cell.style.alignItems = 'center';
                
                let val = null;
                if (x === this.source.x && y === this.source.y) {
                    cell.innerHTML = '▶'; cell.style.color = 'var(--accent-primary)';
                } else if (x === this.target.x && y === this.target.y) {
                    cell.innerHTML = '🎯'; cell.style.color = '#00ff88';
                } else if (Math.random() < 0.4) {
                    val = Math.random() < 0.5 ? '/' : '\\';
                    cell.innerHTML = val;
                    cell.style.cursor = 'pointer';
                    cell.onclick = () => this.rotateMirror(x, y);
                    this.mirrors.push({ x, y, type: val, el: cell });
                }
                
                this.grid[y][x] = { val, el: cell };
                container.appendChild(cell);
            }
        }

        this.app.canvasArea.appendChild(container);
        this.running = true;
        this.traceBeam();
    }

    rotateMirror(x, y) {
        if (!this.running) return;
        const m = this.grid[y][x];
        m.val = m.val === '/' ? '\\' : '/';
        m.el.innerHTML = m.val;
        this.app.playTone(300, 0.05);
        this.traceBeam();
    }

    traceBeam() {
        this.grid.flat().forEach(c => c.el.style.boxShadow = 'none');
        let cx = this.source.x, cy = this.source.y, cd = this.source.dir;
        let path = [{x: cx, y: cy}];

        for (let i = 0; i < 20; i++) {
            if (cd === 'R') cx++; else if (cd === 'L') cx--; else if (cd === 'U') cy--; else if (cd === 'D') cy++;
            
            if (cx < 0 || cx >= this.size || cy < 0 || cy >= this.size) break;
            path.push({x: cx, y: cy});

            if (cx === this.target.x && cy === this.target.y) {
                this.gameOver();
                break;
            }

            const m = this.grid[cy][cx].val;
            if (m === '/') {
                if (cd === 'R') cd = 'U'; else if (cd === 'L') cd = 'D'; else if (cd === 'U') cd = 'R'; else if (cd === 'D') cd = 'L';
            } else if (m === '\\') {
                if (cd === 'R') cd = 'D'; else if (cd === 'L') cd = 'U'; else if (cd === 'U') cd = 'L'; else if (cd === 'D') cd = 'R';
            }
        }
        
        path.forEach(p => this.grid[p.y][p.x].el.style.boxShadow = 'inset 0 0 10px var(--accent-primary)');
    }

    gameOver() {
        this.running = false;
        this.app.playVictory();
        this.app.updateScore(2000);
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>BEAM SYNCED</h3><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
