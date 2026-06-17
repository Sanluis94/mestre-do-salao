// ==========================================
// scene.js — Three.js Scene + Restaurant 3D Models
// ==========================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;

// ---------- SCENE INITIALIZATION ----------
export function initScene(canvas) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF6E5);
    scene.fog = new THREE.Fog(0xFFF6E5, 30, 70);

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
    const ambient = new THREE.AmbientLight(0xFFF0DD, 0.75);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xFFF5E6, 0.8);
    dirLight.position.set(12, 20, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFE8D6, 0.4);
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
    // Cat Cafe warm pastel palette
    floor1: new THREE.MeshStandardMaterial({ color: 0xFFEBD6, roughness: 0.9 }),
    floor2: new THREE.MeshStandardMaterial({ color: 0xFFDFBF, roughness: 0.9 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xFFFAEB, roughness: 0.8 }),
    wallTrim: new THREE.MeshStandardMaterial({ color: 0xFFCBA4, roughness: 0.7 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xFFEBD6, roughness: 1.0 }),
    tableWood: new THREE.MeshStandardMaterial({ color: 0xE2C2A4, roughness: 0.6 }),
    tableWhite: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 }),
    chairRed: new THREE.MeshStandardMaterial({ color: 0xFFD1DC, roughness: 0.7 }),  // Pastel pink chairs
    chairLeg: new THREE.MeshStandardMaterial({ color: 0xD3B599, roughness: 0.5 }),
    lampShade: new THREE.MeshStandardMaterial({ color: 0xFFE5B4, roughness: 0.4, emissive: 0xFFDAB9, emissiveIntensity: 0.3 }),
    lampWire: new THREE.MeshStandardMaterial({ color: 0x998473, roughness: 0.6 }),
    counter: new THREE.MeshStandardMaterial({ color: 0xFFEFD5, roughness: 0.4 }),
    counterTop: new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.3 }),
    doorFrame: new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.6 }),
    painting: new THREE.MeshStandardMaterial({ color: 0x8FBC8F, roughness: 0.6 }),
    paintingFrame: new THREE.MeshStandardMaterial({ color: 0xCD853F, roughness: 0.5 }),
    doorIndicator: new THREE.MeshStandardMaterial({ color: 0x98FB98, emissive: 0x90EE90, emissiveIntensity: 0.6, roughness: 0.4 }),
    // Bar materials (milk bar / treat counter)
    barWood: new THREE.MeshStandardMaterial({ color: 0xE8B890, roughness: 0.6 }),
    barTop: new THREE.MeshStandardMaterial({ color: 0xFFFAF0, roughness: 0.2 }),
    barShelf: new THREE.MeshStandardMaterial({ color: 0xCDA585, roughness: 0.5 }),
    barMetal: new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.4, metalness: 0.2 }),
    barNeon: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, emissive: 0xFFC0CB, emissiveIntensity: 0.8, roughness: 0.4 }),
    bottleGreen: new THREE.MeshStandardMaterial({ color: 0xA8E6CF, roughness: 0.2, transparent: true, opacity: 0.9 }),
    bottleAmber: new THREE.MeshStandardMaterial({ color: 0xFFD3B6, roughness: 0.2, transparent: true, opacity: 0.9 }),
    bottleClear: new THREE.MeshStandardMaterial({ color: 0xFDFD96, roughness: 0.1, transparent: true, opacity: 0.8 }),
    glassBody: new THREE.MeshStandardMaterial({ color: 0xF0F8FF, roughness: 0.1, transparent: true, opacity: 0.6 }),
    drinkLiquid: new THREE.MeshStandardMaterial({ color: 0xFFF5EE, roughness: 0.3, transparent: true, opacity: 0.95 }),
    // Cat fur materials
    catBlack: new THREE.MeshStandardMaterial({ color: 0x3D3A3B, roughness: 0.95 }),
    catWhite: new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.95 }),
    catOrange: new THREE.MeshStandardMaterial({ color: 0xFFAD7A, roughness: 0.95 }),
    catGray: new THREE.MeshStandardMaterial({ color: 0xAEB3B7, roughness: 0.95 }),
    catPink: new THREE.MeshStandardMaterial({ color: 0xFFC5D9, roughness: 0.8 }),  // Nose/inner ear
    catBowTie: new THREE.MeshStandardMaterial({ color: 0xFF9E9E, roughness: 0.6 }),
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
        { x: -5, z: -4, type: 'round', seats: 2 },
        { x: 0.5, z: 1.5, type: 'square', seats: 4 },
        { x: -4, z: 6, type: 'square', seats: 4 },
        { x: 6, z: -4, type: 'round', seats: 2 },
        { x: 6, z: 1.5, type: 'square', seats: 4 },
        // Progression tables:
        { x: -5, z: 1, type: 'round', seats: 2 },
        { x: 0, z: -4, type: 'square', seats: 4 },
        { x: 2, z: 6, type: 'square', seats: 4 },
    ];

    tablePositions.forEach((tp, idx) => {
        const tableGroup = new THREE.Group();
        tableGroup.position.set(tp.x, 0, tp.z);

        if (tp.type === 'round') {
            // Cute Tree Stump Table (Cats & Soup style)
            const stumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x8E6A45, roughness: 0.9 }));
            stumpTop.position.y = 0.4;
            stumpTop.castShadow = true;
            tableGroup.add(stumpTop);
            
            // Tree rings on top
            const rings = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.82, 12), new THREE.MeshStandardMaterial({ color: 0xD3A978, roughness: 0.8 }));
            rings.position.y = 0.4;
            tableGroup.add(rings);
            
            // 2 Puff chairs opposite
            for (let i = 0; i < tp.seats; i++) {
                const angle = (i / tp.seats) * Math.PI * 2;
                const chair = createPuffChair();
                chair.position.set(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5);
                chair.rotation.y = angle + Math.PI;
                tableGroup.add(chair);
            }
        } else {
            // Cute Pastel Picnic/Cafe Table (Rounded)
            // Use a cylinder for a rounded square look by passing 4 radial segments and rotating 45 deg
            const top = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.15, 8), materials.tableWood);
            top.position.y = 0.9;
            top.rotation.y = Math.PI / 8; // Offset the 8-sided cylinder to look like a chamfered square
            top.castShadow = true;
            tableGroup.add(top);
            
            // Cute thick legs
            const legGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.9, 8);
            const legOffset = 0.7;
            for (const dx of [-legOffset, legOffset]) {
                for (const dz of [-legOffset, legOffset]) {
                    const leg = new THREE.Mesh(legGeo, materials.chairLeg);
                    leg.position.set(dx, 0.45, dz);
                    tableGroup.add(leg);
                }
            }
            // 4 Puff chairs on sides
            const chairOffsets = [
                { x: 0, z: -1.4, ry: 0 },
                { x: 0, z: 1.4, ry: Math.PI },
                { x: -1.4, z: 0, ry: Math.PI / 2 },
                { x: 1.4, z: 0, ry: -Math.PI / 2 },
            ];
            chairOffsets.slice(0, tp.seats).forEach(co => {
                const chair = createPuffChair();
                chair.position.set(co.x, 0, co.z);
                chair.rotation.y = co.ry;
                tableGroup.add(chair);
            });
        }

        tableGroup.userData = { type: 'table', index: idx, state: 'empty' };
        restaurant.add(tableGroup);
        tableData.push({
            index: idx,
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
        { x: -5, z: -4 }, { x: 0.5, z: 1.5 }, { x: -4, z: 6 },
        { x: 6, z: -4 }, { x: 6, z: 1.5 }, { x: -5, z: 1 },
        { x: 0, z: -4 }, { x: 2, z: 6 }
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

    // --- KITCHEN (Cute Cats & Soup Style) ---
    const kitchenGroup = new THREE.Group();
    kitchenGroup.userData = { type: 'kitchen' };
    const kz = -halfRoom + 1.6; // Moved forward to completely avoid wall clipping (z-fighting)

    // Cute pastel counter body
    const counterGeo = new THREE.BoxGeometry(6, 1.6, 1.6);
    const counterBody = new THREE.Mesh(counterGeo, new THREE.MeshStandardMaterial({ color: 0xFFE0E0, roughness: 0.8 })); // Pastel pink
    counterBody.position.set(2, 0.8, kz);
    counterBody.castShadow = true;
    kitchenGroup.add(counterBody);

    // Light wooden top
    const counterTopMesh = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.15, 1.8), new THREE.MeshStandardMaterial({ color: 0xF5DEB3, roughness: 0.7 })); // Wheat/wood
    counterTopMesh.position.set(2, 1.675, kz);
    kitchenGroup.add(counterTopMesh);

    // Cute striped awning/canopy above the kitchen
    for(let i = 0; i < 8; i++) {
        const stripeMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xFF9E9E : 0xFFFFFF, roughness: 0.9 });
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 2.8), stripeMat);
        stripe.position.set(-0.8 + i * 0.8, 4.5, kz - 0.2);
        stripe.rotation.x = Math.PI / 8; // Tilted downward
        kitchenGroup.add(stripe);
    }
    
    // Awning wooden supports
    const supportMat = new THREE.MeshStandardMaterial({ color: 0x8E6A45, roughness: 0.8 });
    for (const sx of [-1.1, 5.1]) {
        const support = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), supportMat);
        support.position.set(sx, 3.0, kz - 1.2);
        kitchenGroup.add(support);
    }

    // A cute brick oven in the back
    const ovenGeo = new THREE.BoxGeometry(2.4, 2.2, 1.2);
    const ovenMat = new THREE.MeshStandardMaterial({ color: 0xD98D71, roughness: 0.9 }); // Terracotta
    const oven = new THREE.Mesh(ovenGeo, ovenMat);
    oven.position.set(2, 1.1, kz - 0.3); // Sits on back half
    kitchenGroup.add(oven);
    
    // Oven arch (mouth)
    const mouthGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.25, 16, 1, false, 0, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x221111, roughness: 1.0 }); // Dark inside
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI / 2;
    mouth.position.set(2, 1.8, kz + 0.3); // Front of oven
    kitchenGroup.add(mouth);

    // Fire glow inside oven
    const fireLight = new THREE.PointLight(0xFF7700, 1.5, 6);
    fireLight.position.set(2, 1.7, kz);
    kitchenGroup.add(fireLight);

    // Wooden cutting board and fish prop
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.8), new THREE.MeshStandardMaterial({ color: 0xC19A6B }));
    board.position.set(4, 1.76, kz + 0.3);
    kitchenGroup.add(board);
    
    const fishProp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x87CEEB })); // Light blue fish
    fishProp.rotation.z = Math.PI / 2;
    fishProp.position.set(4, 1.82, kz + 0.3);
    kitchenGroup.add(fishProp);

    // Serving plates area (3 cute round plate spots on shelf)
    for (let i = 0; i < 3; i++) {
        const plateSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.4 }));
        plateSpot.position.set(0.0 + i * 0.9, 1.77, kz + 0.4);
        kitchenGroup.add(plateSpot);
    }

    // Stack of plates on counter
    const plateGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.02, 12);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.4 });
    for (let i = 0; i < 5; i++) {
        const pl = new THREE.Mesh(plateGeo, plateMat);
        pl.position.set(4.6, 1.76 + 0.01 + i * 0.025, kz + 0.25);
        pl.castShadow = true;
        kitchenGroup.add(pl);
    }

    // Ready food indicator light (Soft green glow)
    const readyLight = new THREE.PointLight(0x44FF44, 0, 5);
    readyLight.position.set(1.0, 3.0, kz + 0.5);
    kitchenGroup.add(readyLight);

    const readyBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x44FF44, emissive: 0x22AA22, emissiveIntensity: 0 }));
    readyBulb.position.set(1.0, 3.5, kz + 0.2);
    kitchenGroup.add(readyBulb);

    // Clickable area extender
    const clickArea = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4, 3), new THREE.MeshBasicMaterial({ visible: false }));
    clickArea.position.set(2, 2, kz);
    kitchenGroup.add(clickArea);

    restaurant.add(kitchenGroup);

    const kitchenData = {
        group: kitchenGroup,
        position: new THREE.Vector3(2, 0, kz + 1.4), // Waiter approach point
        readyLight,
        readyBulb,
        readyOrders: [],
    };    // --- MILK & JUICE BAR (Cute Cats & Soup Style) ---
    const barGroup = new THREE.Group();
    barGroup.userData = { type: 'bar' };
    const barX = halfRoom - 1.5; // Moved inward to strictly avoid wall clipping
    const barZStart = -1.5;
    const barLength = 5.5;

    // Cute mint-green bar counter
    const barBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, barLength), new THREE.MeshStandardMaterial({ color: 0x98FF98, roughness: 0.8 })); // Mint green
    barBody.position.set(barX, 0.75, barZStart + barLength / 2);
    barBody.castShadow = true;
    barGroup.add(barBody);

    // Light wooden top
    const barTopMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, barLength + 0.2), new THREE.MeshStandardMaterial({ color: 0xF5DEB3, roughness: 0.7 }));
    barTopMesh.position.set(barX - 0.1, 1.575, barZStart + barLength / 2);
    barGroup.add(barTopMesh);

    // Cute canopy (Yellow and White stripes)
    for(let i = 0; i < 7; i++) {
        const stripeMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xFFE066 : 0xFFFFFF, roughness: 0.9 });
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.8), stripeMat);
        stripe.position.set(barX - 0.5, 4.5, barZStart + 0.35 + i * 0.8);
        stripe.rotation.z = Math.PI / 8; // Tilted toward center of room
        barGroup.add(stripe);
    }
    
    // Canopy wooden supports
    for (const sz of [barZStart + 0.2, barZStart + barLength - 0.2]) {
        const support = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), supportMat);
        support.position.set(barX - 0.8, 3.0, sz);
        barGroup.add(support);
    }

    // A cute pink blender on the counter
    const blenderBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0xFFB6C1 })); 
    blenderBase.position.set(barX + 0.2, 1.8, barZStart + 4);
    barGroup.add(blenderBase);
    const blenderJug = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.6 }));
    blenderJug.position.set(barX + 0.2, 2.2, barZStart + 4);
    barGroup.add(blenderJug);
    
    // Milk bottles
    for(let i = 0; i < 3; i++) {
        const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.2 }));
        milk.position.set(barX + 0.3, 1.8, barZStart + 1 + i * 0.35);
        barGroup.add(milk);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), new THREE.MeshStandardMaterial({ color: 0xFF0000 }));
        cap.position.set(barX + 0.3, 1.97, barZStart + 1 + i * 0.35);
        barGroup.add(cap);
    }

    // Floating wooden shelves (moved away from back wall)
    for (let tier = 0; tier < 2; tier++) {
        const shelfY = 2.4 + tier * 0.9;
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, barLength - 1), new THREE.MeshStandardMaterial({ color: 0xD3B599 }));
        shelf.position.set(barX + 0.4, shelfY, barZStart + barLength / 2); 
        barGroup.add(shelf);
        // Cute colorful cups on each shelf
        for (let b = 0; b < 4; b++) {
            const cupColor = b % 2 === 0 ? 0xFFB6C1 : 0x87CEEB;
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.25, 12), new THREE.MeshStandardMaterial({ color: cupColor }));
            const bz = barZStart + 1.2 + b * 1.0;
            cup.position.set(barX + 0.4, shelfY + 0.15, bz);
            barGroup.add(cup);
        }
    }

    // Ready drink indicator light (soft green glow)
    const barReadyLight = new THREE.PointLight(0x44FF44, 0, 5);
    barReadyLight.position.set(barX - 0.5, 3.0, barZStart + barLength / 2);
    barGroup.add(barReadyLight);

    const barReadyBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x44FF44, emissive: 0x22AA22, emissiveIntensity: 0 }));
    barReadyBulb.position.set(barX - 0.5, 3.8, barZStart + barLength / 2);
    barGroup.add(barReadyBulb);

    // Clickable area
    const barClickArea = new THREE.Mesh(new THREE.BoxGeometry(2, 4, barLength),
        new THREE.MeshBasicMaterial({ visible: false }));
    barClickArea.position.set(barX, 2, barZStart + barLength / 2);
    barGroup.add(barClickArea);

    // Bar ambient light (warm yellow)
    const barAmbient = new THREE.PointLight(0xFFCC88, 0.4, 6);
    barAmbient.position.set(barX - 0.5, 2.5, barZStart + barLength / 2);
    barGroup.add(barAmbient);

    restaurant.add(barGroup);

    const barData = {
        group: barGroup,
        position: new THREE.Vector3(barX - 1.4, 0, barZStart + barLength / 2),
        readyLight: barReadyLight,
        readyBulb: barReadyBulb,
        readyOrders: [],
    };

    // --- WALL PAINTINGS (Cat themed) ---
    const paintings = [
        { x: -2, y: 3.5, z: -halfRoom + 0.14, ry: 0, w: 2, h: 1.5, color: 0xFFB347 },  // Orange cat portrait
        { x: -6, y: 4, z: -halfRoom + 0.14, ry: 0, w: 1.2, h: 1.2, color: 0x87CEEB },  // Blue fish painting
    ];
    paintings.forEach(p => {
        const frame = createPainting(p.w, p.h, p.color);
        frame.position.set(p.x, p.y, p.z);
        frame.rotation.y = p.ry;
        restaurant.add(frame);
    });

    // --- PAW PRINT DECORATIONS (floor accents) ---
    const pawPrintMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.9, transparent: true, opacity: 0.3 });
    const pawPositions = [{x: -2, z: 0}, {x: 3, z: -2}, {x: 0, z: 5}, {x: -5, z: -5}];
    pawPositions.forEach(pp => {
        // Main pad
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 12), pawPrintMat);
        pad.position.set(pp.x, 0.01, pp.z);
        pad.receiveShadow = true;
        restaurant.add(pad);
        // Toe beans (4 small circles)
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI + Math.PI * 0.25;
            const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 8), pawPrintMat);
            toe.position.set(pp.x + Math.cos(angle) * 0.3, 0.01, pp.z + Math.sin(angle) * 0.3);
            toe.receiveShadow = true;
            restaurant.add(toe);
        }
    });

    // --- ADDITIONAL VISUAL DETAILS (Windows, Clock, Rugs, Supplies, Blackboard) ---
    // 1. Windows with Plant Pots
    const window1 = createWindowWithPlant();
    window1.position.set(-6, 3.5, -halfRoom + 0.12);
    restaurant.add(window1);

    const window2 = createWindowWithPlant();
    window2.position.set(halfRoom - 0.12, 3.5, 4.0);
    window2.rotation.y = -Math.PI / 2;
    restaurant.add(window2);

    // 2. Cat Clock (with Swinging Tail Pendulum)
    const clock = createCatClock();
    clock.position.set(2.0, 4.2, -halfRoom + 0.12);
    restaurant.add(clock);
    const clockTail = clock.userData.tailPivot; // reference to animate in main.js

    // 3. Cat Rug near entrance
    const rug = createCatRug();
    rug.position.set(-5.5, 0.005, doorZ);
    restaurant.add(rug);

    // 4. Supplies sacks in kitchen corner
    const sacks = createSuppliesPile();
    sacks.position.set(-0.5, 0.0, -halfRoom + 1.2);
    restaurant.add(sacks);

    // 5. Bar Menu Blackboard
    const blackboard = createBlackboard();
    blackboard.position.set(halfRoom - 0.12, 3.2, barZStart + 1.8);
    blackboard.rotation.y = -Math.PI / 2;
    restaurant.add(blackboard);

    // Door position (where customers appear)
    const doorPosition = new THREE.Vector3(-halfRoom - 1, 0, doorZ);

    // --- ANIMATED OBJECTS REGISTRY ---
    // Objects here are animated in main.js gameLoop
    const animatedObjects = [];

    // Register the two plant leaf groups for a gentle sway
    // We need to get refs to them. Re-use createWindowWithPlant's returned data.
    // Since we don't have direct refs, we'll use the clock's tail (already via clockTail).
    // For plants, we scan the window groups for the leaf child (position z > 0 pattern).
    [window1, window2].forEach((win, wi) => {
        // The leaves group is the last child added (index varies), so find by position
        win.traverse(child => {
            if (child.isGroup && child.children.length >= 4 && Math.abs(child.position.x) > 0.4) {
                animatedObjects.push({
                    type: 'sway',
                    mesh: child,
                    speed: 0.0008 + wi * 0.0003,
                    amplitude: 0.04,
                    offset: wi * 1.2,
                });
            }
        });
    });

    scn.add(restaurant);

    return { restaurant, tables: tableData, kitchen: kitchenData, bar: barData, doorPosition, clockTail, animatedObjects };
}

