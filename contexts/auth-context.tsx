"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { auditLogger, AUDIT_ACTIONS } from "@/lib/audit-logger"

// ---- Role / Page / Feature 定義（後方互換あり） ----
export type Role = "admin" | "ca" | "ca_manager" | "ra" | "ra_manager" | "dual"
export type LegacyRole = "admin" | "ca_staff" | "ca_manager"

export type PageId =
  | "dashboard"
  | "messages"
  | "candidates"
  | "jobs"
  | "jobSelection" // 求人別選考管理
  | "communities"
  | "settings"

export type FeatureId =
  | "seeCandidateChatFromSelection" // 選考管理→候補者チャット導線（RA不可）
  | "recommendationSummary" // 推薦サマリー生成/コピー
  | "updateSelectionStatus" // 求人別選考ステータス更新
  | "applyLinkGenerate" // 応募リンク（REF）発行/更新（管理者のみ）
  | "templatePublish" // テンプレ公開/下書き切替（管理者のみ）

export const normalizeRole = (r: LegacyRole | Role): Role => {
  if (r === "ca_staff") return "ca"
  return r as Role
}

const PAGE_ACL: Record<PageId, Role[]> = {
  dashboard: ["admin", "ca", "ca_manager", "ra", "ra_manager", "dual"],
  messages: ["admin", "ca", "ca_manager", "dual"],
  candidates: ["admin", "ca", "ca_manager", "dual"],
  jobs: ["admin", "ra", "ra_manager", "dual"],
  jobSelection: ["admin", "ra", "ra_manager", "dual"],
  communities: ["admin", "ca", "ca_manager", "dual"],
  settings: ["admin", "ca", "ca_manager", "ra", "ra_manager", "dual"],
}

const FEATURE_ACL: Record<FeatureId, Role[]> = {
  seeCandidateChatFromSelection: ["admin", "dual"],
  recommendationSummary: ["admin", "ra", "ra_manager", "dual"],
  updateSelectionStatus: ["admin", "ra", "ra_manager", "dual"],
  applyLinkGenerate: ["admin"],
  templatePublish: ["admin"],
}

export const hasRole = (role: LegacyRole | Role, allowed: Role[]) => {
  if (!allowed || !Array.isArray(allowed)) return false
  return allowed.includes(normalizeRole(role))
}

export const canSeePageAcl = (role: LegacyRole | Role, page: PageId) => hasRole(role, PAGE_ACL[page])

export const canUseAcl = (role: LegacyRole | Role, feature: FeatureId) => hasRole(role, FEATURE_ACL[feature])

