'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'

export interface TimelineClip {
  id: string
  type: 'video' | 'audio' | 'image' | 'text'
  title: string
  startTime: number
  duration: number
  thumbnail?: string
  color?: string
  track: number
  mediaPath?: string
  properties?: Record<string, any>
  effects?: any[]
}

export interface TimelineTrack {
  id: string
  type: 'video' | 'audio' | 'text' | 'effect'
  name: string
  locked: boolean
  muted: boolean
  volume: number
}

export interface VideoProject {
  projectId: string
  name: string
  description: string
  width: number
  height: number
  fps: number
  tracks: TimelineTrack[]
  clips: TimelineClip[]
  transitions: any[]
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  currentProject: VideoProject | null
  projects: VideoProject[]
  isLoading: boolean
  currentTime: number
  zoom: number
  selectedClipId: string | null
  history: VideoProject[]
  historyIndex: number
  isPlaying: boolean
  playbackRate: number
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3'
}

interface ProjectActions {
  setCurrentProject: (project: VideoProject | null) => void
  setProjects: (projects: VideoProject[]) => void
  setIsLoading: (loading: boolean) => void
  setCurrentTime: (time: number) => void
  setZoom: (zoom: number) => void
  setSelectedClipId: (clipId: string | null) => void
  setIsPlaying: (playing: boolean) => void
  setPlaybackRate: (rate: number) => void
  setAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '4:3') => void
  addClip: (clip: TimelineClip) => void
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void
  deleteClip: (clipId: string) => void
  splitClip: (clipId: string, splitTime: number) => void
  addTrack: (track: TimelineTrack) => void
  updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => void
  deleteTrack: (trackId: string) => void
  saveState: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clips: TimelineClip[]
  tracks: TimelineTrack[]
  totalDuration: number
}

const ProjectContext = createContext<(ProjectState & ProjectActions) | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectState>({
    currentProject: null,
    projects: [],
    isLoading: false,
    currentTime: 0,
    zoom: 1,
    selectedClipId: null,
    history: [],
    historyIndex: -1,
    isPlaying: false,
    playbackRate: 1,
    aspectRatio: '16:9'
  })

  const clips = useMemo(() => state.currentProject?.clips || [], [state.currentProject?.clips])
  const tracks = useMemo(() => state.currentProject?.tracks || [], [state.currentProject?.tracks])
  const totalDuration = useMemo(() => {
    if (!state.currentProject?.clips.length) return 0
    return Math.max(...state.currentProject.clips.map(c => c.startTime + c.duration))
  }, [state.currentProject?.clips])

  const saveState = useCallback(() => {
    if (!state.currentProject) return
    
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1)
      newHistory.push(JSON.parse(JSON.stringify(prev.currentProject)))
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    })
  }, [state.currentProject])

  const undo = useCallback(() => {
    if (state.historyIndex <= 0) return
    
    setState(prev => {
      const newIndex = prev.historyIndex - 1
      const project = prev.history[newIndex]
      return {
        ...prev,
        currentProject: project,
        historyIndex: newIndex
      }
    })
  }, [state.historyIndex])

  const redo = useCallback(() => {
    if (state.historyIndex >= state.history.length - 1) return
    
    setState(prev => {
      const newIndex = prev.historyIndex + 1
      const project = prev.history[newIndex]
      return {
        ...prev,
        currentProject: project,
        historyIndex: newIndex
      }
    })
  }, [state.historyIndex, state.history.length])

  const addClip = useCallback((clip: TimelineClip) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: [...prev.currentProject.clips, clip],
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [saveState])

  const updateClip = useCallback((clipId: string, updates: Partial<TimelineClip>) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: prev.currentProject.clips.map(clip =>
            clip.id === clipId ? { ...clip, ...updates } : clip
          ),
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [saveState])

  const deleteClip = useCallback((clipId: string) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: prev.currentProject.clips.filter(clip => clip.id !== clipId),
          updatedAt: new Date().toISOString()
        },
        selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId
      }
    })
  }, [saveState])

  const splitClip = useCallback((clipId: string, splitTime: number) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      
      const clipToSplit = prev.currentProject.clips.find(c => c.id === clipId)
      if (!clipToSplit) return prev
      
      if (splitTime <= clipToSplit.startTime || splitTime >= clipToSplit.startTime + clipToSplit.duration) {
        return prev
      }
      
      const firstDuration = splitTime - clipToSplit.startTime
      const secondDuration = clipToSplit.duration - firstDuration
      
      const firstPart: TimelineClip = {
        ...clipToSplit,
        id: Date.now().toString(),
        duration: firstDuration,
        title: `${clipToSplit.title} (Part 1)`
      }
      
      const secondPart: TimelineClip = {
        ...clipToSplit,
        id: (Date.now() + 1).toString(),
        startTime: splitTime,
        duration: secondDuration,
        title: `${clipToSplit.title} (Part 2)`
      }
      
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: [
            ...prev.currentProject.clips.filter(c => c.id !== clipId),
            firstPart,
            secondPart
          ],
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [saveState])

  const addTrack = useCallback((track: TimelineTrack) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          tracks: [...prev.currentProject.tracks, track],
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [saveState])

  const updateTrack = useCallback((trackId: string, updates: Partial<TimelineTrack>) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          tracks: prev.currentProject.tracks.map(track =>
            track.id === trackId ? { ...track, ...updates } : track
          ),
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [saveState])

  const deleteTrack = useCallback((trackId: string) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      const trackIndex = prev.currentProject.tracks.findIndex(t => t.id === trackId)
      if (trackIndex === -1) return prev
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          tracks: prev.currentProject.tracks.filter(track => track.id !== trackId),
          clips: prev.currentProject.clips.filter(clip => clip.track !== trackIndex),
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [saveState])

  const value: ProjectState & ProjectActions = {
    ...state,
    setCurrentProject: (project) => setState(prev => ({ ...prev, currentProject: project })),
    setProjects: (projects) => setState(prev => ({ ...prev, projects })),
    setIsLoading: (loading) => setState(prev => ({ ...prev, isLoading: loading })),
    setCurrentTime: (time) => setState(prev => ({ ...prev, currentTime: time })),
    setZoom: (zoom) => setState(prev => ({ ...prev, zoom })),
    setSelectedClipId: (clipId) => setState(prev => ({ ...prev, selectedClipId: clipId })),
    setIsPlaying: (playing) => setState(prev => ({ ...prev, isPlaying: playing })),
    setPlaybackRate: (rate) => setState(prev => ({ ...prev, playbackRate: rate })),
    setAspectRatio: (ratio) => setState(prev => ({ ...prev, aspectRatio: ratio })),
    addClip,
    updateClip,
    deleteClip,
    splitClip,
    addTrack,
    updateTrack,
    deleteTrack,
    saveState,
    undo,
    redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    clips,
    tracks,
    totalDuration
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
