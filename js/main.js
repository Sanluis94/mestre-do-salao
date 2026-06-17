// ==========================================
// main.js — Entry Point, Game Loop, Events
// Full Monetization: Tabs, Gacha, IAP, Skins, VIP (with Defensive programming checks)
// ==========================================
import * as THREE from 'three';
import { initScene, createRestaurant, createWaiterModel, createPlateModel, createDrinkModel, updateCameraShake } from './scene.js?v=12';
import { Game, shopState, saveProgress, getShopPrices, loadProgress } from './gameplay.js?v=12';
import {
    initUI, initParticles, animateParticles,
    showScreen, hideLevelComplete, hideGameOver,
    showPause, hidePause, showMessage, showSimulatedAd,
    playSound
} from './ui.js?v=12';
import { publisherSDK } from './publisher.js?v=12';

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

// ---------- HAPTIC FEEDBACK ----------
function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) { /* not supported */ }
}

// ---------- INITIALIZATION ----------
function init() {
    // Animate loading bar while fonts/Three.js load
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) {
        let progress = 0;
        const interval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 15, 90);
            loadingBar.style.width = progress + '%';
        }, 200);
        // Hide loading screen when page is fully loaded
        const hideLoading = () => {
            clearInterval(interval);
            if (loadingBar) loadingBar.style.width = '100%';
            setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
            }, 400);
        };
        if (document.readyState === 'complete') {
            hideLoading();
        } else {
            window.addEventListener('load', hideLoading, { once: true });
            // Fallback: hide after 4s regardless
            setTimeout(hideLoading, 4000);
        }
    } else if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }

    initUI();

    // Expose globals for publisher simulator fallback
    window.showSimulatedAd = showSimulatedAd;
    window.openIAP = openIAP;

    // Initialize Publisher SDK
    publisherSDK.init(() => {
        console.log('Publisher SDK initialized.');
    });

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
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) btnPlay.addEventListener('click', startGame);
    
    const btnTutorial = document.getElementById('btn-tutorial');
    if (btnTutorial) btnTutorial.addEventListener('click', () => showScreen('tutorial-screen'));
    
    const btnCredits = document.getElementById('btn-credits');
    if (btnCredits) btnCredits.addEventListener('click', () => showScreen('credits-screen'));
    
    const btnBackTutorial = document.getElementById('btn-back-tutorial');
    if (btnBackTutorial) btnBackTutorial.addEventListener('click', () => showScreen('menu-screen'));
    
    const btnBackCredits = document.getElementById('btn-back-credits');
    if (btnBackCredits) btnBackCredits.addEventListener('click', () => showScreen('menu-screen'));

    // Game overlays
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
        btnNextLevel.addEventListener('click', () => {
            hideLevelComplete();
            game.nextLevel();
        });
    }
    
    const btnAdDouble = document.getElementById('btn-ad-double');
    if (btnAdDouble) {
        btnAdDouble.addEventListener('click', (e) => {
            publisherSDK.showRewardAd(() => {
                if (game) {
                    const earned = game.levelMoney;
                    game.state.money += earned; 
                    saveProgress(game.state.money);
                    game.levelMoney *= 2;
                    const resMoney = document.getElementById('result-money');
                    if (resMoney) resMoney.textContent = `R$ ${game.levelMoney.toFixed(2)}`;
                    btnAdDouble.style.display = 'none';
                }
            });
        });
    }

    const btnBackMenu = document.getElementById('btn-back-menu');
    if (btnBackMenu) {
        btnBackMenu.addEventListener('click', () => {
            hideLevelComplete();
            backToMenu();
        });
    }

    const btnAdRevive = document.getElementById('btn-ad-revive');
    if (btnAdRevive) {
        btnAdRevive.addEventListener('click', (e) => {
            publisherSDK.showRewardAd(() => {
                if (game) {
                    game.state.timeLeft += 30;
                    game.state.satisfaction = 100;
                    game.state.running = true;
                    hideGameOver();
                    const goOverlay = document.getElementById('game-over');
                    if (goOverlay) goOverlay.classList.add('hidden');
                    btnAdRevive.style.display = 'none';
                }
            });
        });
    }

    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            hideGameOver();
            vibrate([80, 40, 80]);
            if (game) game.restart();
        });
    }

    // --- SHOP LOGIC ---
    const openShop = () => {
        if (currentScreen === 'game') {
            const lcOverlay = document.getElementById('level-complete');
            if (lcOverlay) lcOverlay.classList.add('hidden');
        }
        const money = game ? game.state.money : loadProgress();
        const shopBal = document.getElementById('shop-balance');
        if (shopBal) shopBal.textContent = money.toFixed(2);
        const shopGemsBal = document.getElementById('shop-gems-balance');
        if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
        
        updateShopButtons(money);
        updateSkinButtons();
        updateVIPButton();
        
        const shopOverlay = document.getElementById('shop-screen');
        if (shopOverlay) shopOverlay.classList.remove('hidden');
    };
    
    const btnShop = document.getElementById('btn-shop');
    if (btnShop) btnShop.addEventListener('click', openShop);
    
    const btnShopLvl = document.getElementById('btn-shop-level');
    if (btnShopLvl) btnShopLvl.addEventListener('click', openShop);
    
    const btnCloseShop = document.getElementById('btn-close-shop');
    if (btnCloseShop) {
        btnCloseShop.addEventListener('click', () => {
            const shopOverlay = document.getElementById('shop-screen');
            if (shopOverlay) shopOverlay.classList.add('hidden');
            
            if (currentScreen === 'game') {
                const lcOverlay = document.getElementById('level-complete');
                if (lcOverlay) lcOverlay.classList.remove('hidden');
            }
        });
    }

    setupShopButtons();
    setupShopTabs();
    setupGachaSystem();
    setupIAPSystem();
    setupAdGemsButton();

    const btnGoMenu = document.getElementById('btn-go-menu');
    if (btnGoMenu) {
        btnGoMenu.addEventListener('click', () => {
            hideGameOver();
            backToMenu();
        });
    }
    
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.addEventListener('click', () => {
            if (game) {
                game.togglePause();
                if (game.state.paused) {
                    showPause();
                } else {
                    hidePause();
                }
            }
        });
    }
    
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
        btnResume.addEventListener('click', () => {
            if (game) {
                game.togglePause();
                hidePause();
            }
        });
    }
    
    const btnPauseMenu = document.getElementById('btn-pause-menu');
    if (btnPauseMenu) {
        btnPauseMenu.addEventListener('click', () => {
            hidePause();
            if (game) game.state.running = false;
            backToMenu();
        });
    }
}

