import { ApplicationRow, ApplicationDetail, ApplicationStage, NextAction, FitLevel, MustMatchSummary, AwaitingParty } from "@/lib/pipeline/types";

export const MOCK_APPLICATIONS: ApplicationRow[] = [
  {
    id: "app-1",
    stage: "推薦済",
    next_action: "候補日提示",
    candidate: {
      id: "candidate-1",
      name: "Nguyen Thi Mai",
      code: "C001",
      nationality: "ベトナム",
      age: 28,
      japaneseLevel: "N2",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "JOB001",
      title: "フロントエンドエンジニア",
      company: "テック株式会社",
      location: "東京",
      salary: "400-500万円"
    },
    must_match_summary: "全✓",
    fit_level: "High",
    owners: {
      ra: "田中",
      ca: "佐藤"
    },
    last_activity_at: "2024-01-20T10:30:00Z",
    last_memo: "候補者から面接希望の連絡あり。来週中に候補日を提示予定。",
    awaiting_party: "employer",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-20T10:30:00Z"
  },
  {
    id: "app-2",
    stage: "一次調整中",
    next_action: "日程確定",
    candidate: {
      id: "candidate-2",
      name: "Kumar Raj",
      code: "C002",
      nationality: "インド",
      age: 32,
      japaneseLevel: "N3",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "job-2",
      title: "バックエンドエンジニア",
      company: "スタートアップA",
      location: "大阪",
      salary: "450-550万円"
    },
    must_match_summary: "△含む",
    fit_level: "Mid",
    owners: {
      ra: "鈴木",
      ca: "高橋"
    },
    last_activity_at: "2024-01-19T14:20:00Z",
    last_memo: "企業から面接日程の候補日が届きました。候補者と調整中。",
    awaiting_party: "candidate",
    created_at: "2024-01-10T11:00:00Z",
    updated_at: "2024-01-19T14:20:00Z"
  },
  {
    id: "app-3",
    stage: "一次完了",
    next_action: "結果入力",
    candidate: {
      id: "candidate-3",
      name: "Li Wei",
      code: "C003",
      nationality: "中国",
      age: 29,
      japaneseLevel: "N2",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "JOB001",
      title: "フロントエンドエンジニア",
      company: "テック株式会社",
      location: "東京",
      salary: "400-500万円"
    },
    must_match_summary: "×あり",
    fit_level: "Low",
    owners: {
      ra: "田中",
      ca: "佐藤"
    },
    last_activity_at: "2024-01-18T16:45:00Z",
    last_memo: "一次面接完了。結果は良好だが、経験年数が要件より少ない。",
    awaiting_party: "ra",
    created_at: "2024-01-12T13:00:00Z",
    updated_at: "2024-01-18T16:45:00Z"
  },
  {
    id: "app-4",
    stage: "推薦済",
    next_action: "推薦送付",
    candidate: {
      id: "candidate-4",
      name: "Patel Arjun",
      code: "C004",
      nationality: "インド",
      age: 26,
      japaneseLevel: "N4",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "job-3",
      title: "AIエンジニア",
      company: "AIテック",
      location: "東京",
      salary: "500-600万円"
    },
    must_match_summary: "全✓",
    fit_level: "High",
    owners: {
      ra: "山田",
      ca: "田村"
    },
    last_activity_at: "2024-01-21T09:15:00Z",
    last_memo: "推薦書の準備完了。本日中に送付予定。",
    awaiting_party: null,
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-21T09:15:00Z"
  },
  {
    id: "app-5",
    stage: "二次調整中",
    next_action: "日程確定",
    candidate: {
      id: "candidate-5",
      name: "Chen Xiao",
      code: "C005",
      nationality: "中国",
      age: 31,
      japaneseLevel: "N1",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "job-4",
      title: "プロダクトマネージャー",
      company: "グローバル企業B",
      location: "東京",
      salary: "600-700万円"
    },
    must_match_summary: "△含む",
    fit_level: "Mid",
    owners: {
      ra: "鈴木",
      ca: "高橋"
    },
    last_activity_at: "2024-01-17T11:30:00Z",
    last_memo: "二次面接の日程調整中。企業の都合で来週以降になる見込み。",
    awaiting_party: "employer",
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-17T11:30:00Z"
  },
  {
    id: "app-6",
    stage: "最終面接完了",
    next_action: "結果入力",
    candidate: {
      id: "candidate-6",
      name: "Emma Thompson",
      code: "C006",
      nationality: "オーストラリア",
      age: 27,
      japaneseLevel: "N1",
      visaStatus: "ワーキングホリデー"
    },
    job: {
      id: "job-5",
      title: "テクニカルライター",
      company: "ドキュメントテック",
      location: "東京",
      salary: "350-450万円"
    },
    must_match_summary: "全✓",
    fit_level: "High",
    owners: {
      ra: "田中",
      ca: "佐藤"
    },
    last_activity_at: "2024-01-16T15:20:00Z",
    last_memo: "最終面接完了。結果は良好。内定の可能性が高い。",
    awaiting_party: "ra",
    created_at: "2024-01-05T09:00:00Z",
    updated_at: "2024-01-16T15:20:00Z"
  },
  {
    id: "app-7",
    stage: "内定",
    next_action: "その他",
    candidate: {
      id: "candidate-7",
      name: "Smith David",
      code: "C007",
      nationality: "アメリカ",
      age: 30,
      japaneseLevel: "N2",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "job-6",
      title: "プロダクトマネージャー",
      company: "スタートアップC",
      location: "東京",
      salary: "550-650万円"
    },
    must_match_summary: "全✓",
    fit_level: "High",
    owners: {
      ra: "山田",
      ca: "田村"
    },
    last_activity_at: "2024-01-15T13:45:00Z",
    last_memo: "内定決定。入社手続きのサポートを開始。",
    awaiting_party: null,
    created_at: "2024-01-03T11:00:00Z",
    updated_at: "2024-01-15T13:45:00Z"
  },
  {
    id: "app-8",
    stage: "否決",
    next_action: "その他",
    candidate: {
      id: "candidate-8",
      name: "Johnson Sarah",
      code: "C008",
      nationality: "イギリス",
      age: 28,
      japaneseLevel: "N3",
      visaStatus: "技術・人文知識・国際業務"
    },
    job: {
      id: "job-7",
      title: "UXデザイナー",
      company: "デザインテック",
      location: "大阪",
      salary: "400-500万円"
    },
    must_match_summary: "×あり",
    fit_level: "Low",
    owners: {
      ra: "鈴木",
      ca: "高橋"
    },
    last_activity_at: "2024-01-14T10:15:00Z",
    last_memo: "一次面接で否決。デザインスキルが要件に達していない。",
    awaiting_party: null,
    created_at: "2024-01-10T14:00:00Z",
    updated_at: "2024-01-14T10:15:00Z"
  }
];

