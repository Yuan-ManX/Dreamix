import { create } from 'zustand'
import { 
  VideoProject, 
  TimelineClip, 
  TimelineTrack, 
  Transition,
  generateId,
  storageGet,
  storageSet
} from '@/lib'

const STORAGE_KEY = 'action_projects'
const CURRENT_PROJECT_KEY = 'action_current_project_id'
const MAX_HISTORY_SIZE = 50

interface ProjectState {
  projects: VideoProject[]
  currentProjectId: string | null
  isLoading: boolean
  
  currentTime: number
  zoom: number
  selectedClipId: string | null
  isPlaying: boolean
  playbackRate: number
  volume: number
  isMuted: boolean
  
  history: VideoProject[]
  historyIndex: number
}

interface ProjectActions {
  loadProjects: () => void
  saveProjects: () => void
  
  createProject: (name?: string, description?: string) => VideoProject
  setCurrentProject: (projectId: string | null) => void
  updateProject: (updates: Partial<VideoProject>) => void
  deleteProject: (projectId: string) => void
  duplicateProject: (projectId: string) => VideoProject
  
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
  
  addTransition: (transition: Transition) => void
  removeTransition: (transitionId: string) => void
  
  setCurrentTime: (time: number) => void
  setZoom: (zoom: number) => void
  setSelectedClipId: (clipId: string | null) => void
  setIsPlaying: (playing: boolean) => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  setIsMuted: (muted: boolean) => void
  
  saveState: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  
  getCurrentProject: () => VideoProject | null
  getTotalDuration: () => number
  getClips: () => TimelineClip[]
  getTracks: () => TimelineTrack[]
}

