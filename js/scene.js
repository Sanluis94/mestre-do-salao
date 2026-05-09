// ==========================================
// scene.js — Three.js Scene + Restaurant 3D Models
// ==========================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;

// ---------- SCENE INITIALIZATION ----------
export function initScene(canvas) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a2e);
    scene.fog = new THREE.Fog(0x0a0a2e, 50, 80);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(22, 22, 22);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 15;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = 0.3;
    controls.target.set(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0xfff5e1, 0.35);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.5);
    dirLight.position.set(8, 15, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x443300, 0.2);
    scene.add(hemiLight);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, controls };
}

// ---------- MATERIALS ----------
const materials = {
    floor1: new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.8 }),
    floor2: new THREE.MeshStandardMaterial({ color: 0x6B4F12, roughness: 0.8 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xC4A882, roughness: 0.7 }),
    wallTrim: new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.6 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x3a3a5c, roughness: 0.9 }),
    tableWood: new THREE.MeshStandardMaterial({ color: 0x6B3A2A, roughness: 0.5 }),
    tableWhite: new THREE.MeshStandardMaterial({ color: 0xE8E0D0, roughness: 0.4 }),
    chairRed: new THREE.MeshStandardMaterial({ color: 0xCC2222, roughness: 0.6 }),
    chairLeg: new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.4, metalness: 0.3 }),
    lampShade: new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, emissive: 0xFFAA00, emissiveIntensity: 0.5 }),
    lampWire: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.5 }),
    counter: new THREE.MeshStandardMaterial({ color: 0xEEEEEE, roughness: 0.3 }),
    counterTop: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.2, metalness: 0.4 }),
    doorFrame: new THREE.MeshStandardMaterial({ color: 0x6B3A20, roughness: 0.5 }),
    painting: new THREE.MeshStandardMaterial({ color: 0x2A4A3A, roughness: 0.5 }),
    paintingFrame: new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.4, metalness: 0.2 }),
    doorIndicator: new THREE.MeshStandardMaterial({ color: 0x44FF44, emissive: 0x22CC22, emissiveIntensity: 0.8, roughness: 0.3 }),
    // Bar materials
    barWood: new THREE.MeshStandardMaterial({ color: 0x3B1E0E, roughness: 0.5 }),
    barTop: new THREE.MeshStandardMaterial({ color: 0x1A1A2E, roughness: 0.15, metalness: 0.5 }),
    barShelf: new THREE.MeshStandardMaterial({ color: 0x4A2A1A, roughness: 0.4, metalness: 0.1 }),
    barMetal: new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.2, metalness: 0.8 }),
    barNeon: new THREE.MeshStandardMaterial({ color: 0x00CCFF, emissive: 0x0088CC, emissiveIntensity: 0.9, roughness: 0.3 }),
    bottleGreen: new THREE.MeshStandardMaterial({ color: 0x1A5A2A, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }),
    bottleAmber: new THREE.MeshStandardMaterial({ color: 0x8B5E3C, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }),
    bottleClear: new THREE.MeshStandardMaterial({ color: 0xCCDDEE, roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.6 }),
    glassBody: new THREE.MeshStandardMaterial({ color: 0xDDEEFF, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.5 }),
    drinkLiquid: new THREE.MeshStandardMaterial({ color: 0xFFAA22, roughness: 0.4, transparent: true, opacity: 0.7 }),
};

