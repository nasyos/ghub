// lib/notifications.ts
// 通知機能を管理するライブラリ

export interface Notification {
  id: string
  type: 'recommendation' | 'rejection' | 'hold' | 'approval'
  recipientId: string
  recipientType: 'ra' | 'ca'
  title: string
  message: string
  relatedJobId?: string
  relatedCandidateId?: string
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface NotificationTemplate {
  type: Notification['type']
  title: string
  message: string
}

// 通知テンプレート
const notificationTemplates: Record<Notification['type'], NotificationTemplate> = {
  recommendation: {
    type: 'recommendation',
    title: '新しい求職者推薦',
    message: '求職者{0}が求人{1}に推薦されました。確認をお願いします。'
  },
  rejection: {
    type: 'rejection',
    title: '推薦が差戻されました',
    message: '求人{1}への推薦が差戻されました。理由を確認してください。'
  },
  hold: {
    type: 'hold',
    title: '推薦が保留されました',
    message: '求人{1}への推薦が保留されました。追加情報の提供をお願いします。'
  },
  approval: {
    type: 'approval',
    title: '推薦が承認されました',
    message: '求人{1}への推薦が承認されました。次のステップに進みます。'
  }
}

// 通知を作成する関数
export async function createNotification(
  type: Notification['type'],
  recipientId: string,
  recipientType: 'ra' | 'ca',
  relatedJobId?: string,
  relatedCandidateId?: string,
  customMessage?: string
): Promise<Notification> {
  const template = notificationTemplates[type]
  const message = customMessage || template.message
  
  const notification: Notification = {
    id: generateId(),
    type,
    recipientId,
    recipientType,
    title: template.title,
    message,
    relatedJobId,
    relatedCandidateId,
    isRead: false,
    createdAt: new Date().toISOString()
  }

  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 通知を保存（実際の実装ではデータベースに保存）
  saveNotification(notification)
  
  return notification
}

// 推薦完了時の通知
export async function notifyRecommendationComplete(
  jobId: string,
  candidateId: string,
  raId: string,
  comment?: string
): Promise<void> {
  const message = comment 
    ? `求職者${candidateId}が求人${jobId}に推薦されました。\n\n推薦コメント：${comment}`
    : `求職者${candidateId}が求人${jobId}に推薦されました。`

  await createNotification(
    'recommendation',
    raId,
    'ra',
    jobId,
    candidateId,
    message
  )
}

// 差戻し時の通知
export async function notifyRejection(
  jobId: string,
  candidateId: string,
  caId: string,
  reason?: string
): Promise<void> {
  const message = reason 
    ? `求人${jobId}への推薦が差戻されました。\n\n理由：${reason}`
    : `求人${jobId}への推薦が差戻されました。`

  await createNotification(
    'rejection',
    caId,
    'ca',
    jobId,
    candidateId,
    message
  )
}

// 保留時の通知
export async function notifyHold(
  jobId: string,
  candidateId: string,
  caId: string,
  reason?: string
): Promise<void> {
  const message = reason 
    ? `求人${jobId}への推薦が保留されました。\n\n理由：${reason}`
    : `求人${jobId}への推薦が保留されました。`

  await createNotification(
    'hold',
    caId,
    'ca',
    jobId,
    candidateId,
    message
  )
}

// 承認時の通知
export async function notifyApproval(
  jobId: string,
  candidateId: string,
  caId: string
): Promise<void> {
  await createNotification(
    'approval',
    caId,
    'ca',
    jobId,
    candidateId
  )
}

// 通知を取得する関数
export async function getNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // モックデータを返す
  return getMockNotifications(userId, limit, offset)
}

// 通知を既読にする関数
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // 通知を既読に更新
  updateNotificationReadStatus(notificationId, true)
}

// 未読通知数を取得する関数
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const notifications = getMockNotifications(userId)
  return notifications.filter(n => !n.isRead).length
}

// ヘルパー関数
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function saveNotification(notification: Notification): void {
  // 実際の実装ではデータベースに保存
  console.log('Notification saved:', notification)
}

function updateNotificationReadStatus(notificationId: string, isRead: boolean): void {
  // 実際の実装ではデータベースを更新
  console.log('Notification read status updated:', notificationId, isRead)
}

function getMockNotifications(userId: string, limit: number = 20, offset: number = 0): Notification[] {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'recommendation',
      recipientId: userId,
      recipientType: 'ra',
      title: '新しい求職者推薦',
      message: '求職者田中太郎が求人JOB001に推薦されました。確認をお願いします。',
      relatedJobId: 'JOB001',
      relatedCandidateId: '1',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30分前
    },
    {
      id: '2',
      type: 'approval',
      recipientId: userId,
      recipientType: 'ca',
      title: '推薦が承認されました',
      message: '求人JOB002への推薦が承認されました。次のステップに進みます。',
      relatedJobId: 'JOB002',
      relatedCandidateId: '2',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
      readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    }
  ]
  
  return mockNotifications.slice(offset, offset + limit)
}


