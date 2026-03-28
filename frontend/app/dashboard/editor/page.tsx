'use client'

import { useState, useCallback } from 'react'
import ChatInterface from '@/components/ChatInterface'
import VideoPreview from '@/components/VideoPreview'
import TimelineEditor, { TimelineClip, TimelineTrack } from '@/components/TimelineEditor'

export default function EditorPage() {
  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: '1',
      type: 'video',
      title: 'Intro Scene',
      startTime: 0,
      duration: 5,
      track: 0
    },
    {
      id: '2',
      type: 'image',
      title: 'Product Shot',
      startTime: 5,
      duration: 8,
      track: 0
    },
    {
      id: '3',
      type: 'audio',
      title: 'Background Music',
      startTime: 0,
      duration: 30,
      track: 1
    },
    {
      id: '4',
      type: 'text',
      title: 'Title Card',
      startTime: 0,
      duration: 3,
      track: 2
    }
  ])

  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: 'video-1', type: 'video', name: 'Video Track 1', locked: false, muted: false, volume: 1 },
    { id: 'audio-1', type: 'audio', name: 'Audio Track 1', locked: false, muted: false, volume: 1 },
    { id: 'text-1', type: 'text', name: 'Text Track 1', locked: false, muted: false, volume: 1 }
  ])

  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  const totalDuration = Math.max(...clips.map(c => c.startTime + c.duration), 30)

  const handleClipDrag = useCallback((clipId: string, newStartTime: number, newTrack: number) => {
    setClips(prev => prev.map(clip => 
      clip.id === clipId 
        ? { ...clip, startTime: newStartTime, track: newTrack }
        : clip
    ))
  }, [])

  const handleClipClick = useCallback((clipId: string) => {
    setSelectedClipId(clipId)
  }, [])

  const handleAddClip = useCallback((trackId: string, time: number) => {
    const newClip: TimelineClip = {
      id: Date.now().toString(),
      type: 'video',
      title: 'New Clip',
      startTime: time,
      duration: 5,
      track: 0
    }
    setClips(prev => [...prev, newClip])
  }, [])

  const handleDeleteClip = useCallback((clipId: string) => {
    setClips(prev => prev.filter(clip => clip.id !== clipId))
    if (selectedClipId === clipId) {
      setSelectedClipId(null)
    }
  }, [selectedClipId])

  const handleSplitClip = useCallback((clipId: string, time: number) => {
    const clipToSplit = clips.find(c => c.id === clipId)
    if (!clipToSplit) return
    
    if (time <= clipToSplit.startTime || time >= clipToSplit.startTime + clipToSplit.duration) return

    const firstDuration = time - clipToSplit.startTime
    const secondDuration = clipToSplit.duration - firstDuration

    const firstPart: TimelineClip = {
      ...clipToSplit,
      id: Date.now().toString(),
      duration: firstDuration
    }

    const secondPart: TimelineClip = {
      ...clipToSplit,
      id: (Date.now() + 1).toString(),
      startTime: time,
      duration: secondDuration,
      title: `${clipToSplit.title} (Part 2)`
    }

    setClips(prev => [...prev.filter(c => c.id !== clipId), firstPart, secondPart])
  }, [clips])

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎬</span>
          <span className="font-semibold text-slate-800">Video Editor</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">
            Save
          </button>
          <button className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 flex flex-col border-r border-slate-200">
          <div className="flex-1">
            <ChatInterface />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="h-80 bg-slate-900 flex-shrink-0">
            <VideoPreview />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <TimelineEditor
              clips={clips}
              tracks={tracks}
              currentTime={currentTime}
              totalDuration={totalDuration}
              zoom={zoom}
              onClipDrag={handleClipDrag}
              onClipClick={handleClipClick}
              onTimeChange={setCurrentTime}
              onAddClip={handleAddClip}
              onDeleteClip={handleDeleteClip}
              onSplitClip={handleSplitClip}
            />
          </div>
        </div>

        <div className="w-64 flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Properties</h3>
            
            {selectedClipId ? (
              <div className="space-y-4">
                {(() => {
                  const clip = clips.find(c => c.id === selectedClipId)
                  if (!clip) return null
                  return (
                    <>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Title</label>
                        <input
                          type="text"
                          value={clip.title}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          onChange={(e) => {
                            setClips(prev => prev.map(c => 
                              c.id === selectedClipId ? { ...c, title: e.target.value } : c
                            ))
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Start Time</label>
                        <input
                          type="number"
                          value={clip.startTime}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          step={0.1}
                          onChange={(e) => {
                            setClips(prev => prev.map(c => 
                              c.id === selectedClipId ? { ...c, startTime: parseFloat(e.target.value) || 0 } : c
                            ))
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Duration</label>
                        <input
                          type="number"
                          value={clip.duration}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          step={0.1}
                          onChange={(e) => {
                            setClips(prev => prev.map(c => 
                              c.id === selectedClipId ? { ...c, duration: parseFloat(e.target.value) || 0 } : c
                            ))
                          }}
                        />
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a clip to edit properties</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