// ---------- HELPER: Create Puff Chair (Cats & Soup Style) ----------
function createPuffChair() {
    const group = new THREE.Group();
    // Cute round cushion puff
    const puffGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const puffMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.9 }); // Pastel pink puff
    const puff = new THREE.Mesh(puffGeo, puffMat);
    puff.scale.set(1, 0.6, 1);
    puff.position.y = 0.24;
    puff.castShadow = true;
    group.add(puff);
    
    // Wooden base
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16);
    const base = new THREE.Mesh(baseGeo, materials.chairLeg);
    base.position.y = 0.05;
    group.add(base);
    
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

// ---------- HELPER: Create Window with Plant Pot ----------
function createWindowWithPlant() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.6 }); // Cozy white wood
    
    // Glass pane (light blue/cyan translucid)
    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.6, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xBAE1FF, roughness: 0.1, transparent: true, opacity: 0.6 })
    );
    group.add(glass);

    // Outer frame borders
    const th = 0.06;
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2 + th * 2, th, 0.08), frameMat);
    top.position.y = 0.8 + th / 2;
    group.add(top);
    
    const bot = new THREE.Mesh(new THREE.BoxGeometry(2.2 + th * 2, th, 0.08), frameMat);
    bot.position.y = -0.8 - th / 2;
    group.add(bot);

    const left = new THREE.Mesh(new THREE.BoxGeometry(th, 1.6, 0.08), frameMat);
    left.position.x = -1.1 - th / 2;
    group.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(th, 1.6, 0.08), frameMat);
    right.position.x = 1.1 + th / 2;
    group.add(right);

    // Inner cross grid
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.03, 0.04), frameMat);
    group.add(hBar);

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.6, 0.04), frameMat);
    group.add(vBar);

    // Window Sill (wooden shelf)
    const sill = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.05, 0.28),
        new THREE.MeshStandardMaterial({ color: 0xD3A978, roughness: 0.7 })
    );
    sill.position.set(0, -0.825, 0.13);
    group.add(sill);

    // Flower Pot on the sill
    const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0xD98D71, roughness: 0.9 }) // Terracotta
    );
    pot.position.set(0.6, -0.725, 0.14);
    pot.castShadow = true;
    group.add(pot);

    // Green plant (succulent cluster)
    const leaves = new THREE.Group();
    leaves.position.set(0.6, -0.62, 0.14);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x81C784, roughness: 0.8 }); // Green
    
    const centerLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), leafMat);
    centerLeaf.scale.set(1, 0.8, 1);
    leaves.add(centerLeaf);

    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), leafMat);
        leaf.position.set(Math.cos(angle) * 0.06, -0.02, Math.sin(angle) * 0.06);
        leaves.add(leaf);
    }
    group.add(leaves);

    return group;
}

