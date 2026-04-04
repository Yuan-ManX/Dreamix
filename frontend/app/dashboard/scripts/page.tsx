'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib'

interface Scene {
  scene_id: string
  scene_type: string
  title: string
  description: string
  narration: string
  duration: number
  visual_suggestions: string[]
  media_requirements: string[]
}

interface Script {
  script_id: string
  title: string
  theme: string
  style: string
  target_duration: number
  total_duration: number
  scenes: Scene[]
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const SCRIPT_STYLES = [
  { id: 'casual', label: 'Casual', icon: '😊', desc: 'Friendly and conversational' },
  { id: 'professional', label: 'Professional', icon: '💼', desc: 'Formal and business-like' },
  { id: 'humorous', label: 'Humorous', icon: '😄', desc: 'Fun and entertaining' },
  { id: 'dramatic', label: 'Dramatic', icon: '🎭', desc: 'Emotional and intense' },
  { id: 'inspirational', label: 'Inspirational', icon: '✨', desc: 'Motivating and uplifting' },
  { id: 'educational', label: 'Educational', icon: '📚', desc: 'Informative and instructional' }
]

const QUICK_SUGGESTIONS = [
  { label: '📝 Generate script', prompt: 'Create a complete video script with scenes, narration, and visual suggestions' },
  { label: '✍️ Refine current script', prompt: 'Help me improve and optimize the current script for better engagement' },
  { label: '🎬 Add more scenes', prompt: 'Add additional scenes to expand the narrative and provide more detail' },
  { label: '💡 Creative suggestions', prompt: 'Give me creative ideas to make this script more unique and compelling' },
]

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScriptDetail, setShowScriptDetail] = useState(false)

  // Create Script Form State
  const [theme, setTheme] = useState('')
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState('casual')
  const [targetDuration, setTargetDuration] = useState(60)

  // AI Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: "Hi! I'm your AI Script Assistant. I can help you create compelling scripts, storyboards, and narratives for your videos. Tell me what you want to create, or use the quick suggestions below!",
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadScripts()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const loadScripts = async () => {
    try {
      const response = await fetch('/api/v1/script/')
      if (response.ok) {
        const data = await response.json()
        if (data.scripts) {
          const detailedScripts = await Promise.all(
            data.scripts.map(async (s: any) => {
              const res = await fetch(`/api/v1/script/${s.script_id}`)
              return res.json()
            })
          )
          setScripts(detailedScripts)
        }
      }
    } catch (error) {
      console.error('Failed to load scripts:', error)
    }
  }

  const handleGenerateScript = async () => {
    if (!theme.trim()) return

    setIsLoading(true)
    setShowCreateModal(false)

    try {
      const response = await fetch('/api/v1/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme,
          title: title || undefined,
          style: style,
          target_duration: targetDuration
        })
      })

      if (response.ok) {
        const newScript = await response.json()
        setScripts(prev => [newScript, ...prev])
        setCurrentScript(newScript)
        setShowScriptDetail(true)

        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Great! I've generated a script titled "${newScript.title}" with ${newScript.scenes.length} scenes. Total duration: ${newScript.total_duration.toFixed(1)}s. You can view it in the editor on the right, or ask me to refine it!`,
          timestamp: new Date().toISOString()
        }])
      }

      setTheme('')
      setTitle('')
      setStyle('casual')
      setTargetDuration(60)
    } catch (error) {
      console.error('Failed to generate script:', error)
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating the script. Please try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefineScript = async (refinementRequest: string) => {
    if (!currentScript) return

    setIsTyping(true)

    try {
      const response = await fetch(`/api/v1/script/${currentScript.script_id}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_id: currentScript.script_id,
          refinement_request: refinementRequest
        })
      })

      if (response.ok) {
        const refinedScript = await response.json()
        setCurrentScript(refinedScript)
        setScripts(prev => prev.map(s =>
          s.script_id === refinedScript.script_id ? refinedScript : s
        ))
      }
    } catch (error) {
      console.error('Failed to refine script:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    if (inputValue.toLowerCase().includes('generate') && !currentScript) {
      await handleGenerateScriptFromChat(inputValue)
    } else if (currentScript && (inputValue.toLowerCase().includes('refine') || inputValue.toLowerCase().includes('improve'))) {
      await handleRefineScript(inputValue)
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: `I've refined your script based on your request. Check the updated version in the editor! The script now has ${currentScript?.scenes.length || 0} scenes with improved narration and suggestions.`,
        timestamp: new Date().toISOString()
      }])
    } else {
      const responses = [
        "I understand what you're looking for! Let me help you craft a compelling narrative that engages your audience from start to finish.",
        "That's a great direction! I can help you structure this into well-defined scenes with clear objectives and emotional beats.",
        "Excellent idea! I'll incorporate that into the script while maintaining coherence and flow throughout the narrative.",
        "I love that approach! Let me suggest some creative ways to visualize this concept and bring it to life."
      ]

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      }])
    }

    setIsTyping(false)
  }

  const handleGenerateScriptFromChat = async (prompt: string) => {
    setIsLoading(true)

    try {
      const extractedTheme = prompt.replace(/generate|create|write|script|video/gi, '').trim() || 'Creative Story'

      const response = await fetch('/api/v1/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: extractedTheme,
          style: style,
          target_duration: targetDuration
        })
      })

      if (response.ok) {
        const newScript = await response.json()
        setScripts(prev => [newScript, ...prev])
        setCurrentScript(newScript)
        setShowScriptDetail(true)

        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-resp`,
          role: 'assistant',
          content: `Perfect! I've created a script titled "${newScript.title}" for you. It contains ${newScript.scenes.length} scenes with a total duration of ${newScript.total_duration.toFixed(1)} seconds. You can see it in the editor panel. Would you like me to refine any part of it?`,
          timestamp: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Error generating script from chat:', error)
    } finally {
      setIsLoading(false)
    }
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

  const toggleChat = () => setIsChatCollapsed(!isChatCollapsed)

  const getSceneTypeIcon = (type: string) => {
    switch (type) {
      case 'intro': return '🎬'
      case 'outro': return '🎯'
      case 'transition': return '🔄'
      default: return '📝'
    }
  }

  const getStyleColor = (styleName: string) => {
    switch (styleName) {
      case 'professional': return 'from-blue-500 to-blue-700'
      case 'humorous': return 'from-yellow-500 to-orange-500'
      case 'dramatic': return 'from-purple-500 to-purple-700'
      case 'inspirational': return 'from-pink-500 to-rose-600'
      case 'educational': return 'from-green-500 to-green-700'
      default: return 'from-lemon-500 to-slushie-500'
    }
  }

  return (
    <div className="h-full flex bg-warm-cream">
      {/* LEFT PANEL - AI Chat Interface */}
      {!isChatCollapsed && (
        <motion.div
          initial={{ width: 380, opacity: 1 }}
          animate={{ width: isChatCollapsed ? 0 : 380, opacity: isChatCollapsed ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col border-r border-oat-border bg-pure-white overflow-hidden"
          style={{ maxWidth: isChatCollapsed ? 0 : 380, minWidth: isChatCollapsed ? 0 : 300 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-oat-border bg-gradient-to-r from-matcha-400/10 via-lemon-500/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotateZ: -8, scale: 1.05 }}
                className="w-12 h-12 bg-gradient-to-br from-matcha-500 to-lemon-600 rounded-feature flex items-center justify-center shadow-clay relative overflow-hidden"
              >
                <span className="text-2xl relative z-10">📝</span>
                <motion.div
                  initial={{ x: '-100%', opacity: 0.5 }}
                  whileHover={{ x: '200%', opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                ></motion.div>
              </motion.div>
              <div>
                <h3 className="text-sub-heading text-clay-black font-roobert font-semibold">AI Script Studio</h3>
                <p className="text-caption text-warm-silver">Intelligent script generation</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleChat}
              className="p-2 hover:bg-oat-light rounded-lg transition-colors"
              title="Collapse chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.button>
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
                    boxShadow: 'rgba(134,169,134,0.15) 0px 4px 12px'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-3 py-2 bg-oat-light text-dark-charcoal text-xs rounded-card font-medium hover:bg-matcha-400/20 hover:text-matcha-700 transition-all clay-focus border border-oat-border"
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
                        ? "bg-gradient-to-r from-matcha-500 to-lemon-500 text-clay-black rounded-tr-none font-medium shadow-clay"
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
                          className="w-2 h-2 bg-matcha-500 rounded-full"
                        ></motion.div>
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                          className="w-2 h-2 bg-lemon-500 rounded-full"
                        ></motion.div>
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                          className="w-2 h-2 bg-matcha-500 rounded-full"
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
                  placeholder="Ask AI Script Agent..."
                  className="w-full px-4 py-3 pr-12 bg-oat-light border-2 border-oat-border rounded-card text-body-standard text-dark-charcoal placeholder:text-warm-silver focus:outline-none focus:border-matcha-500 focus:bg-pure-white transition-all clay-focus shadow-clay"
                  disabled={isTyping}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.08, rotateZ: -8 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-matcha-500 to-lemon-500 text-clay-black rounded-card font-bold text-lg shadow-hard hover:shadow-lg transition-all clay-focus disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
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
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs text-matcha-600 hover:text-matcha-700 font-medium"
              >
                + Advanced Create
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Toggle Chat Button (when collapsed) */}
      {isChatCollapsed && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleChat}
          className="m-2 p-3 bg-gradient-to-r from-matcha-500 to-lemon-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          title="Open AI Chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      )}

      {/* RIGHT PANEL - Script Editor & Library */}
      <div className="flex-1 flex flex-col min-w-0 bg-warm-cream overflow-hidden">
        {showScriptDetail && currentScript ? (
          /* Script Detail View */
          <div className="h-full overflow-y-auto p-6 scrollbar-thin">
            {/* Script Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-pure-white rounded-xl border border-oat-border shadow-sm p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-clay-black font-roobert mb-2">{currentScript.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r", getStyleColor(currentScript.style))}>
                      {currentScript.style}
                    </span>
                    <span className="text-sm text-warm-silver">Theme: {currentScript.theme}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowScriptDetail(false)}
                    className="px-4 py-2 bg-oat-light text-dark-charcoal rounded-lg text-sm font-medium hover:bg-oat-border transition-colors"
                  >
                    ← Back to Library
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-oat-light rounded-lg p-3 text-center">
                  <p className="text-xs text-warm-silver mb-1">Total Duration</p>
                  <p className="text-lg font-bold text-clay-black">{currentScript.total_duration.toFixed(1)}s</p>
                </div>
                <div className="bg-oat-light rounded-lg p-3 text-center">
                  <p className="text-xs text-warm-silver mb-1">Scenes</p>
                  <p className="text-lg font-bold text-clay-black">{currentScript.scenes.length}</p>
                </div>
                <div className="bg-oat-light rounded-lg p-3 text-center">
                  <p className="text-xs text-warm-silver mb-1">Target</p>
                  <p className="text-lg font-bold text-clay-black">{currentScript.target_duration}s</p>
                </div>
              </div>
            </motion.div>

            {/* Scenes List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-clay-black font-roobert mb-4">📋 Scenes</h3>
              <AnimatePresence>
                {currentScript.scenes.map((scene, index) => (
                  <motion.div
                    key={scene.scene_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-pure-white rounded-xl border border-oat-border shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-matcha-400 to-lemon-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getSceneTypeIcon(scene.scene_type)}</span>
                          <h4 className="text-base font-semibold text-clay-black">{scene.title}</h4>
                          <span className="px-2 py-0.5 bg-oat-light rounded text-[10px] text-warm-silver uppercase">
                            {scene.scene_type}
                          </span>
                          <span className="ml-auto text-xs text-warm-silver">{scene.duration}s</span>
                        </div>

                        <p className="text-sm text-dark-charcoal mb-3 leading-relaxed">{scene.description}</p>

                        {scene.narration && (
                          <div className="bg-matcha-50/50 rounded-lg p-3 mb-3 border-l-4 border-matcha-500">
                            <p className="text-xs text-matcha-700 font-semibold mb-1">🎙️ Narration:</p>
                            <p className="text-sm text-clay-black italic">{scene.narration}</p>
                          </div>
                        )}

                        {(scene.visual_suggestions?.length > 0 || scene.media_requirements?.length > 0) && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {scene.visual_suggestions?.length > 0 && (
                              <div className="bg-lemon-50/50 rounded-lg p-3">
                                <p className="text-xs text-lemon-700 font-semibold mb-1">🎨 Visual Ideas:</p>
                                <ul className="text-xs text-clay-black space-y-1">
                                  {scene.visual_suggestions.map((suggestion, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span>•</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {scene.media_requirements?.length > 0 && (
                              <div className="bg-slushie-50/50 rounded-lg p-3">
                                <p className="text-xs text-slushie-700 font-semibold mb-1">📹 Media Needed:</p>
                                <ul className="text-xs text-clay-black space-y-1">
                                  {scene.media_requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span>•</span>
                                      <span>{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Script Library View */
          <div className="h-full overflow-y-auto p-6 scrollbar-thin">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-section-heading text-clay-black mb-2 font-roobert">📝 Script Library</h1>
                  <p className="text-body-large text-warm-silver">{scripts.length} scripts • AI-powered creation & management</p>
                </div>
                <motion.button
                  whileHover={{ rotateZ: -8, y: -16, boxShadow: 'rgb(0,0,0) -7px 7px' }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowCreateModal(true)}
                  className="px-13 py-3 bg-lemon-500 text-dark-charcoal font-medium rounded-pill shadow-clay hover:bg-lemon-700 clay-focus"
                  style={{ fontSize: '16px', fontWeight: '500' }}
                >
                  + New Script
                </motion.button>
              </div>

              {/* Scripts Grid */}
              {scripts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-pure-white rounded-xl border border-dashed-oat shadow-sm"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 bg-gradient-to-br from-matcha-400/30 to-lemon-500/30 rounded-xl flex items-center justify-center mx-auto mb-6"
                  >
                    <span className="text-5xl">📝</span>
                  </motion.div>
                  <h3 className="text-xl text-clay-black mb-3 font-roobert">No scripts yet</h3>
                  <p className="text-sm text-warm-silver mb-6 max-w-md mx-auto">
                    Start creating compelling scripts with AI assistance. Generate complete video scripts with scenes, narration, and visual suggestions.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-matcha-500 to-lemon-500 text-white rounded-full shadow-md hover:shadow-lg inline-flex items-center gap-2 font-medium"
                  >
                    <span>✨</span>
                    <span>Create Your First Script</span>
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {scripts.map((script, index) => (
                      <motion.div
                        key={script.script_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -6, boxShadow: 'rgba(0,0,0,0.15) 0px 12px 24px' }}
                        className="bg-pure-white rounded-xl border border-oat-border shadow-sm cursor-pointer overflow-hidden group"
                        onClick={() => {
                          setCurrentScript(script)
                          setShowScriptDetail(true)
                        }}
                      >
                        {/* Card Header */}
                        <div className={cn("h-2 bg-gradient-to-r", getStyleColor(script.style))}></div>

                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-clay-black font-roobert mb-1 group-hover:text-matcha-600 transition-colors">
                                {script.title}
                              </h3>
                              <p className="text-sm text-warm-silver">{script.theme}</p>
                            </div>
                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-medium text-white bg-gradient-to-r", getStyleColor(script.style))}>
                              {script.style}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-warm-silver mb-4">
                            <span>🎬 {script.scenes.length} scenes</span>
                            <span>⏱️ {script.total_duration.toFixed(1)}s</span>
                            <span>📅 {new Date(script.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Scene Preview */}
                          <div className="space-y-2">
                            {script.scenes.slice(0, 3).map((scene, idx) => (
                              <div key={scene.scene_id} className="flex items-center gap-2 text-xs">
                                <span>{getSceneTypeIcon(scene.scene_type)}</span>
                                <span className="text-clay-black truncate flex-1">{scene.title}</span>
                                <span className="text-warm-silver">{scene.duration}s</span>
                              </div>
                            ))}
                            {script.scenes.length > 3 && (
                              <p className="text-xs text-warm-silver italic text-center pt-1">
                                +{script.scenes.length - 3} more scenes...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-matcha-500/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 pt-8">
                          <p className="text-white text-sm font-medium text-center">Click to View Details →</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Script Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-clay-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-pure-white rounded-xl p-8 max-w-2xl w-full border border-oat-border shadow-hard relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-matcha-500 to-lemon-500"></div>

              <h3 className="text-2xl font-bold text-clay-black mb-2 font-roobert">✨ Create New Script</h3>
              <p className="text-sm text-warm-silver mb-6">Generate a complete AI-powered video script</p>

              <div className="space-y-5">
                {/* Theme Input */}
                <div>
                  <label className="block text-sm font-semibold text-clay-black mb-2">Theme / Topic *</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., Product Launch, Educational Tutorial, Brand Story..."
                    className="w-full px-4 py-3 bg-oat-light border-2 border-oat-border rounded-lg text-sm focus:outline-none focus:border-matcha-500 focus:bg-pure-white transition-all"
                  />
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-clay-black mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Auto-generated if left empty"
                    className="w-full px-4 py-3 bg-oat-light border-2 border-oat-border rounded-lg text-sm focus:outline-none focus:border-matcha-500 focus:bg-pure-white transition-all"
                  />
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-semibold text-clay-black mb-3">Content Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {SCRIPT_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          style === s.id
                            ? 'border-matcha-500 bg-matcha-50 shadow-md'
                            : 'border-oat-border hover:border-oat-hover hover:bg-oat-light'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{s.icon}</span>
                        <p className="text-sm font-semibold text-clay-black">{s.label}</p>
                        <p className="text-[10px] text-warm-silver">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <label className="block text-sm font-semibold text-clay-black mb-2">
                    Target Duration: {targetDuration}s
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="300"
                    step="15"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(Number(e.target.value))}
                    className="w-full h-2 bg-oat-light rounded-lg appearance-none cursor-pointer accent-matcha-500"
                  />
                  <div className="flex justify-between text-xs text-warm-silver mt-1">
                    <span>15s</span>
                    <span>1min</span>
                    <span>2min</span>
                    <span>5min</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-oat-light text-dark-charcoal rounded-full font-medium hover:bg-oat-border transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateScript}
                  disabled={!theme.trim() || isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-matcha-500 to-lemon-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      ></motion.div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate Script</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
