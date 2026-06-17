// ==========================================
// gameplay.js — Game State, Mechanics, Characters
// ==========================================
import * as THREE from 'three';
import {
    createWaiterModel, createCustomerModel, createPlateModel,
    createDirtyTableIndicator, createPatienceBar, updatePatienceBar,
    updateKitchenReady, updateBarReady, createDrinkModel,
    triggerScreenShake, updateModelAnimations, getSteamSources
} from './scene.js?v=12';
import {
    updateHUD, updateOrders, showMessage, showLevelComplete, showGameOver,
    showFloatingMoney, updateCombo, updateCarrying, playSound
} from './ui.js?v=12';

// ---------- FOOD MENU (prepared in Kitchen) ----------
const FOOD_MENU = [
    { id: 'prato_dia', name: 'Ração Premium', emoji: '🥣', price: 15, cookTime: 6, station: 'kitchen' },
    { id: 'massa', name: 'Lasanha de Atum', emoji: '🐟', price: 22, cookTime: 8, station: 'kitchen' },
    { id: 'file', name: 'Sashimi Fresco', emoji: '🍣', price: 35, cookTime: 11, station: 'kitchen' },
    { id: 'sobremesa', name: 'Sachê de Carne', emoji: '🥫', price: 12, cookTime: 4, station: 'kitchen' },
    { id: 'salada', name: 'Grama de Gato', emoji: '🌿', price: 18, cookTime: 5, station: 'kitchen' },
];

// ---------- DRINKS MENU (prepared at the Bar) ----------
const DRINKS_MENU = [
    { id: 'suco', name: 'Leite Fresco', emoji: '🥛', price: 8, cookTime: 3, station: 'bar' },
    { id: 'refrigerante', name: 'Caldo de Frango', emoji: '🥣', price: 6, cookTime: 2, station: 'bar' },
    { id: 'cerveja', name: 'Catnip Frio', emoji: '🍃', price: 14, cookTime: 4, station: 'bar' },
    { id: 'vinho', name: 'Água da Fonte', emoji: '⛲', price: 20, cookTime: 5, station: 'bar' },
    { id: 'cocktail', name: 'Vitamina Felina', emoji: '🍹', price: 25, cookTime: 6, station: 'bar' },
    { id: 'agua', name: 'Água Pura', emoji: '💧', price: 4, cookTime: 1, station: 'bar' },
];

// ---------- SHOP & PROGRESSION STATE ----------
export const shopState = {
    tablesUnlocked: 3,
    waiterSpeedLevel: 1, // 1 to 5
    foodUnlocked: ['prato_dia', 'sobremesa'],
    drinksUnlocked: ['agua', 'suco'],
    gems: 0,
    activeSkin: 'default',
    ownedSkins: ['default'],
    vipActive: false,
};

// ---------- HIGH SCORE ----------
export let highScore = 0;

export function saveHighScore(score) {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('catCafeHighScore', String(score));
        return true; // new record!
    }
    return false;
}

export function loadHighScore() {
    const saved = localStorage.getItem('catCafeHighScore');
    highScore = saved ? parseInt(saved, 10) : 0;
    return highScore;
}

export function saveProgress(money) {
    localStorage.setItem('catCafeSave', JSON.stringify({ shopState, money }));
}

export function loadProgress() {
    const data = localStorage.getItem('catCafeSave');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (parsed.shopState) {
                // Merge carefully to ensure default values exist for older saves
                Object.assign(shopState, parsed.shopState);
                if (shopState.gems === undefined) shopState.gems = 0;
                if (!shopState.activeSkin) shopState.activeSkin = 'default';
                if (!shopState.ownedSkins) shopState.ownedSkins = ['default'];
                if (shopState.vipActive === undefined) shopState.vipActive = false;
            }
            return parsed.money || 0;
        } catch (e) {
            console.error("Save data corrupted", e);
        }
    }
    return 0;
}

export function getShopPrices() {
    return {
        table: 150 + (shopState.tablesUnlocked - 3) * 100, // 150, 250, 350, 450, 550
        speed: 200 * shopState.waiterSpeedLevel, // 200, 400, 600, 800
        food: { 'massa': 120, 'salada': 150, 'file': 300 },
        drinks: { 'refrigerante': 80, 'cerveja': 150, 'vinho': 250, 'cocktail': 400 }
    };
}

// ---------- LEVEL CONFIG ----------
const LEVELS = [
    { totalCustomers: 5,  timeLimit: 120, patience: 60, spawnInterval: 12 },
    { totalCustomers: 7,  timeLimit: 130, patience: 50, spawnInterval: 10 },
    { totalCustomers: 10, timeLimit: 140, patience: 45, spawnInterval: 8 },
    { totalCustomers: 12, timeLimit: 150, patience: 40, spawnInterval: 7 },
    { totalCustomers: 15, timeLimit: 160, patience: 35, spawnInterval: 6 },
    { totalCustomers: 18, timeLimit: 170, patience: 30, spawnInterval: 5 },
];

// ---------- PATHFINDING (A* on navigation grid) ----------
const NAV_CELL = 0.5;
const NAV_MIN_X = -11;
const NAV_MIN_Z = -10;
const NAV_MAX_X = 10;
const NAV_MAX_Z = 10;
const NAV_W = Math.ceil((NAV_MAX_X - NAV_MIN_X) / NAV_CELL);
const NAV_H = Math.ceil((NAV_MAX_Z - NAV_MIN_Z) / NAV_CELL);

// Table obstacle data (position + block radius + approach point)
// Approach positions are just outside the collision zone so characters can interact
const TABLE_OBSTACLES = [
    { x: -4, z: -3, r: 1.6, apX: -1.8, apZ: -1.5 },   // 0: round — SE
    { x: 1,  z: 1,  r: 1.8, apX: 1.0,  apZ: -1.5 },   // 1: square — S
    { x: -3, z: 4,  r: 1.8, apX: -0.4, apZ: 3.5 },    // 2: square — E
    { x: 4,  z: -4, r: 1.6, apX: 1.6,  apZ: -3.2 },   // 3: round — W
    { x: 4,  z: 3,  r: 1.8, apX: 2.0,  apZ: 2.5 },    // 4: square — SW
    // Progression tables:
    { x: -6, z: 0,  r: 1.6, apX: -3.5, apZ: 0.0 },    // 5: round — E
    { x: -1, z: -4.5, r: 1.8, apX: -1.0, apZ: -2.0 },   // 6: square — S
    { x: 2,  z: 6,  r: 1.8, apX: 2.0,  apZ: 3.5 },    // 7: square — N
];
window.ACTIVE_TABLES = shopState.tablesUnlocked;

// Character collision radius used for runtime enforcement
const CHARACTER_RADIUS = 0.3;