// ---------- HELPER: Create Cat Clock with Swinging Pendulum ----------
function createCatClock() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4A3E3D, roughness: 0.5 }); // Dark brown body

    // Cat head outline (flat cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 12);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    group.add(body);

    // Cat ears on top
    const earMat = bodyMat;
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 4), earMat);
        ear.position.set(side * 0.2, 0.35, 0);
        ear.rotation.z = side * -0.15;
        group.add(ear);
    }

    // White clock face
    const faceGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.07, 12);
    const face = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 }));
    face.rotation.x = Math.PI / 2;
    face.position.z = 0.01;
    group.add(face);

    // Clock nose (tiny pink dot)
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshStandardMaterial({ color: 0xFFB6C1 }));
    nose.position.set(0, 0.02, 0.05);
    group.add(nose);

    // Clock eyes (two small black spheres)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        eye.position.set(side * 0.1, 0.1, 0.05);
        group.add(eye);
    }

    // Hands (hour and minute hands)
    const handMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.01), handMat);
    hourHand.position.set(0, 0.06, 0.05);
    hourHand.rotation.z = -Math.PI / 3;
    group.add(hourHand);

    const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.01), handMat);
    minuteHand.position.set(0.04, 0.08, 0.05);
    minuteHand.rotation.z = Math.PI / 6;
    group.add(minuteHand);

    // Swinging Tail Pendulum (pivoted from bottom)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, -0.36, 0.01);
    
    // Tail mesh
    const tailGeo = new THREE.CylinderGeometry(0.022, 0.035, 0.5, 6);
    tailGeo.translate(0, -0.22, 0); // pivot at top
    const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
    tailMesh.rotation.z = 0.1; // slight offset
    tailPivot.add(tailMesh);
    
    // Tail tip (white)
    const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
    tipMesh.position.set(0, -0.45, 0);
    tailPivot.add(tipMesh);

    group.add(tailPivot);
    group.userData = { tailPivot }; // store reference for main loop animation

    return group;
}

