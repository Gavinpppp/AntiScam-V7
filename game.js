// ===================================================================
// Anti-Scam Story Simulator — Game Engine (Hong Kong Edition)
// 別急，先查證 · 遊戲核心引擎
// ===================================================================

// ===== 全局遊戲狀態 =====
const gameState = {
  language: 'zh-TW',
  screen: 'start',
  identity: null,
  nickname: '',
  stats: {
    alertness: 50,    // 警惕值（選對上升，選錯下降）
    calmness: 80,     // 冷靜值（倒計時內回答保持，超時下降）
    information: 50,
    riskScore: 0,
    money: 100,
    xp: 0,
    level: 1,
    score: 100
  },
  currentLevelIndex: 0,
  currentLevel: 0,  // 修復3：統一左側關卡顯示用
  currentSceneId: null,
  neutralAttempts: {},
  history: [],
  medals: [],
  scoreHistory: [],
  // 倒計時相關
  countdown: {
    timerId: null,
    remaining: 0,
    active: false
  }
};

// ===== 倒計時配置（可調）=====
const COUNTDOWN_CONFIG = {
  perChoiceSeconds: 15,   // 每題限時 15 秒
  autoAdvanceMs: 5000     // 解析最少停留 5 秒
};

// ===================================================================
// ===== 修復2：過渡動畫 + 事件監聽清理 + 按鈕防抖 + 資源預加載 =====
// ===================================================================

/* ---------- 防抖工具 ---------- */
function _debounce(fn, wait = 300) {
  let last = 0, ctx = this;
  return function (...args) {
    const now = Date.now();
    if (now - last < wait) return;
    last = now;
    return fn.apply(ctx, args);
  };
}

/* ---------- 已註冊的清理回調（上一關/場景事件監聽）---------- */
const _cleanupHandlers = [];
function registerSceneCleanup(fn) {
  if (typeof fn === 'function') _cleanupHandlers.push(fn);
}
function runSceneCleanup() {
  while (_cleanupHandlers.length) {
    try { _cleanupHandlers.pop()(); } catch (e) { console.warn('cleanup error', e); }
  }
}

/* ---------- 下一關資源預加載（圖片 + 音頻）---------- */
function preloadNextSceneAssets() {
  try {
    const cur = getCurrentScene();
    const lvl = getCurrentLevel();
    if (!cur || !lvl) return;
    const idx = lvl.scenes.findIndex(s => s.id === cur.id);
    const nextScenes = lvl.scenes.slice(idx + 1, idx + 3);
    if (nextScenes.length === 0) {
      // 到咗關卡尾 → 預加載下一關第一個場景
      const lvls = getLevelsArray();
      const lIdx = lvls.findIndex(l => l.id === lvl.id);
      if (lIdx + 1 < lvls.length && lvls[lIdx + 1].scenes && lvls[lIdx + 1].scenes.length) {
        nextScenes.push(lvls[lIdx + 1].scenes[0]);
      }
    }
    const urls = [];
    for (const s of nextScenes) {
      if (s.visual) {
        const v = s.visual;
        if (v.img) urls.push(v.img);
        if (v.audio) urls.push(v.audio);
        if (v.audioSrc) urls.push(v.audioSrc);
        if (v.avatar) urls.push(v.avatar);
        if (v.src) urls.push(v.src);  /* 視頻資源預加載 */
        if (Array.isArray(v.messages)) {
          for (const m of v.messages) if (m.avatar) urls.push(m.avatar);
        }
      }
    }
    for (const u of urls) {
      if (!u || typeof u !== 'string') continue;
      if (/\.(mp3|wav|ogg|m4a)$/i.test(u)) { try { new Audio(u); } catch(e){} }
      else if (/\.(mp4|webm|ogg)$/i.test(u)) { try { const _vv = document.createElement('video'); _vv.preload = 'metadata'; _vv.src = u; } catch(e){} }
      else { try { new Image().src = u; } catch(e){} }
    }
  } catch (e) {
    console.warn('preloadNextSceneAssets failed:', e);
  }
}

/* ---------- 場景卡片淡入/淡出 ---------- */
function getSceneRoot() {
  return document.getElementById('gameContainer')
      || document.getElementById('sceneCard')
      || document.querySelector('.game-screen');
}
function sceneFadeOut(root, done) {
  if (!root) return done();
  root.style.transition = 'opacity .3s ease';
  root.style.opacity = '0';
  setTimeout(done, 320);
}
function sceneFadeIn(root) {
  if (!root) return;
  requestAnimationFrame(() => {
    root.style.transition = 'opacity .3s ease';
    root.style.opacity = '1';
  });
}

// ===================================================================
// ===== 工具函數 =====
// ===================================================================

function t(key, vars) {
  if (translations[key] && translations[key][gameState.language]) {
    let str = translations[key][gameState.language];
    // 支援 {{var}} 模板變量替換
    if (vars) {
      str = str.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        (vars[name] !== undefined ? vars[name] : '')
      );
    }
    return str;
  }
  return key;
}

function getLocalizedText(obj, suffix) {
  const lang = gameState.language;
  if (lang === 'en' && obj[suffix + 'En']) return obj[suffix + 'En'];
  if (lang === 'zh' && obj[suffix + 'Zh']) return obj[suffix + 'Zh'];
  return obj[suffix];
}

function getSceneText(scene) {
  return getLocalizedText(scene, 'text');
}

function getChoiceText(choice) {
  return getLocalizedText(choice, 'text');
}

function getFeedbackText(choice) {
  return getLocalizedText(choice, 'feedback');
}

function getLevelTitle(level) {
  return getLocalizedText(level, 'title');
}

function getPlaceholderText(inputConfig) {
  return getLocalizedText(inputConfig, 'placeholder');
}

function getInputFeedback(inputConfig, type) {
  return getLocalizedText(inputConfig, type + 'Feedback');
}

// ===== 配置驅動：優先使用 levels.js (LEVELS) =====
// data.js 聲明咗 const levels (5關) 之後，levels.js 聲明咗 const LEVELS (8關)。
// 為咗避免 "Assignment to constant"，所有 game.js 內部訪問統一走 getLevelsArray()。
// window.levels alias 已經喺 index.html 腳本咁早設定好 (levels.js 之後，game.js 之前)。
// 如果 window.levels 仍未設定，就喺度兜底 (非瀏覽器測試環境)。
if (typeof window !== 'undefined') {
  if (typeof window.LEVELS !== 'undefined' && window.LEVELS.length > 0
      && (typeof window.levels === 'undefined' || !window.levels || window.levels.length < window.LEVELS.length)) {
    try { Object.defineProperty(window, 'levels', { value: window.LEVELS, configurable: true, writable: true }); }
    catch(e) { try { window.levels = window.LEVELS; } catch(e2){} }
  } else if (typeof window.levels === 'undefined' && typeof levels !== 'undefined') {
    try { Object.defineProperty(window, 'levels', { value: levels, configurable: true, writable: true }); }
    catch(e) { try { window.levels = levels; } catch(e2){} }
  }
}

// ===================================================================
// ===== 關鍵字檢測引擎 =====
// ===================================================================

function checkKeyword(inputText) {
  if (!inputText || typeof inputText !== 'string') {
    return 'neutral';
  }

  const text = inputText.toLowerCase().trim();
  const lang = gameState.language;

  const negationWords = {
    'zh-TW': ['不','沒','沒有','不要','不用','不行','不可以','不能','不會','不可能','拒絕','別','勿','休想','不可能','絕不','絕對不','先不','暫不','暫時不'],
    'zh': ['不','没','没有','不要','不用','不行','不可以','不能','不会','不可能','拒绝','别','勿','休想','不可能','绝不','绝对不','先不','暂不','暂时不'],
    'en': ['no','not','don\'t','dont','never','won\'t','wont','refuse','reject','decline','no way','not gonna','not going to','shall not']
  };

  const allVerify = [
    ...keywordBank.verify['zh-TW'],
    ...keywordBank.verify['zh'],
    ...keywordBank.verify['en']
  ].map(k => k.toLowerCase()).filter(k => k.length >= 1);

  const allDanger = [
    ...keywordBank.danger['zh-TW'],
    ...keywordBank.danger['zh'],
    ...keywordBank.danger['en']
  ].map(k => k.toLowerCase()).filter(k => k.length >= 1);

  const allNegations = [
    ...(negationWords['zh-TW'] || []),
    ...(negationWords['zh'] || []),
    ...(negationWords['en'] || [])
  ].map(k => k.toLowerCase());

  let verifyScore = 0;
  let dangerScore = 0;

  const matchedVerify = [];
  const matchedDanger = [];
  const matchedNegations = [];

  for (const kw of allVerify) {
    if (text.includes(kw)) {
      matchedVerify.push(kw);
      if (kw.length >= 3) verifyScore += 3;
      else if (kw.length >= 2) verifyScore += 2;
      else verifyScore += 1;
    }
  }

  for (const kw of allDanger) {
    if (text.includes(kw)) {
      matchedDanger.push(kw);
      if (kw.length >= 3) dangerScore += 3;
      else if (kw.length >= 2) dangerScore += 2;
      else dangerScore += 1;
    }
  }

  for (const nw of allNegations) {
    if (text.includes(nw)) {
      matchedNegations.push(nw);
    }
  }

  if (matchedNegations.length > 0 && matchedDanger.length > 0) {
    let negatedDanger = 0;
    for (const dw of matchedDanger) {
      for (const nw of matchedNegations) {
        const negIndex = text.indexOf(nw);
        const dangerIndex = text.indexOf(dw);
        if (negIndex !== -1 && dangerIndex !== -1 && dangerIndex > negIndex) {
          const distance = dangerIndex - negIndex;
          if (distance < 20) {
            negatedDanger++;
            break;
          }
        }
      }
    }
    if (negatedDanger > 0) {
      dangerScore = Math.max(0, dangerScore - negatedDanger * 3);
      verifyScore += negatedDanger * 2;
    }
  }

  if (matchedNegations.length > 0 && text.length < 20) {
    const hasDangerNearby = matchedDanger.some(dw => {
      return matchedNegations.some(nw => {
        const ni = text.indexOf(nw);
        const di = text.indexOf(dw);
        return ni !== -1 && di !== -1 && Math.abs(di - ni) < 15;
      });
    });
    if (!hasDangerNearby && matchedVerify.length === 0) {
      verifyScore += 2;
    }
  }

  if (verifyScore > dangerScore && verifyScore >= 2) {
    return 'good';
  }

  if (dangerScore > verifyScore && dangerScore >= 2) {
    return 'bad';
  }

  if (matchedVerify.length > 0 && matchedDanger.length === 0) {
    return 'good';
  }
  if (matchedDanger.length > 0 && matchedVerify.length === 0) {
    if (matchedNegations.length > 0) {
      return 'good';
    }
    return 'bad';
  }

  if (matchedNegations.length > 0 && matchedDanger.length > 0) {
    return 'good';
  }

  if (matchedVerify.length > 0) return 'good';
  if (matchedDanger.length > 0) return 'bad';

  return 'neutral';
}

