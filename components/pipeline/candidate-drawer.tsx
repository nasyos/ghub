"use client"

import { useState, useEffect } from "react"
import { ApplicationRow, ApplicationDetail } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { RecommendationTab } from "@/components/pipeline/recommendation-tab"
import { ProgressTab } from "@/components/pipeline/progress-tab"
import { ResumeTab } from "@/components/pipeline/resume-tab"
import { CANotesTab } from "@/components/pipeline/ca-notes-tab"
import { 
  X, 
  User, 
  Building, 
  Calendar, 
  MapPin, 
  DollarSign,
  Target,
  Star,
  FileText,
  MessageSquare,
  Send,
  CheckCircle,
  RotateCcw,
  Clock,
  Users,
  Pin
} from "lucide-react"

interface CandidateDrawerProps {
  isOpen: boolean
  candidateId: string | null
  onClose: () => void
  onApplicationUpdated?: (updatedApplication: ApplicationRow) => void
  initialActiveTab?: string
}

export function CandidateDrawer({ 
  isOpen, 
  candidateId, 
  onClose, 
  onApplicationUpdated, 
  initialActiveTab 
}: CandidateDrawerProps) {
  const [application, setApplication] = useState<ApplicationRow | null>(null)
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(initialActiveTab || "overview")
  const [caNotes, setCaNotes] = useState<any>(null)

  // candidateIdが変更されたらデータを取得
  useEffect(() => {
    if (candidateId && isOpen) {
      const loadData = async () => {
        setLoading(true)
        try {
          // まずapplicationの基本情報を取得
          const applications = await pipelineApi.getApplications({})
          console.log("All applications:", applications.items)
          console.log("Looking for candidateId:", candidateId)
          const app = applications.items.find(a => a.id === candidateId)
          console.log("Found application:", app)
          if (app) {
            setApplication(app)
            
            // 詳細情報とCAメモを並行取得
            const [detailData, notesData] = await Promise.all([
              pipelineApi.getApplicationDetail(candidateId),
              pipelineApi.getCANotes(candidateId)
            ])
            setDetail(detailData)
            setCaNotes(notesData)
          } else {
            console.error("Application not found:", candidateId)
          }
        } catch (error) {
          console.error("Failed to load candidate data:", error)
        } finally {
          setLoading(false)
        }
      }

      loadData()
    } else {
      setApplication(null)
      setDetail(null)
      setCaNotes(null)
    }
  }, [candidateId, isOpen])

  const getNextActionButton = () => {
    if (!application) return null

    switch (application.next_action) {
      case "推薦送付":
        return (
          <Button 
            className="w-full"
            onClick={() => setActiveTab("recommend")}
          >
            <Send className="h-4 w-4 mr-2" />
            推薦文作成
          </Button>
        )
      case "候補日提示":
        return (
          <Button className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            候補日を提案
          </Button>
        )
      case "日程確定":
        return (
          <Button 
            className="w-full"
            onClick={() => setActiveTab("progress")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            日程管理
          </Button>
        )
      case "結果入力":
        return (
          <Button 
            className="w-full"
            onClick={() => setActiveTab("progress")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            結果を入力
          </Button>
        )
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* バックドロップ */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full bg-white border-l z-50 pipeline-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex-shrink-0 border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                                 ) : application ? (
                   <>
                     <h2 id="drawer-title" className="text-lg font-semibold truncate">
                       {application.candidate.name}
                     </h2>
                     <p className="text-sm text-muted-foreground truncate">
                       {application.job.title} • {application.job.company}
                     </p>
                   </>
                 ) : (
                  <h2 id="drawer-title" className="text-lg font-semibold">
                    候補者詳細
                  </h2>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* アクションボタン */}
            {getNextActionButton()}
          </div>

          {/* タブ */}
          <div className="flex-shrink-0 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="resume">履歴書類</TabsTrigger>
                <TabsTrigger value="ca-notes">CAメモ</TabsTrigger>
                <TabsTrigger value="recommend">推薦</TabsTrigger>
                <TabsTrigger value="progress">選考</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : application && detail ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsContent value="overview" className="h-full m-0">
                  <div className="p-4 space-y-4">
                    {/* 基本情報 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">基本情報</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                                                 <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">候補者名</p>
                             <p className="font-medium">{application.candidate.name}</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">求人</p>
                             <p className="font-medium">{application.job.title}</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">企業</p>
                             <p className="font-medium">{application.job.company}</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">ステータス</p>
                             <Badge variant="outline">{application.stage}</Badge>
                           </div>
                         </div>
                      </CardContent>
                    </Card>

                    {/* 選考情報 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">選考情報</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">次のアクション</p>
                            <p className="font-medium">{application.next_action}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">最終更新</p>
                            <p className="font-medium">
                              {new Date(application.last_activity_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="resume" className="h-full m-0 pipeline-tab-content">
                  <ResumeTab application={application} detail={detail} />
                </TabsContent>

                <TabsContent value="ca-notes" className="h-full m-0 pipeline-tab-content">
                  <CANotesTab 
                    application={application} 
                    notes={caNotes}
                    onNotesUpdated={(updatedNotes) => setCaNotes(updatedNotes)}
                  />
                </TabsContent>

                <TabsContent value="recommend" className="h-full m-0 pipeline-tab-content">
                  <RecommendationTab 
                    application={application}
                    onApplicationUpdated={onApplicationUpdated}
                  />
                </TabsContent>

                <TabsContent value="progress" className="h-full m-0 pipeline-tab-content">
                  <ProgressTab 
                    application={application}
                    onApplicationUpdated={onApplicationUpdated}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                候補者情報が見つかりません
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Drawer専用のCSS調整
const drawerStyles = `
  .pipeline-drawer {
    width: 100vw;
    max-width: 100vw;
    transition: transform 0.25s ease-in-out;
  }
  
  @media (min-width: 768px) {
    .pipeline-drawer {
      width: 35vw;
      max-width: 35vw;
    }
  }
  
  @media (min-width: 1280px) {
    .pipeline-drawer {
      width: 39rem;
      max-width: 39rem;
    }
  }
  
  .pipeline-drawer .pipeline-tab-content {
    height: calc(100vh - 200px);
    overflow-y: auto;
  }
  
  .pipeline-drawer .pipeline-tab-content > div {
    height: 100%;
    margin: 0;
    padding: 0;
  }
`

// スタイルを適用
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = drawerStyles
  document.head.appendChild(styleElement)
}
