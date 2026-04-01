'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [autoSave, setAutoSave] = useState(true)
  const [autoSaveInterval, setAutoSaveInterval] = useState(5)
  const [notifications, setNotifications] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState('en')

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'appearance', name: 'Appearance', icon: '🎨' },
    { id: 'shortcuts', name: 'Shortcuts', icon: '⌨️' },
    { id: 'account', name: 'Account', icon: '👤' },
  ]

  const shortcutCategories = [
    {
      name: 'Timeline',
      shortcuts: [
        { key: 'Space', description: 'Play/Pause' },
        { key: '←', description: 'Move back 1 second' },
        { key: '→', description: 'Move forward 1 second' },
        { key: 'Shift + ←', description: 'Move back 5 seconds' },
        { key: 'Shift + →', description: 'Move forward 5 seconds' },
        { key: 'Home', description: 'Go to start' },
        { key: 'End', description: 'Go to end' },
      ]
    },
    {
      name: 'Editing',
      shortcuts: [
        { key: 'Ctrl/Cmd + Z', description: 'Undo' },
        { key: 'Ctrl/Cmd + Shift + Z', description: 'Redo' },
        { key: 'Delete/Backspace', description: 'Delete selected clip' },
        { key: 'M', description: 'Mute/Unmute' },
        { key: 'S', description: 'Split clip at playhead' },
      ]
    },
    {
      name: 'View',
      shortcuts: [
        { key: 'Ctrl/Cmd + +', description: 'Zoom in' },
        { key: 'Ctrl/Cmd + -', description: 'Zoom out' },
        { key: 'G', description: 'Toggle grid view' },
      ]
    }
  ]

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>⚙️</span>
          Settings
        </h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-slate-700 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>💾</span>
                  Auto Save
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Enable Auto Save</span>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        autoSave ? 'bg-purple-600' : 'bg-slate-600'
                      )}
                    >
                      <div className={cn(
                        "absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform",
                        autoSave ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </label>
                  {autoSave && (
                    <div>
                      <label className="block text-slate-300 text-sm mb-2">
                        Auto Save Interval (minutes)
                      </label>
                      <input
                        type="number"
                        value={autoSaveInterval}
                        onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                        min={1}
                        max={30}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>🔔</span>
                  Notifications
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Enable Notifications</span>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        notifications ? 'bg-purple-600' : 'bg-slate-600'
                      )}
                    >
                      <div className={cn(
                        "absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform",
                        notifications ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Sound Effects</span>
                    <button
                      onClick={() => setSoundEffects(!soundEffects)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        soundEffects ? 'bg-purple-600' : 'bg-slate-600'
                      )}
                    >
                      <div className={cn(
                        "absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform",
                        soundEffects ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>🎨</span>
                  Theme
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Dark Mode</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        darkMode ? 'bg-purple-600' : 'bg-slate-600'
                      )}
                    >
                      <div className={cn(
                        "absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform",
                        darkMode ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </label>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>🌍</span>
                  Language
                </h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
            </motion.div>
          )}

          {activeTab === 'shortcuts' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl space-y-6"
            >
              {shortcutCategories.map((category, idx) => (
                <div key={idx} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-white font-semibold text-lg mb-4">{category.name}</h3>
                  <div className="space-y-3">
                    {category.shortcuts.map((shortcut, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between py-2">
                        <span className="text-slate-300">{shortcut.description}</span>
                        <div className="flex items-center gap-2">
                          {shortcut.key.split(' + ').map((k, kIdx) => (
                            <span key={kIdx} className="px-3 py-1.5 bg-slate-900 text-slate-300 rounded-lg text-sm font-mono border border-slate-700">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xl">User</h3>
                    <p className="text-slate-400">Free Plan</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors text-left">
                    Edit Profile
                  </button>
                  <button className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors text-left">
                    Change Password
                  </button>
                  <button className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors text-left">
                    Connected Accounts
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2 text-red-400">
                  <span>⚠️</span>
                  Danger Zone
                </h3>
                <button className="w-full px-4 py-3 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-colors border border-red-600/30">
                  Delete Account
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
