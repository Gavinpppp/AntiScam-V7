# 實現規格說明：語音系統 + 選擇題自由輸入 + 倒計時範圍限制

> 本文件描述三個功能的具體實現方案，可直接交給代碼工具執行。
> 項目結構：`game.js`（核心引擎）、`enhanced-ui.js`（增強元件）、`level-engine.js`（關卡引擎）、`levels.js`（關卡數據）、`data.js`（關鍵字庫）、`style.css`（樣式）

---

## 功能一：語音轉文字系統（通話關卡）

### 目標
在打電話關卡（`speaker === 'scammer'` 且 `visual.type === 'phone_call_immigration'`）以及所有 `text_input` / `mixed_input` 場景中，增加一個麥克風按鈕，讓玩家可以用語音輸入代替打字。語音識別結果實時填入文字輸入框，玩家確認後提交。

### 技術方案
使用瀏覽器原生 Web Speech API（`SpeechRecognition`），無需外部依賴。

### 新增文件
無需新文件，所有邏輯加入 `enhanced-ui.js`。

### 具體改動

#### 1. 在 `enhanced-ui.js` 頂部新增語音工具模塊

```javascript
// ===================================================================
// ===== 語音識別模塊（Web Speech API）=====
// ===================================================================
const VoiceInput = {
  recognition: null,
  isListening: false,
  targetInput: null,    // 綁定的 input 元素
  onResult: null,       // 識別完成回調
  langMap: {
    'zh-TW': 'zh-TW',
    'zh':    'zh-CN',
    'en':    'en-US'
  },

  init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn('SpeechRecognition not supported');
      return false;
    }
    this.recognition = new SR();
    this.recognition.continuous = true;       // 持續識別
    this.recognition.interimResults = true;    // 顯示中間結果
    this.recognition.lang = this.langMap[gameState.language] || 'zh-TW';

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      // 實時填充到目標 input
      if (this.targetInput) {
        const currentVal = this.targetInput.dataset.voiceBase || '';
        this.targetInput.value = currentVal + final + interim;
        // 移動光標到末尾
        this.targetInput.setSelectionRange(this.targetInput.value.length, this.targetInput.value.length);
      }
      if (final && this.onResult) {
        this.onResult(final);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      this.stop();
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // 自動重啟（如果還在聆聽狀態）
        try { this.recognition.start(); } catch(e) {}
      }
    };

    return true;
  },

  start(targetInput, onResult) {
    if (!this.recognition && !this.init()) return false;
    this.targetInput = targetInput;
    this.onResult = onResult || null;
    if (targetInput) {
      targetInput.dataset.voiceBase = targetInput.value || '';
    }
    this.isListening = true;
    this.recognition.lang = this.langMap[gameState.language] || 'zh-TW';
    try {
      this.recognition.start();
    } catch(e) {
      console.warn('Recognition start failed:', e);
    }
    return true;
  },

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
    }
    if (this.targetInput) {
      delete this.targetInput.dataset.voiceBase;
    }
  },

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
};
```

#### 2. 新增麥克風按鈕渲染函數（加在 `enhanced-ui.js` 中）

```javascript
/**
 * 創建麥克風按鈕，綁定到指定的 input 元素
 * @param {HTMLInputElement} inputEl - 要綁定的輸入框
 * @param {Function} onSubmit - 提交回調（可選）
 * @returns {HTMLElement} 麥克風按鈕元素
 */
function createMicButton(inputEl, onSubmit) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-mic voice-input-btn';
  btn.type = 'button';
  btn.innerHTML = '🎤';
  btn.title = '語音輸入';

  if (!VoiceInput.isSupported()) {
    btn.disabled = true;
    btn.title = '此瀏覽器不支援語音識別';
    btn.style.opacity = '0.4';
    return btn;
  }

  let listening = false;
  btn.onclick = () => {
    if (listening) {
      VoiceInput.stop();
      listening = false;
      btn.classList.remove('mic-active');
      btn.innerHTML = '🎤';
      // 識別結束後自動聚焦輸入框
      if (inputEl) inputEl.focus();
    } else {
      const ok = VoiceInput.start(inputEl, null);
      if (ok) {
        listening = true;
        btn.classList.add('mic-active');
        btn.innerHTML = '🔴';
      }
    }
  };

  // 場景切換時自動停止
  if (typeof registerSceneCleanup === 'function') {
    registerSceneCleanup(() => {
      if (listening) VoiceInput.stop();
    });
  }

  return btn;
}
```

