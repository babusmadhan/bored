/**
 * Game 33: Bit Match
 */
class BitMatchGame {
    constructor(app) {
        this.app = app;
        this.title = "Core Memory";
        this.description = "Find the matching pairs of 0s and 1s hidden behind the nodes! Match all 8 pairs to win.";
        this.size = 4;
        this.cards = [];
        this.flipped = [];
        this.running = false;
        this.matches = 0;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">💾</div>
            <h2 style="color: var(--accent-primary)">CORE MEMORY</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Sync the memory bit pairs.</p>
            <button class="btn-primary" id="start-bitmatch">START SCAN</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-bitmatch').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        const numbers = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1].sort(() => Math.random() - 0.5);
        const container = document.createElement('div');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.style.gap = '10px';
        container.style.width = '300px';
        container.style.margin = '1rem auto';

        numbers.forEach((val, i) => {
            const card = document.createElement('div');
            card.style.width = '65px';
            card.style.height = '65px';
            card.style.border = '1px solid var(--glass-border)';
            card.style.background = 'rgba(255, 255, 255, 0.05)';
            card.style.display = 'flex';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.fontSize = '2rem';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.3s';
            card.onclick = () => this.flip(i);
            this.cards.push({ val, el: card, matched: false });
            container.appendChild(card);
        });

        this.app.canvasArea.appendChild(container);
        this.running = true;
    }

    flip(idx) {
        if (!this.running || this.flipped.length >= 2 || this.cards[idx].matched || this.flipped.includes(idx)) return;
        
        const card = this.cards[idx];
        card.el.textContent = card.val;
        card.el.style.background = card.val === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)';
        card.el.style.color = '#fff';
        this.flipped.push(idx);
        this.app.playTone(400 + idx * 20, 0.1);

        if (this.flipped.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const [a, b] = this.flipped;
        if (this.cards[a].val === this.cards[b].val) {
            this.cards[a].matched = this.cards[b].matched = true;
            this.matches++;
            this.app.playTone(800, 0.1);
            this.flipped = [];
            if (this.matches === 8) this.gameOver();
        } else {
            setTimeout(() => {
                this.cards[a].el.textContent = '';
                this.cards[b].el.textContent = '';
                this.cards[a].el.style.background = 'rgba(255, 255, 255, 0.05)';
                this.cards[b].el.style.background = 'rgba(255, 255, 255, 0.05)';
                this.flipped = [];
            }, 800);
        }
    }

    gameOver() {
        this.running = false;
        this.app.playVictory();
        this.app.updateScore(1500);
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>MEMORY SYNCED</h3><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
