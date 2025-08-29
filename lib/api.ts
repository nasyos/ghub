import { auditLogger, AUDIT_ACTIONS } from "@/lib/audit-logger"

// ---- User Management Types ----
export interface User {
  id: string
  name: string
  email: string
  role: "CA" | "CA管理" | "RA" | "RA管理" | "両面" | "管理者"
  pages: string[] // FacebookPage.pageId[]
  applyLinkEnabled: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  status: "active" | "inactive"
}

export interface ApplyLink {
  id: string
  userId: string // CA userId
  pageId: string
  token: string // /r/<token>
  enabled: boolean
  expiresAt?: string
  isDefault: boolean // 既定フラグ（★）
  status: "active" | "expired" | "disabled" // 状態管理
  createdAt: string
  updatedAt: string
}

// ---- Facebook Page Types ----
export interface FacebookPage {
  id: string
  pageId: string
  name: string
  tokenMasked?: boolean
  tokenExpiresAt?: string
  linkedCAs: string[]
  lastSyncedAt?: string
  connected: boolean
  createdAt: string
  updatedAt: string
  expiryStatus?: TokenExpiryStatus
  lastNotificationSent?: string
}

// ---- Message Thread Types ----
export interface MessageThread {
  id: string
  pageId: string
  candidateId?: string
  ownerCA?: string
  title?: string
  lastMessageAt: string
  lastInboundAt?: string // Added for send state calculation
  lastTag?: string // Added for tag tracking
  unread: boolean
  recentTag?: string
  sendability: "active" | "human_agent" | "requires_tag" | "blocked"
  consentRequestedAt?: string // Added consent request timestamp
  consentLastSentBy?: string // Added last consent sender tracking
}

export interface Message {
  id: string
  threadId: string
  direction: "in" | "out"
  bodyOriginal: string
  lang?: string
  createdAt: string
  appliedTag?: string // Added for tag tracking in messages
}

// ---- OAuth Connection Types ----
export interface OAuthConnectionRequest {
  pageUrl: string
  state?: string
}

export interface OAuthConnectionResult {
  success: boolean
  page?: FacebookPage
  error?: string
  errorType?: "url_invalid" | "oauth_denied" | "permissions_insufficient" | "webhook_failed" | "connection_failed"
  requiresAuth?: boolean
  authUrl?: string
  requiredPermissions?: string[]
  webhookWarning?: string
}

export interface WebhookSubscriptionStatus {
  subscribed: boolean
  error?: string
  errorType?: "page_not_found" | "permissions_insufficient" | "api_error" | "network_error"
  retryable?: boolean
}

// ---- Connection Status Types ----
export interface ConnectionStatusInfo {
  status: "connected" | "expired" | "revoked" | "error" | "webhook_failed"
  canReconnect: boolean
  canResubscribe: boolean
  errorMessage?: string
  expiresAt?: string
  lastChecked: string
}

// ---- Token Expiry Notification Types ----
export type TokenExpiryStatus = "connected" | "expiring_soon" | "expiring_urgent" | "expired"

export interface TokenExpiryNotification {
  id: string
  pageId: string
  pageName: string
  status: TokenExpiryStatus
  daysRemaining: number
  createdAt: string
  read: boolean
}

export interface TokenMonitoringResult {
  pagesChecked: number
  notifications: TokenExpiryNotification[]
  statusUpdates: { pageId: string; oldStatus: string; newStatus: TokenExpiryStatus }[]
}

// ---- Pending Applicant Types ----
export interface PendingApplicant {
  id: string
  name: string
  nationality: string
  refUserId: string // 担当CA
  refPageId: string // Facebookページ
  status: "pre_screen"
  createdAt: string
}

// ---- Consent Management Types ----
export interface ConsentLog {
  id: string
  threadId: string
  type: "request" | "acquired" | "resend"
  at: string
  userId: string
  templateId?: string
  payloadSnapshot?: string
}

export interface Candidate {
  id: string
  name: string
  nationality: string
  threadId?: string
  consentAt?: string // Added consent acquisition timestamp
  createdAt: string
  updatedAt: string
}

// ---- Mock Data ----
let mockUsers: User[] = [
  {
    id: "1",
    name: "田中 太郎",
    email: "tanaka@company.com",
    role: "管理者",
    pages: [],
    applyLinkEnabled: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "2",
    name: "佐藤 花子",
    email: "sato@company.com",
    role: "CA管理",
    pages: ["123456789", "987654321"],
    applyLinkEnabled: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-15T13:45:00Z",
  },
  {
    id: "3",
    name: "鈴木 一郎",
    email: "suzuki@company.com",
    role: "CA",
    pages: ["123456789"],
    applyLinkEnabled: true,
    status: "inactive",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T09:20:00Z",
    lastLoginAt: "2024-01-10T09:20:00Z",
  },
  {
    id: "4",
    name: "高橋 美咲",
    email: "takahashi@company.com",
    role: "CA",
    pages: ["123456789", "987654321"],
    applyLinkEnabled: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T11:20:00Z",
    lastLoginAt: "2024-01-15T11:20:00Z",
  },
  {
    id: "5",
    name: "渡辺 健太",
    email: "watanabe@company.com",
    role: "RA管理",
    pages: [],
    applyLinkEnabled: false,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "6",
    name: "伊藤 さゆり",
    email: "ito@company.com",
    role: "RA",
    pages: [],
    applyLinkEnabled: false,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "7",
    name: "小林 明",
    email: "kobayashi@company.com",
    role: "両面",
    pages: ["123456789"],
    applyLinkEnabled: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-15T14:00:00Z",
  },
]

let mockApplyLinks: ApplyLink[] = [
  {
    id: "apply-1",
    userId: "2",
    pageId: "123456789",
    token: "ca2_page1_abc123",
    enabled: true,
    isDefault: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "apply-2",
    userId: "3",
    pageId: "123456789",
    token: "ca3_page1_def456",
    enabled: true,
    isDefault: false,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "apply-3",
    userId: "4",
    pageId: "987654321",
    token: "ca4_page2_ghi789",
    enabled: false,
    isDefault: false,
    status: "expired",
    expiresAt: "2024-06-30T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
]

let mockFacebookPages: FacebookPage[] = [
  {
    id: "fb-page-1",
    pageId: "123456789",
    name: "GlobalHire Hub 公式",
    tokenMasked: true,
    tokenExpiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    linkedCAs: ["2", "5"],
    lastSyncedAt: "2024-01-15T10:00:00Z",
    connected: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    expiryStatus: "connected",
  },
  {
    id: "fb-page-2",
    pageId: "987654321",
    name: "GlobalHire Hub 採用",
    tokenMasked: true,
    tokenExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    linkedCAs: ["2", "4"],
    lastSyncedAt: "2024-01-14T15:30:00Z",
    connected: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-14T15:30:00Z",
    expiryStatus: "expiring_urgent",
  },
  {
    id: "fb-page-3",
    pageId: "555666777",
    name: "Old Page",
    tokenMasked: true,
    tokenExpiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (expired)
    linkedCAs: ["3"],
    lastSyncedAt: "2024-01-10T08:00:00Z",
    connected: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
    expiryStatus: "expired",
  },
]

const mockMessages: Message[] = [
  {
    id: "msg-1",
    threadId: "thread-1",
    direction: "in",
    bodyOriginal: "こんにちは、求人について質問があります。",
    lang: "ja",
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "msg-2",
    threadId: "thread-1",
    direction: "out",
    bodyOriginal: "ありがとうございます。どのような質問でしょうか？",
    lang: "ja",
    createdAt: "2024-01-15T09:32:00Z",
  },
]

let mockMessageThreads: MessageThread[] = [
  {
    id: "thread-1",
    pageId: "123456789",
    candidateId: "cand-1",
    ownerCA: "2",
    title: "求人に関する質問",
    lastMessageAt: "2024-01-15T09:32:00Z",
    lastInboundAt: "2024-01-15T09:30:00Z",
    unread: false,
    sendability: "active",
  },
]

let mockPendingApplicants: PendingApplicant[] = [
  {
    id: "pending-1",
    name: "田中太郎",
    nationality: "日本",
    refUserId: "2",
    refPageId: "123456789",
    status: "pre_screen",
    createdAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "pending-2",
    name: "Smith John",
    nationality: "アメリカ",
    refUserId: "3",
    refPageId: "123456789",
    status: "pre_screen",
    createdAt: "2024-01-21T14:15:00Z",
  },
]

let mockConsentLogs: ConsentLog[] = []

let mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Nguyen Thi A",
    nationality: "ベトナム",
    threadId: "thread-1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cand-2",
    name: "Kumar B",
    nationality: "インド",
    threadId: "thread-2",
    consentAt: "2024-01-18T14:30:00Z", // Sample with consent acquired
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
  },
]

