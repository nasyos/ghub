"use client"
import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { subscribe, publish, type AppEvent } from "@/lib/event-bus"
import { useToast } from "@/hooks/use-toast"

// 未読カウントのキー（サイドバーと連動）
type BadgeKey = "candidates" | "jobSelection" | "messages"
type Unread = Record<BadgeKey, number>

// 通知設定（音は無し）
type Prefs = { popupEnabled: boolean }
const loadPrefs = (): Prefs => {
  if (typeof window === "undefined") return { popupEnabled: true }
  try {
    const v = JSON.parse(localStorage.getItem("notify_prefs") || "{}")
    return { popupEnabled: v.popupEnabled ?? true }
  } catch {
    return { popupEnabled: true }
  }
}

interface NotificationCtx {
  unread: Unread
  markAllRead: (key?: BadgeKey) => void
  pushLocal: (msg: string, key?: BadgeKey) => void
  setPrefs: (p: Prefs) => void
  prefs: Prefs
}

const Ctx = createContext<NotificationCtx | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [unread, setUnread] = useState<Unread>({ candidates: 0, jobSelection: 0, messages: 0 })
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs())

  const setPrefs = (p: Prefs) => {
    setPrefsState(p)
    try {
      localStorage.setItem("notify_prefs", JSON.stringify(p))
    } catch {}
  }

  // タブ間イベント購読
  useEffect(() => {
    return subscribe((e: AppEvent) => {
      if (e.type === "SELECTION_STATUS_UPDATED") {
        // 担当CAへの通知のみ表示対象
        // ここでは受信側で担当CAかどうかの最終判断はUI側に任せる実装にしてもOK
        if (prefs.popupEnabled) {
          toast({
            title: "選考更新",
            description: `${e.payload.candidateName} が「${e.payload.newStatus}」に更新されました（求人：${e.payload.jobTitle}）`,
          })
        }
        setUnread((u) => ({ ...u, candidates: u.candidates + 1 }))
      }
      // 新しい候補者作成イベントの処理を追加
      if (e.type === "NEW_CANDIDATE_CREATED") {
        if (prefs.popupEnabled) {
          toast({
            title: "新規候補者",
            description: `${e.payload.candidateName} が応募しました（受付番号：${e.payload.candidateNo}）`,
          })
        }
        setUnread((u) => ({ ...u, candidates: u.candidates + 1 }))
      }
    })
  }, [prefs.popupEnabled, toast])

  const api: NotificationCtx = useMemo(
    () => ({
      unread,
      prefs,
      setPrefs,
      markAllRead: (key?: BadgeKey) => {
        setUnread((u) => (key ? { ...u, [key]: 0 } : { candidates: 0, jobSelection: 0, messages: 0 }))
      },
      pushLocal: (msg, key = "candidates") => {
        if (prefs.popupEnabled) toast({ title: msg })
        setUnread((u) => ({ ...u, [key]: u[key] + 1 }))
      },
    }),
    [unread, prefs, toast],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useNotifications = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error("useNotifications must be used within NotificationProvider")
  return c
}

// 外部から発火：RA側の更新で呼ぶ
export const notifySelectionUpdate = (payload: AppEvent["payload"]) => {
  publish({ type: "SELECTION_STATUS_UPDATED", payload })
}
