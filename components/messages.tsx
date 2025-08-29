"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { Languages } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MockFacebookPage, MockThread, MockMessage } from "@/lib/mock/messages.fixtures"
import { getSendState, type DisplayTagName } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"

interface MessageTemplate {
  id: string
  name: string
  content: string
  category: string
  type?: "system" | "custom"
  subject?: string
  buttonLabel?: string
}

interface Filters {
  pages: string[]
  unreadOnly: boolean
  ownerCAs: string[]
  tags: string[]
  keyword: string
  dateFrom: string
  dateTo: string
  nationalities: string[]
  genders: string[]
  jobPreferences: string[]
  selectionStatuses: string[]
  sendStatuses: string[]
  desiredPositions: string[]
}

export function Messages() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<Filters>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("messageFilters_v2") : null
    const defaultFilters = {
      pages: [],
      unreadOnly: false,
      ownerCAs: [],
      tags: [],
      keyword: "",
      dateFrom: "",
      dateTo: "",
      nationalities: [],
      genders: [],
      jobPreferences: [],
      selectionStatuses: [],
      sendStatuses: [],
      desiredPositions: [],
    }

    if (saved) {
      try {
        return { ...defaultFilters, ...JSON.parse(saved) }
      } catch {
        return defaultFilters
      }
    }
    return defaultFilters
  })

  const [searchKeyword, setSearchKeyword] = useState(filters.keyword)
  const [tabMode, setTabMode] = useState<"all" | "page">("all")
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [selectedThread, setSelectedThread] = useState<MockThread | null>(null)
  const [pages, setPages] = useState<MockFacebookPage[]>([])
  const [threads, setThreads] = useState<MockThread[]>([])
  const [messages, setMessages] = useState<MockMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const [showFilters, setShowFilters] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateSearch, setTemplateSearch] = useState("")
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>("all")
  const [showTagModal, setShowTagModal] = useState(false)
  const [selectedTagForSend, setSelectedTagForSend] = useState<DisplayTagName | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [candidateInfoMap, setCandidateInfoMap] = useState<Record<string, any>>({})
  const [consentStatus, setConsentStatus] = useState<{
    status: "not_requested" | "pending" | "acquired"
    requestedAt?: string
    acquiredAt?: string
    lastSentBy?: string
  }>({ status: "not_requested" })
  const [showConsentHistory, setShowConsentHistory] = useState(false)
  const [consentHistory, setConsentHistory] = useState<any[]>([])
  const [showConsentModal, setShowConsentModal] = useState(false)

  const templates: MessageTemplate[] = [
    {
      id: "1",
      name: "Initial Greeting",
      content: "Hello! Thank you for your application. We appreciate your interest in our company.",
      category: "一般",
    },
    {
      id: "2",
      name: "Interview Scheduling",
      content: "I would like to discuss scheduling your interview. Please let me know your availability.",
      category: "タグ用",
    },
    {
      id: "3",
      name: "Consent Request",
      content: "We would like to request your consent for handling personal information.",
      category: "同意用",
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: searchKeyword }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  useEffect(() => {
    localStorage.setItem("messageFilters_v2", JSON.stringify(filters))

    const params = new URLSearchParams()
    if (filters.keyword) params.set("q", filters.keyword)
    if (filters.ownerCAs.length) params.set("cas", filters.ownerCAs.join(","))
    if (filters.nationalities.length) params.set("nationalities", filters.nationalities.join(","))
    if (filters.genders.length) params.set("gender", filters.genders[0])
    if (filters.jobPreferences.length) params.set("jobs", filters.jobPreferences.join(","))
    if (filters.selectionStatuses.length) params.set("statuses", filters.selectionStatuses.join(","))
    if (filters.sendStatuses.length) params.set("sendStates", filters.sendStatuses.join(","))

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    if (newUrl !== window.location.search) {
      router.replace(newUrl, { scroll: false })
    }
  }, [filters, router])

  const getSendStateDisplay = (thread: MockThread) => {
    if (!user) return { state: "blocked", label: "接続エラー", color: "bg-red-500" }

    const currentPage = pages.find((p) => p.pageId === thread.pageId)
    const sendState = getSendState(thread, user.role, user.id.toString(), currentPage)

    switch (sendState) {
      case "active":
        return { state: "active", label: "Active", color: "bg-green-500" }
      case "human_agent":
        return { state: "human_agent", label: "7日以内", color: "bg-blue-500" }
      case "requires_tag":
        return { state: "requires_tag", label: "タグ必要", color: "bg-yellow-500" }
      default:
        return { state: "blocked", label: "接続エラー", color: "bg-red-500" }
    }
  }

  const getConsentStatusDisplay = () => {
    switch (consentStatus.status) {
      case "acquired":
        return { label: "取得済", color: "bg-green-500", date: consentStatus.acquiredAt }
      case "pending":
        return { label: "送信済", color: "bg-yellow-500", date: consentStatus.requestedAt }
      default:
        return { label: "未取得", color: "bg-red-500", date: null }
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { messagesClient } = await import("@/lib/api")

        // Load pages
        const pagesData = await messagesClient.getPages()
        setPages(pagesData || [])

        // Load threads based on tab mode
        let threadsData: MockThread[] = []
        if (tabMode === "all") {
          // Cross-page mode: get threads from all pages
          const allThreads = await Promise.all(
            (pagesData || []).map((page) => messagesClient.getThreads(page.pageId, filters)),
          )
          threadsData = allThreads
            .flat()
            .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        } else if (selectedPageId) {
          // Page-specific mode
          threadsData = await messagesClient.getThreads(selectedPageId, filters)
        }

        setThreads(threadsData || [])

        const candidateInfoPromises = (threadsData || []).map(async (thread) => {
          if (thread.candidateId) {
            try {
              const candidateData = await messagesClient.getCandidateInfo(thread.candidateId)
              return { threadId: thread.id, candidateData }
            } catch (error) {
              console.error(`Failed to load candidate info for thread ${thread.id}:`, error)
              return { threadId: thread.id, candidateData: null }
            }
          }
          return { threadId: thread.id, candidateData: null }
        })

        const candidateInfoResults = await Promise.all(candidateInfoPromises)
        const newCandidateInfoMap: Record<string, any> = {}
        candidateInfoResults.forEach(({ threadId, candidateData }) => {
          if (candidateData) {
            newCandidateInfoMap[threadId] = candidateData
          }
        })
        setCandidateInfoMap(newCandidateInfoMap)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast({
          title: "データ読み込みエラー",
          description: "データの読み込みに失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tabMode, selectedPageId, filters, toast])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedThread) {
        setMessages([])
        return
      }

      setLoadingMessages(true)
      try {
        const { messagesClient } = await import("@/lib/api")
        const messagesData = await messagesClient.getMessages(selectedThread.id)
        setMessages(messagesData || [])

        if (selectedThread.candidateId) {
          const candidateData = await messagesClient.getCandidateInfo(selectedThread.candidateId)
          setCandidateInfoMap((prev) => ({ ...prev, [selectedThread.id]: candidateData }))
        }

        setConsentStatus({ status: "not_requested" })
      } catch (error) {
        toast({
          title: "送信エラー",
          description: "メッセージの送信に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()
  }, [selectedThread])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return

    const sendStateInfo = getSendStateDisplay(selectedThread)

    if (sendStateInfo.state === "requires_tag" && !selectedTagForSend) {
      toast({
        title: "タグを選択してください",
        description: "メッセージ送信にはタグの選択が必要です",
        variant: "destructive",
      })
      return
    }

    try {
      const { messagesClient } = await import("@/lib/api")
      await messagesClient.sendMessage({
        threadId: selectedThread.id,
        text: newMessage,
        tag: selectedTagForSend || undefined,
        attachments: attachedFiles,
      })

      setNewMessage("")
      setSelectedTagForSend(null)
      setAttachedFiles([])

      // Reload messages
      const messagesData = await messagesClient.getMessages(selectedThread.id)
      setMessages(messagesData || [])

      toast({
        title: "メッセージ送信完了",
        description: "メッセージを送信しました",
      })
    } catch (error) {
      toast({
        title: "送信エラー",
        description: "メッセージの送信に失敗しました",
        variant: "destructive",
      })
    }
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      pages: [],
      unreadOnly: false,
      ownerCAs: [],
      tags: [],
      keyword: "",
      dateFrom: "",
      dateTo: "",
      nationalities: [],
      genders: [],
      jobPreferences: [],
      selectionStatuses: [],
      sendStatuses: [],
      desiredPositions: [],
    }
    setFilters(clearedFilters)
    setSearchKeyword("")
  }

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === "keyword" && value) return count + 1
    if (Array.isArray(value) && value.length > 0) return count + 1
    if (typeof value === "boolean" && value) return count + 1
    if (typeof value === "string" && value && key !== "keyword") return count + 1
    return count
  }, 0)

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Invalid Date"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleString("ja-JP")
    } catch {
      return "Invalid Date"
    }
  }

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "--:--"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "--:--"
      return date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "--:--"
    }
  }

  const handleConsentRequest = async () => {
    if (!selectedThread || !user) return

    try {
      const { consentApi } = await import("@/lib/api")
      const result = await consentApi.sendRequest(
        selectedThread.id,
        "consent-template-1",
        user.id.toString(),
        "個人情報の取り扱いについて、同意をお願いいたします。",
      )

      if (result.success) {
        setShowConsentModal(false)
        toast({
          title: "同意リクエスト送信完了",
          description: "候補者に同意リクエストを送信しました",
        })

        // Reload messages to show system message
        const { messagesClient } = await import("@/lib/api")
        const messagesData = await messagesClient.getMessages(selectedThread.id)
        setMessages(messagesData || [])
      } else {
        toast({
          title: "送信エラー",
          description: result.error || "同意リクエストの送信に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "送信エラー",
        description: "同意リクエストの送信に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setNewMessage(template.content)
    setShowTemplates(false)
    toast({
      title: "テンプレート適用",
      description: `「${template.name}」を適用しました`,
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024) // 10MB limit

    if (attachedFiles.length + validFiles.length > 3) {
      toast({
        title: "ファイル数制限",
        description: "添付ファイルは最大3つまでです",
        variant: "destructive",
      })
      return
    }

    if (validFiles.length < files.length) {
      toast({
        title: "ファイルサイズエラー",
        description: "10MBを超えるファイルは添付できません",
        variant: "destructive",
      })
    }

    setAttachedFiles((prev) => [...prev, ...validFiles])
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.content.toLowerCase().includes(templateSearch.toLowerCase())
    const matchesCategory = selectedTemplateCategory === "all" || template.category === selectedTemplateCategory
    return matchesSearch && matchesCategory
  })

  const getRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return "今日"
      if (diffDays === 1) return "1日前"
      if (diffDays < 7) return `${diffDays}日前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
      return `${Math.floor(diffDays / 365)}年前`
    } catch {
      return ""
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Pane - Thread List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
          <h1 className="text-xl font-bold">メッセージ管理</h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setTabMode("all")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tabMode === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              横断
            </button>
            <button
              onClick={() => setTabMode("page")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tabMode === "page"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              ページ別
            </button>
          </div>
        </div>

        {tabMode === "page" && (
          <div className="p-4 border-b">
            <Select value={selectedPageId || ""} onValueChange={(value) => setSelectedPageId(value || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ページを選択..." />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page) => (
                  <SelectItem key={page.pageId} value={page.pageId}>
                    {page.pageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-4 border-b space-y-3">
          <Input
            type="text"
            placeholder="候補者名で検索..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="text-base"
          />

          <div className="flex justify-between items-center">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  フィルタ
                  {activeFilterCount > 0 && (
                    <Badge variant="default" className="text-xs px-1.5 py-0.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[520px] p-4" align="start">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">詳細フィルタ</h3>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      すべてクリア
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">担当CA</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {["佐藤", "田中", "山田", "鈴木"].map((ca) => (
                          <div key={ca} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ca-${ca}`}
                              checked={filters.ownerCAs.includes(ca)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters((prev) => ({ ...prev, ownerCAs: [...prev.ownerCAs, ca] }))
                                } else {
                                  setFilters((prev) => ({ ...prev, ownerCAs: prev.ownerCAs.filter((c) => c !== ca) }))
                                }
                              }}
                            />
                            <label htmlFor={`ca-${ca}`} className="text-sm">
                              {ca}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">国籍</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {["日本", "米国", "中国", "韓国", "インド"].map((nationality) => (
                          <div key={nationality} className="flex items-center space-x-2">
                            <Checkbox
                              id={`nationality-${nationality}`}
                              checked={filters.nationalities.includes(nationality)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters((prev) => ({
                                    ...prev,
                                    nationalities: [...prev.nationalities, nationality],
                                  }))
                                } else {
                                  setFilters((prev) => ({
                                    ...prev,
                                    nationalities: prev.nationalities.filter((n) => n !== nationality),
                                  }))
                                }
                              }}
                            />
                            <label htmlFor={`nationality-${nationality}`} className="text-sm">
                              {nationality}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">性別</label>
                      <Select
                        value={filters.genders[0] || ""}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, genders: value ? [value] : [] }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男性">男性</SelectItem>
                          <SelectItem value="女性">女性</SelectItem>
                          <SelectItem value="不明">不明</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">送信ステータス</label>
                      <div className="space-y-2">
                        {[
                          { value: "active", label: "Active" },
                          { value: "human_agent", label: "7日以内（Human Agent）" },
                          { value: "requires_tag", label: "タグ必要" },
                          { value: "blocked", label: "接続エラー" },
                        ].map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`send-${status.value}`}
                              checked={filters.sendStatuses.includes(status.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters((prev) => ({
                                    ...prev,
                                    sendStatuses: [...prev.sendStatuses, status.value],
                                  }))
                                } else {
                                  setFilters((prev) => ({
                                    ...prev,
                                    sendStatuses: prev.sendStatuses.filter((s) => s !== status.value),
                                  }))
                                }
                              }}
                            />
                            <label htmlFor={`send-${status.value}`} className="text-sm">
                              {status.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                      キャンセル
                    </Button>
                    <Button size="sm" onClick={() => setShowFilters(false)}>
                      適用
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                すべてクリア ({activeFilterCount})
              </Button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <Badge variant="secondary" className="text-xs">
                  検索: {filters.keyword}
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, keyword: "" }))
                      setSearchKeyword("")
                    }}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.ownerCAs.map((ca) => (
                <Badge key={ca} variant="secondary" className="text-xs">
                  CA: {ca}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, ownerCAs: prev.ownerCAs.filter((c) => c !== ca) }))}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {filters.nationalities.map((nationality) => (
                <Badge key={nationality} variant="secondary" className="text-xs">
                  国籍: {nationality}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        nationalities: prev.nationalities.filter((n) => n !== nationality),
                      }))
                    }
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">読み込み中...</div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">スレッドがありません</div>
          ) : (
            threads.map((thread) => {
              const sendStateInfo = getSendStateDisplay(thread)
              const threadCandidateInfo = candidateInfoMap[thread.id]
              const nationality = threadCandidateInfo?.nationality || "不明"
              const assignedCA = thread.ownerCA || "未設定"
              const relativeTime = getRelativeTime(thread.lastMessageAt)

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 border-b cursor-pointer hover:bg-accent ${
                    selectedThread?.id === thread.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{thread.title || "名前未設定"}</span>
                      <Badge className={`text-xs text-white ${sendStateInfo.color}`}>{sendStateInfo.label}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{formatTime(thread.lastMessageAt)}</div>
                      {relativeTime && <div className="text-xs text-muted-foreground">{relativeTime}</div>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {nationality} • 担当CA: {assignedCA}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Pane - Messages */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="border-b p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{selectedThread.title}</h2>
                  <div className="text-sm text-muted-foreground mt-1">
                    国籍: {candidateInfoMap[selectedThread.id]?.nationality || "不明"} • 性別:{" "}
                    {candidateInfoMap[selectedThread.id]?.gender || "不明"} • 年齢:{" "}
                    {candidateInfoMap[selectedThread.id]?.age || "不明"} • 希望職種:{" "}
                    {candidateInfoMap[selectedThread.id]?.desiredPosition || "不明"}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <span>送信ステータス:</span>
                    <Badge className={`text-white ${getSendStateDisplay(selectedThread).color}`}>
                      {getSendStateDisplay(selectedThread).label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>担当CA:</span>
                    <span>{selectedThread.ownerCA || "未設定"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>同意:</span>
                    <Badge className={`text-white ${getConsentStatusDisplay().color}`}>
                      {getConsentStatusDisplay().label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Translation functionality placeholder
                          toast({
                            title: "Translation",
                            description: "Translation feature activated",
                          })
                        }}
                      >
                        <Languages className="h-4 w-4 mr-1" />
                        翻訳
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingMessages ? (
                <div className="text-center text-muted-foreground">読み込み中...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground">メッセージがありません</div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.direction === "in" ? "text-left" : "text-right"}`}>
                    <div
                      className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === "in" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div>{message.bodyOriginal}</div>
                      {message.appliedTag && <div className="text-xs mt-1 opacity-75">タグ: {message.appliedTag}</div>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(message.createdAt)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Send Status Guide */}
            {(() => {
              const sendStateInfo = getSendStateDisplay(selectedThread)
              if (sendStateInfo.state === "blocked") {
                return (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mb-2">
                    <div className="text-red-700 text-sm">送信不可・再接続が必要です</div>
                  </div>
                )
              }
              if (sendStateInfo.state === "requires_tag") {
                return (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mx-4 mb-2">
                    <div className="text-yellow-700 text-sm">ウィンドウ判定：タグが必要です</div>
                  </div>
                )
              }
              return null
            })()}

            {/* Send Area */}
            <div className="border-t p-4">
              <div className="flex gap-2 mb-2">
                <Popover open={showTemplates} onOpenChange={setShowTemplates}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-sm bg-transparent">
                      テンプレ
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">テンプレート選択</h3>
                      </div>

                      <Input
                        placeholder="テンプレートを検索..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="text-sm"
                      />

                      <Select value={selectedTemplateCategory} onValueChange={setSelectedTemplateCategory}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべて</SelectItem>
                          <SelectItem value="一般">一般</SelectItem>
                          <SelectItem value="タグ用">タグ用</SelectItem>
                          <SelectItem value="同意用">同意用</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="border rounded p-2 hover:bg-accent cursor-pointer"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTagModal(true)}
                  className={`text-sm ${
                    getSendStateDisplay(selectedThread).state === "requires_tag" ? "bg-yellow-100" : ""
                  }`}
                >
                  タグ送信
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowConsentModal(true)} className="text-sm">
                  同意リクエスト
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-input"
                  />
                  <Button variant="outline" size="sm" className="text-sm bg-transparent" asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      添付
                    </label>
                  </Button>
                </div>
              </div>

              {/* Attached files display */}
              {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeAttachedFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="flex-1 px-3 py-2 border rounded-md resize-none"
                  rows={3}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a thread from the left to display messages
          </div>
        )}
      </div>

      <Dialog open={showTagModal} onOpenChange={setShowTagModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを選択</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  setSelectedTagForSend("CONFIRMED_EVENT_UPDATE")
                  setShowTagModal(false)
                }}
              >
                日程リマインド/変更
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  setSelectedTagForSend("ACCOUNT_UPDATE")
                  setShowTagModal(false)
                }}
              >
                情報確認/選考通知/進捗連絡
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>同意リクエスト送信</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">候補者に個人情報取り扱いの同意リクエストを送信しますか？</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConsentModal(false)}>
                キャンセル
              </Button>
              <Button onClick={handleConsentRequest}>送信</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Messages
