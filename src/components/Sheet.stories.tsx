import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { phoneScreen } from '../design-system/decorators'
import { Button } from './Button'
import { Chip } from './Chip'
import { Sheet } from './Sheet'
import { Switch } from './Switch'

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  decorators: [phoneScreen],
  args: { open: true, title: 'Filters', onClose: () => {}, children: null },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return (
      <>
        <div className="p-4 pt-20">
          <Button onClick={() => setOpen(true)}>Open sheet</Button>
        </div>
        <Sheet {...args} open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Large: Story = {
  args: {
    footer: (
      <Button size="lg" fullWidth>
        Show 12 doctors
      </Button>
    ),
    children: (
      <div className="space-y-5">
        <div>
          <p className="pb-2 text-footnote text-muted uppercase">Insurance</p>
          <div className="flex gap-2">
            <Chip selected>Public</Chip>
            <Chip>Private</Chip>
          </div>
        </div>
        <Switch label="Accepts new patients" checked onChange={() => {}} />
        <Switch label="Step-free access" checked={false} onChange={() => {}} />
      </div>
    ),
  },
}

export const Medium: Story = {
  args: {
    detent: 'medium',
    title: 'Running late?',
    children: (
      <div className="space-y-2">
        <p className="pb-2 text-subheadline text-muted">We tell the practice so they can plan.</p>
        <Button size="lg" variant="secondary" fullWidth>
          About 10 min
        </Button>
        <Button size="lg" variant="secondary" fullWidth>
          About 20 min
        </Button>
      </div>
    ),
  },
}
