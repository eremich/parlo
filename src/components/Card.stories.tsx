import type { Meta, StoryObj } from '@storybook/react-vite'
import { onCanvas } from '../design-system/decorators'
import { Card } from './Card'

const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [onCanvas],
  args: {
    children: (
      <>
        <p className="text-headline">Hausarztpraxis am Görlitzer Park</p>
        <p className="mt-1 text-subheadline text-muted">Wiener Straße 14, 10999 Berlin · Step-free</p>
      </>
    ),
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { padding: 'lg' } }
