'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatTime, formatDuration } from '@/lib'

const SAMPLE_HISTORY = [
  {
    id: 'hist-1',
    type: 'edit',
    title: 'Edited "My First Project"',
    description: 'Added transition effects between intro and main content',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    projectName: 'My First Project',
    duration: 15
  },
  {
    id: 'hist-2',
    type: 'export',
    title: 'Exported "Product Showcase"',
    description: 'Exported to MP4 format at 1080p resolution',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    projectName: 'Product Showcase',
    fileSize: '45.2 MB'
  },
  {
    id: 'hist-3',
    type: 'create',
    title: 'Created new project',
    description: 'Started "Social Media Campaign" project',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    projectName: 'Social Media Campaign'
  },
  {
    id: 'hist-4',
    type: 'edit',
    title: 'Updated script',
    description: 'Modified dialogue and added new scenes to the script',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    projectName: 'Tutorial Series',
    duration: 8
  },
  {
    id: 'hist-5',
    type: 'ai',
    title: 'AI-assisted editing',
    description: 'Used AI to suggest music and scene transitions',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    projectName: 'Brand Video',
    duration: 25
  }
]

export default function HistoryPage() {
  const [history, setHistory] = useState(SAMPLE_HISTORY)
  const [filterType, setFilterType] = useState<string>('all')

  const types = ['all', 'edit', 'export', 'create', 'ai']

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'edit': return '✂️'
      case 'export': return '📤'
      case 'create': return '✨'
      case 'ai': return '🤖'
      default: return '📝'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'edit': return 'from-purple-600 to-purple-500'
      case 'export': return 'from-blue-600 to-blue-500'
      case 'create': return 'from-green-600 to-green-500'
      case 'ai': return 'from-indigo-600 to-indigo-500'
      default: return 'from-slate-600 to-slate-500'
    }
  }

  const filteredHistory = filterType === 'all' 
    ? history 
    : history.filter(item => item.type === filterType)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([])
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span>📜</span>
            History
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span>🗑️</span>
              Clear History
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filterType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-white text-lg font-medium mb-2">No history found</h3>
            <p className="text-slate-400">Your activity history will appear here</p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {filteredHistory.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center flex-shrink-0",
                    getTypeColor(item.type)
                  )}>
                    <span className="text-xl">{getTypeIcon(item.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <span className="text-slate-500 text-xs whitespace-nowrap ml-4">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">
                        <span className="text-slate-400">Project:</span> {item.projectName}
                      </span>
                      {item.duration && (
                        <span className="text-slate-500">
                          <span className="text-slate-400">Duration:</span> {formatDuration(item.duration)}
                        </span>
                      )}
                      {item.fileSize && (
                        <span className="text-slate-500">
                          <span className="text-slate-400">Size:</span> {item.fileSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
