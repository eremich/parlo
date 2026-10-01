import { useRef, type ReactNode } from 'react'
import { useFitScale } from '../hooks/useFitScale'
import { useApp } from '../store/app'

const SCREEN = { width: 390, height: 844 }
const BEZEL = 12

/** iPhone-sized frame (390 × 844) that scales down to fit the stage. */
export const PhoneFrame = ({ children }: { children: ReactNode }) => {
  const stage = useRef<HTMLDivElement>(null)
  const outer = { width: SCREEN.width + BEZEL * 2, height: SCREEN.height + BEZEL * 2 }
  const scale = useFitScale(stage, outer.width, outer.height)

  return (
    <div ref={stage} className="flex h-full w-full items-center justify-center">
      <div style={{ width: outer.width * scale, height: outer.height * scale }}>
        <div
          className="origin-top-left rounded-[58px] bg-bezel shadow-device"
          style={{ ...outer, padding: BEZEL, transform: `scale(${scale})` }}
        >
          <div data-overlay-root className="group/phone relative h-full w-full overflow-hidden rounded-[46px] bg-canvas">
            <StatusBar />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatusBar = () => {
  // The prototype clock, so the phone shows the same time the scenario is set to
  const time = useApp((s) => s.clock.time).replace(/^0/, '')
  return (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[54px] items-center justify-between px-9 pt-1 text-[16px] font-semibold text-ink tabular-nums transition-colors duration-200 group-has-[[data-statusbar=light]]/phone:text-white"
  >
    <span>{time}</span>
    <span className="absolute left-1/2 top-[11px] h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
    <span className="flex items-center gap-1.5">
      <span className="flex items-end gap-[2px]">
        {[5, 7, 9, 11].map((h) => (
          <span key={h} className="w-[3px] rounded-[1px] bg-current" style={{ height: h }} />
        ))}
      </span>
      <span className="relative h-[12px] w-[25px] rounded-[4px] border border-current/40 p-[1.5px]">
        <span className="block h-full w-4/5 rounded-[2px] bg-current" />
      </span>
    </span>
  </div>
  )
}
