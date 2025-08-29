"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, MessageSquare, User, Copy, Bell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { notifySelectionUpdate } from "@/contexts/notification-context"
import { loadRecHistory, saveRecHistory, type RecSummary } from "@/lib/recommend-history"
import { publish, subscribe } from "@/lib/event-bus"
import { useToast } from "@/components/ui/use-toast"
import { audit } from "@/lib/audit-log"

interface JobSelectionProps {
  jobId: string
  onBack: () => void
  onNavigateToCandidateDetail?: (candidateId: string) => void
  onNavigateToMessages?: (candidateId: string) => void
}

interface SelectionCandidate {
  id: string
  candidateNo: string
  name: string
  nationality: string
  gender: string
  age: number
  status: "CA面談" | "書類選考" | "面接選考" | "内定" | "決定"
  interviewCount: number
  hasConsent: boolean
  assignedCA: string
  hasDocuments: boolean
  lastContact: string
  recentMemo: string
  isRecommended: boolean
}

const mockSelectionCandidates: SelectionCandidate[] = [
  {
    id: "1",
    candidateNo: "C001",
    name: "John Smith",
    nationality: "アメリカ",
    gender: "男性",
    age: 28,
    status: "CA面談",
    interviewCount: 1,
    hasConsent: true,
    assignedCA: "田中CA",
    hasDocuments: true,
    lastContact: "2024-01-15",
    recentMemo: "技術スキル高い、コミュニケーション良好",
    isRecommended: false,
  },
  {
    id: "2",
    candidateNo: "C002",
    name: "Maria Garcia",
    nationality: "スペイン",
    gender: "女性",
    age: 32,
    status: "書類選考",
    interviewCount: 0,
    hasConsent: true,
    assignedCA: "佐藤CA",
    hasDocuments: true,
    lastContact: "2024-01-14",
    recentMemo: "経験豊富、即戦力期待",
    isRecommended: true,
  },
  {
    id: "3",
    candidateNo: "C003",
    name: "Chen Wei",
    nationality: "中国",
    gender: "男性",
    age: 26,
    status: "面接選考",
    interviewCount: 2,
    hasConsent: true,
    assignedCA: "鈴木CA",
    hasDocuments: true,
    lastContact: "2024-01-13",
    recentMemo: "面接での印象良好、次回最終面接",
    isRecommended: false,
  },
  {
    id: "4",
    candidateNo: "C004",
    name: "Ahmed Hassan",
    nationality: "エジプト",
    gender: "男性",
    age: 30,
    status: "内定",
    interviewCount: 3,
    hasConsent: true,
    assignedCA: "田中CA",
    hasDocuments: true,
    lastContact: "2024-01-12",
    recentMemo: "内定承諾待ち",
    isRecommended: true,
  },
]

const mockRecommendationLog: Array<{
  id: string
  jobId: string
  candidateIds: string[]
  createdAt: string
  createdBy: string
  summary: string
}> = []

