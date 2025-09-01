interface AuditLogEntry {
  id?: number
  user_id: number
  action: string
  entity_type: string
  entity_id?: string | number
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at?: string
}

class AuditLogger {
  private static instance: AuditLogger
  private logs: AuditLogEntry[] = []

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  public async log(entry: Omit<AuditLogEntry, "id" | "created_at">): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: Date.now(),
      created_at: new Date().toISOString(),
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent(),
    }

    // In a real application, this would be sent to the database
    this.logs.push(logEntry)
    console.log("[AUDIT]", logEntry)

    // Simulate API call to save audit log
    try {
      // await fetch('/api/audit-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // })
    } catch (error) {
      console.error("Failed to save audit log:", error)
    }
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs].reverse() // Most recent first
  }

  public getLogsByUser(userId: number): AuditLogEntry[] {
    return this.logs.filter((log) => log.user_id === userId).reverse()
  }

  public getLogsByEntity(entityType: string, entityId?: string | number): AuditLogEntry[] {
    return this.logs
      .filter((log) => log.entity_type === entityType && (entityId ? log.entity_id === entityId : true))
      .reverse()
  }

  private getClientIP(): string {
    // In a real application, this would get the actual client IP
    return "127.0.0.1"
  }

  private getUserAgent(): string {
    return typeof window !== "undefined" ? window.navigator.userAgent : "Server"
  }

  // Convenience methods for common audit actions
  public async logUserAction(userId: number, action: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "user",
      entity_id: userId,
      new_values: details,
    })
  }

  public async logCandidateAction(
    userId: number,
    action: string,
    candidateId: string | number,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "candidate",
      entity_id: candidateId,
      old_values: oldValues,
      new_values: newValues,
    })
  }

  public async logMessageAction(
    userId: number,
    action: string,
    messageId?: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "message",
      entity_id: messageId,
      new_values: details,
    })
  }

  public async logFacebookPageAction(
    userId: number,
    action: string,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logSystemAction(userId: number, action: string, details?: Record<string, any>): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "system",
      new_values: details,
    })
  }

  // New Facebook page specific audit actions
  public async logFacebookPageCreate(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_CREATE,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageUpdate(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_UPDATE,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageDelete(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_DELETE,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageConnect(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_CONNECT,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageDisconnect(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_DISCONNECT,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageSync(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_SYNC,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageCAAssign(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_CA_ASSIGN,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }

  public async logFacebookPageCAUnassign(
    userId: number,
    pageId: string | number,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      user_id: userId,
      action: AUDIT_ACTIONS.FACEBOOK_PAGE_CA_UNASSIGN,
      entity_type: "facebook_page",
      entity_id: pageId,
      new_values: details,
    })
  }
}

export const auditLogger = AuditLogger.getInstance()

// Audit action constants
export const AUDIT_ACTIONS = {
  // User actions
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  USER_ROLE_CHANGE: "user_role_change",
  USER_CREATE: "user_create",
  USER_UPDATE: "user_update",
  USER_DELETE: "user_delete",

  // Candidate actions
  CANDIDATE_CREATE: "candidate_create",
  CANDIDATE_UPDATE: "candidate_update",
  CANDIDATE_DELETE: "candidate_delete",
  CANDIDATE_STATUS_CHANGE: "candidate_status_change",
  CANDIDATE_CA_ASSIGN: "candidate_ca_assign",
  CANDIDATE_FACEBOOK_LINK: "candidate_facebook_link",
  CANDIDATE_VIEW: "candidate_view",

  // Message actions
  MESSAGE_SEND: "message_send",
  MESSAGE_RECEIVE: "message_receive",
  MESSAGE_TEMPLATE_USE: "message_template_use",
  MESSAGE_TRANSLATE: "message_translate",
  MESSAGE_CONSENT_REQUEST: "message_consent_request",

  // Facebook page actions
  FACEBOOK_PAGE_CREATE: "facebook_page_create",
  FACEBOOK_PAGE_UPDATE: "facebook_page_update",
  FACEBOOK_PAGE_DELETE: "facebook_page_delete",
  FACEBOOK_PAGE_CONNECT: "facebook_page_connect",
  FACEBOOK_PAGE_DISCONNECT: "facebook_page_disconnect",
  FACEBOOK_PAGE_SYNC: "facebook_page_sync",
  FACEBOOK_PAGE_CA_ASSIGN: "facebook_page_ca_assign",
  FACEBOOK_PAGE_CA_UNASSIGN: "facebook_page_ca_unassign",

  // System actions
  CSV_IMPORT: "csv_import",
  BULK_UPDATE: "bulk_update",
  SYSTEM_BACKUP: "system_backup",
  SYSTEM_RESTORE: "system_restore",
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]

// lib/audit-logger.ts
// 監査ログ機能を管理するライブラリ

export interface AuditLog {
  id: string
  linkId: number
  actorId?: number
  action: 'link' | 'recommend' | 'unlink' | 'reject' | 'hold' | 'approve'
  fromStatus?: string
  toStatus?: string
  createdAt: string
  meta?: Record<string, any>
}

export interface LinkAuditData {
  linkId: number
  actorId?: number
  action: AuditLog['action']
  fromStatus?: string
  toStatus?: string
  meta?: Record<string, any>
}

// 監査ログを記録する関数
export async function logLinkAudit(data: LinkAuditData): Promise<AuditLog> {
  const auditLog: AuditLog = {
    id: generateId(),
    linkId: data.linkId,
    actorId: data.actorId,
    action: data.action,
    fromStatus: data.fromStatus,
    toStatus: data.toStatus,
    createdAt: new Date().toISOString(),
    meta: data.meta
  }

  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // 監査ログを保存（実際の実装ではデータベースに保存）
  saveAuditLog(auditLog)
  
  return auditLog
}

// 推薦アクションの監査ログ
export async function logRecommendation(
  linkId: number,
  actorId: number,
  fromStatus: string,
  comment?: string
): Promise<AuditLog> {
  return logLinkAudit({
    linkId,
    actorId,
    action: 'recommend',
    fromStatus,
    toStatus: 'recommended',
    meta: {
      comment,
      timestamp: new Date().toISOString()
    }
  })
}

// 解除アクションの監査ログ
export async function logUnlink(
  linkId: number,
  actorId: number,
  fromStatus: string,
  reason?: string
): Promise<AuditLog> {
  return logLinkAudit({
    linkId,
    actorId,
    action: 'unlink',
    fromStatus,
    toStatus: 'unlinked',
    meta: {
      reason,
      timestamp: new Date().toISOString()
    }
  })
}

// 引当アクションの監査ログ
export async function logLink(
  linkId: number,
  actorId: number,
  candidateId: number,
  jobId: number
): Promise<AuditLog> {
  return logLinkAudit({
    linkId,
    actorId,
    action: 'link',
    fromStatus: null,
    toStatus: 'linked',
    meta: {
      candidateId,
      jobId,
      timestamp: new Date().toISOString()
    }
  })
}

// 差戻しアクションの監査ログ
export async function logRejection(
  linkId: number,
  actorId: number,
  fromStatus: string,
  reason?: string
): Promise<AuditLog> {
  return logLinkAudit({
    linkId,
    actorId,
    action: 'reject',
    fromStatus,
    toStatus: 'rejected',
    meta: {
      reason,
      timestamp: new Date().toISOString()
    }
  })
}

// 保留アクションの監査ログ
export async function logHold(
  linkId: number,
  actorId: number,
  fromStatus: string,
  reason?: string
): Promise<AuditLog> {
  return logLinkAudit({
    linkId,
    actorId,
    action: 'hold',
    fromStatus,
    toStatus: 'on_hold',
    meta: {
      reason,
      timestamp: new Date().toISOString()
    }
  })
}

// 承認アクションの監査ログ
export async function logApproval(
  linkId: number,
  actorId: number,
  fromStatus: string
): Promise<AuditLog> {
  return logLinkAudit({
    linkId,
    actorId,
    action: 'approve',
    fromStatus,
    toStatus: 'approved',
    meta: {
      timestamp: new Date().toISOString()
    }
  })
}

// 監査ログを取得する関数
export async function getAuditLogs(
  linkId?: number,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> {
  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // モックデータを返す
  return getMockAuditLogs(linkId, limit, offset)
}

// ヘルパー関数
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function saveAuditLog(auditLog: AuditLog): void {
  // 実際の実装ではデータベースに保存
  console.log('Audit log saved:', auditLog)
}

function getMockAuditLogs(linkId?: number, limit: number = 50, offset: number = 0): AuditLog[] {
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      linkId: 1,
      actorId: 1,
      action: 'link',
      fromStatus: null,
      toStatus: 'linked',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1日前
      meta: {
        candidateId: 1,
        jobId: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    },
    {
      id: '2',
      linkId: 1,
      actorId: 2,
      action: 'recommend',
      fromStatus: 'linked',
      toStatus: 'recommended',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12時間前
      meta: {
        comment: '建設現場での経験があり、日本語もN3レベルで十分コミュニケーション可能です。',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      }
    },
    {
      id: '3',
      linkId: 2,
      actorId: 1,
      action: 'link',
      fromStatus: null,
      toStatus: 'linked',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6時間前
      meta: {
        candidateId: 2,
        jobId: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      }
    }
  ]
  
  let filteredLogs = mockAuditLogs
  
  if (linkId) {
    filteredLogs = mockAuditLogs.filter(log => log.linkId === linkId)
  }
  
  return filteredLogs.slice(offset, offset + limit)
}
