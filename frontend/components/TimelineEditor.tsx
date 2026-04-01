'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface TimelineClip {
  id: string
  type: 'video' | 'audio' | 'image' | 'text' | 'effect'
  title: string
  startTime: number
  duration: number
  thumbnail?: string
  color?: string
  track: number
  mediaPath?: string
  properties?: Record<string, any>
}

export interface TimelineTrack {
  id: string
  type: 'video' | 'audio' | 'text' | 'effect'
  name: string
  locked: boolean
  muted: boolean
  volume: number
}

interface TimelineEditorProps {
  clips: TimelineClip[]
  tracks: TimelineTrack[]
  currentTime: number
  totalDuration: number
  zoom: number
  selectedClipId?: string | null
  onClipDrag?: (clipId: string, newStartTime: number, newTrack: number) => void
  onClipResize?: (clipId: string, newDuration: number, fromStart?: boolean) => void
  onClipClick?: (clipId: string) => void
  onTimeChange?: (time: number) => void
  onAddClip?: (trackId: string, time: number) => void
  onDeleteClip?: (clipId: string) => void
  onSplitClip?: (clipId: string, time: number) => void
  onCopyClip?: (clipId: string, newStartTime?: number) => void
  onMergeClips?: (clipIds: string[]) => void
  onTrimClip?: (clipId: string, trimStart: number, trimEnd: number) => void
  onAddTrack?: (type: TimelineTrack['type']) => void
  onUpdateTrack?: (trackId: string, updates: Partial<TimelineTrack>) => void
  onDeleteTrack?: (trackId: string) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onZoomChange?: (zoom: number) => void
}

