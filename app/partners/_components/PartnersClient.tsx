"use client";

import { useState, useEffect, useMemo } from "react";
import { Partner } from "@/lib/partners/types";
import { partnerRepo } from "@/lib/partners/repo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Building2, User, Mail, Phone, MapPin, Tag, FileText, Calendar, TrendingUp, Eye, ArrowUpDown, Loader2, Copy, Check, Users, FilterX } from "lucide-react";
import { toast } from "sonner";
import PartnerForm from "./PartnerForm";

export default function PartnersClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Partner>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  // 取引先データを取得
  useEffect(() => {
    fetchPartners();
  }, []);

  // フィルタリングとソート
  const filteredAndSortedPartners = useMemo(() => {
    let filtered = partners.filter(partner => {
             const matchesSearch = searchTerm === "" || 
         partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         partner.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         partner.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
         partner.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRank = rankFilter === "all" || partner.rank === rankFilter;
      
      return matchesSearch && matchesRank;
    });

    // ソート
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [partners, searchTerm, rankFilter, sortField, sortDirection]);

  // ページネーション
  const totalPages = Math.ceil(filteredAndSortedPartners.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPartners = filteredAndSortedPartners.slice(startIndex, endIndex);

  const fetchPartners = async () => {
    try {
      const data = await partnerRepo.getList();
      setPartners(data);
    } catch (error) {
      console.error("取引先の取得に失敗しました:", error);
    }
  };

  const handleFormSuccess = () => {
    setEditingPartner(null);
  };

  const handleFormSubmit = async (partnerData: any, isEdit: boolean) => {
    setIsFormSubmitting(true);
    
    // 楽観的更新: 一時的にローカルに追加/更新
    const tempPartner: Partner = {
      id: isEdit ? editingPartner!.id : `temp-${Date.now()}`,
      ...partnerData,
      createdAt: isEdit ? editingPartner!.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let originalPartners = [...partners];
    
    if (isEdit) {
      // 編集の場合
      setPartners(prev => prev.map(p => p.id === editingPartner!.id ? tempPartner : p));
    } else {
      // 新規作成の場合
      setPartners(prev => [tempPartner, ...prev]);
    }

    try {
      let result: Partner;
      
      if (isEdit) {
        result = await partnerRepo.update(editingPartner!.id, partnerData);
        // 編集成功: 実際のデータで更新
        setPartners(prev => prev.map(p => p.id === editingPartner!.id ? result : p));
        toast.success("取引先を更新しました");
      } else {
        result = await partnerRepo.create(partnerData);
        // 新規作成成功: 一時的なIDを実際のIDに置き換え
        setPartners(prev => prev.map(p => p.id === tempPartner.id ? result : p));
        toast.success("取引先を作成しました");
      }
      
      setIsFormOpen(false);
      setEditingPartner(null);
    } catch (error) {
      // エラー時はロールバック
      setPartners(originalPartners);
      toast.error(error instanceof Error ? error.message : "送信に失敗しました");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const openCreateForm = () => {
    setEditingPartner(null);
    setIsFormOpen(true);
  };

  const openEditForm = (partner: Partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (partner: Partner) => {
    setDeletingPartner(partner);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPartner) return;
    
    setIsDeleting(true);
    
    // 楽観的更新: 一時的にローカルから削除
    const originalPartners = [...partners];
    setPartners(prev => prev.filter(p => p.id !== deletingPartner.id));

    try {
      await partnerRepo.remove(deletingPartner.id);
      toast.success("取引先を削除しました");
      setIsDeleteDialogOpen(false);
      setDeletingPartner(null);
    } catch (error) {
      // エラー時はロールバック
      setPartners(originalPartners);
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetailSheet = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDetailSheetOpen(true);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "A": return "bg-green-100 text-green-800";
      case "B": return "bg-yellow-100 text-yellow-800";
      case "C": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const handleSort = (field: keyof Partner) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortableHeader = ({ field, children }: { field: keyof Partner; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </TableHead>
  );

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("コピーしました");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("コピーに失敗しました");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRankFilter("all");
    setCurrentPage(1);
  };

  // 空状態の判定
  const isEmpty = partners.length === 0;
  const hasSearchResults = filteredAndSortedPartners.length > 0;
  const hasActiveFilters = searchTerm !== "" || rankFilter !== "all";

      return (
      <div className="flex-1 space-y-4 p-6 bg-gray-50 h-full overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">取引先管理</h1>
          <p className="text-muted-foreground">取引先の一覧・検索・登録</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          新規登録
        </Button>
      </div>

      {/* ツールバー */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                 <Input
                   placeholder="法人名、部署、担当者、タグで検索..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10"
                 />
              </div>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ランク" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedPartners.length}件中 {startIndex + 1}-{Math.min(endIndex, filteredAndSortedPartners.length)}件を表示
            </div>
          </div>
        </CardHeader>
      </Card>

             {/* テーブルまたはエンプティステート */}
       <Card>
         <CardContent className="p-0">
           {isEmpty ? (
             // データが0件の場合のエンプティステート
             <div className="flex flex-col items-center justify-center py-16 px-4">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <Users className="w-8 h-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold mb-2">取引先がまだありません</h3>
               <p className="text-muted-foreground text-center mb-6 max-w-md">
                 最初の取引先を登録して、取引先管理を始めましょう
               </p>
               <Button size="lg" onClick={openCreateForm}>
                 <Plus className="w-5 h-5 mr-2" />
                 新規作成
               </Button>
             </div>
           ) : !hasSearchResults && hasActiveFilters ? (
             // 検索結果が0件の場合のエンプティステート
             <div className="flex flex-col items-center justify-center py-16 px-4">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold mb-2">一致する取引先が見つかりません</h3>
               <p className="text-muted-foreground text-center mb-6 max-w-md">
                 検索条件を変更するか、フィルターをリセットしてください
               </p>
               <Button variant="outline" onClick={resetFilters}>
                 <FilterX className="w-4 h-4 mr-2" />
                 フィルターをリセット
               </Button>
             </div>
           ) : (
             // 通常のテーブル表示
             <Table>
               <TableHeader>
                 <TableRow>
                                       <SortableHeader field="name">法人名</SortableHeader>
                    <TableHead>部署</TableHead>
                    <SortableHeader field="owner">担当者</SortableHeader>
                   <TableHead>メール</TableHead>
                   <TableHead>電話</TableHead>
                   <SortableHeader field="rank">ランク</SortableHeader>
                   <TableHead>タグ</TableHead>
                   <SortableHeader field="lastContactAt">最終接点</SortableHeader>
                   <SortableHeader field="deals">案件数</SortableHeader>
                   <SortableHeader field="updatedAt">更新日</SortableHeader>
                   <TableHead>アクション</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {currentPartners.map((partner) => (
                   <TableRow 
                     key={partner.id} 
                     className="cursor-pointer hover:bg-muted/50"
                     onClick={() => openDetailSheet(partner)}
                   >
                                           <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.department || "-"}</TableCell>
                      <TableCell>{partner.owner}</TableCell>
                     <TableCell>{partner.email || "-"}</TableCell>
                     <TableCell>{partner.phone || "-"}</TableCell>
                     <TableCell>
                       {partner.rank && (
                         <Badge className={getRankColor(partner.rank)}>
                           {partner.rank}
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell>
                       {partner.tags && partner.tags.length > 0 ? (
                         <div className="flex gap-1 flex-wrap">
                           {partner.tags.slice(0, 2).map((tag, index) => (
                             <Badge key={index} variant="secondary" className="text-xs">
                               {tag}
                             </Badge>
                           ))}
                           {partner.tags.length > 2 && (
                             <Badge variant="secondary" className="text-xs">
                               +{partner.tags.length - 2}
                             </Badge>
                           )}
                         </div>
                       ) : (
                         "-"
                       )}
                     </TableCell>
                     <TableCell>
                       {partner.lastContactAt ? formatDate(partner.lastContactAt) : "-"}
                     </TableCell>
                     <TableCell>{partner.deals || 0}件</TableCell>
                     <TableCell>{formatDate(partner.updatedAt)}</TableCell>
                     <TableCell>
                       <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => openDetailSheet(partner)}
                         >
                           <Eye className="w-4 h-4" />
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => openEditForm(partner)}
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                                                   <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(partner);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>

             {/* ページネーション */}
       {!isEmpty && hasSearchResults && totalPages > 1 && (
         <div className="flex justify-center">
           <Pagination>
             <PaginationContent>
               <PaginationItem>
                 <PaginationPrevious 
                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                   className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                 />
               </PaginationItem>
               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <PaginationItem key={page}>
                   <PaginationLink
                     onClick={() => setCurrentPage(page)}
                     isActive={currentPage === page}
                     className="cursor-pointer"
                   >
                     {page}
                   </PaginationLink>
                 </PaginationItem>
               ))}
               <PaginationItem>
                 <PaginationNext 
                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                   className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                 />
               </PaginationItem>
             </PaginationContent>
           </Pagination>
         </div>
       )}

      {/* 詳細スライドオーバー */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
          {selectedPartner && (
            <div className="space-y-8">
              {/* ヘッダー */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{selectedPartner.name}</h2>
                                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                   <div className="flex items-center gap-1">
                     <User className="w-4 h-4" />
                     <span>{selectedPartner.owner}</span>
                   </div>
                   {selectedPartner.department && (
                     <div className="flex items-center gap-1">
                       <span className="text-muted-foreground">|</span>
                       <span>{selectedPartner.department}</span>
                     </div>
                   )}
                   {selectedPartner.rank && (
                     <div className="flex items-center gap-1">
                       <Badge className={getRankColor(selectedPartner.rank)}>
                         {selectedPartner.rank}
                       </Badge>
                     </div>
                   )}
                 </div>
              </div>

              {/* メタ情報 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">最終接点</Label>
                  <p className="text-sm font-medium">
                    {selectedPartner.lastContactAt ? formatDate(selectedPartner.lastContactAt) : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">案件数</Label>
                  <p className="text-sm font-medium">{selectedPartner.deals || 0}件</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">作成日</Label>
                  <p className="text-sm font-medium">{formatDate(selectedPartner.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">更新日</Label>
                  <p className="text-sm font-medium">{formatDate(selectedPartner.updatedAt)}</p>
                </div>
              </div>

              {/* 連絡先 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">連絡先</h3>
                <div className="space-y-3">
                  {selectedPartner.email && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedPartner.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPartner.email!, "email")}
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {selectedPartner.phone && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedPartner.phone}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPartner.phone!, "phone")}
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === "phone" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {selectedPartner.address && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedPartner.address}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPartner.address!, "address")}
                        className="h-8 w-8 p-0"
                      >
                        {copiedField === "address" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {!selectedPartner.email && !selectedPartner.phone && !selectedPartner.address && (
                    <p className="text-sm text-muted-foreground text-center py-4">連絡先情報がありません</p>
                  )}
                </div>
              </div>

              {/* タグ */}
              {selectedPartner.tags && selectedPartner.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">タグ</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPartner.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 備考 */}
              {selectedPartner.note && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">備考</h3>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedPartner.note}</p>
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2 pt-6 border-t">
                <Button
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    openEditForm(selectedPartner);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    openDeleteDialog(selectedPartner);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  削除
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

             {/* PartnerForm */}
       <PartnerForm
         open={isFormOpen}
         onOpenChange={setIsFormOpen}
         partner={editingPartner}
         onSubmitSuccess={handleFormSuccess}
         onSubmit={handleFormSubmit}
         isSubmitting={isFormSubmitting}
       />

       {/* 削除確認ダイアログ */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>取引先を削除</AlertDialogTitle>
             <AlertDialogDescription>
               「{deletingPartner?.name}」を削除しますか？この操作は取り消せません。
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
             <AlertDialogAction
               onClick={handleDelete}
               disabled={isDeleting}
               className="bg-red-600 hover:bg-red-700"
             >
               {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               削除
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