// ---------- BUILD RESTAURANT ----------
export function createRestaurant(scn) {
    const restaurant = new THREE.Group();
    const tableData = [];

    // --- FLOOR (checkered) ---
    const tileSize = 1;
    const roomSize = 18;
    const halfRoom = roomSize / 2;
    const floorGroup = new THREE.Group();
    const tileGeo = new THREE.BoxGeometry(tileSize, 0.1, tileSize);
    for (let x = -halfRoom; x < halfRoom; x += tileSize) {
        for (let z = -halfRoom; z < halfRoom; z += tileSize) {
            const isLight = (Math.floor(x + halfRoom) + Math.floor(z + halfRoom)) % 2 === 0;
            const tile = new THREE.Mesh(tileGeo, isLight ? materials.floor1 : materials.floor2);
            tile.position.set(x + tileSize / 2, -0.05, z + tileSize / 2);
            tile.receiveShadow = true;
            floorGroup.add(tile);
        }
    }
    restaurant.add(floorGroup);

    // --- WALLS ---
    const wallH = 7, wallT = 0.3;
    // Back wall (z = -halfRoom)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize + wallT, wallH, wallT), materials.wall);
    backWall.position.set(0, wallH / 2, -halfRoom);
    backWall.receiveShadow = true;
    restaurant.add(backWall);

    // Right wall (x = halfRoom)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, roomSize + wallT), materials.wall);
    rightWall.position.set(halfRoom, wallH / 2, 0);
    rightWall.receiveShadow = true;
    restaurant.add(rightWall);

    // Left wall - with door gap
    const doorWidth = 3, doorHeight = 5;
    const doorZ = 3;
    // Left wall segment above door
    const leftAbove = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH - doorHeight, roomSize + wallT), materials.wall);
    leftAbove.position.set(-halfRoom, wallH - (wallH - doorHeight) / 2, 0);
    restaurant.add(leftAbove);
    // Left wall segment left of door
    const segLen1 = halfRoom + doorZ - doorWidth / 2;
    if (segLen1 > 0) {
        const seg1 = new THREE.Mesh(new THREE.BoxGeometry(wallT, doorHeight, segLen1), materials.wall);
        seg1.position.set(-halfRoom, doorHeight / 2, -halfRoom + segLen1 / 2);
        restaurant.add(seg1);
    }
    // Left wall segment right of door
    const doorEnd = doorZ + doorWidth / 2;
    const segLen2 = halfRoom - doorEnd;
    if (segLen2 > 0) {
        const seg2 = new THREE.Mesh(new THREE.BoxGeometry(wallT, doorHeight, segLen2), materials.wall);
        seg2.position.set(-halfRoom, doorHeight / 2, doorEnd + segLen2 / 2);
        restaurant.add(seg2);
    }

    // Door frame
    const frameTh = 0.25;
    // Top frame
    const doorTopFrame = new THREE.Mesh(new THREE.BoxGeometry(frameTh + 0.2, frameTh, doorWidth + frameTh * 2), materials.doorFrame);
    doorTopFrame.position.set(-halfRoom + 0.05, doorHeight, doorZ);
    restaurant.add(doorTopFrame);
    // Side frames
    for (const side of [-1, 1]) {
        const sf = new THREE.Mesh(new THREE.BoxGeometry(frameTh + 0.2, doorHeight, frameTh), materials.doorFrame);
        sf.position.set(-halfRoom + 0.05, doorHeight / 2, doorZ + side * (doorWidth / 2 + frameTh / 2));
        restaurant.add(sf);
    }

    // Door indicator (green dot)
    const indicator = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), materials.doorIndicator);
    indicator.position.set(-halfRoom + 0.3, doorHeight + 0.5, doorZ);
    restaurant.add(indicator);

    // Wall trim (baseboard)
    const trimH = 0.3;
    const trimBack = new THREE.Mesh(new THREE.BoxGeometry(roomSize, trimH, 0.05), materials.wallTrim);
    trimBack.position.set(0, trimH / 2, -halfRoom + 0.2);
    restaurant.add(trimBack);
    const trimRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, trimH, roomSize), materials.wallTrim);
    trimRight.position.set(halfRoom - 0.2, trimH / 2, 0);
    restaurant.add(trimRight);

    // --- NO CEILING (removed for top-down visibility) ---

    // --- TABLES ---
    const tablePositions = [
        { x: -4, z: -3, type: 'round', seats: 2 },
        { x: 1, z: 1, type: 'square', seats: 4 },
        { x: -3, z: 4, type: 'square', seats: 4 },
        { x: 4, z: -4, type: 'round', seats: 2 },
        { x: 5, z: 3, type: 'square', seats: 4 },
    ];

    tablePositions.forEach((tp, idx) => {
        const tableGroup = new THREE.Group();
        tableGroup.position.set(tp.x, 0, tp.z);

        if (tp.type === 'round') {
            // Round table
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 24), materials.tableWhite);
            top.position.y = 1.3;
            top.castShadow = true;
            tableGroup.add(top);
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.25, 8), materials.chairLeg);
            leg.position.y = 0.625;
            tableGroup.add(leg);
            // 2 chairs opposite
            for (let i = 0; i < tp.seats; i++) {
                const angle = (i / tp.seats) * Math.PI * 2;
                const chair = createChair();
                chair.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
                chair.rotation.y = angle + Math.PI;
                tableGroup.add(chair);
            }
        } else {
            // Square table
            const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.4), materials.tableWood);
            top.position.y = 1.3;
            top.castShadow = true;
            tableGroup.add(top);
            // 4 legs
            const legGeo = new THREE.BoxGeometry(0.08, 1.25, 0.08);
            for (const dx of [-0.6, 0.6]) {
                for (const dz of [-0.6, 0.6]) {
                    const leg = new THREE.Mesh(legGeo, materials.chairLeg);
                    leg.position.set(dx, 0.625, dz);
                    tableGroup.add(leg);
                }
            }
            // 4 chairs on sides
            const chairOffsets = [
                { x: 0, z: -1.3, ry: 0 },
                { x: 0, z: 1.3, ry: Math.PI },
                { x: -1.3, z: 0, ry: Math.PI / 2 },
                { x: 1.3, z: 0, ry: -Math.PI / 2 },
            ];
            chairOffsets.slice(0, tp.seats).forEach(co => {
                const chair = createChair();
                chair.position.set(co.x, 0, co.z);
                chair.rotation.y = co.ry;
                tableGroup.add(chair);
            });
        }

        tableGroup.userData = { type: 'table', index: idx, state: 'empty' };
        restaurant.add(tableGroup);
        tableData.push({
            group: tableGroup,
            position: new THREE.Vector3(tp.x, 0, tp.z),
            state: 'empty', // empty, occupied, dirty
            seats: tp.seats,
            type: tp.type,
            customerRef: null,
            orderRef: null,
        });
    });

    // --- HANGING LAMPS ---
    const lampPositions = [
        { x: -4, z: -3 }, { x: 1, z: 1 }, { x: -3, z: 4 },
        { x: 4, z: -4 }, { x: 5, z: 3 }, { x: 0, z: -5 },
    ];
    lampPositions.forEach(lp => {
        const lamp = createHangingLamp();
        lamp.position.set(lp.x, wallH, lp.z);
        restaurant.add(lamp);

        const light = new THREE.PointLight(0xFFAA44, 0.8, 10, 1.5);
        light.position.set(lp.x, wallH - 2.2, lp.z);
        light.castShadow = false;
        restaurant.add(light);
    });

    // --- COUNTER / KITCHEN (detailed) ---
    const kitchenGroup = new THREE.Group();
    kitchenGroup.userData = { type: 'kitchen' };
    const kz = -halfRoom + 1.2;

    // Main counter body (front bar)
    const counterBody = new THREE.Mesh(new THREE.BoxGeometry(6, 1.6, 1.4), materials.counter);
    counterBody.position.set(2, 0.8, kz);
    counterBody.castShadow = true;
    kitchenGroup.add(counterBody);

    // Counter top surface (dark granite)
    const counterTopMesh = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.1, 1.5), materials.counterTop);
    counterTopMesh.position.set(2, 1.62, kz);
    kitchenGroup.add(counterTopMesh);

    // Back wall kitchen panel
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xBBAAAA, roughness: 0.6 }));
    backPanel.position.set(2, 3.35, -halfRoom + 0.25);
    kitchenGroup.add(backPanel);

    // Service window / pass-through opening
    const windowFrame = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3, metalness: 0.5 });
    // Top bar
    const wfTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.25), windowFrame);
    wfTop.position.set(1.5, 4.0, -halfRoom + 0.35);
    kitchenGroup.add(wfTop);
    // Bottom bar (shelf for ready plates)
    const wfBot = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.6), windowFrame);
    wfBot.position.set(1.5, 2.6, -halfRoom + 0.5);
    kitchenGroup.add(wfBot);
    // Side bars
    for (const sx of [-0.25, 3.25]) {
        const sb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.25), windowFrame);
        sb.position.set(sx, 3.3, -halfRoom + 0.35);
        kitchenGroup.add(sb);
    }

    // Kitchen interior glow (warm light behind window)
    const kitchenGlow = new THREE.PointLight(0xFFAA44, 0.6, 6);
    kitchenGlow.position.set(1.5, 3.2, -halfRoom + 0.1);
    kitchenGroup.add(kitchenGlow);

    // Stove (2 burners on the counter)
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.6 });
    for (const bx of [-0.3, 0.5]) {
        const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16), burnerMat);
        burner.position.set(bx, 1.68, kz - 0.15);
        kitchenGroup.add(burner);
        // Burner ring
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24),
            new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(bx, 1.70, kz - 0.15);
        kitchenGroup.add(ring);
    }

    // Cash register (right side)
    const cashBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.5), materials.counterTop);
    cashBase.position.set(4.2, 1.80, kz);
    cashBase.castShadow = true;
    kitchenGroup.add(cashBase);
    const cashScreen = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x112211, emissive: 0x0a330a, emissiveIntensity: 0.6 }));
    cashScreen.position.set(4.2, 2.05, kz + 0.22);
    cashScreen.rotation.x = -0.2;
    kitchenGroup.add(cashScreen);

    // Serving plates area (3 plate spots on shelf)
    for (let i = 0; i < 3; i++) {
        const plateSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 12),
            new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, transparent: true, opacity: 0.3 }));
        plateSpot.position.set(0.5 + i * 1.0, 2.66, -halfRoom + 0.55);
        kitchenGroup.add(plateSpot);
    }

    // Ready food indicator light (hidden by default, shown when food is ready)
    const readyLight = new THREE.PointLight(0x44FF44, 0, 5);
    readyLight.position.set(1.5, 3.0, -halfRoom + 0.6);
    kitchenGroup.add(readyLight);

    const readyBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x44FF44, emissive: 0x22AA22, emissiveIntensity: 0, transparent: true }));
    readyBulb.position.set(3.4, 4.0, -halfRoom + 0.35);
    kitchenGroup.add(readyBulb);

    // Clickable area extender (invisible box for easier clicking)
    const clickArea = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4, 2),
        new THREE.MeshBasicMaterial({ visible: false }));
    clickArea.position.set(2, 2, kz - 0.2);
    kitchenGroup.add(clickArea);

    restaurant.add(kitchenGroup);

    const kitchenData = {
        group: kitchenGroup,
        position: new THREE.Vector3(2, 0, kz + 0.8),
        readyLight,
        readyBulb,
        readyOrders: [],
    };

    // --- BAR COUNTER (right wall) ---
    const barGroup = new THREE.Group();
    barGroup.userData = { type: 'bar' };
    const barX = halfRoom - 1.2;
    const barZStart = -2;
    const barLength = 6;

    // Main bar body
    const barBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, barLength), materials.barWood);
    barBody.position.set(barX, 0.8, barZStart + barLength / 2);
    barBody.castShadow = true;
    barGroup.add(barBody);

    // Bar top surface (dark polished)
    const barTopMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, barLength + 0.1), materials.barTop);
    barTopMesh.position.set(barX, 1.62, barZStart + barLength / 2);
    barGroup.add(barTopMesh);

    // Bar foot rail (brass rail at bottom)
    const footRail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, barLength - 0.4, 8),
        materials.barMetal);
    footRail.rotation.x = Math.PI / 2;
    footRail.position.set(barX - 0.6, 0.2, barZStart + barLength / 2);
    barGroup.add(footRail);

    // Back wall bar panel
    const barBackPanel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, barLength + 0.2),
        new THREE.MeshStandardMaterial({ color: 0x2A1A0E, roughness: 0.5 }));
    barBackPanel.position.set(halfRoom - 0.15, 2.8, barZStart + barLength / 2);
    barGroup.add(barBackPanel);

    // Bottle shelves (3 tiers)
    for (let tier = 0; tier < 3; tier++) {
        const shelfY = 2.0 + tier * 1.0;
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, barLength - 0.6), materials.barShelf);
        shelf.position.set(halfRoom - 0.35, shelfY, barZStart + barLength / 2);
        barGroup.add(shelf);

        // Bottles on shelf
        const bottleMats = [materials.bottleGreen, materials.bottleAmber, materials.bottleClear];
        const bottleCount = 5 + tier;
        for (let b = 0; b < bottleCount; b++) {
            const bMat = bottleMats[b % bottleMats.length];
            const bottleH = 0.4 + Math.random() * 0.15;
            const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, bottleH, 8), bMat);
            const bz = barZStart + 0.6 + b * ((barLength - 1.2) / bottleCount);
            bottle.position.set(halfRoom - 0.35, shelfY + 0.03 + bottleH / 2, bz);
            barGroup.add(bottle);
            // Bottle neck
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.12, 6), bMat);
            neck.position.set(halfRoom - 0.35, shelfY + 0.03 + bottleH + 0.06, bz);
            barGroup.add(neck);
        }
    }

    // Beer taps (3 taps)
    for (let t = 0; t < 3; t++) {
        const tapZ = barZStart + 1.5 + t * 1.5;
        // Tap base
        const tapBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), materials.barMetal);
        tapBase.position.set(barX + 0.1, 1.74, tapZ);
        barGroup.add(tapBase);
        // Tap handle
        const tapHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6),
            new THREE.MeshStandardMaterial({ color: [0xCC2222, 0x22CC22, 0x2222CC][t], roughness: 0.4, metalness: 0.3 }));
        tapHandle.position.set(barX + 0.1, 1.95, tapZ);
        barGroup.add(tapHandle);
        // Tap knob
        const tapKnob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshStandardMaterial({ color: [0xCC2222, 0x22CC22, 0x2222CC][t], roughness: 0.3 }));
        tapKnob.position.set(barX + 0.1, 2.12, tapZ);
        barGroup.add(tapKnob);
    }

    // Glass rack (hanging upside-down glasses)
    for (let g = 0; g < 4; g++) {
        const gz = barZStart + 1.0 + g * 1.3;
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.15, 8), materials.glassBody);
        glass.position.set(barX + 0.2, 3.0, gz);
        glass.rotation.x = Math.PI; // upside down
        barGroup.add(glass);
    }

    // Neon "BAR" sign glow
    const neonLight = new THREE.PointLight(0x00CCFF, 0.5, 6);
    neonLight.position.set(halfRoom - 0.4, 5.0, barZStart + barLength / 2);
    barGroup.add(neonLight);

    // Neon sign backing
    const neonBacking = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.8 }));
    neonBacking.position.set(halfRoom - 0.18, 5.0, barZStart + barLength / 2);
    barGroup.add(neonBacking);

    // Neon tube letters (simplified as glowing bar)
    const neonTube = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 1.8), materials.barNeon);
    neonTube.position.set(halfRoom - 0.22, 5.0, barZStart + barLength / 2);
    barGroup.add(neonTube);

    // Ready drink indicator light
    const barReadyLight = new THREE.PointLight(0x00CCFF, 0, 5);
    barReadyLight.position.set(barX, 2.5, barZStart + barLength / 2);
    barGroup.add(barReadyLight);

    const barReadyBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x00CCFF, emissive: 0x0088CC, emissiveIntensity: 0, transparent: true }));
    barReadyBulb.position.set(barX - 0.4, 3.5, barZStart + 0.5);
    barGroup.add(barReadyBulb);

    // Clickable area extender for bar
    const barClickArea = new THREE.Mesh(new THREE.BoxGeometry(2, 4, barLength + 1),
        new THREE.MeshBasicMaterial({ visible: false }));
    barClickArea.position.set(barX, 2, barZStart + barLength / 2);
    barGroup.add(barClickArea);

    // Bar ambient light (warm)
    const barAmbient = new THREE.PointLight(0xFFCC88, 0.3, 5);
    barAmbient.position.set(barX - 0.5, 2.5, barZStart + barLength / 2);
    barGroup.add(barAmbient);

    restaurant.add(barGroup);

    const barData = {
        group: barGroup,
        position: new THREE.Vector3(barX - 1.0, 0, barZStart + barLength / 2),
        readyLight: barReadyLight,
        readyBulb: barReadyBulb,
        readyOrders: [],
    };

    // --- WALL PAINTINGS ---
    const paintings = [
        { x: -2, y: 3.5, z: -halfRoom + 0.14, ry: 0, w: 2, h: 1.5, color: 0x5A4A2A },
        { x: -6, y: 4, z: -halfRoom + 0.14, ry: 0, w: 1.2, h: 1.2, color: 0x3A5A3A },
    ];
    paintings.forEach(p => {
        const frame = createPainting(p.w, p.h, p.color);
        frame.position.set(p.x, p.y, p.z);
        frame.rotation.y = p.ry;
        restaurant.add(frame);
    });

    // Door position (where customers appear)
    const doorPosition = new THREE.Vector3(-halfRoom - 1, 0, doorZ);

    scn.add(restaurant);

    return { restaurant, tables: tableData, kitchen: kitchenData, bar: barData, doorPosition };
}

