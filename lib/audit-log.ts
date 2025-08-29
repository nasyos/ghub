// lib/audit-log.ts
export type AuditEvent = {
  id: string
  ts: string // ISO
  actor?: { id?: string; name?: string; role?: string }
  action: string // 例: "selection/status_update"
  subject?: { type?: string; id?: string; name?: string }
  jobId?: string
  meta?: Record<string, any>
}

const KEY = "audit_log_v1"
const MAX = 2000

export function audit(ev: Omit<AuditEvent, "id" | "ts">) {
  try {
    const item: AuditEvent = {
      id: (crypto as any).randomUUID?.() ?? String(Date.now()),
      ts: new Date().toISOString(),
      ...ev,
    }
    const raw = localStorage.getItem(KEY)
    const arr: AuditEvent[] = raw ? JSON.parse(raw) : []
    arr.push(item)
    if (arr.length > MAX) arr.splice(0, arr.length - MAX)
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {}
}

export function getAudit(): AuditEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}
