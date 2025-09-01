import { formatTime } from "@/lib/utils"

interface MessageBubbleProps {
  message: {
    id: string
    direction: "in" | "out"
    bodyOriginal: string
    bodyTranslated?: string
    appliedTag?: string
    createdAt: string
  }
  isGrouped: boolean
  isTranslationEnabled: boolean
}

export function MessageBubble({ message, isGrouped, isTranslationEnabled }: MessageBubbleProps) {
  return (
    <li className={`flex ${message.direction === "in" ? "justify-start" : "justify-end"} ${isGrouped ? "mt-0.5" : "mt-2"}`}>
      <div
        className={`rounded-2xl px-3 py-2 text-sm leading-5 max-w-[75%] break-words ${
          message.direction === "in" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <div>
          {isTranslationEnabled ? (
            <div>
              <div className="text-xs text-muted-foreground mb-1">翻訳:</div>
              <div>{message.bodyTranslated || "翻訳中..."}</div>
              <div className="text-xs text-muted-foreground mt-1 border-t pt-1">
                原文: {message.bodyOriginal}
              </div>
            </div>
          ) : (
            <div>{message.bodyOriginal}</div>
          )}
        </div>
        {message.appliedTag && <div className="text-xs mt-1 opacity-75">タグ: {message.appliedTag}</div>}
        {!isGrouped && (
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </div>
        )}
      </div>
    </li>
  )
}
