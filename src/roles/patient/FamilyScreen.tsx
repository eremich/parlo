import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Chip } from '../../components/Chip'
import { LargeTitle } from '../../components/LargeTitle'
import { Screen } from '../../components/Screen'
import { Segmented } from '../../components/Segmented'
import { Sheet } from '../../components/Sheet'
import { TextField } from '../../components/TextField'
import { INSURERS } from '../../data/patients'
import type { Insurance, LanguageCode, Patient } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { LanguageChips } from '../../patterns/LanguageChips'
import { useApp, useCurrentPatient, useHousehold } from '../../store/app'

const LANGUAGES: LanguageCode[] = ['DE', 'EN', 'RU', 'UK', 'TR', 'AR', 'PL', 'FR', 'ES', 'FA']

const age = (birthDate: string, today: string) => {
  const [by, bm, bd] = birthDate.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

/** Everyone the patient books for: each with their own insurance and languages. */
export const FamilyScreen = () => {
  const t = useT()
  const tf = t.patient.family
  const f = useFormat()
  const navigate = useNavigate()
  const patient = useCurrentPatient()
  const household = useHousehold()
  const today = useApp((s) => s.clock.date)
  const setFilters = useApp((s) => s.setFilters)
  const [adding, setAdding] = useState(false)

  const bookFor = (member: Patient) => {
    setFilters({
      specialty: member.relation === 'child' ? 'pediatrics' : null,
      languages: member.languages.filter((l) => l !== 'DE'),
      insurance: member.insurance,
    })
    navigate('/results')
  }

  return (
    <Screen tabBar>
      <LargeTitle subtitle={tf.lead}>{t.patient.tabs.family}</LargeTitle>
      {patient && (
        <ul className="space-y-3 px-4 pt-3">
          {household.map((member) => {
            const isYou = member.id === patient.id
            return (
              <li key={member.id} className="rounded-card bg-surface p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-headline text-ink">{member.name}</p>
                    <p className="text-subheadline text-muted">
                      {isYou ? tf.you : tf.relation[member.relation ?? 'child']} · {tf.age(age(member.birthDate, today))} ·{' '}
                      {member.insurance === 'public' ? t.common.public : t.common.private} {member.insurer}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <LanguageChips
                    size="sm"
                    languages={member.languages.map((code) => ({ code, level: 'fluent' as const }))}
                    names={f.languageNames}
                    prefix={tf.languages}
                  />
                  {!isYou && (
                    <Button variant="secondary" onClick={() => bookFor(member)}>
                      {tf.book(member.name.split(' ')[0])}
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <div className="px-4 pt-4">
        <Button variant="plain" fullWidth icon={UserPlus} onClick={() => setAdding(true)} disabled={!patient}>
          {tf.add}
        </Button>
      </div>
      <AddMemberSheet open={adding} onClose={() => setAdding(false)} />
    </Screen>
  )
}

const AddMemberSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const t = useT()
  const tf = t.patient.family
  const tb = t.patient.booking
  const f = useFormat()
  const patient = useCurrentPatient()
  const addFamilyMember = useApp((s) => s.addFamilyMember)
  const [relation, setRelation] = useState<'child' | 'parent'>('child')
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const [coInsured, setCoInsured] = useState(true)
  const [insurance, setInsurance] = useState<Insurance>('public')
  const [languages, setLanguages] = useState<LanguageCode[]>(patient?.languages ?? [])
  const [missing, setMissing] = useState(false)

  const birthIso = (() => {
    const m = birth.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''
  })()
  const sharesInsurance = relation === 'child' && patient?.insurance === 'public' && coInsured

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tf.sheetTitle}
      closeLabel={t.common.close}
      footer={
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            if (!patient || !name.trim() || !birthIso) return setMissing(true)
            addFamilyMember({
              name: name.trim(),
              birthDate: birthIso,
              insurance: sharesInsurance ? patient.insurance : insurance,
              insurer: sharesInsurance ? patient.insurer : INSURERS[insurance][0],
              languages: languages.length ? languages : ['DE'],
              guardianId: patient.id,
              relation,
            })
            setName('')
            setBirth('')
            setMissing(false)
            onClose()
          }}
        >
          {tf.save}
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="pb-1.5 text-footnote font-semibold text-ink">{tf.relationLabel}</p>
          <Segmented
            label={tf.relationLabel}
            fullWidth
            value={relation}
            onChange={setRelation}
            options={[
              { value: 'child', label: tf.relation.child },
              { value: 'parent', label: tf.relation.parent },
            ]}
          />
        </div>
        <TextField
          label={tb.nameLabel}
          value={name}
          error={missing && !name.trim() ? tb.required : undefined}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={tb.birthLabel}
          placeholder={tb.birthHint}
          inputMode="numeric"
          value={birth}
          error={missing && !birthIso ? tb.required : undefined}
          onChange={(e) => setBirth(e.target.value)}
        />
        {relation === 'child' && patient?.insurance === 'public' ? (
          <Checkbox label={tf.coInsured} description={tf.coInsuredHint} checked={coInsured} onChange={setCoInsured} />
        ) : null}
        {!sharesInsurance && (
          <div>
            <p className="pb-1.5 text-footnote font-semibold text-ink">{tb.insuranceLabel}</p>
            <Segmented<Insurance>
              label={tb.insuranceLabel}
              fullWidth
              value={insurance}
              onChange={setInsurance}
              options={[
                { value: 'public', label: t.common.public },
                { value: 'private', label: t.common.private },
              ]}
            />
          </div>
        )}
        <div>
          <p className="pb-1.5 text-footnote font-semibold text-ink">{tf.languages}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((code) => (
              <Chip
                key={code}
                selected={languages.includes(code)}
                onPressedChange={(on) => setLanguages(on ? [...languages, code] : languages.filter((l) => l !== code))}
              >
                {f.languageNames[code]}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  )
}
