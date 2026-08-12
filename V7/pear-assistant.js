// ===================================================================
// 梨寶 · 反詐小助手 (Pear Assistant)
// 別急，先查證 · 二次元風格懸浮伴遊組件
// -------------------------------------------------------------------
// 功能：
//   1. 純 SVG/CSS 繪製可愛梨子形象（idle 浮動 + 說話彈跳）
//   2. 表情切換：normal / warning / happy / serious
//   3. 配置驅動提示系統（進關、選對、選錯、超時、倒計時警告）
//   4. 點擊展開「反詐錦囊」面板（關卡線索 + 口訣 + 18222 一鍵複製）
//   5. 屬性聯動：警惕值<30 變嚴肅，冷靜值<30 顯示深呼吸
// ===================================================================

(function () {
  'use strict';

  // ===== 語言工具 =====
  function _lang() {
    return (typeof gameState !== 'undefined' && gameState.language) || 'zh-TW';
  }
  function _pick(obj) {
    if (!obj) return '';
    const lang = _lang();
    return obj[lang] || obj['zh-TW'] || obj['zh'] || obj['en'] || '';
  }

  // =================================================================
  // ===== 配置對象（可自由修改文案）=====
  // =================================================================
  const PEAR_CONFIG = {
    // --- 每關卡入場提示 ---
    levelEnter: {
      'l1_immigration': {
        'zh-TW': '這一關是假冒入境處來電，注意觀察細節哦！',
        'zh': '这一关是假冒入境处来电，注意观察细节哦！',
        'en': 'Level 1: Fake Immigration Call. Watch the details!'
      },
      'l2_phishing_sms': {
        'zh-TW': '這一關是釣魚簡訊騙局，小心可疑連結！',
        'zh': '这一关是钓鱼短信骗局，小心可疑链接！',
        'en': 'Level 2: Phishing SMS. Watch out for suspicious links!'
      },
      'l3_impersonation': {
        'zh-TW': '這一關是冒充熟人借錢，先核實身份！',
        'zh': '这一关是冒充熟人借钱，先核实身份！',
        'en': 'Level 3: Impersonating Acquaintance. Verify identity first!'
      },
      'l4_fake_rental': {
        'zh-TW': '這一關是虛假租房騙局，未睇樓唔好俾錢！',
        'zh': '这一关是虚假租房骗局，没看房不要给钱！',
        'en': 'Level 4: Fake Rental Scam. Never pay before viewing!'
      },
      'l5_online_shopping': {
        'zh-TW': '這一關是網上購物騙案，太平嘢要小心！',
        'zh': '这一关是网上购物骗案，太便宜的要小心！',
        'en': 'Level 5: Online Shopping Scam. Too cheap = suspicious!'
      },
      'l6_job_scam': {
        'zh-TW': '這一關是求職刷單騙局，先交錢嘅都係騙局！',
        'zh': '这一关是求职刷单骗局，先交钱的都是骗局！',
        'en': 'Level 6: Job Brushing Scam. Upfront fees = scam!'
      },
      'l7_deepfake': {
        'zh-TW': '這一關是 AI 換臉騙局，見到影片都唔好輕信！',
        'zh': '这一关是 AI 换脸骗局，看到视频都不要轻信！',
        'en': 'Level 7: AI Deepfake Scam. Even video can be fake!'
      },
      'lb_bonus_help_friend': {
        'zh-TW': '額外挑戰！幫小玲識破騙局，加油！',
        'zh': '额外挑战！帮小玲识破骗局，加油！',
        'en': 'Bonus Challenge! Help Siu Ling spot the scam!'
      }
    },
    // --- 通用提示 ---
    dangerousChoice: {
      'zh-TW': '⚠️ 這可能是危險選項哦！再想想？',
      'zh': '⚠️ 这可能是危险选项哦！再想想？',
      'en': '⚠️ This might be dangerous! Think again?'
    },
    consecutiveWrong: {
      'zh-TW': '別急，記住三字訣：先查證！',
      'zh': '别急，记住三字诀：先查证！',
      'en': "Don't rush! Remember: VERIFY FIRST!"
    },
    correctChoice: {
      'zh-TW': '太棒了！保持警惕！',
      'zh': '太棒了！保持警惕！',
      'en': 'Great job! Stay alert!'
    },
    countdownWarning: {
      'zh-TW': '時間緊迫，但別慌，冷靜判斷！',
      'zh': '时间紧迫，但别慌，冷静判断！',
      'en': "Time is short! Don't panic, think calmly!"
    },
    timeout: {
      'zh-TW': '超時了！遇到不確定的情況，先暫停查證！',
      'zh': '超时了！遇到不确定的情况，先暂停查证！',
      'en': "Time's up! When unsure, pause and verify!"
    },
    // --- 屬性聯動 ---
    lowAlertness: {
      'zh-TW': '你的警惕值偏低！要更加小心哦！',
      'zh': '你的警惕值偏低！要更加小心哦！',
      'en': 'Your alertness is low! Be extra careful!'
    },
    lowCalmness: {
      'zh-TW': '深呼吸，冷靜一下～',
      'zh': '深呼吸，冷静一下～',
      'en': 'Take a deep breath, calm down~'
    },
    // --- 反詐口訣 ---
    mantra: {
      'zh-TW': '先查證 · 不轉帳 · 不透露',
      'zh': '先查证 · 不转账 · 不透露',
      'en': 'Verify First · No Transfer · No Disclosure'
    }
  };

  // =================================================================
  // ===== 梨寶狀態 =====
  // =================================================================
  const pearState = {
    expression: 'normal',  // normal | warning | happy | serious
    consecutiveWrong: 0,
    bubbleTimer: null,
    pouchOpen: false,
    lowAlertnessActive: false,
    lowCalmnessActive: false,
    countdownWarned: false,
    docListenersBound: false  /* Bug 2 fix：防止重複綁定 document 級監聽 */
  };

  // =================================================================
  // ===== 初始化 =====
  // =================================================================
  function init() {
    if (document.getElementById('pearRoot')) return; // 防止重複初始化

    const root = document.createElement('div');
    root.id = 'pearRoot';
    root.className = 'pear-root';
    root.dataset.expression = 'normal';
    root.innerHTML = buildHTML();
    document.body.appendChild(root);

    // 綁定事件
    const mascot = root.querySelector('.pear-mascot');
    if (mascot) mascot.addEventListener('click', onMascotClick);

    const bubbleClose = root.querySelector('.pear-bubble-close');
    if (bubbleClose) bubbleClose.addEventListener('click', hideBubble);

    /* Bug 2 fix：關閉按鈕 — 第一行 stopPropagation，然後 panel.style.display='none' */
    const pouchClose = root.querySelector('#kit-close');
    if (pouchClose) {
      pouchClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closePouch();
      });
    }

    const copyBtn = root.querySelector('.pear-copy-hotline');
    if (copyBtn) copyBtn.addEventListener('click', copyHotline);

    /* Bug 2 fix：事件只綁定一次，防止重複 */
    if (pearState.docListenersBound) return;
    pearState.docListenersBound = true;

    /* Bug 2 fix：點擊面板外部關閉 — !panel.contains(e.target) && !pear.contains(e.target) */
    document.addEventListener('click', (e) => {
      if (!pearState.pouchOpen) return;
      const panel = document.getElementById('pearPouch');
      const pear = document.querySelector('.pear-mascot');
      if (!panel || !pear) return;
      if (!panel.contains(e.target) && !pear.contains(e.target)) {
        closePouch();
      }
    });

    /* Bug 2 fix：ESC 鍵關閉 */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pearState.pouchOpen) {
        closePouch();
      }
    });
  }

  // =================================================================
  // ===== HTML 結構（SVG 梨寶 + 氣泡 + 錦囊面板）=====
  // =================================================================
  function buildHTML() {
    return `
      <!-- 懸浮梨寶 -->
      <div class="pear-mascot" role="button" aria-label="梨寶反詐助手" tabindex="0">
        ${buildPearSVG()}
        <div class="pear-shadow"></div>
      </div>

      <!-- 對話氣泡 -->
      <div class="pear-bubble" id="pearBubble" style="display:none;">
        <div class="pear-bubble-close" aria-label="關閉">✕</div>
        <div class="pear-bubble-text" id="pearBubbleText"></div>
        <div class="pear-bubble-tail"></div>
      </div>

      <!-- 反詐錦囊面板 -->
      <div class="pear-pouch-overlay" id="pearPouchOverlay" style="display:none;"></div>
      <div class="pear-pouch" id="pearPouch" style="display:none;">
        <div class="pear-pouch-header">
          <span class="pear-pouch-title">🛡️ 反詐錦囊</span>
          <button class="pear-pouch-close" id="kit-close" aria-label="關閉">✕</button>
        </div>
        <div class="pear-pouch-body">
          <!-- 當前關卡提示 -->
          <div class="pear-pouch-section">
            <div class="pear-pouch-section-title">🔍 當前關卡線索</div>
            <div class="pear-pouch-clues" id="pearPouchClues">
              <div class="pear-pouch-loading">載入中…</div>
            </div>
          </div>
          <!-- 反詐口訣 -->
          <div class="pear-pouch-section">
            <div class="pear-pouch-section-title">💡 反詐口訣</div>
            <div class="pear-pouch-mantra" id="pearPouchMantra"></div>
          </div>
          <!-- 緊急求助 -->
          <div class="pear-pouch-section">
            <div class="pear-pouch-section-title">🆘 緊急求助</div>
            <div class="pear-pouch-hotline">
              <div class="pear-hotline-row">
                <span class="pear-hotline-icon">📞</span>
                <span class="pear-hotline-num">18222</span>
                <span class="pear-hotline-label">防騙易熱線</span>
              </div>
              <button class="pear-copy-hotline" id="pearCopyHotline">📋 一鍵複製</button>
              <div class="pear-hotline-extra">
                <span>🔍 防騙視伏器 Scameter</span>
                <span>👮 ADCC 反詐騙協調中心</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ===== 使用上傳嘅梨寶圖片替換 SVG =====
  function buildPearSVG() {
    return `
      <img class="pear-svg pear-image" src="assets/pear-mascot.jpg" alt="梨寶反詐助手" draggable="false"/>
    `;
  }

  // =================================================================
  // ===== 表情切換 =====
  // =================================================================
  function setExpression(expr) {
    const valid = ['normal', 'warning', 'happy', 'serious'];
    if (!valid.includes(expr)) expr = 'normal';
    pearState.expression = expr;

    const root = document.getElementById('pearRoot');
    if (!root) return;
    root.dataset.expression = expr;

    // 切換嘴巴顯示
    const mouths = root.querySelectorAll('.pear-mouth, .pear-mouth-happy-tongue');
    mouths.forEach(m => m.style.display = 'none');

    const mouthMap = {
      normal: '.pear-mouth-normal',
      warning: '.pear-mouth-warning',
      happy: '.pear-mouth-happy, .pear-mouth-happy-tongue',
      serious: '.pear-mouth-serious'
    };
    root.querySelectorAll(mouthMap[expr]).forEach(m => m.style.display = '');

    // 切換眉毛（只有 serious 顯示）
    const brows = root.querySelector('.pear-brows');
    if (brows) brows.style.display = expr === 'serious' ? '' : 'none';

    // 切換眼睛形狀（warning 時眼睛變小）
    const eyeWhites = root.querySelectorAll('.pear-eye-white');
    const pupils = root.querySelectorAll('.pear-eye-pupil');
    if (expr === 'warning') {
      eyeWhites.forEach(e => e.setAttribute('ry', '5'));
      pupils.forEach(p => p.setAttribute('r', '3'));
    } else if (expr === 'happy') {
      // happy 時眼睛變成 ∩∩（笑眯眯）
      eyeWhites.forEach(e => e.style.display = 'none');
      pupils.forEach(p => p.style.display = 'none');
    } else {
      eyeWhites.forEach(e => { e.setAttribute('ry', '7'); e.style.display = ''; });
      pupils.forEach(p => { p.setAttribute('r', '3.5'); p.style.display = ''; });
    }
  }

  // =================================================================
  // ===== 氣泡提示 =====
  // =================================================================
  function showBubble(text, duration) {
    if (!text) return;
    const bubble = document.getElementById('pearBubble');
    const textEl = document.getElementById('pearBubbleText');
    if (!bubble || !textEl) return;

    // 清除上一個定時器
    if (pearState.bubbleTimer) {
      clearTimeout(pearState.bubbleTimer);
      pearState.bubbleTimer = null;
    }

    textEl.textContent = text;
    bubble.style.display = 'block';
    bubble.classList.add('pear-bubble-show');

    // 說話動畫
    const mascot = document.querySelector('.pear-mascot');
    if (mascot) {
      mascot.classList.add('pear-talking');
      setTimeout(() => mascot.classList.remove('pear-talking'), 1200);
    }

    // 自動關閉
    if (duration !== 0) {
      pearState.bubbleTimer = setTimeout(() => hideBubble(), duration || 4000);
    }
  }

  function hideBubble() {
    const bubble = document.getElementById('pearBubble');
    if (!bubble) return;
    bubble.classList.remove('pear-bubble-show');
    bubble.style.display = 'none';
    if (pearState.bubbleTimer) {
      clearTimeout(pearState.bubbleTimer);
      pearState.bubbleTimer = null;
    }
  }

  // =================================================================
  // ===== 反詐錦囊面板 =====
  // =================================================================
  function togglePouch() {
    if (pearState.pouchOpen) {
      closePouch();
    } else {
      openPouch();
    }
  }

  // 修復2：分離 openPouch / closePouch，關閉邏輯明確
  function openPouch() {
    pearState.pouchOpen = true;
    const pouch = document.getElementById('pearPouch');
    const overlay = document.getElementById('pearPouchOverlay');
    if (!pouch || !overlay) return;
    updatePouchContent();
    pouch.style.display = 'flex';
    overlay.style.display = 'block';
    hideBubble();
  }

  function closePouch() {
    pearState.pouchOpen = false;
    const pouch = document.getElementById('pearPouch');
    const overlay = document.getElementById('pearPouchOverlay');
    if (!pouch || !overlay) return;
    pouch.style.display = 'none';
    overlay.style.display = 'none';
  }

  function updatePouchContent() {
    // 當前關卡線索
    const cluesEl = document.getElementById('pearPouchClues');
    if (cluesEl) {
      const level = getCurrentLevelInfo();
      if (level && level.redFlags && level.redFlags.length > 0) {
        cluesEl.innerHTML = level.redFlags.slice(0, 3).map((rf, i) =>
          `<div class="pear-clue-item"><span class="pear-clue-num">${i + 1}</span><span class="pear-clue-text">${rf}</span></div>`
        ).join('');
      } else {
        cluesEl.innerHTML = '<div class="pear-pouch-loading">暫無線索</div>';
      }
    }
    // 反詐口訣
    const mantraEl = document.getElementById('pearPouchMantra');
    if (mantraEl) mantraEl.textContent = _pick(PEAR_CONFIG.mantra);
  }

  function getCurrentLevelInfo() {
    if (typeof gameState === 'undefined') return null;
    const levels = (typeof LEVELS !== 'undefined') ? LEVELS
                 : (typeof levels !== 'undefined') ? levels
                 : (window.LEVELS || window.levels || []);
    return levels[gameState.currentLevelIndex] || null;
  }

  // ===== 複製熱線 =====
  function copyHotline() {
    const num = '18222';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num).then(() => {
        showBubble('✅ 已複製 18222 到剪貼簿！', 2500);
      }).catch(() => fallbackCopy(num));
    } else {
      fallbackCopy(num);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showBubble('✅ 已複製 18222！', 2500); }
    catch(e) { showBubble('請手動撥打 18222', 3000); }
    document.body.removeChild(ta);
  }

  // =================================================================
  // ===== 點擊梨寶 =====
  // =================================================================
  function onMascotClick() {
    if (pearState.pouchOpen) {
      togglePouch();
    } else {
      togglePouch();
    }
  }

  // =================================================================
  // ===== 觸發器 API（供 game.js 調用）=====
  // =================================================================

  // 進入新關卡
  function onLevelEnter(levelId) {
    pearState.consecutiveWrong = 0;
    pearState.countdownWarned = false;
    setExpression('normal');

    const hint = PEAR_CONFIG.levelEnter[levelId];
    if (hint) {
      setTimeout(() => showBubble(_pick(hint), 4000), 600);
    }
  }

  // 玩家選擇
  function onChoice(choice) {
    if (!choice) return;
    const fbType = choice.feedbackType || 'mid';

    if (fbType === 'good') {
      pearState.consecutiveWrong = 0;
      setExpression('happy');
      showBubble(_pick(PEAR_CONFIG.correctChoice), 3000);
    } else if (fbType === 'bad') {
      pearState.consecutiveWrong++;
      setExpression('warning');
      showBubble(_pick(PEAR_CONFIG.dangerousChoice), 3500);

      // 連續選錯 2 次
      if (pearState.consecutiveWrong >= 2) {
        setTimeout(() => {
          setExpression('serious');
          showBubble(_pick(PEAR_CONFIG.consecutiveWrong), 4000);
        }, 3800);
      }
    } else {
      // mid / neutral
      setExpression('normal');
    }
  }

  // 倒計時最後 5 秒
  function onCountdownWarning() {
    if (pearState.countdownWarned) return;
    pearState.countdownWarned = true;
    setExpression('warning');
    showBubble(_pick(PEAR_CONFIG.countdownWarning), 3000);
  }

  // 超時
  function onTimeout() {
    setExpression('serious');
    showBubble(_pick(PEAR_CONFIG.timeout), 4500);
  }

  // 屬性變化（警惕值 / 冷靜值聯動）
  function onStatsChange(stats) {
    if (!stats) return;
    const alertness = stats.alertness ?? 50;
    const calmness = stats.calmness ?? 80;

    // 警惕值低
    if (alertness < 30 && !pearState.lowAlertnessActive) {
      pearState.lowAlertnessActive = true;
      setExpression('serious');
      setTimeout(() => showBubble(_pick(PEAR_CONFIG.lowAlertness), 3500), 500);
    } else if (alertness >= 40) {
      pearState.lowAlertnessActive = false;
    }

    // 冷靜值低
    if (calmness < 30 && !pearState.lowCalmnessActive) {
      pearState.lowCalmnessActive = true;
      const mascot = document.querySelector('.pear-mascot');
      if (mascot) mascot.classList.add('pear-breathing');
      setTimeout(() => showBubble(_pick(PEAR_CONFIG.lowCalmness), 3500), 500);
    } else if (calmness >= 40) {
      pearState.lowCalmnessActive = false;
      const mascot = document.querySelector('.pear-mascot');
      if (mascot) mascot.classList.remove('pear-breathing');
    }
  }

  // =================================================================
  // ===== 暴露 API =====
  // =================================================================
  window.PearAssistant = {
    init: init,
    setExpression: setExpression,
    showBubble: showBubble,
    hideBubble: hideBubble,
    togglePouch: togglePouch,
    onLevelEnter: onLevelEnter,
    onChoice: onChoice,
    onCountdownWarning: onCountdownWarning,
    onTimeout: onTimeout,
    onStatsChange: onStatsChange,
    config: PEAR_CONFIG
  };

  // ===== 自動初始化（DOM 就緒後）=====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})();
