import { useEffect } from 'react'
import { AppIcon } from '../components/Logo'

export type PushNotificationProps = {
  app: string
  /** "now" */
  time: string
  title: string
  body: string
  onOpen: () => void
  onDismiss: () => void
  /** Hides itself after this many ms; tapping opens instead */
  autoHideMs?: number
}

/** iOS-style banner that drops in at the top of the phone screen. */
export const PushNotification = ({ app, time, title, body, onOpen, onDismiss, autoHideMs = 7000 }: PushNotificationProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, autoHideMs)
    return () => window.clearTimeout(timer)
  }, [onDismiss, autoHideMs])

  return (
    <div className="pointer-events-none absolute inset-x-2 top-[52px] z-[60]">
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto flex w-full animate-[push-in_420ms_var(--ease-drawer)] items-start gap-3 rounded-[22px] bg-surface/90 p-3 text-left shadow-sheet ring-1 ring-line/60 backdrop-blur-xl motion-reduce:animate-none"
      >
        <AppIcon size={36} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-footnote font-semibold text-muted uppercase">{app}</span>
            <span className="text-footnote text-muted">{time}</span>
          </span>
          <span className="block text-subheadline font-semibold text-ink">{title}</span>
          <span className="block text-subheadline text-ink">{body}</span>
        </span>
      </button>
    </div>
  )
}
