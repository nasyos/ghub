import { auditLogger } from "@/lib/audit-logger"

// Security configuration
const SECURITY_CONFIG = {
  TOKEN_ENCRYPTION_KEY: "mock_encryption_key_32_chars_long",
  TOKEN_HASH_ROUNDS: 12,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_TOKEN_ACCESS_ATTEMPTS: 5,
  TOKEN_ROTATION_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
}

// Token security status
export interface TokenSecurityInfo {
  encrypted: boolean
  lastAccessed?: string
  accessCount: number
  rotationDue: boolean
  securityLevel: "high" | "medium" | "low"
  riskFactors: string[]
}

// Security audit event types
export type SecurityEventType =
  | "token_access"
  | "token_encryption"
  | "token_decryption"
  | "token_rotation"
  | "security_violation"
  | "unauthorized_access"
  | "token_exposure_risk"

// Mock encryption/decryption (in real implementation, use proper crypto)
export const tokenSecurity = {
  // Encrypt token for secure storage
  encryptToken(token: string): string {
    if (!token) return ""

    // Mock encryption - in real implementation, use AES-256-GCM or similar
    const encrypted = btoa(token + "|" + Date.now() + "|" + SECURITY_CONFIG.TOKEN_ENCRYPTION_KEY)

    this.logSecurityEvent("token_encryption", {
      tokenLength: token.length,
      encryptedLength: encrypted.length,
      timestamp: new Date().toISOString(),
    })

    return encrypted
  },

  // Decrypt token for API usage
  decryptToken(encryptedToken: string, userId: string): string {
    if (!encryptedToken) return ""

    try {
      // Mock decryption
      const decrypted = atob(encryptedToken).split("|")[0]

      this.logSecurityEvent("token_decryption", {
        userId,
        success: true,
        timestamp: new Date().toISOString(),
      })

      // Log token access for audit
      this.logTokenAccess(userId, "decrypt")

      return decrypted
    } catch (error) {
      this.logSecurityEvent("security_violation", {
        userId,
        error: "Token decryption failed",
        encryptedTokenLength: encryptedToken.length,
        timestamp: new Date().toISOString(),
      })

      return ""
    }
  },

  // Generate secure token hash for verification
  hashToken(token: string): string {
    // Mock hash - in real implementation, use bcrypt or similar
    return btoa(token + SECURITY_CONFIG.TOKEN_ENCRYPTION_KEY).slice(0, 32)
  },

  // Mask token for display
  maskToken(token: string): string {
    if (!token || token.length < 8) return "••••••••"

    const start = token.slice(0, 4)
    const end = token.slice(-4)
    const middle = "•".repeat(Math.min(token.length - 8, 20))

    return `${start}${middle}${end}`
  },

  // Check if token needs rotation
  shouldRotateToken(tokenCreatedAt: string): boolean {
    const created = new Date(tokenCreatedAt).getTime()
    const now = Date.now()
    return now - created > SECURITY_CONFIG.TOKEN_ROTATION_INTERVAL
  },

  // Assess token security level
  assessTokenSecurity(pageId: string, tokenCreatedAt: string): TokenSecurityInfo {
    const accessCount = this.getTokenAccessCount(pageId)
    const lastAccessed = this.getLastTokenAccess(pageId)
    const rotationDue = this.shouldRotateToken(tokenCreatedAt)

    const riskFactors: string[] = []
    let securityLevel: "high" | "medium" | "low" = "high"

    // Assess risk factors
    if (accessCount > 100) {
      riskFactors.push("高頻度アクセス")
      securityLevel = "medium"
    }

    if (rotationDue) {
      riskFactors.push("ローテーション期限切れ")
      securityLevel = "low"
    }

    if (accessCount > 1000) {
      riskFactors.push("異常なアクセス頻度")
      securityLevel = "low"
    }

    const daysSinceLastAccess = lastAccessed
      ? Math.floor((Date.now() - new Date(lastAccessed).getTime()) / (24 * 60 * 60 * 1000))
      : 0

    if (daysSinceLastAccess > 30) {
      riskFactors.push("長期間未使用")
    }

    return {
      encrypted: true,
      lastAccessed,
      accessCount,
      rotationDue,
      securityLevel,
      riskFactors,
    }
  },

  // Log security events
  logSecurityEvent(eventType: SecurityEventType, details: Record<string, any>) {
    auditLogger.log(`security.${eventType}`, `Security event: ${eventType}`, {
      eventType,
      ...details,
      securityLevel: "system",
      timestamp: new Date().toISOString(),
    })
  },

  // Log token access for monitoring
  logTokenAccess(userId: string, action: "encrypt" | "decrypt" | "access" | "rotate") {
    const key = `token_access_${userId}`
    const now = new Date().toISOString()

    if (typeof window !== "undefined") {
      const existing = localStorage.getItem(key)
      const accessLog = existing ? JSON.parse(existing) : { count: 0, lastAccess: null, actions: [] }

      accessLog.count += 1
      accessLog.lastAccess = now
      accessLog.actions.push({ action, timestamp: now })

      // Keep only last 100 actions
      if (accessLog.actions.length > 100) {
        accessLog.actions = accessLog.actions.slice(-100)
      }

      localStorage.setItem(key, JSON.stringify(accessLog))
    }

    this.logSecurityEvent("token_access", {
      userId,
      action,
      timestamp: now,
    })
  },

  // Get token access count
  getTokenAccessCount(pageId: string): number {
    if (typeof window === "undefined") return 0

    const key = `token_access_${pageId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored).count || 0 : 0
  },

  // Get last token access time
  getLastTokenAccess(pageId: string): string | undefined {
    if (typeof window === "undefined") return undefined

    const key = `token_access_${pageId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored).lastAccess : undefined
  },

  // Validate token format and integrity
  validateTokenIntegrity(token: string): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    if (!token) {
      issues.push("トークンが空です")
      return { valid: false, issues }
    }

    if (token.length < 50) {
      issues.push("トークンが短すぎます")
    }

    if (!/^[A-Za-z0-9+/=]+$/.test(token)) {
      issues.push("無効な文字が含まれています")
    }

    if (token.includes("test") || token.includes("demo")) {
      issues.push("テスト用トークンの可能性があります")
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  },

  // Generate security report
  generateSecurityReport(pages: any[]): {
    totalPages: number
    securePages: number
    riskPages: number
    expiredTokens: number
    rotationNeeded: number
    recommendations: string[]
  } {
    const report = {
      totalPages: pages.length,
      securePages: 0,
      riskPages: 0,
      expiredTokens: 0,
      rotationNeeded: 0,
      recommendations: [] as string[],
    }

    pages.forEach((page) => {
      const security = this.assessTokenSecurity(page.pageId, page.createdAt)

      if (security.securityLevel === "high") {
        report.securePages++
      } else {
        report.riskPages++
      }

      if (page.tokenExpiresAt && new Date(page.tokenExpiresAt) < new Date()) {
        report.expiredTokens++
      }

      if (security.rotationDue) {
        report.rotationNeeded++
      }
    })

    // Generate recommendations
    if (report.expiredTokens > 0) {
      report.recommendations.push(`${report.expiredTokens}個のページで期限切れトークンを更新してください`)
    }

    if (report.rotationNeeded > 0) {
      report.recommendations.push(`${report.rotationNeeded}個のページでトークンローテーションが必要です`)
    }

    if (report.riskPages > report.totalPages * 0.3) {
      report.recommendations.push("セキュリティリスクの高いページが多数あります。定期的な監査を実施してください")
    }

    if (report.recommendations.length === 0) {
      report.recommendations.push("セキュリティ状態は良好です")
    }

    return report
  },

  // Clear sensitive data from memory/storage
  clearSensitiveData(pageId?: string) {
    if (typeof window === "undefined") return

    if (pageId) {
      // Clear specific page data
      localStorage.removeItem(`token_access_${pageId}`)
      localStorage.removeItem(`oauth_state_${pageId}`)
    } else {
      // Clear all sensitive data
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("token_access_") || key.startsWith("oauth_state_")) {
          localStorage.removeItem(key)
        }
      })
    }

    this.logSecurityEvent("security_violation", {
      action: "sensitive_data_cleared",
      pageId: pageId || "all",
      timestamp: new Date().toISOString(),
    })
  },
}

