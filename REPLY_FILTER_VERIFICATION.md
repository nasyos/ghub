# 要返信フィルタ実装検証チェックリスト

## ✅ 実装完了項目

### 1. 背景色の修正（エイジング表示）
- [x] **要返信=false**: 常に白（経過時間に関わらず背景色なし）
- [x] **要返信=true**: 
  - 0-6h: 白（背景色なし）
  - 6-24h: 薄橙（`bg-amber-50`）
  - 24h超: 赤（`bg-red-50`）
- [x] 経過時間計算: 小数第一位四捨五入
- [x] タイムゾーン: JST（フロント側で一貫）

### 2. フィルタUIの変更
- [x] **旧ドロップダウン削除**: 「すべて/要返信のみ/要返信以外」を撤去
- [x] **新チェックボックス追加**: 検索バー右側に配置
- [x] **ラベル**: 「要返信のみ」
- [x] **常時表示**: ドロップダウンから独立

### 3. URL同期の実装
- [x] **URLパラメータ**: `?needsReplyOnly=1`
- [x] **状態復元**: リロード時に状態維持
- [x] **履歴管理**: `window.history.replaceState`

### 4. フィルタロジックの更新
- [x] **needsReplyOnly状態管理**: useState + URL同期
- [x] **フィルタ処理**: useMemoで効率的なフィルタリング
- [x] **他フィルタとの連携**: AND条件で組み合わせ

### 5. 件数表示の連動
- [x] **フィルタ適用後件数**: 「○件を表示中」
- [x] **総候補者数**: 「総候補者数: ○件」
- [x] **フィルタ状態表示**: 「（要返信のみ）」ラベル

### 6. CSV出力の対応
- [x] **フィルタ反映**: filteredCandidatesを使用
- [x] **現在の条件**: needsReplyOnlyを含む全フィルタ条件

## 🔍 テスト項目

### ✅ 背景色テスト
- [x] **要返信=false & 経過=100h**: 背景は白
- [x] **要返信=true & 経過=5h**: 白
- [x] **要返信=true & 経過=12h**: 薄橙（`bg-amber-50`）
- [x] **要返信=true & 経過=30h**: 赤（`bg-red-50`）

### ✅ フィルタテスト
- [x] **チェックボックスON**: 要返信行のみ表示
- [x] **チェックボックスOFF**: 全件表示（他フィルタとAND）
- [x] **URL同期**: `needsReplyOnly=1` が付与される
- [x] **リロード**: 状態が復元される

### ✅ 件数連動テスト
- [x] **表示件数**: フィルタ適用後の件数
- [x] **CSV出力**: 現在のフィルタ条件を反映
- [x] **ページネーション**: フィルタ適用後の件数で動作

### ✅ 旧コード削除テスト
- [x] **ビルドエラーなし**: 旧ドロップダウン削除後もエラーなし
- [x] **型エラーなし**: requiresResponseフィルタ削除後もエラーなし

## 📐 技術的実装詳細

### 背景色ロジック
```typescript
export function getRequiresResponseBackgroundColor(candidate: Candidate): string {
  const needsReply = calculateRequiresResponse(candidate)
  
  // 要返信=falseの場合は常に白（背景色なし）
  if (!needsReply) {
    return ""
  }

  const now = new Date()
  const lastMessageTime = new Date(candidate.lastMessageReceivedAt)
  const elapsedHours = Math.round((now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60) * 10) / 10

  // 要返信=trueの場合の背景色
  if (elapsedHours >= 24) return "bg-red-50"      // 24h超: 赤
  if (elapsedHours >= 6) return "bg-amber-50"     // 6-24h: 薄橙
  return ""  // 0-6h: 白（背景色なし）
}
```

### フィルタ状態管理
```typescript
// URL同期対応の状態管理
const [needsReplyOnly, setNeedsReplyOnly] = useState<boolean>(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    return params.get("needsReplyOnly") === "1"
  }
  return false
})

// URL同期
useEffect(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    if (needsReplyOnly) {
      params.set("needsReplyOnly", "1")
    } else {
      params.delete("needsReplyOnly")
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, "", newUrl)
  }
}, [needsReplyOnly])
```

### フィルタ処理
```typescript
// フィルタされた候補者リスト
const filteredCandidates = useMemo(() => {
  return candidates.filter(candidate => {
    // 要返信のみフィルタ
    if (needsReplyOnly) {
      const requiresResponse = calculateRequiresResponse(candidate)
      if (!requiresResponse) return false
    }
    
    // 他のフィルタも適用
    return filterCandidates([candidate], filters).length > 0
  })
}, [candidates, needsReplyOnly, filters])
```

### UI実装
```tsx
{/* 要返信のみフィルタ */}
<div className="flex items-center gap-2">
  <Checkbox
    id="needs-reply-only"
    checked={needsReplyOnly}
    onCheckedChange={(checked) => setNeedsReplyOnly(Boolean(checked))}
  />
  <Label htmlFor="needs-reply-only" className="text-sm">要返信のみ</Label>
</div>
```

## 🎯 受け入れ条件の達成状況

### ✅ 背景色の限定
- [x] 「要返信 = true」かつ「経過時間 ≥ 24h」の行のみ赤塗り
- [x] その他の条件では適切な色分け

### ✅ フィルタUIの変更
- [x] ドロップダウンから独立したチェックボックスに変更
- [x] 常時表示で操作性向上

### ✅ 旧ドロップダウンの廃止
- [x] 「すべて/要返信のみ/要返信以外」を完全削除
- [x] その他のドロップダウンは保持

### ✅ 件数連動の確認
- [x] テーブル件数がフィルタに追随
- [x] ページネーションがフィルタに追随
- [x] CSV出力がフィルタに追随

## 🚀 パフォーマンス最適化

- [x] `useMemo` による効率的なフィルタリング
- [x] URL同期による状態管理の最適化
- [x] 条件分岐の最適化による処理速度向上

## ✅ 総合評価: 完全実装済み

すべての要件が満たされ、背景色の限定、フィルタUIの変更、件数連動が完全に実装されています。
