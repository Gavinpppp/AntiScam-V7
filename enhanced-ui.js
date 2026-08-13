// ===================================================================
// Anti-Scam Story Simulator — Enhanced UI Components
// 別急，先查證 · 增強互動元件
// -------------------------------------------------------------------
// 包含三個可復用元件：
//   1. 混合輸入元件（mixed_input）：3 個預設選項 + 「其他：____」自由輸入
//   2. 釣魚簡訊鎖屏元件（sms_lockscreen）：模擬手機鎖屏收到簡訊
//   3. 入境處來電元件（phone_call_immigration）：仿真來電 + 語言選擇 + 占位語音接口
//
// 與 game.js 整合方式：
//   - 場景 type 為 "mixed_input" → 調用 renderMixedInput(scene)
//   - 場景 visual.type 為 "sms_lockscreen" → 調用 renderSmsLockscreen(visual)
//   - 場景 visual.type 為 "phone_call_immigration" → 調用 renderImmigrationCall(visual)
// ===================================================================

// ===================================================================
// ===== 1. 混合輸入元件（選項 + 自主打字）=====
// ===================================================================

/**
 * 渲染混合輸入場景
 * @param {Object} scene - 場景資料，需包含 mixedConfig
 *   mixedConfig: {
 *     choices: Array<{id, text, textEn, textZh, feedbackType, feedback, feedbackEn, feedbackZh, effects, nextSceneId}>,
 *     inputConfig: {
 *       placeholder, placeholderEn, placeholderZh,
 *       goodKeywords: String[],   // 命中視為正確
 *       badKeywords: String[],    // 命中視為錯誤
 *       goodFeedback, goodFeedbackEn, goodFeedbackZh,
 *       badFeedback, badFeedbackEn, badFeedbackZh,
 *       neutralFeedback, neutralFeedbackEn, neutralFeedbackZh,
 *       goodNextSceneId, badNextSceneId, neutralNextSceneId
 *     }
 *   }
 */
function renderMixedInput(scene) {
  const container = document.getElementById('choicesContainer');
  const inputContainer = document.getElementById('inputContainer');
  if (!container) return;

  // 隱藏舊的文字輸入容器
  if (inputContainer) inputContainer.style.display = 'none';

  container.style.display = 'flex';
  container.innerHTML = '';

  const config = scene.mixedConfig;
  if (!config || !config.choices) {
    console.warn('renderMixedInput: missing mixedConfig.choices');
    return;
  }

  // 確保 inputConfig 關鍵字有修復4要求嘅默認值
  if (!config.inputConfig) config.inputConfig = {};
  const ic = config.inputConfig;
  if (!Array.isArray(ic.goodKeywords) || ic.goodKeywords.length === 0) {
    ic.goodKeywords = ['查證','查证','核實','核实','18222','掛斷','挂断','掛電話','挂电话','報警','报警','唔轉賬','不轉賬','不转账','問學校','问学校','先查','先核實','先核实','先查證','查证'];
  }
  if (!Array.isArray(ic.badKeywords) || ic.badKeywords.length === 0) {
    ic.badKeywords = ['轉賬','转账','匯款','汇款','密碼','密码','驗證碼','验证码','先交錢','先交钱','馬上轉','马上转','轉錢','转钱','過數','过数','過帳','过账','支付','付款','付款'];
  }
  if (!ic.neutralFeedback && !ic.neutralFeedbackZh && !ic.neutralFeedbackEn) {
    const lang = gameState.language;
    if (lang === 'en') ic.neutralFeedbackEn = 'Interesting thought, but remember: when in doubt, verify first!';
    else if (lang === 'zh') ic.neutralFeedbackZh = '你的想法很有意思，但记住：不确定时，先查证！';
    else ic.neutralFeedback = '你嘅想法好有意思，但記住：唔確定嘅時候，先查證！';
  }

  /* 修復2：防抖工具 */
  const debounce = (fn, wait=300) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last < wait) return;
      last = now;
      return fn.apply(this, args);
    };
  };

  /* Bug 1 fix：清除舊嘅容器級監聽 */
  container.onclick = null;

  // 渲染 3 個預設選項（A/B/C）— Bug 1 fix：用 dataset 存索引，唔綁個別 onclick
  config.choices.forEach((choice, idx) => {
    const letter = String.fromCharCode(65 + idx); // A, B, C
    const btn = document.createElement('button');
    btn.className = 'choice-btn mixed-choice-btn';
    btn.dataset.mixedChoiceIndex = idx;
    btn.innerHTML = `
      <span class="choice-letter">${letter}</span>
      <span class="choice-text">${getChoiceText(choice)}</span>
    `;
    container.appendChild(btn);
  });

  // 第 4 個選項：「其他：____」可展開輸入框 — 只有騙子對話 (speaker === 'scammer') 先顯示
  let toggle = null, wrap = null, input = null, submit = null, voiceBtn = null;
  if (scene && scene.speaker === 'scammer') {
    const otherCard = document.createElement('div');
    otherCard.className = 'mixed-other-card';
    const voiceBtnHTML = (typeof renderVoiceInputButtonHTML === 'function')
      ? renderVoiceInputButtonHTML('mixedOtherVoiceBtn')
      : '';
    otherCard.innerHTML = `
      <button class="choice-btn mixed-other-toggle" id="mixedOtherToggle">
        <span class="choice-letter">D</span>
        <span class="choice-text">${t('mixed_other_label') || '其他：____'}</span>
        <span class="choice-expand-icon">▾</span>
      </button>
      <div class="mixed-other-input-wrap" id="mixedOtherInputWrap">
        <input
          type="text"
          id="mixedOtherInput"
          class="interactive-input mixed-other-input"
          placeholder="${getMixedPlaceholder(config.inputConfig)}"
          maxlength="200"
          autocomplete="off"
        >
        ${voiceBtnHTML}
        <button id="mixedOtherSubmit" class="btn btn-submit mixed-other-submit">
          ${t('submit') || '提交'}
        </button>
      </div>
    `;
    container.appendChild(otherCard);

    toggle = otherCard.querySelector('#mixedOtherToggle');
    wrap = otherCard.querySelector('#mixedOtherInputWrap');
    input = otherCard.querySelector('#mixedOtherInput');
    submit = otherCard.querySelector('#mixedOtherSubmit');
    voiceBtn = otherCard.querySelector('#mixedOtherVoiceBtn');

    /* 綁定語音輸入 */
    if (voiceBtn && typeof setupVoiceInput === 'function') {
      setupVoiceInput(voiceBtn, input);
    }
  }

  /* Bug 1 fix：所有點擊事件統一綁定喺 container 上（事件委託）*/
  container.onclick = (e) => {
    /* 預設選項 A/B/C */
    const choiceBtn = e.target.closest('.mixed-choice-btn');
    if (choiceBtn) {
      if (choiceBtn.disabled) return;
      const idx = parseInt(choiceBtn.dataset.mixedChoiceIndex, 10);
      if (isNaN(idx) || !config.choices[idx]) return;
      debounce(() => handleMixedChoice(config.choices[idx]), 300)();
      return;
    }
    /* 「其他」展開/收合 */
    const toggleBtn = e.target.closest('.mixed-other-toggle');
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
            if (input.scrollIntoView) {
              try { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
            }
          }
        }, 60);
      }
      return;
    }
    /* 提交輸入 */
    const submitBtn = e.target.closest('.mixed-other-submit');
    if (submitBtn) {
      if (submitBtn.disabled) return;
      debounce(() => handleMixedTextInput(scene, input, submit), 300)();
      return;
    }
    /* Bug 1 fix：點唔到任何選項卡片 → 直接 return */
    return;
  };

  /* Enter 鍵提交（input 上嘅 keypress，唔係 container 級）*/
  if (input) {
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        debounce(() => handleMixedTextInput(scene, input, submit), 300)();
      }
    };
  }

  /* 修復2：註冊清理回調（關卡切換時移除事件，避免洩漏）*/
  if (typeof registerSceneCleanup === 'function') {
    registerSceneCleanup(() => {
      container.onclick = null;
      if (input) input.onkeypress = null;
    });
  }
}

