import { publisherSDK } from './publisher.js?v=12';

// ---------- DOM REFERENCES ----------
const dom = {};

export function initUI() {
    dom.hudMoney = document.getElementById('hud-money');
    dom.hudGems = document.getElementById('hud-gems-val');
    dom.hudScore = document.getElementById('hud-score');
    dom.hudSatisfaction = document.getElementById('hud-satisfaction');
    dom.hudTime = document.getElementById('hud-time');
    dom.hudLevel = document.getElementById('hud-level');
    dom.ordersList = document.getElementById('orders-list');
    dom.messageText = document.getElementById('message-text');
    dom.levelComplete = document.getElementById('level-complete');
    dom.gameOver = document.getElementById('game-over');
    dom.pauseOverlay = document.getElementById('pause-overlay');
    dom.floatingMoneyContainer = document.getElementById('floating-money-container');
    dom.comboIndicator = document.getElementById('combo-indicator');
    dom.comboEmoji = document.getElementById('combo-emoji');
    dom.comboText = document.getElementById('combo-text');
    dom.carryingIndicator = document.getElementById('carrying-indicator');
    dom.carryingText = document.getElementById('carrying-text');
    dom.satisfactionWarning = document.getElementById('satisfaction-warning');

    // Initialize sound system
    initSounds();

    // Sound button toggle listener
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
        btnSound.addEventListener('click', toggleMute);
    }
}

// ---------- SOUND EFFECTS & BACKGROUND MUSIC (Web Audio API) ----------
let audioCtx = null;
const sounds = {};
export let isMuted = false;
let bgMusicInterval = null;

function initSounds() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
}

export function toggleMute() {
    isMuted = !isMuted;
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
        btnSound.textContent = isMuted ? '🔇' : '🔊';
    }
    if (isMuted) {
        stopBackgroundMusic();
    } else {
        startBackgroundMusic();
    }
}

function ensureAudioCtx() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            if (!isMuted) startBackgroundMusic();
        });
    } else if (audioCtx && audioCtx.state === 'running' && !isMuted && !bgMusicInterval) {
        startBackgroundMusic();
    }
}

function playTone(freq, duration = 0.15, type = 'sine', volume = 0.15) {
    if (!audioCtx || isMuted) return;
    ensureAudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function startBackgroundMusic() {
    if (!audioCtx || isMuted) return;
    if (bgMusicInterval) return;

    let step = 0;
    // Cute pentatonic scale notes (G major) for ambient Cat Cafe lofi
    const melody = [392.00, 440.00, 493.88, 587.33, 659.25, 587.33, 493.88, 440.00];

    bgMusicInterval = setInterval(() => {
        if (audioCtx && audioCtx.state === 'running' && !isMuted) {
            const note = melody[step % melody.length];
            // Play a soft bell-like tone in the background
            playTone(note, 0.8, 'sine', 0.02);

            // Occasional harmony note
            if (step % 4 === 0) {
                setTimeout(() => {
                    playTone(note * 1.5, 0.5, 'sine', 0.01);
                }, 200);
            }
            step++;
        }
    }, 1200);
}

function stopBackgroundMusic() {
    if (bgMusicInterval) {
        clearInterval(bgMusicInterval);
        bgMusicInterval = null;
    }
}

export function playSound(name) {
    const vibrate = (pattern) => {
        try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
    };

    switch (name) {
        case 'click':    vibrate(40); break;
        case 'money':    vibrate(60); break;
        case 'levelup':  vibrate([100, 50, 100]); break;
        case 'gameover': vibrate([200, 100, 200]); break;
        case 'dash':     vibrate(60); break;
        case 'angry':    vibrate(150); break;
    }

    switch (name) {
        case 'click':      playTone(800, 0.08, 'sine', 0.1); break;
        case 'seat':        playTone(523, 0.12, 'sine', 0.12); setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 100); break;
        case 'order':       playTone(440, 0.1, 'triangle', 0.1); setTimeout(() => playTone(550, 0.1, 'triangle', 0.1), 80); break;
        case 'ready':       playTone(660, 0.15, 'sine', 0.15); setTimeout(() => playTone(880, 0.2, 'sine', 0.15), 120); break;
        case 'deliver':     playTone(523, 0.1, 'sine', 0.12); setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80); setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 160); break;
        case 'money':       playTone(1047, 0.08, 'square', 0.08); setTimeout(() => playTone(1319, 0.12, 'square', 0.08), 60); break;
        case 'combo':       playTone(880, 0.1, 'sawtooth', 0.08); setTimeout(() => playTone(1100, 0.1, 'sawtooth', 0.08), 70); setTimeout(() => playTone(1320, 0.15, 'sawtooth', 0.1), 140); break;
        case 'angry':       playTone(200, 0.3, 'sawtooth', 0.1); break;
        case 'clean':       playTone(400, 0.08, 'sine', 0.08); setTimeout(() => playTone(500, 0.08, 'sine', 0.08), 60); break;
        case 'levelup':     [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i * 120)); break;
        case 'gameover':    playTone(300, 0.4, 'sawtooth', 0.12); setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.1), 300); break;
        case 'dash':        playTone(600, 0.1, 'triangle', 0.12); setTimeout(() => playTone(900, 0.15, 'triangle', 0.1), 40); break;
    }
}

