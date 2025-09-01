

export type CandidateStatus = 
  | "紐付け前"
  | "推薦準備中"
  | "選考中"
  | "結果待ち"
  | "面談前"
  | "面談予定"
  | "面談後（未推薦）"
  | "推薦済み"
  | "内定"
  | "勤務中"
  | "選考辞退"
  | "紹介先なし"

export type DelayStatus = 
  | "normal"      // 0-6h: 白（正常）
  | "warning"     // 6-24h: 薄橙（注意）
  | "danger"      // 24-72h: 橙（警告）
  | "critical"    // 72h以上: 赤（危険）
  | "excluded"    // 灰色（遅延管理対象外）

export type PriorityStatus = 
  | "normal"      // 7日以上先
  | "warning"     // 3-6日以内
  | "danger"      // 2日以内
  | "critical"    // 当日
  | "overdue"     // 期日超過

export type AIJudgment = 
  | "ACTION_REQUIRED"  // 要返信
  | "INFORMATIONAL"    // 情報提供
  | "GREETING"         // 挨拶
  | "THANK_YOU"        // 感謝
  | "UNKNOWN"          // 不明

export interface Candidate {
  id: string
  candidateNo: string
  candidateNumber: string // 自動採番（表示専用）
  name: string
  country: string
  gender: string
  age: number
  desiredJob: string
  desiredLocation: string
  status: string
  candidateStatus: CandidateStatus
  residenceStatus: string
  residenceExpiry: string
  lastContact: string
  lastMessageReceivedAt: string // 最終受信日時
  nextScheduledDate?: string // 次回予定日
  avatar: string
  residence: string
  applicationRoute: string
  applicationLink: string
  facebookProfile: string
  messengerLink: string
  assignedCA: string
  assigned_ca_id: number
  facebook_user_id: string | null
  page_id: number
  external_id: string
  notes: string
  // 要返信フラグ関連
  requiresResponse?: boolean
  lastMessageAIJudgment?: AIJudgment
  lastMessageDirection?: "in" | "out"
  // 新規追加フィールド（すべて nullable）
  birthDate?: string | null
  addressDetail?: string | null
  email?: string | null
  phone?: string | null
  sns?: {
    facebook: string            // 必須（登録時必須）
    messenger?: string | null
    whatsapp?: string | null
    line?: string | null
    linkedin?: string | null
  }
  residenceCardNo?: string | null  // GET時はマスク
  visaUpdatable?: "yes" | "no" | "unknown" | null
  jpLevel?: "N1" | "N2" | "N3" | "N4" | "N5" | "不明" | null
}

export interface CandidateFilters {
  search?: string
  status?: CandidateStatus[]
  assignedCA?: string[]
  delayStatus?: DelayStatus[]
  priorityStatus?: PriorityStatus[]
  showOverdueOnly?: boolean
  showDelayedOnly?: boolean
  country?: string[]
  residence?: string[]
  desiredLocation?: string[]
  gender?: string[]
  residenceStatus?: string[]
  japaneseLevel?: string[]
  requiresResponse?: boolean
}

export interface CandidateListResponse {
  items: Candidate[]
  total: number
  page: number
  pageSize: number
}
