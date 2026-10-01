import { SlidersHorizontal, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { cx } from '../lib/cx'
import { DoctorApp } from '../roles/doctor/DoctorApp'
import { PatientApp } from '../roles/patient/PatientApp'
import { StaffApp } from '../roles/staff/StaffApp'
import { useShell } from '../store/shell'
import { BrowserFrame } from './BrowserFrame'
import { ControlPanel } from './ControlPanel'
import { PhoneFrame } from './PhoneFrame'

/**
 * Controls in a left column, the device on the right. All three role apps stay mounted so each keeps
 * its place while you switch roles during the hero scenario; only the active one is visible.
 * On narrow screens the controls fold into an overlay.
 */
export const Shell = () => {
  const t = useT()
  const role = useShell((s) => s.role)
  const [controlsOpen, setControlsOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside
        aria-label={t.shell.controls}
        className={cx(
          'z-[90] w-[248px] shrink-0 border-r border-stage-ink/10 bg-stage',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:shadow-sheet max-md:transition-[translate] max-md:duration-300 max-md:ease-drawer',
          controlsOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
      >
        <ControlPanel />
      </aside>

      <button
        type="button"
        aria-label={t.shell.controls}
        aria-expanded={controlsOpen}
        onClick={() => setControlsOpen((o) => !o)}
        className="fixed top-3 left-3 z-[95] flex size-10 items-center justify-center rounded-full bg-stage-ink text-stage shadow-sheet md:hidden"
      >
        {controlsOpen ? <X aria-hidden size={18} /> : <SlidersHorizontal aria-hidden size={18} />}
      </button>

      <main className="relative min-w-0 flex-1">
        <Stage visible={role === 'patient'}>
          <PhoneFrame>
            <PatientApp />
          </PhoneFrame>
        </Stage>
        <Stage visible={role === 'doctor'}>
          <PhoneFrame>
            <DoctorApp />
          </PhoneFrame>
        </Stage>
        <Stage visible={role === 'staff'}>
          <BrowserFrame url="app.parlo.de/practice">
            <StaffApp />
          </BrowserFrame>
        </Stage>
      </main>
    </div>
  )
}

/**
 * Inactive roles stay laid out but invisible (not display: none), so their frames always know
 * their size and switching roles never shows a frame at the wrong scale.
 */
const Stage = ({ visible, children }: { visible: boolean; children: ReactNode }) => (
  <div aria-hidden={!visible} className={cx('absolute inset-4 sm:inset-6', !visible && 'invisible pointer-events-none')}>
    {children}
  </div>
)
