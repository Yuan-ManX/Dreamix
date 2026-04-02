'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib'
import StudioLeftPanel from './StudioLeftPanel'
import StudioPreview from './StudioPreview'
import StudioTimeline from './StudioTimeline'
import StudioInspector from './StudioInspector'
import ProjectImportExport from './ProjectImportExport'

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
  "I've analyzed your project and generated a complete video editing plan. I've created 3 scenes with smooth transitions, added background music that matches your content's energy level, and applied professional color grading. You can see all the changes reflected in the editor timeline on the right side!",
  "Great! I've used our AI Video Agent to automatically edit your footage. The system has: 1) Detected and cut silent sections, 2) Added dynamic transitions between clips, 3) Generated captions with perfect timing, 4) Applied cinematic color grading. Check the preview panel to see the results!",
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

  return (
    <div className="flex flex-col h-full bg-warm-cream">
      {/* Top Bar - Unified AI Studio Header */}
      <div className="relative overflow-hidden h-16 bg-gradient-to-r from-lemon-500 via-slushie-500 to-lemon-500 shadow-clay">
        {/* Animated Background */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-2xl"
        ></motion.div>
        
        <div className="relative z-10 h-full flex items-center justify-between px-6">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotateZ: 15, scale: 1.08 }}
              className="w-11 h-11 bg-pure-white rounded-feature flex items-center justify-center shadow-hard relative overflow-hidden"
            >
              <span className="text-xl relative z-10">🎬</span>
              <motion.div
                initial={{ x: '-100%', opacity: 0.5 }}
                whileHover={{ x: '200%', opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-lemon-400/50 to-transparent skew-x-12"
              ></motion.div>
            </motion.div>
            
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold text-clay-black font-roobert flex items-center gap-3"
              >
                AI Studio
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-3 py-1 bg-pure-white/90 backdrop-blur-sm text-xs font-semibold rounded-badge shadow-clay"
                >
                  ✨ Powered by AI
                </motion.span>
              </motion.h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ rotateZ: -6, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setImportExportMode('import')
                setShowImportExport(true)
              }}
              className="p-2.5 text-dark-charcoal hover:bg-pure-white/80 rounded-feature transition-all clay-focus shadow-clay"
              title="Import Media"
            >
              ⬇️
            </motion.button>

            <motion.button
              whileHover={{ 
                rotateZ: -8,
                y: -6,
                boxShadow: 'rgb(0,0,0) -6px 6px'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setImportExportMode('export')
                setShowImportExport(true)
              }}
              className="px-6 py-2.5 bg-pure-white text-clay-black font-semibold rounded-pill hover:bg-light-frost shadow-hard transition-all clay-focus flex items-center gap-2 text-sm"
            >
              📤 Export
            </motion.button>

            <motion.button
              whileHover={{ rotateZ: -6, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleInspector}
              className={cn(
                "p-2.5 rounded-feature transition-all clay-focus shadow-clay",
                showInspector ? "bg-pure-white text-lemon-700" : "text-warm-charcoal hover:text-dark-charcoal hover:bg-pure-white/80"
              )}
              title="Toggle Inspector"
            >
              ⚙️
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - AI Chat Interface */}
        <div className="w-[420px] flex-shrink-0 border-r border-oat-border bg-pure-white flex flex-col relative overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {/* Quick Suggestions (shown when few messages) */}
            {messages.length <= 2 && (
              <div className="mb-6">
                <p className="clay-label text-warm-charcoal mb-4">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-2.5">
                  {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ 
                        rotateZ: -4, 
                        y: -4, 
                        boxShadow: 'rgba(251,189,65,0.2) -4px 4px'
                      }}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="px-3.5 py-2.5 bg-oat-light hover:bg-lemon-400/20 text-dark-charcoal text-small rounded-card transition-all border border-oat-border shadow-clay clay-focus"
                    >
                      {suggestion.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-9 h-9 rounded-card flex items-center justify-center flex-shrink-0 shadow-clay",
                  message.role === 'user'
                    ? "bg-gradient-to-br from-slushie-500 to-blueberry-800"
                    : "bg-gradient-to-br from-lemon-500 to-slushie-500"
                )}>
                  <span className="text-sm">{message.role === 'user' ? '👤' : '🤖'}</span>
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  "max-w-[85%]",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-3.5 rounded-feature shadow-clay text-body-standard leading-relaxed",
                    message.role === 'user'
                      ? "bg-slushie-500 text-clay-black rounded-tr-none"
                      : "bg-oat-light text-dark-charcoal rounded-tl-none border border-oat-border"
                  )}>
                    {message.content}
                  </div>
                  
                  {/* Timestamp */}
                  <p className={cn(
                    "text-xs mt-1.5 px-1",
                    message.role === 'user' ? "text-right text-slushie-800/60" : "text-left text-warm-silver"
                  )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-card bg-gradient-to-br from-lemon-500 to-slushie-500 flex items-center justify-center flex-shrink-0 shadow-clay">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-oat-light p-3.5 rounded-feature rounded-tl-none border border-oat-border shadow-clay">
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 bg-lemon-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-slushie-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-lemon-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-oat-border bg-pure-white/80 backdrop-blur-sm">
            <div className="flex gap-2.5">
              <motion.button 
                whileHover={{ rotateZ: -12, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 text-warm-silver hover:text-dark-charcoal hover:bg-oat-light rounded-card transition-all clay-focus shadow-clay"
              >
                📎
              </motion.button>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask AI Video Agent anything..."
                  className="w-full px-4 py-3 pr-11 bg-oat-light border border-oat-border rounded-card text-dark-charcoal placeholder-warm-silver focus:outline-none focus:border-lemon-500 focus:ring-2 focus:ring-lemon-500/20 resize-none max-h-24 text-small scrollbar-thin"
                  rows={1}
                />
                {inputValue && (
                  <button
                    onClick={() => setInputValue('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warm-silver hover:text-dark-charcoal transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <motion.button
                whileHover={{ 
                  rotateZ: -8, 
                  scale: 1.08,
                  boxShadow: 'rgba(59,211,253,0.3) -4px 4px'
                }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "p-3 rounded-feature transition-all flex items-center justify-center shadow-clay",
                  inputValue.trim() && !isTyping
                    ? "bg-gradient-to-r from-lemon-500 to-slushie-500 text-clay-black cursor-pointer"
                    : "bg-oat-light text-warm-silver cursor-not-allowed"
                )}
              >
                {isTyping ? '⏳' : (
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ➤
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Video Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-warm-cream">
          {/* Editor Toolbar */}
          <div className="h-13 bg-pure-white border-b border-oat-border flex items-center px-4 py-2 shadow-clay gap-2">
            <motion.button
              whileHover={{ rotateZ: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-warm-silver hover:text-dark-charcoal hover:bg-oat-light rounded-card transition-all clay-focus shadow-clay"
              title="Assets"
            >
              📁
            </motion.button>
            
            <div className="w-px h-6 bg-oat-border"></div>
            
            <motion.button
              whileHover={{ rotateZ: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-warm-silver hover:text-dark-charcoal hover:bg-oat-light rounded-card transition-all clay-focus shadow-clay"
              title="Undo"
            >
              ↶
            </motion.button>
            
            <motion.button
              whileHover={{ rotateZ: 4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-warm-silver hover:text-dark-charcoal hover:bg-oat-light rounded-card transition-all clay-focus shadow-clay"
              title="Redo"
            >
              ↷
            </motion.button>

            <div className="flex-1"></div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-warm-silver hover:text-dark-charcoal hover:bg-oat-light rounded-card transition-all clay-focus shadow-clay"
              >
                🔍-
              </motion.button>
              
              <select className="px-3 py-1.5 bg-oat-light border border-oat-border rounded-card text-dark-charcoal text-xs focus:outline-none focus:border-lemon-500 clay-focus shadow-clay cursor-pointer">
                <option>100%</option>
                <option>75%</option>
                <option>50%</option>
                <option>25%</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-warm-silver hover:text-dark-charcoal hover:bg-oat-light rounded-card transition-all clay-focus shadow-clay"
              >
                🔍+
              </motion.button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="h-[45%] bg-gradient-to-br from-oat-light via-pure-white to-oat-light border-b border-oat-border flex items-center justify-center relative overflow-hidden">
            {/* Decorative Elements */}
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-lemon-400/10 via-transparent to-slushie-500/10 pointer-events-none"
            ></motion.div>
            
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-lemon-500 to-slushie-500 rounded-section flex items-center justify-center mx-auto shadow-hard relative overflow-hidden">
                  <span className="text-5xl relative z-10">📺</span>
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                  ></motion.div>
                </div>
              </motion.div>
              
              <p className="text-warm-charcoal text-body-standard mb-2">Video Preview</p>
              <p className="text-warm-silver text-caption">AI-generated content will appear here</p>
              
              {/* Preview Controls */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-pure-white rounded-full shadow-clay flex items-center justify-center text-dark-charcoal hover:bg-lemon-400/20 transition-all clay-focus"
                >
                  ⏮
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-14 h-14 bg-gradient-to-br from-lemon-500 to-slushie-500 rounded-full shadow-hard flex items-center justify-center text-clay-black clay-focus relative overflow-hidden"
                >
                  <span className="text-xl relative z-10">▶</span>
                  <motion.div
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                  ></motion.div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-pure-white rounded-full shadow-clay flex items-center justify-center text-dark-charcoal hover:bg-slushie-500/20 transition-all clay-focus"
                >
                  ⏭
                </motion.button>
              </div>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="flex-1 bg-pure-white border-t border-oat-border overflow-hidden">
            <StudioTimeline />
          </div>
        </div>

        {/* Right Inspector Panel (Optional) */}
        {showInspector && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: inspectorWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-l border-oat-border bg-pure-white overflow-hidden"
          >
            <StudioInspector />
          </motion.div>
        )}
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