// Mock CA management data for permission checking
const mockCAManagement = {
  "5": ["2", "4"], // CA Manager (id: 5) manages CAs with ids 2 and 4
  "6": ["3"], // RA Manager (id: 6) manages RA with id 3
}

// ---- API Functions ----

// Facebook Pages API
export const facebookPagesApi = {
  async getAll(): Promise<FacebookPage[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Load from localStorage if available
    const stored = localStorage.getItem("mockFacebookPages")
    if (stored) {
      mockFacebookPages = JSON.parse(stored)
    }

    // Update expiry status for each page
    const now = new Date()
    for (const page of mockFacebookPages) {
      if (page.tokenExpiresAt) {
        const daysRemaining = tokenMonitoringApi.getDaysUntilExpiry(page)

        if (daysRemaining <= 0) {
          page.expiryStatus = "expired"
          page.connected = false
        } else if (daysRemaining <= 7) {
          page.expiryStatus = "expiring_urgent"
        } else if (daysRemaining <= 15) {
          page.expiryStatus = "expiring_soon"
        } else {
          page.expiryStatus = "connected"
        }
      }
    }

    return mockFacebookPages
  },

  async create(data: Omit<FacebookPage, "id" | "createdAt" | "updatedAt">): Promise<FacebookPage> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newPage: FacebookPage = {
      ...data,
      id: `fb-page-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockFacebookPages.push(newPage)
    storageHelpers.saveFacebookPages()
    return newPage
  },

  async update(id: string, data: Partial<FacebookPage>): Promise<FacebookPage> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = mockFacebookPages.findIndex((page) => page.id === id)
    if (index === -1) {
      throw new Error("Facebook page not found")
    }

    mockFacebookPages[index] = {
      ...mockFacebookPages[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    storageHelpers.saveFacebookPages()
    return mockFacebookPages[index]
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockFacebookPages.findIndex((page) => page.id === id)
    if (index === -1) {
      throw new Error("Facebook page not found")
    }

    mockFacebookPages.splice(index, 1)
    storageHelpers.saveFacebookPages()
  },

  async resync(id: string): Promise<FacebookPage> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const index = mockFacebookPages.findIndex((page) => page.id === id)
    if (index === -1) {
      throw new Error("Facebook page not found")
    }

    mockFacebookPages[index] = {
      ...mockFacebookPages[index],
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    storageHelpers.saveFacebookPages()
    return mockFacebookPages[index]
  },

  async startOAuthConnection(request: OAuthConnectionRequest): Promise<OAuthConnectionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const pageId = this.extractPageIdFromUrl(request.pageUrl)
    if (!pageId) {
      return {
        success: false,
        error:
          "ページURLを確認するか、IDを直入力してください。\n例: https://www.facebook.com/your-page または ページID",
        errorType: "url_invalid",
      }
    }

    // Check if page already exists
    const existingPage = mockFacebookPages.find((p) => p.pageId === pageId)
    if (existingPage && existingPage.connected) {
      return {
        success: false,
        error:
          "このページは既に接続されています。再接続が必要な場合は、一覧から「再接続」ボタンをクリックしてください。",
        errorType: "connection_failed",
      }
    }

    // Generate OAuth URL (mock)
    const state = request.state || `oauth_${Date.now()}`
    const requiredPermissions = ["pages_show_list", "pages_manage_metadata", "pages_read_engagement", "pages_messaging"]

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=mock_app_id&redirect_uri=${encodeURIComponent(
      window.location.origin + "/api/facebook/connect/callback",
    )}&scope=${requiredPermissions.join(",")}&state=${state}`

    // Store state for validation
    if (typeof window !== "undefined") {
      localStorage.setItem(`oauth_state_${state}`, JSON.stringify({ pageUrl: request.pageUrl, pageId }))
    }

    return {
      success: true,
      requiresAuth: true,
      authUrl,
      requiredPermissions,
    }
  },

  async completeOAuthConnection(code: string, state: string): Promise<OAuthConnectionResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Validate state
    const stateData = typeof window !== "undefined" ? localStorage.getItem(`oauth_state_${state}`) : null
    if (!stateData) {
      return {
        success: false,
        error: "認証状態が無効です。セキュリティのため、再度接続をやり直してください。",
        errorType: "connection_failed",
      }
    }

    const { pageUrl, pageId } = JSON.parse(stateData)

    try {
      // Simulate OAuth denial (5% chance for demo)
      if (Math.random() < 0.05) {
        return {
          success: false,
          error: "OAuth認証がキャンセルされました。Facebookでの認証を完了してください。",
          errorType: "oauth_denied",
        }
      }

      // Simulate insufficient permissions (5% chance for demo)
      if (Math.random() < 0.05) {
        return {
          success: false,
          error:
            "権限が不足しています。\n必要な権限: pages_show_list, pages_manage_metadata, pages_read_engagement, pages_messaging\n\nFacebookで全ての権限を許可してください。",
          errorType: "permissions_insufficient",
          requiredPermissions: ["pages_show_list", "pages_manage_metadata", "pages_read_engagement", "pages_messaging"],
        }
      }

      // Simulate getting user access token
      const userToken = `mock_user_token_${Date.now()}`

      // Simulate getting page access token
      const pageToken = `mock_page_token_${Date.now()}`

      // Create or update Facebook page
      const existingPageIndex = mockFacebookPages.findIndex((p) => p.pageId === pageId)
      let page: FacebookPage

      if (existingPageIndex >= 0) {
        // Update existing page
        page = await this.update(mockFacebookPages[existingPageIndex].id, {
          connected: true,
          tokenMasked: true,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
          lastSyncedAt: new Date().toISOString(),
        })
      } else {
        // Create new page
        page = await this.create({
          pageId,
          name: `Page ${pageId}`,
          tokenMasked: true,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          linkedCAs: [],
          lastSyncedAt: new Date().toISOString(),
          connected: true,
        })
      }

      // Subscribe to webhooks
      const webhookResult = await this.subscribeWebhook(page.pageId)
      let webhookWarning: string | undefined

      if (!webhookResult.subscribed) {
        webhookWarning = `Webhook購読に失敗しました: ${webhookResult.error}\n接続は完了していますが、メッセージの受信ができない可能性があります。後で「Webhook再購読」ボタンをクリックしてください。`
        console.warn("Webhook subscription failed:", webhookResult.error)
      }

      // Clean up state
      if (typeof window !== "undefined") {
        localStorage.removeItem(`oauth_state_${state}`)
      }

      // Log audit event
      auditLogger.log("FacebookPage.connect", `OAuth接続完了: ${page.name}`, {
        pageId: page.pageId,
        connected: true,
        webhookSubscribed: webhookResult.subscribed,
      })

      return {
        success: true,
        page,
        webhookWarning,
      }
    } catch (error) {
      return {
        success: false,
        error: "接続中にエラーが発生しました。ネットワーク接続を確認して再度お試しください。",
        errorType: "connection_failed",
      }
    }
  },

  async subscribeWebhook(pageId: string): Promise<WebhookSubscriptionStatus> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const success = Math.random() > 0.15 // 85% success rate for demo

    if (success) {
      auditLogger.log("FacebookPage.subscribe", `Webhook購読完了: ${pageId}`, {
        pageId,
        subscribed: true,
      })
      return { subscribed: true }
    } else {
      // Simulate different types of webhook errors
      const errorTypes = [
        {
          type: "permissions_insufficient" as const,
          message: "Webhook購読に必要な権限が不足しています。ページの管理者権限を確認してください。",
          retryable: false,
        },
        {
          type: "api_error" as const,
          message: "Facebook APIでエラーが発生しました。しばらく待ってから再試行してください。",
          retryable: true,
        },
        {
          type: "network_error" as const,
          message: "ネットワークエラーが発生しました。接続を確認して再試行してください。",
          retryable: true,
        },
      ]

      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]

      return {
        subscribed: false,
        error: randomError.message,
        errorType: randomError.type,
        retryable: randomError.retryable,
      }
    }
  },

  async resubscribeWebhook(id: string): Promise<WebhookSubscriptionStatus> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const page = mockFacebookPages.find((p) => p.id === id)
    if (!page) {
      return {
        subscribed: false,
        error: "ページが見つかりません。ページが削除されている可能性があります。",
        errorType: "page_not_found",
        retryable: false,
      }
    }

    return this.subscribeWebhook(page.pageId)
  },

  async refreshConnection(id: string): Promise<OAuthConnectionResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const page = mockFacebookPages.find((p) => p.id === id)
    if (!page) {
      return {
        success: false,
        error: "ページが見つかりません。ページが削除されている可能性があります。",
        errorType: "connection_failed",
      }
    }

    // Generate new OAuth URL for reconnection
    const state = `refresh_${Date.now()}`
    const requiredPermissions = ["pages_show_list", "pages_manage_metadata", "pages_read_engagement", "pages_messaging"]

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=mock_app_id&redirect_uri=${encodeURIComponent(
      window.location.origin + "/api/facebook/connect/callback",
    )}&scope=${requiredPermissions.join(",")}&state=${state}`

    // Store state for validation
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `oauth_state_${state}`,
        JSON.stringify({
          pageUrl: `https://facebook.com/${page.pageId}`,
          pageId: page.pageId,
          refreshPageId: id,
        }),
      )
    }

    return {
      success: true,
      requiresAuth: true,
      authUrl,
      requiredPermissions,
    }
  },

  extractPageIdFromUrl(url: string): string | null {
    if (!url || typeof url !== "string") {
      return null
    }

    // Clean up URL
    const cleanUrl = url.trim().toLowerCase()

    // Direct page ID (numeric)
    if (/^\d+$/.test(cleanUrl)) {
      return cleanUrl
    }

    // Various Facebook URL patterns
    const patterns = [
      // Standard page URLs
      /(?:facebook\.com|fb\.com)\/([a-zA-Z0-9._-]+)(?:\/|$|\?)/,
      // Pages with /pages/ in URL
      /(?:facebook\.com|fb\.com)\/pages\/[^/]+\/(\d+)/,
      // Profile URLs with ID
      /(?:facebook\.com|fb\.com)\/profile\.php\?id=(\d+)/,
      // Business URLs
      /(?:facebook\.com|fb\.com)\/business\/([a-zA-Z0-9._-]+)/,
      // Mobile URLs
      /(?:m\.facebook\.com|mobile\.facebook\.com)\/([a-zA-Z0-9._-]+)/,
    ]

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match && match[1]) {
        // Filter out common non-page paths
        const excludePaths = ["login", "register", "help", "privacy", "terms", "about", "careers"]
        if (!excludePaths.includes(match[1])) {
          return match[1]
        }
      }
    }

    return null
  },

  getConnectionStatus(page: FacebookPage): "connected" | "expired" | "revoked" | "error" {
    if (!page.connected) return "error"

    if (page.tokenExpiresAt && new Date(page.tokenExpiresAt) < new Date()) {
      return "expired"
    }

    // Mock revocation check (simulate some pages being revoked)
    if (page.pageId === "revoked_page_id" || Math.random() < 0.02) {
      return "revoked"
    }

    return "connected"
  },

  getDetailedConnectionStatus(page: FacebookPage): ConnectionStatusInfo {
    const status = this.getConnectionStatus(page)
    const now = new Date().toISOString()

    switch (status) {
      case "connected":
        return {
          status: "connected",
          canReconnect: false,
          canResubscribe: true,
          lastChecked: now,
          expiresAt: page.tokenExpiresAt,
        }

      case "expired":
        return {
          status: "expired",
          canReconnect: true,
          canResubscribe: false,
          errorMessage: "アクセストークンの有効期限が切れています。再接続してください。",
          lastChecked: now,
          expiresAt: page.tokenExpiresAt,
        }

      case "revoked":
        return {
          status: "revoked",
          canReconnect: true,
          canResubscribe: false,
          errorMessage: "Facebookでアプリの権限が取り消されています。再接続してください。",
          lastChecked: now,
        }

      default:
        return {
          status: "error",
          canReconnect: true,
          canResubscribe: false,
          errorMessage: "接続に問題があります。再接続してください。",
          lastChecked: now,
        }
    }
  },

  async checkConnectionHealth(pageId: string): Promise<ConnectionStatusInfo> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const page = mockFacebookPages.find((p) => p.pageId === pageId)
    if (!page) {
      return {
        status: "error",
        canReconnect: false,
        canResubscribe: false,
        errorMessage: "ページが見つかりません",
        lastChecked: new Date().toISOString(),
      }
    }

    return this.getDetailedConnectionStatus(page)
  },
}

