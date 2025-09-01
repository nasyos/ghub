import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

interface CandidateHeaderProps {
  candidate: {
    name: string
    nationality: string
    gender: string
    age: string
    desiredPosition: string
  }
  sendState: {
    label: string
    color: string
  }
  ownerCA: string
  consentStatus: {
    label: string
    color: string
  }
  isTranslationEnabled: boolean
  onTranslationToggle: () => void
  className?: string
}

export function CandidateHeader({
  candidate,
  sendState,
  ownerCA,
  consentStatus,
  isTranslationEnabled,
  onTranslationToggle,
  className = "border-b px-3 md:px-4 py-2"
}: CandidateHeaderProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">
            {candidate.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {candidate.nationality} • 
            {candidate.gender} • 
            {candidate.age} • 
            {candidate.desiredPosition}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 overflow-hidden">
          <Badge className={`text-[10px] py-0.5 text-white ${sendState.color}`}>
            {sendState.label}
          </Badge>
          <Badge variant="secondary" className="text-[10px] py-0.5">
            担当CA: {ownerCA}
          </Badge>
          <Badge className={`text-[10px] py-0.5 text-white ${consentStatus.color}`}>
            {consentStatus.label}
          </Badge>
        </div>
        <Button
          variant={isTranslationEnabled ? "default" : "outline"}
          size="sm"
          onClick={onTranslationToggle}
        >
          <Languages className="h-3 w-3 mr-1" />
          {isTranslationEnabled ? "翻訳ON" : "翻訳"}
        </Button>
      </div>
    </div>
  )
}
