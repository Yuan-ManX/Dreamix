'use client'

import { useState } from 'react'
import { cn } from '@/lib'

interface ToolbarItem {
  id: string
  icon: string
  label: string
}

const toolbarItems: ToolbarItem[] = [
  { id: 'media', icon: '📁', label: 'Assets' },
  { id: 'audio', icon: '🎵', label: 'Audio' },
  { id: 'text', icon: '📝', label: 'Text' },
  { id: 'effects', icon: '✨', label: 'Effects' },
  { id: 'elements', icon: '🎨', label: 'Elements' },
  { id: 'transitions', icon: '🔄', label: 'Transitions' },
]

interface AssetItem {
  id: string
  name: string
  type: 'image' | 'video' | 'audio'
  thumbnail?: string
  duration?: string
}

const sampleAssets: AssetItem[] = [
  { id: '1', name: 'Sunset Scene', type: 'image', thumbnail: '🌅' },
  { id: '2', name: 'City Walkthrough', type: 'video', thumbnail: '🏙️', duration: '0:15' },
  { id: '3', name: 'Ambient Music', type: 'audio', thumbnail: '🎵', duration: '3:20' },
  { id: '4', name: 'Product Shot', type: 'image', thumbnail: '📷' },
  { id: '5', name: 'Intro Video', type: 'video', thumbnail: '🎬', duration: '0:08' },
  { id: '6', name: 'Sound Effects', type: 'audio', thumbnail: '🔊', duration: '0:45' },
]

export default function StudioLeftPanel() {
  const [activeTab, setActiveTab] = useState('media')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssets = sampleAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️'
      case 'video': return '🎬'
      case 'audio': return '🎵'
      default: return '📦'
    }
  }

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-purple-600 to-purple-500'
      case 'audio': return 'from-green-600 to-green-500'
      case 'image': return 'from-blue-600 to-blue-500'
      default: return 'from-gray-600 to-gray-500'
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <div className="flex border-b border-[#2a2a2a]">
        {toolbarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center py-3 border-b-2 transition-all",
              activeTab === item.id
                ? "border-blue-500 bg-[#252525] text-white"
                : "border-transparent text-[#888888] hover:text-white hover:bg-[#202020]"
            )}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs truncate px-1">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'media' && (
          <>
            <div className="p-3 border-b border-[#2a2a2a]">
              <div className="flex gap-2 mb-3">
                <button className="flex-1 py-2 px-3 bg-[#2a2a2a] text-[#888888] hover:bg-[#333333] hover:text-white rounded transition-colors text-sm">
                  📤
                </button>
                <button className="flex-1 py-2 px-3 bg-[#2a2a2a] text-[#888888] hover:bg-[#333333] hover:text-white rounded transition-colors text-sm">
                  🗂️
                </button>
                <button className="flex-1 py-2 px-3 bg-[#2a2a2a] text-[#888888] hover:bg-[#333333] hover:text-white rounded transition-colors text-sm">
                  ⬇️
                </button>
                <button className="flex-1 py-2 px-3 bg-[#2a2a2a] text-[#888888] hover:bg-[#333333] hover:text-white rounded transition-colors text-sm">
                  📥
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] border border-[#333333] rounded text-sm text-white placeholder-[#666666] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center mb-4">
                <div className="text-3xl mb-2">⬆️</div>
                <p className="text-[#888888] text-xs">
                  Drag and drop videos, photos, and audio files here
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group bg-[#252525] rounded-lg overflow-hidden cursor-pointer hover:bg-[#303030] transition-colors"
                  >
                    <div className={cn(
                      "aspect-video bg-gradient-to-br flex items-center justify-center relative",
                      getAssetColor(asset.type)
                    )}>
                      <span className="text-3xl">{asset.thumbnail || getAssetIcon(asset.type)}</span>
                      {asset.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded">
                          <span className="text-[10px] text-white font-mono">{asset.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-[#cccccc] truncate">{asset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'text' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-[#888888] text-sm">Text elements coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-[#888888] text-sm">Effects coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎨</div>
              <p className="text-[#888888] text-sm">Elements coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'transitions' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-[#888888] text-sm">Transitions coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-[#888888] text-sm">Audio library coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
