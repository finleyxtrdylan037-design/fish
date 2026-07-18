
(() => {
  "use strict";

  const VERSION = "0.1.3";
  const WATER_DEPTH = 2.4;
  const NET_DISTANCE = 1.8;
  const DIRECT_LIFT_DISTANCE = 1.2;
  const LANDING_STAMINA = 8;
  const DIRECT_LIFT_MAX_KG = 0.8;

  const GameState = Object.freeze({
    BOOT: "BOOT",
    READY: "READY",
    RIG_SETUP: "RIG_SETUP",
    CAST_AIM: "CAST_AIM",
    CAST_FLIGHT: "CAST_FLIGHT",
    FLOAT_SETTLE: "FLOAT_SETTLE",
    WAIT_BITE: "WAIT_BITE",
    BITE: "BITE",
    FIGHT: "FIGHT",
    NET_READY: "NET_READY",
    RESULT: "RESULT"
  });

  const BAITS = [
    { id: "worm", name: "蚯蚓", targets: "鲫鱼、鲤鱼、翘嘴、小杂鱼", layer: "底层 / 离底", note: "万能传统饵，易招小鱼试探。", fishes: ["鲫鱼", "鲤鱼", "鳊鱼", "翘嘴"], biteSpeed: 1.00 },
    { id: "foam", name: "泡泡球", targets: "鲫鱼、鲤鱼、滑口鱼", layer: "底层 / 离底", note: "入口轻，留钩更久。", fishes: ["鲫鱼", "鲤鱼", "鳊鱼"], biteSpeed: 0.92 },
    { id: "silver", name: "鲢鳙粉饵", targets: "鲢鱼、鳙鱼", layer: "中上层", note: "雾化快，典型钓浮饵。", fishes: ["鲢鱼", "鳙鱼"], biteSpeed: 1.18 },
    { id: "corn", name: "玉米", targets: "鲤鱼、草鱼、青鱼、鳊鱼", layer: "底层 / 离底", note: "耐泡，大鱼更偏爱。", fishes: ["鲤鱼", "草鱼", "青鱼", "鳊鱼"], biteSpeed: 0.82 },
    { id: "shrimp", name: "虾拉", targets: "鲫鱼、罗非鱼、翘嘴、鲤鱼", layer: "底层 / 离底", note: "入口性好，轻口鱼也容易吸食。", fishes: ["鲫鱼", "罗非鱼", "鲤鱼", "翘嘴"], biteSpeed: 1.10 },
    { id: "mixed", name: "混养饵料", targets: "鲫鲤草鳊青", layer: "底层为主", note: "适口面广，综合表现稳定。", fishes: ["鲫鱼", "鲤鱼", "草鱼", "鳊鱼", "青鱼"], biteSpeed: 1.00 }
  ];

  const BITE_PATTERN_CONFIG = {
    "顿口": { start: 520, end: 1450 },
    "连续顿口": { start: 480, end: 1500 },
    "黑漂": { start: 620, end: 1450 },
    "顿后黑漂": { start: 700, end: 1600 },
    "缓沉": { start: 760, end: 1700 },
    "上顶": { start: 580, end: 1600 },
    "横移": { start: 650, end: 1780 }
  };

  const FISH_PROFILES = {
    "鲫鱼": {
      minKg: 0.12, maxKg: 0.95, minCm: 14, maxCm: 34, power: 0.70, rarity: 1.6, sizeBias: 1.95,
      preferredBaits: ["worm", "foam", "shrimp", "mixed"], preferredLayers: ["bottom", "near"],
      bitePatterns: ["顿口", "顿口", "连续顿口", "上顶"], image: "./assets/fish/crucian_carp.webp",
      note: "底层巡游觅食，典型细碎口。"
    },
    "鲤鱼": {
      minKg: 1.0, maxKg: 6.2, minCm: 36, maxCm: 78, power: 1.30, rarity: 1.0, sizeBias: 1.55,
      preferredBaits: ["worm", "corn", "mixed", "shrimp"], preferredLayers: ["bottom", "near"],
      bitePatterns: ["顿口", "黑漂", "顿后黑漂"], image: "./assets/fish/common_carp.webp",
      note: "贴底觅食，吃口常由试探转为闷漂。"
    },
    "鳊鱼": {
      minKg: 0.40, maxKg: 1.80, minCm: 26, maxCm: 48, power: 0.95, rarity: 0.95, sizeBias: 1.55,
      preferredBaits: ["worm", "foam", "corn", "mixed"], preferredLayers: ["near", "float"],
      bitePatterns: ["上顶", "顿口", "横移"], image: "./assets/fish/wuchang_bream.webp",
      note: "中下层成群活动，上顶和横移都较常见。"
    },
    "鲢鱼": {
      minKg: 1.5, maxKg: 5.8, minCm: 44, maxCm: 78, power: 1.12, rarity: 0.8, sizeBias: 1.35,
      preferredBaits: ["silver"], preferredLayers: ["float"],
      bitePatterns: ["缓沉", "缓沉", "连续顿口"], image: "./assets/fish/silver_carp.webp",
      note: "中上层追雾化，吃口偏缓沉。"
    },
    "鳙鱼": {
      minKg: 2.0, maxKg: 7.8, minCm: 48, maxCm: 90, power: 1.22, rarity: 0.65, sizeBias: 1.30,
      preferredBaits: ["silver"], preferredLayers: ["float"],
      bitePatterns: ["缓沉", "顿后黑漂", "缓沉"], image: "./assets/fish/bighead_carp.webp",
      note: "中上层大体型鱼，漂相更沉稳。"
    },
    "草鱼": {
      minKg: 1.8, maxKg: 7.5, minCm: 48, maxCm: 92, power: 1.40, rarity: 0.85, sizeBias: 1.35,
      preferredBaits: ["corn", "mixed"], preferredLayers: ["near", "bottom"],
      bitePatterns: ["横移", "顿后黑漂", "黑漂"], image: "./assets/fish/grass_carp.webp",
      note: "大个体发力直，横向走漂较明显。"
    },
    "罗非鱼": {
      minKg: 0.28, maxKg: 1.55, minCm: 20, maxCm: 43, power: 0.88, rarity: 1.10, sizeBias: 1.65,
      preferredBaits: ["shrimp", "worm", "mixed"], preferredLayers: ["bottom", "near"],
      bitePatterns: ["连续顿口", "连续顿口", "顿口"], image: "./assets/fish/tilapia.webp",
      note: "抢口快，常有连续试探后吞钩。"
    },
    "翘嘴": {
      minKg: 0.35, maxKg: 3.8, minCm: 24, maxCm: 68, power: 1.05, rarity: 0.78, sizeBias: 1.45,
      preferredBaits: ["shrimp", "worm"], preferredLayers: ["float", "near"],
      bitePatterns: ["横移", "横移", "顿口"], image: "./assets/fish/topmouth_culter.webp",
      note: "中上层掠食性鱼，漂相常有走漂。"
    },
    "青鱼": {
      minKg: 3.2, maxKg: 18.0, minCm: 58, maxCm: 122, power: 1.72, rarity: 0.42, sizeBias: 1.22,
      preferredBaits: ["corn", "mixed"], preferredLayers: ["bottom"],
      bitePatterns: ["黑漂", "顿后黑漂", "黑漂"], image: "./assets/fish/black_carp.webp",
      note: "典型底层大物，前期试探后多为沉稳黑漂。"
    }
  };

  const ui = {};
  let engine;
  let scene;
  let camera;
  let rodRoot;
  let rodSegments = [];
  let rodTip;
  let lineMesh;
  let floatRoot;
  let landingMarker;
  let waterMaterial;
  let gameState = GameState.BOOT;
  let fishingDepth = 2.2;
  let selectedBaitId = "worm";
  let pendingBaitId = "worm";
  let castPower = 0;
  let charging = false;
  let chargeDirection = 1;
  let chargeAnimationId = null;
  let castDistance = 0;
  let floatBasePosition = null;
  let biteTimeout = null;
  let biteStartAt = 0;
  let biteWindowStart = 650;
  let biteWindowEnd = 1500;
  let bitePattern = "顿口";
  let hookedFish = null;
  let tension = 36;
  let fishStamina = 100;
  let fishDistance = 7;
  let fishPullPhase = 0;
  let toastTimer = null;
  let moveDirection = { forward: false, back: false, left: false, right: false };
  let exhaustionHintShown = false;

  function cacheUI() {
    const ids = [
      "game-shell", "render-canvas", "loading-screen", "loading-progress", "game-state-label",
      "distance-label", "water-depth-label", "fishing-depth-label", "depth-state-label", "bait-label",
      "monitor-float", "bite-hint", "focus-float-button", "primary-action", "rig-button", "bait-button",
      "retrieve-button", "test-bite-button", "cast-hud", "cast-power-label", "cast-power-bar",
      "cast-distance-preview", "fight-hud", "tension-label", "tension-bar", "stamina-label",
      "stamina-bar", "fish-distance-label", "fight-guidance", "net-button", "rig-dialog", "depth-range",
      "dialog-depth-label", "dialog-depth-state", "diagram-hook", "save-rig-button", "bait-dialog",
      "bait-grid", "save-bait-button", "result-dialog", "catch-title", "catch-detail", "timing-result",
      "result-bait", "result-layer", "catch-summary", "catch-image", "continue-button", "toast",
      "result-pattern", "result-method", "result-note", "result-grade-badge", "result-method-badge", "result-pattern-badge"
    ];
    ids.forEach(id => { ui[id] = document.getElementById(id); });
  }

  function setLoading(percent, text) {
    ui["loading-progress"].style.width = `${Math.max(5, Math.min(100, percent))}%`;
    const p = ui["loading-screen"].querySelector("p");
    if (p && text) p.textContent = text;
  }

  function randomBetween(min, max) { return min + Math.random() * (max - min); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function randomItem(array) { return array[Math.floor(Math.random() * array.length)]; }

  function setState(nextState, label) {
    gameState = nextState;
    ui["game-shell"].dataset.state = nextState;
    const labels = {
      [GameState.BOOT]: "加载中",
      [GameState.READY]: "准备钓鱼",
      [GameState.RIG_SETUP]: "调整线组",
      [GameState.CAST_AIM]: "按住抛竿蓄力",
      [GameState.CAST_FLIGHT]: "线组飞行中",
      [GameState.FLOAT_SETTLE]: "浮漂翻身到位",
      [GameState.WAIT_BITE]: "等待鱼口",
      [GameState.BITE]: "出现漂相",
      [GameState.FIGHT]: "中鱼 · 遛鱼",
      [GameState.NET_READY]: "鱼已靠岸",
      [GameState.RESULT]: "渔获结果"
    };
    ui["game-state-label"].textContent = label || labels[nextState] || nextState;
    updateActionAvailability();
  }

  function updateActionAvailability() {
    const primary = ui["primary-action"];
    const canConfigure = [GameState.READY, GameState.WAIT_BITE].includes(gameState);
    ui["rig-button"].disabled = !canConfigure;
    ui["bait-button"].disabled = !canConfigure;
    ui["retrieve-button"].disabled = [GameState.BOOT, GameState.READY, GameState.RESULT].includes(gameState);
    ui["test-bite-button"].disabled = gameState !== GameState.WAIT_BITE;

    if (gameState === GameState.READY) {
      primary.textContent = "抛竿";
      primary.disabled = false;
    } else if (gameState === GameState.CAST_AIM) {
      primary.textContent = "松开抛竿";
      primary.disabled = false;
    } else if ([GameState.WAIT_BITE, GameState.BITE].includes(gameState)) {
      primary.textContent = "提竿";
      primary.disabled = false;
    } else if ([GameState.FIGHT, GameState.NET_READY].includes(gameState)) {
      const directLift = hookedFish && hookedFish.weight <= DIRECT_LIFT_MAX_KG;
      primary.textContent = gameState === GameState.NET_READY ? (directLift ? "提鱼上岸" : "抄鱼") : "遛鱼中";
      primary.disabled = gameState !== GameState.NET_READY;
    } else {
      primary.textContent = "处理中";
      primary.disabled = true;
    }

    ui["cast-hud"].classList.toggle("hidden", gameState !== GameState.CAST_AIM);
    ui["fight-hud"].classList.toggle("hidden", ![GameState.FIGHT, GameState.NET_READY].includes(gameState));
  }

  function showToast(message, duration = 2200) {
    window.clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add("visible");
    toastTimer = window.setTimeout(() => ui.toast.classList.remove("visible"), duration);
  }

  function openDialog(dialog) {
    dialog.classList.add("visible");
    if (camera) camera.detachControl();
  }

  function closeDialog(dialog) {
    dialog.classList.remove("visible");
    if (camera) camera.attachControl(ui["render-canvas"], true);
  }

  function getDepthState(depth = fishingDepth) {
    const gap = WATER_DEPTH - depth;
    if (depth > WATER_DEPTH + 0.12) return { text: "过底", kind: "over" };
    if (depth > WATER_DEPTH + 0.02) return { text: "躺底", kind: "bottom" };
    if (Math.abs(gap) <= 0.05) return { text: "钓底", kind: "bottom" };
    if (gap <= 0.28) return { text: `离底 ${Math.max(0, Math.round(gap * 100))} cm`, kind: "near" };
    if (depth <= 0.8) return { text: "钓浮 · 上层", kind: "float" };
    return { text: "钓浮 · 中层", kind: "float" };
  }

  function updateDepthUI(depth = fishingDepth) {
    const state = getDepthState(depth);
    ui["fishing-depth-label"].textContent = `${depth.toFixed(2)} m`;
    ui["depth-state-label"].textContent = state.text;
    ui["dialog-depth-label"].textContent = `${depth.toFixed(2)} m`;
    ui["dialog-depth-state"].textContent = state.text;
    const diagramTop = clamp(13 + (depth / WATER_DEPTH) * 70, 15, 88);
    ui["diagram-hook"].style.top = `${diagramTop}%`;
  }

  function getSelectedBait() { return BAITS.find(item => item.id === selectedBaitId) || BAITS[0]; }

  function buildBaitGrid() {
    ui["bait-grid"].innerHTML = "";
    BAITS.forEach(bait => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bait-option";
      button.dataset.baitId = bait.id;
      button.innerHTML = `<strong>${bait.name}</strong><span>目标：${bait.targets}</span><span>水层：${bait.layer}</span><span>${bait.note}</span><em>选择</em>`;
      button.addEventListener("click", () => {
        pendingBaitId = bait.id;
        refreshBaitSelection();
      });
      ui["bait-grid"].appendChild(button);
    });
    refreshBaitSelection();
  }

  function refreshBaitSelection() {
    ui["bait-grid"].querySelectorAll(".bait-option").forEach(button => {
      button.classList.toggle("selected", button.dataset.baitId === pendingBaitId);
    });
  }

  function createScene() {
    const canvas = ui["render-canvas"];
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }, true);
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.64, 0.78, 0.82, 1);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0075;
    scene.fogColor = new BABYLON.Color3(0.64, 0.78, 0.82);

    camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, 1.72, -10.5), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0.4, 8));
    camera.minZ = 0.05;
    camera.speed = 0.18;
    camera.angularSensibility = 3300;
    camera.inertia = 0.75;
    camera.keysUp = [87];
    camera.keysDown = [83];
    camera.keysLeft = [65];
    camera.keysRight = [68];
    camera.attachControl(canvas, true);

    const hemispheric = new BABYLON.HemisphericLight("skyLight", new BABYLON.Vector3(0.3, 1, -0.2), scene);
    hemispheric.intensity = 0.78;
    hemispheric.groundColor = new BABYLON.Color3(0.28, 0.31, 0.24);
    const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.45, -1, 0.35), scene);
    sun.position = new BABYLON.Vector3(18, 28, -18);
    sun.intensity = 1.35;

    createEnvironment();
    createFishingRig();
    createLandingMarker();

    scene.onBeforeRenderObservable.add(updateFrame);
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
    return scene;
  }

  function material(name, color, specular = 0.1) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    mat.diffuseColor = color;
    mat.specularColor = new BABYLON.Color3(specular, specular, specular);
    return mat;
  }

  function createEnvironment() {
    const groundMat = material("shoreMaterial", new BABYLON.Color3(0.28, 0.37, 0.20));
    const soilMat = material("soilMaterial", new BABYLON.Color3(0.38, 0.29, 0.19));
    const farGroundMat = material("farGroundMaterial", new BABYLON.Color3(0.32, 0.43, 0.22));

    const nearGround = BABYLON.MeshBuilder.CreateGround("nearShore", { width: 48, height: 18, subdivisions: 2 }, scene);
    nearGround.position.z = -8;
    nearGround.material = groundMat;

    const bank = BABYLON.MeshBuilder.CreateBox("bankEdge", { width: 48, height: 0.65, depth: 2.8 }, scene);
    bank.position = new BABYLON.Vector3(0, -0.25, 0.2);
    bank.material = soilMat;

    const farGround = BABYLON.MeshBuilder.CreateGround("farShore", { width: 50, height: 15, subdivisions: 2 }, scene);
    farGround.position.z = 29;
    farGround.material = farGroundMat;

    const water = BABYLON.MeshBuilder.CreateGround("pondWater", { width: 48, height: 30, subdivisions: 64 }, scene);
    water.position = new BABYLON.Vector3(0, 0, 14.2);
    waterMaterial = new BABYLON.StandardMaterial("waterMaterial", scene);
    waterMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.55, 0.55);
    waterMaterial.specularColor = new BABYLON.Color3(0.75, 0.9, 0.88);
    waterMaterial.specularPower = 80;
    waterMaterial.alpha = 0.78;
    waterMaterial.backFaceCulling = false;
    water.material = waterMaterial;

    const bottom = BABYLON.MeshBuilder.CreateGround("pondBottom", { width: 48, height: 30, subdivisions: 8 }, scene);
    bottom.position = new BABYLON.Vector3(0, -2.42, 14.2);
    bottom.material = material("bottomMaterial", new BABYLON.Color3(0.20, 0.27, 0.17));

    for (let i = 0; i < 28; i += 1) createTree(randomBetween(-24, 24), randomBetween(23, 35), randomBetween(0.75, 1.25));
    for (let i = 0; i < 12; i += 1) createReed(randomBetween(-22, 22), randomBetween(0.4, 2.1));
    for (let i = 0; i < 6; i += 1) {
      const seat = BABYLON.MeshBuilder.CreateBox(`farSeat${i}`, { width: 1.1, height: 0.18, depth: 0.45 }, scene);
      seat.position = new BABYLON.Vector3(-15 + i * 6, 0.25, 25.2 + (i % 2) * 1.5);
      seat.material = material(`farSeatMat${i}`, new BABYLON.Color3(0.25, 0.19, 0.12));
    }

    const skyDome = BABYLON.MeshBuilder.CreateSphere("skyDome", { diameter: 180, segments: 16 }, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMaterial", scene);
    skyMat.backFaceCulling = false;
    skyMat.disableLighting = true;
    skyMat.emissiveColor = new BABYLON.Color3(0.57, 0.72, 0.79);
    skyDome.material = skyMat;
  }

  function createTree(x, z, scale) {
    const trunk = BABYLON.MeshBuilder.CreateCylinder(`treeTrunk${x}${z}`, { height: 3.4 * scale, diameterTop: 0.23 * scale, diameterBottom: 0.38 * scale, tessellation: 7 }, scene);
    trunk.position = new BABYLON.Vector3(x, 1.7 * scale, z);
    trunk.material = material(`trunkMat${x}${z}`, new BABYLON.Color3(0.31, 0.22, 0.12));
    const crown = BABYLON.MeshBuilder.CreateSphere(`treeCrown${x}${z}`, { diameter: 2.8 * scale, segments: 6 }, scene);
    crown.scaling.y = 1.2;
    crown.position = new BABYLON.Vector3(x, 4.05 * scale, z);
    crown.material = material(`crownMat${x}${z}`, new BABYLON.Color3(0.22 + Math.random() * .08, 0.43 + Math.random() * .1, 0.17));
  }

  function createReed(x, z) {
    const reedMat = material(`reedMat${x}${z}`, new BABYLON.Color3(0.35, 0.52, 0.18));
    for (let i = 0; i < 5; i += 1) {
      const reed = BABYLON.MeshBuilder.CreateCylinder(`reed${x}${z}${i}`, { height: randomBetween(0.8, 1.5), diameter: 0.025, tessellation: 5 }, scene);
      reed.position = new BABYLON.Vector3(x + randomBetween(-0.25, 0.25), 0.55, z + randomBetween(-0.25, 0.25));
      reed.rotation.z = randomBetween(-0.12, 0.12);
      reed.material = reedMat;
    }
  }

  function createFishingRig() {
    rodRoot = new BABYLON.TransformNode("rodRoot", scene);
    rodRoot.parent = camera;
    rodRoot.position = new BABYLON.Vector3(0.55, -0.72, 1.2);
    rodRoot.rotation = new BABYLON.Vector3(-0.15, -0.08, -0.12);

    const handleMat = material("rodHandleMaterial", new BABYLON.Color3(0.14, 0.12, 0.09));
    const rodMat = material("rodMaterial", new BABYLON.Color3(0.12, 0.18, 0.13), 0.35);
    const accentMat = material("rodAccentMaterial", new BABYLON.Color3(0.58, 0.43, 0.16), 0.4);

    const lengths = [0.7, 0.86, 0.95, 1.02, 1.08];
    let y = 0;
    rodSegments = [];
    for (let i = 0; i < lengths.length; i += 1) {
      const length = lengths[i];
      const segment = BABYLON.MeshBuilder.CreateCylinder(`rodSegment${i}`, { height: length, diameterTop: 0.045 - i * 0.006, diameterBottom: 0.06 - i * 0.007, tessellation: 12 }, scene);
      segment.parent = rodRoot;
      segment.rotation.x = Math.PI / 2;
      segment.position = new BABYLON.Vector3(0, 0.03 + i * 0.025, y + length / 2);
      segment.material = i === 0 ? handleMat : (i === 1 ? accentMat : rodMat);
      y += length;
      rodSegments.push(segment);
    }

    rodTip = new BABYLON.TransformNode("rodTip", scene);
    rodTip.parent = rodRoot;
    rodTip.position = new BABYLON.Vector3(0, 0.12, y);

    floatRoot = new BABYLON.TransformNode("floatRoot", scene);
    floatRoot.position = new BABYLON.Vector3(0, 0.08, 7.2);
    const tipMat = material("floatTipMaterial", new BABYLON.Color3(0.92, 0.19, 0.16), 0.3);
    const bodyMat = material("floatBodyMaterial", new BABYLON.Color3(0.88, 0.83, 0.63), 0.25);
    const darkMat = material("floatDarkMaterial", new BABYLON.Color3(0.08, 0.08, 0.07));

    const tip = BABYLON.MeshBuilder.CreateCylinder("floatTip", { height: 0.62, diameter: 0.035, tessellation: 10 }, scene);
    tip.parent = floatRoot;
    tip.position.y = 0.30;
    tip.material = tipMat;
    const floatBody = BABYLON.MeshBuilder.CreateSphere("floatBody", { diameter: 0.15, segments: 12 }, scene);
    floatBody.parent = floatRoot;
    floatBody.scaling.y = 1.55;
    floatBody.position.y = -0.08;
    floatBody.material = bodyMat;
    const stem = BABYLON.MeshBuilder.CreateCylinder("floatStem", { height: 0.32, diameter: 0.018, tessellation: 8 }, scene);
    stem.parent = floatRoot;
    stem.position.y = -0.32;
    stem.material = darkMat;
    floatRoot.setEnabled(false);

    updateFishingLine();
  }

  function createLandingMarker() {
    landingMarker = BABYLON.MeshBuilder.CreateTorus("landingMarker", { diameter: 0.75, thickness: 0.025, tessellation: 48 }, scene);
    landingMarker.rotation.x = Math.PI / 2;
    landingMarker.position.y = 0.025;
    landingMarker.material = material("markerMaterial", new BABYLON.Color3(0.93, 0.72, 0.24), 0.45);
    landingMarker.setEnabled(false);
  }

  function getRodTipWorld() {
    rodTip.computeWorldMatrix(true);
    return rodTip.getAbsolutePosition().clone();
  }

  function updateFishingLine() {
    if (!scene || !rodTip) return;
    const start = getRodTipWorld();
    const end = floatRoot && floatRoot.isEnabled() ? floatRoot.position.clone() : start.add(new BABYLON.Vector3(0, -0.1, 0.1));
    const mid = BABYLON.Vector3.Lerp(start, end, 0.5);
    mid.y -= floatRoot && floatRoot.isEnabled() ? 0.25 : 0.05;
    const curve = BABYLON.Curve3.CreateQuadraticBezier(start, mid, end, 24);
    const points = curve.getPoints();
    if (lineMesh) {
      BABYLON.MeshBuilder.CreateLines("fishingLine", { points, instance: lineMesh });
    } else {
      lineMesh = BABYLON.MeshBuilder.CreateLines("fishingLine", { points, updatable: true }, scene);
      lineMesh.color = new BABYLON.Color3(0.88, 0.92, 0.86);
      lineMesh.alpha = 0.78;
      lineMesh.isPickable = false;
    }
  }

  function updateLandingPreview() {
    if (!camera || !landingMarker || gameState !== GameState.CAST_AIM) return;
    const forward = camera.getForwardRay().direction.clone();
    forward.y = 0;
    forward.normalize();
    const distance = 3.5 + castPower * 0.055;
    const player = camera.position.clone();
    const point = player.add(forward.scale(distance));
    point.y = 0.03;
    point.z = Math.max(1.2, point.z);
    landingMarker.position.copyFrom(point);
    landingMarker.setEnabled(true);
    ui["cast-distance-preview"].textContent = `${distance.toFixed(1)} m`;
  }

  function updateFrame() {
    const dt = engine.getDeltaTime() / 1000;
    const now = performance.now();
    constrainCamera(dt);
    animateWater(now);
    animateFloat(now);
    updateRodBend();
    updateFishingLine();
    if (gameState === GameState.CAST_AIM) updateLandingPreview();
    if ([GameState.FIGHT, GameState.NET_READY].includes(gameState)) updateFight(dt);
  }

  function constrainCamera(dt) {
    if (!camera || ![GameState.READY, GameState.RIG_SETUP].includes(gameState)) {
      if (camera) camera.cameraDirection.set(0, 0, 0);
    }
    const manualSpeed = 3.2 * dt;
    if ([GameState.READY, GameState.RIG_SETUP].includes(gameState)) {
      const forward = camera.getDirection(BABYLON.Axis.Z); forward.y = 0; forward.normalize();
      const right = camera.getDirection(BABYLON.Axis.X); right.y = 0; right.normalize();
      if (moveDirection.forward) camera.position.addInPlace(forward.scale(manualSpeed));
      if (moveDirection.back) camera.position.addInPlace(forward.scale(-manualSpeed));
      if (moveDirection.left) camera.position.addInPlace(right.scale(-manualSpeed));
      if (moveDirection.right) camera.position.addInPlace(right.scale(manualSpeed));
    }
    camera.position.x = clamp(camera.position.x, -18, 18);
    camera.position.z = clamp(camera.position.z, -15, -2.2);
    camera.position.y = 1.72;
  }

  function animateWater(now) {
    if (waterMaterial) {
      const wave = 0.03 * Math.sin(now * 0.0006);
      waterMaterial.diffuseColor = new BABYLON.Color3(0.25 + wave, 0.54 + wave * .6, 0.54 + wave * .6);
    }
  }

  function animateFloat(now) {
    if (!floatRoot || !floatRoot.isEnabled() || !floatBasePosition) return;
    let offset = Math.sin(now * 0.0022) * 0.015;
    let roll = Math.sin(now * 0.0014) * 0.018;
    if (gameState === GameState.FLOAT_SETTLE) offset += Math.sin(now * 0.006) * 0.025;
    if (gameState === GameState.BITE) {
      const elapsed = now - biteStartAt;
      offset += getBiteOffset(elapsed, bitePattern);
      roll += bitePattern === "横移" ? 0.22 * Math.sin(elapsed * 0.01) : 0;
      if (elapsed > 2200) missBite("鱼已经吐钩，漂相恢复。", false);
    }
    floatRoot.position.x = floatBasePosition.x + (["横移"].includes(bitePattern) && gameState === GameState.BITE ? Math.sin((now - biteStartAt) * .005) * .25 : 0);
    floatRoot.position.y = floatBasePosition.y + offset;
    floatRoot.position.z = floatBasePosition.z;
    floatRoot.rotation.z = roll;
    ui["monitor-float"].style.transform = `translate(-50%, ${Math.round(offset * 150)}px) rotate(${roll * 35}deg)`;
  }

  function getBiteOffset(elapsed, pattern) {
    if (elapsed < 0) return 0;
    if (pattern === "黑漂") {
      if (elapsed < 480) return Math.sin(elapsed * 0.025) * 0.035;
      return -clamp((elapsed - 480) / 820, 0, 1) * 0.55;
    }
    if (pattern === "顿后黑漂") {
      if (elapsed < 460) return -Math.max(0, Math.sin(elapsed * 0.028)) * 0.08;
      if (elapsed < 760) return Math.sin(elapsed * 0.018) * 0.015;
      return -clamp((elapsed - 760) / 700, 0, 1) * 0.46;
    }
    if (pattern === "上顶") {
      if (elapsed < 520) return Math.sin(elapsed * 0.03) * 0.025;
      return clamp((elapsed - 520) / 650, 0, 1) * 0.20;
    }
    if (pattern === "缓沉") return -clamp(elapsed / 1500, 0, 1) * 0.32 + Math.sin(elapsed * .018) * .018;
    if (pattern === "横移") return Math.sin(elapsed * .022) * 0.045;
    if (pattern === "连续顿口") return -Math.max(0, Math.sin(elapsed * .021)) * 0.15;
    if (elapsed < 520) return Math.sin(elapsed * 0.03) * 0.03;
    if (elapsed < 1150) return -0.17;
    return -0.05;
  }

  function updateRodBend() {
    const bend = [GameState.FIGHT, GameState.NET_READY].includes(gameState) ? clamp(tension / 100, 0, 1) : 0;
    rodSegments.forEach((segment, index) => {
      const baseZ = -0.012 * index;
      segment.rotation.z = baseZ - bend * (0.018 + index * 0.017);
      segment.rotation.x = Math.PI / 2 + bend * index * 0.009;
    });
  }

  function startCharging() {
    if (gameState !== GameState.READY || charging) return;
    charging = true;
    chargeDirection = 1;
    castPower = 8;
    setState(GameState.CAST_AIM);
    ui["primary-action"].classList.add("charging");
    landingMarker.setEnabled(true);
    let previous = performance.now();
    const tick = (now) => {
      if (!charging) return;
      const dt = now - previous;
      previous = now;
      castPower += chargeDirection * dt * 0.06;
      if (castPower >= 100) { castPower = 100; chargeDirection = -1; }
      if (castPower <= 18) { castPower = 18; chargeDirection = 1; }
      ui["cast-power-label"].textContent = `${Math.round(castPower)}%`;
      ui["cast-power-bar"].style.width = `${castPower}%`;
      chargeAnimationId = requestAnimationFrame(tick);
    };
    chargeAnimationId = requestAnimationFrame(tick);
  }

  function releaseCast() {
    if (!charging || gameState !== GameState.CAST_AIM) return;
    charging = false;
    cancelAnimationFrame(chargeAnimationId);
    ui["primary-action"].classList.remove("charging");
    performCast();
  }

  function performCast() {
    setState(GameState.CAST_FLIGHT);
    landingMarker.setEnabled(false);
    const forward = camera.getForwardRay().direction.clone();
    forward.y = 0; forward.normalize();
    castDistance = 3.5 + castPower * 0.055;
    const start = getRodTipWorld();
    const destination = camera.position.add(forward.scale(castDistance));
    destination.y = 0.08;
    destination.z = Math.max(1.3, destination.z);
    floatRoot.setEnabled(true);
    floatRoot.position.copyFrom(start);
    floatRoot.rotation.z = Math.PI / 2;
    const startTime = performance.now();
    const duration = 780 + castDistance * 22;
    const animate = (now) => {
      const t = clamp((now - startTime) / duration, 0, 1);
      const ease = 1 - Math.pow(1 - t, 2);
      const current = BABYLON.Vector3.Lerp(start, destination, ease);
      current.y += Math.sin(Math.PI * t) * (1.2 + castDistance * 0.08);
      floatRoot.position.copyFrom(current);
      floatRoot.rotation.z = BABYLON.Scalar.Lerp(Math.PI / 2, 0.28, t);
      if (t < 1) requestAnimationFrame(animate);
      else settleFloat(destination);
    };
    requestAnimationFrame(animate);
  }

  function settleFloat(destination) {
    setState(GameState.FLOAT_SETTLE);
    floatBasePosition = destination.clone();
    floatBasePosition.y = 0.04;
    floatRoot.position.copyFrom(floatBasePosition);
    floatRoot.rotation.z = 0.22;
    ui["distance-label"].textContent = `${castDistance.toFixed(1)} m`;
    ui["bite-hint"].textContent = "浮漂翻身中";
    showToast(`落点距离 ${castDistance.toFixed(1)} 米 · ${getDepthState().text}`);
    window.setTimeout(() => {
      if (gameState !== GameState.FLOAT_SETTLE) return;
      floatRoot.rotation.z = 0;
      setState(GameState.WAIT_BITE);
      ui["bite-hint"].textContent = "等待鱼口";
      scheduleBite();
    }, 1650);
  }

  function scheduleBite(delay) {
    clearTimeout(biteTimeout);
    const bait = getSelectedBait();
    const actualDelay = delay ?? randomBetween(3800 / bait.biteSpeed, 8500 / bait.biteSpeed);
    biteTimeout = window.setTimeout(() => {
      if (gameState === GameState.WAIT_BITE) triggerBite();
    }, actualDelay);
  }

  function getFishScore(species, profile, bait, depthState) {
    let score = profile.rarity;
    if (bait.fishes.includes(species)) score += 5;
    if (profile.preferredBaits.includes(bait.id)) score += 4;

    if (profile.preferredLayers.includes(depthState.kind)) score += 4.5;
    else if (depthState.kind === "near" && profile.preferredLayers.includes("bottom")) score += 2.3;
    else if (depthState.kind === "bottom" && profile.preferredLayers.includes("near")) score += 1.6;
    else if (depthState.kind === "float" && profile.preferredLayers.includes("near")) score += 1.1;
    else if (depthState.kind === "over" && profile.preferredLayers.includes("bottom")) score += 1.2;
    else score -= 2.2;

    if (bait.id === "silver") {
      if (species === "鲢鱼") score += 9;
      if (species === "鳙鱼") score += 8;
      if (!["鲢鱼", "鳙鱼"].includes(species)) score -= 2.5;
    }
    if (bait.id === "corn") {
      if (species === "青鱼") score += 5.5;
      if (species === "草鱼") score += 3.2;
      if (species === "鲤鱼") score += 2.6;
    }
    if (bait.id === "shrimp") {
      if (species === "罗非鱼") score += 4.2;
      if (species === "翘嘴") score += 3.6;
    }
    if (bait.id === "worm" && species === "鲫鱼") score += 3.2;
    if (bait.id === "mixed" && ["鲫鱼", "鲤鱼", "草鱼"].includes(species)) score += 1.8;

    if (castDistance >= 7) {
      if (["鲢鱼", "鳙鱼", "翘嘴", "草鱼"].includes(species)) score += 1.4;
      if (["鲫鱼", "罗非鱼"].includes(species)) score -= 0.6;
    } else if (castDistance <= 5.4) {
      if (["鲫鱼", "罗非鱼", "鳊鱼"].includes(species)) score += 1.5;
      if (["青鱼", "鳙鱼"].includes(species)) score -= 1.4;
    }

    score += Math.random() * 0.8;
    return Math.max(0.15, score);
  }

  function weightedFishChoice(candidates) {
    const total = candidates.reduce((sum, item) => sum + item.score, 0);
    let cursor = Math.random() * total;
    for (const item of candidates) {
      cursor -= item.score;
      if (cursor <= 0) return item;
    }
    return candidates[candidates.length - 1];
  }

  function chooseBitePattern(profile) {
    return randomItem(profile.bitePatterns);
  }

  function sampleWeight(profile, baitId) {
    const baitBonus = baitId === "corn" || baitId === "mixed" ? -0.12 : baitId === "silver" ? -0.08 : 0;
    const exponent = Math.max(0.85, profile.sizeBias + baitBonus);
    const normalized = Math.pow(Math.random(), exponent);
    return profile.minKg + (profile.maxKg - profile.minKg) * normalized;
  }

  function sampleLength(profile) {
    const normalized = Math.pow(Math.random(), Math.max(1.0, profile.sizeBias - 0.1));
    return profile.minCm + (profile.maxCm - profile.minCm) * normalized;
  }

  function chooseFish() {
    const bait = getSelectedBait();
    const depthState = getDepthState();
    const candidates = Object.entries(FISH_PROFILES).map(([species, profile]) => ({
      species,
      profile,
      score: getFishScore(species, profile, bait, depthState)
    }));
    const chosen = weightedFishChoice(candidates);
    const weight = sampleWeight(chosen.profile, bait.id);
    const length = sampleLength(chosen.profile);
    return { species: chosen.species, weight, length, profile: chosen.profile, depthState: depthState.text };
  }

  function triggerBite() {
    if (gameState !== GameState.WAIT_BITE) return;
    hookedFish = chooseFish();
    bitePattern = chooseBitePattern(hookedFish.profile);
    const timing = BITE_PATTERN_CONFIG[bitePattern] || BITE_PATTERN_CONFIG["顿口"];
    biteStartAt = performance.now();
    biteWindowStart = timing.start;
    biteWindowEnd = timing.end;
    hookedFish.bitePattern = bitePattern;
    setState(GameState.BITE, `${bitePattern} · 判断提竿`);
    ui["bite-hint"].textContent = bitePattern;
    showToast(`浮漂出现${bitePattern}！`, 1600);
  }

  function attemptHook() {
    if (gameState === GameState.WAIT_BITE) {
      showToast("浮漂没有有效动作，空竿。", 1800);
      retrieveRig(false);
      return;
    }
    if (gameState !== GameState.BITE) return;
    const elapsed = performance.now() - biteStartAt;
    if (elapsed < biteWindowStart) {
      missBite("提竿过早，鱼尚未把饵吸稳。", true);
    } else if (elapsed > biteWindowEnd) {
      missBite("提竿过晚，鱼已吐出鱼钩。", true);
    } else {
      startFight(elapsed);
    }
  }

  function missBite(message, retrieve = true) {
    if (![GameState.BITE, GameState.WAIT_BITE].includes(gameState)) return;
    clearTimeout(biteTimeout);
    showToast(message, 2200);
    ui["bite-hint"].textContent = "空竿";
    if (retrieve) window.setTimeout(() => retrieveRig(false), 800);
    else {
      setState(GameState.WAIT_BITE);
      ui["bite-hint"].textContent = "等待下一口";
      scheduleBite(randomBetween(3000, 6500));
    }
  }

  function startFight(hookElapsed) {
    clearTimeout(biteTimeout);
    const weightPower = hookedFish.weight * 2.1;
    tension = clamp(22 + hookedFish.profile.power * 13 + weightPower, 24, 92);
    fishStamina = clamp(58 + hookedFish.profile.power * 18 + hookedFish.weight * 3.6, 55, 100);
    fishDistance = castDistance;
    fishPullPhase = Math.random() * Math.PI * 2;
    exhaustionHintShown = false;
    hookedFish.hookElapsed = hookElapsed;
    setState(GameState.FIGHT, `中鱼 · ${hookedFish.species}`);
    ui["bite-hint"].textContent = "已中鱼";
    updateFightUI();
    showToast(`${hookedFish.species}中钩！顺着鱼的发力方向控竿。`, 2400);
  }

  function getLandingRule() {
    const directLift = Boolean(hookedFish && hookedFish.weight <= DIRECT_LIFT_MAX_KG);
    return {
      directLift,
      distance: directLift ? DIRECT_LIFT_DISTANCE : NET_DISTANCE,
      actionText: directLift ? "提鱼上岸" : "使用抄网",
      shortText: directLift ? "提鱼" : "抄鱼"
    };
  }

  function checkLandingReady() {
    if (!hookedFish || gameState !== GameState.FIGHT) return false;
    const rule = getLandingRule();
    if (fishStamina <= LANDING_STAMINA && fishDistance <= rule.distance) {
      setState(GameState.NET_READY, rule.directLift ? "小鱼已靠岸 · 可以提鱼" : "鱼已靠岸 · 可以抄鱼");
      ui["net-button"].disabled = false;
      ui["net-button"].textContent = rule.actionText;
      ui["net-button"].classList.add("ready");
      ui["fight-guidance"].className = "fight-guidance ready";
      ui["fight-guidance"].textContent = rule.directLift ? "小鱼已经进入提鱼范围，点击“提鱼上岸”。" : "鱼已进入抄网范围，点击“使用抄网”。";
      showToast(rule.directLift ? "小鱼已疲劳并靠岸，可以直接提鱼。" : "鱼已疲劳并进入抄网范围。", 2200);
      if (navigator.vibrate) navigator.vibrate([80, 45, 120]);
      return true;
    }
    return false;
  }

  function updateFight(dt) {
    if (!hookedFish || gameState === GameState.NET_READY) return;
    fishPullPhase += dt * (1.35 + hookedFish.profile.power * .68 + Math.min(0.8, hookedFish.weight * .03));
    const pulse = (Math.sin(fishPullPhase) + 1) * .5;
    const exhausted = fishStamina <= 0;
    const burst = !exhausted && pulse > .82 ? hookedFish.profile.power * 16 * dt : 0;
    tension += ((exhausted ? .45 : hookedFish.profile.power * 2.6) + burst - (exhausted ? 2.1 : 1.45)) * dt;
    fishStamina -= (1.7 + tension * .012 + hookedFish.weight * .03) * dt;

    const distanceDelta = (pulse - .54) * hookedFish.profile.power * .55 * dt;
    fishDistance += exhausted ? Math.min(0, distanceDelta) : distanceDelta;
    fishDistance = clamp(fishDistance, 1.0, castDistance + 2.3);
    tension = clamp(tension, 4, 100);
    fishStamina = clamp(fishStamina, 0, 100);

    if (tension >= 96) { loseFish("张力过高，子线切断了。跑鱼！"); return; }
    if (tension <= 6 && fishStamina > 25) { loseFish("鱼线失去张力，鱼钩脱落了。跑鱼！"); return; }

    if (fishStamina <= LANDING_STAMINA && !exhaustionHintShown) {
      exhaustionHintShown = true;
      const rule = getLandingRule();
      const remaining = Math.max(0, fishDistance - rule.distance);
      showToast(`鱼已疲劳，还需拉近 ${remaining.toFixed(1)} 米。`, 2600);
    }

    if (checkLandingReady()) return;
    updateFightUI();
  }

  function applyFightAction(action) {
    if (gameState !== GameState.FIGHT) return;
    const exhausted = fishStamina <= LANDING_STAMINA;
    if (action === "lift") {
      tension += exhausted ? 10 : 15;
      fishStamina -= 10 + hookedFish.profile.power * 3;
      fishDistance -= exhausted ? 0.95 : 0.55;
      showToast(exhausted ? "鱼已疲劳：抬竿可更快带近岸边。" : "抬竿施压：消耗鱼体力，但张力上升。", 1200);
    } else if (action === "lower") {
      tension -= 20;
      fishStamina -= 2;
      fishDistance += exhausted ? 0 : 0.16;
      showToast(exhausted ? "顺势卸力：鱼已疲劳，不会再向外逃。" : "顺势卸力：降低断线风险。", 1200);
    } else if (action === "left") {
      tension += exhausted ? 3 : 5;
      fishStamina -= 7;
      fishDistance -= exhausted ? 0.68 : 0.35;
      showToast(exhausted ? "鱼已疲劳：横向控鱼可快速带近。" : "横向控鱼：避免正面拔河。", 1200);
    }
    tension = clamp(tension, 4, 100);
    fishStamina = clamp(fishStamina, 0, 100);
    fishDistance = clamp(fishDistance, 1, castDistance + 2);
    if (!checkLandingReady()) updateFightUI();
  }

  function updateFightUI() {
    ui["tension-label"].textContent = `${Math.round(tension)}%`;
    ui["tension-bar"].style.width = `${tension}%`;
    ui["tension-bar"].style.background = tension > 82 ? "var(--danger)" : tension < 18 ? "#8fb5c7" : "var(--accent)";
    ui["stamina-label"].textContent = `${Math.round(fishStamina)}%`;
    ui["stamina-bar"].style.width = `${fishStamina}%`;
    ui["stamina-bar"].style.background = "var(--safe)";
    ui["fish-distance-label"].textContent = `${fishDistance.toFixed(1)} m`;

    const rule = getLandingRule();
    const remaining = Math.max(0, fishDistance - rule.distance);
    ui["net-button"].textContent = rule.directLift ? `提鱼（需≤${rule.distance.toFixed(1)}m）` : `抄网（需≤${rule.distance.toFixed(1)}m）`;
    ui["net-button"].disabled = gameState !== GameState.NET_READY;
    ui["net-button"].classList.toggle("ready", gameState === GameState.NET_READY);

    ui["fight-guidance"].className = "fight-guidance";
    if (gameState === GameState.NET_READY) {
      ui["fight-guidance"].classList.add("ready");
      ui["fight-guidance"].textContent = rule.directLift ? "小鱼已靠岸，可以直接提鱼上岸。" : "鱼已靠岸，可以使用抄网。";
    } else if (fishStamina <= LANDING_STAMINA) {
      ui["fight-guidance"].classList.add("warning");
      ui["fight-guidance"].textContent = `鱼已疲劳，还需拉近 ${remaining.toFixed(1)} 米；抬竿或横向控鱼可更快靠岸。`;
    } else {
      ui["fight-guidance"].textContent = `先消耗鱼的体力，再带到${rule.distance.toFixed(1)}米以内。`;
    }
  }

  function loseFish(message) {
    if (![GameState.FIGHT, GameState.NET_READY].includes(gameState)) return;
    showToast(message, 2600);
    hookedFish = null;
    window.setTimeout(() => retrieveRig(false), 1200);
  }

  function gradeCatch(weight) {
    if (weight >= 10) return "巨物";
    if (weight >= 5) return "大物";
    if (weight >= 2) return "不错";
    if (weight >= 0.8) return "合格";
    return "轻量";
  }

  function timingGrade(diff) {
    return diff < 180 ? "精准" : diff < 380 ? "良好" : "勉强";
  }

  function catchSummary(result, rule) {
    const action = rule.directLift ? "适合直接提鱼上岸" : "需要抄网完成入护";
    return `${gradeCatch(result.weight)}渔获：${result.species} ${result.weight.toFixed(2)} kg，当前钓层为${result.depthState}，漂相表现为${result.bitePattern}，${action}。`;
  }

  function netFish() {
    if (gameState !== GameState.NET_READY || !hookedFish) return;
    const rule = getLandingRule();
    setState(GameState.RESULT);
    const result = hookedFish;
    const center = (biteWindowStart + biteWindowEnd) / 2;
    const timingDiff = Math.abs(result.hookElapsed - center);
    const timingText = timingGrade(timingDiff);
    const methodText = rule.directLift ? "提鱼上岸" : "抄网成功";
    const gradeText = gradeCatch(result.weight);

    ui["timing-result"].textContent = timingText;
    ui["result-bait"].textContent = getSelectedBait().name;
    ui["result-layer"].textContent = result.depthState;
    ui["result-pattern"].textContent = result.bitePattern;
    ui["result-method"].textContent = methodText;
    ui["result-note"].textContent = result.profile.note;
    ui["catch-title"].textContent = `${result.species}`;
    ui["catch-detail"].textContent = `${result.weight.toFixed(2)} kg · ${Math.round(result.length)} cm`;
    ui["catch-summary"].textContent = catchSummary(result, rule);
    ui["catch-image"].src = result.profile.image;
    ui["catch-image"].alt = `${result.species}图片`;
    ui["result-grade-badge"].textContent = gradeText;
    ui["result-method-badge"].textContent = methodText;
    ui["result-pattern-badge"].textContent = result.bitePattern;
    ui["result-dialog"].classList.add("visible");
    camera.detachControl();
  }

  function retrieveRig(showMessage = true) {
    clearTimeout(biteTimeout);
    charging = false;
    cancelAnimationFrame(chargeAnimationId);
    landingMarker.setEnabled(false);
    floatRoot.setEnabled(false);
    floatBasePosition = null;
    hookedFish = null;
    ui["distance-label"].textContent = "—";
    ui["bite-hint"].textContent = "等待抛竿";
    ui["net-button"].disabled = true;
    ui["net-button"].classList.remove("ready");
    ui["net-button"].textContent = "抄网（需≤1.8m）";
    ui["fight-guidance"].className = "fight-guidance";
    ui["fight-guidance"].textContent = "先消耗鱼的体力，再将鱼带到岸边。";
    exhaustionHintShown = false;
    setState(GameState.READY);
    if (showMessage) showToast("已收回线组，可以调整钓位或重新挂饵。", 1800);
  }

  function focusFloat() {
    if (!floatRoot || !floatRoot.isEnabled()) {
      showToast("当前还没有抛竿。", 1300);
      return;
    }
    camera.setTarget(floatRoot.position.add(new BABYLON.Vector3(0, 0.18, 0)));
  }

  function initInteractions() {
    ui["primary-action"].addEventListener("pointerdown", event => {
      event.preventDefault();
      if (gameState === GameState.READY) startCharging();
      else if ([GameState.WAIT_BITE, GameState.BITE].includes(gameState)) attemptHook();
      else if (gameState === GameState.NET_READY) netFish();
    });

    window.addEventListener("pointerup", () => { if (charging) releaseCast(); });

    ui["primary-action"].addEventListener("keydown", event => {
      if ((event.code === "Space" || event.code === "Enter") && gameState === GameState.READY && !charging) {
        event.preventDefault();
        startCharging();
      }
    });

    ui["primary-action"].addEventListener("keyup", event => {
      if ((event.code === "Space" || event.code === "Enter") && charging) releaseCast();
    });

    ui["rig-button"].addEventListener("click", () => {
      if (![GameState.READY, GameState.WAIT_BITE].includes(gameState)) return;
      if (gameState === GameState.WAIT_BITE) retrieveRig(false);
      ui["depth-range"].value = fishingDepth.toFixed(2);
      updateDepthUI(fishingDepth);
      setState(GameState.RIG_SETUP);
      openDialog(ui["rig-dialog"]);
    });

    ui["bait-button"].addEventListener("click", () => {
      if (![GameState.READY, GameState.WAIT_BITE].includes(gameState)) return;
      if (gameState === GameState.WAIT_BITE) retrieveRig(false);
      pendingBaitId = selectedBaitId;
      refreshBaitSelection();
      openDialog(ui["bait-dialog"]);
    });

    ui["retrieve-button"].addEventListener("click", () => retrieveRig(true));
    ui["test-bite-button"].addEventListener("click", () => triggerBite());
    ui["focus-float-button"].addEventListener("click", focusFloat);
    ui["depth-range"].addEventListener("input", () => updateDepthUI(Number(ui["depth-range"].value)));

    document.querySelectorAll("[data-depth-step]").forEach(button => {
      button.addEventListener("click", () => {
        const range = ui["depth-range"];
        const value = clamp(Number(range.value) + Number(button.dataset.depthStep), Number(range.min), Number(range.max));
        range.value = value.toFixed(2);
        updateDepthUI(value);
      });
    });

    ui["save-rig-button"].addEventListener("click", () => {
      fishingDepth = Number(ui["depth-range"].value);
      updateDepthUI(fishingDepth);
      closeDialog(ui["rig-dialog"]);
      setState(GameState.READY);
      showToast(`线组已调整：${getDepthState().text}`);
    });

    ui["save-bait-button"].addEventListener("click", () => {
      selectedBaitId = pendingBaitId;
      ui["bait-label"].textContent = getSelectedBait().name;
      closeDialog(ui["bait-dialog"]);
      setState(GameState.READY);
      showToast(`已换成${getSelectedBait().name}`);
    });

    document.querySelectorAll("[data-close-dialog]").forEach(button => {
      button.addEventListener("click", () => {
        const dialog = document.getElementById(button.dataset.closeDialog);
        closeDialog(dialog);
        if (gameState === GameState.RIG_SETUP) setState(GameState.READY);
      });
    });

    document.querySelectorAll("[data-fight]").forEach(button => {
      button.addEventListener("click", () => applyFightAction(button.dataset.fight));
    });

    ui["net-button"].addEventListener("click", netFish);
    ui["continue-button"].addEventListener("click", () => {
      ui["result-dialog"].classList.remove("visible");
      camera.attachControl(ui["render-canvas"], true);
      retrieveRig(false);
      showToast("渔获已放入鱼护，重新挂饵后可以继续。", 2100);
    });

    document.querySelectorAll("[data-move]").forEach(button => {
      const direction = button.dataset.move;
      const activate = event => {
        event.preventDefault();
        if (gameState !== GameState.READY) {
          showToast("先收竿，才能移动钓位。", 1300);
          return;
        }
        moveDirection[direction] = true;
        button.classList.add("active");
      };
      const deactivate = () => {
        moveDirection[direction] = false;
        button.classList.remove("active");
      };
      button.addEventListener("pointerdown", activate);
      button.addEventListener("pointerup", deactivate);
      button.addEventListener("pointerleave", deactivate);
      button.addEventListener("pointercancel", deactivate);
    });

    window.addEventListener("keydown", event => {
      if (event.code === "KeyF" && gameState === GameState.WAIT_BITE) triggerBite();
      if (event.code === "KeyR") retrieveRig(true);
    });
  }

  async function boot() {
    cacheUI();
    buildBaitGrid();
    updateDepthUI();
    setLoading(12, "初始化界面……");

    if (!window.BABYLON) {
      ui["loading-screen"].querySelector("p").textContent = "Babylon.js 加载失败，请检查网络连接后刷新。";
      return;
    }

    try {
      setLoading(35, "生成三维池塘……");
      createScene();
      setLoading(68, "组装鱼竿和浮漂……");
      initInteractions();
      setLoading(92, "校准操作状态……");
      await new Promise(resolve => window.setTimeout(resolve, 450));
      setLoading(100, "准备完成");
      await new Promise(resolve => window.setTimeout(resolve, 250));
      ui["loading-screen"].classList.remove("visible");
      setState(GameState.READY);
      ui["bait-label"].textContent = getSelectedBait().name;
      showToast("按住右下角“抛竿”蓄力，松开完成抛投。", 3200);
      console.info(`[台钓网页游戏] v${VERSION} 已启动`);
    } catch (error) {
      console.error(error);
      ui["loading-screen"].classList.add("visible");
      ui["loading-screen"].querySelector("p").textContent = `启动失败：${error.message}`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
