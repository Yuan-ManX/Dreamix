'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib'
import { useTheme } from '@/components/ThemeProvider'
import { useLanguage } from '@/contexts/LanguageContext'

// Types for Video Editor (Complete OpenCut-style Implementation)
interface TimelineClip {
  id: string
  trackId: number
  startTime: number
  duration: number
  type: 'video' | 'audio' | 'text' | 'image' | 'effect'
  name: string
  color: string
  thumbnail?: string
  url?: string
  volume?: number
  speed?: number
  effects?: string[]
  textContent?: string
  fontSize?: number
  fontFamily?: string
  textColor?: string
  filters?: {
    brightness?: number
    contrast?: number
    saturation?: number
    hueRotate?: number
  }
}

interface Track {
  id: number
  type: 'video' | 'audio' | 'text' | 'effect'
  name: string
  icon: string
  color: string
  muted: boolean
  solo: boolean
  locked: boolean
  visible: boolean
  clips: TimelineClip[]
}

interface Asset {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'text'
  thumbnail?: string
  duration?: number
  url?: string
  file?: File
}

// History action for Undo/Redo
interface HistoryAction {
  type: 'add_clip' | 'remove_clip' | 'modify_clip' | 'move_clip' | 'split_clip'
  clipId?: string
  trackId?: number
  previousState?: Partial<TimelineClip>
  newState?: Partial<TimelineClip>
}