/**
 * 處理預設選項點擊（與 handleChoice 行為一致，但應用混合輸入的脈絡）
 */
function handleMixedChoice(choice) {
  // 沿用 game.js 既有 handleChoice 邏輯
  if (typeof handleChoice === 'function') {
    handleChoice(choice);
  }
}

/**
 * 處理「其他」輸入框的文字提交
 * 關鍵字判斷：goodKeywords 命中→正確；badKeywords 命中→錯誤；其他→中性
 */
function handleMixedTextInput(scene, inputEl, submitBtn) {
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) {
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 500);
    return;
  }

  // 停止倒計時
  if (typeof stopCountdown === 'function') stopCountdown();

  // 停止語音輸入（如正在進行）
  const voiceBtn = document.getElementById('mixedOtherVoiceBtn');
  if (voiceBtn && voiceBtn._stopVoiceInput) voiceBtn._stopVoiceInput();

  // 禁用輸入
  inputEl.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  // 同時禁用預設選項
  document.querySelectorAll('#choicesContainer .mixed-choice-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('choice-disabled');
  });
  document.querySelectorAll('#choicesContainer .mixed-other-toggle').forEach(btn => {
    btn.disabled = true;
  });

  const config = scene.mixedConfig;
  const inputConfig = config.inputConfig;

  // 關鍵字判斷
  const lowerText = text.toLowerCase();
  const matchedGood = (inputConfig.goodKeywords || []).some(kw =>
    lowerText.includes(kw.toLowerCase())
  );
  const matchedBad = (inputConfig.badKeywords || []).some(kw =>
    lowerText.includes(kw.toLowerCase())
  );

  let result, feedback, nextSceneId, effects;

  // 同時命中 good 與 bad：以 bad 為先（避免「不轉賬」被誤判為轉賬）
  // 但先檢查否定詞修飾
  const hasNegation = /不|沒|别|别|勿|拒絕|拒绝| refuse| don'?t/i.test(text);

  if (matchedBad && !hasNegation) {
    result = 'bad';
    feedback = getMixedFeedback(inputConfig, 'bad');
    nextSceneId = inputConfig.badNextSceneId;
    effects = { alertness: -10, calmness: -15, riskScore: 25, money: -20, xp: 5, score: -80 };
  } else if (matchedGood) {
    result = 'good';
    feedback = getMixedFeedback(inputConfig, 'good');
    nextSceneId = inputConfig.goodNextSceneId;
    effects = { alertness: 15, calmness: 10, information: 15, riskScore: -10, xp: 25, score: 50 };
  } else if (matchedBad && hasNegation) {
    // 否定 + 危險詞 = 反向判斷為正確（例如「我不會轉賬」）
    result = 'good';
    feedback = getMixedFeedback(inputConfig, 'good');
    nextSceneId = inputConfig.goodNextSceneId;
    effects = { alertness: 15, calmness: 10, information: 15, riskScore: -10, xp: 25, score: 50 };
  } else {
    result = 'neutral';
    feedback = getMixedFeedback(inputConfig, 'neutral');
    nextSceneId = inputConfig.neutralNextSceneId || inputConfig.goodNextSceneId;
    effects = { alertness: -5, calmness: -5, riskScore: 10, xp: 3, score: -15 };
  }

  if (typeof applyEffects === 'function') {
    applyEffects(effects, scene.id + '_mixed');
  }

  const feedbackType = result === 'good' ? 'good' : result === 'bad' ? 'bad' : 'mid';
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

function getMixedPlaceholder(inputConfig) {
  if (!inputConfig) return t('mixed_input_placeholder');
  const lang = gameState.language;
  if (lang === 'en' && inputConfig.placeholderEn) return inputConfig.placeholderEn;
  if (lang === 'zh' && inputConfig.placeholderZh) return inputConfig.placeholderZh;
  return inputConfig.placeholder || t('mixed_input_placeholder');
}