// ---------- HELPER: Create Supplies Pile (Sacks for Kitchen) ----------
function createSuppliesPile() {
    const group = new THREE.Group();
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.95 }); // Canvas/burlap beige
    
    // Sack 1 (standing)
    const sack1 = new THREE.Group();
    sack1.position.set(-0.25, 0.4, 0);
    const body1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.75, 8), sackMat);
    body1.castShadow = true;
    sack1.add(body1);
    const top1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), sackMat);
    top1.position.y = 0.355;
    top1.scale.set(1, 0.5, 1);
    sack1.add(top1);
    
    // Tie rope
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0x8E6A45 }));
    rope.position.y = 0.3;
    sack1.add(rope);
    group.add(sack1);

    // Sack 2 (leaning / smaller)
    const sack2 = new THREE.Group();
    sack2.position.set(0.2, 0.3, 0.15);
    sack2.rotation.set(0.2, 0, -0.5);
    const body2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.55, 8), sackMat);
    body2.castShadow = true;
    sack2.add(body2);
    const top2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), sackMat);
    top2.position.y = 0.26;
    top2.scale.set(1, 0.5, 1);
    sack2.add(top2);
    group.add(sack2);

    return group;
}

// ---------- HELPER: Create Bar Blackboard Menu ----------
function createBlackboard() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8E6A45, roughness: 0.8 }); // Brown wood
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.9 }); // Slate grey/dark blue

    // Slate board
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 1.0), boardMat);
    group.add(board);

    // Wooden frames
    const fTh = 0.06;
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, fTh, 1.0 + fTh * 2), woodMat);
    top.position.y = 0.7 + fTh / 2;
    group.add(top);

    const bot = new THREE.Mesh(new THREE.BoxGeometry(0.06, fTh, 1.0 + fTh * 2), woodMat);
    bot.position.y = -0.7 - fTh / 2;
    group.add(bot);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, fTh), woodMat);
    left.position.z = -0.5 - fTh / 2;
    group.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, fTh), woodMat);
    right.position.z = 0.5 + fTh / 2;
    group.add(right);

    // Decorative "chalk" text lines
    const chalkMat = new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 1.0 });
    const header = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), chalkMat);
    header.rotation.x = Math.PI / 2;
    header.position.set(0.015, 0.45, 0); // Menu title line
    group.add(header);

    for (let i = 0; i < 4; i++) {
        const line = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.6, 4), chalkMat);
        line.rotation.x = Math.PI / 2;
        line.position.set(0.015, 0.2 - i * 0.22, -0.05);
        group.add(line);

        // Price dot
        const price = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.15, 4), chalkMat);
        price.rotation.x = Math.PI / 2;
        price.position.set(0.015, 0.2 - i * 0.22, 0.35);
        group.add(price);
    }

    return group;
}

