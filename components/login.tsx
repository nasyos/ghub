"use client"

import type React from "react"
import { PasswordReset } from "./password-reset"
import { ResetConfirmation } from "./reset-confirmation"
import { NewPassword } from "./new-password"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [resetStep, setResetStep] = useState<"login" | "reset" | "confirm" | "newPassword">("login")
  const [resetEmail, setResetEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }

    const success = await login(email, password)
    if (!success) {
      setError("メールアドレスまたはパスワードが正しくありません")
    }
  }

  const handleBackToLogin = () => {
    setResetStep("login")
    setResetEmail("")
    setResetToken("")
    setError("")
  }

  const handleResetRequested = (email: string) => {
    setResetEmail(email)
    setResetStep("confirm")
  }

  const handleTokenVerified = (token: string) => {
    setResetToken(token)
    setResetStep("newPassword")
  }

  const handlePasswordReset = () => {
    setResetStep("login")
    setResetEmail("")
    setResetToken("")
    setError("")
  }

  if (resetStep === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">G-Hub</h1>
              <p className="text-base text-gray-700 font-medium">GlobalHire Hub 外国人材紹介システム</p>
            </div>
          </div>
          <PasswordReset onBack={handleBackToLogin} onResetRequested={handleResetRequested} />
        </div>
      </div>
    )
  }

  if (resetStep === "confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">G-Hub</h1>
              <p className="text-base text-gray-700 font-medium">GlobalHire Hub 外国人材紹介システム</p>
            </div>
          </div>
          <ResetConfirmation email={resetEmail} onBack={handleBackToLogin} onTokenVerified={handleTokenVerified} />
        </div>
      </div>
    )
  }

  if (resetStep === "newPassword") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">G-Hub</h1>
              <p className="text-base text-gray-700 font-medium">GlobalHire Hub 外国人材紹介システム</p>
            </div>
          </div>
          <NewPassword token={resetToken} onPasswordReset={handlePasswordReset} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">G-Hub</h1>
            <p className="text-base text-gray-700 font-medium">GlobalHire Hub 外国人材紹介システム</p>
          </div>
          <p className="text-gray-600">Facebookメッセンジャー管理システム</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>アカウント情報を入力してログインしてください</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>
            <div className="text-center">
              <Button variant="link" onClick={() => setResetStep("reset")} disabled={isLoading} className="text-sm">
                パスワードを忘れた方はこちら
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* デモアカウント情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">デモアカウント</CardTitle>
            <CardDescription className="text-xs">
              以下のアカウントでログインできます（パスワード: password）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword("password")
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-gray-500">{account.email}</p>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{account.role}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const demoAccounts = [
  { email: "admin@company.com", role: "管理者", name: "田中 太郎" },
  { email: "sato@company.com", role: "CA", name: "佐藤 花子" },
  { email: "suzuki@company.com", role: "CA", name: "鈴木 一郎" },
  { email: "takahashi@company.com", role: "CA", name: "高橋 美咲" },
]