function getMatchedKeywords(inputText, category) {
  if (!inputText) return [];
  const text = inputText.toLowerCase().trim();
  const matched = [];
  
  const keywords = [
    ...keywordBank[category]['zh-TW'],
    ...keywordBank[category]['zh'],
    ...keywordBank[category]['en']
  ].map(k => k.toLowerCase());

  for (const kw of keywords) {
    if (text.includes(kw) && !matched.includes(kw)) {
      matched.push(kw);
    }
  }
  return matched;
}

// ===================================================================
// ===== 場景與關卡管理 =====
// ===================================================================

/**
 * 獲取全局 levels 數組。
 * 優先級：window.LEVELS（levels.js，新配置）> window.levels > data.js 舊 levels
 */
function getLevelsArray() {
  if (typeof window !== 'undefined' && window.LEVELS && window.LEVELS.length > 0) {
    return window.LEVELS;
  }
  if (typeof window !== 'undefined' && window.levels && window.levels.length > 0) {
    return window.levels;
  }
  if (typeof levels !== 'undefined') return levels;
  return [];
}

function getCurrentLevel() {
  const arr = getLevelsArray();
  return arr[gameState.currentLevelIndex] || null;
}

function getCurrentScene() {
  const level = getCurrentLevel();
  if (!level) return null;
  return level.scenes.find(s => s.id === gameState.currentSceneId) || null;
}

function findSceneInLevel(level, sceneId) {
  return level.scenes.find(s => s.id === sceneId) || null;
}

function goToScene(sceneId) {
  // 特殊跳轉：先交畀 LevelEngine
  if (typeof window.LevelEngine !== 'undefined'
      && (sceneId === '__next_level__' || sceneId === '__ending__')) {
    window.LevelEngine.goToSceneById(sceneId);
    return;
  }

  // 先在當前關卡搵
  let level = getCurrentLevel();
  let scene = level ? findSceneInLevel(level, sceneId) : null;

  // 跨關卡搵（用於 l1_deep_* 或 bonus 等可能喺任意關卡觸發）
  if (!scene) {
    const arr = getLevelsArray();
    for (const lv of arr) {
      const hit = lv.scenes && lv.scenes.find(s => s.id === sceneId);
      if (hit) {
        scene = hit;
        level = lv;
        // 同步 gameState.currentLevelIndex
        const idx = arr.findIndex(l => l.id === lv.id);
        if (idx >= 0) {
          gameState.currentLevelIndex = idx;
          gameState.currentLevel = idx;  // 修復3：同步 currentLevel
        }
        break;
      }
    }
  }

  if (!scene) {
    console.warn('Scene not found:', sceneId);
    return;
  }

  gameState.currentSceneId = sceneId;
  gameState.history.push({ level: gameState.currentLevelIndex, scene: sceneId, timestamp: Date.now() });

  /* 修復2：場景切換 —— 淡出 → 清理 → render → 淡入 */
  const root = getSceneRoot();
  const commitRender = () => {
    runSceneCleanup();
    renderScene();
    sceneFadeIn(root);
    preloadNextSceneAssets();
  };
  if (root && root.style.opacity !== '0') {
    sceneFadeOut(root, commitRender);
  } else {
    commitRender();
  }
}

function nextLevel() {
  const levelsArr = getLevelsArray();
  const cur = levelsArr[gameState.currentLevelIndex];
  const isBonusCur = cur && cur.isBonus;
  let nextIdx = gameState.currentLevelIndex + 1;
  // 綫性推進時自動跳過 bonus（除非玩家已經在 bonus 中）
  if (!isBonusCur) {
    const nxt = levelsArr[nextIdx];
    if (nxt && nxt.isBonus) nextIdx++;
  }

  if (nextIdx < levelsArr.length) {
    gameState.currentLevelIndex = nextIdx;
    gameState.currentLevel = nextIdx;  // 修復3：同步 currentLevel
    gameState.neutralAttempts = {};
    const nextLvl = getCurrentLevel();
    if (nextLvl && nextLvl.scenes.length > 0) {
      gameState.currentSceneId = nextLvl.scenes[0].id;
      gameState.history.push({ level: gameState.currentLevelIndex, scene: gameState.currentSceneId, timestamp: Date.now() });
      updateStatsUI();
      renderLevelTransition();
    }
  } else {
    if (gameState.stats.money >= 100) {
      unlockMedal('zero_loss');
    }
    unlockMedal('all_levels_clear');
    if (gameState.stats.information >= 90) {
      unlockMedal('info_master');
    }
    if (gameState.stats.alertness >= 90) {
      unlockMedal('alert_ninja');
    }
    showEnding();
  }
}

// ===================================================================
// ===== 遊戲狀態更新 =====
// ===================================================================

function applyEffects(effects, choiceId) {
  if (!effects) return;

  if (effects.alertness !== undefined) {
    gameState.stats.alertness = Math.max(0, Math.min(100, gameState.stats.alertness + effects.alertness));
  }
  if (effects.calmness !== undefined) {
    gameState.stats.calmness = Math.max(0, Math.min(100, gameState.stats.calmness + effects.calmness));
  }
  if (effects.information !== undefined) {
    gameState.stats.information = Math.max(0, Math.min(100, gameState.stats.information + effects.information));
  }
  if (effects.riskScore !== undefined) {
    gameState.stats.riskScore = Math.max(0, Math.min(100, gameState.stats.riskScore + effects.riskScore));
  }
  if (effects.money !== undefined) {
    gameState.stats.money = Math.max(0, Math.min(100, gameState.stats.money + effects.money));
  }
  if (effects.xp !== undefined) {
    addXP(effects.xp);
  }

  let scoreDelta = 0;
  if (effects.score !== undefined) {
    scoreDelta = effects.score;
  } else {
    if (effects.alertness) scoreDelta += effects.alertness * 0.8;
    if (effects.information) scoreDelta += effects.information * 0.8;
    if (effects.riskScore) scoreDelta -= effects.riskScore * 1.5;
    if (effects.money) scoreDelta += effects.money * 1.2;
  }
  scoreDelta = Math.round(scoreDelta);
  if (scoreDelta !== 0) {
    /* 分數上下限：0 ~ 500 */
    gameState.stats.score = Math.max(0, Math.min(500, gameState.stats.score + scoreDelta));
    gameState.scoreHistory.push({
      choiceId: choiceId || null,
      delta: scoreDelta,
      newScore: gameState.stats.score,
      level: gameState.currentLevelIndex,
      timestamp: Date.now()
    });
  }
  if (effects.medal) {
    unlockMedal(effects.medal);
  }

  updateStatsUI();

  // 梨寶：屬性聯動（警惕值/冷靜值過低時觸發提醒）
  if (window.PearAssistant) PearAssistant.onStatsChange(gameState.stats);
}

function addXP(amount) {
  gameState.stats.xp += amount;
  const newLevel = Math.floor(gameState.stats.xp / 100) + 1;
  if (newLevel > gameState.stats.level) {
    gameState.stats.level = newLevel;
    showLevelUpNotification();
  }
}

function showLevelUpNotification() {
  const notif = document.getElementById('levelUpNotification');
  if (notif) {
    const levelSpan = notif.querySelector('.level-num');
    if (levelSpan) levelSpan.textContent = gameState.stats.level;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }
}

// ===================================================================
// ===== 勳章系統 =====
// ===================================================================

const MEDALS = {
  first_verify: {
    id: 'first_verify',
    icon: '🔍',
    name: { 'zh-TW': '初次查證', 'zh': '初次查证', 'en': 'First Verification' },
    desc: { 'zh-TW': '第一次成功識破騙局並選擇查證', 'zh': '第一次成功识破骗局并选择查证', 'en': 'First time successfully verifying a scam' }
  },
  otp_guardian: {
    id: 'otp_guardian',
    icon: '🔐',
    name: { 'zh-TW': 'OTP 守護者', 'zh': 'OTP 守护者', 'en': 'OTP Guardian' },
    desc: { 'zh-TW': '堅決拒絕透露 OTP 驗證碼', 'zh': '坚决拒绝透露 OTP 验证码', 'en': 'Firmly refused to share OTP codes' }
  },
  zero_loss: {
    id: 'zero_loss',
    icon: '🛡️',
    name: { 'zh-TW': '零損失', 'zh': '零损失', 'en': 'Zero Loss' },
    desc: { 'zh-TW': '完成所有關卡且沒有任何金錢損失', 'zh': '完成所有关卡且没有任何金钱损失', 'en': 'Completed all levels with zero money loss' }
  },
  scam_slayer: {
    id: 'scam_slayer',
    icon: '⚔️',
    name: { 'zh-TW': '反詐鬥士', 'zh': '反诈斗士', 'en': 'Scam Slayer' },
    desc: { 'zh-TW': '在所有 5 個關卡中都做出正確選擇', 'zh': '在所有 5 个关卡中都做出正确选择', 'en': 'Made correct choices in all 5 levels' }
  },
  info_master: {
    id: 'info_master',
    icon: '📚',
    name: { 'zh-TW': '資訊達人', 'zh': '资讯达人', 'en': 'Info Master' },
    desc: { 'zh-TW': '資訊值達到 90 以上', 'zh': '信息值达到 90 以上', 'en': 'Information stat reached 90+' }
  },
  alert_ninja: {
    id: 'alert_ninja',
    icon: '🥷',
    name: { 'zh-TW': '警覺忍者', 'zh': '警觉忍者', 'en': 'Alert Ninja' },
    desc: { 'zh-TW': '警覺值達到 90 以上', 'zh': '警觉值达到 90 以上', 'en': 'Alertness stat reached 90+' }
  },
  deepfake_detective: {
    id: 'deepfake_detective',
    icon: '🕵️',
    name: { 'zh-TW': 'Deepfake 偵探', 'zh': 'Deepfake 侦探', 'en': 'Deepfake Detective' },
    desc: { 'zh-TW': '成功識破 Deepfake 換臉騙局', 'zh': '成功识破 Deepfake 换脸骗局', 'en': 'Successfully detected a Deepfake scam' }
  },
  whistleblower: {
    id: 'whistleblower',
    icon: '📢',
    name: { 'zh-TW': '吹哨人', 'zh': '吹哨人', 'en': 'Whistleblower' },
    desc: { 'zh-TW': '主動向有關部門或機構舉報詐騙', 'zh': '主动向有关部门或机构举报诈骗', 'en': 'Reported scams to authorities' }
  },
  survivor: {
    id: 'survivor',
    icon: '🌅',
    name: { 'zh-TW': '倖存者', 'zh': '幸存者', 'en': 'Survivor' },
    desc: { 'zh-TW': '即使受騙了也能及時止損', 'zh': '即使受骗了也能及时止损', 'en': 'Managed to stop losses even after falling for a scam' }
  },
  all_levels_clear: {
    id: 'all_levels_clear',
    icon: '🏆',
    name: { 'zh-TW': '全關卡通關', 'zh': '全关卡通关', 'en': 'All Levels Cleared' },
    desc: { 'zh-TW': '成功完成全部 5 個反詐關卡', 'zh': '成功完成全部 5 个反诈关卡', 'en': 'Successfully completed all 5 anti-scam levels' }
  }
};

