"use client"

import { useState, useEffect } from "react"
import { ApplicationRow, ApplicationDetail } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

interface PipelineDetailProps {
  application: ApplicationRow
  onClose: () => void
  onApplicationUpdated?: (updatedApplication: ApplicationRow) => void
  initialActiveTab?: string
}

export function PipelineDetail({ application, onClose, onApplicationUpdated, initialActiveTab }: PipelineDetailProps) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(initialActiveTab || "overview")
  const [caNotes, setCaNotes] = useState<any>(null)

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true)
      try {
        const [detailData, notesData] = await Promise.all([
          pipelineApi.getApplicationDetail(application.id),
          pipelineApi.getCANotes(application.id)
        ])
        setDetail(detailData)
        setCaNotes(notesData)
      } catch (error) {
        console.error("Failed to load application detail:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [application.id])

  const getNextActionButton = () => {
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
            結果入力
          </Button>
        )
      default:
        return null
    }
  }



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
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{application.candidate.name}</h2>
            <p className="text-sm text-muted-foreground">{application.job.title} | {application.job.company}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 次アクションボタン */}
      <div className="p-4 border-b">
        {getNextActionButton()}
      </div>

      {/* タブコンテンツ */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                 <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="resume">履歴書類</TabsTrigger>
              <TabsTrigger value="notes">CAメモ</TabsTrigger>
              <TabsTrigger value="recommend">推薦</TabsTrigger>
              <TabsTrigger value="progress">選考</TabsTrigger>
            </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="h-full p-4 space-y-4">
              {/* CA要約（ピン留め） */}
              {caNotes?.isPinned && caNotes?.summary && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Pin className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-sm text-blue-800">CA要約（ピン留め）</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-900">{caNotes.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">基本情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">候補者: {application.candidate.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">求人: {application.job.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">企業: {application.job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">勤務地: {application.job.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ステータス情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ステータス</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">ステージ</span>
                      <div className="mt-1">
                        <Badge variant="outline">{application.stage}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">次アクション</span>
                      <div className="mt-1">
                        <Badge variant="secondary">{application.next_action}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">必須要件</span>
                      <div className="mt-1">
                        <Badge className={application.must_match_summary === "全✓" ? "bg-green-100 text-green-800" : 
                                         application.must_match_summary === "△含む" ? "bg-yellow-100 text-yellow-800" : 
                                         "bg-red-100 text-red-800"}>
                          {application.must_match_summary}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">適合度</span>
                      <div className="mt-1">
                        <Badge className={application.fit_level === "High" ? "bg-green-100 text-green-800" : 
                                         application.fit_level === "Mid" ? "bg-yellow-100 text-yellow-800" : 
                                         "bg-red-100 text-red-800"}>
                          {application.fit_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 担当者情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">担当者</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">RA: {application.owners.ra}</span>
                    </div>
                    {application.owners.ca && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">CA: {application.owners.ca}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 直近メモ */}
              {application.last_memo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">直近メモ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{application.last_memo}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resume" className="h-full p-4">
              <ResumeTab application={application} />
            </TabsContent>

            <TabsContent value="notes" className="h-full p-4">
              <CANotesTab 
                application={application}
                onNotesSaved={onApplicationUpdated}
                onNavigateToRecommend={() => setActiveTab("recommend")}
              />
            </TabsContent>

            <TabsContent value="recommend" className="h-full p-4">
              <RecommendationTab 
                application={application}
                prefilledData={caNotes ? {
                  summary: caNotes.summary,
                  body: caNotes.body
                } : undefined}
              />
            </TabsContent>



            <TabsContent value="progress" className="h-full p-4">
              <ProgressTab
                application={application}
                onProgressUpdated={onApplicationUpdated}
              />
            </TabsContent>

            
          </div>
        </Tabs>
      </div>
    </div>
  )
}
