import { create } from 'storybook/theming/create'

// Storybook themes need plain hex values; these mirror the light tokens in src/styles/tokens.css.
export const lightTheme = create({
  base: 'light',
  brandTitle: 'Parlo · Design system',
  brandUrl: '/',
  brandTarget: '_self',

  colorPrimary: '#0f6b5c',
  colorSecondary: '#0f6b5c',

  appBg: '#f4f6f4',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#dce3df',
  appBorderRadius: 14,

  textColor: '#16211f',
  textMutedColor: '#56645f',
  barTextColor: '#56645f',
  barSelectedColor: '#0f6b5c',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: '#dce3df',
  inputTextColor: '#16211f',
  inputBorderRadius: 10,

  fontBase: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontCode: 'ui-monospace, Consolas, monospace',
})
