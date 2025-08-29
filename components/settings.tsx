"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Copy,
  RefreshCw,
  Ban,
  Link,
  MessageSquare,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { auditLogger, AUDIT_ACTIONS } from "@/lib/audit-logger"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import FacebookPagesSettings from "@/components/facebook-pages-settings"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usersApi, facebookPagesApi, applyLinksApi, type User, type FacebookPage, type ApplyLink } from "@/lib/api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const accounts = [
  {
    id: 1,
    name: "田中 太郎",
    email: "tanaka@company.com",
    role: "管理者",
    status: "アクティブ",
    avatar: "/placeholder.svg?height=40&width=40",
    lastLogin: "2024-01-15 14:30",
    groups: [1, 3], // 東京営業部、IT専門チーム
    managedCAs: [], // 管理者は全てのCAを管理
  },
  {
    id: 2,
    name: "佐藤 花子",
    email: "sato@company.com",
    role: "CA（管理）",
    status: "アクティブ",
    avatar: "/placeholder.svg?height=40&width=40",
    lastLogin: "2024-01-15 13:45",
    groups: [1, 4], // 東京営業部、多言語対応チーム
    managedCAs: [3, 4], // 管理対象のCA
  },
  {
    id: 3,
    name: "鈴木 一郎",
    email: "suzuki@company.com",
    role: "CA（担当）",
    status: "非アクティブ",
    avatar: "/placeholder.svg?height=40&width=40",
    lastLogin: "2024-01-10 09:20",
    groups: [2], // 大阪営業部
    managedCAs: [], // 担当CAは管理対象なし
  },
  {
    id: 4,
    name: "高橋 美咲",
    email: "takahashi@company.com",
    role: "CA（担当）",
    status: "アクティブ",
    avatar: "/placeholder.svg?height=40&width=40",
    lastLogin: "2024-01-15 11:20",
    groups: [2, 4], // 大阪営業部、多言語対応チーム
    managedCAs: [], // 担当CAは管理対象なし
  },
]

const pageCAAssignments = [
  { pageId: 1, caId: 2 }, // 佐藤 花子 -> GlobalHire Hub Japan
  { pageId: 1, caId: 3 }, // 鈴木 一郎 -> GlobalHire Hub Japan
  { pageId: 1, caId: 4 }, // 高橋 美咲 -> GlobalHire Hub Japan
  { pageId: 2, caId: 2 }, // 佐藤 花子 -> GlobalHire Hub Korea
  { pageId: 2, caId: 4 }, // 高橋 美咲 -> GlobalHire Hub Korea
]

const templates = [
  {
    id: 1,
    name: "初回挨拶",
    content: "こんにちは！人材紹介サービスの田中です。お仕事探しのお手伝いをさせていただきます。",
    category: "挨拶",
    createdBy: "田中 太郎",
  },
  {
    id: 2,
    name: "求人紹介",
    content: "ご希望に合う求人をご紹介いたします。詳細をご確認ください。",
    category: "求人",
    createdBy: "佐藤 花子",
  },
  {
    id: 3,
    name: "面接調整",
    content: "面接の日程調整についてご連絡いたします。ご都合の良い日時をお教えください。",
    category: "面接",
    createdBy: "田中 太郎",
  },
]

const facebookAccounts = [
  {
    id: 1,
    userId: 1,
    userName: "田中 太郎",
    facebookName: "GlobalHire Hub Japan",
    status: "connected",
    avatar: "/placeholder.svg?height=40&width=40",
    connectedAt: "2024-01-15 14:30",
    lastSync: "2024-01-15 14:25:00",
    messageCount: 156,
    profileUrl: "https://facebook.com/globalhire-japan",
  },
  {
    id: 2,
    userId: 2,
    userName: "佐藤 花子",
    facebookName: "GlobalHire Hub Korea",
    status: "connected",
    avatar: "/placeholder.svg?height=40&width=40",
    connectedAt: "2024-01-15 13:45",
    lastSync: "2024-01-15 13:40:00",
    messageCount: 89,
    profileUrl: "https://facebook.com/globalhire-korea",
  },
  {
    id: 3,
    userId: 3,
    userName: "鈴木 一郎",
    facebookName: "GlobalHire Hub Philippines",
    status: "disconnected",
    avatar: "/placeholder.svg?height=40&width=40",
    connectedAt: null,
    lastSync: null,
    messageCount: 0,
    profileUrl: "https://facebook.com/globalhire-philippines",
  },
]

const uiRoleToInternal = (v: string) =>
  v === "admin"
    ? "admin"
    : v === "ca-manager"
      ? "ca_manager"
      : v === "ca-staff"
        ? "ca"
        : v === "ra-manager"
          ? "ra_manager"
          : v === "ra-staff"
            ? "ra"
            : v === "dual"
              ? "dual"
              : v

const internalToDisplayJa = (r: string) =>
  r === "admin"
    ? "管理者"
    : r === "ca_manager"
      ? "CA（管理）"
      : r === "ca"
        ? "CA（担当）"
        : r === "ra_manager"
          ? "RA（管理）"
          : r === "ra"
            ? "RA（担当）"
            : r === "dual"
              ? "両面"
              : r

// Mock users data
const mockUsers = [
  { id: 1, name: "田中 太郎", email: "tanaka@company.com", role: "admin" },
  { id: 2, name: "佐藤 花子", email: "sato@company.com", role: "ca_manager" },
  { id: 3, name: "鈴木 一郎", email: "suzuki@company.com", role: "ca" },
  { id: 4, name: "高橋 美咲", email: "takahashi@company.com", role: "ca" },
  { id: 5, name: "渡辺 健太", email: "watanabe@company.com", role: "ra_manager" },
  { id: 6, name: "伊藤 さゆり", email: "ito@company.com", role: "ra" },
  { id: 7, name: "小林 明", email: "kobayashi@company.com", role: "dual" },
]

const normalizeRole = (role: string) => {
  if (role === "管理者") return "admin"
  if (role === "CA（管理）") return "ca_manager"
  if (role === "CA（担当）") return "ca"
  if (role === "RA（管理）") return "ra_manager"
  if (role === "RA（担当）") return "ra"
  return role
}

const getAvailableRAs = () => {
  return mockUsers.filter((user) => user.role === "ra")
}

const getSubordinateCounts = (userId: number) => {
  try {
    const caMap = JSON.parse(localStorage.getItem("mgr_map_ca") || "{}")
    const raMap = JSON.parse(localStorage.getItem("mgr_map_ra") || "{}")
    const caCount = caMap[userId]?.length || 0
    const raCount = raMap[userId]?.length || 0
    return { caCount, raCount }
  } catch {
    return { caCount: 0, raCount: 0 }
  }
}

