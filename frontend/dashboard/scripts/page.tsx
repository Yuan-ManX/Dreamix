'use client'

import { useState } from 'react'

interface Script {
  id: string
  title: string
  theme: string
  style: string
  scenes: number
  createdAt: string
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      title: 'Product Launch',
      theme: 'Technology',
      style: 'Professional',
      scenes: 5,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Tutorial',
      theme: 'Education',
      style: 'Casual',
      scenes: 8,
      createdAt: '2024-01-10'
    }
  ])

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Scripts</h1>
            <p className="text-slate-600">Manage and edit your video scripts</p>
          </div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
            + New Script
          </button>
        </div>

        <div className="space-y-4">
          {scripts.map((script) => (
            <div
              key={script.id}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{script.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-slate-500">🎨 {script.style}</span>
                    <span className="text-sm text-slate-500">🎬 {script.scenes} scenes</span>
                    <span className="text-sm text-slate-500">📅 {script.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
