'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { id: 'editor', label: 'Editor', href: '/dashboard/editor', icon: '✂️' },
  { id: 'chat', label: 'AI Chat', href: '/dashboard/chat', icon: '💬' },
  { id: 'scripts', label: 'Scripts', href: '/dashboard/scripts', icon: '📝' },
  { id: 'media', label: 'Media Library', href: '/dashboard/media', icon: '🎬' },
  { id: 'skills', label: 'Skills', href: '/dashboard/skills', icon: '✨' },
  { id: 'history', label: 'History', href: '/dashboard/history', icon: '📜' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 border-r border-slate-800",
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl">
              🎬
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Action
            </h1>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl mx-auto">
            🎬
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group relative"
            >
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}>
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </div>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">
            U
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">User</p>
              <p className="text-xs text-slate-500 truncate">Free Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
