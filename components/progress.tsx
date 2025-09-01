"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress as ProgressBar } from "@/components/ui/progress"
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProgressItem {
  id: string
  jobId: string
  jobTitle: string
  company: string
  status: "applied" | "screening" | "interview1" | "interview2" | "final" | "offered" | "rejected" | "withdrawn"
  appliedDate: string
  lastUpdated: string
  nextAction?: string
  notes?: string
  interviewer?: string
  scheduledDate?: string
}

interface ProgressHistory {
  id: string
  progressId: string
  action: "status_change" | "note_update" | "action_update" | "interviewer_update" | "date_update"
  oldValue?: string
  newValue: string
  timestamp: string
  updatedBy: string
  description: string
}

interface ProgressProps {
  candidateId: string
  candidateName: string
}

// モックデータ
const mockProgress: ProgressItem[] = [
  {
    id: "1",
    jobId: "JOB001",
    jobTitle: "介護職員",
    company: "株式会社ABC介護",
    status: "interview1",
    appliedDate: "2024-01-10",
    lastUpdated: "2024-01-15",
    nextAction: "1次面接実施予定",
    notes: "介護経験あり、日本語能力良好",
    interviewer: "田中 部長",
    scheduledDate: "2024-01-20"
  },
  {
    id: "2",
    jobId: "JOB002",
    jobTitle: "建設作業員",
    company: "DEF建設株式会社",
    status: "screening",
    appliedDate: "2024-01-12",
    lastUpdated: "2024-01-14",
    nextAction: "書類選考中",
    notes: "建設経験なし、体力に自信あり"
  },
  {
    id: "3",
    jobId: "JOB003",
    jobTitle: "製造オペレーター",
    company: "GHI製造株式会社",
    status: "rejected",
    appliedDate: "2024-01-08",
    lastUpdated: "2024-01-13",
    notes: "製造経験不足のため不採用"
  }
]

