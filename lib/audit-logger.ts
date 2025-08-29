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