const saveSubordinateMapping = (managerId: number, role: string, subordinateIds: number[]) => {
  try {
    if (role === "ca-manager") {
      const caMap = JSON.parse(localStorage.getItem("mgr_map_ca") || "{}")
      caMap[managerId] = subordinateIds
      localStorage.setItem("mgr_map_ca", JSON.stringify(caMap))
    } else if (role === "ra-manager") {
      const raMap = JSON.parse(localStorage.getItem("mgr_map_ra") || "{}")
      raMap[managerId] = subordinateIds
      localStorage.setItem("mgr_map_ra", JSON.stringify(raMap))
    }
  } catch (error) {
    console.error("Failed to save subordinate mapping:", error)
  }
}

const loadSubordinateMapping = (managerId: number, role: string) => {
  try {
    if (role === "ca-manager") {
      const caMap = JSON.parse(localStorage.getItem("mgr_map_ca") || "{}")
      return caMap[managerId] || []
    } else if (role === "ra-manager") {
      const raMap = JSON.parse(localStorage.getItem("mgr_map_ra") || "{}")
      return raMap[managerId] || []
    }
    return []
  } catch {
    return []
  }
}

export function Settings() {
  const { user: currentUser } = useAuth()

  const isAdminRole = (role: string | undefined): boolean => {
    if (!role) return false
    const normalizedRole = role.toLowerCase().trim()
    return normalizedRole === "admin" || normalizedRole === "管理者" || normalizedRole === "administrator"
  }

  const isAdmin = isAdminRole(currentUser?.role)
  const roleNormalized = currentUser?.roleNormalized || "ca"

  // State variables
  const [users, setUsers] = useState<User[]>([])
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states for add user
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<User["role"]>("CA")
  const [newUserPages, setNewUserPages] = useState<string[]>([])
  const [newUserPassword, setNewUserPassword] = useState("")

  // Form states for edit user
  const [editUserName, setEditUserName] = useState("")
  const [editUserEmail, setEditUserEmail] = useState("")
  const [editUserRole, setEditUserRole] = useState<User["role"]>("CA")
  const [editUserPages, setEditUserPages] = useState<string[]>([])
  const [editUserStatus, setEditUserStatus] = useState<"active" | "inactive">("active")
  const [editUserApplyLinkEnabled, setEditUserApplyLinkEnabled] = useState(false)
  const [resetPassword, setResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  const [newAccountManagedRAs, setNewAccountManagedRAs] = useState<number[]>([])
  const [newAccountManagedCAs, setNewAccountManagedCAs] = useState<number[]>([])
  const [selectedManagedRAs, setSelectedManagedRAs] = useState<number[]>([])
  const [selectedManagedCAs, setSelectedManagedCAs] = useState<number[]>([])
  const [raSearchQuery, setRaSearchQuery] = useState("")
  const [caSearchQuery, setCaSearchQuery] = useState("")
  const [editingAccount, setEditingAccount] = useState<any | null>(null)
  const [editAccountRole, setEditAccountRole] = useState<string>("ca-staff")
  const [newAccountRole, setNewAccountRole] = useState<string>("CA")

  // Other state variables
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false)
  const [isConnectFacebookOpen, setIsConnectFacebookOpen] = useState(false)
  const [availablePages, setAvailablePages] = useState<any[]>([])
  const [isPageOAuthOpen, setIsPageOAuthOpen] = useState(false)
  const [isCAAssignmentOpen, setIsCAAssignmentOpen] = useState(false)
  const [selectedPageForCA, setSelectedPageForCA] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([])
  const [selectedCAIds, setSelectedCAIds] = useState<number[]>([])
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isActivatingPages, setIsActivatingPages] = useState(false)
  const [activationProgress, setActivationProgress] = useState(0)
  const [currentPageCAAssignments, setCurrentPageCAAssignments] = useState(pageCAAssignments)

  const [applyBaseUrl, setApplyBaseUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("apply_base_url") || ""
    }
    return ""
  })

  const [notifyPrefs, setNotifyPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notify_prefs")
      return stored ? JSON.parse(stored) : { popupEnabled: true }
    }
    return { popupEnabled: true }
  })

  const [applyLinks, setApplyLinks] = useState<ApplyLink[]>([])
  const [isApplyLinksLoading, setIsApplyLinksLoading] = useState(false)
  const [showApplyLinkModal, setShowApplyLinkModal] = useState(false)
  const [editingApplyLink, setEditingApplyLink] = useState<ApplyLink | null>(null)
  const [newApplyLinkUserId, setNewApplyLinkUserId] = useState("")
  const [newApplyLinkPageId, setNewApplyLinkPageId] = useState("")
  const [newApplyLinkExpiresAt, setNewApplyLinkExpiresAt] = useState("")
  const [newApplyLinkEnabled, setNewApplyLinkEnabled] = useState(true)

  const loadMyApplyLinks = async () => {
    try {
      const links = await applyLinksApi.getByUserId(currentUser?.id || "")
      setMyApplyLinks(links)
    } catch (error) {
      console.error("Failed to load my apply links:", error)
    }
  }

  const handleCopyLink = async (token: string) => {
    try {
      const url = `${window.location.origin}/apply/${token}`
      await navigator.clipboard.writeText(url)
      toast({
        title: "コピーしました",
        description: "リンクをクリップボードにコピーしました。",
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "コピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleCopyLinkWithText = async (token: string) => {
    try {
      const url = `${window.location.origin}/apply/${token}`
      const text = `こちらから法人ページにメッセージをお願いします。お手数ですが「こんにちは」等で一言送ってください。 ${url}`
      await navigator.clipboard.writeText(text)
      toast({
        title: "文章つきでコピーしました",
        description: "定型文とリンクをクリップボードにコピーしました。",
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "コピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  const loadApplyLinks = async () => {
    try {
      setIsApplyLinksLoading(true)
      const applyLinksData = await applyLinksApi.getAll()
      setApplyLinks(applyLinksData)
    } catch (error) {
      console.error("Failed to load apply links:", error)
      toast({
        title: "エラー",
        description: "応募リンクの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsApplyLinksLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadFacebookPages()
    loadApplyLinks() // Load apply links on component mount
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadMyApplyLinks()
    }
  }, [currentUser])

  useEffect(() => {
    const loadFacebookPages = async () => {
      try {
        const pages = await facebookPagesApi.getAll()
        setFacebookPages(pages)
      } catch (error) {
        console.error("Failed to load Facebook pages:", error)
      }
    }

    loadFacebookPages()

    // Listen for page connection events
    const handlePageUpdate = () => {
      loadFacebookPages()
    }

    window.addEventListener("facebook-page-updated", handlePageUpdate)
    return () => window.removeEventListener("facebook-page-updated", handlePageUpdate)
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const userData = await usersApi.getAll()
      setUsers(userData)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "エラー",
        description: "ユーザー情報の読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadFacebookPages = async () => {
    try {
      const pagesData = await facebookPagesApi.getAll()
      setFacebookPages(pagesData)
    } catch (error) {
      console.error("Failed to load Facebook pages:", error)
    }
  }

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await usersApi.create({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        pages: newUserPages,
        applyLinkEnabled: ["CA", "CA管理", "両面"].includes(newUserRole),
        status: "active",
      })

      // Reset form
      setNewUserName("")
      setNewUserEmail("")
      setNewUserRole("CA")
      setNewUserPages([])
      setNewUserPassword("")
      setIsAddAccountOpen(false)

      // Reload users
      await loadUsers()

      toast({
        title: "成功",
        description: "ユーザーを追加しました",
      })
    } catch (error) {
      console.error("Failed to create user:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "ユーザーの追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (userData: User) => {
    setEditingUser(userData)
    setEditUserName(userData.name)
    setEditUserEmail(userData.email)
    setEditUserRole(userData.role)
    setEditUserPages(userData.pages)
    setEditUserStatus(userData.status)
    setEditUserApplyLinkEnabled(userData.applyLinkEnabled)
    setResetPassword(false)
    setNewPassword("")
    setIsEditAccountOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserName || !editUserEmail) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      await usersApi.update(
        editingUser.id,
        {
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          pages: editUserPages,
          status: editUserStatus,
          applyLinkEnabled: editUserApplyLinkEnabled,
        },
        currentUser?.id || "",
      )

      // Handle password reset if requested
      if (resetPassword && newPassword) {
        await usersApi.resetPassword(editingUser.id, newPassword, currentUser?.id || "")
      }

      setIsEditAccountOpen(false)
      setEditingUser(null)

      // Reload users
      await loadUsers()

      toast({
        title: "成功",
        description: "ユーザー情報を更新しました",
      })
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "ユーザーの更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = (userData: User) => {
    setDeletingUser(userData)
    setIsDeleteAccountOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return

    try {
      setIsLoading(true)
      await usersApi.delete(deletingUser.id, currentUser?.id || "")

      setIsDeleteAccountOpen(false)
      setDeletingUser(null)

      // Reload users
      await loadUsers()

      toast({
        title: "成功",
        description: "ユーザーを削除しました",
      })
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "ユーザーの削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAssignedPagesCount = (userData: User) => {
    return userData.pages.length
  }

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "管理者":
        return "default"
      case "CA管理":
      case "RA管理":
        return "secondary"
      case "両面":
        return "outline"
      default:
        return "outline"
    }
  }

  const validateUrl = (url: string) => /^https?:\/\/\S+$/.test(url)
  const validateRef = (ref: string) => /^[A-Za-z0-9_-]+$/.test(ref) && ref.length > 0

  const handleSaveBaseUrl = () => {
    if (!validateUrl(applyBaseUrl)) {
      toast("有効なURLを入力してください（https://から始まる）")
      return
    }
    localStorage.setItem("apply_base_url", applyBaseUrl)
    toast("ベースURLを保存しました")
  }

  const handleRefChange = (caId: string, ref: string) => {
    if (!validateRef(ref)) {
      toast("REFコードは英数字、ハイフン、アンダースコアのみ使用可能です")
      return
    }
    const newApplyLinks = { ...applyLinks, [caId]: { ref } }
    setApplyLinks(newApplyLinks)
    localStorage.setItem("apply_links", JSON.stringify(newApplyLinks))
  }

  const generateApplyLink = (ref: string) => {
    if (!applyBaseUrl || !ref) return ""
    return `${applyBaseUrl}?ref=${ref}`
  }

  const caUsers = mockUsers.filter((user) => ["ca", "ca_manager", "dual"].includes(normalizeRole(user.role)))

  const getAssignedCAsForPage = (pageId: number) => {
    return currentPageCAAssignments
      .filter((assignment) => assignment.pageId === pageId)
      .map((assignment) => assignment.caId)
  }

  const getAssignedPagesForCA = (caId: number) => {
    return currentPageCAAssignments
      .filter((assignment) => assignment.caId === caId)
      .map((assignment) => assignment.pageId)
  }

  const updatePageCAAssignments = (pageId: number, caIds: number[]) => {
    // Remove existing assignments for this page
    const filteredAssignments = currentPageCAAssignments.filter((assignment) => assignment.pageId !== pageId)

    // Add new assignments
    const newAssignments = caIds.map((caId) => ({ pageId, caId }))

    setCurrentPageCAAssignments([...filteredAssignments, ...newAssignments])
  }

  const handleFacebookConnect = (userId: number) => {
    setSelectedUser(userId)
    setIsConnectFacebookOpen(true)
  }

  const handleFacebookDisconnect = (accountId: number) => {
    if (currentUser) {
      auditLogger.logUserAction(currentUser.id, AUDIT_ACTIONS.FACEBOOK_PAGE_DISCONNECT, {
        disconnected_account_id: accountId,
      })
    }
    console.log("Facebook連携を解除:", accountId)
  }

  const handleNewAccountRoleChange = (role: string) => {
    setNewAccountRole(role)
    // CA管理・RA管理 以外なら配下選択をクリア
    if (role !== "ca-manager") {
      setNewAccountManagedCAs([])
    }
    if (role !== "ra-manager") {
      setNewAccountManagedRAs([])
    }
  }

  const getFilteredRAs = () => {
    const availableRAs = getAvailableRAs()
    if (!raSearchQuery) return availableRAs
    return availableRAs.filter(
      (ra) =>
        ra.name.toLowerCase().includes(raSearchQuery.toLowerCase()) ||
        ra.email.toLowerCase().includes(raSearchQuery.toLowerCase()),
    )
  }

  const handleEditAccount = (account: any) => {
    setEditingAccount(account)
    const normalizedRole = normalizeRole(account.role)
    setEditAccountRole(
      normalizedRole === "admin"
        ? "admin"
        : normalizedRole === "ca_manager"
          ? "ca-manager"
          : normalizedRole === "ca"
            ? "ca-staff"
            : normalizedRole === "ra_manager"
              ? "ra-manager"
              : normalizedRole === "ra"
                ? "ra-staff"
                : normalizedRole === "dual"
                  ? "dual"
                  : "ca-staff",
    )

    // Load existing subordinate mappings
    if (normalizedRole === "ca_manager") {
      setSelectedManagedCAs(loadSubordinateMapping(account.id, "ca-manager"))
    } else if (normalizedRole === "ra_manager") {
      setSelectedManagedRAs(loadSubordinateMapping(account.id, "ra-manager"))
    }

    setIsEditAccountOpen(true)
  }

  const getAvailableCAs = () => {
    return accounts.filter((account) => account.role === "CA（担当）")
  }

  const getFilteredCAs = () => {
    const availableCAs = getAvailableCAs()
    if (!caSearchQuery) return availableCAs
    return availableCAs.filter(
      (ca) =>
        ca.name.toLowerCase().includes(caSearchQuery.toLowerCase()) ||
        ca.email.toLowerCase().includes(caSearchQuery.toLowerCase()),
    )
  }

  const handlePageOAuth = async () => {
    console.log("Starting Facebook OAuth for pages...")
    setIsAuthenticating(true)
    setAuthError(null)

    if (currentUser) {
      auditLogger.logFacebookPageAction(currentUser.id, AUDIT_ACTIONS.FACEBOOK_PAGE_CONNECT, "oauth_start", {
        oauth_initiated: true,
      })
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call delay

      // Simulate potential authentication failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Facebook認証に失敗しました。再度お試しください。")
      }

      // Simulate OAuth response with available pages
      const mockPages = [
        { id: "123456789012345", name: "GlobalHire Hub Japan", picture: "/placeholder.svg?height=60&width=60" },
        { id: "234567890123456", name: "GlobalHire Hub Korea", picture: "/placeholder.svg?height=60&width=60" },
        { id: "345678901234567", name: "GlobalHire Hub Philippines", picture: "/placeholder.svg?height=60&width=60" },
        { id: "456789012345678", name: "GlobalHire Hub Vietnam", picture: "/placeholder.svg?height=60&width=60" },
      ]

      setAvailablePages(mockPages)
      setSelectedPageIds([])
      setIsPageOAuthOpen(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "認証エラーが発生しました")
      console.error("OAuth error:", error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handlePageActivation = async (pageIds: string[]) => {
    if (pageIds.length === 0) return

    setIsActivatingPages(true)
    setActivationProgress(0)

    try {
      for (let i = 0; i < pageIds.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate per-page activation delay
        setActivationProgress(((i + 1) / pageIds.length) * 100)
      }

      if (currentUser) {
        auditLogger.logFacebookPageAction(currentUser.id, AUDIT_ACTIONS.FACEBOOK_PAGE_CONNECT, "multiple", {
          activated_pages: pageIds,
          page_count: pageIds.length,
        })
      }

      console.log("Successfully activated pages:", pageIds)

      // Close dialog and reset state
      setIsPageOAuthOpen(false)
      setAvailablePages([])
      setSelectedPageIds([])
      setActivationProgress(0)
    } catch (error) {
      console.error("Page activation error:", pageIds, error)
      setAuthError("ページの有効化に失敗しました")
    } finally {
      setIsActivatingPages(false)
    }
  }

  const handlePageSync = async (pageId: number) => {
    if (currentUser) {
      auditLogger.logFacebookPageAction(currentUser.id, AUDIT_ACTIONS.FACEBOOK_PAGE_SYNC, pageId, {
        sync_initiated: true,
      })
    }

    console.log("Starting sync for page:", pageId)

    try {
      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Sync completed for page:", pageId)
    } catch (error) {
      console.error("Sync failed for page:", pageId, error)
    }
  }

  const handlePageDisconnect = async (pageId: number) => {
    if (currentUser) {
      auditLogger.logFacebookPageAction(currentUser.id, AUDIT_ACTIONS.FACEBOOK_PAGE_DISCONNECT, pageId, {
        disconnect_reason: "manual",
      })
    }

    console.log("Disconnecting page:", pageId)

    try {
      // Simulate disconnect process
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Successfully disconnected page:", pageId)
    } catch (error) {
      console.error("Failed to disconnect page:", pageId, error)
    }
  }

  const handleCAAssignment = (page: any) => {
    setSelectedPageForCA(page)
    const currentAssignments = getAssignedCAsForPage(page.id)
    setSelectedCAIds(currentAssignments)
    setIsCAAssignmentOpen(true)
  }

  const handleSaveCAAssignments = () => {
    if (!selectedPageForCA) return

    // Update the assignments
    updatePageCAAssignments(selectedPageForCA.id, selectedCAIds)

    // Log the action
    if (currentUser) {
      auditLogger.logFacebookPageAction(currentUser.id, AUDIT_ACTIONS.FACEBOOK_PAGE_CA_ASSIGN, selectedPageForCA.id, {
        page_name: selectedPageForCA.page_name,
        assigned_cas: selectedCAIds,
        ca_count: selectedCAIds.length,
        previous_assignments: getAssignedCAsForPage(selectedPageForCA.id),
      })
    }

    console.log("CA assignment updated for page:", selectedPageForCA.id, "CAs:", selectedCAIds)

    // Close dialog and reset state
    setIsCAAssignmentOpen(false)
    setSelectedCAIds([])
    setSelectedPageForCA(null)
  }

  const handleSaveNotifyPrefs = () => {
    localStorage.setItem("notify_prefs", JSON.stringify(notifyPrefs))
    toast({
      title: "保存しました",
      description: "通知設定を保存しました",
    })
  }

  const handleCreateApplyLink = async () => {
    if (!newApplyLinkUserId || !newApplyLinkPageId) {
      toast({
        title: "エラー",
        description: "ユーザーとページを選択してください",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate (userId, pageId) combination
    const existingLink = applyLinks.find(
      (link) => link.userId === newApplyLinkUserId && link.pageId === newApplyLinkPageId,
    )
    if (existingLink) {
      toast({
        title: "エラー",
        description: "このユーザーとページの組み合わせは既に存在します",
        variant: "destructive",
      })
      return
    }

    try {
      const newLink = await applyLinksApi.create({
        userId: newApplyLinkUserId,
        pageId: newApplyLinkPageId,
        enabled: newApplyLinkEnabled,
        expiresAt: newApplyLinkExpiresAt || undefined,
      })

      setApplyLinks([...applyLinks, newLink])
      setShowApplyLinkModal(false)
      setNewApplyLinkUserId("")
      setNewApplyLinkPageId("")
      setNewApplyLinkExpiresAt("")
      setNewApplyLinkEnabled(true)

      toast({
        title: "成功",
        description: "応募リンクを作成しました",
      })
    } catch (error) {
      console.error("Failed to create apply link:", error)
      toast({
        title: "エラー",
        description: "応募リンクの作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleUpdateApplyLink = async () => {
    if (!editingApplyLink) return

    try {
      const updatedLink = await applyLinksApi.update(
        editingApplyLink.id,
        {
          enabled: newApplyLinkEnabled,
          expiresAt: newApplyLinkExpiresAt || undefined,
        },
        currentUser?.id || "1",
      )

      setApplyLinks(applyLinks.map((link) => (link.id === editingApplyLink.id ? updatedLink : link)))
      setShowApplyLinkModal(false)
      setEditingApplyLink(null)

      toast({
        title: "成功",
        description: "応募リンクを更新しました",
      })
    } catch (error) {
      console.error("Failed to update apply link:", error)
      toast({
        title: "エラー",
        description: "応募リンクの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleDeleteApplyLink = async (linkId: string) => {
    if (!confirm("この応募リンクを削除しますか？")) return

    try {
      await applyLinksApi.delete(linkId, currentUser?.id || "1")
      setApplyLinks(applyLinks.filter((link) => link.id !== linkId))

      toast({
        title: "成功",
        description: "応募リンクを削除しました",
      })
    } catch (error) {
      console.error("Failed to delete apply link:", error)
      toast({
        title: "エラー",
        description: "応募リンクの削除に失敗しました",
      })
    }
  }

  const handleRegenerateToken = async (linkId: string) => {
    if (!confirm("トークンを再生成しますか？既存のリンクは無効になります。")) return

    try {
      const updatedLink = await applyLinksApi.regenerateToken(linkId, currentUser?.id || "1")
      setApplyLinks(applyLinks.map((link) => (link.id === linkId ? updatedLink : link)))

      toast({
        title: "成功",
        description: "トークンを再生成しました",
      })
    } catch (error) {
      console.error("Failed to regenerate token:", error)
      toast({
        title: "エラー",
        description: "トークンの再生成に失敗しました",
      })
    }
  }

  const openEditModal = (link: ApplyLink) => {
    setEditingApplyLink(link)
    setNewApplyLinkUserId(link.userId)
    setNewApplyLinkPageId(link.pageId)
    setNewApplyLinkEnabled(link.enabled)
    setNewApplyLinkExpiresAt(link.expiresAt || "")
    setShowApplyLinkModal(true)
  }

  const openCreateModal = () => {
    setEditingApplyLink(null)
    setNewApplyLinkUserId("")
    setNewApplyLinkPageId("")
    setNewApplyLinkEnabled(true)
    setNewApplyLinkExpiresAt("")
    setShowApplyLinkModal(true)
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : "不明なユーザー"
  }

  const getPageName = (pageId: string) => {
    const page = facebookPages.find((p) => p.pageId === pageId)
    return page ? page.name : "不明なページ"
  }

  const isLinkExpired = (link: ApplyLink) => {
    return link.expiresAt && new Date(link.expiresAt) < new Date()
  }

  const getFilteredApplyLinks = () => {
    if (roleNormalized === "admin") {
      return applyLinks
    } else if (["ca", "ca_manager", "dual"].includes(roleNormalized)) {
      // CAs can only see their own links
      return applyLinks.filter((link) => link.userId === currentUser?.id)
    } else {
      // RAs cannot see apply links
      return []
    }
  }

  // 管理者判定を改善
  const canManageApplyLinks = isAdminRole(currentUser?.role) || roleNormalized === "admin"
  const canViewApplyLinks =
    ["admin", "ca", "ca_manager", "dual"].includes(roleNormalized) || isAdminRole(currentUser?.role)

  const [myApplyLinks, setMyApplyLinks] = useState<any[]>([])
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    if (currentUser) {
      loadMyApplyLinks()
    }
  }, [currentUser])

  // Apply Links Management
  const [applyLinkSearchTerm, setApplyLinkSearchTerm] = useState("")
  const [applyLinkStatusFilter, setApplyLinkStatusFilter] = useState("all")
  const [applyLinkPageFilter, setApplyLinkPageFilter] = useState("all")
  const [selectedApplyLinks, setSelectedApplyLinks] = useState<string[]>([])
  const [showBulkExpiryModal, setShowBulkExpiryModal] = useState(false)
  const [newBulkExpiryDate, setNewBulkExpiryDate] = useState("")
  const [selectedAssignUser, setSelectedAssignUser] = useState<string | null>(null)

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "コピーしました",
        description: successMessage,
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "コピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleBulkDisableApplyLinks = async () => {
    if (selectedApplyLinks.length === 0) return

    if (!confirm("選択した接続リンクを一括で失効しますか？")) return

    try {
      await Promise.all(
        selectedApplyLinks.map(async (linkId) => {
          await applyLinksApi.update(linkId, { enabled: false }, currentUser?.id || "1")
        }),
      )

      // Optimistically update the state
      setApplyLinks((prevLinks) =>
        prevLinks.map((link) => (selectedApplyLinks.includes(link.id) ? { ...link, enabled: false } : link)),
      )

      setSelectedApplyLinks([])
      toast({
        title: "成功",
        description: "選択した接続リンクを失効しました",
      })
    } catch (error) {
      console.error("Failed to bulk disable apply links:", error)
      toast({
        title: "エラー",
        description: "接続リンクの一括失効に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleBulkRegenerateForUser = async (userId: string) => {
    if (!confirm("このユーザーの全ての接続リンクを再発行しますか？")) return

    try {
      const userLinks = applyLinks.filter((link) => link.userId === userId)
      await Promise.all(
        userLinks.map(async (link) => {
          await applyLinksApi.regenerateToken(link.id, currentUser?.id || "1")
        }),
      )

      // Optimistically update the state
      setApplyLinks((prevLinks) =>
        prevLinks.map((link) => (userLinks.find((userLink) => userLink.id === link.id) ? { ...link } : link)),
      )

      toast({
        title: "成功",
        description: "接続リンクを再発行しました",
      })
    } catch (error) {
      console.error("Failed to bulk regenerate apply links:", error)
      toast({
        title: "エラー",
        description: "接続リンクの一括再発行に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleBulkDisableForUser = async (userId: string) => {
    if (!confirm("このユーザーの全ての接続リンクを失効しますか？")) return

    try {
      const userLinks = applyLinks.filter((link) => link.userId === userId)
      await Promise.all(
        userLinks.map(async (link) => {
          await applyLinksApi.update(link.id, { enabled: false }, currentUser?.id || "1")
        }),
      )

      // Optimistically update the state
      setApplyLinks((prevLinks) =>
        prevLinks.map((link) =>
          userLinks.find((userLink) => userLink.id === link.id) ? { ...link, enabled: false } : link,
        ),
      )

      toast({
        title: "成功",
        description: "接続リンクを失効しました",
      })
    } catch (error) {
      console.error("Failed to bulk disable apply links:", error)
      toast({
        title: "エラー",
        description: "接続リンクの一括失効に失敗しました",
        variant: "destructive",
      })
    }
  }

  const openCreateModalForUser = (userId: string) => {
    setNewApplyLinkUserId(userId)
    setEditingApplyLink(null)
    setNewApplyLinkPageId("")
    setNewApplyLinkEnabled(true)
    setNewApplyLinkExpiresAt("")
    setShowApplyLinkModal(true)
  }

  const filteredApplyLinks = applyLinks.filter((link) => {
    const searchTerm = applyLinkSearchTerm.toLowerCase()
    const page = facebookPages.find((p) => p.pageId === link.pageId)
    const user = users.find((u) => u.id === link.userId)

    const matchesSearchTerm =
      page?.name.toLowerCase().includes(searchTerm) || user?.name.toLowerCase().includes(searchTerm)

    const matchesStatus =
      applyLinkStatusFilter === "all" ||
      (applyLinkStatusFilter === "active" &&
        link.enabled &&
        (!link.expiresAt || new Date(link.expiresAt) > new Date())) ||
      (applyLinkStatusFilter === "expired" && link.expiresAt && new Date(link.expiresAt) < new Date()) ||
      (applyLinkStatusFilter === "disabled" && !link.enabled)

    const matchesPage = applyLinkPageFilter === "all" || link.pageId === applyLinkPageFilter

    return matchesSearchTerm && matchesStatus && matchesPage
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">システムの設定を管理します</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="templates">テンプレート管理</TabsTrigger>
          <TabsTrigger value="accounts">アカウント管理</TabsTrigger>
          <TabsTrigger value="facebook-pages">Facebookページ連携</TabsTrigger>
          <TabsTrigger value="audit-logs">監査ログ</TabsTrigger>
          <TabsTrigger value="apply-links">法人ページ接続リンク管理</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          {(roleNormalized === "ca" || roleNormalized === "ca_manager" || roleNormalized === "dual") && (
            <TabsTrigger value="profile">個人設定</TabsTrigger>
          )}
        </TabsList>

        {/* ... existing templates tab ... */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>テンプレート管理</CardTitle>
                  <CardDescription>メッセージテンプレートの作成・編集・削除</CardDescription>
                </div>
                <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      テンプレート追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>新しいテンプレートを追加</DialogTitle>
                      <DialogDescription>新しいメッセージテンプレートを作成します。</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="template-name" className="text-right">
                          テンプレート名
                        </Label>
                        <Input id="template-name" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="template-category" className="text-right">
                          カテゴリ
                        </Label>
                        <Select>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="greeting">挨拶</SelectItem>
                            <SelectItem value="job">求人</SelectItem>
                            <SelectItem value="interview">面接</SelectItem>
                            <SelectItem value="follow-up">フォローアップ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="template-content" className="text-right mt-2">
                          内容
                        </Label>
                        <Textarea
                          id="template-content"
                          className="col-span-3 min-h-[100px]"
                          placeholder="テンプレートの内容を入力してください..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">追加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>テンプレート名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>作成者</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{template.createdBy}</TableCell>
                      <TableCell className="max-w-xs truncate">{template.content}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">個人設定</h2>
            <p className="text-muted-foreground">個人の設定を管理します</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                法人ページDM誘導リンク
              </CardTitle>
              <CardDescription>自分に割り当てられた法人ページ接続リンクの管理</CardDescription>
            </CardHeader>
            <CardContent>
              {getFilteredApplyLinks().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-2">割り当てられたリンクがありません</p>
                  <p className="text-xs">管理者にリンクの発行を依頼してください</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredApplyLinks().map((link) => {
                    const isExpired = isLinkExpired(link)

                    return (
                      <div key={link.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{getPageName(link.pageId)}</h4>
                            <Badge variant={isExpired ? "destructive" : "outline"} className="text-xs">
                              {isExpired ? "期限切れ" : "有効"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            期限: {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString("ja-JP") : "無期限"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                            {window.location.origin}/apply/{link.token}
                          </code>
                        </div>

                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyLink(link.token)}
                                  disabled={isExpired}
                                  className="bg-transparent"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  コピー
                                </Button>
                              </TooltipTrigger>
                              {isExpired && (
                                <TooltipContent>
                                  <p>期限切れのためコピー不可</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyLinkWithText(link.token)}
                                  disabled={isExpired}
                                  className="bg-transparent"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  文章つきでコピー
                                </Button>
                              </TooltipTrigger>
                              {isExpired && (
                                <TooltipContent>
                                  <p>期限切れのためコピー不可</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      アカウント管理
                    </CardTitle>
                    <CardDescription>ユーザーアカウントと権限、担当Facebookページの管理</CardDescription>
                  </div>
                  <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="account-add">
                        <Plus className="h-4 w-4 mr-2" />
                        ユーザーを追加
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>新しいユーザーを追加</DialogTitle>
                        <DialogDescription>新しいユーザーアカウントを作成します。</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-[160px,1fr] gap-x-6 gap-y-6 py-4 sm:grid-cols-1 sm:gap-y-4">
                        <Label
                          htmlFor="user-name"
                          className="mt-2 text-sm font-medium text-foreground flex items-center"
                        >
                          氏名
                          <span className="ml-1 text-destructive" aria-hidden="true">
                            *
                          </span>
                          <span className="sr-only">（必須）</span>
                        </Label>
                        <Input
                          id="user-name"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          className="h-10"
                          placeholder="田中 太郎"
                          required
                          aria-invalid={!newUserName && "true"}
                        />

                        <Label
                          htmlFor="user-email"
                          className="mt-2 text-sm font-medium text-foreground flex items-center"
                        >
                          メールアドレス
                          <span className="ml-1 text-destructive" aria-hidden="true">
                            *
                          </span>
                          <span className="sr-only">（必須）</span>
                        </Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="h-10"
                          placeholder="example@company.com"
                          required
                          aria-invalid={!newUserEmail && "true"}
                        />

                        <Label
                          htmlFor="user-role"
                          className="mt-2 text-sm font-medium text-foreground flex items-center"
                        >
                          ロール
                          <span className="ml-1 text-destructive" aria-hidden="true">
                            *
                          </span>
                          <span className="sr-only">（必須）</span>
                        </Label>
                        <Select
                          value={newUserRole}
                          onValueChange={(value) => setNewUserRole(value as User["role"])}
                          required
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="ロールを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">CA</SelectItem>
                            <SelectItem value="CA管理">CA管理</SelectItem>
                            <SelectItem value="RA">RA</SelectItem>
                            <SelectItem value="RA管理">RA管理</SelectItem>
                            <SelectItem value="両面">両面</SelectItem>
                            <SelectItem value="管理者">管理者</SelectItem>
                          </SelectContent>
                        </Select>

                        <Label className="mt-2 text-sm font-medium text-foreground">担当Facebookページ</Label>
                        <div className="space-y-3">
                          {facebookPages.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <p className="text-sm mb-3">接続されたFacebookページがありません</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsAddAccountOpen(false)
                                  // Switch to Facebook pages tab
                                  const tabsTrigger = document.querySelector(
                                    '[data-value="facebook-pages"]',
                                  ) as HTMLElement
                                  tabsTrigger?.click()
                                }}
                              >
                                ページを接続
                              </Button>
                            </div>
                          ) : (
                            facebookPages.map((page) => {
                              const isExpired = page.expiryStatus === "Expired"
                              const statusColor =
                                page.expiryStatus === "Connected"
                                  ? "bg-green-100 text-green-800"
                                  : page.expiryStatus === "ExpiringSoon"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : page.expiryStatus === "ExpiringUrgent"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"

                              return (
                                <div key={page.id} className="flex items-center space-x-3 p-2 border rounded-md">
                                  <Checkbox
                                    id={`page-${page.id}`}
                                    checked={newUserPages.includes(page.pageId)}
                                    disabled={isExpired}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewUserPages([...newUserPages, page.pageId])
                                      } else {
                                        setNewUserPages(newUserPages.filter((id) => id !== page.pageId))
                                      }
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Label
                                      htmlFor={`page-${page.id}`}
                                      className={`text-sm font-medium ${isExpired ? "text-muted-foreground" : ""}`}
                                    >
                                      {page.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground truncate">{page.pageId}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                                    {page.expiryStatus === "Connected"
                                      ? "接続中"
                                      : page.expiryStatus === "ExpiringSoon"
                                        ? "期限間近"
                                        : page.expiryStatus === "ExpiringUrgent"
                                          ? "期限切迫"
                                          : "期限切れ"}
                                  </span>
                                  {isExpired && (
                                    <div className="text-xs text-muted-foreground" title="期限切れ。再接続してください">
                                      ⚠️
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>

                        <Label
                          htmlFor="user-password"
                          className="mt-2 text-sm font-medium text-foreground flex items-center"
                        >
                          初期パスワード
                          <span className="ml-1 text-destructive" aria-hidden="true">
                            *
                          </span>
                          <span className="sr-only">（必須）</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="user-password"
                            type={showPassword ? "text" : "password"}
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="h-10 pr-10"
                            placeholder="8文字以上"
                            required
                            aria-invalid={!newUserPassword && "true"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-10 px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">8文字以上で入力してください</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={handleCreateUser} disabled={isLoading}>
                          {isLoading ? "追加中..." : "追加"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {!isAdmin ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>閲覧のみ</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>氏名</TableHead>
                          <TableHead>メールアドレス</TableHead>
                          <TableHead>ロール</TableHead>
                          <TableHead>担当Facebookページ数</TableHead>
                          <TableHead>アクション</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)}>{internalToDisplayJa(user.role)}</Badge>
                            </TableCell>
                            <TableCell>{getAssignedPagesCount(user)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    削除
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleFacebookConnect(user.id)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Facebook連携
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Delete User Dialog */}
            <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>ユーザー削除</DialogTitle>
                  <DialogDescription>
                    本当にこのユーザーを削除しますか？
                    <br />
                    この操作は取り消せません。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsDeleteAccountOpen(false)}>
                    キャンセル
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteUser} disabled={isLoading}>
                    {isLoading ? "削除中..." : "削除"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ユーザー編集</DialogTitle>
                  <DialogDescription>ユーザー情報を編集します。</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-[160px,1fr] gap-x-6 gap-y-6 py-4 sm:grid-cols-1 sm:gap-y-4">
                  <Label
                    htmlFor="edit-user-name"
                    className="mt-2 text-sm font-medium text-foreground flex items-center"
                  >
                    氏名
                    <span className="ml-1 text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">（必須）</span>
                  </Label>
                  <Input
                    id="edit-user-name"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="h-10"
                    required
                  />

                  <Label
                    htmlFor="edit-user-email"
                    className="mt-2 text-sm font-medium text-foreground flex items-center"
                  >
                    メールアドレス
                    <span className="ml-1 text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">（必須）</span>
                  </Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="h-10"
                    required
                  />

                  <Label
                    htmlFor="edit-user-role"
                    className="mt-2 text-sm font-medium text-foreground flex items-center"
                  >
                    ロール
                    <span className="ml-1 text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">（必須）</span>
                  </Label>
                  <Select value={editUserRole} onValueChange={(value) => setEditUserRole(value as User["role"])}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">CA</SelectItem>
                      <SelectItem value="CA管理">CA管理</SelectItem>
                      <SelectItem value="RA">RA</SelectItem>
                      <SelectItem value="RA管理">RA管理</SelectItem>
                      <SelectItem value="両面">両面</SelectItem>
                      <SelectItem value="管理者">管理者</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label className="mt-2 text-sm font-medium text-foreground">担当Facebookページ</Label>
                  <div className="space-y-3">
                    {facebookPages.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p className="text-sm mb-3">接続されたFacebookページがありません</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditAccountOpen(false)
                            const tabsTrigger = document.querySelector('[data-value="facebook-pages"]') as HTMLElement
                            tabsTrigger?.click()
                          }}
                        >
                          ページを接続
                        </Button>
                      </div>
                    ) : (
                      facebookPages.map((page) => {
                        const isExpired = page.expiryStatus === "Expired"
                        const statusColor =
                          page.expiryStatus === "Connected"
                            ? "bg-green-100 text-green-800"
                            : page.expiryStatus === "ExpiringSoon"
                              ? "bg-yellow-100 text-yellow-800"
                              : page.expiryStatus === "ExpiringUrgent"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"

                        return (
                          <div key={page.id} className="flex items-center space-x-3 p-2 border rounded-md">
                            <Checkbox
                              id={`edit-page-${page.id}`}
                              checked={editUserPages.includes(page.pageId)}
                              disabled={isExpired}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEditUserPages([...editUserPages, page.pageId])
                                } else {
                                  setEditUserPages(editUserPages.filter((id) => id !== page.pageId))
                                }
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`edit-page-${page.id}`}
                                className={`text-sm font-medium ${isExpired ? "text-muted-foreground" : ""}`}
                              >
                                {page.name}
                              </Label>
                              <p className="text-xs text-muted-foreground truncate">{page.pageId}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                              {page.expiryStatus === "Connected"
                                ? "接続中"
                                : page.expiryStatus === "ExpiringSoon"
                                  ? "期限間近"
                                  : page.expiryStatus === "ExpiringUrgent"
                                    ? "期限切迫"
                                    : "期限切れ"}
                            </span>
                            {isExpired && (
                              <div className="text-xs text-muted-foreground" title="期限切れ。再接続してください">
                                ⚠️
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  <Label className="mt-2 text-sm font-medium text-foreground">応募リンク有効化</Label>
                  <Switch checked={editUserApplyLinkEnabled} onCheckedChange={setEditUserApplyLinkEnabled} />

                  <Label className="mt-2 text-sm font-medium text-foreground">パスワードリセット</Label>
                  <Switch checked={resetPassword} onCheckedChange={setResetPassword} />

                  {resetPassword && (
                    <>
                      <Label htmlFor="new-password" className="mt-2 text-sm font-medium text-foreground">
                        新しいパスワード
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-10"
                          placeholder="8文字以上"
                        />
                        <p className="text-xs text-muted-foreground mt-1">8文字以上で入力してください</p>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditAccountOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={isLoading}>
                    {isLoading ? "更新中..." : "更新"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="facebook-pages" className="space-y-6">
            <FacebookPagesSettings />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="audit-logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>監査ログ</CardTitle>
                <CardDescription>ユーザーアクティビティの追跡と監視</CardDescription>
              </CardHeader>
              <CardContent>
                <p>監査ログはまだ実装されていません。</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="apply-links" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">法人ページ接続リンク管理</h2>
            <p className="text-muted-foreground">
              {isAdmin
                ? "CAごとの法人ページ接続リンクを発行・管理します"
                : "自分に割り当てられた法人ページ接続リンクを確認できます"}
            </p>
          </div>

          {!canViewApplyLinks ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <p>この機能はあなたの権限では利用できません</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">一覧管理</TabsTrigger>
                {isAdmin && <TabsTrigger value="assign">割当（ユーザー別）</TabsTrigger>}
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="ページ名、CA名で検索..."
                      value={applyLinkSearchTerm}
                      onChange={(e) => setApplyLinkSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={applyLinkStatusFilter} onValueChange={setApplyLinkStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="状態" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全ての状態</SelectItem>
                        <SelectItem value="active">有効</SelectItem>
                        <SelectItem value="expired">期限切れ</SelectItem>
                        <SelectItem value="disabled">無効</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={applyLinkPageFilter} onValueChange={setApplyLinkPageFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="ページ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全てのページ</SelectItem>
                        {facebookPages.map((page) => (
                          <SelectItem key={page.pageId} value={page.pageId}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedApplyLinks.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{selectedApplyLinks.length}件選択中</span>
                    <Button variant="outline" size="sm" onClick={() => handleBulkDisableApplyLinks()}>
                      一括失効
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowBulkExpiryModal(true)}>
                      期限一括変更
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedApplyLinks([])}>
                      選択解除
                    </Button>
                  </div>
                )}

                {/* Apply Links Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedApplyLinks.length === filteredApplyLinks.length && filteredApplyLinks.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedApplyLinks(filteredApplyLinks.map((link) => link.id))
                              } else {
                                setSelectedApplyLinks([])
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>リンクID</TableHead>
                        <TableHead>Facebookページ名</TableHead>
                        <TableHead>対象CA</TableHead>
                        <TableHead>状態</TableHead>
                        <TableHead>有効期限</TableHead>
                        <TableHead>最終更新</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplyLinks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {applyLinkSearchTerm || applyLinkStatusFilter !== "all" || applyLinkPageFilter !== "all"
                              ? "検索条件に一致するリンクが見つかりません"
                              : "接続リンクがありません。「リンクを発行」ボタンから作成してください。"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplyLinks.map((link) => {
                          const page = facebookPages.find((p) => p.pageId === link.pageId)
                          const user = users.find((u) => u.id === link.userId)
                          const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()

                          return (
                            <TableRow key={link.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedApplyLinks.includes(link.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedApplyLinks([...selectedApplyLinks, link.id])
                                    } else {
                                      setSelectedApplyLinks(selectedApplyLinks.filter((id) => id !== link.id))
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs">{link.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {page?.name || "不明なページ"}
                                  <Badge variant="outline" className="text-xs">
                                    {link.pageId}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user?.name || "不明なユーザー"}
                                <div className="text-xs text-muted-foreground">{user?.role}</div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    link.status === "active"
                                      ? "default"
                                      : link.status === "expired"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {link.status === "active" ? "有効" : link.status === "expired" ? "期限切れ" : "無効"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {link.expiresAt ? (
                                  <div className={isExpired ? "text-destructive" : ""}>
                                    {new Date(link.expiresAt).toLocaleDateString("ja-JP")}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">無期限</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(link.updatedAt).toLocaleDateString("ja-JP")}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditModal(link)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      編集
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRegenerateToken(link.id)}>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      再発行
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteApplyLink(link.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      削除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="assign" className="space-y-4">
                {/* User Assignment Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">ユーザー選択</CardTitle>
                      <CardDescription>接続リンクを割り当てるCAを選択してください</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedAssignUser} onValueChange={setSelectedAssignUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="CAを選択..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((user) => ["CA", "CA管理", "両面"].includes(user.role))
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">クイック操作</CardTitle>
                      <CardDescription>選択したユーザーの接続リンクを管理</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        className="w-full justify-start bg-transparent"
                        variant="outline"
                        disabled={!selectedAssignUser}
                        onClick={() => openCreateModalForUser(selectedAssignUser)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        新規リンク発行
                      </Button>
                      <Button
                        className="w-full justify-start bg-transparent"
                        variant="outline"
                        disabled={!selectedAssignUser}
                        onClick={() => handleBulkRegenerateForUser(selectedAssignUser)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        全リンク再発行
                      </Button>
                      <Button
                        className="w-full justify-start bg-transparent"
                        variant="outline"
                        disabled={!selectedAssignUser}
                        onClick={() => handleBulkDisableForUser(selectedAssignUser)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        全リンク失効
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* User's Links Display */}
                {selectedAssignUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {users.find((u) => u.id === selectedAssignUser)?.name}さんの接続リンク
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {applyLinks
                          .filter((link) => link.userId === selectedAssignUser)
                          .map((link) => {
                            const page = facebookPages.find((p) => p.pageId === link.pageId)
                            return (
                              <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium">{page?.name || "不明なページ"}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {link.status === "active"
                                        ? "有効"
                                        : link.status === "expired"
                                          ? "期限切れ"
                                          : "無効"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" onClick={() => openEditModal(link)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleRegenerateToken(link.id)}>
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDeleteApplyLink(link.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        {applyLinks.filter((link) => link.userId === selectedAssignUser).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            このユーザーには接続リンクが割り当てられていません
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>ポップアップ通知の設定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="popup-enabled">ポップアップ通知を有効にする</Label>
                  <Switch
                    id="popup-enabled"
                    checked={notifyPrefs.popupEnabled}
                    onCheckedChange={(checked) => setNotifyPrefs({ ...notifyPrefs, popupEnabled: checked })}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSaveNotifyPrefs}>
                保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QRコード</DialogTitle>
            <DialogDescription>このQRコードをスキャンして法人ページDM誘導リンクにアクセスできます。</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                QR Code: {qrUrl}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrModalOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
