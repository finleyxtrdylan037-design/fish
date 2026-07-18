(() => {
  "use strict";
  const VERSION = "0.3.0",
    WATER_DEPTH = 2.4,
    NET_DISTANCE = 1.8,
    DIRECT_LIFT_DISTANCE = 1.2,
    LANDING_STAMINA = 8,
    DIRECT_LIFT_MAX_KG = 0.8,
    ROD_WORLD_SCALE = 0.42;
  const PROBABILITY_FILE = "./bait_depth_fish_probability_v0.3.0.json";

  const SPOTS = [
    { id: "qingzhu", name: "青竹混养池", description: "山水环抱的综合鱼塘", image: "./assets/scenery/spot_01_qingzhu.webp", x: 62, y: 50 },
    { id: "reservoir", name: "山脚水库岸边", description: "视野开阔，远山与深水区", image: "./assets/scenery/spot_02_reservoir.webp", x: 54, y: 48 },
    { id: "willow", name: "柳树林野塘", description: "树荫浓密的安静野塘", image: "./assets/scenery/spot_03_willow.webp", x: 58, y: 51 },
    { id: "blackpit", name: "城郊黑坑塘", description: "钓友密集的竞技钓场", image: "./assets/scenery/spot_04_blackpit.webp", x: 58, y: 47 },
    { id: "reed", name: "芦苇湖汊钓位", description: "芦苇环绕的浅湾钓位", image: "./assets/scenery/spot_05_reed.webp", x: 50, y: 52 }
  ];
  const FALLBACK_CONFIG = {
    version: "0.2.0",
    description:
      "台钓网页游戏基础出鱼概率。每个饵料×钓层组合内的鱼种概率合计为100%。",
    notes: [
      "这是游戏平衡参数，不代表自然水域的科学统计概率。",
      "实际等待时间还会乘以饵料 bite_delay_multiplier。",
      "过底在鱼种概率上按钓底计算，但浮漂显示5目。",
    ],
    rod_lengths_m: [3.6, 4.5, 6.3, 7.2],
    max_cast_rule: "鱼竿长度×2；最大为7.2m×2=14.4m",
    layers: {
      bottom: { name: "钓底", rule: "距底≤10cm或过底" },
      off_bottom: { name: "离底", rule: "距底10–45cm" },
      mid: { name: "中层", rule: "钩饵深度约0.7–1.95m" },
      upper: { name: "上层", rule: "钩饵深度≤0.7m" },
    },
    fishes: [
      { key: "crucian_carp", name: "鲫鱼" },
      { key: "common_carp", name: "鲤鱼" },
      { key: "wuchang_bream", name: "鳊鱼" },
      { key: "silver_carp", name: "鲢鱼" },
      { key: "bighead_carp", name: "鳙鱼" },
      { key: "grass_carp", name: "草鱼" },
      { key: "tilapia", name: "罗非鱼" },
      { key: "topmouth_culter", name: "翘嘴" },
      { key: "black_carp", name: "青鱼" },
    ],
    baits: {
      worm: {
        name: "蚯蚓",
        description: "底层通用，鲫鱼和鲤鱼概率较高",
        bite_delay_multiplier: 1.0,
        probabilities: {
          bottom: {
            crucian_carp: 40.0,
            common_carp: 25.0,
            wuchang_bream: 8.0,
            silver_carp: 1.0,
            bighead_carp: 1.0,
            grass_carp: 5.0,
            tilapia: 12.0,
            topmouth_culter: 3.0,
            black_carp: 5.0,
          },
          off_bottom: {
            crucian_carp: 32.0,
            common_carp: 18.0,
            wuchang_bream: 15.0,
            silver_carp: 3.0,
            bighead_carp: 2.0,
            grass_carp: 8.0,
            tilapia: 12.0,
            topmouth_culter: 8.0,
            black_carp: 2.0,
          },
          mid: {
            crucian_carp: 12.0,
            common_carp: 8.0,
            wuchang_bream: 20.0,
            silver_carp: 10.0,
            bighead_carp: 8.0,
            grass_carp: 8.0,
            tilapia: 10.0,
            topmouth_culter: 22.0,
            black_carp: 2.0,
          },
          upper: {
            crucian_carp: 5.0,
            common_carp: 3.0,
            wuchang_bream: 12.0,
            silver_carp: 15.0,
            bighead_carp: 12.0,
            grass_carp: 5.0,
            tilapia: 8.0,
            topmouth_culter: 38.0,
            black_carp: 2.0,
          },
        },
      },
      foam: {
        name: "泡泡球",
        description: "耐泡，鲫鲤鳊综合型",
        bite_delay_multiplier: 0.94,
        probabilities: {
          bottom: {
            crucian_carp: 35.0,
            common_carp: 30.0,
            wuchang_bream: 10.0,
            silver_carp: 1.0,
            bighead_carp: 1.0,
            grass_carp: 5.0,
            tilapia: 10.0,
            topmouth_culter: 3.0,
            black_carp: 5.0,
          },
          off_bottom: {
            crucian_carp: 30.0,
            common_carp: 22.0,
            wuchang_bream: 16.0,
            silver_carp: 3.0,
            bighead_carp: 2.0,
            grass_carp: 8.0,
            tilapia: 10.0,
            topmouth_culter: 7.0,
            black_carp: 2.0,
          },
          mid: {
            crucian_carp: 12.0,
            common_carp: 10.0,
            wuchang_bream: 24.0,
            silver_carp: 10.0,
            bighead_carp: 8.0,
            grass_carp: 8.0,
            tilapia: 8.0,
            topmouth_culter: 18.0,
            black_carp: 2.0,
          },
          upper: {
            crucian_carp: 5.0,
            common_carp: 4.0,
            wuchang_bream: 15.0,
            silver_carp: 17.0,
            bighead_carp: 14.0,
            grass_carp: 4.0,
            tilapia: 7.0,
            topmouth_culter: 32.0,
            black_carp: 2.0,
          },
        },
      },
      corn: {
        name: "玉米",
        description: "偏鲤鱼、草鱼；鲢鳙概率很低",
        bite_delay_multiplier: 0.84,
        probabilities: {
          bottom: {
            crucian_carp: 18.0,
            common_carp: 32.0,
            wuchang_bream: 10.0,
            silver_carp: 1.0,
            bighead_carp: 1.0,
            grass_carp: 22.0,
            tilapia: 3.0,
            topmouth_culter: 2.0,
            black_carp: 11.0,
          },
          off_bottom: {
            crucian_carp: 14.0,
            common_carp: 25.0,
            wuchang_bream: 18.0,
            silver_carp: 1.0,
            bighead_carp: 1.0,
            grass_carp: 27.0,
            tilapia: 3.0,
            topmouth_culter: 7.0,
            black_carp: 4.0,
          },
          mid: {
            crucian_carp: 8.0,
            common_carp: 12.0,
            wuchang_bream: 20.0,
            silver_carp: 3.0,
            bighead_carp: 2.0,
            grass_carp: 25.0,
            tilapia: 3.0,
            topmouth_culter: 24.0,
            black_carp: 3.0,
          },
          upper: {
            crucian_carp: 4.0,
            common_carp: 6.0,
            wuchang_bream: 15.0,
            silver_carp: 5.0,
            bighead_carp: 3.0,
            grass_carp: 13.0,
            tilapia: 2.0,
            topmouth_culter: 50.0,
            black_carp: 2.0,
          },
        },
      },
      tilapia_frozen: {
        name: "罗非冻饵",
        description: "明显提高罗非鱼概率",
        bite_delay_multiplier: 1.1,
        probabilities: {
          bottom: {
            crucian_carp: 18.0,
            common_carp: 8.0,
            wuchang_bream: 5.0,
            silver_carp: 1.0,
            bighead_carp: 1.0,
            grass_carp: 2.0,
            tilapia: 58.0,
            topmouth_culter: 5.0,
            black_carp: 2.0,
          },
          off_bottom: {
            crucian_carp: 15.0,
            common_carp: 7.0,
            wuchang_bream: 8.0,
            silver_carp: 2.0,
            bighead_carp: 1.0,
            grass_carp: 3.0,
            tilapia: 52.0,
            topmouth_culter: 11.0,
            black_carp: 1.0,
          },
          mid: {
            crucian_carp: 8.0,
            common_carp: 5.0,
            wuchang_bream: 12.0,
            silver_carp: 6.0,
            bighead_carp: 4.0,
            grass_carp: 4.0,
            tilapia: 40.0,
            topmouth_culter: 20.0,
            black_carp: 1.0,
          },
          upper: {
            crucian_carp: 4.0,
            common_carp: 3.0,
            wuchang_bream: 8.0,
            silver_carp: 8.0,
            bighead_carp: 5.0,
            grass_carp: 2.0,
            tilapia: 30.0,
            topmouth_culter: 39.0,
            black_carp: 1.0,
          },
        },
      },
      black_carp_pellet: {
        name: "青鱼颗粒",
        description: "明显提高青鱼和草鱼概率",
        bite_delay_multiplier: 0.8,
        probabilities: {
          bottom: {
            crucian_carp: 6.0,
            common_carp: 18.0,
            wuchang_bream: 5.0,
            silver_carp: 1.0,
            bighead_carp: 1.0,
            grass_carp: 28.0,
            tilapia: 2.0,
            topmouth_culter: 1.0,
            black_carp: 38.0,
          },
          off_bottom: {
            crucian_carp: 5.0,
            common_carp: 15.0,
            wuchang_bream: 8.0,
            silver_carp: 2.0,
            bighead_carp: 1.0,
            grass_carp: 34.0,
            tilapia: 2.0,
            topmouth_culter: 4.0,
            black_carp: 29.0,
          },
          mid: {
            crucian_carp: 4.0,
            common_carp: 8.0,
            wuchang_bream: 12.0,
            silver_carp: 5.0,
            bighead_carp: 3.0,
            grass_carp: 35.0,
            tilapia: 2.0,
            topmouth_culter: 22.0,
            black_carp: 9.0,
          },
          upper: {
            crucian_carp: 2.0,
            common_carp: 4.0,
            wuchang_bream: 8.0,
            silver_carp: 8.0,
            bighead_carp: 5.0,
            grass_carp: 20.0,
            tilapia: 1.0,
            topmouth_culter: 47.0,
            black_carp: 5.0,
          },
        },
      },
      powder: {
        name: "粉饵",
        description: "中上层显著提高鲢鱼、鳙鱼概率",
        bite_delay_multiplier: 1.18,
        probabilities: {
          bottom: {
            crucian_carp: 10.0,
            common_carp: 8.0,
            wuchang_bream: 6.0,
            silver_carp: 20.0,
            bighead_carp: 18.0,
            grass_carp: 4.0,
            tilapia: 5.0,
            topmouth_culter: 24.0,
            black_carp: 5.0,
          },
          off_bottom: {
            crucian_carp: 8.0,
            common_carp: 6.0,
            wuchang_bream: 10.0,
            silver_carp: 28.0,
            bighead_carp: 25.0,
            grass_carp: 5.0,
            tilapia: 4.0,
            topmouth_culter: 12.0,
            black_carp: 2.0,
          },
          mid: {
            crucian_carp: 4.0,
            common_carp: 3.0,
            wuchang_bream: 10.0,
            silver_carp: 34.0,
            bighead_carp: 32.0,
            grass_carp: 3.0,
            tilapia: 2.0,
            topmouth_culter: 11.0,
            black_carp: 1.0,
          },
          upper: {
            crucian_carp: 2.0,
            common_carp: 2.0,
            wuchang_bream: 8.0,
            silver_carp: 36.0,
            bighead_carp: 34.0,
            grass_carp: 2.0,
            tilapia: 2.0,
            topmouth_culter: 13.0,
            black_carp: 1.0,
          },
        },
      },
      mixed: {
        name: "混养饵料",
        description: "适用面广，概率较均衡",
        bite_delay_multiplier: 1.0,
        probabilities: {
          bottom: {
            crucian_carp: 26.0,
            common_carp: 24.0,
            wuchang_bream: 10.0,
            silver_carp: 4.0,
            bighead_carp: 3.0,
            grass_carp: 12.0,
            tilapia: 8.0,
            topmouth_culter: 5.0,
            black_carp: 8.0,
          },
          off_bottom: {
            crucian_carp: 22.0,
            common_carp: 18.0,
            wuchang_bream: 15.0,
            silver_carp: 8.0,
            bighead_carp: 6.0,
            grass_carp: 14.0,
            tilapia: 7.0,
            topmouth_culter: 8.0,
            black_carp: 2.0,
          },
          mid: {
            crucian_carp: 10.0,
            common_carp: 8.0,
            wuchang_bream: 18.0,
            silver_carp: 17.0,
            bighead_carp: 14.0,
            grass_carp: 10.0,
            tilapia: 6.0,
            topmouth_culter: 15.0,
            black_carp: 2.0,
          },
          upper: {
            crucian_carp: 5.0,
            common_carp: 4.0,
            wuchang_bream: 13.0,
            silver_carp: 22.0,
            bighead_carp: 18.0,
            grass_carp: 7.0,
            tilapia: 5.0,
            topmouth_culter: 24.0,
            black_carp: 2.0,
          },
        },
      },
    },
  };
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
    RESULT: "RESULT",
  });
  const BITE_PATTERN_CONFIG = {
    顿口: { start: 520, end: 1450 },
    连续顿口: { start: 480, end: 1500 },
    黑漂: { start: 620, end: 1450 },
    顿后黑漂: { start: 700, end: 1600 },
    缓沉: { start: 760, end: 1700 },
    上顶: { start: 580, end: 1600 },
    横移: { start: 650, end: 1780 },
  };
  const FISH_PROFILES = {
    鲫鱼: {
      key: "crucian_carp",
      minKg: 0.12,
      maxKg: 0.95,
      minCm: 14,
      maxCm: 34,
      power: 0.7,
      sizeBias: 1.95,
      bites: ["顿口", "顿口", "连续顿口", "上顶"],
      image: "./assets/fish/crucian_carp.webp",
      note: "底层巡游觅食，典型细碎口。",
    },
    鲤鱼: {
      key: "common_carp",
      minKg: 1,
      maxKg: 6.2,
      minCm: 36,
      maxCm: 78,
      power: 1.3,
      sizeBias: 1.55,
      bites: ["顿口", "黑漂", "顿后黑漂"],
      image: "./assets/fish/common_carp.webp",
      note: "贴底觅食，常由试探转为闷漂。",
    },
    鳊鱼: {
      key: "wuchang_bream",
      minKg: 0.4,
      maxKg: 1.8,
      minCm: 26,
      maxCm: 48,
      power: 0.95,
      sizeBias: 1.55,
      bites: ["上顶", "顿口", "横移"],
      image: "./assets/fish/wuchang_bream.webp",
      note: "中下层成群活动，上顶和横移较常见。",
    },
    鲢鱼: {
      key: "silver_carp",
      minKg: 1.5,
      maxKg: 5.8,
      minCm: 44,
      maxCm: 78,
      power: 1.12,
      sizeBias: 1.35,
      bites: ["缓沉", "缓沉", "连续顿口"],
      image: "./assets/fish/silver_carp.webp",
      note: "中上层追逐雾化区，吃口偏缓沉。",
    },
    鳙鱼: {
      key: "bighead_carp",
      minKg: 2,
      maxKg: 7.8,
      minCm: 48,
      maxCm: 90,
      power: 1.22,
      sizeBias: 1.3,
      bites: ["缓沉", "顿后黑漂", "缓沉"],
      image: "./assets/fish/bighead_carp.webp",
      note: "中上层大体型鱼，漂相更沉稳。",
    },
    草鱼: {
      key: "grass_carp",
      minKg: 1.8,
      maxKg: 7.5,
      minCm: 48,
      maxCm: 92,
      power: 1.4,
      sizeBias: 1.35,
      bites: ["横移", "顿后黑漂", "黑漂"],
      image: "./assets/fish/grass_carp.webp",
      note: "大个体发力直，横向走漂明显。",
    },
    罗非鱼: {
      key: "tilapia",
      minKg: 0.28,
      maxKg: 1.55,
      minCm: 20,
      maxCm: 43,
      power: 0.88,
      sizeBias: 1.65,
      bites: ["连续顿口", "连续顿口", "顿口"],
      image: "./assets/fish/tilapia.webp",
      note: "抢口快，常连续试探后吞钩。",
    },
    翘嘴: {
      key: "topmouth_culter",
      minKg: 0.35,
      maxKg: 3.8,
      minCm: 24,
      maxCm: 68,
      power: 1.05,
      sizeBias: 1.45,
      bites: ["横移", "横移", "顿口"],
      image: "./assets/fish/topmouth_culter.webp",
      note: "中上层掠食性鱼，漂相常有走漂。",
    },
    青鱼: {
      key: "black_carp",
      minKg: 3.2,
      maxKg: 18,
      minCm: 58,
      maxCm: 122,
      power: 1.72,
      sizeBias: 1.22,
      bites: ["黑漂", "顿后黑漂", "黑漂"],
      image: "./assets/fish/black_carp.webp",
      note: "典型底层大物，试探后多为沉稳黑漂。",
    },
  };
  const FISH_BY_KEY = Object.fromEntries(
    Object.entries(FISH_PROFILES).map(([name, p]) => [
      p.key,
      { name, profile: p },
    ]),
  );
  const BAIT_COLORS = {
    worm: [0.46, 0.18, 0.08],
    foam: [0.88, 0.82, 0.64],
    corn: [0.96, 0.67, 0.12],
    tilapia_frozen: [0.78, 0.28, 0.3],
    black_carp_pellet: [0.25, 0.18, 0.08],
    powder: [0.86, 0.8, 0.6],
    mixed: [0.47, 0.29, 0.15],
  };
  const ui = {};
  let engine,
    scene,
    camera,
    waterMaterial,
    backdrop,
    rodRoot,
    rodMesh,
    rodHandle,
    rodTip,
    rodRings = [],
    lineMesh,
    floatRoot,
    floatMarks = [],
    floatBodyMesh,
    floatStemMesh,
    baitMesh,
    landingMarker;
  let config = FALLBACK_CONFIG,
    gameState = GameState.BOOT,
    fishingDepth = 2.2,
    selectedRodLength = 4.5,
    pendingRodLength = 4.5,
    selectedBaitId = "worm",
    pendingBaitId = "worm",
    castPower = 0,
    charging = false,
    chargeDirection = 1,
    chargeAnimationId = null,
    castDistance = 0,
    floatBasePosition = null,
    biteTimeout = null,
    biteStartAt = 0,
    biteWindowStart = 650,
    biteWindowEnd = 1500,
    bitePattern = "顿口",
    hookedFish = null,
    tension = 36,
    fishStamina = 100,
    fishDistance = 7,
    fishPullPhase = 0,
    toastTimer = null,
    moveDirection = { forward: false, back: false, left: false, right: false },
    exhaustionHintShown = false,
    castPoseT = 0,
    currentSpotId = "qingzhu",
    playerOffsetX = 0,
    playerOffsetZ = 0,
    moveHoldTimer = null,
    sessionStartedAt = Date.now(),
    fishKeeper = [],
    keeperTimerId = null;
  function cacheUI() {
    [
      "game-shell",
      "render-canvas",
      "loading-screen",
      "loading-progress",
      "game-state-label",
      "distance-label",
      "rod-length-label",
      "fishing-depth-label",
      "depth-state-label",
      "bait-label",
      "max-cast-label",
      "monitor-float",
      "bite-hint",
      "focus-float-button",
      "primary-action",
      "spot-button",
      "spot-name-label",
      "fish-keeper-button",
      "rig-button",
      "bait-button",
      "retrieve-button",
      "test-bite-button",
      "cast-hud",
      "cast-power-label",
      "cast-power-bar",
      "cast-distance-preview",
      "cast-rule-hint",
      "fight-hud",
      "tension-label",
      "tension-bar",
      "stamina-label",
      "stamina-bar",
      "fish-distance-label",
      "fight-guidance",
      "net-button",
      "rig-dialog",
      "depth-range",
      "dialog-depth-label",
      "dialog-depth-state",
      "diagram-hook",
      "diagram-float",
      "save-rig-button",
      "dialog-rod-summary",
      "bait-dialog",
      "bait-grid",
      "save-bait-button",
      "fish-keeper-dialog",
      "keeper-total-weight",
      "keeper-total-count",
      "keeper-heaviest",
      "keeper-duration",
      "keeper-table-body",
      "spot-dialog",
      "spot-grid",
      "result-dialog",
      "catch-title",
      "catch-detail",
      "timing-result",
      "result-bait",
      "result-layer",
      "catch-summary",
      "catch-image",
      "continue-button",
      "toast",
      "result-pattern",
      "result-method",
      "result-note",
      "result-grade-badge",
      "result-method-badge",
      "result-pattern-badge",
    ].forEach((id) => (ui[id] = document.getElementById(id)));
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)),
    rnd = (a, b) => a + Math.random() * (b - a),
    pick = (a) => a[Math.floor(Math.random() * a.length)];
  function setLoading(p, t) {
    ui["loading-progress"].style.width = `${clamp(p, 5, 100)}%`;
    const e = ui["loading-screen"].querySelector("p");
    if (e && t) e.textContent = t;
  }
  async function loadConfig() {
    try {
      const r = await fetch(PROBABILITY_FILE, { cache: "no-store" });
      if (!r.ok) throw Error(`HTTP ${r.status}`);
      config = await r.json();
    } catch (e) {
      console.warn("概率文件读取失败，使用内置数据", e);
      config = FALLBACK_CONFIG;
    }
  }
  function getBait() {
    return config.baits[selectedBaitId] || config.baits.worm;
  }
  function getMaxCast() {
    return selectedRodLength * 2;
  }
  function getPreviewMaxCast() {
    return pendingRodLength * 2;
  }

  function getSpot() {
    return SPOTS.find((spot) => spot.id === currentSpotId) || SPOTS[0];
  }
  function applySpotView() {
    const spot = getSpot();
    const x = clamp(spot.x + playerOffsetX * 7, 34, 76);
    const y = clamp(spot.y + playerOffsetZ * 6, 40, 62);
    ui["game-shell"].style.backgroundImage = `url("${spot.image}")`;
    ui["game-shell"].style.backgroundPosition = `${x}% ${y}%`;
    ui["spot-name-label"].textContent = spot.name;
  }
  function buildSpotGrid() {
    ui["spot-grid"].innerHTML = "";
    SPOTS.forEach((spot) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "spot-option";
      button.dataset.spotId = spot.id;
      button.innerHTML = `<img src="${spot.image}" alt="${spot.name}"><span class="spot-option-info"><strong>${spot.name}</strong><span>${spot.description}</span></span>`;
      button.onclick = () => selectSpot(spot.id);
      ui["spot-grid"].appendChild(button);
    });
    refreshSpotSelection();
  }
  function refreshSpotSelection() {
    ui["spot-grid"].querySelectorAll(".spot-option").forEach((button) => {
      button.classList.toggle("selected", button.dataset.spotId === currentSpotId);
    });
  }
  function selectSpot(id) {
    if (gameState !== GameState.READY) {
      toast("请先收竿，再更换钓场。", 1500);
      return;
    }
    const spot = SPOTS.find((item) => item.id === id);
    if (!spot) return;
    currentSpotId = id;
    playerOffsetX = 0;
    playerOffsetZ = 0;
    if (camera) {
      camera.position.x = 0;
      camera.position.z = -1.0;
    }
    applySpotView();
    refreshSpotSelection();
    closeDialog(ui["spot-dialog"]);
    toast(`已来到${spot.name}。`, 1800);
  }
  function formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const sec = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }
  function keeperSummary() {
    const species = new Map();
    let totalWeight = 0;
    let heaviest = null;
    fishKeeper.forEach((fish) => {
      totalWeight += fish.weight;
      if (!heaviest || fish.weight > heaviest.weight) heaviest = fish;
      const row = species.get(fish.species) || { species: fish.species, count: 0, weight: 0, heaviest: 0 };
      row.count += 1;
      row.weight += fish.weight;
      row.heaviest = Math.max(row.heaviest, fish.weight);
      species.set(fish.species, row);
    });
    return { totalWeight, totalCount: fishKeeper.length, heaviest, rows: [...species.values()].sort((a, b) => b.weight - a.weight) };
  }
  function refreshFishKeeper() {
    const summary = keeperSummary();
    ui["keeper-total-weight"].textContent = `${summary.totalWeight.toFixed(2)} kg`;
    ui["keeper-total-count"].textContent = `${summary.totalCount} 尾`;
    ui["keeper-heaviest"].textContent = summary.heaviest ? `${summary.heaviest.species} ${summary.heaviest.weight.toFixed(2)} kg` : "暂无";
    ui["keeper-duration"].textContent = formatDuration(Date.now() - sessionStartedAt);
    if (!summary.rows.length) {
      ui["keeper-table-body"].innerHTML = '<tr class="keeper-empty"><td colspan="4">鱼护还是空的</td></tr>';
      return;
    }
    ui["keeper-table-body"].innerHTML = summary.rows.map((row) => `<tr><td>${row.species}</td><td>${row.count} 尾</td><td>${row.weight.toFixed(2)} kg</td><td>${row.heaviest.toFixed(2)} kg</td></tr>`).join("");
  }
  function openFishKeeper() {
    if (gameState !== GameState.READY) {
      toast("请先收竿，再查看鱼护。", 1500);
      return;
    }
    refreshFishKeeper();
    clearInterval(keeperTimerId);
    keeperTimerId = setInterval(refreshFishKeeper, 1000);
    openDialog(ui["fish-keeper-dialog"]);
  }
  function closeFishKeeper() {
    clearInterval(keeperTimerId);
    keeperTimerId = null;
    closeDialog(ui["fish-keeper-dialog"]);
  }
  function recordCatch(fish) {
    fishKeeper.push({ species: fish.species, weight: fish.weight, length: fish.length, caughtAt: Date.now(), spotId: currentSpotId });
    refreshFishKeeper();
  }
  function movePlayer(direction) {
    if (gameState !== GameState.READY) {
      toast("先收竿，才能移动钓位。", 1300);
      return false;
    }
    const beforeX = playerOffsetX;
    const beforeZ = playerOffsetZ;
    if (direction === "left") playerOffsetX -= 0.10;
    if (direction === "right") playerOffsetX += 0.10;
    if (direction === "forward") playerOffsetZ += 0.08;
    if (direction === "back") playerOffsetZ -= 0.08;
    playerOffsetX = clamp(playerOffsetX, -0.62, 0.62);
    playerOffsetZ = clamp(playerOffsetZ, -0.30, 0.22);
    if (camera) {
      camera.position.x = playerOffsetX * 0.34;
      camera.position.z = -1.0 + playerOffsetZ * 0.25;
    }
    applySpotView();
    return beforeX !== playerOffsetX || beforeZ !== playerOffsetZ;
  }
  function stopMove(button) {
    clearInterval(moveHoldTimer);
    moveHoldTimer = null;
    if (button) button.classList.remove("active");
  }
  function setState(s, label) {
    gameState = s;
    ui["game-shell"].dataset.state = s;
    const m = {
      [GameState.BOOT]: "加载中",
      [GameState.READY]: "准备钓鱼",
      [GameState.RIG_SETUP]: "调整线组",
      [GameState.CAST_AIM]: "按住抛竿蓄力",
      [GameState.CAST_FLIGHT]: "鱼竿与线组抛投中",
      [GameState.FLOAT_SETTLE]: "浮漂翻身到位",
      [GameState.WAIT_BITE]: "等待鱼口",
      [GameState.BITE]: "出现漂相",
      [GameState.FIGHT]: "中鱼 · 遛鱼",
      [GameState.NET_READY]: "鱼已靠岸",
      [GameState.RESULT]: "渔获结果",
    };
    ui["game-state-label"].textContent = label || m[s] || s;
    updateAvailability();
  }
  function updateAvailability() {
    const p = ui["primary-action"],
      can = [GameState.READY, GameState.WAIT_BITE].includes(gameState);
    ui["spot-button"].disabled = gameState !== GameState.READY;
    ui["fish-keeper-button"].disabled = gameState !== GameState.READY;
    ui["rig-button"].disabled = !can;
    ui["bait-button"].disabled = !can;
    ui["retrieve-button"].disabled = [
      GameState.BOOT,
      GameState.READY,
      GameState.RESULT,
    ].includes(gameState);
    ui["test-bite-button"].disabled = gameState !== GameState.WAIT_BITE;
    if (gameState === GameState.READY) {
      p.textContent = "抛竿";
      p.disabled = false;
    } else if (gameState === GameState.CAST_AIM) {
      p.textContent = "松开抛竿";
      p.disabled = false;
    } else if ([GameState.WAIT_BITE, GameState.BITE].includes(gameState)) {
      p.textContent = "提竿";
      p.disabled = false;
    } else if ([GameState.FIGHT, GameState.NET_READY].includes(gameState)) {
      const d = hookedFish && hookedFish.weight <= DIRECT_LIFT_MAX_KG;
      p.textContent =
        gameState === GameState.NET_READY
          ? d
            ? "提鱼上岸"
            : "抄鱼"
          : "遛鱼中";
      p.disabled = gameState !== GameState.NET_READY;
    } else {
      p.textContent = "处理中";
      p.disabled = true;
    }
    ui["cast-hud"].classList.toggle("hidden", gameState !== GameState.CAST_AIM);
    ui["fight-hud"].classList.toggle(
      "hidden",
      ![GameState.FIGHT, GameState.NET_READY].includes(gameState),
    );
  }
  function hideToastImmediate() {
    clearTimeout(toastTimer);
    if (!ui.toast) return;
    ui.toast.classList.remove("visible");
    ui.toast.textContent = "";
    ui.toast.style.opacity = "0";
    requestAnimationFrame(() => { ui.toast.style.opacity = ""; });
  }
  function toast(t, d = 2200) {
    clearTimeout(toastTimer);
    ui.toast.style.opacity = "";
    ui.toast.textContent = t;
    ui.toast.classList.add("visible");
    toastTimer = setTimeout(() => ui.toast.classList.remove("visible"), d);
  }
  function openDialog(d) {
    hideToastImmediate();
    d.classList.add("visible");
    if (camera) camera.detachControl();
  }
  function closeDialog(d) {
    d.classList.remove("visible");
    if (camera) camera.attachControl(ui["render-canvas"], true);
  }
  function getDepthState(depth = fishingDepth) {
    const gap = WATER_DEPTH - depth;
    if (depth > WATER_DEPTH + 0.03)
      return { text: "过底", kind: "bottom", layerKey: "bottom", marks: 5 };
    if (gap <= 0.1)
      return { text: "钓底", kind: "bottom", layerKey: "bottom", marks: 4 };
    if (gap <= 0.45)
      return {
        text: `离底 ${Math.round(gap * 100)} cm`,
        kind: "off_bottom",
        layerKey: "off_bottom",
        marks: 4,
      };
    if (depth <= 0.7)
      return { text: "上层", kind: "upper", layerKey: "upper", marks: 4 };
    return { text: "中层", kind: "mid", layerKey: "mid", marks: 4 };
  }
  function applyFloatMarks(m) {
    ui["monitor-float"].classList.toggle("marks-5", m === 5);
    ui["monitor-float"].classList.toggle("marks-4", m !== 5);
    ui["diagram-float"].classList.toggle("marks-5", m === 5);
    ui["bite-hint"].textContent = m === 5 ? "过底露出5目" : "正常露出4目";
    if (floatMarks.length) {
      const firstVisible = Math.max(0, floatMarks.length - m);
      floatMarks.forEach((mark, index) => mark.setEnabled(index >= firstVisible));
    }
    if (floatBodyMesh) floatBodyMesh.setEnabled(false);
    if (floatStemMesh) floatStemMesh.setEnabled(false);
  }
  function updateDepthUI(depth = fishingDepth, main = true) {
    const s = getDepthState(depth);
    if (main) {
      ui["fishing-depth-label"].textContent = `${depth.toFixed(2)} m`;
      ui["depth-state-label"].textContent = s.text;
      applyFloatMarks(s.marks);
    }
    ui["dialog-depth-label"].textContent = `${depth.toFixed(2)} m`;
    ui["dialog-depth-state"].textContent = s.text;
    ui["diagram-hook"].style.top =
      `${clamp(13 + (depth / WATER_DEPTH) * 70, 15, 88)}%`;
    ui["diagram-float"].classList.toggle("marks-5", s.marks === 5);
  }
  function updateRodUI() {
    ui["rod-length-label"].textContent = `${selectedRodLength.toFixed(1)} m`;
    ui["max-cast-label"].textContent = `${getMaxCast().toFixed(1)} m`;
    ui["cast-rule-hint"].textContent =
      `当前${selectedRodLength.toFixed(1)}米竿，最远落点${getMaxCast().toFixed(1)}米。`;
  }
  function refreshRodSelection() {
    document
      .querySelectorAll("[data-rod-length]")
      .forEach((b) =>
        b.classList.toggle(
          "selected",
          Number(b.dataset.rodLength) === pendingRodLength,
        ),
      );
    ui["dialog-rod-summary"].textContent =
      `${pendingRodLength.toFixed(1)} m · 最远${getPreviewMaxCast().toFixed(1)} m`;
  }
  function buildBaitGrid() {
    ui["bait-grid"].innerHTML = "";
    Object.entries(config.baits).forEach(([id, b]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bait-option";
      btn.dataset.baitId = id;
      const p = b.probabilities[getDepthState().layerKey],
        top = Object.entries(p)
          .sort((a, c) => c[1] - a[1])
          .slice(0, 2)
          .map(([k, v]) => `${FISH_BY_KEY[k].name}${v.toFixed(1)}%`)
          .join("、");
      btn.innerHTML = `<strong>${b.name}</strong><span>${b.description}</span><span>当前钓层偏向：${top}</span><span>等待倍率：${b.bite_delay_multiplier}</span><em>选择</em>`;
      btn.onclick = () => {
        pendingBaitId = id;
        refreshBaitSelection();
      };
      ui["bait-grid"].appendChild(btn);
    });
    refreshBaitSelection();
  }
  function refreshBaitSelection() {
    ui["bait-grid"]
      .querySelectorAll(".bait-option")
      .forEach((b) =>
        b.classList.toggle("selected", b.dataset.baitId === pendingBaitId),
      );
  }
  function mat(n, c, s = 0.1) {
    const m = new BABYLON.StandardMaterial(n, scene);
    m.diffuseColor = new BABYLON.Color3(...c);
    m.specularColor = new BABYLON.Color3(s, s, s);
    return m;
  }
  function createScene() {
    const c = ui["render-canvas"];
    engine = new BABYLON.Engine(
      c,
      true,
      { preserveDrawingBuffer: true, stencil: true, alpha: true },
      true,
    );
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    scene.autoClear = true;
    camera = new BABYLON.UniversalCamera(
      "player",
      new BABYLON.Vector3(0, 1.58, -1.0),
      scene,
    );
    camera.setTarget(new BABYLON.Vector3(0, 0.18, 10.5));
    camera.fov = 0.88;
    camera.minZ = 0.08;
    camera.maxZ = 120;
    camera.speed = 0.16;
    camera.angularSensibility = 4000;
    camera.inertia = 0.72;
    camera.keysUp = [87];
    camera.keysDown = [83];
    camera.keysLeft = [65];
    camera.keysRight = [68];
    camera.attachControl(c, true);
    const h = new BABYLON.HemisphericLight(
      "sky",
      new BABYLON.Vector3(0.2, 1, -0.2),
      scene,
    );
    h.intensity = 1.15;
    createRod();
    createFloatRig();
    createLandingMarker();
    scene.onBeforeRenderObservable.add(updateFrame);
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
  }
  function rodPath(bend = 0) {
    const n = 32,
      L = selectedRodLength * ROD_WORLD_SCALE,
      p = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        z = 0.2 + t * L,
        y = 0.025 * t - bend * 0.26 * t * t,
        x = -bend * 0.035 * t * t;
      p.push(new BABYLON.Vector3(x, y, z));
    }
    return p;
  }
  function rodRadius(index, count) {
    const t = index / Math.max(1, count - 1);
    return 0.018 - 0.0105 * t;
  }
  function createRod() {
    if (rodRoot) rodRoot.dispose();
    rodRoot = new BABYLON.TransformNode("rodRoot", scene);
    rodRoot.parent = camera;
    rodRoot.position = new BABYLON.Vector3(0.48, -0.45, 0.62);
    rodRoot.rotation = new BABYLON.Vector3(-0.16, -0.30, -0.04);
    rodHandle = BABYLON.MeshBuilder.CreateCylinder(
      "rodHandle",
      { height: 0.36, diameter: 0.042, tessellation: 18 },
      scene,
    );
    rodHandle.parent = rodRoot;
    rodHandle.rotation.x = Math.PI / 2;
    rodHandle.position.z = 0.11;
    rodHandle.material = mat("handleMat", [0.11, 0.075, 0.045], 0.25);
    rodTip = new BABYLON.TransformNode("rodTip", scene);
    rodTip.parent = rodRoot;
    const path = rodPath(0);
    rodMesh = BABYLON.MeshBuilder.CreateTube(
      "wholeRod",
      {
        path,
        radiusFunction: (i) => rodRadius(i, path.length),
        tessellation: 14,
        cap: BABYLON.Mesh.CAP_ALL,
        updatable: true,
      },
      scene,
    );
    rodMesh.parent = rodRoot;
    rodMesh.material = mat("rodMat", [0.065, 0.13, 0.085], 0.52);
    rodRings = [];
    [0.08, 0.20, 0.36, 0.53, 0.70, 0.86].forEach((t, i) => {
      const r = BABYLON.MeshBuilder.CreateTorus(
        `ring${i}`,
        { diameter: 0.032 - i * 0.0028, thickness: 0.0042, tessellation: 18 },
        scene,
      );
      r.parent = rodRoot;
      r.rotation.x = Math.PI / 2;
      r.material = mat(
        `ringMat${i}`,
        i % 2 ? [0.96, 0.67, 0.18] : [0.82, 0.13, 0.08],
        0.55,
      );
      rodRings.push({ mesh: r, t });
    });
    updateRodGeometry(0);
  }
  function updateRodGeometry(bend) {
    if (!rodMesh) return;
    const p = rodPath(bend);
    BABYLON.MeshBuilder.CreateTube(
      "wholeRod",
      {
        path: p,
        instance: rodMesh,
        radiusFunction: (i) => rodRadius(i, p.length),
        tessellation: 14,
        cap: BABYLON.Mesh.CAP_ALL,
      },
      scene,
    );
    const last = p[p.length - 1];
    rodTip.position.copyFrom(last);
    rodRings.forEach((o) => {
      const idx = Math.min(p.length - 2, Math.floor(o.t * (p.length - 1)));
      const a = p[idx];
      const b = p[idx + 1];
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      o.mesh.position.copyFrom(a);
      o.mesh.rotation.x = Math.PI / 2 + Math.atan2(dy, dz);
    });
  }
  function createFloatRig() {
    floatRoot = new BABYLON.TransformNode("floatRoot", scene);
    floatRoot.scaling = new BABYLON.Vector3(0.34, 0.34, 0.34);
    floatMarks = [];
    const colors = [
      [0.95, 0.18, 0.15],
      [0.98, 0.78, 0.2],
      [0.05, 0.05, 0.05],
      [0.25, 0.8, 0.34],
      [0.95, 0.18, 0.15],
      [0.98, 0.78, 0.2],
    ];
    for (let i = 0; i < 6; i++) {
      const m = BABYLON.MeshBuilder.CreateCylinder(
        `mark${i}`,
        { height: 0.07, diameter: 0.03, tessellation: 10 },
        scene,
      );
      m.parent = floatRoot;
      m.position.y = 0.035 + i * 0.07;
      m.material = mat(`markMat${i}`, colors[i], 0.3);
      floatMarks.push(m);
    }
    floatBodyMesh = BABYLON.MeshBuilder.CreateSphere(
      "floatBody",
      { diameter: 0.16, segments: 12 },
      scene,
    );
    floatBodyMesh.parent = floatRoot;
    floatBodyMesh.scaling.y = 1.75;
    floatBodyMesh.position.y = -0.16;
    floatBodyMesh.material = mat("floatBodyMat", [0.9, 0.85, 0.67], 0.25);
    floatStemMesh = BABYLON.MeshBuilder.CreateCylinder(
      "floatStem",
      { height: 0.4, diameter: 0.018, tessellation: 8 },
      scene,
    );
    floatStemMesh.parent = floatRoot;
    floatStemMesh.position.y = -0.48;
    floatStemMesh.material = mat("stemMat", [0.05, 0.05, 0.04]);
    floatRoot.setEnabled(false);
    baitMesh = BABYLON.MeshBuilder.CreateSphere(
      "bait",
      { diameter: 0.075, segments: 10 },
      scene,
    );
    baitMesh.material = mat("baitMat", BAIT_COLORS[selectedBaitId]);
    baitMesh.setEnabled(false);
    updateLine();
  }
  function updateBaitAppearance() {
    if (!baitMesh) return;
    const c = BAIT_COLORS[selectedBaitId] || [0.5, 0.3, 0.15];
    baitMesh.material.diffuseColor = new BABYLON.Color3(...c);
  }
  function createLandingMarker() {
    landingMarker = BABYLON.MeshBuilder.CreateTorus(
      "landingMarker",
      { diameter: 0.78, thickness: 0.025, tessellation: 48 },
      scene,
    );
    landingMarker.rotation.x = Math.PI / 2;
    landingMarker.position.y = 0.025;
    landingMarker.material = mat("markerMat", [0.93, 0.72, 0.24], 0.45);
    landingMarker.setEnabled(false);
  }
  function tipWorld() {
    rodTip.computeWorldMatrix(true);
    return rodTip.getAbsolutePosition().clone();
  }
  function updateLine() {
    if (!scene || !rodTip) return;
    const start = tipWorld(),
      pts = [];
    if (floatRoot && floatRoot.isEnabled()) {
      const end = floatRoot.position.clone(),
        mid = BABYLON.Vector3.Lerp(start, end, 0.5);
      mid.y -= 0.22;
      for (let i = 0; i <= 18; i++) {
        const t = i / 18,
          one = 1 - t;
        pts.push(
          start
            .scale(one * one)
            .add(mid.scale(2 * one * t))
            .add(end.scale(t * t)),
        );
      }
      const leaderEnd =
        gameState === GameState.CAST_FLIGHT && baitMesh && baitMesh.isEnabled()
          ? baitMesh.position.clone()
          : end;
      for (let i = 1; i <= 8; i++)
        pts.push(BABYLON.Vector3.Lerp(end, leaderEnd, i / 8));
    } else {
      for (let i = 0; i < 27; i++)
        pts.push(
          start.add(new BABYLON.Vector3(0, (-0.02 * i) / 27, (0.02 * i) / 27)),
        );
    }
    if (lineMesh)
      BABYLON.MeshBuilder.CreateLines(
        "line",
        { points: pts, instance: lineMesh },
        scene,
      );
    else {
      lineMesh = BABYLON.MeshBuilder.CreateLines(
        "line",
        { points: pts, updatable: true },
        scene,
      );
      lineMesh.color = new BABYLON.Color3(0.88, 0.92, 0.86);
      lineMesh.alpha = 0.78;
      lineMesh.isPickable = false;
    }
  }
  function baseFloatY() {
    return getDepthState().marks === 5 ? 0.012 : 0.008;
  }
  function castRange(power) {
    const max = getMaxCast(),
      min = selectedRodLength * 0.55;
    return min + ((max - min) * clamp(power, 0, 100)) / 100;
  }
  function updateLandingPreview() {
    if (gameState !== GameState.CAST_AIM) return;
    const f = camera.getForwardRay().direction.clone();
    f.y = 0;
    f.normalize();
    const d = castRange(castPower),
      p = camera.position.add(f.scale(d));
    p.y = 0.03;
    p.z = Math.max(0.7, p.z);
    landingMarker.position.copyFrom(p);
    landingMarker.setEnabled(true);
    ui["cast-distance-preview"].textContent = `${d.toFixed(1)} m`;
  }
  function updateFrame() {
    const dt = engine.getDeltaTime() / 1000,
      now = performance.now();
    constrainCamera(dt);
    animateFloat(now);
    const bend = [GameState.FIGHT, GameState.NET_READY].includes(gameState)
      ? clamp(tension / 100, 0, 1)
      : gameState === GameState.CAST_FLIGHT
        ? 0.12 * Math.sin(Math.PI * castPoseT)
        : 0;
    updateRodGeometry(bend);
    updateRodPose();
    updateLine();
    if (gameState === GameState.CAST_AIM) updateLandingPreview();
    if ([GameState.FIGHT, GameState.NET_READY].includes(gameState))
      updateFight(dt);
  }
  function updateRodPose() {
    if (!rodRoot) return;
    const basePosition = new BABYLON.Vector3(0.48, -0.45, 0.62);
    rodRoot.position.copyFrom(basePosition);
    if (gameState === GameState.CAST_AIM) {
      rodRoot.rotation.x = 0.22 + castPower * 0.0014;
      rodRoot.rotation.y = -0.36;
      rodRoot.rotation.z = -0.15;
    } else if (gameState === GameState.CAST_FLIGHT) {
      const t = castPoseT;
      rodRoot.rotation.x =
        t < 0.32
          ? BABYLON.Scalar.Lerp(0.38, -0.72, t / 0.32)
          : BABYLON.Scalar.Lerp(-0.72, -0.12, (t - 0.32) / 0.68);
      rodRoot.rotation.y = BABYLON.Scalar.Lerp(-0.36, -0.08, t);
      rodRoot.rotation.z = -0.12 + 0.10 * Math.sin(Math.PI * t);
    } else if ([GameState.FIGHT, GameState.NET_READY].includes(gameState)) {
      rodRoot.rotation.x = -0.25;
      rodRoot.rotation.y = -0.22;
      rodRoot.rotation.z = -0.12;
    } else {
      rodRoot.rotation.x = -0.16;
      rodRoot.rotation.y = -0.30;
      rodRoot.rotation.z = -0.04;
    }
  }
  function constrainCamera(dt) {
    if (!camera) return;
    if (![GameState.READY, GameState.RIG_SETUP].includes(gameState)) camera.cameraDirection.set(0, 0, 0);
    camera.position.x = clamp(camera.position.x, -0.22, 0.22);
    camera.position.z = clamp(camera.position.z, -1.08, -0.94);
    camera.position.y = 1.65;
  }
  function animateFloat(now) {
    if (!floatRoot || !floatRoot.isEnabled() || !floatBasePosition) return;
    let off = Math.sin(now * 0.0022) * 0.012,
      roll = Math.sin(now * 0.0014) * 0.016;
    if (gameState === GameState.FLOAT_SETTLE)
      off += Math.sin(now * 0.006) * 0.02;
    if (gameState === GameState.BITE) {
      const e = now - biteStartAt;
      off += biteOffset(e, bitePattern);
      if (e > 2200) missBite("鱼已经吐钩，漂相恢复。", false);
    }
    floatRoot.position.x =
      floatBasePosition.x +
      (bitePattern === "横移" && gameState === GameState.BITE
        ? Math.sin((now - biteStartAt) * 0.005) * 0.25
        : 0);
    floatRoot.position.y = floatBasePosition.y + off;
    floatRoot.position.z = floatBasePosition.z;
    floatRoot.rotation.z = roll;
    ui["monitor-float"].style.transform =
      `translateX(-50%) translateY(${Math.round(off * 145)}px) rotate(${roll * 35}deg)`;
  }
  function biteOffset(e, p) {
    if (p === "黑漂") {
      if (e < 480) return Math.sin(e * 0.025) * 0.035;
      return -clamp((e - 480) / 820, 0, 1) * 0.55;
    }
    if (p === "顿后黑漂") {
      if (e < 460) return -Math.max(0, Math.sin(e * 0.028)) * 0.08;
      if (e < 760) return Math.sin(e * 0.018) * 0.015;
      return -clamp((e - 760) / 700, 0, 1) * 0.46;
    }
    if (p === "上顶") {
      if (e < 520) return Math.sin(e * 0.03) * 0.025;
      return clamp((e - 520) / 650, 0, 1) * 0.2;
    }
    if (p === "缓沉")
      return -clamp(e / 1500, 0, 1) * 0.32 + Math.sin(e * 0.018) * 0.018;
    if (p === "横移") return Math.sin(e * 0.022) * 0.045;
    if (p === "连续顿口") return -Math.max(0, Math.sin(e * 0.021)) * 0.15;
    if (e < 520) return Math.sin(e * 0.03) * 0.03;
    if (e < 1150) return -0.17;
    return -0.05;
  }
  function startCharging() {
    if (gameState !== GameState.READY || charging) return;
    charging = true;
    chargeDirection = 1;
    castPower = 8;
    setState(GameState.CAST_AIM);
    ui["primary-action"].classList.add("charging");
    landingMarker.setEnabled(true);
    let prev = performance.now();
    const tick = (now) => {
      if (!charging) return;
      const dt = now - prev;
      prev = now;
      castPower += chargeDirection * dt * 0.06;
      if (castPower >= 100) {
        castPower = 100;
        chargeDirection = -1;
      }
      if (castPower <= 12) {
        castPower = 12;
        chargeDirection = 1;
      }
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
    const f = camera.getForwardRay().direction.clone();
    f.y = 0;
    f.normalize();
    castDistance = castRange(castPower);
    const start = tipWorld(),
      dest = camera.position.add(f.scale(castDistance));
    dest.y = baseFloatY();
    dest.z = Math.max(0.8, dest.z);
    floatRoot.setEnabled(true);
    floatMarks.forEach((mark) => mark.setEnabled(true));
    if (floatBodyMesh) floatBodyMesh.setEnabled(true);
    if (floatStemMesh) floatStemMesh.setEnabled(true);
    baitMesh.setEnabled(true);
    baitMesh.visibility = 1;
    floatRoot.position.copyFrom(start);
    baitMesh.position.copyFrom(start.add(new BABYLON.Vector3(0, -0.08, -0.08)));
    const startAt = performance.now(),
      duration = 900 + castDistance * 36;
    const anim = (now) => {
      const t = clamp((now - startAt) / duration, 0, 1),
        ease = 1 - Math.pow(1 - t, 2),
        current = BABYLON.Vector3.Lerp(start, dest, ease);
      current.y += Math.sin(Math.PI * t) * (1.1 + castDistance * 0.09);
      floatRoot.position.copyFrom(current);
      baitMesh.position.copyFrom(
        current.add(new BABYLON.Vector3(0, -0.1, -0.12)),
      );
      floatRoot.rotation.z = BABYLON.Scalar.Lerp(Math.PI / 2, 0, t);
      castPoseT = t;
      if (t < 1) requestAnimationFrame(anim);
      else settleFloat(dest);
    };
    requestAnimationFrame(anim);
  }
  function settleFloat(dest) {
    setState(GameState.FLOAT_SETTLE);
    castPoseT = 0;
    floatBasePosition = dest.clone();
    floatBasePosition.y = baseFloatY();
    floatRoot.position.copyFrom(floatBasePosition);
    baitMesh.position = new BABYLON.Vector3(
      dest.x,
      -Math.min(fishingDepth, 2.35),
      dest.z,
    );
    baitMesh.visibility = 0;
    ui["distance-label"].textContent = `${castDistance.toFixed(1)} m`;
    applyFloatMarks(getDepthState().marks);
    toast(`落点 ${castDistance.toFixed(1)} 米 · ${getDepthState().text}`);
    setTimeout(() => {
      if (gameState !== GameState.FLOAT_SETTLE) return;
      setState(GameState.WAIT_BITE);
      scheduleBite();
    }, 1500);
  }
  function scheduleBite(delay) {
    clearTimeout(biteTimeout);
    const mult = getBait().bite_delay_multiplier || 1,
      over = getDepthState().text === "过底" ? 1.16 : 1;
    const d = delay ?? rnd((3500 / mult) * over, (8200 / mult) * over);
    biteTimeout = setTimeout(() => {
      if (gameState === GameState.WAIT_BITE) triggerBite();
    }, d);
  }
  function weighted(entries) {
    const total = entries.reduce((s, e) => s + e[1], 0);
    let r = Math.random() * total;
    for (const e of entries) {
      r -= e[1];
      if (r <= 0) return e[0];
    }
    return entries.at(-1)[0];
  }
  function sample(profile, which) {
    const min = which === "kg" ? profile.minKg : profile.minCm,
      max = which === "kg" ? profile.maxKg : profile.maxCm;
    return min + (max - min) * Math.pow(Math.random(), profile.sizeBias);
  }
  function chooseFish() {
    const layer = getDepthState().layerKey,
      p = getBait().probabilities[layer],
      key = weighted(Object.entries(p)),
      f = FISH_BY_KEY[key];
    return {
      species: f.name,
      profile: f.profile,
      weight: sample(f.profile, "kg"),
      length: sample(f.profile, "cm"),
      depthState: getDepthState().text,
      layerKey: layer,
    };
  }
  function triggerBite() {
    if (gameState !== GameState.WAIT_BITE) return;
    hookedFish = chooseFish();
    bitePattern = pick(hookedFish.profile.bites);
    hookedFish.bitePattern = bitePattern;
    const t = BITE_PATTERN_CONFIG[bitePattern] || BITE_PATTERN_CONFIG["顿口"];
    biteWindowStart = t.start;
    biteWindowEnd = t.end;
    biteStartAt = performance.now();
    setState(GameState.BITE, `${bitePattern} · 判断提竿`);
    ui["bite-hint"].textContent = bitePattern;
    toast(`浮漂出现${bitePattern}！`, 1600);
  }
  function attemptHook() {
    if (gameState === GameState.WAIT_BITE) {
      toast("浮漂没有有效动作，空竿。", 1800);
      retrieve(false);
      return;
    }
    if (gameState !== GameState.BITE) return;
    const e = performance.now() - biteStartAt;
    if (e < biteWindowStart) missBite("提竿过早，鱼还没吸稳。", true);
    else if (e > biteWindowEnd) missBite("提竿过晚，鱼已吐钩。", true);
    else startFight(e);
  }
  function missBite(m, back = true) {
    if (![GameState.BITE, GameState.WAIT_BITE].includes(gameState)) return;
    clearTimeout(biteTimeout);
    toast(m, 2200);
    if (back) setTimeout(() => retrieve(false), 800);
    else {
      setState(GameState.WAIT_BITE);
      applyFloatMarks(getDepthState().marks);
      scheduleBite(rnd(3000, 6500));
    }
  }
  function startFight(e) {
    clearTimeout(biteTimeout);
    tension = clamp(
      22 + hookedFish.profile.power * 13 + hookedFish.weight * 2.1,
      24,
      92,
    );
    fishStamina = clamp(
      58 + hookedFish.profile.power * 18 + hookedFish.weight * 3.6,
      55,
      100,
    );
    fishDistance = castDistance;
    fishPullPhase = Math.random() * Math.PI * 2;
    exhaustionHintShown = false;
    hookedFish.hookElapsed = e;
    setState(GameState.FIGHT, `中鱼 · ${hookedFish.species}`);
    updateFightUI();
    toast(`${hookedFish.species}中钩！控制张力并带近岸边。`, 2300);
  }
  function landingRule() {
    const d = !!(hookedFish && hookedFish.weight <= DIRECT_LIFT_MAX_KG);
    return {
      directLift: d,
      distance: d ? DIRECT_LIFT_DISTANCE : NET_DISTANCE,
      action: d ? "提鱼上岸" : "使用抄网",
    };
  }
  function readyToLand() {
    if (!hookedFish || gameState !== GameState.FIGHT) return false;
    const r = landingRule();
    if (fishStamina <= LANDING_STAMINA && fishDistance <= r.distance) {
      setState(
        GameState.NET_READY,
        r.directLift ? "小鱼已靠岸 · 可以提鱼" : "鱼已靠岸 · 可以抄鱼",
      );
      ui["net-button"].disabled = false;
      ui["net-button"].textContent = r.action;
      ui["net-button"].classList.add("ready");
      ui["fight-guidance"].className = "fight-guidance ready";
      ui["fight-guidance"].textContent = r.directLift
        ? "点击“提鱼上岸”。"
        : "点击“使用抄网”。";
      if (navigator.vibrate) navigator.vibrate([80, 45, 120]);
      return true;
    }
    return false;
  }
  function updateFight(dt) {
    if (!hookedFish || gameState === GameState.NET_READY) return;
    fishPullPhase +=
      dt *
      (1.35 +
        hookedFish.profile.power * 0.68 +
        Math.min(0.8, hookedFish.weight * 0.03));
    const pulse = (Math.sin(fishPullPhase) + 1) * 0.5,
      ex = fishStamina <= 0,
      burst = !ex && pulse > 0.82 ? hookedFish.profile.power * 16 * dt : 0;
    tension +=
      ((ex ? 0.45 : hookedFish.profile.power * 2.6) +
        burst -
        (ex ? 2.1 : 1.45)) *
      dt;
    fishStamina -= (1.7 + tension * 0.012 + hookedFish.weight * 0.03) * dt;
    const dd = (pulse - 0.54) * hookedFish.profile.power * 0.55 * dt;
    fishDistance += ex ? Math.min(0, dd) : dd;
    fishDistance = clamp(fishDistance, 1, castDistance + 2.3);
    tension = clamp(tension, 4, 100);
    fishStamina = clamp(fishStamina, 0, 100);
    if (tension >= 96) {
      loseFish("张力过高，子线切断了！");
      return;
    }
    if (tension <= 6 && fishStamina > 25) {
      loseFish("鱼线失去张力，鱼钩脱落了！");
      return;
    }
    if (fishStamina <= LANDING_STAMINA && !exhaustionHintShown) {
      exhaustionHintShown = true;
      const r = landingRule();
      toast(
        `鱼已疲劳，还需拉近 ${Math.max(0, fishDistance - r.distance).toFixed(1)} 米。`,
        2600,
      );
    }
    if (readyToLand()) return;
    updateFightUI();
  }
  function fightAction(a) {
    if (gameState !== GameState.FIGHT) return;
    const ex = fishStamina <= LANDING_STAMINA;
    if (a === "lift") {
      tension += ex ? 10 : 15;
      fishStamina -= 10 + hookedFish.profile.power * 3;
      fishDistance -= ex ? 0.95 : 0.55;
    } else if (a === "lower") {
      tension -= 20;
      fishStamina -= 2;
      fishDistance += ex ? 0 : 0.16;
    } else {
      tension += ex ? 3 : 5;
      fishStamina -= 7;
      fishDistance -= ex ? 0.68 : 0.35;
    }
    tension = clamp(tension, 4, 100);
    fishStamina = clamp(fishStamina, 0, 100);
    fishDistance = clamp(fishDistance, 1, castDistance + 2);
    if (!readyToLand()) updateFightUI();
  }
  function updateFightUI() {
    ui["tension-label"].textContent = `${Math.round(tension)}%`;
    ui["tension-bar"].style.width = `${tension}%`;
    ui["tension-bar"].style.background =
      tension > 82
        ? "var(--danger)"
        : tension < 18
          ? "#8fb5c7"
          : "var(--accent)";
    ui["stamina-label"].textContent = `${Math.round(fishStamina)}%`;
    ui["stamina-bar"].style.width = `${fishStamina}%`;
    ui["fish-distance-label"].textContent = `${fishDistance.toFixed(1)} m`;
    const r = landingRule(),
      remain = Math.max(0, fishDistance - r.distance);
    ui["net-button"].textContent = r.directLift
      ? `提鱼（需≤${r.distance.toFixed(1)}m）`
      : `抄网（需≤${r.distance.toFixed(1)}m）`;
    ui["net-button"].disabled = gameState !== GameState.NET_READY;
    ui["net-button"].classList.toggle(
      "ready",
      gameState === GameState.NET_READY,
    );
    ui["fight-guidance"].className = "fight-guidance";
    if (gameState === GameState.NET_READY) {
      ui["fight-guidance"].classList.add("ready");
      ui["fight-guidance"].textContent = r.directLift
        ? "小鱼已靠岸，可以直接提鱼。"
        : "鱼已靠岸，可以使用抄网。";
    } else if (fishStamina <= LANDING_STAMINA) {
      ui["fight-guidance"].classList.add("warning");
      ui["fight-guidance"].textContent =
        `鱼已疲劳，还需拉近 ${remain.toFixed(1)} 米。`;
    } else
      ui["fight-guidance"].textContent =
        `先消耗鱼体力，再带到${r.distance.toFixed(1)}米以内。`;
  }
  function loseFish(m) {
    if (![GameState.FIGHT, GameState.NET_READY].includes(gameState)) return;
    toast(m, 2500);
    hookedFish = null;
    setTimeout(() => retrieve(false), 1200);
  }
  function grade(w) {
    return w >= 10
      ? "巨物"
      : w >= 5
        ? "大物"
        : w >= 2
          ? "不错"
          : w >= 0.8
            ? "合格"
            : "轻量";
  }
  function timing(d) {
    return d < 180 ? "精准" : d < 380 ? "良好" : "勉强";
  }
  function landFish() {
    if (gameState !== GameState.NET_READY || !hookedFish) return;
    hideToastImmediate();
    const r = landingRule(),
      center = (biteWindowStart + biteWindowEnd) / 2,
      d = Math.abs(hookedFish.hookElapsed - center),
      method = r.directLift ? "提鱼上岸" : "抄网成功";
    recordCatch(hookedFish);
    setState(GameState.RESULT);
    ui["timing-result"].textContent = timing(d);
    ui["result-bait"].textContent = getBait().name;
    ui["result-layer"].textContent = hookedFish.depthState;
    ui["result-pattern"].textContent = hookedFish.bitePattern;
    ui["result-method"].textContent = method;
    ui["result-note"].textContent = hookedFish.profile.note;
    ui["catch-title"].textContent = hookedFish.species;
    ui["catch-detail"].textContent =
      `${hookedFish.weight.toFixed(2)} kg · ${Math.round(hookedFish.length)} cm`;
    ui["catch-summary"].textContent =
      `${grade(hookedFish.weight)}渔获，使用${getBait().name}在${hookedFish.depthState}钓获；漂相为${hookedFish.bitePattern}。`;
    ui["catch-image"].src = hookedFish.profile.image;
    ui["catch-image"].alt = `${hookedFish.species}图片`;
    ui["result-grade-badge"].textContent = grade(hookedFish.weight);
    ui["result-method-badge"].textContent = method;
    ui["result-pattern-badge"].textContent = hookedFish.bitePattern;
    ui["result-dialog"].classList.add("visible");
    camera.detachControl();
  }
  function retrieve(show = true) {
    clearTimeout(biteTimeout);
    charging = false;
    cancelAnimationFrame(chargeAnimationId);
    landingMarker.setEnabled(false);
    floatRoot.setEnabled(false);
    baitMesh.setEnabled(false);
    floatBasePosition = null;
    hookedFish = null;
    ui["distance-label"].textContent = "—";
    ui["net-button"].disabled = true;
    ui["net-button"].classList.remove("ready");
    ui["fight-guidance"].className = "fight-guidance";
    ui["fight-guidance"].textContent = "先消耗鱼的体力，再将鱼带到岸边。";
    exhaustionHintShown = false;
    applyFloatMarks(getDepthState().marks);
    setState(GameState.READY);
    if (show) toast("已收回线组，可以移动或重新配置。", 1800);
  }
  function focusFloat() {
    if (!floatRoot.isEnabled()) {
      toast("当前还没有抛竿。", 1300);
      return;
    }
    camera.setTarget(floatRoot.position.add(new BABYLON.Vector3(0, 0.18, 0)));
  }
  function interactions() {
    const primary = ui["primary-action"];
    const begin = (e) => {
      if (e && e.cancelable) e.preventDefault();
      if (gameState === GameState.READY) startCharging();
      else if ([GameState.WAIT_BITE, GameState.BITE].includes(gameState))
        attemptHook();
      else if (gameState === GameState.NET_READY) landFish();
    };
    const end = (e) => {
      if (e && e.cancelable) e.preventDefault();
      if (charging) releaseCast();
    };
    primary.addEventListener("pointerdown", begin);
    primary.addEventListener("pointerup", end);
    primary.addEventListener("pointercancel", end);
    primary.addEventListener("touchstart", begin, { passive: false });
    primary.addEventListener("touchend", end, { passive: false });
    primary.addEventListener("touchcancel", end, { passive: false });
    window.addEventListener("pointerup", end);
    ui["fish-keeper-button"].onclick = openFishKeeper;
    ui["spot-button"].onclick = () => {
      if (gameState !== GameState.READY) {
        toast("请先收竿，再更换钓场。", 1500);
        return;
      }
      refreshSpotSelection();
      openDialog(ui["spot-dialog"]);
    };
    ui["rig-button"].onclick = () => {
      if (![GameState.READY, GameState.WAIT_BITE].includes(gameState)) return;
      if (gameState === GameState.WAIT_BITE) retrieve(false);
      pendingRodLength = selectedRodLength;
      refreshRodSelection();
      ui["depth-range"].value = fishingDepth.toFixed(2);
      updateDepthUI(fishingDepth, false);
      setState(GameState.RIG_SETUP);
      openDialog(ui["rig-dialog"]);
    };
    ui["bait-button"].onclick = () => {
      if (![GameState.READY, GameState.WAIT_BITE].includes(gameState)) return;
      if (gameState === GameState.WAIT_BITE) retrieve(false);
      pendingBaitId = selectedBaitId;
      buildBaitGrid();
      openDialog(ui["bait-dialog"]);
    };
    ui["retrieve-button"].onclick = () => retrieve(true);
    ui["test-bite-button"].onclick = triggerBite;
    ui["focus-float-button"].onclick = focusFloat;
    document.querySelectorAll("[data-rod-length]").forEach(
      (b) =>
        (b.onclick = () => {
          pendingRodLength = Number(b.dataset.rodLength);
          refreshRodSelection();
        }),
    );
    ui["depth-range"].oninput = () =>
      updateDepthUI(Number(ui["depth-range"].value), false);
    document.querySelectorAll("[data-depth-step]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = ui["depth-range"],
            v = clamp(
              Number(r.value) + Number(b.dataset.depthStep),
              Number(r.min),
              Number(r.max),
            );
          r.value = v.toFixed(2);
          updateDepthUI(v, false);
        }),
    );
    ui["save-rig-button"].onclick = () => {
      fishingDepth = Number(ui["depth-range"].value);
      const changed = selectedRodLength !== pendingRodLength;
      selectedRodLength = pendingRodLength;
      if (changed) createRod();
      updateDepthUI(fishingDepth, true);
      updateRodUI();
      closeDialog(ui["rig-dialog"]);
      setState(GameState.READY);
      toast(
        `已选择${selectedRodLength.toFixed(1)}米竿，最远${getMaxCast().toFixed(1)}米；${getDepthState().text}。`,
        2600,
      );
    };
    ui["save-bait-button"].onclick = () => {
      selectedBaitId = pendingBaitId;
      ui["bait-label"].textContent = getBait().name;
      updateBaitAppearance();
      closeDialog(ui["bait-dialog"]);
      setState(GameState.READY);
      toast(`已换成${getBait().name}`);
    };
    document.querySelectorAll("[data-close-dialog]").forEach(
      (b) =>
        (b.onclick = () => {
          const dialogId = b.dataset.closeDialog;
          if (dialogId === "fish-keeper-dialog") closeFishKeeper();
          else closeDialog(document.getElementById(dialogId));
          if (gameState === GameState.RIG_SETUP) setState(GameState.READY);
        }),
    );
    document
      .querySelectorAll("[data-fight]")
      .forEach((b) => (b.onclick = () => fightAction(b.dataset.fight)));
    ui["net-button"].onclick = landFish;
    ui["continue-button"].onclick = () => {
      ui["result-dialog"].classList.remove("visible");
      camera.attachControl(ui["render-canvas"], true);
      retrieve(false);
      toast("渔获已放入鱼护。", 1800);
    };
    document.querySelectorAll("[data-move]").forEach((button) => {
      const direction = button.dataset.move;
      const beginMove = (event) => {
        if (event && event.cancelable) event.preventDefault();
        stopMove();
        if (!movePlayer(direction)) return;
        button.classList.add("active");
        moveHoldTimer = setInterval(() => movePlayer(direction), 110);
      };
      const endMove = (event) => {
        if (event && event.cancelable) event.preventDefault();
        stopMove(button);
      };
      if (window.PointerEvent) {
        button.addEventListener("pointerdown", beginMove);
        button.addEventListener("pointerup", endMove);
        button.addEventListener("pointercancel", endMove);
        button.addEventListener("pointerleave", endMove);
      } else {
        button.addEventListener("touchstart", beginMove, { passive: false });
        button.addEventListener("touchend", endMove, { passive: false });
        button.addEventListener("touchcancel", endMove, { passive: false });
      }
    });
    window.addEventListener("pointerup", () => stopMove());
    window.addEventListener("touchend", () => stopMove(), { passive: true });
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyF" && gameState === GameState.WAIT_BITE) triggerBite();
      if (e.code === "KeyR") retrieve(true);
    });
  }
  async function boot() {
    cacheUI();
    setLoading(10, "读取概率配置……");
    await loadConfig();
    buildBaitGrid();
    buildSpotGrid();
    applySpotView();
    updateDepthUI();
    updateRodUI();
    refreshRodSelection();
    if (!window.BABYLON) {
      ui["loading-screen"].querySelector("p").textContent =
        "Babylon.js 加载失败，请检查网络连接。";
      return;
    }
    try {
      setLoading(38, "加载真实钓场远景……");
      createScene();
      setLoading(70, "组装整根鱼竿、浮漂和饵料……");
      interactions();
      setLoading(94, "校准抛投距离与浮漂目数……");
      await new Promise((r) => setTimeout(r, 500));
      setLoading(100, "准备完成");
      await new Promise((r) => setTimeout(r, 250));
      ui["loading-screen"].classList.remove("visible");
      sessionStartedAt = Date.now();
      setState(GameState.READY);
      toast("当前距离水边约1米；按住“抛竿”蓄力。", 3200);
      console.info(`[台钓网页游戏] v${VERSION} 已启动`);
    } catch (e) {
      console.error(e);
      ui["loading-screen"].querySelector("p").textContent =
        `启动失败：${e.message}`;
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