// ---- Adding mock message client for demo functionality
import {
  getMockThreads,
  getMockMessages,
  getMockCandidates,
  saveMockThreads,
  saveMockMessages,
  initializeMockData,
  type MockFacebookPage,
  type MockThread,
  type MockMessage,
  getDemoPages,
  getMockPageById,
} from "./mock/messages.fixtures"

export function getSendState(
  thread: MessageThread,
  userRole: string,
  userId: string,
  page?: FacebookPage,
): "active" | "human_agent" | "requires_tag" | "blocked" {
  const debugMode = process.env.NEXT_PUBLIC_DEBUG_SEND_STATE === "true"

  if (debugMode) {
    console.log("[v0] getSendState called with:", {
      threadId: thread.id,
      userRole,
      userId,
      pageId: page?.id,
      mockEnvVar: process.env.NEXT_PUBLIC_MESSAGES_USE_MOCK,
    })
  }

  // Always use mock logic in this environment
  const mockThreads = getMockThreads()
  const mockThread = mockThreads.find((t) => t.id === thread.id)

  if (mockThread && mockThread.sendability) {
    if (debugMode) {
      console.log("[v0] Using mock sendability:", mockThread.sendability, "for thread:", thread.id)
    }
    return mockThread.sendability as "active" | "human_agent" | "requires_tag" | "blocked"
  }

  // Input normalization with fallback to requires_tag
  let pageState = "Connected"
  if (page) {
    if (page.connected === false || page.tokenExpired === true) {
      pageState = "Expired"
    } else if (page.expiryStatus === "ExpiringSoon" || page.expiryStatus === "ExpiringUrgent") {
      pageState = "Expiring"
    }
  }

  // Strict page state check - only block for explicitly expired/blocked states
  if (pageState === "Expired" || pageState === "Blocked") {
    if (debugMode) {
      console.log("[v0] Page blocked - state:", pageState)
    }
    return "blocked"
  }

  // Parse lastInboundAt with fallback
  let lastInbound: Date | null = null
  if (thread.lastInboundAt) {
    try {
      // Try ISO8601 parsing first
      lastInbound = new Date(thread.lastInboundAt)
      // Validate the parsed date
      if (isNaN(lastInbound.getTime())) {
        throw new Error("Invalid date")
      }
    } catch (error) {
      if (debugMode) {
        console.log("[v0] Failed to parse lastInboundAt:", thread.lastInboundAt, "falling back to requires_tag")
      }
      return "requires_tag"
    }
  }

  // Default hasHumanAgentPermission to false for safety
  const hasHumanAgentPermission =
    userRole === "管理者" || userRole === "admin" || userRole === "CA管理" || userRole === "両面" || userRole === "CA"

  if (!lastInbound) {
    // No inbound message yet, requires tag
    if (debugMode) {
      console.log("[v0] No lastInboundAt, defaulting to requires_tag")
    }
    return "requires_tag"
  }

  // Calculate time difference
  const now = new Date()
  const diffMs = now.getTime() - lastInbound.getTime()
  const hoursSinceInbound = diffMs / (1000 * 60 * 60)
  const daysSinceInbound = hoursSinceInbound / 24

  if (debugMode) {
    console.log("[v0] Time calculation:", {
      hoursSinceInbound: hoursSinceInbound.toFixed(2),
      daysSinceInbound: daysSinceInbound.toFixed(2),
      hasHumanAgentPermission,
      pageState,
    })
  }

  // Final logic with fallback to requires_tag
  if (diffMs <= 24 * 60 * 60 * 1000) {
    // ≤24h
    return "active"
  }

  if (diffMs <= 7 * 24 * 60 * 60 * 1000 && hasHumanAgentPermission) {
    // ≤7d with permission
    return "human_agent"
  }

  // Default fallback: requires_tag (not blocked)
  return "requires_tag"
}

