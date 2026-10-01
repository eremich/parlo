import type { Meta, StoryObj } from '@storybook/react-vite'
import { onCanvas } from '../design-system/decorators'
import { Card } from './Card'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  decorators: [onCanvas],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

/** Shaped like a doctor result card while results load. */
export const ResultCard: Story = {
  render: () => (
    <Card className="space-y-3">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-chip" />
        <Skeleton className="h-9 w-20 rounded-chip" />
        <Skeleton className="h-9 w-20 rounded-chip" />
      </div>
    </Card>
  ),
}
