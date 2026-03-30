'use client'

import { useState, useRef, useEffect } from 'react'

export interface TimelineClip {
  id: string
  type: 'video' | 'audio' | 'image' | 'text'
  title: string
  startTime: number
  duration: number
  thumbnail?: string
  color?: string
  track: number
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
  onClipResize?: (clipId: string, newDuration: number) => void
  onClipClick?: (clipId: string) => void
  onTimeChange?: (time: number) => void
  onAddClip?: (trackId: string, time: number) => void
  onDeleteClip?: (clipId: string) => void
  onSplitClip?: (clipId: string, time: number) => void
  onAddTrack?: (type: TimelineTrack['type']) => void
  onUpdateTrack?: (trackId: string, updates: Partial<TimelineTrack>) => void
  onDeleteTrack?: (trackId: string) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
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
  canRedo
}: TimelineEditorProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggingClip, setDraggingClip] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragTrack, setDragTrack] = useState(0)

  const pixelsPerSecond = 50 * zoom
  const timelineWidth = Math.max(totalDuration * pixelsPerSecond, 800)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
  }

  const timeToX = (time: number): number => time * pixelsPerSecond
  const xToTime = (x: number): number => x / pixelsPerSecond

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newTime = Math.max(0, Math.min(xToTime(x), totalDuration))
      onTimeChange?.(newTime)
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggingClip || !timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const newStartTime = Math.max(0, xToTime(x))
    
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
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggingClip(null)
  }

  const getTrackClips = (trackIndex: number) => {
    return clips.filter(clip => clip.track === trackIndex)
  }

  const getClipColor = (type: string) => {
    const colors: Record<string, string> = {
      video: 'bg-purple-500',
      audio: 'bg-green-500',
      image: 'bg-blue-500',
      text: 'bg-yellow-500',
      effect: 'bg-pink-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  const handleTrackToggleMute = (trackId: string, currentMuted: boolean) => {
    onUpdateTrack?.(trackId, { muted: !currentMuted })
  }

  const handleTrackToggleLock = (trackId: string, currentLocked: boolean) => {
    onUpdateTrack?.(trackId, { locked: !currentLocked })
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">Timeline</span>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onUndo?.()}
              disabled={!canUndo}
            >
              ↶ Undo
            </button>
            <button 
              className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onRedo?.()}
              disabled={!canRedo}
            >
              ↷ Redo
            </button>
            <div className="h-6 w-px bg-slate-600" />
            <button 
              className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onAddClip?.(tracks[0]?.id || 'video-1', currentTime)}
            >
              + Add Clip
            </button>
            <button 
              className="px-3 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onSplitClip?.(selectedClipId || '', currentTime)}
              disabled={!selectedClipId}
            >
              Split
            </button>
            <button 
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => selectedClipId && onDeleteClip?.(selectedClipId)}
              disabled={!selectedClipId}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              className="px-2 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onAddTrack?.('video')}
            >
              + Video Track
            </button>
            <button 
              className="px-2 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onAddTrack?.('audio')}
            >
              + Audio Track
            </button>
            <button 
              className="px-2 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600"
              onClick={() => onAddTrack?.('text')}
            >
              + Text Track
            </button>
          </div>
          <div className="text-white font-mono text-sm">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>
      </div>

      <div 
        className="flex-1 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={timelineRef}
          className="relative min-w-full"
          style={{ width: timelineWidth + 200 }}
        >
          <div className="sticky left-0 z-10 bg-slate-800 border-b border-slate-700">
            <div className="flex h-10 items-center">
              <div className="w-40 flex-shrink-0 px-3"></div>
              <div className="flex-1 relative">
                {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => {
                  const time = i * 5
                  if (time > totalDuration) return null
                  return (
                    <div
                      key={i}
                      className="absolute top-0 h-full flex flex-col items-center"
                      style={{ left: timeToX(time) }}
                    >
                      <div className="w-px h-3 bg-slate-500"></div>
                      <span className="text-xs text-slate-400 mt-1">
                        {formatTime(time).slice(0, 5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
            style={{ left: timeToX(currentTime) + 160 }}
          >
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"></div>
            </div>
          </div>

          <div className="tracks-container" onClick={handleTimelineClick}>
            {tracks.map((track, trackIndex) => (
              <div key={track.id} className="track-row flex border-b border-slate-700">
                <div className="w-40 flex-shrink-0 p-3 bg-slate-800 border-r border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{track.name}</span>
                    <div className="flex gap-1">
                      <button 
                        className="text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrackToggleMute(track.id, track.muted)
                        }}
                      >
                        {track.muted ? '🔇' : '🔊'}
                      </button>
                      <button 
                        className="text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrackToggleLock(track.id, track.locked)
                        }}
                      >
                        {track.locked ? '🔒' : '🔓'}
                      </button>
                      {tracks.length > 1 && (
                        <button 
                          className="text-slate-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTrack?.(track.id)
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative h-20 bg-slate-850">
                  <div className="absolute inset-0">
                    {Array.from({ length: Math.ceil(totalDuration / 1) + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 h-full w-px bg-slate-700/50"
                        style={{ left: timeToX(i) }}
                      />
                    ))}
                  </div>

                  {getTrackClips(trackIndex).map((clip) => (
                    <div
                      key={clip.id}
                      className={`absolute top-2 bottom-2 rounded cursor-pointer select-none transition-all border-2 ${getClipColor(clip.type)} ${
                        selectedClipId === clip.id ? 'border-white' : 'border-transparent'
                      } ${
                        isDragging && draggingClip === clip.id ? 'opacity-70 scale-[1.02] z-10' : 'hover:brightness-110'
                      }`}
                      style={{
                        left: timeToX(clip.startTime),
                        width: Math.max(timeToX(clip.duration), 40)
                      }}
                      onMouseDown={(e) => !track.locked && handleClipMouseDown(e, clip)}
                    >
                      <div className="h-full flex items-center px-2 overflow-hidden">
                        <span className="text-white text-xs font-medium truncate">
                          {clip.title}
                        </span>
                      </div>
                      {!track.locked && (
                        <>
                          <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30" />
                          <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30" />
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

      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">Zoom:</span>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={zoom}
            onChange={(e) => {}}
            className="flex-1 accent-purple-500"
          />
          <span className="text-white text-sm font-mono">{zoom}x</span>
        </div>
      </div>
    </div>
  )
}