#### 3. 在 `renderMixedInput()` 中集成麥克風

在 `enhanced-ui.js` 的 `renderMixedInput()` 函數中，找到「其他」輸入區域的構建代碼（約第 96-119 行），在 input 旁邊加入麥克風按鈕：

```javascript
// 原代碼（約 enhanced-ui.js 第 96-118 行）：
// const otherCard = document.createElement('div');
// ...
// otherCard.innerHTML = `
//   <button class="choice-btn mixed-other-toggle" id="mixedOtherToggle">...
//   <div class="mixed-other-input-wrap" id="mixedOtherInputWrap">
//     <input ... id="mixedOtherInput" ...>
//     <button id="mixedOtherSubmit" ...>提交</button>
//   </div>
// `;

// 修改為：在 input 和 submit 之間插入麥克風按鈕
// otherCard.innerHTML = `
//   <button class="choice-btn mixed-other-toggle" id="mixedOtherToggle">
//     <span class="choice-letter">D</span>
//     <span class="choice-text">${t('mixed_other_label') || '其他：____'}</span>
//     <span class="choice-expand-icon">▾</span>
//   </button>
//   <div class="mixed-other-input-wrap" id="mixedOtherInputWrap">
//     <input type="text" id="mixedOtherInput" ...>
//     <button class="btn btn-mic" id="mixedOtherMic">🎤</button>
//     <button id="mixedOtherSubmit" class="btn btn-submit mixed-other-submit">${t('submit') || '提交'}</button>
//   </div>
// `;
```

然後在函數末尾（獲取 toggle, wrap, input, submit 之後），加入：

```javascript
// 語音按鈕綁定
const micBtn = otherCard.querySelector('#mixedOtherMic');
if (micBtn && input) {
  const micButton = createMicButton(input, null);
  micBtn.replaceWith(micButton);
}
```

#### 4. 在 `game.js` 的 `setupTextInput()` 中集成麥克風

在 `game.js` 約第 863-900 行的 `setupTextInput()` 函數中，在 `inputContainer` 佈局裡加入麥克風按鈕：

```javascript
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

  // === 新增：插入麥克風按鈕到 inputContainer ===
  const inputContainer = document.getElementById('inputContainer');
  if (inputContainer && typeof createMicButton === 'function') {
    // 檢查是否已存在麥克風按鈕，避免重複
    let micBtn = inputContainer.querySelector('.voice-input-btn');
    if (!micBtn) {
      micBtn = createMicButton(inputEl, null);
      // 插入在 input 和 submit 之間
      const submitBtnEl = document.getElementById('submitInputBtn');
      if (submitBtnEl) {
        inputContainer.insertBefore(micBtn, submitBtnEl);
      } else {
        inputContainer.appendChild(micBtn);
      }
    }
  }
  // === 新增結束 ===

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = t('submit');
  }

  // ... 其餘原有代碼不變 ...
}
```

#### 5. 在通話場景（`renderImmigrationCall`）中集成語音

在 `enhanced-ui.js` 的 `setupImmigrationCallInteraction()` 函數（約第 653 行起）中，當玩家接聽電話並聽完 IVR 訊息後，在 `immigrationStoryActions` 區域加入語音輸入選項：

```javascript
// 在 setupImmigrationCallInteraction 函數中，找到 immigrationStoryArea 的操作區域
// 原本只有 complyBtn 和 storyHangup 兩個按鈕
// 在它們之後加入一個「語音回應」區域

// 在 storyArea 的 HTML 中加入（或在 JS 中動態插入）：
// <div class="immigration-voice-area" id="immigrationVoiceArea" style="display:none;">
//   <input type="text" id="immigrationVoiceInput" class="interactive-input" placeholder="或用語音說出你的回應…">
//   <button class="btn btn-mic" id="immigrationVoiceMic">🎤</button>
//   <button class="btn btn-submit" id="immigrationVoiceSubmit">發送</button>
// </div>

