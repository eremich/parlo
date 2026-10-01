import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { doctorPhoto } from '../data/doctors'
import { CalendarGrid, type CalendarEvent } from './CalendarGrid'

const EVENTS: CalendarEvent[] = [
  { id: '1', columnId: 'aydin', start: '08:00', duration: 15, title: 'Lukas Schmidt', status: 'done' },
  { id: '2', columnId: 'aydin', start: '08:20', duration: 15, title: 'Mehmet Öztürk', status: 'done' },
  { id: '3', columnId: 'aydin', start: '08:40', duration: 20, title: 'Hannah Lange', detail: 'Follow-up', status: 'checkedIn' },
  {
    id: '4',
    columnId: 'aydin',
    start: '09:00',
    duration: 20,
    title: 'Omar Khalil',
    detail: 'New patient · EN, AR',
    status: 'confirmed',
    filledFromWaitlist: true,
    fresh: true,
  },
  { id: '5', columnId: 'aydin', start: '09:00', duration: 20, title: 'Anna Petrova', status: 'cancelled' },
  { id: '6', columnId: 'aydin', start: '09:40', duration: 15, title: 'Petra Wolf', status: 'pending' },
  { id: '7', columnId: 'aydin', start: '10:20', duration: 30, title: 'Ali Yıldız', detail: 'Check-up', status: 'confirmed' },
  { id: '8', columnId: 'busch', start: '08:00', duration: 20, title: 'Sophie Klein', status: 'done' },
  { id: '9', columnId: 'busch', start: '08:30', duration: 15, title: 'Jan Hoffmann', status: 'noShow' },
  { id: '10', columnId: 'busch', start: '09:10', duration: 20, title: 'Maria Rossi', detail: 'New patient · IT, EN', status: 'inProgress' },
  { id: '11', columnId: 'busch', start: '10:00', duration: 15, title: 'Lea Braun', status: 'runningLate' },
  { id: '12', columnId: 'richter', start: '08:10', duration: 15, title: 'Felix Neumann', status: 'done' },
  { id: '13', columnId: 'richter', start: '09:30', duration: 20, title: 'Video · Nina Roth', status: 'confirmed' },
]

const meta = {
  title: 'Patterns/CalendarGrid',
  component: CalendarGrid,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[1120px] bg-canvas p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    columns: [
      { id: 'aydin', photo: doctorPhoto('aydin'), name: 'Dr. Emre Aydın', subtitle: 'GP · DE, TR, EN' },
      { id: 'busch', photo: doctorPhoto('busch'), name: 'Dr. Katrin Busch', subtitle: 'GP · DE, EN' },
      { id: 'richter', photo: doctorPhoto('richter'), name: 'Dr. Jonas Richter', subtitle: 'GP · DE, EN, ES' },
    ],
    events: EVENTS,
    blocks: [{ id: 'b1', columnId: 'richter', start: '10:00', end: '11:00', label: 'Home visits' }],
    startHour: 8,
    endHour: 11,
    now: '09:12',
    onEventClick: fn(),
    onSlotClick: fn(),
  },
} satisfies Meta<typeof CalendarGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Thu 09:00: Anna cancelled (thin ghost), Omar took the slot from the waitlist. */
export const Day: Story = {}

export const FullDay: Story = { args: { endHour: 18 } }