function getMixedFeedback(inputConfig, type) {
  if (!inputConfig) return '';
  const lang = gameState.language;
  const key = type + 'Feedback';
  const keyEn = type + 'FeedbackEn';
  const keyZh = type + 'FeedbackZh';
  if (lang === 'en' && inputConfig[keyEn]) return inputConfig[keyEn];
  if (lang === 'zh' && inputConfig[keyZh]) return inputConfig[keyZh];
  return inputConfig[key] || '';
}

// ===================================================================
// ===== 2. 釣魚簡訊鎖屏元件（sms_lockscreen）=====
// ===================================================================

/**
 * 渲染手機鎖屏簡訊 UI
 * @param {Object} visual
 *   {
 *     time: "14:32",          // 鎖屏時間顯示
 *     signal: 4,              // 信號格數 0-4
 *     battery: 75,            // 電量百分比
 *     sender: "香港郵政",     // 發件人顯示
 *     senderEn, senderZh,
 *     message: "...",         // 簡訊內容（含可疑連結）
 *     messageEn, messageZh,
 *     link: "https://hk-post-track.com",  // 可點擊連結
 *     linkText: "https://hk-post-track.com"
 *     confirmText: "..."      // 系統確認框文案
 *     onOpenLink: Function    // 點擊「打開連結」回調（覆蓋預設行為）
 *     onIgnore: Function      // 點擊「忽略簡訊」回調
 *   }
 */
