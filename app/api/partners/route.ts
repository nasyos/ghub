import { NextRequest, NextResponse } from "next/server";
import { mockPartners } from "@/lib/partners/data";
import { createPartnerSchema } from "@/lib/partners/schema";
import { Partner } from "@/lib/partners/types";

// TODO: 後日 Prisma などの ORM に切り替える際は、このファイルを削除し、
// Server Actions または Route Handlers で直接 PartnerRepository を使用する

// メモリ配列（実際のアプリケーションではデータベースを使用）
let partners: Partner[] = [...mockPartners];

export async function GET() {
  try {
    return NextResponse.json(partners);
  } catch (error) {
    return NextResponse.json(
      { error: "取引先の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = createPartnerSchema.parse(body);
    
    // 新しい取引先を作成
    const newPartner: Partner = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    partners.push(newPartner);
    
    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "取引先の作成に失敗しました" },
      { status: 500 }
    );
  }
}
