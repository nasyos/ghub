"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Partner } from "@/lib/partners/types";
import { partnerRepo } from "@/lib/partners/repo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// バリデーションスキーマ
const partnerFormSchema = z.object({
  name: z.string().min(1, "法人名は必須です"),
  department: z.string().optional(), // 部署（任意）
  owner: z.string().min(1, "担当者は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9-]*$/, "電話番号は数字とハイフンのみ使用可能です").optional().or(z.literal("")),
  address: z.string().optional(),
  rank: z.enum(["A", "B", "C"]).optional(),
  tags: z.string().optional(),
  note: z.string().optional(),
  lastContactAt: z.date().optional(),
  deals: z.string().optional(),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

interface PartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: Partner | null;
  onSubmitSuccess: () => void;
  onSubmit?: (partnerData: any, isEdit: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export default function PartnerForm({ open, onOpenChange, partner, onSubmitSuccess, onSubmit, isSubmitting: externalIsSubmitting }: PartnerFormProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    partner?.lastContactAt ? new Date(partner.lastContactAt) : undefined
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      department: "",
      owner: "",
      email: "",
      phone: "",
      address: "",
      rank: undefined,
      tags: "",
      note: "",
      deals: "",
    },
  });

  // パートナーが変更されたときにフォームをリセット
  useEffect(() => {
    if (partner) {
      reset({
        name: partner.name,
        department: partner.department || "",
        owner: partner.owner,
        email: partner.email || "",
        phone: partner.phone || "",
        address: partner.address || "",
        rank: partner.rank,
        tags: partner.tags?.join(", ") || "",
        note: partner.note || "",
        deals: partner.deals?.toString() || "",
      });
      setSelectedDate(partner.lastContactAt ? new Date(partner.lastContactAt) : undefined);
    } else {
      reset({
        name: "",
        department: "",
        owner: "",
        email: "",
        phone: "",
        address: "",
        rank: undefined,
        tags: "",
        note: "",
        deals: "",
      });
      setSelectedDate(undefined);
    }
  }, [partner, reset]);

  // 日付が選択されたときにフォームに設定
  useEffect(() => {
    setValue("lastContactAt", selectedDate);
  }, [selectedDate, setValue]);

  const onSubmitHandler = async (data: PartnerFormData) => {
    if (onSubmit) {
      // 外部のonSubmit関数が提供されている場合
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        lastContactAt: data.lastContactAt?.toISOString(),
        deals: data.deals ? parseInt(data.deals, 10) : undefined,
      };
      await onSubmit(payload, !!partner);
      onOpenChange(false);
      onSubmitSuccess();
      reset();
      setSelectedDate(undefined);
    } else {
      // 内部の送信処理（従来の動作）
      setInternalIsSubmitting(true);
      try {
        const payload = {
          ...data,
          tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
          lastContactAt: data.lastContactAt?.toISOString(),
          deals: data.deals ? parseInt(data.deals, 10) : undefined,
        };

        let result: Partner;
        
        if (partner) {
          result = await partnerRepo.update(partner.id, payload);
        } else {
          result = await partnerRepo.create(payload);
        }
        
        onOpenChange(false);
        onSubmitSuccess();
        reset();
        setSelectedDate(undefined);
      } catch (error) {
        console.error("送信エラー:", error);
        alert("送信に失敗しました");
      } finally {
        setInternalIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
    setSelectedDate(undefined);
  };

  const watchedTags = watch("tags");
  const isEdit = !!partner;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "取引先を編集" : "取引先を新規登録"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "取引先の情報を編集してください" : "新しい取引先の情報を入力してください"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitHandler as any)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* 法人名 */}
            <div className="space-y-2">
              <Label htmlFor="name">法人名 *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="株式会社サンプル"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 部署 */}
            <div className="space-y-2">
              <Label htmlFor="department">部署</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="営業部"
              />
            </div>

            {/* 担当者 */}
            <div className="space-y-2">
              <Label htmlFor="owner">担当者 *</Label>
              <Input
                id="owner"
                {...register("owner")}
                placeholder="田中 太郎"
              />
              {errors.owner && (
                <p className="text-sm text-red-600">{errors.owner.message}</p>
              )}
            </div>

            {/* ランク */}
            <div className="space-y-2">
              <Label htmlFor="rank">ランク</Label>
              <Select
                value={watch("rank") || ""}
                onValueChange={(value) => setValue("rank", value as "A" | "B" | "C" | undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ランクを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A（最重要）</SelectItem>
                  <SelectItem value="B">B（重要）</SelectItem>
                  <SelectItem value="C">C（一般）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="example@company.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* 電話番号 */}
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="03-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* 住所 */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="東京都渋谷区渋谷1-1-1"
              />
            </div>

            {/* 取引数（編集時のみ表示） */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="deals">取引数</Label>
                <Input
                  id="deals"
                  type="number"
                  {...register("deals")}
                  placeholder="0"
                  min="0"
                />
                {errors.deals && (
                  <p className="text-sm text-red-600">{errors.deals.message}</p>
                )}
              </div>
            )}

            {/* 最終接点日 */}
            <div className="space-y-2">
              <Label>最終接点日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ja }) : "日付を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ja}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* タグ */}
            <div className="space-y-2">
              <Label htmlFor="tags">タグ（カンマ区切り）</Label>
              <Input
                id="tags"
                {...register("tags")}
                placeholder="IT, 大手, 長期契約"
              />
              {watchedTags && (
                <div className="flex gap-1 flex-wrap">
                  {watchedTags.split(",").map((tag, index) => {
                    const trimmedTag = tag.trim();
                    return trimmedTag ? (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {trimmedTag}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 備考 */}
          <div className="space-y-2">
            <Label htmlFor="note">備考</Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder="取引先に関する備考を入力してください"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "更新" : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