export const MOCK_APPLICATION_DETAILS: Record<string, ApplicationDetail> = {
  "app-1": {
    ...MOCK_APPLICATIONS[0],
    resumeUrl: "/resumes/candidate-1.pdf",
    caNotes: "技術力は高いが、日本語のビジネスレベルは要確認。面接で確認が必要。",
    requirementMatch: {
      must: [
        { requirement: "React経験3年以上", match: true },
        { requirement: "TypeScript経験", match: true },
        { requirement: "日本語N2以上", match: true },
        { requirement: "在留資格あり", match: true }
      ],
      nice: [
        { requirement: "Next.js経験", score: 2 },
        { requirement: "UI/UX経験", score: 1 },
        { requirement: "英語力", score: 2 }
      ]
    },
    history: [
      {
        id: "hist-1",
        action: "推薦書送付",
        timestamp: "2024-01-20T10:30:00Z",
        user: "田中",
        details: "企業に推薦書を送付しました"
      },
      {
        id: "hist-2",
        action: "推薦書作成",
        timestamp: "2024-01-19T15:00:00Z",
        user: "佐藤",
        details: "推薦書を作成しました"
      }
    ]
  }
};

export function getMockApplications(): ApplicationRow[] {
  return MOCK_APPLICATIONS;
}

export function getMockApplicationDetail(id: string): ApplicationDetail | null {
  return MOCK_APPLICATION_DETAILS[id] || null;
}