function renderSmsLockscreen(visual) {
  const sender = getLocalizedVisualText(visual, 'sender');
  const message = getLocalizedVisualText(visual, 'message');
  const confirmText = visual.confirmText || t('sms_link_confirm');

  return `
    <div class="lockscreen-phone" role="region" aria-label="SMS lock screen">
      <!-- 鎖屏頂部：時間 + 信號 + 電量 -->
      <div class="lockscreen-statusbar">
        <span class="lockscreen-time">${visual.time || '14:32'}</span>
        <div class="lockscreen-indicators">
          <span class="lockscreen-signal" aria-label="signal">
            ${renderSignalIcon(visual.signal || 4)}
          </span>
          <span class="lockscreen-battery" aria-label="battery ${visual.battery || 75}%">
            <span class="battery-shell">
              <span class="battery-fill" style="width: ${visual.battery || 75}%"></span>
            </span>
            <span class="battery-tip"></span>
          </span>
        </div>
      </div>

      <!-- 鎖屏主體：簡訊通知卡 -->
      <div class="lockscreen-notification" id="lockscreenNotification">
        <div class="lockscreen-notif-header">
          <span class="lockscreen-notif-app">📩 ${t('sms_app_messages')}</span>
          <span class="lockscreen-notif-time">${t('sms_now')}</span>
        </div>
        <div class="lockscreen-notif-sender">${sender}</div>
        <div class="lockscreen-notif-body">${message}</div>
        ${visual.link ? renderSmsLink(visual.link, visual.linkText || visual.link) : ''}
      </div>

      <!-- 底部兩個大按鈕 -->
      <div class="lockscreen-actions">
        <button class="btn lockscreen-btn lockscreen-btn-danger" id="smsOpenLinkBtn">
          🔗 ${t('sms_open_link')}
        </button>
        <button class="btn lockscreen-btn lockscreen-btn-safe" id="smsIgnoreBtn">
          🚫 ${t('sms_ignore')}
        </button>
      </div>

      <!-- 系統確認框（隱藏，點擊連結或按鈕時顯示）-->
      <div class="sms-confirm-dialog" id="smsConfirmDialog" style="display: none;">
        <div class="sms-confirm-content">
          <div class="sms-confirm-icon">⚠️</div>
          <div class="sms-confirm-text">${confirmText}</div>
          <div class="sms-confirm-actions">
            <button class="btn sms-confirm-open" id="smsConfirmOpen">
              ${t('sms_confirm_open')}
            </button>
            <button class="btn sms-confirm-cancel" id="smsConfirmCancel">
              ${t('sms_confirm_cancel')}
            </button>
          </div>
        </div>
      </div>

      <!-- 釣魚網站彈窗（點擊「打開連結」後短暫顯示）-->
      <div class="phishing-site-modal" id="phishingSiteModal" style="display: none;">
        <div class="phishing-site-content">
          <div class="phishing-site-url-bar">
            <span class="phishing-site-lock">🔓</span>
            <span class="phishing-site-url">${visual.link || ''}</span>
          </div>
          <div class="phishing-site-body">
            <div class="phishing-site-logo">${visual.phishingLogo || '📮'}</div>
            <div class="phishing-site-title">${visual.phishingTitle || sender}</div>
            <div class="phishing-site-form">
              <div class="phishing-form-row">${t('sms_phishing_card_label')}</div>
              <div class="phishing-form-row phishing-form-input"></div>
              <div class="phishing-form-row phishing-form-input"></div>
              <div class="phishing-form-row phishing-form-input"></div>
              <div class="phishing-site-submit">${t('sms_phishing_submit')}</div>
            </div>
            <div class="phishing-steal-warning">${t('sms_phishing_stealing')}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSignalIcon(strength) {
  // 4 格信號圖示
  let bars = '';
  for (let i = 0; i < 4; i++) {
    const active = i < strength ? 'signal-bar-active' : '';
    const height = 4 + i * 3;
    bars += `<span class="signal-bar ${active}" style="height: ${height}px"></span>`;
  }
  return bars;
}

function renderSmsLink(href, displayText) {
  return `<a href="#" class="lockscreen-sms-link" data-link="${href}" onclick="return false;">${displayText}</a>`;
}

/**
 * 設置釣魚簡訊鎖屏的互動綁定
 * 由 renderVisual 在場景渲染後調用
 */
function setupSmsLockscreenInteraction(visual, scene) {
  const linkEl = document.querySelector('.lockscreen-sms-link');
  const openBtn = document.getElementById('smsOpenLinkBtn');
  const ignoreBtn = document.getElementById('smsIgnoreBtn');
  const confirmDialog = document.getElementById('smsConfirmDialog');
  const confirmOpen = document.getElementById('smsConfirmOpen');
  const confirmCancel = document.getElementById('smsConfirmCancel');
  const phishingModal = document.getElementById('phishingSiteModal');

  const stopCountdownFn = typeof stopCountdown === 'function' ? stopCountdown : () => {};

  // 點擊簡訊中的連結：彈出系統確認框
  const showConfirm = (e) => {
    e && e.preventDefault();
    if (confirmDialog) {
      confirmDialog.style.display = 'flex';
    }
  };
  if (linkEl) linkEl.onclick = showConfirm;
  if (openBtn) openBtn.onclick = showConfirm;

  // 確認框「打開」：顯示釣魚網站 → 2 秒後顯示被盜訊息 → 進入錯誤分支
  if (confirmOpen) {
    confirmOpen.onclick = () => {
      if (confirmDialog) confirmDialog.style.display = 'none';
      stopCountdownFn();
      // 禁用按鈕
      if (openBtn) { openBtn.disabled = true; openBtn.classList.add('choice-disabled'); }
      if (ignoreBtn) { ignoreBtn.disabled = true; ignoreBtn.classList.add('choice-disabled'); }

      // 顯示釣魚網站彈窗
      if (phishingModal) {
        phishingModal.style.display = 'flex';
        // 2 秒後切換為「被盜訊息」
        setTimeout(() => {
          phishingModal.classList.add('phishing-stolen');
          const warningEl = phishingModal.querySelector('.phishing-steal-warning');
          if (warningEl) {
            warningEl.style.display = 'block';
            warningEl.textContent = t('sms_phishing_stolen');
          }
        }, 2000);
      }

      // 觸發警報動畫 + 進入錯誤分支
      setTimeout(() => {
        if (typeof triggerAlarm === 'function') {
          triggerAlarm(() => {
            // 進入錯誤分支
            const badSceneId = visual.badNextSceneId || (scene && scene.choices && scene.choices[0] && scene.choices[0].nextSceneId);
            // 套用懲罰效果
            if (typeof applyEffects === 'function') {
              applyEffects({ alertness: -15, calmness: -20, riskScore: 30, money: -30, score: -100 }, 'phishing_click');
            }
            // 顯示解析
            const feedback = getLocalizedVisualText(visual, 'badFeedback') || t('sms_phishing_bad_feedback');
            if (typeof showFeedbackWithContinue === 'function') {
              showFeedbackWithContinue(feedback, 'bad', () => {
                if (badSceneId && typeof goToScene === 'function') {
                  goToScene(badSceneId);
                }
              });
            }
          });
        } else if (typeof showFeedbackWithContinue === 'function') {
          showFeedbackWithContinue(getLocalizedVisualText(visual, 'badFeedback') || t('sms_phishing_bad_feedback'), 'bad', () => {
            if (badSceneId && typeof goToScene === 'function') goToScene(badSceneId);
          });
        }
      }, 3500);
    };
  }

  // 確認框「取消」：關閉確認框
  if (confirmCancel) {
    confirmCancel.onclick = () => {
      if (confirmDialog) confirmDialog.style.display = 'none';
    };
  }

  // 「忽略簡訊」按鈕：正確分支
  if (ignoreBtn) {
    ignoreBtn.onclick = () => {
      stopCountdownFn();
      if (openBtn) { openBtn.disabled = true; openBtn.classList.add('choice-disabled'); }
      ignoreBtn.disabled = true;
      ignoreBtn.classList.add('choice-disabled');

      if (typeof applyEffects === 'function') {
        applyEffects({ alertness: 20, calmness: 10, information: 15, riskScore: -15, xp: 25, score: 60 }, 'phishing_ignore');
      }
      const goodSceneId = visual.goodNextSceneId || (scene && scene.choices && scene.choices[0] && scene.choices[0].nextSceneId);
      const feedback = getLocalizedVisualText(visual, 'goodFeedback') || t('sms_phishing_good_feedback');
      if (typeof showFeedbackWithContinue === 'function') {
        showFeedbackWithContinue(feedback, 'good', () => {
          if (goodSceneId && typeof goToScene === 'function') {
            goToScene(goodSceneId);
          }
        });
      }
    };
  }
}

// ===================================================================
// ===== 3. 入境處來電元件（phone_call_immigration）=====
// ===================================================================

/**
 * 渲染入境處仿真來電 UI
 * @param {Object} visual
 *   {
 *     callerId: "+852 2824 6111",
 *     callerName: "香港入境事務處",
 *     callerNameEn, callerNameZh,
 *     initialMessage: "你好，呢度係香港入境事務處...",
 *     initialMessageEn, initialMessageZh,
 *     cantoneseMessage: "我哋收到一份寄畀你嘅可疑包裹...",
 *     cantoneseMessageEn, cantoneseMessageZh,
 *     mandarinMessage: "我们收到一份寄给你的可疑包裹...",
 *     mandarinMessageEn, mandarinMessageZh,
 *     badNextSceneId: "...",     // 跟從對方指示的錯誤分支
 *     goodNextSceneId: "...",    // 掛斷查證的正確分支
 *     playCantoneseAudio: true,  // 是否調用 playCantonese()
 *     playMandarinAudio: true    // 是否調用 playMandarin()
 *   }
 */
function renderImmigrationCall(visual) {
  const callerName = getLocalizedVisualText(visual, 'callerName');
  const initialMessage = getLocalizedVisualText(visual, 'initialMessage');
  const cantoneseMsg = getLocalizedVisualText(visual, 'cantoneseMessage');
  const mandarinMsg = getLocalizedVisualText(visual, 'mandarinMessage');
  const voiceBtnHTML = (typeof renderVoiceInputButtonHTML === 'function')
    ? renderVoiceInputButtonHTML('immigrationVoiceBtn')
    : '';

  return `
    <div class="immigration-call-wrap" role="region" aria-label="Incoming call">
      <!-- 來電畫面 -->
      <div class="immigration-call-incoming" id="immigrationIncoming">
        <div class="immigration-call-status">${t('call_incoming_label')}</div>
        <div class="immigration-call-icon">📞</div>
        <div class="immigration-call-number">${visual.callerId || '+852 2824 6111'}</div>
        <div class="immigration-call-name">${callerName}</div>
        <div class="immigration-call-hint">${t('call_immigration_hint')}</div>
        <div class="immigration-call-buttons">
          <button class="btn immigration-call-hangup" id="immigrationHangup" aria-label="hang up">
            <span class="call-icon">📵</span>
            <span class="call-label">${t('call_hangup')}</span>
          </button>
          <button class="btn immigration-call-answer" id="immigrationAnswer" aria-label="answer">
            <span class="call-icon">📞</span>
            <span class="call-label">${t('call_answer')}</span>
          </button>
        </div>
      </div>

      <!-- 通話中畫面（接聽後顯示）-->
      <div class="immigration-call-active" id="immigrationActive" style="display: none;">
        <div class="immigration-active-header">
          <span class="immigration-active-status">${t('call_in_progress')}</span>
          <span class="immigration-active-timer" id="immigrationCallTimer">00:00</span>
        </div>
        <div class="immigration-caller-badge">
          <span class="immigration-caller-icon">🏛️</span>
          <div class="immigration-caller-info">
            <div class="immigration-caller-name">${callerName}</div>
            <div class="immigration-caller-num">${visual.callerId || '+852 2824 6111'}</div>
          </div>
        </div>

        <!-- IVR 訊息逐行顯示區 -->
        <div class="immigration-ivr-area" id="immigrationIvrArea">
          <div class="ivr-line ivr-system" id="ivrInitial">${initialMessage}</div>
        </div>

        <!-- 語言選擇按鈕 -->
        <div class="immigration-lang-buttons" id="immigrationLangButtons">
          <button class="btn immigration-lang-btn" id="immigrationLang1">
            <span class="lang-key">1</span>
            <span class="lang-name">${t('call_lang_cantonese')}</span>
          </button>
          <button class="btn immigration-lang-btn" id="immigrationLang2">
            <span class="lang-key">2</span>
            <span class="lang-name">${t('call_lang_mandarin')}</span>
          </button>
        </div>

        <!-- 語言選擇後的劇情訊息（隱藏）-->
        <div class="immigration-story-area" id="immigrationStoryArea" style="display: none;">
          <div class="ivr-line ivr-system" id="ivrStory"></div>

          <!-- 預設行動按鈕 -->
          <div class="immigration-story-actions" id="immigrationStoryActions">
            <button class="btn immigration-story-comply" id="immigrationComply">
              ${t('call_comply')}
            </button>
            <button class="btn immigration-story-hangup" id="immigrationStoryHangup">
              ${t('call_hangup_verify')}
            </button>
          </div>

          <!-- 自由回應輸入區（語音 / 打字）-->
          <div class="immigration-free-response" id="immigrationFreeResponse">
            <div class="immigration-free-response-label">
              ${t('call_free_response_label') || '或者，自己講/打你嘅回應：'}
            </div>
            <div class="immigration-free-input-row">
              <input
                type="text"
                id="immigrationFreeInput"
                class="interactive-input immigration-free-input"
                placeholder="${t('call_free_response_placeholder') || '例如：我會掛斷電話自己查證…'}"
                maxlength="200"
                autocomplete="off"
              >
              ${voiceBtnHTML}
              <button id="immigrationFreeSubmit" class="btn btn-submit immigration-free-submit" type="button">
                ${t('submit') || '發送'}
              </button>
            </div>
            <div class="immigration-free-hint">
              ${t('call_free_response_hint') || '系統會根據你嘅回應判斷係咪被騙'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 設置入境處來電互動綁定
 */
function setupImmigrationCallInteraction(visual, scene) {
  const incoming = document.getElementById('immigrationIncoming');
  const active = document.getElementById('immigrationActive');
  const answerBtn = document.getElementById('immigrationAnswer');
  const hangupBtn = document.getElementById('immigrationHangup');
  const lang1Btn = document.getElementById('immigrationLang1');
  const lang2Btn = document.getElementById('immigrationLang2');
  const storyArea = document.getElementById('immigrationStoryArea');
  const langButtons = document.getElementById('immigrationLangButtons');
  const ivrStory = document.getElementById('ivrStory');
  const complyBtn = document.getElementById('immigrationComply');
  const storyHangup = document.getElementById('immigrationStoryHangup');
  const timerEl = document.getElementById('immigrationCallTimer');

  const stopCountdownFn = typeof stopCountdown === 'function' ? stopCountdown : () => {};
  let callTimerId = null;
  let callSeconds = 0;

  // 啟動通話計時
  const startCallTimer = () => {
    callSeconds = 0;
    if (timerEl) timerEl.textContent = '00:00';
    callTimerId = setInterval(() => {
      callSeconds++;
      const m = String(Math.floor(callSeconds / 60)).padStart(2, '0');
      const s = String(callSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);
  };
  const stopCallTimer = () => {
    if (callTimerId) { clearInterval(callTimerId); callTimerId = null; }
  };

  // 進入正確分支（掛斷查證）
  const goGoodPath = () => {
    stopCountdownFn();
    stopCallTimer();
    if (typeof applyEffects === 'function') {
      applyEffects({ alertness: 25, calmness: 15, information: 20, riskScore: -20, xp: 30, score: 70 }, 'call_hangup_verify');
    }
    const feedback = getLocalizedVisualText(visual, 'goodFeedback') || t('call_good_feedback');
    if (typeof showFeedbackWithContinue === 'function') {
      showFeedbackWithContinue(feedback, 'good', () => {
        if (visual.goodNextSceneId && typeof goToScene === 'function') {
          goToScene(visual.goodNextSceneId);
        }
      });
    }
  };

  // 進入錯誤分支（配合對方）
  const goBadPath = () => {
    stopCountdownFn();
    stopCallTimer();
    if (typeof applyEffects === 'function') {
      applyEffects({ alertness: -20, calmness: -25, riskScore: 35, money: -20, xp: 5, score: -100 }, 'call_comply');
    }
    if (typeof triggerAlarm === 'function') {
      triggerAlarm(() => {
        const feedback = getLocalizedVisualText(visual, 'badFeedback') || t('call_bad_feedback');
        if (typeof showFeedbackWithContinue === 'function') {
          showFeedbackWithContinue(feedback, 'bad', () => {
            if (visual.badNextSceneId && typeof goToScene === 'function') {
              goToScene(visual.badNextSceneId);
            }
          });
        }
      });
    }
  };

  /* ------- 通用：按鈕防抖包裝（修復2：防止連點）------- */
  const debounce = (fn, wait = 300) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last < wait) return;
      last = now;
      fn.apply(this, args);
    };
  };

  // 接聽按鈕（修復1：接通後自動播放開場白；修復2：300ms 防抖）
  if (answerBtn) {
    answerBtn.onclick = debounce(() => {
      if (incoming) incoming.style.display = 'none';
      if (active) active.style.display = 'flex';
      startCallTimer();
      /* 修復1：接通後自動播放開場白（唔理 visual 有冇標記都一定播）*/
      if (typeof playInitialAudio === 'function') {
        playInitialAudio();
      }
    }, 300);
  }

  // 來電畫面直接掛斷 → 正確分支
  if (hangupBtn) {
    hangupBtn.onclick = debounce(() => { goGoodPath(); }, 300);
  }

  // 按 1（廣東話）—— 修復1：唔再靠 visual 標記，直接播
  if (lang1Btn) {
    lang1Btn.onclick = debounce(() => {
      const cantoneseMsg = getLocalizedVisualText(visual, 'cantoneseMessage');
      /* 修復1：廣東話 TTS，先播語音再顯示文字劇情 */
      if (typeof playCantonese === 'function') {
        playCantonese(cantoneseMsg);
      }
      if (langButtons) langButtons.style.display = 'none';
      if (storyArea) storyArea.style.display = 'block';
      if (ivrStory) {
        ivrStory.textContent = cantoneseMsg;
        ivrStory.classList.add('ivr-appear');
      }
    }, 300);
  }

  // 按 2（普通話）—— 修復1：唔再靠 visual 標記，直接播
  if (lang2Btn) {
    lang2Btn.onclick = debounce(() => {
      const mandarinMsg = getLocalizedVisualText(visual, 'mandarinMessage');
      /* 修復1：普通話 TTS，先播語音再顯示文字劇情 */
      if (typeof playMandarin === 'function') {
        playMandarin(mandarinMsg);
      }
      if (langButtons) langButtons.style.display = 'none';
      if (storyArea) storyArea.style.display = 'block';
      if (ivrStory) {
        ivrStory.textContent = mandarinMsg;
        ivrStory.classList.add('ivr-appear');
      }
    }, 300);
  }

  // 配合對方 → 錯誤分支
  if (complyBtn) {
    complyBtn.onclick = debounce(() => { goBadPath(); }, 300);
  }

  // 掛斷查證 → 正確分支
  if (storyHangup) {
    storyHangup.onclick = debounce(() => { goGoodPath(); }, 300);
  }

  /* ------- 自由回應輸入（語音 / 打字）------- */
  const freeInput = document.getElementById('immigrationFreeInput');
  const freeSubmit = document.getElementById('immigrationFreeSubmit');
  const voiceBtn = document.getElementById('immigrationVoiceBtn');

  // 語音輸入綁定
  if (voiceBtn && freeInput && typeof setupVoiceInput === 'function') {
    setupVoiceInput(voiceBtn, freeInput);
  }

  /**
   * 處理自由回應：用關鍵字判斷玩家係咪被騙
   * goodKeywords 命中→掛斷查證（正確）；badKeywords 命中→配合對方（錯誤）；其他→中性
   */
  const handleImmigrationFreeResponse = () => {
    if (!freeInput) return;
    const text = freeInput.value.trim();
    if (!text) {
      freeInput.classList.add('shake');
      setTimeout(() => freeInput.classList.remove('shake'), 500);
      return;
    }

    // 停止語音輸入（如正在進行）
    if (voiceBtn && voiceBtn._stopVoiceInput) voiceBtn._stopVoiceInput();

    // 禁用輸入區
    freeInput.disabled = true;
    if (freeSubmit) freeSubmit.disabled = true;
    if (complyBtn) { complyBtn.disabled = true; complyBtn.classList.add('choice-disabled'); }
    if (storyHangup) { storyHangup.disabled = true; storyHangup.classList.add('choice-disabled'); }

    // 關鍵字判斷（沿用 mixed_input 嘅關鍵字邏輯）
    const goodKw = ['查證','查证','核實','核实','18222','掛斷','挂断','掛電話','挂电话','報警','报警','唔轉賬','不轉賬','不转账','問學校','问学校','先查','先核實','先核实','先查證','contact','verify','hang up','police'];
    const badKw = ['轉賬','转账','匯款','汇款','密碼','密码','驗證碼','验证码','先交錢','先交钱','馬上轉','马上转','轉錢','转钱','過數','过数','過帳','过账','支付','付款','transfer','password','code','pay'];
    const lowerText = text.toLowerCase();
    const matchedGood = goodKw.some(kw => lowerText.includes(kw.toLowerCase()));
    const matchedBad = badKw.some(kw => lowerText.includes(kw.toLowerCase()));
    const hasNegation = /不|沒|别|別|勿|拒絕|拒绝|refuse|don'?t|not/i.test(text);

    // 顯示玩家嘅回應（ IVR 區）
    const ivrArea = document.getElementById('immigrationIvrArea');
    if (ivrArea) {
      const playerLine = document.createElement('div');
      playerLine.className = 'ivr-line ivr-player';
      playerLine.textContent = '「' + text + '」';
      ivrArea.appendChild(playerLine);
      ivrArea.scrollTop = ivrArea.scrollHeight;
    }

    // 判斷分支
    if (matchedBad && !hasNegation) {
      // 命中壞關鍵字（無否定）→ 被騙
      setTimeout(() => goBadPath(), 600);
    } else if (matchedGood || (matchedBad && hasNegation)) {
      // 命中好關鍵字，或「否定 + 壞關鍵字」（例如「我不會轉賬」）→ 正確
      setTimeout(() => goGoodPath(), 600);
    } else {
      // 中性回應 → 預設為正確（玩家有思考，傾向查證）
      setTimeout(() => goGoodPath(), 600);
    }
  };

  // 提交按鈕
  if (freeSubmit) {
    freeSubmit.onclick = debounce(handleImmigrationFreeResponse, 300);
  }
  // Enter 鍵提交
  if (freeInput) {
    freeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleImmigrationFreeResponse();
      }
    });
  }
}

