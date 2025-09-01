

export type FitLevel = "High" | "Mid" | "Low"

export type ApplicationStage = 
  | "推薦済" 
  | "一次調整中" 
  | "一次確定" 
  | "一次完了" 
  | "二次調整中" 
  | "最終面接完了" 
  | "内定" 
  | "否決" 
  | "保留"

export type NextAction = 
  | "候補日提示" 
  | "日程確定" 
  | "結果入力" 
  | "返信待ち" 
  | "推薦送付" 
  | "その他"

export type MustMatchSummary = "全✓" | "△含む" | "×あり"

export type AwaitingParty = "employer" | "candidate" | "ra" | "ca" | null

export interface ApplicationRow {
  id: string
  stage: ApplicationStage
  next_action: NextAction
  candidate: { 
    id: string 
    name: string 
    code?: string
    nationality?: string
    age?: number
    japaneseLevel?: string
    visaStatus?: string
  }
  job: { 
    id: string 
    title: string 
    company: string
    location?: string
    salary?: string
  }
  must_match_summary: MustMatchSummary
  fit_level: FitLevel
  owners: { 
    ra: string 
    ca?: string
  }
  last_activity_at: string // ISO
  last_memo?: string
  awaiting_party?: AwaitingParty
  fit_explain?: { 
    mustViolations?: string[] 
    niceScore?: number 
    yearsOk?: boolean 
    hardIssues?: string[]
  }
  created_at: string
  updated_at: string
}

export interface PipelineFilters {
  jobId?: string
  stage?: ApplicationStage[]
  ownerRa?: string
  ownerCa?: string
  fit?: FitLevel[]
  must?: MustMatchSummary[]
  company?: string[]
  job?: string[]
  updatedPeriod?: string
  awaiting?: AwaitingParty[]
  q?: string
  myAssignmentsOnly?: boolean
  awaitingEmployer?: boolean
  awaitingCandidate?: boolean
  scheduleAdjusting?: boolean
  resultPending?: boolean
}

export interface ApplicationDetail extends ApplicationRow {
  resumeUrl?: string
  caNotes?: string
  requirementMatch?: {
    must: Array<{ requirement: string; match: boolean; note?: string }>
    nice: Array<{ requirement: string; score: number; note?: string }>
  }
  history?: Array<{
    id: string
    action: string
    timestamp: string
    user: string
    details?: string
  }>
}

// 選考タブ用の型定義
export type InterviewRound = "一次" | "二次" | "最終" | "その他"
export type InterviewFormat = "オンライン" | "対面"
export type InterviewResultType = "合格" | "不合格" | "保留"

export interface Interview {
  id: string
  round: InterviewRound
  start: string // ISO8601 with timezone
  durationMin: number
  mode: "online" | "onsite"
  location: string
  participants: string[]
  notes?: string
  result: "pass" | "fail" | "hold" | null
  companyComment?: string
  raComment?: string
  reason?: string
  followUpDate?: string
  commentCount: number
  status: "scheduled" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface InterviewComment {
  id: string
  interviewId: string
  text: string
  author: {
    id: string
    name: string
    role: "ra" | "ca" | "admin"
  }
  createdAt: string
}

export interface InterviewFormData {
  round: InterviewRound
  start: string
  durationMin: number
  mode: "online" | "onsite"
  location: string
  participants: string[]
  notes?: string
}

export interface InterviewResultData {
  result: "pass" | "fail" | "hold"
  companyComment?: string
  raComment?: string
  reason?: string
  followUpDate?: string
}

export interface ApplicationInterviews {
  stage: string
  next_action: string
  items: Interview[]
}