// ==========================================
// SHOP TABS
// ==========================================
function setupShopTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    if (tabs.length === 0) return;
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.shop-section').forEach(s => s.classList.add('hidden'));
            tab.classList.add('active');
            const sectionId = tab.getAttribute('data-tab');
            const section = document.getElementById(sectionId);
            if (section) section.classList.remove('hidden');
        });
    });
}

// ==========================================
// UPGRADES TAB — Shop Buttons
// ==========================================
function updateShopButtons(money) {
    const prices = getShopPrices();

    const shopBal = document.getElementById('shop-balance');
    if (shopBal) shopBal.textContent = money.toFixed(2);
    const shopGemsBal = document.getElementById('shop-gems-balance');
    if (shopGemsBal) shopGemsBal.textContent = shopState.gems;

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
                    money -= price;
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
    if (skinItems.length === 0) return;
    skinItems.forEach(item => {
        const skinId = item.getAttribute('data-skin');
        const btn = item.querySelector('.btn-equip');
        if (!btn) return;

        const isOwned = shopState.ownedSkins.includes(skinId);
        const isActive = shopState.activeSkin === skinId;

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
    const btnGems = document.getElementById('btn-gacha-gems');
    if (btnGems) {
        btnGems.addEventListener('click', () => {
            if (gachaRolling) return;
            if (shopState.gems < 10) {
                showMessage('💎 Gemas insuficientes! Você precisa de 10 gemas.', 3000);
                return;
            }
            shopState.gems -= 10;
            if (game) game.state.gems = shopState.gems;
            const shopGemsBal = document.getElementById('shop-gems-balance');
            if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
            saveProgress(game ? game.state.money : loadProgress());
            rollGacha();
        });
    }

    const btnAd = document.getElementById('btn-gacha-ad');
    if (btnAd) {
        btnAd.addEventListener('click', () => {
            if (gachaRolling) return;
            publisherSDK.showRewardAd(() => {
                rollGacha();
            });
        });
    }

    const btnClose = document.getElementById('btn-gacha-close');
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            const overlay = document.getElementById('gacha-overlay');
            if (overlay) overlay.classList.add('hidden');
            updateSkinButtons();
            const money = game ? game.state.money : loadProgress();
            updateShopButtons(money);
        });
    }
}

