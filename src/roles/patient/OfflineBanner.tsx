import { WifiOff } from 'lucide-react'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { useT } from '../../i18n'
import { useApp } from '../../store/app'

/** Shown on patient screens while the phone has no connection. */
export const OfflineBanner = () => {
  const t = useT()
  const offline = useApp((s) => s.offline)
  const setOffline = useApp((s) => s.setOffline)
  if (!offline) return null
  return (
    <div className="px-4 pb-3">
      <Banner
        tone="warn"
        icon={WifiOff}
        title={t.patient.offline.title}
        action={
          <Button variant="secondary" onClick={() => setOffline(false)}>
            {t.patient.offline.retry}
          </Button>
        }
      >
        {t.patient.offline.body}
      </Banner>
    </div>
  )
}
