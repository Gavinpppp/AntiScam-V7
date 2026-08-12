// ===================================================================
// Anti-Scam Story Simulator — Level Engine
// 別急，先查證 · 關卡渲染引擎（配置驅動）
// -------------------------------------------------------------------
// 職責：
//   1. 讀取 levels.js 中嘅 LEVELS 配置（唯一關卡數據源）
//   2. 提供場景查詢、分支跳轉
//   3. 按 scene.type 分派渲染：
//        choice          → 普通選擇（game.js 既有 UI）
//        result          → 結果卡片（game.js 既有 UI）
//        deep_narrative  → 多步驟图文 + 打字機效果
//        split_screen    → 左右分欄（朋友說服）
//        message / mixed / input → 沿用 game.js/enhanced-ui.js
//   4. 處理特殊跳轉：__next_level__ / __ending__
// ===================================================================

(function () {
  'use strict';

  // ---------- 工具：語言本地化 ----------
  function _t(obj, suffix) {
    const lang = (window.gameState && window.gameState.language) || 'zh-TW';
    if (lang === 'en' && obj[suffix + 'En']) return obj[suffix + 'En'];
    if (lang === 'zh' && obj[suffix + 'Zh']) return obj[suffix + 'Zh'];
    return obj[suffix];
  }

  function _sceneText(s) { return _t(s, 'text'); }
  function _choiceText(c) { return _t(c, 'text'); }
  function _fbText(c)    { return _t(c, 'feedback'); }
  function _levelTitle(l){ return _t(l, 'title'); }

  // ---------- 關卡查詢 ----------
  function getCurrentLevel() {
    const idx = window.gameState ? window.gameState.currentLevelIndex : 0;
    const allLevels = window.LEVELS || (window.levels && window.levels.length ? window.levels : []);
    if (!allLevels || !allLevels.length) return null;
    // 如果 LEVELS 存在（新配置），優先使用
    const src = window.LEVELS && window.LEVELS.length ? window.LEVELS : allLevels;
    return src[Math.min(idx, src.length - 1)] || null;
  }

  function getAllLevels() {
    return window.LEVELS || window.levels || [];
  }

  function findSceneById(sceneId, level) {
    const lv = level || getCurrentLevel();
    if (!lv || !lv.scenes) return null;
    const hit = lv.scenes.find(s => s.id === sceneId);
    if (hit) return hit;
    // 跨關卡查詢（用於場景引用錯誤時嘅備用）
    const levels = getAllLevels();
    for (const l of levels) {
      const s = l.scenes && l.scenes.find(x => x.id === sceneId);
      if (s) return s;
    }
    return null;
  }

  function getFirstSceneOfLevel(levelIndex) {
    const levels = getAllLevels();
    const lv = levels[levelIndex];
    if (!lv || !lv.scenes || !lv.scenes.length) return null;
    return lv.scenes[0];
  }

  // ---------- 場景跳轉（統一入口）----------
  function goToSceneById(nextId) {
    if (!nextId) return;
    // 優先使用 game.js 提供嘅全局跳轉（佢哋有 level transition overlay + medal check）
    if (nextId === '__next_level__') {
      if (typeof window.nextLevel === 'function') { window.nextLevel(); return; }
      nextLevel();
      return;
    }
    if (nextId === '__ending__') {
      if (typeof window.showEnding === 'function') { window.showEnding(); return; }
      return;
    }

    const scene = findSceneById(nextId);
    if (!scene) {
      console.warn('[level-engine] Scene not found:', nextId, '→ advancing');
      if (typeof window.nextLevel === 'function') window.nextLevel(); else nextLevel();
      return;
    }
    if (typeof window.goToScene === 'function') {
      window.goToScene(nextId);
    } else if (typeof window.renderScene === 'function') {
      window.renderScene(scene);
    }
  }

  function nextLevel() {
    if (!window.gameState) return;
    const curIdx = window.gameState.currentLevelIndex;
    const maxIdx = getAllLevels().length - 1;
    const isBonus = getCurrentLevel() && getCurrentLevel().isBonus;
    let nextIdx = curIdx + 1;
    // 跳過 bonus，除非玩家喺 bonus 內
    if (!isBonus) {
      const nxt = getAllLevels()[nextIdx];
      if (nxt && nxt.isBonus) nextIdx++; // skip bonus when linear progression
    }
    if (nextIdx > maxIdx) {
      if (typeof window.showEnding === 'function') window.showEnding();
      return;
    }
    window.gameState.currentLevelIndex = nextIdx;
    window.gameState.currentLevel = nextIdx;  // 修復3：同步 currentLevel
    if (typeof window.startLevel === 'function') {
      window.startLevel(nextIdx);
    } else {
      const firstScene = getFirstSceneOfLevel(nextIdx);
      if (firstScene && typeof window.goToScene === 'function') {
        window.goToScene(firstScene.id);
      }
    }
  }

  // ---------- 選擇處理（通用，兼容 choice.nextSceneId）----------
  function handleConfigChoice(choice) {
    if (!choice) return;
    const feedback = _fbText(choice);
    const fbType = choice.feedbackType || 'mid';
    const effects = choice.effects || {};
    const sceneId = choice.nextSceneId;

    // 應用屬性影響
    if (typeof window.applyEffects === 'function') {
      window.applyEffects(effects, (choice.id || 'cfg_choice'));
    }

    const navigate = () => goToSceneById(sceneId);

    if (feedback) {
      if (fbType === 'bad' && typeof window.triggerAlarm === 'function') {
        window.triggerAlarm(() => {
          if (typeof window.showFeedbackWithContinue === 'function') {
            window.showFeedbackWithContinue(feedback, fbType, navigate);
          } else { navigate(); }
        });
      } else if (typeof window.showFeedbackWithContinue === 'function') {
        window.showFeedbackWithContinue(feedback, fbType, navigate);
      } else {
        setTimeout(navigate, 800);
      }
    } else {
      navigate();
    }
  }

  // =================================================================
  // ===== 類型分派：根據 scene.type 渲染 =====
  // =================================================================
  function renderSceneByType(scene) {
    if (!scene) return;
    const type = scene.type || 'message';

    // 通用：先渲染場景文本（game.js 已有 renderScene 會處理，但呢度負責 special types）
    switch (type) {
      case 'deep_narrative':
        return renderDeepNarrative(scene);
      case 'split_screen':
        return renderSplitScreen(scene);
      default:
        // choice / result / message / mixed / input → 交畀 game.js renderScene 處理
        // game.js 會根據 scene.type 調用 choicesContainer / inputContainer / renderMixedInput 等
        return null; // 表示交由上層處理
    }
  }

  // =================================================================
  // ===== deep_narrative：多步驟图文 + 打字機效果 =====
  // =================================================================
  function renderDeepNarrative(scene) {
    const container = document.getElementById('visualContainer');
    const textEl    = document.getElementById('sceneText');
    const choicesEl = document.getElementById('choicesContainer');
    if (!container) return;

    const narrative = scene.narrative || [];
    const choices   = scene.choices   || [];

    // 清空 visual 區，塞入 narrative 容器（game.js renderScene 會預先 hide visualContainer，所以要顯示返）
    container.classList.add('visual-deep-narrative');
    container.style.display = 'block';
    container.innerHTML = `
      <div class="deep-narrative-wrap" id="deepNarrativeWrap">
        <div class="deep-step-progress" id="deepStepProgress"></div>
        <div class="deep-step-list" id="deepStepList"></div>
        <button class="btn deep-next-btn" id="deepNextBtn" style="display:none;">
          <span class="deep-next-label">繼續</span>
          <span class="deep-next-arrow">→</span>
        </button>
      </div>
    `;

    const listEl     = document.getElementById('deepStepList');
    const progressEl = document.getElementById('deepStepProgress');
    const nextBtn    = document.getElementById('deepNextBtn');
    const stepTotal  = narrative.length;

    // 更新步驟進度
    function updateProgress(idx) {
      progressEl.innerHTML = '';
      for (let i = 0; i < stepTotal; i++) {
        const dot = document.createElement('span');
        dot.className = 'deep-step-dot' + (i < idx ? ' done' : '') + (i === idx ? ' active' : '');
        progressEl.appendChild(dot);
      }
    }

    // 打字機效果（異步）
    function typewriter(el, text, speed = 28) {
      return new Promise(resolve => {
        el.classList.remove('done');
        el.textContent = '';
        let i = 0;
        const len = text.length;
        if (!len) { el.classList.add('done'); resolve(); return; }
        const timer = setInterval(() => {
          el.textContent += text.charAt(i++);
          if (i >= len) {
            clearInterval(timer);
            el.classList.add('done');
            resolve();
          }
        }, speed);
      });
    }

    // 渲染單個步驟（帶動畫）
    let currentStep = 0;
    let typeRunning = false;
    let allStepsDone = false;

    async function renderStep(idx) {
      if (idx >= stepTotal) {
        // 所有步驟完成 → 顯示 choices
        allStepsDone = true;
        nextBtn.style.display = 'none';
        renderDeepChoices(choices, choicesEl);
        updateProgress(stepTotal);
        return { storyRendered: true };
      }
      typeRunning = true;
      updateProgress(idx);
      const step = narrative[idx];
      const stepEl = document.createElement('div');
      stepEl.className = 'deep-step' + (idx === stepTotal - 1 ? ' last' : '');
      stepEl.innerHTML = `
        <div class="deep-step-img" role="img" aria-label="${step.caption || ''}">${step.image || '📝'}</div>
        <div class="deep-step-content">
          ${step.caption ? `<div class="deep-step-caption">${step.caption}</div>` : ''}
          <div class="deep-step-text"></div>
        </div>
      `;
      listEl.appendChild(stepEl);
      // 滾動到新步驟
      setTimeout(() => stepEl.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);

      const textNode = stepEl.querySelector('.deep-step-text');
      await typewriter(textNode, _t(step, 'text') || step.text || '');
      typeRunning = false;

      if (idx === stepTotal - 1) {
        // 最後一步：自動顯示 choices，唔好要下一個 step
        allStepsDone = true;
        nextBtn.style.display = 'none';
        renderDeepChoices(choices, choicesEl);
        updateProgress(stepTotal);
      } else {
        // 顯示繼續按鈕
        nextBtn.style.display = 'inline-flex';
        nextBtn.innerHTML = `<span class="deep-next-label">${window.t ? window.t('continue') : '繼續'}</span><span class="deep-next-arrow">→</span>`;
      }
      return { storyRendered: true };
    }

    nextBtn.onclick = () => {
      if (typeRunning) return; // 打字中，唔好跳
      if (allStepsDone) return;
      currentStep++;
      renderStep(currentStep);
    };

    // 渲染 choices
    function renderDeepChoices(cs, containerEl) {
      if (!containerEl || !cs || !cs.length) return;
      containerEl.style.display = 'flex';
      containerEl.innerHTML = '';
      containerEl.onclick = null;  /* Bug 1 fix：清除舊嘅容器級監聽 */

      cs.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn deep-choice-btn';
        btn.dataset.deepChoiceIndex = idx;
        btn.innerHTML = `<span class="choice-text">${_choiceText(choice)}</span>`;
        containerEl.appendChild(btn);
      });

      /* Bug 1 fix：事件委託喺 containerEl 上，用 closest 判斷 */
      containerEl.onclick = (e) => {
        const btn = e.target.closest('.choice-btn');
        if (!btn) return;             /* 點唔到選項卡片 → return */
        if (btn.disabled) return;
        const idx = parseInt(btn.dataset.deepChoiceIndex, 10);
        if (isNaN(idx) || !cs[idx]) return;
        /* 立即禁用所有選項，防止重複點擊 */
        containerEl.querySelectorAll('.choice-btn').forEach(b => {
          b.disabled = true; b.classList.add('choice-disabled');
        });
        handleConfigChoice(cs[idx]);
      };

      containerEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // 同時更新 sceneText（顯示主題提示）
    if (textEl) {
      textEl.textContent = _sceneText(scene) || '';
    }

    // 停止上一個場景嘅倒計時（deep_narrative 係自節奏，唔用倒計時）
    if (typeof window.stopCountdown === 'function') window.stopCountdown();

    // 啟動第一步
    updateProgress(0);
    renderStep(0);

    return { storyRendered: true };
  }

  // =================================================================
  // ===== split_screen：額外關卡左右分欄（朋友說服）=====
  // =================================================================
  function renderSplitScreen(scene) {
    const visualEl = document.getElementById('visualContainer');
    const textEl   = document.getElementById('sceneText');
    if (!visualEl) return;

    const cfg = scene.splitConfig || {};
    const trust = Object.assign({ initial: 30, max: 100, min: 0, success: 100, fail: 0 }, cfg.trustMeter || {});
    const messages = cfg.chatMessages || [];
    const vulns = JSON.parse(JSON.stringify(cfg.vulnerabilities || []));
    const persuasions = cfg.persuasionOptions || [];

    // 狀態
    let trustValue = trust.initial;
    let msgCursor = 0;
    let gameOver = false;

    visualEl.classList.add('visual-split-screen');
    visualEl.style.display = 'block';
    visualEl.innerHTML = `
      <div class="split-root" id="splitRoot">
        <!-- 頂部信任度條 -->
        <div class="split-trustbar">
          <span class="split-trust-label">🤝 小玲信任度</span>
          <div class="split-trust-track">
            <div class="split-trust-fill" id="splitTrustFill" style="width:${pct(trustValue)}%"></div>
          </div>
          <span class="split-trust-value" id="splitTrustValue">${trustValue}/${trust.max}</span>
        </div>

        <div class="split-body">
          <!-- 左：聊天記錄 -->
          <div class="split-col split-col-left">
            <div class="split-col-title">💬 小玲與阿偉嘅對話</div>
            <div class="split-chat" id="splitChat"></div>
            <button class="btn split-next-msg" id="splitNextMsg">顯示下一條 →</button>
          </div>

          <!-- 右：說服控制 -->
          <div class="split-col split-col-right">
            <div class="split-col-title">🎯 你嘅行動</div>
            <div class="split-section-label">🔍 指出漏洞（對應上面對話）</div>
            <div class="split-vuln-list" id="splitVulnList"></div>

            <div class="split-section-label">💡 說服小玲</div>
            <div class="split-persuade-list" id="splitPersuadeList"></div>

            <div class="split-feedback" id="splitFeedback" style="display:none;"></div>
          </div>
        </div>
      </div>
    `;

    const chatEl       = document.getElementById('splitChat');
    const vulnListEl   = document.getElementById('splitVulnList');
    const persuadeEl   = document.getElementById('splitPersuadeList');
    const trustFillEl  = document.getElementById('splitTrustFill');
    const trustValueEl = document.getElementById('splitTrustValue');
    const feedbackEl   = document.getElementById('splitFeedback');
    const nextMsgBtn   = document.getElementById('splitNextMsg');

    if (textEl) textEl.textContent = _sceneText(scene) || '';
    if (typeof window.stopCountdown === 'function') window.stopCountdown();

    // ---------- 信任度更新 ----------
    function updateTrust(delta, reason) {
      const old = trustValue;
      trustValue = Math.max(trust.min, Math.min(trust.max, trustValue + delta));
      trustFillEl.style.width = pct(trustValue) + '%';
      trustValueEl.textContent = `${trustValue}/${trust.max}`;
      // 顏色
      const ratio = trustValue / trust.max;
      trustFillEl.style.background = ratio < 0.3
        ? 'linear-gradient(90deg, #EF4444, #B91C1C)'
        : ratio < 0.7
          ? 'linear-gradient(90deg, #F59E0B, #D97706)'
          : 'linear-gradient(90deg, #10B981, #047857)';
      if (reason) {
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = `<span class="split-fb-delta" style="color:${delta>=0?'#10B981':'#EF4444'}">${delta>=0?'▲':'▼'} ${Math.abs(delta)}</span> <span class="split-fb-reason">${reason}</span>`;
      }
      checkWinLose();
    }

    function pct(v) { return Math.round((v / trust.max) * 100); }

    // ---------- 勝負檢查 ----------
    function checkWinLose() {
      if (gameOver) return;
      if (trustValue >= trust.success) {
        gameOver = true;
        setTimeout(() => {
          const sf = scene.successScene || 'lb_s_success';
          goToSceneById(sf);
        }, 800);
      } else if (trustValue <= trust.fail) {
        gameOver = true;
        setTimeout(() => {
          const ff = scene.failScene || 'lb_s_fail';
          goToSceneById(ff);
        }, 800);
      } else if (msgCursor >= messages.length && vulns.every(v => v.revealed) && trustValue < trust.success) {
        // 所有訊息顯示完 + 所有漏洞已揭曉，但信任度未滿 → 判信賴區間
        setTimeout(() => {
          goToSceneById(trustValue >= 60 ? (scene.successScene || 'lb_s_success') : (scene.failScene || 'lb_s_fail'));
        }, 1200);
      }
    }

    // ---------- 聊天訊息 ----------
    function appendMessage(m) {
      const el = document.createElement('div');
      el.className = 'split-chat-msg split-chat-' + m.from;
      el.dataset.id = m.id;
      el.innerHTML = `
        <div class="split-chat-header">
          <span class="split-chat-name">${m.name || ''}</span>
          <span class="split-chat-time">${m.time || ''}</span>
        </div>
        <div class="split-chat-body"></div>
      `;
      chatEl.appendChild(el);
      const body = el.querySelector('.split-chat-body');
      // 簡單打字機
      let i = 0; const txt = m.text || '';
      const t = setInterval(() => {
        body.textContent += txt.charAt(i++);
        if (i >= txt.length) clearInterval(t);
      }, 20);
      chatEl.scrollTop = chatEl.scrollHeight;
      // 高亮對應嘅訊息（漏洞揭曉時）
    }

    function nextMessage() {
      if (msgCursor >= messages.length) {
        nextMsgBtn.disabled = true;
        nextMsgBtn.textContent = '所有訊息已顯示';
        return;
      }
      appendMessage(messages[msgCursor]);
      msgCursor++;
      if (msgCursor >= messages.length) {
        nextMsgBtn.disabled = true;
        nextMsgBtn.textContent = '所有訊息已顯示';
      }
      checkWinLose();
    }
    nextMsgBtn.onclick = nextMessage;

    // ---------- 漏洞列表 ----------
    function renderVulns() {
      vulnListEl.innerHTML = '';
      vulns.forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'split-vuln-btn' + (v.revealed ? ' revealed' : '');
        btn.dataset.vid = v.id;
        btn.innerHTML = v.revealed
          ? `<span class="vuln-ok">✓</span> <span class="vuln-text">${v.text}</span><br><small class="vuln-hint">${v.hint || ''}</small>`
          : `<span class="vuln-id">🔍 對應訊息 ${v.matchMessageId ? (msgIdLabel(v.matchMessageId)) : '?'}</span> <span class="vuln-text-sm">點擊後，你指出呢個漏洞</span>`;
        btn.onclick = () => {
          if (v.revealed) return;
          // 需要該訊息已經顯示
          const visible = msgCursor >= (msgIndexOf(v.matchMessageId) + 1);
          if (!visible) {
            feedbackEl.style.display = 'block';
            feedbackEl.innerHTML = `<span style="color:#F59E0B">⚠️</span> 呢條訊息仲未顯示，先按「顯示下一條」。`;
            return;
          }
          v.revealed = true;
          // 高亮對應聊天訊息
          if (v.matchMessageId) {
            const mEl = chatEl.querySelector(`.split-chat-msg[data-id="${v.matchMessageId}"]`);
            if (mEl) { mEl.classList.add('split-chat-msg-marked'); }
          }
          updateTrust(10, `你指出漏洞：${v.text}`);
          renderVulns();
          renderPersuasions();
        };
        vulnListEl.appendChild(btn);
      });
    }

    function msgIdLabel(id) {
      const i = msgIndexOf(id);
      return i >= 0 ? `#${i + 1}` : id;
    }
    function msgIndexOf(id) {
      return messages.findIndex(m => m.id === id);
    }

    // ---------- 說服選項 ----------
    function renderPersuasions() {
      persuadeEl.innerHTML = '';
      persuasions.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'split-persuade-btn';
        btn.innerHTML = `<span class="persuade-text">${_t(p, 'text') || p.text}</span><span class="persuade-reward">+${p.trustChange} 信任</span>`;
        btn.onclick = () => {
          if (gameOver) return;
          // requiresVulnerability：需要對應漏洞已揭曉
          const ok = !p.requiresVulnerability || vulns.find(v => v.id === p.requiresVulnerability)?.revealed;
          if (!ok) {
            const reason = _t(p, 'failureText') || p.failureText || '你仲未指出對應嘅漏洞，小玲唔信你。';
            updateTrust(-5, reason);
          } else {
            updateTrust(p.trustChange, `你說：${truncate(_t(p,'text')||p.text, 30)}`);
            btn.disabled = true;
            btn.classList.add('persuade-done');
          }
          renderPersuasions();
        };
        persuadeEl.appendChild(btn);
      });
    }

    function truncate(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

    // ---------- 初始化 ----------
    renderVulns();
    renderPersuasions();
    // 預顯示前 3 條訊息（設定場景氛圍）
    for (let i = 0; i < 3; i++) nextMessage();

    return { storyRendered: true };
  }

  // =================================================================
  // ===== 導出 =====
  // =================================================================
  window.LevelEngine = {
    getCurrentLevel,
    getAllLevels,
    findSceneById,
    getFirstSceneOfLevel,
    goToSceneById,
    nextLevel,
    handleConfigChoice,
    renderSceneByType,
    renderDeepNarrative,
    renderSplitScreen,
    _sceneText,
    _choiceText,
    _fbText,
    _levelTitle
  };
})();
