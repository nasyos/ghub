"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, AlertTriangle, Info, AlertCircle, Settings } from "lucide-react"
import { tokenMonitoringApi, type TokenExpiryNotification } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface NotificationCenterProps {
  onReconnectClick: (pageId: string) => void
  onSettingsClick: () => void
}

export function NotificationCenter({ onReconnectClick, onSettingsClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<TokenExpiryNotification[]>([])
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return

      try {
        const notifs = await tokenMonitoringApi.getNotifications(user.id)
        setNotifications(notifs)
      } catch (error) {
        console.error("Failed to load notifications:", error)
      }
    }

    loadNotifications()

    // Refresh every minute
    const interval = setInterval(loadNotifications, 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    // Load email notification preference
    const saved = localStorage.getItem("emailNotificationsEnabled")
    if (saved !== null) {
      setEmailNotificationsEnabled(JSON.parse(saved))
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (notificationId: string) => {
    try {
      await tokenMonitoringApi.markNotificationAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const toggleEmailNotifications = () => {
    const newValue = !emailNotificationsEnabled
    setEmailNotificationsEnabled(newValue)
    localStorage.setItem("emailNotificationsEnabled", JSON.stringify(newValue))
  }

  const getNotificationIcon = (status: TokenExpiryNotification["status"]) => {
    switch (status) {
      case "expired":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "expiring_urgent":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "expiring_soon":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationMessage = (notification: TokenExpiryNotification) => {
    const { status, daysRemaining, pageName } = notification

    switch (status) {
      case "expired":
        return `${pageName}の接続が期限切れになりました`
      case "expiring_urgent":
        return `${pageName}の接続が残り${daysRemaining}日で期限切れです`
      case "expiring_soon":
        return `${pageName}の接続が残り${daysRemaining}日で期限切れになります`
      default:
        return `${pageName}の接続状態が変更されました`
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          通知
          <Button variant="ghost" size="sm" onClick={onSettingsClick} className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Email notification toggle */}
        <DropdownMenuItem onClick={toggleEmailNotifications} className="flex items-center justify-between">
          <span>メール通知</span>
          <Badge variant={emailNotificationsEnabled ? "default" : "secondary"}>
            {emailNotificationsEnabled ? "ON" : "OFF"}
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">通知はありません</div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                  onClick={() => {
                    markAsRead(notification.id)
                    onReconnectClick(notification.pageId)
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.status)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium">{getNotificationMessage(notification)}</CardTitle>
                        <CardDescription className="text-xs">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </CardDescription>
                      </div>
                      {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
