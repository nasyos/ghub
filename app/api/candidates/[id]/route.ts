import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params

  // TODO: 将来はDBから取得。今はダミーを返す
  const mock = {
    id,
    name: "Nguyen Thi A",
    gender: "女性",
    age: 28,
    nationality: "ベトナム",
    status: "面接予定",
    residenceCity: "東京都渋谷区",
    desiredJob: "エンジニア",
    desiredArea: "東京都",
    visaType: "技術・人文知識・国際業務",
    visaExpiry: "2024-12-31",
    caOwner: "田中CA",
    facebookUrl: "",
    lastContactAt: "2024-01-15T14:30:00+09:00",
  }

  return NextResponse.json(mock)
}



