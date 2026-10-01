import { useEffect, useState } from 'react'
import { OFFER_MINUTES, useApp } from '../../store/app'
import type { Offer } from '../../data/types'

/** Live countdown for a waitlist offer; marks it expired when time runs out. */
export const useOfferCountdown = (offer: Offer | undefined) => {
  const expireOffer = useApp((s) => s.expireOffer)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!offer || offer.status !== 'open') return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [offer])

  const remainingMs = offer ? Math.max(0, offer.expiresAt - now) : 0

  useEffect(() => {
    if (offer?.status === 'open' && remainingMs === 0) expireOffer(offer.id)
  }, [offer, remainingMs, expireOffer])

  const minutes = Math.floor(remainingMs / 60_000)
  const seconds = Math.floor((remainingMs % 60_000) / 1000)
  return {
    label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    progress: remainingMs / (OFFER_MINUTES * 60_000),
  }
}
