import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accessibility, Video } from 'lucide-react'
import { useState } from 'react'
import { Chip } from './Chip'

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: { children: 'GP' },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { selected: true, children: 'Public insurance' } }
export const WithIcon: Story = { args: { icon: Accessibility, children: 'Step-free' } }

/** On the branded header of the patient home: translucent white on brand green. */
export const OnHero: Story = {
  render: () => (
    <div className="hero-surface flex gap-2 p-4">
      {['GP', 'Dentist', 'Gynecologist'].map((s) => (
        <Chip key={s} tone="onHero">
          {s}
        </Chip>
      ))}
    </div>
  ),
}

const SPECIALTIES = ['GP', 'Dentist', 'Gynecologist', 'Dermatologist', 'Pediatrician', 'ENT']

/** Quick picks on the search screen scroll horizontally. */
export const QuickPicks: Story = {
  render: () => {
    const [picked, setPicked] = useState('GP')
    return (
      <div className="flex w-[358px] gap-2 overflow-x-auto pb-1">
        {SPECIALTIES.map((s) => (
          <Chip key={s} selected={picked === s} onPressedChange={() => setPicked(s)}>
            {s}
          </Chip>
        ))}
      </div>
    )
  },
}

export const Filters: Story = {
  render: () => {
    const [on, setOn] = useState<Record<string, boolean>>({ today: true })
    const toggle = (key: string) => (value: boolean) => setOn({ ...on, [key]: value })
    return (
      <div className="flex max-w-[358px] flex-wrap gap-2">
        <Chip selected={on.today} onPressedChange={toggle('today')}>
          Today
        </Chip>
        <Chip selected={on.week} onPressedChange={toggle('week')}>
          This week
        </Chip>
        <Chip icon={Video} selected={on.video} onPressedChange={toggle('video')}>
          Video
        </Chip>
        <Chip icon={Accessibility} selected={on.step} onPressedChange={toggle('step')}>
          Step-free
        </Chip>
      </div>
    )
  },
}