export default function TimelineEditor({
  clips,
  tracks,
  currentTime,
  totalDuration,
  zoom,
  selectedClipId,
  onClipDrag,
  onClipResize,
  onClipClick,
  onTimeChange,
  onAddClip,
  onDeleteClip,
  onSplitClip,
  onAddTrack,
  onUpdateTrack,
  onDeleteTrack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onZoomChange
}: TimelineEditorProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right'>('right')
  const [draggingClip, setDraggingClip] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragTrack, setDragTrack] = useState(0)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  const pixelsPerSecond = 50 * zoom
  const timelineWidth = Math.max(totalDuration * pixelsPerSecond, 1200)

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
  }, [])

  const timeToX = useCallback((time: number): number => time * pixelsPerSecond, [pixelsPerSecond])
  const xToTime = useCallback((x: number): number => x / pixelsPerSecond, [pixelsPerSecond])

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 160
      const newTime = Math.max(0, Math.min(xToTime(Math.max(0, x)), totalDuration))
      onTimeChange?.(newTime)
    }
  }

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 160
      const time = Math.max(0, Math.min(xToTime(Math.max(0, x)), totalDuration))
      setHoverTime(time)
    }
  }

  const handleClipMouseDown = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation()
    setDraggingClip(clip.id)
    setDragTrack(clip.track)
    setDragOffset({
      x: e.clientX - timeToX(clip.startTime),
      y: 0
    })
    setIsDragging(true)
    onClipClick?.(clip.id)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, clip: TimelineClip, direction: 'left' | 'right') => {
    e.stopPropagation()
    e.preventDefault()
    setDraggingClip(clip.id)
    setResizeDirection(direction)
    setIsResizing(true)
    onClipClick?.(clip.id)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return

    if (isDragging && draggingClip && !isResizing) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x - 160
      const newStartTime = Math.max(0, xToTime(Math.max(0, x)))
      
      const tracksContainer = timelineRef.current.querySelector('.tracks-container')
      if (tracksContainer) {
        const trackElements = tracksContainer.querySelectorAll('.track-row')
        trackElements.forEach((trackEl, idx) => {
          const trackRect = trackEl.getBoundingClientRect()
          if (e.clientY >= trackRect.top && e.clientY <= trackRect.bottom) {
            if (idx !== dragTrack) {
              setDragTrack(idx)
            }
          }
        })
      }
      
      onClipDrag?.(draggingClip, newStartTime, dragTrack)
    } else if (isResizing && draggingClip) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 160
      const time = Math.max(0, xToTime(Math.max(0, x)))
      
      const clip = clips.find(c => c.id === draggingClip)
      if (clip) {
        if (resizeDirection === 'right') {
          const newDuration = Math.max(0.5, time - clip.startTime)
          onClipResize?.(draggingClip, newDuration, false)
        } else {
          const newStartTime = Math.min(time, clip.startTime + clip.duration - 0.5)
          const newDuration = (clip.startTime + clip.duration) - newStartTime
          onClipDrag?.(draggingClip, newStartTime, clip.track)
          onClipResize?.(draggingClip, newDuration, true)
        }
      }
    }
  }, [isDragging, isResizing, draggingClip, dragOffset, dragTrack, clips, resizeDirection, timeToX, xToTime, onClipDrag, onClipResize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setDraggingClip(null)
  }, [])

  const getTrackClips = useCallback((trackIndex: number) => {
    return clips.filter(clip => clip.track === trackIndex)
  }, [clips])

  const getClipColor = useCallback((type: string) => {
    const colors: Record<string, string> = {
      video: 'from-purple-600 to-purple-500',
      audio: 'from-green-600 to-green-500',
      image: 'from-blue-600 to-blue-500',
      text: 'from-yellow-600 to-yellow-500',
      effect: 'from-pink-600 to-pink-500'
    }
    return colors[type] || 'from-gray-600 to-gray-500'
  }, [])

  const handleTrackToggleMute = useCallback((trackId: string, currentMuted: boolean) => {
    onUpdateTrack?.(trackId, { muted: !currentMuted })
  }, [onUpdateTrack])

  const handleTrackToggleLock = useCallback((trackId: string, currentLocked: boolean) => {
    onUpdateTrack?.(trackId, { locked: !currentLocked })
  }, [onUpdateTrack])

  const getTrackIcon = (type: string) => {
    const icons: Record<string, string> = {
      video: '🎬',
      audio: '🎵',
      text: '📝',
      effect: '✨'
    }
    return icons[type] || '📦'
  }

  return (
    <div 
      className="flex flex-col h-full bg-slate-900"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-lg flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Timeline
          </span>
          <div className="h-8 w-px bg-slate-600" />
          <div className="flex items-center gap-2">
            <button 
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5",
                canUndo 
                  ? "bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
              onClick={() => onUndo?.()}
              disabled={!canUndo}
            >
              <span>↶</span>
              Undo
            </button>
            <button 
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5",
                canRedo 
                  ? "bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
              onClick={() => onRedo?.()}
              disabled={!canRedo}
            >
              <span>↷</span>
              Redo
            </button>
          </div>
          <div className="h-8 w-px bg-slate-600" />
          <button 
            className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all active:scale-95 flex items-center gap-1.5"
            onClick={() => onAddClip?.(tracks[0]?.id || 'video-1', currentTime)}
          >
            <span>+</span>
            Add Clip
          </button>
          <button 
            className={cn(
              "px-4 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5",
              selectedClipId
                ? "bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
            onClick={() => onSplitClip?.(selectedClipId || '', currentTime)}
            disabled={!selectedClipId}
          >
            <span>✂️</span>
            Split
          </button>
          <button 
            className={cn(
              "px-4 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5",
              selectedClipId
                ? "bg-red-600 text-white hover:bg-red-500 active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
            onClick={() => selectedClipId && onDeleteClip?.(selectedClipId)}
            disabled={!selectedClipId}
          >
            <span>🗑️</span>
            Delete
          </button>
          <button 
            className={cn(
              "px-4 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5",
              selectedClipId
                ? "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
            onClick={() => selectedClipId && onCopyClip?.(selectedClipId)}
            disabled={!selectedClipId}
          >
            <span>📋</span>
            Copy
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-1.5"
              onClick={() => onAddTrack?.('video')}
            >
              <span>🎬</span>
              Video
            </button>
            <button 
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-1.5"
              onClick={() => onAddTrack?.('audio')}
            >
              <span>🎵</span>
              Audio
            </button>
            <button 
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-1.5"
              onClick={() => onAddTrack?.('text')}
            >
              <span>📝</span>
              Text
            </button>
            <button 
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-1.5"
              onClick={() => onAddTrack?.('effect')}
            >
              <span>✨</span>
              Effect
            </button>
          </div>
          <div className="text-white font-mono text-sm bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-700">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div 
          ref={timelineRef}
          className="relative min-w-full"
          style={{ width: timelineWidth + 200 }}
        >
          <div className="sticky top-0 left-0 z-20 bg-slate-800 border-b border-slate-700">
            <div className="flex h-12 items-center">
              <div className="w-48 flex-shrink-0 px-4"></div>
              <div className="flex-1 relative h-full">
                {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => {
                  const time = i * 10
                  if (time > totalDuration) return null
                  return (
                    <div
                      key={i}
                      className="absolute top-0 h-full flex flex-col items-center"
                      style={{ left: timeToX(time) }}
                    >
                      <div className="w-px h-4 bg-slate-400"></div>
                      <span className="text-xs text-slate-300 mt-1 font-medium">
                        {formatTime(time).slice(0, 5)}
                      </span>
                    </div>
                  )
                })}
                {Array.from({ length: Math.ceil(totalDuration / 2) + 1 }).map((_, i) => {
                  const time = i * 2
                  if (time > totalDuration || time % 10 === 0) return null
                  return (
                    <div
                      key={`small-${i}`}
                      className="absolute top-0 h-full flex flex-col items-center"
                      style={{ left: timeToX(time) }}
                    >
                      <div className="w-px h-2 bg-slate-600"></div>
                    </div>
                  )
                })}
                {hoverTime !== null && (
                  <div
                    className="absolute top-0 h-full flex flex-col items-center pointer-events-none"
                    style={{ left: timeToX(hoverTime) }}
                  >
                    <div className="w-px h-full bg-blue-500/50"></div>
                    <div className="absolute -top-8 bg-blue-600 text-white text-xs px-2 py-1 rounded font-mono">
                      {formatTime(hoverTime)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
            style={{ left: timeToX(currentTime) + 192 }}
          >
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-red-500"></div>
            </div>
          </div>

          <div className="tracks-container" onClick={handleTimelineClick} onMouseMove={handleTimelineMouseMove} onMouseLeave={() => setHoverTime(null)}>
            {tracks.map((track, trackIndex) => (
              <div key={track.id} className="track-row flex border-b border-slate-700">
                <div className="w-48 flex-shrink-0 p-3 bg-slate-800 border-r border-slate-700 sticky left-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTrackIcon(track.type)}</span>
                      <span className="text-white text-sm font-medium truncate max-w-24">{track.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrackToggleMute(track.id, track.muted)
                        }}
                        title={track.muted ? "Unmute" : "Mute"}
                      >
                        {track.muted ? '🔇' : '🔊'}
                      </button>
                      <button 
                        className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrackToggleLock(track.id, track.locked)
                        }}
                        title={track.locked ? "Unlock" : "Lock"}
                      >
                        {track.locked ? '🔒' : '🔓'}
                      </button>
                      {tracks.length > 1 && (
                        <button 
                          className="p-1.5 rounded hover:bg-red-900/30 transition-colors text-slate-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTrack?.(track.id)
                          }}
                          title="Delete Track"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative h-24 bg-slate-850">
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: Math.ceil(totalDuration / 1) + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute top-0 h-full w-px",
                          i % 5 === 0 ? "bg-slate-600/60" : "bg-slate-700/30"
                        )}
                        style={{ left: timeToX(i) }}
                      />
                    ))}
                  </div>

                  {getTrackClips(trackIndex).map((clip) => (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-2 bottom-2 rounded-lg cursor-pointer select-none transition-all duration-150",
                        "bg-gradient-to-br shadow-lg",
                        getClipColor(clip.type),
                        selectedClipId === clip.id 
                          ? "ring-2 ring-white ring-offset-2 ring-offset-slate-850 z-10" 
                          : "hover:brightness-110",
                        (isDragging || isResizing) && draggingClip === clip.id 
                          ? "opacity-80 scale-[1.01] z-20 cursor-grabbing" 
                          : "cursor-grab"
                      )}
                      style={{
                        left: timeToX(clip.startTime),
                        width: Math.max(timeToX(clip.duration), 60)
                      }}
                      onMouseDown={(e) => !track.locked && handleClipMouseDown(e, clip)}
                    >
                      <div className="h-full flex flex-col justify-center px-3 overflow-hidden">
                        <div className="flex items-center gap-2">
                          {clip.thumbnail && <span className="text-lg">{clip.thumbnail}</span>}
                          <span className="text-white text-sm font-semibold truncate">
                            {clip.title}
                          </span>
                        </div>
                        <span className="text-white/70 text-xs font-mono mt-0.5">
                          {formatTime(clip.duration)}
                        </span>
                      </div>
                      
                      {!track.locked && !isDragging && (
                        <>
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 rounded-l-lg transition-colors flex items-center justify-center group"
                            onMouseDown={(e) => handleResizeMouseDown(e, clip, 'left')}
                          >
                            <div className="w-1 h-6 bg-white/50 rounded-full group-hover:bg-white/80"></div>
                          </div>
                          <div 
                            className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 rounded-r-lg transition-colors flex items-center justify-center group"
                            onMouseDown={(e) => handleResizeMouseDown(e, clip, 'right')}
                          >
                            <div className="w-1 h-6 bg-white/50 rounded-full group-hover:bg-white/80"></div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-6 max-w-3xl mx-auto">
          <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
            <span>🔍</span>
            Zoom
          </span>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={zoom}
            onChange={(e) => onZoomChange?.(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <button 
              className="w-8 h-8 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center"
              onClick={() => onZoomChange?.(Math.max(0.25, zoom - 0.25))}
            >
              −
            </button>
            <span className="text-white font-mono text-sm bg-slate-900 px-3 py-1 rounded border border-slate-700 min-w-[60px] text-center">
              {zoom.toFixed(2)}x
            </span>
            <button 
              className="w-8 h-8 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center"
              onClick={() => onZoomChange?.(Math.min(4, zoom + 0.25))}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
