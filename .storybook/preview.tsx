import type { Preview } from '@storybook/react-vite'
import '../src/styles/index.css'
import './docs.css'
import { lightTheme } from './theme'

const preview: Preview = {
  // Every component gets a generated Docs page: description, live examples with source, props table.
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  // JSX children make an unreadable control; stories show them on the canvas instead
  argTypes: { children: { control: false } },
  decorators: [
    // Docs pages stay light (their chrome is light); single stories follow the toolbar.
    // Docs examples can still show dark by wrapping in <div data-theme="dark">.
    (Story, { globals, viewMode }) => {
      document.documentElement.dataset.theme = viewMode === 'docs' ? 'light' : globals.theme
      return <Story />
    },
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disabled: true },
    controls: { sort: 'requiredFirst' },
    docs: {
      theme: lightTheme,
      toc: { headingSelector: 'h2, h3', title: 'On this page' },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Guidelines', 'Brand', 'Foundations', 'Components', 'Patterns'],
        method: 'alphabetical',
      },
    },
    a11y: { test: 'todo' },
  },
}

export default preview
