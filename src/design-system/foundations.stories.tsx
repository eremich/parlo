import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColorsPage } from './ColorsPage'
import { ShapePage } from './ShapePage'
import { TypePage } from './TypePage'

const meta = {
  title: 'Foundations',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Colors: Story = { render: () => <ColorsPage /> }
export const Typography: Story = { render: () => <TypePage /> }
export const ShapeAndMotion: Story = { name: 'Shape & motion', render: () => <ShapePage /> }
