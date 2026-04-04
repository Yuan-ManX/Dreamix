'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib'
import ActionVideoEditor from './ActionVideoEditor'
import ProjectImportExport from './ProjectImportExport'
import Link from 'next/link'

interface AIStudioProps {
  onApplySuggestion?: (suggestion: any) => void
  onGenerateScript?: (prompt: string) => void
}

const QUICK_SUGGESTIONS = [
  { label: '🎬 Create intro scene', prompt: 'Create an engaging intro scene with dynamic transitions and branding' },
  { label: '📝 Add captions', prompt: 'Generate automatic captions with timing for the entire video' },
  { label: '🎵 Suggest music', prompt: 'Recommend background music that matches the video mood and pace' },
  { label: '✨ Add effects', prompt: 'Apply professional color grading and visual effects' },
  { label: '📊 Trim video', prompt: 'Help me identify and remove unnecessary segments' },
  { label: '🎯 Optimize for social', prompt: 'Adapt this video format for TikTok/Instagram/YouTube' }
]

const SAMPLE_RESPONSES = [
  "I've analyzed your project and generated a complete video editing plan. I've created 3 scenes with smooth transitions, added background music that matches your content's energy level, and applied professional color grading. You can see all the changes reflected in the editor timeline!",
  "Great! I've used our AI Video Agent to automatically edit your footage. The system has detected silent sections, added dynamic transitions between clips, generated captions with perfect timing, and applied cinematic color grading. Check the preview panel to see the results!",
  "Perfect! I've processed your video using advanced AI algorithms. The timeline now shows optimized clip arrangement with AI-suggested transitions. I've also prepared several effect presets you can apply. Simply click any suggestion in the timeline to preview it!"
]

