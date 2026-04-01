'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, generateId, formatTime } from '@/lib'
import { ChatMessage } from '@/types'

interface AIChatInterfaceProps {
  onApplySuggestion?: (suggestion: any) => void
  onGenerateScript?: (prompt: string) => void
}

const QUICK_SUGGESTIONS = [
  { label: '🎬 Create intro scene', prompt: 'Create an engaging intro scene for my video' },
  { label: '📝 Add captions', prompt: 'Add automatic captions to my video' },
  { label: '🎵 Suggest music', prompt: 'Suggest background music that fits my content' },
  { label: '✨ Add effects', prompt: 'Add visual effects to make my video more engaging' },
  { label: '📊 Trim video', prompt: 'Help me trim and refine my video' },
  { label: '🎯 Target social', prompt: 'Optimize this video for social media platforms' }
]

const SAMPLE_RESPONSES = [
  "I'd be happy to help you create an amazing video! Let's start by understanding what you're trying to create. What's the main message or story you want to tell?",
  "Great idea! Let's work on that together. I can help you with script generation, media selection, timing adjustments, and more. What would you like to focus on first?",
  "Perfect! I've analyzed your current project and have some suggestions. Let's break this down into manageable steps. First, let's make sure we have the right structure for your content..."
]

export default function AIChatInterface({ onApplySuggestion, onGenerateScript }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: "Hi! I'm your AI video creation assistant. I can help you with script generation, editing suggestions, media recommendations, and more. What would you like to create today?",
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
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

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const assistantMessage: ChatMessage = {
      id: generateId(),
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

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-purple-900/30 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Assistant</h3>
            <p className="text-slate-400 text-xs">Ready to help you create</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length <= 1 && (
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-3 font-medium">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded-lg transition-all border border-slate-700 hover:border-slate-600"
                >
                  {suggestion.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              message.role === 'user'
                ? "bg-gradient-to-br from-blue-600 to-blue-500"
                : "bg-gradient-to-br from-purple-600 to-indigo-600"
            )}>
              <span className="text-sm">
                {message.role === 'user' ? '👤' : '🤖'}
              </span>
            </div>
            <div className={cn(
              "max-w-[85%]",
              message.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-3 rounded-2xl",
                message.role === 'user'
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none"
                  : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
              )}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1 px-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="flex gap-2">
          <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            📎
          </button>
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about video creation..."
              className="w-full px-4 py-2.5 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none max-h-32"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              "p-2.5 rounded-xl transition-all flex items-center justify-center",
              inputValue.trim() && !isTyping
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
          >
            {isTyping ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  )
}
