// ===================================================================
// Anti-Scam Story Simulator — Translations (i18n)
// 別急，先查證 · 多語言翻譯
// 支援：繁體中文 (zh-TW) / 簡體中文 (zh) / English (en)
// ===================================================================

const translations = {
  // ===== 遊戲標題 =====
  game_title: {
    'zh-TW': '別急，先查證',
    'zh': '别急，先查证',
    'en': "Don't Rush, Verify First"
  },
  game_subtitle: {
    'zh-TW': '香港大學生反詐騙互動遊戲',
    'zh': '香港大学生反诈骗互动游戏',
    'en': 'HK Student Anti-Scam Interactive Game'
  },
  game_tagline: {
    'zh-TW': '5大關卡 · 真實情境 · 學會保護自己',
    'zh': '5大关卡 · 真实情境 · 学会保护自己',
    'en': '5 Levels · Real Scenarios · Learn to Protect Yourself'
  },

  // ===== 開始畫面 =====
  start_title: {
    'zh-TW': '你能識破騙局嗎？',
    'zh': '你能识破骗局吗？',
    'en': 'Can You Spot the Scam?'
  },
  start_desc: {
    'zh-TW': '在香港讀大學，你可能接到假冒入境處的電話、收到假銀行釣魚短訊、在網上碰到假租房。\n\n這不是測試你聰不聰明——而是測試你在壓力下，能不能記得「先查證」。',
    'zh': '在香港读大学，你可能接到假冒入境处的电话、收到假银行钓鱼短信、在网上碰到假租房。\n\n这不是测试你聪不聪明——而是测试你在压力下，能不能记得「先查证」。',
    'en': "Studying in Hong Kong, you might get calls from fake immigration, phishing SMS from 'banks', or rental scams online.\n\nThis isn't about how smart you are — it's about remembering to verify first, under pressure."
  },
  start_btn: {
    'zh-TW': '開始遊戲',
    'zh': '开始游戏',
    'en': 'Start Game'
  },

  // ===== 身份選擇 =====
  choose_identity: {
    'zh-TW': '選擇你的身份',
    'zh': '选择你的身份',
    'en': 'Choose Your Identity'
  },
  identity_mainland: {
    'zh-TW': '內地來港學生',
    'zh': '内地来港学生',
    'en': 'Mainland Student in HK'
  },
  identity_local: {
    'zh-TW': '香港本地學生',
    'zh': '香港本地学生',
    'en': 'Local HK Student'
  },
  mainland_desc: {
    'zh-TW': '剛來香港，對環境還在適應。語言壓力、身份焦慮讓你更容易成為假冒公檢法、假冒入境處的目標。',
    'zh': '刚来香港，对环境还在适应。语言压力、身份焦虑让你更容易成为假冒公检法、假冒入境处的目标。',
    'en': "New to HK, still adapting. Language pressure and identity anxiety make you more vulnerable to impersonation scams."
  },
  local_desc: {
    'zh-TW': '土生土長，對銀行、轉數快、PayMe 都熟得不能再熟。但正因太熟悉，反而容易放鬆警惕。',
    'zh': '土生土长，对银行、转数快、PayMe 都熟得不能再熟。但正因太熟悉，反而容易放松警惕。',
    'en': "Local-born, familiar with banks, FPS, PayMe. But familiarity can breed complacency — that's when scams work."
  },
  click_to_select: {
    'zh-TW': '點擊選擇',
    'zh': '点击选择',
    'en': 'Click to Select'
  },

  // ===== 遊戲狀態欄 =====
  stat_alertness: {
    'zh-TW': '警覺性',
    'zh': '警觉性',
    'en': 'Alertness'
  },
  stat_information: {
    'zh-TW': '資訊量',
    'zh': '信息量',
    'en': 'Information'
  },
  stat_risk: {
    'zh-TW': '風險值',
    'zh': '风险值',
    'en': 'Risk Score'
  },
  stat_money: {
    'zh-TW': '財產狀況',
    'zh': '财产状况',
    'en': 'Financial Status'
  },
  stat_xp: {
    'zh-TW': '經驗值',
    'zh': '经验值',
    'en': 'XP'
  },
  player_level: {
    'zh-TW': '等級',
    'zh': '等级',
    'en': 'Level'
  },
  level_up: {
    'zh-TW': '升級了！',
    'zh': '升级了！',
    'en': 'Level Up!'
  },

  // ===== 關卡進度 =====
  stage_progress: {
    'zh-TW': '關卡進度',
    'zh': '关卡进度',
    'en': 'Stage Progress'
  },

  // ===== 說話者 =====
  speaker_scammer: {
    'zh-TW': '可疑人物',
    'zh': '可疑人物',
    'en': 'Unknown Caller'
  },
  speaker_official: {
    'zh-TW': '官方機構',
    'zh': '官方机构',
    'en': 'Official Authority'
  },
  speaker_system: {
    'zh-TW': '系統',
    'zh': '系统',
    'en': 'System'
  },
  speaker_friend: {
    'zh-TW': '朋友',
    'zh': '朋友',
    'en': 'Friend'
  },

  // ===== 文字輸入 =====
  submit: {
    'zh-TW': '發送',
    'zh': '发送',
    'en': 'Send'
  },
  input_placeholder: {
    'zh-TW': '輸入你想說的話…',
    'zh': '输入你想说的话…',
    'en': 'Type your message…'
  },

  // ===== 紅旗 / 釣魚卡 =====
  red_flags_detected: {
    'zh-TW': '偵測到可疑紅旗',
    'zh': '侦测到可疑红旗',
    'en': 'Red Flags Detected'
  },

  // ===== 語音來電 =====
  call_incoming: {
    'zh-TW': '來電中…',
    'zh': '来电中…',
    'en': 'Incoming Call…'
  },
  call_connected: {
    'zh-TW': '通話中',
    'zh': '通话中',
    'en': 'Connected'
  },
  click_to_listen: {
    'zh-TW': '點擊播放語音',
    'zh': '点击播放语音',
    'en': 'Click to play voice'
  },
  click_to_listen_real: {
    'zh-TW': '點擊播放真實語音（瀏覽器合成）',
    'zh': '点击播放真实语音（浏览器合成）',
    'en': 'Click to play voice (browser synthesized)'
  },

  // ===== 分數與等級 =====
  stat_score: {
    'zh-TW': '反詐分數',
    'zh': '反诈分数',
    'en': 'Anti-Scam Score'
  },
  total_score: {
    'zh-TW': '總分',
    'zh': '总分',
    'en': 'Total Score'
  },
  detailed_stats: {
    'zh-TW': '詳細數據',
    'zh': '详细数据',
    'en': 'Detailed Stats'
  },

  // ===== 勳章系統 =====
  medal_unlocked: {
    'zh-TW': '勳章解鎖！',
    'zh': '勋章解锁！',
    'en': 'Medal Unlocked!'
  },
  medals_earned: {
    'zh-TW': '獲得勳章',
    'zh': '获得勋章',
    'en': 'Medals Earned'
  },
  no_medals: {
    'zh-TW': '尚未獲得任何勳章',
    'zh': '尚未获得任何勋章',
    'en': 'No medals earned yet'
  },

  // ===== Deepfake =====
  deepfake_warning: {
    'zh-TW': '⚠️ 注意：畫面可能為 Deepfake 換臉',
    'zh': '⚠️ 注意：画面可能为 Deepfake 换脸',
    'en': '⚠️ Warning: Video may be a Deepfake'
  },

  // ===== 結局畫面 =====
  ending_title: {
    'zh-TW': '遊戲結束',
    'zh': '游戏结束',
    'en': 'Game Over'
  },
  ending_stats: {
    'zh-TW': '你的數據',
    'zh': '你的数据',
    'en': 'Your Stats'
  },
  ending_advice: {
    'zh-TW': '建議與提醒',
    'zh': '建议与提醒',
    'en': 'Advice & Reminders'
  },
  restart_btn: {
    'zh-TW': '再玩一次',
    'zh': '再玩一次',
    'en': 'Play Again'
  },

  // ===== 關卡名稱 =====
  level_1_title: {
    'zh-TW': '校園租房與宿位詐騙',
    'zh': '校园租房与宿位诈骗',
    'en': 'Campus & Housing Scam'
  },
  level_2_title: {
    'zh-TW': '假冒政府機構來電',
    'zh': '假冒政府机构来电',
    'en': 'Impersonating Government Authorities'
  },
  level_3_title: {
    'zh-TW': '釣魚短訊與銀行詐騙',
    'zh': '钓鱼短信与银行诈骗',
    'en': 'Phishing SMS & Banking Fraud'
  },
  level_4_title: {
    'zh-TW': '刷單兼職與投資詐騙',
    'zh': '刷单兼职与投资诈骗',
    'en': 'Click Farming & Investment Scam'
  },
  level_5_title: {
    'zh-TW': 'Deepfake 與社交媒體詐騙',
    'zh': 'Deepfake 与社交媒体诈骗',
    'en': 'Deepfake & Social Media Scam'
  },

  // ===== 通用 =====
  next: {
    'zh-TW': '下一步',
    'zh': '下一步',
    'en': 'Next'
  },
  back: {
    'zh-TW': '返回',
    'zh': '返回',
    'en': 'Back'
  },
  continue: {
    'zh-TW': '繼續',
    'zh': '继续',
    'en': 'Continue'
  },
  warning: {
    'zh-TW': '警告',
    'zh': '警告',
    'en': 'Warning'
  },
  safe: {
    'zh-TW': '安全',
    'zh': '安全',
    'en': 'Safe'
  },
  danger: {
    'zh-TW': '危險',
    'zh': '危险',
    'en': 'Danger'
  },

  // ===== 香港反詐資源 =====
  resource_scameter: {
    'zh-TW': '防騙視伏器 (Scameter)',
    'zh': '防骗视伏器 (Scameter)',
    'en': 'Scameter'
  },
  resource_adcc: {
    'zh-TW': '反詐騙協調中心 (ADCC)',
    'zh': '反诈骗协调中心 (ADCC)',
    'en': 'Anti-Deception Coordination Centre (ADCC)'
  },
  resource_hotline: {
    'zh-TW': '防騙易 18222 熱線',
    'zh': '防骗易 18222 热线',
    'en': 'Anti-Scam Hotline 18222'
  },
  resource_hkpf: {
    'zh-TW': '香港警務處',
    'zh': '香港警务处',
    'en': 'Hong Kong Police Force'
  },

  // ===== 關卡過渡 =====
  level_intro: {
    'zh-TW': '第 {{n}} 關',
    'zh': '第 {{n}} 关',
    'en': 'Level {{n}}'
  },

  // ===== 語言切換 =====
  lang_zh_tw: {
    'zh-TW': '繁體',
    'zh': '繁体',
    'en': '繁中'
  },
  lang_zh_cn: {
    'zh-TW': '简体',
    'zh': '简体',
    'en': '简中'
  },
  lang_en: {
    'zh-TW': 'English',
    'zh': 'English',
    'en': 'English'
  },

  // ===== 回饋類型 =====
  feedback_good: {
    'zh-TW': '做得好！',
    'zh': '做得好！',
    'en': 'Well done!'
  },
  feedback_bad: {
    'zh-TW': '小心！',
    'zh': '小心！',
    'en': 'Be careful!'
  },
  feedback_mid: {
    'zh-TW': '想一想',
    'zh': '想一想',
    'en': 'Think again'
  },

  // ===== 語言選擇彈窗 =====
  lang_select_title: {
    'zh-TW': '選擇語言',
    'zh': '选择语言',
    'en': 'Select Language'
  },
  lang_select_subtitle: {
    'zh-TW': '請選擇你偏好的語言',
    'zh': '请选择你偏好的语言',
    'en': 'Please choose your preferred language'
  },
  lang_auto_detected: {
    'zh-TW': '已根據你的瀏覽器自動偵測',
    'zh': '已根据你的浏览器自动检测',
    'en': 'Auto-detected from your browser'
  },

  // ===== 左側屬性面板 =====
  panel_nickname: {
    'zh-TW': '你的暱稱',
    'zh': '你的昵称',
    'en': 'Your Nickname'
  },
  panel_nickname_placeholder: {
    'zh-TW': '輸入暱稱…',
    'zh': '输入昵称…',
    'en': 'Enter nickname…'
  },
  panel_vigilance: {
    'zh-TW': '警惕值',
    'zh': '警惕值',
    'en': 'Vigilance'
  },
  panel_calmness: {
    'zh-TW': '冷靜值',
    'zh': '冷静值',
    'en': 'Calmness'
  },
  panel_level: {
    'zh-TW': '第 {{n}} / {{total}} 關',
    'zh': '第 {{n}} / {{total}} 关',
    'en': 'Level {{n}} / {{total}}'
  },
  panel_countdown: {
    'zh-TW': '倒計時',
    'zh': '倒计时',
    'en': 'Countdown'
  },
  panel_stat_info: {
    'zh-TW': '資訊量',
    'zh': '信息量',
    'en': 'Info'
  },
  panel_stat_risk: {
    'zh-TW': '風險值',
    'zh': '风险值',
    'en': 'Risk'
  },
  panel_stat_money: {
    'zh-TW': '財產',
    'zh': '财产',
    'en': 'Money'
  },
  panel_stat_score: {
    'zh-TW': '反詐分',
    'zh': '反诈分',
    'en': 'Score'
  },

  // ===== 倒計時與超時 =====
  timeout_warning: {
    'zh-TW': '⏰ 時間到！你猶豫太久，騙子最愛利用你的遲疑。',
    'zh': '⏰ 时间到！你犹豫太久，骗子最爱利用你的迟疑。',
    'en': "⏰ Time's up! Scammers love to exploit your hesitation."
  },

  // ===== 警報動畫 =====
  alarm_danger: {
    'zh-TW': '⚠️ 危險！這可能是詐騙！',
    'zh': '⚠️ 危险！这可能是诈骗！',
    'en': '⚠️ Danger! This could be a scam!'
  },

  // ===== 點擊繼續 =====
  click_to_continue: {
    'zh-TW': '點擊繼續 →',
    'zh': '点击继续 →',
    'en': 'Click to continue →'
  },

  // ===== 混合輸入元件（mixed_input）=====
  mixed_other_label: {
    'zh-TW': '其他：______',
    'zh': '其他：______',
    'en': 'Other: ______'
  },
  mixed_input_placeholder: {
    'zh-TW': '輸入你的想法…（例如：我會報警 / 我先查證）',
    'zh': '输入你的想法…（例如：我会报警 / 我先查证）',
    'en': 'Type your thought… (e.g. I will call police / I will verify first)'
  },

  // ===== 釣魚簡訊鎖屏元件（sms_lockscreen）=====
  sms_app_messages: {
    'zh-TW': '訊息',
    'zh': '信息',
    'en': 'Messages'
  },
  sms_now: {
    'zh-TW': '現在',
    'zh': '现在',
    'en': 'now'
  },
  sms_open_link: {
    'zh-TW': '打開連結',
    'zh': '打开链接',
    'en': 'Open Link'
  },
  sms_ignore: {
    'zh-TW': '忽略簡訊',
    'zh': '忽略短信',
    'en': 'Ignore SMS'
  },
  sms_link_confirm: {
    'zh-TW': '你真的要打開這個連結嗎？（該網站可能不安全）',
    'zh': '你真的要打开这个链接吗？（该网站可能不安全）',
    'en': 'Are you sure you want to open this link? (This site may be unsafe)'
  },
  sms_confirm_open: {
    'zh-TW': '仍然打開',
    'zh': '仍然打开',
    'en': 'Open Anyway'
  },
  sms_confirm_cancel: {
    'zh-TW': '取消',
    'zh': '取消',
    'en': 'Cancel'
  },
  sms_phishing_card_label: {
    'zh-TW': '請輸入信用卡資料以領取包裹：',
    'zh': '请输入信用卡资料以领取包裹：',
    'en': 'Enter credit card details to claim your parcel:'
  },
  sms_phishing_submit: {
    'zh-TW': '提交並領取',
    'zh': '提交并领取',
    'en': 'Submit & Claim'
  },
  sms_phishing_stealing: {
    'zh-TW': '⏳ 正在竊取你的資料…',
    'zh': '⏳ 正在窃取你的资料…',
    'en': '⏳ Stealing your data…'
  },
  sms_phishing_stolen: {
    'zh-TW': '⚠️ 你已被盜取信息！卡片資料、個人資料已傳送到騙子伺服器。',
    'zh': '⚠️ 你已被盗取信息！卡片资料、个人资料已传送到骗子服务器。',
    'en': '⚠️ Your data has been stolen! Card details and personal info sent to scammer server.'
  },
  sms_phishing_bad_feedback: {
    'zh-TW': '⚠️ 你點擊了可疑連結並進入釣魚網站——這是釣魚簡訊詐騙的經典手法。陌生連結不要點，香港郵政、銀行不會用短網址要求你輸入卡片資料。',
    'zh': '⚠️ 你点击了可疑链接并进入钓鱼网站——这是钓鱼短信诈骗的经典手法。陌生链接不要点，香港邮政、银行不会用短网址要求你输入卡片资料。',
    'en': '⚠️ You clicked a suspicious link and entered a phishing site — a classic SMS phishing tactic. Never click unknown links; HK Post and banks never ask for card details via short URLs.'
  },
  sms_phishing_good_feedback: {
    'zh-TW': '✅ 正確！陌生連結不要點。香港郵政官方域名是 hongkongpost.hk，不是 hk-post-track.com。任何要求你輸入卡片資料的「包裹領取」網站都是詐騙。',
    'zh': '✅ 正确！陌生链接不要点。香港邮政官方域名是 hongkongpost.hk，不是 hk-post-track.com。任何要求你输入卡片资料的「包裹领取」网站都是诈骗。',
    'en': '✅ Correct! Never click unknown links. HK Post\'s official domain is hongkongpost.hk, not hk-post-track.com. Any "parcel claim" site asking for card details is a scam.'
  },

  // ===== 入境處來電元件（phone_call_immigration）=====
  call_incoming_label: {
    'zh-TW': '來電中',
    'zh': '来电中',
    'en': 'Incoming'
  },
  call_immigration_hint: {
    'zh-TW': '向左滑動或點擊紅色按鈕拒絕，點擊綠色按鈕接聽',
    'zh': '向左滑动或点击红色按钮拒绝，点击绿色按钮接听',
    'en': 'Tap red to decline, green to answer'
  },
  call_hangup: {
    'zh-TW': '拒絕',
    'zh': '拒绝',
    'en': 'Decline'
  },
  call_answer: {
    'zh-TW': '接聽',
    'zh': '接听',
    'en': 'Answer'
  },
  call_in_progress: {
    'zh-TW': '通話中',
    'zh': '通话中',
    'en': 'In Call'
  },
  call_end: {
    'zh-TW': '結束通話',
    'zh': '结束通话',
    'en': 'End Call'
  },
  call_lang_cantonese: {
    'zh-TW': '廣東話',
    'zh': '广东话',
    'en': 'Cantonese'
  },
  call_lang_mandarin: {
    'zh-TW': '普通話',
    'zh': '普通话',
    'en': 'Mandarin'
  },
  call_comply: {
    'zh-TW': '配合對方，提供資料',
    'zh': '配合对方，提供资料',
    'en': 'Comply and provide info'
  },
  call_hangup_verify: {
    'zh-TW': '掛斷電話，自行查證',
    'zh': '挂断电话，自行查证',
    'en': 'Hang up and verify myself'
  },
  call_good_feedback: {
    'zh-TW': '✅ 正確！香港入境處絕不會用預錄語音威脅你，更不會電話索取 HKID 或要求轉帳到「安全帳戶」。掛斷後自己撥 2824 6111 查證是最佳做法。',
    'zh': '✅ 正确！香港入境处绝不会用预录语音威胁你，更不会电话索取 HKID 或要求转账到「安全账户」。挂断后自己拨 2824 6111 查证是最佳做法。',
    'en': '✅ Correct! HK Immigration never uses pre-recorded threats, never requests HKID by phone, and never asks for transfers to "safe accounts". Hanging up and calling 2824 6111 yourself is the best move.'
  },
  call_bad_feedback: {
    'zh-TW': '⚠️ 你配合了對方——這正是假冒政府詐騙的目標。記住：政府部門不會電話執法，更不會要求你提供身份證、護照或轉帳到「安全帳戶」。',
    'zh': '⚠️ 你配合了对方——这正是假冒政府诈骗的目标。记住：政府部门不会电话执法，更不会要求你提供身份证、护照或转账到「安全账户」。',
    'en': '⚠️ You complied — exactly what government impersonation scammers want. Remember: government never enforces by phone, never asks for HKID/passport, never asks for transfers to "safe accounts".'
  },

  // ===== 自由打字選項（choice-free）=====
  choice_free_other: {
    'zh-TW': '其他：自己輸入回應',
    'zh': '其他：自己输入回应',
    'en': 'Other: type your own response'
  },
  choice_free_placeholder: {
    'zh-TW': '輸入你會點做…例如：我會掛斷電話查證',
    'zh': '输入你会怎么做…例如：我会挂断电话查证',
    'en': "Type what you'd do… e.g., I'd hang up and verify"
  },
  choice_free_hint: {
    'zh-TW': '系統會根據你輸入嘅內容判斷係咪被騙',
    'zh': '系统会根据你输入的内容判断是否被骗',
    'en': 'The system will judge if you were scammed based on your input'
  },

  // ===== 語音輸入 =====
  voice_input_hint: {
    'zh-TW': '語音輸入',
    'zh': '语音输入',
    'en': 'Voice input'
  },
  voice_input_listening: {
    'zh-TW': '聆聽中…請講話',
    'zh': '聆听中…请说话',
    'en': 'Listening… please speak'
  },
  voice_input_unsupported: {
    'zh-TW': '此瀏覽器不支援語音輸入',
    'zh': '此浏览器不支持语音输入',
    'en': 'Voice input is not supported in this browser'
  },

  // ===== 入境處通話：自由回應區 =====
  call_free_response_label: {
    'zh-TW': '或者，自己講/打你嘅回應：',
    'zh': '或者，自己说/打你的回应：',
    'en': 'Or, speak/type your own response:'
  },
  call_free_response_placeholder: {
    'zh-TW': '例如：我會掛斷電話自己查證…',
    'zh': '例如：我会挂断电话自己查证…',
    'en': "e.g., I'd hang up and verify myself…"
  },
  call_free_response_hint: {
    'zh-TW': '系統會根據你嘅回應判斷係咪被騙',
    'zh': '系统会根据你的回应判断是否被骗',
    'en': 'The system will judge if you were scammed based on your response'
  }
};

// ===================================================================
// ===== 瀏覽器語言自動偵測 =====
// 規則：zh-HK / zh-TW / zh-MO → 繁體；zh-CN / zh-SG → 簡體；其他 → 繁體（預設）
// ===================================================================
function detectBrowserLanguage() {
  const nav = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || ''];

  for (const lang of nav) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    // 繁體：香港、台灣、澳門
    if (lower.includes('zh-hk') || lower.includes('zh-tw') || lower.includes('zh-mo') ||
        lower.includes('zh-hant') || lower === 'zh') {
      // 'zh' 單獨出現時，依地區判斷；無地區則預設繁體（香港遊戲）
      if (lower === 'zh') return 'zh-TW';
      return 'zh-TW';
    }
    // 簡體：大陸、新加坡
    if (lower.includes('zh-cn') || lower.includes('zh-sg') || lower.includes('zh-hans')) {
      return 'zh';
    }
  }
  // 預設繁體（香港本地遊戲）
  return 'zh-TW';
}
