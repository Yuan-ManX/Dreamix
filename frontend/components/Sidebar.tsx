'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { id: 'editor', label: 'Editor', href: '/dashboard/editor', icon: '✂️' },
  { id: 'chat', label: 'Chat', href: '/dashboard/chat', icon: '💬' },
  { id: 'scripts', label: 'Scripts', href: '/dashboard/scripts', icon: '📝' },
  { id: 'media', label: 'Media', href: '/dashboard/media', icon: '🎬' },
  { id: 'skills', label: 'Skills', href: '/dashboard/skills', icon: '✨' },
  { id: 'history', label: 'History', href: '/dashboard/history', icon: '📜' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && <h1 className="text-xl font-bold">Action</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
            U
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">User</p>
              <p className="text-xs text-slate-400 truncate">Free Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
