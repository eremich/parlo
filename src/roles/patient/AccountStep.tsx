import { Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { Segmented } from '../../components/Segmented'
import { TextField } from '../../components/TextField'
import { INSURERS } from '../../data/patients'
import type { Insurance } from '../../data/types'
import { useT } from '../../i18n'
import { cx } from '../../lib/cx'
import { useApp } from '../../store/app'
import { StepBody } from './BookingScreen'

type Phase = 'contact' | 'code' | 'profile'

/** Account created inside the booking: contact → one-time code → name, birth date, insurance. */
export const AccountStep = ({ onDone }: { onDone: () => void }) => {
  const t = useT()
  const tb = t.patient.booking
  const signUp = useApp((s) => s.signUp)
  const languages = useApp((s) => s.filters.languages)

  const [phase, setPhase] = useState<Phase>('contact')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const [insurance, setInsurance] = useState<Insurance>('public')
  const [insurer, setInsurer] = useState(INSURERS.public[0])
  const [missing, setMissing] = useState(false)

  const toIsoDate = (value: string) => {
    const m = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''
  }

  return (
    <StepBody title={tb.accountTitle} lead={tb.accountLead}>
      {phase === 'contact' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (contact.trim()) setPhase('code')
            else setMissing(true)
          }}
        >
          <Segmented
            label={tb.contactMethod}
            fullWidth
            value={method}
            onChange={(m) => {
              setMethod(m)
              setContact('')
            }}
            options={[
              { value: 'email', label: tb.email },
              { value: 'phone', label: tb.phone },
            ]}
          />
          <TextField
            label={method === 'email' ? tb.emailLabel : tb.phoneLabel}
            type={method === 'email' ? 'email' : 'tel'}
            icon={method === 'email' ? Mail : Phone}
            autoComplete={method === 'email' ? 'email' : 'tel'}
            placeholder={method === 'email' ? 'name@example.com' : '+49 …'}
            value={contact}
            error={missing && !contact.trim() ? tb.required : undefined}
            onChange={(e) => setContact(e.target.value)}
          />
          <Button type="submit" size="lg" fullWidth>
            {tb.sendCode}
          </Button>
        </form>
      )}

      {phase === 'code' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (/^\d{6}$/.test(code.replace(/\s/g, ''))) setPhase('profile')
            else setCodeError(true)
          }}
        >
          <TextField
            label={tb.codeLabel}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            className={cx('[&_input]:text-center [&_input]:text-title2 [&_input]:tracking-[0.4em] [&_input]:tabular-nums')}
            value={code}
            hint={tb.codeHint(contact)}
            error={codeError ? tb.codeError : undefined}
            onChange={(e) => {
              setCode(e.target.value)
              setCodeError(false)
            }}
          />
          <Button type="submit" size="lg" fullWidth>
            {tb.verify}
          </Button>
        </form>
      )}

      {phase === 'profile' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const birthDate = toIsoDate(birth)
            if (!name.trim() || !birthDate) return setMissing(true)
            signUp({
              name: name.trim(),
              birthDate,
              insurance,
              insurer,
              languages: languages.length ? languages : ['EN'],
              ...(method === 'email' ? { email: contact } : { phone: contact }),
            })
            onDone()
          }}
        >
          <TextField
            label={tb.nameLabel}
            autoComplete="name"
            value={name}
            error={missing && !name.trim() ? tb.required : undefined}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label={tb.birthLabel}
            placeholder={tb.birthHint}
            inputMode="numeric"
            autoComplete="bday"
            value={birth}
            error={missing && !toIsoDate(birth) ? tb.required : undefined}
            onChange={(e) => setBirth(e.target.value)}
          />
          <div>
            <p className="pb-1.5 text-footnote font-semibold text-ink">{tb.insuranceLabel}</p>
            <Segmented<Insurance>
              label={tb.insuranceLabel}
              fullWidth
              value={insurance}
              onChange={(value) => {
                setInsurance(value)
                setInsurer(INSURERS[value][0])
              }}
              options={[
                { value: 'public', label: t.common.public },
                { value: 'private', label: t.common.private },
              ]}
            />
          </div>
          <label className="block">
            <span className="block pb-1.5 text-footnote font-semibold text-ink">{tb.insurerLabel}</span>
            <select
              value={insurer}
              onChange={(e) => setInsurer(e.target.value)}
              className="min-h-11 w-full appearance-none rounded-control border border-line bg-surface px-3.5 text-body text-ink outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
            >
              {INSURERS[insurance].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <Button type="submit" size="lg" fullWidth>
            {tb.createAccount}
          </Button>
        </form>
      )}
    </StepBody>
  )
}