export function JobSelection({ jobId, onBack, onNavigateToCandidateDetail, onNavigateToMessages }: JobSelectionProps) {
  const { user, roleNormalized, canSeePage } = useAuth()
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<SelectionCandidate[]>(mockSelectionCandidates)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)
  const [recommendationSummary, setRecommendationSummary] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [history, setHistory] = useState<RecSummary[]>(() => loadRecHistory(jobId))

  const mockJob = {
    id: jobId,
    company: "株式会社テックソリューション",
    title: "ITエンジニア（フルスタック）",
    location: "東京都渋谷区",
  }

  useEffect(() => {
    setHistory(loadRecHistory(jobId))
  }, [jobId])

  useEffect(() => {
    const unsubscribe = subscribe?.((e: any) => {
      if (e?.type === "RECOMMEND_SUMMARY_CREATED" && e.payload?.jobId === jobId) {
        setHistory(loadRecHistory(jobId))
      }
    })
    return unsubscribe
  }, [jobId])

  const handleStatusUpdate = (candidateId: string, newStatus: SelectionCandidate["status"]) => {
    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate) return

    const prevStatus = candidate.status

    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c)))

    audit({
      action: "selection/status_update",
      actor: { id: user?.id, name: user?.name, role: roleNormalized },
      subject: { type: "candidate", id: candidateId, name: candidate.name },
      jobId: mockJob.id,
      meta: { from: prevStatus, to: newStatus },
    })

    if (
      roleNormalized === "ra" ||
      roleNormalized === "ra_manager" ||
      roleNormalized === "dual" ||
      roleNormalized === "admin"
    ) {
      notifySelectionUpdate({
        candidateId: candidate.id,
        candidateName: candidate.name,
        jobId: mockJob.id,
        jobTitle: mockJob.title,
        newStatus: newStatus,
        assignedCAId: candidate.assignedCA,
        actorRole: roleNormalized,
      })

      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }
  }

  const handleInterviewCountUpdate = (candidateId: string, count: number) => {
    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, interviewCount: count } : c)))
  }

  const handleMemoUpdate = (candidateId: string, memo: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, recentMemo: memo } : c)))
  }

  const handleRecommendationToggle = (candidateId: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isRecommended: !c.isRecommended } : c)))
  }

  const handleCopyRecommendation = () => {
    navigator.clipboard.writeText(recommendationSummary)

    const selectedRows = candidates.filter((c) => selectedCandidates.includes(c.id))
    const id = (crypto as any).randomUUID?.() ?? String(Date.now())

    saveRecHistory(jobId, {
      id,
      jobId: jobId,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: String(user?.id ?? ""),
        name: user?.name ?? "unknown",
        role: String(roleNormalized ?? user?.role ?? "admin"),
      },
      candidateIds: selectedRows.map((r) => r.id),
      candidateNames: selectedRows.map((r) => r.name),
      body: recommendationSummary,
      count: selectedRows.length,
    })

    publish?.({ type: "RECOMMEND_SUMMARY_CREATED", payload: { jobId: jobId } })

    audit({
      action: "selection/recommend_summary_created",
      actor: { id: user?.id, name: user?.name, role: roleNormalized },
      subject: { type: "job", id: mockJob.id, name: mockJob.title },
      jobId: mockJob.id,
      meta: { count: selectedRows.length, candidateIds: selectedRows.map((r) => r.id) },
    })

    const newLog = {
      id: Date.now().toString(),
      jobId,
      candidateIds: selectedCandidates,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || "Unknown",
      summary: recommendationSummary,
    }
    mockRecommendationLog.push(newLog)

    setShowRecommendationModal(false)
    setSelectedCandidates([])
    console.log("[v0] Recommendation log updated:", mockRecommendationLog)
  }

  const getStatusBadgeVariant = (status: SelectionCandidate["status"]) => {
    switch (status) {
      case "CA面談":
        return "secondary"
      case "書類選考":
        return "outline"
      case "面接選考":
        return "default"
      case "内定":
        return "secondary"
      case "決定":
        return "default"
      default:
        return "outline"
    }
  }

  const canChat = (canSeePage?.("messages") ?? false) && (roleNormalized === "dual" || roleNormalized === "admin")

  function handleOpenChat(row: { candidateId: string; name: string }) {
    if (!canChat) {
      toast({ title: "権限がありません", description: "この操作は実行できません。" })
      return
    }
    onNavigateToMessages?.(row.candidateId)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {showNotification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Bell className="h-4 w-4" />
          担当CAに通知を送信しました
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">求人別選考管理</h2>
            <div className="text-sm text-muted-foreground mt-1">
              {mockJob.id} / {mockJob.company} / {mockJob.title} / {mockJob.location}
            </div>
          </div>
        </div>

        {selectedCandidates.length > 0 && (
          <Dialog open={showRecommendationModal} onOpenChange={setShowRecommendationModal}>
            <DialogTrigger asChild>
              <Button>推薦サマリー作成 ({selectedCandidates.length}名)</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>推薦サマリー</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea value={recommendationSummary} readOnly className="min-h-[400px] font-mono text-sm" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRecommendationModal(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleCopyRecommendation}>
                    <Copy className="mr-2 h-4 w-4" />
                    コピーして記録
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>選考候補者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">該当者がいません (0名)</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">選択</TableHead>
                  <TableHead>候補者No</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>国籍</TableHead>
                  <TableHead>性別</TableHead>
                  <TableHead>年齢</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>面接回数</TableHead>
                  <TableHead>同意有無</TableHead>
                  <TableHead>担当CA</TableHead>
                  <TableHead>書類有無</TableHead>
                  <TableHead>最終連絡日</TableHead>
                  <TableHead>直近メモ</TableHead>
                  <TableHead>推薦フラグ</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCandidates((prev) => [...prev, candidate.id])
                          } else {
                            setSelectedCandidates((prev) => prev.filter((id) => id !== candidate.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{candidate.candidateNo}</TableCell>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>{candidate.nationality}</TableCell>
                    <TableCell>{candidate.gender}</TableCell>
                    <TableCell>{candidate.age}歳</TableCell>
                    <TableCell>
                      <Select
                        value={candidate.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(candidate.id, value as SelectionCandidate["status"])
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA面談">CA面談</SelectItem>
                          <SelectItem value="書類選考">書類選考</SelectItem>
                          <SelectItem value="面接選考">面接選考</SelectItem>
                          <SelectItem value="内定">内定</SelectItem>
                          <SelectItem value="決定">決定</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={candidate.interviewCount}
                        onChange={(e) => handleInterviewCountUpdate(candidate.id, Number.parseInt(e.target.value) || 0)}
                        className="w-16"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={candidate.hasConsent ? "default" : "secondary"}>
                        {candidate.hasConsent ? "有" : "無"}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate.assignedCA}</TableCell>
                    <TableCell>
                      <Badge variant={candidate.hasDocuments ? "default" : "secondary"}>
                        {candidate.hasDocuments ? "有" : "無"}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate.lastContact}</TableCell>
                    <TableCell className="max-w-48">
                      <Input
                        value={candidate.recentMemo}
                        onChange={(e) => handleMemoUpdate(candidate.id, e.target.value)}
                        placeholder="メモを入力..."
                        className="text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={candidate.isRecommended}
                        onCheckedChange={() => handleRecommendationToggle(candidate.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onNavigateToCandidateDetail?.(candidate.id)}>
                          <User className="h-4 w-4" />
                        </Button>
                        {canChat && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChat({ candidateId: candidate.id, name: candidate.name })}
                            data-testid={`jobsel-chat-${candidate.id}`}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card data-testid="rec-hist-panel" className="mt-4 max-w-full">
        <CardHeader className="py-3">
          <CardTitle className="text-base">推薦サマリー履歴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 ? (
            <div data-testid="rec-hist-empty" className="text-sm text-muted-foreground">
              履歴はまだありません
            </div>
          ) : (
            history.slice(0, 10).map((item) => (
              <div key={item.id} data-testid={`rec-hist-row-${item.id}`} className="rounded-lg border p-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {new Date(item.createdAt).toLocaleString()}・{item.createdBy.name}・{item.count}件
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      data-testid={`rec-hist-copy-${item.id}`}
                      onClick={() => {
                        navigator.clipboard.writeText(item.body)
                        toast({ title: "コピーしました" })
                      }}
                    >
                      コピー
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid={`rec-hist-open-${item.id}`}>
                          詳細
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="rec-hist-dialog">
                        <DialogHeader>
                          <DialogTitle>推薦サマリー</DialogTitle>
                          <DialogDescription>
                            {new Date(item.createdAt).toLocaleString()}／{item.createdBy.name}／{item.count}件
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-auto rounded bg-muted/40 p-3">
                          <pre className="whitespace-pre-wrap text-sm">{item.body}</pre>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(item.body)
                              toast({ title: "コピーしました" })
                            }}
                          >
                            テキストをコピー
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">{item.candidateNames.join(", ")}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
