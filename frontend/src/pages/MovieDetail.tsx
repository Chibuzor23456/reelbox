import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PlayerOverlay from '../components/player/PlayerOverlay'
import VideoPlayer from '../components/player/VideoPlayer'
import { useFavorite } from '../hooks/useFavorite'
import { useProgressSaver } from '../hooks/useProgressSaver'
import { useVodPlayback } from '../hooks/useVodPlayback'
import { getVodDetail } from '../lib/vod'
import type { VodItemDetail } from '../lib/types'

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<VodItemDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { playback, startAt, error, play, close } = useVodPlayback()
  const { isFavorited, toggle } = useFavorite('movie', id ?? '')
  const { onProgress } = useProgressSaver(id ?? '')

  useEffect(() => {
    if (!id) return
    getVodDetail(id)
      .then(setItem)
      .catch(() => setLoadError('This movie could not be found.'))
  }, [id])

  if (loadError) {
    return <p className="page-gutter py-10 text-sm text-error">{loadError}</p>
  }

  if (!item) {
    return null
  }

  return (
    <div className="page-gutter py-6">
      {item.backdrop_url && (
        <div className="mb-6 aspect-[16/6] w-full overflow-hidden rounded-xl">
          <img src={item.backdrop_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {playback && (
        <PlayerOverlay onClose={close}>
          <VideoPlayer
            src={playback.url}
            title={playback.title ?? item.title}
            startAt={startAt}
            onProgress={onProgress}
            onClose={close}
          />
        </PlayerOverlay>
      )}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="flex items-start gap-6">
        {item.poster_url && (
          <img src={item.poster_url} alt="" className="hidden aspect-[2/3] w-40 flex-none rounded-lg border border-border object-cover sm:block" />
        )}
        {/* Order follows the responsive spec's mobile content priority:
            artwork (above), title, primary action, metadata, description,
            secondary action — desktop has room for all of it too, so one
            order serves both rather than reflowing per breakpoint. */}
        <div className="min-w-0">
          <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Movie
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-text">{item.title}</h1>

          <button
            onClick={() => play(item.id)}
            className="mt-4 min-h-11 rounded-md bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Play
          </button>

          <p className="mt-4 text-sm text-muted">
            {[item.year, item.runtime_minutes ? `${item.runtime_minutes}m` : null, item.genre]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {item.synopsis && <p className="mt-4 max-w-prose text-sm text-text">{item.synopsis}</p>}

          <button
            onClick={toggle}
            className="mt-6 min-h-11 rounded-md border border-border px-5 py-2.5 font-semibold text-text transition-colors hover:border-primary"
          >
            {isFavorited ? 'Remove from My List' : 'Add to My List'}
          </button>
        </div>
      </div>
    </div>
  )
}
