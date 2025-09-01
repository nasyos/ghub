"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MockFacebookPage, MockThread, MockMessage } from "@/lib/mock/messages.fixtures"
import { getSendState, type DisplayTagName } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { CandidateHeader } from "./candidate-header"
import { MessageThread } from "./message-thread"
import { MessageComposer } from "./message-composer"
import { formatTime } from "@/lib/utils"

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
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false)
  const [consentStatus, setConsentStatus] = useState<{
    status: "not_requested" | "pending" | "acquired"
    requestedAt?: string
    acquiredAt?: string
    lastSentBy?: string
  }>({ status: "not_requested" })
  const [showConsentHistory, setShowConsentHistory] = useState(false)
  const [consentHistory, setConsentHistory] = useState<any[]>([])
  const [showConsentModal, setShowConsentModal] = useState(false)

  const [isMobileLayout, setIsMobileLayout] = useState(false)

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
    const sendState = getSendState(thread, user.role, user.id.toString(), currentPage as any)

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
      await (messagesClient as any).sendMessage({
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











  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* ヘッダー - サイズを少し大きく */}
      <div className="flex items-center justify-between px-6 py-3 h-12 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">メッセージ管理</h1>
        </div>
      </div>

      {/* メッセージ管理コンテンツ - 2分割レイアウト */}
      <div className={`flex-1 bg-background min-h-0 ${
        isMobileLayout 
          ? 'grid grid-cols-[1fr]' 
          : 'grid grid-cols-[360px_1fr]'
      }`}>
        {/* Left Pane - Thread List */}
        <div className="min-h-0 overflow-y-auto border-r flex flex-col">

        {/* Tab Navigation */}
        <div className="border-b flex-shrink-0">
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

        {/* Page Selection - Conditional but always takes space */}
        <div className="border-b flex-shrink-0">
          {tabMode === "page" ? (
            <div className="p-4">
              <Select value={selectedPageId || ""} onValueChange={(value) => setSelectedPageId(value || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="ページを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.pageId} value={page.pageId}>
                      {(page as any).pageName || page.pageId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="h-[60px]"></div> // プレースホルダーで高さを確保
          )}
        </div>

        {/* Search and Filters - Fixed Top */}
        <div className="p-4 border-b space-y-3 bg-white flex-shrink-0">
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
        <div className="flex-1 min-h-0">
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
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedThread(thread)
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-accent ${
                    selectedThread?.id === thread.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {thread.title || candidateInfoMap[thread.id]?.name || "名前未設定"}
                      </span>
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

      {/* Right Pane - Messages with 3-split layout */}
      <div className="h-full min-h-0 overflow-hidden">
        <div className="h-full grid grid-rows-[auto,1fr,auto] min-h-0 overflow-hidden">
          {selectedThread ? (
            <>
              {/* Header Area - Compact Candidate Info */}
              <CandidateHeader
                candidate={{
                  name: selectedThread.title || candidateInfoMap[selectedThread.id]?.name || "名前未設定",
                  nationality: candidateInfoMap[selectedThread.id]?.nationality || "不明",
                  gender: candidateInfoMap[selectedThread.id]?.gender || "不明",
                  age: candidateInfoMap[selectedThread.id]?.age || "不明",
                  desiredPosition: candidateInfoMap[selectedThread.id]?.desiredPosition || "飲食"
                }}
                sendState={getSendStateDisplay(selectedThread)}
                ownerCA={selectedThread.ownerCA || "未設定"}
                consentStatus={getConsentStatusDisplay()}
                isTranslationEnabled={isTranslationEnabled}
                onTranslationToggle={() => {
                  setIsTranslationEnabled(!isTranslationEnabled)
                  toast({
                    title: isTranslationEnabled ? "翻訳を無効化" : "翻訳を有効化",
                    description: isTranslationEnabled 
                      ? "メッセージを元の言語で表示します" 
                      : "メッセージを日本語に翻訳して表示します",
                  })
                }}
              />

              {/* Messages Area - Scrollable with compressed spacing */}
              <MessageThread
                messages={messages}
                loadingMessages={loadingMessages}
                isTranslationEnabled={isTranslationEnabled}
                sendStateInfo={getSendStateDisplay(selectedThread)}
                className="min-h-0 overflow-y-auto px-3 md:px-4 py-2"
              />

              {/* Composer Area - Fixed at bottom */}
              <MessageComposer
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSend={handleSendMessage}
                onTemplateSelect={handleTemplateSelect}
                onTagSelect={() => setShowTagModal(true)}
                onConsentRequest={handleConsentRequest}
                onFileSelect={handleFileSelect}
                attachedFiles={attachedFiles}
                onRemoveFile={removeAttachedFile}
                showTagModal={showTagModal}
                onTagModalChange={setShowTagModal}
                showConsentModal={showConsentModal}
                onConsentModalChange={setShowConsentModal}
                showTemplates={showTemplates}
                onTemplatesChange={setShowTemplates}
                templateSearch={templateSearch}
                onTemplateSearchChange={setTemplateSearch}
                selectedTemplateCategory={selectedTemplateCategory}
                onTemplateCategoryChange={setSelectedTemplateCategory}
                filteredTemplates={filteredTemplates}
                requiresTag={getSendStateDisplay(selectedThread).state === "requires_tag"}
                className="border-t bg-background p-2 md:p-3"
              />
            </>
          ) : (
            <div className="col-span-3 flex items-center justify-center text-muted-foreground">
              Select a thread from the left to display messages
            </div>
          )}
        </div>
      </div>


      </div>
    </div>
  )
}

export default Messages
