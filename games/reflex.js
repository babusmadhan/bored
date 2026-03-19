/**
 * Game 7: Reflex
 */
class ReflexGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Reflex";
        this.description = "Wait for the screen to turn GREEN, then click as fast as you can!";
        this.startTime = null;
        this.timerId = null;
        this.state = 'waiting'; // waiting, ready, clicked
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
            <h2 style="color: var(--accent-primary)">NEON REFLEX</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                The screen will turn <span style="color:red">RED</span>.<br>
                When it turns <span style="color:#00ff88">GREEN</span>, CLICK immediately!
            </p>
            <button class="btn-primary" id="start-reflex">START TEST</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-reflex').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.container = document.createElement('div');
        this.container.style.width = '100%';
        this.container.style.height = '300px';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.cursor = 'pointer';
        this.container.style.borderRadius = '20px';
        this.container.style.fontSize = '2rem';
        this.container.style.fontWeight = 'bold';
        this.container.style.transition = 'background 0.1s';
        
        this.app.canvasArea.appendChild(this.container);
        this.startWaiting();

        this.container.onclick = () => this.handleClick();
    }

    startWaiting() {
        this.state = 'waiting';
        this.container.style.background = '#ff3355';
        this.container.textContent = 'WAIT...';
        
        const delay = 2000 + Math.random() * 3000;
        this.timerId = setTimeout(() => {
            this.state = 'ready';
            this.container.style.background = '#00ff88';
            this.container.textContent = 'CLICK NOW!';
            this.startTime = Date.now();
        }, delay);
    }

    handleClick() {
        if (this.state === 'waiting') {
            clearTimeout(this.timerId);
            this.showResult('TOO EARLY!', true);
        } else if (this.state === 'ready') {
            const reactionTime = Date.now() - this.startTime;
            this.showResult(`${reactionTime}ms`);
            this.app.updateScore(Math.max(0, 100 - Math.floor(reactionTime / 10)));
        }
    }

    showResult(msg, fail = false) {
        this.state = 'clicked';
        if (fail) this.app.playFailure();
        else this.app.playVictory();
        
        this.container.style.background = fail ? '#555' : 'rgba(255, 255, 255, 0.1)';
        this.container.style.border = '2px solid var(--accent-primary)';
        this.container.innerHTML = `
            <div style="text-align:center">
                <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: 0.5rem">YOUR TIME</div>
                <div style="font-size: 3rem; color: var(--accent-primary)">${msg}</div>
                <div style="display: flex; gap: 10px; margin-top: 2rem; justify-content: center;">
                    <button class="btn-primary" onclick="app.reloadCurrentGame()">TRY AGAIN</button>
                    <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
                </div>
            </div>
        `;
    }

    destroy() {
        clearTimeout(this.timerId);
    }
}