// Get the approach position for a table (where waiter/customer walk to)
function getTableApproach(tableIndex) {
    const obs = TABLE_OBSTACLES[tableIndex];
    return new THREE.Vector3(obs.apX, 0, obs.apZ);
}

function worldToGrid(wx, wz) {
    return {
        x: Math.floor((wx - NAV_MIN_X) / NAV_CELL),
        z: Math.floor((wz - NAV_MIN_Z) / NAV_CELL),
    };
}

function gridToWorld(gx, gz) {
    return {
        x: NAV_MIN_X + gx * NAV_CELL + NAV_CELL / 2,
        z: NAV_MIN_Z + gz * NAV_CELL + NAV_CELL / 2,
    };
}

function isCellWalkable(x, z) {
    const halfRoom = 9;
    const wallM = 0.5;

    // Outside grid bounds
    if (x < NAV_MIN_X || x > NAV_MAX_X || z < NAV_MIN_Z || z > NAV_MAX_Z) return false;

    // Back wall
    if (z <= -halfRoom + wallM) {
        // Allow kitchen approach strip (z between -8.5 and -8.0, within kitchen x range)
        if (x >= -1.5 && x <= 5.5 && z >= -halfRoom + 0.2) return true;
        return false;
    }

    // Right wall
    if (x >= halfRoom - wallM) return false;

    // Left wall (with door opening at z 1.5 to 4.5)
    if (x <= -halfRoom + wallM) {
        if (z >= 1.0 && z <= 5.0) return true; // door passage
        return false;
    }

    // Kitchen counter (block area behind counter)
    if (x >= -1.8 && x <= 5.8 && z <= -halfRoom + 2.2 && z > -halfRoom + wallM) return false;

    // Bar counter (right wall, x=7.8, z from -2 to 4)
    const barX = halfRoom - 1.2; // 7.8
    if (x >= barX - 0.8 && x <= halfRoom && z >= -2.5 && z <= 4.5) return false;

    // Tables (circular obstacles)
    for (let i = 0; i < window.ACTIVE_TABLES; i++) {
        const t = TABLE_OBSTACLES[i];
        const dx = x - t.x;
        const dz = z - t.z;
        if (dx * dx + dz * dz < t.r * t.r) return false;
    }

    return true;
}

function buildNavGrid() {
    const grid = new Uint8Array(NAV_W * NAV_H);
    for (let gx = 0; gx < NAV_W; gx++) {
        for (let gz = 0; gz < NAV_H; gz++) {
            const w = gridToWorld(gx, gz);
            if (!isCellWalkable(w.x, w.z)) {
                grid[gz * NAV_W + gx] = 1; // blocked
            }
        }
    }
    return grid;
}

function nearestWalkableCell(grid, gx, gz) {
    // BFS to find nearest walkable cell
    if (gx >= 0 && gx < NAV_W && gz >= 0 && gz < NAV_H && !grid[gz * NAV_W + gx]) {
        return { x: gx, z: gz };
    }
    const visited = new Set();
    const queue = [{ x: gx, z: gz }];
    visited.add(`${gx},${gz}`);
    while (queue.length > 0) {
        const cur = queue.shift();
        for (const [dx, dz] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
            const nx = cur.x + dx, nz = cur.z + dz;
            const key = `${nx},${nz}`;
            if (visited.has(key)) continue;
            visited.add(key);
            if (nx < 0 || nx >= NAV_W || nz < 0 || nz >= NAV_H) continue;
            if (!grid[nz * NAV_W + nx]) return { x: nx, z: nz };
            queue.push({ x: nx, z: nz });
        }
    }
    return null;
}

function astarPath(grid, sx, sz, ex, ez) {
    // Clamp to grid
    sx = Math.max(0, Math.min(NAV_W - 1, sx));
    sz = Math.max(0, Math.min(NAV_H - 1, sz));
    ex = Math.max(0, Math.min(NAV_W - 1, ex));
    ez = Math.max(0, Math.min(NAV_H - 1, ez));

    // If start blocked, snap to nearest walkable
    if (grid[sz * NAV_W + sx]) {
        const n = nearestWalkableCell(grid, sx, sz);
        if (n) { sx = n.x; sz = n.z; } else return null;
    }
    // If end blocked, snap to nearest walkable
    if (grid[ez * NAV_W + ex]) {
        const n = nearestWalkableCell(grid, ex, ez);
        if (n) { ex = n.x; ez = n.z; } else return null;
    }

    if (sx === ex && sz === ez) return [{ x: sx, z: sz }];

    const heuristic = (ax, az) => Math.abs(ax - ex) + Math.abs(az - ez);
    const key = (x, z) => z * NAV_W + x;

    const openSet = new Map(); // key -> { x, z, g, f }
    const cameFrom = new Map();
    const gScore = new Map();

    const startKey = key(sx, sz);
    gScore.set(startKey, 0);
    openSet.set(startKey, { x: sx, z: sz, g: 0, f: heuristic(sx, sz) });

    const dirs = [[-1,0,1],[1,0,1],[0,-1,1],[0,1,1],[-1,-1,1.41],[-1,1,1.41],[1,-1,1.41],[1,1,1.41]];
    let iterations = 0;
    const maxIter = 3000;

    while (openSet.size > 0 && iterations < maxIter) {
        iterations++;

        // Find node with lowest f
        let best = null;
        for (const [k, node] of openSet) {
            if (!best || node.f < best.f) best = node;
        }

        if (best.x === ex && best.z === ez) {
            // Reconstruct path
            const path = [];
            let ck = key(ex, ez);
            while (ck !== undefined) {
                const cx = ck % NAV_W;
                const cz = Math.floor(ck / NAV_W);
                path.unshift({ x: cx, z: cz });
                ck = cameFrom.get(ck);
            }
            return path;
        }

        const bestKey = key(best.x, best.z);
        openSet.delete(bestKey);

        for (const [dx, dz, cost] of dirs) {
            const nx = best.x + dx;
            const nz = best.z + dz;
            if (nx < 0 || nx >= NAV_W || nz < 0 || nz >= NAV_H) continue;
            if (grid[nz * NAV_W + nx]) continue;

            // For diagonal movement, check that both adjacent cells are walkable
            if (dx !== 0 && dz !== 0) {
                if (grid[best.z * NAV_W + nx] || grid[nz * NAV_W + best.x]) continue;
            }

            const nk = key(nx, nz);
            const tentG = best.g + cost;

            if (!gScore.has(nk) || tentG < gScore.get(nk)) {
                gScore.set(nk, tentG);
                cameFrom.set(nk, bestKey);
                const f = tentG + heuristic(nx, nz);
                openSet.set(nk, { x: nx, z: nz, g: tentG, f });
            }
        }
    }

    return null; // no path found
}