export function getTimeRemaining(
  thread: MessageThread,
  sendState: string,
): { hours: number; minutes: number; days: number } | null {
  if (sendState !== "active" && sendState !== "human_agent") {
    return null
  }

  const now = new Date()
  const lastInbound = thread.lastInboundAt ? new Date(thread.lastInboundAt) : null

  if (!lastInbound) return null

  const timeSinceInbound = now.getTime() - lastInbound.getTime()

  if (sendState === "active") {
    // 24 hours limit
    const remainingMs = 24 * 60 * 60 * 1000 - timeSinceInbound
    if (remainingMs <= 0) return null

    const hours = Math.floor(remainingMs / (1000 * 60 * 60))
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes, days: 0 }
  }

  if (sendState === "human_agent") {
    // 7 days limit
    const remainingMs = 7 * 24 * 60 * 60 * 1000 - timeSinceInbound
    if (remainingMs <= 0) return null

    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
    return { hours: 0, minutes: 0, days }
  }

  return null
}

export const TAG_MAPPING = {
  "日程リマインド/変更": "CONFIRMED_EVENT_UPDATE",
  "情報確認/選考通知/進捗連絡": "ACCOUNT_UPDATE",
} as const

export type DisplayTagName = keyof typeof TAG_MAPPING
export type InternalTagName = (typeof TAG_MAPPING)[DisplayTagName]

// Message Threads API
export const messageThreadsApi = {
  async getByPageId(
    pageId: string,
    filters?: {
      unreadOnly?: boolean
      ownerCA?: string
      tag?: string
    },
  ): Promise<MessageThread[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let threads = mockMessageThreads.filter((thread) => thread.pageId === pageId)

    if (filters?.unreadOnly) {
      threads = threads.filter((thread) => thread.unread)
    }

    if (filters?.ownerCA) {
      threads = threads.filter((thread) => thread.ownerCA === filters.ownerCA)
    }

    if (filters?.tag) {
      threads = threads.filter((thread) => thread.recentTag === filters.tag)
    }

    return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },

  async getMessages(threadId: string): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockMessages
      .filter((msg) => msg.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },

  async sendMessage(
    threadId: string,
    data: {
      bodyOriginal: string
      lang?: string
      userId: number
      tag?: InternalTagName // Added tag parameter
    },
  ): Promise<{ success: boolean; message?: Message; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const thread = mockMessageThreads.find((t) => t.id === threadId)
    if (!thread) {
      return { success: false, error: "Thread not found" }
    }

    const page = mockFacebookPages.find((p) => p.pageId === thread.pageId)
    const currentUser = {
      id: data.userId,
      role: "管理者",
    }

    if (!currentUser || !page) {
      return { success: false, error: "Invalid user or page" }
    }

    const sendState = getSendState(thread, currentUser.role, currentUser.id.toString(), page)

    if (sendState === "blocked") {
      return { success: false, error: "Sending blocked due to policy restrictions" }
    }

    if (sendState === "requires_tag" && !data.tag) {
      return { success: false, error: "Tag selection required for this message" }
    }

    let appliedTag = data.tag
    if (sendState === "human_agent" && !appliedTag) {
      appliedTag = "HUMAN_AGENT"
    }

    // Auto-assign owner CA if not set
    if (!thread.ownerCA) {
      if (page.linkedCAs.includes(data.userId.toString())) {
        thread.ownerCA = data.userId.toString()

        await auditLogger.log({
          user_id: data.userId,
          action: "message_thread_auto_assign",
          entity_type: "message_thread",
          entity_id: threadId,
          new_values: { ownerCA: data.userId.toString(), reason: "auto_assigned_on_send" },
        })
      }
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId,
      direction: "out",
      bodyOriginal: data.bodyOriginal,
      lang: data.lang || "ja",
      createdAt: new Date().toISOString(),
      appliedTag, // Store applied tag in message
    }

    mockMessages.push(newMessage)

    const threadIndex = mockMessageThreads.findIndex((t) => t.id === threadId)
    if (threadIndex !== -1) {
      mockMessageThreads[threadIndex].lastMessageAt = newMessage.createdAt
      if (appliedTag) {
        mockMessageThreads[threadIndex].lastTag = appliedTag
      }
      // Update sendability based on new state
      mockMessageThreads[threadIndex].sendability = getSendState(
        mockMessageThreads[threadIndex],
        currentUser.role,
        currentUser.id.toString(),
        page,
      )
    }

    await auditLogger.logMessageAction(data.userId, AUDIT_ACTIONS.MESSAGE_SEND, newMessage.id, {
      threadId,
      pageId: thread.pageId,
      messageLength: data.bodyOriginal.length,
      appliedTag,
      sendState,
    })

    storageHelpers.saveMessageThreads()
    return { success: true, message: newMessage }
  },

  async assignOwner(threadId: string, ownerCA: string, userId: number): Promise<MessageThread> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockMessageThreads.findIndex((t) => t.id === threadId)
    if (index === -1) {
      throw new Error("Thread not found")
    }

    const oldOwner = mockMessageThreads[index].ownerCA
    mockMessageThreads[index].ownerCA = ownerCA

    // Log audit action
    await auditLogger.log({
      user_id: userId,
      action: "message_thread_assign",
      entity_type: "message_thread",
      entity_id: threadId,
      old_values: { ownerCA: oldOwner },
      new_values: { ownerCA },
    })

    storageHelpers.saveMessageThreads()
    return mockMessageThreads[index]
  },
}

// User Management API
export const usersApi = {
  async getAll(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockUsers]
  },

  async getById(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockUsers.find((user) => user.id === id) || null
  },

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check email uniqueness
    if (mockUsers.some((user) => user.email === data.email)) {
      throw new Error("Email address already exists")
    }

    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    storageHelpers.saveUsers()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(newUser.id),
      action: AUDIT_ACTIONS.ACCOUNT_CREATE,
      entity_type: "user",
      entity_id: newUser.id,
      new_values: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        pages: newUser.pages,
      },
    })

    return newUser
  },

  async update(id: string, data: Partial<User>, updatedBy: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = mockUsers.findIndex((user) => user.id === id)
    if (index === -1) {
      throw new Error("User not found")
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== mockUsers[index].email) {
      if (mockUsers.some((user) => user.email === data.email && user.id !== id)) {
        throw new Error("Email address already exists")
      }
    }

    const oldValues = { ...mockUsers[index] }
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    storageHelpers.saveUsers()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(updatedBy),
      action: AUDIT_ACTIONS.ACCOUNT_UPDATE,
      entity_type: "user",
      entity_id: id,
      old_values: {
        name: oldValues.name,
        email: oldValues.email,
        role: oldValues.role,
        pages: oldValues.pages,
        status: oldValues.status,
      },
      new_values: {
        name: mockUsers[index].name,
        email: mockUsers[index].email,
        role: mockUsers[index].role,
        pages: mockUsers[index].pages,
        status: mockUsers[index].status,
      },
    })

    return mockUsers[index]
  },

  async delete(id: string, deletedBy: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockUsers.findIndex((user) => user.id === id)
    if (index === -1) {
      throw new Error("User not found")
    }

    const deletedUser = mockUsers[index]
    mockUsers.splice(index, 1)
    storageHelpers.saveUsers()

    // Also remove related apply links
    mockApplyLinks = mockApplyLinks.filter((link) => link.userId !== id)
    storageHelpers.saveApplyLinks()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(deletedBy),
      action: AUDIT_ACTIONS.ACCOUNT_DELETE,
      entity_type: "user",
      entity_id: id,
      old_values: {
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    })
  },

  async resetPassword(id: string, newPassword: string, resetBy: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const user = mockUsers.find((user) => user.id === id)
    if (!user) {
      throw new Error("User not found")
    }

    // In real implementation, hash and store password
    // For mock, we just log the action

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(resetBy),
      action: "password_reset",
      entity_type: "user",
      entity_id: id,
      new_values: {
        password_reset: true,
        reset_by: resetBy,
      },
    })
  },

  // Get users by role for assignment purposes
  async getByRole(role: User["role"]): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockUsers.filter((user) => user.role === role && user.status === "active")
  },

  // Get CA users for page assignment
  async getCAs(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockUsers.filter((user) => ["CA", "CA管理", "両面"].includes(user.role) && user.status === "active")
  },
}

