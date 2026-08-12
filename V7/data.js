// ===================================================================
// Anti-Scam Story Simulator — Hong Kong Edition
// 別急，先查證 · Anti-Scam Adventure (HK)
// 5 大主題關卡：香港本地詐騙情境
// ===================================================================

// ===== 身份開場文字（依身份分類，無地區選擇）=====
const introTexts = {
  mainland_student: {
    'zh-TW': "你剛從內地來香港讀大學，普通話、英文、廣東話切來切去，學校系統、宿舍帳單、FPS 轉數快都還在摸索。語言壓力和身份焦慮讓你特別容易成為騙子目標——假冒內地公檢法、假冒入境處、租房詐騙，都是為你量身訂做的套路。",
    'zh': "你刚从内地来香港读大学，普通话、英文、广东话切来切去，学校系统、宿舍账单、FPS 转数快都还在摸索。语言压力和身份焦虑让你特别容易成为骗子目标——假冒内地公检法、假冒入境处、租房诈骗，都是为你量身定做的套路。",
    'en': "You just arrived from mainland China to study in HK, switching between Putonghua, English and Cantonese. Still navigating school systems, dorm bills and FPS transfers. Language pressure and identity anxiety make you especially vulnerable to scams — fake mainland police, fake immigration, rental scams — all tailor-made for you."
  },
  local_hk_student: {
    'zh-TW': "你在香港本地讀大學，對這裡的銀行、MTR、PayMe、轉數快都熟悉得不能再熟。但正因為太熟悉，反而容易放鬆警惕——假銀行短訊、刷單兼職、Deepfake 換臉詐騙，專門針對你這種「我怎麼可能被騙」的心態。",
    'zh': "你在香港本地读大学，对这里的银行、MTR、PayMe、转数快都熟悉得不能再熟。但正因为太熟悉，反而容易放松警惕——假银行短信、刷单兼职、Deepfake 换脸诈骗，专门针对你这种「我怎么可能被骗」的心态。",
    'en': "You study locally in HK, familiar with banks, MTR, PayMe and FPS. But familiarity breeds complacency — fake bank SMS, fake shopping rebates, Deepfake face-swap scams target exactly this 'I could never be scammed' mindset."
  }
};

// ===== 身份屬性修正 =====
// 內地生：高身份焦慮、語言壓力；本地生：高本地熟悉度、低警覺
const identityModifiers = {
  mainland_student: {
    alertness: 5, information: 5,
    localFamiliarity: -15, languagePressure: 15, identityAnxiety: 15
  },
  local_hk_student: {
    alertness: -5, information: 0,
    localFamiliarity: 30, languagePressure: -10, identityAnxiety: -5
  }
};

// ===== 身份顯示名稱 =====
const identityNames = {
  mainland_student: "中國大陸來港學生",
  local_hk_student: "香港本地學生"
};

// ===================================================================
// ===== 關鍵字銀行（ Keyword Bank ）=====
// 三類：verify（查證類，正向）/ danger（危險類，負向）/ neutral 由系統處理
// 同時收錄繁體、簡體、英文，checkKeyword() 統一小寫比對
// ===================================================================
const keywordBank = {
  verify: {
    'zh-TW': ['查證','核實','防騙','防騙易','18222','防騙視伏器','scameter','警察','警方','報警','hkpf','官網','官方','校方','學生事務處','學校','熱線','銀行熱線','匯豐熱線','adcc','反詐騙','反詐','求證','確認','核對','挂號','掛號','澄清','舉報','求助','掛斷','掛線','收線','不要','不給','不轉','不給予','拒絕','拒絕給予','等等','先別急','先查','查一下','查清楚','弄清楚','核實一下','確認一下','打電話問','聯繫銀行','聯繫校方','聯繫入境處','假的','騙子','詐騙','釣魚','可疑','有問題','不靠譜','不可信','別信','不要信','不能信','我不信','我懷疑','懷疑','小心','當心','注意','提高警覺','警覺點','冷靜一下','冷靜','想想','考慮','我想想','讓我想想','再想想','暫停','停一下','先等等','緩一緩','不急','不著急','不用急','為什麼','怎麼','怎麼證明','證明你是','你是誰','你是真的嗎','真的假的','真偽','身份','身分','身分證明','你打過來','我打出來','我回撥','回撥','回電','掛了再打','打給你','致電','撥打','查詢','咨詢','咨詢一下','反映','投訴','檢舉','揭發','曝光','截圖','錄音','保留證據','證據'],
    'zh':     ['查证','核实','防骗','防骗易','18222','防骗视伏器','scameter','警察','警方','报警','hkpf','官网','官方','校方','学生事务处','学校','热线','银行热线','汇丰热线','adcc','反诈骗','反诈','求证','确认','核对','挂号','澄清','举报','求助','挂断','挂线','收线','不要','不给','不转','不给予','拒绝','拒绝给予','等等','先别急','先查','查一下','查清楚','弄清楚','核实一下','确认一下','打电话问','联系银行','联系校方','联系入境处','假的','骗子','诈骗','钓鱼','可疑','有问题','不靠谱','不可信','别信','不要信','不能信','我不信','我怀疑','怀疑','小心','当心','注意','提高警觉','警觉点','冷静一下','冷静','想想','考虑','我想想','让我想想','再想想','暂停','停一下','先等等','缓一缓','不急','不着急','不用急','为什么','怎么','怎么证明','证明你是','你是谁','你是真的吗','真的假的','真伪','身份','身份证明','你打过来','我打出去','我回拨','回拨','回电','挂了再打','打给你','致电','拨打','查询','咨询','咨询一下','反映','投诉','检举','揭发','曝光','截图','录音','保留证据','证据'],
    'en':     ['verify','official','police','hkpf','scameter','18222','adcc','hotline','bank hotline','check','confirm','campus office','report','anti-scam','ascert','hsbc hotline','hang seng hotline','hang up','no way','not giving','refuse','reject','wait','hold on','let me think','suspicious','fake','scam','phishing','unreliable','not trust','doubt','doubtful','careful','beware','calm down','calm','consider','pause','not urgent','why','how','prove','who are you','real or fake','identity','call back','return call','i call you','you called me','inquiry','enquire','complaint','evidence','screenshot','recording']
  },
  danger: {
    'zh-TW': ['轉賬','轉帳','密碼','驗證碼','一次性密碼','otp','身份證','hkid','轉數快','fps','銀行卡號','卡號','存款','投資','充值','解鎖','付款','payme','支付','信用卡','cvv','餘額','轉錢','匯款','網銀','登入密碼','交保','保釋金','保證金','押金','訂金','給你','發給你','提供','告訴你','說給你聽','念給你聽','唸給你聽','報給你','提供給你','發送','傳送','發過來','傳過來','發一下','傳一下','告訴我','說一下','講一下','念出來','唸出來','說出來','告訴你密碼','給你密碼','銀行密碼','帳號','賬號','賬戶','帳戶','戶口','口號','編號','賬號','安全帳戶','安全賬戶','凍結保護','資金保護','配合調查','協助調查','公文','傳票','拘捕令','逮捕令','通緝','通緝令','秘密','保密','不許告訴別人','不能說','別告訴任何人','只有你知道','機密','國家機密','辦案','調查','案底','刑事','民事','罰款','繳罰款','違規','違法','犯法','犯罪','坐牢','監獄','拘留','扣押','限制出境','禁止出境','遣返','遞解','簽證異常','簽證有問題','身份異常','帳戶異常','賬戶異常','異常登錄','風險','安全風險'],
    'zh':     ['转账','密码','验证码','一次性密码','otp','身份证','hkid','转数快','fps','银行卡号','卡号','存款','投资','充值','解锁','付款','payme','支付','信用卡','cvv','余额','转钱','汇款','网银','登录密码','交保','保释金','保证金','押金','订金','给你','发给你','提供','告诉你','说给你听','念给你听','报给你','提供给你','发送','传送','发过来','传过来','发一下','传一下','告诉我','说一下','讲一下','念出来','说出来','告诉你密码','给你密码','银行密码','帐号','账号','账户','帐户','户口','口号','编号','安全帐户','安全账户','冻结保护','资金保护','配合调查','协助调查','公文','传票','拘捕令','逮捕令','通缉','通缉令','秘密','保密','不许告诉别人','不能说','别告诉任何人','只有你知道','机密','国家机密','办案','调查','案底','刑事','民事','罚款','缴罚款','违规','违法','犯法','犯罪','坐牢','监狱','拘留','扣押','限制出境','禁止出境','遣返','递解','签证异常','签证有问题','身份异常','账户异常','异常登录','风险','安全风险'],
    'en':     ['transfer','password','otp','one-time password','hkid','id card','fps','card number','deposit','invest','unlock','pay','payme','credit card','cvv','balance','send money','remit','online banking','bail','guarantee','give you','provide','tell you','read out','send to','account number','account','safe account','security account','frozen','freeze','investigation','cooperate','warrant','arrest warrant','wanted','secret','confidential','don\'t tell anyone','case','criminal','fine','illegal','jail','prison','detain','deport','visa problem','abnormal login','risk','security risk']
  }
};

