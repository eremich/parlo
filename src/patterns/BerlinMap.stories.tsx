import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { BerlinMap } from './BerlinMap'

const meta = {
  title: 'Patterns/BerlinMap',
  component: BerlinMap,
  decorators: [
    (Story) => (
      <div className="h-[360px] w-[390px] overflow-hidden rounded-card">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Map of practices',
    you: { x: 57, y: 66, label: 'You are here' },
    pins: [
      { id: 'goerlitzer', x: 58, y: 56, label: 'Tomorrow 08:20', count: 3, title: 'Hausarztpraxis am Görlitzer Park' },
      { id: 'hno', x: 46, y: 24, label: 'Tue 10:00', title: 'HNO Praxis Mitte' },
      { id: 'kinder', x: 66, y: 74, label: 'Today 11:40', title: 'Kinderarztpraxis Neukölln' },
    ],
  },
  render: (args) => {
    const [selected, setSelected] = useState('goerlitzer')
    return <BerlinMap {...args} selectedId={selected} onSelect={setSelected} />
  },
} satisfies Meta<typeof BerlinMap>

export default meta
type Story = StoryObj<typeof meta>

/** Drawn, static map: no provider, no tiles. One pin per practice, labelled with its earliest time. */
export const Results: Story = {}