// Apply Links Management API
export const applyLinksApi = {
  async getAll(): Promise<ApplyLink[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockApplyLinks]
  },

  async getByUserId(userId: string): Promise<ApplyLink[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockApplyLinks.filter((link) => link.userId === userId)
  },

  async getByUserIdForAdmin(userId: string): Promise<ApplyLink[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockApplyLinks.filter((link) => link.userId === userId)
  },

  async getByPageId(pageId: string): Promise<ApplyLink[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockApplyLinks.filter((link) => link.pageId === pageId)
  },

  async create(data: Omit<ApplyLink, "id" | "createdAt" | "updatedAt" | "token">): Promise<ApplyLink> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate unique token
    const token = `${data.userId}_${data.pageId}_${Date.now().toString(36)}`

    const newLink: ApplyLink = {
      ...data,
      id: `apply-${Date.now()}`,
      token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockApplyLinks.push(newLink)
    storageHelpers.saveApplyLinks()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(data.userId),
      action: "apply_link_create",
      entity_type: "apply_link",
      entity_id: newLink.id,
      new_values: {
        userId: newLink.userId,
        pageId: newLink.pageId,
        enabled: newLink.enabled,
        isDefault: newLink.isDefault,
        status: newLink.status,
      },
    })

    return newLink
  },

  async update(id: string, data: Partial<ApplyLink>, updatedBy: string): Promise<ApplyLink> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockApplyLinks.findIndex((link) => link.id === id)
    if (index === -1) {
      throw new Error("Apply link not found")
    }

    const oldValues = { ...mockApplyLinks[index] }
    mockApplyLinks[index] = {
      ...mockApplyLinks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    storageHelpers.saveApplyLinks()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(updatedBy),
      action: "apply_link_update",
      entity_type: "apply_link",
      entity_id: id,
      old_values: {
        enabled: oldValues.enabled,
        expiresAt: oldValues.expiresAt,
        isDefault: oldValues.isDefault,
        status: oldValues.status,
      },
      new_values: {
        enabled: mockApplyLinks[index].enabled,
        expiresAt: mockApplyLinks[index].expiresAt,
        isDefault: mockApplyLinks[index].isDefault,
        status: mockApplyLinks[index].status,
      },
    })

    return mockApplyLinks[index]
  },

  async setDefault(id: string, userId: string, updatedBy: string): Promise<ApplyLink> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockApplyLinks.findIndex((link) => link.id === id)
    if (index === -1) {
      throw new Error("Apply link not found")
    }

    // 同じユーザーの他のリンクの既定フラグを解除
    mockApplyLinks.forEach((link, i) => {
      if (link.userId === userId && i !== index) {
        link.isDefault = false
        link.updatedAt = new Date().toISOString()
      }
    })

    // 対象リンクを既定に設定
    mockApplyLinks[index].isDefault = true
    mockApplyLinks[index].updatedAt = new Date().toISOString()

    storageHelpers.saveApplyLinks()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(updatedBy),
      action: "apply_link_set_default",
      entity_type: "apply_link",
      entity_id: id,
      new_values: {
        isDefault: true,
        userId: userId,
      },
    })

    return mockApplyLinks[index]
  },

  async bulkDisable(ids: string[], updatedBy: string): Promise<ApplyLink[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedLinks: ApplyLink[] = []

    for (const id of ids) {
      const index = mockApplyLinks.findIndex((link) => link.id === id)
      if (index !== -1) {
        mockApplyLinks[index].status = "disabled"
        mockApplyLinks[index].enabled = false
        mockApplyLinks[index].updatedAt = new Date().toISOString()
        updatedLinks.push(mockApplyLinks[index])

        // Log audit action
        await auditLogger.log({
          user_id: Number.parseInt(updatedBy),
          action: "apply_link_bulk_disable",
          entity_type: "apply_link",
          entity_id: id,
          new_values: {
            status: "disabled",
            enabled: false,
          },
        })
      }
    }

    storageHelpers.saveApplyLinks()
    return updatedLinks
  },

  async bulkUpdateExpiry(ids: string[], expiresAt: string, updatedBy: string): Promise<ApplyLink[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedLinks: ApplyLink[] = []

    for (const id of ids) {
      const index = mockApplyLinks.findIndex((link) => link.id === id)
      if (index !== -1) {
        mockApplyLinks[index].expiresAt = expiresAt
        mockApplyLinks[index].updatedAt = new Date().toISOString()
        updatedLinks.push(mockApplyLinks[index])

        // Log audit action
        await auditLogger.log({
          user_id: Number.parseInt(updatedBy),
          action: "apply_link_bulk_update_expiry",
          entity_type: "apply_link",
          entity_id: id,
          new_values: {
            expiresAt: expiresAt,
          },
        })
      }
    }

    storageHelpers.saveApplyLinks()
    return updatedLinks
  },

  async delete(id: string, deletedBy: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockApplyLinks.findIndex((link) => link.id === id)
    if (index === -1) {
      throw new Error("Apply link not found")
    }

    const deletedLink = mockApplyLinks[index]
    mockApplyLinks.splice(index, 1)
    storageHelpers.saveApplyLinks()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(deletedBy),
      action: "apply_link_delete",
      entity_type: "apply_link",
      entity_id: id,
      old_values: {
        userId: deletedLink.userId,
        pageId: deletedLink.pageId,
        token: deletedLink.token,
      },
    })
  },

  // Generate new token for existing link
  async regenerateToken(id: string, regeneratedBy: string): Promise<ApplyLink> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockApplyLinks.findIndex((link) => link.id === id)
    if (index === -1) {
      throw new Error("Apply link not found")
    }

    const oldToken = mockApplyLinks[index].token
    const newToken = `${mockApplyLinks[index].userId}_${mockApplyLinks[index].pageId}_${Date.now().toString(36)}`

    mockApplyLinks[index] = {
      ...mockApplyLinks[index],
      token: newToken,
      updatedAt: new Date().toISOString(),
    }

    storageHelpers.saveApplyLinks()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(regeneratedBy),
      action: "apply_link_regenerate",
      entity_type: "apply_link",
      entity_id: id,
      old_values: { token: oldToken },
      new_values: { token: newToken },
    })

    return mockApplyLinks[index]
  },

  // Validate token and get associated data
  async validateToken(token: string): Promise<{ valid: boolean; link?: ApplyLink; user?: User; page?: FacebookPage }> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const link = mockApplyLinks.find((l) => l.token === token)
    if (!link || !link.enabled || link.status !== "active") {
      return { valid: false }
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      // Auto-update status to expired
      const index = mockApplyLinks.findIndex((l) => l.id === link.id)
      if (index !== -1) {
        mockApplyLinks[index].status = "expired"
        storageHelpers.saveApplyLinks()
      }
      return { valid: false }
    }

    const user = mockUsers.find((u) => u.id === link.userId)
    const page = mockFacebookPages.find((p) => p.pageId === link.pageId)

    return {
      valid: true,
      link,
      user,
      page,
    }
  },
}