interface User {
  id: number
  name: string
  email: string
  role: LegacyRole | Role // Updated to support backward compatibility
  avatar: string
  groups: number[]
  managedCAs?: number[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  requestPasswordReset: (email: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
  verifyResetToken: (token: string) => Promise<boolean>
  canSee: (page: string) => boolean // Legacy canSee for backward compatibility

  roleNormalized?: Role | null
  canSeePage?: (page: PageId) => boolean
  canUse?: (feature: FeatureId) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers: User[] = [
  {
    id: 1,
    name: "田中 太郎",
    email: "admin@company.com",
    role: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
    groups: [1, 3],
  },
  {
    id: 2,
    name: "佐藤 花子",
    email: "sato@company.com",
    role: "ca", // Changed from ca_staff to ca
    avatar: "/placeholder.svg?height=40&width=40",
    groups: [1, 4],
  },
  {
    id: 3,
    name: "鈴木 一郎",
    email: "suzuki@company.com",
    role: "ra", // Added ra role user
    avatar: "/placeholder.svg?height=40&width=40",
    groups: [2],
  },
  {
    id: 4,
    name: "高橋 美咲",
    email: "takahashi@company.com",
    role: "dual", // Added dual role user
    avatar: "/placeholder.svg?height=40&width=40",
    groups: [2, 4],
  },
  {
    id: 5,
    name: "山田 課長",
    email: "yamada@company.com",
    role: "ca_manager",
    avatar: "/placeholder.svg?height=40&width=40",
    groups: [1, 2],
    managedCAs: [2, 3],
  },
  {
    id: 6,
    name: "田村 部長",
    email: "tamura@company.com",
    role: "ra_manager", // Added ra_manager role user
    avatar: "/placeholder.svg?height=40&width=40",
    groups: [1, 2],
    managedCAs: [3],
  },
]

function mapLegacyRole(role: string): "admin" | "ca" | "ca_manager" | "ra" | "ra_manager" | "dual" {
  switch (role) {
    case "ca_staff":
      return "ca"
    case "admin":
      return "admin"
    case "ca_manager":
      return "ca_manager"
    default:
      return "ca" // Default fallback
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const roleNormalized = user ? normalizeRole(user.role) : null

  const canSee = (page: string): boolean => {
    if (!user) return false

    switch (page) {
      case "messages":
      case "candidates":
      case "communities":
        return ["ca", "ca_manager", "dual", "admin"].includes(user.role)
      case "jobs":
        return ["ra", "ra_manager", "dual", "admin"].includes(user.role)
      case "dashboard":
      case "settings":
        return true // All roles can access
      default:
        return false
    }
  }

  useEffect(() => {
    // ローカルストレージから認証情報を復元
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      if (parsedUser.role) {
        parsedUser.role = mapLegacyRole(parsedUser.role)
      }
      setUser(parsedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "password") {
      const userWithMappedRole = {
        ...foundUser,
        role: mapLegacyRole(foundUser.role),
      }

      setUser(userWithMappedRole)
      localStorage.setItem("user", JSON.stringify(userWithMappedRole))

      await auditLogger.logUserAction(userWithMappedRole.id, AUDIT_ACTIONS.USER_LOGIN, {
        email: userWithMappedRole.email,
        role: userWithMappedRole.role,
        login_time: new Date().toISOString(),
      })

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    if (user) {
      auditLogger.logUserAction(user.id, AUDIT_ACTIONS.USER_LOGOUT, {
        email: user.email,
        logout_time: new Date().toISOString(),
      })
    }

    setUser(null)
    localStorage.removeItem("user")
  }

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true)

    // モック実装：実際にはメール送信APIを呼び出す
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userExists = mockUsers.find((u) => u.email === email)

    if (userExists) {
      // 実際の実装では、サーバーでトークンを生成してメール送信
      const resetToken = Math.random().toString(36).substring(2, 15)
      localStorage.setItem(`reset_token_${email}`, resetToken)
      localStorage.setItem(`reset_token_expiry_${email}`, (Date.now() + 3600000).toString()) // 1時間後に期限切れ

      await auditLogger.logUserAction(userExists.id, "password_reset_request", {
        email: email,
        reset_token_generated: true,
      })

      console.log(`パスワードリセットメールを ${email} に送信しました。リセットトークン: ${resetToken}`)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const verifyResetToken = async (token: string): Promise<boolean> => {
    // 実際の実装では、サーバーでトークンの有効性を確認
    const emails = mockUsers.map((u) => u.email)

    for (const email of emails) {
      const storedToken = localStorage.getItem(`reset_token_${email}`)
      const expiry = localStorage.getItem(`reset_token_expiry_${email}`)

      if (storedToken === token && expiry && Date.now() < Number.parseInt(expiry)) {
        return true
      }
    }

    return false
  }

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // トークンに対応するメールアドレスを見つける
    const emails = mockUsers.map((u) => u.email)
    let targetEmail = null
    let targetUser = null

    for (const email of emails) {
      const storedToken = localStorage.getItem(`reset_token_${email}`)
      const expiry = localStorage.getItem(`reset_token_expiry_${email}`)

      if (storedToken === token && expiry && Date.now() < Number.parseInt(expiry)) {
        targetEmail = email
        targetUser = mockUsers.find((u) => u.email === email)
        break
      }
    }

    if (targetEmail && targetUser) {
      // 実際の実装では、データベースのパスワードを更新
      console.log(`${targetEmail} のパスワードを更新しました`)

      await auditLogger.logUserAction(targetUser.id, "password_reset_complete", {
        email: targetEmail,
        reset_completed: true,
      })

      // トークンを削除
      localStorage.removeItem(`reset_token_${targetEmail}`)
      localStorage.removeItem(`reset_token_expiry_${targetEmail}`)

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        requestPasswordReset,
        resetPassword,
        verifyResetToken,
        canSee, // Legacy canSee for backward compatibility

        roleNormalized,
        canSeePage: (page) => !!user && canSeePageAcl(user.role, page),
        canUse: (feature) => !!user && canUseAcl(user.role, feature),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