// ---------- HELPER: Create Cat-Eared Rug ----------
function createCatRug() {
    const group = new THREE.Group();
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xFFE5CC, roughness: 0.95 }); // Soft cream

    // Oval rug (cylinder squashed)
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.02, 24), rugMat);
    rug.scale.set(1.4, 1.0, 1.0);
    rug.receiveShadow = true;
    group.add(rug);

    // Cat ears
    const earMat = rugMat;
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 3), earMat);
        ear.rotation.y = side * 0.2;
        ear.position.set(side * 0.6, 0.0, -0.9);
        ear.scale.set(1.0, 1.0, 0.75);
        ear.receiveShadow = true;
        group.add(ear);
        
        // Inner ear (pink)
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.022, 3), new THREE.MeshStandardMaterial({ color: 0xFFB6C1 }));
        inner.rotation.y = side * 0.2;
        inner.position.set(side * 0.6, 0.001, -0.87);
        inner.scale.set(1.0, 1.0, 0.75);
        group.add(inner);
    }

    return group;
}

// ---------- CAT CHARACTER MODELS ----------

// Helper: build cat ears on a head mesh
function addCatEars(head, furMat, innerMat) {
    const earGeo = new THREE.ConeGeometry(0.1, 0.22, 4);
    const ears = [];
    for (const side of [-1, 1]) {
        const earPivot = new THREE.Group();
        earPivot.position.set(side * 0.14, 0.2, 0); // local relative to head center
        earPivot.rotation.z = side * -0.15;
        
        const ear = new THREE.Mesh(earGeo, furMat);
        ear.position.set(0, 0.04, 0); // pivot at base
        ear.castShadow = true;
        earPivot.add(ear);

        // Inner ear (pink)
        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 4), innerMat);
        innerEar.position.set(0, 0.04, 0.02);
        earPivot.add(innerEar);

        head.add(earPivot);
        ears.push(earPivot);
    }
    return ears;
}

// Helper: build cat tail on a body mesh
function addCatTail(body, furMat) {
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.1, -0.22); // Y = 0.1 is local to body center
    tailPivot.rotation.x = -0.6;

    // Tail base (tail1)
    const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6), furMat);
    tail1.position.set(0, 0.25, 0); // offset so pivot is at base
    tail1.castShadow = true;
    tailPivot.add(tail1);

    // Tail tip (tail2)
    const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.35, 6), furMat);
    tail2.position.set(0, 0.45, -0.1);
    tail2.rotation.x = -0.6;
    tailPivot.add(tail2);

    body.add(tailPivot);
    return tailPivot;
}

// Helper: build cat snout + whiskers on a head mesh
function addCatFace(head, noseMat) {
    // Snout (small rounded bump)
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0xFFF0E8, roughness: 0.8 }));
    snout.position.set(0, -0.04, 0.2);
    snout.scale.set(1, 0.7, 0.6);
    head.add(snout);
    // Nose (tiny pink triangle)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.03, 3), noseMat);
    nose.position.set(0, -0.01, 0.24);
    nose.rotation.x = Math.PI;
    head.add(nose);
    // Whiskers (thin cylinders)
    const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.5 });
    const whiskerGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.25, 4);
    for (const side of [-1, 1]) {
        for (const wy of [-0.02, 0.02]) {
            const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
            whisker.position.set(side * 0.15, -0.04 + wy, 0.2);
            whisker.rotation.z = side * 0.15 + wy * 2;
            whisker.rotation.y = side * 0.3;
            head.add(whisker);
        }
    }
    // Eyes (shiny dark spheres)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.5 });
    const eyeHighlight = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.5 });
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
        eye.position.set(side * 0.09, 0.04, 0.17);
        head.add(eye);
        // Eye highlight
        const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), eyeHighlight);
        highlight.position.set(side * 0.08, 0.055, 0.21);
        head.add(highlight);
    }
}

