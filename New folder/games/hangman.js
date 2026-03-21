class HangmanGame {
    constructor(app) {
        this.app = app;
        this.title = "Cryptic Hangman";
        this.description = "Decode the secret word before you run out of attempts.";
        this.words = ['HACKER', 'SYSTEM', 'MATRIX', 'CYBER', 'ROUTER', 'SERVER', 'CODE', 'GLITCH'];
        this.word = '';
        this.guesses = [];
        this.attempts = 6;
    }

    start() {
        this.app.canvasArea.innerHTML = '';
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.initGame();
    }

    initGame() {
        this.app.canvasArea.style.display = 'flex';
        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.style.justifyContent = 'center';
        this.app.canvasArea.style.alignItems = 'center';

        this.infoEl = document.createElement('div');
        this.infoEl.style.fontSize = '1.5rem';
        this.infoEl.style.marginBottom = '2rem';
        this.infoEl.innerHTML = `ATTEMPTS LEFT: <span id="attempts" style="color: #ff0055">${this.attempts}</span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.wordDisplay = document.createElement('div');
        this.wordDisplay.style.fontSize = '3rem';
        this.wordDisplay.style.letterSpacing = '1rem';
        this.wordDisplay.style.marginBottom = '2rem';
        this.wordDisplay.style.fontWeight = 'bold';
        this.app.canvasArea.appendChild(this.wordDisplay);

        this.keyboard = document.createElement('div');
        this.keyboard.style.display = 'flex';
        this.keyboard.style.flexWrap = 'wrap';
        this.keyboard.style.gap = '5px';
        this.keyboard.style.justifyContent = 'center';
        this.keyboard.style.maxWidth = '400px';

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        letters.forEach(letter => {
            const btn = document.createElement('button');
            btn.textContent = letter;
            btn.className = 'btn-primary';
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.padding = '0';
            btn.style.fontSize = '1.2rem';
            btn.onclick = () => this.guess(letter, btn);
            this.keyboard.appendChild(btn);
        });

        this.app.canvasArea.appendChild(this.keyboard);
        this.updateWordDisplay();
    }

    updateWordDisplay() {
        this.wordDisplay.textContent = this.word.split('').map(l => this.guesses.includes(l) ? l : '_').join('');
        if (!this.wordDisplay.textContent.includes('_')) {
            setTimeout(() => this.gameOver(true), 500);
        }
    }

    guess(letter, btn) {
        if (this.attempts <= 0 || btn.disabled) return;

        btn.disabled = true;
        btn.style.opacity = '0.5';

        if (this.word.includes(letter)) {
            this.guesses.push(letter);
            this.app.playTone(600, 0.1);
            btn.style.borderColor = 'var(--accent-primary)';
            this.updateWordDisplay();
        } else {
            this.attempts--;
            this.app.playTone(300, 0.1, 'sawtooth');
            btn.style.borderColor = '#ff0055';
            document.getElementById('attempts').textContent = this.attempts;
            if (this.attempts <= 0) {
                setTimeout(() => this.gameOver(false), 500);
            }
        }
    }

    gameOver(won) {
        if (won) {
            this.app.playVictory();
            this.app.updateScore(1500);
        } else {
            this.app.playFailure();
        }
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h3><p>The word was ${this.word}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.app.canvasArea.innerHTML = '';
    }
}