// 在 setupImmigrationCallInteraction 中綁定：
const voiceArea = document.getElementById('immigrationVoiceArea');
const voiceInput = document.getElementById('immigrationVoiceInput');
const voiceMic = document.getElementById('immigrationVoiceMic');
const voiceSubmit = document.getElementById('immigrationVoiceSubmit');

if (voiceInput && voiceMic && typeof createMicButton === 'function') {
  const micBtn = createMicButton(voiceInput, null);
  voiceMic.replaceWith(micBtn);
}

if (voiceSubmit && voiceInput) {
  voiceSubmit.onclick = () => {
    const text = voiceInput.value.trim();
    if (!text) return;
    // 復用 game.js 的 checkKeyword 進行關鍵字判斷
    const result = typeof checkKeyword === 'function' ? checkKeyword(text) : 'neutral';
    if (result === 'good') {
      goGoodPath();
    } else if (result === 'bad') {
      goBadPath();
    } else {
      // 中性：提示玩家再想想
      const feedback = '你的回應不太明確。記住：面對可疑來電，掛斷並查證是最安全的做法。';
      if (typeof showFeedbackWithContinue === 'function') {
        showFeedbackWithContinue(feedback, 'mid', () => {
          // 允許重新選擇
          if (voiceArea) voiceArea.style.display = 'none';
          const actions = document.getElementById('immigrationStoryActions');
          if (actions) actions.style.display = 'flex';
        });
      }
    }
  };
}
```

#### 6. CSS 樣式（加入 `style.css`）

```css
/* === 語音輸入按鈕 === */
.btn-mic, .voice-input-btn {
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  min-width: 44px;
  font-size: 1.2rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-mic:hover, .voice-input-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
}

.btn-mic.mic-active, .voice-input-btn.mic-active {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  animation: mic-pulse 1.2s ease-in-out infinite;
}

@keyframes mic-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
}

/* 麥克風按鈕在輸入區的佈局 */
.mixed-other-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mixed-other-input-wrap .interactive-input {
  flex: 1;
}

#inputContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}

#inputContainer .interactive-input {
  flex: 1;
}

/* 通話場景語音區 */
.immigration-voice-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 12px;
}

.immigration-voice-area .interactive-input {
  flex: 1;
}
```

---

## 功能二：選擇題關卡增加「自由輸入」選項

### 目標
在所有 `type: "choice"` 的場景中，在預設選項按鈕之後，追加一個「其他：____」選項。玩家可以點開它自由輸入文字，系統使用 `checkKeyword()` 進行關鍵字判斷，決定走向 good / bad / neutral 分支。

### 涉及文件
- `game.js`：修改 `renderChoices()` 函數（約第 830 行）
- `style.css`：復用 `mixed_input` 的樣式

### 具體改動

#### 1. 修改 `game.js` 的 `renderChoices()` 函數

在現有的 `renderChoices()` 函數末尾（約第 861 行 `registerSceneCleanup` 之前），追加「其他」選項：

```javascript
function renderChoices(choices) {
  const container = document.getElementById('choicesContainer');
  if (!container) return;

  container.innerHTML = '';
  container.onclick = null;

  // 渲染預設選項（原有代碼）
  choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.choiceIndex = idx;
    btn.textContent = getChoiceText(choice);
    container.appendChild(btn);
  });

  // === 新增：追加「其他：____」自由輸入選項 ===
  const scene = getCurrentScene();
  if (scene && scene.type === 'choice') {
    appendFreeInputOption(container, choices, scene);
  }
  // === 新增結束 ===

  // 事件委託（原有代碼）
  container.onclick = _debounce((e) => {
    const btn = e.target.closest('.choice-btn');
    if (!btn) return;
    if (btn.disabled) return;
    const idx = parseInt(btn.dataset.choiceIndex, 10);
    if (isNaN(idx) || !choices[idx]) return;
    handleChoice(choices[idx]);
  }, 300);

  registerSceneCleanup(() => {
    const cc = document.getElementById('choicesContainer');
    if (cc) { cc.onclick = null; cc.innerHTML = ''; }
  });
}
```

#### 2. 新增 `appendFreeInputOption()` 函數（加在 `game.js` 中，`renderChoices` 之後）

```javascript
/**
 * 為 choice 類型場景追加「其他：____」自由輸入選項
 * 復用 checkKeyword() 進行關鍵字判斷
 * @param {HTMLElement} container - 選項容器
 * @param {Array} choices - 預設選項數組
 * @param {Object} scene - 當前場景
 */
