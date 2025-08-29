"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { tokenMonitoringApi, type FacebookPage } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface NotificationBannerProps {
  onReconnectClick: (pageId: string) => void
}

export function NotificationBanner({ onReconnectClick }: NotificationBannerProps) {
  const [expiringPages, setExpiringPages] = useState<FacebookPage[]>([])
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  useEffect(() => {
    const loadExpiringPages = async () => {
      if (!user || user.role !== "管理者") return

      try {
        const pages = await tokenMonitoringApi.getExpiringPages(user.id)
        setExpiringPages(pages)
      } catch (error) {
        console.error("Failed to load expiring pages:", error)
      }
    }

    loadExpiringPages()

    // Refresh every 5 minutes
    const interval = setInterval(loadExpiringPages, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  // Only show to administrators
  if (!user || user.role !== "管理者") {
    return null
  }

  const visiblePages = expiringPages.filter((page) => !dismissedBanners.has(page.id))

  if (visiblePages.length === 0) {
    return null
  }

  const dismissBanner = (pageId: string) => {
    setDismissedBanners((prev) => new Set([...prev, pageId]))
  }

  const getBannerConfig = (page: FacebookPage) => {
    const daysRemaining = tokenMonitoringApi.getDaysUntilExpiry(page)

    if (daysRemaining <= 0) {
      return {
        variant: "destructive" as const,
        icon: AlertCircle,
        message: `接続が期限切れになりました。再接続が完了するまでメッセージ送信はできません。`,
        buttonText: "再接続",
      }
    } else if (daysRemaining <= 7) {
      return {
        variant: "destructive" as const,
        icon: AlertTriangle,
        message: `重要：接続の有効期限が残り${daysRemaining}日です。再接続しないとメッセージ送受信ができなくなります。`,
        buttonText: "再接続",
      }
    } else {
      return {
        variant: "default" as const,
        icon: Info,
        message: `このFacebookページの接続があと${daysRemaining}日で期限切れになります。早めの再接続をおすすめします。`,
        buttonText: "再接続",
      }
    }
  }

  return (
    <div className="space-y-2">
      {visiblePages.map((page) => {
        const config = getBannerConfig(page)
        const Icon = config.icon

        return (
          <Alert key={page.id} variant={config.variant} className="relative">
            <Icon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>{page.name}</strong>: {config.message}
              </span>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant={config.variant === "destructive" ? "secondary" : "default"}
                  onClick={() => onReconnectClick(page.pageId)}
                >
                  {config.buttonText}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => dismissBanner(page.id)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}
