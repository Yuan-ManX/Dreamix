'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib'

interface AgentTask {
  id: string
  prompt: string
  contentType: 'video' | 'audio' | 'image' | 'multimodal'
  status: 'pending' | 'planning' | 'generating' | 'reviewing' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createdAt: string
  assets?: string[]
}

interface CreativeAgentPanelProps {
  isOpen: boolean
  onClose: () => void
  onAssetGenerated?: (asset: any) => void
}

const AGENT_TYPES = [
  { id: 'video', name: 'Video Creator', icon: '🎬', color: 'from-purple-500 to-pink-500', description: 'AI-powered video generation with camera control' },
  { id: 'audio', name: 'Audio Studio', icon: '🎵', color: 'from-blue-500 to-cyan-500', description: 'Music, sound design, and voice synthesis' },
  { id: 'image', name: 'Image Artist', icon: '🎨', color: 'from-green-500 to-emerald-500', description: 'Image generation, editing, and style transfer' },
  { id: 'multimodal', name: 'Multi-Modal Orchestrator', icon: '🚀', color: 'from-orange-500 to-red-500', description: 'Coordinate video, audio & image creation' }
]

const QUICK_TEMPLATES = [
  { category: 'Video', items: [
    { prompt: 'Cinematic product showcase with smooth camera movements and dramatic lighting', type: 'video' },
    { prompt: 'Animated explainer video with modern flat design style', type: 'video' },
    { prompt: 'Social media short-form content with dynamic transitions', type: 'video' }
  ]},
  { category: 'Audio', items: [
    { prompt: 'Upbeat electronic background music for tech videos, 120 BPM, energetic mood', type: 'audio' },
    { prompt: 'Cinematic orchestral soundtrack with emotional build-up', type: 'audio' },
    { prompt: 'Professional voiceover narration with clear articulation, warm tone', type: 'audio' }
  ]},
  { category: 'Image', items: [
    { prompt: 'Ultra-realistic product photography with studio lighting, white background', type: 'image' },
    { prompt: 'Abstract digital art with vibrant colors and geometric patterns', type: 'image' },
    { prompt: 'Character concept art in anime style, detailed features, dynamic pose', type: 'image' }
  ]}
]

