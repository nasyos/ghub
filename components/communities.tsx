"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ExternalLink, Edit, Trash2, Plus } from "lucide-react"
import { subscribe } from "@/lib/event-bus"

interface Community {
  id: string
  name: string
  facebookUrl?: string
  country: string
  caComment?: string
  updatedAt: string
}

const countries = [
  "日本",
  "アメリカ",
  "中国",
  "韓国",
  "ベトナム",
  "フィリピン",
  "インド",
  "タイ",
  "インドネシア",
  "ブラジル",
]

export function Communities() {
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: "1",
      name: "東京外国人コミュニティ",
      facebookUrl: "https://facebook.com/groups/tokyo-foreigners",
      country: "日本",
      caComment: "IT系の求人に反応が良い",
      updatedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "ベトナム人エンジニア会",
      facebookUrl: "https://facebook.com/groups/vietnam-engineers-jp",
      country: "ベトナム",
      caComment: "技術レベルが高い人材が多い",
      updatedAt: "2024-01-14",
    },
  ])

  const [keyword, setKeyword] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    facebookUrl: "",
    country: "",
    caComment: "",
  })
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredCommunities = communities.filter((community) => {
    const matchesKeyword =
      !keyword ||
      community.name.toLowerCase().includes(keyword.toLowerCase()) ||
      community.facebookUrl?.toLowerCase().includes(keyword.toLowerCase()) ||
      community.caComment?.toLowerCase().includes(keyword.toLowerCase())

    const matchesCountry = selectedCountry === "all" || community.country === selectedCountry

    return matchesKeyword && matchesCountry
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("community_prefill")
      if (raw) {
        const v = JSON.parse(raw)
        if (v?.keyword) setKeyword(v.keyword)
        localStorage.removeItem("community_prefill")
        setTimeout(() => searchRef.current?.focus(), 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    return subscribe((e) => {
      if (e.type === "OPEN_COMMUNITIES_WITH") {
        if (e.payload?.keyword) setKeyword(e.payload.keyword)
        setTimeout(() => {
          searchRef.current?.focus()
          if (e.payload?.scroll !== false) {
            document.getElementById("community-toolbar")?.scrollIntoView({ behavior: "smooth" })
          }
        }, 0)
      }
    })
  }, [])

  const handleAdd = () => {
    setEditingCommunity(null)
    setFormData({ name: "", facebookUrl: "", country: "", caComment: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (community: Community) => {
    setEditingCommunity(community)
    setFormData({
      name: community.name,
      facebookUrl: community.facebookUrl || "",
      country: community.country,
      caComment: community.caComment || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "エラー", description: "コミュニティ名は必須です", variant: "destructive" })
      return
    }

    if (formData.facebookUrl && !/^https?:\/\/\S+$/.test(formData.facebookUrl)) {
      toast({ title: "エラー", description: "正しいURL形式で入力してください", variant: "destructive" })
      return
    }

    const now = new Date().toISOString().split("T")[0]

    if (editingCommunity) {
      setCommunities((prev) =>
        prev.map((c) => (c.id === editingCommunity.id ? { ...c, ...formData, updatedAt: now } : c)),
      )
    } else {
      const newCommunity: Community = {
        id: Date.now().toString(),
        ...formData,
        updatedAt: now,
      }
      setCommunities((prev) => [...prev, newCommunity])
    }

    setIsDialogOpen(false)
    toast({ title: "保存しました" })
  }

  const handleDelete = (id: string) => {
    setCommunities((prev) => prev.filter((c) => c.id !== id))
    toast({ title: "削除しました" })
  }

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">コミュニティ管理</h1>
        <Button onClick={handleAdd} data-testid="community-add">
          <Plus className="h-4 w-4 mr-2" />
          追加
        </Button>
      </div>

      <div id="community-toolbar" className="flex gap-4">
        <Input
          data-testid="community-search-input"
          ref={searchRef}
          placeholder="キーワード検索（名前・URL・コメント）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="国を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredCommunities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">登録がありません</div>
      ) : (
        <Table data-testid="community-table">
          <TableHeader>
            <TableRow>
              <TableHead>コミュニティ名</TableHead>
              <TableHead>Facebook URL</TableHead>
              <TableHead>国</TableHead>
              <TableHead>CAコメント</TableHead>
              <TableHead>更新日</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommunities.map((community) => (
              <TableRow key={community.id}>
                <TableCell className="font-medium">{community.name}</TableCell>
                <TableCell>
                  {community.facebookUrl ? (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleOpenLink(community.facebookUrl!)}
                      data-testid="community-open-link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      リンクを開く
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{community.country}</TableCell>
                <TableCell className="max-w-xs truncate">{community.caComment || "-"}</TableCell>
                <TableCell>{community.updatedAt}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(community)}
                      data-testid="community-edit"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(community.id)}
                      data-testid="community-delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCommunity ? "コミュニティ編集" : "コミュニティ追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">コミュニティ名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="コミュニティ名を入力"
              />
            </div>
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={formData.facebookUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/groups/..."
              />
            </div>
            <div>
              <Label htmlFor="country">国</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="国を選択" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="caComment">CAコメント</Label>
              <Textarea
                id="caComment"
                value={formData.caComment}
                onChange={(e) => setFormData((prev) => ({ ...prev, caComment: e.target.value }))}
                placeholder="コメントを入力"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
