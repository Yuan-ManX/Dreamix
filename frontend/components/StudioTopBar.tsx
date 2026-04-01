'use client'

import { cn } from '@/lib'

interface StudioTopBarProps {
  projectName: string
  showLeftPanel: boolean
  showInspector: boolean
  onToggleLeftPanel: () => void
  onToggleInspector: () => void
  onImport: () => void
  onExport: () => void
}

export default function StudioTopBar({
  projectName,
  showLeftPanel,
  showInspector,
  onToggleLeftPanel,
  onToggleInspector,
  onImport,
  onExport
}: StudioTopBarProps) {
  return (
    <div className="h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLeftPanel}
            className={cn(
              "p-2 rounded transition-colors",
              showLeftPanel
                ? "bg-blue-500 text-white"
                : "text-[#888888] hover:text-white hover:bg-[#252525]"
            )}
            title="Toggle Left Panel"
          >
            <span className="text-base">📁</span>
          </button>
          <div className="w-px h-6 bg-[#2a2a2a]" />
        </div>
        
        <div className="flex items-center gap-2">
          <h1 className="text-[#cccccc] font-medium text-sm">{projectName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          <button className="p-2 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Undo">
        ↶
          </button>
          <button className="p-2 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Redo">
        ↷
          </button>
          <div className="w-px h-6 bg-[#2a2a2a] mx-1" />
          <button className="p-2 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors" title="Import">
        🗂️
          </button>
          <button 
            onClick={onImport}
            className="p-2 text-[#888888] hover:text-white hover:bg-[#252525] rounded transition-colors"
            title="Import"
          >
            ⬇️
          </button>
        </div>
        
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg hover:from-blue-400 hover:to-blue-300 transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
        >
          <span>⬆️</span>
          <span>Export</span>
        </button>
        
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={onToggleInspector}
            className={cn(
              "p-2 rounded transition-colors",
              showInspector
                ? "bg-blue-500 text-white"
                : "text-[#888888] hover:text-white hover:bg-[#252525]"
            )}
            title="Toggle Inspector"
          >
            <span className="text-base">⚙️</span>
          </button>
        </div>
      </div>
    </div>
  )
}
