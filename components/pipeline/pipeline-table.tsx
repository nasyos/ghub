"use client"

import { useState } from "react"
import { ApplicationRow, FitLevel, MustMatchSummary } from "@/lib/pipeline/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Send, 
  Calendar, 
  CheckCircle, 
  RotateCcw, 
  Clock,
  User,
  Building,
  Target,
  Star,
  Users,
  MessageSquare,
  CalendarDays,
  MoreHorizontal
} from "lucide-react"

interface PipelineTableProps {
  applications: ApplicationRow[]
  loading: boolean
  onRowClick: (application: ApplicationRow) => void
  jobFilterActive?: boolean
}

const getDaysSinceLastActivity = (lastActivityAt: string): number => {
  const now = new Date()
  const lastActivity = new Date(lastActivityAt)
  const diffTime = Math.abs(now.getTime() - lastActivity.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const getDaysBadgeVariant = (days: number): "default" | "secondary" | "destructive" => {
  if (days <= 1) return "default"
  if (days <= 3) return "secondary"
  return "destructive"
}

const getDaysText = (days: number): string => {
  if (days === 0) return "今日"
  if (days === 1) return "昨日"
  return `${days}日前`
}

const getFitLevelColor = (level: FitLevel): string => {
  switch (level) {
    case "High": return "bg-green-100 text-green-800"
    case "Mid": return "bg-yellow-100 text-yellow-800"
    case "Low": return "bg-red-100 text-red-800"
  }
}

const getMustMatchColor = (summary: MustMatchSummary): string => {
  switch (summary) {
    case "全✓": return "bg-green-100 text-green-800"
    case "△含む": return "bg-yellow-100 text-yellow-800"
    case "×あり": return "bg-red-100 text-red-800"
  }
}

const getNextActionIcon = (action: string) => {
  switch (action) {
    case "推薦送付": return <Send className="h-4 w-4" />
    case "候補日提示": return <Calendar className="h-4 w-4" />
    case "日程確定": return <CheckCircle className="h-4 w-4" />
    case "結果入力": return <CheckCircle className="h-4 w-4" />
    case "差戻し": return <RotateCcw className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

const getActionButtons = (application: ApplicationRow, jobFilterActive: boolean) => {
  const buttons = []
  
  if (jobFilterActive) {
    // 求人スコープモード: 推・選ボタン
    buttons.push(
      <Tooltip key="recommend">
        <TooltipTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              // Drawerで推薦タブを開く処理は後で実装
            }}
          >
            <Send className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>推薦を開く</TooltipContent>
      </Tooltip>
    )
    
    buttons.push(
      <Tooltip key="progress">
        <TooltipTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              // Drawerで選考タブを開く処理は後で実装
            }}
          >
            <Calendar className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>選考を開く</TooltipContent>
      </Tooltip>
    )
  } else {
    // 横断版モード: 次アクションに応じたボタン
    switch (application.next_action) {
      case "推薦送付":
        buttons.push(
          <Tooltip key="recommend">
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                <Send className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>推薦文作成</TooltipContent>
          </Tooltip>
        )
        break
      case "候補日提示":
      case "日程確定":
        buttons.push(
          <Tooltip key="schedule">
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                <Calendar className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>日程管理</TooltipContent>
          </Tooltip>
        )
        break
      case "結果入力":
        buttons.push(
          <Tooltip key="result">
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                <CheckCircle className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>結果入力</TooltipContent>
          </Tooltip>
        )
        break
    }
  }
  
  // 詳細ボタンは常に表示
  buttons.push(
    <Tooltip key="detail">
      <TooltipTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>詳細</TooltipContent>
    </Tooltip>
  )
  
  return buttons
}

export function PipelineTable({ 
  applications, 
  loading, 
  onRowClick, 
  jobFilterActive = false
}: PipelineTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(applications.map(app => app.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="overflow-auto h-full">
        <table className="w-full border-collapse min-w-[800px]">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="p-3 text-left">
                <Checkbox 
                  checked={selectedIds.length === applications.length && applications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left text-sm font-medium">ステージ／次アクション</th>
              <th className="p-3 text-left text-sm font-medium">求職者</th>
              {!jobFilterActive && (
                <th className="p-3 text-left text-sm font-medium">求人／企業</th>
              )}
              <th className="p-3 text-left text-sm font-medium">適合度</th>
              <th className="p-3 text-left text-sm font-medium">担当</th>
              <th className="p-3 text-left text-sm font-medium">最終更新</th>
              <th className="p-3 text-left text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const days = getDaysSinceLastActivity(app.last_activity_at)
              
              return (
                <tr 
                  key={app.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onRowClick(app)}
                  style={{ height: '70px' }}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(app.id)}
                      onCheckedChange={(checked) => handleSelectRow(app.id, checked as boolean)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {app.stage}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getNextActionIcon(app.next_action)}
                        <span>{app.next_action}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm break-words">{app.candidate.name}</div>
                        {app.candidate.code && (
                          <div className="text-xs text-muted-foreground">{app.candidate.code}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {!jobFilterActive && (
                    <td className="p-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm break-words">{app.job.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span className="break-words">{app.job.company}</span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="p-3">
                    <Badge className={`text-xs ${getFitLevelColor(app.fit_level)}`}>
                      {app.fit_level}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="break-words">{app.owners.ra}</span>
                      </div>
                      {app.owners.ca && (
                        <div className="text-xs text-muted-foreground break-words">
                          CA: {app.owners.ca}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant={getDaysBadgeVariant(days)} className="text-xs">
                          {getDaysText(days)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>最終更新: {new Date(app.last_activity_at).toLocaleString('ja-JP')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      {getActionButtons(app, jobFilterActive)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {jobFilterActive ? (
              <div className="text-center">
                <p className="mb-2">この求人に紐づく選考はありません</p>
                <p className="text-sm">求職者を追加して選考を開始してください</p>
              </div>
            ) : (
              "データがありません"
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