export function createWaiterModel(skin = 'default') {
    const group = new THREE.Group();
    group.userData = { type: 'waiter' };

    // Setup materials based on active skin
    let primaryMat = materials.catBlack;
    let secondaryMat = materials.catWhite;
    let earMat = materials.catBlack;
    let tailMat = materials.catBlack;
    let hasApron = true;
    let bowTieColor = 0xFF9E9E; // Red/Pink
    let isGold = false;

    if (skin === 'chef') {
        primaryMat = new THREE.MeshStandardMaterial({ color: 0xE8833A, roughness: 0.95 }); // Orange/ginger
        secondaryMat = materials.catWhite;
        earMat = primaryMat;
        tailMat = primaryMat;
        bowTieColor = 0x81C784; // Green chef neckerchief
        hasApron = true;
    } else if (skin === 'astronauta') {
        primaryMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.9 }); // Grey space fur
        secondaryMat = new THREE.MeshStandardMaterial({ color: 0xE0E0E0, roughness: 0.6 }); // Silver chest
        earMat = primaryMat;
        tailMat = primaryMat;
        hasApron = false; // space suit instead of apron
        bowTieColor = null; // space helmet base handles neck area
    } else if (skin === 'ouro') {
        isGold = true;
        primaryMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.15, metalness: 0.85 }); // Gold
        secondaryMat = new THREE.MeshStandardMaterial({ color: 0xFFDF73, roughness: 0.2, metalness: 0.7 }); // Gold light
        earMat = primaryMat;
        tailMat = primaryMat;
        hasApron = false;
        bowTieColor = 0xD32F2F; // Crimson bow tie on golden fur
    }

    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 1.0, 10), primaryMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Belly patch (child of body)
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.6, 8), secondaryMat);
    belly.position.set(0, -0.05, 0.1); // relative to body center
    body.add(belly);

    // Optional Apron (child of body)
    if (hasApron) {
        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.04),
            new THREE.MeshStandardMaterial({ color: 0xFFF8F0, roughness: 0.5 }));
        apron.position.set(0, -0.25, 0.22); // relative to body center
        body.add(apron);
    } else if (skin === 'astronauta') {
        // Space chest pad (child of body)
        const chestPad = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00E5FF, emissiveIntensity: 0.4, roughness: 0.2 }));
        chestPad.position.set(0, -0.05, 0.21); // relative to body center
        body.add(chestPad);
    }

    // Bow tie (child of body)
    if (bowTieColor !== null) {
        const catBowMat = new THREE.MeshStandardMaterial({ color: bowTieColor, roughness: 0.6 });
        const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), catBowMat);
        bowCenter.position.set(0, 0.38, 0.2); // relative to body center
        body.add(bowCenter);
        for (const side of [-1, 1]) {
            const wing = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 4), catBowMat);
            wing.position.set(side * 0.07, 0.38, 0.2); // relative to body center
            wing.rotation.z = side * Math.PI / 2;
            body.add(wing);
        }
    }

    // Head (child of body)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), primaryMat);
    head.position.set(0, 0.72, 0); // relative to body center
    head.castShadow = true;
    body.add(head);

    // Face mask (child of head)
    const faceMask = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), secondaryMat);
    faceMask.position.set(0, -0.04, 0.1); // relative to head center
    faceMask.scale.set(1, 0.9, 0.6);
    head.add(faceMask);

    // Ears, face, tail (attached to head and body)
    const ears = addCatEars(head, earMat, materials.catPink); // attached to head
    addCatFace(head, materials.catPink); // attached to head
    const tailPivot = addCatTail(body, tailMat); // attached to body

    // Arms (left and right shoulder pivots) (children of body)
    const armGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.35, 6);
    armGeo.translate(0, -0.175, 0); // pivot at shoulder
    const leftArm = new THREE.Mesh(armGeo, primaryMat);
    leftArm.position.set(-0.32, 0.2, 0.0); // relative to body center
    const rightArm = new THREE.Mesh(armGeo, primaryMat);
    rightArm.position.set(0.32, 0.2, 0.0); // relative to body center

    // Add paw spheres at the bottom of the arms (children of arms)
    const pawGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const leftArmPaw = new THREE.Mesh(pawGeo, secondaryMat);
    leftArmPaw.position.set(0, -0.35, 0);
    leftArm.add(leftArmPaw);
    const rightArmPaw = new THREE.Mesh(pawGeo, secondaryMat);
    rightArmPaw.position.set(0, -0.35, 0);
    rightArm.add(rightArmPaw);

    body.add(leftArm);
    body.add(rightArm);

    // Legs (left and right hip pivots) (children of root group)
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
    legGeo.translate(0, -0.15, 0); // pivot at hip
    const leftLeg = new THREE.Mesh(legGeo, primaryMat);
    leftLeg.position.set(-0.16, 0.35, 0.05); // relative to root group
    const rightLeg = new THREE.Mesh(legGeo, primaryMat);
    rightLeg.position.set(0.16, 0.35, 0.05); // relative to root group

    // Add paw spheres at the bottom of the legs
    const leftLegPaw = new THREE.Mesh(pawGeo, secondaryMat);
    leftLegPaw.position.set(0, -0.3, 0.02);
    leftLeg.add(leftLegPaw);
    const rightLegPaw = new THREE.Mesh(pawGeo, secondaryMat);
    rightLegPaw.position.set(0, -0.3, 0.02);
    rightLeg.add(rightLegPaw);

    group.add(leftLeg);
    group.add(rightLeg);

    // Collar & Bell (children of body)
    const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.26, 0.05, 12),
        new THREE.MeshStandardMaterial({ color: 0xD32F2F, roughness: 0.6 })); // Red collar
    collarMesh.position.set(0, 0.45, 0.02); // relative to body center
    body.add(collarMesh);

    const bellPivot = new THREE.Group();
    bellPivot.position.set(0, 0.45, 0.26); // relative to body center
    const bellChain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 4),
        new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.2, metalness: 0.8 }));
    bellChain.position.y = -0.03;
    bellPivot.add(bellChain);
    const bellSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.1, metalness: 0.9 })); // Golden bell
    bellSphere.position.y = -0.07;
    bellPivot.add(bellSphere);
    body.add(bellPivot);

    // --- Accessory overlays based on skin (children of head) ---
    if (skin === 'chef') {
        // Chef Hat
        const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 12),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 }));
        hatBase.position.set(0, 0.28, 0.02); // relative to head center
        hatBase.rotation.x = 0.05;
        head.add(hatBase);

        const hatPuff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 }));
        hatPuff.position.set(0, 0.38, 0.02); // relative to head center
        hatPuff.scale.set(1, 0.7, 1);
        head.add(hatPuff);
    } else if (skin === 'astronauta') {
        // Space Helmet (glass bubble)
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xE0F7FA, roughness: 0.05, transparent: true, opacity: 0.3, metalness: 0.1 }));
        helmet.position.set(0, 0, 0.04); // relative to head center
        head.add(helmet);

        // Space Helmet Collar (child of body)
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.06, 16),
            new THREE.MeshStandardMaterial({ color: 0xCFD8DC, roughness: 0.3, metalness: 0.4 }));
        collar.position.set(0, 0.45, 0.02); // relative to body center
        body.add(collar);
    } else if (skin === 'ouro') {
        // Crown
        const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.08, 12),
            new THREE.MeshStandardMaterial({ color: 0xD32F2F, roughness: 0.3 })); // Crimson base cushion
        crownBase.position.set(0, 0.26, 0.02); // relative to head center
        crownBase.rotation.x = 0.05;
        head.add(crownBase);

        const crownGold = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.06, 12, 1, true),
            new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.1, metalness: 0.9 })); // Gold trim
        crownGold.position.set(0, 0.27, 0.02); // relative to head center
        head.add(crownGold);

        // Tiny crown tips (cross or spheres)
        const tipMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.1, metalness: 0.9 });
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), tipMat);
            tip.position.set(Math.cos(angle) * 0.1, 0.32, Math.sin(angle) * 0.1 + 0.02); // relative to head center
            head.add(tip);
        }
    }

    group.userData = {
        type: 'waiter',
        skin,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        tailPivot,
        ears,
        bellPivot,
        body,
        head
    };

    return group;
}

