'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { cn, generateId } from '@/lib'
import { ChatMessage } from '@/types'

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
    setIsResizing(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = moveEvent.clientX
      if (newWidth >= 300 && newWidth <= 600) {
        setChatWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

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

      {/* Right Panel - Canvas / Assets Gallery */}
      <div className="flex-1 flex flex-col bg-[#fafafa]">
        {/* Canvas Toolbar */}
        <div className="h-14 border-b border-oat-border bg-pure-white flex items-center justify-between px-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-dark-charcoal">Canvas</span>
              <span className="text-xs text-warm-silver">•</span>
              <span className="text-xs text-warm-silver">{canvasItems.length} items</span>
            </div>
            
            <div className="flex items-center gap-2 ml-6">
              <button className="px-3 py-1.5 text-xs font-medium text-dark-charcoal bg-oat-light rounded-card hover:bg-lemon-400/20 hover:text-lemon-700 transition-all">
                1.00x
              </button>
              <button className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded transition-colors">
                −
              </button>
              <button className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded transition-colors">
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-1.5 text-xs font-medium text-dark-charcoal bg-gradient-to-r from-lemon-500 to-slushie-500 rounded-card shadow-clay hover:shadow-md transition-all flex items-center gap-2">
              + Upload
            </button>
            <button className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded transition-colors">
              ⬇️ Library
            </button>
            <button className="p-1.5 text-warm-silver hover:text-dark-charcoal rounded transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* Canvas Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4">
            <p className="text-sm text-warm-silver mb-1">To insert canvas, hold mouse wheel or spacebar while dragging, or use the hand tool</p>
          </div>

          {/* Generation Status */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-gradient-to-r from-lemon-400/20 to-slushie-500/20 rounded-feature border border-lemon-500/30"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-lemon-500 border-t-transparent rounded-full"
                  ></motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark-charcoal mb-1">Generating your creative content...</p>
                    <div className="w-full h-1.5 bg-oat-light rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-lemon-500 to-slushie-500 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas Grid - Generated Items with Drag & Drop */}
          <div className="bg-white rounded-section p-6 border-2 border-oat-border shadow-clay min-h-[500px] relative overflow-hidden">
            {/* Canvas Toolbar */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-pure-white border border-oat-border rounded-card text-xs text-warm-silver hover:text-dark-charcoal shadow-sm transition-all"
              >
                ↺ Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-pure-white border border-oat-border rounded-card text-xs text-warm-silver hover:text-dark-charcoal shadow-sm transition-all"
              >
                ⊞ Grid
              </motion.button>
            </div>

            <div className="relative" style={{ minHeight: '500px' }}>
              {canvasItems.map((item, idx) => {
                const position = itemPositions[item.id] || { x: 0, y: 0 }
                const isDragged = draggedItem === item.id

                return (
                  <motion.div
                    key={item.id}
                    drag
                    dragMomentum={false}
                    dragElastic={0.1}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: position.x,
                      y: position.y,
                    }}
                    whileHover={{
                      y: position.y - 6,
                      scale: 1.03,
                      boxShadow: selectedItem === item.id
                        ? 'rgba(59,211,253,0.35) 0px 16px 32px'
                        : isDragged
                          ? 'rgba(251,189,65,0.4) 0px 20px 40px'
                          : 'rgba(0,0,0,0.1) 0px 12px 24px'
                    }}
                    whileDrag={{ scale: 1.08, zIndex: 100 }}
                    onDragStart={() => handleDragStart(item.id)}
                    onDragEnd={(e, info) => handleDragEnd(item.id, info)}
                    onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                    className={cn(
                      "absolute w-[calc(33.333%-11px)] aspect-square rounded-feature cursor-grab active:cursor-grabbing transition-all overflow-hidden group",
                      selectedItem === item.id
                        ? "ring-4 ring-slushie-500 shadow-lg z-50"
                        : "border-2 border-oat-border hover:border-slushie-300",
                      isDragged && "z-50 shadow-2xl"
                    )}
                    style={{
                      backgroundColor: item.color + '30',
                      left: `${(idx % 3) * 33.333}%`,
                      top: `${Math.floor(idx / 3) * 180 + Math.floor(idx / 3) * 16}px`
                    }}
                  >
                    {/* Item Preview Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        whileHover={{ scale: 1.2, rotateZ: 10 }}
                        className="text-6xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none"
                      >
                        {item.emoji}
                      </motion.span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                      <div>
                        <p className="text-white text-sm font-semibold">{item.title}</p>
                        <p className="text-white/70 text-xs capitalize">{item.type}</p>
                      </div>
                    </div>

                    {/* Selection Checkmark */}
                    <AnimatePresence>
                      {selectedItem === item.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          className="absolute top-2 right-2 w-7 h-7 bg-slushie-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                        >
                          <span className="text-white text-sm font-bold">✓</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Drag Handle Indicator */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs">⋮⋮</span>
                      </div>
                    </div>

                    {/* Item Number Badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-dark-charcoal shadow-sm group-hover:hidden">
                      {idx + 1}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Empty State / Hint */}
            {canvasItems.length === 0 && !isGenerating && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl mb-4"
                >🎨</motion.div>
                <p className="text-lg font-semibold text-dark-charcoal mb-2">Your canvas is empty</p>
                <p className="text-sm text-warm-silver max-w-sm">
                  Start a conversation with the AI assistant to generate creative content, or upload your own assets
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-oat-border bg-pure-white flex items-center justify-between px-5 text-xs text-warm-silver">
          <div className="flex items-center gap-4">
            <span>Canvas: {selectedItem ? `${canvasItems.find(i => i.id === selectedItem)?.title} selected` : 'No selection'}</span>
            <span>•</span>
            <span>{canvasItems.length} items total</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Zoom: 27%</span>
            <span>•</span>
            <span>Grid View</span>
          </div>
        </div>
      </div>
    </div>
  )
}
