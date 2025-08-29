export interface MockFacebookPage {
  pageId: string
  name: string
  state: "Connected" | "Expiring15" | "Expiring7" | "Expired"
  connected: boolean
  tokenExpired?: boolean
}

export interface MockThread {
  id: string
  pageId: string
  candidateId?: string
  ownerCA?: string
  title?: string
  lastMessageAt: string
  unread: boolean
  recentTag?: string
  sendability: "active" | "human_agent" | "requires_tag" | "blocked"
}

export interface MockMessage {
  id: string
  threadId: string
  direction: "in" | "out"
  bodyOriginal: string
  lang?: string
  createdAt: string
  appliedTag?: string // Added appliedTag field
}

export const DEMO_PAGES: MockFacebookPage[] = [
  {
    pageId: "999_demo",
    name: "Demo Page",
    state: "Connected",
    connected: true,
    tokenExpired: false,
  },
  {
    pageId: "gh_jp",
    name: "GH Japan",
    state: "Connected",
    connected: true,
    tokenExpired: false,
  },
  {
    pageId: "gh_asia",
    name: "GH Asia",
    state: "Expiring7",
    connected: true,
    tokenExpired: false,
  },
  {
    pageId: "gh_old",
    name: "GH Old",
    state: "Expired",
    connected: false,
    tokenExpired: true,
  },
]

export const DEMO_PAGE: MockFacebookPage = DEMO_PAGES[0]

