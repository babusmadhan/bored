class AimTrainerGame {
    constructor(app) {
        this.app = app;
        this.title = "Target Protocol";
        this.description = "Neutralize 20 targets as fast as possible. Accuracy is key.";
        this.targetsLeft = 20;
        this.startTime = 0;
        this.playing = false;
        this.targetSize = 40;
    }

    start() {
        this.renderMenu();
    }

    renderMenu() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
            <h2 style="color: var(--accent-primary)">Precision Module</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Eliminate 20 targets quickly.</p>
            <button class="btn-primary" id="start-aim">CALIBRATE</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-aim').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.app.canvasArea.style.position = 'relative';
        this.app.canvasArea.style.overflow = 'hidden';
        
        this.infoEl = document.createElement('div');
        this.infoEl.style.position = 'absolute';
        this.infoEl.style.top = '10px';
        this.infoEl.style.left = '10px';
        this.infoEl.style.fontSize = '1.2rem';
        this.infoEl.style.zIndex = '10';
        this.infoEl.innerHTML = `Targets: <span id="aim-left">${this.targetsLeft}</span>`;
        this.app.canvasArea.appendChild(this.infoEl);

        this.playing = true;
        this.startTime = Date.now();
        this.spawnTarget();
    }

    spawnTarget() {
        if (!this.playing) return;

        const containerW = this.app.canvasArea.clientWidth;
        const containerH = this.app.canvasArea.clientHeight;

        const maxW = containerW - this.targetSize;
        const maxH = containerH - this.targetSize;

        const x = Math.max(0, Math.min(Math.random() * maxW, maxW));
        const y = Math.max(40, Math.min(Math.random() * maxH, maxH)); // leave top space for text

        this.currentTarget = document.createElement('div');
        this.currentTarget.style.position = 'absolute';
        this.currentTarget.style.width = `${this.targetSize}px`;
        this.currentTarget.style.height = `${this.targetSize}px`;
        this.currentTarget.style.borderRadius = '50%';
        this.currentTarget.style.background = 'radial-gradient(circle, #ff0055 20%, transparent 25%, transparent 40%, #ff0055 45%, transparent 50%)';
        this.currentTarget.style.backgroundColor = 'var(--accent-primary)';
        this.currentTarget.style.left = `${x}px`;
        this.currentTarget.style.top = `${y}px`;
        this.currentTarget.style.cursor = 'crosshair';
        this.currentTarget.style.boxShadow = '0 0 10px var(--accent-primary)';
        this.currentTarget.style.transition = 'transform 0.1s';
        
        this.currentTarget.onmousedown = (e) => {
            e.preventDefault();
            this.hitTarget();
        };
        this.currentTarget.ontouchstart = (e) => {
            e.preventDefault();
            this.hitTarget();
        };

        this.app.canvasArea.appendChild(this.currentTarget);
    }

    hitTarget() {
        if (!this.playing) return;
        this.app.playTone(800, 0.05, 'square');
        this.currentTarget.remove();
        this.targetsLeft--;
        document.getElementById('aim-left').textContent = this.targetsLeft;

        if (this.targetsLeft <= 0) {
            this.gameOver();
        } else {
            this.spawnTarget();
        }
    }

    gameOver() {
        this.playing = false;
        const elapsed = (Date.now() - this.startTime) / 1000;
        this.app.playVictory();
        
        // Calculate score based on time. 20 targets in 10s is ok.
        let timeScore = Math.max(0, 1500 - (elapsed * 50));
        this.app.updateScore(Math.floor(timeScore) + 500);

        this.app.canvasArea.innerHTML = '';
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>MODULE COMPLETE</h3><p>Time: ${elapsed.toFixed(2)}s</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.playing = false;
        this.app.canvasArea.innerHTML = '';
    }
}
