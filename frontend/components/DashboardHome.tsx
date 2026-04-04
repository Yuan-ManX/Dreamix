'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/stores/projectStore'
import { cn, formatTime, formatDuration } from '@/lib'
import { VideoProject } from '@/types'

export default function DashboardHome() {
  const {
    projects,
    loadProjects,
    createProject,
    setCurrentProject,
    duplicateProject,
    deleteProject,
    isLoading
  } = useProjectStore()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProjectType, setSelectedProjectType] = useState<'studio' | 'canva' | 'audio'>('studio')
  const [activeDashboardTab, setActiveDashboardTab] = useState<'recent' | 'studio' | 'canva' | 'audio' | 'scripts' | 'tips'>('recent')
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreateProject = (type?: 'studio' | 'canva' | 'audio') => {
    return () => {
      const projectType = type || selectedProjectType
      const names = {
        studio: 'New Video Project',
        canva: 'New Canvas Project',
        audio: 'New Audio Project'
      }
      const descriptions = {
        studio: 'A new video project',
        canva: 'A new canvas design project',
        audio: 'A new audio production project'
      }
      createProject(names[projectType], descriptions[projectType], projectType)
      setShowCreateModal(false)
    }
  }

  const handleOpenCreateModal = () => {
    setShowCreateModal(true)
  }

  const handleOpenProject = (project: VideoProject) => {
    setCurrentProject(project.projectId)
  }

  const handleDuplicateProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    duplicateProject(projectId)
  }

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    setShowDeleteConfirm(projectId)
  }

  const confirmDeleteProject = () => {
    if (showDeleteConfirm) {
      deleteProject(showDeleteConfirm)
      setShowDeleteConfirm(null)
    }
  }

  const handleStartRename = (e: React.MouseEvent, projectId: string, currentName: string) => {
    e.stopPropagation()
    setRenamingProjectId(projectId)
    setRenameValue(currentName)
  }

  const handleConfirmRename = (projectId: string) => {
    if (renameValue.trim()) {
      const project = projects.find(p => p.projectId === projectId)
      if (project) {
        // Update project name in store
        const updatedProjects = projects.map(p =>
          p.projectId === projectId ? { ...p, name: renameValue.trim(), updatedAt: new Date().toISOString() } : p
        )
        useProjectStore.setState({ projects: updatedProjects })
      }
    }
    setRenamingProjectId(null)
    setRenameValue('')
  }

  const handleCancelRename = () => {
    setRenamingProjectId(null)
    setRenameValue('')
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      handleConfirmRename(projectId)
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  const getProjectStatus = (project: VideoProject) => {
    if (project.clips.length === 0) return { label: 'Draft', color: 'bg-lemon-500', textColor: 'text-dark-charcoal' }
    if (project.updatedAt !== project.createdAt) return { label: 'In Progress', color: 'bg-slushie-500', textColor: 'text-clay-black' }
    return { label: 'Completed', color: 'bg-matcha-600', textColor: 'text-pure-white' }
  }

  const stats = {
    totalProjects: projects.length,
    totalClips: projects.reduce((sum, p) => sum + p.clips.length, 0),
    totalDuration: projects.reduce((sum, p) => {
      if (p.clips.length === 0) return sum
      return sum + Math.max(...p.clips.map(c => c.startTime + c.duration))
    }, 0)
  }

  // AI Module Stats
  const aiModuleStats = {
    canva: { items: 12, recent: '2 hours ago' },
    audio: { tracks: 5, duration: '3:45' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-warm-cream">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-oat-border border-t-gradient-to-r from-lemon-500 to-slushie-500 rounded-full mx-auto mb-6"
          ></motion.div>
          <p className="text-body text-warm-silver">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-warm-cream scrollbar-thin">
      {/* Gradient Header with Animated Decorations */}
      <div className="relative overflow-hidden bg-gradient-to-r from-lemon-500 via-slushie-500 to-lemon-500 p-10 shadow-clay">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 -right-16 w-56 h-56 bg-white/15 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/12 rounded-full blur-3xl"
        ></motion.div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <h1 className="text-section-heading text-clay-black mb-2 font-roobert flex items-center gap-4">
                <motion.span
                  animate={{ rotateZ: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block"
                >
                  📊
                </motion.span>
                Dashboard
              </h1>
              <p className="text-body-large text-dark-charcoal">Welcome back! Let's create something amazing.</p>
            </motion.div>
            
            <motion.button
              whileHover={{ 
                rotateZ: -8, 
                y: -18,
                boxShadow: 'rgb(0,0,0) -9px 9px',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              onClick={handleOpenCreateModal}
              className="group relative px-14 py-4 bg-pure-white text-clay-black font-semibold rounded-pill shadow-hard hover:bg-light-frost clay-focus flex items-center gap-3 overflow-hidden"
              style={{ fontSize: '17px', fontWeight: '600' }}
            >
              <span className="relative z-10 text-xl">+</span>
              <span className="relative z-10">New Project</span>
              {/* Shine Effect */}
              <motion.div
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-lemon-400/40 to-transparent skew-x-12"
              ></motion.div>
            </motion.button>
          </div>

          {/* Stats Cards with Spring Animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { icon: '🎬', value: stats.totalProjects, label: 'Total Projects', gradient: 'from-lemon-400 to-lemon-700' },
              { icon: '📹', value: stats.totalClips, label: 'Total Clips', gradient: 'from-slushie-500 to-blueberry-800' },
              { icon: '⏱️', value: formatDuration(stats.totalDuration), label: 'Total Editing Time', gradient: 'from-ube-300 to-ube-800' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: idx === 0 ? 'rgba(251,189,65,0.35) 0px 16px 36px' : 
                             idx === 1 ? 'rgba(59,211,253,0.35) 0px 16px 36px' : 
                             'rgba(193,176,255,0.35) 0px 16px 36px'
                }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 120 }}
                className="group bg-pure-white/95 backdrop-blur-sm rounded-feature p-7 border-2 border-white/40 shadow-clay relative overflow-hidden cursor-pointer"
              >
                {/* Hover Glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.08] pointer-events-none`}
                ></motion.div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <motion.div 
                      whileHover={{ rotateZ: 15, scale: 1.15 }}
                      className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-feature flex items-center justify-center mb-4 shadow-clay relative overflow-hidden`}
                    >
                      <span className="text-2xl relative z-10">{stat.icon}</span>
                      <motion.div
                        initial={{ x: '-100%', opacity: 0.5 }}
                        whileHover={{ x: '200%', opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                      ></motion.div>
                    </motion.div>
                    <p className="clay-label text-warm-charcoal">{stat.label}</p>
                  </div>
                  
                  <motion.span 
                    whileHover={{ scale: 1.1 }}
                    className={`text-card-heading font-roobert group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${idx === 0 ? 'group-hover:from-lemon-700 group-hover:to-lemon-500' : idx === 1 ? 'group-hover:from-slushie-600 group-hover:to-blueberry-800' : 'group-hover:from-ube-800 group-hover:to-ube-300'} transition-all`}
                  >
                    {stat.value}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-oat-border pb-3 overflow-x-auto">
          {[
            { id: 'recent', label: 'Recent Projects', icon: '📁' },
            { id: 'studio', label: 'AI Studio', icon: '🎬' },
            { id: 'canva', label: 'AI Canva', icon: '🎨' },
            { id: 'audio', label: 'AI Audio', icon: '🎵' },
            { id: 'scripts', label: 'Scripts', icon: '📝' },
            { id: 'tips', label: 'Quick Tips', icon: '💡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDashboardTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeDashboardTab === tab.id
                  ? 'bg-gradient-to-r from-lemon-500 to-slushie-500 text-white shadow-md'
                  : 'text-warm-silver hover:bg-oat-light hover:text-clay-black'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {(activeDashboardTab === 'recent' || activeDashboardTab === 'studio' || activeDashboardTab === 'canva' || activeDashboardTab === 'audio') && (() => {
          let filteredProjects = projects

          // Apply strict type filtering for each tab
          if (activeDashboardTab === 'studio') {
            // AI Studio: Only show studio/video projects (or legacy projects without type)
            filteredProjects = projects.filter(p => p.type === 'studio' || p.type === 'video' || !p.type)
          } else if (activeDashboardTab === 'canva') {
            // AI Canva: Only show canva projects
            filteredProjects = projects.filter(p => p.type === 'canva')
          } else if (activeDashboardTab === 'audio') {
            // AI Audio: Only show audio projects
            filteredProjects = projects.filter(p => p.type === 'audio')
          }
          // recent: Show all projects (no filtering)

          filteredProjects = filteredProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

          return (
            <div className="space-y-6">
              {filteredProjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-pure-white rounded-xl border border-dashed-oat shadow-sm"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 bg-gradient-to-br from-lemon-400/30 to-slushie-500/30 rounded-xl flex items-center justify-center mx-auto mb-5"
                  >
                    <span className="text-4xl">{activeDashboardTab === 'audio' ? '🎵' : activeDashboardTab === 'canva' ? '🎨' : '🎬'}</span>
                  </motion.div>
                  <h3 className="text-base text-clay-black mb-2 font-roobert">No projects yet</h3>
                  <p className="text-sm text-warm-silver mb-6">Create your first project</p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-8 py-2.5 bg-gradient-to-r from-lemon-500 to-slushie-500 text-clay-black font-semibold rounded-full shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm"
                  >
                    <span>+</span>
                    <span>Create Project</span>
                  </button>
                </motion.div>
              ) : (
                <>
                  {activeDashboardTab !== 'recent' && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center ${
                          activeDashboardTab === 'studio' ? 'from-lemon-500 to-slushie-500' :
                          activeDashboardTab === 'canva' ? 'from-slushie-500 to-lemon-500' :
                          'from-ube-500 to-slushie-400'
                        }`}>
                          <span className="text-lg">{activeDashboardTab === 'studio' ? '🎬' : activeDashboardTab === 'canva' ? '🎨' : '🎵'}</span>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-clay-black font-roobert">
                            {activeDashboardTab === 'studio' ? 'AI Studio' : activeDashboardTab === 'canva' ? 'AI Canva' : 'AI Audio'}
                          </h3>
                          <p className="text-xs text-warm-silver">
                            {filteredProjects.length} {activeDashboardTab === 'audio' ? 'tracks' : 'projects'}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/${activeDashboardTab}`}>
                        <button className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                          activeDashboardTab === 'studio' ? 'bg-lemon-500 hover:bg-lemon-600' :
                          activeDashboardTab === 'canva' ? 'bg-slushie-500 hover:bg-slushie-600' :
                          'bg-ube-500 hover:bg-ube-600'
                        }`}>
                          Open →
                        </button>
                      </Link>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredProjects.slice(0, 12).map((project, index) => {
                        const status = getProjectStatus(project)
                        return (
                          <motion.div
                            key={project.projectId}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ y: -6 }}
                            transition={{ delay: index * 0.03 }}
                            className="group bg-pure-white rounded-xl border border-oat-border shadow-sm cursor-pointer overflow-hidden relative"
                          >
                            <div 
                              className="h-28 bg-gradient-to-br from-ube-300/30 via-oat-light to-slushie-500/20 flex items-center justify-center relative overflow-hidden"
                              onClick={() => handleOpenProject(project)}
                            >
                              <span className="text-5xl">{project.type === 'canva' ? '🎨' : project.type === 'audio' ? '🎵' : '🎬'}</span>
                              <div className="absolute top-2 right-2">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border backdrop-blur-sm", status.color, status.textColor)}>
                                  {status.label}
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-clay-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-center pb-3">
                                <Link href={`/dashboard/${project.type || 'studio'}`} onClick={(e) => e.stopPropagation()}>
                                  <button className="px-4 py-1.5 bg-pure-white text-clay-black rounded-full text-xs font-medium shadow-md">Open</button>
                                </Link>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              {renamingProjectId === project.projectId ? (
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onBlur={() => handleConfirmRename(project.projectId)}
                                  onKeyDown={(e) => handleRenameKeyDown(e, project.projectId)}
                                  autoFocus
                                  className="w-full px-2 py-1 text-xs font-semibold text-clay-black border border-lemon-500 rounded bg-lemon-50 focus:outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <h3 
                                    className="text-xs font-semibold text-clay-black mb-1 truncate group-hover:text-lemon-600 cursor-text"
                                    onDoubleClick={(e) => handleStartRename(e, project.projectId, project.name)}
                                    title="Double-click to rename"
                                  >
                                    {project.name}
                                  </h3>
                                  <div className="flex items-center justify-between text-[10px] text-warm-silver">
                                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    <span>{project.clips?.length || 0} clips</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Action Buttons on Hover */}
                            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleStartRename(e, project.projectId, project.name)}
                                className="p-1.5 bg-pure-white/90 backdrop-blur-sm rounded-md hover:bg-white shadow-sm"
                                title="Rename"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(e, project.projectId)}
                                className="p-1.5 bg-pomegranate-100/90 backdrop-blur-sm rounded-md hover:bg-pomegranate-200 shadow-sm"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          )
        })()}

        {activeDashboardTab === 'scripts' && (
          <div className="bg-pure-white rounded-xl border border-oat-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-dashed-oat">
              <div className="w-12 h-12 bg-gradient-to-br from-matcha-300 to-matcha-600 rounded-lg flex items-center justify-center">
                📝
              </div>
              <div>
                <h3 className="text-base font-bold text-clay-black font-roobert">Scripts & Storylines</h3>
                <p className="text-xs text-warm-silver">AI-powered script generation and editing</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Link href="/dashboard/scripts" className="block p-5 bg-oat-light rounded-lg hover:bg-oat-border transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎭</span>
                  <div>
                    <h4 className="text-sm font-bold text-clay-black group-hover:text-lemon-600">Script Generator</h4>
                    <p className="text-xs text-warm-silver">Generate scripts with AI assistance</p>
                  </div>
                </div>
                <p className="text-xs text-warm-silver">Create narratives, dialogues, storyboards...</p>
              </Link>
              
              <Link href="/dashboard/scripts" className="block p-5 bg-oat-light rounded-lg hover:bg-oat-border transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✍️</span>
                  <div>
                    <h4 className="text-sm font-bold text-clay-black group-hover:text-lemon-600">Script Editor</h4>
                    <p className="text-xs text-warm-silver">Edit and refine your scripts</p>
                  </div>
                </div>
                <p className="text-xs text-warm-silver">Modify existing scripts with AI help</p>
              </Link>
            </div>

            <div className="mt-4 p-4 bg-lemon-50/50 rounded-lg border border-lemon-200">
              <p className="text-xs text-lemon-700 font-medium mb-2">💡 Pro Tip</p>
              <p className="text-xs text-clay-black/70">Use the Script Generator to create a complete narrative first, then break it down into scenes for video production in AI Studio.</p>
            </div>
          </div>
        )}

        {activeDashboardTab === 'tips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slushie-800 to-blueberry-900 rounded-xl p-7 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">💡</div>
                <h3 className="text-lg font-bold text-white font-roobert">Quick Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2"><span>•</span><span>Use Space for play/pause, Ctrl+Z for undo</span></li>
                <li className="flex items-start gap-2"><span>•</span><span>Drag clips between tracks for layering</span></li>
                <li className="flex items-start gap-2"><span>•</span><span>Apply effects from the Effects panel</span></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-pure-white rounded-xl border border-oat-border shadow-sm p-7"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-lemon-500 to-slushie-500 rounded-lg flex items-center justify-center">⚡</div>
                <h3 className="text-lg font-bold text-clay-black font-roobert">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/dashboard/studio', icon: '✂️', label: 'Studio' },
                  { href: '/dashboard/canva', icon: '💬', label: 'Canva' },
                  { href: '/dashboard/media', icon: '📁', label: 'Media' },
                  { href: '/dashboard/skills', icon: '✨', label: 'Skills' },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <div className="p-4 bg-oat-light rounded-lg hover:bg-oat-border text-center cursor-pointer transition-colors">
                      <span className="text-xl block mb-1">{action.icon}</span>
                      <span className="text-xs font-medium text-clay-black">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-clay-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-pure-white rounded-xl p-8 max-w-md w-full border border-oat-border shadow-hard relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-lemon-500 to-slushie-500"></div>

              <h3 className="text-xl font-bold text-clay-black mb-2 font-roobert">Create New Project</h3>
              <p className="text-sm text-warm-silver mb-6">Select project type</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'studio', icon: '🎬', label: 'Video', desc: 'AI Studio' },
                  { id: 'canva', icon: '🎨', label: 'Canvas', desc: 'AI Canva' },
                  { id: 'audio', icon: '🎵', label: 'Audio', desc: 'AI Audio' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedProjectType(type.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedProjectType === type.id
                        ? 'border-lemon-500 bg-lemon-50 shadow-md'
                        : 'border-oat-border hover:border-oat-hover hover:bg-oat-light'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{type.icon}</span>
                    <p className="text-sm font-semibold text-clay-black">{type.label}</p>
                    <p className="text-xs text-warm-silver">{type.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-oat-light text-dark-charcoal rounded-full font-medium hover:bg-oat-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-lemon-500 to-slushie-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-clay-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-pure-white rounded-section p-10 max-w-md w-full border-2 border-oat-border shadow-hard relative overflow-hidden"
            >
              {/* Modal Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pomegranate-400 via-red-500 to-pomegranate-400"></div>
              
              <h3 className="text-card-heading text-clay-black mb-4 font-roobert">Delete Project?</h3>
              <p className="text-body text-warm-charcoal mb-10 leading-relaxed">This action cannot be undone. The project will be permanently deleted.</p>
              
              <div className="flex gap-5">
                <motion.button
                  whileHover={{ 
                    rotateZ: -4, 
                    y: -6,
                    backgroundColor: '#eee9df',
                    boxShadow: 'rgba(0,0,0,0.08) -5px 5px'
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-7 py-4 bg-oat-light text-dark-charcoal rounded-pill hover:bg-oat-border transition-all font-semibold clay-focus"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ 
                    rotateZ: -4, 
                    y: -6,
                    backgroundColor: 'rgba(252,121,129,0.15)',
                    boxShadow: 'rgba(252,121,129,0.35) -5px 5px'
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDeleteProject}
                  className="flex-1 px-7 py-4 bg-pomegranate-400 text-pure-white rounded-pill hover:bg-red-500 transition-all font-semibold clay-focus"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
