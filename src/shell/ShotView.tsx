import { DoctorApp } from '../roles/doctor/DoctorApp'
import { PatientApp } from '../roles/patient/PatientApp'
import { StaffApp } from '../roles/staff/StaffApp'
import { useShell } from '../store/shell'
import { PhoneScreen, SCREEN } from './PhoneFrame'

const WEB = { width: 1440, height: 900 }

/** `?shot=1`: the active role's screen alone, at its real size, for automated screenshots. */
export const ShotView = () => {
  const role = useShell((s) => s.role)
  if (role === 'staff')
    return (
      <div data-shot className="relative overflow-hidden bg-canvas" style={WEB}>
        <StaffApp />
      </div>
    )
  return (
    <div data-shot style={SCREEN}>
      <PhoneScreen>{role === 'doctor' ? <DoctorApp /> : <PatientApp />}</PhoneScreen>
    </div>
  )
}
