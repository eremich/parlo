import { addons } from 'storybook/manager-api'
import { lightTheme } from './theme'

addons.setConfig({
  theme: lightTheme,
  sidebar: { showRoots: true },
})
