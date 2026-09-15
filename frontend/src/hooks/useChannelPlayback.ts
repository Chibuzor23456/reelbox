import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPlayback } from '../lib/channels'
import { recordHistory } from '../lib/history'
import type { ChannelSummary, PlaybackInfo } from '../lib/types'

/** Shared "click a channel card, get a login prompt if needed, then a player" flow. */
export function useChannelPlayback() {
  const { requireAuth } = useAuth()
  const [playback, setPlayback] = useState<PlaybackInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  function play(channel: ChannelSummary) {
    requireAuth(() => {
      setError(null)
      getPlayback(channel.id)
        .then((info) => {
          setPlayback(info)
          recordHistory('channel', channel.id)
        })
        .catch(() => setError(`Could not start ${channel.name}.`))
    })
  }

  function close() {
    setPlayback(null)
  }

  return { playback, error, play, close }
}