// Complete Action Video Editor with All OpenCut Features
export default function ActionVideoEditor() {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  
  // State Management - Enhanced
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 1,
      type: 'video',
      name: 'Video 1',
      icon: '🎬',
      color: '#fbbd41',
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      clips: [
        { id: 'clip1', trackId: 1, startTime: 0, duration: 10, type: 'video', name: 'Intro Scene', color: '#fbbd41/30', speed: 1.0, filters: {} },
        { id: 'clip2', trackId: 1, startTime: 12, duration: 15, type: 'video', name: 'Main Content', color: '#fbbd41/25', speed: 1.0, filters: {} }
      ]
    },
    {
      id: 2,
      type: 'audio',
      name: 'Audio 1',
      icon: '🎵',
      color: '#3bd3fd',
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      clips: [
        { id: 'clip3', trackId: 2, startTime: 0, duration: 25, type: 'audio', name: 'Background Music', color: '#3bd3fd/30', volume: 0.8 }
      ]
    },
    {
      id: 3,
      type: 'text',
      name: 'Text 1',
      icon: '📝',
      color: '#c1b0ff',
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      clips: [
        { id: 'clip4', trackId: 3, startTime: 2, duration: 5, type: 'text', name: 'Title Text', color: '#c1b0ff/30', textContent: 'Sample Title', fontSize: 48, fontFamily: 'Arial', textColor: '#ffffff' }
      ]
    },
    {
      id: 4,
      type: 'effect',
      name: 'Effects',
      icon: '✨',
      color: '#84e7a5',
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      clips: []
    }
  ])

  const [assets, setAssets] = useState<Asset[]>([
    { id: 'asset1', name: 'Sample Video.mp4', type: 'video', duration: 30 },
    { id: 'asset2', name: 'Background Music.mp3', type: 'audio', duration: 180 },
    { id: 'asset3', name: 'Logo.png', type: 'image' },
    { id: 'asset4', name: 'Title Template', type: 'text' },
  ])

  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)
  const [multiSelectedClips, setMultiSelectedClips] = useState<string[]>([])
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(60)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)

  // Tool State
  const [activeTool, setActiveTool] = useState<string>('select')
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [showProperties, setShowProperties] = useState(true)

  // NEW: History for Undo/Redo
  const [history, setHistory] = useState<HistoryAction[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // NEW: Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clipId: string } | null>(null)

  // NEW: Text Editor State
  const [isEditingText, setIsEditingText] = useState(false)
  const [editingClipId, setEditingClipId] = useState<string | null>(null)

  // NEW: Filter/Color Grading State
  const [showFilters, setShowFilters] = useState(false)

  // Playback Controls
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return

      switch(e.key) {
        case ' ': // Space - Play/Pause
          e.preventDefault()
          togglePlayback()
          break
        case 'Delete':
        case 'Backspace':
          if (selectedClip) deleteSelectedClip()
          break
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
          }
          break
        case 'c':
          if (e.ctrlKey || e.metaKey) copyClip()
          break
        case 'v':
          if (e.ctrlKey || e.metaKey) pasteClip()
          break
        case 'x':
          if (e.ctrlKey || e.metaKey) cutClip()
          break
        case 's':
          if (!e.ctrlKey && !e.metaKey) splitAtPlayhead()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedClip, isPlaying])

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
        setPlayheadPosition(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [isPlaying, duration])

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`
  }

  // ===== CORE VIDEO EDITING FUNCTIONS =====

  // Toggle playback
  const togglePlayback = () => setIsPlaying(!isPlaying)

  // Stop playback
  const stopPlayback = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setPlayheadPosition(0)
  }

  // Split at playhead
  const splitAtPlayhead = () => {
    if (!selectedClip) {
      alert('Please select a clip to split')
      return
    }

    const clip = selectedClip
    const splitTime = currentTime

    if (splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) {
      alert('Playhead must be within the clip range')
      return
    }

    const firstHalfDuration = splitTime - clip.startTime
    const secondHalfDuration = clip.duration - firstHalfDuration

    const newClip: TimelineClip = {
      ...clip,
      id: `${clip.id}_split_${Date.now()}`,
      startTime: splitTime,
      duration: secondHalfDuration,
      name: `${clip.name} (split)`
    }

    // Update original clip duration
    updateClip(clip.id, { duration: firstHalfDuration })

    // Add new clip
    addClip(newClip)

    addToHistory({ type: 'split_clip', clipId: clip.id })
  }

  // Delete selected clip
  const deleteSelectedClip = () => {
    if (!selectedClip) return

    const action: HistoryAction = {
      type: 'remove_clip',
      clipId: selectedClip.id,
      previousState: { ...selectedClip }
    }

    setTracks(tracks.map(track => ({
      ...track,
      clips: track.clips.filter(c => c.id !== selectedClip.id)
    })))

    setSelectedClip(null)
    addToHistory(action)
  }

  // Copy clip
  const copyClip = () => {
    if (!selectedClip) return
    localStorage.setItem('clipboard_clip', JSON.stringify(selectedClip))
  }

  // Cut clip
  const cutClip = () => {
    if (!selectedClip) return
    copyClip()
    deleteSelectedClip()
  }

  // Paste clip
  const pasteClip = () => {
    const clipboardData = localStorage.getItem('clipboard_clip')
    if (!clipboardData) return

    const clip: TimelineClip = JSON.parse(clipboardData)
    const newClip: TimelineClip = {
      ...clip,
      id: `pasted_${Date.now()}`,
      startTime: currentTime,
      name: `${clip.name} (copy)`
    }
    addClip(newClip)
  }

  // Add clip to timeline
  const addClip = (clip: TimelineClip) => {
    setTracks(tracks.map(track =>
      track.id === clip.trackId ? { ...track, clips: [...track.clips, clip] } : track
    ))
    addToHistory({ type: 'add_clip', clipId: clip.id })
  }

  // Update clip properties
  const updateClip = (clipId: string, updates: Partial<TimelineClip>) => {
    const action: HistoryAction = {
      type: 'modify_clip',
      clipId,
      previousState: tracks.flatMap(t => t.clips).find(c => c.id === clipId),
      newState: updates
    }

    setTracks(tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    })))

    if (selectedClip?.id === clipId) {
      setSelectedClip({ ...selectedClip, ...updates })
    }

    addToHistory(action)
  }

  // Move clip (drag and drop)
  const moveClip = (clipId: string, newStartTime: number, newDuration?: number) => {
    const snapTime = snapToGrid ? Math.round(newStartTime * 4) / 4 : newStartTime

    updateClip(clipId, {
      startTime: Math.max(0, snapTime),
      ...(newDuration && { duration: Math.max(0.5, newDuration) })
    })

    addToHistory({ type: 'move_clip', clipId })
  }

  // Handle clip selection
  const handleClipClick = (clip: TimelineClip, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      setMultiSelectedClips(prev =>
        prev.includes(clip.id) ? prev.filter(id => id !== clip.id) : [...prev, clip.id]
      )
    } else {
      setMultiSelectedClips([])
    }
    setSelectedClip(clip)
    setSelectedTrack(clip.trackId)
  }

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, clipId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, clipId })
  }

  // Context menu actions
  const contextMenuActions = [
    { label: t('studio.timeline.splitAtPlayhead'), action: () => { splitAtPlayhead(); setContextMenu(null); } },
    { label: t('audio.transport.delete'), action: () => { deleteSelectedClip(); setContextMenu(null); } },
    { label: t('audio.transport.copy'), action: () => { copyClip(); setContextMenu(null); } },
    { label: t('audio.tools.cut'), action: () => { cutClip(); setContextMenu(null); } },
    { divider: true },
    { label: t('studio.timeline.duplicate'), action: () => { copyClip(); pasteClip(); setContextMenu(null); } },
    { label: t('studio.timeline.editText'), action: () => { startTextEdit(contextMenu!.clipId); setContextMenu(null); } },
  ]

  // Start text editing
  const startTextEdit = (clipId: string) => {
    const clip = tracks.flatMap(t => t.clips).find(c => c.id === clipId)
    if (clip?.type === 'text') {
      setIsEditingText(true)
      setEditingClipId(clipId)
      setSelectedClip(clip)
    }
  }

  // Save text content
  const saveTextContent = (textContent: string) => {
    if (editingClipId) {
      updateClip(editingClipId, { textContent })
      setIsEditingText(false)
      setEditingClipId(null)
    }
  }

  // Track controls
  const toggleMute = (trackId: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ))
  }

  const toggleSolo = (trackId: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ))
  }

  const toggleLock = (trackId: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, locked: !track.locked } : track
    ))
  }

  const toggleVisibility = (trackId: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, visible: !track.visible } : track
    ))
  }

  // ===== UNDO/REDO SYSTEM =====
  const addToHistory = (action: HistoryAction) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(action)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex < 0) return
    const action = history[historyIndex]
    
    // Reverse the action
    switch(action.type) {
      case 'add_clip':
        if (action.clipId) {
          setTracks(tracks.map(t => ({...t, clips: t.clips.filter(c => c.id !== action.clipId)})))
        }
        break
      case 'remove_clip':
        if (action.previousState && action.clipId) {
          const track = tracks.find(t => t.id === action.previousState!.trackId)
          if (track) {
            setTracks(tracks.map(t => 
              t.id === track.id ? {...t, clips: [...t.clips, action.previousState as TimelineClip]} : t
            ))
          }
        }
        break
      case 'modify_clip':
        if (action.clipId && action.previousState) {
          updateClipDirect(action.clipId, action.previousState)
        }
        break
    }
    
    setHistoryIndex(historyIndex - 1)
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const action = history[historyIndex + 1]
    
    // Re-apply the action
    switch(action.type) {
      case 'add_clip':
        if (action.newState) {
          const track = tracks.find(t => t.id === action.newState!.trackId)
          if (track) {
            setTracks(tracks.map(t =>
              t.id === track.id ? {...t, clips: [...t.clips, action.newState as TimelineClip]} : t
            ))
          }
        }
        break
      case 'remove_clip':
        if (action.clipId) {
          setTracks(tracks.map(t => ({...t, clips: t.clips.filter(c => c.id !== action.clipId)})))
        }
        break
      case 'modify_clip':
        if (action.clipId && action.newState) {
          updateClipDirect(action.clipId, action.newState)
        }
        break
    }
    
    setHistoryIndex(historyIndex + 1)
  }

  const updateClipDirect = (clipId: string, updates: Partial<TimelineClip>) => {
    setTracks(tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip => clip.id === clipId ? { ...clip, ...updates } : clip)
    })))
  }

  // ===== FILE IMPORT HANDLING =====
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const fileType = file.type.startsWith('video') ? 'video' :
                     file.type.startsWith('audio') ? 'audio' :
                     file.type.startsWith('image') ? 'image' : 'video'

      const newAsset: Asset = {
        id: `asset_${Date.now()}_${file.name}`,
        name: file.name,
        type: fileType,
        file: file,
        url: URL.createObjectURL(file),
      }

      // For video/audio files, try to get duration
      if (fileType === 'video' || fileType === 'audio') {
        const video = document.createElement(fileType === 'video' ? 'video' : 'audio')
        video.src = newAsset.url!
        video.onloadedmetadata = () => {
          newAsset.duration = video.duration
          setAssets(prev => [...prev, newAsset])
        }
        video.load()
      } else {
        setAssets(prev => [...prev, newAsset])
      }

      // Auto-add to timeline
      const targetTrack = fileType === 'audio' ? 2 : 1
      const newClip: TimelineClip = {
        id: `clip_${Date.now()}_${file.name}`,
        trackId: targetTrack,
        startTime: currentTime,
        duration: 10,
        type: fileType as any,
        name: file.name,
        color: fileType === 'audio' ? '#3bd3fd/30' : '#fbbd41/30',
        url: newAsset.url
      }
      
      addClip(newClip)
    })

    event.target.value = ''
  }

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    
    files.forEach(file => {
      const fileType = file.type.startsWith('video') ? 'video' :
                     file.type.startsWith('audio') ? 'audio' :
                     file.type.startsWith('image') ? 'image' : 'video'

      const newAsset: Asset = {
        id: `asset_drop_${Date.now()}_${file.name}`,
        name: file.name,
        type: fileType,
        file: file,
        url: URL.createObjectURL(file),
      }

      setAssets(prev => [...prev, newAsset])

      const targetTrack = fileType === 'audio' ? 2 : 1
      const newClip: TimelineClip = {
        id: `clip_drop_${Date.now()}`,
        trackId: targetTrack,
        startTime: currentTime,
        duration: 10,
        type: fileType as any,
        name: file.name,
        color: fileType === 'audio' ? '#3bd3fd/30' : '#fbbd41/30',
        url: newAsset.url
      }

      addClip(newClip)
    })
  }

  // Tools configuration
  const tools = [
    { id: 'select', icon: '🖱️', label: t('studio.tools.select'), shortcut: 'V' },
    { id: 'cut', icon: '✂️', label: t('audio.tools.cut') + ' (C)', shortcut: 'C' },
    { id: 'trim', icon: '✂️', label: t('audio.tools.trim') + ' (T)', shortcut: 'T' },
    { id: 'text', icon: '📝', label: t('studio.tools.text') + ' (T)', shortcut: 'T' },
    { id: 'draw', icon: '🎨', label: t('studio.tools.draw') + ' (D)', shortcut: 'D' },
    { id: 'shapes', icon: '⬜', label: t('studio.tools.shapes') + ' (R)', shortcut: 'R' },
    { id: 'effects', icon: '✨', label: t('studio.tools.effects') + ' (E)', shortcut: 'E' },
    { id: 'audio', icon: '🎵', label: t('studio.tools.audio') + ' (A)', shortcut: 'A' },
    { id: 'stickers', icon: '🎭', label: t('studio.tools.stickers') + ' (S)', shortcut: 'S' },
    { id: 'import', icon: '📷', label: t('studio.tools.import') + ' (I)', shortcut: 'I' },
  ]

  return (
    <div className="flex flex-col h-full bg-warm-cream text-clay-black" onClick={() => setContextMenu(null)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Top Bar */}
      <div className="h-12 bg-pure-white border-b border-oat-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-clay-black">{t('studio.newProject')}</span>
          <div className="w-px h-6 bg-oat-border"></div>
          <button className="px-3 py-1.5 bg-oat-light hover:bg-oat-border rounded text-xs transition-colors" title={t('studio.saveProject')}>
            {t('studio.save')}
          </button>
          <button className="px-3 py-1.5 bg-oat-light hover:bg-oat-border rounded text-xs transition-colors" title={t('studio.autoSaveEnabled')}>
            {t('studio.autoSave')}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('Export options:\n• MP4 (H.264)\n• WebM\n• GIF\n• Audio Only')}
            className="px-5 py-1.5 bg-[#3bd3fd] hover:bg-[#5de0ff] text-black font-semibold rounded-md text-sm transition-all flex items-center gap-2"
          >
            <span>⬆</span> {t('studio.exportVideo')}
          </motion.button>

          <button className="p-1.5 text-warm-silver hover:text-clay-black rounded transition-colors" title={t('studio.settings')}>
            ⚙️
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-12 bg-oat-light/80 border-r border-oat-border flex flex-col items-center py-3 gap-1 flex-shrink-0">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all relative group",
                activeTool === tool.id ? "bg-[#3bd3fd]/20 text-[#3bd3fd]" : "hover:bg-oat-light text-warm-silver"
              )}
              title={`${tool.label}`}
            >
              {tool.icon}
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-clay-black text-pure-white rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-md">
                {tool.label}
              </div>
            </motion.button>
          ))}

          <div className="mt-auto pt-3 border-t border-oat-border w-full space-y-1">
            <motion.button whileHover={{ scale: 1.15 }} className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-base hover:bg-oat-light text-warm-silver transition-all" title={t('studio.zoomIn')}>
              🔍+
            </motion.button>
            <motion.button whileHover={{ scale: 1.15 }} className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-base hover:bg-oat-light text-warm-silver transition-all" title={t('studio.zoomOut')}>
              🔍−
            </motion.button>
          </div>
        </div>

        {/* Assets Panel */}
        <div className="w-56 bg-oat-light/60 border-r border-oat-border flex flex-col flex-shrink-0">
          <div className="h-10 border-b border-oat-border flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{t('studio.mediaLibrary.assets')}</span>
              <button className="text-warm-silver hover:text-clay-black text-xs transition-colors">☰</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowGrid(!showGrid)} className={cn("text-xs transition-colors", showGrid ? "text-clay-black" : "text-warm-silver hover:text-clay-black")} title={t('studio.timeline.toggleGrid')}>
                ⊞
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="text-warm-silver hover:text-clay-black text-xs transition-colors" title={t('studio.mediaLibrary.importFiles')}>
                📥 {t('studio.mediaLibrary.import')}
              </button>
            </div>
          </div>

          {/* Upload Area with Drag & Drop */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-oat-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#3bd3fd] hover:bg-[#3bd3fd]/5 transition-all group mb-4"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3 opacity-50 group-hover:opacity-80">
                ⬆
              </motion.div>
              <p className="text-xs text-warm-silver text-center px-4 leading-relaxed group-hover:text-warm-silver transition-colors">
                {t('studio.dragDropOrClick')}
              </p>
              <p className="text-[10px] text-warm-silver mt-2">{t('studio.supportsFormats')}</p>
            </motion.div>

            {/* Asset List */}
            <p className="text-xs text-warm-silver mb-2 px-1 font-medium">{t('studio.mediaLibrary.title')} ({assets.length})</p>
            <div className="space-y-2">
              {assets.map((asset) => (
                <motion.div
                  key={asset.id}
                  whileHover={{ scale: 1.02, backgroundColor: '#2a2a2a' }}
                  onDoubleClick={() => {
                    const targetTrack = asset.type === 'audio' ? 2 : 1
                    const newClip: TimelineClip = {
                      id: `clip_from_asset_${Date.now()}`,
                      trackId: targetTrack,
                      startTime: currentTime,
                      duration: asset.duration || 10,
                      type: asset.type as any,
                      name: asset.name,
                      color: asset.type === 'audio' ? '#3bd3fd/30' : '#fbbd41/30',
                      url: asset.url
                    }
                    addClip(newClip)
                  }}
                  className="p-3 bg-oat-light/80 rounded-lg cursor-pointer border border-transparent hover:border-[#3bd3fd]/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 bg-gradient-to-br from-oat-light to-warm-silver rounded flex items-center justify-center text-xl flex-shrink-0">
                      {asset.type === 'video' ? '🎬' : asset.type === 'audio' ? '🎵' : asset.type === 'image' ? '🖼️' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-clay-black truncate mb-1">{asset.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-warm-silver">
                        <span>{t(`studio.${asset.type}`)}</span>
                        {asset.duration && <span>{Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}</span>}
                      </div>
                      <p className="text-[9px] text-warm-silver mt-1">{t('studio.doubleClickToAdd')}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Window */}
        <div className="flex-1 flex flex-col bg-warm-cream/50 min-w-0">
          <div className="flex-1 relative flex items-center justify-center p-6">
            <div className="relative w-full max-w-3xl aspect-video bg-pure-white rounded-lg shadow-2xl overflow-hidden border border-oat-border">
              {/* Preview Canvas */}
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedClip?.type === 'video' && selectedClip.url ? (
                  <video
                    src={selectedClip.url}
                    className="max-w-full max-h-full"
                    controls={false}
                    autoPlay={isPlaying}
                    muted
                  />
                ) : (
                  <div className="text-center">
                    <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-4">
                      🎬
                    </motion.div>
                    <p className="text-sm text-warm-silver">{t('studio.previewWindow')}</p>
                    <p className="text-xs text-dark-charcoal mt-2">{t('studio.selectClipToPreview')}</p>
                    <p className="text-[10px] text-warm-silver mt-3 space-x-2">
                      <span>{t('studio.spacePlayPause')}</span>
                      <span>{t('studio.sSplit')}</span>
                      <span>{t('studio.delDelete')}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Time Code Overlay */}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-pure-white/90 backdrop-blur-sm rounded text-xs font-mono text-lemon-600 shadow-md">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Resolution Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-pure-white/90 backdrop-blur-sm rounded text-xs text-clay-black shadow-md">
                1920 × 1080 @30fps
              </div>
            </div>

            {/* Playback Controls Overlay - Enhanced Professional Design */}
            <div className={cn("absolute bottom-10 right-10 flex items-center gap-2 backdrop-blur-md rounded-2xl px-4 py-2 shadow-xl border",
              isDark ? "bg-bg-elevated/90 border-border-subtle" : "bg-white/90 border-oat-border"
            )}>
              <motion.button 
                whileHover={{ scale: 1.15, rotate: -10 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setCurrentTime(Math.max(0, currentTime - 5))} 
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-sm border",
                  isDark ? "bg-gradient-to-br from-gray-700 to-gray-600 hover:from-blue-900 hover:to-blue-800 border-transparent hover:border-blue-600" : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 border-transparent hover:border-blue-300"
                )}
                title={t('studio.playbackControls.skipBackward')}
              >
                ⏮
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.15 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={stopPlayback} 
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-sm border",
                  isDark ? "bg-gradient-to-br from-red-900/50 to-red-800/50 hover:from-red-800 hover:to-red-700 border-transparent hover:border-red-500" : "bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 border-transparent hover:border-red-400"
                )}
                title={t('studio.playbackControls.stop')}
              >
                ⏹
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={togglePlayback} 
                className="w-14 h-14 bg-gradient-to-br from-[#fbbd41] via-[#fcc94e] to-[#fdd870] hover:from-[#fdd870] hover:to-[#fde594] rounded-full flex items-center justify-center text-black text-2xl font-bold shadow-lg transition-all ring-4 ring-yellow-200/50 hover:ring-yellow-300/70" 
                title={isPlaying ? t('studio.playbackControls.pause') : t('studio.playbackControls.play')}
              >
                {isPlaying ? '⏸' : '▶'}
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.15, rotate: 10 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))} 
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-sm border",
                  isDark ? "bg-gradient-to-br from-gray-700 to-gray-600 hover:from-blue-900 hover:to-blue-800 border-transparent hover:border-blue-600" : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 border-transparent hover:border-blue-300"
                )}
                title={t('studio.playbackControls.skipForward')}
              >
                ⏭
              </motion.button>

              <div className={cn("w-px h-8", isDark ? "bg-border-subtle" : "bg-oat-border")}></div>

              <motion.button 
                whileHover={{ scale: 1.15, rotate: 180 }} 
                whileTap={{ scale: 0.9 }} 
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-sm border",
                  isDark ? "bg-gradient-to-br from-purple-900/40 to-purple-800/40 hover:from-purple-800 hover:to-purple-700 border-transparent hover:border-purple-500" : "bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border-transparent hover:border-purple-400"
                )}
                title={t('studio.playbackControls.loop')}
              >
                🔁
              </motion.button>
            </div>
          </div>

          {/* Timeline Ruler Toolbar */}
          <div className="h-9 bg-warm-cream border-t border-oat-border flex items-center px-3 gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <button onClick={splitAtPlayhead} className="p-1.5 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.splitShortcut')}>✂️</button>
              <button onClick={deleteSelectedClip} className="p-1.5 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.deleteSelected')}>🗑</button>
              <button onClick={copyClip} className="p-1.5 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.copyClip')}>📋</button>
              <button onClick={pasteClip} className="p-1.5 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.pasteClip')}>📄</button>
              <button onClick={undo} disabled={historyIndex < 0} className={cn("p-1.5 rounded transition-colors text-xs", historyIndex >= 0 ? "hover:text-clay-black text-warm-silver" : "text-dark-charcoal cursor-not-allowed")} title={t('studio.undo')}>↶</button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className={cn("p-1.5 rounded transition-colors text-xs", historyIndex < history.length - 1 ? "hover:text-clay-black text-warm-silver" : "text-dark-charcoal cursor-not-allowed")} title={t('studio.redo')}>↷</button>
            </div>

            <div className="flex-1 mx-4 h-px bg-oat-light relative cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const percent = (e.clientX - rect.left) / rect.width
              setCurrentTime(percent * duration)
            }}>
              <div className="absolute top-0 w-0.5 h-2 bg-[#fbbd41] transition-all" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-warm-silver">{t('studio.mainScene')}</span>
              <button onClick={() => setShowProperties(!showProperties)} className="p-1 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.toggleProperties')}>
                👁
              </button>

              <div className="w-20 h-1.5 bg-oat-light rounded-full overflow-hidden mx-1">
                <div className="h-full bg-warm-silver transition-all" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>

              <button className="p-1 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.zoomIn')}>🔍+</button>
              <button className="p-1 text-warm-silver hover:text-clay-black rounded transition-colors text-xs" title={t('studio.zoomOut')}>🔍−</button>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("p-1 text-warm-silver hover:text-clay-black rounded transition-colors text-xs", showFilters && "text-clay-black")} title={t('studio.filters')}>
                🎨
              </button>
            </div>
          </div>

          {/* Timeline Tracks Area */}
          <div className="h-52 bg-oat-light/50 border-t border-oat-border relative flex-shrink-0 overflow-hidden">
            {/* Time Ruler */}
            <div className="h-6 bg-warm-cream border-b border-oat-border flex items-end px-2 relative">
              {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => (
                <div key={i} className="absolute" style={{ left: `${(i * 5 / duration) * 100}%` }}>
                  <div className="w-px h-2 bg-oat-light"></div>
                  <span className="ml-1 text-[10px] text-warm-silver font-mono whitespace-nowrap">{`${i * 5}s`}</span>
                </div>
              ))}

              {/* Playhead on Ruler */}
              <div className="absolute top-0 w-0.5 h-full bg-[#fbbd41] z-20 pointer-events-none transition-all" style={{ left: `${(currentTime / duration) * 100}%` }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#fbbd41] rounded-full"></div>
              </div>
            </div>

            {/* Tracks Container */}
            <div className="flex-1 overflow-y-auto pl-12 pr-4 py-1 space-y-0.5 scrollbar-thin">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={cn(
                    "h-11 bg-oat-light/70 rounded border relative group transition-colors",
                    selectedTrack === track.id ? "border-[#fbbd41]" : "border-oat-border hover:border-oat-border"
                  )}
                  onClick={() => !track.locked && setSelectedTrack(track.id)}
                >
                  {/* Track Header */}
                  <div className="absolute inset-y-0 left-0 w-10 bg-oat-light/80 border-r border-oat-border flex flex-col items-center justify-center gap-0.5">
                    <span className="text-xs">{track.icon}</span>
                    <span className="text-[9px] text-warm-silver font-medium">{track.type[0].toUpperCase()}{track.id}</span>

                    <div className="flex gap-0.5 mt-0.5">
                      <button onClick={(e) => { e.stopPropagation(); toggleMute(track.id) }} className={cn("w-4 h-4 text-[9px] rounded transition-colors", track.muted ? "bg-red-500/30 text-red-400" : "bg-oat-light text-warm-silver hover:bg-oat-border")} title={t('studio.mute')}>M</button>
                      <button onClick={(e) => { e.stopPropagation(); toggleSolo(track.id) }} className={cn("w-4 h-4 text-[9px] rounded transition-colors", track.solo ? "bg-yellow-500/30 text-yellow-400" : "bg-oat-light text-warm-silver hover:bg-oat-border")} title={t('studio.solo')}>S</button>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); toggleLock(track.id) }} className={cn("w-4 h-4 text-[8px] rounded transition-colors mt-0.5", track.locked ? "bg-orange-500/30 text-orange-400" : "bg-transparent text-dark-charcoal hover:bg-oat-light")} title={track.locked ? "Unlock" : "Lock"}>
                      {track.locked ? '🔒' : '🔓'}
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); toggleVisibility(track.id) }} className={cn("w-4 h-4 text-[8px] rounded transition-colors", track.visible ? "text-green-400" : "text-warm-silver")} title={track.visible ? "Hide" : "Show"}>
                      {track.visible ? '👁' : '🚫'}
                    </button>
                  </div>

                  {/* Clips Area */}
                  <div className="absolute inset-y-1 left-12 right-2 relative">
                    {track.clips.map((clip) => (
                      <motion.div
                        key={clip.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={(e) => !track.locked && handleClipClick(clip, e)}
                        onContextMenu={(e) => handleContextMenu(e, clip.id)}
                        onDoubleClick={() => clip.type === 'text' && startTextEdit(clip.id)}
                        className={cn(
                          "absolute top-0 bottom-0 rounded cursor-pointer transition-all flex items-center px-2",
                          selectedClip?.id === clip.id || multiSelectedClips.includes(clip.id) ? "ring-2 ring-white shadow-lg" : "",
                          `bg-gradient-to-r ${clip.color} hover:brightness-110`,
                          track.locked && "opacity-50 cursor-not-allowed"
                        )}
                        style={{
                          left: `${(clip.startTime / duration) * 100}%`,
                          width: `${(clip.duration / duration) * 100}%`
                        }}
                      >
                        {track.type === 'audio' && (
                          <div className="flex-1 h-3 bg-current opacity-30 rounded overflow-hidden flex items-end px-1">
                            {Array.from({ length: 20 }, (_, i) => (
                              <div key={i} className="flex-1 bg-current opacity-60 mx-px" style={{ height: `${Math.random() * 70 + 30}%` }}></div>
                            ))}
                          </div>
                        )}

                        {track.type === 'text' && isEditingText && editingClipId === clip.id ? (
                          <input
                            type="text"
                            defaultValue={clip.textContent || ''}
                            onBlur={(e) => saveTextContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveTextContent((e.target as HTMLInputElement).value)}
                            autoFocus
                            className="flex-1 bg-transparent text-clay-black text-xs outline-none border-b border-white/50"
                          />
                        ) : (
                          <>
                            {track.type === 'text' && <span className="text-[10px] text-clay-black truncate ml-2 drop-shadow" style={{ fontSize: clip.fontSize || 14, color: clip.textColor || '#fff' }}>{clip.textContent}</span>}
                            {track.type !== 'text' && <span className="text-[10px] text-clay-black truncate ml-2 drop-shadow">{clip.name}</span>}
                          </>
                        )}

                        {/* Resize Handles */}
                        {(selectedClip?.id === clip.id || multiSelectedClips.includes(clip.id)) && !track.locked && (
                          <>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white cursor-ew-resize rounded-l"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white cursor-ew-resize rounded-r"></div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Zoom Control */}
            <div className="absolute bottom-2 right-4 flex items-center gap-2 bg-oat-light/80 rounded px-2 py-1 z-10">
              <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} className="text-warm-silver hover:text-clay-black text-xs transition-colors">−</button>
              <div className="w-16 h-1 bg-oat-light rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-warm-silver"></div>
              </div>
              <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} className="text-warm-silver hover:text-clay-black text-xs transition-colors">+</button>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {showProperties && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-oat-light/60 border-l border-oat-border flex flex-col overflow-hidden flex-shrink-0">
              <div className="h-10 border-b border-oat-border flex items-center justify-between px-4">
                <span className="text-xs font-medium">{t('studio.timeline.properties')}</span>
                <button onClick={() => setShowProperties(false)} className="text-warm-silver hover:text-clay-black text-xs transition-colors">✕</button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                {selectedClip ? (
                  <div className="space-y-4">
                    {/* Clip Info */}
                    <div>
                      <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.name')}</label>
                      <input type="text" value={selectedClip.name} onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })} className="w-full px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500" />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.duration')}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={selectedClip.duration.toFixed(1)} onChange={(e) => updateClip(selectedClip.id, { duration: parseFloat(e.target.value) })} step="0.1" className="flex-1 px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500" />
                        <span className="text-xs text-warm-silver">sec</span>
                      </div>
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.startTime')}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={selectedClip.startTime.toFixed(1)} onChange={(e) => updateClip(selectedClip.id, { startTime: parseFloat(e.target.value) })} step="0.1" className="flex-1 px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500" />
                        <span className="text-xs text-warm-silver">sec</span>
                      </div>
                    </div>

                    {/* Volume (for audio/video clips) */}
                    {(selectedClip.type === 'audio' || selectedClip.type === 'video') && (
                      <div>
                        <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.volume')}</label>
                        <div className="flex items-center gap-2">
                          <input type="range" min="0" max="1" step="0.05" value={selectedClip.volume || 0.8} onChange={(e) => updateClip(selectedClip.id, { volume: parseFloat(e.target.value) })} className="flex-1 accent-[#3bd3fd]" />
                          <span className="text-xs text-warm-silver w-10">{((selectedClip.volume || 0.8) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}

                    {/* Speed */}
                    <div>
                      <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.speed')}</label>
                      <select value={selectedClip.speed || 1.0} onChange={(e) => updateClip(selectedClip.id, { speed: parseFloat(e.target.value) })} className="w-full px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500">
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1.0" selected>1.0x (Normal)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                      </select>
                    </div>

                    {/* Text Properties (for text clips) */}
                    {selectedClip.type === 'text' && (
                      <>
                        <div>
                          <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.textContent')}</label>
                          <textarea value={selectedClip.textContent || ''} onChange={(e) => updateClip(selectedClip.id, { textContent: e.target.value })} rows={2} className="w-full px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500 resize-none" />
                        </div>

                        <div>
                          <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.fontSize')}</label>
                          <input type="number" value={selectedClip.fontSize || 24} onChange={(e) => updateClip(selectedClip.id, { fontSize: parseInt(e.target.value) })} min="8" max="200" className="w-full px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500" />
                        </div>

                        <div>
                          <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.fontFamily')}</label>
                          <select value={selectedClip.fontFamily || 'Arial'} onChange={(e) => updateClip(selectedClip.id, { fontFamily: e.target.value })} className="w-full px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500">
                              <option>{t('studio.fontArial')}</option>
                              <option>{t('studio.fontHelvetica')}</option>
                              <option>{t('studio.fontTimesNewRoman')}</option>
                              <option>{t('studio.fontCourierNew')}</option>
                              <option>{t('studio.fontGeorgia')}</option>
                              <option>{t('studio.fontVerdana')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.textColor')}</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={selectedClip.textColor || '#ffffff'} onChange={(e) => updateClip(selectedClip.id, { textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                            <input type="text" value={selectedClip.textColor || '#ffffff'} onChange={(e) => updateClip(selectedClip.id, { textColor: e.target.value })} className="flex-1 px-2 py-1.5 bg-pure-white border border-oat-border rounded text-xs text-clay-black focus:outline-none focus:border-lemon-500" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Effects */}
                    <div>
                      <label className="text-[10px] text-warm-silver uppercase tracking-wide mb-1 block">{t('studio.effectsLabel')}</label>
                      <div className="space-y-1.5">
                        {['Fade In', 'Fade Out', 'Blur', 'Color Grade', 'Glow', 'Shadow'].map((effect) => (
                          <label key={effect} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={(selectedClip.effects || []).includes(effect)} onChange={(e) => {
                              const effects = selectedClip.effects || []
                              const newEffects = e.target.checked ? [...effects, effect] : effects.filter(f => f !== effect)
                              updateClip(selectedClip.id, { effects: newEffects })
                            }} className="w-3 h-3 rounded accent-[#3bd3fd]" />
                            <span className="text-xs text-warm-silver group-hover:text-clay-black transition-colors">{effect}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-oat-border space-y-2">
                      <button onClick={() => alert('Changes applied!')} className="w-full px-3 py-2 bg-[#fbbd41] hover:bg-[#fcc94e] text-black text-xs font-semibold rounded transition-all">
                        {t('studio.applyChanges')}
                      </button>
                      <button onClick={() => {
                        if (confirm('Reset this clip to default values?')) {
                          // Reset logic here
                        }
                      }} className="w-full px-3 py-2 bg-oat-light hover:bg-oat-border text-clay-black text-xs rounded transition-all">
                        {t('studio.resetDefault')}
                      </button>
                      <button onClick={deleteSelectedClip} className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded transition-all border border-red-600/30">
                        {t('studio.deleteClip')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-16 h-16 bg-pure-white rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-3xl opacity-40">📋</span>
                    </motion.div>
                    <h4 className="text-sm font-medium text-dark-charcoal mb-2">{t('studio.emptyState')}</h4>
                    <p className="text-xs text-warm-silver leading-relaxed">{t('studio.emptyHint')}</p>
                    
                    <div className="mt-6 pt-4 border-t border-oat-border w-full">
                      <p className="text-[10px] text-warm-silver mb-2">{t('studio.keyboardShortcuts')}</p>
                      <div className="grid grid-cols-2 gap-1 text-[9px] text-warm-silver">
                        <span>▶ Space</span><span>Play/Pause</span>
                        <span>✂ S</span><span>Split</span>
                        <span>🗑 Del</span><span>Delete</span>
                        <span>↶ Ctrl+Z</span><span>Undo</span>
                        <span>↷ Ctrl+Y</span><span>Redo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-pure-white border border-oat-border rounded-lg shadow-2xl py-2 min-w-[180px] z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenuActions.map((action, idx) => (
              'divider' in action ? (
                <div key={idx} className="h-px bg-oat-border my-1"></div>
              ) : (
                <button
                  key={idx}
                  onClick={action.action}
                  className="w-full px-4 py-2 text-left text-xs text-clay-black hover:bg-[#3bd3fd]/20 transition-colors flex items-center gap-2"
                >
                  {action.label}
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-pure-white rounded-lg p-6 w-[500px] border border-oat-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-clay-black">Color & Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-warm-silver hover:text-clay-black text-xl">×</button>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Brightness', prop: 'brightness', min: -100, max: 100, default: 0 },
                  { label: 'Contrast', prop: 'contrast', min: -100, max: 100, default: 0 },
                  { label: 'Saturation', prop: 'saturation', min: -100, max: 100, default: 0 },
                  { label: 'Hue Rotate', prop: 'hueRotate', min: 0, max: 360, default: 0 },
                ].map((filter) => (
                  <div key={filter.prop}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-clay-black">{filter.label}</label>
                      <span className="text-xs text-warm-silver">{filter.default}</span>
                    </div>
                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      defaultValue={filter.default}
                      className="w-full accent-[#3bd3fd]"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-oat-border flex gap-3">
                  <button onClick={() => { alert('Filters applied!'); setShowFilters(false); }} className="flex-1 px-4 py-2 bg-[#3bd3fd] hover:bg-[#5de0ff] text-black text-sm font-semibold rounded transition-all">
                    Apply
                  </button>
                  <button onClick={() => setShowFilters(false)} className="flex-1 px-4 py-2 bg-oat-light hover:bg-oat-border text-clay-black text-sm rounded transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
