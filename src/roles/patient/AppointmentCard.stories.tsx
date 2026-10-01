import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { fn } from 'storybook/test'
import { SEED_APPOINTMENTS } from '../../data/seed'
import { AppointmentCard, ReminderPrompt } from './AppointmentsScreen'

const appointment = { ...SEED_APPOINTMENTS[0], confirmedByPatient: false }

const meta = {
  title: 'Patterns/AppointmentCard',
  component: AppointmentCard,
  args: { appointment, onOpen: fn() },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[358px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof AppointmentCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The day before: the "Are you coming?" check lives inside the card, cancel stays quiet. */
export const DayBefore: Story = { args: { footer: <ReminderPrompt appointment={appointment} /> } }

export const DayBeforeConfirmed: Story = {
  args: { footer: <ReminderPrompt appointment={{ ...appointment, confirmedByPatient: true }} /> },
}
