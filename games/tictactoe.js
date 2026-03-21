class TicTacToeGame {
    constructor(app) {
        this.app = app;
        this.title = "Grid Tactics";
        this.description = "Play Tic Tac Toe against the computer. Connect 3 to win!";
        this.board = Array(9).fill(null);
        this.player = 'X';
        this.ai = 'O';
        this.running = false;
        this.difficulty = 'medium'; // can be improved later
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">❌⭕</div>
            <h2 style="color: var(--accent-primary)">Grid Tactics</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Defeat the CPU in a classic battle.</p>
            <button class="btn-primary" id="start-ttt">COMMENCE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-ttt').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.app.canvasArea.style.display = 'flex';
        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.style.justifyContent = 'center';
        this.app.canvasArea.style.alignItems = 'center';

        this.grid = document.createElement('div');
        this.grid.style.display = 'grid';
        this.grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        this.grid.style.gap = '10px';
        this.grid.style.width = '300px';
        this.grid.style.height = '300px';
        this.grid.style.margin = 'auto';

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'btn-primary';
            cell.style.fontSize = '3rem';
            cell.style.width = '100%';
            cell.style.height = '100%';
            cell.style.padding = '0';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.onclick = () => this.playerMove(i);
            this.grid.appendChild(cell);
        }

        this.app.canvasArea.appendChild(this.grid);
        this.running = true;
    }

    playerMove(i) {
        if (!this.running || this.board[i] !== null) return;
        
        this.board[i] = this.player;
        this.grid.children[i].textContent = this.player;
        this.app.playTone(600, 0.1);
        
        if (this.checkWin(this.player)) {
            setTimeout(() => this.gameOver(1), 500);
            return;
        }
        if (this.board.every(c => c !== null)) {
            setTimeout(() => this.gameOver(0), 500);
            return;
        }

        this.running = false;
        setTimeout(() => this.aiMove(), 500);
    }

    aiMove() {
        // Simple random AI
        const available = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (available.length === 0) return;

        const choice = available[Math.floor(Math.random() * available.length)];
        this.board[choice] = this.ai;
        this.grid.children[choice].textContent = this.ai;
        this.grid.children[choice].style.color = '#ff0055';
        this.app.playTone(300, 0.1, 'sawtooth');

        if (this.checkWin(this.ai)) {
            setTimeout(() => this.gameOver(-1), 500);
            return;
        }
        if (this.board.every(c => c !== null)) {
            setTimeout(() => this.gameOver(0), 500);
            return;
        }

        this.running = true;
    }

    checkWin(p) {
        const wins = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // cols
            [0,4,8], [2,4,6]           // diagonals
        ];
        return wins.some(w => this.board[w[0]] === p && this.board[w[1]] === p && this.board[w[2]] === p);
    }

    gameOver(result) {
        this.running = false;
        let msgText = '';
        if (result === 1) {
            this.app.playVictory();
            this.app.updateScore(1000);
            msgText = 'YOU WON!';
        } else if (result === -1) {
            this.app.playFailure();
            msgText = 'YOU LOST!';
        } else {
            msgText = 'DRAW!';
        }

        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${msgText}</h3><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.running = false;
        this.app.canvasArea.innerHTML = '';
    }
}
