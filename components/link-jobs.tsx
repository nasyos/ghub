"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  Plus, 
  Link, 
  Unlink, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Filter,
  Save,
  Loader2,
  Star,
  Clock,
  TrendingUp,
  Users,
  Languages,
  Building,
  Briefcase
} from "lucide-react"
import { toast } from "sonner"
import { notifyRecommendationComplete } from "@/lib/notifications"
import { logRecommendation, logUnlink } from "@/lib/audit-logger"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Job {
  id: string
  company: string
  title: string
  location: string
  salary: { min: number; max: number }
  status: string
  linkedAt?: string
  // 拡張フィールド
  visaRequirements?: string[]
  languageRequirements?: string[]
  interviewRounds?: number
  isNew?: boolean
  matchScore?: number
  applicationSpeed?: "fast" | "normal" | "slow"
  createdAt: string
  // 引当済み求人用フィールド
  assignedRA?: string
  recommendedAt?: string
  unlinkedAt?: string
  recommendationStatus?: "linked" | "recommended" | "unlinked"
  recommendationComment?: string
}

interface SearchFilter {
  keyword: string
  location: string[]
  salaryMin: number
  salaryMax: number
  visaRequirements: string[]
  languageRequirements: string[]
  applicationSpeed: string[]
  sortBy: "newest" | "salary" | "match" | "speed"
}

interface LinkJobsProps {
  candidateId: string
  candidateName: string
}

// モックデータ
const mockJobs: Job[] = [
  {
    id: "JOB001",
    company: "株式会社ABC介護",
    title: "介護職員",
    location: "東京都新宿区",
    salary: { min: 220000, max: 280000 },
    status: "published",
    linkedAt: "2024-01-15",
    visaRequirements: ["介護", "特定技能"],
    languageRequirements: ["N2以上"],
    interviewRounds: 2,
    isNew: true,
    matchScore: 85,
    applicationSpeed: "fast",
    createdAt: "2024-01-15",
    assignedRA: "田中 太郎",
    recommendationStatus: "linked"
  },
  {
    id: "JOB002",
    company: "DEF建設株式会社",
    title: "建設作業員",
    location: "大阪府大阪市",
    salary: { min: 250000, max: 320000 },
    status: "published",
    linkedAt: "2024-01-12",
    visaRequirements: ["建設", "特定技能"],
    languageRequirements: ["N3以上"],
    interviewRounds: 1,
    isNew: false,
    matchScore: 72,
    applicationSpeed: "normal",
    createdAt: "2024-01-10",
    assignedRA: "佐藤 花子",
    recommendationStatus: "recommended",
    recommendedAt: "2024-01-13",
    recommendationComment: "建設現場での経験があり、日本語もN3レベルで十分コミュニケーション可能です。"
  },
  {
    id: "JOB003",
    company: "GHI製造株式会社",
    title: "製造オペレーター",
    location: "愛知県名古屋市",
    salary: { min: 200000, max: 250000 },
    status: "published",
    linkedAt: "2024-01-18",
    visaRequirements: ["製造", "技能実習"],
    languageRequirements: ["N4以上"],
    interviewRounds: 3,
    isNew: true,
    matchScore: 68,
    applicationSpeed: "slow",
    createdAt: "2024-01-20",
    assignedRA: "未設定",
    recommendationStatus: "linked"
  },
  {
    id: "JOB004",
    company: "JKLサービス株式会社",
    title: "営業職",
    location: "福岡県福岡市",
    salary: { min: 180000, max: 220000 },
    status: "published",
    visaRequirements: ["技術・人文知識・国際業務"],
    languageRequirements: ["N1"],
    interviewRounds: 4,
    isNew: false,
    matchScore: 45,
    applicationSpeed: "slow",
    createdAt: "2024-01-05"
  },
  {
    id: "JOB005",
    company: "MNO食品株式会社",
    title: "食品加工",
    location: "北海道札幌市",
    salary: { min: 190000, max: 240000 },
    status: "published",
    visaRequirements: ["食品製造", "特定技能"],
    languageRequirements: ["N3以上"],
    interviewRounds: 2,
    isNew: true,
    matchScore: 78,
    applicationSpeed: "fast",
    createdAt: "2024-01-18"
  }
]

