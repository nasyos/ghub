import { Candidate, DelayStatus, PriorityStatus } from "./types"

// 遅延ステータスを計算
export function calculateDelayStatus(candidate: Candidate): DelayStatus {
  const now = new Date()
  const lastMessageTime = new Date(candidate.lastMessageReceivedAt)
  const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60)

  // 遅延管理対象外のステータス
  const excludedStatuses = ["紐付け前", "結果待ち"]
  if (excludedStatuses.includes(candidate.candidateStatus)) {
    return "excluded"
  }

  if (hoursDiff <= 6) return "normal"
  if (hoursDiff <= 24) return "warning"
  if (hoursDiff <= 72) return "danger"
  return "critical"
}

// 優先度ステータスを計算
export function calculatePriorityStatus(candidate: Candidate): PriorityStatus | null {
  if (!candidate.nextScheduledDate) return null

  const now = new Date()
  const scheduledDate = new Date(candidate.nextScheduledDate)
  const daysDiff = Math.floor((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff < 0) return "overdue"
  if (daysDiff === 0) return "critical"
  if (daysDiff <= 2) return "danger"
  if (daysDiff <= 6) return "warning"
  return "normal"
}

// 要返信フラグを計算
export function calculateRequiresResponse(candidate: Candidate): boolean {
  // AI判定がACTION_REQUIREDで、かつ受信メッセージの場合
  if (candidate.lastMessageAIJudgment === "ACTION_REQUIRED" && candidate.lastMessageDirection === "in") {
    return true
  }
  return false
}

// 要返信の背景色を計算
export function getRequiresResponseBackgroundColor(candidate: Candidate): string {
  if (!calculateRequiresResponse(candidate)) {
    return ""
  }

  const now = new Date()
  const lastMessageTime = new Date(candidate.lastMessageReceivedAt)
  const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60)

  if (hoursDiff <= 6) return "bg-white"
  if (hoursDiff <= 24) return "bg-orange-50"
  return "bg-red-50"
}

