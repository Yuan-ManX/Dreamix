'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-6">🎬</div>
        <h1 className="text-4xl font-bold text-white mb-4">Action</h1>
        <p className="text-slate-400 mb-8 text-lg">AI-powered video creation platform</p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-lg font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20"
        >
          Enter Dashboard
        </Link>
      </div>
    </div>
  )
}
