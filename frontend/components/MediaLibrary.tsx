'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn, generateId, formatFileSize, formatDuration } from '@/lib'
import { MediaAsset } from '@/types'

interface MediaLibraryProps {
  onSelectMedia?: (media: MediaAsset) => void
  onAddToTimeline?: (media: MediaAsset) => void
}

const SAMPLE_MEDIA: MediaAsset[] = [
  {
    id: generateId(),
    name: 'Intro_Video.mp4',
    type: 'video',
    filePath: '/sample/intro.mp4',
    thumbnailPath: '/sample/intro-thumb.jpg',
    duration: 15.5,
    size: 24500000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['intro', 'video', 'sample']
  },
  {
    id: generateId(),
    name: 'Background_Music.mp3',
    type: 'audio',
    filePath: '/sample/bg-music.mp3',
    duration: 120.0,
    size: 8200000,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tags: ['music', 'background']
  },
  {
    id: generateId(),
    name: 'Product_Image.jpg',
    type: 'image',
    filePath: '/sample/product.jpg',
    size: 3500000,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    tags: ['product', 'image']
  },
  {
    id: generateId(),
    name: 'Transition_Scene.mp4',
    type: 'video',
    filePath: '/sample/transition.mp4',
    duration: 8.0,
    size: 12800000,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    tags: ['transition', 'video']
  }
]

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'image' | 'video' | 'audio'

export default function MediaLibrary({ onSelectMedia, onAddToTimeline }: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaAsset[]>(SAMPLE_MEDIA)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredMedia = media.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesSearch
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const newMedia: MediaAsset = {
        id: generateId(),
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : 
              file.type.startsWith('video') ? 'video' : 'audio',
        filePath: URL.createObjectURL(file),
        size: file.size,
        createdAt: new Date().toISOString(),
        tags: ['new']
      }
      setMedia(prev => [...prev, newMedia])
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || [])
    files.forEach(file => {
      const newMedia: MediaAsset = {
        id: generateId(),
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : 
              file.type.startsWith('video') ? 'video' : 'audio',
        filePath: URL.createObjectURL(file),
        size: file.size,
        createdAt: new Date().toISOString(),
        tags: ['uploaded']
      }
      setMedia(prev => [...prev, newMedia])
    })
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const deleteSelected = () => {
    setMedia(prev => prev.filter(item => !selectedItems.includes(item.id))
    setSelectedItems([])
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎬'
      case 'audio': return '🎵'
      case 'image': return '🖼️'
      default: return '📦'
    }
  }

  const getMediaColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-purple-600 to-purple-500'
      case 'audio': return 'from-green-600 to-green-500'
      case 'image': return 'from-blue-600 to-blue-500'
      default: return 'from-gray-600 to-gray-500'
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span>📁</span>
            Media Library
          </h2>
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium flex items-center gap-2"
              >
                🗑️ Delete Selected ({selectedItems.length})
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all text-sm font-medium flex items-center gap-2"
            >
              <span>📤</span>
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            {(['all', 'image', 'video', 'audio'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  filterType === type
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-purple-600/20 border-2 border-dashed border-purple-500 rounded-2xl flex items-center justify-center z-10 m-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📥</div>
              <p className="text-white text-xl font-medium">Drop files here to upload</p>
            </div>
          </div>
        )}

        {filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-white text-lg font-medium mb-2">No media found</h3>
            <p className="text-slate-400 mb-6">Upload or drag and drop files to get started</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all font-medium"
            >
              Upload Files
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                  selectedItems.includes(item.id)
                    ? 'border-purple-500'
                    : 'border-slate-700 hover:border-slate-600'
                )}
                onClick={() => toggleSelectItem(item.id)}
              >
                <div className={cn(
                  "aspect-video bg-gradient-to-br flex items-center justify-center",
                  getMediaColor(item.type)
                )}>
                  <span className="text-5xl">{getMediaIcon(item.type)}</span>
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded">
                      <span className="text-white text-xs font-mono">{formatDuration(item.duration)}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-800">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-500 text-xs">{formatFileSize(item.size)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectMedia?.(item)
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                        title="Preview"
                      >
                        👁️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddToTimeline?.(item)
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                        title="Add to Timeline"
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                  selectedItems.includes(item.id)
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                )}
                onClick={() => toggleSelectItem(item.id)}
              >
                <div className={cn(
                  "w-20 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                  getMediaColor(item.type)
                )}>
                  <span className="text-2xl">{getMediaIcon(item.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-500 text-xs">{formatFileSize(item.size)}</span>
                    {item.duration && (
                      <span className="text-slate-500 text-xs">{formatDuration(item.duration)}</span>
                    )}
                    <div className="flex items-center gap-1">
                      {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectMedia?.(item)
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Preview"
                  >
                    👁️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToTimeline?.(item)
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Add to Timeline"
                  >
                    ➕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
