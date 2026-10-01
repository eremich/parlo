import { CircleCheck } from 'lucide-react'
import { useEffect } from 'react'

export type ToastProps = {
  message: string | null
  onDone: () => void
  /** Milliseconds before it hides */
  duration?: number
  /** Distance from the bottom edge, e.g. above a tab bar */
  offset?: number
}

/** Brief confirmation after an action ("Omar Khalil moved to Thu 09:20"). Announced politely, never steals focus. */
export const Toast = ({ message, onDone, duration = 3200, offset = 24 }: ToastProps) => {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDone, duration)
    return () => window.clearTimeout(timer)
  }, [message, onDone, duration])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 z-[70] flex justify-center px-4"
      style={{ bottom: offset }}
    >
      {message && (
        <p
          key={message}
          className="flex animate-pop-in items-center gap-2 rounded-chip bg-ink px-4 py-2.5 text-web-body font-medium text-surface shadow-sheet"
        >
          <CircleCheck aria-hidden size={18} className="text-ok" />
          {message}
        </p>
      )}
    </div>
  )
}
