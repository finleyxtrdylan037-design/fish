(() => {
  "use strict";

  const VERSION = "0.1.0";
  const WATER_DEPTH = 2.4;

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
    { id: "worm", name: "蚯蚓", targets: "鲫鱼、鲤鱼、小杂鱼", layer: "底层 / 离底", note: "耐泡，容易出现小鱼试探。", fishes: ["鲫鱼", "鲤鱼", "鳊鱼"] },
    { id: "foam", name: "泡泡球", targets: "鲫鱼、鲤鱼、滑口鱼", layer: "底层 / 离底", note: "入口轻，附钩时间较长。", fishes: ["鲫鱼", "鲤鱼"] },
    { id: "silver", name: "鲢鳙粉饵", targets: "鲢鱼、鳙鱼", layer: "中上层", note: "持续雾化，适合钓浮。", fishes: ["鲢鱼", "鳙鱼"] },
    { id: "corn", name: "玉米", targets: "鲤鱼、草鱼、鳊鱼", layer: "底层 / 离底", note: "耐泡，小杂鱼干扰较少。", fishes: ["鲤鱼", "草鱼", "鳊鱼"] },
    { id: "shrimp", name: "虾拉", targets: "鲫鱼、罗非鱼、鲤鱼", layer: "底层 / 离底", note: "入口性好，适合轻口。", fishes: ["鲫鱼", "罗非鱼", "鲤鱼"] },
    { id: "mixed", name: "混养饵料", targets: "鲫鲤草鳊", layer: "底层为主", note: "适用面广，针对性一般。", fishes: ["鲫鱼", "鲤鱼", "草鱼", "鳊鱼"] }
  ];

  const FISH_PROFILES = {
    "鲫鱼": { minKg: 0.18, maxKg: 0.85, minCm: 16, maxCm: 33, bite: "顿口", power: 0.72 },
    "鲤鱼": { minKg: 1.1, maxKg: 5.2, minCm: 38, maxCm: 72, bite: "黑漂", power: 1.28 },
    "鳊鱼": { minKg: 0.45, maxKg: 1.5, minCm: 28, maxCm: 45, bite: "上顶", power: 0.92 },
    "鲢鱼": { minKg: 1.4, maxKg: 4.8, minCm: 43, maxCm: 75, bite: "缓沉", power: 1.12 },
    "鳙鱼": { minKg: 1.8, maxKg: 6.0, minCm: 48, maxCm: 82, bite: "缓沉", power: 1.22 },
    "草鱼": { minKg: 1.8, maxKg: 6.8, minCm: 50, maxCm: 88, bite: "横移", power: 1.38 },
    "罗非鱼": { minKg: 0.35, maxKg: 1.45, minCm: 22, maxCm: 42, bite: "连续顿口", power: 0.88 }
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
  let floatBody;
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
  let floatVisualOffset = 0;
  let biteTimeout = null;
  let biteStartAt = 0;
  let biteWindowStart = 650;
  let biteWindowEnd = 1500;
  let bitePattern = "顿口";
  let hookedFish = null;
  let tension = 36;
  let fishStamina = 100;
  let fishDistance = 7;
  let fightLastTime = 0;
  let fishPullPhase = 0;
  let toastTimer = null;
  let pointerDownOnCanvas = false;
  let moveDirection = { forward: false, back: false, left: false, right: false };

  function cacheUI() {
    const ids = [
      "game-shell", "render-canvas", "loading-screen", "loading-progress", "game-state-label",
      "distance-label", "water-depth-label", "fishing-depth-label", "depth-state-label", "bait-label",
      "monitor-float", "bite-hint", "focus-float-button", "primary-action", "rig-button", "bait-button",
      "retrieve-button", "test-bite-button", "cast-hud", "cast-power-label", "cast-power-bar",
      "cast-distance-preview", "fight-hud", "tension-label", "tension-bar", "stamina-label",
      "stamina-bar", "fish-distance-label", "net-button", "rig-dialog", "depth-range",
      "dialog-depth-label", "dialog-depth-state", "diagram-hook", "save-rig-button", "bait-dialog",
      "bait-grid", "save-bait-button", "result-dialog", "catch-title", "catch-detail", "timing-result",
      "result-bait", "continue-button", "toast"
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
      primary.textContent = gameState === GameState.NET_READY ? "抄鱼" : "遛鱼中";
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

    for (let i = 0; i < 28; i += 1) {
      createTree(randomBetween(-24, 24), randomBetween(23, 35), randomBetween(0.75, 1.25));
    }
    for (let i = 0; i < 12; i += 1) {
      createReed(randomBetween(-22, 22), randomBetween(0.4, 2.1));
    }
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
      const segment = BABYLON.MeshBuilder.CreateCylinder(`rodSegment${i}`, {
        height: length,
        diameterTop: 0.045 - i * 0.006,
        diameterBottom: 0.06 - i * 0.007,
        tessellation: 12
      }, scene);
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
    floatBody = BABYLON.MeshBuilder.CreateSphere("floatBody", { diameter: 0.15, segments: 12 }, scene);
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
    if ([GameState.FIGHT, GameState.NET_READY].includes(gameState)) updateFight(dt, now);
  }

  function constrainCamera(dt) {
    if (!camera || ![GameState.READY, GameState.RIG_SETUP].includes(gameState)) {
      if (camera) camera.cameraDirection.set(0, 0, 0);
    }

    const manualSpeed = 3.2 * dt;
    if ([GameState.READY, GameState.RIG_SETUP].includes(gameState)) {
      const forward = camera.getDirection(BABYLON.Axis.Z);
      forward.y = 0;
      forward.normalize();
      const right = camera.getDirection(BABYLON.Axis.X);
      right.y = 0;
      right.normalize();
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

    if (gameState === GameState.FLOAT_SETTLE) {
      offset += Math.sin(now * 0.006) * 0.025;
    }
    if (gameState === GameState.BITE) {
      const elapsed = now - biteStartAt;
      offset += getBiteOffset(elapsed, bitePattern);
      roll += bitePattern === "横移" ? 0.22 * Math.sin(elapsed * 0.01) : 0;
      if (elapsed > 2100) missBite("鱼已经吐钩，漂相恢复。", false);
    }

    floatVisualOffset = offset;
    floatRoot.position.x = floatBasePosition.x + (bitePattern === "横移" && gameState === GameState.BITE ? Math.sin((now - biteStartAt) * .005) * .25 : 0);
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
    if (pattern === "上顶") {
      if (elapsed < 520) return Math.sin(elapsed * 0.03) * 0.025;
      return clamp((elapsed - 520) / 650, 0, 1) * 0.20;
    }
    if (pattern === "缓沉") {
      return -clamp(elapsed / 1500, 0, 1) * 0.32 + Math.sin(elapsed * .018) * .018;
    }
    if (pattern === "横移") {
      return Math.sin(elapsed * .022) * 0.045;
    }
    if (pattern === "连续顿口") {
      return -Math.max(0, Math.sin(elapsed * .021)) * 0.15;
    }
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
    forward.y = 0;
    forward.normalize();
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

  function scheduleBite(delay = randomBetween(3800, 8500)) {
    clearTimeout(biteTimeout);
    biteTimeout = window.setTimeout(() => {
      if (gameState === GameState.WAIT_BITE) triggerBite();
    }, delay);
  }

  function chooseFish() {
    const bait = getSelectedBait();
    const pool = bait.fishes.slice();
    const depthState = getDepthState();
    if (selectedBaitId === "silver" && depthState.kind !== "float") {
      pool.push("鲫鱼", "鲫鱼");
    }
    if (selectedBaitId === "corn" && depthState.kind === "float") {
      pool.push("鳊鱼");
    }
    const species = pool[Math.floor(Math.random() * pool.length)];
    const profile = FISH_PROFILES[species];
    const weight = randomBetween(profile.minKg, profile.maxKg);
    const length = randomBetween(profile.minCm, profile.maxCm);
    return { species, weight, length, profile };
  }

  function triggerBite() {
    if (gameState !== GameState.WAIT_BITE) return;
    hookedFish = chooseFish();
    bitePattern = hookedFish.profile.bite;
    biteStartAt = performance.now();
    biteWindowStart = bitePattern === "黑漂" ? 600 : bitePattern === "缓沉" ? 750 : 520;
    biteWindowEnd = bitePattern === "横移" ? 1700 : bitePattern === "缓沉" ? 1650 : 1450;
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
    tension = 32 + hookedFish.profile.power * 10;
    fishStamina = 100;
    fishDistance = castDistance;
    fishPullPhase = Math.random() * Math.PI * 2;
    fightLastTime = performance.now();
    hookedFish.hookElapsed = hookElapsed;
    setState(GameState.FIGHT, `中鱼 · ${hookedFish.species}`);
    ui["bite-hint"].textContent = "已中鱼";
    updateFightUI();
    showToast(`${hookedFish.species}中钩！顺着鱼的发力方向控竿。`, 2400);
  }

  function updateFight(dt, now) {
    if (!hookedFish || gameState === GameState.NET_READY) return;
    fishPullPhase += dt * (1.4 + hookedFish.profile.power * .65);
    const pulse = (Math.sin(fishPullPhase) + 1) * .5;
    const burst = pulse > .82 ? hookedFish.profile.power * 16 * dt : 0;
    tension += (hookedFish.profile.power * 2.4 + burst - 1.5) * dt;
    fishStamina -= (1.7 + tension * .012) * dt;
    fishDistance += (pulse - .54) * hookedFish.profile.power * .55 * dt;
    fishDistance = clamp(fishDistance, 1.0, castDistance + 2.2);
    tension = clamp(tension, 4, 100);
    fishStamina = clamp(fishStamina, 0, 100);

    if (tension >= 96) {
      loseFish("张力过高，子线切断了。跑鱼！");
      return;
    }
    if (tension <= 6 && fishStamina > 25) {
      loseFish("鱼线失去张力，鱼钩脱落了。跑鱼！");
      return;
    }
    if (fishStamina <= 8 && fishDistance <= 1.8) {
      setState(GameState.NET_READY, "鱼已靠岸 · 可以抄鱼");
      ui["net-button"].disabled = false;
      showToast("鱼已疲劳并进入抄网范围。", 2200);
    }
    updateFightUI();
    fightLastTime = now;
  }

  function applyFightAction(action) {
    if (gameState !== GameState.FIGHT) return;
    if (action === "lift") {
      tension += 15;
      fishStamina -= 10 + hookedFish.profile.power * 3;
      fishDistance -= 0.55;
      showToast("抬竿施压：消耗鱼体力，但张力上升。", 1200);
    } else if (action === "lower") {
      tension -= 20;
      fishStamina -= 2;
      fishDistance += 0.16;
      showToast("顺势卸力：降低断线风险。", 1200);
    } else if (action === "left") {
      tension += 5;
      fishStamina -= 7;
      fishDistance -= 0.35;
      showToast("横向控鱼：避免正面拔河。", 1200);
    }
    tension = clamp(tension, 4, 100);
    fishStamina = clamp(fishStamina, 0, 100);
    fishDistance = clamp(fishDistance, 1, castDistance + 2);
    updateFightUI();
  }

  function updateFightUI() {
    ui["tension-label"].textContent = `${Math.round(tension)}%`;
    ui["tension-bar"].style.width = `${tension}%`;
    ui["tension-bar"].style.background = tension > 82 ? "var(--danger)" : tension < 18 ? "#8fb5c7" : "var(--accent)";
    ui["stamina-label"].textContent = `${Math.round(fishStamina)}%`;
    ui["stamina-bar"].style.width = `${fishStamina}%`;
    ui["stamina-bar"].style.background = "var(--safe)";
    ui["fish-distance-label"].textContent = `${fishDistance.toFixed(1)} m`;
    ui["net-button"].disabled = gameState !== GameState.NET_READY;
  }

  function loseFish(message) {
    if (![GameState.FIGHT, GameState.NET_READY].includes(gameState)) return;
    showToast(message, 2600);
    hookedFish = null;
    window.setTimeout(() => retrieveRig(false), 1200);
  }

  function netFish() {
    if (gameState !== GameState.NET_READY || !hookedFish) return;
    setState(GameState.RESULT);
    const result = hookedFish;
    ui["catch-title"].textContent = result.species;
    ui["catch-detail"].textContent = `${result.weight.toFixed(2)} kg · ${Math.round(result.length)} cm`;
    const center = (biteWindowStart + biteWindowEnd) / 2;
    const timingDiff = Math.abs(result.hookElapsed - center);
    ui["timing-result"].textContent = timingDiff < 180 ? "精准" : timingDiff < 380 ? "良好" : "勉强";
    ui["result-bait"].textContent = getSelectedBait().name;
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
    window.addEventListener("pointerup", () => {
      if (charging) releaseCast();
    });
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

    ui["render-canvas"].addEventListener("pointerdown", () => { pointerDownOnCanvas = true; });
    window.addEventListener("pointerup", () => { pointerDownOnCanvas = false; });

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
