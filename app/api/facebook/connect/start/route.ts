import { type NextRequest, NextResponse } from "next/server"
import { facebookPagesApi } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageUrl } = body

    if (!pageUrl) {
      return NextResponse.json({ success: false, error: "ページURLが必要です" }, { status: 400 })
    }

    // Start OAuth connection using the API
    const result = await facebookPagesApi.startOAuthConnection({ pageUrl })

    return NextResponse.json(result)
  } catch (error) {
    console.error("OAuth start error:", error)
    return NextResponse.json({ success: false, error: "OAuth開始に失敗しました" }, { status: 500 })
  }
}