// ---------- HELPER: Create Chair ----------
function createChair() {
    const group = new THREE.Group();
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), materials.chairRed);
    seat.position.y = 0.75;
    seat.castShadow = true;
    group.add(seat);
    // Back
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.08), materials.chairRed);
    back.position.set(0, 1.09, -0.24);
    group.add(back);
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6);
    for (const dx of [-0.2, 0.2]) {
        for (const dz of [-0.2, 0.2]) {
            const leg = new THREE.Mesh(legGeo, materials.chairLeg);
            leg.position.set(dx, 0.375, dz);
            group.add(leg);
        }
    }
    return group;
}

// ---------- HELPER: Create Hanging Lamp ----------
function createHangingLamp() {
    const group = new THREE.Group();
    // Wire
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 6), materials.lampWire);
    wire.position.y = -1;
    group.add(wire);
    // Shade (cone)
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.4, 12, 1, true), materials.lampShade);
    shade.position.y = -2.1;
    shade.rotation.x = Math.PI;
    group.add(shade);
    // Bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFFF88, emissive: 0xFFDD44, emissiveIntensity: 1 }));
    bulb.position.y = -2.0;
    group.add(bulb);
    return group;
}

// ---------- HELPER: Create Painting ----------
function createPainting(w, h, color) {
    const group = new THREE.Group();
    const frameTh = 0.08;
    // Canvas
    const canvas = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
    group.add(canvas);
    // Frame borders
    const frameMat = materials.paintingFrame;
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + frameTh * 2, frameTh, 0.08), frameMat);
    top.position.y = h / 2 + frameTh / 2;
    group.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(w + frameTh * 2, frameTh, 0.08), frameMat);
    bot.position.y = -(h / 2 + frameTh / 2);
    group.add(bot);
    const left = new THREE.Mesh(new THREE.BoxGeometry(frameTh, h, 0.08), frameMat);
    left.position.x = -(w / 2 + frameTh / 2);
    group.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(frameTh, h, 0.08), frameMat);
    right.position.x = w / 2 + frameTh / 2;
    group.add(right);
    return group;
}

