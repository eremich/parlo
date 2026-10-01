import tokensCss from '../styles/tokens.css?raw'
import indexCss from '../styles/index.css?raw'

/**
 * Reads the real token files, so Storybook cannot drift from the code:
 * change a value in src/styles/tokens.css and these pages update.
 */
export type Token = { name: string; value: string; group: string }

/** Tokens of one CSS block, grouped by the `/* Group *\/` comment above them. */
function parseBlock(body: string): Token[] {
  const tokens: Token[] = []
  let group = ''
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    const comment = line.match(/^\/\*\s*([^:*]+?)(?::.*)?\s*\*\/$/)
    if (comment) group = comment[1]
    const token = line.match(/^(--[\w-]+):\s*(.+?);/)
    if (token) tokens.push({ name: token[1], value: token[2], group })
  }
  return tokens
}

const blocks = [...tokensCss.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => ({
  selector: selector.trim(),
  tokens: parseBlock(body),
}))

export const lightTokens = blocks.find((b) => b.selector.includes("data-theme='light'"))?.tokens ?? []
export const darkTokens = blocks.find((b) => b.selector.includes('dark'))?.tokens ?? []

const darkByName = new Map(darkTokens.map((t) => [t.name, t.value]))
export const darkValue = (name: string) => darkByName.get(name)

const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value)

/** Color tokens of the product UI (the presentation stage is listed separately). */
export const colorTokens = lightTokens.filter((t) => isHex(t.value))

/** Tokens from the second @theme block in index.css: fonts and type scales. */
const themeBlocks = [...indexCss.matchAll(/@theme\s*\{([^}]*)\}/g)].map((m) => parseBlock(m[1]))
const typeTokens = themeBlocks.flat()

export type TypeStep = { name: string; size: string; lineHeight: string; weight?: string; group: string }

export const typeScale: TypeStep[] = typeTokens
  .filter((t) => /^--text-[\w-]+$/.test(t.name) && !t.name.includes('--', 2))
  .filter((t) => !/--(line-height|font-weight)$/.test(t.name))
  .map((t) => {
    const lookup = (suffix: string) => typeTokens.find((x) => x.name === `${t.name}--${suffix}`)?.value
    return {
      name: t.name.replace('--text-', ''),
      size: t.value,
      lineHeight: lookup('line-height') ?? '',
      weight: lookup('font-weight'),
      group: t.group,
    }
  })

export const fontTokens = typeTokens.filter((t) => t.name.startsWith('--font-'))

export const byGroup = <T extends { group: string }>(items: T[]): [string, T[]][] => {
  const map = new Map<string, T[]>()
  for (const item of items) map.set(item.group, [...(map.get(item.group) ?? []), item])
  return [...map.entries()]
}

/* WCAG 2.1 relative luminance and contrast ratio */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const valueOf = (name: string, theme: 'light' | 'dark') =>
  theme === 'light' ? lightTokens.find((t) => t.name === name)?.value : darkValue(name)
