import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { onCanvas } from '../design-system/decorators'
import { SlotPicker } from './SlotPicker'

const DAYS = [
  { date: '2026-03-11', weekday: 'Wed', dayOfMonth: '11', times: [] },
  { date: '2026-03-12', weekday: 'Thu', dayOfMonth: '12', times: ['10:00', '10:20', '10:40', '11:40', '17:40'] },
  { date: '2026-03-13', weekday: 'Fri', dayOfMonth: '13', times: ['08:20', '12:40'] },
  { date: '2026-03-14', weekday: 'Sat', dayOfMonth: '14', times: [] },
  { date: '2026-03-15', weekday: 'Sun', dayOfMonth: '15', times: [] },
  { date: '2026-03-16', weekday: 'Mon', dayOfMonth: '16', times: ['08:00', '09:40', '14:20', '15:00', '16:40'] },
  { date: '2026-03-17', weekday: 'Tue', dayOfMonth: '17', times: ['11:00', '14:00'] },
]

const meta = {
  title: 'Patterns/SlotPicker',
  component: SlotPicker,
  decorators: [onCanvas],
  args: {
    days: DAYS,
    selectedDate: '2026-03-12',
    selectedTime: '10:00',
    onSelectDate: () => {},
    onSelectTime: () => {},
    emptyLabel: 'No free times this day',
    bookLabel: (time: string) => `Book ${time}`,
    daysLabel: 'Pick a time',
  },
  render: (args) => {
    const [date, setDate] = useState(args.selectedDate)
    const [time, setTime] = useState(args.selectedTime)
    return (
      <SlotPicker
        {...args}
        selectedDate={date}
        selectedTime={time}
        onSelectDate={(d) => {
          setDate(d)
          setTime(undefined)
        }}
        onSelectTime={setTime}
      />
    )
  },
} satisfies Meta<typeof SlotPicker>

export default meta
type Story = StoryObj<typeof meta>

/** Weekends and fully booked days stay visible but disabled; a dot marks days with free times. */
export const Default: Story = {}
export const EmptyDay: Story = { args: { selectedDate: '2026-03-11', selectedTime: undefined } }
