import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return uuidv4()
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getClipColor(type: string): string {
  const colors: Record<string, string> = {
    video: 'from-purple-600 to-purple-500',
    audio: 'from-green-600 to-green-500',
    image: 'from-blue-600 to-blue-500',
    text: 'from-yellow-600 to-yellow-500',
    effect: 'from-pink-600 to-pink-500'
  }
  return colors[type] || 'from-gray-600 to-gray-500'
}

export function getClipIcon(type: string): string {
  const icons: Record<string, string> = {
    video: '🎬',
    audio: '🎵',
    image: '🖼️',
    text: '📝',
    effect: '✨'
  }
  return icons[type] || '📦'
}

export function getTrackIcon(type: string): string {
  const icons: Record<string, string> = {
    video: '🎬',
    audio: '🎵',
    text: '📝',
    effect: '✨'
  }
  return icons[type] || '📦'
}

export function generateWaveform(duration: number, sampleCount: number = 250) {
  const peaks: number[] = []
  for (let i = 0; i < sampleCount; i++) {
    const base = 0.2 + Math.sin(i * 0.1) * 0.3
    const variation = Math.random() * 0.4
    peaks.push(Math.min(0.9, base + variation))
  }
  return { peaks, duration }
}

export function downloadFile(content: string, filename: string, type: string = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function storageGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function storageSet(key: string, value: any): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}
