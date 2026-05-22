// ==========================================
// main.js — Entry Point, Game Loop, Events
// ==========================================
import * as THREE from 'three';
import { initScene, createRestaurant } from './scene.js';
import { Game, shopState, saveProgress, getShopPrices, loadProgress } from './gameplay.js';
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
                saveProgress(game.state.money);
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

    document.getElementById('btn-ad-revive').addEventListener('click', (e) => {
        showSimulatedAd(() => {
            if (game) {
                game.state.timeLeft += 60; 
                game.state.running = true;
                hideGameOver();
                document.getElementById('game-over').classList.add('hidden');
                e.target.style.display = 'none'; // Can only revive once
            }
        });
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        hideGameOver();
        if (game) game.restart();
    });

    // --- SHOP LOGIC ---
    const openShop = () => {
        if (currentScreen === 'game') {
            document.getElementById('level-complete').classList.add('hidden');
        }
        const money = game ? game.state.money : loadProgress();
        document.getElementById('shop-balance').textContent = money.toFixed(2);
        updateShopButtons(money);
        
        // Shop is now an overlay, so we always just remove 'hidden'
        document.getElementById('shop-screen').classList.remove('hidden');
    };
    
    document.getElementById('btn-shop').addEventListener('click', openShop);
    document.getElementById('btn-shop-level').addEventListener('click', openShop);
    
    document.getElementById('btn-close-shop').addEventListener('click', () => {
        document.getElementById('shop-screen').classList.add('hidden');
        
        if (currentScreen === 'game') {
            // Restore level complete overlay
            document.getElementById('level-complete').classList.remove('hidden');
        }
    });

    setupShopButtons();

    document.getElementById('btn-go-menu').addEventListener('click', () => {
        hideGameOver();
        backToMenu();
    });
    document.getElementById('btn-pause').addEventListener('click', () => {
        if (game) {
            game.togglePause();
            if (game.state.paused) {
                showPause();
            } else {
                hidePause();
            }
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

function updateShopButtons(money) {
    const prices = getShopPrices();

    const setupBtn = (id, price, isUnlocked, callback) => {
        const btn = document.getElementById(id);
        if (isUnlocked) {
            btn.textContent = 'Comprado';
            btn.disabled = true;
        } else {
            btn.textContent = `R$ ${price}`;
            btn.disabled = money < price;
            btn.onclick = () => {
                if (money >= price) {
                    money -= price; // local variable
                    if (game) {
                        game.state.money = money;
                    }
                    callback();
                    saveProgress(money);
                    updateShopButtons(money);
                    document.getElementById('shop-balance').textContent = money.toFixed(2);
                }
            };
        }
    };

    setupBtn('btn-buy-table', prices.table, shopState.tablesUnlocked >= 8, () => {
        shopState.tablesUnlocked++;
        if (game) {
            window.ACTIVE_TABLES = shopState.tablesUnlocked;
            game.navGrid = game.buildNavGrid ? game.buildNavGrid() : game.navGrid;
            game.tables.forEach((t, idx) => {
                if (idx < window.ACTIVE_TABLES) {
                    t.group.visible = true;
                    if (t.state === 'locked') t.state = 'empty';
                }
            });
        }
    });
    setupBtn('btn-buy-speed', prices.speed, shopState.waiterSpeedLevel >= 5, () => {
        shopState.waiterSpeedLevel++;
        if (game) game.waiterSpeed = 5.0 + (shopState.waiterSpeedLevel * 0.5);
    });
    setupBtn('btn-buy-massa', prices.food.massa, shopState.foodUnlocked.includes('massa'), () => shopState.foodUnlocked.push('massa'));
    setupBtn('btn-buy-salada', prices.food.salada, shopState.foodUnlocked.includes('salada'), () => shopState.foodUnlocked.push('salada'));
    setupBtn('btn-buy-file', prices.food.file, shopState.foodUnlocked.includes('file'), () => shopState.foodUnlocked.push('file'));
    setupBtn('btn-buy-refrigerante', prices.drinks.refrigerante, shopState.drinksUnlocked.includes('refrigerante'), () => shopState.drinksUnlocked.push('refrigerante'));
    setupBtn('btn-buy-cerveja', prices.drinks.cerveja, shopState.drinksUnlocked.includes('cerveja'), () => shopState.drinksUnlocked.push('cerveja'));
    setupBtn('btn-buy-vinho', prices.drinks.vinho, shopState.drinksUnlocked.includes('vinho'), () => {
        shopState.drinksUnlocked.push('vinho');
        shopState.drinksUnlocked.push('cocktail');
    });
}

function setupShopButtons() {
    // Buttons are setup dynamically inside updateShopButtons
}
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
