/**
 * Game 27: Tower of Hanoi
 */
class HanoiGame {
    constructor(app) {
        this.app = app;
        this.title = "Core Rebuild";
        this.description = "Move all disks from the LEFT stack to the RIGHT stack. Larger disks cannot sit on top of smaller ones.";
        this.stacks = [[3, 2, 1], [], []];
        this.selected = null;
        this.running = false;
        this.moves = 0;
    }

    start() {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-msg';
        overlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🗼</div>
            <h2 style="color: var(--accent-primary)">CORE REBUILD</h2>
            <p style="margin: 1.5rem 0; color: var(--text-muted);">Transfer the memory core blocks.</p>
            <button class="btn-primary" id="start-hanoi">INITIATE RE-LINK</button>
        `;
        this.app.canvasArea.appendChild(overlay);
        document.getElementById('start-hanoi').onclick = () => {
            overlay.remove();
            this.initGame();
        };
    }

    initGame() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 300;
        this.ctx = this.canvas.getContext('2d');
        this.app.canvasArea.appendChild(this.canvas);
        this.canvas.onclick = (e) => this.handleClick(e);
        this.running = true;
        this.draw();
    }

    handleClick(e) {
        if (!this.running) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const stackIdx = Math.floor(mx / 200);

        if (this.selected === null) {
            if (this.stacks[stackIdx].length > 0) {
                this.selected = stackIdx;
                this.app.playTone(400, 0.05);
            }
        } else {
            const disk = this.stacks[this.selected][this.stacks[this.selected].length - 1];
            const target = this.stacks[stackIdx];
            if (target.length === 0 || target[target.length - 1] > disk) {
                target.push(this.stacks[this.selected].pop());
                this.moves++;
                this.app.playTone(600, 0.1);
            }
            this.selected = null;
        }
        
        this.draw();
        if (this.stacks[2].length === 3) this.gameOver();
    }

    draw() {
        this.ctx.clearRect(0, 0, 600, 300);
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#333';
        
        // Draw Rails
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 200;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 100);
            this.ctx.lineTo(x, 250);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(x - 50, 250);
            this.ctx.lineTo(x + 50, 250);
            this.ctx.stroke();
        }

        // Draw Disks
        const colors = ['#00f2ff', '#7000ff', '#ff0055'];
        this.stacks.forEach((stack, sIdx) => {
            const sx = 100 + sIdx * 200;
            stack.forEach((diskSize, dIdx) => {
                const w = 40 + diskSize * 30;
                const h = 20;
                const y = 250 - (dIdx + 1) * 22;
                
                this.ctx.fillStyle = colors[diskSize - 1];
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = colors[diskSize - 1];
                if (this.selected === sIdx && dIdx === stack.length - 1) {
                    this.ctx.fillRect(sx - w / 2, y - 50, w, h);
                } else {
                    this.ctx.fillRect(sx - w / 2, y, w, h);
                }
                this.ctx.shadowBlur = 0;
            });
        });
    }

    gameOver() {
        this.running = false;
        this.app.playVictory();
        this.app.updateScore(1200);
        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = `<h3>CORE STABILIZED</h3><p>Moves: ${this.moves}</p><button class="btn-primary" onclick="app.loadNextGame()">CONTINUE</button>`;
        this.app.canvasArea.appendChild(msg);
    }

    destroy() { this.running = false; }
}