export const MOCK_THREADS: MockThread[] = [
  // GH Japan threads (Connected)
  {
    id: "thread-gh-jp-1",
    pageId: "gh_jp",
    candidateId: "candidate-1",
    ownerCA: "佐藤",
    title: "Nguyen Thi A",
    lastMessageAt: "2024-01-20T14:30:00Z",
    unread: true,
    recentTag: "初回連絡",
    sendability: "active",
  },
  {
    id: "thread-gh-jp-2",
    pageId: "gh_jp",
    candidateId: "candidate-2",
    ownerCA: "田中",
    title: "Kumar Raj",
    lastMessageAt: "2024-01-20T13:15:00Z",
    unread: false,
    recentTag: "書類確認",
    sendability: "human_agent",
  },
  {
    id: "thread-gh-jp-3",
    pageId: "gh_jp",
    candidateId: "candidate-3",
    ownerCA: "山田",
    title: "Li Wei",
    lastMessageAt: "2024-01-20T12:45:00Z",
    unread: true,
    recentTag: "初回面談",
    sendability: "requires_tag",
  },
  {
    id: "thread-gh-jp-4",
    pageId: "gh_jp",
    candidateId: "candidate-4",
    ownerCA: "佐藤",
    title: "Patel Arjun",
    lastMessageAt: "2024-01-20T11:20:00Z",
    unread: false,
    recentTag: "内定通知",
    sendability: "blocked",
  },
  {
    id: "thread-gh-jp-5",
    pageId: "gh_jp",
    candidateId: "candidate-30",
    ownerCA: "鈴木",
    title: "Smith David",
    lastMessageAt: "2024-01-20T09:20:00Z",
    unread: false,
    recentTag: "接続エラー",
    sendability: "blocked",
  },

  // GH Asia threads (Expiring7)
  {
    id: "thread-gh-asia-1",
    pageId: "gh_asia",
    candidateId: "candidate-4",
    ownerCA: "佐藤",
    title: "Patel Arjun",
    lastMessageAt: "2024-01-20T10:30:00Z",
    unread: true,
    recentTag: "書類依頼",
    sendability: "human_agent",
  },
  {
    id: "thread-gh-asia-2",
    pageId: "gh_asia",
    title: "未登録（ID:fb_user_456）",
    lastMessageAt: "2024-01-20T09:15:00Z",
    unread: false,
    recentTag: "初回連絡",
    sendability: "requires_tag",
  },
  {
    id: "thread-gh-asia-3",
    pageId: "gh_asia",
    candidateId: "candidate-5",
    ownerCA: "田中",
    title: "Chen Xiao",
    lastMessageAt: "2024-01-19T16:45:00Z",
    unread: true,
    recentTag: "面接調整",
    sendability: "human_agent",
  },
  {
    id: "thread-gh-asia-4",
    pageId: "gh_asia",
    candidateId: "candidate-6",
    ownerCA: "鈴木",
    title: "Singh Priya",
    lastMessageAt: "2024-01-19T15:20:00Z",
    unread: false,
    recentTag: "書類確認",
    sendability: "requires_tag",
  },

  // GH Old threads (Expired - should be blocked)
  {
    id: "thread-gh-old-1",
    pageId: "gh_old",
    candidateId: "candidate-7",
    ownerCA: "佐藤",
    title: "Johnson Mark",
    lastMessageAt: "2024-01-19T14:10:00Z",
    unread: true,
    recentTag: "選考中",
    sendability: "blocked",
  },
  {
    id: "thread-gh-old-2",
    pageId: "gh_old",
    title: "未登録（ID:fb_user_789）",
    lastMessageAt: "2024-01-19T13:30:00Z",
    unread: false,
    recentTag: "応募",
    sendability: "blocked",
  },

  // Demo page threads
  {
    id: "thread-demo-1",
    pageId: "999_demo",
    candidateId: "candidate-8",
    ownerCA: "田中",
    title: "Yamamoto Taro",
    lastMessageAt: "2024-01-19T12:00:00Z",
    unread: true,
    recentTag: "面接調整",
    sendability: "requires_tag",
  },
  {
    id: "thread-demo-2",
    pageId: "999_demo",
    ownerCA: "田中",
    title: "未登録（ID:fb_user_demo）",
    lastMessageAt: "2024-01-20T15:30:00Z", // Updated lastMessageAt to keep active
    unread: false,
    recentTag: "初回連絡",
    sendability: "active",
  },

  // CONFIRMED_EVENT_UPDATE examples (日程リマインド/変更)
  {
    id: "thread-tag-event-1",
    pageId: "gh_jp",
    candidateId: "candidate-9",
    ownerCA: "佐藤",
    title: "Park Min-jun (面接予定)",
    lastMessageAt: "2024-01-18T10:00:00Z", // 7+ days old to trigger requires_tag
    unread: true,
    recentTag: "面接調整",
    sendability: "requires_tag",
  },
  {
    id: "thread-tag-event-2",
    pageId: "gh_asia",
    candidateId: "candidate-10",
    ownerCA: "田中",
    title: "Rodriguez Maria (面接リスケ)",
    lastMessageAt: "2024-01-17T14:30:00Z", // 7+ days old to trigger requires_tag
    unread: false,
    recentTag: "日程変更",
    sendability: "requires_tag",
  },

  // ACCOUNT_UPDATE examples (情報確認/選考通知/進捗連絡)
  {
    id: "thread-tag-account-1",
    pageId: "gh_jp",
    candidateId: "candidate-11",
    ownerCA: "鈴木",
    title: "Thompson James (書類待ち)",
    lastMessageAt: "2024-01-16T09:15:00Z", // 7+ days old to trigger requires_tag
    unread: true,
    recentTag: "書類依頼",
    sendability: "requires_tag",
  },
  {
    id: "thread-tag-account-2",
    pageId: "gh_asia",
    candidateId: "candidate-12",
    ownerCA: "佐藤",
    title: "Kim So-young (選考結果)",
    lastMessageAt: "2024-01-15T16:45:00Z", // 7+ days old to trigger requires_tag
    unread: false,
    recentTag: "選考通知",
    sendability: "requires_tag",
  },

  // HUMAN_AGENT examples (24h-7日の自動付与)
  {
    id: "thread-tag-human-1",
    pageId: "gh_jp",
    title: "未登録（ID:fb_user_human1）",
    lastMessageAt: "2024-01-18T12:00:00Z", // 2-3 days old for human_agent
    unread: true,
    recentTag: "初回連絡",
    sendability: "human_agent",
  },
  {
    id: "thread-tag-human-2",
    pageId: "gh_asia",
    candidateId: "candidate-13",
    ownerCA: "田中",
    title: "Singh Rajesh (フォローアップ)",
    lastMessageAt: "2024-01-17T08:30:00Z", // 3-4 days old for human_agent
    unread: false,
    recentTag: "フォローアップ",
    sendability: "human_agent",
  },

  // Active examples (24時間以内)
  {
    id: "thread-tag-active-1",
    pageId: "gh_jp",
    candidateId: "candidate-14",
    ownerCA: "佐藤",
    title: "Wang Lei (即時対応)",
    lastMessageAt: "2024-01-20T16:00:00Z", // Recent for active
    unread: true,
    recentTag: "質問回答",
    sendability: "active",
  },
  {
    id: "thread-tag-active-2",
    pageId: "gh_asia",
    title: "未登録（ID:fb_user_active）",
    lastMessageAt: "2024-01-20T15:45:00Z", // Recent for active
    unread: false,
    recentTag: "応募",
    sendability: "active",
  },
]

