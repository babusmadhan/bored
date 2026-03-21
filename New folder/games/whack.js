class WhackGame {
    constructor(app) {
        this.app = app;
        this.title = "Bug Squasher";
        this.description = "Squash the bugs before they consume your memory. 30 seconds.";
        this.score = 0;
        this.timeLeft = 30;
        this.activeBug = null;
        this.timer = null;
        this.moveTimer = null;
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">👾</div>
            <h2 style="color: var(--accent-primary)">Bug Squasher</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Squash as many as you can!</p>
            <button class="btn-primary" id="start-whack">DEPLOY PATCH</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-whack').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.app.canvasArea.style.display = 'flex';
        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.style.justifyContent = 'center';
        this.app.canvasArea.style.alignItems = 'center';

        this.infoEl = document.createElement('div');
        this.infoEl.style.fontSize = '1.2rem';
        this.infoEl.style.marginBottom = '1rem';
        this.infoEl.style.display = 'flex';
        this.infoEl.style.justifyContent = 'space-between';
        this.infoEl.style.width = '300px';
        this.infoEl.innerHTML = `<span>TIME: <span id="whack-time">30</span>s</span><span>BUGS: <span id="whack-score">0</span></span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.grid = document.createElement('div');
        this.grid.style.display = 'grid';
        this.grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        this.grid.style.gap = '10px';
        this.grid.style.width = '300px';
        this.grid.style.height = '300px';

        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.className = 'whack-hole';
            hole.style.background = 'rgba(255,255,255,0.05)';
            hole.style.borderRadius = '50%';
            hole.style.position = 'relative';
            hole.style.overflow = 'hidden';
            hole.style.cursor = 'pointer';
            hole.onclick = () => this.hit(i);
            
            const bug = document.createElement('div');
            bug.style.position = 'absolute';
            bug.style.bottom = '-100%';
            bug.style.left = '50%';
            bug.style.transform = 'translateX(-50%)';
            bug.style.fontSize = '3rem';
            bug.style.transition = 'bottom 0.1s';
            bug.textContent = '👾';
            bug.id = `bug-${i}`;
            
            hole.appendChild(bug);
            this.grid.appendChild(hole);
        }

        this.app.canvasArea.appendChild(this.grid);

        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('whack-time').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);

        this.spawnBug();
    }

    spawnBug() {
        if (this.timeLeft <= 0) return;
        
        if (this.activeBug !== null) {
            document.getElementById(`bug-${this.activeBug}`).style.bottom = '-100%';
        }

        let next;
        do {
            next = Math.floor(Math.random() * 9);
        } while (next === this.activeBug);

        this.activeBug = next;
        document.getElementById(`bug-${this.activeBug}`).style.bottom = '10px';

        const delay = Math.max(400, 1000 - (this.score * 20));
        this.moveTimer = setTimeout(() => this.spawnBug(), delay);
    }

    hit(i) {
        if (i === this.activeBug) {
            this.score++;
            document.getElementById('whack-score').textContent = this.score;
            document.getElementById(`bug-${this.activeBug}`).style.bottom = '-100%';
            this.app.playTone(800, 0.1, 'square');
            this.activeBug = null;
            clearTimeout(this.moveTimer);
            setTimeout(() => this.spawnBug(), 200);
        } else {
            this.app.playTone(200, 0.1, 'sawtooth');
            this.timeLeft = Math.max(0, this.timeLeft - 1); // penalty
        }
    }

    gameOver() {
        clearInterval(this.timer);
        clearTimeout(this.moveTimer);
        this.app.playVictory();
        this.app.updateScore(this.score * 50);
        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>SYSTEM CLEANED</h3><p>Bugs squashed: ${this.score}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        clearInterval(this.timer);
        clearTimeout(this.moveTimer);
        this.app.canvasArea.innerHTML = '';
    }
}