// ---------- HUD UPDATE ----------
let prevMoney = 0;
export function updateHUD(state) {
    if (!dom.hudMoney) return;

    // Animate money change
    if (state.money !== prevMoney) {
        dom.hudMoney.style.animation = 'none';
        dom.hudMoney.offsetHeight;
        dom.hudMoney.style.animation = 'shakeHud 0.3s ease-out';
        prevMoney = state.money;
    }

    dom.hudMoney.textContent = `R$ ${state.money}`;
    if (dom.hudGems) {
        dom.hudGems.textContent = state.gems !== undefined ? state.gems : 0;
    }
    dom.hudScore.textContent = state.score;
    dom.hudSatisfaction.style.width = `${Math.max(0, Math.min(100, state.satisfaction))}%`;

    // Color the satisfaction bar
    if (state.satisfaction > 60) {
        dom.hudSatisfaction.style.background = 'linear-gradient(90deg, #4CAF50, #66BB6A)';
    } else if (state.satisfaction > 30) {
        dom.hudSatisfaction.style.background = 'linear-gradient(90deg, #FF9800, #FFB74D)';
    } else {
        dom.hudSatisfaction.style.background = 'linear-gradient(90deg, #E53935, #EF5350)';
    }

    // Satisfaction warning
    if (dom.satisfactionWarning) {
        if (state.satisfaction <= 30) {
            dom.satisfactionWarning.classList.remove('hidden');
            dom.satisfactionWarning.classList.add('active');
        } else {
            dom.satisfactionWarning.classList.add('hidden');
            dom.satisfactionWarning.classList.remove('active');
        }
    }

    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    dom.hudTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    // Flash time when low
    if (state.timeLeft <= 15) {
        dom.hudTime.style.color = '#E53935';
        dom.hudTime.style.animation = 'shakeHud 0.5s ease-out infinite';
    } else if (state.timeLeft <= 30) {
        dom.hudTime.style.color = '#FF9800';
        dom.hudTime.style.animation = '';
    } else {
        dom.hudTime.style.color = '#FF9800';
        dom.hudTime.style.animation = '';
    }

    dom.hudLevel.textContent = state.level;
}