// ===================================================================
// ===== 語音播放（修復1：真實音頻優先 + Web Speech API 自動降級）=====
// -------------------------------------------------------------------
//   播放策略：若 ./audio/xxx.mp3 存在 → 優先播放 mp3
//            否則自動降級到 speechSynthesis TTS
//   每個函數同時支援瀏覽器原生語音（Cantonese / Mandarin）
// ===================================================================

/* ------- 通用：語音文件存在性快取 ------- */
const _audioExistsCache = {};
function audioFileExists(path) {
  if (_audioExistsCache[path] !== undefined) return Promise.resolve(_audioExistsCache[path]);
  return new Promise(resolve => {
    const a = new Audio();
    a.preload = 'auto';
    a.oncanplaythrough = () => { _audioExistsCache[path] = true; resolve(true); };
    a.onerror = () => { _audioExistsCache[path] = false; resolve(false); };
    a.src = path;
  });
}

/**
 * 播放語音（通用內部工具：先嘗試文件，再 fallback 到 TTS）
 * @param {string} audioPath - 例如 './audio/cantonese.mp3'
 * @param {string} ttsText   - 降級到 TTS 時要念的文字
 * @param {string} lang      - TTS 語言代碼：'zh-HK' | 'zh-CN' | 'en-US'
 * @param {Object} [callbacks] - 可選 onstart / onend / onerror
 */
