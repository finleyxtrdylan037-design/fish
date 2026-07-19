(() => {
  'use strict';

  const VERSION = '0.3.10';
  const PROBABILITY_FILE = './bait_depth_fish_probability_v0.3.10.json';
  const WATER_DEPTH = 2.4;
  const DIRECT_LIFT_MAX_KG = 0.8;
  const DIRECT_LIFT_DISTANCE = 1.2;
  const NET_DISTANCE = 1.8;
  const LANDING_STAMINA_RATIO = 0.08;
  const LATE_MISS_RATE = 0.01;
  const ROD_LENGTHS = [3.6, 4.5, 6.3, 7.2];

  const FLOAT_IMAGE_KEY = 'ui:float';
  const FLOAT_TIP_KEY = 'ui:float-tip';
  const ROD_SIDE_KEY = 'rod:tianyuan-side';
  const ROD_FORWARD_KEY = 'rod:tianyuan-forward';
  const ROD_SOURCE = { handleX: 80, handleY: 180, tipX: 2500, tipY: 180 };
  const ROD_TEXTURES = {
    '3.6': { key: ROD_SIDE_KEY, image: './assets/rods/rod_tianyuan_side.png', forwardImage: './assets/rods/rod_tianyuan_forward.png', sections: 4, heightRatio: 0.24, widthRatio: 0.82 },
    '4.5': { key: ROD_SIDE_KEY, image: './assets/rods/rod_tianyuan_side.png', forwardImage: './assets/rods/rod_tianyuan_forward.png', sections: 5, heightRatio: 0.28, widthRatio: 0.92 },
    '6.3': { key: ROD_SIDE_KEY, image: './assets/rods/rod_tianyuan_side.png', forwardImage: './assets/rods/rod_tianyuan_forward.png', sections: 6, heightRatio: 0.32, widthRatio: 1.02 },
    '7.2': { key: ROD_SIDE_KEY, image: './assets/rods/rod_tianyuan_side.png', forwardImage: './assets/rods/rod_tianyuan_forward.png', sections: 7, heightRatio: 0.36, widthRatio: 1.12 }
  };

  const GameState = {
    BOOT: 'BOOT',
    READY: 'READY',
    CHARGING: 'CHARGING',
    FLIGHT: 'FLIGHT',
    FLOAT_SETTLE: 'FLOAT_SETTLE',
    WAIT_BITE: 'WAIT_BITE',
    BITE: 'BITE',
    FIGHT: 'FIGHT',
    NET_READY: 'NET_READY',
    RESULT: 'RESULT',
  };

  const SPOTS = [
    { id: 'qingzhu', name: '青竹混养池', description: '竹林环绕，远景清晰的混养池', image: './assets/scenery/spot_01_qingzhu.png', focusX: 50, focusY: 50, waterline: 0.59 },
    { id: 'reservoir', name: '山脚水库岸边', description: '山体开阔，深水区更大', image: './assets/scenery/spot_02_reservoir.png', focusX: 50, focusY: 52, waterline: 0.58 },
    { id: 'willow', name: '柳树林野塘', description: '柳树成荫，适合小幅移动钓边', image: './assets/scenery/spot_03_willow.png', focusX: 50, focusY: 53, waterline: 0.58 },
    { id: 'blackpit', name: '城郊黑坑塘', description: '钓友在远处两侧，不影响抛投落点', image: './assets/scenery/spot_04_blackpit.png', focusX: 50, focusY: 52, waterline: 0.58 },
    { id: 'reed', name: '芦苇湖汊钓位', description: '芦苇湾汊，鱼口偏灵', image: './assets/scenery/spot_05_reed.png', focusX: 50, focusY: 53, waterline: 0.58 },
  ];

  const BITE_PATTERN_CONFIG = {
    '顿口': { start: 220, end: 520 },
    '黑漂': { start: 180, end: 430 },
    '顶漂': { start: 260, end: 560 },
    '送漂': { start: 200, end: 480 },
    '下顿后回升': { start: 260, end: 600 },
  };

  const FALLBACK_CONFIG = {
    version: VERSION,
    description: '台钓网页游戏 v0.3.10 出鱼概率配置。每个饵料×钓层组合鱼种概率合计为100%。',
    rod_lengths_m: ROD_LENGTHS,
    max_cast_rule: '鱼竿长度×2；最大为7.2m×2=14.4m',
    baits: {
      worm: { name: '蚯蚓', description: '底层通用，鲫鱼和鲤鱼概率较高', bite_delay_multiplier: 1.0, probabilities: {
        bottom: { crucian_carp:40, common_carp:25, wuchang_bream:8, silver_carp:1, bighead_carp:1, grass_carp:5, tilapia:12, topmouth_culter:3, black_carp:5 },
        off_bottom: { crucian_carp:32, common_carp:18, wuchang_bream:15, silver_carp:3, bighead_carp:2, grass_carp:8, tilapia:12, topmouth_culter:8, black_carp:2 },
        mid: { crucian_carp:12, common_carp:8, wuchang_bream:20, silver_carp:10, bighead_carp:8, grass_carp:8, tilapia:10, topmouth_culter:22, black_carp:2 },
        upper: { crucian_carp:5, common_carp:3, wuchang_bream:12, silver_carp:15, bighead_carp:12, grass_carp:5, tilapia:8, topmouth_culter:38, black_carp:2 },
      }},
      foam: { name: '泡泡球', description: '耐泡，鲫鲤鳊综合型', bite_delay_multiplier: 0.94, probabilities: {
        bottom: { crucian_carp:35, common_carp:30, wuchang_bream:10, silver_carp:1, bighead_carp:1, grass_carp:5, tilapia:10, topmouth_culter:3, black_carp:5 },
        off_bottom: { crucian_carp:30, common_carp:22, wuchang_bream:16, silver_carp:3, bighead_carp:2, grass_carp:8, tilapia:10, topmouth_culter:7, black_carp:2 },
        mid: { crucian_carp:12, common_carp:10, wuchang_bream:24, silver_carp:10, bighead_carp:8, grass_carp:8, tilapia:8, topmouth_culter:18, black_carp:2 },
        upper: { crucian_carp:5, common_carp:4, wuchang_bream:15, silver_carp:17, bighead_carp:14, grass_carp:4, tilapia:7, topmouth_culter:32, black_carp:2 },
      }},
      corn: { name: '玉米', description: '偏鲤鱼、草鱼；鲢鳙概率很低', bite_delay_multiplier: 0.84, probabilities: {
        bottom: { crucian_carp:18, common_carp:32, wuchang_bream:10, silver_carp:1, bighead_carp:1, grass_carp:22, tilapia:3, topmouth_culter:2, black_carp:11 },
        off_bottom: { crucian_carp:14, common_carp:25, wuchang_bream:18, silver_carp:1, bighead_carp:1, grass_carp:27, tilapia:3, topmouth_culter:7, black_carp:4 },
        mid: { crucian_carp:8, common_carp:12, wuchang_bream:20, silver_carp:3, bighead_carp:2, grass_carp:25, tilapia:3, topmouth_culter:24, black_carp:3 },
        upper: { crucian_carp:4, common_carp:6, wuchang_bream:15, silver_carp:5, bighead_carp:3, grass_carp:13, tilapia:2, topmouth_culter:50, black_carp:2 },
      }},
      tilapia_frozen: { name: '罗非冻饵', description: '明显提高罗非鱼概率', bite_delay_multiplier: 1.1, probabilities: {
        bottom: { crucian_carp:18, common_carp:8, wuchang_bream:5, silver_carp:1, bighead_carp:1, grass_carp:2, tilapia:58, topmouth_culter:5, black_carp:2 },
        off_bottom: { crucian_carp:15, common_carp:7, wuchang_bream:8, silver_carp:2, bighead_carp:1, grass_carp:3, tilapia:52, topmouth_culter:11, black_carp:1 },
        mid: { crucian_carp:8, common_carp:5, wuchang_bream:12, silver_carp:6, bighead_carp:4, grass_carp:4, tilapia:40, topmouth_culter:20, black_carp:1 },
        upper: { crucian_carp:4, common_carp:3, wuchang_bream:8, silver_carp:8, bighead_carp:5, grass_carp:2, tilapia:30, topmouth_culter:39, black_carp:1 },
      }},
      black_carp_pellet: { name: '青鱼颗粒', description: '明显提高青鱼和草鱼概率', bite_delay_multiplier: 0.8, probabilities: {
        bottom: { crucian_carp:6, common_carp:18, wuchang_bream:5, silver_carp:1, bighead_carp:1, grass_carp:28, tilapia:2, topmouth_culter:1, black_carp:38 },
        off_bottom: { crucian_carp:6, common_carp:14, wuchang_bream:8, silver_carp:1, bighead_carp:1, grass_carp:34, tilapia:2, topmouth_culter:9, black_carp:25 },
        mid: { crucian_carp:4, common_carp:8, wuchang_bream:10, silver_carp:3, bighead_carp:3, grass_carp:30, tilapia:2, topmouth_culter:28, black_carp:12 },
        upper: { crucian_carp:2, common_carp:5, wuchang_bream:8, silver_carp:6, bighead_carp:5, grass_carp:20, tilapia:2, topmouth_culter:45, black_carp:7 },
      }},
      powder: { name: '粉饵', description: '更容易钓到鲢鱼和鳙鱼', bite_delay_multiplier: 1.18, probabilities: {
        bottom: { crucian_carp:12, common_carp:8, wuchang_bream:12, silver_carp:18, bighead_carp:20, grass_carp:5, tilapia:6, topmouth_culter:7, black_carp:12 },
        off_bottom: { crucian_carp:8, common_carp:5, wuchang_bream:15, silver_carp:22, bighead_carp:24, grass_carp:5, tilapia:5, topmouth_culter:10, black_carp:6 },
        mid: { crucian_carp:4, common_carp:2, wuchang_bream:12, silver_carp:30, bighead_carp:28, grass_carp:4, tilapia:4, topmouth_culter:14, black_carp:2 },
        upper: { crucian_carp:2, common_carp:1, wuchang_bream:9, silver_carp:35, bighead_carp:30, grass_carp:3, tilapia:2, topmouth_culter:16, black_carp:2 },
      }},
      mixed: { name: '混养饵料', description: '适用面广，针对性一般', bite_delay_multiplier: 1.0, probabilities: {
        bottom: { crucian_carp:22, common_carp:20, wuchang_bream:10, silver_carp:5, bighead_carp:5, grass_carp:10, tilapia:10, topmouth_culter:6, black_carp:12 },
        off_bottom: { crucian_carp:18, common_carp:16, wuchang_bream:16, silver_carp:6, bighead_carp:6, grass_carp:10, tilapia:10, topmouth_culter:10, black_carp:8 },
        mid: { crucian_carp:8, common_carp:8, wuchang_bream:18, silver_carp:12, bighead_carp:10, grass_carp:9, tilapia:8, topmouth_culter:22, black_carp:5 },
        upper: { crucian_carp:4, common_carp:4, wuchang_bream:16, silver_carp:14, bighead_carp:12, grass_carp:6, tilapia:6, topmouth_culter:34, black_carp:4 },
      }}
    }
  };

  const FISH_PROFILES = {
    crucian_carp: { name: '鲫鱼', minKg: 0.08, maxKg: 1.8, minCm: 12, maxCm: 34, sizeBias: 2.1, power: 0.9, note: '底层觅食，警惕性较高。', bites: ['顿口','顶漂','下顿后回升'], image: './assets/fish/crucian_carp.webp' },
    common_carp: { name: '鲤鱼', minKg: 0.3, maxKg: 12, minCm: 22, maxCm: 92, sizeBias: 1.45, power: 1.6, note: '吃口稳，发力厚重。', bites: ['顿口','黑漂','送漂'], image: './assets/fish/common_carp.webp' },
    wuchang_bream: { name: '鳊鱼', minKg: 0.2, maxKg: 3.5, minCm: 18, maxCm: 50, sizeBias: 1.9, power: 1.1, note: '中下层巡游，吃口偏轻。', bites: ['顿口','送漂'], image: './assets/fish/wuchang_bream.webp' },
    silver_carp: { name: '鲢鱼', minKg: 1, maxKg: 10, minCm: 38, maxCm: 95, sizeBias: 1.35, power: 1.7, note: '中上层活动，抖动频繁。', bites: ['黑漂','下顿后回升'], image: './assets/fish/silver_carp.webp' },
    bighead_carp: { name: '鳙鱼', minKg: 1.2, maxKg: 15, minCm: 40, maxCm: 105, sizeBias: 1.25, power: 1.85, note: '冲刺强，头重身宽。', bites: ['黑漂','顿口'], image: './assets/fish/bighead_carp.webp' },
    grass_carp: { name: '草鱼', minKg: 0.8, maxKg: 16, minCm: 35, maxCm: 115, sizeBias: 1.35, power: 1.95, note: '中下层大体型，冲刺明显。', bites: ['顿口','黑漂','送漂'], image: './assets/fish/grass_carp.webp' },
    tilapia: { name: '罗非鱼', minKg: 0.12, maxKg: 4.2, minCm: 14, maxCm: 48, sizeBias: 1.8, power: 1.0, note: '罗非吃口快，连口率高。', bites: ['顿口','顶漂'], image: './assets/fish/tilapia.webp' },
    topmouth_culter: { name: '翘嘴', minKg: 0.15, maxKg: 6.2, minCm: 18, maxCm: 75, sizeBias: 1.55, power: 1.4, note: '中上层掠食，动作干脆。', bites: ['送漂','顿口','黑漂'], image: './assets/fish/topmouth_culter.webp' },
    black_carp: { name: '青鱼', minKg: 1.5, maxKg: 20, minCm: 42, maxCm: 120, sizeBias: 1.15, power: 2.2, note: '底层大物，冲刺与张力都很强。', bites: ['黑漂','顿口'], image: './assets/fish/black_carp.webp' },
  };

  const shell = document.getElementById('game-shell');
  const canvas = document.getElementById('render-canvas');
  const ctx = canvas.getContext('2d');
  const uiIds = [
    'loading-screen','loading-progress','spot-name-label','game-state-label','distance-label','rod-length-label','fishing-depth-label','depth-state-label','bait-label','max-cast-label',
    'monitor-float','bite-hint','focus-float-button','primary-action','retrieve-button','test-bite-button','rig-button','bait-button','fish-keeper-button','cast-hud','cast-power-label','cast-power-bar','cast-distance-preview','cast-rule-hint',
    'fight-hud','tension-label','tension-bar','stamina-label','stamina-bar','fish-distance-label','fight-guidance','net-button',
    'rig-dialog','dialog-rod-summary','depth-range','dialog-depth-label','dialog-depth-state','diagram-float','diagram-hook','save-rig-button',
    'bait-dialog','bait-grid','save-bait-button','fish-keeper-dialog','keeper-total-weight','keeper-total-count','keeper-heaviest','keeper-duration','keeper-table-body',
    'spot-button','spot-dialog','spot-grid','result-dialog','timing-result','result-bait','result-layer','result-pattern','result-method','result-note','catch-title','catch-detail','catch-summary','catch-image','result-grade-badge','result-method-badge','result-pattern-badge','continue-button','toast'
  ];
  const ui = Object.fromEntries(uiIds.map(id => [id, document.getElementById(id)]));

  let config = FALLBACK_CONFIG;
  let currentSpotId = 'qingzhu';
  let selectedBaitKey = 'worm';
  let selectedBaitPending = selectedBaitKey;
  let rodLength = 4.5;
  let selectedRodLengthPending = rodLength;
  let fishingDepth = 2.2;
  let fishingDepthPending = fishingDepth;
  let gameState = GameState.BOOT;
  let sessionStartedAt = Date.now();
  let fishKeeper = [];
  let keeperTimerId = null;
  let toastTimer = 0;
  let biteTimeout = 0;
  let waitBiteTimer = 0;
  let biteStartAt = 0;
  let biteWindowStart = 0;
  let biteWindowEnd = 0;
  let bitePattern = '顿口';
  let fightLastAt = performance.now();
  let viewOffsetX = 0;
  let viewOffsetY = 0;
  let images = {};
  let lastFrame = performance.now();
  let canvasCssWidth = 0;
  let canvasCssHeight = 0;
  let canvasDpr = 1;

  // cast / rig animation state
  let charging = false;
  let castPower = 0;
  let chargeDirection = 1;
  let castDistance = 0;
  let castPreviewDistance = rodLength * 0.88;
  let castFlightStart = 0;
  let castFlightDuration = 1050;
  let castPoseT = 0;
  let castZone = 'mid';
  let rigSettleStart = 0;
  let floatVisible = false;
  let floatLanded = false;
  let flightRig = null;
  let floatPosition = { x: 0, y: 0 };
  let castLandingOffsetX = 0;
  let lineAnchor = { x: 0, y: 0 };
  let movingPressed = null;
  let floatBobPhase = 0;

  // fish fight state
  let hookedFish = null;
  let fishDistance = 0;
  let tension = 0;
  let fishStamina = 0;
  let fishStaminaMax = 100;
  let fishPullPhase = 0;
  let fishSurfaceSeed = 0;
  let forceFishSurfaceVisible = false;
  let fishVisualState = { initialized: false, x: 0, y: 0, alpha: 0, angle: 0, direction: 1, lastAt: 0 };
  let exhaustionHintShown = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a,b,t){ return a + (b-a) * t; }
  function rnd(min,max){ return min + Math.random() * (max-min); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function weighted(entries) {
    let total = entries.reduce((s, [,v]) => s+v, 0), r = Math.random()*total;
    for (const [k,v] of entries) { r -= v; if (r <= 0) return k; }
    return entries[entries.length-1][0];
  }
  function currentSpot(){ return SPOTS.find(s => s.id === currentSpotId) || SPOTS[0]; }
  function maxCastDistance(){ return +(rodLength * 2).toFixed(1); }
  function formatDuration(ms) {
    const sec = Math.floor(ms / 1000), h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return [h,m,s].map(n => String(n).padStart(2,'0')).join(':');
  }
  function sample(profile, kind) {
    const min = kind === 'kg' ? profile.minKg : profile.minCm;
    const max = kind === 'kg' ? profile.maxKg : profile.maxCm;
    return min + (max-min) * Math.pow(Math.random(), profile.sizeBias);
  }
  function getBait(){ return config.baits[selectedBaitKey] || FALLBACK_CONFIG.baits.worm; }
  function getDepthState(depth = fishingDepth) {
    const overBottom = depth > WATER_DEPTH;
    const offBottom = WATER_DEPTH - depth;
    if (overBottom || offBottom <= 0.10) return { layerKey: 'bottom', text: overBottom ? '过底' : '钓底', detail: overBottom ? `过底 ${(depth - WATER_DEPTH).toFixed(2)} m` : '钓底', marks: 5 };
    if (offBottom <= 0.45) return { layerKey: 'off_bottom', text: `离底 ${(offBottom*100).toFixed(0)} cm`, detail: `离底 ${(offBottom*100).toFixed(0)} cm`, marks: 4 };
    if (depth <= 0.70) return { layerKey: 'upper', text: '上层', detail: '上层', marks: 4 };
    return { layerKey: 'mid', text: '中层', detail: '中层', marks: 4 };
  }
  function chooseFish() {
    const layer = getDepthState().layerKey;
    const bait = getBait();
    const key = weighted(Object.entries(bait.probabilities[layer]));
    const profile = FISH_PROFILES[key];
    return {
      key,
      species: profile.name,
      profile,
      weight: sample(profile, 'kg'),
      length: sample(profile, 'cm'),
      depthState: getDepthState().detail,
      layerKey: layer,
      bitePattern: pick(profile.bites),
      hookElapsed: 0,
    };
  }
  function grade(w){ return w >= 10 ? '巨物' : w >= 5 ? '大物' : w >= 2 ? '不错' : w >= 0.8 ? '合格' : '轻量'; }
  function timing(d){ return d < 180 ? '精准' : d < 380 ? '良好' : '勉强'; }

  function setLoading(text, percent) {
    document.querySelector('#loading-screen p').textContent = text;
    ui['loading-progress'].style.width = `${percent}%`;
  }
  function setState(state, label) {
    gameState = state;
    shell.dataset.state = state;
    ui['game-state-label'].textContent = label || defaultStateLabel(state);
    updateButtons();
  }
  function defaultStateLabel(state) {
    switch(state){
      case GameState.READY: return '准备钓鱼';
      case GameState.CHARGING: return '蓄力抛竿';
      case GameState.FLIGHT: return '抛投中';
      case GameState.FLOAT_SETTLE: return '线组入水';
      case GameState.WAIT_BITE: return '等待鱼口';
      case GameState.BITE: return `鱼口 · ${bitePattern}`;
      case GameState.FIGHT: return '中鱼 · 控鱼中';
      case GameState.NET_READY: return '可抄鱼';
      case GameState.RESULT: return '钓获结果';
      default: return '准备钓鱼';
    }
  }
  function toast(msg, duration=1800) {
    clearTimeout(toastTimer);
    ui.toast.textContent = msg;
    ui.toast.classList.add('visible');
    toastTimer = setTimeout(() => ui.toast.classList.remove('visible'), duration);
  }
  function hideToastImmediate(){ clearTimeout(toastTimer); ui.toast.classList.remove('visible'); }
  function openDialog(el){ el.classList.add('visible'); }
  function closeDialog(el){ el.classList.remove('visible'); }

  function keeperSummary() {
    const map = new Map();
    let totalWeight = 0;
    let heaviest = null;
    fishKeeper.forEach(item => {
      totalWeight += item.weight;
      if (!heaviest || item.weight > heaviest.weight) heaviest = item;
      const row = map.get(item.species) || { species: item.species, count: 0, weight: 0, heaviest: 0 };
      row.count += 1; row.weight += item.weight; row.heaviest = Math.max(row.heaviest, item.weight);
      map.set(item.species, row);
    });
    return {
      totalWeight, totalCount: fishKeeper.length, heaviest,
      rows: [...map.values()].sort((a,b)=>b.weight-a.weight)
    };
  }
  function refreshFishKeeper() {
    const summary = keeperSummary();
    ui['keeper-total-weight'].textContent = `${summary.totalWeight.toFixed(2)} kg`;
    ui['keeper-total-count'].textContent = `${summary.totalCount} 尾`;
    ui['keeper-heaviest'].textContent = summary.heaviest ? `${summary.heaviest.species} ${summary.heaviest.weight.toFixed(2)} kg` : '暂无';
    ui['keeper-duration'].textContent = formatDuration(Date.now() - sessionStartedAt);
    if (!summary.rows.length) {
      ui['keeper-table-body'].innerHTML = '<tr class="keeper-empty"><td colspan="4">鱼护还是空的</td></tr>';
      return;
    }
    ui['keeper-table-body'].innerHTML = summary.rows.map(row => `<tr><td>${row.species}</td><td>${row.count} 尾</td><td>${row.weight.toFixed(2)} kg</td><td>${row.heaviest.toFixed(2)} kg</td></tr>`).join('');
  }
  function openFishKeeper() { refreshFishKeeper(); clearInterval(keeperTimerId); keeperTimerId = setInterval(refreshFishKeeper, 1000); openDialog(ui['fish-keeper-dialog']); }
  function closeFishKeeper() { clearInterval(keeperTimerId); keeperTimerId = null; closeDialog(ui['fish-keeper-dialog']); }

  function updateButtons() {
    const ready = gameState === GameState.READY;
    ui['rig-button'].disabled = !ready;
    ui['bait-button'].disabled = !ready;
    ui['spot-button'].disabled = !ready;
    ui['retrieve-button'].disabled = ready || gameState === GameState.RESULT;
    ui['fish-keeper-button'].disabled = false;
    ui['cast-hud'].classList.toggle('hidden', !(gameState === GameState.CHARGING));
    ui['fight-hud'].classList.toggle('hidden', !(gameState === GameState.FIGHT || gameState === GameState.NET_READY));
    if (gameState === GameState.READY) ui['primary-action'].textContent = '抛竿';
    else if (gameState === GameState.WAIT_BITE || gameState === GameState.BITE) ui['primary-action'].textContent = '提竿';
    else if (gameState === GameState.NET_READY) ui['primary-action'].textContent = landingRule().directLift ? '提鱼' : '抄网';
    else if (gameState === GameState.FIGHT) ui['primary-action'].textContent = '中鱼中';
    ui['primary-action'].disabled = gameState === GameState.RESULT || gameState === GameState.FIGHT || gameState === GameState.FLIGHT || gameState === GameState.FLOAT_SETTLE;
    ui['retrieve-button'].textContent = '收竿';
  }

  function updateRigUI() {
    const ds = getDepthState();
    ui['rod-length-label'].textContent = `${rodLength.toFixed(1)} m`;
    ui['max-cast-label'].textContent = `${maxCastDistance().toFixed(1)} m`;
    ui['fishing-depth-label'].textContent = `${fishingDepth.toFixed(2)} m`;
    ui['depth-state-label'].textContent = ds.detail;
    ui['dialog-rod-summary'].textContent = `${selectedRodLengthPending.toFixed(1)} m · 最远${(selectedRodLengthPending*2).toFixed(1)} m`;
    ui['dialog-depth-label'].textContent = `${fishingDepthPending.toFixed(2)} m`;
    ui['dialog-depth-state'].textContent = getDepthState(fishingDepthPending).detail;
    ui['depth-range'].value = fishingDepthPending;
    const marks = getDepthState(fishingDepthPending).marks;
    ui['diagram-float'].classList.toggle('marks-5', marks === 5);
    ui['diagram-float'].classList.toggle('marks-4', marks === 4);
    const hookTop = 30 + (fishingDepthPending / 2.8) * 240;
    ui['diagram-hook'].style.top = `${hookTop}px`;
  }
  function applyFloatMarks(marks) {
    ui['monitor-float'].classList.toggle('marks-5', marks === 5);
    ui['monitor-float'].classList.toggle('marks-4', marks === 4);
    ui['bite-hint'].textContent = marks === 5 ? '过底露出5目' : '正常露出4目';
  }
  function updateInfoUI() {
    ui['bait-label'].textContent = getBait().name;
    ui['distance-label'].textContent = castDistance > 0 && floatVisible ? `${castDistance.toFixed(1)} m` : '—';
    ui['spot-name-label'].textContent = currentSpot().name;
    updateRigUI();
    applyFloatMarks(getDepthState().marks);
  }

  function populateBaitGrid() {
    const entries = Object.entries(config.baits);
    const depthState = getDepthState();
    const layerKey = depthState.layerKey;
    const heading = document.querySelector('#bait-dialog .dialog-heading p');
    if (heading) heading.textContent = `当前钓层：${depthState.detail}。下列概率按当前水层显示。`;
    ui['bait-grid'].innerHTML = entries.map(([key,bait]) => {
      const selected = key === selectedBaitPending ? 'selected' : '';
      const layerProbabilities = bait.probabilities[layerKey] || bait.probabilities.bottom;
      const targets = Object.entries(layerProbabilities)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,3)
        .map(([fishKey, probability]) => `${FISH_PROFILES[fishKey].name} ${probability}%`)
        .join('、');
      return `<button type="button" class="bait-option ${selected}" data-bait="${key}"><strong>${bait.name}</strong><span class="bait-layer-target">${depthState.detail}：${targets}</span><span>${bait.description}</span><em>选择</em></button>`;
    }).join('');
    ui['bait-grid'].querySelectorAll('[data-bait]').forEach(btn => btn.onclick = () => { selectedBaitPending = btn.dataset.bait; populateBaitGrid(); });
  }
  function populateSpotGrid() {
    ui['spot-grid'].innerHTML = SPOTS.map(spot => `
      <button type="button" class="spot-option ${spot.id===currentSpotId?'selected':''}" data-spot="${spot.id}">
        <img src="${spot.image}" alt="${spot.name}">
        <div class="spot-option-info"><div><strong>${spot.name}</strong><span>${spot.description}</span></div><span>切换</span></div>
      </button>
    `).join('');
    ui['spot-grid'].querySelectorAll('[data-spot]').forEach(btn => btn.onclick = () => {
      currentSpotId = btn.dataset.spot; viewOffsetX = 0; viewOffsetY = 0; populateSpotGrid(); updateInfoUI(); toast(`已切换到${currentSpot().name}`, 1500);
    });
  }

  function landingRule() {
    const directLift = !!(hookedFish && hookedFish.weight <= DIRECT_LIFT_MAX_KG);
    return { directLift, distance: directLift ? DIRECT_LIFT_DISTANCE : NET_DISTANCE, action: directLift ? '提鱼上岸' : '使用抄网' };
  }
  function scheduleBite(base) {
    clearTimeout(biteTimeout);
    clearTimeout(waitBiteTimer);
    const multiplier = getBait().bite_delay_multiplier || 1;
    const ms = base * multiplier;
    biteTimeout = setTimeout(triggerBite, ms);
  }
  function triggerBite() {
    if (gameState !== GameState.WAIT_BITE) return;
    hookedFish = chooseFish();
    bitePattern = hookedFish.bitePattern;
    const cfg = BITE_PATTERN_CONFIG[bitePattern] || BITE_PATTERN_CONFIG['顿口'];
    biteWindowStart = cfg.start;
    biteWindowEnd = cfg.end;
    biteStartAt = performance.now();
    setState(GameState.BITE, `鱼口 · ${bitePattern}`);
    ui['bite-hint'].textContent = bitePattern;
    toast(`浮漂出现${bitePattern}，请及时提竿。`, 1500);
    setTimeout(() => {
      if (gameState !== GameState.BITE) return;
      if (Math.random() < LATE_MISS_RATE) {
        missBite('提竿过晚，鱼已吐钩。');
      } else {
        // 90% 的鱼口不会立即判定“过晚”，恢复等待并很快再给一次有效动作。
        hookedFish = null;
        setState(GameState.WAIT_BITE, '等待鱼口');
        ui['bite-hint'].textContent = getDepthState().marks === 5 ? '过底露出5目' : '正常露出4目';
        scheduleBite(rnd(650, 1500));
      }
    }, biteWindowEnd + 520);
  }
  function attemptHook() {
    if (gameState === GameState.WAIT_BITE) { toast('当前没有有效鱼口，空竿。', 1400); retrieve(true); return; }
    if (gameState !== GameState.BITE) return;
    const elapsed = performance.now() - biteStartAt;
    if (elapsed < biteWindowStart) { missBite('提竿过早，鱼还没吸稳。'); return; }
    if (elapsed > biteWindowEnd && Math.random() < LATE_MISS_RATE) {
      missBite('提竿过晚，鱼已吐钩。');
      return;
    }
    startFight(Math.min(elapsed, biteWindowEnd));
  }
  function missBite(msg) {
    toast(msg, 1800);
    setTimeout(() => retrieve(false), 600);
  }
  function startFight(hookElapsed) {
    clearTimeout(biteTimeout);
    clearTimeout(waitBiteTimer);
    hookedFish.hookElapsed = hookElapsed;
    const extraWeight = Math.max(0, hookedFish.weight - 2);
    fishStaminaMax = Math.min(280, 100 + extraWeight * 10);
    fishStamina = fishStaminaMax;
    fishDistance = castDistance;
    tension = clamp(26 + hookedFish.profile.power * 16 + extraWeight * 2.2, 18, 70);
    fishPullPhase = Math.random() * Math.PI * 2;
    fishSurfaceSeed = Math.random() * Math.PI * 2;
    forceFishSurfaceVisible = false;
    fishVisualState = {
      initialized: true,
      x: floatPosition.x,
      y: floatPosition.y + canvasCssHeight * 0.12,
      alpha: 0,
      angle: 0,
      direction: 1,
      lastAt: performance.now()
    };
    exhaustionHintShown = false;
    setState(GameState.FIGHT, '中鱼 · 控鱼中');
    updateFightUI();
  }
  function readyToLand() {
    if (!hookedFish || gameState !== GameState.FIGHT) return false;
    const ratio = fishStamina / fishStaminaMax;
    const rule = landingRule();
    if (ratio <= LANDING_STAMINA_RATIO && fishDistance <= rule.distance) {
      setState(GameState.NET_READY, rule.directLift ? '小鱼已靠岸 · 可以提鱼' : '鱼已靠岸 · 可以抄鱼');
      ui['net-button'].disabled = false;
      ui['net-button'].textContent = rule.action;
      ui['net-button'].classList.add('ready');
      ui['fight-guidance'].className = 'fight-guidance ready';
      ui['fight-guidance'].textContent = rule.directLift ? '点击“提鱼上岸”。' : '点击“使用抄网”。';
      return true;
    }
    return false;
  }
  function updateFight(dt) {
    if (!hookedFish || (gameState !== GameState.FIGHT && gameState !== GameState.NET_READY)) return;
    if (gameState === GameState.NET_READY) return;
    const extraWeight = Math.max(0, hookedFish.weight - 2);
    const ratio = fishStamina / fishStaminaMax;
    fishPullPhase += dt * (1.4 + hookedFish.profile.power * 0.65 + extraWeight * 0.08);
    const pulse = (Math.sin(fishPullPhase) + 1) * 0.5;
    const burst = ratio > LANDING_STAMINA_RATIO ? Math.max(0, pulse - 0.76) * (12 + extraWeight * 3.4 + hookedFish.profile.power * 8) : 0;
    tension += ((pulse - 0.48) * (10 + extraWeight * 2.1) + burst - 2.4) * dt;
    fishDistance += ((pulse - 0.55) * (0.55 + extraWeight * 0.06 + hookedFish.profile.power * 0.2)) * dt;
    const passiveDrain = 0.85 + hookedFish.profile.power * 0.22 + extraWeight * 0.12;
    fishStamina -= passiveDrain * dt;
    tension = clamp(tension, 4, 100);
    fishDistance = clamp(fishDistance, 0.8, castDistance + 2.6);
    fishStamina = clamp(fishStamina, 0, fishStaminaMax);
    if (tension >= 97) { loseFish('张力过高，子线切断了！'); return; }
    if (tension <= 5 && ratio > 0.26) { loseFish('鱼线太松，鱼脱钩逃走了！'); return; }
    if (ratio <= LANDING_STAMINA_RATIO && !exhaustionHintShown) {
      exhaustionHintShown = true;
      const remain = Math.max(0, fishDistance - landingRule().distance);
      toast(`鱼已疲劳，还需拉近 ${remain.toFixed(1)} 米。`, 2200);
    }
    if (!readyToLand()) updateFightUI();
  }
  function fightAction(action) {
    if (gameState !== GameState.FIGHT) return;
    const exhausted = fishStamina / fishStaminaMax <= LANDING_STAMINA_RATIO;
    const extraWeight = Math.max(0, hookedFish.weight - 2);
    if (action === 'lift') {
      tension += exhausted ? 8 : 12 + extraWeight * 0.2;
      fishDistance -= exhausted ? 0.85 : 0.45;
      fishStamina -= 2.5 + hookedFish.profile.power * 0.8 + extraWeight * 0.22;
    } else if (action === 'lower') {
      tension -= 18;
      fishDistance += exhausted ? 0.02 : 0.15;
      fishStamina -= 0.8;
    } else { // left
      tension += exhausted ? 2 : 4 + extraWeight * 0.08;
      fishDistance -= exhausted ? 0.58 : 0.28;
      fishStamina -= 1.8 + hookedFish.profile.power * 0.55 + extraWeight * 0.15;
    }
    tension = clamp(tension, 4, 100);
    fishDistance = clamp(fishDistance, 0.8, castDistance + 2.2);
    fishStamina = clamp(fishStamina, 0, fishStaminaMax);
    if (!readyToLand()) updateFightUI();
  }
  function updateFightUI() {
    const staminaPct = fishStaminaMax > 0 ? fishStamina / fishStaminaMax * 100 : 0;
    ui['tension-label'].textContent = `${Math.round(tension)}%`;
    ui['tension-bar'].style.width = `${tension}%`;
    ui['stamina-label'].textContent = `${Math.round(staminaPct)}%`;
    ui['stamina-bar'].style.width = `${staminaPct}%`;
    ui['fish-distance-label'].textContent = `${fishDistance.toFixed(1)} m`;
    const rule = landingRule();
    const remain = Math.max(0, fishDistance - rule.distance);
    ui['net-button'].textContent = rule.directLift ? `提鱼 ≤${rule.distance.toFixed(1)}m` : `抄网 ≤${rule.distance.toFixed(1)}m`;
    ui['net-button'].disabled = gameState !== GameState.NET_READY;
    ui['net-button'].classList.toggle('ready', gameState === GameState.NET_READY);
    ui['fight-guidance'].className = 'fight-guidance';
    if (gameState === GameState.NET_READY) {
      ui['fight-guidance'].classList.add('ready');
      ui['fight-guidance'].textContent = rule.directLift ? '小鱼已靠岸，可以直接提鱼。' : '鱼已靠岸，可以使用抄网。';
    } else if (staminaPct <= 8) {
      ui['fight-guidance'].classList.add('warning');
      ui['fight-guidance'].textContent = `鱼已疲劳，还需拉近 ${remain.toFixed(1)} 米。`;
    } else {
      ui['fight-guidance'].textContent = `先消耗鱼体力，再带到${rule.distance.toFixed(1)}米以内。`;
    }
  }
  function loseFish(msg) {
    toast(msg, 2000);
    hookedFish = null;
    setTimeout(() => retrieve(false), 900);
  }
  function recordCatch(fish) { fishKeeper.push({ species: fish.species, weight: fish.weight, time: Date.now() }); }
  function landFish() {
    if (gameState !== GameState.NET_READY || !hookedFish) return;
    hideToastImmediate();
    const rule = landingRule();
    const center = (biteWindowStart + biteWindowEnd) / 2;
    const diff = Math.abs(hookedFish.hookElapsed - center);
    recordCatch(hookedFish);
    setState(GameState.RESULT, '钓获结果');
    ui['timing-result'].textContent = timing(diff);
    ui['result-bait'].textContent = getBait().name;
    ui['result-layer'].textContent = hookedFish.depthState;
    ui['result-pattern'].textContent = hookedFish.bitePattern;
    ui['result-method'].textContent = rule.directLift ? '提鱼上岸' : '抄网成功';
    ui['result-note'].textContent = hookedFish.profile.note;
    ui['catch-title'].textContent = hookedFish.species;
    ui['catch-detail'].textContent = `${hookedFish.weight.toFixed(2)} kg · ${Math.round(hookedFish.length)} cm`;
    ui['catch-summary'].textContent = `${grade(hookedFish.weight)}渔获，使用${getBait().name}在${hookedFish.depthState}钓获；漂相为${hookedFish.bitePattern}。`;
    const fishImage = images[`fish:${hookedFish.key}`];
    ui['catch-image'].style.opacity = '0';
    ui['catch-image'].onload = () => { ui['catch-image'].style.opacity = '1'; };
    ui['catch-image'].onerror = () => {
      const fallback = images['fish:crucian_carp'];
      if (fallback) ui['catch-image'].src = fallback.src;
      ui['catch-image'].style.opacity = '1';
    };
    ui['catch-image'].src = fishImage ? fishImage.src : hookedFish.profile.image;
    if (ui['catch-image'].complete) ui['catch-image'].style.opacity = '1';
    ui['result-grade-badge'].textContent = grade(hookedFish.weight);
    ui['result-method-badge'].textContent = rule.directLift ? '提鱼上岸' : '抄网成功';
    ui['result-pattern-badge'].textContent = hookedFish.bitePattern;
    openDialog(ui['result-dialog']);
  }
  function retrieve(showToast = true) {
    clearTimeout(biteTimeout);
    clearTimeout(waitBiteTimer);
    charging = false;
    castPower = 0;
    floatVisible = false;
    floatLanded = false;
    flightRig = null;
    castPoseT = 0;
    rigSettleStart = 0;
    castDistance = 0;
    castLandingOffsetX = 0;
    hookedFish = null;
    forceFishSurfaceVisible = false;
    fishVisualState = { initialized: false, x: 0, y: 0, alpha: 0, angle: 0, direction: 1, lastAt: 0 };
    tension = 0;
    fishStamina = 0;
    ui['distance-label'].textContent = '—';
    ui['fight-guidance'].textContent = '先消耗鱼的体力，再将鱼带到岸边。';
    ui['fight-guidance'].className = 'fight-guidance';
    ui['net-button'].disabled = true;
    ui['net-button'].classList.remove('ready');
    applyFloatMarks(getDepthState().marks);
    ui['bite-hint'].textContent = getDepthState().marks === 5 ? '过底露出5目' : '正常露出4目';
    setState(GameState.READY, '准备钓鱼');
    if (showToast) toast('已收回线组，可以移动或重新配置。');
    updateInfoUI();
  }

  function moveView(direction) {
    if (gameState !== GameState.READY) { toast('请先收竿再移动。', 1100); return; }
    const step = 2.2;
    if (direction === 'left') viewOffsetX = clamp(viewOffsetX - step, -140, 140);
    if (direction === 'right') viewOffsetX = clamp(viewOffsetX + step, -140, 140);
    if (direction === 'forward') viewOffsetY = clamp(viewOffsetY - step, -24, 24);
    if (direction === 'back') viewOffsetY = clamp(viewOffsetY + step, -24, 24);
  }

  function syncCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);
    const dpr = clamp(window.devicePixelRatio || 1, 1, 3);
    const targetWidth = Math.round(cssWidth * dpr);
    const targetHeight = Math.round(cssHeight * dpr);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    canvasCssWidth = cssWidth;
    canvasCssHeight = cssHeight;
    canvasDpr = dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rodTextureConfig(length = rodLength) {
    return ROD_TEXTURES[Number(length).toFixed(1)] || ROD_TEXTURES['4.5'];
  }
  function rodDisplayLength(length = rodLength) {
    const cfg = rodTextureConfig(length);
    return Math.min(canvasCssHeight * cfg.heightRatio, canvasCssWidth * cfg.widthRatio);
  }
  function castZoneForDistance(distance) {
    const ratio = clamp(distance / maxCastDistance(), 0, 1);
    return ratio < 0.45 ? 'near' : ratio < 0.78 ? 'mid' : 'far';
  }
  function castMotion(zone = castZone) {
    if (zone === 'near') return { lower: 0.20, lift: 0.18, sendDrop: 0.10, backswing: 7, arc: 0.052, bendDown: 0.014, bendUp: -0.010, durationScale: 0.92 };
    if (zone === 'far') return { lower: 0.48, lift: 0.34, sendDrop: 0.18, backswing: 22, arc: 0.118, bendDown: 0.046, bendUp: -0.034, durationScale: 1.08 };
    return { lower: 0.34, lift: 0.26, sendDrop: 0.14, backswing: 13, arc: 0.084, bendDown: 0.030, bendUp: -0.022, durationScale: 1.00 };
  }
  function virtualLeftHand() {
    // 左手只作为固定牵线锚点参与计算，不在画面中显示。
    return { x: canvasCssWidth * 0.54, y: canvasCssHeight * 0.84 };
  }
  function lerpPoint(a, b, t) {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }
  function pointAlongRod(geometry, fraction) {
    const f = clamp(fraction, 0, 1);
    const scaled = f * geometry.pieces.length;
    const index = clamp(Math.floor(scaled), 0, geometry.pieces.length - 1);
    const local = clamp(scaled - index, 0, 1);
    const piece = geometry.pieces[index];
    return lerpPoint(piece.start, piece.end, local);
  }
  function heldRigPose(now = performance.now(), geometry = null) {
    const rod = geometry || computeRodPieces(now);
    const hand = virtualLeftHand();
    const zone = castZoneForDistance(castPreviewDistance || rodLength);
    const motion = castMotion(zone);
    const charge = gameState === GameState.CHARGING ? clamp(castPower / 100, 0, 1) : 0;
    // 大把节前端：沿鱼竿从竿根向前约28%的位置，而不是竿根后方。
    const bigSectionFront = pointAlongRod(rod, 0.28);
    const nx = -Math.sin(rodAngle(now));
    const ny = Math.cos(rodAngle(now));
    const float = {
      x: bigSectionFront.x + nx * 22 - motion.backswing * charge * 0.16 + Math.sin(now / 300) * 0.8,
      y: bigSectionFront.y + ny * 22 + charge * 2.0
    };
    // 铅坠、八字环、子线和饵料仍由虚拟左手在竿根左侧牵住。
    const terminalRoot = {
      x: rod.handle.x - canvasCssWidth * 0.12 - motion.backswing * charge * 0.52,
      y: rod.handle.y - canvasCssHeight * 0.115 + charge * 4 + Math.sin(now / 260) * 0.5
    };
    return { hand, float, terminalRoot, bigSectionFront };
  }
  function rodAngle(now) {
    const previewZone = gameState === GameState.CHARGING ? castZoneForDistance(castPreviewDistance) : castZone;
    const motion = castMotion(previewZone);
    const ready = -2.12;
    const settle = -2.26;
    if (gameState === GameState.CHARGING) {
      return lerp(ready, ready - motion.lower, clamp(castPower / 100, 0, 1));
    }
    if (gameState === GameState.FLIGHT) {
      const t = castPoseT;
      const charged = ready - motion.lower;
      const lifted = ready + motion.lift;
      const sent = ready - motion.sendDrop;
      if (t < 0.28) return lerp(charged, lifted, t / 0.28);
      if (t < 0.72) return lerp(lifted, sent, (t - 0.28) / 0.44);
      return lerp(sent, settle, clamp((t - 0.72) / 0.28, 0, 1));
    }
    if (gameState === GameState.FIGHT || gameState === GameState.NET_READY) {
      // 控鱼时大把节接近竖直向上，竿梢按鱼重向左大幅弯曲。
      return -1.52 + Math.sin(now / 145) * 0.018;
    }
    if (gameState === GameState.WAIT_BITE || gameState === GameState.BITE || gameState === GameState.FLOAT_SETTLE) return settle;
    return ready;
  }
  function rodBend(now) {
    const zone = gameState === GameState.CHARGING ? castZoneForDistance(castPreviewDistance) : castZone;
    const motion = castMotion(zone);
    if (gameState === GameState.CHARGING) return motion.bendDown * clamp(castPower / 100, 0, 1);
    if (gameState === GameState.FLIGHT) {
      const t = castPoseT;
      if (t < 0.28) return lerp(motion.bendDown, motion.bendUp, t / 0.28);
      return lerp(motion.bendUp, 0, clamp((t - 0.28) / 0.72, 0, 1));
    }
    if ((gameState === GameState.FIGHT || gameState === GameState.NET_READY) && hookedFish) {
      const rawWeightFactor = clamp(Math.sqrt(hookedFish.weight / 10), 0.18, 1);
      const weightFactor = Math.pow(rawWeightFactor, 1.35);
      const tensionFactor = clamp(tension / 100, 0, 1);
      // 1kg保持约30°左右，10kg以上在高张力阶段可稳定接近或达到90°。
      const baseDegrees = 18 + weightFactor * 82;
      const dynamic = 0.97 + Math.sin(now / 120 + fishPullPhase) * 0.03;
      const bendDegrees = clamp(baseDegrees * (0.96 + tensionFactor * 0.04) * dynamic, 12, 90);
      return -bendDegrees * Math.PI / 180;
    }
    return 0;
  }
  function rodSourceBoundaries(sections) {
    const start = 320, tip = 2460, total = tip - start;
    const weights = Array.from({length: sections}, (_,i) => sections + 2 - i);
    const sum = weights.reduce((a,b)=>a+b,0);
    const boundaries = [start];
    let x = start;
    for (const weight of weights) {
      x += total * weight / sum;
      boundaries.push(x);
      x -= 10;
    }
    boundaries[boundaries.length-1] = tip;
    return boundaries;
  }
  function computeRodPieces(now) {
    const cfg = rodTextureConfig();
    const angle = rodAngle(now);
    const fighting = gameState === GameState.FIGHT || gameState === GameState.NET_READY;
    const pivot = fighting
      ? { x: canvasCssWidth * 0.78, y: canvasCssHeight * 0.76 }
      : { x: canvasCssWidth * 0.50, y: canvasCssHeight * 0.985 };
    const pivotRadius = clamp(canvasCssHeight * 0.034, 22, 34);
    const handle = {
      x: pivot.x + Math.cos(angle + Math.PI / 2) * pivotRadius,
      y: pivot.y + Math.sin(angle + Math.PI / 2) * pivotRadius
    };
    const totalLength = rodDisplayLength();
    const bend = rodBend(now);
    const visualSegments = fighting ? 28 : 14;
    const sourceTotal = ROD_SOURCE.tipX - ROD_SOURCE.handleX;
    let current = { ...handle };
    const pieces = [];
    for (let i = 0; i < visualSegments; i++) {
      const localT = visualSegments === 1 ? 0 : i / (visualSegments - 1);
      const curveT = localT * localT * (3 - 2 * localT);
      const pieceAngle = angle + bend * curveT;
      const length = totalLength / visualSegments;
      const next = { x: current.x + Math.cos(pieceAngle) * length, y: current.y + Math.sin(pieceAngle) * length };
      const sourceStart = i === 0 ? 0 : ROD_SOURCE.handleX + sourceTotal * i / visualSegments;
      const sourceEnd = ROD_SOURCE.handleX + sourceTotal * (i + 1) / visualSegments;
      pieces.push({ index:i, start:{...current}, end:next, angle:pieceAngle, length, sourceStart, sourceEnd });
      current = next;
    }
    return { handle, tip:current, totalLength, pieces, textureKey:cfg.key, sections:cfg.sections };
  }
  function rodPose(now) {
    const geometry = computeRodPieces(now);
    return { handle:geometry.handle, tip:geometry.tip, displayLength:geometry.totalLength, angle:rodAngle(now), textureKey:geometry.textureKey, sections:geometry.sections };
  }
  function getWaterY() { return canvasCssHeight * currentSpot().waterline; }
  function castTarget(distance) {
    const ratio = clamp(distance / Math.max(maxCastDistance(), 0.1), 0, 1);
    const x = clamp(canvasCssWidth * 0.50 + castLandingOffsetX, canvasCssWidth * 0.45, canvasCssWidth * 0.55);
    // 画面距离按当前鱼竿显示长度计算：7.2米满抛约为竿根到浮漂1.4倍竿长。
    const visualDistanceRatio = lerp(0.82, 1.40, Math.pow(ratio, 0.90));
    const forwardHandleY = canvasCssHeight * 0.94;
    const y = clamp(
      forwardHandleY - rodDisplayLength() * visualDistanceRatio,
      canvasCssHeight * 0.34,
      canvasCssHeight * 0.72
    );
    return { x, y, visualDistanceRatio };
  }
  function drawBackground() {
    const img = images[currentSpotId];
    if (!img) return;
    const cw = canvasCssWidth, ch = canvasCssHeight;
    const scale = Math.max(cw / img.width, ch / img.height) * 1.12;
    const dw = img.width * scale, dh = img.height * scale;
    const maxPanX = Math.max(0, (dw - cw) / 2);
    const maxPanY = Math.max(0, (dh - ch) / 2);
    const panX = (viewOffsetX / 140) * maxPanX;
    const panY = (viewOffsetY / 24) * maxPanY;
    const ox = (cw - dw) / 2 - panX;
    const oy = (ch - dh) / 2 - panY;
    ctx.drawImage(img, ox, oy, dw, dh);
    ctx.fillStyle = 'rgba(20,40,35,0.035)'; ctx.fillRect(0,ch*.3,cw,ch*.7);
    ctx.fillStyle = 'rgba(22,68,70,0.045)'; ctx.fillRect(0,getWaterY(),cw,ch-getWaterY());
  }
  function drawForwardRod(now) {
    const img = images[ROD_FORWARD_KEY];
    if (!img) return false;
    const displayHeight = rodDisplayLength();
    const displayWidth = displayHeight * img.width / img.height;
    const bottomY = canvasCssHeight * 0.94;
    const centerX = canvasCssWidth * 0.50;
    ctx.drawImage(img, centerX - displayWidth / 2, bottomY - displayHeight, displayWidth, displayHeight);
    lineAnchor = { x: centerX, y: bottomY - displayHeight * 0.96 };
    return true;
  }
  function drawRod(now) {
    if (gameState === GameState.WAIT_BITE || gameState === GameState.BITE || gameState === GameState.FLOAT_SETTLE) {
      if (drawForwardRod(now)) return;
    }
    const geometry = computeRodPieces(now);
    lineAnchor = geometry.tip;
    const img = images[geometry.textureKey];
    if (!img) return;
    const scale = geometry.totalLength / (ROD_SOURCE.tipX - ROD_SOURCE.handleX);
    geometry.pieces.forEach((piece,i) => {
      const sx = piece.sourceStart;
      const sw = Math.max(1,piece.sourceEnd-piece.sourceStart);
      ctx.save();
      ctx.translate(piece.start.x,piece.start.y);
      ctx.rotate(piece.angle);
      const dx = i===0 ? -ROD_SOURCE.handleX*scale : -2;
      ctx.drawImage(img,sx,0,sw,img.height,dx,-ROD_SOURCE.handleY*scale,sw*scale+4,img.height*scale);
      ctx.restore();
    });
  }
  function rotatePoint(cx,cy,lx,ly,rotation) {
    const c=Math.cos(rotation),s=Math.sin(rotation);
    return {x:cx+lx*c-ly*s,y:cy+lx*s+ly*c};
  }
  function drawFloatSprite(x,y,rotation,scale=1) {
    const img = images[FLOAT_IMAGE_KEY];
    const drawH = 108 * scale;
    const naturalW = img ? drawH * (img.width / img.height) : 7 * scale;
    const drawW = Math.max(6.5 * scale, naturalW);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if (img) ctx.drawImage(img, -drawW / 2, -drawH * 0.49, drawW, drawH);
    ctx.restore();
    return {
      top: rotatePoint(x, y, 0, -drawH * 0.48, rotation),
      base: rotatePoint(x, y, 0, drawH * 0.46, rotation),
      water: rotatePoint(x, y, 0, -drawH * 0.18, rotation)
    };
  }
  function floatSurfaceScale() {
    const ratio = clamp(castDistance / Math.max(maxCastDistance(), 0.1), 0, 1);
    return lerp(0.86, 0.68, ratio);
  }
  function drawFloatOnWater(x, waterY, marks = 4, scale = 1) {
    const img = images[FLOAT_TIP_KEY] || images[FLOAT_IMAGE_KEY];
    // 使用用户浮漂原图的彩色漂尾，只裁出4目或5目；漂身和漂脚位于水下，不绘制。
    const sourceRatio = marks === 5 ? 0.71 : 0.565;
    const sourceH = img ? Math.max(1, Math.round(img.height * sourceRatio)) : 1;
    const baseHeight = marks === 5 ? 49 : 40;
    const drawH = baseHeight * scale;
    const naturalW = img ? drawH * (img.width / sourceH) : 5.5 * scale;
    const drawW = Math.max(5.5 * scale, naturalW);
    const topY = waterY - drawH;
    if (img) {
      ctx.drawImage(img, 0, 0, img.width, sourceH, x - drawW / 2, topY, drawW, drawH);
    }
    return { top: { x, y: topY }, water: { x, y: waterY } };
  }
  function drawSinker(x, y, scale = 1, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const w = 18 * scale, h = 26 * scale;
    const r = 6 * scale;
    ctx.fillStyle = '#1d1f21';
    ctx.strokeStyle = '#8fa1a8';
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.beginPath();
    ctx.moveTo(-w/2 + r, -h/2);
    ctx.lineTo(w/2 - r, -h/2);
    ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    ctx.lineTo(w/2, h/2 - r);
    ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    ctx.lineTo(-w/2 + r, h/2);
    ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    ctx.lineTo(-w/2, -h/2 + r);
    ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#18a15d';
    ctx.fillRect(-w/2 + 1.5 * scale, -h/2 + 1.5 * scale, w - 3 * scale, 2.5 * scale);
    ctx.fillRect(-w/2 + 1.5 * scale, h/2 - 4 * scale, w - 3 * scale, 2.5 * scale);
    if (scale >= 0.72) {
      ctx.fillStyle = '#eff3f4';
      ctx.font = `${Math.max(7, 8.5 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('4.0g', 0, 1 * scale);
    }
    ctx.restore();
  }
  function drawHookShape(x, y, scale = 1, mirror = false) {
    ctx.save();
    ctx.translate(x, y);
    if (mirror) ctx.scale(-1, 1);
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.beginPath();
    ctx.moveTo(0, -12 * scale);
    ctx.quadraticCurveTo(-2 * scale, -2 * scale, 4 * scale, 10 * scale);
    ctx.quadraticCurveTo(10 * scale, 18 * scale, 14 * scale, 8 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12 * scale, 8 * scale);
    ctx.lineTo(15.5 * scale, 3 * scale);
    ctx.stroke();
    ctx.restore();
  }
  function drawCornBait(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.25);
    ctx.fillStyle = '#e0b126';
    ctx.strokeStyle = '#9f6d0c';
    ctx.lineWidth = Math.max(1, 0.9 * scale);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.2 * scale, 8.2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawTerminalRig(root, scale = 1, rotation = 0) {
    ctx.save();
    ctx.translate(root.x, root.y);
    ctx.rotate(rotation);
    ctx.strokeStyle = 'rgba(242,245,243,0.92)';
    ctx.lineWidth = Math.max(1, 1.0 * scale);
    const sinkerTop = 22 * scale;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, sinkerTop - 14 * scale); ctx.stroke();
    // float seat beads
    [6, 14].forEach(y => { ctx.strokeStyle='rgba(223,230,230,0.9)'; ctx.strokeRect(-3*scale, y*scale, 6*scale, 8*scale); });
    // green seat/connector
    ctx.strokeStyle = 'rgba(242,245,243,0.92)';
    ctx.fillStyle = '#62b64a';
    ctx.beginPath();
    ctx.moveTo(1 * scale, 10 * scale);
    ctx.lineTo(9 * scale, 4 * scale);
    ctx.lineTo(16 * scale, 14 * scale);
    ctx.lineTo(8 * scale, 19 * scale);
    ctx.closePath();
    ctx.fill();
    drawSinker(0, sinkerTop, 0.92 * scale, 0);
    const swivelY = sinkerTop + 18 * scale;
    ctx.strokeStyle = '#6f7378';
    ctx.beginPath(); ctx.moveTo(0, sinkerTop + 12 * scale); ctx.lineTo(0, swivelY); ctx.stroke();
    for (const y of [swivelY, swivelY + 9 * scale]) { ctx.beginPath(); ctx.arc(0, y, 3 * scale, 0, Math.PI * 2); ctx.stroke(); }
    const splitY = swivelY + 12 * scale;
    const left = { x: -22 * scale, y: splitY + 56 * scale };
    const right = { x: 22 * scale, y: splitY + 54 * scale };
    ctx.strokeStyle = 'rgba(237,214,207,0.95)';
    ctx.lineWidth = Math.max(1, 1.0 * scale);
    ctx.beginPath(); ctx.moveTo(0, splitY); ctx.lineTo(left.x, left.y); ctx.moveTo(0, splitY); ctx.lineTo(right.x, right.y); ctx.stroke();
    drawHookShape(left.x, left.y + 8 * scale, scale * 0.95, false);
    drawHookShape(right.x, right.y + 8 * scale, scale * 0.95, true);
    drawCornBait(left.x + 2 * scale, left.y + 18 * scale, 0.95 * scale);
    drawCornBait(right.x - 2 * scale, right.y + 18 * scale, 0.95 * scale);
    ctx.restore();
  }
  function rigFlightProgress(t) {
    return {
      terminalP: clamp(t / 0.82, 0, 1),
      floatP: clamp((t - 0.08) / 0.92, 0, 1)
    };
  }
  function lowArc(start, target, p, height) {
    const e = 1 - Math.pow(1 - p, 2);
    return {
      x: lerp(start.x, target.x, e),
      y: lerp(start.y, target.y, e) - Math.sin(Math.PI * p) * height
    };
  }
  function drawRigLines(tip, floatPose, terminalRoot) {
    ctx.strokeStyle = 'rgba(245,248,246,0.92)';
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(floatPose.top.x, floatPose.top.y);
    ctx.lineTo(floatPose.water ? floatPose.water.x : floatPose.base.x, floatPose.water ? floatPose.water.y : floatPose.base.y);
    ctx.stroke();
    if (terminalRoot) {
      ctx.strokeStyle = 'rgba(240,245,242,0.82)';
      ctx.beginPath();
      const fromX = floatPose.base ? floatPose.base.x : floatPose.water.x;
      const fromY = floatPose.base ? floatPose.base.y : floatPose.water.y;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(terminalRoot.x, terminalRoot.y);
      ctx.stroke();
    }
  }
  function drawSplash(x,y,strength=1) {
    ctx.strokeStyle=`rgba(255,255,255,${.26*strength})`;
    ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(x,y,11*strength,4*strength,0,0,Math.PI*2);ctx.stroke();
  }
  function fightFishVisual(now) {
    if (!hookedFish) return { visible: false, alpha: 0, x: floatPosition.x, y: floatPosition.y + 50, scale: 1, angle: 0, direction: 1 };
    const weightFactor = clamp(Math.sqrt(hookedFish.weight / 10), 0.20, 1.45);
    const distanceRatio = clamp((fishDistance - 0.8) / Math.max(castDistance + 1.8, 1), 0, 1);
    const wave = (Math.sin(fishPullPhase * 1.18 + fishSurfaceSeed) + 1) * 0.5;
    const threshold = clamp(0.88 - weightFactor * 0.13 - (1 - distanceRatio) * 0.08, 0.61, 0.88);
    // 在阈值附近使用平滑过渡，避免露头/下潜时坐标瞬间切换。
    const edge0 = threshold - 0.10;
    const edge1 = threshold + 0.05;
    const normalized = clamp((wave - edge0) / Math.max(0.001, edge1 - edge0), 0, 1);
    const surfaceBlend = forceFishSurfaceVisible || gameState === GameState.NET_READY
      ? 1
      : normalized * normalized * (3 - 2 * normalized);
    const lateralPrimary = Math.sin(fishPullPhase * 0.72 + fishSurfaceSeed);
    const lateralSecondary = Math.sin(fishPullPhase * 0.31 + fishSurfaceSeed * 0.7) * 0.28;
    const lateral = (lateralPrimary + lateralSecondary) * canvasCssWidth * (0.085 + weightFactor * 0.040);
    const targetX = clamp(floatPosition.x + lateral, 34, canvasCssWidth - 34);
    const deepY = clamp(floatPosition.y + canvasCssHeight * (0.075 + distanceRatio * 0.11), floatPosition.y + 38, canvasCssHeight * 0.75);
    const surfaceY = floatPosition.y + 27 + Math.cos(fishPullPhase) * 4;
    const targetY = lerp(deepY, surfaceY, surfaceBlend);
    const targetAngle = Math.sin(fishPullPhase * 0.55) * 0.18;
    const targetAlpha = clamp(surfaceBlend * 1.15, 0, 1);

    if (!fishVisualState.initialized) {
      fishVisualState = { initialized: true, x: targetX, y: deepY, alpha: 0, angle: targetAngle, direction: 1, lastAt: now };
    }
    const dt = clamp((now - fishVisualState.lastAt) / 1000, 0, 0.08);
    fishVisualState.lastAt = now;
    const positionEase = 1 - Math.exp(-dt * 5.2);
    const alphaEase = 1 - Math.exp(-dt * 7.0);
    const previousX = fishVisualState.x;
    const proposedX = lerp(fishVisualState.x, targetX, positionEase);
    const proposedY = lerp(fishVisualState.y, targetY, positionEase);
    const moveX = proposedX - fishVisualState.x;
    const moveY = proposedY - fishVisualState.y;
    const moveDistance = Math.hypot(moveX, moveY);
    // 限制鱼体最大游速，目标轨迹变化时也不能瞬移。
    const maxSpeed = 105 + weightFactor * 42;
    const maxStep = maxSpeed * dt;
    const moveScale = moveDistance > maxStep && moveDistance > 0 ? maxStep / moveDistance : 1;
    fishVisualState.x += moveX * moveScale;
    fishVisualState.y += moveY * moveScale;
    fishVisualState.angle = lerp(fishVisualState.angle, targetAngle, positionEase);
    fishVisualState.alpha = lerp(fishVisualState.alpha, targetAlpha, alphaEase);
    const dx = fishVisualState.x - previousX;
    if (Math.abs(dx) > 0.05) fishVisualState.direction = dx >= 0 ? 1 : -1;

    return {
      visible: fishVisualState.alpha > 0.025,
      alpha: fishVisualState.alpha,
      x: fishVisualState.x,
      y: fishVisualState.y,
      deepY,
      scale: weightFactor,
      angle: fishVisualState.angle,
      direction: fishVisualState.direction,
      surfaceBlend
    };
  }
  function drawFightFishPartial(visual) {
    if (!visual.visible || !hookedFish) return;
    const img = images[`fight:${hookedFish.key}`];
    if (!img) return;
    const drawW = clamp(62 + hookedFish.weight * 5.2, 64, 150);
    const drawH = drawW * img.height / img.width;
    const faceRight = visual.direction >= 0;
    ctx.save();
    ctx.translate(visual.x, visual.y);
    ctx.rotate(visual.angle);
    if (!faceRight) ctx.scale(-1, 1);
    // 只露出鱼头和一部分身体，并增加水下透明感。
    ctx.beginPath();
    ctx.rect(-drawW * 0.24, -drawH * 0.52, drawW * 0.76, drawH * 0.72);
    ctx.clip();
    ctx.globalAlpha = (gameState === GameState.NET_READY ? 0.82 : 0.62) * visual.alpha;
    ctx.drawImage(img, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(46,126,137,0.24)';
    ctx.fillRect(-drawW * 0.5, -drawH * 0.5, drawW, drawH);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.30 * visual.alpha;
    ctx.strokeStyle = '#dff4f3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(visual.x, visual.y - drawH * 0.24, drawW * 0.30, 4, visual.angle, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function drawFloatAndLine(now) {
    const tip = lineAnchor;
    const waterMarks = getDepthState().marks;
    if (gameState === GameState.FIGHT || gameState === GameState.NET_READY) {
      // 中鱼后不显示浮漂。鱼、直线鱼线和大幅弯曲鱼竿共同表现受力。
      const fishVisual = fightFishVisual(now);
      ctx.save();
      ctx.strokeStyle = 'rgba(239,246,244,0.92)';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(fishVisual.x, fishVisual.y - 4);
      ctx.stroke();
      ctx.restore();
      drawFightFishPartial(fishVisual);
      return;
    }
    if (gameState === GameState.READY || gameState === GameState.CHARGING) {
      const geometry = computeRodPieces(now);
      const held = heldRigPose(now, geometry);
      const charge = gameState === GameState.CHARGING ? clamp(castPower / 100, 0, 1) : 0;
      const rotation = -0.24 + charge * 0.10;
      const fp = drawFloatSprite(held.float.x, held.float.y, rotation, 0.74);
      drawRigLines(tip, fp, held.terminalRoot);
      drawTerminalRig(held.terminalRoot, 0.48, -0.04 - charge * 0.07);
      floatVisible = true;
      return;
    }
    if (gameState === GameState.FLIGHT && flightRig) {
      const t = clamp((now - castFlightStart) / castFlightDuration, 0, 1);
      castPoseT = t;
      const motion = castMotion(castZone), height = canvasCssHeight * motion.arc;
      const progress = rigFlightProgress(t);
      const terminal = lowArc(flightRig.terminalStart, flightRig.terminalTarget, progress.terminalP, height * 0.82);
      const flo = lowArc(flightRig.floatStart, flightRig.floatTarget, progress.floatP, height);
      const floatRot = lerp(-0.42, 0.02, progress.floatP);
      const fp = drawFloatSprite(flo.x, flo.y, floatRot, 0.68);
      drawRigLines(tip, fp, terminal);
      drawTerminalRig(terminal, 0.46, lerp(-0.22, 0.05, progress.terminalP));
      if (progress.terminalP >= 1) drawSplash(terminal.x, flightRig.floatTarget.y + 1, 0.7);
      if (t >= 1) {
        floatVisible = true; floatLanded = true; floatPosition = { ...flightRig.floatTarget }; flightRig = null; rigSettleStart = now; castPoseT = 1;
        setState(GameState.FLOAT_SETTLE, '线组入水');
      }
      return;
    }
    if (gameState === GameState.FLOAT_SETTLE) {
      const t = clamp((now - rigSettleStart) / 520, 0, 1);
      castPoseT = lerp(1, 0.88, t);
      const surfaceY = floatPosition.y + lerp(-7, 0, t);
      const fp = drawFloatOnWater(floatPosition.x, surfaceY, waterMarks, floatSurfaceScale());
      drawSplash(floatPosition.x, surfaceY + 2, 1 - t * 0.45);
      if (t >= 1) {
        setState(GameState.WAIT_BITE, '等待鱼口');
        ui['distance-label'].textContent = `${castDistance.toFixed(1)} m`;
        scheduleBite(rnd(2200, 5600));
      }
      return;
    }
    if (floatVisible || floatLanded || gameState === GameState.WAIT_BITE || gameState === GameState.BITE) {
      castPoseT = 0;
      let bob = 0;
      if (gameState === GameState.WAIT_BITE) bob = Math.sin(now / 320) * 1.0;
      if (gameState === GameState.BITE) {
        const p = (performance.now() - biteStartAt) / Math.max(1, biteWindowEnd);
        bob = Math.sin(p * 12) * 1.4 + (bitePattern === '黑漂' ? 7 * p : bitePattern === '顶漂' ? -4 * p : 2.2 * Math.sin(p * 10));
      }
      const fp = drawFloatOnWater(floatPosition.x, floatPosition.y + bob, waterMarks, floatSurfaceScale());
      ctx.beginPath();
      ctx.arc(floatPosition.x, floatPosition.y + 2, 14 + Math.sin(now / 350) * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.stroke();
    }
  }
  function drawMovementHint() {
    const w = canvasCssWidth, h = canvasCssHeight;
    const rw = Math.min(380, w * 0.64), rh = 58;
    const x = Math.max(12, w - rw - 12), y = h * 0.33;
    const r = 24;
    ctx.fillStyle = 'rgba(10,18,14,0.48)';
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+rw-r,y); ctx.quadraticCurveTo(x+rw,y,x+rw,y+r);
    ctx.lineTo(x+rw,y+rh-r); ctx.quadraticCurveTo(x+rw,y+rh,x+rw-r,y+rh);
    ctx.lineTo(x+r,y+rh); ctx.quadraticCurveTo(x,y+rh,x,y+rh-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f1f7f3';
    ctx.font = `${Math.max(14, Math.min(19, w*0.04))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('按住“抛竿”蓄力，松手荡出。', x+rw/2, y+36);
  }
  function render(now) {
    syncCanvasSize();
    ctx.clearRect(0, 0, canvasCssWidth, canvasCssHeight);
    drawBackground();
    drawRod(now);
    drawFloatAndLine(now);
    if (gameState === GameState.READY) drawMovementHint();
    requestAnimationFrame(render);
  }

  function castRange(power) {
    const max=maxCastDistance(),min=rodLength*.55;
    return clamp(min+((max-min)*clamp(power,0,100))/100,min,max);
  }
  function startCharging() {
    if(gameState!==GameState.READY)return;
    clearTimeout(waitBiteTimer);charging=true;castPower=8;chargeDirection=1;castPreviewDistance=castRange(castPower);castZone=castZoneForDistance(castPreviewDistance);
    setState(GameState.CHARGING,'蓄力荡抛');ui['primary-action'].classList.add('charging');
  }
  function releaseCast() {
    if(!charging)return;
    const now=performance.now();
    charging=false;ui['primary-action'].classList.remove('charging');castDistance=+castRange(castPower).toFixed(1);castZone=castZoneForDistance(castDistance);
    floatVisible=false;floatLanded=false;castPoseT=0;
    castLandingOffsetX = (Math.random() * 0.10 - 0.05) * canvasCssWidth;
    const held=heldRigPose(now),target=castTarget(castDistance),motion=castMotion(castZone);
    floatPosition={...target};
    flightRig = {
      hand: { ...held.hand },
      floatStart: { ...held.float },
      terminalStart: { ...held.terminalRoot },
      floatTarget: { ...target },
      terminalTarget: { x: target.x + 4, y: target.y - 2 }
    };
    castFlightStart=now;castFlightDuration=(920+castDistance*34)*motion.durationScale;
    setState(GameState.FLIGHT,`${castZone==='near'?'近区':castZone==='far'?'远区':'中区'}荡抛`);ui['distance-label'].textContent=`${castDistance.toFixed(1)} m`;updateInfoUI();
  }
  function updateCharging(dt) {
    if(!charging||gameState!==GameState.CHARGING)return;
    castPower+=chargeDirection*dt*.06;if(castPower>=100){castPower=100;chargeDirection=-1;}if(castPower<=12){castPower=12;chargeDirection=1;}
    castPreviewDistance=castRange(castPower);castZone=castZoneForDistance(castPreviewDistance);
    ui['cast-power-label'].textContent=`${Math.round(castPower)}%`;ui['cast-power-bar'].style.width=`${castPower}%`;ui['cast-distance-preview'].textContent=`${castPreviewDistance.toFixed(1)} m`;
    const zoneName=castZone==='near'?'近区低弧':castZone==='far'?'远区加强后摆':'中区标准荡抛';
    ui['cast-rule-hint'].textContent=`${zoneName} · ${rodLength.toFixed(1)}米竿最远${maxCastDistance().toFixed(1)}米。`;
  }

  function update(now) {
    const dt = Math.min(60, now - lastFrame);
    lastFrame = now;
    updateCharging(dt);
    if (movingPressed) moveView(movingPressed);
    updateFight(dt / 1000);
    requestAnimationFrame(update);
  }

  function bindEvents() {
    const beginPrimary = e => {
      if (e && e.cancelable) e.preventDefault();
      if (gameState === GameState.READY) startCharging();
      else if (gameState === GameState.WAIT_BITE || gameState === GameState.BITE) attemptHook();
      else if (gameState === GameState.NET_READY) landFish();
    };
    const endPrimary = e => { if (e && e.cancelable) e.preventDefault(); if (charging) releaseCast(); };
    ['mousedown','touchstart','pointerdown'].forEach(type => ui['primary-action'].addEventListener(type, beginPrimary, { passive: false }));
    ['mouseup','mouseleave','touchend','touchcancel','pointerup','pointercancel'].forEach(type => ui['primary-action'].addEventListener(type, endPrimary, { passive: false }));
    ui['retrieve-button'].onclick = () => retrieve(true);
    ui['fish-keeper-button'].onclick = openFishKeeper;
    ui['rig-button'].onclick = () => { selectedRodLengthPending = rodLength; fishingDepthPending = fishingDepth; updateRigUI(); openDialog(ui['rig-dialog']); };
    ui['bait-button'].onclick = () => { selectedBaitPending = selectedBaitKey; populateBaitGrid(); openDialog(ui['bait-dialog']); };
    ui['spot-button'].onclick = () => { populateSpotGrid(); openDialog(ui['spot-dialog']); };
    ui['focus-float-button'].onclick = () => { toast(floatVisible ? '浮漂已在水面中央。' : '当前还没有抛竿。', 1200); };
    ui['continue-button'].onclick = () => { closeDialog(ui['result-dialog']); retrieve(false); };
    ui['save-rig-button'].onclick = () => { rodLength = selectedRodLengthPending; fishingDepth = fishingDepthPending; closeDialog(ui['rig-dialog']); updateInfoUI(); toast('线组设置已保存。', 1200); };
    ui['save-bait-button'].onclick = () => { selectedBaitKey = selectedBaitPending; closeDialog(ui['bait-dialog']); updateInfoUI(); toast(`已切换为${getBait().name}。`, 1200); };
    ui['net-button'].onclick = landFish;
    document.querySelectorAll('[data-close-dialog]').forEach(btn => btn.onclick = () => {
      const id = btn.dataset.closeDialog;
      if (id === 'fish-keeper-dialog') closeFishKeeper(); else closeDialog(document.getElementById(id));
    });
    document.querySelectorAll('[data-depth-step]').forEach(btn => btn.onclick = () => {
      fishingDepthPending = clamp(+(fishingDepthPending + parseFloat(btn.dataset.depthStep)).toFixed(2), 0.30, 2.80);
      updateRigUI();
    });
    ui['depth-range'].addEventListener('input', e => { fishingDepthPending = +e.target.value; updateRigUI(); });
    document.querySelectorAll('[data-rod-length]').forEach(btn => btn.onclick = () => {
      selectedRodLengthPending = +btn.dataset.rodLength;
      document.querySelectorAll('[data-rod-length]').forEach(b => b.classList.toggle('selected', +b.dataset.rodLength === selectedRodLengthPending));
      updateRigUI();
    });
    document.querySelectorAll('[data-fight]').forEach(btn => btn.onclick = () => fightAction(btn.dataset.fight));
    document.querySelectorAll('[data-move]').forEach(btn => {
      const dir = btn.dataset.move;
      const start = e => { if (e.cancelable) e.preventDefault(); movingPressed = dir; btn.classList.add('active'); moveView(dir); };
      const stop = e => { if (e.cancelable) e.preventDefault(); if (movingPressed === dir) movingPressed = null; btn.classList.remove('active'); };
      ['mousedown','touchstart','pointerdown'].forEach(type => btn.addEventListener(type, start, { passive: false }));
      ['mouseup','mouseleave','touchend','touchcancel','pointerup','pointercancel'].forEach(type => btn.addEventListener(type, stop, { passive: false }));
    });
    window.addEventListener('keydown', e => {
      const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'forward', ArrowDown:'back' };
      if (map[e.key]) { moveView(map[e.key]); e.preventDefault(); }
    });
  }

  async function loadConfig() {
    try {
      const r = await fetch(PROBABILITY_FILE, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      config = await r.json();
      return true;
    } catch (err) {
      config = FALLBACK_CONFIG;
      return false;
    }
  }
  async function preloadImages() {
    const all = [
      ...SPOTS.map(s => ({ key: s.id, src: s.image })),
      ...Object.entries(FISH_PROFILES).map(([key,val]) => ({ key: `fish:${key}`, src: val.image })),
      ...Object.keys(FISH_PROFILES).map(key => ({ key: `fight:${key}`, src: `./assets/fight_fish/${key}.png` })),
      { key: ROD_SIDE_KEY, src: './assets/rods/rod_tianyuan_side.png' },
      { key: ROD_FORWARD_KEY, src: './assets/rods/rod_tianyuan_forward.png' },
      { key: FLOAT_IMAGE_KEY, src: './assets/ui/float_real.png' },
      { key: FLOAT_TIP_KEY, src: './assets/ui/float_tip.png' }
    ];
    let loaded = 0;
    await Promise.all(all.map(item => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { images[item.key] = img; loaded += 1; setLoading(`正在加载素材（${loaded}/${all.length}）…`, 15 + loaded / all.length * 80); resolve(); };
      img.onerror = () => { loaded += 1; setLoading(`素材加载中（${loaded}/${all.length}）…`, 15 + loaded / all.length * 80); resolve(); };
      img.src = item.src;
    })));
  }

  async function boot() {
    setLoading('正在读取概率配置…', 6);
    await loadConfig();
    setLoading('正在加载钓场、鱼图、天元千川鱼竿与浮漂贴图…', 12);
    await preloadImages();
    setLoading('正在初始化界面…', 96);
    bindEvents();
    populateBaitGrid();
    populateSpotGrid();
    updateInfoUI();
    closeDialog(ui['result-dialog']);
    closeDialog(ui['rig-dialog']);
    closeDialog(ui['bait-dialog']);
    closeDialog(ui['fish-keeper-dialog']);
    closeDialog(ui['spot-dialog']);
    setState(GameState.READY, '准备钓鱼');
    document.querySelector('#loading-screen p').textContent = '加载完成';
    ui['loading-progress'].style.width = '100%';
    setTimeout(() => closeDialog(ui['loading-screen']), 240);
    requestAnimationFrame(render);
    requestAnimationFrame(update);
  }


  window.__fishGame = {
    getSnapshot: () => ({
      state: gameState,
      spot: currentSpotId,
      bait: selectedBaitKey,
      rodLength,
      rodTexture: rodTextureConfig().image,
      rodDisplayLength: rodDisplayLength(),
      rodSections: rodTextureConfig().sections,
      rodTip: rodPose(performance.now()).tip,
      rodHandle: rodPose(performance.now()).handle,
      leftHand: virtualLeftHand(),
      heldRig: (() => { const h = heldRigPose(performance.now()); return { float: h.float, terminalRoot: h.terminalRoot, bigSectionFront: h.bigSectionFront }; })(),
      firstSectionApproxPx: rodDisplayLength() / rodTextureConfig().sections,
      fishingDepth,
      castDistance,
      floatPosition: { x: floatPosition.x, y: floatPosition.y },
      floatMarks: getDepthState().marks,
      landedRodToFloatRatio: floatVisible && castDistance > 0 ? Math.hypot(floatPosition.x - canvasCssWidth * 0.50, floatPosition.y - canvasCssHeight * 0.94) / Math.max(1, rodDisplayLength()) : null,
      maxCastDistance: maxCastDistance(),
      castZone,
      castLandingOffsetX,
      rodBend: rodBend(performance.now()),
      fightVisual: fightFishVisual(performance.now()),
      fishVisualState: { ...fishVisualState },
      lateMissRate: LATE_MISS_RATE,
      tension,
      fishDistance,
      fishStamina,
      fishStaminaMax,
      hookedFish: hookedFish ? { species: hookedFish.species, weight: hookedFish.weight, key: hookedFish.key } : null,
      keeperCount: fishKeeper.length,
      viewOffsetX, viewOffsetY,
    }),
    setRodLength: (length) => {
      const value = Number(length);
      if (!ROD_LENGTHS.includes(value)) return false;
      if (gameState !== GameState.READY) retrieve(false);
      rodLength = value;
      selectedRodLengthPending = value;
      updateInfoUI();
      return true;
    },
    forceMaxCast: () => {
      if (gameState !== GameState.READY) retrieve(false);
      castPower = 100; castPreviewDistance = castRange(castPower); castZone = castZoneForDistance(castPreviewDistance);
      charging = true;
      releaseCast();
      return true;
    },
    forceCastPower: (power = 50) => {
      if (gameState !== GameState.READY) retrieve(false);
      castPower = clamp(Number(power) || 0, 0, 100);
      castPreviewDistance = castRange(castPower);
      castZone = castZoneForDistance(castPreviewDistance);
      charging = true;
      releaseCast();
      return { distance: castDistance, zone: castZone };
    },
    sampleRigProgress: (t) => rigFlightProgress(clamp(Number(t)||0,0,1)),
    simulateLateMisses: (iterations = 1000) => {
      let misses = 0;
      for (let i = 0; i < iterations; i++) if (Math.random() < LATE_MISS_RATE) misses++;
      return { iterations, misses, rate: misses / iterations };
    },
    getCastTarget: (distance = maxCastDistance()) => castTarget(distance),
    setLandingOffsetRatio: (ratio = 0) => { castLandingOffsetX = clamp(Number(ratio) || 0, -0.05, 0.05) * canvasCssWidth; return castLandingOffsetX; },
    forceCastWithOffset: (power = 50, ratio = 0) => {
      if (gameState !== GameState.READY) retrieve(false);
      castPower = clamp(Number(power) || 0, 0, 100);
      castPreviewDistance = castRange(castPower);
      castZone = castZoneForDistance(castPreviewDistance);
      castLandingOffsetX = clamp(Number(ratio) || 0, -0.05, 0.05) * canvasCssWidth;
      charging = true;
      const savedRandom = Math.random;
      Math.random = () => (clamp(Number(ratio) || 0, -0.05, 0.05) + 0.05) / 0.10;
      try { releaseCast(); } finally { Math.random = savedRandom; }
      return { distance: castDistance, zone: castZone, offsetX: castLandingOffsetX };
    },
    setViewOffsets: (x = 0, y = 0) => { viewOffsetX = clamp(Number(x) || 0, -140, 140); viewOffsetY = clamp(Number(y) || 0, -24, 24); return { viewOffsetX, viewOffsetY }; },
    forceHeavyFight: (speciesKey = 'black_carp', weight = 10) => {
      if (gameState === GameState.READY) {
        castDistance = clamp(rodLength * 1.2, 2.5, maxCastDistance());
        floatPosition = castTarget(castDistance);
        floatVisible = true; floatLanded = true;
      }
      const profile = FISH_PROFILES[speciesKey] || FISH_PROFILES.black_carp;
      hookedFish = {
        key: speciesKey,
        species: profile.name,
        profile,
        weight,
        length: Math.max(profile.minCm, Math.min(profile.maxCm, 70 + weight * 2.8)),
        depthState: getDepthState().detail,
        layerKey: getDepthState().layerKey,
        bitePattern: '黑漂',
        hookElapsed: 300,
      };
      bitePattern = hookedFish.bitePattern;
      biteWindowStart = 180;
      biteWindowEnd = 430;
      startFight(300);
      return true;
    },
    tickFight: (dt) => updateFight(dt),
    forceFishGlimpse: (visible = true) => { forceFishSurfaceVisible = !!visible; return forceFishSurfaceVisible; },
    doFightAction: (action) => fightAction(action),
    forceCatchSmallFish: () => {
      hookedFish = {
        key: 'crucian_carp', species: '鲫鱼', profile: FISH_PROFILES.crucian_carp, weight: 0.42, length: 25,
        depthState: getDepthState().detail, layerKey: getDepthState().layerKey, bitePattern: '顿口', hookElapsed: 260,
      };
      bitePattern = hookedFish.bitePattern; biteWindowStart = 220; biteWindowEnd = 520;
      castDistance = 3.6; floatPosition = castTarget(castDistance); floatVisible = true; floatLanded = true;
      fishStaminaMax = 100; fishStamina = 4; fishDistance = 1.0; tension = 28;
      setState(GameState.NET_READY, '小鱼已靠岸 · 可以提鱼');
      updateFightUI();
      return true;
    }
  };

  boot();
})();
