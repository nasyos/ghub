import { NextRequest, NextResponse } from "next/server";
import { mockPartners } from "@/lib/partners/data";
import { updatePartnerSchema } from "@/lib/partners/schema";
import { Partner } from "@/lib/partners/types";

// TODO: 後日 Prisma などの ORM に切り替える際は、このファイルを削除し、
// Server Actions または Route Handlers で直接 PartnerRepository を使用する

// メモリ配列（実際のアプリケーションではデータベースを使用）
let partners: Partner[] = [...mockPartners];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partner = partners.find(p => p.id === params.id);
    
    if (!partner) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json(
      { error: "取引先の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = updatePartnerSchema.parse(body);
    
    const partnerIndex = partners.findIndex(p => p.id === params.id);
    
    if (partnerIndex === -1) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }
    
    // 取引先を更新
    partners[partnerIndex] = {
      ...partners[partnerIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(partners[partnerIndex]);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "取引先の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerIndex = partners.findIndex(p => p.id === params.id);
    
    if (partnerIndex === -1) {
      return NextResponse.json(
        { error: "取引先が見つかりません" },
        { status: 404 }
      );
    }
    
    const deletedPartner = partners[partnerIndex];
    partners.splice(partnerIndex, 1);
    
    return NextResponse.json(deletedPartner);
  } catch (error) {
    return NextResponse.json(
      { error: "取引先の削除に失敗しました" },
      { status: 500 }
    );
  }
}