async function playVoice(audioPath, ttsText, lang, callbacks) {
  callbacks = callbacks || {};
  stopSpeech();

  try {
    const hasFile = await audioFileExists(audioPath);
    if (hasFile) {
      /* --- 真實音頻文件播放（後期替換後的路徑）--- */
      const audio = new Audio(audioPath);
      audio.volume = 1.0;
      if (typeof callbacks.onstart === 'function') audio.onplay = callbacks.onstart;
      if (typeof callbacks.onend === 'function')   audio.onended = callbacks.onend;
      if (typeof callbacks.onerror === 'function') audio.onerror = callbacks.onerror;
      audio.play().catch(err => {
        console.warn('[playVoice] audio play failed, fallback to TTS:', err);
        _playTTS(ttsText, lang, callbacks);
      });
    } else {
      /* --- 降級：Web Speech API TTS --- */
      _playTTS(ttsText, lang, callbacks);
    }
  } catch (e) {
    console.warn('[playVoice] error, fallback to TTS:', e);
    _playTTS(ttsText, lang, callbacks);
  }
}

/** ------- TTS 包裝（共用同一個 SpeechSynthesis 狀態）------- */
/* 修復1：粵語語音選擇 — 搵唔到粵語語音就唔播，避免用普通话聲讀粵語文字 */
function _playTTS(text, lang, callbacks) {
  if (!('speechSynthesis' in window)) {
    if (typeof callbacks.onerror === 'function') callbacks.onerror(new Error('speechSynthesis unavailable'));
    return;
  }
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang || 'zh-HK';
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    let selected = null;

    if (voices.length > 0) {
      // 第一優先：精確匹配 lang（例如 zh-HK == zh-HK）
      for (const v of voices) {
        if (v.lang === utter.lang) { selected = v; break; }
      }

      // 第二優先：粵語語音 — 匹配 zh-HK / zh-TW / 名稱含 Cantonese/HK/Hong Kong
      if (!selected && (lang === 'zh-HK' || lang === 'zh-TW')) {
        for (const v of voices) {
          if (v.lang === 'zh-HK' || v.lang === 'zh-TW') { selected = v; break; }
        }
        if (!selected) {
          for (const v of voices) {
            const n = (v.name + ' ' + (v.lang || '')).toLowerCase();
            if (n.includes('cantonese') || n.includes('hk') || n.includes('hong kong') || n.includes('粵')) {
              selected = v; break;
            }
          }
        }
      }

      // 第三優先：普通話語音 — 只在 lang === 'zh-CN' 時先匹配 zh-CN
      if (!selected && lang === 'zh-CN') {
        for (const v of voices) {
          if (v.lang === 'zh-CN') { selected = v; break; }
        }
      }

      // 第四優先：通用中文回退（仅普通话场景才回退到任意中文）
      if (!selected && lang === 'zh-CN') {
        for (const v of voices) {
          if (v.lang && v.lang.startsWith('zh')) { selected = v; break; }
        }
      }
    }

    /* 關鍵：粵語場景若搵唔到粵語語音，直接唔播 TTS，避免用普通话聲讀粵語文字 */
    if (!selected && (lang === 'zh-HK' || lang === 'zh-TW')) {
      console.warn('[TTS] No Cantonese voice available, skipping TTS to avoid Mandarin mispronunciation.');
      if (typeof callbacks.onend === 'function') callbacks.onend();
      return;
    }

    // 如果找到了語音就設置
    if (selected) utter.voice = selected;

    utter.onstart = callbacks.onstart || (()=>{});
    utter.onend   = () => { if (typeof callbacks.onend === 'function') callbacks.onend(); };
    utter.onerror = () => { if (typeof callbacks.onerror === 'function') callbacks.onerror(); };

    window._currentUtterance = utter;
    speechSynthesis.speak(utter);
  } catch (e) {
    console.warn('_playTTS failed:', e);
  }
}

