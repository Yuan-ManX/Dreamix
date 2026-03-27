'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  status: 'draft' | 'in_progress' | 'completed'
  thumbnail: string
  lastModified: string
}

export default function DashboardPage() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Product Launch Video',
      status: 'in_progress',
      thumbnail: '🚀',
      lastModified: '2 hours ago'
    },
    {
      id: '2',
      name: 'Tutorial Series',
      status: 'draft',
      thumbnail: '📚',
      lastModified: '1 day ago'
    },
    {
      id: '3',
      name: 'Company Overview',
      status: 'completed',
      thumbnail: '🏢',
      lastModified: '3 days ago'
    }
  ])

  const [stats] = useState([
    { label: 'Projects', value: '12', icon: '🎬' },
    { label: 'Skills', value: '8', icon: '✨' },
    { label: 'Minutes', value: '45', icon: '⏱️' }
  ])

  const quickActions = [
    { label: 'Create New Project', icon: '➕', href: '/chat' },
    { label: 'Browse Skills', icon: '🎨', href: '/skills' },
    { label: 'View History', icon: '📜', href: '/history' }
  ]

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back!</h1>
          <p className="text-slate-600">Continue creating amazing videos with Dreamix</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{stat.icon}</div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer">
                <div className="text-3xl mb-2">{action.icon}</div>
                <p className="font-semibold">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Recent Projects</h2>
            <Link href="/history" className="text-purple-600 hover:text-purple-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-5xl">{project.thumbnail}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-1">{project.name}</h3>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {project.status}
                    </span>
                    <span className="text-xs text-slate-500">{project.lastModified}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