// Security middleware for API calls
export const securityMiddleware = {
  // Validate request security
  validateRequest(userId: string, action: string, resource: string): { allowed: boolean; reason?: string } {
    // Check rate limiting
    const rateLimitKey = `rate_limit_${userId}_${action}`
    const now = Date.now()

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(rateLimitKey)
      if (stored) {
        const { count, resetTime } = JSON.parse(stored)

        if (now < resetTime && count > 10) {
          // 10 requests per minute
          return {
            allowed: false,
            reason: "レート制限に達しました。しばらく待ってから再試行してください。",
          }
        }
      }
    }

    // Log security check
    tokenSecurity.logSecurityEvent("unauthorized_access", {
      userId,
      action,
      resource,
      allowed: true,
      timestamp: new Date().toISOString(),
    })

    return { allowed: true }
  },

  // Update rate limiting
  updateRateLimit(userId: string, action: string) {
    if (typeof window === "undefined") return

    const rateLimitKey = `rate_limit_${userId}_${action}`
    const now = Date.now()
    const resetTime = now + 60 * 1000 // 1 minute

    const stored = localStorage.getItem(rateLimitKey)
    let count = 1

    if (stored) {
      const data = JSON.parse(stored)
      if (now < data.resetTime) {
        count = data.count + 1
      }
    }

    localStorage.setItem(rateLimitKey, JSON.stringify({ count, resetTime }))
  },
}

// Export security utilities
export default {
  tokenSecurity,
  securityMiddleware,
  SECURITY_CONFIG,
}
