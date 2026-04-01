'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/stores/projectStore'
import StudioLeftPanel from './StudioLeftPanel'
import StudioTopBar from './StudioTopBar'
import StudioPreview from './StudioPreview'
import StudioTimeline from './StudioTimeline'
import StudioInspector from './StudioInspector'
import ProjectImportExport from './ProjectImportExport'
import { cn } from '@/lib'

export default function StudioEditor() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(280)
  const [inspectorWidth, setInspectorWidth] = useState(320)
  const [showInspector, setShowInspector] = useState(true)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showImportExport, setShowImportExport] = useState(false)
  const [importExportMode, setImportExportMode] = useState<'import' | 'export' | 'both'>('both')
  
  const { loadProjects, getCurrentProject } = useProjectStore()
  
  const currentProject = getCurrentProject()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const toggleLeftPanel = () => setShowLeftPanel(!showLeftPanel)
  const toggleInspector = () => setShowInspector(!showInspector)

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white overflow-hidden">
      <StudioTopBar
        projectName={currentProject?.name || 'New project'}
        onToggleLeftPanel={toggleLeftPanel}
        onToggleInspector={toggleInspector}
        showLeftPanel={showLeftPanel}
        showInspector={showInspector}
        onImport={() => {
          setImportExportMode('import')
          setShowImportExport(true)
        }}
        onExport={() => {
          setImportExportMode('export')
          setShowImportExport(true)
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {showLeftPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: leftPanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-[#2a2a2a]"
          >
            <StudioLeftPanel />
          </motion.div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <StudioPreview />
          <StudioTimeline />
        </div>

        {showInspector && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: inspectorWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-l border-[#2a2a2a]"
          >
            <StudioInspector />
          </motion.div>
        )}
      </div>

      <ProjectImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        mode={importExportMode}
      />
    </div>
  )
}
