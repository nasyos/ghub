import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MessageTemplate {
  id: string
  name: string
  content: string
  category: string
}

interface MessageComposerProps {
  newMessage: string
  onMessageChange: (message: string) => void
  onSend: () => void
  onTemplateSelect: (template: MessageTemplate) => void
  onTagSelect: () => void
  onConsentRequest: () => void
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  attachedFiles: File[]
  onRemoveFile: (index: number) => void
  showTagModal: boolean
  onTagModalChange: (show: boolean) => void
  showConsentModal: boolean
  onConsentModalChange: (show: boolean) => void
  showTemplates: boolean
  onTemplatesChange: (show: boolean) => void
  templateSearch: string
  onTemplateSearchChange: (search: string) => void
  selectedTemplateCategory: string
  onTemplateCategoryChange: (category: string) => void
  filteredTemplates: MessageTemplate[]
  requiresTag: boolean
  className?: string
}

export function MessageComposer({
  newMessage,
  onMessageChange,
  onSend,
  onTemplateSelect,
  onTagSelect,
  onConsentRequest,
  onFileSelect,
  attachedFiles,
  onRemoveFile,
  showTagModal,
  onTagModalChange,
  showConsentModal,
  onConsentModalChange,
  showTemplates,
  onTemplatesChange,
  templateSearch,
  onTemplateSearchChange,
  selectedTemplateCategory,
  onTemplateCategoryChange,
  filteredTemplates,
  requiresTag,
  className = "border-t bg-background p-2 md:p-3"
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 120 // 5行分の最大高さ
      const newHeight = Math.min(scrollHeight, maxHeight)
      textareaRef.current.style.height = newHeight + 'px'
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [newMessage])

  return (
    <>
      <div className={className}>
        <div className="flex gap-2 mb-2">
          <Popover open={showTemplates} onOpenChange={onTemplatesChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm bg-transparent">
                テンプレ
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">テンプレート選択</h3>
                </div>

                <Input
                  placeholder="テンプレートを検索..."
                  value={templateSearch}
                  onChange={(e) => onTemplateSearchChange(e.target.value)}
                  className="text-sm"
                />

                <Select value={selectedTemplateCategory} onValueChange={onTemplateCategoryChange}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="一般">一般</SelectItem>
                    <SelectItem value="タグ用">タグ用</SelectItem>
                    <SelectItem value="同意用">同意用</SelectItem>
                  </SelectContent>
                </Select>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded p-2 hover:bg-accent cursor-pointer"
                      onClick={() => onTemplateSelect(template)}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={onTagSelect}
            className={`text-sm ${requiresTag ? "bg-yellow-100" : ""}`}
          >
            タグ送信
          </Button>
          <Button variant="outline" size="sm" onClick={() => onConsentModalChange(true)} className="text-sm">
            同意リクエスト
          </Button>

          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={onFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-input"
            />
            <Button variant="outline" size="sm" className="text-sm bg-transparent" asChild>
              <label htmlFor="file-input" className="cursor-pointer">
                添付
              </label>
            </Button>
          </div>
        </div>

        {/* Attached files display */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                <span>{file.name}</span>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 px-3 py-2 border rounded-md resize-none min-h-[40px] max-h-[120px] text-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
          />
          <Button onClick={onSend} disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </div>

      <Dialog open={showTagModal} onOpenChange={onTagModalChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを選択</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  onTagModalChange(false)
                }}
              >
                日程リマインド/変更
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  onTagModalChange(false)
                }}
              >
                情報確認/選考通知/進捗連絡
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConsentModal} onOpenChange={onConsentModalChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>同意リクエスト送信</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">候補者に個人情報取り扱いの同意リクエストを送信しますか？</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onConsentModalChange(false)}>
                キャンセル
              </Button>
              <Button onClick={onConsentRequest}>送信</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
