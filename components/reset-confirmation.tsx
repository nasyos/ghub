"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Key, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface ResetConfirmationProps {
  email: string
  onBack: () => void
  onTokenVerified: (token: string) => void
}

export function ResetConfirmation({ email, onBack, onTokenVerified }: ResetConfirmationProps) {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const { verifyResetToken, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("リセットトークンを入力してください")
      return
    }

    const isValid = await verifyResetToken(token)
    if (isValid) {
      onTokenVerified(token)
    } else {
      setError("無効なトークンまたは期限切れです")
    }
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
              <Key className="h-5 w-5" />
              リセットトークン確認
            </CardTitle>
            <CardDescription>メールで送信されたリセットトークンを入力してください</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>{email}</strong> にリセットトークンを送信しました。
          </p>
          <p className="mt-1 text-xs text-blue-700">メールに記載されているトークンを下記に入力してください。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-token">リセットトークン</Label>
            <Input
              id="reset-token"
              type="text"
              placeholder="メールに記載されたトークンを入力"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
              className="font-mono"
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
                  確認中...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  トークンを確認
                </>
              )}
            </Button>

            <div className="text-center">
              <Button variant="link" onClick={onBack} disabled={isLoading}>
                戻る
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 rounded-lg bg-yellow-50 p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">デモ用:</h4>
          <p className="text-xs text-yellow-800">ブラウザの開発者ツール（F12）のコンソールでトークンを確認できます。</p>
        </div>
      </CardContent>
    </Card>
  )
}