// 経過時間のテキストを取得
export function getElapsedTimeText(lastMessageTime: string): string {
  const now = new Date()
  const messageTime = new Date(lastMessageTime)
  const diffMs = now.getTime() - messageTime.getTime()
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}日前`
  } else if (hours > 0) {
    return `${hours}時間前`
  } else {
    const minutes = Math.floor(diffMs / (1000 * 60))
    return `${minutes}分前`
  }
}

// 残日数のテキストを取得
export function getRemainingDaysText(scheduledDate: string): string {
  const now = new Date()
  const scheduled = new Date(scheduledDate)
  const daysDiff = Math.floor((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) {
    return `${Math.abs(daysDiff)}日超過`
  } else if (daysDiff === 0) {
    return "当日"
  } else if (daysDiff === 1) {
    return "明日"
  } else {
    return `${daysDiff}日後`
  }
}

// 遅延ステータスの色を取得
export function getDelayStatusColor(status: DelayStatus): string {
  switch (status) {
    case "normal":
      return "bg-white text-gray-900"
    case "warning":
      return "bg-orange-50 text-orange-700"
    case "danger":
      return "bg-orange-100 text-orange-800"
    case "critical":
      return "bg-red-100 text-red-800"
    case "excluded":
      return "bg-gray-100 text-gray-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

// 優先度ステータスの色を取得
export function getPriorityStatusColor(status: PriorityStatus): string {
  switch (status) {
    case "normal":
      return "bg-white text-gray-900"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "danger":
      return "bg-orange-100 text-orange-800"
    case "critical":
      return "bg-red-100 text-red-800"
    case "overdue":
      return "bg-red-200 text-red-900"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

// 候補者をソート
export function sortCandidates(candidates: Candidate[], sortBy: string = "priority"): Candidate[] {
  const sorted = [...candidates]
  
  switch (sortBy) {
    case "priority":
      // 優先度順: 期日超過 > 当日 > 2日以内 > 3-6日 > その他
      return sorted.sort((a, b) => {
        const aPriority = calculatePriorityStatus(a)
        const bPriority = calculatePriorityStatus(b)
        
        const priorityOrder = { overdue: 0, critical: 1, danger: 2, warning: 3, normal: 4 }
        const aOrder = aPriority ? priorityOrder[aPriority] : 5
        const bOrder = bPriority ? priorityOrder[bPriority] : 5
        
        if (aOrder !== bOrder) return aOrder - bOrder
        
        // 同じ優先度の場合は遅延ステータスでソート
        const aDelay = calculateDelayStatus(a)
        const bDelay = calculateDelayStatus(b)
        const delayOrder = { critical: 0, danger: 1, warning: 2, normal: 3, excluded: 4 }
        return delayOrder[aDelay] - delayOrder[bDelay]
      })
      
    case "delay":
      // 遅延順
      return sorted.sort((a, b) => {
        const aDelay = calculateDelayStatus(a)
        const bDelay = calculateDelayStatus(b)
        const delayOrder = { critical: 0, danger: 1, warning: 2, normal: 3, excluded: 4 }
        return delayOrder[aDelay] - delayOrder[bDelay]
      })
      
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
      
    case "lastMessage":
      return sorted.sort((a, b) => 
        new Date(b.lastMessageReceivedAt).getTime() - new Date(a.lastMessageReceivedAt).getTime()
      )
      
    default:
      return sorted
  }
}

// 候補者をフィルタ
export function filterCandidates(
  candidates: Candidate[], 
  filters: {
    search?: string
    status?: string[]
    assignedCA?: string[]
    delayStatus?: DelayStatus[]
    priorityStatus?: PriorityStatus[]
    showOverdueOnly?: boolean
    showDelayedOnly?: boolean
    country?: string[]
    residence?: string[]
    desiredLocation?: string[]
    gender?: string[]
    residenceStatus?: string[]
    japaneseLevel?: string[]
    requiresResponse?: boolean
  }
): Candidate[] {
  return candidates.filter(candidate => {
    // 検索フィルタ
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const searchFields = [
        candidate.name,
        candidate.candidateNo,
        candidate.country,
        candidate.desiredJob,
        candidate.assignedCA,
        candidate.notes
      ]
      if (!searchFields.some(field => field.toLowerCase().includes(searchLower))) {
        return false
      }
    }

    // ステータスフィルタ
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(candidate.candidateStatus)) {
        return false
      }
    }

    // 担当CAフィルタ
    if (filters.assignedCA && filters.assignedCA.length > 0) {
      if (!filters.assignedCA.includes(candidate.assignedCA)) {
        return false
      }
    }

    // 遅延ステータスフィルタ
    if (filters.delayStatus && filters.delayStatus.length > 0) {
      const delayStatus = calculateDelayStatus(candidate)
      if (!filters.delayStatus.includes(delayStatus)) {
        return false
      }
    }

    // 優先度ステータスフィルタ
    if (filters.priorityStatus && filters.priorityStatus.length > 0) {
      const priorityStatus = calculatePriorityStatus(candidate)
      if (!priorityStatus || !filters.priorityStatus.includes(priorityStatus)) {
        return false
      }
    }

    // 期日超過のみ表示
    if (filters.showOverdueOnly) {
      const priorityStatus = calculatePriorityStatus(candidate)
      if (priorityStatus !== "overdue") {
        return false
      }
    }

    // 遅延のみ表示
    if (filters.showDelayedOnly) {
      const delayStatus = calculateDelayStatus(candidate)
      if (delayStatus === "normal" || delayStatus === "excluded") {
        return false
      }
    }

    // 国籍フィルタ
    if (filters.country && filters.country.length > 0) {
      if (!filters.country.includes(candidate.country)) {
        return false
      }
    }

    // 移住地フィルタ
    if (filters.residence && filters.residence.length > 0) {
      if (!filters.residence.includes(candidate.residence)) {
        return false
      }
    }

    // 希望勤務先フィルタ
    if (filters.desiredLocation && filters.desiredLocation.length > 0) {
      if (!filters.desiredLocation.includes(candidate.desiredLocation)) {
        return false
      }
    }

    // 性別フィルタ
    if (filters.gender && filters.gender.length > 0) {
      if (!filters.gender.includes(candidate.gender)) {
        return false
      }
    }

    // 在留資格フィルタ
    if (filters.residenceStatus && filters.residenceStatus.length > 0) {
      if (!filters.residenceStatus.includes(candidate.residenceStatus)) {
        return false
      }
    }

    // 要返信フィルタ
    if (filters.requiresResponse !== undefined) {
      const requiresResponse = calculateRequiresResponse(candidate)
      if (requiresResponse !== filters.requiresResponse) {
        return false
      }
    }

    // 日本語レベルフィルタ（モックデータには日本語レベルフィールドがないため、一時的にスキップ）
    // if (filters.japaneseLevel && filters.japaneseLevel.length > 0) {
    //   if (!filters.japaneseLevel.includes(candidate.japaneseLevel)) {
    //     return false
    //   }
    // }

    return true
  })
}
