'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { cn, generateId } from '@/lib'
import { ChatMessage } from '@/types'
import JaazCanvas from './JaazCanvas'

interface AICanvaProps {
  onApplySuggestion?: (suggestion: any) => void
  onGenerateScript?: (prompt: string) => void
}

const QUICK_SUGGESTIONS = [
  { label: '🎨 Generate illustrations', prompt: 'Generate a set of 6 bakery or food related illustration images' },
  { label: '📝 Create storyboards', prompt: 'Create a storyboard for my video project' },
  { label: '🎬 Design characters', prompt: 'Design character sheets for my animation' },
  { label: '✨ Add visual effects', prompt: 'Add visual effects to make my video more engaging' },
  { label: '🎵 Suggest assets', prompt: 'Suggest media assets that fit my content' },
  { label: '🖼️ Create backgrounds', prompt: 'Generate background images for my scenes' }
]

const SAMPLE_CANVAS_ITEMS = [
  { id: 1, type: 'illustration', title: 'Strawberry Cake', color: '#FFB6C1', emoji: '🍰' },
  { id: 2, type: 'illustration', title: 'Cupcake', color: '#FFC0CB', emoji: '🧁' },
  { id: 3, type: 'illustration', title: 'Pound Cake', color: '#FFDAB9', emoji: '🎂' },
  { id: 4, type: 'illustration', title: 'Donut', color: '#FFA07A', emoji: '🍩' },
  { id: 5, type: 'illustration', title: 'Croissant', color: '#DEB887', emoji: '🥐' },
  { id: 6, type: 'illustration', title: 'Muffin', color: '#FFB6C1', emoji: '🧁' }
]

interface CanvasItemPosition {
  x: number
  y: number
}

export default function AICanva({ onApplySuggestion, onGenerateScript }: AICanvaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: "Hi! I'm your AI creative assistant. I can help you generate illustrations, design assets, and create visual content. What would you like to create today?",
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [canvasItems, setCanvasItems] = useState(SAMPLE_CANVAS_ITEMS)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [itemPositions, setItemPositions] = useState<Record<number, CanvasItemPosition>>({})
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Resizable Panel
  const [chatWidth, setChatWidth] = useState(420)
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setIsGenerating(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `Great! I'm generating your request. Here are the results I've created for you. You can click on any item to view it in detail or ask me to refine specific elements.`,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
    setIsGenerating(false)
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

  const handleDragStart = (itemId: number) => {
    setDraggedItem(itemId)
  }

  const handleDragEnd = (itemId: number, info: { point: { x: number; y: number } }) => {
    setItemPositions(prev => ({
      ...prev,
      [itemId]: { x: info.point.x, y: info.point.y }
    }))
    setDraggedItem(null)
  }

  // Resizable Panel Handler
  const handleResizeMouseDown = (e: React.MouseEvent) => {
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
    <div className="h-full flex bg-warm-cream">
      {/* Left Panel - AI Chat */}
      <div
        className="flex flex-col border-r border-oat-border bg-pure-white"
        style={{ width: chatWidth, minWidth: 300, maxWidth: 600 }}
      >
        {/* Header */}
        <div className="p-5 border-b border-oat-border bg-gradient-to-r from-lemon-500/10 via-slushie-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotateZ: -8, scale: 1.05 }}
              className="w-12 h-12 bg-gradient-to-br from-lemon-500 to-slushie-500 rounded-feature flex items-center justify-center shadow-clay relative overflow-hidden"
            >
              <span className="text-2xl relative z-10">🎨</span>
              <motion.div
                initial={{ x: '-100%', opacity: 0.5 }}
                whileHover={{ x: '200%', opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              ></motion.div>
            </motion.div>
            <div>
              <h3 className="text-sub-heading text-clay-black font-roobert font-semibold">AI Canva</h3>
              <p className="text-caption text-warm-silver">Creative generation assistant</p>
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
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
            {messages.map((message) => (
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
          </AnimatePresence>

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
                placeholder="Describe what you want to create..."
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-1.5 bg-gradient-to-r from-lemon-500 to-slushie-500 text-white text-xs font-semibold rounded-pill hover:shadow-lg transition-all clay-focus disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>✨</span>
                <span>Generate with AI</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div
        onMouseDown={handleResizeMouseDown}
        className={`w-1.5 bg-oat-border hover:bg-slushie-500 cursor-col-resize transition-colors flex-shrink-0 relative group ${isResizing ? 'bg-slushie-500' : ''}`}
      >
        <div className="absolute inset-y-0 -left-1 -right-1"></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full transition-colors ${isResizing ? 'bg-white' : 'bg-warm-silver group-hover:bg-slushie-600'}`}></div>
      </div>

      {/* Right Panel - Jaaz Magic Canvas (Infinite Canvas) */}
      <div className="flex-1 flex flex-col bg-[#faf9f7]">
        <JaazCanvas />
      </div>
    </div>
  )
}
