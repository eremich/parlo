import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { EarliestSlot } from './EarliestSlot'
import { SlotChip } from './SlotChip'

const meta = {
  title: 'Patterns/EarliestSlot',
  component: EarliestSlot,
  args: { day: 'Tomorrow', time: '08:40' },
} satisfies Meta<typeof EarliestSlot>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithLabel: Story = { args: { label: 'Earliest', day: 'Thu, 12 Mar', time: '09:00' } }
export const Medium: Story = { args: { size: 'md', day: 'Today', time: '16:20' } }
export const German: Story = { args: { day: 'Morgen', time: '08:40', label: 'Nächster Termin' } }

/** The times next to it: tap to start booking with that time. */
export const Slots: Story = {
  render: () => {
    const [picked, setPicked] = useState<string>()
    return (
      <div className="flex gap-2">
        {['08:40', '09:20', '10:00'].map((time) => (
          <SlotChip key={time} time={time} label={`Book ${time}`} selected={picked === time} onSelect={() => setPicked(time)} />
        ))}
        <SlotChip time="10:40" taken label="10:40, taken" />
      </div>
    )
  },
}
