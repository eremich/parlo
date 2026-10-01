import type { Decorator } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'

/** Renders a story inside a 390 × 844 phone screen, for sheets, bars and full-width lists. */
export const phoneScreen: Decorator = (Story) => (
  <MemoryRouter>
    <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[40px] bg-canvas text-ink ring-1 ring-line">
      <Story />
    </div>
  </MemoryRouter>
)

/** Pads a story on the canvas color so surfaces read as they do in the app. */
export const onCanvas: Decorator = (Story) => (
  <div className="w-[358px] rounded-card bg-canvas p-4 text-ink">
    <Story />
  </div>
)
