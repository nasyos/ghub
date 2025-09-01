"use client"

import { useState } from "react"
import { CandidatesTable } from "@/components/candidates-table"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">求職者管理</h1>
            <p className="text-muted-foreground">求職者の進捗と対応状況を管理します</p>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">総求職者数</p>
                  <p className="text-lg font-bold">127名</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">対応待ち</p>
                  <p className="text-lg font-bold">23名</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground">期限切れ要対応</p>
                  <p className="text-lg font-bold">8名</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">本日予定</p>
                  <p className="text-lg font-bold">5件</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 候補者テーブル */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <CandidatesTable onNavigateToDetail={onNavigateToDetail} />
      </div>
    </div>
  )
}
