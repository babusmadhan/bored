/**
 * Game 31: Word Scramble
 */
class WordScrambleGame {
    constructor(app) {
        this.app = app;
        this.title = "Core Recovery";
        this.description = "Unscramble the 10 data packets before the system times out! Type the correct characters and press ENTER.";
        this.words = ["NETWORK", "PROTOCOL", "FIREWALL", "SERVER", "DATABASE", "ROUTER", "VIRTUAL", "SECURITY", "ENCRYPT", "BINARY"];
        this.scrambled = "";
        this.secret = "";
        this.currentAttempt = 0;
        this.running = false;
        this.timeLeft = 60;
        this.timer = null;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔤</div>
            <h2 style="color: var(--accent-primary)">DATA DESCRAMBLE</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Decipher 10 corrupted data packets.</p>
            <button class="btn-primary" id="start-scramble">START RECOVERY</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-scramble').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.display = document.createElement('div');
        this.display.style.fontSize = '3rem';
        this.display.style.fontWeight = '800';
        this.display.style.letterSpacing = '10px';
        this.display.style.marginBottom = '2rem';
        this.display.style.color = 'var(--accent-secondary)';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.style.width = '250px';
        this.input.style.height = '60px';
        this.input.style.background = 'rgba(255, 255, 255, 0.05)';
        this.input.style.border = '2px solid var(--accent-primary)';
        this.input.style.color = '#fff';
        this.input.style.textAlign = 'center';
        this.input.style.fontSize = '1.8rem';
        this.input.style.outline = 'none';

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.checkAnswer(this.input.value.toUpperCase());
        });

        this.timerEl = document.createElement('div');
        this.timerEl.style.fontSize = '1.2rem';
        this.timerEl.style.color = '#ff0055';
        this.timerEl.style.marginBottom = '1rem';

        this.app.canvasArea.appendChild(this.timerEl);
        this.app.canvasArea.appendChild(this.display);
        this.app.canvasArea.appendChild(this.input);
        
        this.nextWord();
        this.running = true;
        this.input.focus();
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.running) return;
            this.timeLeft--;
            this.timerEl.textContent = `TIME: ${this.timeLeft}s | PACKETS: ${this.currentAttempt}/10`;
            if (this.timeLeft <= 0) this.gameOver(false);
        }, 1000);
    }

    nextWord() {
        const idx = Math.floor(Math.random() * this.words.length);
        this.secret = this.words[idx];
        this.scrambled = this.secret.split('').sort(() => Math.random() - 0.5).join('');
        this.display.textContent = this.scrambled;
        this.input.value = '';
        this.input.focus();
    }

    checkAnswer(ans) {
        if (ans === this.secret) {
            this.currentAttempt++;
            this.app.playTone(800, 0.1);
            if (this.currentAttempt >= 10) this.gameOver(true);
            else this.nextWord();
        } else {
            this.app.playTone(200, 0.1, 'sawtooth');
            this.input.style.border = '2px solid #ff0055';
            setTimeout(() => this.input.style.border = '2px solid var(--accent-primary)', 200);
            this.input.value = '';
        }
    }

    gameOver(won) {
        this.running = false;
        clearInterval(this.timer);
        if (won) {
            this.app.playVictory();
            this.app.updateScore(1500);
        } else {
            this.app.playFailure();
        }
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'RECOVERY COMPLETE' : 'DATA CORRUPT'}</h3><p>Packets solved: ${this.currentAttempt}/10</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { 
        this.running = false; 
        clearInterval(this.timer);
    }
}
