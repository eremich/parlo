import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { onCanvas } from '../design-system/decorators'
import { Switch } from './Switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  decorators: [onCanvas],
  args: { label: 'Accepts new patients', checked: true, onChange: () => {} },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked)
    return <Switch {...args} checked={checked} onChange={setChecked} />
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const On: Story = {}
export const Off: Story = { args: { checked: false, label: 'Step-free access' } }
export const WithDescription: Story = {
  args: { label: 'Reminder the day before', description: 'Push notification at 18:00' },
}
export const Disabled: Story = { args: { disabled: true } }
