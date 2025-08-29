"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OAuthResultPage() {
  const searchParams = useSearchParams()
  const [isClosing, setIsClosing] = useState(false)

  const success = searchParams.get("success") === "true"
  const error = searchParams.get("error")
  const pageData = searchParams.get("page")

  let page = null
  if (pageData) {
    try {
      page = JSON.parse(decodeURIComponent(pageData))
    } catch (e) {
      console.error("Failed to parse page data:", e)
    }
  }

  useEffect(() => {
    // Send result to parent window
    if (window.opener) {
      if (success && page) {
        window.opener.postMessage(
          {
            type: "oauth-success",
            page: page,
          },
          window.location.origin,
        )
      } else if (error) {
        window.opener.postMessage(
          {
            type: "oauth-error",
            error: error,
          },
          window.location.origin,
        )
      }
    }

    // Auto-close after 3 seconds on success
    if (success) {
      const timer = setTimeout(() => {
        setIsClosing(true)
        setTimeout(() => {
          window.close()
        }, 1000)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success, error, page])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      window.close()
    }, 500)
  }

  const handleRetry = () => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "oauth-retry",
        },
        window.location.origin,
      )
    }
    handleClose()
  }

  if (isClosing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">ウィンドウを閉じています...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {success ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className={success ? "text-green-600" : "text-red-600"}>
            {success ? "接続完了！" : "接続エラー"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && page ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  「{page.name}」の接続が完了しました。アクセストークンが安全に保存され、Webhook購読も完了しました。
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">このウィンドウは自動的に閉じられます...</p>
                <Button onClick={handleClose} variant="outline" size="sm">
                  今すぐ閉じる
                </Button>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} size="sm">
                  再試行
                </Button>
                <Button onClick={handleClose} variant="outline" size="sm">
                  閉じる
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">処理中...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
