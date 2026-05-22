// ==========================================
// main.js — Entry Point, Game Loop, Events
// Full Monetization: Tabs, Gacha, IAP, Skins, VIP
// ==========================================
import * as THREE from 'three';
import { initScene, createRestaurant, createWaiterModel, createPlateModel, createDrinkModel } from './scene.js?v=10';
import { Game, shopState, saveProgress, getShopPrices, loadProgress } from './gameplay.js?v=10';
import {
    initUI, initParticles, animateParticles,
    showScreen, hideLevelComplete, hideGameOver,
    showPause, hidePause, showMessage, showSimulatedAd,
    playSound
} from './ui.js?v=10';

// ---------- STATE ----------
let sceneData = null;
let restaurantData = null;
let game = null;
let clock = null;
let raycaster = null;
let mouse = null;
let currentScreen = 'menu'; // menu, game

// ---------- SKIN DATA ----------
const SKIN_DATA = {
    chef:       { emoji: '🧑‍🍳', name: 'Gato Chef', desc: 'Chapéu de chef e lenço verde' },
    astronauta: { emoji: '🧑‍🚀', name: 'Gato Astronauta', desc: 'Capacete espacial de vidro neon' },
    ouro:       { emoji: '👑', name: 'Gato de Ouro', desc: 'Corpo dourado e coroa imperial' },
};

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
                document.getElementById('btn-ad-double').style.display = 'none'; // Hide button after using
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
                game.state.timeLeft += 30; // Matches button text (+30s)
                game.state.satisfaction = 100; // Restore satisfaction so game doesn't immediately end
                game.state.running = true;
                hideGameOver();
                document.getElementById('game-over').classList.add('hidden');
                document.getElementById('btn-ad-revive').style.display = 'none'; // Can only revive once
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
        document.getElementById('shop-gems-balance').textContent = shopState.gems;
        updateShopButtons(money);
        updateSkinButtons();
        updateVIPButton();
        
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
    setupShopTabs();
    setupGachaSystem();
    setupIAPSystem();
    setupAdGemsButton();

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

// ==========================================
// SHOP TABS
// ==========================================
function setupShopTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Hide all sections
            document.querySelectorAll('.shop-section').forEach(s => s.classList.add('hidden'));
            // Activate clicked tab + show section
            tab.classList.add('active');
            const sectionId = tab.getAttribute('data-tab');
            const section = document.getElementById(sectionId);
            if (section) section.classList.remove('hidden');
        });
    });
}