// Enhanced Permission helpers with detailed role-based access control
export const permissionHelpers = {
  canViewPage(userRole: string, userId: string, page: FacebookPage, managedCAs?: string[]): boolean {
    // Admin can see all pages
    if (userRole === "管理者") return true

    // CA Manager can see pages linked to themselves or their managed CAs
    if (userRole === "CA管理") {
      const allManagedCAs = [userId, ...(managedCAs || mockCAManagement[userId] || [])]
      return page.linkedCAs.some((caId) => allManagedCAs.includes(caId))
    }

    // Dual role has CA permissions for message management
    if (userRole === "両面") {
      return page.linkedCAs.includes(userId)
    }

    // CA can only see pages they are linked to
    if (userRole === "CA") {
      return page.linkedCAs.includes(userId)
    }

    // RA roles cannot access Facebook pages for messaging
    if (userRole === "RA" || userRole === "RA管理") {
      return false
    }

    return false
  },

  canSendMessage(
    userRole: string,
    userId: string,
    thread: MessageThread,
    page: FacebookPage,
    managedCAs?: string[],
  ): boolean {
    // Check if thread is blocked
    if (thread.sendability === "blocked") return false

    // Check if user can view the page first
    if (!this.canViewPage(userRole, userId, page, managedCAs)) return false

    // Admin can send to all threads
    if (userRole === "管理者") return true

    // CA Manager can send to threads on pages they manage
    if (userRole === "CA管理") {
      const allManagedCAs = [userId, ...(managedCAs || mockCAManagement[userId] || [])]
      return page.linkedCAs.some((caId) => allManagedCAs.includes(caId))
    }

    // Dual role has CA permissions for sending messages
    if (userRole === "両面") {
      return page.linkedCAs.includes(userId)
    }

    // CA can send to threads on pages they are linked to
    if (userRole === "CA") {
      return page.linkedCAs.includes(userId)
    }

    // RA roles cannot send messages
    if (userRole === "RA" || userRole === "RA管理") {
      return false
    }

    return false
  },

  canManagePageSettings(userRole: string, userId: string): boolean {
    // Only admin can manage Facebook page settings
    return userRole === "管理者"
  },

  canManageApplyLinks(userRole: string): boolean {
    // Only admin can manage apply links (create, disable, assign, set default)
    return userRole === "管理者"
  },

  canViewOwnApplyLinks(userRole: string): boolean {
    // CA, CA Manager, and Dual roles can view their own apply links
    return ["CA", "CA管理", "両面"].includes(userRole)
  },

  canSetDefaultApplyLink(userRole: string, userId: string, linkUserId: string): boolean {
    // Admin can set default for any user
    if (userRole === "管理者") return true

    // CA can only set default for their own links
    return userId === linkUserId && ["CA", "CA管理", "両面"].includes(userRole)
  },

  getVisiblePages(userRole: string, userId: string, pages: FacebookPage[], managedCAs?: string[]): FacebookPage[] {
    return pages.filter((page) => this.canViewPage(userRole, userId, page, managedCAs))
  },

  canAssignCA(userRole: string, userId: string, targetCAId: string, managedCAs?: string[]): boolean {
    // Admin can assign any CA
    if (userRole === "管理者") return true

    // CA Manager can assign themselves or their managed CAs
    if (userRole === "CA管理") {
      const allManagedCAs = [userId, ...(managedCAs || mockCAManagement[userId] || [])]
      return allManagedCAs.includes(targetCAId)
    }

    return false
  },
}

// ---- Adding messages client with mock/real API switching
export const messagesClient = {
  isMock: process.env.NEXT_PUBLIC_MESSAGES_USE_MOCK !== "false", // Default to mock

  async getPages(): Promise<MockFacebookPage[]> {
    if (this.isMock) {
      // Initialize mock data on first access
      initializeMockData()

      return getDemoPages()
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async getMessages(threadId: string): Promise<MockMessage[]> {
    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 200))

      return getMockMessages()
        .filter((msg) => msg.threadId === threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async listThreadsAll(filters?: {
    pages?: string[]
    unreadOnly?: boolean
    ownerCA?: string
    tag?: string
    keyword?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<MockThread[]> {
    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

      let threads = getMockThreads()

      // Apply page filter
      if (filters?.pages && filters.pages.length > 0) {
        threads = threads.filter((thread) => filters.pages!.includes(thread.pageId))
      }

      // Apply other filters
      if (filters?.unreadOnly) {
        threads = threads.filter((thread) => thread.unread)
      }

      if (filters?.ownerCA) {
        threads = threads.filter((thread) => thread.ownerCA === filters.ownerCA)
      }

      if (filters?.tag) {
        threads = threads.filter((thread) => thread.recentTag === filters.tag)
      }

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase()
        threads = threads.filter(
          (thread) =>
            thread.title?.toLowerCase().includes(keyword) || thread.recentTag?.toLowerCase().includes(keyword),
        )
      }

      if (filters?.dateFrom) {
        threads = threads.filter((thread) => new Date(thread.lastMessageAt) >= new Date(filters.dateFrom!))
      }

      if (filters?.dateTo) {
        threads = threads.filter((thread) => new Date(thread.lastMessageAt) <= new Date(filters.dateTo!))
      }

      // Sort by lastMessageAt desc
      return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async getThreads(
    pageId: string,
    filters?: {
      unreadOnly?: boolean
      ownerCA?: string
      tag?: string
      keyword?: string
      dateFrom?: string
      dateTo?: string
    },
  ): Promise<MockThread[]> {
    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

      let threads = getMockThreads().filter((thread) => thread.pageId === pageId)

      // Apply filters
      if (filters?.unreadOnly) {
        threads = threads.filter((thread) => thread.unread)
      }

      if (filters?.ownerCA) {
        threads = threads.filter((thread) => thread.ownerCA === filters.ownerCA)
      }

      if (filters?.tag) {
        threads = threads.filter((thread) => thread.recentTag === filters.tag)
      }

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase()
        threads = threads.filter(
          (thread) =>
            thread.title?.toLowerCase().includes(keyword) || thread.recentTag?.toLowerCase().includes(keyword),
        )
      }

      if (filters?.dateFrom) {
        threads = threads.filter((thread) => new Date(thread.lastMessageAt) >= new Date(filters.dateFrom!))
      }

      if (filters?.dateTo) {
        threads = threads.filter((thread) => new Date(thread.lastMessageAt) <= new Date(filters.dateTo!))
      }

      // Sort by lastMessageAt desc
      return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async sendMessage(threadId: string, data: { bodyOriginal: string; lang?: string; tag?: string; userId: number }) {
    if (process.env.NEXT_PUBLIC_MESSAGES_USE_MOCK === "true") {
      const threads = getMockThreads()
      const thread = threads.find((t) => t.id === threadId)

      if (!thread) {
        return { success: false, error: "Thread not found" }
      }

      if (thread.sendability === "blocked") {
        return {
          success: false,
          error: "Sending blocked due to policy restrictions",
          sendability: thread.sendability,
        }
      }

      if (thread.sendability === "requires_tag" && !data.tag) {
        return {
          success: false,
          error: "Tag selection required for this message",
          sendability: thread.sendability,
        }
      }

      let appliedTag = data.tag
      if (thread.sendability === "human_agent" && !appliedTag) {
        appliedTag = "HUMAN_AGENT"
      }

      // Create new message
      const newMessage: MockMessage = {
        id: `msg-${Date.now()}`,
        threadId,
        direction: "out",
        bodyOriginal: data.bodyOriginal,
        lang: data.lang || "ja",
        createdAt: new Date().toISOString(),
        appliedTag, // Include applied tag in message
      }

      // Add message to storage
      const messages = getMockMessages()
      messages.push(newMessage)
      saveMockMessages(messages)

      thread.lastMessageAt = new Date().toISOString()
      thread.unread = false
      saveMockThreads(threads)

      await auditLogger.log({
        user_id: data.userId,
        action: "message_send",
        entity_type: "message",
        entity_id: newMessage.id,
        new_values: {
          threadId,
          bodyOriginal: data.bodyOriginal,
          appliedTag,
          sendState: thread.sendability,
        },
      })

      return {
        success: true,
        message: newMessage,
        appliedTag,
        sendability: thread.sendability,
      }
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async markAsRead(threadId: string): Promise<{ success: boolean }> {
    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      const threads = getMockThreads()
      const threadIndex = threads.findIndex((t) => t.id === threadId)

      if (threadIndex !== -1) {
        threads[threadIndex].unread = false
        saveMockThreads(threads)
      }

      return { success: true }
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async getCandidateInfo(candidateId: string) {
    if (this.isMock) {
      const candidates = getMockCandidates()
      return candidates.find((c) => c.id === candidateId) || null
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async getPageInfo(pageId: string): Promise<MockFacebookPage | null> {
    if (this.isMock) {
      return getMockPageById(pageId) || null
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async getSummaryStats(filters?: {
    pages?: string[]
    ownerCA?: string
  }): Promise<{
    unreadCount: number
    todayCount: number
    weekCount: number
  }> {
    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      let threads = getMockThreads()

      // Apply page filter
      if (filters?.pages && filters.pages.length > 0) {
        threads = threads.filter((thread) => filters.pages!.includes(thread.pageId))
      }

      // Apply owner filter
      if (filters?.ownerCA) {
        threads = threads.filter((thread) => thread.ownerCA === filters.ownerCA)
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const unreadCount = threads.filter((thread) => thread.unread).length
      const todayCount = threads.filter((thread) => new Date(thread.lastMessageAt) >= today).length
      const weekCount = threads.filter((thread) => new Date(thread.lastMessageAt) >= weekAgo).length

      return {
        unreadCount,
        todayCount,
        weekCount,
      }
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },

  async simulateIncomingMessage(threadId: string): Promise<{ success: boolean; message?: MockMessage }> {
    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const threads = getMockThreads()
      const thread = threads.find((t) => t.id === threadId)

      if (!thread) {
        return { success: false }
      }

      // Sample incoming messages
      const sampleMessages = [
        "Thank you for your response! I have a few more questions.",
        "Could you please provide more details about the salary?",
        "When would be a good time for an interview?",
        "I'm very interested in this position. 😊",
        "こんにちは！追加の質問があります。",
        "面接の日程について相談したいです。",
      ]

      const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]

      const newMessage: MockMessage = {
        id: `msg-sim-${Date.now()}`,
        threadId,
        direction: "in",
        bodyOriginal: randomMessage,
        lang: randomMessage.includes("こんにちは") || randomMessage.includes("面接") ? "ja" : "en",
        createdAt: new Date().toISOString(),
      }

      // Add message to storage
      const messages = getMockMessages()
      messages.push(newMessage)
      saveMockMessages(messages)

      // Update thread last message time and mark as unread
      const threadIndex = threads.findIndex((t) => t.id === threadId)
      if (threadIndex !== -1) {
        threads[threadIndex].lastMessageAt = newMessage.createdAt
        threads[threadIndex].unread = true
      }
      saveMockThreads(threads)

      return {
        success: true,
        message: newMessage,
      }
    } else {
      // Real API implementation (future)
      throw new Error("Real API not implemented yet")
    }
  },
}

// Storage helpers for localStorage persistence
export const storageHelpers = {
  saveUsers(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("users", JSON.stringify(mockUsers))
    }
  },

  loadUsers(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("users")
      if (stored) {
        mockUsers = JSON.parse(stored)
      }
    }
  },

  saveApplyLinks(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("apply_links", JSON.stringify(mockApplyLinks))
    }
  },

  loadApplyLinks(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("apply_links")
      if (stored) {
        mockApplyLinks = JSON.parse(stored)
      }
    }
  },

  saveFacebookPages(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("facebook_pages", JSON.stringify(mockFacebookPages))
    }
  },

  loadFacebookPages(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("facebook_pages")
      if (stored) {
        mockFacebookPages = JSON.parse(stored)
      }
    }
  },

  saveMessageThreads(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("message_threads", JSON.stringify(mockMessageThreads))
    }
  },

  loadMessageThreads(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("message_threads")
      if (stored) {
        mockMessageThreads = JSON.parse(stored)
      }
    }
  },

  savePendingApplicants(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_applicants", JSON.stringify(mockPendingApplicants))
    }
  },

  loadPendingApplicants(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pending_applicants")
      if (stored) {
        mockPendingApplicants = JSON.parse(stored)
      }
    }
  },

  saveConsentLogs() {
    if (typeof window !== "undefined") {
      localStorage.setItem("mockConsentLogs", JSON.stringify(mockConsentLogs))
    }
  },

  loadConsentLogs() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mockConsentLogs")
      if (stored) {
        mockConsentLogs = JSON.parse(stored)
      }
    }
  },

  saveCandidates() {
    if (typeof window !== "undefined") {
      localStorage.setItem("mockCandidates", JSON.stringify(mockCandidates))
    }
  },

  loadCandidates() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mockCandidates")
      if (stored) {
        mockCandidates = JSON.parse(stored)
      }
    }
  },
}