// ===================================================================
// ===== 5 大主題關卡（ Themed Levels ）=====
// 每關包含多個場景，支援 multi-choice 與 text_input 兩種互動模式
// ===================================================================
const levels = [
  // ─────────────────────────────────────────────────────────────
  // Level 1：校園租房與宿位詐騙
  // ─────────────────────────────────────────────────────────────
  {
    id: "hk_l1_housing",
    index: 1,
    title: "校園租房與宿位詐騙",
    titleEn: "Campus & Housing Scam",
    titleZh: "校园租房与宿位诈骗",
    icon: "🏠",
    scamType: "假租房 + FPS 押金詐騙",
    redFlags: [
      "租金明顯低於市價（中環/旺角單位只要 $4,500？）",
      "房東聲稱「人在外地」無法實地看房，催促先付押金鎖定房源",
      "要求經轉數快 (FPS) 立刻轉賬，否則「另有人要看房」",
      "無法提供租約草稿、業主姓名、土地註冊處資料",
      "Facebook/小紅書群組貼文，無可核實的仲介牌照"
    ],
    officialChannels: [
      "透過土地註冊處查核業主身份（www.landreg.gov.hk）",
      "使用校方學生事務處認可的宿舍/租房資訊平台",
      "堅持實地看房並簽署正式租約再付款",
      "致電防騙易 18222 熱線查詢可疑房源",
      "使用防騙視伏器 (Scameter) 搜尋房東電話/帳號"
    ],
    scenes: [
      // ── 場景 1：看到租房貼文 ──
      {
        id: "l1_s1",
        type: "message",
        speaker: "system",
        text: "開學前兩週，你還沒找到住處。你在某 Facebook 群組看到一則貼文——旺角亞皆老街單位，月租 $4,500，臨近 MTR，附傢俬，看照片簡直完美。你私訊了對方。",
        textEn: "Two weeks before term starts, you still haven't found a place. A Facebook group post catches your eye — a Mong Kok flat on Argyle Street, $4,500/month, near MTR, furnished. You DM the poster.",
        textZh: "开学前两周，你还没找到住处。你在某 Facebook 群组看到一则贴文——旺角亚皆老街单位，月租 $4,500，临近 MTR，附家私，看照片简直完美。你私信了对方。",
        visual: {
          type: "phishing_card",
          url: "fb.com/groups/HKU-Rentals/posts/18823",
          realUrl: "Facebook 群組貼文（無法核實真實身份）",
          pageTitle: "【急租】旺角亞皆老街 單位 $4500/月",
          pageIcon: "🏠",
          redFlags: [
            { icon: "💸", text: "租金低於市價約 40%（同區約 $7,500+）" },
            { icon: "👤", text: "發帖人無仲介牌照編號" },
            { icon: "📍", text: "地址模糊，無完整門牌" }
          ]
        },
        choices: [
          {
            id: "l1_c1_dm",
            text: "📲 私訊對方問詳情",
            textEn: "📲 DM the poster for details",
            textZh: "📲 私信对方问详情",
            effects: { information: 5 },
            nextSceneId: "l1_s2",
            feedback: "你決定先問問細節——這本身沒問題，但接下來對方的反應才是關鍵。",
            feedbackEn: "Asking for details is fine — but watch how the poster responds next.",
            feedbackZh: "问问细节没问题——但接下来对方的反应才是关键。",
            feedbackType: "mid"
          }
        ]
      },
      // ── 場景 2：房東催促 FPS 押金（自由輸入關卡）──
      {
        id: "l1_s2",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "「房東」很快回覆，態度熱情但急促。他說人在深圳，無法帶你看房，但「今天內付 $3,000 押金就能鎖定房源，否則另有人要看」。他發來一個轉數快 (FPS) 帳號。\n\n你會怎麼回覆？",
        textEn: "The 'landlord' replies fast — warm but pushy. He says he's in Shenzhen and can't show the flat in person, but '$3,000 deposit via FPS today locks it in, otherwise someone else is viewing it.' He sends an FPS ID.\n\nHow do you reply?",
        textZh: "「房东」很快回复，态度热情但急促。他说人在深圳，无法带你看房，但「今天内付 $3,000 押金就能锁定房源，否则另有人要看」。他发来一个转数快 (FPS) 账号。\n\n你会怎么回复？",
        visual: {
          type: "chat",
          app: "WhatsApp",
          appIcon: "💬",
          messages: [
            { type: "incoming", name: "+852 5678 1234", text: "Hi! 單位仲喺度，不過好多人問。我喺深圳，今日轉 $3000 押金就幫你鎖定 🏠" },
            { type: "incoming", name: "+852 5678 1234", text: "FPS ID: 9876543 / 銀行：中銀香港\n快啲啦，唔係就俾人租咗" }
          ]
        },
        inputConfig: {
          placeholder: "輸入你想回覆的內容…（例如：我想先查證 / 我現在就轉賬）",
          placeholderEn: "Type your reply… (e.g. I want to verify first / I'll transfer now)",
          placeholderZh: "输入你想回复的内容…（例如：我想先查证 / 我现在就转账）",
          goodNextSceneId: "l1_s3_safe",
          badNextSceneId: "l1_s3_loss",
          neutralNextSceneId: "l1_s2b_pressure",
          maxNeutralAttempts: 2,
          goodFeedback: "✅ 你提到了查證/核實——這是面對催促時最正確的第一反應。真正的業主不怕你查。",
          goodFeedbackEn: "✅ You mentioned verifying — the right first response to pressure. Real landlords are never afraid of being checked.",
          goodFeedbackZh: "✅ 你提到了查证/核实——这是面对催促时最正确的第一反应。真正的业主不怕你查。",
          badFeedback: "⚠️ 你提到轉賬/付款/押金——在未實地看房、未核實業主身份前，任何金錢操作都極度危險。",
          badFeedbackEn: "⚠️ You mentioned transferring/paying/deposit — any money move before viewing the flat and verifying the owner is extremely risky.",
          badFeedbackZh: "⚠️ 你提到转账/付款/押金——在未实地看房、未核实业主身份前，任何金钱操作都极度危险。",
          neutralFeedback: "🤔 對方見你沒明確表態，又開始施壓：「你到底要不要？後面還有人排隊！」再想想你會怎麼做。",
          neutralFeedbackEn: "🤔 Seeing you hesitate, the scammer pushes again: 'Do you want it or not? Others are queuing!' Think about what to do.",
          neutralFeedbackZh: "🤔 对方见你没明确表态，又开始施压：「你到底要不要？后面还有人排队！」再想想你会怎么做。"
        }
      },
      // ── 場景 2b：房東二次施壓（自由輸入第二次機會）──
      {
        id: "l1_s2b_pressure",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "「房東」開始用情感施壓：「我等你半天了，再不轉我就給下一個了。你到底信不信我？我發誓這是真的房源。」\n\n這是你第二次機會——你會怎麼回覆？",
        textEn: "The 'landlord' turns emotional: 'I've waited half a day. If you don't transfer now I'll give it to the next person. Don't you trust me? I swear it's real.'\n\nSecond chance — how do you reply?",
        textZh: "「房东」开始用情感施压：「我等你半天了，再不转我就给下一个了。你到底信不信我？我发誓这是真的房源。」\n\n这是你第二次机会——你会怎么回复？",
        visual: {
          type: "chat",
          app: "WhatsApp",
          appIcon: "💬",
          messages: [
            { type: "incoming", name: "+852 5678 1234", text: "我等你半日啦 😤 再唔轉就俾下一個" },
            { type: "incoming", name: "+852 5678 1234", text: "你信我啦，我發誓係真房源" }
          ]
        },
        inputConfig: {
          placeholder: "再次輸入你的回覆…（提示：想想如何查證）",
          placeholderEn: "Type your reply again… (hint: think how to verify)",
          placeholderZh: "再次输入你的回复…（提示：想想如何查证）",
          goodNextSceneId: "l1_s3_safe",
          badNextSceneId: "l1_s3_loss",
          neutralNextSceneId: "l1_s3_safe",
          maxNeutralAttempts: 0,
          goodFeedback: "✅ 你堅持查證——這正是反詐的關鍵習慣。不被情感話術帶走。",
          goodFeedbackEn: "✅ You insisted on verifying — the key anti-scam habit. Not swayed by emotional tactics.",
          goodFeedbackZh: "✅ 你坚持查证——这正是反诈的关键习惯。不被情感话术带走。",
          badFeedback: "⚠️ 你還是傾向付款——記住：越催促越要停。詐騙靠的就是你沒時間思考。",
          badFeedbackEn: "⚠️ You still leaned toward paying — remember: the more they rush, the more you should pause. Scams rely on you having no time to think.",
          badFeedbackZh: "⚠️ 你还是倾向付款——记住：越催促越要停。诈骗靠的就是你没时间思考。",
          neutralFeedback: "🤔 你還是沒有明確行動。這次我們幫你做出選擇——停下來，查證。",
          neutralFeedbackEn: "🤔 Still no clear action. Let's help you decide — pause and verify.",
          neutralFeedbackZh: "🤔 你还是没有明确行动。这次我们帮你做出选择——停下来，查证。"
        }
      },
      // ── 場景 3A：安全路徑——查證結果 ──
      {
        id: "l1_s3_safe",
        type: "result",
        speaker: "official",
        text: "你決定停下來查證。你把對方的電話號碼輸入「防騙視伏器 (Scameter)」——結果顯示這個號碼已被標記為「高危詐騙」。你接著在土地註冊處查不到對方聲稱的業主名字。",
        textEn: "You pause to verify. You enter the phone number into Scameter (防騙視伏器) — it's flagged as 'High-Risk Scam'. The claimed owner's name doesn't appear in the Land Registry either.",
        textZh: "你决定停下来查证。你把对方的电话号码输入「防骗视伏器 (Scameter)」——结果显示这个号码已被标记为「高危诈骗」。你接着在土地注册处查不到对方声称的业主名字。",
        visual: {
          type: "safe_result",
          content: "✅ 防騙視伏器 (Scameter) 查核結果\n\n電話 +852 5678 1234\n狀態：🔴 高危 — 已被 23 人舉報為租房詐騙\n\n建議行動：\n• 立即封鎖對方\n• 致電防騙易 18222 報案\n• 向校方學生事務處反映\n• 改用校方認可租房平台"
        },
        choices: [
          {
            id: "l1_c3_block",
            text: "🚫 封鎖對方，並向 18222 舉報",
            textEn: "🚫 Block and report to 18222",
            textZh: "🚫 拉黑对方，并向 18222 举报",
            effects: { alertness: 25, information: 20, riskScore: -20, money: 0 },
            nextSceneId: "l1_s4_done",
            feedback: "✅ 完美。你識破了租房騙局，還主動舉報——這能保護其他同學。真正的租房一定可以先看房、簽約再付款。",
            feedbackEn: "✅ Perfect. You spotted the rental scam and reported it — protecting fellow students. Legitimate rentals always allow viewing and signing before payment.",
            feedbackZh: "✅ 完美。你识破了租房骗局，还主动举报——这能保护其他同学。真正的租房一定可以先看房、签约再付款。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 3B：危險路徑——損失押金 ──
      {
        id: "l1_s3_loss",
        type: "result",
        speaker: "system",
        text: "你照對方要求，經轉數快轉了 $3,000 押金。對方收款後說「再轉 $5,000 保證金才能寄鑰匙」。你猶豫了一下，再傳訊息——已被封鎖。打電話——空號。",
        textEn: "You transfer $3,000 deposit via FPS as asked. The 'landlord' then demands another $5,000 'guarantee' to send the keys. You hesitate, message again — blocked. Call — dead number.",
        textZh: "你照对方要求，经转数快转了 $3,000 押金。对方收款后说「再转 $5,000 保证金才能寄钥匙」。你犹豫了一下，再发消息——已被拉黑。打电话——空号。",
        visual: {
          type: "warning_page",
          content: "⚠️ FPS 轉賬紀錄\n\n收款方：9876543（中銀香港）\n金額：HK$3,000\n狀態：已成交（無法撤回）\n\n對方 WhatsApp：已封鎖你\n對方電話：空號\n\n💡 轉數快轉賬一旦完成，款項無法自動退回。"
        },
        choices: [
          {
            id: "l1_c3_report",
            text: "📞 立刻致電防騙易 18222 報案",
            textEn: "📞 Call Anti-Deception 18222 now",
            textZh: "📞 立刻致电防骗易 18222 报案",
            effects: { money: -30, riskScore: 30, information: 15, alertness: 10 },
            nextSceneId: "l1_s4_done",
            feedback: "⚠️ 錢已損失，但即時報案是唯一正確動作。18222 會記錄並可能追蹤帳戶。記住：FPS 轉賬無法撤回，事前查證永遠比事後補救重要。",
            feedbackEn: "⚠️ Money is lost, but reporting immediately is the only right move. 18222 logs and may trace the account. Remember: FPS transfers can't be reversed — verifying beforehand beats remedying afterward.",
            feedbackZh: "⚠️ 钱已损失，但即时报案是唯一正确动作。18222 会记录并可能追踪账户。记住：FPS 转账无法撤回，事前查证永远比事后补救重要。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 4：本關結束 ──
      {
        id: "l1_s4_done",
        type: "result",
        speaker: "system",
        text: "【第一關完成】你順利通過了租房詐騙情境。\n\n記住三個關鍵：低於市價必有詐、未看房不付款、用 Scameter 查核對方。",
        textEn: "[Level 1 Complete] You've navigated the housing scam scenario.\n\nThree keys: prices below market are scams, never pay before viewing, use Scameter to check the other party.",
        textZh: "【第一关完成】你顺利通过了租房诈骗情境。\n\n记住三个关键：低于市价必有诈、未看房不付款、用 Scameter 核查对方。",
        visual: { type: "safe_result", content: "🏠 第一關：校園租房詐騙\n狀態：已完成 ✅\n\n下一關：假冒政府機構來電" },
        choices: [
          {
            id: "l1_c4_next",
            text: "➡️ 前往第二關：假冒政府機構",
            textEn: "➡️ Level 2: Impersonating Officials",
            textZh: "➡️ 前往第二关：假冒政府机构",
            effects: {},
            nextSceneId: "__next_level__",
            feedbackType: "mid"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // Level 2：假冒香港入境處/公安/稅務局
  // ─────────────────────────────────────────────────────────────
  {
    id: "hk_l2_impersonation",
    index: 2,
    title: "假冒政府機構來電",
    titleEn: "Impersonating Government Authorities",
    titleZh: "假冒政府机构来电",
    icon: "🚨",
    scamType: "假冒入境處/內地公安 + 語音詐騙",
    redFlags: [
      "來電顯示 +852 或自稱「入境處/公安」，但政府部門不會電話要求個人資料",
      "語音/錄音播放「你的簽證/護照有問題」「非法包裹被扣」",
      "要求提供 HKID、護照號碼、銀行帳戶「核實身份」",
      "威脅「不配合將被遞解/逮捕」，製造恐慌",
      "要求轉帳「保釋金/保證金」到「安全帳戶」",
      "香港執法機關絕不會電話要求轉帳或索取 OTP"
    ],
    officialChannels: [
      "致電入境處查詢熱線 2824 6111 核實簽證狀態",
      "致電防騙易 18222 確認是否詐騙",
      "內地公安不會跨境電話執法，可疑時聯絡校方",
      "使用防騙視伏器搜尋來電號碼",
      "掛斷電話，自行從官方渠道查證（不要回撥對方提供的號碼）"
    ],
    scenes: [
      // ── 場景 0：仿真來電 UI（入境處來電——新增）──
      {
        id: "l2_s0_call",
        type: "phone_call_immigration",
        speaker: "scammer",
        pressure: true,
        text: "下午你在圖書館自習，手機突然響起。螢幕顯示來電號碼「+852 2824 6111」——這看起來是入境處官方號碼。你會接聽還是拒絕？",
        textEn: "Studying in the library, your phone suddenly rings. The screen shows '+852 2824 6111' — looks like the official Immigration Department number. Will you answer or decline?",
        textZh: "下午你在图书馆自习，手机突然响起。屏幕显示来电号码「+852 2824 6111」——这看起来是入境处官方号码。你会接听还是拒绝？",
        visual: {
          type: "phone_call_immigration",
          callerId: "+852 2824 6111",
          callerName: "香港入境事務處",
          callerNameEn: "HK Immigration Department",
          callerNameZh: "香港入境事务处",
          initialMessage: "你好，呢度係香港入境事務處，廣東話請按 1，普通話請按 2。",
          initialMessageEn: "Hello, this is the HK Immigration Department. Press 1 for Cantonese, press 2 for Mandarin.",
          initialMessageZh: "你好，这里是香港入境事务处，广东话请按 1，普通话请按 2。",
          cantoneseMessage: "我哋收到一份寄畀你嘅可疑包裹，入面有疑似違禁文件。而家你嘅學生簽證已經被標記，需要你立即提供身份證號碼同埋銀行帳戶核實，否則會取消你嘅簽證。",
          cantoneseMessageEn: "We received a suspicious parcel addressed to you containing suspected illegal documents. Your student visa is now flagged. Please provide your ID number and bank account immediately for verification, otherwise your visa will be cancelled.",
          cantoneseMessageZh: "我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则会取消你的签证。",
          mandarinMessage: "我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则会取消你的签证。",
          mandarinMessageEn: "We received a suspicious parcel addressed to you containing suspected illegal documents. Your student visa is now flagged. Please provide your ID number and bank account immediately for verification, otherwise your visa will be cancelled.",
          mandarinMessageZh: "我们收到一份寄给你的可疑包裹，里面有疑似违禁文件。现在你的学生签证已经被标记，需要你立即提供身份证号码和银行账户核实，否则会取消你的签证。",
          playCantoneseAudio: true,
          playMandarinAudio: true,
          goodNextSceneId: "l2_s1",
          badNextSceneId: "l2_s3_loss",
          goodFeedback: "✅ 你選擇掛斷電話自行查證——這是面對「政府來電」最正確的反應。記住：政府部門不會電話執法，更不會威脅遞解。入境處真實熱線 2824 6111 不會主動來電要求你提供資料。",
          goodFeedbackEn: "✅ You chose to hang up and verify yourself — the correct response to 'government calls'. Remember: government never enforces by phone, never threatens deportation. The real Immigration hotline 2824 6111 won't proactively call asking for your info.",
          goodFeedbackZh: "✅ 你选择挂断电话自行查证——这是面对「政府来电」最正确的反应。记住：政府部门不会电话执法，更不会威胁递解。入境处真实热线 2824 6111 不会主动来电要求你提供资料。",
          badFeedback: "⚠️ 你配合了對方——這是假冒政府詐騙的典型陷阱。香港入境處絕不會用預錄語音威脅，更不會電話索取 HKID 或要求轉帳。號碼可以被偽造（來電顯示不可信）。",
          badFeedbackEn: "⚠️ You complied — a classic government impersonation trap. HK Immigration never uses pre-recorded threats, never requests HKID by phone, never asks for transfers. Caller ID can be spoofed.",
          badFeedbackZh: "⚠️ 你配合了对方——这是假冒政府诈骗的典型陷阱。香港入境处绝不会用预录语音威胁，更不会电话索取 HKID 或要求转账。号码可以被伪造（来电显示不可信）。"
        },
        // 不需要 choices——互動綁定由 setupImmigrationCallInteraction 處理
        choices: []
      },
      // ── 場景 1：可疑來電（語音模擬）──
      {
        id: "l2_s1",
        type: "phone_call",
        speaker: "scammer",
        pressure: true,
        text: "下午你在圖書館自習，手機響起。來電顯示一個 +852 開頭的本地號碼，對方自稱「香港入境處」，語氣嚴肅，說你的學生簽證「有異常」，需要立刻核實身份，否則將被遞解。\n\n點擊播放聽聽這通語音訊息。",
        textEn: "You're studying in the library when your phone rings. The caller ID shows a local +852 number. The caller claims to be from 'Hong Kong Immigration', says your student visa has 'irregularities' and you must verify your identity immediately or face deportation.\n\nPress play to hear the voice message.",
        textZh: "下午你在图书馆自习，手机响起。来电显示一个 +852 开头的本地号码，对方自称「香港入境处」，语气严肃，说你的学生签证「有异常」，需要立刻核实身份，否则将被递解。\n\n点击播放听听这通语音消息。",
        visual: {
          type: "voice_call",
          caller: "香港入境處（自稱）",
          callerEn: "HK Immigration (claimed)",
          callType: "phone",
          duration: "0:38",
          speechText: "你好，這裡是香港入境事務處。系統顯示你的學生簽證存在異常記錄，涉嫌非法居留。請立即按下 1 接通專員核實身份，否則你的簽證將於今日下午五時被註銷，並面臨遞解出境。請配合調查。",
          speechTextEn: "Hello, this is the Hong Kong Immigration Department. Our system shows your student visa has irregularities and may involve illegal overstay. Press 1 now to connect with an officer to verify your identity, otherwise your visa will be revoked at 5 PM today and you will face deportation. Please cooperate.",
          speechTextZh: "你好，这里是香港入境事务处。系统显示你的学生签证存在异常记录，涉嫌非法居留。请立即按下 1 接通专员核实身份，否则你的签证将于今日下午五时被注销，并面临递解出境。请配合调查。"
        },
        choices: [
          {
            id: "l2_c1_listen",
            text: "🎧 聽完語音，決定如何回應",
            textEn: "🎧 Listen, then decide how to respond",
            textZh: "🎧 听完语音，决定如何回应",
            effects: { information: 5 },
            nextSceneId: "l2_s2",
            feedback: "你聽完了語音——但請記住：香港入境處絕不會用預錄語音要求你按鍵核實身份，更不會威脅遞解。",
            feedbackEn: "You listened — but remember: HK Immigration never uses pre-recorded voice to demand keypress verification, and never threatens deportation by phone.",
            feedbackZh: "你听完了语音——但请记住：香港入境处绝不会用预录语音要求你按键核实身份，更不会威胁递解。",
            feedbackType: "mid"
          }
        ]
      },
      // ── 場景 2：自由輸入——你會如何回應 ──
      {
        id: "l2_s2",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "語音結束後，一名「專員」接聽電話，態度強硬：「請立即報上你的香港身份證號碼、護照號碼和現居地址，否則我們無法為你辦理簽證覆核，後果自負。」\n\n你會怎麼回應？",
        textEn: "After the recording, an 'officer' comes on, tone harsh: 'Provide your HKID number, passport number, and current address immediately, otherwise we cannot process your visa review and you bear the consequences.'\n\nHow do you respond?",
        textZh: "语音结束后，一名「专员」接听电话，态度强硬：「请立即报上你的香港身份证号码、护照号码和现居地址，否则我们无法为你办理签证复核，后果自负。」\n\n你会怎么回应？",
        visual: {
          type: "phone_call",
          caller: "「入境處專員」",
          content: "請立即報上 HKID 號碼、護照號碼、現居地址。否則簽證將被註銷，並面臨遞解出境。",
          speechText: "你好，我是入境事務處的高級專員。剛才的語音你也聽到了，你的學生簽證確實有問題。現在我需要你配合調查，請你立即把你的香港身份證號碼、護照號碼、還有你現在的居住地址都報上來。我們要核實你的身份信息。如果你不配合的話，我們就只能按照程序註銷你的簽證，到時候你就會被遞解出境，後果自負。我現在給你三十秒時間，趕快把號碼都報上來。",
          speechTextEn: "Hello, I'm a senior officer from the Immigration Department. You heard the recording — your student visa does have issues. Now I need you to cooperate with the investigation. Please immediately provide your HKID number, passport number, and your current residential address. We need to verify your identity. If you don't cooperate, we'll have to revoke your visa according to procedure, and you'll be deported. You bear the consequences. I'm giving you 30 seconds. Hurry up and give me the numbers.",
          speechTextZh: "你好，我是入境事务处的高级专员。刚才的语音你也听到了，你的学生签证确实有问题。现在我需要你配合调查，请你立即把你的香港身份证号码、护照号码、还有你现在的居住地址都报上来。我们要核实你的身份信息。如果你不配合的话，我们就只能按照程序注销你的签证，到时候你就会被递解出境，后果自负。我现在给你三十秒时间，赶快把号码都报上来。"
        },
        inputConfig: {
          placeholder: "輸入你的回應…（例如：我先查證 / 我的身份證號是…）",
          placeholderEn: "Type your response… (e.g. Let me verify first / My ID number is…)",
          placeholderZh: "输入你的回应…（例如：我先查证 / 我的身份证号是…）",
          goodNextSceneId: "l2_s3_safe",
          badNextSceneId: "l2_s3_loss",
          neutralNextSceneId: "l2_s2b_threat",
          maxNeutralAttempts: 2,
          goodFeedback: "✅ 你提到查證/核實/官方——這是面對「政府來電」最正確的反應。掛斷電話，自己打官方熱線查證。",
          goodFeedbackEn: "✅ You mentioned verifying/official — the right response to 'government calls'. Hang up and call the official hotline yourself.",
          goodFeedbackZh: "✅ 你提到查证/核实/官方——这是面对「政府来电」最正确的反应。挂断电话，自己打官方热线查证。",
          badFeedback: "⚠️ 你提到身份證/護照/密碼——政府部門絕不會電話索取這些資料。一旦提供，後果嚴重。",
          badFeedbackEn: "⚠️ You mentioned ID/passport/password — government departments never request these by phone. Providing them has serious consequences.",
          badFeedbackZh: "⚠️ 你提到身份证/护照/密码——政府部门绝不会电话索取这些资料。一旦提供，后果严重。",
          neutralFeedback: "🤔 對方見你沒明確配合，開始升級威脅：「你再不配合，我們立刻發出通緝令！」再想想你會怎麼做。",
          neutralFeedbackEn: "🤔 Seeing you not comply, the scammer escalates: 'If you don't cooperate, we'll issue a warrant now!' Think about what to do.",
          neutralFeedbackZh: "🤔 对方见你没明确配合，开始升级威胁：「你再不配合，我们立刻发出通缉令！」再想想你会怎么做。"
        }
      },
      // ── 場景 2b：升級威脅（第二次機會）──
      {
        id: "l2_s2b_threat",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "「專員」語氣突然變冷：「我現在正式通知你，你的案件已移交公安部門。再不配合，今天下午就會有人來帶走你。最後一次機會——把你的銀行帳號和身份證號報上來，我們幫你『凍結資金保護』。」\n\n你會怎麼回應？",
        textEn: "The 'officer' turns cold: 'I'm formally notifying you — your case is being transferred to Public Security. If you don't cooperate, someone will come for you this afternoon. Last chance — give your bank account and ID number so we can 'freeze your funds for protection'.'\n\nHow do you respond?",
        textZh: "「专员」语气突然变冷：「我现在正式通知你，你的案件已移交公安部门。再不配合，今天下午就会有人来带走你。最后一次机会——把你的银行账号和身份证号报上来，我们帮你『冻结资金保护』。」\n\n你会怎么回应？",
        visual: {
          type: "phone_call",
          caller: "「入境處專員」",
          content: "案件已移交公安。再不配合，今天下午就有人來帶走你。把銀行帳號和 HKID 報上來，我們幫你「凍結資金保護」。",
          speechText: "我跟你說，你別敬酒不吃吃罰酒。你的案件現在已經正式移交公安部門了。我現在正式通知你，如果你再不配合，今天下午就會有公安上門來帶走你，到時候你想後悔都來不及。我最後給你一次機會，把你的銀行帳號和身份證號都報上來，我們幫你做資金凍結保護，這樣你的錢就不會被扣押。聽明白了嗎？趕緊的，時間不多了！",
          speechTextEn: "I'm telling you, don't make this harder on yourself. Your case has now been officially transferred to the Public Security Bureau. I'm formally notifying you — if you don't cooperate, public security officers will come to your door this afternoon to take you away, and by then it'll be too late to regret. I'm giving you one last chance. Give me your bank account number and ID number, and we'll help you with fund freeze protection so your money won't be seized. Do you understand? Hurry up, time is running out!",
          speechTextZh: "我跟你说，你别敬酒不吃吃罚酒。你的案件现在已经正式移交公安部门了。我现在正式通知你，如果你再不配合，今天下午就会有公安上门来带走你，到时候你想后悔都来不及。我最后给你一次机会，把你的银行账号和身份证号都报上来，我们帮你做资金冻结保护，这样你的钱就不会被扣押。听明白了吗？赶紧的，时间不多了！"
        },
        inputConfig: {
          placeholder: "再次輸入你的回應…（提示：政府不會電話執法）",
          placeholderEn: "Type your response again… (hint: government doesn't enforce by phone)",
          placeholderZh: "再次输入你的回应…（提示：政府不会电话执法）",
          goodNextSceneId: "l2_s3_safe",
          badNextSceneId: "l2_s3_loss",
          neutralNextSceneId: "l2_s3_safe",
          maxNeutralAttempts: 0,
          goodFeedback: "✅ 你堅持查證——這正是反詐的關鍵。沒有任何政府部門會電話要求你轉帳或交出 HKID。",
          goodFeedbackEn: "✅ You insisted on verifying — the key to anti-scam. No government department ever asks for transfers or HKID by phone.",
          goodFeedbackZh: "✅ 你坚持查证——这正是反诈的关键。没有任何政府部门会电话要求你转账或交出 HKID。",
          badFeedback: "⚠️ 你仍傾向提供資料——「凍結資金保護」是經典詐騙話術。記住：你的帳戶只有你自己能保護。",
          badFeedbackEn: "⚠️ You still leaned toward providing info — 'freezing funds for protection' is a classic scam line. Only you can protect your account.",
          badFeedbackZh: "⚠️ 你仍倾向提供资料——「冻结资金保护」是经典诈骗话术。记住：你的账户只有你自己能保护。",
          neutralFeedback: "🤔 你還在猶豫——這次我們幫你決定：掛斷電話，自己查證。",
          neutralFeedbackEn: "🤔 You're still hesitating — let's decide for you: hang up and verify yourself.",
          neutralFeedbackZh: "🤔 你还在犹豫——这次我们帮你决定：挂断电话，自己查证。"
        }
      },
      // ── 場景 3A：安全路徑——掛斷查證 ──
      {
        id: "l2_s3_safe",
        type: "result",
        speaker: "official",
        text: "你掛斷電話，自行撥打入境處官方熱線 2824 6111。職員確認：你的簽證完全正常，入境處從未聯絡你。你接著把來電號碼輸入防騙視伏器——已被標記為「假冒政府詐騙」。",
        textEn: "You hang up and call Immigration's official hotline 2824 6111 yourself. The officer confirms your visa is fine — Immigration never contacted you. You enter the number in Scameter — flagged as 'Government Impersonation Scam'.",
        textZh: "你挂断电话，自行拨打入境处官方热线 2824 6111。职员确认：你的签证完全正常，入境处从未联络你。你接着把来电号码输入防骗视伏器——已被标记为「假冒政府诈骗」。",
        visual: {
          type: "safe_result",
          content: "✅ 查證結果\n\n來電 +852 3456 7890\n入境處熱線 2824 6111 確認：簽證正常\n防騙視伏器：🔴 假冒政府詐騙（已被舉報 47 次）\n\n建議：\n• 封鎖來電\n• 致電 18222 報案\n• 提醒同學這類騙局"
        },
        choices: [
          {
            id: "l2_c3_block",
            text: "🚫 封鎖並向 18222 舉報",
            textEn: "🚫 Block and report to 18222",
            textZh: "🚫 拉黑并向 18222 举报",
            effects: { alertness: 25, information: 20, riskScore: -20 },
            nextSceneId: "l2_s4_done",
            feedback: "✅ 你沒有被「遞解」威脅嚇倒，堅持自己查證——這是面對假冒政府詐騙的黃金法則。政府部門從不電話執法。",
            feedbackEn: "✅ You weren't scared by the 'deportation' threat and verified yourself — the golden rule for government impersonation scams. Government never enforces by phone.",
            feedbackZh: "✅ 你没有被「递解」威胁吓倒，坚持自己查证——这是面对假冒政府诈骗的黄金法则。政府部门从不电话执法。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 3B：危險路徑——洩露資料 ──
      {
        id: "l2_s3_loss",
        type: "result",
        speaker: "system",
        text: "你在壓力下報上了 HKID 號碼、護照號碼和地址。對方說「資金也需要保護」，要你立刻轉帳到「安全帳戶」。你這才意識到不對——但資料已經給出去了。",
        textEn: "Under pressure, you give your HKID, passport number, and address. The caller says your 'funds need protection too' and asks you to transfer to a 'safe account'. You finally realize — but the data is already given.",
        textZh: "你在压力下报上了 HKID 号码、护照号码和地址。对方说「资金也需要保护」，要你立刻转账到「安全账户」。你这才意识到不对——但资料已经给出去了。",
        visual: {
          type: "warning_page",
          content: "⚠️ 已洩露資料\n\n• 香港身份證號碼\n• 護照號碼\n• 現居地址\n\n對方正要求：轉帳到「安全帳戶」\n\n⚠️ 這是假冒政府詐騙的經典話術\n「安全帳戶」不存在——只有騙子的帳戶"
        },
        choices: [
          {
            id: "l2_c3_report",
            text: "📞 立刻掛斷，致電 18222 和銀行",
            textEn: "📞 Hang up, call 18222 and the bank",
            textZh: "📞 立刻挂断，致电 18222 和银行",
            effects: { money: -10, riskScore: 35, information: 15, alertness: 10 },
            nextSceneId: "l2_s4_done",
            feedback: "⚠️ 資料已洩露，但立刻掛斷並報案是唯一正確動作。聯絡銀行監控帳戶，並考慮更換受影響的證件。記住：「安全帳戶」永遠是騙局。",
            feedbackEn: "⚠️ Data is leaked, but hanging up and reporting immediately is the only right move. Contact the bank to monitor accounts and consider replacing affected IDs. Remember: 'safe accounts' are always scams.",
            feedbackZh: "⚠️ 资料已泄露，但立刻挂断并报案是唯一正确动作。联络银行监控账户，并考虑更换受影响的证件。记住：「安全账户」永远是骗局。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 4：本關結束 ──
      {
        id: "l2_s4_done",
        type: "result",
        speaker: "system",
        text: "【第二關完成】你應對了假冒政府來電詐騙。\n\n記住：政府部門不會電話索取 HKID、不會威脅遞解、不會要求轉帳到「安全帳戶」。任何政府來電，掛斷後自己查。",
        textEn: "[Level 2 Complete] You handled the government impersonation call.\n\nRemember: government never requests HKID by phone, never threatens deportation, never asks for transfers to 'safe accounts'. For any government call — hang up and verify yourself.",
        textZh: "【第二关完成】你应对了假冒政府来电诈骗。\n\n记住：政府部门不会电话索取 HKID、不会威胁递解、不会要求转账到「安全账户」。任何政府来电，挂断后自己查。",
        visual: { type: "safe_result", content: "🚨 第二關：假冒政府來電\n狀態：已完成 ✅\n\n下一關：釣魚短訊與銀行詐騙" },
        choices: [
          {
            id: "l2_c4_next",
            text: "➡️ 前往第三關：釣魚短訊與銀行詐騙",
            textEn: "➡️ Level 3: Phishing SMS & Bank Fraud",
            textZh: "➡️ 前往第三关：钓鱼短信与银行诈骗",
            effects: {},
            nextSceneId: "__next_level__",
            feedbackType: "mid"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // Level 3：釣魚短訊與銀行詐騙
  // ─────────────────────────────────────────────────────────────
  {
    id: "hk_l3_phishing",
    index: 3,
    title: "釣魚短訊與銀行詐騙",
    titleEn: "Phishing SMS & Banking Fraud",
    titleZh: "钓鱼短信与银行诈骗",
    icon: "💳",
    scamType: "假冒 HSBC/恒生短訊 + 釣魚網站 + OTP 詐騙",
    redFlags: [
      "短訊連結域名不是官方（hk-police-verify-auth.com 不是 .gov.hk）",
      "聲稱「帳戶將被凍結」，製造 30 分鐘限時壓力",
      "釣魚網站要求輸入網銀密碼 + OTP 一次性密碼",
      "「銀行職員」來電跟進，但無法提供可核實工號",
      "對方知道你的帳戶尾號——資料可能已從其他平台洩露"
    ],
    officialChannels: [
      "打開 HSBC/恒生官方 App 直接查帳戶（不要點短訊連結）",
      "致電銀行卡背面印的客服電話（HSBC: 2233 3000）",
      "手動輸入官方網址：www.hsbc.com.hk / www.hangseng.com",
      "致電防騙易 18222 查詢可疑短訊",
      "使用防騙視伏器搜尋可疑連結"
    ],
    scenes: [
      // ── 場景 0：手機鎖屏收到可疑簡訊（新增——sms_lockscreen）──
      {
        id: "l3_s0_sms",
        type: "sms_lockscreen",
        speaker: "system",
        text: "你下課回到宿舍，手機放在桌上充電。螢幕突然亮起——一條來自「香港郵政」的簡訊。你看了一眼，內容提到你有包裹待領取，並附了一個連結。",
        textEn: "Back at the dorm, your phone is charging on the desk. The screen suddenly lights up — an SMS from 'HK Post'. You glance at it: a parcel is waiting for you, with a link to claim.",
        textZh: "你下课回到宿舍，手机放在桌上充电。屏幕突然亮起——一条来自「香港邮政」的短信。你看了一眼，内容提到你有包裹待领取，并附了一个链接。",
        visual: {
          type: "sms_lockscreen",
          time: "14:32",
          signal: 4,
          battery: 75,
          sender: "香港郵政",
          senderEn: "HK Post",
          senderZh: "香港邮政",
          message: "【香港郵政】您有一個包裹待領取，請於 24 小時內確認領取資訊並補付 $32 手續費，否則包裹將被退回：",
          messageEn: "[HK Post] You have a parcel pending. Please confirm pickup info and pay $32 fee within 24 hours, or the parcel will be returned:",
          messageZh: "【香港邮政】您有一个包裹待领取，请于 24 小时内确认领取信息并补付 $32 手续费，否则包裹将被退回：",
          link: "https://hk-post-track.com/claim?id=HKP8234",
          linkText: "https://hk-post-track.com/claim?id=HKP8234",
          confirmText: "你真的要打開這個連結嗎？（該網站可能不安全）",
          phishingLogo: "📮",
          phishingTitle: "香港郵政 — 包裹領取確認",
          goodNextSceneId: "l3_s1",
          badNextSceneId: "l3_s2_fake",
          goodFeedback: "✅ 正確！陌生連結不要點。香港郵政官方域名是 hongkongpost.hk，不是 hk-post-track.com。任何要求你輸入卡片資料的「包裹領取」網站都是詐騙。",
          goodFeedbackEn: "✅ Correct! Never click unknown links. HK Post's official domain is hongkongpost.hk, not hk-post-track.com. Any 'parcel claim' site asking for card details is a scam.",
          goodFeedbackZh: "✅ 正确！陌生链接不要点。香港邮政官方域名是 hongkongpost.hk，不是 hk-post-track.com。任何要求你输入卡片资料的「包裹领取」网站都是诈骗。",
          badFeedback: "⚠️ 你點擊了可疑連結並進入釣魚網站——這是釣魚簡訊詐騙的經典手法。陌生連結不要點，香港郵政不會用短網址要求你輸入卡片資料。",
          badFeedbackEn: "⚠️ You clicked a suspicious link and entered a phishing site — a classic SMS phishing tactic. Never click unknown links; HK Post never asks for card details via short URLs.",
          badFeedbackZh: "⚠️ 你点击了可疑链接并进入钓鱼网站——这是钓鱼短信诈骗的经典手法。陌生链接不要点，香港邮政不会用短网址要求你输入卡片资料。"
        },
        // 互動由 setupSmsLockscreenInteraction 處理，不需要 choices
        choices: []
      },
      // ── 場景 1：收到銀行短訊（釣魚卡片）──
      {
        id: "l3_s1",
        type: "message",
        speaker: "system",
        text: "你下課回到宿舍，手機震了一下——看起來是 HSBC 發的短訊。你最近確實有刷過幾次卡，心裡稍微緊了一下。短訊說帳戶「30 分鐘內將被凍結」。",
        textEn: "Back at the dorm, your phone buzzes — looks like an HSBC SMS. You've used your card a few times recently, so you feel a twinge of concern. The SMS says your account 'will be frozen in 30 minutes'.",
        textZh: "你下课回到宿舍，手机震了一下——看起来是 HSBC 发的短信。你最近确实有刷过几次卡，心里稍微紧了一下。短信说账户「30 分钟内将被冻结」。",
        visual: {
          type: "phishing_card",
          url: "https://hsbc-hk-verify.account-secure.net/login",
          realUrl: "真正 HSBC 官網：www.hsbc.com.hk",
          pageTitle: "HSBC Hong Kong — Account Verification",
          pageIcon: "🏦",
          redFlags: [
            { icon: "🚫", text: "域名 account-secure.net 不是 hsbc.com.hk" },
            { icon: "⏰", text: "「30 分鐘內凍結」——經典壓力話術" },
            { icon: "🔗", text: "短訊連結從官方銀行 App 外開啟" }
          ]
        },
        choices: [
          {
            id: "l3_c1_click",
            text: "📲 30 分鐘很急，先點連結看看",
            textEn: "📲 30 mins is urgent, click the link",
            textZh: "📲 30 分钟很急，先点链接看看",
            effects: { riskScore: 25, information: -10 },
            nextSceneId: "l3_s2_fake",
            feedback: "⚠️ 仔細看網址——「account-secure.net」根本不是 HSBC 的域名。HSBC 香港官方是 hsbc.com.hk。",
            feedbackEn: "⚠️ Look at the URL — 'account-secure.net' is not HSBC's domain. HSBC HK is hsbc.com.hk.",
            feedbackZh: "⚠️ 仔细看网址——「account-secure.net」根本不是 HSBC 的域名。HSBC 香港官方是 hsbc.com.hk。",
            feedbackType: "bad"
          },
          {
            id: "l3_c1_app",
            text: "📱 不點連結，直接打開 HSBC App",
            textEn: "📱 Don't click, open HSBC App directly",
            textZh: "📱 不点链接，直接打开 HSBC App",
            effects: { information: 25, alertness: 15, riskScore: -10 },
            nextSceneId: "l3_s2_safe",
            feedback: "✅ 正確！任何涉及帳戶的事，永遠從官方 App 入手，不要點短訊連結。",
            feedbackEn: "✅ Correct! For anything account-related, always start from the official app — never click SMS links.",
            feedbackZh: "✅ 正确！任何涉及账户的事，永远从官方 App 入手，不要点短信链接。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 2A：點了連結——假登入頁（釣魚卡片）──
      {
        id: "l3_s2_fake",
        type: "webpage",
        speaker: "scammer",
        text: "頁面打開了，設計得非常像 HSBC 官網——紅白配色、獅子標誌。你幾乎要輸入密碼了，但突然瞄到網址欄。頁面還有倒計時「Session expires in 18:32」。",
        textEn: "The page opens — it looks just like HSBC's site: red and white, lion logo. You almost enter your password, but glance at the URL bar. There's a countdown: 'Session expires in 18:32'.",
        textZh: "页面打开了，设计得非常像 HSBC 官网——红白配色、狮子标志。你几乎要输入密码了，但突然瞄到网址栏。页面还有倒计时「Session expires in 18:32」。",
        visual: {
          type: "phishing_card",
          url: "https://hsbc-hk-verify.account-secure.net/login",
          realUrl: "真正 HSBC：www.hsbc.com.hk",
          pageTitle: "Online Banking — Verify Your Identity",
          pageIcon: "🏦",
          redFlags: [
            { icon: "🚫", text: "域名 account-secure.net（非 hsbc.com.hk）" },
            { icon: "🔢", text: "要求 Username + Password + OTP（三件套）" },
            { icon: "⏰", text: "倒計時製造緊迫感" },
            { icon: "🔐", text: "瀏覽器無綠色鎖頭（SSL 無效）" }
          ]
        },
        choices: [
          {
            id: "l3_c2_close",
            text: "🔍 等等——域名是 account-secure.net！立刻關掉！",
            textEn: "🔍 Wait — domain is account-secure.net! Close now!",
            textZh: "🔍 等等——域名是 account-secure.net！立刻关掉！",
            effects: { alertness: 30, information: 20, riskScore: -20 },
            nextSceneId: "l3_s2_safe",
            feedback: "✅ 你在關鍵一刻識破了假網站！網址域名是防釣魚最有效的工具。",
            feedbackEn: "✅ You spotted the fake site at the critical moment! URL domain is the most effective anti-phishing tool.",
            feedbackZh: "✅ 你在关键时刻识破了假网站！网址域名是防钓鱼最有效的工具。",
            feedbackType: "good"
          },
          {
            id: "l3_c2_enter",
            text: "🔢 帳號密碼先填，OTP 等短訊來了再輸",
            textEn: "🔢 Enter username/password first, OTP later",
            textZh: "🔢 账号密码先填，OTP 等短信来了再输",
            effects: { riskScore: 35, information: -15 },
            nextSceneId: "l3_s3_otp_input",
            feedback: "⚠️ 你已填入帳號密碼，騙子觸發了真正的 OTP 短訊到你手機——現在他們在等你把驗證碼也交出去。",
            feedbackEn: "⚠️ You've entered your credentials. The scammers triggered a real OTP SMS to your phone — now they want you to hand over the code too.",
            feedbackZh: "⚠️ 你已填入账号密码，骗子触发了真正的 OTP 短信到你手机——现在他们在等你把验证码也交出去。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 2B：安全路徑——App 查核 ──
      {
        id: "l3_s2_safe",
        type: "result",
        speaker: "official",
        text: "你打開 HSBC 官方 App——帳戶完全正常，沒有任何異常登入或凍結通知。你把短訊號碼輸入防騙視伏器，確認是釣魚短訊。",
        textEn: "You open the HSBC official app — account is fine, no unusual logins or freeze notices. You enter the SMS sender in Scameter — confirmed phishing.",
        textZh: "你打开 HSBC 官方 App——账户完全正常，没有任何异常登入或冻结通知。你把短信号码输入防骗视伏器，确认是钓鱼短信。",
        visual: {
          type: "safe_result",
          content: "✅ HSBC App 查核\n\n帳戶狀態：正常 ✅\n最近登入：僅你本人\n防騙視伏器：🔴 釣魚短訊（已被舉報 89 次）\n\n建議：刪除短訊、封鎖發件者、向 18222 報案"
        },
        choices: [
          {
            id: "l3_c2s_report",
            text: "🚫 刪除短訊並舉報",
            textEn: "🚫 Delete SMS and report",
            textZh: "🚫 删除短信并举报",
            effects: { alertness: 15, information: 15, riskScore: -10 },
            nextSceneId: "l3_s4_done",
            feedback: "✅ 你沒有被「30 分鐘凍結」嚇倒，從官方 App 查證——這是應對銀行短訊的標準動作。",
            feedbackEn: "✅ You weren't scared by 'freeze in 30 mins' and verified via the official app — the standard response to bank SMS.",
            feedbackZh: "✅ 你没有被「30 分钟冻结」吓倒，从官方 App 查证——这是应对银行短信的标准动作。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 3：假職員來電要求 OTP（自由輸入）──
      {
        id: "l3_s3_otp_input",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "你的手機收到真正的 OTP 短訊（因為騙子正在用你的帳密嘗試登入）。同時一名「HSBC 職員」來電：「先生/小姐，系統顯示你正在登入，為了確認是本人，請把收到的 6 位數 OTP 念給我。」\n\n你會怎麼回應？",
        textEn: "You receive a real OTP SMS (because scammers are trying to log in with your credentials). Meanwhile a 'HSBC staff' calls: 'Sir/Madam, our system shows you're logging in. To confirm it's you, please read out the 6-digit OTP you just received.'\n\nHow do you respond?",
        textZh: "你的手机收到真正的 OTP 短信（因为骗子正在用你的账号密码尝试登入）。同时一名「HSBC 职员」来电：「先生/小姐，系统显示你正在登入，为了确认是本人，请把收到的 6 位数 OTP 念给我。」\n\n你会怎么回应？",
        visual: {
          type: "phone_call",
          caller: "「HSBC 職員」",
          content: "請把收到的 6 位數 OTP 念給我，以確認是本人登入。否則帳戶將被凍結。",
          speechText: "先生您好，我是匯豐銀行客戶服務中心的職員。系統剛剛監測到您的賬戶有一筆異常登錄，顯示是從境外 IP 發起的。為了確保是您本人操作，麻煩您把剛才收到的六位數一次性密碼，也就是 OTP，念給我確認一下。如果您不配合核實的話，系統會在三十分鐘內凍結您的賬戶，到時候所有轉賬和提款都無法進行。請您抓緊時間配合一下，這都是為了保護您的財產安全。",
          speechTextEn: "Hello sir, this is HSBC customer service. Our system just detected an unusual login to your account from an overseas IP. To confirm it's really you, please read out the 6-digit OTP you just received. If you don't cooperate, your account will be frozen in 30 minutes and all transfers and withdrawals will be blocked. Please hurry and cooperate — this is all to protect your financial security.",
          speechTextZh: "先生您好，我是汇丰银行客户服务中心的职员。系统刚刚监测到您的账户有一笔异常登录，显示是从境外 IP 发起的。为了确保是您本人操作，麻烦您把刚才收到的六位数一次性密码，也就是 OTP，念给我确认一下。如果您不配合核实的话，系统会在三十分钟内冻结您的账户，到时候所有转账和提款都无法进行。请您抓紧时间配合一下，这都是为了保护您的财产安全。"
        },
        inputConfig: {
          placeholder: "輸入你的回應…（例如：我報警 / OTP 是 123456）",
          placeholderEn: "Type your response… (e.g. I'll call police / OTP is 123456)",
          placeholderZh: "输入你的回应…（例如：我报警 / OTP 是 123456）",
          goodNextSceneId: "l3_s4_done",
          badNextSceneId: "l3_s3_loss",
          neutralNextSceneId: "l3_s3_pressure",
          maxNeutralAttempts: 2,
          goodFeedback: "✅ 你拒絕交出 OTP——銀行職員絕對不會電話索取 OTP。你的堅持守住了帳戶。",
          goodFeedbackEn: "✅ You refused to give the OTP — bank staff never ask for OTP by phone. Your resolve protected your account.",
          goodFeedbackZh: "✅ 你拒绝交出 OTP——银行职员绝对不会电话索取 OTP。你的坚持守住了账户。",
          badFeedback: "⚠️ 你提到 OTP/驗證碼/密碼——一旦交出，騙子立刻完成轉帳。OTP 是最後一道防線，絕不外洩。",
          badFeedbackEn: "⚠️ You mentioned OTP/code/password — once given, scammers transfer immediately. OTP is the last line of defense, never share it.",
          badFeedbackZh: "⚠️ 你提到 OTP/验证码/密码——一旦交出，骗子立刻完成转账。OTP 是最后一道防线，绝不外泄。",
          neutralFeedback: "🤔 「職員」見你沒交出 OTP，再施壓：「你不配合，款項會被凍結！」再想想你會怎麼做。",
          neutralFeedbackEn: "🤔 Seeing you won't give the OTP, the 'staff' pushes: 'If you don't cooperate, your funds will be frozen!' Think again.",
          neutralFeedbackZh: "🤔 「职员」见你没交出 OTP，再施压：「你不配合，款项会被冻结！」再想想你会怎么做。"
        }
      },
      // ── 場景 3b：二次施壓 ──
      {
        id: "l3_s3_pressure",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "「職員」語氣轉急：「這是最後提醒！再不念 OTP，你的帳戶款項會立刻被凍結，無法解凍！這是為了保護你！」\n\n你會怎麼回應？",
        textEn: "The 'staff' turns urgent: 'Final reminder! If you don't read the OTP, your funds will be frozen immediately and cannot be unfrozen! This is to protect you!'\n\nHow do you respond?",
        textZh: "「职员」语气转急：「这是最后提醒！再不念 OTP，你的账户款项会立刻被冻结，无法解冻！这是为了保护你！」\n\n你会怎么回应？",
        visual: {
          type: "phone_call",
          caller: "「HSBC 職員」",
          content: "再不念 OTP，帳戶款項會立刻被凍結！這是為了保護你！",
          speechText: "先生，我再跟您說最後一遍，這是最後的提醒了！您要是再不把 OTP 念出來，您賬戶裡的所有款項都會立刻被凍結，而且是永久性的，到時候誰都解凍不了！我跟您說這些都是為了您好，都是為了保護您的財產安全！您趕緊的，把六位數 OTP 念給我，念完就沒事了，不然後果自負！",
          speechTextEn: "Sir, I'm telling you one last time — this is your final reminder! If you don't read out the OTP right now, all funds in your account will be frozen immediately, permanently, and no one can unfreeze it! I'm telling you all this for your own good, to protect your financial security! Hurry up, just read me the 6-digit OTP and it'll all be over, otherwise you'll bear the consequences!",
          speechTextZh: "先生，我再跟您说最后一遍，这是最后的提醒了！您要是再不把 OTP 念出来，您账户里的所有款项都会立刻被冻结，而且是永久性的，到时候谁都解冻不了！我跟您说这些都是为了您好，都是为了保护您的财产安全！您赶紧的，把六位数 OTP 念给我，念完就没事了，不然后果自负！"
        },
        inputConfig: {
          placeholder: "再次輸入你的回應…（提示：OTP 絕不外洩）",
          placeholderEn: "Type your response again… (hint: never share OTP)",
          placeholderZh: "再次输入你的回应…（提示：OTP 绝不外泄）",
          goodNextSceneId: "l3_s4_done",
          badNextSceneId: "l3_s3_loss",
          neutralNextSceneId: "l3_s4_done",
          maxNeutralAttempts: 0,
          goodFeedback: "✅ 你堅持保護 OTP——這是銀行帳戶最後一道防線。",
          goodFeedbackEn: "✅ You protected your OTP — the last line of defense for your bank account.",
          goodFeedbackZh: "✅ 你坚持保护 OTP——这是银行账户最后一道防线。",
          badFeedback: "⚠️ 你交出 OTP——騙子立刻完成大額轉帳。記住：銀行永遠不會電話索取 OTP。",
          badFeedbackEn: "⚠️ You gave the OTP — scammers transfer a large sum immediately. Remember: banks never ask for OTP by phone.",
          badFeedbackZh: "⚠️ 你交出 OTP——骗子立刻完成大额转账。记住：银行永远不会电话索取 OTP。",
          neutralFeedback: "🤔 你還在猶豫——這次我們幫你決定：掛斷，打銀行官方電話。",
          neutralFeedbackEn: "🤔 Still hesitating — let's decide: hang up and call the bank's official number.",
          neutralFeedbackZh: "🤔 你还在犹豫——这次我们帮你决定：挂断，打银行官方电话。"
        }
      },
      // ── 場景 3c：危險路徑——被盜 ──
      {
        id: "l3_s3_loss",
        type: "result",
        speaker: "system",
        text: "你念出 OTP。幾秒後，你的 HSBC App 彈出通知：「轉出 HK$48,000 至未知帳戶」。你想登入取消——密碼已被改。你這才意識到，從一開始那條短訊就是陷阱。",
        textEn: "You read out the OTP. Seconds later, your HSBC app notifies you: 'Transferred HK$48,000 to unknown account'. You try to log in to cancel — password already changed. You realize the SMS was a trap from the start.",
        textZh: "你念出 OTP。几秒后，你的 HSBC App 弹出通知：「转出 HK$48,000 至未知账户」。你想登入取消——密码已被改。你这才意识到，从一开始那条短信就是陷阱。",
        visual: {
          type: "warning_page",
          content: "⚠️ 帳戶已被盜\n\nHK$48,000 已轉出至未知帳戶\n密碼已被更改\n登入 IP：境外\n\n⚠️ OTP = 帳戶鑰匙\n交出 OTP = 交出帳戶"
        },
        choices: [
          {
            id: "l3_c3l_report",
            text: "📞 立刻致電 HSBC 2233 3000 凍結",
            textEn: "📞 Call HSBC 2233 3000 to freeze now",
            textZh: "📞 立刻致电 HSBC 2233 3000 冻结",
            effects: { money: -50, riskScore: 40, information: 15 },
            nextSceneId: "l3_s4_done",
            feedback: "⚠️ 損失已造成，但立刻凍結帳戶可防止進一步損失。記住：銀行永遠不會電話索取 OTP，任何索取 OTP 的「職員」都是騙子。",
            feedbackEn: "⚠️ Loss is done, but freezing immediately prevents further damage. Remember: banks never ask for OTP by phone — any 'staff' requesting OTP is a scammer.",
            feedbackZh: "⚠️ 损失已造成，但立刻冻结账户可防止进一步损失。记住：银行永远不会电话索取 OTP，任何索取 OTP 的「职员」都是骗子。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 4：本關結束 ──
      {
        id: "l3_s4_done",
        type: "result",
        speaker: "system",
        text: "【第三關完成】你應對了釣魚短訊與銀行詐騙。\n\n記住三件事：不點短訊連結、從官方 App 查證、OTP 絕不外洩。HSBC 客服 2233 3000、防騙易 18222。",
        textEn: "[Level 3 Complete] You handled phishing SMS and bank fraud.\n\nRemember three things: don't click SMS links, verify via official app, never share OTP. HSBC hotline 2233 3000, Anti-Deception 18222.",
        textZh: "【第三关完成】你应对了钓鱼短信与银行诈骗。\n\n记住三件事：不点短信链接、从官方 App 查证、OTP 绝不外泄。HSBC 客服 2233 3000、防骗易 18222。",
        visual: { type: "safe_result", content: "💳 第三關：釣魚短訊與銀行詐騙\n狀態：已完成 ✅\n\n下一關：高薪刷單與假兼職騙局" },
        choices: [
          {
            id: "l3_c4_next",
            text: "➡️ 前往第四關：刷單兼職騙局",
            textEn: "➡️ Level 4: Click-Farming Job Scam",
            textZh: "➡️ 前往第四关：刷单兼职骗局",
            effects: {},
            nextSceneId: "__next_level__",
            feedbackType: "mid"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // Level 4：高薪刷單與假兼職騙局
  // ─────────────────────────────────────────────────────────────
  {
    id: "hk_l4_clickfarm",
    index: 4,
    title: "高薪刷單與假兼職騙局",
    titleEn: "Part-Time Job / Click Farming Scam",
    titleZh: "高薪刷单与假兼职骗局",
    icon: "💼",
    scamType: "WhatsApp 刷單 + 預付保證金 + 任務解鎖詐騙",
    redFlags: [
      "WhatsApp 陌生訊息：「輕鬆日賺 $800，時間自由」",
      "先給小額任務（點讚/關注）並真實付款，建立信任",
      "要求「充值/保證金」才能接高佣金的進階任務",
      "任務系統顯示「連續訂單」，需不斷加碼才能提現",
      "客服聲稱「操作錯誤需再充值修復」——無限循環"
    ],
    officialChannels: [
      "正規兼職平台：JobsDB、CTgoodjobs、校方 Career Center",
      "任何要求先付款的兼職都是詐騙",
      "致電防騙易 18222 查詢可疑招聘",
      "使用防騙視伏器搜尋招聘方帳號/網站",
      "向校方學生事務處求證兼職真偽"
    ],
    scenes: [
      // ── 場景 1：WhatsApp 收到招聘 ──
      {
        id: "l4_s1",
        type: "message",
        speaker: "scammer",
        text: "你收到一條 WhatsApp 陌生訊息：「你好！我們是電商推廣平台，招募兼職刷單員。點讚關注即可，日賺 $500-$1000，時間自由，學生優先。」對方發來一個「導師」的聯絡方式。",
        textEn: "You get a WhatsApp message from an unknown number: 'Hi! We're an e-commerce promo platform recruiting part-time click-farm workers. Just like and follow, earn $500-$1000/day, flexible hours, students preferred.' They send a 'mentor' contact.",
        textZh: "你收到一条 WhatsApp 陌生短信：「你好！我们是电商推广平台，招募兼职刷单员。点赞关注即可，日赚 $500-$1000，时间自由，学生优先。」对方发来一个「导师」的联络方式。",
        visual: {
          type: "chat",
          app: "WhatsApp",
          appIcon: "💬",
          messages: [
            { type: "incoming", name: "+852 9876 5432", text: "你好！我們是電商推廣平台，招募兼職刷單員 📱" },
            { type: "incoming", name: "+852 9876 5432", text: "點讚+關注即可，日賺 $500-$1000，時間自由，學生優先 🎓" },
            { type: "incoming", name: "+852 9876 5432", text: "加導師微信了解更多：task-master-886" }
          ]
        },
        choices: [
          {
            id: "l4_c1_try",
            text: "💰 反正免費，試試看",
            textEn: "💰 It's free, let me try",
            textZh: "💰 反正免费，试试看",
            effects: { riskScore: 15, information: -5 },
            nextSceneId: "l4_s2_small_task",
            feedback: "⚠️ 「免費試試」正是騙局入口。他們會先給你小額真實回報，建立信任後再大額詐騙。",
            feedbackEn: "⚠️ 'Try for free' is the scam's entry point. They give small real returns first to build trust before the big steal.",
            feedbackZh: "⚠️ 「免费试试」正是骗局入口。他们会先给你小额真实回报，建立信任后再大额诈骗。",
            feedbackType: "bad"
          },
          {
            id: "l4_c1_ignore",
            text: "🚫 陌生訊息+「輕鬆賺錢」，直接封鎖",
            textEn: "🚫 Unknown + 'easy money', block it",
            textZh: "🚫 陌生短信+「轻松赚钱」，直接拉黑",
            effects: { alertness: 25, information: 15, riskScore: -15 },
            nextSceneId: "l4_s2_safe",
            feedback: "✅ 你識破了——「輕鬆日賺」+陌生訊息+刷單，是刷單詐騙的標準三要素。",
            feedbackEn: "✅ You spotted it — 'easy daily earnings' + unknown message + click-farming = the three hallmarks of a click-farm scam.",
            feedbackZh: "✅ 你识破了——「轻松日赚」+陌生短信+刷单，是刷单诈骗的标准三要素。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 2A：小額任務嘗甜頭 ──
      {
        id: "l4_s2_small_task",
        type: "chat",
        speaker: "scammer",
        text: "「導師」給你第一個任務：關注某 Instagram 帳號並截圖。你照做後，對方真的轉了 $50 到你的 PayMe。你心裡放下了戒備。接著「導師」說有「高佣金任務」需要先充值 $500 解鎖。",
        textEn: "The 'mentor' gives your first task: follow an Instagram account and screenshot. You do it — they really send $50 to your PayMe. Your guard drops. Then the 'mentor' says 'high-commission tasks' require a $500 top-up to unlock.",
        textZh: "「导师」给你第一个任务：关注某 Instagram 账号并截图。你照做后，对方真的转了 $50 到你的 PayMe。你心里放下了戒备。接着「导师」说有「高佣金任务」需要先充值 $500 解锁。",
        visual: {
          type: "chat",
          app: "WhatsApp",
          appIcon: "💬",
          messages: [
            { type: "incoming", name: "導師", text: "任務1：關注 @shop_hk_2025 並截圖 ✅" },
            { type: "incoming", name: "導師", text: "佣金 $50 已轉到你的 PayMe 🎉" },
            { type: "incoming", name: "導師", text: "現在有高佣金任務（每單 $200）" },
            { type: "incoming", name: "導師", text: "需先充值 $500 解鎖進階任務，完成後可提現 $1500 💰" }
          ]
        },
        choices: [
          {
            id: "l4_c2_topup",
            text: "💵 反正剛賺了 $50，充值 $500 試試",
            textEn: "💵 Just made $50, top up $500 to try",
            textZh: "💵 反正刚赚了 $50，充值 $500 试试",
            effects: { riskScore: 30, money: -10, information: -10 },
            nextSceneId: "l4_s3_input",
            feedback: "⚠️ 你正走入陷阱核心——「充值解鎖」是刷單詐騙的招牌話術。$50 是誘餌，$500 才是目標。",
            feedbackEn: "⚠️ You're walking into the trap's core — 'top-up to unlock' is the click-farm scam's signature line. $50 is bait; $500 is the target.",
            feedbackZh: "⚠️ 你正走入陷阱核心——「充值解锁」是刷单诈骗的招牌话术。$50 是诱饵，$500 才是目标。",
            feedbackType: "bad"
          },
          {
            id: "l4_c2_stop",
            text: "🛑 等等——要我先付錢的兼職不對勁",
            textEn: "🛑 Wait — a job asking me to pay first is wrong",
            textZh: "🛑 等等——要我先付钱的兼职不对劲",
            effects: { alertness: 25, information: 20, riskScore: -20 },
            nextSceneId: "l4_s2_safe",
            feedback: "✅ 你警覺了——正規兼職不會要求你先付錢。這是判斷刷單詐騙最有效的標準。",
            feedbackEn: "✅ You're alert — legitimate jobs never ask you to pay first. This is the most effective test for click-farm scams.",
            feedbackZh: "✅ 你警觉了——正规兼职不会要求你先付钱。这是判断刷单诈骗最有效的标准。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 2B：安全路徑——查證 ──
      {
        id: "l4_s2_safe",
        type: "result",
        speaker: "official",
        text: "你封鎖了對方，並把帳號輸入防騙視伏器——結果顯示這是活躍的刷單詐騙帳號，已有 30+ 人舉報。你向校方學生事務處反映，他們確認近期有多名同學收到類似訊息。",
        textEn: "You block the contact and enter the account in Scameter — it's an active click-farm scam account with 30+ reports. You inform the campus student affairs office; they confirm many students received similar messages recently.",
        textZh: "你拉黑了对方，并把账号输入防骗视伏器——结果显示这是活跃的刷单诈骗账号，已有 30+ 人举报。你向校方学生事务处反映，他们确认近期有多名同学收到类似短信。",
        visual: {
          type: "safe_result",
          content: "✅ 防騙視伏器查核\n\n帳號 task-master-886\n狀態：🔴 刷單詐騙（30+ 舉報）\n\n校方學生事務處確認：\n近期多名同學收到類似訊息\n\n建議：封鎖、向 18222 舉報、提醒同學"
        },
        choices: [
          {
            id: "l4_c2s_done",
            text: "🚫 封鎖並舉報",
            textEn: "🚫 Block and report",
            textZh: "🚫 拉黑并举报",
            effects: { alertness: 15, information: 15, riskScore: -10 },
            nextSceneId: "l4_s4_done",
            feedback: "✅ 你沒有被「輕鬆賺錢」誘惑——記住：要你先付錢的兼職 100% 是詐騙。",
            feedbackEn: "✅ You weren't tempted by 'easy money' — remember: any job asking you to pay first is 100% a scam.",
            feedbackZh: "✅ 你没有被「轻松赚钱」诱惑——记住：要你先付钱的兼职 100% 是诈骗。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 3：充值後無法提現（自由輸入）──
      {
        id: "l4_s3_input",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "你充值 $500 後，任務系統顯示「連續訂單」，要你再充值 $2,000 才能「提現 $1,500 + $500 本金」。你猶豫時，「客服」催促：「系統檢測到操作錯誤，需再充值 $3,000 修復，否則全部金額無法取回。」\n\n你會怎麼回應？",
        textEn: "After you top up $500, the task system shows 'consecutive orders' — you must top up another $2,000 to 'withdraw $1,500 + $500 principal'. As you hesitate, 'customer service' pushes: 'System detected an operation error, you must top up $3,000 more to fix it, otherwise all funds cannot be withdrawn.'\n\nHow do you respond?",
        textZh: "你充值 $500 后，任务系统显示「连续订单」，要你再充值 $2,000 才能「提现 $1,500 + $500 本金」。你犹豫时，「客服」催促：「系统检测到操作错误，需再充值 $3,000 修复，否则全部金额无法取回。」\n\n你会怎么回应？",
        visual: {
          type: "chat",
          app: "任務系統",
          appIcon: "💼",
          messages: [
            { type: "incoming", name: "任務系統", text: "🔔 連續訂單觸發！需完成 5 單才能提現" },
            { type: "incoming", name: "客服", text: "目前進度 2/5，再充值 $2000 解鎖下一單" },
            { type: "incoming", name: "客服", text: "⚠️ 檢測到操作錯誤，需充值 $3000 修復，否則無法提現" }
          ]
        },
        inputConfig: {
          placeholder: "輸入你的回應…（例如：我要報警 / 我再充值 $3000）",
          placeholderEn: "Type your response… (e.g. I'll call police / I'll top up $3000)",
          placeholderZh: "输入你的回应…（例如：我报警 / 我再充值 $3000）",
          goodNextSceneId: "l4_s3_loss_stop",
          badNextSceneId: "l4_s3_loss_more",
          neutralNextSceneId: "l4_s3_pressure",
          maxNeutralAttempts: 2,
          goodFeedback: "✅ 你提到報警/查證——這是止血的正確反應。已經損失的錢很難追回，但及時止損比繼續投入重要一百倍。",
          goodFeedbackEn: "✅ You mentioned reporting/verifying — the right move to stop the bleeding. Lost money is hard to recover, but stopping in time is 100x more important than investing more.",
          goodFeedbackZh: "✅ 你提到报警/查证——这是止血的正确反应。已经损失的钱很难追回，但及时止损比继续投入重要一百倍。",
          badFeedback: "⚠️ 你提到再充值/轉賬——這正是騙子最想聽的。「再投一點就能回本」是刷單詐騙的核心話術，永無止境。",
          badFeedbackEn: "⚠️ You mentioned topping up/transferring — exactly what scammers want to hear. 'Invest a bit more to recover' is the click-farm scam's core line — it never ends.",
          badFeedbackZh: "⚠️ 你提到再充值/转账——这正是骗子最想听的。「再投一点就能回本」是刷单诈骗的核心话术，永无止境。",
          neutralFeedback: "🤔 「客服」見你沒再充值，再施壓：「你再不修復，$500 也會被沒收！」再想想你會怎麼做。",
          neutralFeedbackEn: "🤔 Seeing you won't top up, 'customer service' pushes: 'If you don't fix it, your $500 will be confiscated too!' Think again.",
          neutralFeedbackZh: "🤔 「客服」见你没再充值，再施压：「你再不修复，$500 也会被没收！」再想想你会怎么做。"
        }
      },
      // ── 場景 3b：二次施壓 ──
      {
        id: "l4_s3_pressure",
        type: "text_input",
        speaker: "scammer",
        pressure: true,
        text: "「客服」語氣急切：「最後機會！再不充值修復，你的帳戶會被永久凍結，$500 本金也拿不回！這是系統規定！」\n\n你會怎麼回應？",
        textEn: "The 'customer service' turns urgent: 'Last chance! If you don't top up to fix it, your account will be permanently frozen and your $500 principal is gone too! It's system policy!'\n\nHow do you respond?",
        textZh: "「客服」语气急切：「最后机会！再不充值修复，你的账户会被永久冻结，$500 本金也拿不回！这是系统规定！」\n\n你会怎么回应？",
        visual: {
          type: "chat",
          app: "任務系統",
          appIcon: "💼",
          messages: [
            { type: "incoming", name: "客服", text: "⚠️ 最後機會！再不充值修復，帳戶永久凍結" },
            { type: "incoming", name: "客服", text: "$500 本金也拿不回！系統規定！" }
          ]
        },
        inputConfig: {
          placeholder: "再次輸入你的回應…（提示：止損）",
          placeholderEn: "Type your response again… (hint: cut losses)",
          placeholderZh: "再次输入你的回应…（提示：止损）",
          goodNextSceneId: "l4_s3_loss_stop",
          badNextSceneId: "l4_s3_loss_more",
          neutralNextSceneId: "l4_s3_loss_stop",
          maxNeutralAttempts: 0,
          goodFeedback: "✅ 你堅持止損——這是面對刷單詐騙最關鍵的判斷。",
          goodFeedbackEn: "✅ You insisted on cutting losses — the most critical judgment against click-farm scams.",
          goodFeedbackZh: "✅ 你坚持止损——这是面对刷单诈骗最关键的判断。",
          badFeedback: "⚠️ 你仍傾向繼續充值——記住：永遠不會「再投一點就回本」，只會越陷越深。",
          badFeedbackEn: "⚠️ You still leaned toward topping up — remember: 'invest a bit more to recover' never happens; it only goes deeper.",
          badFeedbackZh: "⚠️ 你仍倾向继续充值——记住：永远不会「再投一点就回本」，只会越陷越深。",
          neutralFeedback: "🤔 你還在猶豫——這次我們幫你決定：止損，報案。",
          neutralFeedbackEn: "🤔 Still hesitating — let's decide: cut losses and report.",
          neutralFeedbackZh: "🤔 你还在犹豫——这次我们帮你决定：止损，报案。"
        }
      },
      // ── 場景 3c：止損路徑 ──
      {
        id: "l4_s3_loss_stop",
        type: "result",
        speaker: "system",
        text: "你決定止損，不再充值。雖然損失了 $500，但你保住了剩下的錢。你立刻致電防騙易 18222 報案，並把所有聊天記錄、轉帳截圖提供給警方。",
        textEn: "You decide to cut your losses and stop topping up. You lost $500 but saved the rest. You immediately call Anti-Deception 18222 to report, providing all chat records and transfer screenshots to the police.",
        textZh: "你决定止损，不再充值。虽然损失了 $500，但你保住了剩下的钱。你立刻致电防骗易 18222 报案，并把所有聊天记录、转账截图提供给警方。",
        visual: {
          type: "safe_result",
          content: "✅ 及時止損\n\n損失：HK$500（已無法追回）\n剩餘資金：已保護 ✅\n報案：防騙易 18222 已記錄\n\n💡 「再投一點就回本」是騙局\n止損才是唯一正確選擇"
        },
        choices: [
          {
            id: "l4_c3ls_next",
            text: "📞 報案完成，前往下一關",
            textEn: "📞 Reported, proceed to next level",
            textZh: "📞 报案完成，前往下一关",
            effects: { money: -15, information: 15, alertness: 10, riskScore: 10 },
            nextSceneId: "l4_s4_done",
            feedback: "⚠️ $500 損失令人心痛，但及時止損避免了 $3,000+ 的更大損失。記住：要你先付錢的兼職 100% 是詐騙。",
            feedbackEn: "⚠️ The $500 loss hurts, but stopping in time prevented $3,000+ more in losses. Remember: any job asking you to pay first is 100% a scam.",
            feedbackZh: "⚠️ $500 损失令人心痛，但及时止损避免了 $3,000+ 的更大损失。记住：要你先付钱的兼职 100% 是诈骗。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 3d：越陷越深路徑 ──
      {
        id: "l4_s3_loss_more",
        type: "result",
        speaker: "system",
        text: "你又充值了 $3,000。系統顯示「即將解鎖提現」——但又一個「操作錯誤」出現，要求再充值 $5,000。你已經投入 $3,500，無法接受就這樣損失，繼續充值……直到你 PayMe 餘額歸零。帳號隨後被封鎖。",
        textEn: "You top up another $3,000. The system shows 'withdrawal about to unlock' — but another 'operation error' appears, demanding $5,000 more. You've put in $3,500 and can't accept losing it, so you keep going… until your PayMe balance hits zero. The account is then blocked.",
        textZh: "你又充值了 $3,000。系统显示「即将解锁提现」——但又一个「操作错误」出现，要求再充值 $5,000。你已经投入 $3,500，无法接受就这样损失，继续充值……直到你 PayMe 余额归零。账号随后被封禁。",
        visual: {
          type: "warning_page",
          content: "⚠️ 損失累計\n\n第1次充值：$500\n第2次充值：$3,000\n第3次充值：$5,000\n總損失：HK$8,500\n\n帳號狀態：已封鎖\n提現：永遠無法\n\n💡 「沉沒成本」效應\n讓你越陷越深"
        },
        choices: [
          {
            id: "l4_c3lm_report",
            text: "📞 立刻致電 18222 報案",
            textEn: "📞 Call 18222 to report now",
            textZh: "📞 立刻致电 18222 报案",
            effects: { money: -55, riskScore: 45, information: 15 },
            nextSceneId: "l4_s4_done",
            feedback: "⚠️ 沉沒成本效應讓你越陷越深。記住：第一次要求充值時就該停止。及時止損比追回損失重要一百倍。",
            feedbackEn: "⚠️ The sunk-cost fallacy dragged you deeper. Remember: you should have stopped at the first top-up request. Cutting losses in time is 100x more important than chasing losses.",
            feedbackZh: "⚠️ 沉没成本效应让你越陷越深。记住：第一次要求充值时就该停止。及时止损比追回损失重要一百倍。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 4：本關結束 ──
      {
        id: "l4_s4_done",
        type: "result",
        speaker: "system",
        text: "【第四關完成】你應對了刷單兼職騙局。\n\n記住三件事：要你先付錢的兼職是詐騙、小額回報是誘餌、「再投一點就回本」永遠是謊言。正規兼職找 JobsDB、CTgoodjobs、校方 Career Center。",
        textEn: "[Level 4 Complete] You handled the click-farm job scam.\n\nRemember three things: any job asking you to pay first is a scam, small returns are bait, 'invest a bit more to recover' is always a lie. Legit jobs: JobsDB, CTgoodjobs, campus Career Center.",
        textZh: "【第四关完成】你应对了刷单兼职骗局。\n\n记住三件事：要你先付钱的兼职是诈骗、小额回报是诱饵、「再投一点就回本」永远是谎言。正规兼职找 JobsDB、CTgoodjobs、校方 Career Center。",
        visual: { type: "safe_result", content: "💼 第四關：刷單兼職騙局\n狀態：已完成 ✅\n\n下一關：Deepfake 與社交投資騙局" },
        choices: [
          {
            id: "l4_c4_next",
            text: "➡️ 前往第五關：Deepfake 投資騙局",
            textEn: "➡️ Level 5: Deepfake & Crypto Scam",
            textZh: "➡️ 前往第五关：Deepfake 投资骗局",
            effects: {},
            nextSceneId: "__next_level__",
            feedbackType: "mid"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // Level 5：Deepfake 與社交媒體投資騙局
  // ─────────────────────────────────────────────────────────────
  {
    id: "hk_l5_deepfake",
    index: 5,
    title: "Deepfake 與投資騙局",
    titleEn: "Deepfake & Crypto Romance Scam",
    titleZh: "Deepfake 与投资骗局",
    icon: "🤖",
    scamType: "Deepfake 換臉 + 假冒親友 + 虛擬貨幣投資詐騙",
    redFlags: [
      "「朋友」透過 WhatsApp/視像通話求助，要求緊急 FPS 轉賬",
      "視像通話中對方畫面短暫模糊、嘴型不同步（Deepfake 痕跡）",
      "「投資導師」保證高回報，要求轉賬到未知平台或虛擬貨幣錢包",
      "對方催促「機會難得」「最後名額」，製造 FOMO",
      "投資平台域名可疑，無法在 SEC/HKMA 持牌名單查到"
    ],
    officialChannels: [
      "致電朋友本人已知的電話號碼求證（不要回撥來電）",
      "用預設的暗號或只有你們知道的問題核實身份",
      "在 HKMA 持牌銀行/證券名單查核投資平台",
      "致電防騙易 18222 查詢可疑投資",
      "使用防騙視伏器搜尋投資平台域名"
    ],
    scenes: [
      // ── 場景 1：朋友視像來電（語音模擬）──
      {
        id: "l5_s1",
        type: "phone_call",
        speaker: "scammer",
        pressure: true,
        text: "晚上你收到「朋友阿 Jason」的 WhatsApp 視像來電。畫面中的人看起來確實是 Jason，但偶爾有點模糊、嘴型稍微不同步。他一臉焦急：「我出了事，急需 $8,000 周轉，你可不可以幫我 FPS 轉一下？」\n\n點擊播放聽聽這通語音。",
        textEn: "That evening, you get a WhatsApp video call from 'friend Jason'. The person looks like Jason, but the image is occasionally blurry and the lips are slightly out of sync. He looks anxious: 'I'm in trouble, I urgently need $8,000. Can you FPS it to me?'\n\nPress play to hear the voice.",
        textZh: "晚上你收到「朋友阿 Jason」的 WhatsApp 视像来电。画面中的人看起来确实是 Jason，但偶尔有点模糊、嘴型稍微不同步。他一脸焦急：「我出了事，急需 $8,000 周转，你可不可以帮我 FPS 转一下？」\n\n点击播放听听这通语音。",
        visual: {
          type: "voice_call",
          caller: "阿 Jason（視像通話）",
          callerEn: "Jason (Video Call)",
          callType: "video_call",
          duration: "0:45",
          speechText: "喂，我係 Jason 啊。我而家出咗啲事，好急，急需八千蚊周轉。你可唔可以即刻 FPS 轉俾我？我轉頭就還返俾你。麻煩你啦，真係好急。對唔住啊，呢個時候打擾你，但我真係冇辦法喇。你轉完話我知，多謝你啊兄弟。",
          speechTextEn: "Hey, it's Jason. I'm in some trouble right now, really urgent, I need eight thousand to tide over. Can you FPS it to me right now? I'll pay you back right away. Please, it's really urgent. Sorry to bother you at this time, but I really have no other choice. Let me know once you've transferred it. Thanks bro.",
          speechTextZh: "喂，我是 Jason 啊。我现在出了点事，好急，急需八千块周转。你可不可以即刻 FPS 转给我？我转头就还返给你。麻烦你啦，真的是好急。对不起啊，这个时候打扰你，但我真是没办法了。你转完告诉我，谢谢你啊兄弟。"
        },
        choices: [
          {
            id: "l5_c1_verify",
            text: "🤔 等等，我要先核實你係咪真係 Jason",
            textEn: "🤔 Wait, I need to verify you're really Jason",
            textZh: "🤔 等等，我要先核实你是不是 Jason",
            effects: { information: 10, alertness: 15, medal: 'deepfake_detective' },
            nextSceneId: "l5_s2_input",
            feedback: "✅ 你起疑了——畫面模糊+嘴型不同步是 Deepfake 換臉的典型痕跡。先核實再說。",
            feedbackEn: "✅ You're suspicious — blurriness and lip-sync issues are typical Deepfake signs. Verify first.",
            feedbackZh: "✅ 你起疑了——画面模糊+嘴型不同步是 Deepfake 换脸的典型痕迹。先核实再说。",
            feedbackType: "good"
          },
          {
            id: "l5_c1_help",
            text: "😟 Jason 出事？我即刻轉 $8,000",
            textEn: "😟 Jason in trouble? I'll FPS $8,000 now",
            textZh: "😟 Jason 出事？我即刻转 $8,000",
            effects: { riskScore: 35, money: -20, information: -10 },
            nextSceneId: "l5_s2_input",
            feedback: "⚠️ 你急於幫朋友——但 Deepfake 換臉詐騙專門利用你的善意。先核實，再轉帳。",
            feedbackEn: "⚠️ You're eager to help a friend — but Deepfake scams exploit exactly that goodwill. Verify before transferring.",
            feedbackZh: "⚠️ 你急于帮朋友——但 Deepfake 换脸诈骗专门利用你的善意。先核实，再转账。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 2：自由輸入——你會如何核實 ──
      {
        id: "l5_s2_input",
        type: "text_input",
        speaker: "system",
        pressure: true,
        text: "你決定先核實對方身份。你會如何核實這個「Jason」是不是真的 Jason？\n\n（提示：想想只有你們兩個知道的事，或用其他渠道聯絡）",
        textEn: "You decide to verify the caller's identity first. How would you verify whether this 'Jason' is the real Jason?\n\n(Hint: think of something only the two of you know, or contact via another channel.)",
        textZh: "你决定先核实对方身份。你会如何核实这个「Jason」是不是真的 Jason？\n\n（提示：想想只有你们两个知道的事，或用其他渠道联络）",
        visual: {
          type: "phone_call",
          caller: "阿 Jason（視像通話）",
          content: "你點解要問呢啲？我趕時間，快啲轉錢俾我啦！",
          speechText: "喂，你點解要問呢啲嘢㗎？我唔係 Jason 仲會係邊個啊？我而家真係好急好趕時間，你快啲轉八千蚊俾我啦！遲咁就唔夠用㗎喇。我轉頭一定還返俾你，信我啦！我而家個心好亂，你就當幫下我啦，多謝你啊兄弟。",
          speechTextEn: "Hey, why are you asking all these questions? Who else would I be if not Jason? I'm really in a hurry right now, just transfer eight thousand to me quickly! It'll be too late otherwise. I'll definitely pay you back right away, trust me! I'm really stressed out right now, just help me out, thanks bro.",
          speechTextZh: "喂，你为什么要问这些东西啊？我不是 Jason 还会是谁啊？我现在真的好急好赶时间，你快点转八千块给我啦！迟了就不够用了。我转头一定还给你，信我啦！我现在心好乱，你就当帮下我啦，谢谢你啊兄弟。"
        },
        inputConfig: {
          placeholder: "輸入你想核實的方式…（例如：打電話俾 Jason / 問暗號）",
          placeholderEn: "Type how you'd verify… (e.g. call Jason / ask a secret code)",
          placeholderZh: "输入你想核实的方式…（例如：打电话给 Jason / 问暗号）",
          goodNextSceneId: "l5_s3_safe",
          badNextSceneId: "l5_s3_loss",
          neutralNextSceneId: "l5_s2b_invest",
          maxNeutralAttempts: 2,
          goodFeedback: "✅ 你選擇用獨立渠道/暗號核實——這是對抗 Deepfake 換臉最有效的方法。Deepfake 可以換臉，但換不到只有你們知道的記憶。",
          goodFeedbackEn: "✅ You chose to verify via an independent channel/secret code — the most effective way to defeat Deepfakes. They can swap faces, but not shared memories only the two of you know.",
          goodFeedbackZh: "✅ 你选择用独立渠道/暗号核实——这是对抗 Deepfake 换脸最有效的方法。Deepfake 可以换脸，但换不到只有你们知道的记忆。",
          badFeedback: "⚠️ 你仍然傾向轉賬——Deepfake 換臉技術已非常成熟，視像通話不再能證明身份。必須用獨立渠道核實。",
          badFeedbackEn: "⚠️ You still leaned toward transferring — Deepfake tech is now mature; video calls can no longer prove identity. You must verify via an independent channel.",
          badFeedbackZh: "⚠️ 你仍然倾向转账——Deepfake 换脸技术已非常成熟，视像通话不再能证明身份。必须用独立渠道核实。",
          neutralFeedback: "🤔 「Jason」見你沒轉帳，開始另一套話術：「不如你幫我投資一個高回報項目，順便幫我周轉？」再想想你會怎麼做。",
          neutralFeedbackEn: "🤔 Seeing you won't transfer, 'Jason' shifts tactics: 'How about you invest in a high-return project, and help me out at the same time?' Think again.",
          neutralFeedbackZh: "🤔 「Jason」见你没转账，开始另一套话术：「不如你帮我投资一个高回报项目，顺便帮我周转？」再想想你会怎么做。"
        }
      },
      // ── 場景 2b：轉向投資騙局 ──
      {
        id: "l5_s2b_invest",
        type: "chat",
        speaker: "scammer",
        text: "「Jason」發來一個投資平台連結：「我最近在這個虛擬貨幣平台賺了很多，保證週回報 15%。你幫我投資，順便自己也賺一筆。機會難得，最後 3 個名額！」",
        textEn: "'Jason' sends a link to an investment platform: 'I've been making a lot on this crypto platform — guaranteed 15% weekly returns. Invest for me and earn for yourself too. Limited opportunity, last 3 spots!'",
        textZh: "「Jason」发来一个投资平台链接：「我最近在这个虚拟货币平台赚了很多，保证周回报 15%。你帮我投资，顺便自己也赚一笔。机会难得，最后 3 个名额！」",
        visual: {
          type: "phishing_card",
          url: "https://hk-crypto-pro-invest.net/login",
          realUrl: "可疑投資平台（不在 HKMA 持牌名單）",
          pageTitle: "Crypto Pro Invest — 15% Weekly Guaranteed",
          pageIcon: "📈",
          redFlags: [
            { icon: "🚫", text: "保證回報 15%/週——任何保證高回報都是詐騙" },
            { icon: "⏰", text: "「最後 3 個名額」FOMO 壓力" },
            { icon: "🔗", text: "域名 hk-crypto-pro-invest.net 不在 HKMA 持牌名單" },
            { icon: "💰", text: "要求轉賬到虛擬貨幣錢包（無法追回）" }
          ]
        },
        choices: [
          {
            id: "l5_c2b_verify",
            text: "🔍 我要在 HKMA 持牌名單查核這個平台",
            textEn: "🔍 I'll check this platform on HKMA's licensed list",
            textZh: "🔍 我要在 HKMA 持牌名单核查这个平台",
            effects: { alertness: 25, information: 25, riskScore: -20 },
            nextSceneId: "l5_s3_safe",
            feedback: "✅ 你堅持查核投資平台——HKMA 持牌名單是核實投資平台真偽的官方渠道。任何保證高回報都是詐騙。",
            feedbackEn: "✅ You insisted on checking the platform — HKMA's licensed list is the official way to verify investment platforms. Any guaranteed high return is a scam.",
            feedbackZh: "✅ 你坚持核查投资平台——HKMA 持牌名单是核实投资平台真伪的官方渠道。任何保证高回报都是诈骗。",
            feedbackType: "good"
          },
          {
            id: "l5_c2b_invest",
            text: "📈 15% 回報太吸引，我試投 $5,000",
            textEn: "📈 15% return is tempting, I'll try $5,000",
            textZh: "📈 15% 回报太吸引，我试投 $5,000",
            effects: { riskScore: 40, money: -25, information: -15 },
            nextSceneId: "l5_s3_loss",
            feedback: "⚠️ 你被「保證回報」誘惑——記住：任何保證高回報的投資都是詐騙。虛擬貨幣轉帳一旦完成，無法追回。",
            feedbackEn: "⚠️ You were tempted by 'guaranteed returns' — remember: any guaranteed high-return investment is a scam. Crypto transfers cannot be reversed once complete.",
            feedbackZh: "⚠️ 你被「保证回报」诱惑——记住：任何保证高回报的投资都是诈骗。虚拟货币转账一旦完成，无法追回。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 3A：安全路徑——識破 Deepfake ──
      {
        id: "l5_s3_safe",
        type: "result",
        speaker: "official",
        text: "你掛斷視像通話，用你手機通訊錄裡 Jason 的號碼打過去。真正的 Jason 接聽：「吓？我喺屋企睇 Netflix 啊，邊有打俾你？」你確認剛才的「Jason」是 Deepfake 換臉。你接著把投資平台域名輸入防騙視伏器——高危詐騙。",
        textEn: "You hang up the video call and dial Jason's number from your contacts. The real Jason answers: 'Huh? I'm at home watching Netflix, I never called you.' You confirm the 'Jason' earlier was a Deepfake. You enter the investment platform's domain in Scameter — high-risk scam.",
        textZh: "你挂断视像通话，用你手机通讯录里 Jason 的号码打过去。真正的 Jason 接听：「吓？我在家看 Netflix 啊，哪有打给你？」你确认刚才的「Jason」是 Deepfake 换脸。你接着把投资平台域名输入防骗视伏器——高危诈骗。",
        visual: {
          type: "safe_result",
          content: "✅ Deepfake 識破\n\n真 Jason 確認：在家中，未致電\n投資平台 hk-crypto-pro-invest.net\n防騙視伏器：🔴 高危投資詐騙（72 舉報）\n\n建議：\n• 封鎖假 Jason\n• 致電 18222 報案\n• 提醒朋友這類 Deepfake 騙局"
        },
        choices: [
          {
            id: "l5_c3s_report",
            text: "🚫 封鎖並向 18222 舉報",
            textEn: "🚫 Block and report to 18222",
            textZh: "🚫 拉黑并向 18222 举报",
            effects: { alertness: 20, information: 20, riskScore: -20 },
            nextSceneId: "l5_s3b_mixed",
            feedback: "✅ 你用獨立渠道核實——這是對抗 Deepfake 換臉最有效的方法。AI 換臉技術只會越來越成熟，獨立核實是唯一防線。",
            feedbackEn: "✅ You verified via an independent channel — the most effective way to defeat Deepfakes. AI face-swap tech will only get better; independent verification is the only defense.",
            feedbackZh: "✅ 你用独立渠道核实——这是对抗 Deepfake 换脸最有效的方法。AI 换脸技术只会越来越成熟，独立核实是唯一防线。",
            feedbackType: "good"
          }
        ]
      },
      // ── 場景 3B：混合輸入——總結 Deepfake 騙局（3 預設 + 自由輸入）──
      {
        id: "l5_s3b_mixed",
        type: "mixed_input",
        speaker: "system",
        text: "你成功識破了 Deepfake 騙局。朋友問你：「呢個新式騙局點樣形容佢？我點樣先可以避免中招？」\n\n你會點樣總結？（可選擇預設答案，或撳「其他」自己輸入）",
        textEn: "You successfully spotted the Deepfake scam. A friend asks: 'How would you describe this new scam? How can I avoid falling for it?'\n\nHow do you summarize? (Pick a preset option, or tap 'Other' to type your own.)",
        textZh: "你成功识破了 Deepfake 骗局。朋友问你：「这个新式骗局怎么样形容它？我怎么样才可以避免中招？」\n\n你会怎么样总结？（可选择预设答案，或按「其他」自己输入）",
        mixedConfig: {
          choices: [
            {
              id: "l5_mixed1",
              text: "AI 換臉太真，以後視像通話都唔可以信",
              textEn: "AI face-swap is too real; video calls can't be trusted anymore",
              textZh: "AI 换脸太真，以后视频通话都不能信",
              effects: { alertness: 5, information: 5 },
              nextSceneId: "l5_s4_done",
              feedback: "🤔 部分正確但太絕對。AI 換臉雖然逼真，但仍有破綻（眨眼、光影、嘴角），而且獨立渠道核實可以有效防範。唔好因為「信唔過」就完全拒絕視像，而係要學識「用第二個渠道核實」。",
              feedbackEn: "🤔 Partially correct but too absolute. AI face-swap is realistic but has flaws (blinking, lighting, mouth corners); independent verification works. Don't refuse all video calls — learn to verify via another channel.",
              feedbackZh: "🤔 部分正确但太绝对。AI 换脸虽然逼真，但仍有破绽（眨眼、光影、嘴角），而且独立渠道核实可以有效防范。不要因为「信不过」就完全拒绝视频，而是要学会「用另一个渠道核实」。",
              feedbackType: "mid"
            },
            {
              id: "l5_mixed2",
              text: "任何要求轉帳到陌生帳戶嘅都要警惕，獨立核實",
              textEn: "Be wary of any transfer to unknown accounts; verify independently",
              textZh: "任何要求转账到陌生账户的都要警惕，独立核实",
              effects: { alertness: 15, information: 15, riskScore: -10, xp: 25, score: 50 },
              nextSceneId: "l5_s4_done",
              feedback: "✅ 正確！無論對方係邊個（即使視像見到樣），任何要求轉帳到陌生帳戶都必須高度警惕。Deepfake 嘅出現令「見到樣」再唔係身份保證，獨立渠道核實（例如自己打返畀對方）係唯一可靠防線。",
              feedbackEn: "✅ Correct! No matter who the caller is (even on video), any transfer to unknown accounts must be treated with high alert. Deepfake means 'seeing the face' is no longer proof of identity; verifying via an independent channel (e.g., calling them yourself) is the only reliable defense.",
              feedbackZh: "✅ 正确！无论对方是谁（即使视频见到样），任何要求转账到陌生账户都必须高度警惕。Deepfake 的出现令「见到样」再不是身份保证，独立渠道核实（例如自己打回给对方）是唯一可靠防线。",
              feedbackType: "good"
            },
            {
              id: "l5_mixed3",
              text: "政府部門唔會電話執法，更加唔會要求轉帳到「安全帳戶」",
              textEn: "Government never enforces by phone, never asks for transfers to 'safe accounts'",
              textZh: "政府部门不会电话执法，更加不会要求转账到「安全账户」",
              effects: { alertness: 15, information: 15, riskScore: -10, xp: 25, score: 50 },
              nextSceneId: "l5_s4_done",
              feedback: "✅ 正確！雖然呢關係 Deepfake，但好多複合騙局會扮入境處、警察。記住：政府部門絕唔會電話執法、預錄語音威脅、要求提供 HKID 或轉帳到「安全帳戶」。呢個係識破假冒政府詐騙嘅關鍵。",
              feedbackEn: "✅ Correct! This level was about Deepfake, but many composite scams impersonate Immigration or Police. Remember: government never enforces by phone, never uses pre-recorded threats, never asks for HKID or transfers to 'safe accounts'. This is the key to spotting government impersonation.",
              feedbackZh: "✅ 正确！虽然这关是 Deepfake，但很多复合骗局会扮入境处、警察。记住：政府部门绝不会电话执法、预录语音威胁、要求提供 HKID 或转账到「安全账户」。这个是识破假冒政府诈骗的关键。",
              feedbackType: "good"
            }
          ],
          inputConfig: {
            placeholder: "輸入你嘅總結…（例如：遇到視像借錢，一定用第二個渠道核實）",
            placeholderEn: "Type your summary… (e.g. For video call money requests, always verify via another channel)",
            placeholderZh: "输入你的总结…（例如：遇到视频借钱，一定用另一个渠道核实）",
            goodKeywords: ["核實", "查證", "獨立", "官方渠道", "18222", "防騙視伏器", "scameter", "回撥", "回電", "自己打", "另一個渠道", "第二個渠道", "別信", "唔信", "不信", "不轉", "唔轉", "舉報", "報警", "報案", "掛斷", "掛線", "收線", "核對", "確認", "verify", "call back", "report", "hotline"],
            badKeywords: ["轉賬", "轉帳", "匯款", "畀密碼", "俾密碼", "给密码", "直接轉", "即轉", "相信佢", "信佢", "相信他", "冇問題", "沒問題", "没问题", "照轉", "照給", "俾錢", "给钱", "轉錢", "转账", "transfer", "send money", "password"],
            goodFeedback: "✅ 你嘅總結提到核實/查證/獨立渠道——呢個係防範 Deepfake 騙局嘅核心。記住：視像通話已經唔足以證明身份，任何金錢請求都必須用已知嘅另一個渠道獨立核實，先至再決定。",
            goodFeedbackEn: "✅ Your summary mentions verifying / independent channels — the core of defending against Deepfake scams. Remember: video calls alone can no longer prove identity; any money request must be verified via another known channel before acting.",
            goodFeedbackZh: "✅ 你的总结提到核实/查证/独立渠道——这个是防范 Deepfake 骗局的核心。记住：视频通话已经不足以证明身份，任何金钱请求都必须用已知的另一个渠道独立核实，然后再决定。",
            badFeedback: "⚠️ 你嘅總結提到轉賬/相信對方/直接畀——呢個正正係騙徒最想見到嘅反應。Deepfake 嘅出現令「見到樣」再唔係身份保證，任何涉及金錢嘅請求都必須嚴格核實，唔可以因為「見到樣」就放鬆警惕。",
            badFeedbackEn: "⚠️ Your summary mentions transferring / trusting / paying directly — exactly what scammers want. Deepfake means 'seeing the face' is no longer proof of identity; any money request must be strictly verified, never relaxed just because you 'saw the face'.",
            badFeedbackZh: "⚠️ 你的总结提到转账/相信对方/直接给——这个正是骗子最想见到的反应。Deepfake 的出现令「见到样」再不是身份保证，任何涉及金钱的请求都必须严格核实，不可以因为「见到样」就放松警惕。",
            neutralFeedback: "🤔 你嘅總結比較籠統。建議強調：遇到熟人視像借錢，務必用其他已知聯絡方式（例如回撥手機）獨立核實；任何保證高回報嘅投資都係詐騙；有懷疑即撥 18222。",
            neutralFeedbackEn: "🤔 Your summary is a bit vague. Suggest emphasizing: For video money requests from acquaintances, always verify via another known contact (e.g., call their mobile); any guaranteed high-return investment is a scam; when in doubt, call 18222.",
            neutralFeedbackZh: "🤔 你的总结比较笼统。建议强调：遇到熟人视频借钱，务必用其他已知联系方式（例如回拨手机）独立核实；任何保证高回报的投资都是诈骗；有怀疑即拨 18222。",
            goodNextSceneId: "l5_s4_done",
            badNextSceneId: "l5_s4_done",
            neutralNextSceneId: "l5_s4_done"
          }
        },
        choices: []
      },
      // ── 場景 3C：危險路徑——被騙 ──
      {
        id: "l5_s3_loss",
        type: "result",
        speaker: "system",
        text: "你轉了 $8,000 給「Jason」並投資了 $5,000 到「Crypto Pro Invest」。第二天平台顯示「賺了 $3,000」——但當你嘗試提現，系統要求再充值 $5,000「手續費」。你這才意識到不對。三天後，平台消失，帳號被封鎖。",
        textEn: "You transfer $8,000 to 'Jason' and invest $5,000 in 'Crypto Pro Invest'. The next day the platform shows you 'earned $3,000' — but when you try to withdraw, the system demands another $5,000 'fee'. You finally realize. Three days later, the platform vanishes and the account is blocked.",
        textZh: "你转了 $8,000 给「Jason」并投资了 $5,000 到「Crypto Pro Invest」。第二天平台显示「赚了 $3,000」——但当你尝试提现，系统要求再充值 $5,000「手续费」。你这才意识到不对。三天后，平台消失，账号被封禁。",
        visual: {
          type: "warning_page",
          content: "⚠️ 雙重損失\n\nFPS 轉賬給假 Jason：HK$8,000\nCrypto Pro Invest 投資：HK$5,000\n總損失：HK$13,000\n\n平台狀態：已消失\n提現：永遠無法\n\n💡 Deepfake + 投資騙局\n是 2024-2025 新興複合詐騙"
        },
        choices: [
          {
            id: "l5_c3l_report",
            text: "📞 立刻致電 18222 報案",
            textEn: "📞 Call 18222 to report now",
            textZh: "📞 立刻致电 18222 报案",
            effects: { money: -65, riskScore: 45, information: 15 },
            nextSceneId: "l5_s4_done",
            feedback: "⚠️ Deepfake 換臉 + 虛擬貨幣投資是最新型態詐騙。記住：視像通話不再能證明身份，任何保證高回報都是詐騙。",
            feedbackEn: "⚠️ Deepfake + crypto investment is the newest scam type. Remember: video calls can no longer prove identity, and any guaranteed high return is a scam.",
            feedbackZh: "⚠️ Deepfake 换脸 + 虚拟货币投资是最新形态诈骗。记住：视像通话不再能证明身份，任何保证高回报都是诈骗。",
            feedbackType: "bad"
          }
        ]
      },
      // ── 場景 4：本關結束（最終）──
      {
        id: "l5_s4_done",
        type: "result",
        speaker: "system",
        text: "【第五關完成】你應對了 Deepfake 與投資騙局——這是 2024-2025 最新型態的複合詐騙。\n\n記住三件事：視像通話不再能證明身份、用獨立渠道核實、任何保證高回報都是詐騙。恭喜完成全部 5 關！",
        textEn: "[Level 5 Complete] You handled the Deepfake and investment scam — the newest composite scam of 2024-2025.\n\nRemember three things: video calls can no longer prove identity, verify via independent channels, any guaranteed high return is a scam. Congratulations on completing all 5 levels!",
        textZh: "【第五关完成】你应对了 Deepfake 与投资骗局——这是 2024-2025 最新形态的复合诈骗。\n\n记住三件事：视像通话不再能证明身份、用独立渠道核实、任何保证高回报都是诈骗。恭喜完成全部 5 关！",
        visual: { type: "safe_result", content: "🤖 第五關：Deepfake 與投資騙局\n狀態：已完成 ✅\n\n全部 5 關完成 🎉" },
        choices: [
          {
            id: "l5_c4_end",
            text: "🏁 查看你的反詐等級",
            textEn: "🏁 See your anti-scam rank",
            textZh: "🏁 查看你的反诈等级",
            effects: {},
            nextSceneId: "__ending__",
            feedbackType: "mid"
          }
        ]
      }
    ]
  }
];

// ===================================================================
// ===== 結局資料 =====
// ===================================================================
const endings = [
  {
    id: "ending_deep_scammed",
    icon: "💸",
    title: "被騙了，但這不是你的錯",
    titleEn: "Scammed — But Not Your Fault",
    titleZh: "被骗了，但这不是你的错",
    color: "#F87171",
    condition: s => s.money <= 15 && s.riskScore >= 70,
    description: "你在連環壓力下做出了危險決定，損失不小。但這些騙局設計精密，針對的就是剛到香港、正在適應新環境的學生。",
    descriptionEn: "You made risky decisions under cascading pressure and lost money. But these scams are精密ly designed to target students new to Hong Kong.",
    descriptionZh: "你在连环压力下做出了危险决定，损失不小。但这些骗局设计精密，针对的就是刚到香港、正在适应新环境的学生。",
    advice: [
      "騙子刻意製造「再不處理就來不及」的感覺，目的就是讓你沒時間思考。",
      "香港反詐資源：防騙易 18222 熱線、防騙視伏器 (Scameter) 網站、HKPF 反詐騙協調中心 (ADCC)。",
      "已經被騙了也不要慌，立刻致電 18222 報案，聯絡銀行凍結帳戶，保留所有記錄。",
      "被騙不代表你笨，代表你遇到了職業騙子。下次你一定識得出來。"
    ]
  },
  {
    id: "ending_high_risk_trap",
    icon: "⛔",
    title: "差點中招",
    titleEn: "Close Call",
    titleZh: "差点中招",
    color: "#EF4444",
    condition: s => s.riskScore >= 60 && s.information <= 35,
    description: "你走在一個高風險的路上，而且手上掌握的資訊很少。這種組合是騙子最喜歡的——什麼都不確定，只能聽對方說。",
    descriptionEn: "You're on a high-risk path with little information — the combination scammers love most: uncertain about everything, only able to listen to them.",
    descriptionZh: "你走在一个高风险的路上，而且手上掌握的资讯很少。这种组合是骗子最喜欢的——什么都不确定，只能听对方说。",
    advice: [
      "資訊越少，越容易被帶著走。遇到任何要求，先搜索、再決定。",
      "香港身份證、護照、銀行帳戶——提供前一定要確認對方身份。",
      "校方學生事務處、防騙易 18222 是你最可靠的求助點。"
    ]
  },
  {
    id: "ending_anti_scam_expert",
    icon: "🏆",
    title: "反詐達人，完全沒被騙到",
    titleEn: "Anti-Scam Master — Untouched",
    titleZh: "反诈达人，完全没被骗到",
    color: "#34D399",
    condition: s => s.information >= 75 && s.alertness >= 70 && s.money >= 75,
    description: "你沒有上當，還把整件事查清楚了。你識破了 Deepfake、釣魚連結、假冒政府，每次都從官方渠道核實。教科書級別的操作。",
    descriptionEn: "You didn't fall for it and verified everything. You spotted Deepfakes, phishing links, and government impersonation — verifying via official channels every time. Textbook performance.",
    descriptionZh: "你没有上当，还把整件事查清楚了。你识破了 Deepfake、钓鱼链接、假冒政府，每次都从官方渠道核实。教科书级别的操作。",
    advice: [
      "你已經掌握了最重要的反詐技能：不管對方說什麼，先掛電話，自己查。",
      "把防騙易 18222 存到手機：香港反詐騙協調中心 (ADCC) 24 小時熱線。",
      "把這個遊戲分享給你的室友和同學——多一個人知道，少一個人被騙。"
    ]
  },
  {
    id: "ending_calm_verifier",
    icon: "🧘",
    title: "沉住氣了，做得不錯",
    titleEn: "Stayed Calm — Well Done",
    titleZh: "沉住气了，做得不错",
    color: "#60A5FA",
    condition: s => s.information >= 60 && s.riskScore <= 35,
    description: "你沒有急著跟著對方走，而是選擇先查清楚。結果發現——果然是詐騙。這種「停一下」的習慣，比你想像的更難得。",
    descriptionEn: "You didn't rush to follow them; you chose to verify first. And found — indeed, a scam. This 'pause a moment' habit is rarer than you think.",
    descriptionZh: "你没有急着跟着对方走，而是选择先查清楚。结果发现——果然是诈骗。这种「停一下」的习惯，比你想象的更难得。",
    advice: [
      "你最大的優點是不被「緊迫感」帶走——這個習慣要繼續保持。",
      "香港反詐三寶：防騙易 18222、防騙視伏器 (Scameter)、HKPF ADCC。",
      "下次遇到類似情況，可以直接把可疑號碼/連結輸入 Scameter 搜尋。"
    ]
  },
  {
    id: "ending_data_leak",
    icon: "🔓",
    title: "錢沒丟，但資料可能洩露了",
    titleEn: "Money Safe — But Data May Be Leaked",
    titleZh: "钱没丢，但资料可能泄露了",
    color: "#FBBF24",
    condition: s => s.riskScore >= 40 && s.money >= 60,
    description: "你的帳戶餘額沒有直接損失，但你可能在某個環節洩露了個人資料。騙子拿到你的 HKID、護照資料，可以慢慢用——有時候影響比當場轉帳還大。",
    descriptionEn: "Your balance is intact, but you may have leaked personal data in some step. With your HKID and passport info, scammers can use them slowly — sometimes the impact is worse than an immediate transfer.",
    descriptionZh: "你的账户余额没有直接损失，但你可能在某个环节泄露了个人资料。骗子拿到你的 HKID、护照资料，可以慢慢用——有时候影响比当场转账还大。",
    advice: [
      "沒有損失金錢，不代表安全。HKID 號碼、護照號碼一旦洩露，後患很多。",
      "建議立刻更改相關帳戶密碼，並告知銀行留意異常操作。",
      "考慮向入境處反映 HKID 洩露情況，必要時更換身份證。"
    ]
  },
  {
    id: "ending_small_loss",
    icon: "💰",
    title: "損失了一點，但及時踩了剎車",
    titleEn: "Small Loss, Timely Brake",
    titleZh: "损失了一点，但及时踩了刹车",
    color: "#FB923C",
    condition: s => s.money < 65 && s.money > 15,
    description: "你在某個關鍵時刻沒有及時識破，造成了一些損失。但好在你及時停手了，沒有繼續陷進去。及時止損，比追回損失重要一百倍。",
    descriptionEn: "You didn't spot it in time at a critical moment and lost some money. But you stopped in time and didn't go deeper. Cutting losses is 100x more important than chasing them.",
    descriptionZh: "你在某个关键时刻没有及时识破，造成了一些损失。但好在你及时停手了，没有继续陷进去。及时止损，比追回损失重要一百倍。",
    advice: [
      "及時止損比繼續投入重要一百倍——「已經虧了，再投一點說不定能回本」是騙子最常用的話術。",
      "遇到損失，第一時間致電防騙易 18222，第二時間聯絡銀行，保留所有截圖和通話記錄。",
      "香港警方 ADCC 反詐騙協調中心專責處理這類案件。"
    ]
  },
  {
    id: "ending_safe_but_lucky",
    icon: "😅",
    title: "這次沒事，但不是因為你夠厲害",
    titleEn: "Safe This Time — But Not Because You're Good",
    titleZh: "这次没事，但不是因为你够厉害",
    color: "#38BDF8",
    condition: s => true,
    description: "你沒有受到重大損失，但說實話，有幾個關鍵判斷更像是運氣，而不是你主動識別出來的。下次碰到更精心設計的騙局，可能就不那麼幸運了。",
    descriptionEn: "You avoided major losses, but honestly, several key judgments were luck rather than active detection. Next time you meet a more elaborate scam, you might not be so lucky.",
    descriptionZh: "你没有受到重大损失，但说实话，有几个关键判断更像是运气，而不是你主动识别出来的。下次碰到更精心设计的骗局，可能就不那么幸运了。",
    advice: [
      "運氣不是反詐技能，主動查證才是。",
      "把防騙易 18222 和防騙視伏器 (Scameter) 存到書籤——以備不時之需。",
      "下次遇到類似情況，試著主動搜索、打官方電話，而不是靠感覺判斷。"
    ]
  }
];

// ===================================================================
// ===== 配置覆蓋：如果 levels.js 已定義 LEVELS（8 關新配置），
// ===== 就用 LEVELS 覆蓋舊 5 關，確保 game.js 讀到新關卡。
// ===================================================================
if (typeof window !== 'undefined') {
  // 延遲到下一 tick，確保 levels.js 已執行完畢（載入順序：data.js → levels.js）
  // 但若 levels.js 先賦值咗 window.levels，呢度唔會改佢。
  const overrideLater = () => {
    try {
      if (typeof LEVELS !== 'undefined' && LEVELS.length > 0
          && (typeof window.levels === 'undefined' || !window.levels || window.levels.length < LEVELS.length)) {
        Object.defineProperty(window, 'levels', { value: LEVELS, writable: true, configurable: true });
      }
    } catch(e) { try { window.levels = LEVELS; } catch(e2){} }
  };
  if (document && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideLater, { once: true });
  } else {
    overrideLater();
  }
}

// ===== 向後相容：保留舊 API（給 game.js 部分未重構的函式使用）=====
const scenarioLibrary = { _levels: levels };
const regionNames = { hong_kong: "香港" };
