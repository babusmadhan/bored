class MusicGame {
    constructor(app) {
        this.app = app;
        this.title = "Neon Orchestra";
        this.description = "TAP for a single note. HOLD for a unique BGM loop!";
        
        this.audioCtx = null;
        this.activeNodes = new Map(); // Track active oscillators for long press
        this.longPressThreshold = 400; // ms
        
        this.instruments = [
            { id: 'drums', name: 'DRUMS', color: '#ff0055', icon: '🥁', freq: 100, type: 'percussion' },
            { id: 'guitar', name: 'GUITAR', color: '#00f2ff', icon: '🎸', freq: 196, type: 'string' },
            { id: 'piano', name: 'PIANO', color: '#7000ff', icon: '🎹', freq: 440, type: 'keys' },
            { id: 'synth', name: 'SYNTH', color: '#ffff00', icon: '🎹', freq: 880, type: 'keys' },
            { id: 'violin', name: 'VIOLIN', color: '#ff8800', icon: '🎻', freq: 660, type: 'string' },
            { id: 'trumpet', name: 'TRUMPET', color: '#ffd700', icon: '🎺', freq: 523, type: 'brass' },
            { id: 'sax', name: 'SAX', color: '#ff00ff', icon: '🎷', freq: 330, type: 'brass' },
            { id: 'flute', name: 'FLUTE', color: '#00ffcc', icon: '🪈', freq: 987, type: 'wind' },
            { id: 'bass', name: 'BASS', color: '#00ff00', icon: '🎸', freq: 55, type: 'string' }
        ];
    }

    start() {
        this.showInstructions();
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg'; // Reuse premium styles
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎵</div>
            <h2 style="color: var(--accent-primary)">NEON ORCHESTRA</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted); line-height: 1.6;">
                Quick TAP: Single Note<br>
                LONG PRESS: Instrument BGM Loop
            </p>
            <button class="btn-primary" id="start-music">BEGIN JAM</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-music').onclick = () => {
            overlay.remove();
            this.initAudio();
            this.render();
        };
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    render() {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
        grid.style.gap = '20px';
        grid.style.width = '100%';
        grid.style.padding = '20px';

        this.instruments.forEach(inst => {
            const btn = document.createElement('button');
            btn.className = 'instrument-btn';
            btn.innerHTML = `
                <div class="inst-icon" style="font-size: 2.5rem">${inst.icon}</div>
                <div class="inst-name">${inst.name}</div>
            `;
            
            this.applyStyles(btn, inst);

            let pressTimer;
            let isLongPress = false;

            btn.onmousedown = (e) => {
                e.preventDefault();
                isLongPress = false;
                this.btnActive(btn, inst);
                
                pressTimer = setTimeout(() => {
                    isLongPress = true;
                    this.playBGM(inst, btn);
                }, this.longPressThreshold);
            };

            btn.onmouseup = btn.onmouseleave = () => {
                clearTimeout(pressTimer);
                this.btnInactive(btn, inst);
                if (!isLongPress) {
                    this.playNote(inst);
                    this.app.updateScore(5);
                } else {
                    this.stopBGM(inst, btn);
                }
            };

            grid.appendChild(btn);
        });

        const footer = document.createElement('div');
        footer.style.marginTop = '30px';
        footer.innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-primary" onclick="app.reloadCurrentGame()">RESET STAGE</button>
                <button class="btn-primary" onclick="app.loadNextGame()" style="background: var(--accent-secondary)">NEXT PERFORMANCE</button>
            </div>
        `;

        this.app.canvasArea.style.flexDirection = 'column';
        this.app.canvasArea.appendChild(grid);
        this.app.canvasArea.appendChild(footer);
    }

    applyStyles(btn, inst) {
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.border = `2px solid ${inst.color}`;
        btn.style.borderRadius = '15px';
        btn.style.padding = '30px 10px';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        btn.style.color = '#fff';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.alignItems = 'center';
        btn.style.gap = '10px';
        btn.style.fontSize = '1rem';
        btn.style.fontWeight = '800';
        btn.style.boxShadow = `0 0 10px ${inst.color}33`;
    }

    btnActive(btn, inst) {
        btn.style.transform = 'scale(0.95) translateY(5px)';
        btn.style.background = inst.color;
        btn.style.color = '#000';
        btn.style.boxShadow = `0 0 30px ${inst.color}`;
    }

    btnInactive(btn, inst) {
        btn.style.transform = 'scale(1)';
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.color = '#fff';
        btn.style.boxShadow = `0 0 10px ${inst.color}33`;
    }

    playNote(inst) {
        if (!this.audioCtx) return;
        this.executeTone(inst.freq, inst.type, 0.5);
    }

    playBGM(inst, btn) {
        this.app.updateScore(20);
        btn.style.animation = 'pulse-bgm 0.5s infinite alternate';
        
        // Simple 3-note loop sequence
        const seq = [1, 1.25, 1.5]; // Major triad intervals
        const startTime = this.audioCtx.currentTime;
        
        const nodes = [];
        seq.forEach((interval, i) => {
            const time = startTime + (i * 0.2);
            nodes.push(this.executeTone(inst.freq * interval, inst.type, 1.5, time));
        });
        
        this.activeNodes.set(inst.id, nodes);
    }

    stopBGM(inst, btn) {
        btn.style.animation = 'none';
        this.activeNodes.delete(inst.id);
    }

    executeTone(freq, type, duration, time = null) {
        if (this.app.isMuted) return null;
        const playTime = time || this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'percussion') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, playTime);
            gain.gain.setValueAtTime(1, playTime);
            gain.gain.exponentialRampToValueAtTime(0.01, playTime + duration);
        } else if (type === 'string') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, playTime);
            gain.gain.setValueAtTime(0.4, playTime);
            gain.gain.exponentialRampToValueAtTime(0.01, playTime + duration + 0.5);
        } else if (type === 'brass') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, playTime);
            gain.gain.setValueAtTime(0.2, playTime);
            gain.gain.exponentialRampToValueAtTime(0.01, playTime + duration);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, playTime);
            gain.gain.setValueAtTime(0.3, playTime);
            gain.gain.exponentialRampToValueAtTime(0.01, playTime + duration);
        }

        osc.start(playTime);
        osc.stop(playTime + duration + 0.5);
        return osc;
    }

    destroy() {
        this.activeNodes.forEach(nodes => {
            nodes.forEach(o => {
                try { o.stop(); } catch(e) {}
            });
        });
        this.activeNodes.clear();
    }
}