/** ------- 廣東話語音 ------- */
function playCantonese(text) {
  const msg = text || '我哋收到一份寄畀你嘅可疑包裹，請立即提供身份資料核實，唔配合就會取消你嘅簽證。';
  playVoice('./audio/cantonese.mp3', msg, 'zh-HK');
}

/** ------- 普通話語音 ------- */
function playMandarin(text) {
  const msg = text || '我们收到一份寄给你的可疑包裹，请立即提供身份资料核实，不配合将取消你的签证。';
  playVoice('./audio/mandarin.mp3', msg, 'zh-CN');
}

/** ------- 初始 IVR 開場白（接通後自動播放）------- */
/* 修復1：入境處開場白永遠用粵語播放，選擇 1/2 後再播對應語言 */
function playInitialAudio(text) {
  const msg = text || '你好，呢度係香港入境事務處，廣東話請按 1，普通話請按 2。';
  playVoice('./audio/initial_ivr.mp3', msg, 'zh-HK');
}

// ===================================================================
// ===== 通用工具：從 visual 物件取出本地化文字 =====
// ===================================================================

function getLocalizedVisualText(visual, field) {
  if (!visual) return '';
  const lang = gameState.language;
  const enKey = field + 'En';
  const zhKey = field + 'Zh';
  if (lang === 'en' && visual[enKey]) return visual[enKey];
  if (lang === 'zh' && visual[zhKey]) return visual[zhKey];
  return visual[field] || '';
}

