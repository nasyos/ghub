"use client"

import { useState, useEffect } from "react"
import { ApplicationRow } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  Save, 
  Copy,
  FileText, 
  Clock,
  Sparkles
} from "lucide-react"

interface RecommendationTabProps {
  application: ApplicationRow
  prefilledData?: {
    summary?: string
    body?: string
  }
}

export function RecommendationTab({ application, prefilledData }: RecommendationTabProps) {
  const { toast } = useToast()
  const [instruction, setInstruction] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"未作成" | "下書き">("未作成")

  // CAメモからの事前充填データがある場合、指示欄に設定
  useEffect(() => {
    if (prefilledData?.summary || prefilledData?.body) {
      let instructionText = ""
      if (prefilledData.summary) {
        instructionText += `要約: ${prefilledData.summary}\n`
      }
      if (prefilledData.body) {
        // CAメモから強み・懸念・希望を抽出
        const lines = prefilledData.body.split('\n')
        const strengths = lines.find(line => line.includes('強み：') || line.includes('強み:'))
        const concerns = lines.find(line => line.includes('懸念：') || line.includes('懸念:'))
        const hopes = lines.find(line => line.includes('希望：') || line.includes('希望:') || line.includes('希望条件：') || line.includes('希望条件:'))
        
        if (strengths) instructionText += `${strengths}\n`
        if (concerns) instructionText += `${concerns}\n`
        if (hopes) instructionText += `${hopes}\n`
      }
      setInstruction(instructionText.trim())
    }
  }, [prefilledData])



  // 推薦文の自動生成
  const generateRecommendationBody = (): string => {
    // 指示の解析
    const instructionLower = instruction.toLowerCase()
    const isShort = instructionLower.includes('短め') || instructionLower.includes('300字') || instructionLower.includes('簡潔')
    const isLong = instructionLower.includes('詳細') || instructionLower.includes('長め')
    const emphasizeLanguage = instructionLower.includes('語学') || instructionLower.includes('日本語')
    const emphasizeTech = instructionLower.includes('技術') || instructionLower.includes('スキル')
    const emphasizeExperience = instructionLower.includes('経験') || instructionLower.includes('実績')
    
    // 文字数調整
    let targetLength = 400 // デフォルト
    if (isShort) targetLength = 300
    if (isLong) targetLength = 600

    // 候補者概要
    const candidateSummary = `${application.candidate.name}様は、5年の実務経験を持つ${application.job.title}です。
前職での開発経験を活かし、React、TypeScript、Node.jsに精通しております。
${application.candidate.nationality}出身で、日本語レベルは${application.candidate.japaneseLevel || 'N2'}です。`

    // 要件マッチ
    const requirementMatch = `必須要件との適合性: ${application.must_match_summary}
総合適合度: ${application.fit_level}
技術要件は概ね満たしており、特にフロントエンド開発において豊富な経験があります。`

    // 強み
    let strengths = "技術力が高く、特にフロントエンド開発において豊富な経験があります。"
    if (emphasizeLanguage) {
      strengths += "日本語コミュニケーション能力も良好で、ビジネスレベルでの会話が可能です。"
    }
    if (emphasizeTech) {
      strengths += "最新技術への対応力も高く、学習意欲も旺盛です。"
    }
    if (emphasizeExperience) {
      strengths += "チーム開発での協調性も確認できており、リーダーシップも発揮できます。"
    }

    // 懸念・補足
    const concerns = application.must_match_summary === "×あり" 
      ? "一部の要件に未充足がありますが、学習意欲と適応力により対応可能と考えています。"
      : "特に大きな懸念事項はありません。"

    // 稼働条件
    const availability = "即日稼働可能です。在留資格も適切に保持しており、入社手続きに支障はありません。"

    // 依頼文
    let request = "一次面接のご検討をいただけますと幸いです。"
    if (instructionLower.includes('二次') || instructionLower.includes('最終')) {
      request = "二次面接のご検討をいただけますと幸いです。"
    }
    if (instructionLower.includes('内定') || instructionLower.includes('採用')) {
      request = "採用のご検討をいただけますと幸いです。"
    }

    // 全体構成
    const sections = [
      `【候補者概要】\n${candidateSummary}`,
      `【要件マッチ】\n${requirementMatch}`,
      `【強み】\n${strengths}`,
      `【懸念・補足】\n${concerns}`,
      `【稼働条件】\n${availability}`,
      `【依頼】\n${request}`
    ]

    let result = sections.join('\n\n')
    
    // 文字数調整（簡易版）
    if (isShort && result.length > targetLength) {
      // 各セクションを短縮
      result = sections.map(section => {
        const lines = section.split('\n')
        if (lines.length > 2) {
          return lines.slice(0, 2).join('\n') + '\n' + lines[lines.length - 1]
        }
        return section
      }).join('\n\n')
    }

    return result
  }

  // 自動作成ボタン
  const handleAutoGenerate = () => {
    const generatedContent = generateRecommendationBody()
    setBody(generatedContent)
    toast({
      title: "自動作成完了",
      description: "推薦文を自動生成しました",
    })
  }

  // コピー機能
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body)
      toast({
        title: "コピー完了",
        description: "推薦文をクリップボードにコピーしました",
      })
    } catch (error) {
      toast({
        title: "コピーエラー",
        description: "クリップボードへのコピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  // 下書き保存
  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      const data = {
        body
      }
      
      await pipelineApi.saveRecommendationDraft(application.id, data)
      setStatus("下書き")
      
      toast({
        title: "下書き保存完了",
        description: "推薦文の下書きを保存しました",
      })
    } catch (error) {
      toast({
        title: "保存エラー",
        description: "下書きの保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 下書き読み込み
  const handleLoadDraft = async () => {
    setLoading(true)
    try {
      const draft = await pipelineApi.getRecommendationDraft(application.id)
      if (draft) {
        setBody(draft.body)
        setStatus("下書き")
        toast({
          title: "下書き読み込み完了",
          description: "保存された下書きを読み込みました",
        })
      }
    } catch (error) {
      toast({
        title: "読み込みエラー",
        description: "下書きの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">推薦</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status === "下書き" ? "default" : "secondary"}>
              {status === "下書き" ? <Clock className="h-3 w-3 mr-1" /> : null}
              {status}
            </Badge>
          </div>
        </div>
      </div>

      {/* 指示入力 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">指示</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="例：語学力を強調。短め。一次面接のお願いで締める"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* 自動作成ボタン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">自動作成</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAutoGenerate}
            disabled={loading}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            推薦文を自動作成
          </Button>
        </CardContent>
      </Card>

      {/* 推薦文エディタ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">推薦文</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="推薦文を入力してください..."
            className="min-h-[300px]"
          />
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleLoadDraft}
          disabled={loading}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          下書き読込
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={loading || !body.trim()}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          下書き保存
        </Button>
        <Button
          onClick={handleCopy}
          disabled={loading || !body.trim()}
          className="flex-1"
        >
          <Copy className="h-4 w-4 mr-2" />
          コピー
        </Button>
      </div>
    </div>
  )
}
