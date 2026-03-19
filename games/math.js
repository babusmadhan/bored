/**
 * Game 30: Math Sprint
 */
class MathSprintGame {
    constructor(app) {
        this.app = app;
        this.title = "Core Calculation";
        this.description = "Solve 10 quick arithmetic problems before time runs out! Accuracy and speed are essential.";
        this.problems = 10;
        this.current = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.running = false;
        this.ans = 0;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">➕</div>
            <h2 style="color: var(--accent-primary)">CORE CALC</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Process 10 math data packets.</p>
            <button class="btn-primary" id="start-math">INITIALIZE CPU</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-math').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.display = document.createElement('div');
        this.display.style.fontSize = '3rem';
        this.display.style.fontWeight = '800';
        this.display.style.marginBottom = '2rem';
        this.display.style.color = '#fff';

        this.input = document.createElement('input');
        this.input.type = 'number';
        this.input.style.width = '150px';
        this.input.style.height = '60px';
        this.input.style.background = 'rgba(255, 255, 255, 0.05)';
        this.input.style.border = '2px solid var(--accent-primary)';
        this.input.style.color = '#fff';
        this.input.style.textAlign = 'center';
        this.input.style.fontSize = '2rem';
        this.input.style.outline = 'none';

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.checkAnswer(parseInt(this.input.value));
        });

        this.timerEl = document.createElement('div');
        this.timerEl.style.fontSize = '1.2rem';
        this.timerEl.style.color = '#ff0055';
        this.timerEl.style.marginBottom = '1rem';

        this.app.canvasArea.appendChild(this.timerEl);
        this.app.canvasArea.appendChild(this.display);
        this.app.canvasArea.appendChild(this.input);
        
        this.nextProblem();
        this.running = true;
        this.input.focus();
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (!this.running) return;
            this.timeLeft--;
            this.timerEl.textContent = `TIME: ${this.timeLeft}s | PACKETS: ${this.current}/10`;
            if (this.timeLeft <= 0) this.gameOver(false);
        }, 1000);
    }

    nextProblem() {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        
        switch(op) {
            case '+': this.ans = a + b; break;
            case '-': this.ans = a - b; break;
            case '*': this.ans = a * b; break;
        }

        this.display.textContent = `${a} ${op} ${b} = ?`;
        this.input.value = '';
        this.input.focus();
    }

    checkAnswer(userAns) {
        if (userAns === this.ans) {
            this.current++;
            this.app.playTone(800, 0.1);
            if (this.current >= 10) this.gameOver(true);
            else this.nextProblem();
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
        msg.innerHTML = `<h3>${won ? 'CPU STABILIZED' : 'CPU OVERHEAT'}</h3><p>Packets solved: ${this.current}/10</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { 
        this.running = false; 
        clearInterval(this.timer);
    }
}
