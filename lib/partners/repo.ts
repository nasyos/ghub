import { Partner, CreatePartnerRequest, UpdatePartnerRequest } from "./types";

// 現在のAPI呼び出しを集約したデータアクセス層
// 後日 Prisma などの ORM に切り替える際は、このファイル内の実装を変更するだけで済む

export class PartnerRepository {
  private baseUrl = "/api/partners";

  // 取引先一覧を取得
  async getList(): Promise<Partner[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch partners: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("取引先一覧の取得に失敗しました:", error);
      throw error;
    }
  }

  // 指定IDの取引先を取得
  async getById(id: string): Promise<Partner> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch partner: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("取引先の取得に失敗しました:", error);
      throw error;
    }
  }

  // 新規取引先を作成
  async create(data: CreatePartnerRequest): Promise<Partner> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create partner");
      }
      return await response.json();
    } catch (error) {
      console.error("取引先の作成に失敗しました:", error);
      throw error;
    }
  }

  // 取引先を更新
  async update(id: string, data: UpdatePartnerRequest): Promise<Partner> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update partner");
      }
      return await response.json();
    } catch (error) {
      console.error("取引先の更新に失敗しました:", error);
      throw error;
    }
  }

  // 取引先を削除
  async remove(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete partner");
      }
    } catch (error) {
      console.error("取引先の削除に失敗しました:", error);
      throw error;
    }
  }
}

// シングルトンインスタンス
export const partnerRepo = new PartnerRepository();

/*
===============================================================================
Prisma への移行スケッチ
===============================================================================

1. schema.prisma に追加するモデル定義:

model Partner {
  id            String   @id @default(cuid())
  name          String
  owner         String
  email         String?
  phone         String?
  address       String?
  rank          String?  // "A" | "B" | "C"
  tags          String[] // Prisma の配列型
  note          String?
  lastContactAt DateTime?
  deals         Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("partners")
}

2. Prisma Client を使用した実装例:

import { PrismaClient } from '@prisma/client'
import { Partner, CreatePartnerRequest, UpdatePartnerRequest } from "./types";

const prisma = new PrismaClient();

export class PartnerRepository {
  // 取引先一覧を取得
  async getList(): Promise<Partner[]> {
    try {
      const partners = await prisma.partner.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return partners;
    } catch (error) {
      console.error("取引先一覧の取得に失敗しました:", error);
      throw error;
    }
  }

  // 指定IDの取引先を取得
  async getById(id: string): Promise<Partner> {
    try {
      const partner = await prisma.partner.findUnique({
        where: { id }
      });
      if (!partner) {
        throw new Error("Partner not found");
      }
      return partner;
    } catch (error) {
      console.error("取引先の取得に失敗しました:", error);
      throw error;
    }
  }

  // 新規取引先を作成
  async create(data: CreatePartnerRequest): Promise<Partner> {
    try {
      const partner = await prisma.partner.create({
        data: {
          name: data.name,
          owner: data.owner,
          email: data.email,
          phone: data.phone,
          address: data.address,
          rank: data.rank,
          tags: data.tags || [],
          note: data.note,
          lastContactAt: data.lastContactAt,
          deals: data.deals,
        }
      });
      return partner;
    } catch (error) {
      console.error("取引先の作成に失敗しました:", error);
      throw error;
    }
  }

  // 取引先を更新
  async update(id: string, data: UpdatePartnerRequest): Promise<Partner> {
    try {
      const partner = await prisma.partner.update({
        where: { id },
        data: {
          name: data.name,
          owner: data.owner,
          email: data.email,
          phone: data.phone,
          address: data.address,
          rank: data.rank,
          tags: data.tags,
          note: data.note,
          lastContactAt: data.lastContactAt,
          deals: data.deals,
        }
      });
      return partner;
    } catch (error) {
      console.error("取引先の更新に失敗しました:", error);
      throw error;
    }
  }

  // 取引先を削除
  async remove(id: string): Promise<void> {
    try {
      await prisma.partner.delete({
        where: { id }
      });
    } catch (error) {
      console.error("取引先の削除に失敗しました:", error);
      throw error;
    }
  }
}

3. API ルートの変更:
現在の API ルートは最終的にサーバー関数で直接DBアクセスに変更予定。
Next.js App Router の Server Actions または Route Handlers で直接 PartnerRepository を使用する。

例: app/api/partners/route.ts
import { partnerRepo } from "@/lib/partners/repo";

export async function GET() {
  try {
    const partners = await partnerRepo.getList();
    return Response.json(partners);
  } catch (error) {
    return Response.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const partner = await partnerRepo.create(data);
    return Response.json(partner);
  } catch (error) {
    return Response.json({ error: "Failed to create partner" }, { status: 500 });
  }
}

===============================================================================
*/
