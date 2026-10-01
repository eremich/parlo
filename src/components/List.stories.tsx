import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bell, Download, Languages, ShieldCheck, Trash2 } from 'lucide-react'
import { phoneScreen } from '../design-system/decorators'
import { Avatar } from './Avatar'
import { ListGroup, ListRow } from './List'

const meta = {
  title: 'Components/List',
  component: ListGroup,
  decorators: [phoneScreen],
  args: { children: null },
} satisfies Meta<typeof ListGroup>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

export const Settings: Story = {
  render: () => (
    <div className="space-y-6 pt-16">
      <ListGroup title="You">
        <ListRow icon={ShieldCheck} title="Insurance" value="Public · TK" onClick={noop} />
        <ListRow icon={Languages} title="Languages" value="EN, RU" onClick={noop} />
        <ListRow icon={Bell} title="Notifications" onClick={noop} />
      </ListGroup>
      <ListGroup title="Privacy" footer="Practices only see your data after you book with them.">
        <ListRow icon={Download} title="Download my data" onClick={noop} />
        <ListRow icon={Trash2} title="Delete account" destructive onClick={noop} />
      </ListGroup>
    </div>
  ),
}

export const People: Story = {
  render: () => (
    <div className="pt-16">
      <ListGroup title="Family">
        <ListRow leading={<Avatar name="Anna Petrova" />} title="Anna Petrova" subtitle="You · Public · EN, RU" />
        <ListRow
          leading={<Avatar name="Mia Petrova" />}
          title="Mia Petrova"
          subtitle="Child, 6 · Public · RU, DE"
          onClick={noop}
        />
      </ListGroup>
    </div>
  ),
}