// ===================================================================
// ===== 4. 語音輸入系統（SpeechRecognition 語音轉文字）=====
// -------------------------------------------------------------------
//   使用 Web Speech API 將玩家說話轉成文字，填入輸入框
//   - 自動根據 gameState.language 切換識別語言
//   - 不支援的瀏覽器會自動隱藏語音按鈕
// ===================================================================

/** 取得語音識別的語言代碼 */
function getRecognitionLang() {
  const lang = (window.gameState && gameState.language) || 'zh-TW';
  if (lang === 'zh-TW') return 'zh-HK';
  if (lang === 'zh') return 'zh-CN';
  return 'en-US';
}

/** 檢查瀏覽器是否支援語音識別 */
function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined'
    && (window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** 取得 SpeechRecognition 實例（不可用則回傳 null） */
function createSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  try {
    const rec = new SR();
    rec.lang = getRecognitionLang();
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    return rec;
  } catch (e) {
    console.warn('[SpeechRecognition] init failed:', e);
    return null;
  }
}

/**
 * 建立語音輸入按鈕的 HTML
 * @param {string} id - 按鈕 DOM id
 * @returns {string} HTML 字串
 */
function renderVoiceInputButtonHTML(id) {
  if (!isSpeechRecognitionSupported()) return '';
  return `
    <button type="button" class="btn btn-voice-input" id="${id}" aria-label="voice input" title="${t('voice_input_hint') || '語音輸入'}">
      <span class="voice-mic-icon">🎤</span>
    </button>
  `;
}

/**
 * 為指定按鈕綁定語音識別；識別完成後將文字填入 inputEl
 * @param {HTMLElement} buttonEl - 麥克風按鈕
 * @param {HTMLElement} inputEl - 接收識別文字的輸入框
 * @param {Function} [onResult] - 識別完成回調 (text) => void
 * @param {Function} [onStart]   - 開始識別回調
 * @param {Function} [onEnd]     - 結束識別回調（含失敗）
 */
function setupVoiceInput(buttonEl, inputEl, onResult, onStart, onEnd) {
  if (!buttonEl) return;
  if (!isSpeechRecognitionSupported()) {
    buttonEl.style.display = 'none';
    return;
  }

  let isListening = false;
  let recognition = null;

  const setListening = (state) => {
    isListening = state;
    buttonEl.classList.toggle('listening', state);
    const icon = buttonEl.querySelector('.voice-mic-icon');
    if (icon) icon.textContent = state ? '🔴' : '🎤';
  };

  const startListening = () => {
    if (isListening) return;
    recognition = createSpeechRecognition();
    if (!recognition) return;

    recognition.onstart = () => {
      setListening(true);
      if (typeof onStart === 'function') onStart();
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (inputEl) {
        // 將識別文字附加到現有內容後面（方便連續說話累積）
        const existing = inputEl.value || '';
        inputEl.value = existing ? existing + ' ' + transcript : transcript;
        inputEl.focus();
      }
      if (typeof onResult === 'function') onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.warn('[SpeechRecognition] error:', event.error);
      setListening(false);
      if (typeof onEnd === 'function') onEnd();
      // no-speech / not-allowed 時靜默處理
    };

    recognition.onend = () => {
      setListening(false);
      if (typeof onEnd === 'function') onEnd();
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('[SpeechRecognition] start failed:', e);
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (e) {}
    }
    setListening(false);
  };

  buttonEl.onclick = (e) => {
    e && e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 提供外部停止介面
  buttonEl._stopVoiceInput = stopListening;
}

/**
 * 將語音輸入按鈕附加到現有的輸入容器中
 * @param {string} inputWrapperSelector - 輸入容器的 CSS selector
 * @param {string} inputElSelector      - 輸入框的 CSS selector
 * @param {string} buttonId             - 麥克風按鈕的 DOM id
 * @param {Function} [onResult]
 */
function attachVoiceInputToContainer(inputWrapperSelector, inputElSelector, buttonId, onResult) {
  const wrap = document.querySelector(inputWrapperSelector);
  if (!wrap) return;
  const input = wrap.querySelector(inputElSelector);
  // 若按鈕已存在則先移除
  const oldBtn = document.getElementById(buttonId);
  if (oldBtn) oldBtn.remove();

  // 檢查是否支援，不支援就完全隱藏
  if (!isSpeechRecognitionSupported()) return;

  // 插入按鈕到容器末尾
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderVoiceInputButtonHTML(buttonId);
  const btn = tempDiv.firstElementChild;
  if (btn) {
    wrap.appendChild(btn);
    setupVoiceInput(btn, input, onResult);
  }
}