export const MOCK_MESSAGES: MockMessage[] = [
  // GH Japan Thread 1 - Vietnamese candidate
  {
    id: "msg-gh-jp-1-1",
    threadId: "thread-gh-jp-1",
    direction: "in",
    bodyOriginal: "Hello! I saw your job posting and I am very interested. Could you tell me more about the position?",
    lang: "en",
    createdAt: "2024-01-20T14:00:00Z",
  },
  {
    id: "msg-gh-jp-1-2",
    threadId: "thread-gh-jp-1",
    direction: "out",
    bodyOriginal:
      "Hello! Thank you for your interest in the position.\n\nCould you please provide the following information:\n• Years of experience\n• Expected salary\n• Available start date",
    lang: "en",
    createdAt: "2024-01-20T14:15:00Z",
    appliedTag: "HUMAN_AGENT", // Added tag to show human agent auto-tagging
  },
  {
    id: "msg-gh-jp-1-3",
    threadId: "thread-gh-jp-1",
    direction: "in",
    bodyOriginal:
      "Thank you! I have 3 years of experience. My expected salary is 25-30 million yen per year. I can start working from March.",
    lang: "en",
    createdAt: "2024-01-20T14:30:00Z",
  },

  // GH Japan Thread 2 - Indian candidate with long message
  {
    id: "msg-gh-jp-2-1",
    threadId: "thread-gh-jp-2",
    direction: "in",
    bodyOriginal:
      "Hello! I am very excited about this opportunity. I have been working as a software engineer for the past 5 years, specializing in full-stack development with React, Node.js, and Python. I have experience working with international teams and I am fluent in English and Hindi. I would love to discuss how my skills can contribute to your team. Please find my portfolio here: https://kumar-portfolio.com",
    lang: "en",
    createdAt: "2024-01-20T13:00:00Z",
  },
  {
    id: "msg-gh-jp-2-2",
    threadId: "thread-gh-jp-2",
    direction: "out",
    bodyOriginal:
      "Thank you for your detailed message! Your background looks impressive. Could you please send us your latest resume? We'd also like to schedule a technical interview next week.",
    lang: "en",
    createdAt: "2024-01-20T13:15:00Z",
    appliedTag: "ACCOUNT_UPDATE", // Added tag to show manual tag selection
  },

  // GH Japan Thread 3 - Unregistered user
  {
    id: "msg-gh-jp-3-1",
    threadId: "thread-gh-jp-3",
    direction: "in",
    bodyOriginal: "Hi, I saw your job posting on Facebook. Is this position still available? 🤔",
    lang: "en",
    createdAt: "2024-01-20T12:30:00Z",
  },
  {
    id: "msg-gh-jp-3-2",
    threadId: "thread-gh-jp-3",
    direction: "in",
    bodyOriginal: "I have attached my resume for your review. [📎 Resume_John_Doe.pdf]",
    lang: "en",
    createdAt: "2024-01-20T12:45:00Z",
  },

  // GH Japan Thread 4 - Chinese candidate
  {
    id: "msg-gh-jp-4-1",
    threadId: "thread-gh-jp-4",
    direction: "in",
    bodyOriginal: "你好！我对这个职位很感兴趣。我有丰富的软件开发经验，特别是在人工智能和机器学习方面。",
    lang: "zh",
    createdAt: "2024-01-20T11:00:00Z",
  },
  {
    id: "msg-gh-jp-4-2",
    threadId: "thread-gh-jp-4",
    direction: "out",
    bodyOriginal:
      "こんにちは！AI・機械学習の経験をお持ちとのことですが、具体的にどのようなプロジェクトに携わられましたか？",
    lang: "ja",
    createdAt: "2024-01-20T11:20:00Z",
  },

  // GH Japan Thread 5 - Smith David
  {
    id: "msg-gh-jp-5-1",
    threadId: "thread-gh-jp-5",
    direction: "in",
    bodyOriginal: "Hello! I saw your job posting and I am very interested. Could you tell me more about the position?",
    lang: "en",
    createdAt: "2024-01-20T09:00:00Z",
  },
  {
    id: "msg-gh-jp-5-2",
    threadId: "thread-gh-jp-5",
    direction: "out",
    bodyOriginal:
      "Hello! Thank you for your interest in the position.\n\nCould you please provide the following information:\n• Years of experience\n• Expected salary\n• Available start date",
    lang: "en",
    createdAt: "2024-01-20T09:15:00Z",
    appliedTag: "HUMAN_AGENT", // Added tag to show human agent auto-tagging
  },

  // GH Asia Thread 1 - Hindi candidate
  {
    id: "msg-gh-asia-1-1",
    threadId: "thread-gh-asia-1",
    direction: "in",
    bodyOriginal: "नमस्ते! मैं इस नौकरी के अवसर में बहुत रुचि रखता हूं। क्या आप मुझे इस पद के बारे में और बता सकते हैं?",
    lang: "hi",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "msg-gh-asia-1-2",
    threadId: "thread-gh-asia-1",
    direction: "out",
    bodyOriginal:
      "Hello! Thank you for your interest. Could you please provide your educational background and work experience?",
    lang: "en",
    createdAt: "2024-01-20T10:30:00Z",
    appliedTag: "HUMAN_AGENT", // Added tag to show human agent auto-tagging
  },

  // GH Asia Thread 2 - Unregistered with emoji (requires_tag scenario)
  {
    id: "msg-gh-asia-2-1",
    threadId: "thread-gh-asia-2",
    direction: "in",
    bodyOriginal:
      "Hello! 👋 I'm interested in working with your company. Do you have any openings for software developers? 💻✨",
    lang: "en",
    createdAt: "2024-01-18T09:15:00Z", // Made this 7+ days old to trigger requires_tag
  },
  {
    id: "msg-gh-asia-2-2",
    threadId: "thread-gh-asia-2",
    direction: "out",
    bodyOriginal: "面接の日程についてご相談があります。来週の火曜日または水曜日はいかがでしょうか？",
    lang: "ja",
    createdAt: "2024-01-20T09:15:00Z",
    appliedTag: "CONFIRMED_EVENT_UPDATE", // Shows manual tag selection for scheduling
  },

  // GH Asia Thread 3 - Chinese candidate with 24h+ old message (requires_tag)
  {
    id: "msg-gh-asia-3-1",
    threadId: "thread-gh-asia-3",
    direction: "in",
    bodyOriginal: "您好！我想申请贵公司的职位。我有5年的工作经验，主要从事前端开发。",
    lang: "zh",
    createdAt: "2024-01-18T16:45:00Z", // 24h+ ago
  },
  {
    id: "msg-gh-asia-3-2",
    threadId: "thread-gh-asia-3",
    direction: "out",
    bodyOriginal:
      "こんにちは！ご応募ありがとうございます。フロントエンド開発のご経験について詳しく教えていただけますか？",
    lang: "ja",
    createdAt: "2024-01-19T16:45:00Z",
    appliedTag: "HUMAN_AGENT", // Added tag to show human agent auto-tagging
  },

  // GH Asia Thread 4 - Hindi candidate
  {
    id: "msg-gh-asia-4-1",
    threadId: "thread-gh-asia-4",
    direction: "in",
    bodyOriginal: "मैं एक अनुभवी डेवलपर हूं और जापान में काम करने में रुचि रखता हूं। क्या आप मुझे वीज़ा प्रक्रिया के बारे में बता सकते हैं?",
    lang: "hi",
    createdAt: "2024-01-17T15:00:00Z", // Made this 7+ days old to trigger requires_tag
  },
  {
    id: "msg-gh-asia-4-2",
    threadId: "thread-gh-asia-4",
    direction: "out",
    bodyOriginal: "ビザ申請に必要な書類についてご案内いたします。まず、最新の履歴書と卒業証明書をご準備ください。",
    lang: "ja",
    createdAt: "2024-01-19T15:20:00Z",
    appliedTag: "ACCOUNT_UPDATE", // Shows manual tag selection for document requests
  },

  // GH Old Thread 1 - Expired page (blocked)
  {
    id: "msg-gh-old-1-1",
    threadId: "thread-gh-old-1",
    direction: "in",
    bodyOriginal:
      "Hi, I'm interested in the software engineer position. I have 8 years of experience in full-stack development.",
    lang: "en",
    createdAt: "2024-01-19T14:00:00Z",
  },
  {
    id: "msg-gh-old-1-2",
    threadId: "thread-gh-old-1",
    direction: "out",
    bodyOriginal: "Thank you for your interest. We'll review your application and get back to you soon.",
    lang: "en",
    createdAt: "2024-01-19T14:10:00Z",
  },

  // GH Old Thread 2 - Expired page (blocked)
  {
    id: "msg-gh-old-2-1",
    threadId: "thread-gh-old-2",
    direction: "in",
    bodyOriginal: "Hello! Is this position still open? I'd like to apply. 🚀",
    lang: "en",
    createdAt: "2024-01-19T13:30:00Z",
  },

  // Demo Thread 1 - Japanese candidate (requires_tag scenario)
  {
    id: "msg-demo-1-1",
    threadId: "thread-demo-1",
    direction: "in",
    bodyOriginal: "Hello! I saw your job posting. I would like to apply for the Software Engineer position.",
    lang: "en",
    createdAt: "2024-01-17T11:45:00Z", // Made this 7+ days old to trigger requires_tag
  },
  {
    id: "msg-demo-1-2",
    threadId: "thread-demo-1",
    direction: "out",
    bodyOriginal: "Thank you for contacting us! Could you please send us your resume and work history?",
    lang: "en",
    createdAt: "2024-01-19T12:00:00Z",
    appliedTag: "ACCOUNT_UPDATE", // Shows manual tag selection for document requests
  },

  // Demo Thread 2 - Unregistered user (active scenario)
  {
    id: "msg-demo-2-1",
    threadId: "thread-demo-2",
    direction: "in",
    bodyOriginal:
      "Hi there! I'm a recent graduate looking for opportunities in software development. Do you have any entry-level positions? 🎓",
    lang: "en",
    createdAt: "2024-01-19T11:15:00Z",
  },
  {
    id: "msg-demo-2-2",
    threadId: "thread-demo-2",
    direction: "out",
    bodyOriginal:
      "Thank you for your interest! We do have entry-level positions available. Could you tell us about your programming experience?",
    lang: "en",
    createdAt: "2024-01-20T15:30:00Z", // Recent message to keep active
  },

  // CONFIRMED_EVENT_UPDATE examples
  {
    id: "msg-event-1-1",
    threadId: "thread-tag-event-1",
    direction: "in",
    bodyOriginal: "안녕하세요! 내일 면접 시간을 변경할 수 있을까요? 급한 일이 생겼습니다.",
    lang: "ko",
    createdAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "msg-event-1-2",
    threadId: "thread-tag-event-1",
    direction: "out",
    bodyOriginal: "I would like to discuss changing the interview schedule. How about next Tuesday at 2:00 PM?",
    lang: "en",
    createdAt: "2024-01-20T11:00:00Z",
    appliedTag: "CONFIRMED_EVENT_UPDATE", // Shows manual tag selection for scheduling
  },

  {
    id: "msg-event-2-1",
    threadId: "thread-tag-event-2",
    direction: "in",
    bodyOriginal: "Hello! I need to reschedule the interview for next week. Is that possible?",
    lang: "en",
    createdAt: "2024-01-17T14:30:00Z",
  },
  {
    id: "msg-event-2-2",
    threadId: "thread-tag-event-2",
    direction: "out",
    bodyOriginal: "I understand about rescheduling the interview. How about Thursday morning next week?",
    lang: "en",
    createdAt: "2024-01-20T10:30:00Z",
    appliedTag: "CONFIRMED_EVENT_UPDATE", // Shows manual tag selection for rescheduling
  },

  // ACCOUNT_UPDATE examples
  {
    id: "msg-account-1-1",
    threadId: "thread-tag-account-1",
    direction: "in",
    bodyOriginal: "Hi! I submitted my documents last week. Have you had a chance to review them?",
    lang: "en",
    createdAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "msg-account-1-2",
    threadId: "thread-tag-account-1",
    direction: "out",
    bodyOriginal: "書類の確認が完了いたしました。追加で職務経歴書の詳細版をお送りいただけますでしょうか？",
    lang: "ja",
    createdAt: "2024-01-20T14:15:00Z",
    appliedTag: "ACCOUNT_UPDATE", // Shows manual tag selection for document requests
  },

  {
    id: "msg-account-2-1",
    threadId: "thread-tag-account-2",
    direction: "in",
    bodyOriginal: "안녕하세요! 선발 결과는 언제쯤 알 수 있을까요?",
    lang: "ko",
    createdAt: "2024-01-15T16:45:00Z",
  },
  {
    id: "msg-account-2-2",
    threadId: "thread-tag-account-2",
    direction: "out",
    bodyOriginal: "選考結果についてご連絡いたします。書類選考を通過されましたので、次回面接の詳細をお送りします。",
    lang: "ja",
    createdAt: "2024-01-20T13:45:00Z",
    appliedTag: "ACCOUNT_UPDATE", // Shows manual tag selection for selection results
  },

  // HUMAN_AGENT examples (auto-tagged)
  {
    id: "msg-human-1-1",
    threadId: "thread-tag-human-1",
    direction: "in",
    bodyOriginal:
      "Hello! I'm interested in software engineering positions at your company. Could you provide more information?",
    lang: "en",
    createdAt: "2024-01-18T12:00:00Z",
  },
  {
    id: "msg-human-1-2",
    threadId: "thread-tag-human-1",
    direction: "out",
    bodyOriginal:
      "Thank you for your interest! We have several openings. Could you tell us about your technical background?",
    lang: "en",
    createdAt: "2024-01-20T12:30:00Z",
    appliedTag: "HUMAN_AGENT", // Shows automatic tagging for human_agent state
  },

  {
    id: "msg-human-2-1",
    threadId: "thread-tag-human-2",
    direction: "in",
    bodyOriginal: "मैंने पिछले सप्ताह आवेदन भेजा था। क्या आप मुझे स्थिति के बारे में बता सकते हैं?",
    lang: "hi",
    createdAt: "2024-01-17T08:30:00Z",
  },
  {
    id: "msg-human-2-2",
    threadId: "thread-tag-human-2",
    direction: "out",
    bodyOriginal: "ご応募いただきありがとうございます。現在書類選考中です。来週中には結果をご連絡いたします。",
    lang: "ja",
    createdAt: "2024-01-20T09:00:00Z",
    appliedTag: "HUMAN_AGENT", // Shows automatic tagging for human_agent state
  },

  // Active examples (no tags needed)
  {
    id: "msg-active-1-1",
    threadId: "thread-tag-active-1",
    direction: "in",
    bodyOriginal: "你好！我想了解更多关于这个职位的信息。工作地点在哪里？",
    lang: "zh",
    createdAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "msg-active-1-2",
    threadId: "thread-tag-active-1",
    direction: "out",
    bodyOriginal: "こんにちは！勤務地は東京都渋谷区です。リモートワークも可能です。他にご質問はございますか？",
    lang: "ja",
    createdAt: "2024-01-20T16:00:00Z",
    // No appliedTag - active state doesn't require tags
  },

  {
    id: "msg-active-2-1",
    threadId: "thread-tag-active-2",
    direction: "in",
    bodyOriginal: "Hi! I just applied through your website. When can I expect to hear back? 🤞",
    lang: "en",
    createdAt: "2024-01-20T15:45:00Z",
  },
  // No response yet - showing active state for immediate response capability
]

