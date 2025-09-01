"use client"

import { useState } from "react"
import { CandidatesTable } from "@/components/candidates-table"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/common/PageHeader"
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle
} from "lucide-react"

interface CandidatesPageProps {
  onNavigateToDetail?: (candidateId: string) => void
}

export default function CandidatesPage({ onNavigateToDetail }: CandidatesPageProps) {
  return (
    <div className="flex flex-col h-full c-candidates">
      {/* ヘッダー */}
      <PageHeader 
        title="求職者管理"
        description="求職者の進捗と対応状況を管理します"
      />

      {/* 統計カード */}
      <div className="p-3">
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm c-candidates__kpi-card">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">総求職者数</p>
                  <p className="text-lg font-bold leading-tight">127名</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm c-candidates__kpi-card">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">対応待ち</p>
                  <p className="text-lg font-bold leading-tight">23名</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm c-candidates__kpi-card">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">期限切れ要対応</p>
                  <p className="text-lg font-bold leading-tight">8名</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm c-candidates__kpi-card">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">本日予定</p>
                  <p className="text-lg font-bold leading-tight">5件</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 候補者テーブル */}
      <div className="flex-1 overflow-hidden px-3 pb-3">
        <CandidatesTable onNavigateToDetail={onNavigateToDetail} />
      </div>
    </div>
  )
}

// 求職者管理画面専用のコンパクト化スタイル
const candidatesStyles = `
  .c-candidates__desc {
    display: none;
  }
  
  .c-candidates__kpi-card {
    min-height: auto;
  }
  
  .c-candidates__kpi-card .p-2\\.5 {
    padding: 0.625rem;
  }
  
  .c-candidates__table .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
  
  .c-candidates__table .gap-3 {
    gap: 0.75rem;
  }
  
  .c-candidates__table .space-y-3 > div > .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
`

// スタイルを適用
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = candidatesStyles
  document.head.appendChild(styleElement)
}
