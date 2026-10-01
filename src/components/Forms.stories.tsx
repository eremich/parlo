import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { onCanvas } from '../design-system/decorators'
import { StarRating } from './StarRating'
import { TextArea } from './TextArea'

const meta = {
  title: 'Components/StarRating',
  component: StarRating,
  decorators: [onCanvas],
  args: { label: 'Doctor', value: 4, onChange: () => {}, starLabel: (n: number) => `${n} of 5` },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <StarRating {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof StarRating>

export default meta
type Story = StoryObj<typeof meta>

/** Doctor and practice are rated separately. Arrow keys change the value. */
export const Default: Story = {}
export const Unrated: Story = { args: { value: 0 } }

/** Companion multi-line field, used for the optional reason for a visit and review comments. */
export const TextAreaField: Story = {
  render: () => (
    <TextArea
      label="Reason for visit (optional)"
      placeholder="For example: results of my blood test"
      hint="Only the practice sees this."
    />
  ),
}
