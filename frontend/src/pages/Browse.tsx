import { useEffect, useState } from 'react'
import ChannelCard from '../components/ui/ChannelCard'
import VodCard from '../components/ui/VodCard'
import PlayerOverlay from '../components/player/PlayerOverlay'
import VideoPlayer from '../components/player/VideoPlayer'
import { useChannelPlayback } from '../hooks/useChannelPlayback'
import { getChannelFacets, listChannels } from '../lib/channels'
import { listVod } from '../lib/vod'
import type { ChannelFacets } from '../lib/channels'
import type { ChannelSummary, VodItemSummary } from '../lib/types'

type Tab = 'live' | 'movies' | 'series'

const TABS: { key: Tab; label: string }[] = [
  { key: 'live', label: 'Live TV' },
  { key: 'movies', label: 'Movies' },
  { key: 'series', label: 'Series' },
]

export default function Browse() {
  const [tab, setTab] = useState<Tab>('live')
  const [facets, setFacets] = useState<ChannelFacets | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [channels, setChannels] = useState<ChannelSummary[]>([])
  const [vodItems, setVodItems] = useState<VodItemSummary[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const { playback, error, play, close } = useChannelPlayback()

  useEffect(() => {
    getChannelFacets()
      .then(setFacets)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab !== 'live') return
    setLoadError(null)
    listChannels({ category: category ?? undefined, country: country ?? undefined, limit: 200 })
      .then((res) => setChannels(res.channels))
      .catch(() => setLoadError('Could not load channels.'))
  }, [tab, category, country])

  useEffect(() => {
    if (tab === 'live') return
    setLoadError(null)
    listVod({ type: tab === 'movies' ? 'movie' : 'series' })
      .then((res) => setVodItems(res.items))
      .catch(() => setLoadError(`Could not load ${tab}.`))
  }, [tab])

  return (
    <div className="page-gutter py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text">Browse</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'live' && (
        <>
          {playback && (
            <PlayerOverlay onClose={close}>
              <VideoPlayer src={playback.url} title={playback.name} live onClose={close} />
            </PlayerOverlay>
          )}
          {error && <p className="mb-4 text-sm text-error">{error}</p>}

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`min-h-8 rounded-full px-3 text-xs font-medium transition-colors ${
                category === null ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
              }`}
            >
              All categories
            </button>
            {facets?.categories.slice(0, 14).map((c) => (
              <button
                key={c.category}
                onClick={() => setCategory(c.category)}
                className={`min-h-8 rounded-full px-3 text-xs font-medium transition-colors ${
                  category === c.category ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
                }`}
              >
                {c.category} ({c.total})
              </button>
            ))}
          </div>

          {facets && facets.countries.length > 0 && (
            <div className="mb-6">
              <select
                value={country ?? ''}
                onChange={(e) => setCountry(e.target.value || null)}
                className="min-h-9 rounded-md border border-border bg-card px-3 text-sm text-text"
              >
                <option value="">All countries</option>
                {facets.countries.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country} ({c.total})
                  </option>
                ))}
              </select>
            </div>
          )}

          {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onPlay={play} />
            ))}
          </div>
          {!loadError && channels.length === 0 && <p className="text-sm text-muted">No channels match these filters.</p>}
        </>
      )}

      {tab !== 'live' && (
        <>
          {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {vodItems.map((item) => (
              <VodCard key={item.id} item={item} />
            ))}
          </div>
          {!loadError && vodItems.length === 0 && (
            <p className="text-sm text-muted">No {tab} yet — the catalogue is still being ingested.</p>
          )}
        </>
      )}
    </div>
  )
}
