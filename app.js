/**
 * Bored Games - Main Controller
 */

class App {
    constructor() {
        this.games = ['sudoku', 'ball-catch', 'jump', 'run', 'boom', 'music', 'reflex', 'memory', 'avoid', 'snake', 'spectrum', 'animal', 'stack', 'bricks', 'lasers', 'pong', 'floppy', 'hacking', 'catcher', 'mines', 'orbital', 'pulse', 'clicker', 'strike', 'slide', 'mastermind', 'hanoi', 'flood', 'lights', 'math', 'word', 'shape', 'bitmatch', 'mirror'];
        this.pendingGames = [];
        this.currentGame = null;
        this.currentGameId = null;
        this.score = 0;
        this.level = 1;
        this.isMuted = false;

        this.loader = document.getElementById('loader');
        this.wrapper = document.getElementById('game-canvas-wrapper');
        this.canvasArea = document.getElementById('canvas-area');
        this.titleEl = document.getElementById('game-title');
        this.descEl = document.getElementById('game-desc');
        this.scoreEl = document.getElementById('current-score');
        this.levelEl = document.getElementById('current-level');
        this.muteBtn = document.getElementById('mute-btn');
        this.muteIcon = document.getElementById('mute-icon');

        this.audioCtx = null;
        this.leaderboard = JSON.parse(localStorage.getItem('bored_leaderboard')) || [
            { name: "NEO", score: 5000 },
            { name: "TRINITY", score: 4500 },
            { name: "MORPHEUS", score: 4000 }
        ];

        this.init();
        this.checkMobileNotice();
        this.checkAdsPopup();
        this.startAdCycle();
        this.updateLeaderboardUI();
    }

    init() {
        this.createStars();
        this.setupEventListeners();
        this.loadRandomGame();
        this.username = localStorage.getItem('bored_username') || "GUEST";
        this.hasEnteredName = !!localStorage.getItem('bored_username');
    }

    checkMobileNotice() {
        if (window.innerWidth <= 768) {
            if (!sessionStorage.getItem('bored_mobile_warned')) {
                const popup = document.getElementById('mobile-warning-popup');
                const closeBtn = document.getElementById('close-mobile-warning');
                const ackBtn = document.getElementById('ack-mobile-warning');
                
                if (popup) {
                    popup.classList.remove('hidden');
                    const dismiss = () => {
                        popup.classList.add('hidden');
                        sessionStorage.setItem('bored_mobile_warned', 'true');
                    };
                    if (closeBtn) closeBtn.onclick = dismiss;
                    if (ackBtn) ackBtn.onclick = dismiss;
                }
            }
        }
    }

    startAdCycle() {
        // Ads are now always visible, just setup close listeners
        const sidebar = document.getElementById('sidebar');
        const footer = document.getElementById('footer-ad-bar');
        const sidebarX = document.getElementById('close-sidebar-ad');
        const footerX = document.getElementById('close-footer-ad');

        if (!sidebar || !footer) return;

        sidebarX.onclick = () => {
            sidebar.classList.add('ad-hidden');
            sidebarX.classList.add('hidden');
        };
        footerX.onclick = () => {
            footer.classList.add('ad-hidden');
            footerX.classList.add('hidden');
        };
    }

    updateScore(amount) {
        this.score += amount;
        this.scoreEl.textContent = this.score;
    }

    promptHighscore() {
        if (this.hasEnteredName) {
            this.updateLeaderboard(this.username, this.score);
            return;
        }

        const popup = document.getElementById('name-popup');
        if (!popup) return;
        
        const input = document.getElementById('hacker-name');
        const saveBtn = document.getElementById('save-score-btn');
        
        popup.classList.remove('hidden');
        input.value = this.username === "GUEST" ? "" : this.username;
        input.focus();
        
        saveBtn.onclick = () => {
            const name = input.value.trim().toUpperCase() || "GUEST";
            this.username = name;
            localStorage.setItem('bored_username', name);
            this.hasEnteredName = true;
            this.updateLeaderboard(name, this.score);
            popup.classList.add('hidden');
        };
    }

    updateLeaderboard(name, score) {
        const existingIndex = this.leaderboard.findIndex(item => item.name === name);
        if (existingIndex !== -1) {
            if (score > this.leaderboard[existingIndex].score) {
                this.leaderboard[existingIndex].score = score;
            }
        } else {
            this.leaderboard.push({ name, score });
        }
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        localStorage.setItem('bored_leaderboard', JSON.stringify(this.leaderboard));
        this.updateLeaderboardUI();
    }

    updateLeaderboardUI() {
        const list = document.getElementById('leaderboard-list');
        const popupList = document.getElementById('popup-leaderboard-list');
        
        const generateHtml = (items) => items.map((item, index) => {
            let icon = '👤';
            if (index === 0) icon = '🥇';
            else if (index === 1) icon = '🥈';
            else if (index === 2) icon = '🥉';
            
            return `
            <div class="leaderboard-item">
                <span class="leaderboard-name"><span class="player-icon">${icon}</span> ${item.name}</span>
                <span class="leaderboard-score">${item.score}</span>
            </div>
            `;
        }).join('');

        if (list) list.innerHTML = generateHtml(this.leaderboard.slice(0, 5));
        if (popupList) popupList.innerHTML = generateHtml(this.leaderboard);
    }

