import { Check, Minus } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { photoByName } from '../../data/doctors'
import { useT } from '../../i18n'
import { PRACTICE_DOCTORS } from './practice'

type Role = 'manager' | 'reception' | 'doctor'

const MEMBERS: { name: string; role: Role; email: string }[] = [
  { name: 'Sabine Koch', role: 'manager', email: 's.koch@goerlitzer-praxis.de' },
  { name: 'Deniz Yılmaz', role: 'reception', email: 'd.yilmaz@goerlitzer-praxis.de' },
  ...PRACTICE_DOCTORS.map((d) => ({ name: d.name, role: 'doctor' as Role, email: `${d.id}@goerlitzer-praxis.de` })),
]

/** Which role can do what, in the order of t.staff.team.perms */
const MATRIX: Record<Role, boolean[]> = {
  manager: [true, true, true, true, false, true, true, true],
  reception: [true, true, true, true, false, false, false, false],
  doctor: [true, false, false, true, true, false, true, false],
}

export const TeamPage = () => {
  const t = useT()
  const tt = t.staff.team
  const roles: Role[] = ['manager', 'reception', 'doctor']

  return (
    <div className="space-y-8">
      <h1 className="text-page-title font-semibold text-ink">{tt.title}</h1>

      <section>
        <h2 className="pb-3 text-section font-semibold text-ink">{tt.members}</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">
          {MEMBERS.map((m) => (
            <li key={m.email} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={m.name} src={photoByName(m.name)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-web-body font-semibold text-ink">
                  {m.name}
                  {m.name === t.staff.user.name && <span className="ml-2 text-meta font-normal text-muted">· {tt.you}</span>}
                </p>
                <p className="text-meta text-muted">{m.email}</p>
              </div>
              <span className="rounded-chip bg-brand-soft px-2.5 py-1 text-meta font-semibold text-brand">{tt.roles[m.role]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="pb-3 text-section font-semibold text-ink">{tt.permissions}</h2>
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          <table className="w-full text-left">
            <thead className="border-b border-line text-label text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">{tt.permission}</th>
                {roles.map((r) => (
                  <th key={r} className="w-44 px-3 py-3 text-center font-semibold">
                    {tt.roles[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-web-body text-ink">
              {tt.perms.map((perm, i) => (
                <tr key={perm}>
                  <td className="px-5 py-2.5">{perm}</td>
                  {roles.map((r) => (
                    <td key={r} className="px-3 py-2.5 text-center">
                      {MATRIX[r][i] ? (
                        <Check aria-label={tt.allowed} size={18} className="inline text-ok-text" />
                      ) : (
                        <Minus aria-label={tt.notAllowed} size={18} className="inline text-muted/60" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
