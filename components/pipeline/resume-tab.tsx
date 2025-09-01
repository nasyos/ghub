"use client"

import { useState, useEffect } from "react"
import { ApplicationRow } from "@/lib/pipeline/types"
import { pipelineApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Download, FileImage, FileVideo, FileAudio, FileArchive, FileCode, FileSpreadsheet } from "lucide-react"

interface ResumeTabProps {
  application: ApplicationRow
}

interface AttachmentFile {
  id: string
  candidateId: string
  fileName: string
  fileUrl: string
  fileType: "pdf" | "docx" | "doc" | "jpg" | "jpeg" | "png" | "gif" | "mp4" | "avi" | "mov" | "mp3" | "wav" | "zip" | "rar" | "txt" | "xlsx" | "xls" | "pptx" | "ppt"
  fileSize: number
  uploadedAt: string
  description?: string
  category: "resume" | "portfolio" | "certificate" | "other"
}

export function ResumeTab({ application }: ResumeTabProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const [selectedFile, setSelectedFile] = useState<AttachmentFile | null>(null)

  useEffect(() => {
    loadAttachments()
  }, [application.id])

  const loadAttachments = async () => {
    setLoading(true)
    try {
      // モックデータを使用（実際のAPIでは pipelineApi.getAttachments(application.id) を呼び出し）
      const mockAttachments: AttachmentFile[] = [
        {
          id: "file-1",
          candidateId: application.candidate.id,
          fileName: "Johnson_Sarah_Resume.pdf",
          fileUrl: "/api/attachments/Johnson_Sarah_Resume.pdf",
          fileType: "pdf",
          fileSize: 245760, // 240KB
          uploadedAt: "2024-01-10T10:30:00Z",
          description: "履歴書・職務経歴書",
          category: "resume"
        },
        {
          id: "file-2",
          candidateId: application.candidate.id,
          fileName: "Portfolio_2024.pdf",
          fileUrl: "/api/attachments/Portfolio_2024.pdf",
          fileType: "pdf",
          fileSize: 1024000, // 1MB
          uploadedAt: "2024-01-12T14:20:00Z",
          description: "ポートフォリオ作品集",
          category: "portfolio"
        },
        {
          id: "file-3",
          candidateId: application.candidate.id,
          fileName: "UX_Design_Certificate.jpg",
          fileUrl: "/api/attachments/UX_Design_Certificate.jpg",
          fileType: "jpg",
          fileSize: 512000, // 500KB
          uploadedAt: "2024-01-08T09:15:00Z",
          description: "UXデザイン資格証明書",
          category: "certificate"
        },
        {
          id: "file-4",
          candidateId: application.candidate.id,
          fileName: "Project_Screenshots.zip",
          fileUrl: "/api/attachments/Project_Screenshots.zip",
          fileType: "zip",
          fileSize: 2048000, // 2MB
          uploadedAt: "2024-01-15T16:45:00Z",
          description: "プロジェクトスクリーンショット集",
          category: "portfolio"
        },
        {
          id: "file-5",
          candidateId: application.candidate.id,
          fileName: "Cover_Letter.docx",
          fileUrl: "/api/attachments/Cover_Letter.docx",
          fileType: "docx",
          fileSize: 128000, // 125KB
          uploadedAt: "2024-01-10T11:00:00Z",
          description: "カバーレター",
          category: "resume"
        }
      ]
      
      setAttachments(mockAttachments)
      if (mockAttachments.length > 0) {
        setSelectedFile(mockAttachments[0])
      }
    } catch (error) {
      console.error("Failed to load attachments:", error)
      toast({
        title: "エラー",
        description: "添付ファイルの読み込みに失敗しました",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-5 w-5" />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-5 w-5" />
      case 'mp3':
      case 'wav':
        return <FileAudio className="h-5 w-5" />
      case 'zip':
      case 'rar':
        return <FileArchive className="h-5 w-5" />
      case 'txt':
        return <FileCode className="h-5 w-5" />
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5" />
      case 'pptx':
      case 'ppt':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'resume':
        return '履歴書'
      case 'portfolio':
        return 'ポートフォリオ'
      case 'certificate':
        return '資格証明'
      case 'other':
        return 'その他'
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resume':
        return 'bg-blue-100 text-blue-800'
      case 'portfolio':
        return 'bg-green-100 text-green-800'
      case 'certificate':
        return 'bg-purple-100 text-purple-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (attachments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">添付ファイルがありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 添付ファイル一覧 */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedFile?.id === file.id ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{file.fileName}</span>
                      <Badge className={`text-xs ${getCategoryColor(file.category)}`}>
                        {getCategoryLabel(file.category)}
                      </Badge>
                    </div>
                    {file.description && (
                      <p className="text-sm text-muted-foreground truncate">{file.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation()
                    // ダウンロード処理
                    toast({
                      title: "ダウンロード",
                      description: `${file.fileName} をダウンロードします`
                    })
                  }}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* プレビュー */}
      {selectedFile && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.fileType)}
              <span className="font-medium">{selectedFile.fileName}</span>
              <Badge variant="outline">{selectedFile.fileType.toUpperCase()}</Badge>
            </div>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
            </Button>
          </div>
          
          <Card className="h-64">
            <CardContent className="h-full p-0">
              <div className="border rounded-lg h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  {selectedFile.fileType === 'pdf' ? (
                    <>
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">PDF プレビュー</p>
                      <p className="text-sm text-muted-foreground">
                        実際の実装では、PDF.js や react-pdf を使用して<br />
                        PDF ファイルのプレビューを表示します
                      </p>
                    </>
                  ) : selectedFile.fileType.match(/^(jpg|jpeg|png|gif)$/) ? (
                    <>
                      <FileImage className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">画像プレビュー</p>
                      <p className="text-sm text-muted-foreground">
                        実際の実装では、画像ファイルの<br />
                        プレビューを表示します
                      </p>
                    </>
                  ) : selectedFile.fileType.match(/^(mp4|avi|mov)$/) ? (
                    <>
                      <FileVideo className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">動画プレビュー</p>
                      <p className="text-sm text-muted-foreground">
                        実際の実装では、動画ファイルの<br />
                        プレビューを表示します
                      </p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">ファイルプレビュー</p>
                      <p className="text-sm text-muted-foreground">
                        このファイル形式のプレビューは<br />
                        サポートされていません
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