// ---------- ORDERS PANEL (with progress bars) ----------
export function updateOrders(orders) {
    if (!dom.ordersList) return;
    dom.ordersList.innerHTML = '';
    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-item';
        if (order.state === 'cooking') div.classList.add('cooking');
        if (order.state === 'ready') div.classList.add('ready');

        const statusText = order.state === 'cooking' ? '🔥 Preparando...' :
                           order.state === 'ready' ? '✅ Pronto!' :
                           order.state === 'taken' ? '📝 Registrado' :
                           order.state === 'carrying' ? '🏃 Levando...' :
                           order.state === 'delivered' ? '🍽️ Entregue' : '';
        const statusClass = order.state === 'cooking' ? 'status-cooking' :
                            order.state === 'ready' ? 'status-ready' : '';

        // Station label
        const station = order.menuItem?.station;
        const stationLabel = station === 'bar' ? '🍺 Bar' : '🍳 Cozinha';

        // Calculate cooking progress
        let progressHTML = '';
        if (order.state === 'cooking' && order.cookTime && order.cookTimer !== undefined) {
            const total = order.menuItem.cookTime;
            const elapsed = total - order.cookTimer;
            const pct = Math.min(100, (elapsed / total) * 100);
            progressHTML = `<div class="order-progress"><div class="order-progress-fill" style="width: ${pct}%"></div></div>`;
        } else if (order.state === 'ready') {
            progressHTML = `<div class="order-progress"><div class="order-progress-fill done" style="width: 100%"></div></div>`;
        }

        div.innerHTML = `
            <div style="flex:1">
                <div class="order-name">${order.menuItem.emoji} ${order.menuItem.name}</div>
                <div class="order-table">Mesa ${order.tableIndex + 1} · <span style="opacity:0.7">${stationLabel}</span></div>
                ${progressHTML}
            </div>
            <div class="order-status ${statusClass}">${statusText}</div>
        `;
        dom.ordersList.appendChild(div);
    });
}

// ---------- FLOATING MONEY POPUP ----------
export function showFloatingMoney(amount, x, y, type = 'normal') {
    if (!dom.floatingMoneyContainer) return;
    const el = document.createElement('div');
    el.className = `floating-money ${type === 'bonus' ? 'bonus' : ''} ${type === 'combo' ? 'combo-bonus' : ''}`;
    el.textContent = type === 'combo' ? `🔥 COMBO +R$ ${amount}` : `+R$ ${amount}`;
    el.style.left = `${x || 50}%`;
    el.style.top = `${y || 40}%`;
    dom.floatingMoneyContainer.appendChild(el);
    setTimeout(() => el.remove(), 1900);
}

// ---------- COMBO INDICATOR ----------
let comboTimeout = null;
export function updateCombo(combo) {
    if (!dom.comboIndicator) return;
    if (combo >= 2) {
        const emojis = ['🔥', '💥', '⚡', '🌟', '💎'];
        dom.comboEmoji.textContent = emojis[Math.min(combo - 2, emojis.length - 1)];
        dom.comboText.textContent = `COMBO x${combo}`;
        dom.comboIndicator.classList.remove('hidden');
        // Re-trigger animation
        dom.comboIndicator.style.animation = 'none';
        dom.comboIndicator.offsetHeight;
        dom.comboIndicator.style.animation = 'comboPulse 0.6s ease-out';

        if (comboTimeout) clearTimeout(comboTimeout);
        comboTimeout = setTimeout(() => {
            dom.comboIndicator.classList.add('hidden');
        }, 4000);
    } else {
        dom.comboIndicator.classList.add('hidden');
    }
}

// ---------- CARRYING INDICATOR ----------
export function updateCarrying(item) {
    if (!dom.carryingIndicator) return;
    if (item) {
        dom.carryingText.textContent = `🍽️ Carregando: ${item.emoji} ${item.name} → Mesa ${item.tableIndex + 1}`;
        dom.carryingIndicator.classList.remove('hidden');
    } else {
        dom.carryingIndicator.classList.add('hidden');
    }
}

// ---------- MESSAGE BAR ----------
let messageTimeout = null;
export function showMessage(text, duration = 4000) {
    if (!dom.messageText) return;
    dom.messageText.textContent = text;
    const bar = document.getElementById('message-bar');
    bar.style.animation = 'none';
    bar.offsetHeight; // reflow
    bar.style.animation = 'fadeInUp 0.4s ease-out';

    if (messageTimeout) clearTimeout(messageTimeout);
    if (duration > 0) {
        messageTimeout = setTimeout(() => {
            dom.messageText.textContent = 'Toque nos gatinhos, mesas ou cozinha para interagir. 🐾';
        }, duration);
    }
}

