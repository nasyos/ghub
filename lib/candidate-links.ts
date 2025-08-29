// 候補者ごとの紐付け求人を localStorage で保持（MVP）
export type CandidateJobLink = {
  jobId: string
  jobTitle: string
  companyName: string
  location?: string
  status: "CA面談" | "書類選考" | "面接選考" | "内定" | "決定"
  interviewCount: number
  note?: string
  updatedAt: string // ISO
}

const KEY = "candidate_links_v1"

export function loadLinks(candidateId: string): CandidateJobLink[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}")
    return all[candidateId] || []
  } catch {
    return []
  }
}

export function saveLinks(candidateId: string, links: CandidateJobLink[]) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}")
    all[candidateId] = links
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {}
}

export function upsertLink(candidateId: string, link: CandidateJobLink) {
  const cur = loadLinks(candidateId)
  const i = cur.findIndex((x) => x.jobId === link.jobId)
  const next = [...cur]
  if (i >= 0) next[i] = link
  else next.unshift(link)
  saveLinks(candidateId, next)
}

export function removeLink(candidateId: string, jobId: string) {
  const cur = loadLinks(candidateId).filter((x) => x.jobId !== jobId)
  saveLinks(candidateId, cur)
}