function findWorldPath(grid, startPos, endPos) {
    const sg = worldToGrid(startPos.x, startPos.z);
    const eg = worldToGrid(endPos.x, endPos.z);

    const gridPath = astarPath(grid, sg.x, sg.z, eg.x, eg.z);
    if (!gridPath || gridPath.length === 0) {
        return [endPos.clone()]; // fallback: straight line
    }

    // Convert grid path to world waypoints
    let waypoints = gridPath.map(p => {
        const w = gridToWorld(p.x, p.z);
        return new THREE.Vector3(w.x, 0, w.z);
    });

    // Path smoothing: remove redundant waypoints
    waypoints = smoothPath(waypoints, grid);

    // Add the exact end position as final waypoint for precision
    waypoints.push(endPos.clone());
    waypoints[waypoints.length - 1].y = 0;

    return waypoints;
}

function smoothPath(waypoints, grid) {
    if (waypoints.length <= 2) return waypoints;

    const smoothed = [waypoints[0]];
    let current = 0;

    while (current < waypoints.length - 1) {
        // Try to skip ahead to the farthest visible waypoint
        let farthest = current + 1;
        for (let i = waypoints.length - 1; i > current + 1; i--) {
            if (hasLineOfSight(waypoints[current], waypoints[i], grid)) {
                farthest = i;
                break;
            }
        }
        smoothed.push(waypoints[farthest]);
        current = farthest;
    }

    return smoothed;
}

function hasLineOfSight(a, b, grid) {
    const dist = a.distanceTo(b);
    const steps = Math.ceil(dist / (NAV_CELL * 0.4));
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = a.x + (b.x - a.x) * t;
        const z = a.z + (b.z - a.z) * t;

        // Check grid cell
        const g = worldToGrid(x, z);
        if (g.x < 0 || g.x >= NAV_W || g.z < 0 || g.z >= NAV_H) return false;
        if (grid[g.z * NAV_W + g.x]) return false;

        // Also check direct distance to table obstacles (prevents cutting corners)
        for (const t_obs of TABLE_OBSTACLES) {
            const dx = x - t_obs.x;
            const dz = z - t_obs.z;
            if (dx * dx + dz * dz < (t_obs.r + CHARACTER_RADIUS) * (t_obs.r + CHARACTER_RADIUS)) {
                return false;
            }
        }
    }
    return true;
}

// ---------- RUNTIME COLLISION ENFORCEMENT ----------
// Push a position out of any table obstacle it overlaps
function enforceTableCollision(position) {
    for (let i = 0; i < window.ACTIVE_TABLES; i++) {
        const obs = TABLE_OBSTACLES[i];
        const dx = position.x - obs.x;
        const dz = position.z - obs.z;
        const distSq = dx * dx + dz * dz;
        const minDist = obs.r + CHARACTER_RADIUS;
        if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist < 0.001) {
                // Exactly on center, push in arbitrary direction
                position.x = obs.x + minDist;
            } else {
                // Push outward along the radial direction
                const nx = dx / dist;
                const nz = dz / dist;
                position.x = obs.x + nx * minDist;
                position.z = obs.z + nz * minDist;
            }
        }
    }
}



// ---------- GAME CLASS ----------
export class Game {
    constructor(scene, restaurantData, camera) {
        this.scene = scene;
        this.camera = camera;
        this.tables = restaurantData.tables;
        this.kitchen = restaurantData.kitchen;
        this.bar = restaurantData.bar;
        this.doorPosition = restaurantData.doorPosition;

        this.state = {
            money: loadProgress(), score: 0, satisfaction: 100,
            timeLeft: 120, level: 1, paused: false, running: false,
            gems: shopState.gems,
        };

        this.waiter = null;
        this.customers = [];
        this.orders = [];
        this.spawnTimer = 0;
        this.customersSpawned = 0;
        this.customersServed = 0;
        this.levelMoney = 0;
        this.customerIdCounter = 0;
        this.orderIdCounter = 0;

        // Waiter state
        this.waiterState = 'idle'; // idle, walking, busy
        this.waiterTarget = null;
        this.waiterAction = null; // what to do on arrival
        this.waiterActionQueue = []; // queued actions
        this.waiterCarrying = null; // food plate model
        this.waiterSpeed = 5.5;
        this.waiterPath = []; // A* path waypoints
        this.waiterPathIdx = 0;

        // Dash mechanics
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;

        // Steam particles
        this.steamParticles = [];
        this.steamTimer = 0;
        this.steamSources = getSteamSources();
        this.dashCooldownMax = 1.5;
        this.dashDuration = 0.4;
        this.dashSpeedMultiplier = 1.6;
        this.dashParticles = [];

        // Navigation grid
        this.navGrid = buildNavGrid();

        // Combo system
        this.combo = 0;
        this.lastServeTime = 0;
        this.comboTimer = 0;

        // Visual indicators
        this.indicators = [];
    }

    start(level = 1) {
        this.state.level = level;
        this.state.satisfaction = 100;
        this.state.running = true;
        this.state.paused = false;
        this.customersSpawned = 0;
        this.customersServed = 0;
        this.levelMoney = 0;
        this.spawnTimer = 2; // first customer after 2 seconds

        const cfg = this.getLevelConfig();
        this.state.timeLeft = cfg.timeLimit;

        // Clear previous
        this.clearAll();

        // Create waiter
        this.waiter = createWaiterModel(shopState.activeSkin);
        this.waiter.position.set(0, 0, 0);
        this.scene.add(this.waiter);
        this.waiterState = 'idle';

        // Set waiter speed based on upgrades (base 5.5 + 0.5 per level)
        this.waiterSpeed = 5.0 + (shopState.waiterSpeedLevel * 0.5);

        // Rebuild navigation grid based on active tables
        window.ACTIVE_TABLES = shopState.tablesUnlocked;
        this.navGrid = buildNavGrid();

        // Reset and hide/show tables based on progression
        this.tables.forEach((t, idx) => {
            if (idx < window.ACTIVE_TABLES) {
                t.group.visible = true;
                t.state = 'empty';
                t.customerRef = null;
                t.orderRef = null;
            } else {
                t.group.visible = false;
                t.state = 'locked';
            }
        });

        showMessage('Bem-vindo ao turno! Clique nos clientes na entrada para recepcioná-los.', 5000);
        updateHUD(this.state);
    }