export function createCustomerModel(colorIndex) {
    // Cat fur color palettes: body color, accent/belly, ear inner
    const catPalettes = [
        { fur: 0xE8833A, belly: 0xFFF0DD, name: 'orange tabby' },    // Orange
        { fur: 0x888899, belly: 0xDDDDEE, name: 'russian blue' },     // Gray
        { fur: 0xFFF5EE, belly: 0xFFFFFF, name: 'white persian' },    // White
        { fur: 0x2A1A0A, belly: 0xD4A574, name: 'brown tabby' },      // Dark brown
        { fur: 0xE8C88A, belly: 0xFFF8F0, name: 'cream' },            // Cream/Siamese
        { fur: 0x555555, belly: 0xCCCCCC, name: 'charcoal' },         // Charcoal
        { fur: 0xCC6633, belly: 0xFFDDBB, name: 'ginger' },            // Ginger
        { fur: 0x1A1A2E, belly: 0xFFF0E0, name: 'tuxedo' },           // Tuxedo
    ];
    const palette = catPalettes[colorIndex % catPalettes.length];
    const furMat = new THREE.MeshStandardMaterial({ color: palette.fur, roughness: 0.9 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: palette.belly, roughness: 0.85 });

    const group = new THREE.Group();
    group.userData = { type: 'customer' };

    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.9, 10), furMat);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    // Belly patch (child of body)
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.55, 8), bellyMat);
    belly.position.set(0, -0.03, 0.08); // relative to body center
    body.add(belly);

    // Head (child of body)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), furMat);
    head.position.set(0, 0.67, 0); // relative to body center
    head.castShadow = true;
    body.add(head);

    // Ears, face, tail (attached to head and body)
    const ears = addCatEars(head, furMat, materials.catPink); // attached to head
    addCatFace(head, materials.catPink); // attached to head
    const tailPivot = addCatTail(body, furMat); // attached to body

    // Arms (left and right shoulder pivots) (children of body)
    const armGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.32, 6);
    armGeo.translate(0, -0.16, 0); // pivot at shoulder
    const leftArm = new THREE.Mesh(armGeo, furMat);
    leftArm.position.set(-0.3, 0.2, 0.0); // relative to body center
    const rightArm = new THREE.Mesh(armGeo, furMat);
    rightArm.position.set(0.3, 0.2, 0.0); // relative to body center

    const pawGeo = new THREE.SphereGeometry(0.055, 6, 6);
    const leftArmPaw = new THREE.Mesh(pawGeo, bellyMat);
    leftArmPaw.position.set(0, -0.32, 0);
    leftArm.add(leftArmPaw);
    const rightArmPaw = new THREE.Mesh(pawGeo, bellyMat);
    rightArmPaw.position.set(0, -0.32, 0);
    rightArm.add(rightArmPaw);

    body.add(leftArm);
    body.add(rightArm);

    // Legs (left and right hip pivots) (children of root group)
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.28, 6);
    legGeo.translate(0, -0.14, 0); // pivot at hip
    const leftLeg = new THREE.Mesh(legGeo, furMat);
    leftLeg.position.set(-0.15, 0.32, 0.04); // relative to root group
    const rightLeg = new THREE.Mesh(legGeo, furMat);
    rightLeg.position.set(0.16, 0.32, 0.04); // relative to root group

    const pawColor = (colorIndex % 3 === 0) ? palette.belly : palette.fur;
    const pawMat = new THREE.MeshStandardMaterial({ color: pawColor, roughness: 0.85 });
    const leftLegPaw = new THREE.Mesh(pawGeo, pawMat);
    leftLegPaw.position.set(0, -0.28, 0.02);
    leftLeg.add(leftLegPaw);
    const rightLegPaw = new THREE.Mesh(pawGeo, pawMat);
    rightLegPaw.position.set(0, -0.28, 0.02);
    rightLeg.add(rightLegPaw);

    group.add(leftLeg);
    group.add(rightLeg);

    group.userData = {
        type: 'customer',
        colorIndex,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        tailPivot,
        ears,
        body,
        head
    };

    return group;
}

// ---------- FOOD PLATE MODEL ----------
export function createPlateModel(itemId = 'prato_dia') {
    const group = new THREE.Group();
    // Plate
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.3 }));
    plate.position.y = 1.38;
    group.add(plate);

    // Food
    let food;
    if (itemId === 'prato_dia') {
        // Ração Premium - Brown kibble pile
        food = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 1),
            new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 }));
        food.position.y = 1.45;
        food.scale.set(1, 0.6, 1);
    } else if (itemId === 'massa') {
        // Lasanha de Atum - Orange layers with herb sprinkles
        const pastaGroup = new THREE.Group();
        const lasagna = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), new THREE.MeshStandardMaterial({ color: 0xE8833A, roughness: 0.8 }));
        lasagna.position.y = 1.44;
        pastaGroup.add(lasagna);
        const herbMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.9 });
        for (let i = 0; i < 4; i++) {
            const herb = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.015), herbMat);
            herb.position.set((Math.random() - 0.5) * 0.16, 1.51, (Math.random() - 0.5) * 0.16);
            herb.rotation.set(Math.random(), Math.random(), Math.random());
            pastaGroup.add(herb);
        }
        food = pastaGroup;
    } else if (itemId === 'file') {
        // Sashimi Fresco - Cute pink fish model
        const fishGroup = new THREE.Group();
        const fishBody = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0xFF9E9E, roughness: 0.4 }));
        fishBody.scale.set(1.8, 0.7, 0.4);
        fishBody.position.y = 1.45;
        fishGroup.add(fishBody);
        const fishTail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 4), new THREE.MeshStandardMaterial({ color: 0xFF9E9E, roughness: 0.4 }));
        fishTail.position.set(-0.16, 1.45, 0);
        fishTail.rotation.z = Math.PI / 2;
        fishGroup.add(fishTail);
        const fishEye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        fishEye.position.set(0.08, 1.47, 0.03);
        fishGroup.add(fishEye);
        food = fishGroup;
    } else if (itemId === 'sobremesa') {
        // Sachê de Carne - Dark meat mound
        food = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 }));
        food.position.y = 1.46;
        food.scale.y = 0.5;
    } else if (itemId === 'salada') {
        // Grama de Gato - Green grass with tomatoes and cheese croutons
        const salGroup = new THREE.Group();
        const baseSalad = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.8 }));
        baseSalad.position.y = 1.46;
        salGroup.add(baseSalad);
        const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xE53935, roughness: 0.5 });
        const tomatoGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
            tomato.position.set(Math.cos(angle) * 0.08, 1.48, Math.sin(angle) * 0.08);
            salGroup.add(tomato);
        }
        const croutonMat = new THREE.MeshStandardMaterial({ color: 0xFFD54F, roughness: 0.9 });
        const croutonGeo = new THREE.SphereGeometry(0.02, 4, 4);
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3 + 0.5;
            const crouton = new THREE.Mesh(croutonGeo, croutonMat);
            crouton.position.set(Math.cos(angle) * 0.08, 1.46, Math.sin(angle) * 0.08);
            salGroup.add(crouton);
        }
        food = salGroup;
    } else {
        // Fallback generic food
        food = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xCC6633, roughness: 0.8 }));
        food.position.y = 1.45;
        food.scale.y = 0.5;
    }
    
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
    let emoji = '😸';
    if (clampedRatio < 0.2) emoji = '🙀';
    else if (clampedRatio < 0.4) emoji = '😾';
    else if (clampedRatio < 0.65) emoji = '🐱';

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

// ---------- DRINK MODEL ----------
export function createDrinkModel(itemId = 'agua') {
    const group = new THREE.Group();
    
    let color = 0xCCDDEE;
    let opacity = 0.8;
    
    if (itemId === 'suco') { color = 0xFFFAF0; opacity = 1.0; } // Leite Fresco
    else if (itemId === 'refrigerante') { color = 0xDEB887; opacity = 0.9; } // Caldo
    else if (itemId === 'cerveja') { color = 0x98FB98; opacity = 0.85; } // Catnip Frio
    else if (itemId === 'vinho') { color = 0xAEECEF; opacity = 0.6; } // Água da Fonte
    else if (itemId === 'cocktail') { color = 0xFFDAB9; opacity = 0.9; } // Vitamina
    else if (itemId === 'agua') { color = 0xCCDDEE; opacity = 0.6; } // Água Pura

    const glassMat = new THREE.MeshStandardMaterial({ 
        color: 0xEEEEFF, roughness: 0.1, transparent: true, opacity: 0.4 
    });
    const liquidMat = new THREE.MeshStandardMaterial({ 
        color: color, roughness: 0.3, transparent: true, opacity: opacity 
    });

    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.3, 12), glassMat);
    glass.position.y = 1.55;
    group.add(glass);

    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.22, 12), liquidMat);
    liquid.position.y = 1.53;
    group.add(liquid);

    // Add a straw (Cylinder)
    const strawGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.32, 4);
    strawGeo.translate(0, 0.16, 0); // pivot at base
    const straw = new THREE.Mesh(strawGeo, new THREE.MeshStandardMaterial({ color: 0xE53935, roughness: 0.5 })); // Red straw
    straw.position.set(0.04, 1.54, 0.04);
    straw.rotation.set(0.2, 0, -0.2); // diagonal
    group.add(straw);

    // Add a lemon slice on the glass rim
    if (itemId === 'cocktail' || itemId === 'cerveja') {
        const lemonGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.02, 8);
        const lemon = new THREE.Mesh(lemonGeo, new THREE.MeshStandardMaterial({ color: 0xFFEB3B, roughness: 0.5 })); // Yellow lemon
        lemon.position.set(-0.10, 1.67, 0);
        lemon.rotation.z = Math.PI / 2;
        lemon.rotation.y = 0.5;
        group.add(lemon);
    }

    return group;
}

