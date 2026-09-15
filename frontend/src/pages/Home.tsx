import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CatalogItemCard from '../components/ui/CatalogItemCard'
import ChannelCard from '../components/ui/ChannelCard'
import ContinueWatchingCard from '../components/ui/ContinueWatchingCard'
import Hero from '../components/ui/Hero'
import Row from '../components/ui/Row'
import VodCard from '../components/ui/VodCard'
import PlayerOverlay from '../components/player/PlayerOverlay'
import VideoPlayer from '../components/player/VideoPlayer'
import { useAuth } from '../context/AuthContext'
import { useChannelPlayback } from '../hooks/useChannelPlayback'
import { useProgressSaver } from '../hooks/useProgressSaver'
import { useVodPlayback } from '../hooks/useVodPlayback'
import { getChannelFacets, listChannels } from '../lib/channels'
import { getRecommendations } from '../lib/recommendations'
import { getVodDetail, listVod } from '../lib/vod'
import { listContinueWatching } from '../lib/vodProgress'
import type {
  ChannelSummary,
  ContinueWatchingItem,
  RecommendationSection,
  VodItemDetail,
  VodItemSummary,
} from '../lib/types'

// The curated IPTV-org shelves, resynced directly (see ShelfSync.php) so
// each of these reflects real counts instead of whatever the slow master
// catalogue ingestion has crawled to so far.
const SHELVES: { key: string; label: string }[] = [
  { key: 'sports', label: 'Sports' },
  { key: 'news', label: 'News' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'movies', label: 'Movie Channels' },
  { key: 'series', label: 'Series Channels' },
  { key: 'nigeria', label: 'Nigeria' },
  { key: 'africa', label: 'Africa' },
]

