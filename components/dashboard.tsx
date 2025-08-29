"use client"
import { useAuth } from "@/contexts/auth-context"
import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  Briefcase,
  FileText,
  CheckCircle,
  Filter,
  X,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"

const Skel: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className ?? "h-4 w-24"}`} />
)

const nz = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

type Period = "none" | "today" | "thisWeek" | "thisMonth" | "custom"
type JobPipeFilter = {
  locations: string[]
  visas: string[]
  period: Period
  from?: string
  to?: string
}

const defaultFilter: JobPipeFilter = { locations: [], visas: [], period: "none" }

function getRange(period: Period, from?: string, to?: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "today":
      return {
        start: new Date(today),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }
    case "thisWeek": {
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      return { start: monday, end: sunday }
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      return { start, end }
    }
    case "custom":
      if (from && to) {
        return {
          start: new Date(from + "T00:00:00"),
          end: new Date(to + "T23:59:59"),
        }
      }
      return undefined
    default:
      return undefined
  }
}

function intersects(jobStart?: string, jobEnd?: string, range?: { start: Date; end: Date }) {
  if (!range) return true
  if (!jobStart || !jobEnd) return false
  const s = new Date(jobStart + "T00:00:00")
  const e = new Date(jobEnd + "T23:59:59")
  return e >= range.start && s <= range.end
}

function matchMultiText(src: string | undefined, selected: string[]) {
  if (!selected?.length) return true
  if (!src) return false
  return selected.some((sel) => src.includes(sel))
}

function matchMultiArray(src: string[] | undefined, selected: string[]) {
  if (!selected?.length) return true
  if (!src?.length) return false
  return selected.some((sel) => src.some((v) => String(v).includes(sel)))
}

const kpiStats = [
  {
    status: "mentanmae",
    title: "面談前",
    todayValue: 24,
    mtdValue: 156,
    icon: MessageSquare,
    color: "text-blue-600",
  },
  {
    status: "camendan",
    title: "CA面談",
    todayValue: 8,
    mtdValue: 64,
    icon: Users,
    color: "text-orange-600",
  },
  {
    status: "shorui",
    title: "書類選考",
    todayValue: 12,
    mtdValue: 89,
    icon: FileText,
    color: "text-green-600",
  },
  {
    status: "mensetsu",
    title: "面接選考",
    todayValue: 6,
    mtdValue: 42,
    icon: Calendar,
    color: "text-purple-600",
  },
  {
    status: "naitei",
    title: "内定",
    todayValue: 3,
    mtdValue: 18,
    icon: Award,
    color: "text-yellow-600",
  },
  {
    status: "kettei",
    title: "決定",
    todayValue: 2,
    mtdValue: 12,
    icon: CheckCircle,
    color: "text-emerald-600",
  },
]

const caPerformanceData = [
  {
    id: 1,
    name: "田中CA",
    avatar: "/placeholder.svg?height=40&width=40",
    mentanmaeToday: 8,
    mentanmaeMtd: 42,
    camendanToday: 3,
    camendanMtd: 18,
    shoruiToday: 4,
    shoruiMtd: 24,
    mensetsuToday: 2,
    mensetsuMtd: 15,
    naiteiToday: 1,
    naiteiMtd: 8,
    ketteiToday: 1,
    ketteiMtd: 5,
  },
  {
    id: 2,
    name: "佐藤CA",
    avatar: "/placeholder.svg?height=40&width=40",
    mentanmaeToday: 6,
    mentanmaeMtd: 38,
    camendanToday: 2,
    camendanMtd: 16,
    shoruiToday: 3,
    shoruiMtd: 22,
    mensetsuToday: 1,
    mensetsuMtd: 12,
    naiteiToday: 0,
    naiteiMtd: 6,
    ketteiToday: 0,
    ketteiMtd: 4,
  },
  {
    id: 3,
    name: "鈴木CA",
    avatar: "/placeholder.svg?height=40&width=40",
    mentanmaeToday: 5,
    mentanmaeMtd: 35,
    camendanToday: 2,
    camendanMtd: 14,
    shoruiToday: 2,
    shoruiMtd: 18,
    mensetsuToday: 1,
    mensetsuMtd: 10,
    naiteiToday: 1,
    naiteiMtd: 4,
    ketteiToday: 1,
    ketteiMtd: 3,
  },
  {
    id: 4,
    name: "高橋CA",
    avatar: "/placeholder.svg?height=40&width=40",
    mentanmaeToday: 5,
    mentanmaeMtd: 41,
    camendanToday: 1,
    camendanMtd: 12,
    shoruiToday: 3,
    shoruiMtd: 25,
    mensetsuToday: 2,
    mensetsuMtd: 15,
    naiteiToday: 0,
    naiteiMtd: 0,
    ketteiToday: 0,
    ketteiMtd: 0,
  },
]

const inflowData = [
  {
    id: 1,
    source: "Facebook広告A",
    campaign: "キャンペーンA",
    todayInflow: 12,
    mtdInflow: 245,
  },
  {
    id: 2,
    source: "Facebook広告B",
    campaign: "キャンペーンB",
    todayInflow: 8,
    mtdInflow: 189,
  },
  {
    id: 3,
    source: "Instagram広告",
    campaign: "キャンペーンC",
    todayInflow: 6,
    mtdInflow: 156,
  },
  {
    id: 4,
    source: "LinkedIn広告",
    campaign: "キャンペーンD",
    todayInflow: 4,
    mtdInflow: 98,
  },
]

const jobApplicationData = [
  {
    id: 1,
    title: "ITエンジニア（フルスタック）",
    company: "株式会社テックイノベーション",
    todayApplications: 8,
    mtdApplications: 156,
  },
  {
    id: 2,
    title: "マーケティングマネージャー",
    company: "グローバルマーケティング株式会社",
    todayApplications: 6,
    mtdApplications: 134,
  },
  {
    id: 3,
    title: "営業マネージャー",
    company: "セールスエクセレンス株式会社",
    todayApplications: 5,
    mtdApplications: 98,
  },
  {
    id: 4,
    title: "デザイナー（UI/UX）",
    company: "クリエイティブデザイン株式会社",
    todayApplications: 4,
    mtdApplications: 87,
  },
]

const jobPipelineData = [
  {
    id: "JOB001",
    company: "株式会社ABC介護",
    title: "介護職員",
    location: "東京都新宿区",
    visa_requirements: ["特定技能1号", "介護"],
    start_date: "2024-01-01",
    end_date: "2024-03-31",
    mentanmae: 15,
    camendan: 8,
    shorui: 5,
    mensetsu: 3,
    naitei: 2,
    kettei: 1,
  },
  {
    id: "JOB002",
    company: "DEF建設株式会社",
    title: "建設作業員",
    location: "神奈川県横浜市",
    visa_requirements: ["特定技能1号", "建設"],
    start_date: "2024-01-15",
    end_date: "2024-04-15",
    mentanmae: 12,
    camendan: 6,
    shorui: 4,
    mensetsu: 2,
    naitei: 1,
    kettei: 0,
  },
  {
    id: "JOB003",
    company: "GHI製造株式会社",
    title: "製造オペレーター",
    location: "愛知県名古屋市",
    visa_requirements: ["特定技能1号", "製造業"],
    start_date: "2024-02-01",
    end_date: "2024-05-31",
    mentanmae: 18,
    camendan: 10,
    shorui: 7,
    mensetsu: 4,
    naitei: 2,
    kettei: 1,
  },
]

function KPICard({ stat, loading }: { stat: (typeof kpiStats)[0]; loading: boolean }) {
  const Icon = stat.icon
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
        <Icon className={`h-5 w-5 ${stat.color}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">本日</span>
            {loading ? (
              <div data-testid="loading-kpi">
                <Skel className="h-6 w-12" />
              </div>
            ) : (
              <Badge variant="outline" className="font-semibold text-lg" data-testid={`kpi-${stat.status}-today`}>
                {nz(stat.todayValue)}名
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">月間累計</span>
            {loading ? (
              <div data-testid="loading-kpi">
                <Skel className="h-6 w-12" />
              </div>
            ) : (
              <Badge variant="outline" className="font-semibold text-xl" data-testid={`kpi-${stat.status}-mtd`}>
                {nz(stat.mtdValue)}名
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard({
  onNavigate,
  setSelectedJobId,
}: {
  onNavigate?: (page: string) => void
  setSelectedJobId?: (id: string) => void
}) {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<"candidate-kpi" | "job-pipeline">("candidate-kpi")
  const [loading, setLoading] = useState(true)

  const [jobFilter, setJobFilter] = useState<JobPipeFilter>(() => {
    try {
      const saved = localStorage.getItem("jobpipe_filter_v2")
      return { ...defaultFilter, ...(saved ? JSON.parse(saved) : {}) }
    } catch {
      return defaultFilter
    }
  })

  useEffect(() => {
    localStorage.setItem("jobpipe_filter_v2", JSON.stringify(jobFilter))
  }, [jobFilter])

  const range = useMemo(() => getRange(jobFilter.period, jobFilter.from, jobFilter.to), [jobFilter])
  const jobsFiltered = useMemo(() => {
    return jobPipelineData.filter((job) => {
      if (!matchMultiText(job.location, jobFilter.locations)) return false
      const visaArr = Array.isArray(job.visa_requirements)
        ? job.visa_requirements
        : job.visa_requirements
          ? [job.visa_requirements]
          : []
      if (!matchMultiArray(visaArr, jobFilter.visas)) return false
      if (!intersects(job.start_date, job.end_date, range)) return false
      return true
    })
  }, [jobFilter, range])

  const locationOptions = useMemo(() => {
    const locations = jobPipelineData.map((job) => job.location).filter(Boolean)
    return [...new Set(locations)].sort()
  }, [])

  const visaOptions = useMemo(() => {
    const visas = jobPipelineData
      .flatMap((job) =>
        Array.isArray(job.visa_requirements)
          ? job.visa_requirements
          : job.visa_requirements
            ? [job.visa_requirements]
            : [],
      )
      .filter(Boolean)
    return [...new Set(visas)].sort()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  function handleTabChange(next: "candidate-kpi" | "job-pipeline") {
    setActiveTab(next)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleApplyFilter = () => {
    // Filter is applied automatically via useMemo
  }

  const handleResetFilter = () => {
    setJobFilter(defaultFilter)
  }

  const getFilteredCAData = () => {
    if (user?.role === "admin") {
      return [...caPerformanceData].sort((a, b) => b.ketteiMtd - a.ketteiMtd)
    } else if (user?.role === "ca_manager" && user?.managedCAs) {
      const managerCAName = `${user.name}CA`
      return caPerformanceData
        .filter((ca) => ca.name === managerCAName || user.managedCAs?.includes(ca.name))
        .sort((a, b) => b.ketteiMtd - a.ketteiMtd)
    } else if (user?.role === "ca_staff") {
      return caPerformanceData.filter((ca) => ca.name === `${user.name}CA`)
    }
    return []
  }

  const filteredCAData = getFilteredCAData()

  const handleJobRowClick = (jobId: string) => {
    setSelectedJobId?.(jobId)
    onNavigate?.("jobs")
  }

  const handleJobCellClick = (jobId: string, status: string) => {
    setSelectedJobId?.(jobId)
    onNavigate?.("jobSelection")
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>最終更新: 2025年8月29日 17:30</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidate-kpi" data-testid="tab-candidate-kpi">
            求職者進捗管理
          </TabsTrigger>
          <TabsTrigger value="job-pipeline" data-testid="tab-job-pipeline">
            求人別進捗管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidate-kpi" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {kpiStats.map((stat) => (
              <KPICard key={stat.status} stat={stat} loading={loading} />
            ))}
          </div>

          {user?.role !== "ca_staff" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>担当別パフォーマンス</span>
                  {user?.role === "ca_manager" && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                      管理対象CAのみ表示
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>各キャリアアドバイザーの進捗ステータス別実績（決定月間累計降順）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CA名</TableHead>
                        <TableHead className="text-center">面談前</TableHead>
                        <TableHead className="text-center">CA面談</TableHead>
                        <TableHead className="text-center">書類選考</TableHead>
                        <TableHead className="text-center">面接選考</TableHead>
                        <TableHead className="text-center">内定</TableHead>
                        <TableHead className="text-center">決定</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <>
                          {[0, 1, 2].map((i) => (
                            <TableRow key={`skel-${i}`} data-testid="loading-table-performance">
                              {Array.from({ length: 7 }).map((_, c) => (
                                <TableCell key={c}>
                                  <Skel className="h-4 w-full" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </>
                      ) : filteredCAData.length === 0 ? (
                        <TableRow data-testid="zero-state-performance">
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            データがありません
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCAData.map((ca) => (
                          <TableRow key={ca.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={ca.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{ca.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{ca.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="text-xl font-semibold">{nz(ca.mentanmaeToday)}</div>
                                <div className="text-base text-gray-500">{nz(ca.mentanmaeMtd)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="text-xl font-semibold">{nz(ca.camendanToday)}</div>
                                <div className="text-base text-gray-500">{nz(ca.camendanMtd)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="text-xl font-semibold">{nz(ca.shoruiToday)}</div>
                                <div className="text-base text-gray-500">{nz(ca.shoruiMtd)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="text-xl font-semibold">{nz(ca.mensetsuToday)}</div>
                                <div className="text-base text-gray-500">{nz(ca.mensetsuMtd)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="text-xl font-semibold">{nz(ca.naiteiToday)}</div>
                                <div className="text-base text-gray-500">{nz(ca.naiteiMtd)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="text-xl font-semibold">{nz(ca.ketteiToday)}</div>
                                <div className="text-base text-gray-500">{nz(ca.ketteiMtd)}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span>広告流入</span>
                </CardTitle>
                <CardDescription>媒体・キャンペーン別の流入数</CardDescription>
              </CardHeader>
              <CardContent>
                <Table data-testid="ad-inflow-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>媒体</TableHead>
                      <TableHead>キャンペーン</TableHead>
                      <TableHead className="text-center">流入（本日）</TableHead>
                      <TableHead className="text-center">流入（月間累計）</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <>
                        {[0, 1, 2].map((i) => (
                          <TableRow key={`skel-${i}`} data-testid="loading-table-ad-inflow">
                            {Array.from({ length: 4 }).map((_, c) => (
                              <TableCell key={c}>
                                <Skel className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </>
                    ) : inflowData.length === 0 ? (
                      <TableRow data-testid="zero-state-ad-inflow">
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          データがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      inflowData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.source}</TableCell>
                          <TableCell>{item.campaign}</TableCell>
                          <TableCell className="text-center">{nz(item.todayInflow)}</TableCell>
                          <TableCell className="text-center">{nz(item.mtdInflow)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <span>求人別申込み</span>
                </CardTitle>
                <CardDescription>求人毎の申込み数</CardDescription>
              </CardHeader>
              <CardContent>
                <Table data-testid="job-apply-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>求人名</TableHead>
                      <TableHead>企業名</TableHead>
                      <TableHead className="text-center">申込み（本日）</TableHead>
                      <TableHead className="text-center">申込み（月間累計）</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <>
                        {[0, 1, 2].map((i) => (
                          <TableRow key={`skel-${i}`} data-testid="loading-table-job-apply">
                            {Array.from({ length: 4 }).map((_, c) => (
                              <TableCell key={c}>
                                <Skel className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </>
                    ) : jobApplicationData.length === 0 ? (
                      <TableRow data-testid="zero-state-job-apply">
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          データがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobApplicationData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{item.company}</TableCell>
                          <TableCell className="text-center">{nz(item.todayApplications)}</TableCell>
                          <TableCell className="text-center">{nz(item.mtdApplications)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="job-pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span>フィルタ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>勤務地</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        data-testid="jobpipe-filter-location"
                      >
                        {jobFilter.locations.length === 0 ? "選択してください" : `${jobFilter.locations.length}件選択`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {locationOptions.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${location}`}
                              checked={jobFilter.locations.includes(location)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setJobFilter((prev) => ({ ...prev, locations: [...prev.locations, location] }))
                                } else {
                                  setJobFilter((prev) => ({
                                    ...prev,
                                    locations: prev.locations.filter((l) => l !== location),
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={`location-${location}`} className="text-sm">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>在留資格要件</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        data-testid="jobpipe-filter-visa"
                      >
                        {jobFilter.visas.length === 0 ? "選択してください" : `${jobFilter.visas.length}件選択`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {visaOptions.map((visa) => (
                          <div key={visa} className="flex items-center space-x-2">
                            <Checkbox
                              id={`visa-${visa}`}
                              checked={jobFilter.visas.includes(visa)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setJobFilter((prev) => ({ ...prev, visas: [...prev.visas, visa] }))
                                } else {
                                  setJobFilter((prev) => ({ ...prev, visas: prev.visas.filter((v) => v !== visa) }))
                                }
                              }}
                            />
                            <Label htmlFor={`visa-${visa}`} className="text-sm">
                              {visa}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>掲載期間</Label>
                  <Select
                    value={jobFilter.period}
                    onValueChange={(value: Period) => setJobFilter((prev) => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger data-testid="jobpipe-filter-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">期間条件なし</SelectItem>
                      <SelectItem value="today">今日</SelectItem>
                      <SelectItem value="thisWeek">今週</SelectItem>
                      <SelectItem value="thisMonth">今月</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>件数</Label>
                  <div
                    className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted"
                    data-testid="jobpipe-filter-count"
                  >
                    {jobsFiltered.length} / {jobPipelineData.length}
                  </div>
                </div>
              </div>

              {jobFilter.period === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>開始日</Label>
                    <Input
                      type="date"
                      value={jobFilter.from || ""}
                      onChange={(e) => setJobFilter((prev) => ({ ...prev, from: e.target.value }))}
                      data-testid="jobpipe-filter-from"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>終了日</Label>
                    <Input
                      type="date"
                      value={jobFilter.to || ""}
                      onChange={(e) => setJobFilter((prev) => ({ ...prev, to: e.target.value }))}
                      data-testid="jobpipe-filter-to"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={handleApplyFilter} data-testid="jobpipe-filter-apply">
                  適用
                </Button>
                <Button variant="outline" onClick={handleResetFilter} data-testid="jobpipe-filter-reset">
                  <X className="h-4 w-4 mr-2" />
                  リセット
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span>求人別進捗管理</span>
              </CardTitle>
              <CardDescription>
                求人毎の各ステータス人数（行クリック：求人詳細、人数クリック：選考管理）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table data-testid="job-pipeline-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>求人ID</TableHead>
                    <TableHead>企業名</TableHead>
                    <TableHead>職種</TableHead>
                    <TableHead>勤務地</TableHead>
                    <TableHead className="text-center">面談前</TableHead>
                    <TableHead className="text-center">CA面談</TableHead>
                    <TableHead className="text-center">書類選考</TableHead>
                    <TableHead className="text-center">面接選考</TableHead>
                    <TableHead className="text-center">内定</TableHead>
                    <TableHead className="text-center">決定</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      {[0, 1, 2].map((i) => (
                        <TableRow key={`skel-${i}`} data-testid="loading-table-job-pipeline">
                          {Array.from({ length: 10 }).map((_, c) => (
                            <TableCell key={c}>
                              <Skel className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ) : jobsFiltered.length === 0 ? (
                    <TableRow data-testid="zero-state-job-pipeline">
                      <TableCell colSpan={10} className="text-center text-muted-foreground">
                        データがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobsFiltered.map((job) => {
                      const isZeroRow = jobsFiltered.length === 0
                      return (
                        <TableRow
                          key={job.id}
                          className={isZeroRow ? "pointer-events-none opacity-70" : "cursor-pointer hover:bg-gray-50"}
                          onClick={isZeroRow ? undefined : () => handleJobRowClick(job.id)}
                        >
                          <TableCell className="font-medium">{job.id}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.title}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell
                            className="text-center cursor-pointer hover:bg-blue-50"
                            data-testid={`job-${job.id}-mentanmae-count`}
                            onClick={
                              isZeroRow
                                ? undefined
                                : (e) => {
                                    e.stopPropagation()
                                    handleJobCellClick(job.id, "mentanmae")
                                  }
                            }
                          >
                            {nz(job.mentanmae)}
                          </TableCell>
                          <TableCell
                            className="text-center cursor-pointer hover:bg-blue-50"
                            data-testid={`job-${job.id}-camendan-count`}
                            onClick={
                              isZeroRow
                                ? undefined
                                : (e) => {
                                    e.stopPropagation()
                                    handleJobCellClick(job.id, "camendan")
                                  }
                            }
                          >
                            {nz(job.camendan)}
                          </TableCell>
                          <TableCell
                            className="text-center cursor-pointer hover:bg-blue-50"
                            data-testid={`job-${job.id}-shorui-count`}
                            onClick={
                              isZeroRow
                                ? undefined
                                : (e) => {
                                    e.stopPropagation()
                                    handleJobCellClick(job.id, "shorui")
                                  }
                            }
                          >
                            {nz(job.shorui)}
                          </TableCell>
                          <TableCell
                            className="text-center cursor-pointer hover:bg-blue-50"
                            data-testid={`job-${job.id}-mensetsu-count`}
                            onClick={
                              isZeroRow
                                ? undefined
                                : (e) => {
                                    e.stopPropagation()
                                    handleJobCellClick(job.id, "mensetsu")
                                  }
                            }
                          >
                            {nz(job.mensetsu)}
                          </TableCell>
                          <TableCell
                            className="text-center cursor-pointer hover:bg-blue-50"
                            data-testid={`job-${job.id}-naitei-count`}
                            onClick={
                              isZeroRow
                                ? undefined
                                : (e) => {
                                    e.stopPropagation()
                                    handleJobCellClick(job.id, "naitei")
                                  }
                            }
                          >
                            {nz(job.naitei)}
                          </TableCell>
                          <TableCell
                            className="text-center cursor-pointer hover:bg-blue-50"
                            data-testid={`job-${job.id}-kettei-count`}
                            onClick={
                              isZeroRow
                                ? undefined
                                : (e) => {
                                    e.stopPropagation()
                                    handleJobCellClick(job.id, "kettei")
                                  }
                            }
                          >
                            {nz(job.kettei)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
