import { Building2, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { ListGroup, ListRow } from '../../components/List'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { BACK } from '../../components/StackRoutes'
import { practiceById } from '../../data/doctors'
import { useT } from '../../i18n'
import { useApp, useCurrentPatient } from '../../store/app'

/** Consent is explicit and reversible: every practice with access, one tap to withdraw. */
export const PrivacyScreen = () => {
  const t = useT()
  const tp = t.patient.privacy
  const navigate = useNavigate()
  const patient = useCurrentPatient()
  const consents = useApp((s) => s.consents)
  const withdrawConsent = useApp((s) => s.withdrawConsent)
  const practices = patient
    ? consents.filter((c) => c.startsWith(`${patient.id}|`)).map((c) => practiceById(c.split('|')[1]))
    : []

  return (
    <Screen push>
      <NavBar title={tp.title} backLabel={t.common.back} onBack={() => navigate('/profile', { state: BACK })} />
      <p className="px-4 pt-3 pb-5 text-body text-pretty text-muted">{tp.lead}</p>
      {practices.length === 0 ? (
        <div className="flex flex-col items-center px-8 pt-6 text-center">
          <ShieldCheck aria-hidden size={32} className="text-ok" />
          <p className="mt-3 text-headline text-ink">{tp.empty}</p>
        </div>
      ) : (
        <ListGroup footer={tp.shared}>
          {practices.map((practice) => (
            <ListRow
              key={practice.id}
              icon={Building2}
              title={practice.name}
              subtitle={practice.district}
              trailing={
                <Button variant="destructive" onClick={() => patient && withdrawConsent(patient.id, practice.id)}>
                  {tp.withdraw}
                </Button>
              }
            />
          ))}
        </ListGroup>
      )}
    </Screen>
  )
}