export const MOCK_CANDIDATES = [
  {
    id: "candidate-1",
    name: "Nguyen Thi Mai",
    nationality: "ベトナム",
    gender: "女性",
    age: 28,
    desiredJobType: "フロントエンドエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "面接選考",
    assignedCA: "佐藤",
    email: "nguyen.mai@example.com",
    phone: "090-1234-5678",
    experience: "3年",
    skills: ["React", "TypeScript", "CSS"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-2",
    name: "Kumar Raj",
    nationality: "インド",
    gender: "男性",
    age: 32,
    desiredJobType: "バックエンドエンジニア",
    desiredWorkLocation: "大阪",
    candidateStatus: "書類選考",
    assignedCA: "田中",
    email: "kumar.raj@example.com",
    phone: "080-2345-6789",
    experience: "5年",
    skills: ["Python", "Django", "PostgreSQL"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-3",
    name: "Li Wei",
    nationality: "中国",
    gender: "男性",
    age: 29,
    desiredJobType: "AIエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "CA面談",
    assignedCA: "鈴木",
    email: "li.wei@example.com",
    phone: "070-3456-7890",
    experience: "4年",
    skills: ["Python", "TensorFlow", "PyTorch"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-4",
    name: "Patel Arjun",
    nationality: "インド",
    gender: "男性",
    age: 26,
    desiredJobType: "フロントエンドエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "書類選考",
    assignedCA: "佐藤",
    email: "patel.arjun@example.com",
    phone: "090-4567-8901",
    experience: "3年",
    skills: ["React", "JavaScript", "CSS"],
    japaneseLevel: "N4",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-5",
    name: "Chen Xiao",
    nationality: "中国",
    gender: "女性",
    age: 31,
    desiredJobType: "バックエンドエンジニア",
    desiredWorkLocation: "大阪",
    candidateStatus: "面接選考",
    assignedCA: "田中",
    email: "chen.xiao@example.com",
    phone: "080-5678-9012",
    experience: "6年",
    skills: ["Node.js", "Express", "MongoDB"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-6",
    name: "Singh Priya",
    nationality: "インド",
    gender: "女性",
    age: 27,
    desiredJobType: "AIエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "CA面談",
    assignedCA: "鈴木",
    email: "singh.priya@example.com",
    phone: "070-6789-0123",
    experience: "4年",
    skills: ["Python", "Machine Learning", "TensorFlow"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-7",
    name: "Johnson Mark",
    nationality: "アメリカ",
    gender: "男性",
    age: 35,
    desiredJobType: "システムエンジニア",
    desiredWorkLocation: "横浜",
    candidateStatus: "選考終了",
    assignedCA: "佐藤",
    email: "johnson.mark@example.com",
    phone: "090-7890-1234",
    experience: "10年",
    skills: ["Java", "Spring", "AWS"],
    japaneseLevel: "N1",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-8",
    name: "Yamamoto Taro",
    nationality: "日本",
    gender: "男性",
    age: 30,
    desiredJobType: "フロントエンドエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "面接選考",
    assignedCA: "田中",
    email: "yamamoto.taro@example.com",
    phone: "080-8901-2345",
    experience: "5年",
    skills: ["Vue.js", "Nuxt.js", "SCSS"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-9",
    name: "Park Min-jun",
    nationality: "韓国",
    gender: "男性",
    age: 27,
    desiredJobType: "バックエンドエンジニア",
    desiredWorkLocation: "大阪",
    candidateStatus: "面接選考",
    assignedCA: "鈴木",
    email: "park.minjun@example.com",
    phone: "070-9012-3456",
    experience: "3年",
    skills: ["Java", "Spring Boot", "MySQL"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-10",
    name: "Rodriguez Maria",
    nationality: "スペイン",
    gender: "女性",
    age: 29,
    desiredJobType: "データサイエンティスト",
    desiredWorkLocation: "名古屋",
    candidateStatus: "内定",
    assignedCA: "佐藤",
    email: "rodriguez.maria@example.com",
    phone: "090-0123-4567",
    experience: "7年",
    skills: ["R", "Python", "SQL", "Tableau"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-11",
    name: "Thompson James",
    nationality: "イギリス",
    gender: "男性",
    age: 33,
    desiredJobType: "プロダクトマネージャー",
    desiredWorkLocation: "福岡",
    candidateStatus: "面接選考",
    assignedCA: "田中",
    email: "thompson.james@example.com",
    phone: "080-1234-5678",
    experience: "6年",
    skills: ["Agile", "Scrum", "Jira"],
    japaneseLevel: "N2",
    visaStatus: "日本人の配偶者等",
  },
  {
    id: "candidate-12",
    name: "Kim So-young",
    nationality: "韓国",
    gender: "女性",
    age: 25,
    desiredJobType: "ゲームプログラマー",
    desiredWorkLocation: "東京",
    candidateStatus: "書類選考",
    assignedCA: "鈴木",
    email: "kim.soyoung@example.com",
    phone: "070-2345-6789",
    experience: "4年",
    skills: ["Unity", "C#", "Unreal Engine"],
    japaneseLevel: "N4",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-13",
    name: "Singh Rajesh",
    nationality: "インド",
    gender: "男性",
    age: 31,
    desiredJobType: "モバイルアプリ開発者",
    desiredWorkLocation: "大阪",
    candidateStatus: "決定",
    assignedCA: "佐藤",
    email: "singh.rajesh@example.com",
    phone: "090-3456-7890",
    experience: "8年",
    skills: ["Swift", "Kotlin", "React Native"],
    japaneseLevel: "N1",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-14",
    name: "Wang Lei",
    nationality: "中国",
    gender: "男性",
    age: 30,
    desiredJobType: "システムエンジニア",
    desiredWorkLocation: "横浜",
    candidateStatus: "面接選考",
    assignedCA: "鈴木",
    email: "wang.lei@example.com",
    phone: "080-4567-8901",
    experience: "5年",
    skills: ["Java", "Spring", "AWS"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-15",
    name: "Sarah Johnson",
    nationality: "カナダ",
    gender: "女性",
    age: 26,
    desiredJobType: "UXデザイナー",
    desiredWorkLocation: "東京",
    candidateStatus: "面談前",
    assignedCA: "佐藤",
    email: "sarah.johnson@example.com",
    phone: "090-5678-9012",
    experience: "2年",
    skills: ["Figma", "Adobe XD", "Sketch"],
    japaneseLevel: "N4",
    visaStatus: "ワーキングホリデー",
  },
  {
    id: "candidate-16",
    name: "Ahmed Hassan",
    nationality: "エジプト",
    gender: "男性",
    age: 34,
    desiredJobType: "データサイエンティスト",
    desiredWorkLocation: "名古屋",
    candidateStatus: "内定",
    assignedCA: "田中",
    email: "ahmed.hassan@example.com",
    phone: "080-6789-0123",
    experience: "7年",
    skills: ["R", "Python", "SQL", "Tableau"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-17",
    name: "Maria Santos",
    nationality: "ブラジル",
    gender: "女性",
    age: 30,
    desiredJobType: "プロダクトマネージャー",
    desiredWorkLocation: "福岡",
    candidateStatus: "面接選考",
    assignedCA: "鈴木",
    email: "maria.santos@example.com",
    phone: "070-7890-1234",
    experience: "6年",
    skills: ["Agile", "Scrum", "Jira"],
    japaneseLevel: "N2",
    visaStatus: "日本人の配偶者等",
  },
  {
    id: "candidate-18",
    name: "Jean-Pierre Dubois",
    nationality: "フランス",
    gender: "男性",
    age: 28,
    desiredJobType: "ゲームプログラマー",
    desiredWorkLocation: "東京",
    candidateStatus: "書類選考",
    assignedCA: "佐藤",
    email: "jp.dubois@example.com",
    phone: "090-8901-2345",
    experience: "3年",
    skills: ["Unity", "C#", "Unreal Engine"],
    japaneseLevel: "N4",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-19",
    name: "Olga Petrov",
    nationality: "ロシア",
    gender: "女性",
    age: 31,
    desiredJobType: "システムエンジニア",
    desiredWorkLocation: "横浜",
    candidateStatus: "決定",
    assignedCA: "田中",
    email: "olga.petrov@example.com",
    phone: "080-9012-3456",
    experience: "8年",
    skills: ["Java", "Spring", "AWS"],
    japaneseLevel: "N1",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-20",
    name: "Carlos Rodriguez",
    nationality: "メキシコ",
    gender: "男性",
    age: 27,
    desiredJobType: "モバイルアプリ開発者",
    desiredWorkLocation: "大阪",
    candidateStatus: "面接選考",
    assignedCA: "鈴木",
    email: "carlos.rodriguez@example.com",
    phone: "070-0123-4567",
    experience: "4年",
    skills: ["Swift", "Kotlin", "React Native"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-21",
    name: "Anna Kowalski",
    nationality: "ポーランド",
    gender: "女性",
    age: 25,
    desiredJobType: "Webデザイナー",
    desiredWorkLocation: "京都",
    candidateStatus: "CA面談",
    assignedCA: "佐藤",
    email: "anna.kowalski@example.com",
    phone: "090-1234-5678",
    experience: "2年",
    skills: ["HTML", "CSS", "JavaScript", "Photoshop"],
    japaneseLevel: "N4",
    visaStatus: "留学",
  },
  {
    id: "candidate-22",
    name: "David Kim",
    nationality: "韓国",
    gender: "男性",
    age: 33,
    desiredJobType: "DevOpsエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "面接選考",
    assignedCA: "田中",
    email: "david.kim@example.com",
    phone: "080-2345-6789",
    experience: "6年",
    skills: ["Docker", "Kubernetes", "Jenkins"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-23",
    name: "Isabella Garcia",
    nationality: "スペイン",
    gender: "女性",
    age: 29,
    desiredJobType: "マーケティングスペシャリスト",
    desiredWorkLocation: "神戸",
    candidateStatus: "書類選考",
    assignedCA: "鈴木",
    email: "isabella.garcia@example.com",
    phone: "070-3456-7890",
    experience: "5年",
    skills: ["Google Analytics", "SEO", "SNS運用"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-24",
    name: "Michael O'Connor",
    nationality: "アイルランド",
    gender: "男性",
    age: 35,
    desiredJobType: "ITコンサルタント",
    desiredWorkLocation: "東京",
    candidateStatus: "内定",
    assignedCA: "佐藤",
    email: "michael.oconnor@example.com",
    phone: "090-4567-8901",
    experience: "10年",
    skills: ["SAP", "Oracle", "Project Management"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-25",
    name: "Fatima Al-Zahra",
    nationality: "モロッコ",
    gender: "女性",
    age: 26,
    desiredJobType: "QAエンジニア",
    desiredWorkLocation: "札幌",
    candidateStatus: "面接前",
    assignedCA: "田中",
    email: "fatima.alzahra@example.com",
    phone: "080-5678-9012",
    experience: "3年",
    skills: ["Selenium", "Jest", "Cypress"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-26",
    name: "Lars Andersson",
    nationality: "スウェーデン",
    gender: "男性",
    age: 32,
    desiredJobType: "セキュリティエンジニア",
    desiredWorkLocation: "東京",
    candidateStatus: "CA面談",
    assignedCA: "鈴木",
    email: "lars.andersson@example.com",
    phone: "070-6789-0123",
    experience: "7年",
    skills: ["Penetration Testing", "CISSP", "Firewall"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-27",
    name: "Priya Sharma",
    nationality: "インド",
    gender: "女性",
    age: 24,
    desiredJobType: "フロントエンドエンジニア",
    desiredWorkLocation: "広島",
    candidateStatus: "面接選考",
    assignedCA: "佐藤",
    email: "priya.sharma@example.com",
    phone: "090-7890-1234",
    experience: "1年",
    skills: ["Vue.js", "Nuxt.js", "SCSS"],
    japaneseLevel: "N4",
    visaStatus: "留学",
  },
  {
    id: "candidate-28",
    name: "Roberto Silva",
    nationality: "ポルトガル",
    gender: "男性",
    age: 30,
    desiredJobType: "データベースエンジニア",
    desiredWorkLocation: "仙台",
    candidateStatus: "書類選考",
    assignedCA: "田中",
    email: "roberto.silva@example.com",
    phone: "080-8901-2345",
    experience: "5年",
    skills: ["MySQL", "MongoDB", "Redis"],
    japaneseLevel: "N3",
    visaStatus: "技術・人文知識・国際業務",
  },
  {
    id: "candidate-29",
    name: "Emma Thompson",
    nationality: "オーストラリア",
    gender: "女性",
    age: 27,
    desiredJobType: "テクニカルライター",
    desiredWorkLocation: "東京",
    candidateStatus: "決定",
    assignedCA: "鈴木",
    email: "emma.thompson@example.com",
    phone: "070-9012-3456",
    experience: "4年",
    skills: ["Technical Writing", "Markdown", "API Documentation"],
    japaneseLevel: "N1",
    visaStatus: "ワーキングホリデー",
  },
  {
    id: "candidate-30",
    name: "Smith David",
    nationality: "アメリカ",
    gender: "男性",
    age: 30,
    desiredJobType: "プロダクトマネージャー",
    desiredWorkLocation: "東京",
    candidateStatus: "面接選考",
    assignedCA: "鈴木",
    email: "smith.david@example.com",
    phone: "080-5678-9012",
    experience: "6年",
    skills: ["Project Management", "Agile", "Scrum"],
    japaneseLevel: "N2",
    visaStatus: "技術・人文知識・国際業務",
    facebookProfile: "https://facebook.com/smith.david",
  },
]

// Initialize mock data in localStorage
export function initializeMockData(): void {
  if (typeof window === "undefined") return

  // Initialize threads if not exists
  if (!localStorage.getItem("mock_message_threads")) {
    localStorage.setItem("mock_message_threads", JSON.stringify(MOCK_THREADS))
  }

  // Initialize messages if not exists
  if (!localStorage.getItem("mock_messages")) {
    localStorage.setItem("mock_messages", JSON.stringify(MOCK_MESSAGES))
  }

  // Initialize candidates if not exists
  if (!localStorage.getItem("mock_candidates")) {
    localStorage.setItem("mock_candidates", JSON.stringify(MOCK_CANDIDATES))
  }
}

// Get mock data from localStorage
export function getMockThreads(): MockThread[] {
  if (typeof window === "undefined") return MOCK_THREADS

  const stored = localStorage.getItem("mock_message_threads")
  return stored ? JSON.parse(stored) : MOCK_THREADS
}

export function getMockMessages(): MockMessage[] {
  if (typeof window === "undefined") return MOCK_MESSAGES

  const stored = localStorage.getItem("mock_messages")
  return stored ? JSON.parse(stored) : MOCK_MESSAGES
}

export function getMockCandidates() {
  if (typeof window === "undefined") return MOCK_CANDIDATES

  const stored = localStorage.getItem("mock_candidates")
  return stored ? JSON.parse(stored) : MOCK_CANDIDATES
}

// Save mock data to localStorage
export function saveMockThreads(threads: MockThread[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_message_threads", JSON.stringify(threads))
  }
}

export function saveMockMessages(messages: MockMessage[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_messages", JSON.stringify(messages))
  }
}

export function getDemoPages(): MockFacebookPage[] {
  return DEMO_PAGES
}

export function getMockPageById(pageId: string): MockFacebookPage | undefined {
  return DEMO_PAGES.find((page) => page.pageId === pageId)
}
