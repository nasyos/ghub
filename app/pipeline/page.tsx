"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PipelineTable } from "@/components/pipeline/pipeline-table"
import { PipelineDetail } from "@/components/pipeline/pipeline-detail"
import { PipelineFilters } from "@/components/pipeline/pipeline-filters"
import { ApplicationRow, PipelineFilters as PipelineFiltersType } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Building, Users, Clock } from "lucide-react"

export default function PipelinePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PipelineFiltersType>({})
  const [jobFilterActive, setJobFilterActive] = useState(false)
  const [rightPaneActiveTab, setRightPaneActiveTab] = useState<string>("overview")
  const [jobFilterInfo, setJobFilterInfo] = useState<{ 
    id: string
    title: string; 
    company: string;
    stats?: {
      total: number;
      passed: number;
      fitLevels: { high: number; mid: number; low: number };
      overdue: number;
    }
  } | null>(null)
  const [isRightPaneOverlay, setIsRightPaneOverlay] = useState(false)

  // URLパラメータから初期フィルタを設定
  useEffect(() => {
    const jobId = searchParams.get("jobId")
    if (jobId) {
      setFilters(prev => ({ ...prev, jobId }))
      setJobFilterActive(true)
      // 求人情報を取得して表示
      setJobFilterInfo({ 
        id: jobId,
        title: "フロントエンドエンジニア", 
        company: "テック株式会社",
        stats: {
          total: 0,
          passed: 0,
          fitLevels: { high: 0, mid: 0, low: 0 },
          overdue: 0
        }
      })
    }
  }, [searchParams])

  // データ取得
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true)
      try {
        const result = await pipelineApi.getApplications(filters)
        setApplications(result.items)
        
        // 自動選択を無効化 - ユーザーが手動で選択するまで詳細ペインは表示しない

        // 求人スコープモードの場合、統計を計算
        if (jobFilterActive) {
          const total = result.items.length
          const overdue = result.items.filter(app => {
            const days = Math.floor((Date.now() - new Date(app.last_activity_at).getTime()) / (1000 * 60 * 60 * 24))
            return days >= 3 // 3日以上経過しているものをOverdueとする
          }).length

          setJobFilterInfo(prev => prev ? {
            ...prev,
            stats: {
              total,
              passed: 0, // 削除予定
              fitLevels: { high: 0, mid: 0, low: 0 }, // 削除予定
              overdue
            }
          } : null)
        }
      } catch (error) {
        toast({
          title: "データ読み込みエラー",
          description: "選考データの読み込みに失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [filters, toast, jobFilterActive])

  const handleFilterChange = (newFilters: PipelineFiltersType) => {
    setFilters(newFilters)
    // フィルタ変更時は選択をクリア
    setSelectedApplication(null)
  }

  const handleJobFilterRemove = () => {
    setFilters(prev => {
      const { jobId, ...rest } = prev
      return rest
    })
    setJobFilterActive(false)
    setJobFilterInfo(null)
    // 横断版に遷移
    router.push("/pipeline")
  }

  const handleOpenJobDetail = () => {
    if (jobFilterInfo) {
      router.push(`/jobs/${jobFilterInfo.id}`)
    }
  }

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      setIsRightPaneOverlay(window.innerWidth < 1280)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`h-full ${isRightPaneOverlay ? 'grid grid-cols-[1fr]' : 'grid grid-cols-[1fr_minmax(380px,420px)]'}`}>
      {/* 中央: フィルタとテーブル */}
      <div className="flex flex-col">
        {/* ヘッダー */}
        <div className="border-b p-3">
          {jobFilterActive && jobFilterInfo ? (
            // 求人スコープモード
            <div className="space-y-3">
              {/* 求人固定バッジ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>求人：{jobFilterInfo.title}（企業：{jobFilterInfo.company}）</span>
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleJobFilterRemove}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    横断版で開く
                  </Button>
                </div>

              </div>

              {/* 求人サマリ統計 */}
              {jobFilterInfo.stats && (
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">進行中</p>
                          <p className="text-lg font-semibold">{jobFilterInfo.stats.total}件</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Overdue</p>
                          <p className="text-lg font-semibold">{jobFilterInfo.stats.overdue}件</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            // 横断版モード
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">選考管理</h1>
                <p className="text-sm text-muted-foreground">候補者×求人の選考案件を横断で管理します</p>
              </div>
            </div>
          )}
        </div>

        {/* フィルタ */}
        <PipelineFilters 
          filters={filters} 
          onFiltersChange={handleFilterChange}
          jobFilterActive={jobFilterActive}
        />

        {/* テーブル */}
        <div className="flex-1 overflow-hidden">
          <PipelineTable
            applications={applications}
            loading={loading}
            selectedApplication={selectedApplication}
            onSelectApplication={setSelectedApplication}
            jobFilterActive={jobFilterActive}
            onOpenRecommendTab={(app) => {
              setSelectedApplication(app)
              setRightPaneActiveTab("recommend")
            }}
            onOpenProgressTab={(app) => {
              setSelectedApplication(app)
              setRightPaneActiveTab("progress")
            }}
          />
        </div>
      </div>

      {/* 右側: 詳細ペイン */}
      {selectedApplication && (
        <>
          {isRightPaneOverlay ? (
            // オーバーレイ表示
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSelectedApplication(null)}
              />
              <div className="fixed right-0 top-0 w-[400px] h-full bg-white border-l z-50">
                <PipelineDetail
                  application={selectedApplication}
                  onClose={() => setSelectedApplication(null)}
                  initialActiveTab={rightPaneActiveTab}
                  onApplicationUpdated={(updatedApplication) => {
                    setApplications(prev => 
                      prev.map(app => 
                        app.id === updatedApplication.id ? updatedApplication : app
                      )
                    )
                    setSelectedApplication(updatedApplication)
                  }}
                />
              </div>
            </>
          ) : (
            // 通常表示
            <div className="border-l bg-white">
              <PipelineDetail
                application={selectedApplication}
                onClose={() => setSelectedApplication(null)}
                initialActiveTab={rightPaneActiveTab}
                onApplicationUpdated={(updatedApplication) => {
                  setApplications(prev => 
                    prev.map(app => 
                      app.id === updatedApplication.id ? updatedApplication : app
                    )
                  )
                  setSelectedApplication(updatedApplication)
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
