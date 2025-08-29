import { type NextRequest, NextResponse } from "next/server"
import { facebookPagesApi } from "@/lib/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "ページIDが必要です" }, { status: 400 })
    }

    // Refresh connection using the API
    const result = await facebookPagesApi.refreshConnection(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Connection refresh error:", error)
    return NextResponse.json({ success: false, error: "再接続に失敗しました" }, { status: 500 })
  }
}
