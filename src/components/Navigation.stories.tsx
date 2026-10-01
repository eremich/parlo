import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarDays, Search, SlidersHorizontal, UserRound, UsersRound } from 'lucide-react'
import { phoneScreen } from '../design-system/decorators'
import { LargeTitle } from './LargeTitle'
import { NavBar } from './NavBar'
import { TabBar } from './TabBar'

const meta = {
  title: 'Components/Navigation',
  component: TabBar,
  decorators: [phoneScreen],
  args: {
    items: [
      { to: '/', label: 'Search', icon: Search },
      { to: '/appointments', label: 'Appointments', icon: CalendarDays },
      { to: '/family', label: 'Family', icon: UsersRound },
      { to: '/profile', label: 'Profile', icon: UserRound },
    ],
  },
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

/** Top-level screen: large title and the floating tab bar (labels are always visible). */
export const TabScreen: Story = {
  render: (args) => (
    <>
      <LargeTitle subtitle="What do you need?">Find a doctor</LargeTitle>
      <TabBar {...args} />
    </>
  ),
}

/** Pushed screen: the back button carries the previous title. */
export const PushedScreen: Story = {
  render: () => (
    <NavBar
      title="Dr. Emre Aydın"
      backLabel="Back"
      onBack={() => {}}
      trailing={
        <button type="button" aria-label="Filters" className="flex size-11 items-center justify-center text-brand">
          <SlidersHorizontal aria-hidden size={22} />
        </button>
      }
    />
  ),
}