const createDefaultTracks = (): TimelineTrack[] => [
  { id: 'video-1', type: 'video', name: 'Video Track 1', locked: false, muted: false, volume: 1 },
  { id: 'audio-1', type: 'audio', name: 'Audio Track 1', locked: false, muted: false, volume: 1 },
  { id: 'text-1', type: 'text', name: 'Text Track 1', locked: false, muted: false, volume: 1 }
]

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
  projects: [],
  currentProjectId: null,
  isLoading: true,
  
  currentTime: 0,
  zoom: 1,
  selectedClipId: null,
  isPlaying: false,
  playbackRate: 1,
  volume: 80,
  isMuted: false,
  
  history: [],
  historyIndex: -1,
  
  loadProjects: () => {
    const projects = storageGet<VideoProject[]>(STORAGE_KEY, [])
    const currentProjectId = storageGet<string | null>(CURRENT_PROJECT_KEY, null)
    set({ projects, currentProjectId, isLoading: false })
  },
  
  saveProjects: () => {
    const { projects, currentProjectId } = get()
    storageSet(STORAGE_KEY, projects)
    if (currentProjectId) {
      storageSet(CURRENT_PROJECT_KEY, currentProjectId)
    }
  },
  
  createProject: (name = 'Untitled Project', description = 'A new video project') => {
    const newProject: VideoProject = {
      projectId: generateId(),
      name,
      description,
      width: 1920,
      height: 1080,
      fps: 30,
      aspectRatio: '16:9',
      tracks: createDefaultTracks(),
      clips: [],
      transitions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalDuration: 0
    }
    
    set((state) => ({
      projects: [...state.projects, newProject],
      currentProjectId: newProject.projectId,
      history: [],
      historyIndex: -1
    }))
    
    get().saveProjects()
    return newProject
  },
  
  setCurrentProject: (projectId) => {
    set({ currentProjectId: projectId, history: [], historyIndex: -1 })
    get().saveProjects()
  },
  
  updateProject: (updates) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = { ...currentProject, ...updates, updatedAt: new Date().toISOString() }
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  deleteProject: (projectId) => {
    set((state) => ({
      projects: state.projects.filter(p => p.projectId !== projectId),
      currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
    }))
    get().saveProjects()
  },
  
  duplicateProject: (projectId) => {
    const original = get().projects.find(p => p.projectId === projectId)
    if (!original) throw new Error('Project not found')
    
    const duplicated: VideoProject = {
      ...original,
      projectId: generateId(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    set((state) => ({ projects: [...state.projects, duplicated] }))
    get().saveProjects()
    return duplicated
  },
  
  addClip: (clip) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        clips: [...currentProject.clips, clip],
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  updateClip: (clipId, updates) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        clips: currentProject.clips.map(clip => clip.id === clipId ? { ...clip, ...updates } : clip),
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  deleteClip: (clipId) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        clips: currentProject.clips.filter(clip => clip.id !== clipId),
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p),
        selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId
      }
    })
    get().saveProjects()
  },
  
  splitClip: (clipId, splitTime) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const clipToSplit = currentProject.clips.find(c => c.id === clipId)
      if (!clipToSplit) return state
      if (splitTime <= clipToSplit.startTime || splitTime >= clipToSplit.startTime + clipToSplit.duration) return state
      
      const firstDuration = splitTime - clipToSplit.startTime
      const secondDuration = clipToSplit.duration - firstDuration
      
      const firstPart: TimelineClip = {
        ...clipToSplit,
        id: generateId(),
        duration: firstDuration,
        title: `${clipToSplit.title} (Part 1)`
      }
      
      const secondPart: TimelineClip = {
        ...clipToSplit,
        id: generateId(),
        startTime: splitTime,
        duration: secondDuration,
        title: `${clipToSplit.title} (Part 2)`
      }
      
      const updatedProject = {
        ...currentProject,
        clips: [
          ...currentProject.clips.filter(c => c.id !== clipId),
          firstPart,
          secondPart
        ],
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  copyClip: (clipId, newStartTime) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const originalClip = currentProject.clips.find(c => c.id === clipId)
      if (!originalClip) return state
      
      const copiedClip: TimelineClip = {
        ...originalClip,
        id: generateId(),
        title: `${originalClip.title} (Copy)`,
        startTime: newStartTime !== undefined ? newStartTime : originalClip.startTime + originalClip.duration
      }
      
      const updatedProject = {
        ...currentProject,
        clips: [...currentProject.clips, copiedClip],
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p),
        selectedClipId: copiedClip.id
      }
    })
    get().saveProjects()
  },
  
  mergeClips: (clipIds) => {
    if (clipIds.length < 2) return
    
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const clipsToMerge = currentProject.clips
        .filter(c => clipIds.includes(c.id))
        .sort((a, b) => a.startTime - b.startTime)
      
      if (clipsToMerge.length < 2) return state
      
      const firstClip = clipsToMerge[0]
      const lastClip = clipsToMerge[clipsToMerge.length - 1]
      
      const mergedClip: TimelineClip = {
        ...firstClip,
        id: generateId(),
        duration: (lastClip.startTime + lastClip.duration) - firstClip.startTime,
        title: `${firstClip.title} (Merged)`
      }
      
      const updatedProject = {
        ...currentProject,
        clips: [
          ...currentProject.clips.filter(c => !clipIds.includes(c.id)),
          mergedClip
        ],
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p),
        selectedClipId: mergedClip.id
      }
    })
    get().saveProjects()
  },
  
  trimClip: (clipId, trimStart, trimEnd) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const clip = currentProject.clips.find(c => c.id === clipId)
      if (!clip) return state
      
      const newStartTime = clip.startTime + trimStart
      const newDuration = clip.duration - trimStart - trimEnd
      
      if (newDuration <= 0) return state
      
      const updatedProject = {
        ...currentProject,
        clips: currentProject.clips.map(c =>
          c.id === clipId ? { ...c, startTime: newStartTime, duration: newDuration } : c
        ),
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  addTrack: (track) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        tracks: [...currentProject.tracks, track],
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  updateTrack: (trackId, updates) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        tracks: currentProject.tracks.map(track => track.id === trackId ? { ...track, ...updates } : track),
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  deleteTrack: (trackId) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const trackIndex = currentProject.tracks.findIndex(t => t.id === trackId)
      if (trackIndex === -1) return state
      
      const updatedProject = {
        ...currentProject,
        tracks: currentProject.tracks.filter(track => track.id !== trackId),
        clips: currentProject.clips.filter(clip => clip.track !== trackIndex),
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  addTransition: (transition) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        transitions: [...currentProject.transitions, transition],
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  removeTransition: (transitionId) => {
    get().saveState()
    set((state) => {
      const currentProject = state.projects.find(p => p.projectId === state.currentProjectId)
      if (!currentProject) return state
      
      const updatedProject = {
        ...currentProject,
        transitions: currentProject.transitions.filter(t => t.id !== transitionId),
        updatedAt: new Date().toISOString()
      }
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? updatedProject : p)
      }
    })
    get().saveProjects()
  },
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedClipId: (clipId) => set({ selectedClipId: clipId }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  
  saveState: () => {
    const { currentProjectId, projects, history, historyIndex } = get()
    const currentProject = projects.find(p => p.projectId === currentProjectId)
    if (!currentProject) return
    
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      const projectToSave = JSON.parse(JSON.stringify(currentProject))
      newHistory.push(projectToSave)
      
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift()
      }
      
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    })
  },
  
  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    
    set((state) => {
      const newIndex = state.historyIndex - 1
      const project = state.history[newIndex]
      if (!project) return state
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? JSON.parse(JSON.stringify(project)) : p),
        historyIndex: newIndex
      }
    })
  },
  
  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    
    set((state) => {
      const newIndex = state.historyIndex + 1
      const project = state.history[newIndex]
      if (!project) return state
      
      return {
        projects: state.projects.map(p => p.projectId === state.currentProjectId ? JSON.parse(JSON.stringify(project)) : p),
        historyIndex: newIndex
      }
    })
  },
  
  get canUndo() {
    return get().historyIndex > 0
  },
  
  get canRedo() {
    return get().historyIndex < get().history.length - 1
  },
  
  getCurrentProject: () => {
    const { projects, currentProjectId } = get()
    return projects.find(p => p.projectId === currentProjectId) || null
  },
  
  getTotalDuration: () => {
    const currentProject = get().getCurrentProject()
    if (!currentProject?.clips.length) return 0
    return Math.max(...currentProject.clips.map(c => c.startTime + c.duration))
  },
  
  getClips: () => {
    return get().getCurrentProject()?.clips || []
  },
  
  getTracks: () => {
    return get().getCurrentProject()?.tracks || []
  }
}))