// ---------- CHARACTER MODELS ----------
export function createWaiterModel() {
    const group = new THREE.Group();
    group.userData = { type: 'waiter' };
    // Body (black uniform)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 1.0, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }));
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);
    // Apron (white)
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xEEEEEE, roughness: 0.5 }));
    apron.position.set(0, 0.65, 0.2);
    group.add(apron);
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xFFDBAC, roughness: 0.7 }));
    head.position.y = 1.52;
    head.castShadow = true;
    group.add(head);
    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x2A1A0A }));
    hair.position.y = 1.55;
    group.add(hair);
    return group;
}

export function createCustomerModel(colorIndex) {
    const colors = [0xCC3333, 0x3333CC, 0x33AA33, 0xCC8833, 0x8833CC, 0x33AAAA];
    const shirtColor = colors[colorIndex % colors.length];
    const group = new THREE.Group();
    group.userData = { type: 'customer' };
    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 }));
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xFFDBAC, roughness: 0.7 }));
    head.position.y = 1.42;
    head.castShadow = true;
    group.add(head);
    // Hair
    const hairMat = new THREE.MeshStandardMaterial({
        color: [0x2A1A0A, 0x8B4513, 0x1A1A1A, 0xDAA520][colorIndex % 4]
    });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
    hair.position.y = 1.45;
    group.add(hair);
    return group;
}

