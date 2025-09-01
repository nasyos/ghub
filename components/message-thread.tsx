import { useRef, useEffect } from "react"
import { MessageBubble } from "./message-bubble"

interface MockMessage {
  id: string
  direction: "in" | "out"
  bodyOriginal: string
  bodyTranslated?: string
  appliedTag?: string
  createdAt: string
}

interface MessageThreadProps {
  messages: MockMessage[]
  loadingMessages: boolean
  isTranslationEnabled: boolean
  sendStateInfo: {
    state: string
    label: string
    color: string
  }
  className?: string
}

export function MessageThread({ 
  messages, 
  loadingMessages, 
  isTranslationEnabled, 
  sendStateInfo,
  className = "min-h-0 overflow-y-auto px-3 md:px-4 py-2"
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (messages.length > 0) {
      // 新規メッセージ到着時は最下部に追従、履歴読み込み時は位置維持
      const shouldStickToBottom = isNearBottom()
      if (shouldStickToBottom) {
        scrollToBottom("instant")
      }
    }
  }, [messages])

  if (loadingMessages) {
    return <div className="text-center text-muted-foreground">読み込み中...</div>
  }

  if (messages.length === 0) {
    return <div className="text-center text-muted-foreground">メッセージがありません</div>
  }

  return (
    <div ref={scrollContainerRef} className={className}>
      <ul className="space-y-1">
        {/* Send Status Guide */}
        {sendStateInfo.state === "blocked" && (
          <li className="bg-red-50 border-l-4 border-red-500 p-2 mb-2">
            <div className="text-red-700 text-xs">送信不可・再接続が必要です</div>
          </li>
        )}
        {sendStateInfo.state === "requires_tag" && (
          <li className="bg-yellow-50 border-l-4 border-yellow-500 p-2 mb-2">
            <div className="text-yellow-700 text-xs">ウィンドウ判定：タグが必要です</div>
          </li>
        )}

        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null
          const isSameSender = prevMessage && prevMessage.direction === message.direction
          const timeDiff = prevMessage 
            ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()
            : 0
          const isGrouped = isSameSender && timeDiff < 5 * 60 * 1000 // 5分以内

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isGrouped={isGrouped}
              isTranslationEnabled={isTranslationEnabled}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </ul>
    </div>
  )
}
