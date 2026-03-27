'use client'

import { useState } from 'react'

interface MediaItem {
  id: string
  title: string
  type: 'image' | 'video' | 'audio'
  thumbnail: string
  duration?: string
  tags: string[]
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([
    {
      id: '1',
      title: 'Sunset',
      type: 'image',
      thumbnail: '🌅',
      tags: ['nature', 'sunset']
    },
    {
      id: '2',
      title: 'City Walk',
      type: 'video',
      thumbnail: '🏙️',
      duration: '15s',
      tags: ['urban', 'city']
    },
    {
      id: '3',
      title: 'Background Music',
      type: 'audio',
      thumbnail: '🎵',
      duration: '3m',
      tags: ['music', 'calm']
    }
  ])

  const [filterType, setFilterType] = useState<string>('all')

  const filteredMedia = filterType === 'all'
    ? media
    : media.filter(item => item.type === filterType)

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Media Library</h1>
            <p className="text-slate-600">Organize and manage your media assets</p>
          </div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
            + Upload
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          {['all', 'image', 'video', 'audio'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-5xl">{item.thumbnail}</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-slate-800 truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{item.type}</span>
                  {item.duration && (
                    <span className="text-xs text-slate-400">{item.duration}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