export default function Home() {
  const { status: authStatus } = useAuth()
  const [channels, setChannels] = useState<ChannelSummary[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [shelfRows, setShelfRows] = useState<Record<string, ChannelSummary[]>>({})
  const [movies, setMovies] = useState<VodItemSummary[]>([])
  const [series, setSeries] = useState<VodItemSummary[]>([])
  const [featured, setFeatured] = useState<VodItemDetail | null>(null)
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([])

  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | undefined>(undefined)
  const channelPlayback = useChannelPlayback()
  const vodPlayback = useVodPlayback()
  const vodProgress = useProgressSaver(vodPlayback.playback?.id ?? '', playingEpisodeId)

  useEffect(() => {
    getChannelFacets()
      .then((res) => setCategories(res.categories.map((c) => c.category)))
      .catch(() => {})
    listVod({ type: 'movie' })
      .then((res) => setMovies(res.items.slice(0, 20)))
      .catch(() => {})
    listVod({ type: 'series' })
      .then((res) => setSeries(res.items.slice(0, 20)))
      .catch(() => {})
    Promise.all(
      SHELVES.map(({ key }) =>
        listChannels({ shelf: key, limit: 12 })
          .then((res): [string, ChannelSummary[]] => [key, res.channels])
          .catch((): [string, ChannelSummary[]] => [key, []]),
      ),
    ).then((results) => {
      const next: Record<string, ChannelSummary[]> = {}
      for (const [key, rowChannels] of results) {
        if (rowChannels.length > 0) next[key] = rowChannels
      }
      setShelfRows(next)
    })
  }, [])

  useEffect(() => {
    listChannels({ category: selectedCategory ?? undefined, limit: 20 })
      .then((res) => setChannels(res.channels))
      .catch(() => {})
  }, [selectedCategory])

  useEffect(() => {
    if (movies.length === 0) return
    getVodDetail(movies[0].id)
      .then(setFeatured)
      .catch(() => {})
    // Only re-runs if the movies list itself changes (fetched once on mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies])

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    listContinueWatching()
      .then((res) => setContinueWatching(res.items))
      .catch(() => {})
    getRecommendations()
      .then((res) => setRecommendations(res.sections))
      .catch(() => {})
  }, [authStatus])

  function resumeItem(item: ContinueWatchingItem) {
    setPlayingEpisodeId(item.episode_id ?? undefined)
    vodPlayback.play(item.id, item.episode_id ?? undefined)
  }

  function playFeatured() {
    if (!featured) return
    setPlayingEpisodeId(undefined)
    vodPlayback.play(featured.id)
  }

  return (
    <div className="page-gutter py-6">
      <Hero
        title={featured?.title ?? 'Welcome to ReelBox'}
        subtitle={
          featured?.synopsis ??
          'Your entertainment box, anywhere. Live channels and on-demand movies & series in one place.'
        }
        backdropUrl={featured?.backdrop_url}
        action={
          featured && (
            <div className="flex gap-3">
              <button
                onClick={playFeatured}
                className="min-h-10 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
              >
                Play
              </button>
              <Link
                to={`/movies/${featured.id}`}
                className="flex min-h-10 items-center rounded-md border border-border bg-bg/60 px-5 text-sm font-semibold text-text transition-colors hover:border-primary"
              >
                More Info
              </Link>
            </div>
          )
        }
      />

      {channelPlayback.playback && (
        <PlayerOverlay onClose={channelPlayback.close}>
          <VideoPlayer
            src={channelPlayback.playback.url}
            title={channelPlayback.playback.name}
            live
            onClose={channelPlayback.close}
          />
        </PlayerOverlay>
      )}
      {channelPlayback.error && <p className="mb-4 text-sm text-error">{channelPlayback.error}</p>}

      {vodPlayback.playback && (
        <PlayerOverlay onClose={vodPlayback.close}>
          <VideoPlayer
            src={vodPlayback.playback.url}
            title={vodPlayback.playback.title ?? ''}
            startAt={vodPlayback.startAt}
            onProgress={vodProgress.onProgress}
            onClose={vodPlayback.close}
          />
        </PlayerOverlay>
      )}
      {vodPlayback.error && <p className="mb-4 text-sm text-error">{vodPlayback.error}</p>}

      {/* My List, Popular and the rest of Home's rows still need more
          personalization signal than exists yet — correctly absent rather
          than shown empty. */}
      {continueWatching.length > 0 && (
        <Row title="Continue Watching" itemWidthClass="w-28">
          {continueWatching.map((item) => (
            <ContinueWatchingCard key={`${item.id}:${item.episode_id ?? ''}`} item={item} onPlay={resumeItem} />
          ))}
        </Row>
      )}

      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`min-h-8 rounded-full px-3 text-xs font-medium transition-colors ${
              selectedCategory === null ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
            }`}
          >
            All
          </button>
          {categories.slice(0, 12).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-8 rounded-full px-3 text-xs font-medium transition-colors ${
                selectedCategory === category ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {channels.length > 0 && (
        <Row title={selectedCategory ? `Live: ${selectedCategory}` : 'Live Now'}>
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} onPlay={channelPlayback.play} />
          ))}
        </Row>
      )}
      {channels.length === 0 && selectedCategory && (
        <p className="mb-8 text-sm text-muted">No {selectedCategory} channels right now.</p>
      )}

      {SHELVES.map(
        ({ key, label }) =>
          shelfRows[key] && (
            <Row key={key} title={label}>
              {shelfRows[key].map((channel) => (
                <ChannelCard key={channel.id} channel={channel} onPlay={channelPlayback.play} />
              ))}
            </Row>
          ),
      )}

      {movies.length > 0 && (
        <Row title="Movies" itemWidthClass="w-28">
          {movies.map((item) => (
            <VodCard key={item.id} item={item} />
          ))}
        </Row>
      )}

      {series.length > 0 && (
        <Row title="Series" itemWidthClass="w-28">
          {series.map((item) => (
            <VodCard key={item.id} item={item} />
          ))}
        </Row>
      )}

      {recommendations.map((section) => (
        <Row key={section.key} title={section.title} itemWidthClass="w-28">
          {section.items.map((item) => (
            <CatalogItemCard
              key={`${item.item_type}:${item.id}:${item.episode_id ?? ''}`}
              item={item}
              onPlayChannel={channelPlayback.play}
            />
          ))}
        </Row>
      ))}
    </div>
  )
}
