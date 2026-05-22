// ==========================================
// main.js — Entry Point, Game Loop, Events
// ==========================================
import * as THREE from 'three';
import { initScene, createRestaurant } from './scene.js';
import { Game } from './gameplay.js';
import {
    initUI, initParticles, animateParticles,
    showScreen, hideLevelComplete, hideGameOver,
    showPause, hidePause, showMessage, showSimulatedAd
} from './ui.js';

// ---------- STATE ----------
let sceneData = null;
let restaurantData = null;
let game = null;
let clock = null;
let raycaster = null;
let mouse = null;
let currentScreen = 'menu'; // menu, game

// ---------- INITIALIZATION ----------
function init() {
    initUI();
    initParticles();
    setupMenuListeners();
    startMenuLoop();
}

// ---------- MENU ANIMATION LOOP ----------
let menuAnimId = null;
function startMenuLoop() {
    function loop() {
        animateParticles();
        menuAnimId = requestAnimationFrame(loop);
    }
    loop();
}
function stopMenuLoop() {
    if (menuAnimId) { cancelAnimationFrame(menuAnimId); menuAnimId = null; }
}

// ---------- MENU EVENT LISTENERS ----------
function setupMenuListeners() {
    document.getElementById('btn-play').addEventListener('click', startGame);
    document.getElementById('btn-tutorial').addEventListener('click', () => showScreen('tutorial-screen'));
    document.getElementById('btn-credits').addEventListener('click', () => showScreen('credits-screen'));
    document.getElementById('btn-back-tutorial').addEventListener('click', () => showScreen('menu-screen'));
    document.getElementById('btn-back-credits').addEventListener('click', () => showScreen('menu-screen'));

    // Game overlays
    document.getElementById('btn-next-level').addEventListener('click', () => {
        hideLevelComplete();
        game.nextLevel();
    });
    
    document.getElementById('btn-ad-double').addEventListener('click', (e) => {
        showSimulatedAd(() => {
            if (game) {
                // Double the money earned in this level
                const earned = game.levelMoney;
                game.state.money += earned; 
                game.levelMoney *= 2;
                document.getElementById('result-money').textContent = `R$ ${game.levelMoney.toFixed(2)}`;
                e.target.style.display = 'none'; // Hide button after using
            }
        });
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
        hideLevelComplete();
        backToMenu();
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        hideGameOver();
        game.restart();
    });

    document.getElementById('btn-ad-revive').addEventListener('click', (e) => {
        showSimulatedAd(() => {
            if (game) {
                hideGameOver();
                game.state.satisfaction = 50; // Restore 50%
                game.state.timeLeft += 30; // Extra 30 seconds
                game.state.running = true;
                e.target.style.display = 'none'; // Hide button after using
            }
        });
    });

    document.getElementById('btn-go-menu').addEventListener('click', () => {
        hideGameOver();
        backToMenu();
    });
    document.getElementById('btn-pause').addEventListener('click', () => {
        if (game) {
            game.togglePause();
            if (game.state.paused) showPause();
        }
    });
    document.getElementById('btn-resume').addEventListener('click', () => {
        if (game) {
            game.togglePause();
            hidePause();
        }
    });
    document.getElementById('btn-pause-menu').addEventListener('click', () => {
        hidePause();
        if (game) game.state.running = false;
        backToMenu();
    });
}

// ---------- START GAME ----------
function startGame() {
    stopMenuLoop();
    showScreen('game-screen');
    currentScreen = 'game';

    if (!sceneData) {
        const canvas = document.getElementById('game-canvas');
        sceneData = initScene(canvas);
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        clock = new THREE.Clock();

        restaurantData = createRestaurant(sceneData.scene);

        // Click handler
        canvas.addEventListener('click', onGameClick);
        canvas.addEventListener('touchstart', onGameTouchStart, { passive: true });
        canvas.addEventListener('touchend', onGameTouch);
    }

    if (!game) {
        game = new Game(sceneData.scene, restaurantData, sceneData.camera);
    }
    game.start(game.state.level || 1);
    clock.start();

    gameLoop();
}

// ---------- BACK TO MENU ----------
function backToMenu() {
    currentScreen = 'menu';
    if (game) {
        game.clearAll();
        game.state.running = false;
    }
    showScreen('menu-screen');
    initParticles();
    startMenuLoop();
}

// ---------- GAME LOOP ----------
let gameAnimId = null;
function gameLoop() {
    if (currentScreen !== 'game') return;

    const dt = Math.min(clock.getDelta(), 0.1); // cap at 100ms

    if (game) {
        game.update(dt);
    }

    if (sceneData) {
        sceneData.controls.update();
        sceneData.renderer.render(sceneData.scene, sceneData.camera);
    }

    gameAnimId = requestAnimationFrame(gameLoop);
}

// ---------- CLICK HANDLING ----------
function onGameClick(event) {
    if (!game || !sceneData) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, sceneData.camera);
    const intersects = raycaster.intersectObjects(sceneData.scene.children, true);

    if (intersects.length > 0) {
        game.handleClick(intersects);
    }
}

let touchStartX = 0;
let touchStartY = 0;

function onGameTouchStart(event) {
    if (!event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function onGameTouch(event) {
    if (!game || !sceneData || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];

    // Calculate distance to differentiate tap vs drag
    const dist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
    if (dist > 15) return; // If moved more than 15px, it's a drag, ignore click

    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, sceneData.camera);
    const intersects = raycaster.intersectObjects(sceneData.scene.children, true);

    if (intersects.length > 0) {
        game.handleClick(intersects);
    }
}

// ---------- START ----------
init();
