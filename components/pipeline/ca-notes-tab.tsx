"use client"

import { useState, useEffect, useCallback } from "react"
import { ApplicationRow } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { 
  Save, 
  Copy,
  Pin,
  PinOff,
  Send,
  Clock,
  User
} from "lucide-react"

interface CandidateNotes {
  summary: string
  body: string
  raAddon?: string
  isPinned: boolean
  updatedBy: { id: string; name: string }
  updatedAt: string
}

interface CANotesTabProps {
  application: ApplicationRow
  onNotesSaved?: (updatedApplication: ApplicationRow) => void
  onNavigateToRecommend?: () => void
}

export function CANotesTab({ application, onNotesSaved, onNavigateToRecommend }: CANotesTabProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState<CandidateNotes>({
    summary: "",
    body: "",
    raAddon: "",
    isPinned: false,
    updatedBy: { id: "", name: "" },
    updatedAt: ""
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // 既存のメモデータを読み込み
  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true)
      try {
        const existingNotes = await pipelineApi.getCANotes(application.id)
        if (existingNotes) {
          setNotes({
            summary: existingNotes.summary || "",
            body: existingNotes.body || "",
            raAddon: existingNotes.raAddon || "",
            isPinned: existingNotes.isPinned || false,
            updatedBy: existingNotes.updatedBy || { id: "", name: "" },
            updatedAt: existingNotes.updatedAt || ""
          })
        }
      } catch (error) {
        console.error("Failed to load CA notes:", error)
      } finally {
        setLoading(false)
      }
    }
    loadNotes()
  }, [application.id])

  // 自動保存のデバウンス処理
  const debouncedSave = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    const timeout = setTimeout(async () => {
      if (hasUnsavedChanges) {
        await handleSave()
      }
    }, 2000)

    setAutoSaveTimeout(timeout)
  }, [hasUnsavedChanges, autoSaveTimeout])

  // 入力変更時の処理
  const handleInputChange = (field: keyof CandidateNotes, value: string | boolean) => {
    setNotes(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    debouncedSave()
  }

  // 保存処理
  const handleSave = async () => {
    if (!hasUnsavedChanges) return

    setSaving(true)
    try {
      const response = await pipelineApi.saveCANotes(application.id, {
        summary: notes.summary,
        body: notes.body,
        raAddon: notes.raAddon || "",
        isPinned: notes.isPinned
      })

      if (response) {
        setNotes(prev => ({
          ...prev,
          updatedBy: response.updatedBy,
          updatedAt: response.updatedAt
        }))
        setHasUnsavedChanges(false)

        // アプリケーションの更新日時を更新
        const updatedApplication: ApplicationRow = {
          ...application,
          last_activity_at: response.last_activity_at
        }
        onNotesSaved?.(updatedApplication)

        toast({
          title: "保存完了",
          description: "CAメモを保存しました",
        })
      }
    } catch (error) {
      toast({
        title: "保存エラー",
        description: "CAメモの保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // コピー処理
  const handleCopy = async () => {
    try {
      const textToCopy = `${notes.summary}\n\n${notes.body}`
      await navigator.clipboard.writeText(textToCopy)
      toast({
        title: "コピー完了",
        description: "CAメモをクリップボードにコピーしました",
      })
    } catch (error) {
      toast({
        title: "コピーエラー",
        description: "クリップボードへのコピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  // 推薦に反映
  const handleReflectToRecommend = () => {
    onNavigateToRecommend?.()
  }

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        handleCopy()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [notes])

  // 文字数カウント
  const summaryCharCount = notes.summary?.length || 0
  const bodyCharCount = notes.body?.length || 0
  const raAddonCharCount = notes.raAddon?.length || 0

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">CAメモ</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              CA/RA共有メモ
            </Badge>
            {notes.updatedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>最終更新: {new Date(notes.updatedAt).toLocaleString('ja-JP')}</span>
                {notes.updatedBy.name && (
                  <>
                    <User className="h-3 w-3 ml-2" />
                    <span>{notes.updatedBy.name}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 要約 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">要約</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="pinned" className="text-sm">ピン留め</Label>
              <Switch
                id="pinned"
                checked={notes.isPinned}
                onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
              />
              {notes.isPinned ? <Pin className="h-4 w-4 text-blue-600" /> : <PinOff className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              value={notes.summary || ""}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="候補者の強み・懸念・希望条件を簡潔に記録してください（80-160字）"
              className="min-h-[80px] resize-none"
              maxLength={160}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>一覧プレビューや推薦に引用しやすいヘッドライン</span>
              <span className={summaryCharCount > 160 ? "text-red-500" : ""}>
                {summaryCharCount}/160
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メモ本文 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">メモ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              value={notes.body || ""}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="強み：〜&#10;懸念：〜&#10;希望条件：〜&#10;&#10;箇条書きやMarkdown記法（*・- #）が使用できます"
              className="min-h-[200px]"
              maxLength={10000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>自由記述（Markdown簡易対応）</span>
              <span className={bodyCharCount > 10000 ? "text-red-500" : ""}>
                {bodyCharCount}/10000
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RA補足 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">RA補足</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              value={notes.raAddon || ""}
              onChange={(e) => handleInputChange('raAddon', e.target.value)}
              placeholder="RAからの補足情報を入力してください（任意）"
              className="min-h-[60px] resize-none"
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>RA専用の補足コメント（CAにも表示されます）</span>
              <span className={raAddonCharCount > 200 ? "text-red-500" : ""}>
                {raAddonCharCount}/200
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={!notes.body.trim()}
          className="flex-1"
        >
          <Copy className="h-4 w-4 mr-2" />
          コピー
        </Button>
        <Button
          variant="outline"
          onClick={handleReflectToRecommend}
          disabled={!notes.summary.trim() && !notes.body.trim()}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          推薦に反映
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>

      {/* 編集中表示 */}
      {hasUnsavedChanges && (
        <div className="text-center text-sm text-muted-foreground">
          編集中... {autoSaveTimeout && "（2秒後に自動保存）"}
        </div>
      )}
    </div>
  )
}
