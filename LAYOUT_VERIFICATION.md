# メッセージ枠の固定化＋スクロール分離 - 実装検証チェックリスト

## ✅ 実装完了項目

### 1. 左右2カラムレイアウトの実装
- [x] `grid-cols-[360px,1fr]` を適用
- [x] 左ペイン: 360px固定幅
- [x] 右ペイン: 残りの幅を使用
- [x] `min-h-0` でグリッド子要素の縮小を許可

### 2. 右ペインの3分割Grid実装
- [x] `grid-rows-[auto,1fr,auto]` を適用
- [x] 上段: 相手情報（auto - 固定高さ）
- [x] 中段: メッセージスレッド（1fr - 可変高さ）
- [x] 下段: 入力欄（auto - 固定高さ）
- [x] `min-h-0 overflow-hidden` で適切なスクロール制御

### 3. スクロール分離の実装
- [x] 左ペイン: `min-h-0 overflow-y-auto` で独立スクロール
- [x] 右ペイン: Threadコンポーネントのみ `overflow-y-auto`
- [x] 親コンテナには `overflow-y-auto` を付けない
- [x] `min-h-0` を右ペインとThread両方に適用

### 4. HeaderCandidateとComposerの固定化
- [x] `className` propを追加して柔軟なスタイリング
- [x] `sticky/absolute` positioning を撤去
- [x] Grid行内での自然な配置
- [x] HeaderCandidate: `border-b px-3 md:px-4 py-2`
- [x] Composer: `border-t bg-background p-2 md:p-3`

### 5. メッセージバブルの余白調整とグルーピング
- [x] `space-y-1` でリスト間隔を圧縮
- [x] バブル: `rounded-2xl px-3 py-2 text-sm leading-5 max-w-[75%]`
- [x] 連続メッセージ: `mt-0.5` でグルーピング
- [x] 送信者切替/5分以上間隔: `mt-2` + タイムスタンプ表示
- [x] `<li>` タグでセマンティックなマークアップ

### 6. オートスクロール挙動の実装
- [x] `scrollContainerRef` でスクロール制御
- [x] `isNearBottom()` で現在位置を判定
- [x] 新規メッセージ到着時: 最下部にいる場合のみ追従
- [x] 履歴読み込み時: スクロール位置維持
- [x] `scrollTo({ behavior: "instant" })` でスムーズスクロール

## 🔍 デグレ防止チェックリスト

### ✅ DOM構造の検証
- [x] 左ペインDOMに `overflow-y-auto` があり、右ペイン親には無い
- [x] 右ペイン `grid-rows-[auto,1fr,auto]` と `min-h-0` が効いている
- [x] ヘッダー/入力欄に `sticky/absolute` が残っていない
- [x] Threadコンポーネントに `overflow-y-auto` が適用されている

### ✅ スクロール動作の検証
- [x] Window全体のスクロール量が減り、Threadのみがスクロールする
- [x] 左ペインと右ペインが独立してスクロールする
- [x] 送信欄の高さが伸びてもThreadが縮んでComposerは常時可視
- [x] メッセージ送信時に最下部に自動スクロール

### ✅ レイアウト安定性の検証
- [x] 1366×768で適切に表示される
- [x] 相手情報が常時表示される
- [x] 入力欄が常時表示される
- [x] メッセージエリアが独立してスクロールする

## 📐 技術的実装詳細

### レイアウト構造
```tsx
// メインコンテナ
<div className="h-screen grid grid-cols-[360px,1fr] min-h-0">
  {/* 左ペイン */}
  <div className="min-h-0 overflow-y-auto border-r flex flex-col">
    {/* 固定ヘッダー群 */}
    <div className="flex-shrink-0">...</div>
    {/* スレッドリスト */}
    <div className="flex-1 min-h-0">...</div>
  </div>
  
  {/* 右ペイン */}
  <div className="h-full min-h-0 overflow-hidden">
    <div className="h-full grid grid-rows-[auto,1fr,auto] min-h-0 overflow-hidden">
      <CandidateHeader />  {/* auto */}
      <MessageThread className="min-h-0 overflow-y-auto" />  {/* 1fr */}
      <MessageComposer />  {/* auto */}
    </div>
  </div>
</div>
```

### スクロール制御
```tsx
// MessageThread内
const scrollContainerRef = useRef<HTMLDivElement>(null)

const isNearBottom = () => {
  if (!scrollContainerRef.current) return false
  const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
  return scrollHeight - scrollTop - clientHeight <= 100
}

const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTo({ 
      top: scrollContainerRef.current.scrollHeight, 
      behavior 
    })
  }
}
```

### バブルグルーピング
```tsx
// 連続メッセージの判定
const isGrouped = isSameSender && timeDiff < 5 * 60 * 1000 // 5分以内

// マージン調整
className={`flex ${isGrouped ? "mt-0.5" : "mt-2"}`}
```

## 🎯 完了条件の達成状況

### ✅ 1366×768での表示
- [x] 右ペイン上段: 相手情報（常時表示・高さauto）
- [x] 右ペイン中段: メッセージ（この段のみ縦スクロール）
- [x] 右ペイン下段: 入力欄（常時表示・高さauto）
- [x] 入力欄は常に画面内に見える

### ✅ スクロール分離
- [x] 左ペイン（一覧）は独立してスクロールする
- [x] 右ペイン（メッセージ）のみスクロール

### ✅ オートスクロール
- [x] 新規メッセージ到着時は最下部に追従
- [x] 履歴読み込み時はスクロール位置維持

### ✅ 固定表示
- [x] ヘッダー・入力欄はスクロールに合わせて動かない（固定）

## 🚀 パフォーマンス最適化

- [x] `min-h-0` による適切なGrid/Flex子要素の縮小許可
- [x] `overflow-hidden` による不要なスクロールバー抑制
- [x] `useRef` による直接DOM操作でのスクロール制御
- [x] 条件付きスクロール（`isNearBottom`）による不要な自動スクロール防止

## ✅ 総合評価: 完全対応済み

すべての要件が満たされ、デグレ防止チェックリストも通過しました。
メッセージ枠の固定化とスクロール分離が完全に実装されています。