function unlockMedal(medalId) {
  if (!MEDALS[medalId]) return;
  if (gameState.medals.includes(medalId)) return;
  gameState.medals.push(medalId);
  showMedalNotification(medalId);
}

function showMedalNotification(medalId) {
  const medal = MEDALS[medalId];
  if (!medal) return;

  const notif = document.getElementById('medalNotification');
  if (notif) {
    const iconEl = notif.querySelector('.medal-icon');
    const nameEl = notif.querySelector('.medal-name');
    const descEl = notif.querySelector('.medal-desc');
    if (iconEl) iconEl.textContent = medal.icon;
    if (nameEl) nameEl.textContent = medal.name[gameState.language] || medal.name['zh-TW'];
    if (descEl) descEl.textContent = medal.desc[gameState.language] || medal.desc['zh-TW'];
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }
}

function getMedalInfo(medalId) {
  return MEDALS[medalId] || null;
}

// ===================================================================
// ===== 分數與等級系統 =====
// ===================================================================

/* ===== 分數與等級系統 =====
   基礎分：100 | 滿分：500
   評級區間：根據實際得分自動匹配對應等級
   =================================================================== */

const ANTI_SCAM_TIERS = [
  { min: 450, icon: '💎', name: { 'zh-TW': '鑽石級反詐達人', 'zh': '钻石级反诈达人', 'en': 'Diamond Anti-Scam Expert' }, desc: { 'zh-TW': '你是反詐騙的頂尖高手！所有騙局在你眼中都無所遁形。', 'zh': '你是反诈骗的顶尖高手！所有骗局在你眼中都无所遁形。', 'en': 'You are a top-tier anti-scam expert! No scam can escape your eyes.' } },
  { min: 350, icon: '🥇', name: { 'zh-TW': '黃金級反詐高手', 'zh': '黄金级反诈高手', 'en': 'Gold Anti-Scam Pro' }, desc: { 'zh-TW': '你具備出色的反詐意識，大部分騙局都難不倒你。', 'zh': '你具备出色的反诈意识，大部分骗局都难不倒你。', 'en': 'You have excellent scam awareness. Most scams can\'t fool you.' } },
  { min: 250, icon: '🥈', name: { 'zh-TW': '白銀級反詐學員', 'zh': '白银级反诈学员', 'en': 'Silver Anti-Scam Trainee' }, desc: { 'zh-TW': '你有不錯的反詐基礎，但仍需警惕一些高級騙術。', 'zh': '你有不错的反诈基础，但仍需警惕一些高级骗术。', 'en': 'You have a solid anti-scam foundation. Stay vigilant against advanced scams.' } },
  { min: 150, icon: '🥉', name: { 'zh-TW': '銅級反詐新手', 'zh': '铜级反诈新手', 'en': 'Bronze Anti-Scam Rookie' }, desc: { 'zh-TW': '你對詐騙有基本認識，但容易在壓力下犯錯。繼續學習！', 'zh': '你对诈骗有基本认识，但容易在压力下犯错。继续学习！', 'en': 'You have basic scam knowledge but can slip under pressure. Keep learning!' } },
  { min: 0, icon: '🌱', name: { 'zh-TW': '反詐萌新', 'zh': '反诈萌新', 'en': 'Anti-Scam Newbie' }, desc: { 'zh-TW': '反詐之路才剛開始，多多練習提升警覺性！', 'zh': '反诈之路才刚开始，多多练习提升警觉性！', 'en': 'Your anti-scam journey just began. Practice to build awareness!' } }
];

function getAntiScamTier() {
  const score = gameState.stats.score;
  for (const tier of ANTI_SCAM_TIERS) {
    if (score >= tier.min) {
      return tier;
    }
  }
  return ANTI_SCAM_TIERS[ANTI_SCAM_TIERS.length - 1];
}

function applyIdentityModifiers() {
  const mods = identityModifiers[gameState.identity];
  if (!mods) return;

  if (mods.alertness) gameState.stats.alertness += mods.alertness;
  if (mods.information) gameState.stats.information += mods.information;

  gameState.stats.alertness = Math.max(0, Math.min(100, gameState.stats.alertness));
  gameState.stats.information = Math.max(0, Math.min(100, gameState.stats.information));
}

// ===================================================================
// ===== UI 渲染 =====
// ===================================================================

function updateStatsUI() {
  const stats = gameState.stats;

  const alertEl = document.getElementById('alertnessValue');
  const calmEl = document.getElementById('calmnessValue');
  const infoEl = document.getElementById('informationValue');
  const riskEl = document.getElementById('riskValue');
  const moneyEl = document.getElementById('moneyValue');
  const xpEl = document.getElementById('xpValue');
  const levelEl = document.getElementById('playerLevel');
  const scoreEl = document.getElementById('scoreValue');

  if (alertEl) alertEl.textContent = Math.round(stats.alertness);
  if (calmEl) calmEl.textContent = Math.round(stats.calmness);
  if (infoEl) infoEl.textContent = Math.round(stats.information);
  if (riskEl) riskEl.textContent = Math.round(stats.riskScore);
  if (moneyEl) moneyEl.textContent = Math.round(stats.money);
  if (xpEl) xpEl.textContent = stats.xp;
  if (levelEl) levelEl.textContent = stats.level;
  if (scoreEl) scoreEl.textContent = stats.score;

  const alertBar = document.getElementById('alertnessBar');
  const calmBar = document.getElementById('calmnessBar');
  const infoBar = document.getElementById('informationBar');
  const riskBar = document.getElementById('riskBar');
  const moneyBar = document.getElementById('moneyBar');

  if (alertBar) alertBar.style.width = stats.alertness + '%';
  if (calmBar) calmBar.style.width = stats.calmness + '%';
  if (infoBar) infoBar.style.width = stats.information + '%';
  if (riskBar) riskBar.style.width = stats.riskScore + '%';
  if (moneyBar) moneyBar.style.width = stats.money + '%';

  // 更新左側面板的關卡顯示：第 X / N 關
  const levelDisplay = document.getElementById('panelLevelDisplay');
  if (levelDisplay) {
    levelDisplay.textContent = t('panel_level', {
      n: gameState.currentLevelIndex + 1,
      total: getLevelsArray().length
    });
  }

  // 修復3：頂部關卡進度已移除，只保留左側面板的關卡顯示
}

// ===================================================================
// ===== 場景渲染 =====
// ===================================================================

function renderScene() {
  const scene = getCurrentScene();
  if (!scene) return;

  const sceneCard = document.getElementById('sceneCard');
  const choicesContainer = document.getElementById('choicesContainer');
  const inputContainer = document.getElementById('inputContainer');
  const visualContainer = document.getElementById('visualContainer');
  const speakerName = document.getElementById('speakerName');
  const sceneText = document.getElementById('sceneText');
  const feedbackBox = document.getElementById('feedbackBox');

  // --- 通用清理：重置 visual container，避免上一個 deep_narrative / split_screen 樣式滲透 ---
  if (visualContainer) {
    visualContainer.classList.remove('visual-deep-narrative', 'visual-split-screen');
    visualContainer.style.display = 'none';
    visualContainer.innerHTML = '';
    visualContainer.className = 'visual-container';
  }
  if (choicesContainer) {
    choicesContainer.style.display = 'none';
    choicesContainer.innerHTML = '';
  }
  if (inputContainer) {
    inputContainer.style.display = 'none';
  }

  if (feedbackBox) {
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'feedback-box';
    feedbackBox.innerHTML = '';
  }

  if (speakerName) {
    const speakerMap = {
      scammer: t('speaker_scammer'),
      official: t('speaker_official'),
      system: t('speaker_system'),
      friend: t('speaker_friend')
    };
    speakerName.textContent = speakerMap[scene.speaker] || scene.speaker || '';
    speakerName.className = 'speaker-name speaker-' + (scene.speaker || 'system');
  }

  // --- LevelEngine：優先交畀配置引擎處理特殊場景類型 ---
  //     (deep_narrative, split_screen 等會全權接管 text / visual / choices / countdown)
  if (window.LevelEngine && typeof window.LevelEngine.renderSceneByType === 'function') {
    const result = window.LevelEngine.renderSceneByType(scene);
    if (result && result.storyRendered) {
      if (sceneCard) sceneCard.scrollTop = 0;
      return;
    }
  }

  // --- 一般場景：預設渲染 ---
  if (sceneText) {
    sceneText.innerHTML = formatText(getSceneText(scene));
  }

  renderVisual(scene.visual);

  if (scene.type === 'mixed_input') {
    // 混合輸入：3 個預設選項 + 「其他：____」自由輸入
    if (inputContainer) inputContainer.style.display = 'none';
    if (choicesContainer) {
      choicesContainer.style.display = 'flex';
      if (typeof renderMixedInput === 'function') {
        renderMixedInput(scene);
      } else {
        console.warn('renderMixedInput not loaded. Did you include enhanced-ui.js?');
      }
    }
  } else if (scene.type === 'text_input') {
    if (choicesContainer) choicesContainer.style.display = 'none';
    if (inputContainer) {
      inputContainer.style.display = 'flex';
      setupTextInput(scene);
    }
  } else if (scene.choices && scene.choices.length > 0) {
    if (inputContainer) inputContainer.style.display = 'none';
    if (choicesContainer) {
      choicesContainer.style.display = 'flex';
      renderChoices(scene.choices);
    }
  } else {
    if (choicesContainer) choicesContainer.style.display = 'none';
    if (inputContainer) inputContainer.style.display = 'none';
  }

  sceneCard.scrollTop = 0;

  // 場景渲染完成後啟動倒計時（選擇題/輸入題才會限時）
  startCountdown();
}