// ---------- SCREEN MANAGEMENT ----------
export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

// ---------- OVERLAYS ----------
export function showLevelComplete(stats) {
    const elServed = document.getElementById('result-served');
    if (elServed) elServed.textContent = stats.served;
    const elScore = document.getElementById('result-score');
    if (elScore) elScore.textContent = stats.score;
    const elMoney = document.getElementById('result-money');
    if (elMoney) elMoney.textContent = `R$ ${stats.money}`;
    const elSat = document.getElementById('result-satisfaction');
    if (elSat) elSat.textContent = `${Math.round(stats.satisfaction)}%`;

    // New record badge
    const newRecBadge = document.getElementById('new-record-badge');
    if (newRecBadge) {
        newRecBadge.classList.toggle('hidden', !stats.isNewRecord);
    }
    
    // Reset ad button visibility
    const adBtn = document.getElementById('btn-ad-double');
    if (adBtn) adBtn.style.display = 'block';

    if (dom.levelComplete) dom.levelComplete.classList.remove('hidden');
    playSound('levelup');
    publisherSDK.gameplayStop();
}
export function hideLevelComplete() { 
    if (dom.levelComplete) dom.levelComplete.classList.add('hidden'); 
}

export function showGameOver(stats) {
    const elLvl = document.getElementById('go-level');
    if (elLvl) elLvl.textContent = stats.level;
    const elScore = document.getElementById('go-score');
    if (elScore) elScore.textContent = stats.score;
    const elMoney = document.getElementById('go-money');
    if (elMoney) elMoney.textContent = `R$ ${stats.money}`;

    // High score display
    const elHs = document.getElementById('go-highscore');
    if (elHs) elHs.textContent = stats.highScore !== undefined ? stats.highScore : stats.score;

    // New record badge
    const goNewRec = document.getElementById('go-new-record-badge');
    if (goNewRec) {
        goNewRec.classList.toggle('hidden', !stats.isNewRecord);
    }

    // Reset ad button visibility
    const adBtn = document.getElementById('btn-ad-revive');
    if (adBtn) adBtn.style.display = 'block';

    if (dom.gameOver) dom.gameOver.classList.remove('hidden');
    playSound('gameover');
    publisherSDK.gameplayStop();
}
export function hideGameOver() { 
    if (dom.gameOver) dom.gameOver.classList.add('hidden'); 
}

export function showPause() { 
    if (dom.pauseOverlay) dom.pauseOverlay.classList.remove('hidden'); 
}
export function hidePause() {
    const elPause = document.getElementById('pause-overlay');
    if (elPause) elPause.classList.add('hidden');
}

// ---------- AD SIMULATION ----------
export function showSimulatedAd(callback) {
    const overlay = document.getElementById('ad-overlay');
    const bar = document.getElementById('ad-progress-bar');
    const timeText = document.getElementById('ad-time-left');
    
    overlay.classList.remove('hidden');
    bar.style.transition = 'none';
    bar.style.width = '0%';
    
    let timeLeft = 3;
    timeText.textContent = timeLeft;
    
    // Force reflow
    bar.offsetHeight;
    bar.style.transition = 'width 3s linear';
    bar.style.width = '100%';
    
    const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) timeText.textContent = timeLeft;
    }, 1000);
    
    setTimeout(() => {
        clearInterval(interval);
        overlay.classList.add('hidden');
        if (callback) callback();
    }, 3000);
}

// ---------- PARTICLES (Menu Background) ----------
let particlesCtx, particles = [];
const PARTICLE_COUNT = 60;

export function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    particlesCtx = canvas.getContext('2d');
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas);

    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.1,
        });
    }
}

function resizeParticleCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function animateParticles() {
    if (!particlesCtx) return;
    const canvas = particlesCtx.canvas;
    particlesCtx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        particlesCtx.fillStyle = `rgba(255, 143, 171, ${p.alpha})`;
        particlesCtx.fill();
    });
}
