"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Copy, ExternalLink, CheckCircle } from "lucide-react"
import { applyLinksApi, pendingApplicantsApi, type ApplyLink, type User, type FacebookPage } from "@/lib/api"

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

interface ApplyPageProps {
  params: {
    token: string
  }
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const { token } = params
  const { toast } = useToast()

  // Form states
  const [name, setName] = useState("")
  const [nationality, setNationality] = useState("")
  const [customNationality, setCustomNationality] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Token validation states
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [linkData, setLinkData] = useState<{
    link: ApplyLink
    user: User
    page: FacebookPage
  } | null>(null)

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [messageTemplate, setMessageTemplate] = useState("")

  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      setIsValidating(true)
      const result = await applyLinksApi.validateToken(token)

      if (result.valid && result.link && result.user && result.page) {
        setTokenValid(true)
        setLinkData({
          link: result.link,
          user: result.user,
          page: result.page,
        })
      } else {
        setTokenValid(false)
        setValidationError("このリンクは無効または期限切れです。")
      }
    } catch (error) {
      console.error("Token validation error:", error)
      setTokenValid(false)
      setValidationError("リンクの検証中にエラーが発生しました。")
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "エラー",
        description: "氏名を入力してください",
        variant: "destructive",
      })
      return
    }

    const finalNationality = nationality === "その他" ? customNationality.trim() : nationality
    if (!finalNationality) {
      toast({
        title: "エラー",
        description: "国籍を選択または入力してください",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "エラー",
        description: "利用規約に同意してください",
        variant: "destructive",
      })
      return
    }

    if (!linkData) {
      toast({
        title: "エラー",
        description: "リンク情報が見つかりません",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create pending applicant record
      await pendingApplicantsApi.create({
        name: name.trim(),
        nationality: finalNationality,
        refUserId: linkData.user.id,
        refPageId: linkData.page.pageId,
        status: "pre_screen",
      })

      // Generate message template
      const template = `はじめまして。応募リンクから来ました。氏名：${name.trim()}／国籍：${finalNationality}`
      setMessageTemplate(template)

      // Show success modal
      setShowSuccessModal(true)

      toast({
        title: "応募完了",
        description: "応募を受け付けました。次のステップに進んでください。",
      })
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "エラー",
        description: "応募の処理中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(messageTemplate)
      toast({
        title: "コピー完了",
        description: "テンプレートをクリップボードにコピーしました",
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "コピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleOpenFacebookDM = () => {
    if (!linkData?.page) return

    // Generate Facebook Messenger URL
    // In real implementation, this would use the actual page username
    const messengerUrl = `https://m.me/${linkData.page.pageId}?ref=apply_${token}`
    window.open(messengerUrl, "_blank")
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    // Reset form
    setName("")
    setNationality("")
    setCustomNationality("")
    setAgreedToTerms(false)
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">リンクを確認中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">リンクエラー</CardTitle>
            <CardDescription>{validationError}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">リンクが無効または期限切れの可能性があります。</p>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>応募フォーム</CardTitle>
            <CardDescription>
              {linkData?.page.name} への応募フォームです。
              <br />
              必要事項を入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">氏名 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">国籍 *</Label>
                <Select value={nationality} onValueChange={setNationality} required disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="国籍を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {nationality === "その他" && (
                <div className="space-y-2">
                  <Label htmlFor="customNationality">国籍（その他）*</Label>
                  <Input
                    id="customNationality"
                    value={customNationality}
                    onChange={(e) => setCustomNationality(e.target.value)}
                    placeholder="国籍を入力してください"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="terms" className="text-sm">
                  個人情報の取り扱いに同意します *
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "送信"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Modal with DM Guidance */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle>応募が完了しました</DialogTitle>
              <DialogDescription>
                法人ページでのやり取りを開始するため、Facebook DMで何かしらのメッセージを送ってください
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">コピー用テンプレート：</Label>
                <div className="bg-white p-3 rounded border text-sm">{messageTemplate}</div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleOpenFacebookDM} className="w-full flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  FacebookでDMを開く
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCopyTemplate}
                  className="w-full flex items-center gap-2 bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                  テンプレをコピー
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                ※ Facebookの仕様でDM入力欄の自動プレフィルは不可です。
                <br />
                必ずコピー＋貼付で送ってください。
              </div>

              <Button variant="ghost" onClick={handleCloseModal} className="w-full">
                閉じる
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
