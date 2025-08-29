"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { Messages } from "@/components/messages"
import { Candidates } from "@/components/candidates"
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

const PAGE_PRIORITY = [
  "dashboard",
  "messages",
  "candidates",
  "candidate-detail", // Added candidate-detail to PAGE_PRIORITY array
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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const { user, isLoading, roleNormalized, canSeePage } = useAuth()
  const { toast } = useToast()

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
        return (
          <Messages
            onNavigateToCandidateDetail={(candidateId) => {
              setSelectedCandidateId(candidateId)
              goto("candidate-detail" as PageId)
            }}
          />
        )
      case "candidates":
        return (
          <Candidates
            onNavigate={(page, candidateId) => {
              if (page === "candidate-detail" && candidateId) {
                setSelectedCandidateId(candidateId)
                goto("candidate-detail" as PageId)
              }
            }}
          />
        )
      case "candidate-detail":
        return <CandidateDetail candidateId={selectedCandidateId} onBack={() => goto("candidates")} />
      case "jobs":
        return (
          <Jobs
            onNavigateToSelection={(jobId) => {
              setSelectedJobId(jobId)
              goto("jobSelection")
            }}
          />
        )
      case "jobSelection":
        return (
          <JobSelection
            jobId={selectedJobId || ""}
            onBack={() => goto("jobs")}
            onNavigateToCandidateDetail={(candidateId) => {
              setSelectedCandidateId(candidateId)
              goto("candidate-detail" as PageId)
            }}
            onNavigateToMessages={(candidateId) => {
              setSelectedCandidateId(candidateId)
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
        return "候補者管理"
      case "candidate-detail":
        return "候補者詳細"
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

  return (
    <SidebarProvider>
      <AppSidebar currentPage={currentPage} goto={goto} />
      <SidebarInset>
        <NotificationBanner onReconnectClick={handleReconnectClick} />

        {currentPage !== "messages" && (
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" onClick={() => goto("dashboard")}>
                    ホーム
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getBreadcrumbTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto">
              <NotificationCenter
                onReconnectClick={handleReconnectClick}
                onSettingsClick={handleNotificationSettingsClick}
              />
            </div>
          </header>
        )}
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