export default function AIStudio({ onApplySuggestion, onGenerateScript }: AIStudioProps) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      role: 'assistant',
      content: "Hi! I'm your AI Video Studio Assistant. I can help you create, edit, and optimize videos in real-time. Describe what you want to create, or use the quick suggestions below. All changes will appear in the editor instantly!",
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [importExportMode, setImportExportMode] = useState<'import' | 'export' | 'both'>('both')
  
  // Editor State
  const [leftPanelWidth] = useState(280)
  const [inspectorWidth] = useState(320)
  const [showInspector, setShowInspector] = useState(true)
  
  // Chat Panel State
  const [chatWidth, setChatWidth] = useState(380)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  
  // User Profile State
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1000))

    const assistantMessage = {
      id: `msg-${Date.now()}-resp`,
      role: 'assistant',
      content: SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)],
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleQuickSuggestion = (suggestion: typeof QUICK_SUGGESTIONS[0]) => {
    setInputValue(suggestion.prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleInspector = () => setShowInspector(!showInspector)
  const toggleChat = () => setIsChatCollapsed(!isChatCollapsed)
  const toggleUserMenu = () => setIsUserExpanded(!isUserExpanded)
  const handleLogout = () => {
    window.location.href = '/'
  }

  // Resizable Panel
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = chatWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = Math.max(300, Math.min(600, startWidth + deltaX))
      setChatWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="flex flex-col h-full bg-warm-cream">
      {/* Main Content Area - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - AI Chat Interface */}
        {!isChatCollapsed && (
          <motion.div
            initial={{ width: chatWidth, opacity: 1 }}
            animate={{ width: isChatCollapsed ? 0 : chatWidth, opacity: isChatCollapsed ? 0 : 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="flex-shrink-0 border-r border-oat-border bg-pure-white flex flex-col overflow-hidden"
            style={{ maxWidth: isChatCollapsed ? 0 : chatWidth }}
          >
            {/* Chat Header - Unified with Canva/Audio style */}
            <div className="p-5 border-b border-oat-border bg-gradient-to-r from-lemon-500/10 via-slushie-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotateZ: -8, scale: 1.05 }}
                  className="w-12 h-12 bg-gradient-to-br from-lemon-500 to-slushie-500 rounded-feature flex items-center justify-center shadow-clay relative overflow-hidden"
                >
                  <span className="text-2xl relative z-10">🎬</span>
                  <motion.div
                    initial={{ x: '-100%', opacity: 0.5 }}
                    whileHover={{ x: '200%', opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  ></motion.div>
                </motion.div>
                <div>
                  <h3 className="text-sub-heading text-clay-black font-roobert font-semibold">AI Studio</h3>
                  <p className="text-caption text-warm-silver">Video creation assistant</p>
                </div>
              </div>
            </div>

            {/* Quick Suggestions - Unified Style */}
            <div className="p-4 border-b border-oat-border">
              <p className="text-xs text-warm-silver font-semibold mb-3 uppercase tracking-wide">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: '#faf9f7',
                      boxShadow: 'rgba(251,189,65,0.15) 0px 4px 12px'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="px-3 py-2 bg-oat-light text-dark-charcoal text-xs rounded-card font-medium hover:bg-lemon-400/20 hover:text-lemon-700 transition-all clay-focus border border-oat-border"
                  >
                    {suggestion.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              <AnimatePresence mode="popLayout">
              {/* Message List */}
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      message.role === 'user'
                        ? "bg-gradient-to-r from-slushie-500 to-lemon-500 text-clay-black rounded-tr-none font-medium shadow-clay"
                        : "bg-oat-light text-dark-charcoal rounded-tl-none border border-oat-border"
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-oat-light px-4 py-3 rounded-2xl rounded-tl-none border border-oat-border">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="w-2 h-2 bg-lemon-500 rounded-full"
                        ></motion.div>
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                          className="w-2 h-2 bg-slushie-500 rounded-full"
                        ></motion.div>
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                          className="w-2 h-2 bg-lemon-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-oat-border bg-pure-white">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask AI Video Agent..."
                    className="w-full px-4 py-3 pr-12 bg-oat-light border-2 border-oat-border rounded-card text-body-standard text-dark-charcoal placeholder:text-warm-silver focus:outline-none focus:border-lemon-500 focus:bg-pure-white transition-all clay-focus shadow-clay"
                    disabled={isTyping}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.08, rotateZ: -8 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-12 h-12 bg-gradient-to-r from-lemon-500 to-slushie-500 text-clay-black rounded-card font-bold text-lg shadow-hard hover:shadow-lg transition-all clay-focus disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                >
                  <span className="relative z-10">↑</span>
                  <motion.div
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  ></motion.div>
                </motion.button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-warm-silver">Press Enter to send • Shift+Enter for new line</p>
                <div className="flex gap-2">
                  <button className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded transition-colors">
                    📎
                  </button>
                  <button className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded transition-colors">
                    😊
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resizable Divider */}
        {!isChatCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1.5 bg-oat-border hover:bg-lemon-500 cursor-col-resize transition-colors flex-shrink-0 relative group ${isResizing ? 'bg-lemon-500' : ''}`}
          >
            <div className="absolute inset-y-0 -left-1 -right-1"></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full transition-colors ${isResizing ? 'bg-white' : 'bg-warm-silver group-hover:bg-lemon-600'}`}></div>
          </div>
        )}

        {/* Toggle Chat Button (when collapsed) */}
        {isChatCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-gradient-to-r from-lemon-500 to-slushie-500 text-pure-white rounded-r-feature shadow-hard hover:shadow-lg transition-all clay-focus"
            title="Open AI Chat"
          >
            🤖
          </motion.button>
        )}

        {/* RIGHT PANEL - Action Video Editor (OpenCut-style Complete Implementation) */}
        <div className="flex-1 flex flex-col min-w-0">
          <ActionVideoEditor />
        </div>
      </div>

      {/* Import/Export Modal */}
      <ProjectImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        mode={importExportMode}
      />
    </div>
  )
}
