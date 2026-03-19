/**
 * Game 12: Animal Sounds (Neon Safari)
 */
class AnimalSoundsGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Safari";
        this.description = "Identfiy the 'cyber-animal' by its unique synthesized sound! Guess correctly to score.";
        
        this.animals = [
            { id: 'cat', name: 'CYBER CAT', icon: '🐱', color: '#ff00ff' },
            { id: 'dog', name: 'NEON DOG', icon: '🐶', color: '#00f2ff' },
            { id: 'bird', name: 'GLITCH BIRD', icon: '🐦', color: '#ffff00' },
            { id: 'lion', name: 'DIGITAL LION', icon: '🦁', color: '#ff8800' },
            { id: 'bee', name: 'SOURCE BEE', icon: '🐝', color: '#00ff88' },
            { id: 'elephant', name: 'SYNTH ELEPHANT', icon: '🐘', color: '#7000ff' },
            { id: 'frog', name: 'CYBER CROAK', icon: '🐸', color: '#88ff00' },
            { id: 'owl', name: 'DIGITAL HOOT', icon: '🦉', color: '#0088ff' },
            { id: 'cow', name: 'NEON MOO', icon: '🐄', color: '#ffffff' },
            { id: 'monkey', name: 'GLITCH CHATTER', icon: '🐒', color: '#ffbb00' },
            { id: 'dolphin', name: 'VECTOR CLICK', icon: '🐬', color: '#00ffff' },
            { id: 'dragon', name: 'SYNTH ROAR', icon: '🐉', color: '#ff3300' }
        ];

        this.targetAnimal = null;
        this.state = 'idle'; // idle, playing, guessed
        this.audioCtx = null;
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🦓</div>
            <h2 style="color: var(--accent-primary)">NEON SAFARI</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Listen to the synthesized animal call.<br>
                Identify the correct cyber-animal!
            </p>
            <button class="btn-primary" id="start-safari">ENTER SAFARI</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-safari').onclick = () => {
            overlay.remove();
            this.app.initAudio();
            this.audioCtx = this.app.audioCtx;
            this.render();
            this.nextRound();
        };
    }

    render() {
        this.app.canvasArea.style.flexDirection = 'column';
        
        const monitor = document.createElement('div');
        monitor.id = 'safari-monitor';
        monitor.innerHTML = `
            <div id="sound-wave" style="height: 60px; display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 1rem;">
                ${Array(20).fill('<div class="wave-bar"></div>').join('')}
            </div>
            <button class="btn-primary" id="replay-btn" style="padding: 10px 20px; font-size: 0.9rem;">REPLAY SOUND</button>
        `;
        
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(130px, 1fr))';
        grid.style.gap = '15px';
        grid.style.width = '100%';
        grid.style.padding = '20px';

        this.animals.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'animal-btn';
            btn.innerHTML = `
                <div style="font-size: 2.2rem">${a.icon}</div>
                <div style="font-size: 0.75rem; margin-top: 5px; font-weight:800">${a.name}</div>
            `;
            this.applyStyles(btn, a);
            btn.onclick = () => this.handleGuess(a);
            grid.appendChild(btn);
        });

        this.app.canvasArea.appendChild(monitor);
        this.app.canvasArea.appendChild(grid);
        
        document.getElementById('replay-btn').onclick = () => this.playAnimalSound(this.targetAnimal.id);

        this.addWaveAnimation();
    }

    applyStyles(btn, a) {
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.border = `2px solid ${a.color}`;
        btn.style.borderRadius = '15px';
        btn.style.padding = '15px 5px';
        btn.style.cursor = 'pointer';
        btn.style.color = '#fff';
        btn.style.transition = 'all 0.2s';
        btn.style.boxShadow = `0 0 10px ${a.color}33`;
    }

    addWaveAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            .wave-bar { width: 4px; height: 10px; background: var(--accent-primary); border-radius: 2px; }
            .wave-active .wave-bar { animation: wave-pulse 0.5s infinite alternate; }
            @keyframes wave-pulse { from { height: 5px; } to { height: 40px; } }
            .wave-bar:nth-child(2n) { animation-delay: 0.1s; }
            .wave-bar:nth-child(3n) { animation-delay: 0.2s; }
        `;
        document.head.appendChild(style);
    }

    nextRound() {
        this.state = 'playing';
        this.targetAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];
        setTimeout(() => this.playAnimalSound(this.targetAnimal.id), 800);
    }

    playAnimalSound(id) {
        if (this.app.isMuted) return;
        const now = this.audioCtx.currentTime;
        const wave = document.getElementById('sound-wave');
        wave.classList.add('wave-active');

        switch(id) {
            case 'cat': this.synthMeow(now); break;
            case 'dog': this.synthBark(now); break;
            case 'bird': this.synthChirp(now); break;
            case 'lion': this.synthRoar(now); break;
            case 'bee': this.synthBuzz(now); break;
            case 'elephant': this.synthTrumpet(now); break;
            case 'frog': this.synthCroak(now); break;
            case 'owl': this.synthHoot(now); break;
            case 'cow': this.synthMoo(now); break;
            case 'monkey': this.synthChatter(now); break;
            case 'dolphin': this.synthClick(now); break;
            case 'dragon': this.synthDragon(now); break;
        }

        setTimeout(() => wave.classList.remove('wave-active'), 1000);
    }

    // --- Synthesizers ---
    synthMeow(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(400, t);
        o.frequency.exponentialRampToValueAtTime(600, t + 0.2);
        o.frequency.exponentialRampToValueAtTime(300, t + 0.5);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.2, t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 0.5);
    }

    synthBark(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(100, t + 0.15);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 0.15);
    }

    synthChirp(t) {
        for(let i=0; i<3; i++){
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            const start = t + (i * 0.15);
            o.type = 'sine';
            o.frequency.setValueAtTime(1000 + (i*200), start);
            o.frequency.exponentialRampToValueAtTime(1500, start + 0.1);
            g.gain.setValueAtTime(0.1, start);
            g.gain.exponentialRampToValueAtTime(0.01, start + 0.1);
            o.connect(g); g.connect(this.audioCtx.destination);
            o.start(start); o.stop(start + 0.1);
        }
    }

    synthRoar(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(120, t);
        o.frequency.linearRampToValueAtTime(60, t + 0.8);
        g.gain.setValueAtTime(0.3, t);
        g.gain.linearRampToValueAtTime(0.1, t + 0.4);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 0.8);
    }

    synthBuzz(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(200, t);
        for(let i=0; i<10; i++) {
            o.frequency.linearRampToValueAtTime(200 + (i%2 ? 10 : -10), t + (i*0.05));
        }
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 0.5);
    }

    synthTrumpet(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(440, t);
        o.frequency.exponentialRampToValueAtTime(550, t + 0.1);
        o.frequency.exponentialRampToValueAtTime(440, t + 0.6);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.2, t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 0.7);
    }

    synthCroak(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(80, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 0.3);
    }

    synthHoot(t) {
        [0, 0.4].forEach(delay => {
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(220, t + delay);
            o.frequency.exponentialRampToValueAtTime(200, t + delay + 0.2);
            g.gain.setValueAtTime(0, t + delay);
            g.gain.linearRampToValueAtTime(0.1, t + delay + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.2);
            o.connect(g); g.connect(this.audioCtx.destination);
            o.start(t + delay); o.stop(t + delay + 0.2);
        });
    }

    synthMoo(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, t);
        o.frequency.linearRampToValueAtTime(100, t + 1.0);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.2);
        g.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 1.2);
    }

    synthChatter(t) {
        for(let i=0; i<5; i++){
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            const start = t + (i * 0.1);
            o.type = 'square';
            o.frequency.setValueAtTime(600 + Math.random()*200, start);
            g.gain.setValueAtTime(0.05, start);
            g.gain.exponentialRampToValueAtTime(0.01, start + 0.08);
            o.connect(g); g.connect(this.audioCtx.destination);
            o.start(start); o.stop(start + 0.08);
        }
    }

    synthClick(t) {
        for(let i=0; i<10; i++){
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            const start = t + (i * 0.05);
            o.type = 'sine';
            o.frequency.setValueAtTime(4000, start);
            g.gain.setValueAtTime(0.08, start);
            g.gain.exponentialRampToValueAtTime(0.01, start + 0.02);
            o.connect(g); g.connect(this.audioCtx.destination);
            o.start(start); o.stop(start + 0.02);
        }
    }

    synthDragon(t) {
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        const n = this.audioCtx.createOscillator(); // Noise-like modulation
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(50, t);
        o.frequency.exponentialRampToValueAtTime(150, t + 0.5);
        o.frequency.linearRampToValueAtTime(40, t + 1.2);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.2);
        g.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(t); o.stop(t + 1.5);
    }

    handleGuess(animal) {
        if (this.state !== 'playing') return;

        if (animal.id === this.targetAnimal.id) {
            this.state = 'guessed';
            this.app.updateScore(30);
            this.app.playVictory();
            this.showFeedback(true);
        } else {
            this.state = 'guessed';
            this.app.playFailure();
            this.showFeedback(false);
        }
    }

    showFeedback(correct) {
        const feedback = document.createElement('div');
        feedback.className = 'game-over-msg';
        feedback.style.background = 'rgba(0,0,0,0.9)';
        feedback.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">${correct ? '✅' : '❌'}</div>
            <h2>${correct ? 'CORRECT CALL!' : 'WRONG SPECIE'}</h2>
            <p style="margin: 1rem 0; color: var(--text-muted)">
                It was the <strong>${this.targetAnimal.name}</strong>.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 1rem;">
                <button class="btn-primary" id="retry-safari">NEXT ROUND</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">EXIT SAFARI</button>
            </div>
        `;
        this.app.canvasArea.appendChild(feedback);
        document.getElementById('retry-safari').onclick = () => {
            feedback.remove();
            this.nextRound();
        };
    }

    destroy() {
        this.state = 'idle';
    }
}