// ---------- FOOD PLATE MODEL ----------
export function createPlateModel() {
    const group = new THREE.Group();
    // Plate
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.3 }));
    plate.position.y = 1.38;
    group.add(plate);
    // Food
    const food = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xCC6633, roughness: 0.8 }));
    food.position.y = 1.45;
    food.scale.y = 0.5;
    group.add(food);
    return group;
}

export function createDirtyTableIndicator() {
    const group = new THREE.Group();
    const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0xDDDDDD, roughness: 0.4 }));
    plate1.position.set(-0.15, 1.38, 0.1);
    group.add(plate1);
    const plate2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.4 }));
    plate2.position.set(0.2, 1.38, -0.1);
    group.add(plate2);
    return group;
}

// ---------- PATIENCE BAR (3D floating above customers) ----------
export function createPatienceBar() {
    const group = new THREE.Group();
    const barWidth = 0.9;
    const barHeight = 0.1;

    // Background bar (dark)
    const bgGeo = new THREE.PlaneGeometry(barWidth, barHeight);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthTest: false });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    group.add(bg);

    // Border
    const borderGeo = new THREE.PlaneGeometry(barWidth + 0.04, barHeight + 0.04);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthTest: false });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.z = -0.001;
    group.add(border);

    // Fill bar (starts green)
    const fillGeo = new THREE.PlaneGeometry(barWidth - 0.04, barHeight - 0.03);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x44CC44, side: THREE.DoubleSide, depthTest: false });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.z = 0.001;
    group.add(fill);

    // Emoji indicator (sprite)
    const emojiCanvas = document.createElement('canvas');
    emojiCanvas.width = 64;
    emojiCanvas.height = 64;
    const emojiCtx = emojiCanvas.getContext('2d');
    emojiCtx.font = '48px serif';
    emojiCtx.textAlign = 'center';
    emojiCtx.textBaseline = 'middle';
    emojiCtx.fillText('😊', 32, 32);
    const emojiTexture = new THREE.CanvasTexture(emojiCanvas);
    const emojiMat = new THREE.SpriteMaterial({ map: emojiTexture, depthTest: false });
    const emojiSprite = new THREE.Sprite(emojiMat);
    emojiSprite.scale.set(0.35, 0.35, 1);
    emojiSprite.position.set(0, 0.22, 0);
    group.add(emojiSprite);

    group.userData = { fill, fillMat, bg, barWidth: barWidth - 0.04, emojiSprite, emojiCanvas, emojiCtx, emojiTexture };
    group.renderOrder = 999;
    return group;
}

