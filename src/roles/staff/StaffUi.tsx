import { createContext, useContext } from 'react'

export type Panel =
  | { kind: 'appointment'; id: string }
  | { kind: 'booking'; doctorId?: string; date?: string; time?: string; patientId?: string }
  | { kind: 'conflict'; blockId: string }
  | null

export type CalendarView = 'day' | 'week'

/** Dashboard state shared by Today and Calendar: which day is shown, which panel is open. */
export type StaffUi = {
  date: string
  setDate: (date: string) => void
  view: CalendarView
  setView: (view: CalendarView) => void
  weekDoctor: string
  setWeekDoctor: (id: string) => void
  panel: Panel
  open: (panel: Panel) => void
  toast: (message: string) => void
  /** Appointment to highlight after "View in calendar" */
  focusId: string | null
  focus: (appointmentId: string, date: string) => void
}

export const StaffUiContext = createContext<StaffUi | null>(null)

export const useStaffUi = () => {
  const ui = useContext(StaffUiContext)
  if (!ui) throw new Error('useStaffUi must be used inside StaffApp')
  return ui
}
