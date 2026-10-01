import type { Meta, StoryObj } from '@storybook/react-vite'
import { doctorById } from '../data/doctors'
import { LANGUAGE_NAMES } from '../data/languages'
import { onCanvas } from '../design-system/decorators'
import { LanguageChips, LanguageList } from './LanguageChips'

const aydin = doctorById('aydin')
const marchenko = doctorById('marchenko')

const meta = {
  title: 'Patterns/LanguageChips',
  component: LanguageChips,
  args: { languages: aydin.languages, names: LANGUAGE_NAMES.en },
} satisfies Meta<typeof LanguageChips>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Anna speaks English and Russian: matching languages come first and are highlighted. */
export const Matched: Story = { args: { languages: marchenko.languages, matched: ['EN', 'RU'] } }

export const Small: Story = { args: { size: 'sm', matched: ['EN'] } }

export const German: Story = {
  args: { names: LANGUAGE_NAMES.de, prefix: 'Spricht', matched: ['TR'] },
}

export const DetailedList: Story = {
  decorators: [onCanvas],
  render: () => (
    <div className="rounded-card bg-surface px-4">
      <LanguageList
        languages={marchenko.languages}
        names={LANGUAGE_NAMES.en}
        levels={{ native: 'Native', fluent: 'Fluent' }}
      />
    </div>
  ),
}

/** Patient view of a doctor profile: just the languages, no levels. */
export const ProfileList: Story = {
  decorators: [onCanvas],
  render: () => (
    <div className="rounded-card bg-surface px-4">
      <LanguageList languages={marchenko.languages} names={LANGUAGE_NAMES.en} />
    </div>
  ),
}
