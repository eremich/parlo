import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { onCanvas, phoneScreen } from '../design-system/decorators'
import { OfferCard } from './OfferCard'
import { PushNotification } from './PushNotification'

const meta = {
  title: 'Patterns/Waitlist offer',
  component: OfferCard,
  decorators: [onCanvas],
  args: {
    title: 'Earlier slot: Tomorrow 09:00 with Dr. Emre Aydın',
    question: 'Take it?',
    remaining: '24:12 left',
    progress: 0.8,
    note: 'Your Mon 16 Mar 10:20 appointment will be released.',
    takeLabel: 'Take Tomorrow 09:00',
    keepLabel: 'Keep Mon 16 Mar 10:20',
    onTake: fn(),
    onKeep: fn(),
  },
} satisfies Meta<typeof OfferCard>

export default meta
type Story = StoryObj<typeof meta>

/** A freed slot, offered for 30 minutes. The bar shows how much of the window is left. */
export const Open: Story = {}

export const AlmostExpired: Story = { args: { remaining: '01:40 left', progress: 0.06 } }

export const Expired: Story = {
  args: {
    expired: {
      title: 'This offer expired',
      body: 'You are still on the waitlist. We will offer the next earlier slot.',
    },
  },
}

/** The same offer arriving as a push notification on the patient's phone. */
export const Push: Story = {
  decorators: [phoneScreen],
  render: () => (
    <PushNotification
      app="Parlo"
      time="now"
      title="Earlier slot available"
      body="Dr. Emre Aydın · Tomorrow 09:00. Take it within 30 minutes."
      onOpen={fn()}
      onDismiss={fn()}
      autoHideMs={600000}
    />
  ),
}
