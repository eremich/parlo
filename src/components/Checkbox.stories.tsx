import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { onCanvas } from '../design-system/decorators'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  decorators: [onCanvas],
  args: {
    label: 'Share my booking details with Hausarztpraxis am Görlitzer Park',
    description: 'Name, date of birth, insurance and reason for visit. You can withdraw this in Profile › Privacy.',
    checked: false,
    onChange: () => {},
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked)
    return <Checkbox {...args} checked={checked} onChange={setChecked} />
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Consent: Story = {}
export const Checked: Story = { args: { checked: true } }
export const Disabled: Story = { args: { disabled: true } }
