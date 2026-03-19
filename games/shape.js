/**
 * Game 32: Shape Match
 */
class ShapeMatchGame {
    constructor(app) {
        this.app = app;
        this.title = "Core Shape";
        this.description = "Memorize the pattern and recreate it by clicking the correct cells in the correct order!";
        this.size = 4;
        this.sequence = [];
        this.userSequence = [];
        this.currentRound = 1;
        this.running = false;
        this.isDestroyed = false;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔷</div>
            <h2 style="color: var(--accent-primary)">CORE GEOMETRY</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Reconstruct 5 memory core shapes.</p>
            <button class="btn-primary" id="start-shape">SYNC GEOMETRY</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-shape').onclick = () => {
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

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.style.width = '65px';
            cell.style.height = '65px';
            cell.style.border = '1px solid var(--glass-border)';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'all 0.2s';
            cell.onclick = () => this.handleCellClick(i);
            this.grid.push(cell);
            container.appendChild(cell);
        }

        this.app.canvasArea.appendChild(container);
        this.running = true;
        this.nextRound();
    }

    nextRound() {
        if (this.currentRound > 5) {
            this.gameOver(true);
            return;
        }

        this.sequence = [];
        this.userSequence = [];
        while (this.sequence.length < this.currentRound + 2) {
            const val = Math.floor(Math.random() * (this.size * this.size));
            if (!this.sequence.includes(val)) this.sequence.push(val);
        }

        this.playSequence();
    }

    async playSequence() {
        this.state = 'watching';
        await new Promise(r => setTimeout(r, 800));
        
        for (const idx of this.sequence) {
            if (this.isDestroyed) return;
            const el = this.grid[idx];
            el.style.background = 'var(--accent-primary)';
            el.style.boxShadow = '0 0 15px var(--accent-primary)';
            this.app.playTone(400 + idx * 20, 0.4);
            await new Promise(r => setTimeout(r, 600));
            if (this.isDestroyed) return;
            el.style.background = 'transparent';
            el.style.boxShadow = 'none';
            await new Promise(r => setTimeout(r, 300));
        }
        if (this.isDestroyed) return;
        this.state = 'playing';
    }

    handleCellClick(idx) {
        if (this.state !== 'playing') return;
        const el = this.grid[idx];
        el.style.background = 'var(--accent-secondary)';
        setTimeout(() => {
            el.style.background = 'transparent';
        }, 300);

        if (idx === this.sequence[this.userSequence.length]) {
            this.userSequence.push(idx);
            this.app.playTone(600, 0.1);
            if (this.userSequence.length === this.sequence.length) {
                this.currentRound++;
                this.app.playVictory();
                this.nextRound();
            }
        } else {
            this.gameOver(false);
        }
    }

    gameOver(won) {
        this.running = false;
        if (won) {
            this.app.playVictory();
            this.app.updateScore(1500);
        } else {
            this.app.playFailure();
        }
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'GEOMETRY SYNCED' : 'ALIGNMENT FAILED'}</h3><p>Rounds completed: ${this.currentRound - 1}/5</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { 
        this.running = false; 
        this.isDestroyed = true;
    }
}
