'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  description: string
  handler: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const matchesCtrl = shortcut.ctrl === (event.ctrlKey || false)
      const matchesMeta = shortcut.meta === (event.metaKey || false)
      const matchesShift = shortcut.shift === (event.shiftKey || false)
      const matchesAlt = shortcut.alt === (event.altKey || false)

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const needsCtrlOrMeta = shortcut.ctrl || shortcut.meta
      const matchesModifier = !needsCtrlOrMeta || 
        (isMac ? (shortcut.meta && event.metaKey) : (shortcut.ctrl && event.ctrlKey)) ||
        (shortcut.ctrl && event.ctrlKey) ||
        (shortcut.meta && event.metaKey)

      if (matchesKey && matchesModifier && matchesShift && matchesAlt) {
        if (shortcut.preventDefault) {
          event.preventDefault()
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation()
        }
        shortcut.handler()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
