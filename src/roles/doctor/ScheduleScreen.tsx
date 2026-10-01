import { CalendarOff, Lock, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { LargeTitle } from '../../components/LargeTitle'
import { ListGroup, ListRow } from '../../components/List'
import { Screen } from '../../components/Screen'
import { Segmented } from '../../components/Segmented'
import { Sheet } from '../../components/Sheet'
import { Switch } from '../../components/Switch'
import { HOURS, SLOT_MINUTES, workingTimes } from '../../data/schedule'
import type { Block } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { addDays, fromMinutes, toMinutes } from '../../lib/format'
import { useApp } from '../../store/app'
import { affectedBy } from '../staff/practice'
import { DOCTOR_ID } from './doctor'

/** Working hours and time off. Blocking time that has patients creates a conflict for reception. */
export const ScheduleScreen = () => {
  const t = useT()
  const ts = t.doctor.schedule
  const f = useFormat()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const allBlocks = useApp((s) => s.blocks)
  const blocks = allBlocks.filter((b) => b.doctorId === DOCTOR_ID && b.date >= clock.date)
  const removeBlock = useApp((s) => s.removeBlock)
  const [tab, setTab] = useState<'hours' | 'off'>('off')
  const [sheet, setSheet] = useState(false)

  return (
    <Screen tabBar>
      <LargeTitle>{ts.title}</LargeTitle>
      <div className="px-4 pt-2 pb-5">
        <Segmented
          label={ts.title}
          fullWidth
          value={tab}
          onChange={setTab}
          options={[
            { value: 'off', label: ts.timeOff },
            { value: 'hours', label: ts.hours },
          ]}
        />
      </div>

      {tab === 'hours' ? (
        <ListGroup title={ts.hours}>
          {[1, 2, 3, 4, 5].map((day, i) => (
            <ListRow
              key={day}
              title={ts.weekdays[i]}
              value={
                HOURS[day]?.map(([a, b]) => `${fromMinutes(a)}–${fromMinutes(b)}`).join(', ') ?? ts.closed
              }
            />
          ))}
        </ListGroup>
      ) : (
        <div className="space-y-4 px-4">
          <Button size="lg" fullWidth icon={Plus} onClick={() => setSheet(true)}>
            {ts.block}
          </Button>
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center px-4 pt-6 text-center">
              <CalendarOff aria-hidden size={28} className="text-muted" />
              <p className="mt-3 text-headline text-ink">{ts.noBlocks}</p>
              <p className="mt-1 text-subheadline text-pretty text-muted">{ts.noBlocksLead}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {blocks
                .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
                .map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    affected={affectedBy(block, appointments).length}
                    when={`${f.day(block.date)}, ${block.start}–${block.end}`}
                    onRemove={() => removeBlock(block.id)}
                  />
                ))}
            </ul>
          )}
        </div>
      )}

      <BlockSheet open={sheet} onClose={() => setSheet(false)} today={clock.date} />
    </Screen>
  )
}

type BlockCardProps = { block: Block; affected: number; when: string; onRemove: () => void }

const BlockCard = ({ block, affected, when, onRemove }: BlockCardProps) => {
  const t = useT()
  const ts = t.doctor.schedule
  return (
    <li className="rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-canvas text-muted">
            <Lock aria-hidden size={18} />
          </span>
          <div>
            <p className="text-headline text-ink">{block.label}</p>
            <p className="text-subheadline text-muted tabular-nums">{when}</p>
          </div>
        </div>
        <Button variant="plain" onClick={onRemove}>
          {ts.remove}
        </Button>
      </div>
      <div className="mt-3">
        {block.resolved ? (
          <Banner tone="ok" title={ts.resolved} />
        ) : affected > 0 ? (
          <Banner tone="error" title={ts.affected(affected)}>
            {ts.reception}
          </Banner>
        ) : (
          <p className="text-footnote text-muted">{ts.none}</p>
        )}
      </div>
    </li>
  )
}

const BlockSheet = ({ open, onClose, today }: { open: boolean; onClose: () => void; today: string }) => {
  const t = useT()
  const ts = t.doctor.schedule
  const f = useFormat()
  const appointments = useApp((s) => s.appointments)
  const addBlock = useApp((s) => s.addBlock)

  // The next ten working days from tomorrow
  const days = useMemo(() => {
    const out: string[] = []
    for (let i = 1; out.length < 10 && i < 30; i++) {
      const d = addDays(today, i)
      if (workingTimes(d).length) out.push(d)
    }
    return out
  }, [today])

  const [date, setDate] = useState(days[0])
  const [wholeDay, setWholeDay] = useState(false)
  const times = workingTimes(date)
  const ends = times.map((tm) => fromMinutes(toMinutes(tm) + SLOT_MINUTES))
  const [start, setStart] = useState(times[0])
  const [end, setEnd] = useState(ends[5] ?? ends[ends.length - 1])
  const [reason, setReason] = useState(ts.reasons[0])

  const from = wholeDay ? times[0] : start
  const to = wholeDay ? ends[ends.length - 1] : end
  const valid = from && to && toMinutes(to) > toMinutes(from)
  const affected = valid
    ? affectedBy({ id: 'draft', doctorId: DOCTOR_ID, date, start: from, end: to, label: reason }, appointments).length
    : 0

  const select =
    'min-h-11 w-full rounded-control border border-line bg-surface px-3 text-body text-ink outline-none focus:border-brand'

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={ts.sheet}
      closeLabel={t.common.close}
      footer={
        <Button
          size="lg"
          fullWidth
          disabled={!valid}
          onClick={() => {
            addBlock({ doctorId: DOCTOR_ID, date, start: from, end: to, label: reason })
            onClose()
          }}
        >
          {ts.confirm(`${f.day(date)} ${from}–${to}`)}
        </Button>
      }
    >
      <div className="space-y-5">
        <label className="block">
          <span className="block pb-1.5 text-footnote font-semibold text-ink">{ts.date}</span>
          <select
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              const next = workingTimes(e.target.value)
              setStart(next[0])
              setEnd(fromMinutes(toMinutes(next[Math.min(5, next.length - 1)]) + SLOT_MINUTES))
            }}
            className={select}
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {f.day(d)}
              </option>
            ))}
          </select>
        </label>

        <Switch label={ts.wholeDay} checked={wholeDay} onChange={setWholeDay} />

        {!wholeDay && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block pb-1.5 text-footnote font-semibold text-ink">{ts.from}</span>
              <select value={start} onChange={(e) => setStart(e.target.value)} className={`${select} tabular-nums`}>
                {times.map((tm) => (
                  <option key={tm}>{tm}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block pb-1.5 text-footnote font-semibold text-ink">{ts.to}</span>
              <select value={end} onChange={(e) => setEnd(e.target.value)} className={`${select} tabular-nums`}>
                {ends.map((tm) => (
                  <option key={tm}>{tm}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div>
          <p className="pb-1.5 text-footnote font-semibold text-ink">{ts.reason}</p>
          <div className="flex flex-wrap gap-2">
            {ts.reasons.map((r) => (
              <Chip key={r} selected={reason === r} onPressedChange={() => setReason(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </div>

        {valid && <Banner tone={affected ? 'warn' : 'ok'} title={ts.preview(affected)} />}
      </div>
    </Sheet>
  )
}