function rollGacha() {
    gachaRolling = true;

    const overlay = document.getElementById('gacha-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const capsule = overlay.querySelector('.gacha-reveal-capsule');
    const light = overlay.querySelector('.gacha-reveal-light');
    const card = overlay.querySelector('.gacha-reveal-card');
    const closeBtn = document.getElementById('btn-gacha-close');
    const dupBadge = document.getElementById('gacha-duplicate-badge');

    if (capsule) capsule.classList.remove('shake', 'open');
    if (light) light.classList.remove('active');
    if (card) card.classList.add('hidden');
    if (closeBtn) closeBtn.disabled = true;
    if (dupBadge) dupBadge.classList.add('hidden');

    if (capsule) capsule.classList.add('shake');

    setTimeout(() => {
        if (capsule) capsule.classList.remove('shake');
        if (capsule) capsule.classList.add('open');
        if (light) light.classList.add('active');

        const roll = Math.random() * 100;
        let rolledSkin;
        if (roll < 45) rolledSkin = 'chef';
        else if (roll < 80) rolledSkin = 'astronauta';
        else rolledSkin = 'ouro';

        const skinInfo = SKIN_DATA[rolledSkin];

        const cardEmoji = document.getElementById('gacha-card-emoji');
        if (cardEmoji) cardEmoji.textContent = skinInfo.emoji;
        const cardTitle = document.getElementById('gacha-card-title');
        if (cardTitle) cardTitle.textContent = skinInfo.name;

        const isDuplicate = shopState.ownedSkins.includes(rolledSkin);
        const cardDesc = document.getElementById('gacha-card-desc');
        if (isDuplicate) {
            if (cardDesc) cardDesc.textContent = 'Skin repetida! Você recebeu moedas como compensação.';
            if (dupBadge) {
                dupBadge.textContent = 'Repetida: +R$ 100 🪙';
                dupBadge.classList.remove('hidden');
            }
            if (game) {
                game.state.money += 100;
                game.levelMoney += 100;
            }
            saveProgress(game ? game.state.money : (loadProgress() + 100));
            playSound('money');
        } else {
            if (cardDesc) cardDesc.textContent = 'Sua nova skin foi desbloqueada! 🎉';
            shopState.ownedSkins.push(rolledSkin);
            saveProgress(game ? game.state.money : loadProgress());
            playSound('levelup');
        }

        setTimeout(() => {
            if (card) card.classList.remove('hidden');
            if (closeBtn) closeBtn.disabled = false;
            gachaRolling = false;
        }, 500);

    }, 1500);
}

// ==========================================
// IN-APP PURCHASE (IAP) SIMULATION
// ==========================================
let iapPending = null;
let iapCallback = null;

function setupIAPSystem() {
    const btnGems30 = document.getElementById('btn-buy-gems-30');
    if (btnGems30) {
        btnGems30.addEventListener('click', () => {
            publisherSDK.purchaseGems('gems_30', 'R$ 4,90', 30, () => {
                const shopGemsBal = document.getElementById('shop-gems-balance');
                if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
                updateVIPButton();
            });
        });
    }

    const btnGems80 = document.getElementById('btn-buy-gems-80');
    if (btnGems80) {
        btnGems80.addEventListener('click', () => {
            publisherSDK.purchaseGems('gems_80', 'R$ 9,90', 80, () => {
                const shopGemsBal = document.getElementById('shop-gems-balance');
                if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
                updateVIPButton();
            });
        });
    }

    const btnVip = document.getElementById('btn-buy-vip');
    if (btnVip) {
        btnVip.addEventListener('click', () => {
            if (shopState.vipActive) {
                showMessage('👑 Você já é VIP! Aproveite o bônus de 1.5x moedas.', 3000);
                return;
            }
            if (shopState.gems >= 30) {
                openIAP({ type: 'vip-gems', name: '👑 Clube VIP Permanente', price: '30 Gemas', gems: -30, vip: true });
            } else {
                publisherSDK.purchaseVIP(() => {
                    const shopGemsBal = document.getElementById('shop-gems-balance');
                    if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
                    updateVIPButton();
                });
            }
        });
    }

    const btnConfirm = document.getElementById('btn-iap-confirm');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            processIAP();
        });
    }

    const btnCancel = document.getElementById('btn-iap-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            const overlay = document.getElementById('iap-overlay');
            if (overlay) overlay.classList.add('hidden');
            iapPending = null;
        });
    }
}

