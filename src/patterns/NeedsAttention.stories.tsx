import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { NeedsAttention } from './NeedsAttention'

const meta = {
  title: 'Patterns/NeedsAttention',
  component: NeedsAttention,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[1120px] bg-canvas p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      {
        id: 'waitlist',
        kind: 'waitlist',
        title: 'Offering Thu 09:00 to the waitlist',
        detail: 'Anna Petrova cancelled · 3 patients match',
        actionLabel: 'View offer',
        onAction: fn(),
      },
      {
        id: 'request',
        kind: 'request',
        title: 'Confirm Lukas Schmidt, Fri 10:20',
        detail: 'New patient · Private · requested 25 min ago',
        actionLabel: 'Review request',
        onAction: fn(),
      },
      {
        id: 'conflict',
        kind: 'conflict',
        title: 'Dr. Busch blocked Mon 14:00–16:00',
        detail: '3 patients affected',
        actionLabel: 'Move patients',
        onAction: fn(),
      },
      {
        id: 'late',
        kind: 'late',
        title: 'Omar Khalil is running 10 min late',
        detail: '09:00 with Dr. Aydın',
        actionLabel: 'Notify Dr. Aydın',
        onAction: fn(),
      },
    ],
  },
} satisfies Meta<typeof NeedsAttention>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Empty: Story = { args: { items: [] } }
export const German: Story = {
  args: {
    title: 'Zu erledigen',
    items: [
      {
        id: 'request',
        kind: 'request',
        title: 'Lukas Schmidt bestätigen, Fr. 10:20',
        detail: 'Neuer Patient · Privat · vor 25 Min. angefragt',
        actionLabel: 'Anfrage prüfen',
      },
      {
        id: 'conflict',
        kind: 'conflict',
        title: 'Dr. Busch hat Mo. 14:00–16:00 blockiert',
        detail: '3 Patienten betroffen',
        actionLabel: 'Patienten verlegen',
      },
    ],
  },
}
