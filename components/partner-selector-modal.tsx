"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Building2, MapPin, Phone, Mail, User, Tag } from "lucide-react"
import { Partner } from "@/lib/partners/types"
import { getMockPartners } from "@/lib/partners/data"

interface PartnerSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (partner: Partner) => void
  selectedPartnerId?: string
}

export function PartnerSelectorModal({
  open,
  onOpenChange,
  onSelect,
  selectedPartnerId
}: PartnerSelectorModalProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadPartners()
    }
  }, [open])

  useEffect(() => {
    filterPartners()
  }, [partners, searchQuery])

  const loadPartners = async () => {
    setLoading(true)
    try {
      // 実際のAPI呼び出しに置き換える
      const mockData = getMockPartners()
      setPartners(mockData)
    } catch (error) {
      console.error("取引先データの読み込みに失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    if (!searchQuery.trim()) {
      setFilteredPartners(partners)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = partners.filter(partner => 
      partner.name.toLowerCase().includes(query) ||
      partner.department?.toLowerCase().includes(query) ||
      partner.owner.toLowerCase().includes(query) ||
      partner.tags?.some(tag => tag.toLowerCase().includes(query))
    )
    setFilteredPartners(filtered)
  }

  const handleSelect = (partner: Partner) => {
    onSelect(partner)
    onOpenChange(false)
  }

  const getRankColor = (rank?: string) => {
    switch (rank) {
      case "A": return "bg-green-100 text-green-800"
      case "B": return "bg-yellow-100 text-yellow-800"
      case "C": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
                         企業を選択
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="企業名、部署、担当者、タグで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 取引先一覧 */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">読み込み中...</p>
                </div>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                企業が見つかりません
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <Card 
                  key={partner.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedPartnerId === partner.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelect(partner)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{partner.name}</h3>
                          {partner.rank && (
                            <Badge className={getRankColor(partner.rank)}>
                              ランク {partner.rank}
                            </Badge>
                          )}
                          {selectedPartnerId === partner.id && (
                            <Badge className="bg-primary text-primary-foreground">
                              選択中
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {partner.department && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3 w-3" />
                              {partner.department}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            担当: {partner.owner}
                          </div>
                          {partner.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {partner.address}
                            </div>
                          )}
                          {partner.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {partner.phone}
                            </div>
                          )}
                          {partner.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {partner.email}
                            </div>
                          )}
                        </div>

                        {partner.tags && partner.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <div className="flex gap-1 flex-wrap">
                              {partner.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <div>取引数: {partner.deals || 0}件</div>
                        {partner.lastContactAt && (
                          <div>
                            最終連絡: {new Date(partner.lastContactAt).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredPartners.length}件の企業
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