export default function CreativeAgentPanel({ isOpen, onClose, onAssetGenerated }: CreativeAgentPanelProps) {
  const [selectedAgentType, setSelectedAgentType] = useState<string>('video')
  const [promptInput, setPromptInput] = useState('')
  const [advancedParams, setAdvancedParams] = useState({
    quality: 'high',
    style: 'realistic',
    duration: 10,
    iterations: 1,
    autoRefine: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [comfyuiStatus, setComfyuiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  useEffect(() => {
    if (isOpen) {
      checkComfyUIStatus()
    }
  }, [isOpen])

  const checkComfyUIStatus = async () => {
    setComfyuiStatus('checking')
    try {
      const response = await fetch('/api/v1/creative/comfyui/status', { method: 'POST' })
      const data = await response.json()
      setComfyuiStatus(data.connected ? 'connected' : 'disconnected')
    } catch {
      setComfyuiStatus('disconnected')
    }
  }

  const handleGenerate = useCallback(async () => {
    if (!promptInput.trim() || isGenerating) return

    setIsGenerating(true)

    const newTask: AgentTask = {
      id: `task-${Date.now()}`,
      prompt: promptInput,
      contentType: selectedAgentType as any,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [newTask, ...prev])
    setActiveTaskId(newTask.id)

    try {
      const createResponse = await fetch('/api/v1/creative/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          content_type: selectedAgentType,
          parameters: advancedParams
        })
      })

      const createData = await createResponse.json()

      if (createData.success) {
        setTasks(prev => prev.map(t =>
          t.id === newTask.id ? { ...t, status: 'generating' as const, progress: 10 } : t
        ))

        const executeResponse = await fetch(`/api/v1/creative/tasks/${createData.task_id}/execute`, {
          method: 'POST'
        })

        if (executeResponse.ok) {
          await pollTaskStatus(createData.task_id, newTask.id)
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      setTasks(prev => prev.map(t =>
        t.id === newTask.id ? { ...t, status: 'failed' as const, error: String(error) } : t
      ))
    }

    setIsGenerating(false)
  }, [promptInput, selectedAgentType, advancedParams, isGenerating])

  const pollTaskStatus = async (backendTaskId: string, frontendTaskId: string) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/v1/creative/tasks/${backendTaskId}/status`)
        const data = await response.json()

        setTasks(prev => prev.map(t =>
          t.id === frontendTaskId ? {
            ...t,
            status: data.status,
            progress: data.progress,
            result: data.result,
            assets: data.assets_generated,
            error: data.error
          } : t
        ))

        if (data.status === 'completed' && data.result) {
          onAssetGenerated?.(data.result)
          return
        }

        if (data.status === 'failed') {
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    poll()
  }

  const handleQuickTemplate = (template: { prompt: string; type: string }) => {
    setPromptInput(template.prompt)
    setSelectedAgentType(template.type)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'generating': case 'reviewing': return 'text-blue-400 bg-blue-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const selectedAgentConfig = AGENT_TYPES.find(a => a.id === selectedAgentType)

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] max-w-6xl h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex overflow-hidden"
      >
        {/* Header */}
        <div className="h-16 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
              🤖
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Creative AI Agents</h2>
              <p className="text-xs text-slate-400">Intelligent content creation powered by ComfyUI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2",
              comfyuiStatus === 'connected' ? "bg-green-500/20 text-green-400" :
              comfyuiStatus === 'checking' ? "bg-yellow-500/20 text-yellow-400" :
              "bg-red-500/20 text-red-400"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                comfyuiStatus === 'connected' ? "bg-green-400 animate-pulse" :
                comfyuiStatus === 'checking' ? "bg-yellow-400 animate-pulse" :
                "bg-red-400"
              )} />
              ComfyUI: {comfyuiStatus}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-[450px] border-r border-slate-700 flex flex-col">
            {/* Agent Type Selection */}
            <div className="p-5 border-b border-slate-700/50">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Agent</label>
              <div className="grid grid-cols-2 gap-2">
                {AGENT_TYPES.map((agent) => (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAgentType(agent.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-left",
                      selectedAgentType === agent.id
                        ? "border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                        : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{agent.icon}</span>
                      <span className={cn(
                        "font-semibold text-sm",
                        selectedAgentType === agent.id ? "text-white" : "text-slate-300"
                      )}>{agent.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{agent.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="flex-1 p-5 overflow-y-auto">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Creative Prompt</label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={`Describe what you want to create with the ${selectedAgentConfig?.name}...`}
                className="w-full h-32 px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none text-sm"
              />

              {/* Quick Templates */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quick Templates</label>
                {QUICK_TEMPLATES.map((category) => (
                  <div key={category.category} className="mb-3">
                    <p className="text-[10px] text-slate-500 font-semibold mb-1.5">{category.category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickTemplate(item)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg text-[10px] text-slate-300 hover:text-white transition-all truncate max-w-[180px]"
                        >
                          {item.prompt.substring(0, 40)}...
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced Parameters Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center justify-between px-3"
              >
                <span>⚙️ Advanced Parameters</span>
                <span>{showAdvanced ? '▼' : '▶'}</span>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Quality</label>
                        <select
                          value={advancedParams.quality}
                          onChange={(e) => setAdvancedParams(p => ({ ...p, quality: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white"
                        >
                          <option value="standard">Standard</option>
                          <option value="high">High</option>
                          <option value="ultra">Ultra</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Style</label>
                        <select
                          value={advancedParams.style}
                          onChange={(e) => setAdvancedParams(p => ({ ...p, style: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white"
                        >
                          <option value="realistic">Realistic</option>
                          <option value="cinematic">Cinematic</option>
                          <option value="artistic">Artistic</option>
                          <option value="anime">Anime</option>
                        </select>
                      </div>
                      {(selectedAgentType === 'video' || selectedAgentType === 'audio') && (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Duration (s)</label>
                          <input
                            type="number"
                            value={advancedParams.duration}
                            onChange={(e) => setAdvancedParams(p => ({ ...p, duration: Number(e.target.value) }))}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white"
                            min={1} max={300}
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Iterations</label>
                        <input
                          type="number"
                          value={advancedParams.iterations}
                          onChange={(e) => setAdvancedParams(p => ({ ...p, iterations: Number(e.target.value) }))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white"
                          min={1} max={5}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedParams.autoRefine}
                        onChange={(e) => setAdvancedParams(p => ({ ...p, autoRefine: e.target.checked }))}
                        className="rounded"
                      />
                      Auto-refine output quality
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <div className="p-5 border-t border-slate-700/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={!promptInput.trim() || isGenerating}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2",
                  promptInput.trim() && !isGenerating
                    ? `bg-gradient-to-r ${selectedAgentConfig?.color} text-white hover:shadow-xl`
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    Create with {selectedAgentConfig?.icon} {selectedAgentConfig?.name.split(' ')[0]}
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Right Panel - Tasks & Results */}
          <div className="flex-1 flex flex-col bg-slate-900/30">
            {/* Tasks List */}
            <div className="flex-1 p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Generation Tasks</h3>
                <span className="text-xs text-slate-400">{tasks.length} tasks</span>
              </div>

              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-6xl mb-4 opacity-20">🎯</div>
                  <p className="text-slate-400 font-medium mb-1">No tasks yet</p>
                  <p className="text-xs text-slate-500">Enter a prompt and click generate to start creating</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {task.contentType === 'video' ? '🎬' :
                             task.contentType === 'audio' ? '🎵' :
                             task.contentType === 'image' ? '🎨' : '🚀'}
                          </span>
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", getStatusColor(task.status))}>
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(task.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-3 line-clamp-2">{task.prompt}</p>

                      {/* Progress Bar */}
                      {(task.status === 'generating' || task.status === 'reviewing') && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>Processing...</span>
                            <span>{Math.round(task.progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              className={cn(
                                "h-full rounded-full",
                                task.status === 'reviewing' ? "bg-yellow-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Result */}
                      {task.status === 'completed' && task.result && (
                        <div className="space-y-2">
                          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-[10px] text-green-400 font-semibold mb-1">✓ Generation Complete</p>
                            {task.assets && task.assets.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.assets.map((asset, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-[10px]">
                                    Asset #{idx + 1}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-semibold rounded-lg transition-colors">
                              View Result
                            </button>
                            <button className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-semibold rounded-lg transition-colors">
                              Download
                            </button>
                          </div>
                        </div>
                      )}

                      {task.status === 'failed' && task.error && (
                        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-[10px] text-red-400">✗ Error: {task.error.substring(0, 100)}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="h-12 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between px-5 text-[10px] text-slate-400">
              <div className="flex items-center gap-4">
                <span>Active: {tasks.filter(t => t.status === 'generating').length}</span>
                <span>Completed: {tasks.filter(t => t.status === 'completed').length}</span>
                <span>Failed: {tasks.filter(t => t.status === 'failed').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Powered by ComfyUI + Action Agents</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
