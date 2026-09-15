import { useEffect, useState } from 'react'
import { getGuide } from '../lib/epg'
import type { EpgGuideChannel, EpgProgramme } from '../lib/types'

const HOUR_WIDTH = 160
const CHANNEL_COL_WIDTH = 140

function parseUtc(mysqlDatetime: string): Date {
  return new Date(mysqlDatetime.replace(' ', 'T') + 'Z')
}

function formatTime(mysqlDatetime: string): string {
  return parseUtc(mysqlDatetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function isNow(p: EpgProgramme): boolean {
  const now = Date.now()
  return parseUtc(p.start_time).getTime() <= now && parseUtc(p.end_time).getTime() > now
}

export default function TvGuide() {
  const [date, setDate] = useState(todayIso())
  const [channels, setChannels] = useState<EpgGuideChannel[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  useEffect(() => {
    getGuide(date)
      .then((res) => {
        setChannels(res.channels)
        setSelectedChannelId((current) => current ?? res.channels[0]?.id ?? null)
      })
      .catch(() => setLoadError('Could not load the TV guide.'))
  }, [date])

  const dayStart = new Date(`${date}T00:00:00Z`)
  const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null

  function offsetMinutes(iso: string): number {
    const diffMs = parseUtc(iso).getTime() - dayStart.getTime()
    return Math.min(1440, Math.max(0, diffMs / 60000))
  }

  return (
    <div className="page-gutter py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-text">TV Guide</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate((d) => shiftDate(d, -1))}
            aria-label="Previous day"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-border text-text hover:border-primary"
          >
            ‹
          </button>
          <span className="min-w-24 text-center text-sm text-muted">
            {dayStart.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setDate((d) => shiftDate(d, 1))}
            aria-label="Next day"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-md border border-border text-text hover:border-primary"
          >
            ›
          </button>
        </div>
      </div>

      {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}

      {!loadError && channels.length === 0 && (
        <p className="text-sm text-muted">
          No programme guide data is available for this date yet. Live channels can still be watched directly from
          Live TV — schedule information just isn't available for them right now.
        </p>
      )}

      {channels.length > 0 && (
        <>
          {/* Mobile — spec section 11: channel selector + vertical programme list, no forced desktop timeline. */}
          <div className="md:hidden">
            <select
              value={selectedChannelId ?? ''}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="min-h-11 w-full rounded-md border border-border bg-card px-3 text-text"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <ul className="mt-4 flex flex-col divide-y divide-border">
              {selectedChannel?.programmes.map((p) => (
                <li key={p.start_time} className="flex items-start gap-3 py-3">
                  <span className="w-16 flex-none text-xs text-muted">{formatTime(p.start_time)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{p.title}</p>
                    {isNow(p) && (
                      <span className="mt-1 inline-block rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        NOW
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {selectedChannel?.programmes.length === 0 && (
                <li className="py-3 text-sm text-muted">No programmes for this date.</li>
              )}
            </ul>
          </div>

          {/* Desktop/tablet — channel × time timeline grid, per PRD section 12. */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <div style={{ width: CHANNEL_COL_WIDTH + HOUR_WIDTH * 24 }}>
              <div className="flex border-b border-border bg-surface">
                <div
                  className="sticky left-0 z-20 flex-none border-r border-border bg-surface"
                  style={{ width: CHANNEL_COL_WIDTH }}
                />
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="flex-none border-l border-border py-1.5 text-xs text-muted"
                    style={{ width: HOUR_WIDTH, paddingLeft: 8 }}
                  >
                    {h.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {channels.map((channel) => (
                <div key={channel.id} className="flex border-b border-border last:border-b-0">
                  <div
                    className="sticky left-0 z-10 flex flex-none items-center gap-2 truncate border-r border-border bg-bg px-3 py-2 text-sm text-text"
                    style={{ width: CHANNEL_COL_WIDTH }}
                  >
                    {channel.logo_url ? (
                      <img src={channel.logo_url} alt="" className="h-6 w-6 flex-none object-contain" />
                    ) : (
                      <div className="h-6 w-6 flex-none rounded bg-surface" />
                    )}
                    <span className="truncate">{channel.name}</span>
                  </div>
                  <div className="relative h-14 flex-none" style={{ width: HOUR_WIDTH * 24 }}>
                    {channel.programmes.map((p) => {
                      const left = (offsetMinutes(p.start_time) / 60) * HOUR_WIDTH
                      const width = Math.max(
                        4,
                        ((offsetMinutes(p.end_time) - offsetMinutes(p.start_time)) / 60) * HOUR_WIDTH,
                      )
                      return (
                        <div
                          key={p.start_time}
                          title={p.title}
                          className={`absolute top-1 h-12 overflow-hidden rounded border px-2 py-1 text-xs ${
                            isNow(p) ? 'border-primary bg-primary/20 text-text' : 'border-border bg-card text-muted'
                          }`}
                          style={{ left, width }}
                        >
                          <span className="truncate">{p.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
