import { type NextRequest, NextResponse } from "next/server"
import { facebookPagesApi } from "@/lib/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ subscribed: false, error: "ページIDが必要です" }, { status: 400 })
    }

    // Resubscribe webhook using the API
    const result = await facebookPagesApi.resubscribeWebhook(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Webhook resubscribe error:", error)
    return NextResponse.json({ subscribed: false, error: "Webhook再購読に失敗しました" }, { status: 500 })
  }
}
