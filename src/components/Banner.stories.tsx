import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileText, WifiOff } from 'lucide-react'
import { onCanvas } from '../design-system/decorators'
import { Banner } from './Banner'
import { Button } from './Button'

const meta = {
  title: 'Components/Banner',
  component: Banner,
  decorators: [onCanvas],
  args: {
    tone: 'info',
    icon: FileText,
    title: 'Bring a referral from your GP',
    children: 'Dermatology usually expects an Überweisung.',
  },
  argTypes: { icon: { control: false }, action: { control: false } },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {}
export const Ok: Story = {
  args: { tone: 'ok', icon: undefined, title: 'Booked', children: 'Thu, 12 Mar · 09:00 with Dr. Aydın' },
}
export const Warn: Story = {
  args: { tone: 'warn', icon: undefined, title: 'Request sent', children: 'Practices usually answer within 2 hours.' },
}
export const Error: Story = {
  args: {
    tone: 'error',
    icon: undefined,
    title: 'Someone just booked this slot',
    children: 'The next free time is 09:20.',
    action: <Button size="sm">Book 09:20</Button>,
  },
}
export const Offline: Story = {
  args: {
    tone: 'warn',
    icon: WifiOff,
    title: 'You are offline',
    children: 'Showing appointments saved on this phone.',
    onDismiss: () => {},
  },
}
