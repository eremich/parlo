import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { doctorById } from '../data/doctors'
import { LANGUAGE_NAMES } from '../data/languages'
import { onCanvas } from '../design-system/decorators'
import { Skeleton } from '../components/Skeleton'
import { DoctorResultCard } from './DoctorResultCard'

const aydin = doctorById('aydin')
const weber = doctorById('weber')

const meta = {
  title: 'Patterns/DoctorResultCard',
  component: DoctorResultCard,
  decorators: [onCanvas],
  args: {
    name: aydin.name,
    photo: aydin.photo,
    subtitle: 'GP · Hausarztpraxis am Görlitzer Park',
    distance: '0.6 km',
    earliest: { day: 'Tomorrow', time: '08:40' },
    slots: ['08:40', '09:20', '10:00'],
    languages: aydin.languages,
    languageNames: LANGUAGE_NAMES.en,
    matchedLanguages: ['EN'],
    insuranceLabel: 'Public & private',
    rating: aydin.rating,
    reviewCount: aydin.reviewCount,
    video: true,
    onOpen: fn(),
    onBookSlot: fn(),
  },
} satisfies Meta<typeof DoctorResultCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Specialists: earliest in weeks, referral expected. */
export const Specialist: Story = {
  args: {
    name: weber.name,
    photo: weber.photo,
    subtitle: 'Dermatology · Hautarztpraxis Prenzlauer Berg',
    distance: '4.9 km',
    earliest: { day: 'Tue, 31 Mar', time: '11:15' },
    slots: ['11:15', '14:30'],
    languages: weber.languages,
    rating: weber.rating,
    reviewCount: weber.reviewCount,
    video: false,
    referralExpected: true,
  },
}

export const German: Story = {
  args: {
    subtitle: 'Allgemeinmedizin · Hausarztpraxis am Görlitzer Park',
    distance: '0,6 km',
    earliest: { day: 'Morgen', time: '08:40' },
    languageNames: LANGUAGE_NAMES.de,
    insuranceLabel: 'Gesetzlich & privat',
    labels: {
      speaks: 'Spricht',
      book: (time: string) => `${time} buchen`,
      allTimes: 'Alle Zeiten',
      rating: (v: number, c: number) => `Bewertet mit ${v.toFixed(1)} aus ${c} Bewertungen`,
      video: 'Video',
      referral: 'Überweisung',
    },
  },
}

export const Loading: Story = {
  render: () => (
    <div className="space-y-3 rounded-card bg-surface p-4">
      <Skeleton className="h-7 w-44" />
      <div className="flex gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-[4.25rem] rounded-chip" />
        <Skeleton className="h-9 w-[4.25rem] rounded-chip" />
        <Skeleton className="h-9 w-[4.25rem] rounded-chip" />
      </div>
    </div>
  ),
}