    clearAll() {
        // Remove waiter
        if (this.waiter) { this.scene.remove(this.waiter); this.waiter = null; }
        // Remove customers + patience bars
        this.customers.forEach(c => {
            if (c.model) this.scene.remove(c.model);
            if (c.patienceBar) this.scene.remove(c.patienceBar);
        });
        this.customers = [];
        // Remove waiter carrying
        if (this.waiterCarrying) { this.scene.remove(this.waiterCarrying); this.waiterCarrying = null; }
        // Remove indicators
        this.indicators.forEach(i => this.scene.remove(i));
        this.indicators = [];
        // Remove dirty table indicators
        this.tables.forEach(t => {
            if (t.dirtyIndicator) { this.scene.remove(t.dirtyIndicator); t.dirtyIndicator = null; }
            if (t.foodPlate) { this.scene.remove(t.foodPlate); t.foodPlate = null; }
        });
        this.orders = [];
        this.waiterState = 'idle';
        this.waiterTarget = null;
        this.waiterAction = null;
        this.waiterActionQueue = [];
        // Reset kitchen ready indicator
        updateKitchenReady(this.kitchen, false);
        // Reset bar ready indicator
        updateBarReady(this.bar, false);
        // Reset combo
        this.combo = 0;
        this.comboTimer = 0;
        updateCombo(0);
        updateCarrying(null);
    }

    getLevelConfig() {
        const idx = Math.min(this.state.level - 1, LEVELS.length - 1);
        return LEVELS[idx];
    }

