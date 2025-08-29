import { z } from "zod";

export const createPartnerSchema = z.object({
  name: z.string().min(1, "法人名は必須です"),
  department: z.string().optional(), // 部署（任意）
  owner: z.string().min(1, "担当者は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9-]*$/, "電話番号は数字とハイフンのみ使用可能です").optional().or(z.literal("")),
  address: z.string().optional(),
  rank: z.enum(["A", "B", "C"]).optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  lastContactAt: z.string().optional(),
  // deals は新規作成時には不要なので削除
});

export const updatePartnerSchema = z.object({
  name: z.string().min(1, "法人名は必須です").optional(),
  department: z.string().optional(), // 部署（任意）
  owner: z.string().min(1, "担当者は必須です").optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9-]*$/, "電話番号は数字とハイフンのみ使用可能です").optional().or(z.literal("")),
  address: z.string().optional(),
  rank: z.enum(["A", "B", "C"]).optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional(),
  lastContactAt: z.string().optional(),
  deals: z.number().int().min(0, "取引数は0以上の整数で入力してください").optional(), // 更新時のみ
});