function formatText(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

function renderChoices(choices) {
  const container = document.getElementById('choicesContainer');
  if (!container) return;

  container.innerHTML = '';
  container.onclick = null;  /* Bug 1 fix：清除舊嘅容器級監聽 */

  /* Bug 1 fix：所有選項點擊事件統一綁定喺 #choicesContainer 上（事件委託）*/
  choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.choiceIndex = idx;
    btn.textContent = getChoiceText(choice);
    container.appendChild(btn);
  });

  const scene = getCurrentScene();

  /* === 自由打字選項：只有騙子對話 (speaker === 'scammer') 先顯示 === */
  let toggle = null, wrap = null, input = null, submit = null, voiceBtn = null;
  if (scene && scene.speaker === 'scammer') {
    const otherCard = document.createElement('div');
    otherCard.className = 'choice-free-input-card';
    otherCard.innerHTML = `
      <button class="choice-btn choice-free-toggle" id="choiceFreeToggle" type="button">
        <span class="choice-letter">✍️</span>
        <span class="choice-text">${t('choice_free_other') || '其他：自己輸入回應'}</span>
        <span class="choice-expand-icon">▾</span>
      </button>
      <div class="choice-free-input-wrap" id="choiceFreeInputWrap">
        <div class="choice-free-input-row">
          <input
            type="text"
            id="choiceFreeInput"
            class="interactive-input choice-free-input"
            placeholder="${t('choice_free_placeholder') || '輸入你會點做…例如：我會掛斷電話查證'}"
            maxlength="200"
            autocomplete="off"
          >
          ${typeof renderVoiceInputButtonHTML === 'function' ? renderVoiceInputButtonHTML('choiceFreeVoiceBtn') : ''}
          <button id="choiceFreeSubmit" class="btn btn-submit choice-free-submit" type="button">
            ${t('submit') || '發送'}
          </button>
        </div>
        <div class="choice-free-hint">${t('choice_free_hint') || '系統會根據你輸入嘅內容判斷係咪被騙'}</div>
      </div>
    `;
    container.appendChild(otherCard);

    toggle = otherCard.querySelector('#choiceFreeToggle');
    wrap = otherCard.querySelector('#choiceFreeInputWrap');
    input = otherCard.querySelector('#choiceFreeInput');
    submit = otherCard.querySelector('#choiceFreeSubmit');
    voiceBtn = otherCard.querySelector('#choiceFreeVoiceBtn');

    /* 綁定語音輸入 */
    if (voiceBtn && typeof setupVoiceInput === 'function') {
      setupVoiceInput(voiceBtn, input);
    }
  }
  /* 變數要在 if 外聲明先至喺 onclick / keydown handler 睇到 */
  void toggle;

  /* Bug 1 fix：事件委託 — 用 closest('.choice-btn') 判斷，點唔到選項卡片直接 return */
  container.onclick = _debounce((e) => {
    /* 預設選項 */
    const btn = e.target.closest('.choice-btn:not(.choice-free-toggle)');
    if (btn && btn.dataset.choiceIndex !== undefined) {
      if (btn.disabled) return;
      const idx = parseInt(btn.dataset.choiceIndex, 10);
      if (isNaN(idx) || !choices[idx]) return;
      handleChoice(choices[idx]);
      return;
    }
    /* 「其他」展開/收合 */
    const toggleBtn = e.target.closest('.choice-free-toggle');
    if (toggleBtn) {
      if (toggleBtn.disabled) return;
      const isOpen = wrap.classList.contains('is-open');
      if (isOpen) {
        wrap.classList.remove('is-open');
        toggleBtn.classList.remove('expanded');
      } else {
        wrap.classList.add('is-open');
        toggleBtn.classList.add('expanded');
        setTimeout(() => {
          if (input) {
            input.focus();
            try { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
          }
        }, 60);
      }
      return;
    }
    /* 提交自由輸入 */
    const submitBtn = e.target.closest('.choice-free-submit');
    if (submitBtn) {
      if (submitBtn.disabled) return;
      handleChoiceSceneFreeInput(scene, input, submitBtn);
      return;
    }
  }, 300);

  /* Enter 鍵提交 */
  if (input) {
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleChoiceSceneFreeInput(scene, input, submit);
      }
    };
  }

  /* 修復2：註冊清理回調（防止多次渲染重複綁定） */
  registerSceneCleanup(() => {
    const cc = document.getElementById('choicesContainer');
    if (cc) { cc.onclick = null; cc.innerHTML = ''; }
    if (input) input.onkeypress = null;
  });
}

/**
 * 處理選擇題場景中「其他：自由輸入」的文字提交
 * 利用既有關鍵字偵測引擎（checkKeyword）判斷 good / bad / neutral，
 * 並從現有 choices 中推導對應嘅 nextSceneId 進行分支跳轉。
 */
function handleChoiceSceneFreeInput(scene, inputEl, submitBtn) {
  if (!inputEl || !scene) return;
  const text = inputEl.value.trim();
  if (!text) {
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 500);
    return;
  }

  /* 停止倒計時 */
  if (typeof stopCountdown === 'function') stopCountdown();

  /* 停止語音輸入（如正在進行） */
  const voiceBtn = document.getElementById('choiceFreeVoiceBtn');
  if (voiceBtn && voiceBtn._stopVoiceInput) voiceBtn._stopVoiceInput();

  /* 禁用所有按鈕 */
  inputEl.disabled = true;
  if (submitBtn) submitBtn.disabled = true;
  document.querySelectorAll('#choicesContainer .choice-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('choice-disabled');
  });

  /* 關鍵字偵測 */
  const result = (typeof checkKeyword === 'function') ? checkKeyword(text) : 'neutral';

  /* 從現有 choices 推導 good / bad / neutral 的 nextSceneId */
  const choices = scene.choices || [];
  const goodChoice = choices.find(c => c.feedbackType === 'good');
  const badChoice  = choices.find(c => c.feedbackType === 'bad');
  const midChoice  = choices.find(c => c.feedbackType === 'mid' || (!c.feedbackType));

  let nextSceneId, feedback, effects, feedbackType;

  if (result === 'good') {
    nextSceneId = (goodChoice && goodChoice.nextSceneId) || (midChoice && midChoice.nextSceneId) || (choices[0] && choices[0].nextSceneId);
    feedback = t('choice_free_good_feedback') || '✅ 你嘅回應顯示你識別出騙局，做出了正確判斷！';
    effects = { alertness: 15, calmness: 10, information: 15, riskScore: -10, xp: 25, score: 50 };
    feedbackType = 'good';
  } else if (result === 'bad') {
    nextSceneId = (badChoice && badChoice.nextSceneId) || (choices[0] && choices[0].nextSceneId);
    feedback = t('choice_free_bad_feedback') || '⚠️ 你嘅回應顯示你可能被騙了——記住：任何要求轉帳、密碼、驗證碼嘅都係詐騙。';
    effects = { alertness: -10, calmness: -15, riskScore: 25, money: -20, xp: 5, score: -80 };
    feedbackType = 'bad';
  } else {
    nextSceneId = (midChoice && midChoice.nextSceneId) || (goodChoice && goodChoice.nextSceneId) || (choices[0] && choices[0].nextSceneId);
    feedback = t('choice_free_neutral_feedback') || '你嘅回應有創意，但記住：不確定時，先查證！';
    effects = { alertness: -5, calmness: -5, riskScore: 10, xp: 3, score: -15 };
    feedbackType = 'mid';
  }

  if (typeof applyEffects === 'function') {
    applyEffects(effects, scene.id + '_free_input');
  }

  const navigate = () => {
    if (!nextSceneId) return;
    if (nextSceneId === '__next_level__' && typeof nextLevel === 'function') { nextLevel(); return; }
    if (nextSceneId === '__ending__' && typeof showEnding === 'function') { showEnding(); return; }
    if (typeof goToScene === 'function') goToScene(nextSceneId);
  };

  if (feedback) {
    if (feedbackType === 'bad' && typeof triggerAlarm === 'function') {
      triggerAlarm(() => {
        if (typeof showFeedbackWithContinue === 'function') {
          showFeedbackWithContinue(feedback, feedbackType, navigate);
        } else {
          setTimeout(navigate, 800);
        }
      });
    } else if (typeof showFeedbackWithContinue === 'function') {
      showFeedbackWithContinue(feedback, feedbackType, navigate);
    } else {
      setTimeout(navigate, 800);
    }
  } else {
    setTimeout(navigate, 800);
  }
}

function setupTextInput(scene) {
  const inputEl = document.getElementById('interactiveInput');
  const submitBtn = document.getElementById('submitInputBtn');
  const inputConfig = scene.inputConfig;

  if (inputEl) {
    inputEl.value = '';
    inputEl.placeholder = getPlaceholderText(inputConfig);
    inputEl.disabled = false;
    inputEl.focus();
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = t('submit');
  }

  const sceneId = scene.id;
  if (!gameState.neutralAttempts[sceneId]) {
    gameState.neutralAttempts[sceneId] = 0;
  }

  /* 修復2：提交防抖 300ms */
  const handler = _debounce(() => handleTextInput(scene), 300);

  if (submitBtn) {
    submitBtn.onclick = handler;
  }
  if (inputEl) {
    inputEl.onkeypress = (e) => {
      if (e.key === 'Enter') handler();
    };
  }
  registerSceneCleanup(() => {
    if (submitBtn) submitBtn.onclick = null;
    if (inputEl) inputEl.onkeypress = null;
  });
}

// ===================================================================
// ===== 視覺內容渲染（釣魚卡、語音來電、對話等）=====
// ===================================================================