const statusConfig = {
  applied: { label: "応募済み", color: "bg-blue-100 text-blue-800", icon: Clock },
  screening: { label: "書類選考中", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  interview1: { label: "1次面接", color: "bg-orange-100 text-orange-800", icon: User },
  interview2: { label: "2次面接", color: "bg-purple-100 text-purple-800", icon: User },
  final: { label: "最終面接", color: "bg-indigo-100 text-indigo-800", icon: User },
  offered: { label: "内定", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "不採用", color: "bg-red-100 text-red-800", icon: XCircle },
  withdrawn: { label: "辞退", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
}

// モック履歴データ
const mockHistory: ProgressHistory[] = [
  {
    id: "1",
    progressId: "1",
    action: "status_change",
    oldValue: "applied",
    newValue: "screening",
    timestamp: "2024-01-12T10:30:00",
    updatedBy: "田中 太郎",
    description: "書類選考に進む"
  },
  {
    id: "2",
    progressId: "1",
    action: "status_change",
    oldValue: "screening",
    newValue: "interview1",
    timestamp: "2024-01-15T14:20:00",
    updatedBy: "田中 太郎",
    description: "1次面接に進む"
  },
  {
    id: "3",
    progressId: "2",
    action: "status_change",
    oldValue: "applied",
    newValue: "screening",
    timestamp: "2024-01-14T09:15:00",
    updatedBy: "佐藤 花子",
    description: "書類選考開始"
  },
  {
    id: "4",
    progressId: "3",
    action: "status_change",
    oldValue: "interview1",
    newValue: "rejected",
    timestamp: "2024-01-13T16:45:00",
    updatedBy: "山田 次郎",
    description: "製造経験不足のため不採用"
  }
]

export default function ProgressManagement({ candidateId, candidateName }: ProgressProps) {
  const [progress, setProgress] = useState<ProgressItem[]>(mockProgress)
  const [history, setHistory] = useState<ProgressHistory[]>(mockHistory)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedProgressId, setSelectedProgressId] = useState<string>("")
  const [editingItem, setEditingItem] = useState<ProgressItem | null>(null)
  const [newProgress, setNewProgress] = useState({
    jobId: "",
    jobTitle: "",
    company: "",
    status: "applied" as ProgressItem["status"],
    notes: "",
    interviewer: "",
    scheduledDate: ""
  })

  const filteredProgress = progress.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: ProgressItem["status"]) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getProgressPercentage = (status: ProgressItem["status"]) => {
    const statusOrder = ["applied", "screening", "interview1", "interview2", "final", "offered"]
    const currentIndex = statusOrder.indexOf(status)
    if (currentIndex === -1) return 0
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  const handleAddProgress = () => {
    const newItem: ProgressItem = {
      id: Date.now().toString(),
      jobId: newProgress.jobId,
      jobTitle: newProgress.jobTitle,
      company: newProgress.company,
      status: newProgress.status,
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: newProgress.notes,
      interviewer: newProgress.interviewer,
      scheduledDate: newProgress.scheduledDate
    }
    
    setProgress(prev => [newItem, ...prev])
    setNewProgress({
      jobId: "",
      jobTitle: "",
      company: "",
      status: "applied",
      notes: "",
      interviewer: "",
      scheduledDate: ""
    })
    setIsAddDialogOpen(false)
    toast.success("選考進捗を追加しました")
  }

  const addHistoryRecord = (progressId: string, action: ProgressHistory["action"], oldValue: string, newValue: string, description: string) => {
    const newHistory: ProgressHistory = {
      id: Date.now().toString(),
      progressId,
      action,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      updatedBy: "現在のユーザー", // 実際の実装では現在のユーザー名を取得
      description
    }
    setHistory(prev => [newHistory, ...prev])
  }

  const handleUpdateStatus = (id: string, newStatus: ProgressItem["status"]) => {
    const currentItem = progress.find(item => item.id === id)
    if (!currentItem) return

    const oldStatus = currentItem.status
    const oldStatusLabel = statusConfig[oldStatus].label
    const newStatusLabel = statusConfig[newStatus].label

    setProgress(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ))

    // 履歴を記録
    addHistoryRecord(
      id,
      "status_change",
      oldStatusLabel,
      newStatusLabel,
      `${oldStatusLabel}から${newStatusLabel}に変更`
    )

    toast.success("ステータスを更新しました")
  }

  const handleEditProgress = (item: ProgressItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingItem) return
    
    const originalItem = progress.find(item => item.id === editingItem.id)
    if (!originalItem) return

    // 変更された項目をチェックして履歴を記録
    if (originalItem.notes !== editingItem.notes && editingItem.notes) {
      addHistoryRecord(
        editingItem.id,
        "note_update",
        originalItem.notes || "",
        editingItem.notes,
        "備考を更新"
      )
    }

    if (originalItem.nextAction !== editingItem.nextAction && editingItem.nextAction) {
      addHistoryRecord(
        editingItem.id,
        "action_update",
        originalItem.nextAction || "",
        editingItem.nextAction,
        "次のアクションを更新"
      )
    }

    if (originalItem.interviewer !== editingItem.interviewer && editingItem.interviewer) {
      addHistoryRecord(
        editingItem.id,
        "interviewer_update",
        originalItem.interviewer || "",
        editingItem.interviewer,
        "面接官を更新"
      )
    }

    if (originalItem.scheduledDate !== editingItem.scheduledDate && editingItem.scheduledDate) {
      addHistoryRecord(
        editingItem.id,
        "date_update",
        originalItem.scheduledDate || "",
        editingItem.scheduledDate,
        "予定日を更新"
      )
    }
    
    setProgress(prev => prev.map(item => 
      item.id === editingItem.id 
        ? { ...editingItem, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ))
    setIsEditDialogOpen(false)
    setEditingItem(null)
    toast.success("選考進捗を更新しました")
  }

  const openHistoryDialog = (progressId: string) => {
    setSelectedProgressId(progressId)
    setIsHistoryDialogOpen(true)
  }

  const getProgressHistory = (progressId: string) => {
    return history.filter(h => h.progressId === progressId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">選考進捗</h3>
          <p className="text-sm text-muted-foreground">
            {candidateName}さんの選考プロセスを管理します
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              進捗追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>選考進捗を追加</DialogTitle>
              <DialogDescription>
                新しい選考プロセスを追加します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>求人ID</Label>
                <Input
                  value={newProgress.jobId}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, jobId: e.target.value }))}
                  placeholder="JOB001"
                />
              </div>
              <div>
                <Label>職種</Label>
                <Input
                  value={newProgress.jobTitle}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="介護職員"
                />
              </div>
              <div>
                <Label>企業名</Label>
                <Input
                  value={newProgress.company}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="株式会社ABC"
                />
              </div>
              <div>
                <Label>ステータス</Label>
                <Select value={newProgress.status} onValueChange={(value: ProgressItem["status"]) => setNewProgress(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>備考</Label>
                <Textarea
                  value={newProgress.notes}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="選考に関する備考を入力"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddProgress}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            検索・フィルター
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="職種・企業名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 進捗一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>選考進捗一覧 ({filteredProgress.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              条件に一致する選考進捗がありません
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProgress.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold">{item.jobTitle}</h4>
                          <p className="text-sm text-muted-foreground">{item.company}</p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span>応募日: {item.appliedDate}</span>
                          <span>最終更新: {item.lastUpdated}</span>
                          {item.scheduledDate && (
                            <span>予定日: {item.scheduledDate}</span>
                          )}
                        </div>
                        
                                                 <ProgressBar value={getProgressPercentage(item.status)} className="h-2" />
                        
                        {item.nextAction && (
                          <p className="text-sm text-blue-600">
                            次のアクション: {item.nextAction}
                          </p>
                        )}
                        
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">
                            備考: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select value={item.status} onValueChange={(value: ProgressItem["status"]) => handleUpdateStatus(item.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm" onClick={() => handleEditProgress(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => openHistoryDialog(item.id)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>選考進捗を編集</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>職種</Label>
                <Input
                  value={editingItem.jobTitle}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, jobTitle: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>企業名</Label>
                <Input
                  value={editingItem.company}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, company: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>ステータス</Label>
                <Select value={editingItem.status} onValueChange={(value: ProgressItem["status"]) => setEditingItem(prev => prev ? { ...prev, status: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>次のアクション</Label>
                <Input
                  value={editingItem.nextAction || ""}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, nextAction: e.target.value } : null)}
                  placeholder="次のアクションを入力"
                />
              </div>
              <div>
                <Label>面接官</Label>
                <Input
                  value={editingItem.interviewer || ""}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, interviewer: e.target.value } : null)}
                  placeholder="面接官名"
                />
              </div>
              <div>
                <Label>予定日</Label>
                <Input
                  type="date"
                  value={editingItem.scheduledDate || ""}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, scheduledDate: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>備考</Label>
                <Textarea
                  value={editingItem.notes || ""}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="選考に関する備考を入力"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 履歴表示ダイアログ */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>選考進捗履歴</DialogTitle>
            <DialogDescription>
              選考プロセスの変更履歴を表示します
            </DialogDescription>
          </DialogHeader>
          {selectedProgressId && (
            <div className="space-y-4">
              {(() => {
                const progressItem = progress.find(p => p.id === selectedProgressId)
                const progressHistory = getProgressHistory(selectedProgressId)
                
                return (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold">{progressItem?.jobTitle}</h4>
                      <p className="text-sm text-muted-foreground">{progressItem?.company}</p>
                    </div>
                    
                    {progressHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        履歴がありません
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {progressHistory.map((historyItem) => (
                          <div key={historyItem.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {historyItem.action === "status_change" && "ステータス変更"}
                                    {historyItem.action === "note_update" && "備考更新"}
                                    {historyItem.action === "action_update" && "アクション更新"}
                                    {historyItem.action === "interviewer_update" && "面接官更新"}
                                    {historyItem.action === "date_update" && "日付更新"}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(historyItem.timestamp).toLocaleString('ja-JP')}
                                  </span>
                                </div>
                                
                                <p className="text-sm font-medium mb-1">{historyItem.description}</p>
                                
                                {historyItem.oldValue && (
                                  <div className="text-sm text-muted-foreground">
                                    <span className="line-through">{historyItem.oldValue}</span>
                                    <span className="mx-2">→</span>
                                    <span className="text-green-600">{historyItem.newValue}</span>
                                  </div>
                                )}
                                
                                <div className="text-xs text-muted-foreground mt-2">
                                  更新者: {historyItem.updatedBy}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
