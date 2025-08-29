// 簡易イベントバス（タブ間用）：BroadcastChannel→window.postMessageフォールバック
type AppEvent =
  | {
      type: "SELECTION_STATUS_UPDATED"
      payload: {
        candidateId: string
        candidateName: string
        jobId: string
        jobTitle: string
        newStatus: string
        assignedCAId: string
        actorRole: "ra" | "ra_manager" | "dual" | "admin" | "ca" | "ca_manager"
      }
    }
  | {
      type: "OPEN_COMMUNITIES_WITH"
      payload?: {
        keyword?: string
        country?: string
        scroll?: boolean
      }
    }
  | { type: "RECOMMEND_SUMMARY_CREATED"; payload: { jobId: string } }
  | {
      type: "NEW_CANDIDATE_CREATED"
      payload: {
        candidateNo: string
        candidateName: string
        assignedCAId: number | null
      }
    }

export type { AppEvent }

const CH = typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("app-events") : null

export function publish(event: AppEvent) {
  if (CH) CH.postMessage(event)
  else if (typeof window !== "undefined") window.postMessage({ __APP_EVENT__: event }, "*")
}

export function subscribe(handler: (e: AppEvent) => void) {
  const bc = (ev: MessageEvent) => {
    if ((ev as any).data?.type) handler((ev as any).data)
  }
  const pm = (ev: MessageEvent) => {
    const data = (ev as any).data?.__APP_EVENT__
    if (data?.type) handler(data)
  }
  CH?.addEventListener("message", (ev: any) => handler(ev.data))
  if (typeof window !== "undefined") window.addEventListener("message", pm)
  return () => {
    CH?.removeEventListener("message", (ev: any) => handler(ev.data))
    if (typeof window !== "undefined") window.removeEventListener("message", pm)
  }
}
