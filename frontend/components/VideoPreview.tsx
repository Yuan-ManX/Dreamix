'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface VideoClip {
  id: string
  title: string
  duration: number
  thumbnail?: string
  type: 'video' | 'audio' | 'image' | 'text' | 'effect'
}

interface WaveformData {
  peaks: number[]
  duration: number
}

interface VideoPreviewProps {
  clips?: VideoClip[]
  currentTime?: number
  onTimeChange?: (time: number) => void
  onPlayPause?: (playing: boolean) => void
  isPlaying?: boolean
  showWaveform?: boolean
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3'
  volume?: number
  onVolumeChange?: (volume: number) => void
  isMuted?: boolean
  onMuteChange?: (muted: boolean) => void
  playbackRate?: number
  onPlaybackRateChange?: (rate: number) => void
  showClipList?: boolean
}

export default function VideoPreview({
  clips = [],
  currentTime: controlledTime,
  onTimeChange,
  onPlayPause,
  isPlaying: controlledPlaying,
  showWaveform = false,
  aspectRatio = '16:9',
  volume: controlledVolume,
  onVolumeChange,
  isMuted: controlledMuted,
  onMuteChange,
  playbackRate: controlledPlaybackRate,
  onPlaybackRateChange,
  showClipList = true
}: VideoPreviewProps) {
  const [internalTime, setInternalTime] = useState(0)
  const [internalPlaying, setInternalPlaying] = useState(false)
  const [internalVolume, setInternalVolume] = useState(80)
  const [internalMuted, setInternalMuted] = useState(false)
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(1)
  const [showFramePreview, setShowFramePreview] = useState(true)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const videoRef = useRef<HTMLDivElement>(null)
  const seekBarRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const currentTime = controlledTime ?? internalTime
  const isPlaying = controlledPlaying ?? internalPlaying
  const volume = controlledVolume ?? internalVolume
  const isMuted = controlledMuted ?? internalMuted
  const playbackRate = controlledPlaybackRate ?? internalPlaybackRate
  
  const totalDuration = clips.length > 0 
    ? Math.max(...clips.map((c, idx) => {
        let accumulated = 0
        for (let i = 0; i < idx; i++) {
          accumulated += clips[i].duration
        }
        return accumulated + c.duration
      }))
    : 60

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
  }, [])

  const generateWaveform = useCallback((): WaveformData => {
    const peaks: number[] = []
    const sampleCount = 200
    for (let i = 0; i < sampleCount; i++) {
      peaks.push(Math.random() * 0.6 + 0.2)
    }
    return { peaks, duration: totalDuration }
  }, [totalDuration])

  const waveform = showWaveform ? generateWaveform() : null

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now()
      const startVideoTime = currentTime

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000 * playbackRate
        let newTime = startVideoTime + elapsed
        
        if (isLooping && newTime >= totalDuration) {
          newTime = 0
          if (onTimeChange) onTimeChange(0)
          else setInternalTime(0)
        }
        
        if (!isLooping && newTime >= totalDuration) {
          newTime = totalDuration
          if (onPlayPause) onPlayPause(false)
          else setInternalPlaying(false)
        }
        
        if (newTime < totalDuration || isLooping) {
          if (onTimeChange) {
            onTimeChange(Math.min(newTime, totalDuration))
          } else {
            setInternalTime(Math.min(newTime, totalDuration))
          }
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentTime, totalDuration, playbackRate, isLooping, onTimeChange, onPlayPause])

  const togglePlayPause = useCallback(() => {
    const newPlaying = !isPlaying
    if (onPlayPause) {
      onPlayPause(newPlaying)
    } else {
      setInternalPlaying(newPlaying)
    }
  }, [isPlaying, onPlayPause])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current) return
    const rect = seekBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newTime = Math.max(0, Math.min((x / rect.width) * totalDuration, totalDuration))
    
    if (onTimeChange) {
      onTimeChange(newTime)
    } else {
      setInternalTime(newTime)
    }
  }, [seekBarRef, totalDuration, onTimeChange])

  const handleSeekHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current) return
    const rect = seekBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const hoverTime = Math.max(0, Math.min((x / rect.width) * totalDuration, totalDuration))
    setHoverTime(hoverTime)
  }, [seekBarRef, totalDuration])

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16': return 'aspect-[9/16]'
      case '1:1': return 'aspect-square'
      case '4:3': return 'aspect-[4/3]'
      default: return 'aspect-video'
    }
  }

  const getCurrentClip = useCallback(() => {
    let accumulatedTime = 0
    for (const clip of clips) {
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration) {
        return clip
      }
      accumulatedTime += clip.duration
    }
    return null
  }, [clips, currentTime])

  const toggleFullscreen = useCallback(async () => {
    if (!previewContainerRef.current) return
    
    try {
      if (!document.fullscreenElement) {
        await previewContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const currentClip = getCurrentClip()

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (onVolumeChange) {
      onVolumeChange(newVolume)
    } else {
      setInternalVolume(newVolume)
    }
    if (newVolume > 0 && isMuted) {
      if (onMuteChange) {
        onMuteChange(false)
      } else {
        setInternalMuted(false)
      }
    }
  }, [onVolumeChange, onMuteChange, isMuted])

  const handleMuteChange = useCallback(() => {
    const newMuted = !isMuted
    if (onMuteChange) {
      onMuteChange(newMuted)
    } else {
      setInternalMuted(newMuted)
    }
  }, [isMuted, onMuteChange])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (onPlaybackRateChange) {
      onPlaybackRateChange(rate)
    } else {
      setInternalPlaybackRate(rate)
    }
  }, [onPlaybackRateChange])

  const stepForward = useCallback((seconds: number = 5) => {
    const newTime = Math.min(totalDuration, currentTime + seconds)
    if (onTimeChange) onTimeChange(newTime)
    else setInternalTime(newTime)
  }, [currentTime, totalDuration, onTimeChange])

  const stepBackward = useCallback((seconds: number = 5) => {
    const newTime = Math.max(0, currentTime - seconds)
    if (onTimeChange) onTimeChange(newTime)
    else setInternalTime(newTime)
  }, [currentTime, onTimeChange])

  const goToStart = useCallback(() => {
    if (onTimeChange) onTimeChange(0)
    else setInternalTime(0)
  }, [onTimeChange])

  const goToEnd = useCallback(() => {
    if (onTimeChange) onTimeChange(totalDuration)
    else setInternalTime(totalDuration)
  }, [totalDuration, onTimeChange])

  const getClipIcon = (type: string) => {
    const icons: Record<string, string> = {
      video: '🎬',
      audio: '🎵',
      image: '🖼️',
      text: '📝',
      effect: '✨'
    }
    return icons[type] || '📦'
  }

  return (
    <div 
      ref={previewContainerRef}
      className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700"
    >
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <div 
          ref={videoRef}
          className={`relative ${getAspectRatioClass()} w-full max-w-5xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden shadow-2xl`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {currentClip ? (
              <div className="text-center">
                <div className="text-8xl mb-4">{currentClip.thumbnail || getClipIcon(currentClip.type)}</div>
                <p className="text-white text-xl font-semibold">{currentClip.title}</p>
                <p className="text-slate-400 text-sm mt-2">{currentClip.type.toUpperCase()}</p>
                <p className="text-slate-500 text-xs mt-1">{formatTime(currentTime)} / {formatTime(currentClip.duration)}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-4">🎬</div>
                <p className="text-slate-400 text-lg">Video Preview</p>
                <p className="text-sm text-slate-500 mt-2">Add clips to see your video</p>
              </div>
            )}
          </div>

          <button
            onClick={togglePlayPause}
            className="absolute z-10 w-24 h-24 rounded-full bg-purple-600/90 flex items-center justify-center text-white text-5xl hover:bg-purple-500 transition-all hover:scale-105 shadow-xl"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {showFramePreview && hoverTime !== null && (
            <div 
              className="absolute bottom-24 w-40 h-24 bg-slate-800 rounded-lg border border-slate-600 flex flex-col items-center justify-center shadow-xl z-20"
              style={{ left: `${(hoverTime / totalDuration) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="text-3xl">🎞️</div>
              <span className="absolute bottom-2 text-xs text-slate-300 font-mono">{formatTime(hoverTime)}</span>
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-lg transition-all ${isLooping ? 'bg-purple-600 text-white' : 'bg-black/50 text-slate-300 hover:bg-black/70'}`}
            >
              🔁
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-black/50 text-slate-300 hover:bg-black/70 transition-all"
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-800 border-t border-slate-700">
        <div 
          ref={seekBarRef}
          className="relative h-10 cursor-pointer group"
          onClick={handleSeek}
          onMouseMove={handleSeekHover}
          onMouseLeave={() => setHoverTime(null)}
        >
          {waveform && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-px h-6">
                {waveform.peaks.map((peak, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all ${
                      i / waveform.peaks.length * totalDuration <= currentTime
                        ? 'bg-green-500'
                        : 'bg-green-500/30'
                    }`}
                    style={{ height: `${peak * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-0 right-0 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>

          {hoverTime !== null && (
            <div
              className="absolute bottom-4 h-1.5 bg-white/40 rounded-full"
              style={{ left: 0, width: `${(hoverTime / totalDuration) * 100}%` }}
            />
          )}

          <div
            className="absolute bottom-4 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-[6px] transition-all"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-mono min-w-[90px] bg-slate-900 px-3 py-1 rounded border border-slate-700">
              {formatTime(currentTime)}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={goToStart}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                ⏮️
              </button>
              <button 
                onClick={() => stepBackward(10)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                ⏪
              </button>
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors shadow-lg hover:shadow-purple-500/30"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button 
                onClick={() => stepForward(10)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                ⏩
              </button>
              <button 
                onClick={goToEnd}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                ⏭️
              </button>
            </div>
            <span className="text-slate-400 text-sm font-mono min-w-[90px] bg-slate-900 px-3 py-1 rounded border border-slate-700">
              {formatTime(totalDuration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFramePreview(!showFramePreview)}
              className={`p-2 rounded-lg transition-all ${showFramePreview ? 'text-purple-400 bg-purple-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              🖼️
            </button>
            
            <button 
              onClick={() => {}}
              className={`p-2 rounded-lg transition-all ${showWaveform ? 'text-purple-400 bg-purple-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              📊
            </button>

            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              className="bg-slate-700 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleMuteChange}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-28 accent-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {showClipList && clips.length > 0 && (
        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-3 font-medium">Clip Timeline ({clips.length} clips)</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {clips.map((clip, index) => {
              let accumulatedTime = 0
              for (let i = 0; i < index; i++) {
                accumulatedTime += clips[i].duration
              }
              const isActive = currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration
              
              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    if (onTimeChange) onTimeChange(accumulatedTime)
                    else setInternalTime(accumulatedTime)
                  }}
                  className={`flex-shrink-0 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                    isActive 
                      ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/20' 
                      : 'bg-slate-800 border-transparent hover:border-slate-600 hover:bg-slate-750'
                  }`}
                >
                  <div className="text-3xl mb-2">{clip.thumbnail || getClipIcon(clip.type)}</div>
                  <p className="text-xs text-white truncate w-24 font-medium">{clip.title}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{formatTime(clip.duration)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
