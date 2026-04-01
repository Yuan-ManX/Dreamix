'use client'

import { useState, useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { cn, formatTime, getClipColor, getClipIcon, generateId } from '@/lib'
import { TimelineClip } from '@/types'

export default function StudioTimeline() {
  const [zoom, setZoom] = useState(1)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  
  const timelineRef = useRef<HTMLDivElement>(null)
  
  const {
    getClips,
    getTracks,
    selectedClipId,
    setSelectedClipId,
    addClip
  } = useProjectStore()
  
  const clips = getClips()
  const tracks = getTracks()
  
  const duration = 60
  const pixelsPerSecond = 50 * zoom
  const totalWidth = duration * pixelsPerSecond

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX - scrollLeft)
  }, [scrollLeft])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const newScrollLeft = dragStartX - e.clientX
    setScrollLeft(Math.max(0, newScrollLeft))
  }, [isDragging, dragStartX])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleAddClip = useCallback(() => {
    const newClip: TimelineClip = {
      id: generateId(),
      type: 'video',
      title: 'New Clip',
      startTime: 0,
      duration: 5,
      track: 0
    }
    addClip(newClip)
  }, [addClip])

  const getTrackColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-[#1a1a1a]'
      case 'audio': return 'bg-[#151515]'
      case 'text': return 'bg-[#181818]'
      default: return 'bg-[#1a1a1a]'
    }
  }

  const getTrackLabel = (type: string) => {
    switch (type) {
      case 'video': return '🎬'
      case 'audio': return '🎵'
      case 'text': return '📝'
      default: return '📦'
    }
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.1 : -0.1
      setZoom(prev => Math.max(0.25, Math.min(4, prev + delta)))
    } else {
      setScrollLeft(prev => Math.max(0, prev + e.deltaY))
    }
  }, [])

  const handleClipClick = useCallback((e: React.MouseEvent, clipId: string) => {
    e.stopPropagation()
    setSelectedClipId(clipId)
  }, [setSelectedClipId])

  return (
    <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden">
      <div className="h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleAddClip}
            className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors"
            title="Add clip"
          >
            ➕
          </button>
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Delete">
            🗑️
          </button>
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Cut">
            ✂️
          </button>
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Split">
            ⌧
          </button>
          <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Undo">
            ↶
          </button>
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Redo">
            ↷
          </button>
          <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Snap">
            📐
          </button>
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Bookmark">
            🔖
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#252525] text-[#888888] rounded-lg text-xs font-medium flex items-center gap-1">
            <span>🎬</span>
            <span>Main scene</span>
            <span className="text-[#555555]">●</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
            className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors"
          >
            ➖
          </button>
          <div className="w-24 h-1.5 bg-[#333333] rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer"
              style={{ left: `${((zoom - 0.25) / 3.75) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <button
            onClick={() => setZoom(prev => Math.min(4, prev + 0.25))}
            className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors"
          >
            ➕
          </button>
          <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
          <button className="p-1.5 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Zoom to fit">
            🔍
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-32 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col flex-shrink-0">
          <div className="h-8 flex items-center px-3 text-[#666666] text-xs border-b border-[#2a2a2a]">
            Tracks
          </div>
          
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className={cn(
                "h-24 flex items-center gap-2 px-3 border-b border-[#2a2a2a]",
                getTrackColor(track.type)
              )}
            >
              <button className="p-1 text-[#666666] hover:text-white">
                🔊
              </button>
              <button className="p-1 text-[#666666] hover:text-white">
                👁️
              </button>
              <span className="text-lg">{getTrackLabel(track.type)}</span>
            </div>
          ))}
        </div>

        <div 
          className="flex-1 overflow-hidden relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center z-10">
            <div 
              className="relative"
              style={{ width: totalWidth, transform: `translateX(-${scrollLeft}px)` }}
            >
              {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 text-[10px] text-[#666666]"
                  style={{ left: i * 10 * pixelsPerSecond }}
                >
                  {formatTime(i * 10)}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-8 left-0 right-0 bottom-0 overflow-hidden">
            <div 
              className="relative"
              style={{ width: totalWidth, transform: `translateX(-${scrollLeft}px)` }}
            >
              {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-[#252525]"
                  style={{ left: i * pixelsPerSecond }}
                />
              ))}

              {tracks.map((track, trackIdx) => (
                <div
                  key={track.id}
                  className={cn(
                    "h-24 border-b border-[#2a2a2a] relative",
                    getTrackColor(track.type)
                  )}
                >
                  {clips
                    .filter(clip => clip.track === trackIdx)
                    .map((clip) => (
                      <div
                        key={clip.id}
                        onClick={(e) => handleClipClick(e, clip.id)}
                        className={cn(
                          "absolute top-2 h-[calc(100%-16px)] rounded-lg cursor-pointer transition-all",
                          selectedClipId === clip.id
                            ? "ring-2 ring-blue-500"
                            : "hover:brightness-110"
                        )}
                        style={{
                          left: clip.startTime * pixelsPerSecond,
                          width: clip.duration * pixelsPerSecond
                        }}
                      >
                        <div className={cn(
                          "h-full rounded-lg bg-gradient-to-r flex flex-col p-2 overflow-hidden",
                          getClipColor(clip.type)
                        )}>
                          <div className="flex items-center gap-2 text-white text-xs font-medium truncate">
                            <span>{getClipIcon(clip.type)}</span>
                            <span className="truncate">{clip.title}</span>
                          </div>
                          <div className="flex-1" />
                          <div className="text-[10px] text-white/70 font-mono">
                            {clip.duration.toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
