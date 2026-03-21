class RPSGame {
    constructor(app) {
        this.app = app;
        this.title = "Rock Paper Scissors";
        this.description = "Play RPS against the CPU. First to 3 wins!";
        this.playerScore = 0;
        this.cpuScore = 0;
        this.choices = ['rock', 'paper', 'scissors'];
        this.emojis = { 'rock': '🪨', 'paper': '📄', 'scissors': '✂️' };
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">✂️</div>
            <h2 style="color: var(--accent-primary)">Rock Paper Scissors</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Beat the CPU!</p>
            <button class="btn-primary" id="start-rps">PLAY</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-rps').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.app.canvasArea.style.display = 'flex';
        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.style.justifyContent = 'center';
        this.app.canvasArea.style.alignItems = 'center';
        this.app.canvasArea.style.width = '100%';
        this.app.canvasArea.style.height = '100%';

        this.scoreBoard = document.createElement('div');
        this.scoreBoard.style.fontSize = '1.5rem';
        this.scoreBoard.style.marginBottom = '2rem';
        this.scoreBoard.style.display = 'flex';
        this.scoreBoard.style.justifyContent = 'space-between';
        this.scoreBoard.style.width = '250px';
        this.scoreBoard.innerHTML = `<span>YOU: <span id="player-score">0</span></span><span>CPU: <span id="cpu-score">0</span></span>`;
        
        this.resultText = document.createElement('div');
        this.resultText.style.fontSize = '2rem';
        this.resultText.style.marginBottom = '2rem';
        this.resultText.style.height = '3rem';
        this.resultText.style.textAlign = 'center';
        this.resultText.textContent = 'CHOOSE YOUR WEAPON';

        this.choicesContainer = document.createElement('div');
        this.choicesContainer.style.display = 'flex';
        this.choicesContainer.style.gap = '1rem';
        this.choicesContainer.style.flexWrap = 'wrap';
        this.choicesContainer.style.justifyContent = 'center';

        this.choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.style.fontSize = '2rem';
            btn.style.width = '80px';
            btn.style.height = '80px';
            btn.style.padding = '0';
            btn.innerHTML = this.emojis[c];
            btn.onclick = () => this.playRound(c);
            this.choicesContainer.appendChild(btn);
        });

        this.app.canvasArea.appendChild(this.scoreBoard);
        this.app.canvasArea.appendChild(this.resultText);
        this.app.canvasArea.appendChild(this.choicesContainer);
    }

    playRound(playerChoice) {
        const cpuChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        let result = '';

        if (playerChoice === cpuChoice) {
            result = 'DRAW!';
        } else if (
            (playerChoice === 'rock' && cpuChoice === 'scissors') ||
            (playerChoice === 'paper' && cpuChoice === 'rock') ||
            (playerChoice === 'scissors' && cpuChoice === 'paper')
        ) {
            result = 'YOU WIN!';
            this.playerScore++;
            this.app.playTone(600, 0.1, 'sine');
        } else {
            result = 'CPU WINS!';
            this.cpuScore++;
            this.app.playTone(300, 0.1, 'sawtooth');
        }

        this.resultText.innerHTML = `${this.emojis[playerChoice]} vs ${this.emojis[cpuChoice]}<br><span style="font-size:1.5rem">${result}</span>`;
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('cpu-score').textContent = this.cpuScore;

        if (this.playerScore >= 3 || this.cpuScore >= 3) {
            setTimeout(() => this.gameOver(this.playerScore > this.cpuScore), 1000);
        }
    }

    gameOver(won) {
        if (won) {
            this.app.playVictory();
            this.app.updateScore(500);
        } else {
            this.app.playFailure();
        }
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'YOU WON THE MATCH!' : 'GAME OVER'}</h3><p>Score: ${this.playerScore} - ${this.cpuScore}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.app.canvasArea.innerHTML = '';
    }
}
