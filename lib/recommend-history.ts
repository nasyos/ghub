export type RecSummary = {
  id: string
  jobId: string
  createdAt: string // ISO
  createdBy: { id: string; name: string; role: string }
  candidateIds: string[]
  candidateNames: string[]
  body: string // スナップショット（成形テキスト）
  count: number
}

const KEY = "rec_history_v1"

export function loadRecHistory(jobId: string): RecSummary[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}")
    return all[jobId] || []
  } catch {
    return []
  }
}

export function saveRecHistory(jobId: string, item: RecSummary) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}")
    const arr = [item, ...(all[jobId] || [])].slice(0, 50) // 直近50件
    all[jobId] = arr
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {}
}
