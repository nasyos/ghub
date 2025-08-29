"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { publish } from "@/lib/event-bus"

const COUNTRIES = [
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
  "ペルー",
  "ネパール",
  "バングラデシュ",
  "スリランカ",
  "ミャンマー",
  "カンボジア",
  "イギリス",
  "フランス",
  "ドイツ",
  "イタリア",
  "スペイン",
  "ロシア",
  "カナダ",
  "オーストラリア",
  "ニュージーランド",
  "南アフリカ",
  "エジプト",
  "ナイジェリア",
  "ケニア",
  "その他",
]

interface ApplyFormProps {
  onBack?: () => void
}

export function ApplyForm({ onBack }: ApplyFormProps) {
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [customCountry, setCustomCountry] = useState("")
  const [applyRef, setApplyRef] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get("ref")
      if (ref) {
        setApplyRef(ref)
        // Store in localStorage for persistence
        localStorage.setItem("apply_last_ref", ref)
      } else {
        // Try to load from localStorage if no URL param
        const lastRef = localStorage.getItem("apply_last_ref")
        if (lastRef) setApplyRef(lastRef)
      }
    }
  }, [])

  const generateCandidateNo = () => {
    const now = new Date()
    const yy = now.getFullYear().toString().slice(-2)
    const mm = (now.getMonth() + 1).toString().padStart(2, "0")
    const dd = now.getDate().toString().padStart(2, "0")
    const xxxx = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `${yy}${mm}${dd}-${xxxx}`
  }

  const findAssignedCA = (ref: string) => {
    try {
      const refs = JSON.parse(localStorage.getItem("apply_links") || "{}")
      const entry = Object.entries(refs).find(([caId, data]: [string, any]) => data.ref === ref)
      return entry ? Number.parseInt(entry[0]) : null
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "エラー",
        description: "氏名を入力してください。",
        variant: "destructive",
      })
      return
    }

    const finalCountry = country === "その他" ? customCountry.trim() : country
    if (!finalCountry) {
      toast({
        title: "エラー",
        description: "国籍を選択または入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const candidateNo = generateCandidateNo()
      const assignedCAId = findAssignedCA(applyRef)

      const newCandidate = {
        id: Date.now(), // Simple ID generation
        candidateNo,
        name: name.trim(),
        country: finalCountry,
        gender: "",
        age: null,
        desiredJob: "",
        desiredLocation: "",
        status: "active",
        candidateStatus: "面談前", // Initial status
        residenceStatus: "",
        residenceExpiry: "",
        lastContact: new Date()
          .toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/\//g, "-"),
        avatar: "/placeholder.svg?height=40&width=40",
        residence: "",
        applicationRoute: "応募フォーム",
        applicationLink: "",
        facebookProfile: "",
        messengerLink: "",
        assignedCA: assignedCAId ? `CA${assignedCAId}` : "",
        assigned_ca_id: assignedCAId,
        facebook_user_id: null,
        page_id: null,
        external_id: null,
        notes: `REF: ${applyRef}`,
        createdAt: new Date().toISOString(),
      }

      const existingCandidates = JSON.parse(localStorage.getItem("candidates_data") || "[]")
      existingCandidates.push(newCandidate)
      localStorage.setItem("candidates_data", JSON.stringify(existingCandidates))

      if (assignedCAId) {
        publish({
          type: "NEW_CANDIDATE_CREATED",
          payload: {
            candidateNo,
            candidateName: name.trim(),
            assignedCAId,
          },
        })
      }

      toast({
        title: "応募を受け付けました",
        description: `受付番号: ${candidateNo}`,
      })

      // Reset form
      setName("")
      setCountry("")
      setCustomCountry("")

      // Navigate back after short delay
      setTimeout(() => {
        if (onBack) onBack()
      }, 2000)
    } catch (error) {
      toast({
        title: "エラー",
        description: "応募の処理中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>応募フォーム</CardTitle>
          <CardDescription>以下の情報を入力して応募してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">氏名 *</Label>
              <Input
                id="name"
                data-testid="apply-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">国籍 *</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger data-testid="apply-country">
                  <SelectValue placeholder="国籍を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {country === "その他" && (
              <div className="space-y-2">
                <Label htmlFor="customCountry">国籍（その他）</Label>
                <Input
                  id="customCountry"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="国籍を入力してください"
                />
              </div>
            )}

            {/* Hidden REF field for debugging */}
            <input type="hidden" data-testid="apply-ref-debug" value={applyRef} />

            <Button type="submit" data-testid="apply-submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "送信"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
