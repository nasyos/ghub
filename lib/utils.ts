import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(dateString: string | undefined) {
  if (!dateString) return "--:--"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "--:--"
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "--:--"
  }
}
