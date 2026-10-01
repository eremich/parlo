import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Segmented } from './Segmented'

const meta = {
  title: 'Components/Segmented',
  component: Segmented,
  args: {
    label: 'View',
    value: 'list',
    options: [
      { value: 'list', label: 'List' },
      { value: 'map', label: 'Map' },
    ],
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <Segmented {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof Segmented<string>>

export default meta
type Story = StoryObj<typeof meta>

export const ListOrMap: Story = {}
export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div className="w-[358px]">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Appointments',
    value: 'upcoming',
    fullWidth: true,
    options: [
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'past', label: 'Past' },
    ],
  },
}
