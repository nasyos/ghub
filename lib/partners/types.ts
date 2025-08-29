export interface Partner {
  id: string;
  name: string;
  department?: string; // 部署（任意）
  owner: string;
  email?: string;
  phone?: string;
  address?: string;
  rank?: "A" | "B" | "C";
  tags?: string[];
  note?: string;
  lastContactAt?: string;
  deals?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerRequest {
  name: string;
  department?: string; // 部署（任意）
  owner: string;
  email?: string;
  phone?: string;
  address?: string;
  rank?: "A" | "B" | "C";
  tags?: string[];
  note?: string;
  lastContactAt?: string;
  // deals は新規作成時には不要なので削除
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {
  deals?: number; // 更新時のみ取引数を設定可能
}