// 検索フィルターの初期値
const initialSearchFilter: SearchFilter = {
  keyword: "",
  location: [],
  salaryMin: 0,
  salaryMax: 1000000,
  visaRequirements: [],
  languageRequirements: [],
  applicationSpeed: [],
  sortBy: "newest"
}

export default function LinkJobs({ candidateId, candidateName }: LinkJobsProps) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [searchFilter, setSearchFilter] = useState<SearchFilter>(initialSearchFilter)
  const [isSearching, setIsSearching] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [savedFilters, setSavedFilters] = useState<{ name: string; filter: SearchFilter }[]>([])
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  
  // 推薦モーダル用の状態
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false)
  const [recommendationComment, setRecommendationComment] = useState("")
  const [isRecommending, setIsRecommending] = useState(false)
  const [jobToRecommend, setJobToRecommend] = useState<Job | null>(null)
  
  // 解除確認ダイアログ用の状態
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false)
  const [jobToUnlink, setJobToUnlink] = useState<Job | null>(null)
  const [isUnlinking, setIsUnlinking] = useState(false)
  
  // 既存のフィルター状態
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  
  // ページング用の状態
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const itemsPerPage = 20

  // 求人検索機能
  const searchJobs = async () => {
    setIsSearching(true)
    try {
      // 実際のAPI呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // モック検索結果
      const results = mockJobs.filter(job => {
        const matchesKeyword = searchFilter.keyword === "" || 
          job.company.toLowerCase().includes(searchFilter.keyword.toLowerCase()) ||
          job.title.toLowerCase().includes(searchFilter.keyword.toLowerCase())
        
        const matchesLocation = searchFilter.location.length === 0 || 
          searchFilter.location.some(loc => job.location.includes(loc))
        
        const matchesSalary = job.salary.min >= searchFilter.salaryMin && 
          job.salary.max <= searchFilter.salaryMax
        
        const matchesVisa = searchFilter.visaRequirements.length === 0 ||
          searchFilter.visaRequirements.some(visa => 
            job.visaRequirements?.includes(visa)
          )
        
        const matchesLanguage = searchFilter.languageRequirements.length === 0 ||
          searchFilter.languageRequirements.some(lang => 
            job.languageRequirements?.includes(lang)
          )
        
        const matchesSpeed = searchFilter.applicationSpeed.length === 0 ||
          searchFilter.applicationSpeed.includes(job.applicationSpeed || "normal")
        
        return matchesKeyword && matchesLocation && matchesSalary && 
               matchesVisa && matchesLanguage && matchesSpeed
      })
      
      // ソート
      const sortedResults = [...results].sort((a, b) => {
        switch (searchFilter.sortBy) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case "salary":
            return b.salary.max - a.salary.max
          case "match":
            return (b.matchScore || 0) - (a.matchScore || 0)
          case "speed":
            const speedOrder = { fast: 3, normal: 2, slow: 1 }
            return speedOrder[b.applicationSpeed || "normal"] - speedOrder[a.applicationSpeed || "normal"]
          default:
            return 0
        }
      })
      
      setSearchResults(sortedResults)
      toast.success(`${sortedResults.length}件の求人が見つかりました`)
    } catch (error) {
      toast.error("検索に失敗しました")
    } finally {
      setIsSearching(false)
    }
  }

  const handleLinkJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, linkedAt: new Date().toISOString().split('T')[0] }
        : job
    ))
         toast.success("求人を引当しました")
  }

  const handleUnlinkJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, linkedAt: undefined }
        : job
    ))
         toast.success("求人の引当を解除しました")
  }

  const formatSalary = (salary: { min: number; max: number }) => {
    return `${salary.min.toLocaleString()}円〜${salary.max.toLocaleString()}円`
  }

  const getStatusBadge = (job: Job) => {
    if (job.linkedAt) {
      return <Badge className="bg-green-100 text-green-800">引当済み</Badge>
    }
    return <Badge variant="secondary">未引当</Badge>
  }

  const getRecommendationStatusBadge = (job: Job) => {
    switch (job.recommendationStatus) {
      case "recommended":
        return <Badge className="bg-blue-100 text-blue-800">推薦済み</Badge>
      case "linked":
        return <Badge className="bg-green-100 text-green-800">引当済み</Badge>
      case "unlinked":
        return <Badge className="bg-gray-100 text-gray-800">解除済み</Badge>
      default:
        return <Badge variant="secondary">未引当</Badge>
    }
  }

  const getSpeedBadge = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Badge className="bg-green-100 text-green-800">迅速</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800">通常</Badge>
      case "slow":
        return <Badge className="bg-yellow-100 text-yellow-800">慎重</Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">{score}%</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">{score}%</Badge>
    return <Badge className="bg-red-100 text-red-800">{score}%</Badge>
  }

  const openJobDetail = (job: Job) => {
    setSelectedJob(job)
    setIsDetailOpen(true)
  }

  const handleAssignFromSearch = (job: Job) => {
    handleLinkJob(job.id)
    // 検索結果からも削除
    setSearchResults(prev => prev.filter(j => j.id !== job.id))
  }

  // 推薦機能
  const openRecommendModal = (job: Job) => {
    setJobToRecommend(job)
    setRecommendationComment("")
    setIsRecommendModalOpen(true)
  }

  const handleRecommend = async () => {
    if (!jobToRecommend) return
    
    setIsRecommending(true)
    try {
      // 実際のAPI呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // PATCH /links/:id/recommend { comment?: string }
      // サーバー処理：
      // - candidate_job_link を取得（id指定）
      // - 関連する求人（job_id）を参照
      // - その求人に設定されている ra_id を candidate_job_link.reviewed_by に保存
      // - candidate_job_link の各フィールドを更新：
      //   status = recommended
      //   recommended_comment = request.comment
      //   recommended_at = now()
      //   reviewed_by = jobs.ra_id
      
      setJobs(prev => prev.map(job => 
        job.id === jobToRecommend.id 
          ? { 
              ...job, 
              recommendationStatus: "recommended" as const,
              recommendedAt: new Date().toISOString().split('T')[0],
              recommendationComment: recommendationComment,
              // 求人に紐づいているRAを自動設定
              assignedRA: job.assignedRA || "未設定"
            }
          : job
      ))
      
      // 通知を送信（求人のRAへ）
      if (jobToRecommend.assignedRA && jobToRecommend.assignedRA !== "未設定") {
        await notifyRecommendationComplete(
          jobToRecommend.id,
          candidateId,
          jobToRecommend.assignedRA,
          recommendationComment
        )
      }
      
      // 監査ログを記録
      await logRecommendation(
        1, // linkId（実際の実装では動的に取得）
        1, // actorId（実際の実装では現在のユーザーID）
        "linked",
        recommendationComment
      )
      
      toast.success("推薦を送信しました")
      setIsRecommendModalOpen(false)
      setJobToRecommend(null)
      setRecommendationComment("")
    } catch (error) {
      toast.error("推薦の送信に失敗しました")
    } finally {
      setIsRecommending(false)
    }
  }

  // 解除機能
  const openUnlinkDialog = (job: Job) => {
    setJobToUnlink(job)
    setIsUnlinkDialogOpen(true)
  }

  const handleUnlink = async () => {
    if (!jobToUnlink) return
    
    setIsUnlinking(true)
    try {
      // 実際のAPI呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // PATCH /links/:id/unlink
      // サーバー処理：status=unlinked、unlinked_at=now()
      setJobs(prev => prev.map(job => 
        job.id === jobToUnlink.id 
          ? { 
              ...job, 
              recommendationStatus: "unlinked" as const,
              unlinkedAt: new Date().toISOString().split('T')[0]
            }
          : job
      ))
      
      // 監査ログを記録
      await logUnlink(
        1, // linkId（実際の実装では動的に取得）
        1, // actorId（実際の実装では現在のユーザーID）
        jobToUnlink.recommendationStatus || "linked",
        "ユーザーによる手動解除"
      )
      
      toast.success("引当を解除しました")
      setIsUnlinkDialogOpen(false)
      setJobToUnlink(null)
    } catch (error) {
      toast.error("引当の解除に失敗しました")
    } finally {
      setIsUnlinking(false)
    }
  }

  // 引当済み求人のみをフィルター
  const linkedJobs = jobs.filter(job => job.linkedAt && job.recommendationStatus !== "unlinked")

  // 引当済み求人のフィルター機能
  const filteredLinkedJobs = linkedJobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "linked" && job.recommendationStatus === "linked") ||
      (statusFilter === "recommended" && job.recommendationStatus === "recommended")
    
    const matchesLocation = locationFilter === "all" || 
      job.location.includes(locationFilter)
    
    return matchesSearch && matchesStatus && matchesLocation
  })

  // ページングされたデータ
  const paginatedLinkedJobs = filteredLinkedJobs.slice(0, currentPage * itemsPerPage)

  // 無限スクロール用の関数
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    
    // 実際のAPI呼び出しをシミュレート
    setTimeout(() => {
      const nextPage = currentPage + 1
      const nextItems = filteredLinkedJobs.slice(0, nextPage * itemsPerPage)
      
      if (nextItems.length >= filteredLinkedJobs.length) {
        setHasMore(false)
      }
      
      setCurrentPage(nextPage)
      setIsLoadingMore(false)
    }, 500)
  }, [currentPage, filteredLinkedJobs.length, isLoadingMore, hasMore])

  // フィルター変更時にページをリセット
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(filteredLinkedJobs.length > itemsPerPage)
  }, [searchTerm, statusFilter, locationFilter, filteredLinkedJobs.length])

    return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">求人引当</h3>
          <p className="text-sm text-muted-foreground">
            {candidateName}さんに適した求人を引当します
          </p>
        </div>
                 <div className="text-sm text-muted-foreground">
           引当済み: {linkedJobs.length}件
         </div>
      </div>

      {/* 求人検索セクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            求人検索
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本検索 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>キーワード検索</Label>
              <Input
                placeholder="企業名・職種で検索..."
                value={searchFilter.keyword}
                onChange={(e) => setSearchFilter(prev => ({ ...prev, keyword: e.target.value }))}
              />
            </div>
            <div>
              <Label>勤務地</Label>
              <Select 
                value={searchFilter.location[0] || "all"} 
                onValueChange={(value) => setSearchFilter(prev => ({ 
                  ...prev, 
                  location: value === "all" ? [] : [value] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="勤務地を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="東京都">東京都</SelectItem>
                  <SelectItem value="大阪府">大阪府</SelectItem>
                  <SelectItem value="愛知県">愛知県</SelectItem>
                  <SelectItem value="福岡県">福岡県</SelectItem>
                  <SelectItem value="北海道">北海道</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>並び替え</Label>
              <Select 
                value={searchFilter.sortBy} 
                onValueChange={(value: any) => setSearchFilter(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">新着順</SelectItem>
                  <SelectItem value="salary">給与高い順</SelectItem>
                  <SelectItem value="match">適合度順</SelectItem>
                  <SelectItem value="speed">選考スピード順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 詳細フィルター */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>給与範囲（万円）</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="最小"
                  value={searchFilter.salaryMin / 10000}
                  onChange={(e) => setSearchFilter(prev => ({ 
                    ...prev, 
                    salaryMin: Number(e.target.value) * 10000 
                  }))}
                />
                <span className="flex items-center">〜</span>
                <Input
                  type="number"
                  placeholder="最大"
                  value={searchFilter.salaryMax / 10000}
                  onChange={(e) => setSearchFilter(prev => ({ 
                    ...prev, 
                    salaryMax: Number(e.target.value) * 10000 
                  }))}
                />
              </div>
            </div>
            <div>
              <Label>在留要件</Label>
              <Select 
                value={searchFilter.visaRequirements[0] || "all"} 
                onValueChange={(value) => setSearchFilter(prev => ({ 
                  ...prev, 
                  visaRequirements: value === "all" ? [] : [value] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="在留要件を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="介護">介護</SelectItem>
                  <SelectItem value="建設">建設</SelectItem>
                  <SelectItem value="製造">製造</SelectItem>
                  <SelectItem value="食品製造">食品製造</SelectItem>
                  <SelectItem value="特定技能">特定技能</SelectItem>
                  <SelectItem value="技能実習">技能実習</SelectItem>
                  <SelectItem value="技術・人文知識・国際業務">技術・人文知識・国際業務</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>日本語要件</Label>
              <Select 
                value={searchFilter.languageRequirements[0] || "all"} 
                onValueChange={(value) => setSearchFilter(prev => ({ 
                  ...prev, 
                  languageRequirements: value === "all" ? [] : [value] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="日本語要件を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="N1">N1</SelectItem>
                  <SelectItem value="N2以上">N2以上</SelectItem>
                  <SelectItem value="N3以上">N3以上</SelectItem>
                  <SelectItem value="N4以上">N4以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-4">
            <Button onClick={searchJobs} disabled={isSearching}>
              {isSearching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Search className="h-4 w-4 mr-2" />
              検索実行
            </Button>
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
              <Save className="h-4 w-4 mr-2" />
              フィルター保存
            </Button>
            <Button variant="outline" onClick={() => setSearchFilter(initialSearchFilter)}>
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 検索結果 */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>検索結果 ({searchResults.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企業名</TableHead>
                  <TableHead>職種</TableHead>
                  <TableHead>勤務地</TableHead>
                  <TableHead>給与</TableHead>
                  <TableHead>在留要件</TableHead>
                  <TableHead>言語要件</TableHead>
                  <TableHead>面接回数</TableHead>
                  <TableHead>新着</TableHead>
                  <TableHead>適合度</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.company}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {job.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {formatSalary(job.salary)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {job.visaRequirements?.slice(0, 2).map((visa, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {visa}
                          </Badge>
                        ))}
                        {job.visaRequirements && job.visaRequirements.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.visaRequirements.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {job.languageRequirements?.slice(0, 2).map((lang, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                        {job.languageRequirements && job.languageRequirements.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.languageRequirements.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{job.interviewRounds}回</TableCell>
                    <TableCell>
                      {job.isNew && <Badge className="bg-red-100 text-red-800">NEW</Badge>}
                    </TableCell>
                    <TableCell>{getMatchScoreBadge(job.matchScore || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openJobDetail(job)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignFromSearch(job)}
                        >
                          <Link className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
                 </Card>
       )}

       {/* 求人詳細モーダル */}
       <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
         <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
           {selectedJob && (
             <div className="space-y-6">
               <SheetHeader>
                 <SheetTitle className="text-xl">{selectedJob.company}</SheetTitle>
                 <SheetDescription>{selectedJob.title}</SheetDescription>
               </SheetHeader>

               <div className="space-y-4">
                 {/* 基本情報 */}
                 <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">勤務地</Label>
                     <p className="text-sm font-medium flex items-center gap-1">
                       <MapPin className="h-3 w-3" />
                       {selectedJob.location}
                     </p>
                   </div>
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">給与</Label>
                     <p className="text-sm font-medium flex items-center gap-1">
                       <DollarSign className="h-3 w-3" />
                       {formatSalary(selectedJob.salary)}
                     </p>
                   </div>
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">面接回数</Label>
                     <p className="text-sm font-medium">{selectedJob.interviewRounds}回</p>
                   </div>
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">選考スピード</Label>
                     <p className="text-sm font-medium">{getSpeedBadge(selectedJob.applicationSpeed || "normal")}</p>
                   </div>
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">適合度</Label>
                     <p className="text-sm font-medium">{getMatchScoreBadge(selectedJob.matchScore || 0)}</p>
                   </div>
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">掲載日</Label>
                     <p className="text-sm font-medium">{selectedJob.createdAt}</p>
                   </div>
                 </div>

                 {/* 在留要件 */}
                 {selectedJob.visaRequirements && selectedJob.visaRequirements.length > 0 && (
                   <div className="space-y-3">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                       <Building className="h-4 w-4" />
                       在留要件
                     </h3>
                     <div className="flex gap-2 flex-wrap">
                       {selectedJob.visaRequirements.map((visa, index) => (
                         <Badge key={index} variant="secondary">
                           {visa}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* 言語要件 */}
                 {selectedJob.languageRequirements && selectedJob.languageRequirements.length > 0 && (
                   <div className="space-y-3">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                       <Languages className="h-4 w-4" />
                       言語要件
                     </h3>
                     <div className="flex gap-2 flex-wrap">
                       {selectedJob.languageRequirements.map((lang, index) => (
                         <Badge key={index} variant="secondary">
                           {lang}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* アクションボタン */}
                 <div className="flex gap-2 pt-6 border-t">
                   <Button
                     onClick={() => {
                       handleAssignFromSearch(selectedJob)
                       setIsDetailOpen(false)
                     }}
                     className="flex-1"
                   >
                     <Link className="h-4 w-4 mr-2" />
                     引当する
                   </Button>
                   <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                     閉じる
                   </Button>
                 </div>
               </div>
             </div>
           )}
         </SheetContent>
       </Sheet>

       {/* フィルター保存ダイアログ */}
       <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>フィルターを保存</DialogTitle>
             <DialogDescription>
               現在の検索条件に名前を付けて保存します
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>フィルター名</Label>
               <Input placeholder="例: 介護職・東京・高給与" />
             </div>
             <div>
               <Label>保存済みフィルター</Label>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                 {savedFilters.map((filter, index) => (
                   <div key={index} className="flex items-center justify-between p-2 border rounded">
                     <span className="text-sm">{filter.name}</span>
                     <div className="flex gap-1">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setSearchFilter(filter.filter)
                           setIsFilterDialogOpen(false)
                         }}
                       >
                         読込
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setSavedFilters(prev => prev.filter((_, i) => i !== index))
                         }}
                       >
                         削除
                       </Button>
                     </div>
                   </div>
                 ))}
                 {savedFilters.length === 0 && (
                   <p className="text-sm text-muted-foreground text-center py-4">
                     保存済みフィルターがありません
                   </p>
                 )}
               </div>
             </div>
           </div>
           <DialogFooter>
             <Button onClick={() => setIsFilterDialogOpen(false)}>保存</Button>
           </DialogFooter>
                  </DialogContent>
       </Dialog>

               {/* 推薦モーダル */}
        <Dialog open={isRecommendModalOpen} onOpenChange={setIsRecommendModalOpen}>
          <DialogContent onKeyDown={(e) => {
            // Enterキーで送信（Ctrl+Enterでも送信可能）
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleRecommend()
            }
            // Escapeキーでキャンセル
            if (e.key === 'Escape') {
              e.preventDefault()
              setIsRecommendModalOpen(false)
            }
          }}>
            <DialogHeader>
              <DialogTitle>求人を推薦する</DialogTitle>
              <DialogDescription>
                {jobToRecommend && (
                  <div className="space-y-2">
                    <p className="font-medium">{jobToRecommend.company}</p>
                    <p className="text-sm text-muted-foreground">{jobToRecommend.title}</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recommendation-comment">推薦内容（任意）</Label>
                <textarea
                  id="recommendation-comment"
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none"
                  placeholder="推薦理由や候補者の特徴などを記入してください（1000字以内）"
                  value={recommendationComment}
                  onChange={(e) => setRecommendationComment(e.target.value)}
                  maxLength={1000}
                  onKeyDown={(e) => {
                    // Enterキーで送信（Ctrl+Enterでも送信可能）
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleRecommend()
                    }
                  }}
                  aria-describedby="recommendation-comment-help"
                />
                <div id="recommendation-comment-help" className="text-xs text-muted-foreground mt-1 text-right">
                  {recommendationComment.length}/1000
                  <br />
                  <span className="text-xs">Ctrl+Enter で送信、Esc でキャンセル</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsRecommendModalOpen(false)}
                disabled={isRecommending}
              >
                キャンセル
              </Button>
              <Button 
                onClick={handleRecommend}
                disabled={isRecommending}
              >
                {isRecommending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                推薦を送信
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

       {/* 解除確認ダイアログ */}
       <Dialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>引当を解除しますか？</DialogTitle>
             <DialogDescription>
               {jobToUnlink && (
                 <div className="space-y-2">
                   <p className="font-medium">{jobToUnlink.company}</p>
                   <p className="text-sm text-muted-foreground">{jobToUnlink.title}</p>
                   <p className="text-sm text-red-600">
                     この操作を実行すると、この求人との引当が解除されます。
                   </p>
                 </div>
               )}
             </DialogDescription>
           </DialogHeader>
           <DialogFooter>
             <Button 
               variant="outline" 
               onClick={() => setIsUnlinkDialogOpen(false)}
               disabled={isUnlinking}
             >
               キャンセル
             </Button>
             <Button 
               variant="destructive"
               onClick={handleUnlink}
               disabled={isUnlinking}
             >
               {isUnlinking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
               解除する
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
   
       {/* 引当済み求人フィルター */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-lg">
             <Filter className="h-5 w-5" />
             引当済み求人フィルター
           </CardTitle>
         </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">キーワード検索</Label>
              <Input
                placeholder="企業名・職種で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">ステータス</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="linked">引当済み</SelectItem>
                  <SelectItem value="recommended">推薦済み</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">勤務地</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="勤務地" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="東京都">東京都</SelectItem>
                  <SelectItem value="大阪府">大阪府</SelectItem>
                  <SelectItem value="愛知県">愛知県</SelectItem>
                  <SelectItem value="福岡県">福岡県</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

                                         {/* 引当済み求人一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>引当済み求人一覧 ({filteredLinkedJobs.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLinkedJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                引当済みの求人がありません
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>企業名</TableHead>
                      <TableHead>職種</TableHead>
                      <TableHead>勤務地</TableHead>
                      <TableHead>給与</TableHead>
                      <TableHead>引当日/推薦日</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>担当RA</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLinkedJobs.map((job) => (
                     <TableRow key={job.id}>
                       <TableCell className="font-medium">{job.company}</TableCell>
                       <TableCell>{job.title}</TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1">
                           <MapPin className="h-3 w-3 text-muted-foreground" />
                           {job.location}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1">
                           <DollarSign className="h-3 w-3 text-muted-foreground" />
                           {formatSalary(job.salary)}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3 text-muted-foreground" />
                           {job.recommendationStatus === "recommended" && job.recommendedAt 
                             ? job.recommendedAt 
                             : job.linkedAt}
                         </div>
                       </TableCell>
                       <TableCell>{getRecommendationStatusBadge(job)}</TableCell>
                       <TableCell>
                         <span className="text-sm">{job.assignedRA || "未設定"}</span>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1">
                           {job.recommendationStatus === "linked" && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => openRecommendModal(job)}
                               aria-label={`${job.company}の${job.title}を推薦する`}
                             >
                               <Star className="h-3 w-3 mr-1" />
                               推薦
                             </Button>
                           )}
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => openUnlinkDialog(job)}
                             aria-label={`${job.company}の${job.title}の引当を解除する`}
                           >
                             <Unlink className="h-3 w-3 mr-1" />
                             解除
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => openJobDetail(job)}
                             aria-label={`${job.company}の${job.title}の詳細を表示する`}
                           >
                             <Eye className="h-3 w-3" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
               
               {/* 無限スクロール用のローディング */}
               {hasMore && (
                 <div className="flex justify-center py-4">
                   <Button
                     variant="outline"
                     onClick={loadMore}
                     disabled={isLoadingMore}
                     className="w-full"
                   >
                     {isLoadingMore ? (
                       <>
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                         読み込み中...
                       </>
                     ) : (
                       'さらに読み込む'
                     )}
                   </Button>
                 </div>
               )}
               
               {/* 全件表示完了 */}
               {!hasMore && paginatedLinkedJobs.length > 0 && (
                 <div className="text-center py-4 text-sm text-muted-foreground">
                   すべての求人を表示しました
                 </div>
               )}
             </div>
           )}
         </CardContent>
       </Card>
    </div>
  )
}
