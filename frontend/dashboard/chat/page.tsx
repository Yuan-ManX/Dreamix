'use client'

import ChatInterface from '@/components/ChatInterface'
import VideoPreview from '@/components/VideoPreview'

export default function ChatPage() {
  return (
    <div className="flex h-full">
      <div className="flex-1 border-r border-slate-200">
        <ChatInterface />
      </div>
      <div className="w-96 bg-slate-100">
        <VideoPreview />
      </div>
    </div>
  )
}
