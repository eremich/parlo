import { Plus } from 'lucide-react'
import { Button } from '../../components/Button'
import { useT } from '../../i18n'
import { PracticeCalendar } from './PracticeCalendar'
import { useStaffUi } from './StaffUi'

export const CalendarScreen = () => {
  const t = useT()
  const ui = useStaffUi()
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <h1 className="text-page-title font-semibold text-ink">{t.staff.calendar.title}</h1>
        <Button icon={Plus} onClick={() => ui.open({ kind: 'booking', date: ui.date })}>
          {t.staff.today.newBooking}
          <kbd className="ml-1 rounded-[4px] bg-on-brand/15 px-1.5 text-label font-semibold">N</kbd>
        </Button>
      </header>
      <PracticeCalendar allowWeek />
    </div>
  )
}
