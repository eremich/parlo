import { useRef, type ReactNode } from 'react'
import { useFitScale } from '../hooks/useFitScale'

const VIEWPORT = { width: 1440, height: 900 }
const CHROME_HEIGHT = 40

/** Desktop browser window (1440 × 900 viewport) that scales down to fit the stage. */
export const BrowserFrame = ({ url, children }: { url: string; children: ReactNode }) => {
  const stage = useRef<HTMLDivElement>(null)
  const outer = { width: VIEWPORT.width, height: VIEWPORT.height + CHROME_HEIGHT }
  const scale = useFitScale(stage, outer.width, outer.height)

  return (
    <div ref={stage} className="flex h-full w-full items-center justify-center">
      <div style={{ width: outer.width * scale, height: outer.height * scale }}>
        <div
          className="origin-top-left overflow-hidden rounded-[12px] bg-surface shadow-device ring-1 ring-line"
          style={{ ...outer, transform: `scale(${scale})` }}
        >
          <div className="flex items-center gap-4 border-b border-line bg-canvas px-4" style={{ height: CHROME_HEIGHT }}>
            <span aria-hidden className="flex gap-2">
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <span key={c} className="size-3 rounded-full" style={{ background: c }} />
              ))}
            </span>
            <span className="mx-auto w-[420px] truncate rounded-[6px] bg-surface px-3 py-1 text-center text-meta text-muted">
              {url}
            </span>
          </div>
          <div className="relative bg-canvas" style={VIEWPORT}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
