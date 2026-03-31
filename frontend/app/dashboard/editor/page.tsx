'use client'

import { useEffect, useCallback, useMemo } from 'react'
import ChatInterface from '@/components/ChatInterface'
import VideoPreview from '@/components/VideoPreview'
import TimelineEditor from '@/components/TimelineEditor'
import { ProjectProvider, useProject, TimelineClip, TimelineTrack } from '@/hooks/useProjectStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function EditorContent() {
  const {
    currentProject,
    setCurrentProject,
    createNewProject,
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
    volume,
    isMuted,
    setCurrentTime,
    setZoom,
    setSelectedClipId,
    setIsPlaying,
    setPlaybackRate,
    setAspectRatio,
    setVolume,
    setIsMuted,
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

  const shortcuts = useMemo(() => [
    {
      key: ' ',
      preventDefault: true,
      description: 'Play/Pause',
      handler: () => setIsPlaying(!isPlaying)
    },
    {
      key: 'z',
      ctrl: true,
      meta: true,
      preventDefault: true,
      description: 'Undo',
      handler: () => canUndo && undo()
    },
    {
      key: 'z',
      ctrl: true,
      meta: true,
      shift: true,
      preventDefault: true,
      description: 'Redo',
      handler: () => canRedo && redo()
    },
    {
      key: 'y',
      ctrl: true,
      meta: true,
      preventDefault: true,
      description: 'Redo (alternative)',
      handler: () => canRedo && redo()
    },
    {
      key: 'ArrowLeft',
      preventDefault: true,
      description: 'Move back 1 second',
      handler: () => setCurrentTime(Math.max(0, currentTime - 1))
    },
    {
      key: 'ArrowRight',
      preventDefault: true,
      description: 'Move forward 1 second',
      handler: () => setCurrentTime(Math.min(totalDuration, currentTime + 1))
    },
    {
      key: 'ArrowLeft',
      shift: true,
      preventDefault: true,
      description: 'Move back 5 seconds',
      handler: () => setCurrentTime(Math.max(0, currentTime - 5))
    },
    {
      key: 'ArrowRight',
      shift: true,
      preventDefault: true,
      description: 'Move forward 5 seconds',
      handler: () => setCurrentTime(Math.min(totalDuration, currentTime + 5))
    },
    {
      key: 'Delete',
      preventDefault: true,
      description: 'Delete selected clip',
      handler: () => selectedClipId && deleteClip(selectedClipId)
    },
    {
      key: 'Backspace',
      preventDefault: true,
      description: 'Delete selected clip',
      handler: () => selectedClipId && deleteClip(selectedClipId)
    },
    {
      key: 'm',
      preventDefault: true,
      description: 'Mute/Unmute',
      handler: () => setIsMuted(!isMuted)
    },
    {
      key: '+',
      ctrl: true,
      meta: true,
      preventDefault: true,
      description: 'Zoom in',
      handler: () => setZoom(Math.min(4, zoom + 0.25))
    },
    {
      key: '-',
      ctrl: true,
      meta: true,
      preventDefault: true,
      description: 'Zoom out',
      handler: () => setZoom(Math.max(0.25, zoom - 0.25))
    },
    {
      key: 'Home',
      preventDefault: true,
      description: 'Go to start',
      handler: () => setCurrentTime(0)
    },
    {
      key: 'End',
      preventDefault: true,
      description: 'Go to end',
      handler: () => setCurrentTime(totalDuration)
    }
  ], [isPlaying, canUndo, canRedo, currentTime, totalDuration, selectedClipId, isMuted, zoom, undo, redo, deleteClip, setIsPlaying, setCurrentTime, setIsMuted, setZoom])

  useKeyboardShortcuts(shortcuts)

  useEffect(() => {
    if (!currentProject) {
      const project = createNewProject('My First Project', 'A new video project')
      
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
        ...project,
        clips: defaultClips
      })
    }
  }, [currentProject, setCurrentProject, createNewProject])

  const handleClipDrag = useCallback((clipId: string, newStartTime: number, newTrack: number) => {
    updateClip(clipId, { startTime: newStartTime, track: newTrack })
  }, [updateClip])

  const handleClipResize = useCallback((clipId: string, newDuration: number) => {
    updateClip(clipId, { duration: newDuration })
  }, [updateClip])

  const handleAddClip = useCallback((trackId: string, time: number) => {
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
  }, [tracks, addClip])

  const handleAddTrack = useCallback((type: TimelineTrack['type']) => {
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
  }, [tracks, addTrack])

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
      <div className="h-16 bg-slate-900 border-b border-slate-700 flex items-center px-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎬</span>
          <div>
            <h1 className="font-semibold text-white text-lg">{currentProject.name}</h1>
            <p className="text-xs text-slate-500">{currentProject.width}x{currentProject.height} • {currentProject.fps}fps</p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="bg-slate-800 text-white text-sm px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3 (Standard)</option>
          </select>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2">
            💾 Save
          </button>
          <button className="px-5 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2">
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
          <div className="h-[420px] bg-slate-900 flex-shrink-0 border-b border-slate-700 p-4">
            <VideoPreview
              clips={videoPreviewClips}
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
              isPlaying={isPlaying}
              onPlayPause={setIsPlaying}
              aspectRatio={aspectRatio}
              volume={volume}
              onVolumeChange={setVolume}
              isMuted={isMuted}
              onMuteChange={setIsMuted}
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
              onZoomChange={setZoom}
            />
          </div>
        </div>

        <div className="w-80 flex-shrink-0 border-l border-slate-700 bg-slate-900 overflow-y-auto">
          <div className="p-5">
            <h3 className="font-semibold text-white mb-5 flex items-center gap-2 text-lg">
              <span>⚙️</span>
              Properties
            </h3>
            
            {selectedClipId ? (
              <div className="space-y-5">
                {(() => {
                  const clip = clips.find(c => c.id === selectedClipId)
                  if (!clip) return null
                  return (
                    <>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Title</label>
                        <input
                          type="text"
                          value={clip.title}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          onChange={(e) => updateClip(clip.id, { title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Type</label>
                        <div className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 font-medium">
                          {clip.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-2 font-medium">Start Time</label>
                          <input
                            type="number"
                            value={clip.startTime}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            step={0.1}
                            onChange={(e) => updateClip(clip.id, { startTime: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2 font-medium">Duration</label>
                          <input
                            type="number"
                            value={clip.duration}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            step={0.1}
                            onChange={(e) => updateClip(clip.id, { duration: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">Track</label>
                        <select
                          value={clip.track}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          onChange={(e) => updateClip(clip.id, { track: parseInt(e.target.value) })}
                        >
                          {tracks.map((track, idx) => (
                            <option key={track.id} value={idx}>{track.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-5 border-t border-slate-700">
                        <button
                          onClick={() => deleteClip(clip.id)}
                          className="w-full px-4 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          🗑️ Delete Clip
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-sm text-slate-500">Select a clip to edit properties</p>
              </div>
            )}
          </div>
          
          <div className="p-5 border-t border-slate-700">
            <h3 className="font-semibold text-white mb-5 flex items-center gap-2 text-lg">
              <span>📊</span>
              Project Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 text-sm font-medium">Total Clips</span>
                <span className="text-white font-mono text-lg">{clips.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 text-sm font-medium">Tracks</span>
                <span className="text-white font-mono text-lg">{tracks.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 text-sm font-medium">Duration</span>
                <span className="text-white font-mono text-lg">{Math.round(totalDuration)}s</span>
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
