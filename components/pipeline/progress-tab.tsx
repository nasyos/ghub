"use client"

import { useState, useEffect } from "react"
import { ApplicationRow, InterviewFormData } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { Plus, Calendar, Users, MessageSquare, Edit, X, ChevronRight, ChevronDown } from "lucide-react"

interface ProgressTabProps {
  application: ApplicationRow
  onProgressUpdated?: (updatedApplication: ApplicationRow) => void
}

export function ProgressTab({ application, onProgressUpdated }: ProgressTabProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [interviews, setInterviews] = useState<any[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [interviewForm, setInterviewForm] = useState<InterviewFormData>({
    round: "一次",
    start: "",
    durationMin: 60,
    mode: "online",
    location: "",
    participants: [],
    notes: ""
  })
  const [commentForm, setCommentForm] = useState<Record<string, string>>({})

  useEffect(() => {
    loadInterviews()
  }, [application.id])

  const loadInterviews = async () => {
    setLoading(true)
    try {
      const data = await pipelineApi.getApplicationInterviews(application.id)
      setInterviews(data?.items || [])
    } catch (error) {
      console.error("Failed to load interviews:", error)
      setInterviews([])
      toast({
        title: "エラー",
        description: "面接データの読み込みに失敗しました",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (interviewId: string) => {
    if (comments[interviewId]) return
    
    try {
      const commentData = await pipelineApi.getInterviewComments(application.id, interviewId)
      setComments(prev => ({ ...prev, [interviewId]: commentData }))
    } catch (error) {
      console.error("Failed to load comments:", error)
    }
  }

  const handleAddInterview = async () => {
    if (!interviewForm.round || !interviewForm.start) {
      toast({
        title: "エラー",
        description: "必須項目を入力してください",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await pipelineApi.addInterview(application.id, interviewForm)
      
      if (result) {
        setInterviews(prev => [result.item, ...prev])
        
        if (onProgressUpdated) {
          onProgressUpdated({
            ...application,
            stage: result.stage as any,
            next_action: result.next_action as any,
            last_activity_at: result.last_activity_at
          })
        }

        toast({
          title: "成功",
          description: "面接を追加しました"
        })

        setShowAddDialog(false)
        setInterviewForm({
          round: "一次",
          start: "",
          durationMin: 60,
          mode: "online",
          location: "",
          participants: [],
          notes: ""
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "面接の追加に失敗しました",
        variant: "destructive"
      })
    }
  }

  const handleSaveResult = async (interviewId: string, result: "pass" | "fail" | "hold") => {
    try {
      const resultData = { result }
      const apiResult = await pipelineApi.saveInterviewResult(application.id, interviewId, resultData)
      
      if (apiResult) {
        setInterviews(prev => prev.map(iv => 
          iv.id === interviewId 
            ? { ...iv, result, updatedAt: apiResult.last_activity_at }
            : iv
        ))
        
        if (onProgressUpdated) {
          onProgressUpdated({
            ...application,
            stage: apiResult.stage as any,
            next_action: apiResult.next_action as any,
            last_activity_at: apiResult.last_activity_at
          })
        }

        toast({
          title: "成功",
          description: "結果を保存しました"
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "結果の保存に失敗しました",
        variant: "destructive"
      })
    }
  }

  const handleAddComment = async (interviewId: string) => {
    const text = commentForm[interviewId]?.trim()
    if (!text) {
      toast({
        title: "エラー",
        description: "コメントを入力してください",
        variant: "destructive"
      })
      return
    }

    try {
      const newComment = await pipelineApi.addInterviewComment(application.id, interviewId, text)
      
      setComments(prev => ({
        ...prev,
        [interviewId]: [...(prev[interviewId] || []), newComment]
      }))

      setInterviews(prev => prev.map(iv => 
        iv.id === interviewId 
          ? { ...iv, commentCount: iv.commentCount + 1 }
          : iv
      ))

      setCommentForm(prev => ({ ...prev, [interviewId]: "" }))

      toast({
        title: "成功",
        description: "コメントを投稿しました"
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "コメントの投稿に失敗しました",
        variant: "destructive"
      })
    }
  }

  const toggleRowExpansion = (interviewId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(interviewId)) {
      newExpanded.delete(interviewId)
    } else {
      newExpanded.add(interviewId)
      loadComments(interviewId)
    }
    setExpandedRows(newExpanded)
  }

  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, "yyyy/MM/dd HH:mm", { locale: ja })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                面接を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>面接を追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ラウンド *</Label>
                    <Select value={interviewForm.round} onValueChange={(value) => setInterviewForm(prev => ({ ...prev, round: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="一次">一次</SelectItem>
                        <SelectItem value="二次">二次</SelectItem>
                        <SelectItem value="最終">最終</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>形式 *</Label>
                    <Select value={interviewForm.mode} onValueChange={(value) => setInterviewForm(prev => ({ ...prev, mode: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">オンライン</SelectItem>
                        <SelectItem value="onsite">対面</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>日時 *</Label>
                  <Input
                    type="datetime-local"
                    value={interviewForm.start}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>所要時間（分）</Label>
                  <Input
                    type="number"
                    value={interviewForm.durationMin}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, durationMin: parseInt(e.target.value) || 60 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{interviewForm.mode === "online" ? "URL" : "会場名"}</Label>
                  <Input
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={interviewForm.mode === "online" ? "https://meet.google.com/..." : "会場名を入力"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>参加者</Label>
                  <Input
                    value={interviewForm.participants.join(", ")}
                    onChange={(e) => setInterviewForm(prev => ({ 
                      ...prev, 
                      participants: e.target.value.split(",").map(p => p.trim()).filter(p => p)
                    }))}
                    placeholder="田中太郎, 佐藤花子"
                  />
                </div>
                <div className="space-y-2">
                  <Label>備考</Label>
                  <Textarea
                    value={interviewForm.notes || ""}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="面接の詳細や注意事項"
                  />
                </div>
                <Button onClick={handleAddInterview} className="w-full">
                  追加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

             {/* 面接一覧 */}
       <div className="flex-1 overflow-auto space-y-3">
         {interviews?.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
             <p>面接が登録されていません</p>
             <p className="text-sm">「面接を追加」ボタンから面接を登録してください</p>
           </div>
         ) : (
           interviews?.map((interview) => {
           const isExpanded = expandedRows.has(interview.id)
           
           return (
             <>
               <Card key={interview.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRowExpansion(interview.id)}>
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         <Badge variant="outline">{interview.round}</Badge>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <Calendar className="h-4 w-4" />
                         <span>{formatDateTime(interview.start)}</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Users className="h-4 w-4" />
                         <span>{interview.participants.slice(0, 2).join(", ")}</span>
                         {interview.participants.length > 2 && ` +${interview.participants.length - 2}`}
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       {interview.result ? (
                         <Badge className={
                           interview.result === "pass" ? "bg-green-100 text-green-800" :
                           interview.result === "fail" ? "bg-red-100 text-red-800" :
                           "bg-gray-100 text-gray-800"
                         }>
                           {interview.result === "pass" ? "合格" : 
                            interview.result === "fail" ? "不合格" : "保留"}
                         </Badge>
                                               ) : (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select 
                              value="" 
                              onValueChange={(value) => handleSaveResult(interview.id, value as any)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="結果を選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pass">合格</SelectItem>
                                <SelectItem value="fail">不合格</SelectItem>
                                <SelectItem value="hold">保留</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                       {interview.commentCount > 0 && (
                         <Badge variant="secondary" className="flex items-center gap-1">
                           <MessageSquare className="h-3 w-3" />
                           {interview.commentCount}
                         </Badge>
                       )}
                     </div>
                   </div>
                   <div className="mt-2 text-sm text-muted-foreground">
                     {interview.mode === "online" ? "オンライン" : "対面"}: {interview.location}
                   </div>
                 </CardContent>
               </Card>
               
               {/* 詳細行 */}
               {isExpanded && (
                 <Card className="ml-4 border-l-2 border-primary">
                   <CardContent className="p-4">
                     <div className="space-y-4">
                       {/* 備考 */}
                       {interview.notes && (
                         <div>
                           <Label className="text-sm font-medium">備考</Label>
                           <p className="text-sm text-muted-foreground mt-1">{interview.notes}</p>
                         </div>
                       )}

                       {/* コメント */}
                       <div>
                         <Label className="text-sm font-medium">コメント</Label>
                         <div className="space-y-2 mt-2">
                           {comments[interview.id]?.map((comment) => (
                             <Card key={comment.id}>
                               <CardContent className="pt-3">
                                 <p className="text-sm mb-1">{comment.text}</p>
                                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                   <span>{comment.author.name}</span>
                                   <span>•</span>
                                   <span>{format(parseISO(comment.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}</span>
                                 </div>
                               </CardContent>
                             </Card>
                           ))}
                           
                           <div className="flex gap-2 mt-2">
                             <Textarea
                               placeholder="コメントを入力..."
                               value={commentForm[interview.id] || ""}
                               onChange={(e) => setCommentForm(prev => ({ ...prev, [interview.id]: e.target.value }))}
                               className="flex-1"
                               rows={2}
                               onClick={(e) => e.stopPropagation()}
                             />
                             <Button 
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation()
                                 handleAddComment(interview.id)
                               }}
                             >
                               投稿
                             </Button>
                           </div>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               )}
             </>
           )
         })
         )}
      </div>
    </div>
  )
}