function renderVisual(visual) {
  const container = document.getElementById('visualContainer');
  if (!container) return;

  stopSpeech();

  if (!visual) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  container.className = 'visual-container';

  switch (visual.type) {
    case 'phishing_card':
      container.innerHTML = renderPhishingCard(visual);
      container.classList.add('visual-phishing');
      break;
    case 'chat':
      container.innerHTML = renderChatVisual(visual);
      container.classList.add('visual-chat');
      break;
    case 'phone_call':
    case 'voice_call':
      container.innerHTML = renderPhoneCallVisual(visual);
      container.classList.add('visual-phone');
      setupAudioPlayer(visual);
      break;
    case 'warning_page':
      container.innerHTML = renderWarningPage(visual);
      container.classList.add('visual-warning');
      break;
    case 'safe_result':
      container.innerHTML = renderSafeResult(visual);
      container.classList.add('visual-safe');
      break;
    case 'sms_thread':
      container.innerHTML = renderSmsThread(visual);
      container.classList.add('visual-sms');
      break;
    case 'deepfake_video':
      container.innerHTML = renderDeepfakeVideo(visual);
      container.classList.add('visual-video');
      break;
    case 'sms_lockscreen':
      // 釣魚簡訊鎖屏 UI
      if (typeof renderSmsLockscreen === 'function') {
        container.innerHTML = renderSmsLockscreen(visual);
        container.classList.add('visual-lockscreen');
        // 渲染後綁定互動
        setTimeout(() => {
          if (typeof setupSmsLockscreenInteraction === 'function') {
            setupSmsLockscreenInteraction(visual, getCurrentScene());
          }
        }, 50);
      }
      break;
    case 'phone_call_immigration':
      // 入境處仿真來電 UI
      if (typeof renderImmigrationCall === 'function') {
        container.innerHTML = renderImmigrationCall(visual);
        container.classList.add('visual-immigration-call');
        // 渲染後綁定互動
        setTimeout(() => {
          if (typeof setupImmigrationCallInteraction === 'function') {
            setupImmigrationCallInteraction(visual, getCurrentScene());
          }
        }, 50);
      }
      break;
    default:
      container.innerHTML = '';
      container.style.display = 'none';
  }
}

function renderPhishingCard(visual) {
  const redFlagsHtml = (visual.redFlags || []).map(flag => `
    <div class="phishing-redflag">
      <span class="redflag-icon">${flag.icon || '⚠️'}</span>
      <span class="redflag-text">${flag.text}</span>
    </div>
  `).join('');

  return `
    <div class="phishing-card">
      <div class="phishing-browser">
        <div class="browser-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="browser-url">
          <span class="url-icon">🔓</span>
          <span class="url-text">${visual.url || ''}</span>
        </div>
      </div>
      <div class="phishing-content">
        <div class="phishing-page-icon">${visual.pageIcon || '🔗'}</div>
        <div class="phishing-page-title">${visual.pageTitle || ''}</div>
        ${visual.realUrl ? `<div class="phishing-real-url">💡 ${visual.realUrl}</div>` : ''}
      </div>
      <div class="phishing-redflags">
        <div class="redflags-title">🚩 ${t('red_flags_detected')}</div>
        ${redFlagsHtml}
      </div>
    </div>
  `;
}

function renderChatVisual(visual) {
  const messagesHtml = (visual.messages || []).map(msg => {
    const isIncoming = msg.type === 'incoming';
    return `
      <div class="chat-message ${isIncoming ? 'incoming' : 'outgoing'}">
        ${isIncoming && msg.name ? `<div class="chat-sender">${msg.name}</div>` : ''}
        <div class="chat-bubble">${msg.text}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="chat-app">
      <div class="chat-header">
        <span class="chat-app-icon">${visual.appIcon || '💬'}</span>
        <span class="chat-app-name">${visual.app || 'Chat'}</span>
      </div>
      <div class="chat-messages">
        ${messagesHtml}
      </div>
    </div>
  `;
}

function renderPhoneCallVisual(visual) {
  return `
    <div class="phone-call-card">
      <div class="phone-screen">
        <div class="phone-notch"></div>
        <div class="caller-info">
          <div class="caller-avatar">📞</div>
          <div class="caller-name">${visual.caller || 'Unknown'}</div>
          <div class="call-status">${visual.status || t('call_incoming')}</div>
        </div>
        <div class="call-content">
          <p>"${visual.content || ''}"</p>
        </div>
        <div class="audio-player-container" id="audioPlayerContainer">
          <audio id="scamVoicePlayer" preload="auto">
            ${visual.audioSrc ? `<source src="${visual.audioSrc}" type="audio/mpeg">` : ''}
          </audio>
          <div class="audio-controls">
            <button class="audio-play-btn" id="audioPlayBtn">▶️</button>
            <div class="audio-progress">
              <div class="audio-progress-bar" id="audioProgressBar"></div>
            </div>
            <span class="audio-time" id="audioTime">0:00</span>
          </div>
          <div class="audio-hint">🔊 ${t('click_to_listen')}</div>
        </div>
        <div class="call-actions">
          <div class="call-btn decline">📵</div>
          <div class="call-btn accept green">📞</div>
        </div>
      </div>
    </div>
  `;
}

function renderWarningPage(visual) {
  return `
    <div class="warning-page">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        ${(visual.content || '').split('\n').map(line => `<p>${line}</p>`).join('')}
      </div>
    </div>
  `;
}

function renderSafeResult(visual) {
  return `
    <div class="safe-result">
      <div class="safe-icon">✅</div>
      <div class="safe-content">
        ${(visual.content || '').split('\n').map(line => `<p>${line}</p>`).join('')}
      </div>
    </div>
  `;
}

function renderSmsThread(visual) {
  const messagesHtml = (visual.messages || []).map(msg => {
    const isIncoming = msg.type === 'incoming';
    return `
      <div class="sms-message ${isIncoming ? 'incoming' : 'outgoing'}">
        <div class="sms-bubble">${msg.text}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="sms-app">
      <div class="sms-header">
        <span class="sms-sender">${visual.sender || 'Unknown'}</span>
      </div>
      <div class="sms-messages">
        ${messagesHtml}
      </div>
    </div>
  `;
}

function renderDeepfakeVideo(visual) {
  /* 若提供 src，嵌入真實 <video> 元素；否則回退到原本嘅佔位 UI */
  const videoEl = visual.src
    ? `<video class="video-player" src="${visual.src}" controls playsinline preload="metadata"></video>`
    : `<div class="video-placeholder">
         <div class="video-icon">📹</div>
         <div class="video-label">${visual.label || 'Video Call'}</div>
       </div>`;

  return `
    <div class="deepfake-video-card">
      <div class="video-frame">
        ${visual.label && visual.src ? `<div class="video-call-label">📹 ${visual.label}</div>` : ''}
        ${videoEl}
      </div>
      ${visual.content ? `<div class="video-caption"><p>${visual.content}</p></div>` : ''}
    </div>
  `;
}

// ===================================================================
// ===== 音頻播放器（Web Speech API 語音合成）=====
// ===================================================================

let currentSpeechUtterance = null;
let speechProgressInterval = null;
let speechStartTime = 0;
let speechEstimatedDuration = 0;

function setupAudioPlayer(visual) {
  const playBtn = document.getElementById('audioPlayBtn');
  const progressBar = document.getElementById('audioProgressBar');
  const timeDisplay = document.getElementById('audioTime');
  const container = document.getElementById('audioPlayerContainer');
  const audioHint = document.querySelector('.audio-hint');

  if (!container) return;

  stopSpeech();

  const speechText = getSpeechText(visual);

  if (speechText && 'speechSynthesis' in window) {
    if (audioHint) {
      audioHint.textContent = '🔊 ' + t('click_to_listen_real');
    }
    if (playBtn) {
      playBtn.onclick = () => toggleSpeech(speechText, playBtn, progressBar, timeDisplay);
    }
  } else if (visual.audioSrc) {
    const audio = document.getElementById('scamVoicePlayer');
    if (audio && playBtn) {
      playBtn.onclick = () => {
        if (audio.paused) {
          audio.play();
          playBtn.textContent = '⏸️';
        } else {
          audio.pause();
          playBtn.textContent = '▶️';
        }
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          if (progressBar) progressBar.style.width = percent + '%';
          if (timeDisplay) timeDisplay.textContent = formatTime(audio.currentTime);
        }
      };
      audio.onended = () => {
        if (playBtn) playBtn.textContent = '▶️';
      };
    }
  } else {
    if (playBtn) {
      playBtn.onclick = () => simulateAudioPlayback(playBtn, progressBar, timeDisplay);
    }
  }
}

function getSpeechText(visual) {
  if (!visual) return null;
  if (visual.speechText) return getLocalizedText(visual, 'speechText');
  if (visual.content) return visual.content;
  return null;
}

function getVoiceLang() {
  const lang = gameState.language;
  if (lang === 'zh-TW') return 'zh-HK';
  if (lang === 'zh') return 'zh-CN';
  return 'en-US';
}

function toggleSpeech(text, playBtn, progressBar, timeDisplay) {
  if (!('speechSynthesis' in window)) {
    simulateAudioPlayback(playBtn, progressBar, timeDisplay);
    return;
  }

  if (currentSpeechUtterance && !speechSynthesis.paused) {
    speechSynthesis.pause();
    if (playBtn) playBtn.textContent = '▶️';
    if (speechProgressInterval) clearInterval(speechProgressInterval);
    return;
  }

  if (speechSynthesis.paused && currentSpeechUtterance) {
    speechSynthesis.resume();
    if (playBtn) playBtn.textContent = '⏸️';
    startSpeechProgress(playBtn, progressBar, timeDisplay);
    return;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getVoiceLang();
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = speechSynthesis.getVoices();
  const targetLang = getVoiceLang();
  let selectedVoice = null;

  for (const voice of voices) {
    if (voice.lang === targetLang) {
      selectedVoice = voice;
      break;
    }
  }
  if (!selectedVoice && voices.length > 0) {
    for (const voice of voices) {
      if (voice.lang.startsWith('zh')) {
        selectedVoice = voice;
        break;
      }
    }
  }
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  speechEstimatedDuration = Math.max(3, text.length * 0.18);

  utterance.onstart = () => {
    speechStartTime = Date.now();
    if (playBtn) playBtn.textContent = '⏸️';
    startSpeechProgress(playBtn, progressBar, timeDisplay);
  };

  utterance.onend = () => {
    if (playBtn) playBtn.textContent = '▶️';
    if (progressBar) progressBar.style.width = '100%';
    if (timeDisplay) timeDisplay.textContent = formatTime(speechEstimatedDuration);
    if (speechProgressInterval) {
      clearInterval(speechProgressInterval);
      speechProgressInterval = null;
    }
    currentSpeechUtterance = null;
  };

  utterance.onerror = () => {
    if (playBtn) playBtn.textContent = '▶️';
    if (speechProgressInterval) {
      clearInterval(speechProgressInterval);
      speechProgressInterval = null;
    }
    currentSpeechUtterance = null;
  };

  currentSpeechUtterance = utterance;
  speechSynthesis.speak(utterance);
}

function startSpeechProgress(playBtn, progressBar, timeDisplay) {
  if (speechProgressInterval) clearInterval(speechProgressInterval);

  speechProgressInterval = setInterval(() => {
    if (currentSpeechUtterance && !speechSynthesis.paused) {
      const elapsed = (Date.now() - speechStartTime) / 1000;
      const percent = Math.min(100, (elapsed / speechEstimatedDuration) * 100);
      if (progressBar) progressBar.style.width = percent + '%';
      if (timeDisplay) timeDisplay.textContent = formatTime(Math.min(elapsed, speechEstimatedDuration));
    }
  }, 100);
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  if (speechProgressInterval) {
    clearInterval(speechProgressInterval);
    speechProgressInterval = null;
  }
  currentSpeechUtterance = null;
}

function simulateAudioPlayback(playBtn, progressBar, timeDisplay) {
  let currentTime = 0;
  const duration = 8;
  let isPlaying = false;

  if (playBtn.dataset.playing === 'true') {
    isPlaying = false;
    playBtn.dataset.playing = 'false';
    playBtn.textContent = '▶️';
    return;
  }

  isPlaying = true;
  playBtn.dataset.playing = 'true';
  playBtn.textContent = '⏸️';

  const interval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(interval);
      return;
    }
    currentTime += 0.1;
    if (currentTime >= duration) {
      currentTime = duration;
      isPlaying = false;
      playBtn.dataset.playing = 'false';
      playBtn.textContent = '▶️';
      clearInterval(interval);
    }
    const percent = (currentTime / duration) * 100;
    if (progressBar) progressBar.style.width = percent + '%';
    if (timeDisplay) timeDisplay.textContent = formatTime(currentTime);
  }, 100);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// ===================================================================
// ===== 倒計時系統（每題限時，超時觸發警報）=====
// ===================================================================

function startCountdown() {
  // 15s 倒計時只存在於與騙子的對話中：
  //   - 場景 speaker 必須為 'scammer'
  //   - 並且是真正的問題場景（text_input / mixed_input / 多選項選擇題）
  //   - deep_narrative / split_screen 等自節奏場景不限時
  const scene = getCurrentScene();
  if (!scene) { hideCountdown(); return; }

  // 非騙子對話（官方、系統、朋友）→ 不啟動倒計時
  if (scene.speaker !== 'scammer') {
    hideCountdown();
    return;
  }

  const isQuestion =
    scene.type === 'text_input' ||
    scene.type === 'mixed_input' ||
    (scene.choices && scene.choices.length >= 2);

  if (!isQuestion) {
    hideCountdown();
    return;
  }

  stopCountdown();
  gameState.countdown.active = true;
  gameState.countdown.remaining = COUNTDOWN_CONFIG.perChoiceSeconds;
  gameState._pearCountdownWarned = false; // 梨寶倒計時警告重置

  const countdownEl = document.getElementById('countdownDisplay');
  if (countdownEl) countdownEl.style.display = 'block';

  updateCountdownUI();

  const tickMs = 100;
  const totalMs = COUNTDOWN_CONFIG.perChoiceSeconds * 1000;
  const startTime = Date.now();

  gameState.countdown.timerId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remainingMs = Math.max(0, totalMs - elapsed);
    gameState.countdown.remaining = remainingMs / 1000;

    updateCountdownUI();

    // 最後 5 秒進入警告狀態
    if (gameState.countdown.remaining <= 5 && countdownEl) {
      countdownEl.classList.add('countdown-warning');
    }

    // 梨寶：倒計時 5 秒警告（只觸發一次）
    if (gameState.countdown.remaining <= 5 && !gameState._pearCountdownWarned) {
      gameState._pearCountdownWarned = true;
      if (window.PearAssistant) PearAssistant.onCountdownWarning();
    }

    if (remainingMs <= 0) {
      stopCountdown();
      handleTimeout();
    }
  }, tickMs);
}

