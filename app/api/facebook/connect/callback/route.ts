import { type NextRequest, NextResponse } from "next/server"
import { facebookPagesApi } from "@/lib/api"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    const errorMessage = errorDescription || "OAuth認証に失敗しました"
    return NextResponse.redirect(new URL(`/oauth-result?error=${encodeURIComponent(errorMessage)}`, request.url))
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(new URL("/oauth-result?error=無効なOAuth応答です", request.url))
  }

  try {
    // Complete OAuth connection using the API
    const result = await facebookPagesApi.completeOAuthConnection(code, state)

    if (result.success && result.page) {
      // Redirect to success page with page data
      const pageData = encodeURIComponent(JSON.stringify(result.page))
      return NextResponse.redirect(new URL(`/oauth-result?success=true&page=${pageData}`, request.url))
    } else {
      return NextResponse.redirect(
        new URL(`/oauth-result?error=${encodeURIComponent(result.error || "OAuth接続に失敗しました")}`, request.url),
      )
    }
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/oauth-result?error=OAuth処理中にエラーが発生しました", request.url))
  }
}
