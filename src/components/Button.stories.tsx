import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarPlus, Clock } from 'lucide-react'
import { fn } from 'storybook/test'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Book 08:40', onClick: fn() },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { size: 'lg' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Add to calendar', icon: CalendarPlus } }
export const Plain: Story = { args: { variant: 'plain', children: 'See all times' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Cancel appointment' } }
export const PlainDestructive: Story = { args: { variant: 'plainDestructive', children: 'Cancel' } }
export const Loading: Story = { args: { size: 'lg', loading: true, children: 'Booking…' } }
export const Disabled: Story = { args: { size: 'lg', disabled: true } }

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="lg" />
      <Button {...args} size="md" />
      <Button {...args} size="sm" />
    </div>
  ),
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>Take earlier slot</Button>
      <Button {...args} variant="secondary" icon={Clock}>
        Running late
      </Button>
      <Button {...args} variant="plain">
        Propose another time
      </Button>
      <Button {...args} variant="destructive">
        Mark as no-show
      </Button>
      <Button {...args} variant="plainDestructive">
        Cancel
      </Button>
    </div>
  ),
}

export const States: Story = {
  parameters: { pseudo: { hover: ['#hover'], active: ['#active'], focusVisible: ['#focus'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>Default</Button>
      <Button {...args} id="hover">
        Hover
      </Button>
      <Button {...args} id="active">
        Pressed
      </Button>
      <Button {...args} id="focus">
        Focus
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
      <Button {...args} loading>
        Loading
      </Button>
    </div>
  ),
}
