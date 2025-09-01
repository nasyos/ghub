"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export function useCandidateDrawer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [candidateId, setCandidateId] = useState<string | null>(null)

  // URLから初期状態を取得
  useEffect(() => {
    const urlCandidateId = searchParams.get("candidateId")
    if (urlCandidateId) {
      setCandidateId(urlCandidateId)
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setCandidateId(null)
    }
  }, [searchParams])

  // Drawerを開く
  const openDrawer = useCallback((id: string) => {
    setCandidateId(id)
    setIsOpen(true)
    // URLを更新（履歴に追加しない）
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("candidateId", id)
    router.replace(newUrl.pathname + newUrl.search)
  }, [router])

  // Drawerを閉じる
  const closeDrawer = useCallback(() => {
    setIsOpen(false)
    setCandidateId(null)
    // URLからクエリパラメータを削除
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete("candidateId")
    router.replace(newUrl.pathname + newUrl.search)
  }, [router])

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeDrawer()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, closeDrawer])

  return {
    isOpen,
    candidateId,
    openDrawer,
    closeDrawer
  }
}