function updateCountdownUI() {
  const numEl = document.getElementById('countdownNumber');
  const ringEl = document.getElementById('countdownRing');
  const remaining = Math.ceil(gameState.countdown.remaining);
  if (numEl) numEl.textContent = remaining;

  if (ringEl) {
    // 圓形進度：根據剩餘比例計算 stroke-dashoffset
    const ratio = Math.max(0, gameState.countdown.remaining / COUNTDOWN_CONFIG.perChoiceSeconds);
    const circumference = 2 * Math.PI * 26; // r=26
    ringEl.style.strokeDashoffset = circumference * (1 - ratio);
  }
}

function stopCountdown() {
  if (gameState.countdown.timerId) {
    clearInterval(gameState.countdown.timerId);
    gameState.countdown.timerId = null;
  }
  gameState.countdown.active = false;
  const countdownEl = document.getElementById('countdownDisplay');
  if (countdownEl) countdownEl.classList.remove('countdown-warning');
}

function hideCountdown() {
  stopCountdown();
  const countdownEl = document.getElementById('countdownDisplay');
  if (countdownEl) countdownEl.style.display = 'none';
}

// 超時處理：視為選錯，觸發警報動畫，降低冷靜值
function handleTimeout() {
  const scene = getCurrentScene();
  if (!scene) return;

  // 超時降低冷靜值與警惕值
  applyEffects({ calmness: -20, alertness: -10, riskScore: 15, score: -30 }, 'timeout');

  // 梨寶：超時提示
  if (window.PearAssistant) PearAssistant.onTimeout();

  // 禁用選項按鈕，避免超時後仍可點擊
  disableChoiceButtons();

  // 播放警報動畫
  triggerAlarm(() => {
    // 警報結束後顯示超時提示 + 點擊繼續
    const timeoutMsg = t('timeout_warning');
    // 嘗試走向 bad 路徑；若無則走向下一個可能的場景
    let nextSceneId = null;
    if (scene.type === 'text_input' && scene.inputConfig) {
      nextSceneId = scene.inputConfig.badNextSceneId || scene.inputConfig.neutralNextSceneId || scene.inputConfig.goodNextSceneId;
    } else if (scene.type === 'mixed_input' && scene.mixedConfig) {
      const ic = scene.mixedConfig.inputConfig;
      nextSceneId = (ic && (ic.badNextSceneId || ic.neutralNextSceneId || ic.goodNextSceneId)) || null;
    } else if (scene.choices && scene.choices.length > 0) {
      // 找一個 feedbackType 為 bad 的選項作為超時走向
      const badChoice = scene.choices.find(c => c.feedbackType === 'bad');
      nextSceneId = badChoice ? badChoice.nextSceneId : scene.choices[0].nextSceneId;
    }

    showFeedbackWithContinue(timeoutMsg, 'bad', () => {
      if (!nextSceneId) return;
      if (nextSceneId === '__next_level__') { nextLevel(); return; }
      if (nextSceneId === '__ending__') { showEnding(); return; }
      goToScene(nextSceneId);
    });
  });
}

function disableChoiceButtons() {
  const buttons = document.querySelectorAll('#choicesContainer .choice-btn');
  buttons.forEach(btn => { btn.disabled = true; btn.classList.add('choice-disabled'); });
  const submitBtn = document.getElementById('submitInputBtn');
  if (submitBtn) submitBtn.disabled = true;
  const inputEl = document.getElementById('interactiveInput');
  if (inputEl) inputEl.disabled = true;
}

// ===================================================================
// ===== 警報動畫系統（紅色閃爍 + 震動 + Web Audio 警報聲）=====
// ===================================================================

let alarmAudioCtx = null;

// 用 Web Audio API 生成簡單警報聲（不依賴外部音頻檔案）
function playAlarmSound() {
  try {
    if (!alarmAudioCtx) {
      alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 瀏覽器自動播放策略：需在用戶互動後恢復
    if (alarmAudioCtx.state === 'suspended') alarmAudioCtx.resume();

    const ctx = alarmAudioCtx;
    const now = ctx.currentTime;

    // 生成兩段「嗶嗶」警報聲
    for (let i = 0; i < 2; i++) {
      const start = now + i * 0.35;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, start);        // A5
      osc.frequency.setValueAtTime(660, start + 0.12);  // E5
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    }
  } catch (e) {
    // Web Audio 不可用時靜默失敗（不影響遊戲流程）
    console.warn('Alarm sound unavailable:', e);
  }
}

// 觸發警報動畫：紅色邊緣閃爍 + 震動 + 圖示提示 + 音效，持續 1.5 秒
function triggerAlarm(onComplete) {
  playAlarmSound();

  const overlay = document.getElementById('alarmOverlay');
  const icon = document.getElementById('alarmIcon');
  const text = document.getElementById('alarmText');
  const sceneCard = document.getElementById('sceneCard');

  if (text) text.textContent = t('alarm_danger');

  if (overlay) overlay.classList.add('alarm-active');
  if (icon) icon.classList.add('alarm-icon-show');
  if (sceneCard) sceneCard.classList.add('shake');

  setTimeout(() => {
    if (overlay) overlay.classList.remove('alarm-active');
    if (icon) icon.classList.remove('alarm-icon-show');
    if (sceneCard) sceneCard.classList.remove('shake');
    if (typeof onComplete === 'function') onComplete();
  }, 1500);
}

// ===================================================================
// ===== 玩家選擇處理 =====
// ===================================================================

function handleChoice(choice) {
  // 玩家已選擇，停止倒計時
  stopCountdown();

  const eff = choice.effects ? { ...choice.effects } : {};

  if (choice.id && choice.id.includes('report') && !gameState.medals.includes('whistleblower')) {
    if (choice.feedbackType === 'good' || (eff.alertness && eff.alertness > 0) || (eff.information && eff.information > 0)) {
      eff.medal = 'whistleblower';
    }
  }

  if (choice.id && choice.id.includes('report') && eff.money && eff.money < 0) {
    if (!gameState.medals.includes('survivor')) {
      if (!eff.medal) {
        eff.medal = 'survivor';
      }
    }
  }

  if (Object.keys(eff).length > 0) {
    applyEffects(eff, choice.id);
  }

  // 選錯時降低冷靜值
  if (choice.feedbackType === 'bad') {
    applyEffects({ calmness: -10 }, choice.id + '_calm');
  } else if (choice.feedbackType === 'good') {
    applyEffects({ calmness: 5 }, choice.id + '_calm');
  }

  disableChoiceButtons();
  const feedback = getFeedbackText(choice);
  const feedbackType = choice.feedbackType || 'mid';

  // 梨寶：選擇反饋
  if (window.PearAssistant) PearAssistant.onChoice(choice);

  // 決定下一步導航
  const navigate = () => {
    if (choice.nextSceneId === '__next_level__') { nextLevel(); return; }
    if (choice.nextSceneId === '__ending__') { showEnding(); return; }
    if (choice.nextSceneId) goToScene(choice.nextSceneId);
  };

  if (feedback) {
    // 選錯：先播放警報動畫，再顯示解析（點擊繼續）
    if (feedbackType === 'bad') {
      triggerAlarm(() => {
        showFeedbackWithContinue(feedback, feedbackType, navigate);
      });
    } else {
      showFeedbackWithContinue(feedback, feedbackType, navigate);
    }
  } else {
    navigate();
  }
}