// ---------- CAMERA JUICE (SCREEN SHAKE) ----------
let shakeIntensity = 0;
let shakeDuration = 0;

export function triggerScreenShake(intensity = 0.08, duration = 0.25) {
    shakeIntensity = intensity;
    shakeDuration = duration;
}

export function updateCameraShake(dt, camera, controls) {
    if (shakeDuration > 0) {
        shakeDuration -= dt;
        
        // Random shake offset
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        const shakeZ = (Math.random() - 0.5) * shakeIntensity;
        
        // Add relative offset to camera position
        camera.position.x += shakeX;
        camera.position.y += shakeY;
        camera.position.z += shakeZ;
        
        // Jolt the controls target slightly
        if (controls) {
            controls.target.x += shakeX * 0.4;
            controls.target.z += shakeZ * 0.4;
        }
    }
}

// ---------- MODEL ANIMATION ENGINE ----------
export function updateModelAnimations(dt, model, state, speedMultiplier = 1.0) {
    if (!model || !model.userData) return;

    if (model.userData.animTime === undefined) model.userData.animTime = 0;
    const walkSpeed = 12 * speedMultiplier;
    const idleSpeed = 3;
    const isWalking = state === 'walking';
    const isCarrying = state === 'carrying';
    const isEating  = state === 'eating';

    model.userData.animTime += dt * (isWalking ? walkSpeed : idleSpeed);
    const time = model.userData.animTime;
    const data  = model.userData;

    // ---- Restore base positions each frame ----
    const baseBodyY = (data.type === 'waiter') ? 0.8 : 0.75;
    const baseHeadY = (data.type === 'waiter') ? 0.72 : 0.67; // Local to body center
    if (data.body) {
        data.body.position.y = baseBodyY;
        data.body.scale.set(1, 1, 1);
        data.body.rotation.set(0, 0, 0);
    }
    if (data.head) {
        data.head.position.set(0, baseHeadY, 0);
        data.head.rotation.set(0, 0, 0);
    }
    if (data.leftLeg)  data.leftLeg.rotation.set(0, 0, 0);
    if (data.rightLeg) data.rightLeg.rotation.set(0, 0, 0);
    if (data.leftArm)  data.leftArm.rotation.set(0, 0, 0);
    if (data.rightArm) data.rightArm.rotation.set(0, 0, 0);
    if (data.tailPivot) data.tailPivot.rotation.set(-0.6, 0, 0);

    // ---- State-specific animations ----
    if (isWalking || isCarrying) {
        // Body bob
        const bob = Math.abs(Math.sin(time)) * 0.07;
        if (data.body) data.body.position.y += bob;
        // Head bobs automatically because it is a child of the body group

        // Leg swing
        const legSwing = Math.sin(time) * 0.6;
        if (data.leftLeg)  data.leftLeg.rotation.x  =  legSwing;
        if (data.rightLeg) data.rightLeg.rotation.x = -legSwing;

        // Arm swing / carrying pose
        if (isCarrying) {
            if (data.leftArm)  { data.leftArm.rotation.x  = -1.1; data.leftArm.rotation.y  =  0.22; }
            if (data.rightArm) { data.rightArm.rotation.x = -1.1; data.rightArm.rotation.y = -0.22; }
        } else {
            const armSwing = Math.sin(time) * 0.4;
            if (data.leftArm)  data.leftArm.rotation.x  = -armSwing;
            if (data.rightArm) data.rightArm.rotation.x =  armSwing;
        }

        // Forward lean (extra when dashing)
        const tilt = speedMultiplier > 1.2 ? 0.28 : 0.14;
        if (data.body) data.body.rotation.x = tilt;
        if (data.head) data.head.rotation.x = -tilt * 0.5;

        // Tail wag
        if (data.tailPivot) data.tailPivot.rotation.y = Math.sin(time * 0.9) * 0.45;

        // Bell pendulum
        if (data.bellPivot) data.bellPivot.rotation.x = Math.sin(time) * 0.3;

    } else if (isEating) {
        // Eating head-bob toward plate
        const eatBob = Math.abs(Math.sin(time * 1.6)) * 0.11;
        if (data.head) {
            data.head.position.y = baseHeadY - eatBob;
            data.head.position.z = eatBob * 0.6;
            data.head.rotation.x = eatBob * 1.4;
        }
        // Circular happy tail
        if (data.tailPivot) {
            data.tailPivot.rotation.y = Math.sin(time * 2.2) * 0.5;
            data.tailPivot.rotation.z = Math.cos(time * 2.2) * 0.25;
        }
        // Arms reach forward
        if (data.leftArm)  data.leftArm.rotation.x  = -0.6;
        if (data.rightArm) data.rightArm.rotation.x = -0.6;

    } else {
        // ---- Idle breathing ----
        const breathe = Math.sin(time * 0.8) * 0.016;
        if (data.body) data.body.scale.set(1 + breathe, 1 - breathe, 1 + breathe);

        // Slow tail sway
        if (data.tailPivot) data.tailPivot.rotation.y = Math.sin(time * 0.4) * 0.25;

        // Occasional random ear twitch
        if (data.ears && data.ears.length >= 2) {
            const cycle = Math.sin(time * 0.25);
            if (cycle > 0.9) {
                data.ears[0].rotation.x = Math.sin(time * 12) * 0.14;
                data.ears[1].rotation.x = 0;
            } else if (cycle < -0.9) {
                data.ears[1].rotation.x = Math.sin(time * 12) * 0.14;
                data.ears[0].rotation.x = 0;
            } else {
                data.ears[0].rotation.x = 0;
                data.ears[1].rotation.x = 0;
            }
        }
    }
}

// ---------- STEAM PARTICLE SOURCES ----------
export function getSteamSources() {
    const halfRoom = 8.5;
    const barX = halfRoom - 1.5;
    const barZStart = -1.5;
    return [
        new THREE.Vector3(0, 0.75, -halfRoom + 1.6),     // Kitchen oven
        new THREE.Vector3(barX + 0.2, 1.8, barZStart + 4.0) // Bar blender
    ];
}
