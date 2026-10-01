import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapPin, Search } from 'lucide-react'
import { onCanvas } from '../design-system/decorators'
import { TextField } from './TextField'

const meta = {
  title: 'Components/TextField',
  component: TextField,
  decorators: [onCanvas],
  args: { label: 'Email', placeholder: 'name@example.com', type: 'email' },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithHint: Story = {
  args: { label: 'Date of birth', placeholder: 'DD.MM.YYYY', type: 'text', hint: 'The practice needs it to find your file.' },
}
export const WithError: Story = {
  args: { label: 'Code', type: 'text', defaultValue: '12 34', error: 'Enter the 6-digit code from the SMS.' },
}
export const SearchField: Story = {
  args: { label: 'Search', hideLabel: true, icon: Search, placeholder: 'Specialty, symptom or doctor', type: 'search' },
}
export const Location: Story = { args: { label: 'Where', type: 'text', icon: MapPin, defaultValue: 'Kreuzberg, Berlin' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'anna.petrova@example.com' } }