function handleTextInput(scene) {
  const inputEl = document.getElementById('interactiveInput');
  const submitBtn = document.getElementById('submitInputBtn');
  const inputConfig = scene.inputConfig;

  const inputText = inputEl ? inputEl.value.trim() : '';

  if (!inputText) {
    if (inputEl) inputEl.classList.add('shake');
    setTimeout(() => inputEl && inputEl.classList.remove('shake'), 500);
    return;
  }

  // 已提交，停止倒計時
  stopCountdown();
  if (inputEl) inputEl.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  const result = checkKeyword(inputText);
  const sceneId = scene.id;

  let nextSceneId;
  let feedback;
  let effects = {};

  if (result === 'good') {
    nextSceneId = inputConfig.goodNextSceneId;
    feedback = getInputFeedback(inputConfig, 'good');
    effects = { alertness: 15, calmness: 10, information: 15, riskScore: -10, xp: 25, score: 50 };
    if (gameState.medals.length === 0) {
      effects.medal = 'first_verify';
    }
    if (scene.id.includes('otp') || scene.id.includes('OTP') || scene.id.includes('l3_s3') || scene.id.includes('l3_s2')) {
      if (!gameState.medals.includes('otp_guardian')) {
        effects.medal = 'otp_guardian';
      }
    }
  } else if (result === 'bad') {
    nextSceneId = inputConfig.badNextSceneId;
    feedback = getInputFeedback(inputConfig, 'bad');
    effects = { alertness: -10, calmness: -15, riskScore: 25, money: -20, xp: 5, score: -80 };
  } else {
    gameState.neutralAttempts[sceneId] = (gameState.neutralAttempts[sceneId] || 0) + 1;
    const maxAttempts = inputConfig.maxNeutralAttempts || 2;

    if (gameState.neutralAttempts[sceneId] <= maxAttempts && inputConfig.neutralNextSceneId) {
      nextSceneId = inputConfig.neutralNextSceneId;
      feedback = getInputFeedback(inputConfig, 'neutral');
      effects = { alertness: -5, calmness: -5, riskScore: 10, xp: 3, score: -15 };
    } else {
      nextSceneId = inputConfig.goodNextSceneId;
      feedback = getInputFeedback(inputConfig, 'neutral');
      effects = { alertness: 5, calmness: 5, information: 5, xp: 5, score: 20 };
    }
  }

  applyEffects(effects, sceneId + '_input');
  const feedbackType = result === 'good' ? 'good' : result === 'bad' ? 'bad' : 'mid';

  const navigate = () => {
    if (nextSceneId) goToScene(nextSceneId);
  };

  if (feedback) {
    // 選錯：先警報動畫再顯示解析
    if (feedbackType === 'bad') {
      triggerAlarm(() => {
        showFeedbackWithContinue(feedback, feedbackType, navigate);
      });
    } else {
      showFeedbackWithContinue(feedback, feedbackType, navigate);
    }
  } else {
    setTimeout(navigate, 800);
  }
}

// ===================================================================
// ===== 回饋顯示（含「點擊繼續」按鈕 + 至少 5 秒停留）=====
// ===================================================================

// 顯示回饋解析，並在至少 5 秒後允許玩家點擊「繼續」按鈕推進遊戲
function showFeedbackWithContinue(text, type, onContinue) {
  const feedbackBox = document.getElementById('feedbackBox');
  if (!feedbackBox) {
    if (typeof onContinue === 'function') setTimeout(onContinue, COUNTDOWN_CONFIG.autoAdvanceMs);
    return;
  }

  feedbackBox.innerHTML = `
    <p>${formatText(text)}</p>
    <button class="btn btn-continue" id="continueBtn" disabled>
      <span class="continue-text">${t('click_to_continue')}</span>
      <span class="continue-timer" id="continueTimer">5s</span>
    </button>
  `;
  feedbackBox.className = 'feedback-box feedback-' + (type || 'mid');
  feedbackBox.style.display = 'block';
  feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const continueBtn = document.getElementById('continueBtn');
  const timerLabel = document.getElementById('continueTimer');

  // 至少停留 5 秒，期間按鈕禁用並顯示剩餘秒數
  let remaining = Math.ceil(COUNTDOWN_CONFIG.autoAdvanceMs / 1000);
  if (timerLabel) timerLabel.textContent = remaining + 's';

  const tick = setInterval(() => {
    remaining--;
    if (timerLabel) timerLabel.textContent = remaining + 's';
    if (remaining <= 0) {
      clearInterval(tick);
      if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.classList.add('continue-ready');
        if (timerLabel) timerLabel.style.display = 'none';
      }
    }
  }, 1000);

  if (continueBtn) {
    continueBtn.onclick = () => {
      if (continueBtn.disabled) return;
      clearInterval(tick);
      // 隱藏回饋框
      feedbackBox.style.display = 'none';
      feedbackBox.innerHTML = '';
      if (typeof onContinue === 'function') onContinue();
    };
  }
}

// 保留舊介面（向後相容）
function showFeedback(text, type) {
  showFeedbackWithContinue(text, type, null);
}

// ===================================================================
// ===== 關卡過渡 =====
// ===================================================================

function renderLevelTransition() {
  const level = getCurrentLevel();
  if (!level) return;

  stopCountdown();
  hideCountdown();

  const overlay = document.getElementById('levelTransitionOverlay');
  const titleEl = document.getElementById('transitionLevelTitle');
  const iconEl = document.getElementById('transitionLevelIcon');
  const descEl = document.getElementById('transitionLevelDesc');

  if (!overlay) {
    startLevel();
    return;
  }

  if (iconEl) iconEl.textContent = level.icon || '🎯';
  if (titleEl) titleEl.textContent = getLevelTitle(level);
  if (descEl) descEl.textContent = level.scamType || '';

  overlay.classList.add('show');

  setTimeout(() => {
    overlay.classList.remove('show');
    startLevel();
  }, 2500);
}

function startLevel() {
  const level = getCurrentLevel();
  if (!level || !level.scenes || level.scenes.length === 0) return;

  gameState.currentSceneId = level.scenes[0].id;
  gameState.neutralAttempts = {};
  gameState.history.push({ level: gameState.currentLevelIndex, scene: gameState.currentSceneId, timestamp: Date.now() });
  renderScene();

  // 梨寶：進入新關卡提示
  if (window.PearAssistant) PearAssistant.onLevelEnter(level.id);
}

// ===================================================================
// ===== 結局系統 =====
// ===================================================================