function appendFreeInputOption(container, choices, scene) {
  // 找到 good 和 bad 選項作為分支跳轉目標
  const goodChoice = choices.find(c => c.feedbackType === 'good');
  const badChoice = choices.find(c => c.feedbackType === 'bad');

  // 如果沒有明確的 good/bad，用最後一個和第一個
  const goodNext = goodChoice ? goodChoice.nextSceneId : (choices[choices.length - 1] || {}).nextSceneId;
  const badNext = badChoice ? badChoice.nextSceneId : (choices[0] || {}).nextSceneId;

  // 創建「其他」選項卡片
  const otherCard = document.createElement('div');
  otherCard.className = 'choice-free-input-card';
  otherCard.innerHTML = `
    <button class="choice-btn choice-free-toggle" id="choiceFreeToggle">
      <span class="choice-letter">自由</span>
      <span class="choice-text">${t('mixed_other_label') || '其他：____'}</span>
      <span class="choice-expand-icon">▾</span>
    </button>
    <div class="choice-free-input-wrap" id="choiceFreeInputWrap">
      <input
        type="text"
        id="choiceFreeInput"
        class="interactive-input"
        placeholder="${t('free_input_placeholder') || '輸入你想做的方式…'}"
        maxlength="200"
        autocomplete="off"
      >
      <button class="btn btn-mic" id="choiceFreeMic">🎤</button>
      <button class="btn btn-submit" id="choiceFreeSubmit">
        ${t('submit') || '提交'}
      </button>
    </div>
  `;
  container.appendChild(otherCard);

  const toggle = otherCard.querySelector('#choiceFreeToggle');
  const wrap = otherCard.querySelector('#choiceFreeInputWrap');
  const input = otherCard.querySelector('#choiceFreeInput');
  const submit = otherCard.querySelector('#choiceFreeSubmit');
  const mic = otherCard.querySelector('#choiceFreeMic');

  // 展開/收合
  toggle.onclick = (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('is-open');
    if (isOpen) {
      wrap.classList.remove('is-open');
      toggle.classList.remove('expanded');
    } else {
      wrap.classList.add('is-open');
      toggle.classList.add('expanded');
      setTimeout(() => input && input.focus(), 60);
    }
  };

  // 麥克風按鈕
  if (mic && input && typeof createMicButton === 'function') {
    const micBtn = createMicButton(input, null);
    mic.replaceWith(micBtn);
  }

  // 提交處理
  const handleSubmit = () => {
    const text = input.value.trim();
    if (!text) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      return;
    }

    if (typeof stopCountdown === 'function') stopCountdown();

    // 禁用所有選項
    container.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
      b.classList.add('choice-disabled');
    });
    input.disabled = true;
    if (submit) submit.disabled = true;

    // 關鍵字判斷
    const result = typeof checkKeyword === 'function' ? checkKeyword(text) : 'neutral';

    let feedback, feedbackType, nextSceneId, effects;

    if (result === 'good') {
      feedbackType = 'good';
      nextSceneId = goodNext;
      effects = { alertness: 15, calmness: 10, information: 15, riskScore: -10, xp: 25, score: 50 };
      feedback = t('free_input_good_feedback') || '✅ 你講得啱！「先查證」永遠係防騙第一步，做得好！';
    } else if (result === 'bad') {
      feedbackType = 'bad';
      nextSceneId = badNext;
      effects = { alertness: -10, calmness: -15, riskScore: 25, money: -20, xp: 5, score: -80 };
      feedback = t('free_input_bad_feedback') || '⚠️ 呢個做法有風險！任何要求轉帳、俾密碼、俾驗證碼嘅做法都唔好做，立刻掛斷，致電 18222 查證。';
    } else {
      // neutral：允許重新輸入或選擇預設選項
      feedbackType = 'mid';
      feedback = t('free_input_neutral_feedback') || '你嘅想法好有意思，但記住：唔確定嘅時候，先查證！你可以再諗諗，或者揀返上面嘅建議。';
      effects = { alertness: -5, calmness: -5, riskScore: 10, xp: 3, score: -15 };
      nextSceneId = null; // 不跳轉，允許重新選擇
    }

    if (typeof applyEffects === 'function') {
      applyEffects(effects, 'free_input');
    }

    const navigate = () => {
      if (!nextSceneId) {
        // neutral：解禁選項，讓玩家重新選擇
        container.querySelectorAll('.choice-btn').forEach(b => {
          b.disabled = false;
          b.classList.remove('choice-disabled');
        });
        input.disabled = false;
        input.value = '';
        if (submit) submit.disabled = false;
        if (typeof startCountdown === 'function') startCountdown();
        return;
      }
      if (nextSceneId === '__next_level__') { nextLevel(); return; }
      if (nextSceneId === '__ending__') { showEnding(); return; }
      goToScene(nextSceneId);
    };

    if (typeof showFeedbackWithContinue === 'function') {
      if (feedbackType === 'bad' && typeof triggerAlarm === 'function') {
        triggerAlarm(() => {
          showFeedbackWithContinue(feedback, feedbackType, navigate);
        });
      } else {
        showFeedbackWithContinue(feedback, feedbackType, navigate);
      }
    } else {
      setTimeout(navigate, 800);
    }
  };

  if (submit) {
    submit.onclick = handleSubmit;
  }
  if (input) {
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
  }

  registerSceneCleanup(() => {
    if (toggle) toggle.onclick = null;
    if (submit) submit.onclick = null;
    if (input) input.onkeypress = null;
  });
}
```

#### 3. CSS 樣式（加入 `style.css`）

```css
/* === 選擇題自由輸入選項 === */
.choice-free-input-card {
  width: 100%;
  margin-top: 8px;
}

