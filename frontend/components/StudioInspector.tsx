'use client'

import { useProjectStore } from '@/stores/projectStore'

export default function StudioInspector() {
  const { selectedClipId, getClips, updateClip } = useProjectStore()
  const clips = getClips()
  const selectedClip = clips.find(c => c.id === selectedClipId)

  if (!selectedClip) {
    return (
      <div className="flex flex-col h-full bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-30">🎚️</div>
            <p className="text-[#888888] text-sm">It's empty here</p>
            <p className="text-[#666666] text-xs mt-1">Click an element on the timeline to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-[#cccccc] text-sm font-medium mb-3">Clip Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Title</label>
              <input
                type="text"
                value={selectedClip.title}
                onChange={(e) => updateClip(selectedClip.id, { title: e.target.value })}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Type</label>
              <div className="px-3 py-2 bg-[#252525] border border-[#333333] rounded text-sm text-[#cccccc]">
                {selectedClip.type.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#888888] text-xs mb-1.5">Start Time</label>
                <input
                  type="number"
                  value={selectedClip.startTime}
                  onChange={(e) => updateClip(selectedClip.id, { startTime: parseFloat(e.target.value) || 0 })}
                  step={0.1}
                  className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[#888888] text-xs mb-1.5">Duration</label>
                <input
                  type="number"
                  value={selectedClip.duration}
                  onChange={(e) => updateClip(selectedClip.id, { duration: parseFloat(e.target.value) || 0 })}
                  step={0.1}
                  className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Track</label>
              <select
                value={selectedClip.track}
                onChange={(e) => updateClip(selectedClip.id, { track: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value={0}>Track 1</option>
                <option value={1}>Track 2</option>
                <option value={2}>Track 3</option>
              </select>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#2a2a2a]" />

        <div>
          <h3 className="text-[#cccccc] text-sm font-medium mb-3">Transform</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#666666] text-[10px] mb-0.5 block">X</label>
                  <input
                    type="number"
                    value={0}
                    className="w-full px-2 py-1.5 bg-[#252525] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[#666666] text-[10px] mb-0.5 block">Y</label>
                  <input
                    type="number"
                    value={0}
                    className="w-full px-2 py-1.5 bg-[#252525] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Scale</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#666666] text-[10px] mb-0.5 block">Width</label>
                  <input
                    type="number"
                    value={100}
                    className="w-full px-2 py-1.5 bg-[#252525] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[#666666] text-[10px] mb-0.5 block">Height</label>
                  <input
                    type="number"
                    value={100}
                    className="w-full px-2 py-1.5 bg-[#252525] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#888888] text-xs mb-1.5">Rotation</label>
              <input
                type="number"
                value={0}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#2a2a2a]" />

        <div>
          <h3 className="text-[#cccccc] text-sm font-medium mb-3">Effects</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-[#252525] border border-[#333333] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#cccccc] text-xs">Blur</span>
                <button className="text-[#666666] hover:text-[#888888] text-xs">✕</button>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                defaultValue={0}
                className="w-full"
              />
            </div>

            <div className="p-3 bg-[#252525] border border-[#333333] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#cccccc] text-xs">Brightness</span>
                <button className="text-[#666666] hover:text-[#888888] text-xs">✕</button>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                defaultValue={0}
                className="w-full"
              />
            </div>

            <div className="p-3 bg-[#252525] border border-[#333333] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#cccccc] text-xs">Contrast</span>
                <button className="text-[#666666] hover:text-[#888888] text-xs">✕</button>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                defaultValue={0}
                className="w-full"
              />
            </div>

            <button className="w-full py-2.5 px-4 border border-dashed border-[#333333] text-[#666666] text-sm rounded-lg hover:border-[#555555] hover:text-[#888888] transition-colors">
              + Add Effect
            </button>
          </div>
        </div>

        <div className="h-px bg-[#2a2a2a]" />

        <div>
          <button className="w-full py-2.5 px-4 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30">
            🗑️ Delete Clip
          </button>
        </div>
      </div>
    </div>
  )
}
