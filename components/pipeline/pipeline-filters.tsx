"use client"

import { useState } from "react"
import { PipelineFilters as PipelineFiltersType } from "@/lib/pipeline/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Filter, 
  Search, 
  X,
  User,
  Building,
  Target,
  Star,
  Clock,
  Users,
  Calendar,
  CheckCircle
} from "lucide-react"

interface PipelineFiltersProps {
  filters: PipelineFiltersType
  onFiltersChange: (filters: PipelineFiltersType) => void
  jobFilterActive: boolean
}

export function PipelineFilters({ filters, onFiltersChange, jobFilterActive }: PipelineFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleQuickFilterToggle = (key: keyof PipelineFiltersType) => {
    const newFilters = { ...filters }
    if (key in newFilters) {
      delete newFilters[key]
    } else {
      newFilters[key] = true
    }
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, q: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className="border-b p-4 space-y-4">
      {/* 検索バー */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="求職者名、求人名、企業名、メモで検索..."
            value={filters.q || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              詳細フィルタ
            </Button>
          </SheetTrigger>
          <SheetContent className="w-96">
            <SheetHeader>
              <SheetTitle>詳細フィルタ</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-6">
              {/* 現在選択中のフィルタ条件 */}
              {hasActiveFilters && (
                <div className="pb-4 border-b">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">選択中:</h3>
                  <div className="flex flex-wrap gap-1">
                    {filters.q && (
                      <Badge variant="secondary" className="text-xs">
                        検索: {filters.q}
                      </Badge>
                    )}
                    {filters.stage?.map((stage) => (
                      <Badge key={stage} variant="secondary" className="text-xs">
                        ステージ: {stage}
                      </Badge>
                    ))}
                    {filters.fit?.map((fit) => (
                      <Badge key={fit} variant="secondary" className="text-xs">
                        適合度: {fit}
                      </Badge>
                    ))}
                    {filters.must?.map((must) => (
                      <Badge key={must} variant="secondary" className="text-xs">
                        必須要件: {must}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* ステージ */}
              <div>
                <h2 className="text-lg font-semibold mb-2">ステージ</h2>
                <div className="grid grid-cols-2 gap-2">
                  {["推薦済", "一次調整中", "一次確定", "一次完了", "二次調整中", "最終面接完了", "内定", "否決", "保留"].map((stage) => (
                    <div key={stage} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`stage-${stage}`}
                        checked={filters.stage?.includes(stage as any) || false}
                        onCheckedChange={(checked) => {
                          const currentStages = filters.stage || []
                          const newStages = checked 
                            ? [...currentStages, stage as any]
                            : currentStages.filter(s => s !== stage)
                          onFiltersChange({ ...filters, stage: newStages })
                        }}
                      />
                      <label htmlFor={`stage-${stage}`} className="text-sm">{stage}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 適合度 */}
              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-2">適合度</h2>
                <div className="grid grid-cols-2 gap-2">
                  {["High", "Mid", "Low"].map((fit) => (
                    <div key={fit} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`fit-${fit}`}
                        checked={filters.fit?.includes(fit as any) || false}
                        onCheckedChange={(checked) => {
                          const currentFits = filters.fit || []
                          const newFits = checked 
                            ? [...currentFits, fit as any]
                            : currentFits.filter(f => f !== fit)
                          onFiltersChange({ ...filters, fit: newFits })
                        }}
                      />
                      <label htmlFor={`fit-${fit}`} className="text-sm">{fit}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 必須要件 */}
              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-2">必須要件</h2>
                <div className="grid grid-cols-2 gap-2">
                  {["全✓", "△含む", "×あり"].map((must) => (
                    <div key={must} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`must-${must}`}
                        checked={filters.must?.includes(must as any) || false}
                        onCheckedChange={(checked) => {
                          const currentMusts = filters.must || []
                          const newMusts = checked 
                            ? [...currentMusts, must as any]
                            : currentMusts.filter(m => m !== must)
                          onFiltersChange({ ...filters, must: newMusts })
                        }}
                      />
                      <label htmlFor={`must-${must}`} className="text-sm">{must}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 更新期間 */}
              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-2">更新期間</h2>
                <Select 
                  value={filters.updatedPeriod || ""} 
                  onValueChange={(value) => onFiltersChange({ ...filters, updatedPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="期間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="1">1日以内</SelectItem>
                    <SelectItem value="3">2-3日</SelectItem>
                    <SelectItem value="7">4-7日</SelectItem>
                    <SelectItem value="8">8日以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 pt-4 border-t bg-white">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    クリア
                  </Button>
                  <Button size="sm" onClick={() => setIsSheetOpen(false)}>
                    適用
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            クリア
          </Button>
        )}
      </div>

      {/* クイックフィルタ */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.myAssignmentsOnly ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilterToggle("myAssignmentsOnly")}
        >
          <User className="h-4 w-4 mr-2" />
          自分の担当のみ
        </Button>
        <Button
          variant={filters.awaitingEmployer ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilterToggle("awaitingEmployer")}
        >
          <Building className="h-4 w-4 mr-2" />
          返信待ち（企業）
        </Button>
                 <Button
           variant={filters.awaitingCandidate ? "default" : "outline"}
           size="sm"
           onClick={() => handleQuickFilterToggle("awaitingCandidate")}
         >
           <User className="h-4 w-4 mr-2" />
           返信待ち（求職者）
         </Button>
        <Button
          variant={filters.scheduleAdjusting ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilterToggle("scheduleAdjusting")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          日程調整中
        </Button>
        <Button
          variant={filters.resultPending ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilterToggle("resultPending")}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          結果未入力
        </Button>
      </div>

      {/* アクティブフィルタ表示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.q && (
            <Badge variant="secondary" className="flex items-center gap-1">
              検索: {filters.q}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, q: undefined })}
              />
            </Badge>
          )}
          {filters.stage?.map((stage) => (
            <Badge key={stage} variant="secondary" className="flex items-center gap-1">
              ステージ: {stage}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const newStages = filters.stage?.filter(s => s !== stage) || []
                  onFiltersChange({ ...filters, stage: newStages.length > 0 ? newStages : undefined })
                }}
              />
            </Badge>
          ))}
          {filters.fit?.map((fit) => (
            <Badge key={fit} variant="secondary" className="flex items-center gap-1">
              適合度: {fit}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const newFits = filters.fit?.filter(f => f !== fit) || []
                  onFiltersChange({ ...filters, fit: newFits.length > 0 ? newFits : undefined })
                }}
              />
            </Badge>
          ))}
          {filters.must?.map((must) => (
            <Badge key={must} variant="secondary" className="flex items-center gap-1">
              必須要件: {must}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const newMusts = filters.must?.filter(m => m !== must) || []
                  onFiltersChange({ ...filters, must: newMusts.length > 0 ? newMusts : undefined })
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
