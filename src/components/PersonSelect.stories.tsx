import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PersonSelect } from './PersonSelect'

const FAMILY = [
  { id: 'anna', name: 'Anna Petrova', detail: 'You' },
  { id: 'mia', name: 'Mia Petrova', detail: 'Child · 6 years' },
  { id: 'leo', name: 'Leo Petrova', detail: 'Child · 9 years' },
  { id: 'vera', name: 'Vera Petrova', detail: 'Parent · 64 years' },
  { id: 'nikolai', name: 'Nikolai Petrov', detail: 'Parent · 67 years' },
]

const meta = {
  title: 'Components/PersonSelect',
  component: PersonSelect,
  args: { label: 'For', value: 'anna', options: FAMILY.slice(0, 2), onChange: () => {} },
  decorators: [
    (Story) => (
      <div className="h-[420px] w-[358px]">
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <PersonSelect {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof PersonSelect>

export default meta
type Story = StoryObj<typeof meta>

export const TwoPeople: Story = {}
export const WholeFamily: Story = { args: { options: FAMILY, value: 'leo' } }
