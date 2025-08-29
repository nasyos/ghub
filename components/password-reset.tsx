"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface PasswordResetProps {
  onBack: () => void
  onResetRequested: (email: string) => void
}

export function PasswordReset({ onBack, onResetRequested }: PasswordResetProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { requestPasswordReset, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("メールアドレスを入力してください")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("有効なメールアドレスを入力してください")
      return
    }

    const success = await requestPasswordReset(email)
    if (success) {
      setSuccess(true)
      setTimeout(() => {
        onResetRequested(email)
      }, 2000)
    } else {
      setError("このメールアドレスは登録されていません")
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-900">メール送信完了</CardTitle>
          <CardDescription>パスワードリセットの手順をメールで送信しました</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-800">
                <strong>{email}</strong> にパスワードリセットのリンクを送信しました。
              </p>
              <p className="mt-2 text-xs text-green-700">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>
            <p className="text-sm text-muted-foreground">リセット確認画面に自動で移動します...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-auto">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              パスワードリセット
            </CardTitle>
            <CardDescription>登録済みのメールアドレスを入力してください</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">メールアドレス</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your-email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  リセットメールを送信
                </>
              )}
            </Button>

            <div className="text-center">
              <Button variant="link" onClick={onBack} disabled={isLoading}>
                ログイン画面に戻る
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">デモ用メールアドレス:</h4>
          <div className="space-y-1 text-xs text-blue-800">
            <p>• admin@company.com</p>
            <p>• sato@company.com</p>
            <p>• suzuki@company.com</p>
            <p>• takahashi@company.com</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
