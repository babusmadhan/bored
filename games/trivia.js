class TriviaGame {
    constructor(app) {
        this.app = app;
        this.title = "Data Interrogation";
        this.description = "Answer 3 trivia questions correctly to bypass the firewall.";
        this.questions = [
            { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Machine Logic", "Hyper Tabular Menu List", "Home Tool Markup Language"], a: 0 },
            { q: "What year was JavaScript created?", options: ["1990", "1995", "2000", "2005"], a: 1 },
            { q: "Which of these is NOT a programming language?", options: ["Python", "Java", "HTML", "C++"], a: 2 },
            { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Color Syntax System"], a: 1 },
            { q: "Who is known as the father of computer logic?", options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"], a: 0 }
        ];
        this.score = 0;
        this.current = 0;
        this.selectedQuestions = [];
    }

    start() {
        // shuffle and pick 3
        this.selectedQuestions = this.app.shuffleArray([...this.questions]).slice(0, 3);
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
            <h2 style="color: var(--accent-primary)">Data Interrogation</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Answer 3 questions to authenticate.</p>
            <button class="btn-primary" id="start-trivia">BEGIN TEST</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-trivia').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.app.canvasArea.style.display = 'flex';
        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.style.justifyContent = 'center';
        this.app.canvasArea.style.alignItems = 'center';

        this.qText = document.createElement('div');
        this.qText.style.fontSize = '1.5rem';
        this.qText.style.marginBottom = '2rem';
        this.qText.style.textAlign = 'center';
        this.qText.style.maxWidth = '80%';
        this.app.canvasArea.appendChild(this.qText);

        this.btnContainer = document.createElement('div');
        this.btnContainer.style.display = 'flex';
        this.btnContainer.style.flexDirection = 'column';
        this.btnContainer.style.gap = '10px';
        this.btnContainer.style.width = '80%';
        this.btnContainer.style.maxWidth = '400px';
        this.app.canvasArea.appendChild(this.btnContainer);

        this.showQuestion();
    }

    showQuestion() {
        if (this.current >= this.selectedQuestions.length) {
            this.gameOver(true);
            return;
        }

        const q = this.selectedQuestions[this.current];
        this.qText.textContent = `Q${this.current+1}: ${q.q}`;
        this.btnContainer.innerHTML = '';

        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.style.whiteSpace = 'normal';
            btn.textContent = opt;
            btn.onclick = () => this.checkAnswer(index, btn);
            this.btnContainer.appendChild(btn);
        });
    }

    checkAnswer(ansIndex, btn) {
        const q = this.selectedQuestions[this.current];
        const buttons = Array.from(this.btnContainer.children);
        buttons.forEach(b => b.disabled = true);

        if (ansIndex === q.a) {
            btn.style.borderColor = 'var(--accent-primary)';
            btn.style.background = 'rgba(0, 255, 136, 0.2)';
            this.app.playTone(800, 0.1);
            this.score++;
        } else {
            btn.style.borderColor = '#ff0055';
            btn.style.background = 'rgba(255, 0, 85, 0.2)';
            buttons[q.a].style.borderColor = 'var(--accent-primary)';
            this.app.playTone(300, 0.1, 'sawtooth');
            this.gameOver(false);
            return;
        }

        this.current++;
        setTimeout(() => this.showQuestion(), 1000);
    }

    gameOver(won) {
        if (won) {
            this.app.playVictory();
            this.app.updateScore(1000);
        } else {
            this.app.playFailure();
        }
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>${won ? 'AUTHENTICATED' : 'ACCESS DENIED'}</h3><p>Questions answered: ${this.score}/3</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.app.canvasArea.innerHTML = '';
    }
}