.choice-free-toggle {
  border: 2px dashed #6B7280 !important;
  background: transparent !important;
  color: #6B7280 !important;
  opacity: 0.8;
}

.choice-free-toggle:hover {
  border-color: #6366F1 !important;
  color: #6366F1 !important;
  opacity: 1;
}

.choice-free-toggle.expanded {
  border-color: #6366F1 !important;
  color: #6366F1 !important;
}

.choice-free-toggle .choice-letter {
  background: rgba(99, 102, 241, 0.15);
  color: #6366F1;
}

.choice-free-input-wrap {
  display: none;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.06);
  border-radius: 12px;
  animation: slideDown 0.3s ease;
}

.choice-free-input-wrap.is-open {
  display: flex;
}

.choice-free-input-wrap .interactive-input {
  flex: 1;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### 4. 語言鍵值（加入 `lang.js`）

在 `lang.js` 的 `translations` 對象中新增以下鍵值（每個語言都要加）：

```javascript
'free_input_placeholder': {
  'zh-TW': '輸入你想做的方式…',
  'zh': '输入你想做的方式…',
  'en': 'Type your own approach…'
},
'free_input_good_feedback': {
  'zh-TW': '✅ 你講得啱！「先查證」永遠係防騙第一步，做得好！',
  'zh': '✅ 你说得对！「先查证」永远是防骗第一步，做得好！',
  'en': '✅ Exactly! "Verify first" is always step #1 — great job!'
},
'free_input_bad_feedback': {
  'zh-TW': '⚠️ 呢個做法有風險！任何要求轉帳、俾密碼、俾驗證碼嘅做法都唔好做，立刻掛斷，致電 18222 查證。',
  'zh': '⚠️ 这个做法有风险！任何要求转账、给密码、给验证码的做法都不要做，立刻挂断，致电 18222 查证。',
  'en': '⚠️ Risky approach! Never respond to requests for transfer, password, or verification code. Hang up and call 18222.'
},
'free_input_neutral_feedback': {
  'zh-TW': '你嘅想法好有意思，但記住：唔確定嘅時候，先查證！你可以再諗諗，或者揀返上面嘅建議。',
  'zh': '你的想法很有意思，但记住：不确定的时候，先查证！你可以再想想，或者选回上面的建议。',
  'en': 'Interesting thought! But remember: when unsure, verify first. Think again or pick a suggestion above.'
}
```

---

## 功能三：倒計時只在詐騙犯對話中出現

### 目標
目前 `startCountdown()` 在所有有選項/輸入的場景都啟動（`game.js` 第 822 行）。改為只在 `scene.speaker === 'scammer'` 或 `scene.pressure === true` 時才啟動倒計時。其他場景（系統提示、官方人員說明、結果卡片等）不計時。

### 涉及文件
- `game.js`：修改 `startCountdown()` 函數（約第 1365 行）

### 具體改動

#### 修改 `startCountdown()` 函數的判斷條件

在 `game.js` 第 1365-1380 行，找到：

```javascript
function startCountdown() {
  const scene = getCurrentScene();
  if (!scene) { hideCountdown(); return; }

  const isQuestion =
    scene.type === 'text_input' ||
    scene.type === 'mixed_input' ||
    (scene.choices && scene.choices.length >= 2);

  if (!isQuestion) {
    hideCountdown();
    return;
  }
  // ... 後續代碼 ...
}
```

修改為：

```javascript
function startCountdown() {
  const scene = getCurrentScene();
  if (!scene) { hideCountdown(); return; }

  const isQuestion =
    scene.type === 'text_input' ||
    scene.type === 'mixed_input' ||
    (scene.choices && scene.choices.length >= 2);

  if (!isQuestion) {
    hideCountdown();
    return;
  }

  // === 新增：倒計時只在詐騙犯對話或高壓場景啟動 ===
  // 場景明確設定了 countdown 數值 → 尊重該設定（覆蓋規則）
  // 否則：只有 speaker === 'scammer' 或 pressure === true 時才啟動
  const isScammerScene = scene.speaker === 'scammer' || scene.pressure === true;
  const hasExplicitCountdown = typeof scene.countdown === 'number' && scene.countdown > 0;

  if (!isScammerScene && !hasExplicitCountdown) {
    hideCountdown();
    return;
  }

  // 如果場景有自定義倒計時秒數，使用它
  if (hasExplicitCountdown) {
    COUNTDOWN_CONFIG.perChoiceSeconds = scene.countdown;
  }
  // === 新增結束 ===

  stopCountdown();
  gameState.countdown.active = true;
  gameState.countdown.remaining = COUNTDOWN_CONFIG.perChoiceSeconds;
  gameState._pearCountdownWarned = false;

  // ... 後續原有代碼不變 ...
}
```

### 影響範圍說明

修改後，倒計時行為變化如下：

| 場景類型 | speaker | 修改前 | 修改後 |
|----------|---------|--------|--------|
| 選擇題（騙徒施壓） | scammer | 有倒計時 | 有倒計時（不變） |
| 選擇題（官方人員） | official | 有倒計時 | **無倒計時** |
| 選擇題（系統提示） | system | 有倒計時 | **無倒計時** |
| 混合輸入題 | system | 有倒計時 | **無倒計時**（除非 `scene.countdown` 有設定） |
| 混合輸入題（有 `countdown: 25`） | system | 有倒計時 | 有倒計時（因為 `hasExplicitCountdown`） |
| 結果卡片 | official/system | 無倒計時 | 無倒計時（不變） |

> 注意：`levels.js` 中第 336 行的 `l1_s_mixed` 場景設定了 `countdown: 25`，這個會繼續生效。其他 `mixed_input` 場景如果也想保留倒計時，在 scene 中加 `countdown: 15` 即可。

---

## 附錄：checkKeyword() 關鍵字庫說明

自由輸入的文字判斷完全依賴 `data.js` 中的 `keywordBank`，已有完整的三語（繁體/簡體/英文）關鍵字庫：

- **verify 類（正向）**：查證、核實、18222、防騙、報警、掛斷、拒絕、可疑、假的、騙子、冷静、先查…等 80+ 個詞
- **danger 類（負向）**：轉賬、密碼、驗證碼、身份證、安全帳戶、配合調查、保密、通緝令…等 80+ 個詞
- **否定詞處理**：「不轉賬」「不要給密碼」等帶否定詞的危險關鍵字會被正確識別為正向

`checkKeyword()` 返回 `'good'` / `'bad'` / `'neutral'`，可直接用於決定分支走向。

---

## 實現順序建議

1. **先做功能三**（倒計時限制）— 改動最小，只改 `startCountdown()` 一個函數
2. **再做功能二**（選擇題自由輸入）— 核心功能，新增 `appendFreeInputOption()` + 修改 `renderChoices()`
3. **最後做功能一**（語音系統）— 依賴功能二的輸入框，新增 `VoiceInput` 模塊 + `createMicButton()` + 集成到各場景

每個功能獨立可測試，互不阻塞。