// ==========================================
// UPGRADES TAB — Shop Buttons (existing logic)
// ==========================================
function updateShopButtons(money) {
    const prices = getShopPrices();

    // Update balance displays
    document.getElementById('shop-balance').textContent = money.toFixed(2);
    document.getElementById('shop-gems-balance').textContent = shopState.gems;

    const setupBtn = (id, price, isUnlocked, callback) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        if (isUnlocked) {
            btn.textContent = 'Comprado ✅';
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

// ==========================================
// SKINS TAB — Equip & Display
// ==========================================
function updateSkinButtons() {
    const skinItems = document.querySelectorAll('.skin-item');
    skinItems.forEach(item => {
        const skinId = item.getAttribute('data-skin');
        const btn = item.querySelector('.btn-equip');
        if (!btn) return;

        const isOwned = shopState.ownedSkins.includes(skinId);
        const isActive = shopState.activeSkin === skinId;

        // Remove all state classes
        btn.classList.remove('locked', 'btn-equip-active');

        if (isActive) {
            btn.textContent = 'Equipado ✅';
            btn.classList.add('btn-equip-active');
            btn.disabled = true;
            btn.onclick = null;
        } else if (isOwned) {
            btn.textContent = 'Equipar';
            btn.disabled = false;
            btn.onclick = () => equipSkin(skinId);
        } else {
            btn.textContent = 'Bloqueado 🔒';
            btn.classList.add('locked');
            btn.disabled = true;
            btn.onclick = null;
        }
    });
}

function equipSkin(skinId) {
    if (!shopState.ownedSkins.includes(skinId)) return;
    shopState.activeSkin = skinId;

    // Real-time 3D waiter model swap
    if (game && game.waiter) {
        const pos = game.waiter.position.clone();
        const rot = game.waiter.rotation.clone();
        game.scene.remove(game.waiter);
        game.waiter = createWaiterModel(skinId);
        game.waiter.position.copy(pos);
        game.waiter.rotation.copy(rot);
        game.scene.add(game.waiter);

        // Re-attach carried item if any
        if (game.waiterCarrying && game.waiterCarryingOrder) {
            const order = game.waiterCarryingOrder;
            const itemMesh = order.menuItem.station === 'bar'
                ? createDrinkModel(order.menuItem.id)
                : createPlateModel(order.menuItem.id);
            itemMesh.position.set(0, 0.3, 0.3);
            game.waiter.add(itemMesh);
            game.waiterCarrying = itemMesh;
        }
    }

    saveProgress(game ? game.state.money : loadProgress());
    updateSkinButtons();
    showMessage(`🐱 Skin "${SKIN_DATA[skinId]?.name || skinId}" equipada!`, 3000);
}

// ==========================================
// GACHA SYSTEM
// ==========================================
let gachaRolling = false;

function setupGachaSystem() {
    // Gacha with Gems (10 gems)
    document.getElementById('btn-gacha-gems').addEventListener('click', () => {
        if (gachaRolling) return;
        if (shopState.gems < 10) {
            showMessage('💎 Gemas insuficientes! Você precisa de 10 gemas.', 3000);
            return;
        }
        shopState.gems -= 10;
        if (game) game.state.gems = shopState.gems;
        document.getElementById('shop-gems-balance').textContent = shopState.gems;
        saveProgress(game ? game.state.money : loadProgress());
        rollGacha();
    });

    // Gacha with Ad (free spin)
    document.getElementById('btn-gacha-ad').addEventListener('click', () => {
        if (gachaRolling) return;
        showSimulatedAd(() => {
            rollGacha();
        });
    });

    // Close gacha overlay
    document.getElementById('btn-gacha-close').addEventListener('click', () => {
        document.getElementById('gacha-overlay').classList.add('hidden');
        updateSkinButtons();
        const money = game ? game.state.money : loadProgress();
        updateShopButtons(money);
    });
}

function rollGacha() {
    gachaRolling = true;

    // Show overlay
    const overlay = document.getElementById('gacha-overlay');
    overlay.classList.remove('hidden');

    // Reset animation states
    const capsule = overlay.querySelector('.gacha-reveal-capsule');
    const light = overlay.querySelector('.gacha-reveal-light');
    const card = overlay.querySelector('.gacha-reveal-card');
    const closeBtn = document.getElementById('btn-gacha-close');
    const dupBadge = document.getElementById('gacha-duplicate-badge');

    capsule.classList.remove('shake', 'open');
    light.classList.remove('active');
    card.classList.add('hidden');
    closeBtn.disabled = true;
    dupBadge.classList.add('hidden');

    // Phase 1: Shake capsule (1.5s)
    capsule.classList.add('shake');

    setTimeout(() => {
        // Phase 2: Open capsule
        capsule.classList.remove('shake');
        capsule.classList.add('open');
        light.classList.add('active');

        // Weighted RNG: Chef 45%, Astronauta 35%, Ouro 20%
        const roll = Math.random() * 100;
        let rolledSkin;
        if (roll < 45) rolledSkin = 'chef';
        else if (roll < 80) rolledSkin = 'astronauta';
        else rolledSkin = 'ouro';

        const skinInfo = SKIN_DATA[rolledSkin];

        // Update card display
        document.getElementById('gacha-card-emoji').textContent = skinInfo.emoji;
        document.getElementById('gacha-card-title').textContent = skinInfo.name;

        // Check for duplicate
        const isDuplicate = shopState.ownedSkins.includes(rolledSkin);
        if (isDuplicate) {
            document.getElementById('gacha-card-desc').textContent = 'Skin repetida! Você recebeu moedas como compensação.';
            dupBadge.textContent = 'Repetida: +R$ 100 🪙';
            dupBadge.classList.remove('hidden');
            // Add R$ 100 compensation
            if (game) {
                game.state.money += 100;
                game.levelMoney += 100;
            }
            saveProgress(game ? game.state.money : (loadProgress() + 100));
            playSound('money');
        } else {
            document.getElementById('gacha-card-desc').textContent = 'Sua nova skin foi desbloqueada! 🎉';
            shopState.ownedSkins.push(rolledSkin);
            saveProgress(game ? game.state.money : loadProgress());
            playSound('levelup');
        }

        // Phase 3: Show card (after 0.5s)
        setTimeout(() => {
            card.classList.remove('hidden');
            closeBtn.disabled = false;
            gachaRolling = false;
        }, 500);

    }, 1500);
}

// ==========================================
// IN-APP PURCHASE (IAP) SIMULATION
// ==========================================
let iapPending = null; // { type, name, price, gems, vip }

function setupIAPSystem() {
    // Buy 30 Gems
    document.getElementById('btn-buy-gems-30').addEventListener('click', () => {
        openIAP({ type: 'gems', name: '💎 30 Gemas Estelares', price: 'R$ 4,90', gems: 30, vip: false });
    });

    // Buy 80 Gems
    document.getElementById('btn-buy-gems-80').addEventListener('click', () => {
        openIAP({ type: 'gems', name: '💎 80 Gemas Estelares', price: 'R$ 9,90', gems: 80, vip: false });
    });

    // Buy VIP
    document.getElementById('btn-buy-vip').addEventListener('click', () => {
        if (shopState.vipActive) {
            showMessage('👑 Você já é VIP! Aproveite o bônus de 1.5x moedas.', 3000);
            return;
        }
        // Can buy with 30 gems OR money
        if (shopState.gems >= 30) {
            openIAP({ type: 'vip-gems', name: '👑 Clube VIP Permanente', price: '30 Gemas', gems: -30, vip: true });
        } else {
            openIAP({ type: 'vip-money', name: '👑 Clube VIP Permanente', price: 'R$ 19,90', gems: 0, vip: true });
        }
    });

    // IAP Confirm
    document.getElementById('btn-iap-confirm').addEventListener('click', () => {
        processIAP();
    });

    // IAP Cancel
    document.getElementById('btn-iap-cancel').addEventListener('click', () => {
        document.getElementById('iap-overlay').classList.add('hidden');
        iapPending = null;
    });
}

function openIAP(config) {
    iapPending = config;

    // Setup dialog
    document.getElementById('iap-item-name').textContent = config.name;
    document.getElementById('iap-item-price').textContent = config.price;
    document.getElementById('iap-status-text').textContent = 'Toque abaixo para confirmar a transação segura.';

    // Reset states
    document.getElementById('iap-spinner').classList.add('hidden');
    document.getElementById('iap-success-icon').classList.add('hidden');
    document.getElementById('btn-iap-confirm').classList.remove('hidden');
    document.getElementById('btn-iap-cancel').classList.remove('hidden');
    document.getElementById('btn-iap-confirm').disabled = false;

    // Show dialog
    document.getElementById('iap-overlay').classList.remove('hidden');
}

function processIAP() {
    if (!iapPending) return;

    const spinner = document.getElementById('iap-spinner');
    const successIcon = document.getElementById('iap-success-icon');
    const statusText = document.getElementById('iap-status-text');
    const confirmBtn = document.getElementById('btn-iap-confirm');
    const cancelBtn = document.getElementById('btn-iap-cancel');

    // Phase 1: Show processing
    confirmBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    spinner.classList.remove('hidden');
    statusText.textContent = 'Processando pagamento seguro...';

    // Phase 2: Success after 2 seconds
    setTimeout(() => {
        spinner.classList.add('hidden');
        successIcon.classList.remove('hidden');
        statusText.textContent = 'Pagamento confirmado! Aproveite! ✨';

        // Grant rewards
        if (iapPending.gems > 0) {
            shopState.gems += iapPending.gems;
        } else if (iapPending.gems < 0) {
            // VIP bought with gems
            shopState.gems += iapPending.gems; // subtract
        }

        if (iapPending.vip) {
            shopState.vipActive = true;
        }

        if (game) {
            game.state.gems = shopState.gems;
        }

        saveProgress(game ? game.state.money : loadProgress());
        playSound('money');

        // Phase 3: Close after 1.5 seconds
        setTimeout(() => {
            document.getElementById('iap-overlay').classList.add('hidden');
            // Refresh all shop UI
            const money = game ? game.state.money : loadProgress();
            document.getElementById('shop-balance').textContent = money.toFixed(2);
            document.getElementById('shop-gems-balance').textContent = shopState.gems;
            updateShopButtons(money);
            updateVIPButton();
            iapPending = null;
            showMessage('🎉 Compra realizada com sucesso!', 3000);
        }, 1500);

    }, 2000);
}

function updateVIPButton() {
    const btn = document.getElementById('btn-buy-vip');
    if (!btn) return;
    if (shopState.vipActive) {
        btn.textContent = 'VIP Ativo! 👑';
        btn.disabled = true;
    } else if (shopState.gems >= 30) {
        btn.textContent = 'Assinar (30 Gemas)';
        btn.disabled = false;
    } else {
        btn.textContent = 'Assinar (30 Gemas ou R$ 19,90)';
        btn.disabled = false;
    }
}

// ==========================================
// AD-GEMS REWARD BUTTON
// ==========================================
function setupAdGemsButton() {
    document.getElementById('btn-ad-gem').addEventListener('click', () => {
        showSimulatedAd(() => {
            shopState.gems += 5;
            if (game) game.state.gems = shopState.gems;
            document.getElementById('shop-gems-balance').textContent = shopState.gems;
            saveProgress(game ? game.state.money : loadProgress());
            updateVIPButton();
            playSound('money');
            showMessage('💎 +5 Gemas Estelares! Obrigado por assistir!', 3000);
        });
    });
}

// ==========================================
// GAME START / BACK
// ==========================================
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
