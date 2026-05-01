// ==========================================
// ui.js — HUD Updates, Particles, Screen Management
// ==========================================

// ---------- DOM REFERENCES ----------
const dom = {};

export function initUI() {
    dom.hudMoney = document.getElementById('hud-money');
    dom.hudScore = document.getElementById('hud-score');
    dom.hudSatisfaction = document.getElementById('hud-satisfaction');
    dom.hudTime = document.getElementById('hud-time');
    dom.hudLevel = document.getElementById('hud-level');
    dom.ordersList = document.getElementById('orders-list');
    dom.messageText = document.getElementById('message-text');
    dom.levelComplete = document.getElementById('level-complete');
    dom.gameOver = document.getElementById('game-over');
    dom.pauseOverlay = document.getElementById('pause-overlay');
}

// ---------- HUD UPDATE ----------
export function updateHUD(state) {
    if (!dom.hudMoney) return;
    dom.hudMoney.textContent = `R$ ${state.money}`;
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
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    dom.hudTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    dom.hudLevel.textContent = state.level;
}

// ---------- ORDERS PANEL ----------
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
                           order.state === 'taken' ? '📝 Registrado' : '';
        const statusClass = order.state === 'cooking' ? 'status-cooking' :
                            order.state === 'ready' ? 'status-ready' : '';

        div.innerHTML = `
            <div>
                <div class="order-name">${order.menuItem.emoji} ${order.menuItem.name}</div>
                <div class="order-table">Mesa ${order.tableIndex + 1}</div>
            </div>
            <div class="order-status ${statusClass}">${statusText}</div>
        `;
        dom.ordersList.appendChild(div);
    });
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
            dom.messageText.textContent = 'Clique em clientes, mesas ou cozinha para interagir.';
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
    document.getElementById('result-served').textContent = stats.served;
    document.getElementById('result-score').textContent = stats.score;
    document.getElementById('result-money').textContent = `R$ ${stats.money}`;
    document.getElementById('result-satisfaction').textContent = `${Math.round(stats.satisfaction)}%`;
    dom.levelComplete.classList.remove('hidden');
}
export function hideLevelComplete() { dom.levelComplete.classList.add('hidden'); }

export function showGameOver(stats) {
    document.getElementById('go-level').textContent = stats.level;
    document.getElementById('go-score').textContent = stats.score;
    document.getElementById('go-money').textContent = `R$ ${stats.money}`;
    dom.gameOver.classList.remove('hidden');
}
export function hideGameOver() { dom.gameOver.classList.add('hidden'); }

export function showPause() { dom.pauseOverlay.classList.remove('hidden'); }
export function hidePause() { dom.pauseOverlay.classList.add('hidden'); }

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
        particlesCtx.fillStyle = `rgba(218, 165, 32, ${p.alpha})`;
        particlesCtx.fill();
    });
}
