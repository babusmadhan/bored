/**
 * Game 1: Sudoku (4x4)
 */

class SudokuGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Sudoku";
        this.description = "Fill the 4x4 grid. Each row, column, and 2x2 box must contain numbers 1-4.";
        this.grid = [];
        this.solution = [];
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🧩</div>
            <h2 style="color: var(--accent-primary)">NEON SUDOKU</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Fill the 4x4 grid.<br>
                Numbers 1-4 must appear exactly once in each row, column, and 2x2 box.
            </p>
            <button class="btn-primary" id="start-sudoku">START PUZZLE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-sudoku').onclick = () => {
            overlay.remove();
            this.generatePuzzle();
            this.render();
        };
    }

    generatePuzzle() {
        // Simple 4x4 Sudoku logic
        // Solution placeholder
        this.solution = [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 3, 4, 1],
            [4, 1, 2, 3]
        ];
        
        // Shuffle rows/cols slightly for variety
        // For simplicity in this demo, we'll use a fixed set with some holes
        this.grid = [
            [1, 0, 3, 0],
            [0, 4, 0, 2],
            [2, 0, 4, 0],
            [0, 1, 0, 3]
        ];
    }

    render() {
        const container = document.createElement('div');
        container.className = 'sudoku-grid';
        
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (this.grid[r][c] !== 0) {
                    cell.textContent = this.grid[r][c];
                    cell.classList.add('fixed');
                } else {
                    cell.contentEditable = "true";
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.addEventListener('input', (e) => this.handleInput(e, r, c));
                    cell.addEventListener('focus', () => cell.classList.add('focused'));
                    cell.addEventListener('blur', () => cell.classList.remove('focused'));
                }
                container.appendChild(cell);
            }
        }
        
        this.app.canvasArea.appendChild(container);
    }

    handleInput(e, r, c) {
        const val = parseInt(e.target.textContent);
        if (isNaN(val) || val < 1 || val > 4) {
            e.target.textContent = "";
            this.grid[r][c] = 0;
            return;
        }
        
        // Only allow one digit
        e.target.textContent = val.toString().charAt(0);
        this.grid[r][c] = parseInt(e.target.textContent);
        
        this.checkWin();
    }

    checkWin() {
        let win = true;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.grid[r][c] !== this.solution[r][c]) {
                    win = false;
                    break;
                }
            }
        }

        if (win) {
            this.app.updateScore(50);
            this.app.playVictory();
            this.showWin();
        }
    }

    showWin() {
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <h3>PUZZLE SOLVED!</h3>
            <p>+50 Score</p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">TRY AGAIN</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        // Cleanup if needed
    }
}
