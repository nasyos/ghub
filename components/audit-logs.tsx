"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, Eye, Download } from "lucide-react"
import { auditLogger, AUDIT_ACTIONS } from "@/lib/audit-logger"
import { useAuth } from "@/contexts/auth-context"

interface AuditLogEntry {
  id: number
  user_id: number
  action: string
  entity_type: string
  entity_id?: string | number
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export function AuditLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [entityFilter, setEntityFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  // Mock users for filtering
  const mockUsers = [
    { id: 1, name: "田中 太郎" },
    { id: 2, name: "佐藤 花子" },
    { id: 3, name: "鈴木 一郎" },
    { id: 4, name: "高橋 美咲" },
    { id: 5, name: "山田 課長" },
    { id: 6, name: "管理者" },
  ]

  useEffect(() => {
    // Load audit logs
    const auditLogs = auditLogger.getLogs()
    setLogs(auditLogs)
    setFilteredLogs(auditLogs)
  }, [])

  useEffect(() => {
    let filtered = logs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.entity_id && log.entity_id.toString().toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    // Entity filter
    if (entityFilter !== "all") {
      filtered = filtered.filter((log) => log.entity_type === entityFilter)
    }

    // User filter
    if (userFilter !== "all") {
      filtered = filtered.filter((log) => log.user_id === Number.parseInt(userFilter))
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((log) => new Date(log.created_at) >= filterDate)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, actionFilter, entityFilter, userFilter, dateFilter])

  const getActionBadgeColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-800"
    if (action.includes("update")) return "bg-blue-100 text-blue-800"
    if (action.includes("delete")) return "bg-red-100 text-red-800"
    if (action.includes("login") || action.includes("logout")) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  const getEntityBadgeColor = (entityType: string) => {
    switch (entityType) {
      case "user":
        return "bg-purple-100 text-purple-800"
      case "candidate":
        return "bg-blue-100 text-blue-800"
      case "message":
        return "bg-green-100 text-green-800"
      case "facebook_page":
        return "bg-indigo-100 text-indigo-800"
      case "system":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUserName = (userId: number) => {
    const user = mockUsers.find((u) => u.id === userId)
    return user ? user.name : `User ${userId}`
  }

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const exportLogs = () => {
    const csvContent = [
      ["日時", "ユーザー", "アクション", "エンティティ", "エンティティID", "IPアドレス"].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.created_at).toLocaleString("ja-JP"),
          getUserName(log.user_id),
          formatAction(log.action),
          log.entity_type,
          log.entity_id || "",
          log.ip_address || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setActionFilter("all")
    setEntityFilter("all")
    setUserFilter("all")
    setDateFilter("all")
  }

  // Only allow admin users to view audit logs
  if (user?.role !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>アクセス拒否</CardTitle>
            <CardDescription>監査ログの閲覧には管理者権限が必要です。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

      return (
      <div className="flex-1 space-y-4 p-6 bg-gray-50 h-full overflow-y-auto">
        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
          <span>ホーム</span>
          <span>&gt;</span>
          <span>監査ログ</span>
        </div>
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">監査ログ</h1>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          CSVエクスポート
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            検索・フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="アクション、エンティティ、IDで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">アクション</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {Object.values(AUDIT_ACTIONS).map((action) => (
                      <SelectItem key={action} value={action}>
                        {formatAction(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">エンティティ</label>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="user">ユーザー</SelectItem>
                    <SelectItem value="candidate">候補者</SelectItem>
                    <SelectItem value="message">メッセージ</SelectItem>
                    <SelectItem value="facebook_page">Facebookページ</SelectItem>
                    <SelectItem value="system">システム</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ユーザー</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">期間</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="today">今日</SelectItem>
                    <SelectItem value="week">過去1週間</SelectItem>
                    <SelectItem value="month">過去1ヶ月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="w-full bg-transparent">
                  リセット
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>監査ログ一覧</CardTitle>
          <CardDescription>システム内のすべての重要な操作が記録されています ({filteredLogs.length}件)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>ユーザー</TableHead>
                <TableHead>アクション</TableHead>
                <TableHead>エンティティ</TableHead>
                <TableHead>エンティティID</TableHead>
                <TableHead>IPアドレス</TableHead>
                <TableHead>詳細</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {new Date(log.created_at).toLocaleString("ja-JP")}
                  </TableCell>
                  <TableCell>{getUserName(log.user_id)}</TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>{formatAction(log.action)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEntityBadgeColor(log.entity_type)}>{log.entity_type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.entity_id || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ip_address || "-"}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>監査ログ詳細</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">日時</label>
                              <p className="font-mono text-sm">{new Date(log.created_at).toLocaleString("ja-JP")}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">ユーザー</label>
                              <p>{getUserName(log.user_id)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">アクション</label>
                              <Badge className={getActionBadgeColor(log.action)}>{formatAction(log.action)}</Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">エンティティ</label>
                              <Badge className={getEntityBadgeColor(log.entity_type)}>{log.entity_type}</Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">エンティティID</label>
                              <p className="font-mono text-sm">{log.entity_id || "-"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">IPアドレス</label>
                              <p className="font-mono text-sm">{log.ip_address || "-"}</p>
                            </div>
                          </div>

                          {log.old_values && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">変更前の値</label>
                              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-auto">
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}

                          {log.new_values && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">変更後の値</label>
                              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-auto">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium text-gray-700">User Agent</label>
                            <p className="text-sm text-gray-600 break-all">{log.user_agent || "-"}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">条件に一致する監査ログが見つかりませんでした。</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