function openIAP(config, callback) {
    iapPending = config;
    iapCallback = callback;

    const itemName = document.getElementById('iap-item-name');
    if (itemName) itemName.textContent = config.name;
    const itemPrice = document.getElementById('iap-item-price');
    if (itemPrice) itemPrice.textContent = config.price;
    const statusText = document.getElementById('iap-status-text');
    if (statusText) statusText.textContent = 'Toque abaixo para confirmar a transação segura.';

    const spinner = document.getElementById('iap-spinner');
    if (spinner) spinner.classList.add('hidden');
    const successIcon = document.getElementById('iap-success-icon');
    if (successIcon) successIcon.classList.add('hidden');
    
    const confirmBtn = document.getElementById('btn-iap-confirm');
    if (confirmBtn) {
        confirmBtn.classList.remove('hidden');
        confirmBtn.disabled = false;
    }
    const cancelBtn = document.getElementById('btn-iap-cancel');
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    const overlay = document.getElementById('iap-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function processIAP() {
    if (!iapPending) return;

    const spinner = document.getElementById('iap-spinner');
    const successIcon = document.getElementById('iap-success-icon');
    const statusText = document.getElementById('iap-status-text');
    const confirmBtn = document.getElementById('btn-iap-confirm');
    const cancelBtn = document.getElementById('btn-iap-cancel');

    if (confirmBtn) confirmBtn.classList.add('hidden');
    if (cancelBtn) cancelBtn.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
    if (statusText) statusText.textContent = 'Processando pagamento seguro...';

    setTimeout(() => {
        if (spinner) spinner.classList.add('hidden');
        if (successIcon) successIcon.classList.remove('hidden');
        if (statusText) statusText.textContent = 'Pagamento confirmado! Aproveite! ✨';

        if (iapPending.gems > 0) {
            shopState.gems += iapPending.gems;
        } else if (iapPending.gems < 0) {
            shopState.gems += iapPending.gems;
        }

        if (iapPending.vip) {
            shopState.vipActive = true;
        }

        if (game) {
            game.state.gems = shopState.gems;
        }

        saveProgress(game ? game.state.money : loadProgress());
        playSound('money');

        setTimeout(() => {
            const overlay = document.getElementById('iap-overlay');
            if (overlay) overlay.classList.add('hidden');
            
            const money = game ? game.state.money : loadProgress();
            const shopBal = document.getElementById('shop-balance');
            if (shopBal) shopBal.textContent = money.toFixed(2);
            const shopGemsBal = document.getElementById('shop-gems-balance');
            if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
            
            updateShopButtons(money);
            updateVIPButton();
            if (iapCallback) {
                iapCallback();
                iapCallback = null;
            }
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
    const btn = document.getElementById('btn-ad-gem');
    if (!btn) return;
    btn.addEventListener('click', () => {
        publisherSDK.showRewardAd(() => {
            shopState.gems += 5;
            if (game) game.state.gems = shopState.gems;
            const shopGemsBal = document.getElementById('shop-gems-balance');
            if (shopGemsBal) shopGemsBal.textContent = shopState.gems;
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
    publisherSDK.gameplayStart();

    gameLoop();
}

// ---------- BACK TO MENU ----------
function backToMenu() {
    currentScreen = 'menu';
    if (game) {
        game.clearAll();
        game.state.running = false;
    }
    publisherSDK.gameplayStop();
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
        updateCameraShake(dt, sceneData.camera, sceneData.controls);
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
