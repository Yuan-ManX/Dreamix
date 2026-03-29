'use client'

import { useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'
import VideoPreview from '@/components/VideoPreview'
import TimelineEditor from '@/components/TimelineEditor'
import { ProjectProvider, useProject, TimelineClip, TimelineTrack } from '@/hooks/useProjectStore'

function EditorContent() {
  const {
    currentProject,
    setCurrentProject,
    clips,
    tracks,
    currentTime,
    totalDuration,
    zoom,
    selectedClipId,
    isPlaying,
    playbackRate,
    aspectRatio,
    isLoading,
    canUndo,
    canRedo,
    setCurrentTime,
    setZoom,
    setSelectedClipId,
    setIsPlaying,
    setPlaybackRate,
    setAspectRatio,
    addClip,
    updateClip,
    deleteClip,
    splitClip,
    addTrack,
    updateTrack,
    deleteTrack,
    undo,
    redo
  } = useProject()

  useEffect(() => {
    if (!currentProject) {
      const defaultTracks: TimelineTrack[] = [
        { id: 'video-1', type: 'video', name: 'Video Track 1', locked: false, muted: false, volume: 1 },
        { id: 'audio-1', type: 'audio', name: 'Audio Track 1', locked: false, muted: false, volume: 1 },
        { id: 'text-1', type: 'text', name: 'Text Track 1', locked: false, muted: false, volume: 1 }
      ]
      
      const defaultClips: TimelineClip[] = [
        {
          id: '1',
          type: 'video',
          title: 'Intro Scene',
          startTime: 0,
          duration: 5,
          thumbnail: '🎬',
          track: 0
        },
        {
          id: '2',
          type: 'image',
          title: 'Product Shot',
          startTime: 5,
          duration: 8,
          thumbnail: '🖼️',
          track: 0
        },
        {
          id: '3',
          type: 'audio',
          title: 'Background Music',
          startTime: 0,
          duration: 30,
          thumbnail: '🎵',
          track: 1
        },
        {
          id: '4',
          type: 'text',
          title: 'Title Card',
          startTime: 0,
          duration: 3,
          thumbnail: '📝',
          track: 2
        }
      ]

      setCurrentProject({
        projectId: 'default',
        name: 'Untitled Project',
        description: 'A new video project',
        width: 1920,
        height: 1080,
        fps: 30,
        tracks: defaultTracks,
        clips: defaultClips,
        transitions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalDuration: 30
      })
    }
  }, [currentProject, setCurrentProject])

  const handleClipDrag = (clipId: string, newStartTime: number, newTrack: number) => {
    updateClip(clipId, { startTime: newStartTime, track: newTrack })
  }

  const handleClipResize = (clipId: string, newDuration: number) => {
    updateClip(clipId, { duration: newDuration })
  }

  const handleAddClip = (trackId: string, time: number) => {
    const trackIndex = tracks.findIndex(t => t.id === trackId)
    const newClip: TimelineClip = {
      id: Date.now().toString(),
      type: 'video',
      title: 'New Clip',
      startTime: time,
      duration: 5,
      track: trackIndex >= 0 ? trackIndex : 0
    }
    addClip(newClip)
  }

  const handleAddTrack = (type: TimelineTrack['type']) => {
    const trackTypeNames: Record<string, string> = {
      video: 'Video Track',
      audio: 'Audio Track',
      text: 'Text Track',
      effect: 'Effect Track'
    }
    const count = tracks.filter(t => t.type === type).length + 1
    addTrack({
      id: `${type}-${Date.now()}`,
      type,
      name: `${trackTypeNames[type]} ${count}`,
      locked: false,
      muted: false,
      volume: 1
    })
  }

  const videoPreviewClips = clips.map(clip => ({
    id: clip.id,
    title: clip.title,
    duration: clip.duration,
    thumbnail: clip.thumbnail,
    type: clip.type
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!currentProject) {
    return null
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h1 className="font-semibold text-white">{currentProject.name}</h1>
            <p className="text-xs text-slate-500">{currentProject.width}x{currentProject.height} • {currentProject.fps}fps</p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3 (Standard)</option>
          </select>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
            💾 Save
          </button>
          <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20">
            🎥 Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 flex flex-col border-r border-slate-700 bg-slate-900">
          <div className="flex-1">
            <ChatInterface />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-96 bg-slate-900 flex-shrink-0 border-b border-slate-700 p-4">
            <VideoPreview
              clips={videoPreviewClips}
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
              isPlaying={isPlaying}
              onPlayPause={setIsPlaying}
              aspectRatio={aspectRatio}
              playbackRate={playbackRate}
              onPlaybackRateChange={setPlaybackRate}
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <TimelineEditor
              clips={clips}
              tracks={tracks}
              currentTime={currentTime}
              totalDuration={totalDuration}
              zoom={zoom}
              selectedClipId={selectedClipId}
              onClipDrag={handleClipDrag}
              onClipResize={handleClipResize}
              onClipClick={setSelectedClipId}
              onTimeChange={setCurrentTime}
              onAddClip={handleAddClip}
              onDeleteClip={deleteClip}
              onSplitClip={splitClip}
              onAddTrack={handleAddTrack}
              onUpdateTrack={updateTrack}
              onDeleteTrack={deleteTrack}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        </div>

        <div className="w-72 flex-shrink-0 border-l border-slate-700 bg-slate-900 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>⚙️</span> Properties
            </h3>
            
            {selectedClipId ? (
              <div className="space-y-4">
                {(() => {
                  const clip = clips.find(c => c.id === selectedClipId)
                  if (!clip) return null
                  return (
                    <>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Title</label>
                        <input
                          type="text"
                          value={clip.title}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                          onChange={(e) => updateClip(clip.id, { title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Type</label>
                        <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                          {clip.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1.5">Start Time</label>
                          <input
                            type="number"
                            value={clip.startTime}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                            step={0.1}
                            onChange={(e) => updateClip(clip.id, { startTime: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1.5">Duration</label>
                          <input
                            type="number"
                            value={clip.duration}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                            step={0.1}
                            onChange={(e) => updateClip(clip.id, { duration: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Track</label>
                        <select
                          value={clip.track}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                          onChange={(e) => updateClip(clip.id, { track: parseInt(e.target.value) })}
                        >
                          {tracks.map((track, idx) => (
                            <option key={track.id} value={idx}>{track.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-4 border-t border-slate-700">
                        <button
                          onClick={() => deleteClip(clip.id)}
                          className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                        >
                          🗑️ Delete Clip
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-sm text-slate-500">Select a clip to edit properties</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-700">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Project Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total Clips</span>
                <span className="text-white font-mono">{clips.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Tracks</span>
                <span className="text-white font-mono">{tracks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Duration</span>
                <span className="text-white font-mono">{Math.round(totalDuration)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <ProjectProvider>
      <EditorContent />
    </ProjectProvider>
  )
}
