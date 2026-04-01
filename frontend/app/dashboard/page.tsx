'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

interface Project {
  id: string
  name: string
  status: 'draft' | 'in_progress' | 'completed'
  thumbnail: string
  lastModified: string
  duration?: string
}

export default function DashboardPage() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Product Launch Video',
      status: 'in_progress',
      thumbnail: '🚀',
      lastModified: '2 hours ago',
      duration: '2:30'
    },
    {
      id: '2',
      name: 'Tutorial Series',
      status: 'draft',
      thumbnail: '📚',
      lastModified: '1 day ago',
      duration: '15:45'
    },
    {
      id: '3',
      name: 'Company Overview',
      status: 'completed',
      thumbnail: '🏢',
      lastModified: '3 days ago',
      duration: '4:20'
    }
  ])

  const [stats] = useState([
    { label: 'Projects', value: '12', icon: '🎬' },
    { label: 'Clips', value: '48', icon: '📦' },
    { label: 'Minutes', value: '125', icon: '⏱️' }
  ])

  const quickActions = [
    { label: 'Open Editor', icon: '✂️', href: '/dashboard/editor', color: 'from-purple-600 to-indigo-600' },
    { label: 'Create New', icon: '➕', href: '/dashboard/editor', color: 'from-emerald-600 to-teal-600' },
    { label: 'Media Library', icon: '📁', href: '/dashboard/media', color: 'from-blue-600 to-cyan-600' },
    { label: 'Browse Skills', icon: '🎨', href: '/dashboard/skills', color: 'from-pink-600 to-rose-600' }
  ]

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return colors[status]
  }

  const handleExportProject = useCallback((projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    alert('Project export functionality will be available soon!')
  }, [])

  const handleDeleteProject = useCallback((projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setRecentProjects(prev => prev.filter(p => p.id !== projectId))
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-slate-400">Continue creating amazing videos with Action</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{stat.icon}</div>
                <div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className={cn(
                "bg-gradient-to-br rounded-xl p-6 text-white hover:opacity-90 transition-all cursor-pointer group",
                action.color
              )}>
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                <p className="font-semibold">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            <Link href="/dashboard/history" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
              View All
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href="/dashboard/editor">
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 hover:shadow-lg hover:shadow-black/30 transition-all group">
                  <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                    <span className="text-5xl group-hover:scale-110 transition-transform">{project.thumbnail}</span>
                    {project.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded">
                        <span className="text-xs text-white font-mono">{project.duration}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 truncate">{project.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "px-2.5 py-1 text-xs rounded-full border",
                        getStatusColor(project.status)
                      )}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">{project.lastModified}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleExportProject(project.id, e)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors"
                      >
                        📤 Export
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="px-3 py-1.5 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {recentProjects.length === 0 && (
            <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-6">Create your first project to get started</p>
              <Link href="/dashboard/editor">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all">
                  Create New Project
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