export function updatePatienceBar(bar, ratio, camera) {
    const data = bar.userData;
    const fill = data.fill;
    const mat = data.fillMat;
    const clampedRatio = Math.max(0, Math.min(1, ratio));

    // Scale and reposition fill bar
    fill.scale.x = clampedRatio;
    fill.position.x = -(data.barWidth * (1 - clampedRatio)) / 2;

    // Color transition: green → yellow → orange → red
    if (clampedRatio > 0.65) {
        mat.color.setHex(0x44CC44); // green
    } else if (clampedRatio > 0.4) {
        mat.color.setHex(0xFFBB00); // yellow/orange
    } else if (clampedRatio > 0.2) {
        mat.color.setHex(0xFF6600); // orange
    } else {
        mat.color.setHex(0xEE2222); // red
    }

    // Flashing when critical (< 20%)
    if (clampedRatio < 0.2) {
        const flash = Math.sin(performance.now() * 0.01) > 0;
        data.bg.material.color.setHex(flash ? 0x441111 : 0x222222);
    } else {
        data.bg.material.color.setHex(0x222222);
    }

    // Update emoji based on patience
    let emoji = '😊';
    if (clampedRatio < 0.2) emoji = '😡';
    else if (clampedRatio < 0.4) emoji = '😠';
    else if (clampedRatio < 0.65) emoji = '😐';

    const ctx = data.emojiCtx;
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 32, 32);
    data.emojiTexture.needsUpdate = true;

    // Billboard: always face camera
    if (camera) {
        bar.quaternion.copy(camera.quaternion);
    }
}

