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
      "flex flex-col h-full bg-pure-white border-r border-oat-border transition-all duration-300",
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 border-b border-oat-border">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-lemon-500 rounded-feature flex items-center justify-center text-xl shadow-clay">
              🎬
            </div>
            <h1 className="text-card-heading text-clay-black font-roobert">
              Action
            </h1>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-lemon-500 rounded-feature flex items-center justify-center text-xl mx-auto shadow-clay">
            🎬
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-card hover:bg-oat-light transition-all text-warm-silver hover:text-dark-charcoal clay-focus"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group relative block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-feature transition-all duration-200",
                  isActive
                    ? 'bg-lemon-500 text-pure-white shadow-clay'
                    : 'text-warm-charcoal hover:bg-oat-light hover:text-dark-charcoal'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium text-nav-link">{item.label}</span>
                )}
              </motion.div>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-clay-black text-pure-white text-caption rounded-card opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-hard">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section with Enhanced Features */}
      <div className="p-4 border-t border-oat-border">
        <motion.div
          whileHover={{ backgroundColor: '#faf9f7' }}
          className="rounded-feature p-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar with Shine Effect */}
            <motion.div 
              whileHover={{ scale: 1.08, rotateZ: 5 }}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-lemon-500 via-slushie-500 to-ube-800 flex items-center justify-center font-bold text-pure-white text-lg shadow-clay relative overflow-hidden cursor-pointer"
            >
              U
              <motion.div
                initial={{ x: '-100%', opacity: 0.5 }}
                whileHover={{ x: '200%', opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
              ></motion.div>
            </motion.div>
            
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="font-semibold text-dark-charcoal truncate text-body-standard">Alex Johnson</p>
                <p className="text-xs text-warm-silver truncate">alex@action.studio</p>
              </motion.div>
            )}

            {!isCollapsed && (
              <motion.button
                whileHover={{ rotateZ: 90 }}
                className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded-card transition-all"
              >
                ▼
              </motion.button>
            )}
          </div>

          {/* User Menu (Expanded) */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '12px' }}
              className="space-y-2 overflow-hidden"
            >
              {/* Plan Status */}
              <div className="bg-gradient-to-r from-lemon-400/20 to-slushie-500/20 rounded-card p-3 border border-oat-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-dark-charcoal">Current Plan</span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-2.5 py-1 bg-gradient-to-r from-lemon-500 to-slushie-500 text-clay-black text-xs font-bold rounded-badge shadow-clay cursor-pointer"
                  >
                    Free ⬆️
                  </motion.span>
                </div>
                <div className="w-full h-1.5 bg-oat-light rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '35%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-lemon-500 to-slushie-500 rounded-full"
                  ></motion.div>
                </div>
                <p className="text-xs text-warm-silver mt-1.5">350 MB of 1 GB used</p>
              </div>

              {/* Menu Items */}
              {[
                { icon: '👤', label: 'Profile', href: '/dashboard/settings' },
                { icon: '💳', label: 'Billing', href: '/dashboard/settings' },
                { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: '#eee9df' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-card transition-all cursor-pointer"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-small text-dark-charcoal font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}

              {/* Divider */}
              <div className="h-px bg-oat-border my-2"></div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ 
                  x: 4,
                  backgroundColor: 'rgba(252,121,129,0.1)',
                  color: '#fc7981'
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-warm-charcoal font-medium text-small transition-all clay-focus"
              >
                🚪 Logout
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
