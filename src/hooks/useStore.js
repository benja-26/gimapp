/**
 * useStore — persistent state via localStorage
 * Drop-in replacement for the window.storage version used in the Claude artifact.
 *
 * Usage:  const [clientes, setClientes] = useStore("gym_clientes", [])
 *
 * - On first mount: reads from localStorage
 * - On every write: synchronously persists to localStorage
 * - Compatible with React 18 StrictMode
 */

import { useState, useEffect, useCallback, useRef } from "react"

export function useStore(key, defaultVal) {
  // Lazy initializer — reads localStorage once at mount, never again
  const [val, setValRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored != null) return JSON.parse(stored)
    } catch (_) {}
    return defaultVal
  })

  // Track whether this is the very first render to avoid overwriting
  // localStorage with the default value on boot
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (e) {
      console.warn("[useStore] localStorage write failed:", key, e)
    }
  }, [key, val])

  const setVal = useCallback((updater) => {
    setValRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater
      // Also write synchronously so rapid updates don't get lost
      try { localStorage.setItem(key, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }, [key])

  return [val, setVal]
}
