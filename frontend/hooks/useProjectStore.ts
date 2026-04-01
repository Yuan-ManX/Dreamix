'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react'

const STORAGE_KEY = 'action_projects'
const CURRENT_PROJECT_KEY = 'action_current_project_id'

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
  totalDuration?: number
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
  volume: number
  isMuted: boolean
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
  setVolume: (volume: number) => void
  setIsMuted: (muted: boolean) => void
  addClip: (clip: TimelineClip) => void
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void
  deleteClip: (clipId: string) => void
  splitClip: (clipId: string, splitTime: number) => void
  copyClip: (clipId: string, newStartTime?: number) => void
  mergeClips: (clipIds: string[]) => void
  trimClip: (clipId: string, trimStart: number, trimEnd: number) => void
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
  createNewProject: (name?: string, description?: string) => VideoProject
}

const ProjectContext = createContext<(ProjectState & ProjectActions) | undefined>(undefined)

const MAX_HISTORY_SIZE = 50

const loadFromStorage = (): { projects: VideoProject[], currentProjectId: string | null } => {
  if (typeof window === 'undefined') return { projects: [], currentProjectId: null }
  try {
    const projectsData = localStorage.getItem(STORAGE_KEY)
    const currentId = localStorage.getItem(CURRENT_PROJECT_KEY)
    return {
      projects: projectsData ? JSON.parse(projectsData) : [],
      currentProjectId: currentId
    }
  } catch {
    return { projects: [], currentProjectId: null }
  }
}

const saveToStorage = (projects: VideoProject[], currentProjectId: string | null) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    if (currentProjectId) {
      localStorage.setItem(CURRENT_PROJECT_KEY, currentProjectId)
    }
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectState>({
    currentProject: null,
    projects: [],
    isLoading: true,
    currentTime: 0,
    zoom: 1,
    selectedClipId: null,
    history: [],
    historyIndex: -1,
    isPlaying: false,
    playbackRate: 1,
    aspectRatio: '16:9',
    volume: 80,
    isMuted: false
  })

  useEffect(() => {
    const { projects, currentProjectId } = loadFromStorage()
    const currentProject = currentProjectId 
      ? projects.find(p => p.projectId === currentProjectId) || null
      : null
    
    setState(prev => ({
      ...prev,
      projects,
      currentProject,
      isLoading: false
    }))
  }, [])

  useEffect(() => {
    if (state.isLoading) return
    
    let updatedProjects = [...state.projects]
    if (state.currentProject) {
      const existingIndex = updatedProjects.findIndex(p => p.projectId === state.currentProject.projectId)
      if (existingIndex >= 0) {
        updatedProjects[existingIndex] = state.currentProject
      } else {
        updatedProjects.push(state.currentProject)
      }
    }
    
    saveToStorage(updatedProjects, state.currentProject?.projectId || null)
  }, [state.currentProject, state.projects, state.isLoading])

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
      const projectToSave = JSON.parse(JSON.stringify(prev.currentProject))
      newHistory.push(projectToSave)
      
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift()
      }
      
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
        currentProject: project ? JSON.parse(JSON.stringify(project)) : null,
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
        currentProject: project ? JSON.parse(JSON.stringify(project)) : null,
        historyIndex: newIndex
      }
    })
  }, [state.historyIndex, state.history.length])

  const createNewProject = useCallback((name: string = 'Untitled Project', description: string = 'A new video project'): VideoProject => {
    const defaultTracks: TimelineTrack[] = [
      { id: 'video-1', type: 'video', name: 'Video Track 1', locked: false, muted: false, volume: 1 },
      { id: 'audio-1', type: 'audio', name: 'Audio Track 1', locked: false, muted: false, volume: 1 },
      { id: 'text-1', type: 'text', name: 'Text Track 1', locked: false, muted: false, volume: 1 }
    ]
    
    const newProject: VideoProject = {
      projectId: Date.now().toString(),
      name,
      description,
      width: 1920,
      height: 1080,
      fps: 30,
      tracks: defaultTracks,
      clips: [],
      transitions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalDuration: 0
    }
    
    return newProject
  }, [])

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

  const copyClip = useCallback((clipId: string, newStartTime?: number) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      
      const originalClip = prev.currentProject.clips.find(c => c.id === clipId)
      if (!originalClip) return prev
      
      const copiedClip: TimelineClip = {
        ...originalClip,
        id: Date.now().toString(),
        title: `${originalClip.title} (Copy)`,
        startTime: newStartTime !== undefined ? newStartTime : originalClip.startTime + originalClip.duration
      }
      
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: [...prev.currentProject.clips, copiedClip],
          updatedAt: new Date().toISOString()
        },
        selectedClipId: copiedClip.id
      }
    })
  }, [saveState])

  const mergeClips = useCallback((clipIds: string[]) => {
    if (clipIds.length < 2) return
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      
      const clipsToMerge = prev.currentProject.clips
        .filter(c => clipIds.includes(c.id))
        .sort((a, b) => a.startTime - b.startTime)
      
      if (clipsToMerge.length < 2) return prev
      
      const firstClip = clipsToMerge[0]
      const lastClip = clipsToMerge[clipsToMerge.length - 1]
      
      const mergedClip: TimelineClip = {
        ...firstClip,
        id: Date.now().toString(),
        duration: (lastClip.startTime + lastClip.duration) - firstClip.startTime,
        title: `${firstClip.title} (Merged)`
      }
      
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: [
            ...prev.currentProject.clips.filter(c => !clipIds.includes(c.id)),
            mergedClip
          ],
          updatedAt: new Date().toISOString()
        },
        selectedClipId: mergedClip.id
      }
    })
  }, [saveState])

  const trimClip = useCallback((clipId: string, trimStart: number = 0, trimEnd: number = 0) => {
    saveState()
    setState(prev => {
      if (!prev.currentProject) return prev
      
      const clip = prev.currentProject.clips.find(c => c.id === clipId)
      if (!clip) return prev
      
      const newStartTime = clip.startTime + trimStart
      const newDuration = clip.duration - trimStart - trimEnd
      
      if (newDuration <= 0) return prev
      
      return {
        ...prev,
        currentProject: {
          ...prev.currentProject,
          clips: prev.currentProject.clips.map(c =>
            c.id === clipId
              ? { ...c, startTime: newStartTime, duration: newDuration }
              : c
          ),
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

  const value = {
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
    setVolume: (volume) => setState(prev => ({ ...prev, volume })),
    setIsMuted: (muted) => setState(prev => ({ ...prev, isMuted: muted })),
    addClip,
    updateClip,
    deleteClip,
    splitClip,
    copyClip,
    mergeClips,
    trimClip,
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
    totalDuration,
    createNewProject
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
