"use client"

import { useState, useEffect, useMemo } from "react"
import { Candidate, CandidateFilters } from "@/lib/candidates/types"
import { 
  calculateDelayStatus, 
  calculatePriorityStatus, 
  getElapsedTimeText, 
  getRemainingDaysText,
  getDelayStatusColor,
  getPriorityStatusColor,
  sortCandidates,
  filterCandidates,
  calculateRequiresResponse,
  getRequiresResponseBackgroundColor,
  getElapsedHours
} from "@/lib/candidates/utils"
import { candidatesApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  Plus
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface CandidatesTableProps {
  onSelectCandidate?: (candidate: Candidate) => void
  onNavigateToDetail?: (candidateId: string) => void
}

export function CandidatesTable({ onSelectCandidate, onNavigateToDetail }: CandidatesTableProps) {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<CandidateFilters>({})
  const [sortBy, setSortBy] = useState<string>("priority")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // 要返信のみフィルタ（URL同期対応）
  const [needsReplyOnly, setNeedsReplyOnly] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("needsReplyOnly") === "1"
    }
    return false
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    country: "",
    residenceStatus: "",
    residenceExpiry: "",
    residence: "",
    facebookLink: "",
    jpLevel: "",
    assignedCA: ""
  })

  // URL同期
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (needsReplyOnly) {
        params.set("needsReplyOnly", "1")
      } else {
        params.delete("needsReplyOnly")
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState(null, "", newUrl)
    }
  }, [needsReplyOnly])

  useEffect(() => {
    loadCandidates()
  }, [filters, sortBy, needsReplyOnly])

  // フィルタされた候補者リスト
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // 要返信のみフィルタ
      if (needsReplyOnly) {
        const requiresResponse = calculateRequiresResponse(candidate)
        if (!requiresResponse) return false
      }
      
      // 他のフィルタも適用（既存のfilterCandidates関数を使用）
      return filterCandidates([candidate], filters).length > 0
    })
  }, [candidates, needsReplyOnly, filters])

  const loadCandidates = async () => {
    setLoading(true)
    try {
      const result = await candidatesApi.getCandidates({
        ...filters,
        sortBy
      })
      setCandidates(result.items)
    } catch (error) {
      toast({
        title: "データ読み込みエラー",
        description: "候補者データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, status: undefined }))
    } else {
      setFilters(prev => ({ ...prev, status: [value as any] }))
    }
  }

  const handleCAFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, assignedCA: undefined }))
    } else {
      setFilters(prev => ({ ...prev, assignedCA: [value] }))
    }
  }

  const handleCountryFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, country: undefined }))
    } else {
      setFilters(prev => ({ ...prev, country: [value] }))
    }
  }

  const handleResidenceFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, residence: undefined }))
    } else {
      setFilters(prev => ({ ...prev, residence: [value] }))
    }
  }

  const handleDesiredLocationFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, desiredLocation: undefined }))
    } else {
      setFilters(prev => ({ ...prev, desiredLocation: [value] }))
    }
  }

  const handleGenderFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, gender: undefined }))
    } else {
      setFilters(prev => ({ ...prev, gender: [value] }))
    }
  }

  const handleResidenceStatusFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, residenceStatus: undefined }))
    } else {
      setFilters(prev => ({ ...prev, residenceStatus: [value] }))
    }
  }

  const handleJapaneseLevelFilterChange = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, japaneseLevel: undefined }))
    } else {
      setFilters(prev => ({ ...prev, japaneseLevel: [value] }))
    }
  }



  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  const handleAddCandidate = async () => {
    if (!newCandidate.name.trim()) {
      toast({
        title: "エラー",
        description: "氏名は必須です",
        variant: "destructive",
      })
      return
    }

    if (!newCandidate.country.trim()) {
      toast({
        title: "エラー",
        description: "国籍は必須です",
        variant: "destructive",
      })
      return
    }

    if (!newCandidate.residenceStatus) {
      toast({
        title: "エラー",
        description: "在留資格は必須です",
        variant: "destructive",
      })
      return
    }

    if (!newCandidate.residence.trim()) {
      toast({
        title: "エラー",
        description: "居住地は必須です",
        variant: "destructive",
      })
      return
    }

    if (!newCandidate.facebookLink.trim()) {
      toast({
        title: "エラー",
        description: "Facebookリンクは必須です",
        variant: "destructive",
      })
      return
    }

    try {
      // 実際のAPI呼び出しは後で実装
             toast({
         title: "成功",
         description: "候補者を作成しました",
         variant: "default",
       })
      setIsAddDialogOpen(false)
             setNewCandidate({
         name: "",
         country: "",
         residenceStatus: "",
         residenceExpiry: "",
         residence: "",
         facebookLink: "",
         jpLevel: "",
         assignedCA: ""
       })
      loadCandidates() // リストを再読み込み
    } catch (error) {
      toast({
        title: "エラー",
        description: "求職者の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "紐付け前":
        return "bg-gray-100 text-gray-800"
      case "推薦準備中":
        return "bg-blue-100 text-blue-800"
      case "選考中":
        return "bg-orange-100 text-orange-800"
      case "結果待ち":
        return "bg-purple-100 text-purple-800"
      case "面談前":
        return "bg-yellow-100 text-yellow-800"
      case "面談予定":
        return "bg-green-100 text-green-800"
      case "推薦済み":
        return "bg-indigo-100 text-indigo-800"
      case "内定":
        return "bg-emerald-100 text-emerald-800"
      case "勤務中":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // CSV機能
  const handleDownloadFormat = () => {
    const csvContent = "候補者番号,氏名,国籍,性別,年齢,希望職種,希望勤務先,ステータス,在留資格,在留期限,最終送受信日時,次回予定日,担当CA,備考\n"
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '候補者登録フォーマット.csv'
    link.click()
  }

  const handleExportCSV = () => {
    const headers = [
      "候補者番号", "氏名", "国籍", "性別", "年齢", "希望職種", "希望勤務先", 
      "ステータス", "在留資格", "在留期限", "最終送受信日時", "次回予定日", "担当CA", "備考"
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredCandidates.map(candidate => [
        candidate.candidateNo,
        candidate.name,
        candidate.country,
        candidate.gender,
        candidate.age,
        candidate.desiredJob,
        candidate.desiredLocation,
        candidate.candidateStatus,
        candidate.residenceStatus,
        candidate.residenceExpiry,
        new Date(candidate.lastMessageReceivedAt).toLocaleString('ja-JP'),
        candidate.nextScheduledDate ? new Date(candidate.nextScheduledDate).toLocaleDateString('ja-JP') : '',
        candidate.assignedCA,
        candidate.notes
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `候補者一覧_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleBulkUpload = () => {
    toast({
      title: "一括登録機能",
      description: "CSV一括登録機能は開発中です",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3 c-candidates__table">
        {/* CSV機能ボタン */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadFormat}>
            <Download className="h-4 w-4 mr-2" />
            CSVフォーマットDL
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            一覧をCSV出力
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkUpload}>
            <Upload className="h-4 w-4 mr-2" />
            CSV一括登録
          </Button>
          <div className="flex-1"></div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                求職者追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>求職者を追加</DialogTitle>
              </DialogHeader>
                             <div className="space-y-4">
                 {/* 必須項目 */}
                 <div>
                   <Label className="text-sm font-medium text-muted-foreground">必須項目</Label>
                   <div className="grid grid-cols-2 gap-4 mt-2">
                     <div>
                       <Label htmlFor="name">氏名 *</Label>
                       <Input
                         id="name"
                         value={newCandidate.name}
                         onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="氏名を入力"
                       />
                     </div>
                     <div>
                       <Label htmlFor="country">国籍 *</Label>
                       <Input
                         id="country"
                         value={newCandidate.country}
                         onChange={(e) => setNewCandidate(prev => ({ ...prev, country: e.target.value }))}
                         placeholder="国籍を入力"
                       />
                     </div>
                     <div>
                       <Label htmlFor="residenceStatus">在留資格 *</Label>
                       <Select value={newCandidate.residenceStatus} onValueChange={(value) => setNewCandidate(prev => ({ ...prev, residenceStatus: value }))}>
                         <SelectTrigger>
                           <SelectValue placeholder="在留資格を選択" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="技術・人文知識・国際業務">技術・人文知識・国際業務</SelectItem>
                           <SelectItem value="特定技能">特定技能</SelectItem>
                           <SelectItem value="留学">留学</SelectItem>
                           <SelectItem value="家族滞在">家族滞在</SelectItem>
                           <SelectItem value="永住者">永住者</SelectItem>
                           <SelectItem value="日本人の配偶者等">日本人の配偶者等</SelectItem>
                           <SelectItem value="定住者">定住者</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="residenceExpiry">在留期限</Label>
                       <Input
                         id="residenceExpiry"
                         type="date"
                         value={newCandidate.residenceExpiry}
                         onChange={(e) => setNewCandidate(prev => ({ ...prev, residenceExpiry: e.target.value }))}
                       />
                     </div>
                     <div>
                       <Label htmlFor="residence">居住地（都道府県） *</Label>
                       <Input
                         id="residence"
                         value={newCandidate.residence}
                         onChange={(e) => setNewCandidate(prev => ({ ...prev, residence: e.target.value }))}
                         placeholder="東京都、大阪府など"
                       />
                     </div>
                     <div>
                       <Label htmlFor="facebookLink">Facebookリンク *</Label>
                       <Input
                         id="facebookLink"
                         value={newCandidate.facebookLink}
                         onChange={(e) => setNewCandidate(prev => ({ ...prev, facebookLink: e.target.value }))}
                         placeholder="FacebookプロフィールURL"
                       />
                     </div>
                   </div>
                 </div>

                 {/* 任意項目 */}
                 <div>
                   <Label className="text-sm font-medium text-muted-foreground">任意項目</Label>
                   <div className="grid grid-cols-2 gap-4 mt-2">
                     <div>
                       <Label htmlFor="jpLevel">日本語レベル</Label>
                       <Select value={newCandidate.jpLevel} onValueChange={(value) => setNewCandidate(prev => ({ ...prev, jpLevel: value }))}>
                         <SelectTrigger>
                           <SelectValue placeholder="日本語レベルを選択" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="N1">N1</SelectItem>
                           <SelectItem value="N2">N2</SelectItem>
                           <SelectItem value="N3">N3</SelectItem>
                           <SelectItem value="N4">N4</SelectItem>
                           <SelectItem value="N5">N5</SelectItem>
                           <SelectItem value="不明">不明</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="assignedCA">担当CA</Label>
                       <Input
                         id="assignedCA"
                         value={newCandidate.assignedCA}
                         onChange={(e) => setNewCandidate(prev => ({ ...prev, assignedCA: e.target.value }))}
                         placeholder="担当CAを入力"
                       />
                     </div>
                   </div>
                 </div>

                 {/* 注記 */}
                 <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                   詳細は作成後に編集できます
                 </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleAddCandidate}>
                    追加
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* フィルター */}
        <div className="space-y-3">
          {/* 検索バー */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="候補者名、候補者番号、国籍、希望職種で検索..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 要返信のみフィルタ */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="needs-reply-only"
                checked={needsReplyOnly}
                onCheckedChange={(checked) => setNeedsReplyOnly(Boolean(checked))}
              />
              <Label htmlFor="needs-reply-only" className="text-sm">要返信のみ</Label>
            </div>
          </div>

          {/* フィルター行 */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filters.status?.[0] || "all"} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="紐付け前">紐付け前</SelectItem>
                <SelectItem value="推薦準備中">推薦準備中</SelectItem>
                <SelectItem value="選考中">選考中</SelectItem>
                <SelectItem value="結果待ち">結果待ち</SelectItem>
                <SelectItem value="面談前">面談前</SelectItem>
                <SelectItem value="面談予定">面談予定</SelectItem>
                <SelectItem value="推薦済み">推薦済み</SelectItem>
                <SelectItem value="内定">内定</SelectItem>
                <SelectItem value="勤務中">勤務中</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.assignedCA?.[0] || "all"} onValueChange={handleCAFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="担当CA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのCA</SelectItem>
                <SelectItem value="田中CA">田中CA</SelectItem>
                <SelectItem value="佐藤CA">佐藤CA</SelectItem>
                <SelectItem value="鈴木CA">鈴木CA</SelectItem>
                <SelectItem value="高橋CA">高橋CA</SelectItem>
              </SelectContent>
            </Select>



            <Select value={filters.country?.[0] || "all"} onValueChange={handleCountryFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="国籍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての国籍</SelectItem>
                <SelectItem value="アメリカ">アメリカ</SelectItem>
                <SelectItem value="ベトナム">ベトナム</SelectItem>
                <SelectItem value="フィリピン">フィリピン</SelectItem>
                <SelectItem value="インド">インド</SelectItem>
                <SelectItem value="中国">中国</SelectItem>
                <SelectItem value="韓国">韓国</SelectItem>
                <SelectItem value="ネパール">ネパール</SelectItem>
                <SelectItem value="インドネシア">インドネシア</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.residence?.[0] || "all"} onValueChange={handleResidenceFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="移住地" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての移住地</SelectItem>
                <SelectItem value="東京都">東京都</SelectItem>
                <SelectItem value="大阪府">大阪府</SelectItem>
                <SelectItem value="神奈川県">神奈川県</SelectItem>
                <SelectItem value="愛知県">愛知県</SelectItem>
                <SelectItem value="埼玉県">埼玉県</SelectItem>
                <SelectItem value="千葉県">千葉県</SelectItem>
                <SelectItem value="兵庫県">兵庫県</SelectItem>
                <SelectItem value="福岡県">福岡県</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.desiredLocation?.[0] || "all"} onValueChange={handleDesiredLocationFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="希望勤務先" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての勤務先</SelectItem>
                <SelectItem value="東京都">東京都</SelectItem>
                <SelectItem value="大阪府">大阪府</SelectItem>
                <SelectItem value="神奈川県">神奈川県</SelectItem>
                <SelectItem value="愛知県">愛知県</SelectItem>
                <SelectItem value="埼玉県">埼玉県</SelectItem>
                <SelectItem value="千葉県">千葉県</SelectItem>
                <SelectItem value="兵庫県">兵庫県</SelectItem>
                <SelectItem value="福岡県">福岡県</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.gender?.[0] || "all"} onValueChange={handleGenderFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="性別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての性別</SelectItem>
                <SelectItem value="男性">男性</SelectItem>
                <SelectItem value="女性">女性</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.residenceStatus?.[0] || "all"} onValueChange={handleResidenceStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="在留資格" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての在留資格</SelectItem>
                <SelectItem value="技術・人文知識・国際業務">技術・人文知識・国際業務</SelectItem>
                <SelectItem value="特定技能">特定技能</SelectItem>
                <SelectItem value="留学">留学</SelectItem>
                <SelectItem value="家族滞在">家族滞在</SelectItem>
                <SelectItem value="永住者">永住者</SelectItem>
                <SelectItem value="日本人の配偶者等">日本人の配偶者等</SelectItem>
                <SelectItem value="定住者">定住者</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.japaneseLevel?.[0] || "all"} onValueChange={handleJapaneseLevelFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="日本語レベル" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのレベル</SelectItem>
                <SelectItem value="N1">N1</SelectItem>
                <SelectItem value="N2">N2</SelectItem>
                <SelectItem value="N3">N3</SelectItem>
                <SelectItem value="N4">N4</SelectItem>
                <SelectItem value="N5">N5</SelectItem>
                <SelectItem value="未受験">未受験</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 件数表示 */}
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <span>
            {filteredCandidates.length}件を表示中
            {needsReplyOnly && <span className="ml-2 text-amber-600">（要返信のみ）</span>}
          </span>
          <span>総候補者数: {candidates.length}件</span>
        </div>

        {/* テーブル */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSortChange("name")}
                    className="h-auto p-0 font-medium"
                  >
                    候補者名
                    {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>担当CA</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSortChange("lastMessage")}
                    className="h-auto p-0 font-medium"
                  >
                    最終送受信日時
                    {getSortIcon("lastMessage")}
                  </Button>
                </TableHead>
                <TableHead>経過時間</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSortChange("priority")}
                    className="h-auto p-0 font-medium"
                  >
                    次回予定日
                    {getSortIcon("priority")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => {
                const delayStatus = calculateDelayStatus(candidate)
                const priorityStatus = calculatePriorityStatus(candidate)
                const elapsedTime = getElapsedTimeText(candidate.lastMessageReceivedAt)
                const remainingDays = candidate.nextScheduledDate 
                  ? getRemainingDaysText(candidate.nextScheduledDate)
                  : null
                const requiresResponse = calculateRequiresResponse(candidate)
                const responseBackgroundColor = getRequiresResponseBackgroundColor(candidate)

                return (
                  <TableRow 
                    key={candidate.id}
                    className={`cursor-pointer hover:bg-muted/50 ${responseBackgroundColor}`}
                    onClick={() => onNavigateToDetail?.(candidate.id)}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.candidateNo} • {candidate.age}歳 • {candidate.country}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.desiredJob} • {candidate.desiredLocation}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {candidate.assignedCA}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(candidate.candidateStatus)}>
                          {candidate.candidateStatus}
                        </Badge>
                        {requiresResponse && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            要返信
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(candidate.lastMessageReceivedAt).toLocaleString('ja-JP')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge 
                            className={`${getDelayStatusColor(delayStatus)} ${
                              delayStatus === "critical" ? "animate-pulse" : ""
                            }`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {elapsedTime}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>最終受信からの経過時間</p>
                          <p className="text-xs text-muted-foreground">
                            {delayStatus === "normal" && "0-6時間: 正常"}
                            {delayStatus === "warning" && "6-24時間: 注意"}
                            {delayStatus === "danger" && "24-72時間: 警告"}
                            {delayStatus === "critical" && "72時間以上: 危険"}
                            {delayStatus === "excluded" && "遅延管理対象外"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {remainingDays ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge 
                              className={`${getPriorityStatusColor(priorityStatus!)} ${
                                priorityStatus === "critical" || priorityStatus === "overdue" 
                                  ? "animate-pulse" 
                                  : ""
                              }`}
                            >
                              {(priorityStatus === "critical" || priorityStatus === "overdue" || priorityStatus === "danger") && (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              <Calendar className="h-3 w-3 mr-1" />
                              {remainingDays}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>次回予定日</p>
                            <p className="text-xs text-muted-foreground">
                              {candidate.nextScheduledDate && 
                                new Date(candidate.nextScheduledDate).toLocaleDateString('ja-JP')
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground text-sm">未設定</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredCandidates.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              候補者が見つかりません
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
