import { useLayoutEffect, useState, type RefObject } from 'react'

/** Scale factor that fits a fixed-size frame into its container (never upscales). */
export const useFitScale = (container: RefObject<HTMLElement | null>, width: number, height: number) => {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const node = container.current
    if (!node) return
    const measure = () => {
      const w = node.clientWidth
      const h = node.clientHeight
      // A hidden stage (another role is on screen) measures 0; keep the last good scale
      if (w && h) setScale(Math.min(1, w / width, h / height))
    }
    // Measure now, so the first paint already fits, then follow size changes
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [container, width, height])

  return scale
}