// Token Monitoring and Notification System
export const tokenMonitoringApi = {
  async checkTokenExpiry(): Promise<TokenMonitoringResult> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const now = new Date()
    const notifications: TokenExpiryNotification[] = []
    const statusUpdates: { pageId: string; oldStatus: string; newStatus: TokenExpiryStatus }[] = []
    let pagesChecked = 0

    for (const page of mockFacebookPages) {
      pagesChecked++

      if (!page.tokenExpiresAt) continue

      const expiresAt = new Date(page.tokenExpiresAt)
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const oldStatus = page.expiryStatus || "connected"
      let newStatus: TokenExpiryStatus

      // Determine new status based on days remaining
      if (daysRemaining <= 0) {
        newStatus = "expired"
      } else if (daysRemaining <= 7) {
        newStatus = "expiring_urgent"
      } else if (daysRemaining <= 15) {
        newStatus = "expiring_soon"
      } else {
        newStatus = "connected"
      }

      // Update page status if changed
      if (oldStatus !== newStatus) {
        page.expiryStatus = newStatus
        page.updatedAt = now.toISOString()
        statusUpdates.push({ pageId: page.pageId, oldStatus, newStatus })

        // Log status change
        await auditLogger.log({
          action: "FACEBOOK_TOKEN_STATUS_CHANGE",
          userId: "system",
          details: {
            pageId: page.pageId,
            pageName: page.name,
            oldStatus,
            newStatus,
            daysRemaining,
            expiresAt: page.tokenExpiresAt,
          },
        })
      }

      // Create notification if needed (avoid duplicates within 24 hours)
      const shouldNotify = this.shouldSendNotification(page, newStatus, now)
      if (
        shouldNotify &&
        (newStatus === "expiring_soon" || newStatus === "expiring_urgent" || newStatus === "expired")
      ) {
        const notification: TokenExpiryNotification = {
          id: `notif-${page.pageId}-${newStatus}-${Date.now()}`,
          pageId: page.pageId,
          pageName: page.name,
          status: newStatus,
          daysRemaining: Math.max(0, daysRemaining),
          createdAt: now.toISOString(),
          read: false,
        }

        notifications.push(notification)
        mockTokenNotifications.push(notification)
        page.lastNotificationSent = now.toISOString()

        // Log notification
        await auditLogger.log({
          action: "FACEBOOK_TOKEN_NOTIFICATION_SENT",
          userId: "system",
          details: {
            pageId: page.pageId,
            pageName: page.name,
            status: newStatus,
            daysRemaining,
            notificationId: notification.id,
          },
        })
      }

      // Update connection status for expired tokens
      if (newStatus === "expired" && page.connected) {
        page.connected = false
        await auditLogger.log({
          action: "FACEBOOK_PAGE_DISCONNECTED",
          userId: "system",
          details: {
            pageId: page.pageId,
            pageName: page.name,
            reason: "token_expired",
          },
        })
      }
    }

    // Save to localStorage
    localStorage.setItem("mockFacebookPages", JSON.stringify(mockFacebookPages))
    localStorage.setItem("mockTokenNotifications", JSON.stringify(mockTokenNotifications))

    return {
      pagesChecked,
      notifications,
      statusUpdates,
    }
  },

  shouldSendNotification(page: FacebookPage, status: TokenExpiryStatus, now: Date): boolean {
    if (!page.lastNotificationSent) return true

    const lastNotification = new Date(page.lastNotificationSent)
    const hoursSinceLastNotification = (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60)

    // Only send one notification per day (24 hours) for the same status
    return hoursSinceLastNotification >= 24
  },

  async getNotifications(userId?: string): Promise<TokenExpiryNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Load from localStorage if available
    const stored = localStorage.getItem("mockTokenNotifications")
    if (stored) {
      mockTokenNotifications = JSON.parse(stored)
    }

    // Filter by user permissions if needed
    if (userId) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user && user.role !== "管理者") {
        // Non-admin users only see notifications for pages they're linked to
        const userPages = mockFacebookPages.filter((page) => page.linkedCAs.includes(userId))
        const userPageIds = userPages.map((page) => page.pageId)
        return mockTokenNotifications.filter((notif) => userPageIds.includes(notif.pageId))
      }
    }

    return mockTokenNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const notification = mockTokenNotifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      localStorage.setItem("mockTokenNotifications", JSON.stringify(mockTokenNotifications))
    }
  },

  async getExpiringPages(userId?: string): Promise<FacebookPage[]> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    let pages = mockFacebookPages.filter(
      (page) => page.expiryStatus && ["expiring_soon", "expiring_urgent", "expired"].includes(page.expiryStatus),
    )

    // Filter by user permissions
    if (userId) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user && user.role !== "管理者") {
        pages = pages.filter((page) => page.linkedCAs.includes(userId))
      }
    }

    return pages
  },

  getDaysUntilExpiry(page: FacebookPage): number {
    if (!page.tokenExpiresAt) return -1

    const now = new Date()
    const expiresAt = new Date(page.tokenExpiresAt)
    return Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  },

  getStatusBadgeInfo(
    status: TokenExpiryStatus,
    daysRemaining: number,
  ): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
    switch (status) {
      case "connected":
        return { text: "Connected", variant: "default" }
      case "expiring_soon":
        return { text: `Expiring (${daysRemaining}d)`, variant: "secondary" }
      case "expiring_urgent":
        return { text: `Expiring (${daysRemaining}d)`, variant: "destructive" }
      case "expired":
        return { text: "Expired", variant: "destructive" }
      default:
        return { text: "Unknown", variant: "outline" }
    }
  },
}

