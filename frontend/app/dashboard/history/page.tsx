'use client'

import { useState } from 'react'

interface HistoryItem {
  id: string
  title: string
  type: 'project' | 'script' | 'edit'
  date: string
  status: string
  thumbnail: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      title: 'Product Launch Video',
      type: 'project',
      date: 'Today, 2:30 PM',
      status: 'Completed',
      thumbnail: '🎬'
    },
    {
      id: '2',
      title: 'Generated Script',
      type: 'script',
      date: 'Yesterday, 10:15 AM',
      status: 'Draft',
      thumbnail: '📝'
    },
    {
      id: '3',
      title: 'Edited Timeline',
      type: 'edit',
      date: '2 days ago',
      status: 'Saved',
      thumbnail: '✂️'
    }
  ])

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">History</h1>
          <p className="text-slate-600">View your recent activity and past projects</p>
        </div>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-3xl">
                {item.thumbnail}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-slate-500">{item.type}</span>
                  <span className="text-sm text-slate-400">{item.date}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  item.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'Saved'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {item.status}
              </span>
              <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium">
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