// ---------- KITCHEN READY INDICATOR ----------
export function updateKitchenReady(kitchenData, hasReadyOrders) {
    if (!kitchenData.readyLight || !kitchenData.readyBulb) return;
    const t = performance.now() * 0.003;
    if (hasReadyOrders) {
        kitchenData.readyLight.intensity = 1.0 + Math.sin(t) * 0.5;
        kitchenData.readyBulb.material.emissiveIntensity = 0.8 + Math.sin(t) * 0.3;
        kitchenData.readyBulb.material.opacity = 1;
    } else {
        kitchenData.readyLight.intensity = 0;
        kitchenData.readyBulb.material.emissiveIntensity = 0;
        kitchenData.readyBulb.material.opacity = 0.2;
    }
}

// ---------- BAR READY INDICATOR ----------
export function updateBarReady(barData, hasReadyDrinks) {
    if (!barData || !barData.readyLight || !barData.readyBulb) return;
    const t = performance.now() * 0.004;
    if (hasReadyDrinks) {
        barData.readyLight.intensity = 1.2 + Math.sin(t) * 0.6;
        barData.readyBulb.material.emissiveIntensity = 0.9 + Math.sin(t) * 0.4;
        barData.readyBulb.material.opacity = 1;
    } else {
        barData.readyLight.intensity = 0;
        barData.readyBulb.material.emissiveIntensity = 0;
        barData.readyBulb.material.opacity = 0.2;
    }
}

// ---------- DRINK GLASS MODEL ----------
export function createDrinkModel() {
    const group = new THREE.Group();
    // Glass body
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.28, 12),
        materials.glassBody);
    glass.position.y = 1.42;
    group.add(glass);
    // Liquid inside
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.20, 12),
        materials.drinkLiquid);
    liquid.position.y = 1.38;
    group.add(liquid);
    // Straw
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6),
        new THREE.MeshStandardMaterial({ color: 0xEE3333, roughness: 0.5 }));
    straw.position.set(0.04, 1.52, 0.02);
    straw.rotation.z = 0.15;
    group.add(straw);
    return group;
}