// Pending Applicants API
export const pendingApplicantsApi = {
  async getAll(): Promise<PendingApplicant[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockPendingApplicants]
  },

  async getByUserId(userId: string): Promise<PendingApplicant[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockPendingApplicants.filter((applicant) => applicant.refUserId === userId)
  },

  async getByPageId(pageId: string): Promise<PendingApplicant[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockPendingApplicants.filter((applicant) => applicant.refPageId === pageId)
  },

  async create(data: Omit<PendingApplicant, "id" | "createdAt">): Promise<PendingApplicant> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newApplicant: PendingApplicant = {
      ...data,
      id: `pending-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    mockPendingApplicants.push(newApplicant)
    storageHelpers.savePendingApplicants()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(data.refUserId),
      action: "applicant_create",
      entity_type: "pending_applicant",
      entity_id: newApplicant.id,
      new_values: {
        name: newApplicant.name,
        nationality: newApplicant.nationality,
        refUserId: newApplicant.refUserId,
        refPageId: newApplicant.refPageId,
      },
    })

    return newApplicant
  },

  async update(id: string, data: Partial<PendingApplicant>, updatedBy: string): Promise<PendingApplicant> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = mockPendingApplicants.findIndex((applicant) => applicant.id === id)
    if (index === -1) {
      throw new Error("Pending applicant not found")
    }

    const oldValues = { ...mockPendingApplicants[index] }
    mockPendingApplicants[index] = {
      ...mockPendingApplicants[index],
      ...data,
    }

    storageHelpers.savePendingApplicants()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(updatedBy),
      action: "applicant_update",
      entity_type: "pending_applicant",
      entity_id: id,
      old_values: {
        status: oldValues.status,
      },
      new_values: {
        status: mockPendingApplicants[index].status,
      },
    })

    return mockPendingApplicants[index]
  },

  async delete(id: string, deletedBy: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockPendingApplicants.findIndex((applicant) => applicant.id === id)
    if (index === -1) {
      throw new Error("Pending applicant not found")
    }

    const deletedApplicant = mockPendingApplicants[index]
    mockPendingApplicants.splice(index, 1)
    storageHelpers.savePendingApplicants()

    // Log audit action
    await auditLogger.log({
      user_id: Number.parseInt(deletedBy),
      action: "applicant_delete",
      entity_type: "pending_applicant",
      entity_id: id,
      old_values: {
        name: deletedApplicant.name,
        nationality: deletedApplicant.nationality,
      },
    })
  },
}

// Mock Token Notifications Storage
let mockTokenNotifications: TokenExpiryNotification[] = []

export const consentApi = {
  async sendRequest(
    threadId: string,
    templateId: string,
    userId: string,
    templateContent: string,
  ): Promise<{ success: boolean; log?: ConsentLog; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const thread = mockMessageThreads.find((t) => t.id === threadId)
    if (!thread) {
      return { success: false, error: "Thread not found" }
    }

    const newLog: ConsentLog = {
      id: `consent-${Date.now()}`,
      threadId,
      type: "request",
      at: new Date().toISOString(),
      userId,
      templateId,
      payloadSnapshot: templateContent,
    }

    mockConsentLogs.push(newLog)

    // Update thread with consent request info
    const threadIndex = mockMessageThreads.findIndex((t) => t.id === threadId)
    if (threadIndex !== -1) {
      mockMessageThreads[threadIndex].consentRequestedAt = newLog.at
      mockMessageThreads[threadIndex].consentLastSentBy = userId
    }

    // Add system message to thread
    const systemMessage: Message = {
      id: `msg-system-${Date.now()}`,
      threadId,
      direction: "out",
      bodyOriginal: `同意リクエストを送信（テンプレ：${templateId}） — 実行者：${userId} / ${new Date().toLocaleString("ja-JP")}`,
      lang: "ja",
      createdAt: new Date().toISOString(),
      appliedTag: "SYSTEM",
    }

    mockMessages.push(systemMessage)

    await auditLogger.log({
      user_id: Number.parseInt(userId),
      action: "consent_request",
      entity_type: "message_thread",
      entity_id: threadId,
      new_values: { templateId, requestedAt: newLog.at },
    })

    storageHelpers.saveMessageThreads()
    return { success: true, log: newLog }
  },

  async recordAcquisition(
    threadId: string,
    candidateName: string,
    userId?: string,
  ): Promise<{ success: boolean; log?: ConsentLog; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const thread = mockMessageThreads.find((t) => t.id === threadId)
    if (!thread) {
      return { success: false, error: "Thread not found" }
    }

    const candidate = mockCandidates.find((c) => c.threadId === threadId)
    const now = new Date().toISOString()

    const newLog: ConsentLog = {
      id: `consent-${Date.now()}`,
      threadId,
      type: "acquired",
      at: now,
      userId: userId || "system",
    }

    mockConsentLogs.push(newLog)

    // Update candidate consent timestamp
    if (candidate) {
      candidate.consentAt = now
      candidate.updatedAt = now
    }

    // Add system message to thread
    const systemMessage: Message = {
      id: `msg-system-${Date.now()}`,
      threadId,
      direction: "out",
      bodyOriginal: `同意を取得 — ${candidateName} / ${new Date().toLocaleString("ja-JP")}`,
      lang: "ja",
      createdAt: now,
      appliedTag: "SYSTEM",
    }

    mockMessages.push(systemMessage)

    await auditLogger.log({
      user_id: userId ? Number.parseInt(userId) : 0,
      action: "consent_acquire",
      entity_type: "message_thread",
      entity_id: threadId,
      new_values: { acquiredAt: now, candidateName },
    })

    storageHelpers.saveMessageThreads()
    return { success: true, log: newLog }
  },

  async getHistory(threadId: string): Promise<ConsentLog[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockConsentLogs
      .filter((log) => log.threadId === threadId)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  },

  async getConsentStatus(threadId: string): Promise<{
    status: "not_requested" | "pending" | "acquired"
    requestedAt?: string
    acquiredAt?: string
    lastSentBy?: string
  }> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const thread = mockMessageThreads.find((t) => t.id === threadId)
    const candidate = mockCandidates.find((c) => c.threadId === threadId)

    if (candidate?.consentAt) {
      return {
        status: "acquired",
        acquiredAt: candidate.consentAt,
        requestedAt: thread?.consentRequestedAt,
        lastSentBy: thread?.consentLastSentBy,
      }
    }

    if (thread?.consentRequestedAt) {
      return {
        status: "pending",
        requestedAt: thread.consentRequestedAt,
        lastSentBy: thread.consentLastSentBy,
      }
    }

    return { status: "not_requested" }
  },
}

export const candidatesApi = {
  async getByThreadId(threadId: string): Promise<Candidate | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockCandidates.find((c) => c.threadId === threadId) || null
  },

  async getAll(): Promise<Candidate[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockCandidates]
  },

  async create(data: Omit<Candidate, "id" | "createdAt" | "updatedAt">): Promise<Candidate> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const newCandidate: Candidate = {
      ...data,
      id: `cand-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCandidates.push(newCandidate)
    return newCandidate
  },
}

// Initialize data from localStorage
if (typeof window !== "undefined") {
  storageHelpers.loadUsers()
  storageHelpers.loadFacebookPages()
  storageHelpers.loadMessageThreads()
  storageHelpers.loadApplyLinks()
  storageHelpers.loadPendingApplicants()
  storageHelpers.loadConsentLogs()
  storageHelpers.loadCandidates()

  // Load token notifications from localStorage
  const storedNotifications = localStorage.getItem("mockTokenNotifications")
  if (storedNotifications) {
    mockTokenNotifications = JSON.parse(storedNotifications)
  }
}