    update(dt) {
        if (!this.state.running || this.state.paused) return;

        // Update dash active state & emit particles
        if (this.dashActive) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.dashActive = false;
            }
            if (this.waiter) {
                this.spawnDashParticles(this.waiter.position);
            }
        }

        // Update dash cooldown & progress HUD
        if (this.dashCooldown > 0) {
            this.dashCooldown -= dt;
            const dashInd = document.getElementById('dash-indicator');
            const dashProg = document.getElementById('dash-progress');
            if (dashInd && dashProg) {
                dashInd.classList.remove('hidden');
                const percent = Math.max(0, (this.dashCooldown / this.dashCooldownMax) * 100);
                dashProg.style.width = `${percent}%`;
                if (this.dashCooldown <= 0) {
                    dashInd.classList.add('hidden');
                }
            }
        }

        // Update steam particles (kitchen/bar ambiance)
        this.steamTimer -= dt;
        if (this.steamTimer <= 0 && this.steamSources) {
            this.steamTimer = 0.35 + Math.random() * 0.4;
            for (const src of this.steamSources) {
                this._spawnSteam(src);
            }
        }
        if (this.steamParticles) {
            for (let i = this.steamParticles.length - 1; i >= 0; i--) {
                const p = this.steamParticles[i];
                p.timer -= dt;
                if (p.timer <= 0) {
                    this.scene.remove(p.mesh);
                    this.steamParticles.splice(i, 1);
                } else {
                    p.mesh.position.y += dt * 0.5;
                    p.mesh.material.opacity = (p.timer / p.maxTimer) * 0.4;
                    p.mesh.scale.multiplyScalar(1.01);
                }
            }
        }

        // Update dash 3D particles in scene
        if (this.dashParticles) {
            for (let i = this.dashParticles.length - 1; i >= 0; i--) {
                const p = this.dashParticles[i];
                p.timer -= dt;
                if (p.timer <= 0) {

                    this.scene.remove(p.mesh);
                    this.dashParticles.splice(i, 1);
                } else {
                    p.mesh.position.addScaledVector(p.velocity, dt);
                    p.mesh.scale.multiplyScalar(0.92);
                }
            }
        }

        const cfg = this.getLevelConfig();

        // Timer
        this.state.timeLeft -= dt;

        // Spawn customers
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0 && this.customersSpawned < cfg.totalCustomers) {
            this.spawnCustomer();
            this.spawnTimer = cfg.spawnInterval + (Math.random() * 3 - 1.5);
        }

        // Update waiter movement
        this.updateWaiter(dt);

        // Update customers
        this.updateCustomers(dt);

        // Update orders (cooking)
        this.updateOrders(dt);

        // Check satisfaction
        if (this.state.satisfaction <= 0) {
            this.state.satisfaction = 0;
            this.state.running = false;
            const isNewRecord = saveHighScore(this.state.score);
            showGameOver({
                level: this.state.level,
                score: this.state.score,
                money: this.state.money,
                highScore: loadHighScore(),
                isNewRecord,
            });
            return;
        }

        // Check level completion
        if (this.state.timeLeft <= 0 || this.isLevelComplete()) {
            this.state.timeLeft = Math.max(0, this.state.timeLeft);
            this.state.running = false;
            const isNewRecord = saveHighScore(this.state.score);
            showLevelComplete({
                served: this.customersServed,
                score: this.state.score,
                money: this.levelMoney,
                satisfaction: this.state.satisfaction,
                isNewRecord,
            });
            return;
        }

        // Update kitchen ready indicator (food only)
        const hasReadyFood = this.orders.some(o => o.state === 'ready' && o.menuItem.station === 'kitchen');
        updateKitchenReady(this.kitchen, hasReadyFood);

        // Update bar ready indicator (drinks only)
        const hasReadyDrinks = this.orders.some(o => o.state === 'ready' && o.menuItem.station === 'bar');
        updateBarReady(this.bar, hasReadyDrinks);

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                updateCombo(0);
            }
        }

        this.state.gems = shopState.gems;
        updateHUD(this.state);
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    triggerDash() {
        if (this.dashCooldown > 0 || this.dashActive) return;
        this.dashActive = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = this.dashCooldownMax;
        playSound('dash');
        try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) {}
        triggerScreenShake(0.04, 0.15);
    }

    spawnDashParticles(pos) {
        const geom = new THREE.SphereGeometry(0.08, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xFFEB3B,
            transparent: true,
            opacity: 0.6
        });
        const mesh = new THREE.Mesh(geom, mat);
        
        mesh.position.copy(pos);
        mesh.position.y = 0.1;
        mesh.position.x += (Math.random() - 0.5) * 0.2;
        mesh.position.z += (Math.random() - 0.5) * 0.2;
        
        this.scene.add(mesh);
        
        this.dashParticles.push({
            mesh,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5),
            timer: 0.3
        });
    }

    _spawnSteam(pos) {
        const geom = new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.35
        });
        const mesh = new THREE.Mesh(geom, mat);
        
        mesh.position.copy(pos);
        mesh.position.x += (Math.random() - 0.5) * 0.15;
        mesh.position.z += (Math.random() - 0.5) * 0.15;
        mesh.position.y += (Math.random() - 0.5) * 0.1;
        
        this.scene.add(mesh);
        
        const lifetime = 1.0 + Math.random() * 0.6;
        this.steamParticles.push({
            mesh,
            timer: lifetime,
            maxTimer: lifetime
        });
    }

    isLevelComplete() {
        const cfg = this.getLevelConfig();
        // Level done when all customers spawned AND no active customers
        if (this.customersSpawned >= cfg.totalCustomers && this.customers.length === 0) {
            // Also check no pending orders
            return this.orders.every(o => o.state === 'delivered' || o.state === 'done');
        }
        return false;
    }

    // ---------- SPAWN CUSTOMER ----------
    spawnCustomer() {
        const id = this.customerIdCounter++;
        const model = createCustomerModel(id);

        // Queue position: line up at door with spacing
        const waitingCount = this.customers.filter(c => c.state === 'waiting_at_door').length;
        const spawnPos = this.doorPosition.clone();
        spawnPos.x += 1 + waitingCount * 1.2; // spread along x
        spawnPos.z += 0;
        model.position.copy(spawnPos);
        this.scene.add(model);

        // Create patience bar
        const patienceBar = createPatienceBar();
        patienceBar.position.set(spawnPos.x, 2.1, spawnPos.z);
        this.scene.add(patienceBar);

        const customer = {
            id,
            model,
            patienceBar,
            state: 'waiting_at_door',
            patience: this.getLevelConfig().patience,
            maxPatience: this.getLevelConfig().patience,
            tableIndex: -1,
            order: null,
            eatTimer: 0,
        };

        this.customers.push(customer);
        this.customersSpawned++;

        // Bobbing animation
        model.userData.bobTime = Math.random() * Math.PI * 2;

        if (waitingCount === 0) {
            showMessage('👋 Um cliente chegou! Clique nele para recepcioná-lo.', 4000);
        } else {
            showMessage(`👥 ${waitingCount + 1} clientes esperando na entrada!`, 3000);
        }
    }

    // ---------- UPDATE CUSTOMERS ----------
    updateCustomers(dt) {
        for (let i = this.customers.length - 1; i >= 0; i--) {
            const c = this.customers[i];

            // Update model animations based on customer state
            let custAnimState = 'idle';
            if (c.state === 'following' || c.state === 'leaving') {
                custAnimState = 'walking';
            } else if (c.state === 'eating') {
                custAnimState = 'eating';
            }
            updateModelAnimations(dt, c.model, custAnimState, 1.0);

            // Patience decreases while waiting (not while eating or leaving)
            if (['waiting_at_door', 'seated', 'ordering', 'waiting_food'].includes(c.state)) {
                c.patience -= dt;

                // Update patience bar position and visuals
                if (c.patienceBar) {
                    const pos = c.model.position;
                    c.patienceBar.position.set(pos.x, pos.y + 2.1, pos.z);
                    const ratio = c.patience / c.maxPatience;
                    updatePatienceBar(c.patienceBar, ratio, this.camera);

                    // Show/hide bar based on state
                    c.patienceBar.visible = true;
                }

                if (c.patience <= 0) {
                    // Customer leaves angry
                    this.state.satisfaction -= 15;
                    showMessage('😡 Um cliente saiu irritado! Satisfação diminuiu.', 3000);
                    playSound('angry');
                    // Reset combo on angry customer
                    this.combo = 0;
                    updateCombo(0);
                    if (c.tableIndex >= 0) {
                        const table = this.tables[c.tableIndex];
                        table.state = 'empty';
                        table.customerRef = null;
                        this.orders = this.orders.filter(o => o.tableIndex !== c.tableIndex || o.state === 'delivered');
                    }
                    this.removeCustomer(c, i);
                    continue;
                }
            }

            // Hide patience bar while eating
            if (c.state === 'eating' && c.patienceBar) {
                c.patienceBar.visible = false;
            }

            // Bobbing animation for waiting customers
            if (c.state === 'waiting_at_door') {
                c.model.userData.bobTime += dt * 2;
                c.model.position.y = Math.sin(c.model.userData.bobTime) * 0.05;
            }

            // Following waiter - update patience bar position
            if (c.state === 'following' && c.patienceBar) {
                const pos = c.model.position;
                c.patienceBar.position.set(pos.x, pos.y + 2.1, pos.z);
                updatePatienceBar(c.patienceBar, c.patience / c.maxPatience, this.camera);
            }

            // Wait for order
            if (c.state === 'waiting_order') {
                const t = this.tables[c.tableIndex];
                if (t) {
                    c.model.lookAt(t.position.x, c.model.position.y, t.position.z);
                }
                c.actionTimer -= dt;
                if (c.actionTimer <= 0) {
                    c.state = 'ordering';
                }
            }

            // Eating timer
            if (c.state === 'eating') {
                c.eatTimer -= dt;
                if (c.eatTimer <= 0) {
                    c.state = 'leaving';
                    this.customerFinished(c);
                }
            }

            // Leaving animation (follows A* path)
            if (c.state === 'leaving') {
                // Hide patience bar
                if (c.patienceBar) c.patienceBar.visible = false;

                // Compute leaving path once
                if (!c.leavePath) {
                    c.leavePath = findWorldPath(this.navGrid, c.model.position, this.doorPosition);
                    c.leavePathIdx = 0;
                    c.leaveTimer = 0;
                }

                // Safety timeout: remove customer after 10 seconds of leaving
                c.leaveTimer = (c.leaveTimer || 0) + dt;
                if (c.leaveTimer > 10) {
                    this.removeCustomer(c, i);
                    continue;
                }

                if (c.leavePathIdx >= c.leavePath.length) {
                    this.removeCustomer(c, i);
                    continue;
                }

                const wp = c.leavePath[c.leavePathIdx];
                const dir = new THREE.Vector3(wp.x - c.model.position.x, 0, wp.z - c.model.position.z);
                const dist = dir.length();
                const isLastWp = c.leavePathIdx >= c.leavePath.length - 1;

                if (dist < (isLastWp ? 1.0 : 0.5)) {
                    c.leavePathIdx++;
                    if (c.leavePathIdx >= c.leavePath.length) {
                        this.removeCustomer(c, i);
                        continue;
                    }
                } else {
                    dir.normalize().multiplyScalar(Math.min(dt * 4, dist));
                    c.model.position.add(dir);
                    if (!isLastWp) {
                        enforceTableCollision(c.model.position);
                    }
                    c.model.lookAt(wp.x, c.model.position.y, wp.z);
                }
            }
        }
    }

    // ---------- REMOVE CUSTOMER (cleanup) ----------
    removeCustomer(customer, index) {
        if (customer.model) this.scene.remove(customer.model);
        if (customer.patienceBar) this.scene.remove(customer.patienceBar);
        this.customers.splice(index, 1);
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    customerFinished(customer) {
        const table = this.tables[customer.tableIndex];
        // Remove food plate
        if (table.foodPlate) {
            this.scene.remove(table.foodPlate);
            table.foodPlate = null;
        }
        // Remove drink glass
        if (table.drinkGlass) {
            this.scene.remove(table.drinkGlass);
            table.drinkGlass = null;
        }
        // Mark table dirty
        table.state = 'dirty';
        table.customerRef = null;
        // Add dirty indicator
        const dirtyInd = createDirtyTableIndicator();
        dirtyInd.position.copy(table.position);
        this.scene.add(dirtyInd);
        table.dirtyIndicator = dirtyInd;

        // Money & score with combo system — sum all delivered orders for this table
        const deliveredOrders = this.orders.filter(o => o.tableIndex === customer.tableIndex && o.state === 'delivered');
        if (deliveredOrders.length > 0) {
            const earned = deliveredOrders.reduce((sum, o) => sum + o.menuItem.price, 0);
            const patienceRatio = customer.patience / customer.maxPatience;
            const patienceBonus = Math.round(patienceRatio * 10);

            // Combo logic: fast service within 15 seconds
            const now = performance.now();
            if (this.lastServeTime > 0 && (now - this.lastServeTime) < 15000) {
                this.combo++;
            } else {
                this.combo = 1;
            }
            this.lastServeTime = now;
            this.comboTimer = 8; // combo expires after 8 seconds

            const comboMultiplier = Math.min(this.combo, 5);
            const comboBonus = comboMultiplier > 1 ? Math.round(earned * (comboMultiplier - 1) * 0.3) : 0;
            const tipAmount = patienceRatio > 0.5 ? Math.round(earned * patienceRatio * 0.2) : 0;
            const totalEarned = earned + tipAmount + comboBonus;
            const finalEarned = shopState.vipActive ? Math.round(totalEarned * 1.5) : totalEarned;

            this.state.money += finalEarned;
            saveProgress(this.state.money);
            
            this.state.score += finalEarned + patienceBonus;
            this.levelMoney += finalEarned;
            this.state.satisfaction = Math.min(100, this.state.satisfaction + 3 + (comboMultiplier > 1 ? 2 : 0));

            // Floating money popups
            const baseX = 30 + Math.random() * 40;
            showFloatingMoney(earned, baseX, 40, 'normal');
            if (tipAmount > 0) {
                setTimeout(() => showFloatingMoney(tipAmount, baseX + 5, 35, 'bonus'), 300);
            }
            if (comboBonus > 0) {
                setTimeout(() => showFloatingMoney(comboBonus, baseX + 10, 30, 'combo'), 500);
            }

            // Sound effects
            playSound('money');
            if (comboMultiplier > 1) {
                setTimeout(() => playSound('combo'), 200);
            }

            // Update combo display
            updateCombo(comboMultiplier);

            // Message
            let msg = `💰 R$ ${earned}`;
            if (tipAmount > 0) msg += ` + R$ ${tipAmount} gorjeta`;
            if (comboBonus > 0) msg += ` + R$ ${comboBonus} combo x${comboMultiplier}`;
            msg += ` | +${patienceBonus} bônus agilidade`;
            if (shopState.vipActive) msg += ` (VIP 1.5x! 👑)`;
            showMessage(msg, 4000);
            deliveredOrders.forEach(o => o.state = 'done');
        }
        this.customersServed++;
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    // ---------- UPDATE ORDERS (cooking) ----------
    updateOrders(dt) {
        this.orders.forEach(order => {
            if (order.state === 'cooking') {
                order.cookTimer -= dt;
                if (order.cookTimer <= 0) {
                    order.state = 'ready';
                    playSound('ready');
                    const stationLabel = order.menuItem.station === 'bar' ? 'Bar 🍺' : 'Cozinha 🍳';
                    showMessage(`✅ ${order.menuItem.emoji} ${order.menuItem.name} está pronto! Retire no ${stationLabel}.`, 4000);
                }
            }
        });
    }

    // ---------- UPDATE WAITER (follows A* path) ----------
    updateWaiter(dt) {
        if (!this.waiter) return;

        let waiterAnimState = 'idle';
        if (this.waiterState === 'walking') {
            waiterAnimState = this.waiterCarrying ? 'carrying' : 'walking';
        }
        updateModelAnimations(dt, this.waiter, waiterAnimState, this.dashActive ? this.dashSpeedMultiplier : 1.0);

        if (this.waiterState !== 'walking') {
            return;
        }
        if (this.waiterPath.length === 0) {
            this.waiterState = 'idle';
            this.executeWaiterAction();
            return;
        }

        const target = this.waiterPath[this.waiterPathIdx];
        if (!target) {
            this.waiterState = 'idle';
            this.executeWaiterAction();
            return;
        }

        const dir = new THREE.Vector3(target.x - this.waiter.position.x, 0, target.z - this.waiter.position.z);
        const dist = dir.length();

        // Reached current waypoint?
        const isLastWaypoint = this.waiterPathIdx >= this.waiterPath.length - 1;
        const arrivalDist = isLastWaypoint ? 0.8 : 0.4;

        if (dist < arrivalDist) {
            this.waiterPathIdx++;
            if (this.waiterPathIdx >= this.waiterPath.length) {
                // Arrived at final destination
                this.waiter.position.x = target.x;
                this.waiter.position.z = target.z;
                this.waiterState = 'idle';
                this.waiterPath = [];
                this.waiterPathIdx = 0;
                this.executeWaiterAction();
            }
            return;
        }

        // Move toward current waypoint with dash speed boost
        let speed = this.waiterSpeed;
        if (this.dashActive) {
            speed *= this.dashSpeedMultiplier;
        }
        dir.normalize().multiplyScalar(Math.min(dt * speed, dist));
        this.waiter.position.add(dir);

        // Enforce collision so waiter slides around tables (skip near final approach)
        if (!isLastWaypoint) {
            enforceTableCollision(this.waiter.position);
        }

        // Look ahead (use next waypoint if close to current for smoother rotation)
        const lookTarget = (dist < 1.0 && this.waiterPathIdx < this.waiterPath.length - 1)
            ? this.waiterPath[this.waiterPathIdx + 1]
            : target;
        this.waiter.lookAt(lookTarget.x, this.waiter.position.y, lookTarget.z);
    }

    moveWaiterTo(target, action) {
        const endPos = target.clone();
        endPos.y = 0;
        this.waiterAction = action;

        // Compute A* path
        this.waiterPath = findWorldPath(this.navGrid, this.waiter.position, endPos);
        this.waiterPathIdx = 0;
        this.waiterState = 'walking';
    }

    executeWaiterAction() {
        if (!this.waiterAction) return;
        const action = this.waiterAction;
        this.waiterAction = null;

        switch (action.type) {
            case 'greet_customer':
                this.greetCustomer(action.customerId);
                break;
            case 'seat_customer':
                this.seatCustomer(action.customerId, action.tableIndex);
                break;
            case 'take_order':
                this.takeOrder(action.tableIndex);
                break;
            case 'pickup_food':
                this.pickupFood(action.orderId);
                break;
            case 'pickup_drink':
                this.pickupDrink(action.orderId);
                break;
            case 'deliver_food':
                this.deliverFood(action.tableIndex);
                break;
            case 'clean_table':
                this.cleanTable(action.tableIndex);
                break;
        }
    }

    // ---------- ACTIONS ----------
    greetCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer || customer.state !== 'waiting_at_door') return;

        // Find available table among active tables
        const empties = this.tables.filter((t, idx) => idx < window.ACTIVE_TABLES && t.state === 'empty');
        let tableIndex = -1;
        if (empties.length > 0) {
            tableIndex = empties[Math.floor(Math.random() * empties.length)].index;
        }

        if (tableIndex === -1) {
            showMessage('⚠️ Não há mesas disponíveis! Limpe as mesas sujas.', 3000);
            return;
        }

        customer.state = 'following';
        showMessage(`Levando cliente para a Mesa ${tableIndex + 1}...`, 3000);

        // Move waiter to table, customer will follow
        const table = this.tables[tableIndex];
        table.state = 'occupied';
        table.customerRef = customer;
        customer.tableIndex = tableIndex;

        // Visual seat position (where the customer model will visually sit)
        const seatPos = table.position.clone();
        seatPos.x += (table.type === 'round' ? 1.2 : 0);
        seatPos.z += (table.type === 'round' ? 0 : 1.2);

        // Approach position (outside collision zone — where pathfinding targets)
        const approachPos = getTableApproach(tableIndex);

        this.moveWaiterTo(approachPos, {
            type: 'seat_customer',
            customerId,
            tableIndex,
        });

        // Animate customer: navigate to approach point, then snap to visual seat
        this.animateCustomerToTable(customer, approachPos, seatPos);
    }

    animateCustomerToTable(customer, navTarget, visualSeat) {
        // Compute A* path to the approach point (outside collision zone)
        const path = findWorldPath(this.navGrid, customer.model.position, navTarget);
        let pathIdx = 0;
        const speed = 3.5;
        let lastTime = performance.now();
        const startTime = performance.now();
        const MAX_ANIM_TIME = 8000; // safety: snap after 8 seconds max

        const snapToSeat = () => {
            customer.model.position.copy(visualSeat);
            customer.model.position.y = 0;
        };

        const animate = () => {
            if (customer.state === 'leaving' || !customer.model.parent) return;

            // Safety timeout — prevent infinite loops
            if (performance.now() - startTime > MAX_ANIM_TIME) {
                snapToSeat();
                return;
            }

            if (pathIdx >= path.length) {
                snapToSeat();
                return;
            }

            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            const wp = path[pathIdx];
            const dir = new THREE.Vector3(wp.x - customer.model.position.x, 0, wp.z - customer.model.position.z);
            const dist = dir.length();

            // Use generous snap distance for last waypoint to avoid oscillation
            const isLastWp = pathIdx >= path.length - 1;
            const snapDist = isLastWp ? 1.0 : 0.4;

            if (dist < snapDist) {
                pathIdx++;
                if (pathIdx >= path.length) {
                    snapToSeat();
                    return;
                }
            } else {
                dir.normalize().multiplyScalar(Math.min(dt * speed, dist));
                customer.model.position.add(dir);
                // Skip collision enforcement near final waypoint to prevent oscillation
                if (!isLastWp) {
                    enforceTableCollision(customer.model.position);
                }
                customer.model.lookAt(wp.x, customer.model.position.y, wp.z);
            }

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    seatCustomer(customerId, tableIndex) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        customer.state = 'seated';
        playSound('seat');
        showMessage(`Cliente sentado na Mesa ${tableIndex + 1}. Clique na mesa para anotar o pedido.`, 4000);
    }

    takeOrder(tableIndex) {
        const table = this.tables[tableIndex];
        const customer = table.customerRef;
        if (!customer || customer.state !== 'seated') return;

        // Filter menus by unlocked items
        const availableFood = FOOD_MENU.filter(item => shopState.foodUnlocked.includes(item.id));
        const availableDrinks = DRINKS_MENU.filter(item => shopState.drinksUnlocked.includes(item.id));

        // Random pick from available
        const foodItem = availableFood[Math.floor(Math.random() * availableFood.length)];
        const drinkItem = availableDrinks[Math.floor(Math.random() * availableDrinks.length)];

        const foodOrder = {
            id: this.orderIdCounter++,
            menuItem: foodItem,
            tableIndex,
            state: 'cooking',
            cookTimer: foodItem.cookTime,
        };

        const drinkOrder = {
            id: this.orderIdCounter++,
            menuItem: drinkItem,
            tableIndex,
            state: 'cooking',
            cookTimer: drinkItem.cookTime,
        };

        this.orders.push(foodOrder);
        this.orders.push(drinkOrder);
        table.orderRef = foodOrder; // primary order reference
        table.drinkOrderRef = drinkOrder;
        customer.state = 'waiting_food';
        customer.order = foodOrder;
        customer.drinkOrder = drinkOrder;

        showMessage(`📝 Pedido anotado: ${foodItem.emoji} ${foodItem.name} + ${drinkItem.emoji} ${drinkItem.name} (Mesa ${tableIndex + 1})`, 4000);
        playSound('order');
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    pickupFood(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order || order.state !== 'ready') return;

        order.state = 'carrying';

        // Visual: plate on waiter
        const plate = createPlateModel(order.menuItem.id);
        plate.position.set(0, 0.3, 0.3);
        this.waiter.add(plate);
        this.waiterCarrying = plate;
        this.waiterCarryingOrder = order;

        showMessage(`🍳 Prato pego da Cozinha! Clique na Mesa ${order.tableIndex + 1} para entregar.`, 4000);
        playSound('click');
        updateCarrying({ emoji: order.menuItem.emoji, name: order.menuItem.name, tableIndex: order.tableIndex });
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    pickupDrink(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order || order.state !== 'ready') return;

        order.state = 'carrying';

        // Visual: drink glass on waiter
        const glass = createDrinkModel(order.menuItem.id);
        glass.position.set(0, 0.3, 0.3);
        this.waiter.add(glass);
        this.waiterCarrying = glass;
        this.waiterCarryingOrder = order;

        showMessage(`🍺 Bebida pega do Bar! Clique na Mesa ${order.tableIndex + 1} para entregar.`, 4000);
        playSound('click');
        updateCarrying({ emoji: order.menuItem.emoji, name: order.menuItem.name, tableIndex: order.tableIndex });
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    deliverFood(tableIndex) {
        const order = this.waiterCarryingOrder;
        if (!order || order.tableIndex !== tableIndex) {
            showMessage('⚠️ Este pedido não é para esta mesa!', 2000);
            return;
        }

        // Remove carried item from waiter
        if (this.waiterCarrying) {
            this.waiter.remove(this.waiterCarrying);
            this.waiterCarrying = null;
        }

        const table = this.tables[tableIndex];
        const isDrink = order.menuItem.station === 'bar';

        // Add visual to table
        if (isDrink) {
            const drinkGlass = createDrinkModel(order.menuItem.id);
            drinkGlass.position.copy(table.position);
            drinkGlass.position.x += 0.35;
            this.scene.add(drinkGlass);
            table.drinkGlass = drinkGlass;
        } else {
            const foodPlate = createPlateModel(order.menuItem.id);
            foodPlate.position.copy(table.position);
            this.scene.add(foodPlate);
            table.foodPlate = foodPlate;
        }

        order.state = 'delivered';
        this.waiterCarryingOrder = null;

        // Check if ALL orders for this table are delivered
        const tableOrders = this.orders.filter(o => o.tableIndex === tableIndex && o.state !== 'done');
        const allDelivered = tableOrders.every(o => o.state === 'delivered');

        // Customer starts eating only when both food and drink are delivered
        const customer = table.customerRef;
        if (customer && allDelivered) {
            customer.state = 'eating';
            customer.eatTimer = 6 + Math.random() * 4;
            showMessage(`✅ Pedido completo na Mesa ${tableIndex + 1}! Cliente está comendo.`, 3000);
        } else {
            const stationName = isDrink ? 'Bebida' : 'Prato';
            showMessage(`✅ ${stationName} entregue na Mesa ${tableIndex + 1}! Falta ${isDrink ? 'o prato (Cozinha)' : 'a bebida (Bar)'}.`, 3000);
        }

        playSound('deliver');
        updateCarrying(null);
        updateOrders(this.orders.filter(o => o.state !== 'done'));
    }

    cleanTable(tableIndex) {
        const table = this.tables[tableIndex];
        table.state = 'empty';
        table.customerRef = null;
        table.orderRef = null;
        table.drinkOrderRef = null;

        // Remove dirty indicator
        if (table.dirtyIndicator) {
            this.scene.remove(table.dirtyIndicator);
            table.dirtyIndicator = null;
        }
        // Remove drink glass
        if (table.drinkGlass) {
            this.scene.remove(table.drinkGlass);
            table.drinkGlass = null;
        }

        this.state.score += 5;
        playSound('clean');
        showMessage(`🧹 Mesa ${tableIndex + 1} limpa e pronta!`, 2000);
    }

    // ---------- HANDLE CLICK (from raycasting) ----------
    handleClick(intersectedObjects) {
        if (!this.state.running || this.state.paused) return;
        if (this.waiterState === 'walking') {
            if (this.dashCooldown <= 0 && !this.dashActive) {
                this.triggerDash();
            } else if (!this.dashActive) {
                showMessage('⏳ Garçom está se movendo...', 1500);
            }
            return;
        }

        for (const obj of intersectedObjects) {
            let current = obj.object;
            // Walk up to find userData.type
            while (current && !current.userData?.type) {
                current = current.parent;
            }
            if (!current) continue;

            const type = current.userData.type;

            // Click on customer at door
            if (type === 'customer') {
                const customer = this.customers.find(c => c.model === current && c.state === 'waiting_at_door');
                if (customer) {
                    this.moveWaiterTo(customer.model.position, {
                        type: 'greet_customer',
                        customerId: customer.id,
                    });
                    return;
                }
            }

            // Click on table
            if (type === 'table') {
                const tableIndex = current.userData.index;
                const table = this.tables[tableIndex];
                const approachPos = getTableApproach(tableIndex);

                if (table.state === 'dirty') {
                    this.moveWaiterTo(approachPos, {
                        type: 'clean_table',
                        tableIndex,
                    });
                    return;
                }

                if (table.state === 'occupied') {
                    const customer = table.customerRef;

                    // If carrying food → deliver
                    if (this.waiterCarrying && this.waiterCarryingOrder) {
                        this.moveWaiterTo(approachPos, {
                            type: 'deliver_food',
                            tableIndex,
                        });
                        return;
                    }

                    // If customer is seated → take order
                    if (customer && customer.state === 'seated') {
                        this.moveWaiterTo(approachPos, {
                            type: 'take_order',
                            tableIndex,
                        });
                        return;
                    }

                    if (customer && customer.state === 'waiting_food') {
                        showMessage('⏳ Pedido ainda em preparo. Aguarde...', 2000);
                        return;
                    }

                    if (customer && customer.state === 'eating') {
                        showMessage('🍽️ Cliente ainda está comendo.', 2000);
                        return;
                    }
                }

                if (table.state === 'empty') {
                    showMessage('Mesa vazia. Espere um cliente chegar.', 2000);
                    return;
                }
            }

            // Click on kitchen (food only)
            if (type === 'kitchen') {
                const readyFood = this.orders.find(o => o.state === 'ready' && o.menuItem.station === 'kitchen');
                if (readyFood) {
                    this.moveWaiterTo(this.kitchen.position, {
                        type: 'pickup_food',
                        orderId: readyFood.id,
                    });
                    return;
                }

                if (this.orders.some(o => o.state === 'cooking' && o.menuItem.station === 'kitchen')) {
                    showMessage('🔥 Pratos ainda estão sendo preparados na Cozinha...', 2000);
                } else {
                    showMessage('🍳 Nenhum prato pendente na Cozinha.', 2000);
                }
                return;
            }

            // Click on bar (drinks only)
            if (type === 'bar') {
                const readyDrink = this.orders.find(o => o.state === 'ready' && o.menuItem.station === 'bar');
                if (readyDrink) {
                    this.moveWaiterTo(this.bar.position, {
                        type: 'pickup_drink',
                        orderId: readyDrink.id,
                    });
                    return;
                }

                if (this.orders.some(o => o.state === 'cooking' && o.menuItem.station === 'bar')) {
                    showMessage('🍺 Bebidas ainda estão sendo preparadas no Bar...', 2000);
                } else {
                    showMessage('🍺 Nenhuma bebida pendente no Bar.', 2000);
                }
                return;
            }
        }
    }

    // ---------- NEXT LEVEL ----------
    nextLevel() {
        this.state.level++;
        this.start(this.state.level);
    }

    restart() {
        this.state.money = 0;
        this.state.score = 0;
        this.start(1);
    }

    togglePause() {
        this.state.paused = !this.state.paused;
    }
}
