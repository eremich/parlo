import type { Meta, StoryObj } from '@storybook/react-vite'
import { BothThemes } from '../design-system/docs-blocks'
import { AppIcon, Logo, LogoMark } from './Logo'

const meta = {
  title: 'Brand/Logo',
  component: LogoMark,
  args: { size: 96 },
} satisfies Meta<typeof LogoMark>

export default meta
type Story = StoryObj<typeof meta>

/** A lowercase "p" whose counter is a speech bubble: the doctor speaks your language. The coral dot is the word. */
export const Mark: Story = {}

/** Mark and lowercase wordmark in Instrument Sans. */
export const Lockup: Story = { render: () => <Logo size={48} /> }

/** Color mark on soft mint, for the home screen and push notifications. Same in light and dark. */
export const Icon: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <AppIcon size={120} />
      <AppIcon size={60} />
      <AppIcon size={36} />
    </div>
  ),
}

/** Colors come from tokens, so the mark follows light and dark themes. */
export const Themes: Story = {
  render: () => (
    <BothThemes>
      <Logo size={40} />
      <AppIcon size={56} />
    </BothThemes>
  ),
}

/** Smallest sizes: the counter and dot stay readable down to 16 px (favicon). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {[16, 24, 32, 48, 64].map((size) => (
        <LogoMark key={size} size={size} />
      ))}
    </div>
  ),
}
