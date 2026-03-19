/**
 * Game 8: Memory
 */
class MemoryGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Memory";
        this.description = "Watch the sequence of flashes and repeat them in the same order!";
        this.sequence = [];
        this.userSequence = [];
        this.audioCtx = null;
        this.frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Major triad + octave)
        this.isDestroyed = false;
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
            <h2 style="color: var(--accent-primary)">NEON MEMORY</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                The buttons will flash in a sequence.<br>
                Repeat the sequence to proceed.
            </p>
            <button class="btn-primary" id="start-memory">START RECALL</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-memory').onclick = () => {
            overlay.remove();
            this.initAudio();
            this.initGame();
        };
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    initGame() {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '15px';
        grid.style.width = '300px';
        grid.style.margin = '2rem auto';
        
        const colors = ['#00f2ff', '#ff0055', '#00ff88', '#ffff00'];
        for (let i = 0; i < 4; i++) {
            const btn = document.createElement('div');
            btn.className = 'memory-btn';
            btn.style.width = '120px';
            btn.style.height = '120px';
            btn.style.background = 'rgba(255, 255, 255, 0.05)';
            btn.style.border = `3px solid ${colors[i]}`;
            btn.style.borderRadius = '20px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.1s';
            btn.onclick = () => this.handleUserClick(i);
            grid.appendChild(btn);
            this.buttons.push({ el: btn, color: colors[i] });
        }

        this.app.canvasArea.appendChild(grid);
        this.addNextToSequence();
        this.playSequence();
    }

    addNextToSequence() {
        this.sequence.push(Math.floor(Math.random() * 4));
        this.userSequence = [];
    }

    playTone(idx, duration = 0.5) {
        if (!this.audioCtx || this.app.isMuted) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.frequencies[idx], this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    // Play a subtle background "BGM" drone during flashing
    playAmbientBGM(duration) {
        if (!this.audioCtx || this.app.isMuted) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, this.audioCtx.currentTime); // Low A
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    async playSequence() {
        this.state = 'watching';
        await new Promise(r => setTimeout(r, 600));
        
        const totalDuration = (this.sequence.length * 0.9);
        this.playAmbientBGM(totalDuration);

        for (const idx of this.sequence) {
            if (this.isDestroyed) return;
            const btn = this.buttons[idx];
            
            this.playTone(idx, 0.6);
            btn.el.style.background = btn.color;
            btn.el.style.boxShadow = `0 0 30px ${btn.color}`;
            btn.el.style.transform = 'scale(1.05)';
            
            await new Promise(r => setTimeout(r, 600));
            if (this.isDestroyed) return;
            
            btn.el.style.background = 'rgba(255, 255, 255, 0.05)';
            btn.el.style.boxShadow = 'none';
            btn.el.style.transform = 'scale(1)';
            
            await new Promise(r => setTimeout(r, 300));
        }
        if (this.isDestroyed) return;
        this.state = 'playing';
    }

    handleUserClick(idx) {
        if (this.state !== 'playing') return;

        const btn = this.buttons[idx];
        this.playTone(idx, 0.3);
        
        btn.el.style.background = btn.color;
        btn.el.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.el.style.background = 'rgba(255, 255, 255, 0.05)';
            btn.el.style.transform = 'scale(1)';
        }, 150);

        if (idx === this.sequence[this.userSequence.length]) {
            this.userSequence.push(idx);
            if (this.userSequence.length === this.sequence.length) {
                this.app.updateScore(20 * this.sequence.length);
                if (this.sequence.length >= 8) { // Increased win limit
                    this.showWin();
                } else {
                    this.addNextToSequence();
                    setTimeout(() => this.playSequence(), 800);
                }
            }
        } else {
            this.showWin(true);
        }
    }

    showWin(fail = false) {
        this.state = 'done';
        if (fail) this.app.playFailure();
        else this.app.playVictory();

        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">${fail ? '❌' : '🏆'}</div>
            <h3>${fail ? 'MEMORY FAILED' : 'MEMORY CHAMP!'}</h3>
            <p>Successful sequence: ${this.sequence.length - 1}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">TRY AGAIN</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT GAME</button>
            </div>
        `;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() {
        this.isDestroyed = true;
        this.state = 'done';
    }
}
