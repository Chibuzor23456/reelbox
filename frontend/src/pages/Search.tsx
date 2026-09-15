import { useEffect, useState } from 'react'
import CatalogItemCard from '../components/ui/CatalogItemCard'
import VideoPlayer from '../components/player/VideoPlayer'
import { useChannelPlayback } from '../hooks/useChannelPlayback'
import { searchAll } from '../lib/search'
import type { EpgSearchResult, RecommendationSection } from '../lib/types'

function formatTime(mysqlDatetime: string): string {
  return new Date(mysqlDatetime.replace(' ', 'T') + 'Z').toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [sections, setSections] = useState<RecommendationSection[]>([])
  const [programmes, setProgrammes] = useState<EpgSearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { playback, error: playError, play, close } = useChannelPlayback()

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSections([])
      setProgrammes([])
      setSearched(false)
      setError(null)
      return
    }

    const timeout = setTimeout(() => {
      searchAll(trimmed)
        .then((res) => {
          setSections(res.sections)
          setProgrammes(res.programmes)
          setSearched(true)
          setError(null)
        })
        .catch(() => setError('Search failed. Try again.'))
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const hasResults = sections.length > 0 || programmes.length > 0

  return (
    <div className="page-gutter py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text">Search</h1>

      <input
        type="search"
        inputMode="search"
        placeholder="Search channels, movies, series…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="min-h-11 w-full max-w-md rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
      />

      {playback && (
        <div className="my-6 max-w-3xl">
          <VideoPlayer src={playback.url} title={playback.name} live onClose={close} />
        </div>
      )}
      {playError && <p className="mt-4 text-sm text-error">{playError}</p>}
      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      {searched && !hasResults && !error && (
        <p className="mt-6 text-sm text-muted">No results for "{query.trim()}".</p>
      )}

      {sections.map((section) => (
        <section key={section.key} className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-text">{section.title}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {section.items.map((item) => (
              <CatalogItemCard
                key={`${item.item_type}:${item.id}:${item.episode_id ?? ''}`}
                item={item}
                onPlayChannel={play}
              />
            ))}
          </div>
        </section>
      ))}

      {programmes.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-text">Programmes</h2>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {programmes.map((p) => (
              <li key={`${p.channel_id}:${p.start_time}`} className="flex items-center gap-3 p-3">
                {p.logo_url ? (
                  <img src={p.logo_url} alt="" className="h-8 w-8 flex-none object-contain" />
                ) : (
                  <div className="h-8 w-8 flex-none rounded bg-surface" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{p.title}</p>
                  <p className="truncate text-xs text-muted">{p.channel_name}</p>
                </div>
                <span className="flex-none text-xs text-muted">{formatTime(p.start_time)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
