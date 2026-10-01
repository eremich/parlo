import type { Meta, StoryObj } from '@storybook/react-vite'
import { BothThemes } from '../design-system/docs-blocks'
import { StatusBadge, type BadgeStatus } from './StatusBadge'

const ALL: BadgeStatus[] = [
  'confirmed',
  'pending',
  'checkedIn',
  'inProgress',
  'done',
  'noShow',
  'cancelled',
  'declined',
  'filledFromWaitlist',
  'waitlist',
  'runningLate',
  'video',
]

const meta = {
  title: 'Patterns/StatusBadge',
  component: StatusBadge,
  args: { status: 'confirmed' },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithDetail: Story = { args: { status: 'runningLate', label: 'Running late · 10 min' } }

/** Every status, icon and text. Tone: ok = on track, warn = needs a look, error = lost, info = system help. */
export const AllStatuses: Story = {
  render: () => (
    <BothThemes>
      <div className="flex max-w-[420px] flex-wrap gap-2">
        {ALL.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </div>
      <div className="flex max-w-[420px] flex-wrap gap-1.5">
        {ALL.map((status) => (
          <StatusBadge key={status} status={status} size="sm" />
        ))}
      </div>
    </BothThemes>
  ),
}
