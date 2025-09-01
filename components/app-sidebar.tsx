"use client"

import type React from "react"

import { MessageSquare, BarChart3, Users, Settings, LogOut, Briefcase, UserCheck, Building2, GitBranch } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import type { PageId } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentPage: string
  goto: (page: PageId) => void
}

const navigationItems = [
  {
    title: "ダッシュボード",
    id: "dashboard",
    icon: BarChart3,
    testId: "nav-dashboard",
  },
  {
    title: "メッセージ管理",
    id: "messages",
    icon: MessageSquare,
    testId: "nav-messages",
  },
  {
    title: "求職者管理",
    id: "candidates",
    icon: Users,
    testId: "nav-candidates",
  },
  {
    title: "選考管理",
    id: "pipeline",
    icon: GitBranch,
    testId: "nav-pipeline",
  },
  {
    title: "求人管理",
    id: "jobs",
    icon: Briefcase,
    testId: "nav-jobs",
  },
  {
    title: "取引先管理",
    id: "partners",
    icon: Building2,
    testId: "nav-partners",
  },
  {
    title: "コミュニティ管理",
    id: "communities",
    icon: UserCheck,
    testId: "nav-communities",
  },
  {
    title: "設定",
    id: "settings",
    icon: Settings,
    testId: "nav-settings",
  },
]

export function AppSidebar({ currentPage, goto, ...props }: AppSidebarProps) {
  const { user, logout, roleNormalized, canSeePage } = useAuth()
  const { unread, markAllRead } = useNotifications()

  const handleLogout = () => {
    logout()
  }

  const handlePageChange = (pageId: PageId) => {
    if (pageId === "candidates") {
      markAllRead("candidates")
    }
    goto(pageId)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="text-left">
            <div className="font-bold text-lg leading-tight text-gray-900">G-Hub</div>
            <div className="text-xs text-gray-700 font-medium leading-tight">
              GlobalHire Hub
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs">メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (!canSeePage?.(item.id as PageId)) {
                  return null
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={currentPage === item.id}
                      onClick={() => handlePageChange(item.id as PageId)}
                      data-testid={item.testId}
                      className="text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-xs">{item.title}</span>
                      {item.id === "candidates" && unread.candidates > 0 && (
                        <span
                          data-testid="nav-badge-candidates"
                          className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
                        >
                          {unread.candidates}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2 space-y-2">
          <div className="text-center">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <Badge
              variant={user?.role === "admin" ? "default" : user?.role === "ca_manager" ? "secondary" : "outline"}
              className="text-xs mt-1"
            >
              {user?.role === "admin" ? "管理者" : user?.role === "ca_manager" ? "CA（管理）" : "CA（担当）"}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent h-7 text-xs">
            <LogOut className="h-3 w-3 mr-1" />
            ログアウト
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
