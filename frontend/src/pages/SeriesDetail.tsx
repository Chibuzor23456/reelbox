import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PlayerOverlay from '../components/player/PlayerOverlay'
import VideoPlayer from '../components/player/VideoPlayer'
import { useFavorite } from '../hooks/useFavorite'
import { useProgressSaver } from '../hooks/useProgressSaver'
import { useVodPlayback } from '../hooks/useVodPlayback'
import { getVodDetail } from '../lib/vod'
import type { VodItemDetail } from '../lib/types'

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<VodItemDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null)
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | undefined>(undefined)
  const { playback, startAt, error, play, close } = useVodPlayback()
  const { isFavorited, toggle } = useFavorite('series', id ?? '')
  const { onProgress } = useProgressSaver(id ?? '', playingEpisodeId)

  useEffect(() => {
    if (!id) return
    getVodDetail(id)
      .then((detail) => {
        setItem(detail)
        setSeasonNumber(detail.seasons?.[0]?.season_number ?? null)
      })
      .catch(() => setLoadError('This series could not be found.'))
  }, [id])

  if (loadError) {
    return <p className="page-gutter py-10 text-sm text-error">{loadError}</p>
  }

  if (!item) {
    return null
  }

  const season = item.seasons?.find((s) => s.season_number === seasonNumber)

  function playEpisode(episodeId: string) {
    setPlayingEpisodeId(episodeId)
    play(item!.id, episodeId)
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
            secondary action. For a series the "primary action" is picking
            an episode, so the season/episode list sits right under the
            title rather than at the bottom. */}
        <div className="min-w-0 flex-1">
          <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Series
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-text">{item.title}</h1>

          {item.seasons && item.seasons.length > 0 && (
            <>
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {item.seasons.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeasonNumber(s.season_number)}
                    className={`min-h-10 flex-none rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      s.season_number === seasonNumber
                        ? 'bg-primary text-white'
                        : 'bg-card text-muted hover:text-text'
                    }`}
                  >
                    Season {s.season_number}
                  </button>
                ))}
              </div>

              <ul className="mt-4 flex flex-col divide-y divide-border">
                {season?.episodes.map((episode) => (
                  <li key={episode.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text">
                        {episode.episode_number}. {episode.title ?? `Episode ${episode.episode_number}`}
                      </p>
                      {episode.duration_minutes && (
                        <p className="text-xs text-muted">{episode.duration_minutes}m</p>
                      )}
                    </div>
                    <button
                      onClick={() => playEpisode(episode.id)}
                      className="min-h-9 flex-none rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-deep"
                    >
                      Play
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-6 text-sm text-muted">
            {[item.year, item.genre].filter(Boolean).join(' · ')}
          </p>
          {item.synopsis && <p className="mt-4 max-w-prose text-sm text-text">{item.synopsis}</p>}

          <button
            onClick={toggle}
            className="mt-6 min-h-11 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary"
          >
            {isFavorited ? 'Remove from My List' : 'Add to My List'}
          </button>
        </div>
      </div>
    </div>
  )
}
