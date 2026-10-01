import { ArrowUpToLine, CalendarClock, Download, MessageSquare, Languages, LogIn, LogOut, ShieldCheck, Trash2, UserRoundCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { LargeTitle } from '../../components/LargeTitle'
import { ListGroup, ListRow } from '../../components/List'
import { Screen } from '../../components/Screen'
import { Sheet } from '../../components/Sheet'
import { Switch } from '../../components/Switch'
import type { LanguageCode } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp, useCurrentPatient } from '../../store/app'

const LANGUAGES: LanguageCode[] = ['DE', 'EN', 'RU', 'UK', 'TR', 'AR', 'PL', 'FR', 'ES', 'FA']

export const ProfileScreen = () => {
  const t = useT()
  const tp = t.patient.profile
  const navigate = useNavigate()
  const patient = useCurrentPatient()
  const consents = useApp((s) => s.consents)
  const appointments = useApp((s) => s.appointments)
  const signOut = useApp((s) => s.signOut)
  const signIn = useApp((s) => s.signIn)
  const cancel = useApp((s) => s.cancel)
  const [notify, setNotify] = useState({ reminders: true, offers: true, messages: false })
  const [sheet, setSheet] = useState<'languages' | 'delete' | null>(null)
  const [downloaded, setDownloaded] = useState(false)

  if (!patient)
    return (
      <Screen tabBar>
        <LargeTitle>{t.patient.tabs.profile}</LargeTitle>
        <div className="px-4 pt-4">
          <h2 className="text-title2 font-semibold text-ink">{tp.signedOut}</h2>
          <p className="mt-1 text-body text-muted">{tp.signedOutLead}</p>
          <Button size="lg" className="mt-5" icon={LogIn} onClick={() => signIn('anna')}>
            {tp.signIn}
          </Button>
        </div>
      </Screen>
    )

  const access = consents.filter((c) => c.startsWith(`${patient.id}|`)).length

  return (
    <Screen tabBar>
      <LargeTitle>{t.patient.tabs.profile}</LargeTitle>
      <div className="space-y-6 pt-2">
        <ListGroup title={tp.you}>
          <ListRow leading={<Avatar name={patient.name} />} title={patient.name} subtitle={patient.email ?? patient.phone} />
          <ListRow
            icon={ShieldCheck}
            title={t.patient.doctor.insurance}
            value={`${patient.insurance === 'public' ? t.common.public : t.common.private} · ${patient.insurer}`}
          />
          <ListRow
            icon={Languages}
            title={t.patient.doctor.languages}
            value={patient.languages.join(', ')}
            onClick={() => setSheet('languages')}
          />
        </ListGroup>

        <ListGroup title={tp.notifications}>
          {(
            [
              ['reminders', tp.notifReminders, CalendarClock],
              ['offers', tp.notifOffers, ArrowUpToLine],
              ['messages', tp.notifMessages, MessageSquare],
            ] as const
          ).map(([key, label, icon]) => (
            <ListRow
              key={key}
              icon={icon}
              title={label}
              trailing={
                <Switch label={label} hideLabel checked={notify[key]} onChange={(v) => setNotify({ ...notify, [key]: v })} />
              }
            />
          ))}
        </ListGroup>

        <ListGroup title={tp.privacy}>
          <ListRow icon={UserRoundCheck} title={tp.privacyAccess} value={String(access)} onClick={() => navigate('/privacy')} />
          <ListRow icon={Download} title={tp.download} onClick={() => setDownloaded(true)} />
        </ListGroup>
        {downloaded && (
          <div className="px-4">
            <Banner tone="ok" title={tp.download} onDismiss={() => setDownloaded(false)} dismissLabel={t.common.close}>
              {tp.downloadDone(patient.email ?? patient.phone ?? '')}
            </Banner>
          </div>
        )}

        <div className="px-4">
          <Button variant="secondary" fullWidth icon={LogOut} onClick={signOut}>
            {tp.signOut}
          </Button>
        </div>

        {/* Kept apart from everyday rows so it is never tapped by accident */}
        <ListGroup>
          <ListRow icon={Trash2} title={tp.delete} destructive onClick={() => setSheet('delete')} />
        </ListGroup>
      </div>

      <LanguagesSheet open={sheet === 'languages'} onClose={() => setSheet(null)} />
      <Sheet
        open={sheet === 'delete'}
        onClose={() => setSheet(null)}
        title={tp.deleteTitle}
        detent="medium"
        closeLabel={t.common.close}
        footer={
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              variant="destructive"
              fullWidth
              onClick={() => {
                appointments
                  .filter((a) => a.patientId === patient.id && (a.status === 'confirmed' || a.status === 'pending'))
                  .forEach((a) => cancel(a.id))
                setSheet(null)
                signOut()
              }}
            >
              {tp.deleteConfirm}
            </Button>
            <Button variant="plain" fullWidth onClick={() => setSheet(null)}>
              {tp.deleteKeep}
            </Button>
          </div>
        }
      >
        <p className="text-body text-pretty text-ink">{tp.deleteBody}</p>
      </Sheet>
    </Screen>
  )
}

const LanguagesSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const t = useT()
  const tp = t.patient.profile
  const f = useFormat()
  const patient = useCurrentPatient()
  const updatePatient = useApp((s) => s.updatePatient)
  const setFilters = useApp((s) => s.setFilters)
  const [draft, setDraft] = useState<LanguageCode[]>(patient?.languages ?? [])
  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) setDraft(patient?.languages ?? [])
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tp.editLanguages}
      closeLabel={t.common.close}
      footer={
        <Button
          size="lg"
          fullWidth
          disabled={!draft.length}
          onClick={() => {
            if (!patient) return
            updatePatient(patient.id, { languages: draft })
            setFilters({ languages: draft.filter((l) => l !== 'DE') })
            onClose()
          }}
        >
          {tp.save}
        </Button>
      }
    >
      <p className="pb-4 text-subheadline text-muted">{tp.editLanguagesLead}</p>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((code) => (
          <Chip
            key={code}
            selected={draft.includes(code)}
            onPressedChange={(on) => setDraft(on ? [...draft, code] : draft.filter((l) => l !== code))}
          >
            {f.languageNames[code]}
          </Chip>
        ))}
      </div>
    </Sheet>
  )
}
