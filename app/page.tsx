"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { Messages } from "@/components/messages"
import CandidatesPage from "@/app/candidates/page"
import Jobs from "@/components/jobs"
import { Settings } from "@/components/settings"
import { Communities } from "@/components/communities"
import PartnersClient from "@/app/partners/_components/PartnersClient"
import { ApplyForm } from "@/components/apply-form"
import { Login } from "@/components/login"
import { NotificationBanner } from "@/components/notification-banner"
import { NotificationCenter } from "@/components/notification-center"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import CandidateDetail from "@/components/candidate-detail"
import { JobSelection } from "@/components/job-selection"
import LinkJobs from "@/components/link-jobs"
import ProgressManagement from "@/components/progress"
import { useRouter } from "next/navigation"
import PipelinePage from "@/app/pipeline/page"
import { candidatesApi } from "@/lib/api"
import { Candidate } from "@/lib/candidates/types"

const PAGE_PRIORITY = [
  "dashboard",
  "messages",
  "candidates",
  "candidate-detail", // Added candidate-detail to PAGE_PRIORITY array
  "pipeline", // 選考管理（横断版）を追加
  "jobs",
  "jobSelection",
  "partners", // 取引先管理を追加
  "communities",
  "settings",
  "apply",
] as const

type PageId = (typeof PAGE_PRIORITY)[number]

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [candidateDetailTab, setCandidateDetailTab] = useState<"detail" | "jobs" | "progress">("detail")
  const { user, isLoading, roleNormalized, canSeePage } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!canSeePage) return
    if (!canSeePage(currentPage as any)) {
      const fallback = PAGE_PRIORITY.find((p) => canSeePage(p))
      if (fallback) setCurrentPage(fallback)
    }
  }, [roleNormalized, canSeePage, currentPage])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get("ref")
      if (ref) {
        setCurrentPage("apply")
        localStorage.setItem("apply_last_ref", ref)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const loadCandidate = async (candidateId: string) => {
    try {
      const candidate = await candidatesApi.getCandidate(candidateId)
      if (candidate) {
        setSelectedCandidate(candidate)
      }
    } catch (error) {
      console.error("候補者データの取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "候補者データの取得に失敗しました",
        variant: "destructive",
      })
    }
  }

  const goto = (page: PageId) => {
    if (canSeePage && canSeePage(page)) {
      setCurrentPage(page)
    } else {
      toast({
        title: "権限がありません",
        description: "このページにはアクセスできません。",
      })
    }
  }

  const handleReconnectClick = (pageId: string) => {
    // Navigate to settings and trigger reconnection
    setCurrentPage("settings")
    // Store the page ID to trigger reconnection in settings
    localStorage.setItem("reconnect_page_id", pageId)
  }

  const handleNotificationSettingsClick = () => {
    setCurrentPage("settings")
    // Store flag to open notification settings
    localStorage.setItem("open_notification_settings", "true")
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "messages":
        return <Messages />
      case "candidates":
        return (
          <CandidatesPage 
            onNavigateToDetail={(candidateId) => {
              setSelectedCandidateId(candidateId)
              loadCandidate(candidateId)
              setCurrentPage("candidate-detail")
            }}
          />
        )

      case "candidate-detail":
        return (
          <div className="p-6 space-y-4">
            {/* ページタイトル */}
            <h1 className="text-2xl font-bold">
              {selectedCandidate?.name || `求職者 ${selectedCandidateId}`}
            </h1>
            
            {/* タブ */}
            <div className="flex gap-4 border-b mb-4">
                               {[
                   { key: "detail", label: "求職者詳細" },
                   { key: "jobs", label: "求人引当" },
                   { key: "progress", label: "選考進捗" },
                 ].map((t) => {
                const isActive = t.key === candidateDetailTab
                return (
                  <button
                    key={t.key}
                    onClick={() => setCandidateDetailTab(t.key as "detail" | "jobs" | "progress")}
                    className={`pb-2 -mb-[1px] border-b-2 ${
                      isActive ? "border-foreground font-medium" : "border-transparent text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
            
            {/* コンテンツ */}
            {candidateDetailTab === "detail" && (
              <CandidateDetail 
                candidate={selectedCandidate}
                onBack={() => goto("candidates")} 
                hideHeader={true}
              />
            )}
            {candidateDetailTab === "jobs" && (
              <LinkJobs 
                candidateId={selectedCandidateId || ""} 
                candidateName={selectedCandidate?.name || `候補者 ${selectedCandidateId}`}
              />
            )}
            {candidateDetailTab === "progress" && (
              <ProgressManagement 
                candidateId={selectedCandidateId || ""} 
                candidateName={selectedCandidate?.name || `候補者 ${selectedCandidateId}`}
              />
            )}
          </div>
        )
      case "pipeline":
        return <PipelinePage />
      case "jobs":
        return (
          <Jobs
            onNavigateToSelection={(jobId) => {
              setSelectedJobId(jobId)
              goto("jobSelection")
            }}
            onNavigateToPipeline={(jobId) => {
              setCurrentPage("pipeline")
              // URLパラメータを設定
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href)
                url.searchParams.set("jobId", jobId)
                window.history.pushState({}, "", url.toString())
              }
            }}
          />
        )
      case "jobSelection":
        return (
          <JobSelection
            jobId={selectedJobId || ""}
            onBack={() => goto("jobs")}
            onNavigateToCandidateDetail={(candidateId) => {
              // ページ内で求職者詳細に切り替え
              setSelectedCandidateId(String(candidateId))
              setCurrentPage("candidate-detail")
            }}
            onNavigateToMessages={(candidateId) => {
              setSelectedCandidateId(String(candidateId))
              goto("messages")
            }}
          />
        )
      case "partners":
        return <PartnersClient />
      case "communities":
        return <Communities />
      case "settings":
        return <Settings />
      case "apply":
        return <ApplyForm onBack={() => goto("dashboard")} />
      default:
        return <Dashboard />
    }
  }

  const getBreadcrumbTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "ダッシュボード"
      case "messages":
        return "メッセージ管理"
      case "candidates":
        return "求職者管理"
            case "candidate-detail":
        return "求職者詳細"
      case "pipeline":
        // URLパラメータをチェックして求人スコープモードかどうかを判定
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          const jobId = params.get("jobId")
          if (jobId) {
            return "選考管理（求人スコープ）"
          }
        }
        return "選考管理"
      case "jobs":
        return "求人管理"
      case "jobSelection":
        return "選考管理"
      case "partners":
        return "取引先管理"
      case "communities":
        return "コミュニティ管理"
      case "settings":
        return "設定"
      case "apply":
        return "応募フォーム"
      default:
        return "ダッシュボード"
    }
  }

  const getBreadcrumbs = () => {
    const breadcrumbs = []
    
    // ホーム
    breadcrumbs.push({
      label: "ホーム",
      href: "#",
      onClick: () => goto("dashboard")
    })
    
    switch (currentPage) {
      case "pipeline":
        // URLパラメータをチェック
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          const jobId = params.get("jobId")
          if (jobId) {
            // 求人スコープモードの場合
            breadcrumbs.push({
              label: "求人管理",
              href: "#",
              onClick: () => goto("jobs")
            })
            breadcrumbs.push({
              label: "フロントエンドエンジニア（テック株式会社）", // TODO: 実際の求人情報を取得
              href: "#",
              onClick: () => goto("jobs")
            })
            breadcrumbs.push({
              label: "選考管理",
              href: "#"
            })
            return breadcrumbs
          }
        }
        // 横断版の場合
        breadcrumbs.push({
          label: "選考管理",
          href: "#"
        })
        break
      case "jobs":
        breadcrumbs.push({
          label: "求人管理",
          href: "#"
        })
        break
      case "candidates":
        breadcrumbs.push({
          label: "求職者管理",
          href: "#"
        })
        break
      case "candidate-detail":
        breadcrumbs.push({
          label: "求職者管理",
          href: "#",
          onClick: () => goto("candidates")
        })
        breadcrumbs.push({
          label: "求職者詳細",
          href: "#"
        })
        break
      case "messages":
        breadcrumbs.push({
          label: "メッセージ管理",
          href: "#"
        })
        break
      case "partners":
        breadcrumbs.push({
          label: "取引先管理",
          href: "#"
        })
        break
      case "communities":
        breadcrumbs.push({
          label: "コミュニティ管理",
          href: "#"
        })
        break
      case "settings":
        breadcrumbs.push({
          label: "設定",
          href: "#"
        })
        break
      case "apply":
        breadcrumbs.push({
          label: "応募フォーム",
          href: "#"
        })
        break
    }
    
    return breadcrumbs
  }

  return (
    <SidebarProvider>
      <AppSidebar currentPage={currentPage} goto={goto} />
      <SidebarInset>
        <NotificationBanner onReconnectClick={handleReconnectClick} />

        <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* 戻るボタン（求職者詳細ページの場合のみ） */}
          {currentPage === "candidate-detail" && (
            <>
              <button 
                onClick={() => goto("candidates")}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                ← 戻る
              </button>
              <Separator orientation="vertical" className="mr-2 h-4" />
            </>
          )}
          
          <div className="flex-1 min-w-0">
            <Breadcrumb>
              <BreadcrumbList className="flex items-center space-x-1 text-xs">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <BreadcrumbItem key={index} className="flex items-center">
                    {index < getBreadcrumbs().length - 1 ? (
                      <BreadcrumbLink 
                        href={breadcrumb.href} 
                        onClick={breadcrumb.onClick}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium">{breadcrumb.label}</BreadcrumbPage>
                    )}
                    {index < getBreadcrumbs().length - 1 && (
                      <BreadcrumbSeparator className="mx-2" />
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto">
            <NotificationCenter
              onReconnectClick={handleReconnectClick}
              onSettingsClick={handleNotificationSettingsClick}
            />
          </div>
        </header>
        {renderCurrentPage()}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  )
}
