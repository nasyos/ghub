"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Edit,
  Trash2,
  Send as Sync,
  Users,
  Search,
  RefreshCw,
  Link,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Lock,
  ExternalLink,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  Copy,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { facebookPagesApi, permissionHelpers, type FacebookPage } from "@/lib/api"
import { auditLogger } from "@/lib/audit-logger"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { tokenSecurity, securityMiddleware } from "@/lib/security"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

// Mock CA users for assignment
const mockCAUsers = [
  { id: "2", name: "佐藤 花子", email: "sato@company.com", role: "ca" },
  { id: "4", name: "高橋 美咲", email: "takahashi@company.com", role: "ca" },
  { id: "5", name: "山田 課長", email: "yamada@company.com", role: "ca_manager" },
  { id: "6", name: "田村 部長", email: "tamura@company.com", role: "ra_manager" },
]

interface FacebookPageFormData {
  name: string
  pageId: string
  token: string
  tokenExpiresAt: string
  linkedCAs: string[]
}

interface OAuthWizardState {
  step: "input" | "auth" | "processing" | "complete"
  pageUrl: string
  error: string | null
  isLoading: boolean
  connectedPage?: FacebookPage
  isReconnection?: boolean
  existingPage?: FacebookPage
}

const FacebookPagesSettings = () => {
  const { user } = useAuth()
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddPageOpen, setIsAddPageOpen] = useState(false)
  const [isEditPageOpen, setIsEditPageOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<FacebookPage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [caFilter, setCAFilter] = useState<string>("all")
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [formData, setFormData] = useState<FacebookPageFormData>({
    name: "",
    pageId: "",
    token: "",
    tokenExpiresAt: "",
    linkedCAs: [],
  })

  const [isOAuthWizardOpen, setIsOAuthWizardOpen] = useState(false)
  const [oauthWizard, setOAuthWizard] = useState<OAuthWizardState>({
    step: "input",
    pageUrl: "",
    error: null,
    isLoading: false,
  })

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  const helpContent = `【この画面でやること（概要）】
1) 接続するFacebookページのURLを入力
2) 「Facebookで接続」を押してポップアップでログイン＆権限を許可
3) ページ名／ページIDを確認し、担当CAを選んで「接続を完了する」

【② 権限付与（初回）の実操作フロー】
1. 「Facebookで接続」を押す（ポップアップが開かない場合はブラウザのポップアップを許可）
2. Facebookにログイン（対象ページの管理者アカウントで）
3. 「続行」→「許可の編集」を開き、今回つなぐ法人ページにチェック
4. 次の4つの権限をすべてONにする
   - pages_show_list（管理ページの一覧表示）
   - pages_manage_metadata（設定・Webhook購読）
   - pages_read_engagement（会話の読み取り）
   - pages_messaging（メッセージ送受信）
5. 「次へ」→「完了」→ポップアップが閉じたら③へ

【つまずきやすいポイント】
- 権限画面が出ない：過去に許可済みの可能性（そのまま進めてOK）。
  やり直す場合は Facebook「設定＞ビジネスインテグレーション」で本アプリを削除→再接続。
- 対象ページが出ない：そのFacebookユーザーがそのページの管理者ではない可能性。
- 送信不可／購読失敗：多くは pages_messaging / pages_manage_metadata の未許可が原因。
  ②をやり直してONにしてください。
- ポップアップが開かない：ブラウザのポップアップブロックを解除してください。`

  const copyHelpContent = async () => {
    try {
      await navigator.clipboard.writeText(helpContent)
      toast({
        title: "コピー完了",
        description: "手順内容をクリップボードにコピーしました",
      })
    } catch (error) {
      toast({
        title: "コピー失敗",
        description: "クリップボードへのコピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  const StepHelp = ({ step }: { step: "input" | "auth" | "processing" | "complete" }) => {
    const stepContent = {
      input: {
        title: "ページURLの入力",
        body: "接続したいFacebookページのURLを入力してください。例: https://www.facebook.com/<ユーザー名> または ページIDのURL。URLからページIDを自動解決します。解決できない場合はページIDを直接入力してください。",
      },
      auth: {
        title: "Facebookで接続（ログイン＆同意）",
        body: "ポップアップでFacebookにログインし、このアプリに権限を付与します。必要権限: pages_show_list / pages_manage_metadata / pages_read_engagement / pages_messaging。承認後、自動でページ情報を取得します。",
      },
      processing: {
        title: "確認＆CA紐付け",
        body: "接続するページ名とページIDを確認し、対応可能なCAを選択してください（複数選択可）。問題なければ「接続を完了する」を押してください。",
      },
      complete: {
        title: "接続完了",
        body: "接続が完了しました。接続状態は「Connected」となり、有効期限・最終同期が表示されます。Webhook購読も自動で設定されます。",
      },
    }

    const content = stepContent[step]

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-2">{content.title}</h4>
        <p className="text-sm text-blue-700">{content.body}</p>
      </div>
    )
  }

  // Load Facebook pages on component mount
  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    const reconnectPageId = localStorage.getItem("reconnect_page_id")
    if (reconnectPageId) {
      localStorage.removeItem("reconnect_page_id")
      const pageToReconnect = pages.find((p) => p.pageId === reconnectPageId)
      if (pageToReconnect) {
        startReconnectionWizard(pageToReconnect)
      }
    }
  }, [pages])

  const loadPages = async () => {
    try {
      setLoading(true)
      const data = await facebookPagesApi.getAll()
      if (user) {
        const visiblePages = permissionHelpers.getVisiblePages(user.role, user.id.toString(), data)
        setPages(visiblePages)
      } else {
        setPages(data)
      }
    } catch (error) {
      console.error("Failed to load Facebook pages:", error)
      toast({
        title: "エラー",
        description: "Facebookページの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startReconnectionWizard = (page: FacebookPage) => {
    setOAuthWizard({
      step: "input",
      pageUrl: `https://facebook.com/${page.pageId}`,
      error: null,
      isLoading: false,
      isReconnection: true,
      existingPage: page,
    })
    setIsOAuthWizardOpen(true)
  }

  const handleStartOAuthConnection = async () => {
    if (!oauthWizard.pageUrl.trim()) {
      setOAuthWizard((prev) => ({ ...prev, error: "ページURLを入力してください" }))
      return
    }

    setOAuthWizard((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const result =
        oauthWizard.isReconnection && oauthWizard.existingPage
          ? await facebookPagesApi.refreshConnection(oauthWizard.existingPage.id)
          : await facebookPagesApi.startOAuthConnection({
              pageUrl: oauthWizard.pageUrl,
            })

      if (result.success && result.requiresAuth && result.authUrl) {
        // Open OAuth popup
        const popup = window.open(
          result.authUrl,
          oauthWizard.isReconnection ? "facebook-oauth-reconnect" : "facebook-oauth",
          "width=600,height=700,scrollbars=yes,resizable=yes",
        )

        if (!popup) {
          throw new Error("ポップアップがブロックされました。ポップアップを許可してください。")
        }

        setOAuthWizard((prev) => ({ ...prev, step: "auth", isLoading: false }))

        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            // Check if OAuth was completed successfully
            handleOAuthCallback()
          }
        }, 1000)

        // Listen for postMessage from OAuth callback
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === "oauth-success") {
            clearInterval(checkClosed)
            popup.close()
            window.removeEventListener("message", messageHandler)
            handleOAuthSuccess(event.data.page)
          } else if (event.data.type === "oauth-error") {
            clearInterval(checkClosed)
            popup.close()
            window.removeEventListener("message", messageHandler)
            setOAuthWizard((prev) => ({
              ...prev,
              step: "input",
              error: event.data.error || "OAuth認証に失敗しました",
              isLoading: false,
            }))
          }
        }

        window.addEventListener("message", messageHandler)
      } else {
        setOAuthWizard((prev) => ({
          ...prev,
          error: result.error || "ページURLの解析に失敗しました",
          isLoading: false,
        }))
      }
    } catch (error) {
      setOAuthWizard((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "エラーが発生しました",
        isLoading: false,
      }))
    }
  }

  const handleOAuthCallback = async () => {
    // This would be called when popup closes
    setOAuthWizard((prev) => ({ ...prev, step: "processing", isLoading: true }))

    // In a real implementation, this would check the OAuth result
    // For now, we'll simulate a successful connection
    setTimeout(() => {
      setOAuthWizard((prev) => ({
        ...prev,
        step: "input",
        error: "OAuth認証がキャンセルされました",
        isLoading: false,
      }))
    }, 2000)
  }

  const handleOAuthSuccess = (page: FacebookPage) => {
    setOAuthWizard((prev) => ({
      ...prev,
      step: "complete",
      connectedPage: page,
      isLoading: false,
      error: null,
    }))

    if (oauthWizard.isReconnection) {
      // Update existing page
      setPages((prev) => prev.map((p) => (p.id === page.id ? page : p)))

      toast({
        title: "再接続完了",
        description: `「${page.name}」の再接続が完了しました。有効期限が更新されました。`,
      })
    } else {
      // Add new page to list
      setPages((prev) => [...prev, page])

      toast({
        title: "接続完了",
        description: `「${page.name}」の接続が完了しました`,
      })
    }

    // Auto-close wizard after 3 seconds
    setTimeout(() => {
      resetOAuthWizard()
      setIsOAuthWizardOpen(false)
    }, 3000)
  }

  // Enhanced reconnection handling
  const handleReconnectPage = async (page: FacebookPage) => {
    startReconnectionWizard(page)
  }

  const handleResubscribeWebhook = async (page: FacebookPage) => {
    if (!user) return

    try {
      const result = await facebookPagesApi.resubscribeWebhook(page.id)

      if (result.subscribed) {
        toast({
          title: "成功",
          description: "Webhook購読を再開しました",
        })
      } else {
        toast({
          title: "警告",
          description: result.error || "Webhook購読に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "Webhook再購読に失敗しました",
        variant: "destructive",
      })
    }
  }

  const resetOAuthWizard = () => {
    setOAuthWizard({
      step: "input",
      pageUrl: "",
      error: null,
      isLoading: false,
      isReconnection: false,
      existingPage: undefined,
    })
  }

  const getConnectionStatus = (page: FacebookPage): "connected" | "expired" | "revoked" | "error" => {
    return facebookPagesApi.getConnectionStatus(page)
  }

  const getConnectionStatusBadge = (page: FacebookPage) => {
    const status = getConnectionStatus(page)
    const securityInfo = tokenSecurity.assessTokenSecurity(page.pageId, page.createdAt)
    const daysRemaining = page.tokenExpiresAt
      ? Math.ceil((new Date(page.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    const badges = []

    // Connection status badge
    switch (status) {
      case "connected":
        badges.push(
          <Badge key="connection" variant="default" className="bg-green-500">
            Connected
          </Badge>,
        )
        break
      case "expired":
        badges.push(
          <Badge key="connection" variant="secondary" className="bg-yellow-500 text-white">
            Expired
          </Badge>,
        )
        break
      case "revoked":
        badges.push(
          <Badge key="connection" variant="destructive">
            Revoked
          </Badge>,
        )
        break
      default:
        badges.push(
          <Badge key="connection" variant="secondary">
            Error
          </Badge>,
        )
    }

    // Security level badge
    if (securityInfo.securityLevel !== "high") {
      const securityColor = securityInfo.securityLevel === "medium" ? "bg-yellow-600" : "bg-red-600"
      badges.push(
        <Badge key="security" variant="secondary" className={`${securityColor} text-white text-xs`}>
          {securityInfo.securityLevel === "medium" ? "Medium Risk" : "High Risk"}
        </Badge>,
      )
    }

    // Days remaining badge
    if (daysRemaining !== null) {
      badges.push(
        <Badge key="daysRemaining" variant="secondary" className="bg-blue-500 text-white text-xs">
          {daysRemaining} days left
        </Badge>,
      )
    }

    return <div className="flex flex-col gap-1">{badges}</div>
  }

  const handleAddPage = async () => {
    if (!user) return

    try {
      // Validate form data
      if (!formData.name || !formData.pageId || !formData.token) {
        toast({
          title: "入力エラー",
          description: "必須項目を入力してください",
          variant: "destructive",
        })
        return
      }

      // Check for duplicate pageId
      const existingPage = pages.find((p) => p.pageId === formData.pageId)
      if (existingPage) {
        toast({
          title: "重複エラー",
          description: "このページIDは既に登録されています",
          variant: "destructive",
        })
        return
      }

      const newPage = await facebookPagesApi.create({
        pageId: formData.pageId,
        name: formData.name,
        tokenMasked: true,
        tokenExpiresAt: formData.tokenExpiresAt || undefined,
        linkedCAs: formData.linkedCAs,
        connected: true,
        lastSyncedAt: new Date().toISOString(),
      })

      // Log audit action
      await auditLogger.logFacebookPageCreate(user.id, newPage.id, {
        page_name: newPage.name,
        page_id: newPage.pageId,
        linked_cas: newPage.linkedCAs,
      })

      setPages((prev) => [...prev, newPage])
      setIsAddPageOpen(false)
      resetFormData()

      toast({
        title: "成功",
        description: "Facebookページを追加しました",
      })
    } catch (error) {
      console.error("Failed to add Facebook page:", error)
      toast({
        title: "エラー",
        description: "Facebookページの追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleEditPage = async () => {
    if (!user || !editingPage) return

    try {
      const updatedPage = await facebookPagesApi.update(editingPage.id, {
        name: formData.name,
        tokenExpiresAt: formData.tokenExpiresAt || undefined,
        linkedCAs: formData.linkedCAs,
        ...(formData.token && { tokenMasked: true }),
      })

      // Log audit action
      await auditLogger.logFacebookPageUpdate(user.id, updatedPage.id, {
        page_name: updatedPage.name,
        linked_cas: updatedPage.linkedCAs,
        token_updated: !!formData.token,
      })

      setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)))
      setIsEditPageOpen(false)
      setEditingPage(null)
      resetFormData()

      toast({
        title: "成功",
        description: "Facebookページを更新しました",
      })
    } catch (error) {
      console.error("Failed to update Facebook page:", error)
      toast({
        title: "エラー",
        description: "Facebookページの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleDeletePage = async (page: FacebookPage) => {
    if (!user) return

    if (!confirm(`「${page.name}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    try {
      await facebookPagesApi.delete(page.id)

      // Log audit action
      await auditLogger.logFacebookPageDelete(user.id, page.id, {
        page_name: page.name,
        page_id: page.pageId,
      })

      setPages((prev) => prev.filter((p) => p.id !== page.id))

      toast({
        title: "成功",
        description: "Facebookページを削除しました",
      })
    } catch (error) {
      console.error("Failed to delete Facebook page:", error)
      toast({
        title: "エラー",
        description: "Facebookページの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleSyncPage = async (page: FacebookPage) => {
    if (!user) return

    try {
      setIsSyncing(page.id)
      const updatedPage = await facebookPagesApi.resync(page.id)

      // Log audit action
      await auditLogger.logFacebookPageSync(user.id, page.id, {
        page_name: page.name,
        sync_completed: true,
      })

      setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)))

      toast({
        title: "成功",
        description: `「${page.name}」の同期が完了しました`,
      })
    } catch (error) {
      console.error("Failed to sync Facebook page:", error)
      toast({
        title: "エラー",
        description: "同期に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(null)
    }
  }

  const handleBulkSync = async () => {
    if (!user) return

    try {
      setLoading(true)
      const syncPromises = pages.map((page) => facebookPagesApi.resync(page.id))
      const updatedPages = await Promise.all(syncPromises)

      // Log audit action
      await auditLogger.logSystemAction(user.id, "facebook_pages_bulk_sync", {
        page_count: pages.length,
        sync_completed: true,
      })

      setPages(updatedPages)

      toast({
        title: "成功",
        description: "一括同期が完了しました",
      })
    } catch (error) {
      console.error("Failed to bulk sync:", error)
      toast({
        title: "エラー",
        description: "一括同期に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (page: FacebookPage) => {
    setEditingPage(page)
    setFormData({
      name: page.name,
      pageId: page.pageId,
      token: "",
      tokenExpiresAt: page.tokenExpiresAt || "",
      linkedCAs: page.linkedCAs,
    })
    setIsEditPageOpen(true)
  }

  const resetFormData = () => {
    setFormData({
      name: "",
      pageId: "",
      token: "",
      tokenExpiresAt: "",
      linkedCAs: [],
    })
  }

  const handleCAToggle = (caId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      linkedCAs: checked ? [...prev.linkedCAs, caId] : prev.linkedCAs.filter((id) => id !== caId),
    }))
  }

  const setShowTokens = useState<Record<string, boolean>>({})

  const toggleTokenVisibility = async (pageId: string) => {
    if (!user) return

    // Security validation
    const validation = securityMiddleware.validateRequest(user.id.toString(), "view_token", pageId)
    if (!validation.allowed) {
      toast({
        title: "セキュリティエラー",
        description: validation.reason,
        variant: "destructive",
      })
      return
    }

    setShowTokens((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }))

    // Log token access
    tokenSecurity.logTokenAccess(user.id.toString(), "access")
    securityMiddleware.updateRateLimit(user.id.toString(), "view_token")

    // Log audit event
    await auditLogger.logSystemAction(user.id, "token_view", {
      page_id: pageId,
      action: setShowTokens[pageId] ? "hide" : "show",
      timestamp: new Date().toISOString(),
    })
  }

  const renderTokenDisplay = (page: FacebookPage) => {
    const isVisible = setShowTokens[page.id]
    const securityInfo = tokenSecurity.assessTokenSecurity(page.pageId, page.createdAt)

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {securityInfo.securityLevel === "high" && <Shield className="h-3 w-3 text-green-500" />}
          {securityInfo.securityLevel === "medium" && <Shield className="h-3 w-3 text-yellow-500" />}
          {securityInfo.securityLevel === "low" && <Shield className="h-3 w-3 text-red-500" />}

          <span className="font-mono text-xs">{isVisible ? "EAABwzLixnjYBAO..." : "••••••••••••••••"}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={() => toggleTokenVisibility(page.id)} className="h-6 w-6 p-0">
          {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>

        {securityInfo.riskFactors.length > 0 && (
          <AlertTriangle className="h-3 w-3 text-yellow-500" title={securityInfo.riskFactors.join(", ")} />
        )}
      </div>
    )
  }

  // Filter pages based on search and filters
  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) || page.pageId.includes(searchTerm)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "connected" && page.connected) ||
      (statusFilter === "disconnected" && !page.connected)
    const matchesCA = caFilter === "all" || page.linkedCAs.includes(caFilter)

    return matchesSearch && matchesStatus && matchesCA
  })

  const getCAName = (caId: string) => {
    const ca = mockCAUsers.find((u) => u.id === caId)
    return ca ? ca.name : `CA ${caId}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("ja-JP")
  }

  const isAdmin = user?.role === "admin"

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Facebookページ連携</h3>
            <p className="text-sm text-muted-foreground">Facebookページの管理とCA紐付けを行います</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBulkSync} disabled={loading || pages.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              一括再同期
            </Button>
            {isAdmin && (
              <>
                <Dialog open={isOAuthWizardOpen} onOpenChange={setIsOAuthWizardOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetOAuthWizard}>
                      <Link className="h-4 w-4 mr-2" />
                      ページを接続
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {oauthWizard.isReconnection ? "Facebookページを再接続" : "Facebookページを接続"}
                      </DialogTitle>
                      <DialogDescription>
                        {oauthWizard.isReconnection
                          ? "期限切れのページを再接続します。Facebookで認証するだけで自動更新されます。"
                          : "ページURLを入力してFacebookで認証するだけで自動接続されます"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                oauthWizard.step === "input"
                                  ? "bg-blue-500 text-white"
                                  : ["auth", "processing", "complete"].includes(oauthWizard.step)
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                              }`}
                            >
                              1
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>ページURL入力</TooltipContent>
                        </Tooltip>
                        <div
                          className={`w-8 h-0.5 ${
                            ["auth", "processing", "complete"].includes(oauthWizard.step)
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                oauthWizard.step === "auth"
                                  ? "bg-blue-500 text-white"
                                  : ["processing", "complete"].includes(oauthWizard.step)
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                              }`}
                            >
                              2
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Facebookで接続</TooltipContent>
                        </Tooltip>
                        <div
                          className={`w-8 h-0.5 ${
                            ["processing", "complete"].includes(oauthWizard.step) ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                oauthWizard.step === "processing"
                                  ? "bg-blue-500 text-white"
                                  : oauthWizard.step === "complete"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                              }`}
                            >
                              3
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>確認＆CA紐付け</TooltipContent>
                        </Tooltip>
                        <div
                          className={`w-8 h-0.5 ${oauthWizard.step === "complete" ? "bg-green-500" : "bg-gray-200"}`}
                        />
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                oauthWizard.step === "complete" ? "bg-green-500 text-white" : "bg-gray-200"
                              }`}
                            >
                              ✓
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>完了</TooltipContent>
                        </Tooltip>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsHelpModalOpen(true)}
                        aria-label="接続手順のヘルプを開く"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        手続き方法について
                      </Button>
                    </div>

                    <StepHelp step={oauthWizard.step} />

                    {/* Step 1: Page URL Input */}
                    {oauthWizard.step === "input" && (
                      <div className="space-y-4">
                        {oauthWizard.isReconnection && oauthWizard.existingPage && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>再接続するページ</AlertTitle>
                            <AlertDescription>
                              <div className="mt-2 space-y-1">
                                <div>
                                  <strong>ページ名:</strong> {oauthWizard.existingPage.name}
                                </div>
                                <div>
                                  <strong>ページID:</strong> {oauthWizard.existingPage.pageId}
                                </div>
                                <div>
                                  <strong>現在の状態:</strong> {getConnectionStatusBadge(oauthWizard.existingPage)}
                                </div>
                                {oauthWizard.existingPage.tokenExpiresAt && (
                                  <div>
                                    <strong>期限:</strong> {formatDate(oauthWizard.existingPage.tokenExpiresAt)}
                                  </div>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="pageUrl">
                            {oauthWizard.isReconnection ? "ページURL（確認用）" : "ページURL"}
                          </Label>
                          <Input
                            id="pageUrl"
                            placeholder="https://www.facebook.com/your-page"
                            value={oauthWizard.pageUrl}
                            onChange={(e) =>
                              setOAuthWizard((prev) => ({ ...prev, pageUrl: e.target.value, error: null }))
                            }
                            disabled={oauthWizard.isReconnection}
                          />
                          <p className="text-sm text-muted-foreground">
                            例: https://www.facebook.com/GlobalHireHubJP または ページID
                          </p>
                        </div>

                        {oauthWizard.error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{oauthWizard.error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsOAuthWizardOpen(false)}>
                            キャンセル
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button onClick={handleStartOAuthConnection} disabled={oauthWizard.isLoading}>
                                {oauthWizard.isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    処理中...
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {oauthWizard.isReconnection ? "Facebookで再接続" : "Facebookで接続"}
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              ログイン後、4つの権限（pages_show_list / manage_metadata / read_engagement /
                              messaging）をONにしてください。
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )}

                    {/* Step 2: OAuth Authentication */}
                    {oauthWizard.step === "auth" && (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <ExternalLink className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Facebook認証中</h3>
                          <p className="text-muted-foreground">
                            {oauthWizard.isReconnection
                              ? "ポップアップウィンドウでFacebookにログインし、ページの再接続を許可してください。"
                              : "ポップアップウィンドウでFacebookにログインし、必要な権限を許可してください。"}
                          </p>
                        </div>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            必要な権限: pages_show_list, pages_manage_metadata, pages_read_engagement, pages_messaging
                          </AlertDescription>
                        </Alert>
                        <Button
                          variant="outline"
                          onClick={() => setOAuthWizard((prev) => ({ ...prev, step: "input" }))}
                        >
                          戻る
                        </Button>
                      </div>
                    )}

                    {/* Step 3: Processing */}
                    {oauthWizard.step === "processing" && (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {oauthWizard.isReconnection ? "再接続処理中" : "接続処理中"}
                          </h3>
                          <p className="text-muted-foreground">
                            {oauthWizard.isReconnection
                              ? "アクセストークンを更新し、Webhook購読を復旧しています..."
                              : "アクセストークンを取得し、Webhookを設定しています..."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Complete */}
                    {oauthWizard.step === "complete" && oauthWizard.connectedPage && (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-600">
                            {oauthWizard.isReconnection ? "再接続完了！" : "接続完了！"}
                          </h3>
                          <p className="text-muted-foreground">
                            「{oauthWizard.connectedPage.name}」の
                            {oauthWizard.isReconnection ? "再接続" : "接続"}が正常に完了しました。
                          </p>
                        </div>

                        <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">接続状態:</span>
                            <Badge variant="default">Connected</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">有効期限:</span>
                            <span>{formatDate(oauthWizard.connectedPage.tokenExpiresAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">最終同期:</span>
                            <span>{formatDate(oauthWizard.connectedPage.lastSyncedAt)}</span>
                          </div>
                        </div>

                        <div className="flex justify-center space-x-2">
                          <Button
                            onClick={() => {
                              resetOAuthWizard()
                              setIsOAuthWizardOpen(false)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            完了
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              resetOAuthWizard()
                              setIsOAuthWizardOpen(true)
                            }}
                          >
                            別のページを接続
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Facebook接続の手続き方法（権限付与を含む）</DialogTitle>
                      <DialogDescription>
                        接続手順の詳細説明とよくあるトラブルの解決方法をご確認ください。
                      </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 overflow-y-auto">
                      <div className="whitespace-pre-line text-sm leading-relaxed">{helpContent}</div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={copyHelpContent}>
                        <Copy className="h-4 w-4 mr-2" />
                        この内容をコピー
                      </Button>
                      <Button onClick={() => setIsHelpModalOpen(false)}>閉じる</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddPageOpen} onOpenChange={setIsAddPageOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      手動追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Facebookページを手動追加</DialogTitle>
                      <DialogDescription>
                        アクセストークンを直接入力してページを登録します（高度設定）
                        <Alert className="mt-2">
                          <Lock className="h-4 w-4" />
                          <AlertDescription>
                            トークンは暗号化されて安全に保存されます。平文での保存は行いません。
                          </AlertDescription>
                        </Alert>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          ページ名
                        </Label>
                        <Input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pageId" className="text-right">
                          ページID
                        </Label>
                        <Input
                          type="text"
                          id="pageId"
                          value={formData.pageId}
                          onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="token" className="text-right">
                          アクセストークン
                        </Label>
                        <Input
                          type="password"
                          id="token"
                          value={formData.token}
                          onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tokenExpiresAt" className="text-right">
                          トークン有効期限
                        </Label>
                        <Input
                          type="datetime-local"
                          id="tokenExpiresAt"
                          value={formData.tokenExpiresAt}
                          onChange={(e) => setFormData({ ...formData, tokenExpiresAt: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right mt-2">紐付けCA</Label>
                        <div className="col-span-3 space-y-2 max-h-40 overflow-y-auto">
                          {mockCAUsers.map((ca) => (
                            <div key={ca.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`ca-${ca.id}`}
                                checked={formData.linkedCAs.includes(ca.id)}
                                onCheckedChange={(checked) => handleCAToggle(ca.id, !!checked)}
                              />
                              <Label htmlFor={`ca-${ca.id}`} className="text-sm">
                                {ca.name} ({ca.email})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddPageOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleAddPage}>追加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ページ名またはIDで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="connected">接続済み</SelectItem>
                  <SelectItem value="disconnected">未接続</SelectItem>
                </SelectContent>
              </Select>
              <Select value={caFilter} onValueChange={setCAFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのCA</SelectItem>
                  {mockCAUsers.map((ca) => (
                    <SelectItem key={ca.id} value={ca.id}>
                      {ca.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ページ名</TableHead>
                  <TableHead>ページID</TableHead>
                  <TableHead>接続状態</TableHead>
                  <TableHead>トークン状態</TableHead>
                  <TableHead>最終同期</TableHead>
                  <TableHead>有効期限</TableHead>
                  <TableHead>紐付けCA数</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {pages.length === 0
                        ? "Facebookページが登録されていません"
                        : "検索条件に一致するページがありません"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => {
                    const connectionStatus = getConnectionStatus(page)
                    return (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.name}</TableCell>
                        <TableCell className="font-mono text-sm">{page.pageId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getConnectionStatusBadge(page)}
                            {(connectionStatus === "expired" ||
                              connectionStatus === "revoked" ||
                              page.expiryStatus === "expiring_urgent") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReconnectPage(page)}
                                className="text-xs"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                再接続
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{renderTokenDisplay(page)}</TableCell>
                        <TableCell className="text-sm">{formatDate(page.lastSyncedAt)}</TableCell>
                        <TableCell className="text-sm">{formatDate(page.tokenExpiresAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{page.linkedCAs.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncPage(page)}
                              disabled={isSyncing === page.id}
                            >
                              <Sync className={`h-4 w-4 ${isSyncing === page.id ? "animate-spin" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResubscribeWebhook(page)}
                              title="Webhook再購読"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(page)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Page Dialog */}
        <Dialog open={isEditPageOpen} onOpenChange={setIsEditPageOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Facebookページを編集</DialogTitle>
              <DialogDescription>ページ情報とCA紐付けを更新します</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-page-name" className="text-right">
                  ページ名
                </Label>
                <Input
                  id="edit-page-name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-page-id" className="text-right">
                  ページID
                </Label>
                <Input id="edit-page-id" className="col-span-3" value={formData.pageId} disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-page-token" className="text-right">
                  アクセストークン
                </Label>
                <Input
                  id="edit-page-token"
                  type="password"
                  className="col-span-3"
                  value={formData.token}
                  onChange={(e) => setFormData((prev) => ({ ...prev, token: e.target.value }))}
                  placeholder="空の場合は現在のトークンを維持"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-token-expires" className="text-right">
                  トークン有効期限
                </Label>
                <Input
                  id="edit-token-expires"
                  type="datetime-local"
                  className="col-span-3"
                  value={formData.tokenExpiresAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tokenExpiresAt: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">紐付けCA</Label>
                <div className="col-span-3 space-y-2 max-h-40 overflow-y-auto">
                  {mockCAUsers.map((ca) => (
                    <div key={ca.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-ca-${ca.id}`}
                        checked={formData.linkedCAs.includes(ca.id)}
                        onCheckedChange={(checked) => handleCAToggle(ca.id, !!checked)}
                      />
                      <Label htmlFor={`edit-ca-${ca.id}`} className="text-sm">
                        {ca.name} ({ca.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPageOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleEditPage}>更新</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default FacebookPagesSettings
