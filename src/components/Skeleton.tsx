import { cx } from '../lib/cx'

/** Loading placeholder shaped like the content it replaces. */
export const Skeleton = ({ className }: { className?: string }) => (
  <span aria-hidden className={cx('block animate-pulse rounded-[6px] bg-line/70 motion-reduce:animate-none', className)} />
)