function showEnding() {
  const ending = calculateEnding();
  if (!ending) return;

  gameState.screen = 'ending';
  stopCountdown();
  hideCountdown();

  // 梨寶：結局畫面隱藏
  const pearRoot = document.getElementById('pearRoot');
  if (pearRoot) pearRoot.classList.add('pear-hidden');

  const gameScreen = document.getElementById('gameScreen');
  const endingScreen = document.getElementById('endingScreen');

  if (gameScreen) gameScreen.style.display = 'none';
  if (endingScreen) {
    endingScreen.style.display = 'flex';
    endingScreen.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  /* ---- 渲染結局標題 ---- */
  const iconEl = document.getElementById('endingIcon');
  const titleEl = document.getElementById('endingTitle');
  const descEl = document.getElementById('endingDescription');

  if (iconEl) iconEl.textContent = ending.icon || '🎭';
  if (titleEl) {
    titleEl.textContent = getLocalizedText(ending, 'title');
    titleEl.style.color = ending.color || '#333';
  }
  if (descEl) descEl.innerHTML = formatText(getLocalizedText(ending, 'description'));

  /* ---- 調用六大模塊渲染 ---- */
  renderPanelScore();
  renderPanelTier();
  renderPanelMedals();
  renderPanelKnowledge();
  renderPanelDefense();
  renderPanelTips(ending);
}

/* ===================================================================
   ===== 模塊1：反詐分數（總分 + 每關對錯統計）=====
   =================================================================== */
function renderPanelScore() {
  const scoreBig = document.getElementById('scoreBig');
  const levelStats = document.getElementById('levelStats');
  if (!scoreBig || !levelStats) return;

  scoreBig.textContent = gameState.stats.score;

  /* 按關卡統計分數變化，推導對錯 */
  const levelResults = [];
  const levelsArr = getLevelsArray();
  for (let i = 0; i < levelsArr.length; i++) {
    const net = gameState.scoreHistory
      .filter(h => h.level === i)
      .reduce((sum, h) => sum + h.delta, 0);

    let status, statusClass, icon;
    if (net >= 30) { status = '優秀'; statusClass = 'good'; icon = '✅'; }
    else if (net > 0) { status = '良好'; statusClass = 'mid'; icon = '⚠️'; }
    else { status = '需改進'; statusClass = 'bad'; icon = '❌'; }

    const title = getLocalizedText(levelsArr[i], 'title') || levelsArr[i].title;
    levelResults.push({ title, net, status, statusClass, icon });
  }

  levelStats.innerHTML = levelResults.map(r => `
    <div class="level-stat-row ${r.statusClass}">
      <span class="level-stat-icon">${r.icon}</span>
      <span class="level-stat-title">${r.title}</span>
      <span class="level-stat-status">${r.status}</span>
      <span class="level-stat-pts">${r.net > 0 ? '+' : ''}${r.net}</span>
    </div>
  `).join('');
}

/* ===================================================================
   ===== 模塊2：表現等級 =====
   =================================================================== */
function renderPanelTier() {
  const tierIcon = document.getElementById('tierIcon');
  const tierName = document.getElementById('tierName');
  const tierEval = document.getElementById('tierEval');
  if (!tierIcon || !tierName || !tierEval) return;

  const tier = getAntiScamTier();
  tierIcon.textContent = tier.icon;
  tierName.textContent = tier.name[gameState.language] || tier.name['zh-TW'];
  tierEval.textContent = tier.desc[gameState.language] || tier.desc['zh-TW'];
}

/* ===================================================================
   ===== 模塊3：榮譽 & 成就（已解鎖彩色 + 未解鎖灰化）=====
   =================================================================== */
function renderPanelMedals() {
  const container = document.getElementById('medalsList');
  if (!container) return;

  const unlocked = new Set(gameState.medals);
  const allMedalIds = Object.keys(MEDALS);

  container.innerHTML = allMedalIds.map(mid => {
    const m = MEDALS[mid];
    const isUnlocked = unlocked.has(mid);
    const name = m.name[gameState.language] || m.name['zh-TW'];
    const desc = m.desc[gameState.language] || m.desc['zh-TW'];
    const lockIcon = isUnlocked ? '' : '<span class="medal-lock">🔒</span>';

    return `
      <div class="medal-row ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="medal-row-icon">${m.icon}</div>
        <div class="medal-row-info">
          <div class="medal-row-name">${name} ${lockIcon}</div>
          <div class="medal-row-desc">${desc}</div>
        </div>
        <div class="medal-row-status">${isUnlocked ? '已解鎖' : '未達成'}</div>
      </div>
    `;
  }).join('');
}

/* ===================================================================
   ===== 模塊4：分關卡反詐知識（騙局類型 + 套路解析）=====
   =================================================================== */
function renderPanelKnowledge() {
  const container = document.getElementById('knowledgeList');
  if (!container) return;

  container.innerHTML = levels.map((lvl, idx) => {
    const title = getLocalizedText(lvl, 'title') || lvl.title;
    const scamType = lvl.scamType || '詐騙';
    const redFlags = (lvl.redFlags || []).map(rf =>
      `<li class="knowledge-flag">🚩 ${rf}</li>`
    ).join('');

    return `
      <div class="knowledge-card">
        <div class="knowledge-header">
          <span class="knowledge-num">${idx + 1}</span>
          <span class="knowledge-title">${title}</span>
          <span class="knowledge-type">${scamType}</span>
        </div>
        <ul class="knowledge-flags">${redFlags}</ul>
      </div>
    `;
  }).join('');
}

/* ===================================================================
   ===== 模塊5：關卡配套防範措施 =====
   =================================================================== */
function renderPanelDefense() {
  const container = document.getElementById('defenseList');
  if (!container) return;

  container.innerHTML = levels.map((lvl, idx) => {
    const title = getLocalizedText(lvl, 'title') || lvl.title;
    const channels = (lvl.officialChannels || []).map(ch =>
      `<li class="defense-item">✅ ${ch}</li>`
    ).join('');

    return `
      <div class="defense-card">
        <div class="defense-header">
          <span class="defense-num">${idx + 1}</span>
          <span class="defense-title">${title}</span>
        </div>
        <ul class="defense-items">${channels}</ul>
      </div>
    `;
  }).join('');
}

/* ===================================================================
   ===== 模塊6：反詐小 Tips（通用提醒，可滾動）=====
   =================================================================== */
function renderPanelTips(ending) {
  const container = document.getElementById('tipsScroll');
  if (!container) return;

  /* 從結局 advice + 通用提醒動態組裝 */
  const tips = [];

  if (ending && ending.advice) {
    const adv = getLocalizedText(ending, 'advice');
    if (Array.isArray(adv)) {
      tips.push(...adv);
    } else {
      tips.push(adv);
    }
  }

  /* 通用防騙提醒（動態根據本局數據生成） */
  const s = gameState.stats;
  if (s.riskScore >= 40) {
    tips.push('⚠️ 你的風險值偏高，遇到緊急要求時記得先深呼吸，不要跟著對方的節奏走。');
  }
  if (s.information < 50) {
    tips.push('📚 資訊量偏低，建議多了解香港本地防騙資源：防騙易 18222、防騙視伏器 Scameter。');
  }
  if (s.money < 80) {
    tips.push('💰 本局有金錢損失。記住：任何轉賬前先獨立查證，FPS 轉數快無法撤回。');
  }
  if (s.alertness < 50) {
    tips.push('🔔 警覺值偏低。騙子最愛說「時間緊迫」「最後機會」——這些都是製造壓力的話術。');
  }

  /* 必備通用提醒 */
  tips.push('📞 防騙易熱線 18222（24 小時）——懷疑被騙立刻撥打。');
  tips.push('🔍 防騙視伏器 Scameter ——輸入可疑電話、網址、帳號即可查核。');
  tips.push('🏛️ 香港警務處反詐騙協調中心 ADCC ——專責處理詐騙案件。');
  tips.push('💡 記住口訣：「別急、先查證、打官方、再決定」。');

  container.innerHTML = tips.map(tip => `<div class="tip-item">${tip}</div>`).join('');
}

function calculateEnding() {
  const stats = gameState.stats;
  for (const ending of endings) {
    if (ending.condition && ending.condition(stats)) {
      return ending;
    }
  }
  return endings[endings.length - 1];
}

// ===================================================================
// ===== 畫面切換 =====
// ===================================================================

function showStartScreen() {
  gameState.screen = 'start';
  stopCountdown();
  hideCountdown();
  document.getElementById('startScreen').style.display = 'flex';
  document.getElementById('identityScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('endingScreen').style.display = 'none';
}

function showIdentityScreen() {
  gameState.screen = 'identity';
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('identityScreen').style.display = 'flex';
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('endingScreen').style.display = 'none';
}

function showGameScreen() {
  gameState.screen = 'game';
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('identityScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'flex';
  document.getElementById('endingScreen').style.display = 'none';
  updateStatsUI();
  renderLevelTransition();
}

// ===================================================================
// ===== 初始化 =====
// ===================================================================

function selectIdentity(identityId) {
  gameState.identity = identityId;
  // 內地學生預設使用簡體中文
  if (identityId === 'mainland_student' && typeof setLanguage === 'function') {
    setLanguage('zh');
  }
  applyIdentityModifiers();
  showGameScreen();
}

function setLanguage(lang) {
  gameState.language = lang;
  document.documentElement.lang = lang;
  updateUIText();
}

function updateUIText() {
  const dataLangElements = document.querySelectorAll('[data-lang]');
  dataLangElements.forEach(el => {
    const key = el.getAttribute('data-lang');
    if (translations[key] && translations[key][gameState.language]) {
      el.textContent = translations[key][gameState.language];
    }
  });

  // 處理 placeholder 翻譯（如暱稱輸入框）
  const placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
  placeholderElements.forEach(el => {
    const key = el.getAttribute('data-lang-placeholder');
    if (translations[key] && translations[key][gameState.language]) {
      el.placeholder = translations[key][gameState.language];
    }
  });

  const currentScene = getCurrentScene();
  if (currentScene && gameState.screen === 'game') {
    renderScene();
  }

  if (gameState.screen === 'identity') {
    updateIdentityCards();
  }

  // 刷新面板關卡顯示（語言切換後）
  const levelDisplay = document.getElementById('panelLevelDisplay');
  if (levelDisplay) {
    levelDisplay.textContent = t('panel_level', {
      n: gameState.currentLevelIndex + 1,
      total: getLevelsArray().length
    });
  }
}

function updateIdentityCards() {
  const mainlandCard = document.querySelector('#mainlandCard .identity-desc');
  const localCard = document.querySelector('#localCard .identity-desc');
  const lang = gameState.language;

  if (mainlandCard) {
    const mt = introTexts.mainland_student;
    mainlandCard.textContent = (mt[lang] || mt['zh-TW'] || '');
  }
  if (localCard) {
    const lt = introTexts.local_hk_student;
    localCard.textContent = (lt[lang] || lt['zh-TW'] || '');
  }
}

function restartGame() {
  gameState.stats = {
    alertness: 50,
    calmness: 80,
    information: 50,
    riskScore: 0,
    money: 100,
    xp: 0,
    level: 1,
    score: 100
  };
  gameState.currentLevelIndex = 0;
  gameState.currentLevel = 0;  // 修復3：同步重置
  gameState.currentSceneId = null;
  gameState.neutralAttempts = {};
  gameState.history = [];
  gameState.identity = null;
  gameState.medals = [];
  gameState.scoreHistory = [];
  stopCountdown();

  // 梨寶：重置並重新顯示
  const pearRoot = document.getElementById('pearRoot');
  if (pearRoot) pearRoot.classList.remove('pear-hidden');

  showStartScreen();
}

// ===================================================================
// ===== 事件綁定 =====
// ===================================================================

// ===================================================================
// ===== 語言選擇彈窗 =====
// ===================================================================

function showLanguageModal() {
  const modal = document.getElementById('languageModal');
  const detected = detectBrowserLanguage();

  // 先套用偵測到的語言，讓彈窗文案以該語言顯示
  setLanguage(detected);

  if (!modal) {
    // 沒有彈窗元素則直接用偵測結果進入開始畫面
    showStartScreen();
    return;
  }

  // 同步頂部語言切換器的 active 狀態
  const langBtns = document.querySelectorAll('.lang-switcher .lang-btn');
  langBtns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === detected);
  });

  // 標記偵測到的語言按鈕
  const detectedBtn = modal.querySelector(`.lang-option[data-lang="${detected}"]`);
  if (detectedBtn) {
    detectedBtn.classList.add('lang-detected');
    const hint = detectedBtn.querySelector('.lang-detect-hint');
    if (hint) hint.textContent = t('lang_auto_detected');
  }

  modal.style.display = 'flex';

  // 綁定語言選項按鈕
  const options = modal.querySelectorAll('.lang-option');
  options.forEach(btn => {
    btn.onclick = () => {
      const lang = btn.getAttribute('data-lang');
      if (!lang) return;
      setLanguage(lang);

      // 同步更新頂部語言切換器的 active 狀態
      langBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
      });

      modal.style.display = 'none';
      showStartScreen();
    };
  });
}

// ===================================================================
// ===== 暱稱處理 =====
// ===================================================================

function setupNicknameInput() {
  const input = document.getElementById('nicknameInput');
  if (!input) return;

  // 從 localStorage 還原暱稱
  const saved = localStorage.getItem('antiScam_nickname');
  if (saved) {
    gameState.nickname = saved;
    input.value = saved;
  }

  input.addEventListener('input', () => {
    gameState.nickname = input.value.trim().slice(0, 20);
    localStorage.setItem('antiScam_nickname', gameState.nickname);
  });
}

// ===================================================================
// ===== 事件綁定 =====
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.addEventListener('click', showIdentityScreen);

  const mainlandCard = document.getElementById('mainlandCard');
  const localCard = document.getElementById('localCard');

  if (mainlandCard) mainlandCard.addEventListener('click', () => selectIdentity('mainland_student'));
  if (localCard) localCard.addEventListener('click', () => selectIdentity('local_hk_student'));

  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) restartBtn.addEventListener('click', restartGame);

  const backToMenuBtn = document.getElementById('backToMenuBtn');
  if (backToMenuBtn) backToMenuBtn.addEventListener('click', restartGame);

  // 頂部語言切換器（遊戲中隨時切換）
  const langBtns = document.querySelectorAll('.lang-switcher .lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang) {
        setLanguage(lang);
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // 切換語言後刷新面板關卡顯示
        updateStatsUI();
      }
    });
  });

  // 暱稱輸入
  setupNicknameInput();

  // 啟動時顯示語言選擇彈窗（而非直接進入開始畫面）
  showLanguageModal();
});