    checkAdsPopup() {
        const AD_DELAY = 10 * 60 * 1000; // 10 minutes
        const now = Date.now();
        const firstVisit = localStorage.getItem('bored_first_visit');

        if (!firstVisit) {
            localStorage.setItem('bored_first_visit', now);
        } else {
            const timeElapsed = now - parseInt(firstVisit);
            if (timeElapsed > AD_DELAY) {
                this.showAdPopup();
            }
        }
    }

    showAdPopup() {
        const popup = document.getElementById('ad-popup');
        const closeBtn = document.getElementById('close-ad-popup');
        
        if (popup) {
            popup.classList.remove('hidden');
            closeBtn.onclick = () => {
                popup.classList.add('hidden');
                // Reset visit time so they don't get it every single refresh now
                localStorage.setItem('bored_first_visit', Date.now());
            };
        }
    }

    createStars() {
        const container = document.getElementById('stars');
        const count = 100;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3 + 'px';
            star.style.width = size;
            star.style.height = size;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
            container.appendChild(star);
        }
    }

    setupEventListeners() {
        document.getElementById('shuffle-btn').addEventListener('click', () => this.loadRandomGame());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') this.loadRandomGame();
            if (e.key.toLowerCase() === 'm') this.toggleMute();
        });

        // Leaderboard Button
        document.getElementById('leaderboard-btn').onclick = () => {
            document.getElementById('leaderboard-popup').classList.remove('hidden');
        };

        document.getElementById('close-leaderboard').onclick = () => {
            document.getElementById('leaderboard-popup').classList.add('hidden');
        };

        // Touch to Mouse translation
        this.canvasArea.addEventListener('touchstart', (e) => this.handleTouch(e, 'mousedown'), {passive: false});
        this.canvasArea.addEventListener('touchmove', (e) => this.handleTouch(e, 'mousemove'), {passive: false});
        this.canvasArea.addEventListener('touchend', (e) => this.handleTouch(e, 'mouseup'), {passive: false});

        // Mobile D-pad Controls
        const dispatchKey = (code, key) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: key, code: code }));
        };
        const dispatchKeyUp = (code, key) => {
            window.dispatchEvent(new KeyboardEvent('keyup', { key: key, code: code }));
        };
        
        const attachDpadBtn = (id, code, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            // Prevent default to stop scrolling
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); dispatchKey(code, key); });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); dispatchKey(code, key); });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); dispatchKeyUp(code, key); });
            btn.addEventListener('mouseup', (e) => { e.preventDefault(); dispatchKeyUp(code, key); });
            btn.addEventListener('mouseleave', (e) => { e.preventDefault(); dispatchKeyUp(code, key); });
        };

        attachDpadBtn('btn-up', 'ArrowUp', 'ArrowUp');
        attachDpadBtn('btn-down', 'ArrowDown', 'ArrowDown');
        attachDpadBtn('btn-left', 'ArrowLeft', 'ArrowLeft');
        attachDpadBtn('btn-right', 'ArrowRight', 'ArrowRight');
        attachDpadBtn('btn-action', 'Space', ' ');
    }

    handleTouch(e, mouseEventType) {
        if (!e.target || e.target.tagName !== 'CANVAS') return;
        e.preventDefault();
        
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent(mouseEventType, {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
                cancelable: true
            });
            e.target.dispatchEvent(mouseEvent);
        } else if (mouseEventType === 'mouseup') {
            const mouseEvent = new MouseEvent(mouseEventType, {
                bubbles: true,
                cancelable: true
            });
            e.target.dispatchEvent(mouseEvent);
        }
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.muteIcon.innerHTML = this.isMuted 
            ? '<path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18.03,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.48,12.43 16.5,12.22 16.5,12Z" />'
            : '<path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />';
        this.muteBtn.style.color = this.isMuted ? '#666' : 'var(--accent-primary)';
    }

    playTone(freq, duration, type = 'sine', volume = 0.2) {
        if (this.isMuted) return;
        this.initAudio();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playVictory() {
        this.playTone(523.25, 0.2, 'square'); // C5
        setTimeout(() => this.playTone(659.25, 0.2, 'square'), 100); // E5
        setTimeout(() => this.playTone(783.99, 0.4, 'square', 0.15), 200); // G5
        this.checkHighScore();
    }

    playFailure() {
        this.playTone(392.00, 0.15, 'sawtooth'); // G4
        setTimeout(() => this.playTone(349.23, 0.15, 'sawtooth'), 150); // F4
        setTimeout(() => this.playTone(261.63, 0.5, 'sawtooth'), 300); // C4
        this.checkHighScore();
    }

    checkHighScore() {
        if (this.score === 0) return;
        if (this.leaderboard.length < 10 || this.score > this.leaderboard[this.leaderboard.length-1].score) {
            // Prevent multiple prompts for the same score
            if (this.lastScorePrompted === this.score) return;
            this.lastScorePrompted = this.score;
            setTimeout(() => this.promptHighscore(), 500);
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async loadRandomGame() {
        // Show loader
        this.wrapper.classList.add('hidden');
        this.loader.style.display = 'flex';
        
        // Clear previous game
        if (this.currentGame && this.currentGame.destroy) {
            this.currentGame.destroy();
        }
        this.canvasArea.innerHTML = '';
        this.canvasArea.style.flexDirection = '';
        this.canvasArea.style.alignItems = '';

        // If no pending games, refill and shuffle
        if (this.pendingGames.length === 0) {
            this.pendingGames = this.shuffleArray([...this.games]);
            // Avoid picking the same game immediately if it was the last one in the previous cycle
            if (this.currentGameId && this.pendingGames[0] === this.currentGameId && this.games.length > 1) {
                // Swap the first two to ensure variety
                [this.pendingGames[0], this.pendingGames[1]] = [this.pendingGames[1], this.pendingGames[0]];
            }
        }

        // Update Level indicator based on how many games played in this cycle
        const gamesPlayed = this.games.length - this.pendingGames.length;
        this.level = gamesPlayed + 1;
        this.levelEl.textContent = this.level;

        // Delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 800));

        const gameId = this.pendingGames.shift();
        this.currentGameId = gameId;

        this.initGame(gameId);

        // Hide loader
        this.loader.style.display = 'none';
        this.wrapper.classList.remove('hidden');
    }

    // Alias for clarifying the "Next" logic
    loadNextGame() {
        this.loadRandomGame();
    }

    async reloadCurrentGame() {
        if (!this.currentGameId) return;

        this.wrapper.classList.add('hidden');
        this.loader.style.display = 'flex';

        if (this.currentGame && this.currentGame.destroy) {
            this.currentGame.destroy();
        }
        this.canvasArea.innerHTML = '';
        this.canvasArea.style.flexDirection = '';
        this.canvasArea.style.alignItems = '';

        await new Promise(resolve => setTimeout(resolve, 400));

        this.initGame(this.currentGameId);

        this.loader.style.display = 'none';
        this.wrapper.classList.remove('hidden');
    }

    initGame(id) {
        let game;
        switch(id) {
            case 'sudoku':
                game = new SudokuGame(this);
                break;
            case 'ball-catch':
                game = new BallCatchGame(this);
                break;
            case 'jump':
                game = new JumpGame(this);
                break;
            case 'run':
                game = new RunGame(this);
                break;
            case 'boom':
                game = new BoomGame(this);
                break;
            case 'music':
                game = new MusicGame(this);
                break;
            case 'reflex':
                game = new ReflexGame(this);
                break;
            case 'memory':
                game = new MemoryGame(this);
                break;
            case 'avoid':
                game = new AvoidGame(this);
                break;
            case 'snake':
                game = new SnakeGame(this);
                break;
            case 'spectrum':
                game = new ColorMatchGame(this);
                break;
            case 'animal':
                game = new AnimalSoundsGame(this);
                break;
            case 'stack':
                game = new StackGame(this);
                break;
            case 'bricks':
                game = new BricksGame(this);
                break;
            case 'lasers':
                game = new LaserDodgeGame(this);
                break;
            case 'pong':
                game = new PongGame(this);
                break;
            case 'floppy':
                game = new FloppyGame(this);
                break;
            case 'hacking':
                game = new HackingGame(this);
                break;
            case 'catcher':
                game = new CatcherGame(this);
                break;
            case 'mines':
                game = new MineGlitchGame(this);
                break;
            case 'orbital':
                game = new OrbitalGame(this);
                break;
            case 'pulse':
                game = new PulseGame(this);
                break;
            case 'clicker':
                game = new ClickerGame(this);
                break;
            case 'strike':
                game = new StrikeGame(this);
                break;
            case 'slide':
                game = new SlidePuzzleGame(this);
                break;
            case 'mastermind':
                game = new MastermindGame(this);
                break;
            case 'hanoi':
                game = new HanoiGame(this);
                break;
            case 'flood':
                game = new FloodFillGame(this);
                break;
            case 'lights':
                game = new LightsOutGame(this);
                break;
            case 'math':
                game = new MathSprintGame(this);
                break;
            case 'word':
                game = new WordScrambleGame(this);
                break;
            case 'shape':
                game = new ShapeMatchGame(this);
                break;
            case 'bitmatch':
                game = new BitMatchGame(this);
                break;
            case 'mirror':
                game = new MirrorPuzzleGame(this);
                break;
        }

        this.currentGame = game;
        this.titleEl.textContent = game.title;
        this.descEl.textContent = game.description;
        game.start();
    }

    showToast(msg) {
        console.log(msg);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
