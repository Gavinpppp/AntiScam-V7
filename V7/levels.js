// ===================================================================
// Anti-Scam Story Simulator — 配置驅動關卡數據
// 別急，先查證 · levels.js
// -------------------------------------------------------------------
// 結構說明：
//   每個關卡 LEVELS[i] = {
//     id, index, title/titleEn/titleZh, type, channel, icon, scamType,
//     redFlags: [...], officialChannels: [...],
//     scenes: [ Scene, Scene, ... ]
//   }
//
//   Scene 通用欄位：
//     id, type, speaker, text/textEn/textZh, visual
//     type ∈ { message, choice, input, mixed, deep_narrative, split_screen, result }
//
//   分支跳轉：choice.nextScene 指向同關 scene.id；特殊值：
//     "__next_level__" → 下一關
//     "__ending__"     → 結局畫面
//
//   deep_narrative：多步驟图文 + 打字機效果，每步驟可附 choices
//   split_screen：左右分欄（左聊天 / 右說服），用於額外關卡
// ===================================================================

const LEVELS = [
  // ─────────────────────────────────────────────────────────────
  // 第 1 關：假冒入境處來電（含深度被騙後續）
  // ─────────────────────────────────────────────────────────────
  {
    id: "l1_immigration",
    index: 1,
    title: "假冒入境處來電",
    titleEn: "Fake Immigration Call",
    titleZh: "假冒入境处来电",
    type: "phone_call",
    channel: "phone",
    icon: "📞",
    scamType: "假冒政府詐騙",
    redFlags: [
      "來電顯示為入境處號碼（+852 2824 6111）但對方用預錄語音",
      "聲稱你有「可疑包裹」要求提供身份證號碼",
      "威脅不配合將取消簽證、遞解出境",
      "要求轉接「內地公安」配合調查",
      "最終要求轉帳到「安全帳戶」"
    ],
    officialChannels: [
      "掛斷後自行致電入境處 2824 6111 查證",
      "致電防騙易熱線 18222",
      "使用防騙視伏器 (Scameter) 搜尋來電號碼",
      "政府部門絕不會電話執法、不會要求轉帳"
    ],
    scenes: [
      // ── 場景 1：接到來電，選擇語言 ──
      {
        id: "l1_s1_incoming",
        type: "choice",
        speaker: "scammer",
        text: "下午你在圖書館自習，手機突然響起。螢幕顯示來電號碼「+852 2824 6111」——這是入境處官方號碼。你接通了，對方說：「你好，呢度係香港入境事務處，廣東話請按 1，普通話請按 2。」",
        textEn: "Studying in the library, your phone rings. Caller ID shows '+852 2824 6111' — the official Immigration Department number. You answer: 'Hello, this is HK Immigration. Press 1 for Cantonese, 2 for Mandarin.'",
        textZh: "下午你在图书馆自习，手机突然响起。屏幕显示来电号码「+852 2824 6111」——这是入境处官方号码。你接通了，对方说：「你好，这里是香港入境事务处，广东话请按 1，普通话请按 2。」",
        visual: {
          type: "phone_call_immigration",
          callerId: "+852 2824 6111",
          callerName: "香港入境事務處",
          callerNameEn: "HK Immigration Department",
          callerNameZh: "香港入境事务处",
          // 修復1：按1/按2 後嘅語音文案（傳入 enhanced-ui.js 播放）
          cantoneseMessage: "我哋收到一份寄畀你嘅可疑包裹，入面有疑似違禁文件。而家你嘅學生簽證已經被標記，需要你立即提供身份證號碼同埋銀行帳戶核實，否則聽日就會取消你嘅簽證、安排遞解出境。",
          cantoneseMessageEn: "We received a suspicious parcel addressed to you with potentially illegal documents. Your student visa is now flagged. Please provide your ID number and bank account immediately, or your visa will be cancelled tomorrow and deportation proceedings will start.",
          cantoneseMessageZh: "我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则明天就会取消你的签证、安排递解出境。",
          mandarinMessage: "我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则明天将取消你的签证并安排递解出境。",
          mandarinMessageEn: "We received a suspicious parcel addressed to you with potentially illegal documents. Your student visa is now flagged. Please provide your ID number and bank account immediately, or your visa will be cancelled tomorrow and deportation proceedings will start.",
          mandarinMessageZh: "我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则明天将取消你的签证并安排递解出境。",
          // 虛擬手機互動導航：所有交互喺手機上完成，下方不再顯示選項
          goodNextSceneId: "l1_s_mixed",
          badNextSceneId: "l1_s2_parcel",
          goodFeedback: "✅ 正確！政府部門不會電話執法。掛斷後自行撥打官方號碼查證，是面對「政府來電」最正確的反應。號碼可以被偽造（來電顯示不可信）。",
          goodFeedbackEn: "✅ Correct! Government never enforces by phone. Hanging up and calling the official number yourself is the right response to 'government calls'. Caller ID can be spoofed.",
          goodFeedbackZh: "✅ 正确！政府部门不会电话执法。挂断后自行拨打官方号码查证，是面对「政府来电」最正确的反应。号码可以被伪造（来电显示不可信）。",
          badFeedback: "你選擇繼續聽——但記住：入境處不會主動來電要求提供資料。先聽無妨，但絕不能給出個人資料。",
          badFeedbackEn: "You continue listening — but remember: Immigration never proactively calls asking for info. Listening is fine, but never give personal data.",
          badFeedbackZh: "你选择继续听——但记住：入境处不会主动来电要求提供资料。先听无妨，但绝不能给出个人资料。"
        }
      },
      // ── 場景 2：對方稱有可疑包裹 ──
      {
        id: "l1_s2_parcel",
        type: "choice",
        speaker: "scammer",
        pressure: true,
        text: "對方用預錄語音繼續：「我哋收到一份寄畀你嘅可疑包裹，入面有疑似違禁文件。而家你嘅學生簽證已經被標記，需要你立即提供身份證號碼同埋銀行帳戶核實，否則會取消你嘅簽證。」\n\n你會點做？",
        textEn: "Pre-recorded voice continues: 'We received a suspicious parcel addressed to you containing suspected illegal documents. Your student visa is now flagged. Provide your ID number and bank account immediately, or your visa will be cancelled.'\n\nWhat do you do?",
        textZh: "对方用预录语音继续：「我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则会取消你的签证。」\n\n你会怎么做？",
        visual: {
          type: "chat",
          app: "Phone Call",
          appIcon: "📞",
          messages: [
            { type: "incoming", name: "入境事務處", text: "請提供身份證號碼同銀行帳戶核實，否則取消簽證" }
          ]
        },
        choices: [
          {
            id: "l1_s2_provide",
            text: "驚慌下提供身份證號碼",
            textEn: "Panicked, provide ID number",
            textZh: "惊慌下提供身份证号码",
            effects: { alertness: -15, calmness: -20, riskScore: 25, information: -10 },
            nextSceneId: "l1_s3_transfer_police",
            feedback: "⚠️ 你被威脅嚇倒了——這正是騙徒想要的心理狀態。記住：入境處絕不會電話索取身份證號碼，更不會威脅取消簽證。",
            feedbackEn: "⚠️ You were intimidated — exactly the mental state scammers want. Remember: Immigration never requests ID numbers by phone, never threatens to cancel visas.",
            feedbackZh: "⚠️ 你被威胁吓倒了——这正是骗子想要的心理状态。记住：入境处绝不会电话索取身份证号码，更不会威胁取消签证。",
            feedbackType: "bad"
          },
          {
            id: "l1_s2_refuse",
            text: "拒絕提供，掛斷並查證",
            textEn: "Refuse, hang up and verify",
            textZh: "拒绝提供，挂断并查证",
            effects: { alertness: 20, information: 15, xp: 25, score: 50, riskScore: -10 },
            nextSceneId: "l1_s_mixed",
            feedback: "✅ 正確！任何政府部門都不會電話索取身份證、銀行帳戶。你拒絕並查證的直覺是對的。",
            feedbackEn: "✅ Correct! No government department requests ID or bank accounts by phone. Your instinct to refuse and verify is right.",
            feedbackZh: "✅ 正确！任何政府部门都不会电话索取身份证、银行账户。你拒绝并查证的直觉是对的。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 3（選錯分支）：轉接「內地公安」+ 假通緝令 ──
      {
        id: "l1_s3_transfer_police",
        type: "choice",
        speaker: "scammer",
        pressure: true,
        text: "對方語氣一變：「你嘅案件已經涉及刑事，我哋幫你轉接內地公安。」轉接後，一名自稱「李警官」嘅人發來一張「通緝令」PDF，上面有你嘅照片、身份證號碼、一個案件編號。\n\n「李警官」話：「而家你必須配合調查，否則會派人上門逮捕。唔可以告訴任何人，否則罪加一等。」",
        textEn: "Voice changes: 'Your case is now criminal. Transferring you to Mainland Public Security.' A 'Officer Li' sends a 'wanted notice' PDF with your photo, ID, case number. 'You must cooperate, or we'll arrest you. Don't tell anyone, or it's an extra offense.'",
        textZh: "对方语气一变：「你的案件已经涉及刑事，我们帮你转接内地公安。」转接后，一名自称「李警官」的人发来一张「通缉令」PDF，上面有你的照片、身份证号码、一个案件编号。\n\n「李警官」说：「现在你必须配合调查，否则会派人上门逮捕。不可以告诉任何人，否则罪加一等。」",
        visual: {
          type: "phishing_card",
          url: "arrest-warrant-pdf",
          realUrl: "偽造通緝令 PDF",
          pageTitle: "【公安部通緝令】案件編號 GD-2024-0815",
          pageIcon: "🚨",
          redFlags: [
            { icon: "📸", text: "盜用你社交媒體照片" },
            { icon: "📋", text: "案件編號格式不符真實公文規範" },
            { icon: "🤐", text: "要求保密——真警察不會這樣做" }
          ]
        },
        choices: [
          {
            id: "l1_s3_comply",
            text: "驚慌下同意配合調查",
            textEn: "Panicked, agree to cooperate",
            textZh: "惊慌下同意配合调查",
            effects: { alertness: -20, calmness: -25, riskScore: 35, information: -15 },
            nextSceneId: "l1_deep_1",
            feedback: "⚠️ 你已經踏入深度詐騙陷阱。真警察不會電話辦案、不會要求保密、不會發「通緝令」PDF。接下來你會看到真實案例中被騙的全過程……",
            feedbackEn: "⚠️ You've entered deep scam territory. Real police don't enforce by phone, don't demand secrecy, don't send 'wanted' PDFs. Next you'll see the full process victims experience...",
            feedbackZh: "⚠️ 你已经踏入深度诈骗陷阱。真警察不会电话办案、不会要求保密、不会发「通缉令」PDF。接下来你会看到真实案例中被骗的全过程……",
            feedbackType: "bad"
          },
          {
            id: "l1_s3_doubt",
            text: "開始懷疑，掛斷查證",
            textEn: "Start doubting, hang up and verify",
            textZh: "开始怀疑，挂断查证",
            effects: { alertness: 15, information: 10, xp: 20, score: 40 },
            nextSceneId: "l1_s_mixed",
            feedback: "✅ 你終於醒悟！正確做法：立刻掛斷 → 致電 18222 → 求證真假。通緝令是偽造的，要求保密是詐騙標誌。",
            feedbackEn: "✅ You finally woke up! Correct: hang up → call 18222 → verify. The warrant is fake; demanding secrecy is a scam signature.",
            feedbackZh: "✅ 你终于醒悟！正确做法：立刻挂断 → 致电 18222 → 求证真假。通缉令是伪造的，要求保密是诈骗标志。",
            feedbackType: "good"
          }
        ]
      },
      // ── 深度被騙後續 1：配合調查，斷絕外界聯繫 ──
      {
        id: "l1_deep_1",
        type: "deep_narrative",
        speaker: "scammer",
        narrative: [
          {
            text: "「李警官」要求你配合調查，不能告訴任何人——包括室友、家人、學校老師。理由係「案件涉密，洩露會加重刑責」。你開始隔絕身邊所有人。",
            textEn: "'Officer Li' demands you cooperate, telling no one — not roommates, family, teachers. Reason: 'case is classified, leaking adds to your sentence.' You start cutting off everyone.",
            textZh: "「李警官」要求你配合调查，不能告诉任何人——包括室友、家人、学校老师。理由是「案件涉密，泄露会加重刑责」。你开始隔绝身边所有人。",
            image: "🤐",
            caption: "保密要求 = 詐騙紅旗"
          },
          {
            text: "對方要求你搬到一間偏僻酒店，理由係「方便 24 小時監控配合調查」。你照做，每日只同「李警官」視像匯報。你已經斷絕曬所有外界聯繫。",
            textEn: "They ask you to move to a remote hotel 'for 24/7 monitoring during investigation'. You comply, video-reporting to 'Officer Li' daily. You've cut off all outside contact.",
            textZh: "对方要求你搬到一间偏僻酒店，理由是「方便 24 小时监控配合调查」。你照做，每日只同「李警官」视频汇报。你已经断绝晒所有外界联系。",
            image: "🏨",
            caption: "隔離受害者 = 經典操控手法"
          },
          {
            text: "「李警官」開始問你銀行存款有幾多、有幾多個帳戶、有冇投資。佢話：「呢啲都要登記，調查完會還返畀你。」你開始覺得有啲唔對路……",
            textEn: "'Officer Li' asks how much you have in banks, how many accounts, any investments. 'All must be registered, returned after investigation.' Something feels wrong...",
            textZh: "「李警官」开始问你银行存款有多少、有多少个账户、有没有投资。他说：「这些都要登记，调查完会还返给你。」你开始觉得有些不对路……",
            image: "💸",
            caption: "查問資產 = 即將要求轉帳"
          }
        ],
        choices: [
          {
            id: "l1_deep_1_comply",
            text: "繼續配合",
            textEn: "Continue to comply",
            textZh: "继续配合",
            effects: { alertness: -10, calmness: -15, riskScore: 30 },
            nextSceneId: "l1_deep_2",
            feedback: "你選擇繼續配合——但記住：真警察絕不會問你銀行存款，更不會要求你搬到酒店隔離。",
            feedbackEn: "You continue to comply — but remember: real police never ask about bank savings, never ask you to isolate in a hotel.",
            feedbackZh: "你选择继续配合——但记住：真警察绝不会问你银行存款，更不会要求你搬到酒店隔离。",
            feedbackType: "bad"
          },
          {
            id: "l1_deep_1_doubt",
            text: "開始懷疑",
            textEn: "Start to doubt",
            textZh: "开始怀疑",
            effects: { alertness: 20, information: 15, xp: 30, score: 60 },
            nextSceneId: "l1_deep_awakened",
            feedback: "✅ 你終於醒悟！正確做法：立刻離開酒店 → 致電 18222 或 999 → 聯繫家人朋友。你已避免重大損失。",
            feedbackEn: "✅ You finally woke up! Correct: leave the hotel immediately → call 18222 or 999 → contact family/friends. You've avoided major loss.",
            feedbackZh: "✅ 你终于醒悟！正确做法：立刻离开酒店 → 致电 18222 或 999 → 联系家人朋友。你已避免重大损失。",
            feedbackType: "good"
          }
        ]
      },
      // ── 深度被騙後續 2：要求轉帳到「安全帳戶」 ──
      {
        id: "l1_deep_2",
        type: "deep_narrative",
        speaker: "scammer",
        narrative: [
          {
            text: "「李警官」終於提出最終要求：「你所有存款都要轉到公安部『安全帳戶』凍結調查，否則會立刻派人逮捕你。呢個帳戶係受害人共同監管，調查完原數返還。」",
            textEn: "'Officer Li' makes the final demand: 'All your savings must be transferred to a Ministry of Public Security safe account for frozen investigation, or we arrest you immediately. The account is co-managed by victims, fully returned after.'",
            textZh: "「李警官」终于提出最终要求：「你所有存款都要转到公安部『安全账户』冻结调查，否则会立刻派人逮捕你。这个账户是受害人共同监管，调查完原数返还。」",
            image: "🏦",
            caption: "「安全帳戶」係世紀大謊言"
          },
          {
            text: "你打開銀行 App，準備轉帳。螢幕上係你幾年嚟儲落嘅學費、生活費、家人匯來嘅錢——總共 HK$85,000。對方仲喺電話催促：「快啲，否則就會逮捕你！」",
            textEn: "You open your banking app, ready to transfer. The screen shows years of savings — tuition, living expenses, family remittances — totaling HK$85,000. The caller urges: 'Hurry, or we'll arrest you!'",
            textZh: "你打开银行 App，准备转账。屏幕上是你几年来储下的学费、生活费、家人汇来的钱——总共 HK$85,000。对方还在电话催促：「快点，否则就会逮捕你！」",
            image: "📱",
            caption: "真警察絕不催促轉帳"
          }
        ],
        choices: [
          {
            id: "l1_deep_2_comply",
            text: "繼續配合，轉帳全部積蓄",
            textEn: "Continue, transfer all savings",
            textZh: "继续配合，转账全部积蓄",
            effects: { alertness: -30, calmness: -40, riskScore: 80, money: -85, score: -200 },
            nextSceneId: "l1_deep_total_loss",
            feedback: "⚠️ 你已被騙走全部積蓄。真實案例中，內地來港學生因此被騙 HK$50 萬至 HK$200 萬不等。記住：「安全帳戶」從來不存在。",
            feedbackEn: "⚠️ You've been scammed out of all savings. Real cases: Mainland students in HK lost HK$500K to HK$2M each. Remember: 'safe accounts' don't exist.",
            feedbackZh: "⚠️ 你已被骗走全部积蓄。真实案例中，内地来港学生因此被骗 HK$50 万至 HK$200 万不等。记住：「安全账户」从来不存在。",
            feedbackType: "bad"
          },
          {
            id: "l1_deep_2_doubt",
            text: "終於醒悟，停止轉帳",
            textEn: "Finally wake up, stop transfer",
            textZh: "终于醒悟，停止转账",
            effects: { alertness: 25, information: 20, xp: 40, score: 80 },
            nextSceneId: "l1_deep_awakened",
            feedback: "✅ 你險險避過大損失！正確做法：立刻掛起電話 → 致電 18222 報案 → 聯繫家人朋友。任何要求「轉帳到安全帳戶」都係詐騙。",
            feedbackEn: "✅ You narrowly avoided major loss! Correct: hang up immediately → call 18222 → contact family/friends. Any 'transfer to safe account' demand is a scam.",
            feedbackZh: "✅ 你险险避过大损失！正确做法：立刻挂起电话 → 致电 18222 报案 → 联系家人朋友。任何要求「转账到安全账户」都是诈骗。",
            feedbackType: "good"
          }
        ]
      },
      // ── 完全被騙結局 ──
      {
        id: "l1_deep_total_loss",
        type: "result",
        speaker: "system",
        text: "你按下了「確認轉帳」……HK$85,000 轉咗出去。\n\n對方收到錢後立刻拉黑你，電話打唔通，「李警官」從此人間蒸發。\n\n你先發現：「通緝令」係假的、「入境處來電」係改號嘅、「李警官」係騙徒。你被騙走全部積蓄。",
        textEn: "You press 'confirm transfer'... HK$85,000 is gone.\n\nThe scammer blocks you. The number is dead. 'Officer Li' vanishes.\n\nYou realize: the 'warrant' was fake, the 'Immigration call' was spoofed, 'Officer Li' was a scammer. All your savings are gone.",
        textZh: "你按下了「确认转账」……HK$85,000 转了出去。\n\n对方收到钱后立刻拉黑你，电话打不通，「李警官」从此人间蒸发。\n\n你才发现：「通缉令」是假的、「入境处来电」是改号的、「李警官」是骗徒。你被骗走全部积蓄。",
        visual: {
          type: "warning_page",
          content: "⚠️ 真實案例數據\n\n2023-2024 香港警方數據：\n假冒內地公檢法詐騙：1,200+ 宗\n單一受害人最高損失：HK$1,800 萬\n內地來港學生係高危群體\n\n💡 識別關鍵：\n• 「安全帳戶」不存在\n• 真警察不會電話辦案\n• 要求保密 = 詐騙"
        },
        choices: [
          {
            id: "l1_deep_loss_continue",
            text: "繼續學習防騙知識",
            textEn: "Continue learning anti-scam",
            textZh: "继续学习防骗知识",
            effects: { information: 20 },
            nextSceneId: "__next_level__",
            feedbackType: "mid"
          }
        ]
      },
      // ── 醒悟結局 ──
      {
        id: "l1_deep_awakened",
        type: "result",
        speaker: "official",
        text: "你終於醒悟，立刻掛起電話。你撥打防騙易 18222，警員確認：呢個係經典嘅「假冒公檢法」詐騙。警方記錄你嘅資料並跟進。\n\n你冇被騙走一分錢。你打畀屋企人，喊咗出嚟——但安全了。",
        textEn: "You finally wake up and hang up. You call Anti-Scam 18222; the officer confirms: classic 'fake police/prosecutor' scam. They log your report.\n\nYou didn't lose a cent. You call your family, crying — but safe.",
        textZh: "你终于醒悟，立刻挂起电话。你拨打防骗易 18222，警员确认：这个是经典的「假冒公检法」诈骗。警方记录你的资料并跟进。\n\n你没有被骗走一分钱。你打给家人，哭了出来——但安全了。",
        visual: {
          type: "safe_result",
          content: "✅ 醒悟及時\n\n防騙易 18222 確認：假冒公檢法詐騙\n你無任何金錢損失\n\n💡 記住三件事：\n1. 政府部門唔會電話執法\n2. 「安全帳戶」從來唔存在\n3. 要求保密 = 詐騙紅旗"
        },
        choices: [
          {
            id: "l1_deep_awake_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      // ── 正確路徑結局：一早識破 ──
      // ── 修復4：第一關最後一題（混合輸入：3選項 + 其他自由輸入）──
      {
        id: "l1_s_mixed",
        type: "mixed_input",
        speaker: "system",
        text: "掛斷電話之後，你冷靜諗：下一步應該點做？可以選擇下面一個建議，或者打開「其他」輸入自己嘅做法。",
        textEn: "After hanging up, you calmly think: what should you do next? Pick one suggestion below, or open 'Other' to type your own approach.",
        textZh: "挂断电话之后，你冷静想：下一步应该怎么做？可以选择下面一个建议，或者打开「其他」输入自己的做法。",
        countdown: 25,
        mixedConfig: {
          choices: [
            {
              id: "l1_mix_a",
              text: "打 18222 防騙易熱線查詢",
              textEn: "Call Anti-Scam hotline 18222",
              textZh: "拨打 18222 防骗易热线查询",
              effects: { alertness: 15, information: 15, xp: 25, score: 45 },
              nextSceneId: "l1_s_safe",
              feedback: "✅ 正確！18222 係香港警方專設嘅防騙易熱線，24 小時有人接聽，所有來電、訊息、連結都可以求證。",
              feedbackEn: "✅ Correct! 18222 is the dedicated 24/7 HK Police anti-scam hotline — any call, message or link can be verified there.",
              feedbackZh: "✅ 正确！18222 是香港警方专设的防骗易热线，24 小时有人接听，所有来电、信息、链接都可以求证。",
              feedbackType: "good"
            },
            {
              id: "l1_mix_b",
              text: "轉返個來電俾入境處 2824 6111 問",
              textEn: "Call Immigration 2824 6111 to ask",
              textZh: "回拨入境处 2824 6111 询问",
              effects: { alertness: 10, information: 10, xp: 20, score: 35 },
              nextSceneId: "l1_s_safe",
              feedback: "✅ 正確！官方號碼（入境處 2824 6111）先查證，係最穩妥嘅做法。記住：唔好回彈陌生來電嘅「未接來電」。",
              feedbackEn: "✅ Correct! Verify via the official number (Immigration 2824 6111) is the safest approach. Don't call back 'missed calls' from strangers.",
              feedbackZh: "✅ 正确！官方号码（入境处 2824 6111）先查证，是最稳妥的做法。记住：不要回拨陌生来电的「未接来电」。",
              feedbackType: "good"
            },
            {
              id: "l1_mix_c",
              text: "同朋友分享，一齊評估係咪詐騙",
              textEn: "Share with friends to assess together",
              textZh: "与朋友分享，一起评估是不是诈骗",
              effects: { alertness: 5, information: 5, xp: 15, score: 20 },
              nextSceneId: "l1_s_safe",
              feedback: "✨ 可以嘅！分享俾朋友、同學、老師一齊評估，係防騙嘅重要手段。不過最終一定要求證官方熱線 18222。",
              feedbackEn: "✨ Good move! Sharing with friends/classmates/teachers to evaluate together is an important anti-scam step. Always also verify with 18222.",
              feedbackZh: "✨ 可以的！分享给朋友、同学、老师一起评估，是防骗的重要手段。不过最终一定要求证官方热线 18222。",
              feedbackType: "mid"
            }
          ],
          inputConfig: {
            placeholder: "寫下你嘅做法，例如：先查證再決定…",
            placeholderEn: "Type your plan, e.g. verify first then decide…",
            placeholderZh: "写下你的做法，例如：先查证再决定…",
            // 修復4：自由輸入關鍵字對應跳轉
            goodNextSceneId: "l1_s_safe",
            neutralNextSceneId: "l1_s_safe",
            badNextSceneId: "l1_deep_1",
            goodFeedback: "✅ 你講得好啱！「先查證」永遠係防騙第一步，做得好！",
            goodFeedbackZh: "✅ 你说得太对了！「先查证」永远是防骗的第一步，做得好！",
            goodFeedbackEn: "✅ Exactly! 'Verify first' is always step #1 against scams — great job!",
            neutralFeedback: "你嘅想法好有意思，但記住：唔確定嘅時候，先查證！",
            neutralFeedbackZh: "你的想法很有意思，但记住：不确定时，先查证！",
            neutralFeedbackEn: "Interesting thought, but remember: when in doubt, verify first!",
            badFeedback: "⚠️ 呢個做法有風險！任何要求「轉帳 / 俾密碼 / 俾驗證碼」嘅做法都唔好做，立刻掛斷，致電 18222 查證。",
            badFeedbackZh: "⚠️ 这个做法有风险！任何要求「转账 / 给密码 / 给验证码」的做法都不要做，立刻挂断，致电 18222 查证。",
            badFeedbackEn: "⚠️ Risky approach! Never respond to requests for 'transfer / password / verification code'. Hang up and call 18222 immediately."
          }
        }
      },
      {
        id: "l1_s_safe",
        type: "result",
        speaker: "official",
        text: "你掛斷電話，自行致電入境處 2824 6111。入境處職員確認：「我哋從來唔會主動致電要求提供身份證號碼、銀行帳戶，更加唔會轉接『內地公安』。」\n\n你已識破呢個假冒政府詐騙。",
        textEn: "You hang up and call Immigration 2824 6111 yourself. The officer confirms: 'We never proactively call asking for ID or bank accounts, and never transfer to Mainland Public Security.'\n\nYou've spotted this government impersonation scam.",
        textZh: "你挂断电话，自行致电入境处 2824 6111。入境处职员确认：「我们从来不会主动致电要求提供身份证号码、银行账户，更加不会转接『内地公安』。」\n\n你已识破这个假冒政府诈骗。",
        visual: {
          type: "safe_result",
          content: "✅ 防騙視伏器查核\n\n來電 +852 2824 6111\n狀態：被偽造（來電顯示不可信）\n\n💡 識別要點：\n• 入境處唔會主動來電索取資料\n• 真警察唔會電話辦案\n• 「安全帳戶」從來唔存在"
        },
        choices: [
          {
            id: "l1_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 第 2 關：釣魚簡訊
  // ─────────────────────────────────────────────────────────────
  {
    id: "l2_phishing_sms",
    index: 2,
    title: "釣魚簡訊騙局",
    titleEn: "Phishing SMS Scam",
    titleZh: "钓鱼短信骗局",
    type: "sms",
    channel: "sms",
    icon: "📩",
    scamType: "釣魚簡訊 + 假網站",
    redFlags: [
      "簡訊自稱「香港郵政」但網址係 hk-post-track.com（真域名：hongkongpost.hk）",
      "要求 24 小時內點擊連結補付手續費",
      "連結進入後要求輸入信用卡資料",
      "利用「包裹退回」 urgency 製造恐慌"
    ],
    officialChannels: [
      "香港郵政官方域名：hongkongpost.hk",
      "致電香港郵政 2921 2222 查詢",
      "用防騙視伏器掃描連結",
      "任何要求輸入卡片資料的「包裹領取」都係詐騙"
    ],
    scenes: [
      {
        id: "l2_s1_sms",
        type: "choice",
        speaker: "scammer",
        text: "你下課返到宿舍，手機放喺桌上充電。螢幕突然亮起——一條來自「香港郵政」嘅簡訊：「【香港郵政】您有一個包裹待領取，請於 24 小時內確認領取資訊並補付 $32 手續費，否則包裹將被退回：https://hk-post-track.com/claim?id=HKP8234」",
        textEn: "Back at the dorm, your phone lights up — an SMS from 'HK Post': '[HK Post] You have a parcel pending. Confirm pickup and pay $32 fee within 24 hours, or it will be returned: https://hk-post-track.com/claim?id=HKP8234'",
        textZh: "你下课回到宿舍，手机放在桌上充电。屏幕突然亮起——一条来自「香港邮政」的短信：「【香港邮政】您有一个包裹待领取，请于 24 小时内确认领取信息并补付 $32 手续费，否则包裹将被退回：https://hk-post-track.com/claim?id=HKP8234」",
        visual: {
          type: "sms_lockscreen",
          time: "14:32",
          signal: 4,
          battery: 75,
          sender: "香港郵政",
          senderEn: "HK Post",
          senderZh: "香港邮政",
          message: "【香港郵政】您有一個包裹待領取，請於 24 小時內確認領取資訊並補付 $32 手續費，否則包裹將被退回：",
          messageEn: "[HK Post] You have a parcel pending. Confirm pickup info and pay $32 fee within 24 hours, or the parcel will be returned:",
          messageZh: "【香港邮政】您有一个包裹待领取，请于 24 小时内确认领取信息并补付 $32 手续费，否则包裹将被退回：",
          link: "https://hk-post-track.com/claim?id=HKP8234",
          linkText: "https://hk-post-track.com/claim?id=HKP8234",
          // 虛擬手機互動導航：所有交互喺手機上完成，下方不再顯示選項
          goodNextSceneId: "l2_s_safe",
          badNextSceneId: "l2_s2_phishing_site",
          goodFeedback: "✅ 正確！香港郵政官方域名係 hongkongpost.hk。任何要求輸入卡片資料嘅「包裹領取」網站都係詐騙。",
          goodFeedbackEn: "✅ Correct! HK Post's official domain is hongkongpost.hk. Any 'parcel claim' site asking for card details is a scam.",
          goodFeedbackZh: "✅ 正确！香港邮政官方域名是 hongkongpost.hk。任何要求输入卡片资料的「包裹领取」网站都是诈骗。",
          badFeedback: "⚠️ 你點擊咗可疑連結——呢個域名 hk-post-track.com 並非香港郵政官方（真係 hongkongpost.hk）。你已進入釣魚網站。",
          badFeedbackEn: "⚠️ You clicked a suspicious link — hk-post-track.com is NOT HK Post's official domain (real: hongkongpost.hk). You've entered a phishing site.",
          badFeedbackZh: "⚠️ 你点击了可疑链接——这个域名 hk-post-track.com 并非香港邮政官方（真是 hongkongpost.hk）。你已进入钓鱼网站。"
        }
      },
      {
        id: "l2_s2_phishing_site",
        type: "result",
        speaker: "scammer",
        text: "連結打開後，一個看似官方嘅網頁彈出，要求你輸入信用卡號碼、CVV、有效期、身份證號碼「領取包裹」。你照填咗……\n\n3 秒後，你銀行 App 彈出通知：「你的信用卡被嘗試扣款 HK$8,500，地點：海外。」",
        textEn: "The link opens an official-looking page asking for credit card number, CVV, expiry, ID number to 'claim the parcel'. You fill it in...\n\n3 seconds later, your bank app alerts: 'Card attempted charge HK$8,500, location: overseas.'",
        textZh: "链接打开后，一个看似官方的网页弹出，要求你输入信用卡号码、CVV、有效期、身份证号码「领取包裹」。你照填了……\n\n3 秒后，你银行 App 弹出通知：「你的信用卡被尝试扣款 HK$8,500，地点：海外。」",
        visual: {
          type: "warning_page",
          content: "⚠️ 信息已被盜取\n\n信用卡號 ✗ 已洩露\nCVV ✗ 已洩露\n身份證號 ✗ 已洩露\n\n被盜用：HK$8,500\n\n💡 釣魚網站識別：\n• 域名唔對（hk-post-track.com）\n• 要求輸入完整卡片資料\n• 製造 24 小時 urgency"
        },
        choices: [
          {
            id: "l2_s2_loss_continue",
            text: "立刻致電銀行止付 + 18222 報案",
            textEn: "Call bank to stop payment + 18222 report",
            textZh: "立刻致电银行止付 + 18222 报案",
            effects: { alertness: 10, information: 15, money: -85, riskScore: 45 },
            nextSceneId: "__next_level__",
            feedback: "⚠️ 你已被盜取信息，但及時止付減少損失。記住：任何要求完整卡片資料（連 CVV）嘅網站都要警惕。香港郵政、銀行唔會咁做。",
            feedbackEn: "⚠️ Your info was stolen, but timely stop-payment reduced loss. Remember: any site asking for full card details (incl. CVV) is suspicious. HK Post, banks never do this.",
            feedbackZh: "⚠️ 你已被盗取信息，但及时止付减少损失。记住：任何要求完整卡片资料（连 CVV）的网站都要警惕。香港邮政、银行不会这么做。",
            feedbackType: "bad"
          }
        ]
      },
      {
        id: "l2_s_safe",
        type: "result",
        speaker: "official",
        text: "你冇點擊連結，直接致電香港郵政 2921 2222。職員確認：「我哋冇寄過任何包裹通知畀你，更唔會用短網址要求付款。呢個係釣魚簡訊。」",
        textEn: "You don't click the link, calling HK Post 2921 2222 directly. The agent confirms: 'We never sent you any parcel notification, and never use short URLs for payments. This is a phishing SMS.'",
        textZh: "你没有点击链接，直接致电香港邮政 2921 2222。职员确认：「我们没有寄过任何包裹通知给你，更不会用短网址要求付款。这个是钓鱼短信。」",
        visual: {
          type: "safe_result",
          content: "✅ 防騙視伏器查核\n\n連結 hk-post-track.com\n狀態：🔴 高危釣魚網站\n\n💡 真域名對照：\n• 香港郵政：hongkongpost.hk\n• HSBC：hsbc.com.hk\n• 中銀：bochk.com\n• 任何變體域名都係假"
        },
        choices: [
          {
            id: "l2_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 第 3 關：冒充熟人（社交媒體盜用）
  // ─────────────────────────────────────────────────────────────
  {
    id: "l3_impersonation",
    index: 3,
    title: "冒充熟人借錢",
    titleEn: "Impersonating Acquaintance",
    titleZh: "冒充熟人借钱",
    type: "whatsapp",
    channel: "whatsapp",
    icon: "💬",
    scamType: "社交帳號盜用 + 借錢詐騙",
    redFlags: [
      "WhatsApp 收到「張老師」訊息，但號碼陌生",
      "聲稱「手機壞了，暫用朋友號碼」",
      "急催轉帳，理由係「急用錢」",
      "拒絕視像通話核實身份",
      "後續會嵌入 Deepfake 視像（留接口）"
    ],
    officialChannels: [
      "用通訊錄原有號碼回撥核實",
      "要求視像通話並做指定動作測試",
      "向共同朋友查證",
      "任何借錢請求都要獨立核實"
    ],
    scenes: [
      {
        id: "l3_s1_msg",
        type: "choice",
        speaker: "scammer",
        text: "你 WhatsApp 收到陌生號碼訊息：「你好，我係張老師，我手機壞咗，暫時用呢個號碼。我而家有急事需要你幫手轉 $5,000，聽日還返畀你。我 FB/IG 都俾人 hack 咗，暫時聯絡唔到其他人。」",
        textEn: "A stranger WhatsApps you: 'Hi, this is Mr. Cheung. My phone broke, using this number temporarily. I have an emergency, please transfer $5,000, I'll return tomorrow. My FB/IG got hacked, can't reach others.'",
        textZh: "你 WhatsApp 收到陌生号码讯息：「你好，我是张老师，我手机坏了，暂时用这个号码。我现在有急事需要你帮忙转 $5,000，明天还返给你。我 FB/IG 都被人 hack 了，暂时联络不到其他人。」",
        visual: {
          type: "chat",
          app: "WhatsApp",
          appIcon: "💬",
          messages: [
            { type: "incoming", name: "+852 9xxx 1234", text: "你好，我係張老師，手機壞咗用呢個號" },
            { type: "incoming", name: "+852 9xxx 1234", text: "急事借 $5000，聽日還，求下你" }
          ]
        },
        choices: [
          {
            id: "l3_s1_transfer",
            text: "相信係張老師，立刻轉帳",
            textEn: "Believe it's Mr. Cheung, transfer immediately",
            textZh: "相信是张老师，立刻转账",
            effects: { alertness: -20, riskScore: 35, money: -50, score: -100 },
            nextSceneId: "l3_s_loss",
            feedback: "⚠️ 你被盜用帳號嘅騙徒呃咗。號碼陌生 + 急催 + 拒絕核實 = 詐騙紅旗。記住：任何借錢請求都必須獨立核實。",
            feedbackEn: "⚠️ You were scammed by an account thief. Unknown number + urgency + refusing verification = red flags. Always verify money requests independently.",
            feedbackZh: "⚠️ 你被盗用帐号的骗子骗了。号码陌生 + 急催 + 拒绝核实 = 诈骗红旗。记住：任何借钱请求都必须独立核实。",
            feedbackType: "bad"
          },
          {
            id: "l3_s1_verify",
            text: "用通訊錄原有號碼回撥核實",
            textEn: "Call back via original contact number",
            textZh: "用通讯录原有号码回拨核实",
            effects: { alertness: 20, information: 15, xp: 25, score: 50 },
            nextSceneId: "l3_s_safe",
            feedback: "✅ 正確！號碼陌生 + 自稱熟人 = 必須用原有渠道核實。任何借錢請求都唔可以因為「急」就跳過核實。",
            feedbackEn: "✅ Correct! Unknown number + claiming to be acquaintance = must verify via original channel. Never skip verification just because it's 'urgent'.",
            feedbackZh: "✅ 正确！号码陌生 + 自称熟人 = 必须用原有渠道核实。任何借钱请求都不可以因为「急」就跳过核实。",
            feedbackType: "good"
          },
          {
            id: "l3_s1_video",
            text: "要求視像通話核實身份（留 Deepfake 接口）",
            textEn: "Request video call to verify (Deepfake interface)",
            textZh: "要求视频通话核实身份（留 Deepfake 接口）",
            effects: { alertness: 10, information: 5 },
            nextSceneId: "l3_s_video_test",
            feedback: "你要求視像——這本身是好習慣，但 2024 年起 AI 換臉技術令視像都唔再絕對可靠，日後要額外留神。",
            feedbackEn: "You ask for video — a good habit, but since 2024 AI face-swap makes video no longer absolutely reliable. Stay vigilant in the future.",
            feedbackZh: "你要求视频——这本身是好习惯，但 2024 年起 AI 换脸技术令视频都不再绝对可靠，日后要额外留神。",
            feedbackType: "mid"
          }
        ]
      },
      {
        id: "l3_s_video_test",
        type: "result",
        speaker: "system",
        text: "你要求視像通話。對方答應咗——但畫面中嘅「張老師」樣貌雖然似，但說話口型同聲音有啲唔夾。你要求對方做「摸鼻」動作，畫面出現短暫扭曲。\n\n你懷疑這是 AI 換臉，立刻掛斷，用通訊錄原有號碼回撥——真嘅張老師話：「我從來冇 WhatsApp 過你。」",
        textEn: "You request video. The 'Mr. Cheung' looks similar but lip-sync is off. You ask him to touch his nose; the image briefly distorts.\n\nYou suspect AI face-swap, hang up, call the original number — the real Mr. Cheung says: 'I never WhatsApped you.'",
        textZh: "你要求视频通话。对方答应了——但画面中的「张老师」样貌虽然似，但说话口型同声音有些不夹。你要求对方做「摸鼻」动作，画面出现短暂扭曲。\n\n你怀疑这是 AI 换脸，立刻挂断，用通讯录原有号码回拨——真的张老师说：「我从来没有 WhatsApp 过你。」",
        visual: {
          type: "safe_result",
          content: "✅ 視像測試識破 AI 換臉\n\n測試 1：摸鼻 → 畫面扭曲\n測試 2：原有號碼回撥 → 真張老師\n\n💡 Deepfake 識別：\n• 要求做指定動作\n• 留意口型同聲音同步\n• 永遠用獨立渠道核實"
        },
        choices: [
          {
            id: "l3_video_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 15, information: 20, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l3_s_safe",
        type: "result",
        speaker: "official",
        text: "你用通訊錄裡原有嘅張老師號碼打過去。真嘅張老師話：「我從來冇 WhatsApp 你借錢，我 IG 俾人 hack 咗，多謝你提醒！」你及時識破呢個冒充熟人騙局。",
        textEn: "You call Mr. Cheung's original number. The real Mr. Cheung says: 'I never WhatsApped you for money. My IG got hacked, thanks for letting me know!' You've spotted the impersonation scam.",
        textZh: "你用通讯录里原有的张老师号码打过去。真的张老师说：「我从来没有 WhatsApp 你借钱，我 IG 给人 hack 了，多谢你提醒！」你及时识破这个冒充熟人骗局。",
        visual: {
          type: "safe_result",
          content: "✅ 帳號盜用識破\n\n原有號碼回撥 → 真張老師\nIG 帳號已被盜\n\n💡 識別要點：\n• 號碼陌生 + 自稱熟人 = 必查\n• 急催轉帳 = 詐騙紅旗\n• 用原有渠道核實"
        },
        choices: [
          {
            id: "l3_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l3_s_loss",
        type: "result",
        speaker: "system",
        text: "你轉咗 $5,000 之後，對方拉黑你。你打畀真嘅張老師，先發現佢 IG 俾人 hack 咗，騙徒盜用咗佢身份向所有學生發借錢訊息。",
        textEn: "After transferring $5,000, you're blocked. You call the real Mr. Cheung, learning his IG was hacked; the scammer targeted all his students.",
        textZh: "你转了 $5,000 之后，对方拉黑你。你打给真的张老师，才发现他 IG 给人 hack 了，骗徒盗用了他身份向所有学生发借钱讯息。",
        visual: {
          type: "warning_page",
          content: "⚠️ 損失 HK$5,000\n\n騙徒已拉黑你\n張老師 IG 被盜用\n\n💡 反思：\n• 號碼陌生 = 必須核實\n• 急催 = 詐騙紅旗\n• 轉帳前務必回撥原有號碼"
        },
        choices: [
          {
            id: "l3_loss_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { information: 10 },
            nextSceneId: "__next_level__",
            feedbackType: "bad"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 第 4 關：虛假租房
  // ─────────────────────────────────────────────────────────────
  {
    id: "l4_fake_rental",
    index: 4,
    title: "虛假租房騙局",
    titleEn: "Fake Rental Scam",
    titleZh: "虚假租房骗局",
    type: "rental",
    channel: "rental",
    icon: "🏠",
    scamType: "假租房 + FPS 押金詐騙",
    redFlags: [
      "租金明顯低於市價（旺角 $4,500 係同區 40% off）",
      "房東聲稱「人在外地」無法實地看房",
      "催促先付押金鎖定房源",
      "要求 FPS 轉帳，話「另有人要看」",
      "無法提供業主姓名、土地註冊處資料"
    ],
    officialChannels: [
      "土地註冊處查核業主身份（landreg.gov.hk）",
      "堅持實地看房、簽正式租約再付款",
      "致電 18222 查詢可疑房源",
      "用防騙視伏器搜尋房東電話/帳號"
    ],
    scenes: [
      {
        id: "l4_s1_post",
        type: "choice",
        speaker: "scammer",
        text: "開學前兩週，你喺 Facebook 群組睇到一則貼文——旺角亞皆老街單位，月租 $4,500，臨近 MTR，附傢俬。你私訊對方。「房東」好熱情但急促：「我喺深圳，今日轉 $3,000 押金就幫你鎖定，否則另有人要睇。」",
        textEn: "Two weeks before term, you see a Facebook post — Mong Kok flat on Argyle Street, $4,500/month, near MTR, furnished. The 'landlord' is warm but pushy: 'I'm in Shenzhen, $3,000 deposit via FPS today locks it in, others are viewing.'",
        textZh: "开学前两周，你在 Facebook 群组看到一则贴文——旺角亚皆老街单位，月租 $4,500，临近 MTR，附家私。你私信对方。「房东」很热情但急促：「我在深圳，今天转 $3,000 押金就帮你锁定，否则另有人要看。」",
        visual: {
          type: "phishing_card",
          url: "fb.com/groups/HKU-Rentals/posts/18823",
          realUrl: "Facebook 群組貼文",
          pageTitle: "【急租】旺角亞皆老街 $4500/月",
          pageIcon: "🏠",
          redFlags: [
            { icon: "💸", text: "租金低於市價約 40%" },
            { icon: "👤", text: "發帖人無仲介牌照" },
            { icon: "📍", text: "地址模糊，無完整門牌" }
          ]
        },
        choices: [
          {
            id: "l4_s1_pay",
            text: "怕失去房源，立刻 FPS 轉 $3,000",
            textEn: "Fear losing it, FPS $3,000 now",
            textZh: "怕失去房源，立刻 FPS 转 $3,000",
            effects: { alertness: -20, riskScore: 35, money: -30, score: -80 },
            nextSceneId: "l4_s_loss",
            feedback: "⚠️ 你轉咗押金——但未實地看房、未核實業主身份前，任何金錢操作都極度危險。",
            feedbackEn: "⚠️ You transferred deposit — any money move before viewing and verifying owner is extremely risky.",
            feedbackZh: "⚠️ 你转了押金——但未实地看房、未核实业主身份前，任何金钱操作都极度危险。",
            feedbackType: "bad"
          },
          {
            id: "l4_s1_verify",
            text: "要求實地看房 + 查土地註冊處",
            textEn: "Demand in-person viewing + Land Registry check",
            textZh: "要求实地看房 + 查土地注册处",
            effects: { alertness: 20, information: 15, xp: 25, score: 50 },
            nextSceneId: "l4_s_safe",
            feedback: "✅ 正確！真正業主唔怕你查。堅持實地看房、查土地註冊處業主名、簽正式租約先付款，是防範租房騙局嘅鐵律。",
            feedbackEn: "✅ Correct! Real landlords welcome checks. Always view in person, check Land Registry, sign formal tenancy before paying — iron rules against rental scams.",
            feedbackZh: "✅ 正确！真正业主不怕你查。坚持实地看房、查土地注册处业主名、签正式租约先付款，是防范租房骗局的铁律。",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l4_s_safe",
        type: "result",
        speaker: "official",
        text: "你要求實地看房，對方開始迴避：「我都喺深圳，唔方便。」你將對方電話輸入防騙視伏器——顯示「高危詐騙，23 人舉報」。你喺土地註冊處查唔到對方聲稱嘅業主名。",
        textEn: "You ask to view in person; the 'landlord' dodges: 'I'm in Shenzhen, not convenient.' You enter the number in Scameter — 'High-Risk Scam, 23 reports'. The claimed owner's name isn't in Land Registry.",
        textZh: "你要求实地看房，对方开始回避：「我都在深圳，不方便。」你将对方电话输入防骗视伏器——显示「高危诈骗，23 人举报」。你在土地注册处查不到对方声称的业主名。",
        visual: {
          type: "safe_result",
          content: "✅ 防騙視伏器查核\n\n電話 +852 5678 1234\n狀態：🔴 高危（23 舉報）\n土地註冊處：查無此業主\n\n💡 租房鐵律：\n• 實地看房\n• 查業主名\n• 簽約先付款"
        },
        choices: [
          {
            id: "l4_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l4_s_loss",
        type: "result",
        speaker: "system",
        text: "你 FPS 轉咗 $3,000 後，「房東」再要求 $5,000 保證金先寄鑰匙。你猶豫時再傳訊息——已被封鎖。打電話——空號。",
        textEn: "After FPS $3,000, the 'landlord' demands another $5,000 guarantee to send keys. You hesitate, message again — blocked. Call — dead number.",
        textZh: "你 FPS 转了 $3,000 后，「房东」再要求 $5,000 保证金先寄钥匙。你犹豫时再传讯息——已被拉黑。打电话——空号。",
        visual: {
          type: "warning_page",
          content: "⚠️ 損失 HK$3,000\n\n對方已封鎖\n電話成空號\n\n💡 反思：\n• 低於市價 = 詐騙\n• 催促付款 = 紅旗\n• 必須實地看房"
        },
        choices: [
          {
            id: "l4_loss_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { information: 10 },
            nextSceneId: "__next_level__",
            feedbackType: "bad"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 第 5 關：網上購物騙案
  // ─────────────────────────────────────────────────────────────
  {
    id: "l5_online_shopping",
    index: 5,
    title: "網上購物騙案",
    titleEn: "Online Shopping Scam",
    titleZh: "网上购物骗案",
    type: "shopping",
    channel: "shopping",
    icon: "🛒",
    scamType: "二手平台 + 直接轉帳騙局",
    redFlags: [
      "二手平台超低價 iPhone / 演唱會門票",
      "賣家催促「很多人要，先轉帳先留貨」",
      "只接受銀行轉帳，拒絕面交",
      "賣家帳號新註冊，無評價歷史",
      "要求先付定金，後續再付尾款"
    ],
    officialChannels: [
      "堅持面交 + 當面驗貨",
      "使用平台擔保交易（Carousell Protect、PayMe 商戶）",
      "查賣家評價歷史、註冊時間",
      "任何「先轉帳後交貨」都係高危"
    ],
    scenes: [
      {
        id: "l5_s1_listing",
        type: "choice",
        speaker: "scammer",
        text: "你喺 Carousell 睇到一個 iPhone 15 Pro Max 256GB，只賣 HK$4,500（市價 $9,000+）。賣家話：「急錢用，未拆封，多人問，今日轉帳就留貨，只接受銀行轉帳，唔面交。」",
        textEn: "On Carousell you find iPhone 15 Pro Max 256GB for HK$4,500 (market $9,000+). Seller: 'Need cash urgently, sealed, many inquiries, transfer today to reserve, bank transfer only, no meet-up.'",
        textZh: "你在 Carousell 看到一个 iPhone 15 Pro Max 256GB，只卖 HK$4,500（市价 $9,000+）。卖家说：「急钱用，未拆封，多人问，今天转账就留货，只接受银行转账，不面交。」",
        visual: {
          type: "phishing_card",
          url: "carousell.com/p/iphone15-promax-256gb",
          realUrl: "Carousell 賣家貼文",
          pageTitle: "iPhone 15 Pro Max 256GB 全新未拆 $4500",
          pageIcon: "📱",
          redFlags: [
            { icon: "💸", text: "價格低於市價 50%" },
            { icon: "🚫", text: "拒絕面交" },
            { icon: "👤", text: "帳號 3 日前先註冊" }
          ]
        },
        choices: [
          {
            id: "l5_s1_transfer",
            text: "怕被人搶走，立刻轉帳 $4,500",
            textEn: "Fear losing it, transfer $4,500 now",
            textZh: "怕被人抢走，立刻转账 $4,500",
            effects: { alertness: -20, riskScore: 40, money: -45, score: -120 },
            nextSceneId: "l5_s_loss",
            feedback: "⚠️ 你轉帳咗——低於市價 50% + 拒絕面交 + 新帳號 = 經典二手騙局三聯徵。",
            feedbackEn: "⚠️ You transferred — under 50% market + no meet-up + new account = classic secondhand scam triad.",
            feedbackZh: "⚠️ 你转账了——低于市价 50% + 拒绝面交 + 新账号 = 经典二手骗局三联征。",
            feedbackType: "bad"
          },
          {
            id: "l5_s1_meetup",
            text: "堅持面交 + 用平台擔保交易",
            textEn: "Insist on meet-up + platform escrow",
            textZh: "坚持面交 + 用平台担保交易",
            effects: { alertness: 20, information: 15, xp: 25, score: 50 },
            nextSceneId: "l5_s_safe",
            feedback: "✅ 正確！面交驗貨 + 平台擔保交易係二手買賣鐵律。賣家拒絕面交 = 大概率詐騙。",
            feedbackEn: "✅ Correct! Meet-up + platform escrow = iron rules of secondhand trade. Refusing meet-up = likely scam.",
            feedbackZh: "✅ 正确！面交验货 + 平台担保交易是二手买卖铁律。卖家拒绝面交 = 大概率诈骗。",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l5_s_safe",
        type: "result",
        speaker: "official",
        text: "你堅持面交，賣家立刻消失。你查佢帳號——3 日前先註冊，無任何評價。你將帳號舉報畀 Carousell，平台確認係詐騙帳號並封鎖。",
        textEn: "You insist on meet-up; the seller vanishes. Account check: registered 3 days ago, zero reviews. You report to Carousell; platform confirms scam and bans the account.",
        textZh: "你坚持面交，卖家立刻消失。你查他账号——3 天前先注册，无任何评价。你将账号举报给 Carousell，平台确认是诈骗账号并封锁。",
        visual: {
          type: "safe_result",
          content: "✅ 二手騙局識破\n\n賣家帳號：3 日前註冊\n評價：0\n拒絕面交 = 高危\n\n💡 二手買賣鐵律：\n• 面交驗貨\n• 平台擔保\n• 查評價歷史"
        },
        choices: [
          {
            id: "l5_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l5_s_loss",
        type: "result",
        speaker: "system",
        text: "你轉咗 $4,500 後，賣家話：「已經發貨，但物流要再付 $1,200 海關費。」你再付……再要求 $2,000 保險費。你最終意識到被騙，但已損失 HK$7,700。",
        textEn: "After $4,500, seller says: 'Shipped, but customs fee $1,200 needed.' You pay... then $2,000 insurance. You realize — total loss HK$7,700.",
        textZh: "你转了 $4,500 后，卖家说：「已经发货，但物流要再付 $1,200 海关费。」你再付……再要求 $2,000 保险费。你最终意识到被骗，但已损失 HK$7,700。",
        visual: {
          type: "warning_page",
          content: "⚠️ 損失 HK$7,700\n\n$4,500 商品費\n$1,200 海關費\n$2,000 保險費\n\n💡 反思：\n• 拒絕面交 = 詐騙\n• 不斷加價 = 必騙\n• 用平台擔保交易"
        },
        choices: [
          {
            id: "l5_loss_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { information: 10 },
            nextSceneId: "__next_level__",
            feedbackType: "bad"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 第 6 關：求職騙案
  // ─────────────────────────────────────────────────────────────
  {
    id: "l6_job_scam",
    index: 6,
    title: "求職刷單騙局",
    titleEn: "Job Brushing Scam",
    titleZh: "求职刷单骗局",
    type: "job",
    channel: "job",
    icon: "💼",
    scamType: "高薪兼職 + 刷單 + 培訓費",
    redFlags: [
      "WhatsApp 收到「高薪兼職，日結 $800，無需經驗」",
      "要求先付 $500 培訓費 / 押金",
      "要求下載指定 App 做「刷單」任務",
      "公司無法喺公司註冊處查到",
      "前期小額返利建立信任，後續大額捲款"
    ],
    officialChannels: [
      "查公司註冊：cr.gov.hk ICPRS 系統",
      "用防騙視伏器搜尋公司名 / App",
      "正規兼職唔會要求先付費",
      "任何「刷單」都違反平台規則，係詐騙"
    ],
    scenes: [
      {
        id: "l6_s1_recruit",
        type: "choice",
        speaker: "scammer",
        text: "你 WhatsApp 收到陌生訊息：「你好，我係 HR，見到你履歷，我哋公司招募線上兼職，日結 $800，無需經驗，時間自由。有興趣請回覆『YES』。」",
        textEn: "WhatsApp from a stranger: 'Hi, I'm HR, saw your CV. We recruit online part-time, $800/day, no experience needed, flexible hours. Reply YES if interested.'",
        textZh: "你 WhatsApp 收到陌生讯息：「你好，我是 HR，看到你履历，我们公司招募线上兼职，日结 $800，无需经验，时间自由。有兴趣请回复『YES』。」",
        visual: {
          type: "chat",
          app: "WhatsApp",
          appIcon: "💬",
          messages: [
            { type: "incoming", name: "+852 6xxx 8888", text: "高薪兼職，日結 $800，無需經驗" },
            { type: "incoming", name: "+852 6xxx 8888", text: "有興趣請回覆 YES" }
          ]
        },
        choices: [
          {
            id: "l6_s1_yes",
            text: "回覆 YES 試試看",
            textEn: "Reply YES to try",
            textZh: "回复 YES 试试看",
            effects: { alertness: -10, riskScore: 20 },
            nextSceneId: "l6_s2_training_fee",
            feedback: "⚠️ 陌生主動招募 + 高薪無經驗 = 求職詐騙紅旗。你應該先查公司，唔好輕易回覆。",
            feedbackEn: "⚠️ Unsolicited recruitment + high pay no experience = job scam red flag. Check the company first; don't reply casually.",
            feedbackZh: "⚠️ 陌生主动招募 + 高薪无经验 = 求职诈骗红旗。你应该先查公司，不要轻易回复。",
            feedbackType: "bad"
          },
          {
            id: "l6_s1_check",
            text: "先查公司註冊資料",
            textEn: "Check company registration first",
            textZh: "先查公司注册资料",
            effects: { alertness: 20, information: 15, xp: 25, score: 50 },
            nextSceneId: "l6_s_safe",
            feedback: "✅ 正確！正規公司可喺公司註冊處查到。陌生主動招募 + 高薪日結 = 必查公司。",
            feedbackEn: "✅ Correct! Legitimate companies can be checked in Companies Registry. Unsolicited + daily pay = must verify.",
            feedbackZh: "✅ 正确！正规公司可在公司注册处查到。陌生主动招募 + 高薪日结 = 必查公司。",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l6_s2_training_fee",
        type: "choice",
        speaker: "scammer",
        pressure: true,
        text: "對方發來一份「合約」，要求你先付 $500 培訓費，然後下載「QuickTask」App 做「刷單」任務——任務係喺淘寶幫商家刷好評，每單返 $20。前 3 單即時返利到 PayMe。",
        textEn: "They send a 'contract' requiring $500 training fee, then download 'QuickTask' App for 'brushing' tasks — fake reviews on Taobao, $20 per task. First 3 tasks pay instantly to PayMe.",
        textZh: "对方发来一份「合约」，要求你先付 $500 培训费，然后下载「QuickTask」App 做「刷单」任务——任务是在淘宝帮商家刷好评，每单返 $20。前 3 单即时返利到 PayMe。",
        visual: {
          type: "phishing_card",
          url: "quicktask-app-download",
          realUrl: "可疑 App 下載頁面",
          pageTitle: "QuickTask 兼職任務平台",
          pageIcon: "📲",
          redFlags: [
            { icon: "💰", text: "要求先付 $500 培訓費" },
            { icon: "📲", text: "要下載非官方 App" },
            { icon: "⚠️", text: "「刷單」違反平台規則" }
          ]
        },
        choices: [
          {
            id: "l6_s2_pay",
            text: "付 $500 培訓費，開始刷單",
            textEn: "Pay $500, start brushing",
            textZh: "付 $500 培训费，开始刷单",
            effects: { alertness: -25, riskScore: 50, money: -5, score: -150 },
            nextSceneId: "l6_s_loss",
            feedback: "⚠️ 你踏入刷單騙局——前期小額返利建立信任，後續會要求大額「升級任務」最終捲款。$500 培訓費已損失。",
            feedbackEn: "⚠️ You've entered a brushing scam — small early returns build trust, then large 'upgrade tasks' drain everything. $500 already lost.",
            feedbackZh: "⚠️ 你踏入刷单骗局——前期小额返利建立信任，后续会要求大额「升级任务」最终卷款。$500 培训费已损失。",
            feedbackType: "bad"
          },
          {
            id: "l6_s2_refuse",
            text: "拒絕付費，刪除對方",
            textEn: "Refuse to pay, delete contact",
            textZh: "拒绝付费，删除对方",
            effects: { alertness: 20, information: 15, xp: 25, score: 50 },
            nextSceneId: "l6_s_safe",
            feedback: "✅ 正確！正規公司唔會要求求職者先付費。「刷單」本身就違反平台規則，係詐騙。",
            feedbackEn: "✅ Correct! Legitimate companies never ask job seekers to pay. 'Brushing' violates platform rules — it's a scam.",
            feedbackZh: "✅ 正确！正规公司不会要求求职者先付费。「刷单」本身就违反平台规则，是诈骗。",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l6_s_safe",
        type: "result",
        speaker: "official",
        text: "你喺公司註冊處查唔到對方聲稱嘅「QuickTask Ltd」。你將公司名輸入防騙視伏器——顯示「高危刷單詐騙，47 人舉報」。你封鎖對方並舉報。",
        textEn: "Companies Registry has no 'QuickTask Ltd'. Scameter shows 'High-Risk Brushing Scam, 47 reports'. You block and report.",
        textZh: "你在公司注册处查不到对方声称的「QuickTask Ltd」。你将公司名输入防骗视伏器——显示「高危刷单诈骗，47 人举报」。你封锁对方并举报。",
        visual: {
          type: "safe_result",
          content: "✅ 求職騙局識破\n\n公司註冊處：查無此公司\n防騙視伏器：🔴 高危（47 舉報）\n\n💡 求職鐵律：\n• 查公司註冊\n• 拒絕先付費\n• 「刷單」必係騙"
        },
        choices: [
          {
            id: "l6_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 10, xp: 30 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l6_s_loss",
        type: "result",
        speaker: "system",
        text: "你付 $500 培訓費後，前 3 單每單返 $20，你放下戒心。第 4 單要求「升級任務」：先轉 $3,000 才能解鎖高額任務。你轉咗……第 5 單要 $8,000……你拒絕時已被拉黑。總損失：HK$3,500。",
        textEn: "After $500, 3 tasks return $20 each, lowering your guard. Task 4 requires 'upgrade': transfer $3,000 to unlock high-value tasks. You pay... Task 5 wants $8,000... You refuse, get blocked. Total loss: HK$3,500.",
        textZh: "你付 $500 培训费后，前 3 单每单返 $20，你放下戒心。第 4 单要求「升级任务」：先转 $3,000 才能解锁高额任务。你转了……第 5 单要 $8,000……你拒绝时已被拉黑。总损失：HK$3,500。",
        visual: {
          type: "warning_page",
          content: "⚠️ 損失 HK$3,500\n\n$500 培訓費\n$3,000 升級任務\n前 3 單返利 $60（誘餌）\n\n💡 反思：\n• 求職唔使先付費\n• 刷單 = 詐騙\n• 逐漸加碼 = 必騙"
        },
        choices: [
          {
            id: "l6_loss_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { information: 10 },
            nextSceneId: "__next_level__",
            feedbackType: "bad"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 第 7 關：AI 換臉視像通話
  // ─────────────────────────────────────────────────────────────
  {
    id: "l7_deepfake",
    index: 7,
    title: "AI 換臉視像騙局",
    titleEn: "AI Deepfake Video Scam",
    titleZh: "AI 换脸视频骗局",
    type: "video",
    channel: "video",
    icon: "🤖",
    scamType: "Deepfake 換臉 + 緊急借錢",
    redFlags: [
      "視像通話中對方樣貌似熟人但口型唔夾",
      "急催轉帳，理由係「出事要救急」",
      "拒絕出示身份證件核實身份",
      "畫面偶爾扭曲、光影不自然",
      "聲音與平時有差異"
    ],
    officialChannels: [
      "要求出示實體證件（身份證、學生證）核實",
      "用通訊錄原有號碼回撥核實",
      "用第二個渠道（電話、訊息）核實",
      "任何借錢請求都唔好因為「見到樣」就信"
    ],
    scenes: [
      {
        id: "l7_s1_video_call",
        type: "choice",
        speaker: "scammer",
        pressure: true,
        text: "你接到 WhatsApp 視像通話——來電顯示係你好友 Jason。畫面中嘅「Jason」話：「阿哥，我出咗事，要緊急借 $8,000，半個鐘內轉到我就還返你 $10,000，求下你！」\n\n你留意到「Jason」說話時口型同聲音有啲唔夾，畫面偶爾有輕微扭曲。",
        textEn: "WhatsApp video call from 'Jason'. The 'Jason' says: 'Bro, I'm in trouble, need to urgently borrow $8,000, transfer in 30 min and I'll return $10,000, please!'\n\nYou notice lip-sync slightly off, image occasionally distorts.",
        textZh: "你接到 WhatsApp 视频通话——来电显示是你好友 Jason。画面中的「Jason」说：「阿哥，我出了事，要紧急借 $8,000，半个钟内转到我就还返你 $10,000，求下你！」\n\n你注意到「Jason」说话时口型同声音有些不夹，画面偶尔有轻微扭曲。",
        visual: {
          type: "deepfake_video",
          src: "video2.mp4",
          label: "WhatsApp 視像通話 · Jason",
          content: "「Jason」話：「阿哥，我出咗事，要緊急借 $8,000，半個鐘內轉到我就還返你 $10,000，求下你！」"
        },
        choices: [
          {
            id: "l7_s1_transfer",
            text: "驚慌下立刻轉 $8,000",
            textEn: "Panicked, transfer $8,000 now",
            textZh: "惊慌下立刻转 $8,000",
            effects: { alertness: -30, riskScore: 60, money: -80, score: -200 },
            nextSceneId: "l7_s_loss",
            feedback: "⚠️ 你被 Deepfake 騙咗——AI 換臉已能實時偽造熟人樣貌。「見到樣」再唔係身份保證。",
            feedbackEn: "⚠️ You were Deepfake-scammed — AI can fake acquaintances' faces in real time. 'Seeing the face' is no longer proof of identity.",
            feedbackZh: "⚠️ 你被 Deepfake 骗了——AI 换脸已能实时伪造熟人样貌。「见到样」再不是身份保证。",
            feedbackType: "bad"
          },
          {
            id: "l7_s1_test",
            text: "要求對方做指定動作（摸鼻）測試",
            textEn: "Ask the caller to do an action (touch nose)",
            textZh: "要求对方做指定动作（摸鼻）测试",
            effects: { alertness: -20, riskScore: 50, money: -80, score: -180 },
            nextSceneId: "l7_s_loss",
            feedback: "⚠️ 你以為摸鼻能識破 AI 換臉，但 2024 年起 AI 已能實時處理指定動作。「Jason」順利摸咗鼻，你信以為真，繼續通話後被說服轉賬。指定動作測試已經失效。",
            feedbackEn: "⚠️ You thought action tests could spot AI face-swap, but since 2024 AI can handle arbitrary actions in real time. 'Jason' touched his nose smoothly, you believed it, and were later persuaded to transfer. Action tests no longer work.",
            feedbackZh: "⚠️ 你以为摸鼻能识破 AI 换脸，但 2024 年起 AI 已能实时处理指定动作。「Jason」顺利摸了鼻，你信以为真，继续通话后被说服转账。指定动作测试已经失效。",
            feedbackType: "bad"
          },
          {
            id: "l7_s1_id",
            text: "要求對方出示身份證核實身份",
            textEn: "Ask the caller to show their ID card to verify",
            textZh: "要求对方出示身份证核实身份",
            effects: { alertness: 25, information: 15, xp: 30, score: 60 },
            nextSceneId: "l7_s_test_result",
            feedback: "✅ 正確！AI 可以換臉、可以做動作，但偽造不出一張實體身份證。要求出示證件係目前對抗 Deepfake 最有效嘅方法之一。",
            feedbackEn: "✅ Correct! AI can swap faces and perform actions, but cannot fabricate a physical ID card. Requesting ID is one of the most effective ways to counter Deepfake.",
            feedbackZh: "✅ 正确！AI 可以换脸、可以做动作，但伪造不出一张实体身份证。要求出示证件是目前对抗 Deepfake 最有效的方法之一。",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l7_s_test_result",
        type: "result",
        speaker: "official",
        text: "你要求「Jason」出示身份證核實。對方開始支吾以對：「唉，我而家喺街度，邊有帶住啊，你信我啦！」你再堅持，對方立刻發難：「你唔信我？算啦！」然後掛斷。\n\n你覺得可疑，用通訊錄原有號碼回撥——真嘅 Jason 話：「我喺屋企睇 Netflix，邊有打俾你？」你確認剛才係 Deepfake。",
        textEn: "You ask 'Jason' to show his ID. He hedges: 'I'm out on the street, I don't have it on me, just trust me!' You insist; he snaps: 'You don't trust me? Forget it!' and hangs up.\n\nSuspicious, you call back via the original number — real Jason: 'I'm at home watching Netflix, I never called.' Deepfake confirmed.",
        textZh: "你要求「Jason」出示身份证核实。对方开始支吾以对：「唉，我现在在街上，哪有带住啊，你信我啦！」你再坚持，对方立刻发难：「你不信我？算啦！」然后挂断。\n\n你觉得可疑，用通讯录原有号码回拨——真的 Jason 说：「我在家看 Netflix，哪有打给你？」你确认刚才是 Deepfake。",
        visual: {
          type: "safe_result",
          content: "✅ Deepfake 識破\n\n測試：要求出示身份證\n→ 對方支吾 + 發難掛斷\n原有號碼回撥 → 真 Jason\n\n💡 Deepfake 防禦：\n• 要求出示實體證件\n• 用獨立渠道核實\n• 永不因「見到樣」就信"
        },
        choices: [
          {
            id: "l7_safe_continue",
            text: "繼續下一關",
            textEn: "Continue to next level",
            textZh: "继续下一关",
            effects: { alertness: 15, xp: 40 },
            nextSceneId: "__next_level__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "l7_s_loss",
        type: "result",
        speaker: "system",
        text: "你轉咗 $8,000 後，再無法聯絡「Jason」。你打畀真嘅 Jason，先知佢 IG 俾人盜用，騙徒用佢照片訓練 AI 換臉模型，向所有朋友借錢。多名同學都被騙。",
        textEn: "After $8,000, 'Jason' vanishes. The real Jason says his IG was hacked; scammers trained Deepfake on his photos, hitting all friends. Multiple classmates lost money.",
        textZh: "你转了 $8,000 后，再无法联络「Jason」。你打给真的 Jason，才知他 IG 给人盗用，骗徒用他照片训练 AI 换脸模型，向所有朋友借钱。多名同学都被骗。",
        visual: {
          type: "warning_page",
          content: "⚠️ 損失 HK$8,000\n\nDeepfake 換臉\nJason IG 被盜\n多名同學被騙\n\n💡 反思：\n• 視像唔再可靠\n• 指定動作測試\n• 獨立渠道核實"
        },
        choices: [
          {
            id: "l7_loss_continue",
            text: "前往額外關卡 / 結局",
            textEn: "Go to bonus level / ending",
            textZh: "前往额外关卡 / 结局",
            effects: { information: 15 },
            nextSceneId: "__ending__",
            feedbackType: "bad"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 額外關卡：幫助朋友脫離騙局（左右分欄）
  // ─────────────────────────────────────────────────────────────
  {
    id: "lb_bonus_help_friend",
    index: 8,
    title: "額外關卡：拯救小玲",
    titleEn: "Bonus: Save Siu Ling",
    titleZh: "额外关卡：拯救小玲",
    type: "split_screen",
    channel: "whatsapp",
    icon: "🆘",
    scamType: "殺豬盤 + 投資詐騙",
    isBonus: true,
    redFlags: [
      "對方自稱「投資顧問」，每日噓寒問暖",
      "拒絕視像通話，藉口「工作保密」",
      "急催投資，話「呢個機會好快冇」",
      "IP 顯示海外，但聲稱喺中環上班",
      "投資 App 無法喺 App Store / Play Store 搜到"
    ],
    officialChannels: [
      "證監會投資者名冊查核持牌人",
      "用防騙視伏器搜尋投資 App",
      "「殺豬盤」三大特徵：網戀 + 投資 + 越界催轉帳"
    ],
    scenes: [
      {
        id: "lb_s1_intro",
        type: "split_screen",
        speaker: "system",
        text: "你嘅好朋友小玲最近沉迷網戀，對象係自稱「投資顧問阿偉」嘅陌生人。小玲話：「佢對我好好，仲教我投資賺錢。」你擔心佢陷入殺豬盤。\n\n你坐喺小玲旁邊，一邊睇住佢同阿偉嘅對話，一邊嘗試說服佢。指出對話中嘅漏洞 + 揀啱說服話術，提升小玲信任度。信任度滿 = 成功勸退；信任度歸零 = 小玲被騙。",
        textEn: "Your friend Siu Ling is hooked on a romance scammer — 'investment advisor Ah Wai'. She says: 'He's so sweet, teaches me to invest.' You worry she's in a pig-butchering scam.\n\nSit beside her, read her chat with Ah Wai, and try to persuade her. Spot vulnerabilities + pick right words to raise her trust in you. Trust full = success; trust zero = she's scammed.",
        textZh: "你的好朋友小玲最近沉迷网恋，对象是自称「投资顾问阿伟」的陌生人。小玲说：「他对我好好，还教我投资赚钱。」你担心她陷入杀猪盘。\n\n你坐在小玲旁边，一边看着她同阿伟的对话，一边尝试说服她。指出对话中的漏洞 + 选对说服话术，提升小玲信任度。信任度满 = 成功劝退；信任度归零 = 小玲被骗。",
        splitConfig: {
          trustMeter: { initial: 30, max: 100, min: 0, success: 100, fail: 0 },
          chatMessages: [
            { id: "m1", from: "scammer", name: "阿偉", text: "BB，今日天氣凍，記得著多件衫 🥰", time: "Day 1" },
            { id: "m2", from: "scammer", name: "阿偉", text: "我喺中環做投資，今日幫客賺咗 30 萬 💰", time: "Day 3" },
            { id: "m3", from: "scammer", name: "阿偉", text: "BB我都想你賺錢，呢個內部平台你試下，最低 $5000 入金", time: "Day 5" },
            { id: "m4", from: "friend", name: "小玲", text: "好呀好呀！但我想先視像通話認識你 📹", time: "Day 5" },
            { id: "m5", from: "scammer", name: "阿偉", text: "我工作保密唔可以視像，你信我啦 😘", time: "Day 5" },
            { id: "m6", from: "scammer", name: "阿偉", text: "機會好快冇，今日入金額外送 20% 紅利 ⚡", time: "Day 7" },
            { id: "m7", from: "friend", name: "小玲", text: "我考慮下…你個 App 喺邊度下載？", time: "Day 7" },
            { id: "m8", from: "scammer", name: "阿偉", text: "App Store 搜唔到，我直接畀 APK 連結你", time: "Day 7" }
          ],
          vulnerabilities: [
            {
              id: "v1",
              text: "拒絕視像通話（藉口工作保密）",
              hint: "真投資顧問唔會拒絕視像，何況係網戀對象",
              keyword: "視像",
              matchMessageId: "m5",
              revealed: false
            },
            {
              id: "v2",
              text: "急催投資 + 紅利 urgency",
              hint: "「今日入金送紅利」係經典詐騙 urgency 手法",
              keyword: "紅利",
              matchMessageId: "m6",
              revealed: false
            },
            {
              id: "v3",
              text: "App Store 搜不到 + APK 連結",
              hint: "正規金融 App 必喺 App Store / Play Store，APK 直裝 = 高危",
              keyword: "APK",
              matchMessageId: "m8",
              revealed: false
            }
          ],
          persuasionOptions: [
            {
              id: "p1",
              text: "「小玲，真正嘅投資顧問會樂意視像，拒絕就係有鬼」",
              textEn: "'A real investment advisor would video-call gladly; refusing is suspicious'",
              textZh: "「小玲，真正的投资顾问会乐意视频，拒绝就是有鬼」",
              trustChange: 20,
              requiresVulnerability: "v1",
              failureText: "小玲：但佢工作保密呀…（你未指出具體漏洞，說服力不足）",
              failureTextEn: "Siu Ling: But his work is confidential... (you haven't pointed out the specific flaw, not persuasive)",
              failureTextZh: "小玲：但他工作保密呀…（你未指出具体漏洞，说服力不足）"
            },
            {
              id: "p2",
              text: "「任何急催投資 + 紅利 urgency 都係詐騙紅旗」",
              textEn: "'Any urgent investment + bonus pressure is a scam red flag'",
              textZh: "「任何急催投资 + 红利 urgency 都是诈骗红旗」",
              trustChange: 25,
              requiresVulnerability: "v2",
              failureText: "小玲：但機會真係好難得…（你未指出具體漏洞）",
              failureTextEn: "Siu Ling: But the opportunity is rare... (you haven't pointed out the specific flaw)",
              failureTextZh: "小玲：但机会真是很难得…（你未指出具体漏洞）"
            },
            {
              id: "p3",
              text: "「App Store 搜唔到 + APK 直裝 = 必係騙局」",
              textEn: "'Not in App Store + APK install = definitely a scam'",
              textZh: "「App Store 搜不到 + APK 直装 = 必是骗局」",
              trustChange: 30,
              requiresVulnerability: "v3",
              failureText: "小玲：但佢話內部平台…（你未指出具體漏洞）",
              failureTextEn: "Siu Ling: But he said internal platform... (you haven't pointed out the specific flaw)",
              failureTextZh: "小玲：但他说内部平台…（你未指出具体漏洞）"
            },
            {
              id: "p4",
              text: "「我幫你喺證監會查吓佢有冇牌照」",
              textEn: "'Let me check if he's licensed in SFC'",
              textZh: "「我帮你在证监会查查他有没有牌照」",
              trustChange: 15,
              requiresVulnerability: null,
              failureText: "小玲：好呀，但佢話佢唔使牌照…",
              failureTextEn: "Siu Ling: OK, but he said he doesn't need a license...",
              failureTextZh: "小玲：好呀，但他说他不用牌照…"
            }
          ]
        },
        successScene: "lb_s_success",
        failScene: "lb_s_fail"
      },
      {
        id: "lb_s_success",
        type: "result",
        speaker: "official",
        text: "你成功說服小玲！你哋一齊喺證監會投資者名冊查唔到「阿偉」，再用防騙視伏器掃描嗰個 APK 連結——顯示「高危殺豬盤 App，127 人舉報」。\n\n小玲立刻封鎖阿偉，並致電 18222 報案。佢多謝你救咗佢免受重大損失。",
        textEn: "You've convinced Siu Ling! You both check SFC registry — no 'Ah Wai'. Scameter shows APK link as 'High-Risk Pig-Butchering App, 127 reports'.\n\nSiu Ling blocks Ah Wai and calls 18222. She thanks you for saving her from major loss.",
        textZh: "你成功说服小玲！你们一起在证监会投资者名册查不到「阿伟」，再用防骗视伏器扫描那个 APK 连结——显示「高危杀猪盘 App，127 人举报」。\n\n小玲立刻封锁阿伟，并致电 18222 报案。她多谢你救了她免受重大损失。",
        visual: {
          type: "safe_result",
          content: "✅ 拯救成功\n\n證監會查冊：無「阿偉」\n防騙視伏器：🔴 高危（127 舉報）\n小玲信任度：100%\n\n💡 殺豬盤識別：\n• 網戀 + 投資 + 催轉帳\n• 拒絕視像\n• App Store 搜唔到"
        },
        choices: [
          {
            id: "lb_success_end",
            text: "完成遊戲",
            textEn: "Finish game",
            textZh: "完成游戏",
            effects: { alertness: 20, information: 25, xp: 50, score: 100 },
            nextSceneId: "__ending__",
            feedbackType: "good"
          }
        ]
      },
      {
        id: "lb_s_fail",
        type: "result",
        speaker: "system",
        text: "小玲信咗阿偉，私下轉咗 HK$50,000 入「投資平台」。三日後 App 消失，阿偉拉黑佢。小玲喊住搵你，但你已經嚟唔切阻止。",
        textEn: "Siu Ling trusted Ah Wai, secretly transferred HK$50,000 to the 'platform'. Three days later the app vanished, Ah Wai blocked her. She cries to you, but it's too late.",
        textZh: "小玲信了阿伟，私下转了 HK$50,000 入「投资平台」。三日后 App 消失，阿伟拉黑她。小玲哭着找你，但你已经来不及阻止。",
        visual: {
          type: "warning_page",
          content: "⚠️ 拯救失敗\n\n小玲損失 HK$50,000\n信任度歸零\n\n💡 反思：\n• 殺豬盤詐騙極具操縱性\n• 受害人情緒被操控\n• 旁觀者說服要指出具體漏洞"
        },
        choices: [
          {
            id: "lb_fail_end",
            text: "完成遊戲",
            textEn: "Finish game",
            textZh: "完成游戏",
            effects: { information: 15 },
            nextSceneId: "__ending__",
            feedbackType: "bad"
          }
        ]
      }
    ]
  }
];

// 暴露為全局變量
if (typeof window !== 'undefined') {
  window.LEVELS = LEVELS;
  // 覆蓋舊 data.js 嘅 const levels（如果存在），優先使用新 8 關配置
  try {
    if (typeof window.levels === 'undefined' || !window.levels || window.levels.length < LEVELS.length) {
      Object.defineProperty(window, 'levels', { value: LEVELS, writable: true, configurable: true });
    }
  } catch(e) {
    try { window.levels = LEVELS; } catch(e2){}
  }
}
