import { useState, useCallback, useEffect } from 'react'

/**
 * useLocalStorage — drop-in replacement for the artifact's window.storage hook.
 * Reads from localStorage on mount, and persists every update automatically.
 * Works identically to the original useStore but uses the browser's built-in
 * localStorage, which survives page refreshes and browser restarts.
 *
 * @param {string} key        - localStorage key (use KEYS constants)
 * @param {any}    defaultVal - value used when the key doesn't exist yet
 * @returns [value, setter]   - same API as useState
 */
export function useLocalStorage(key, defaultVal) {
  const [value, setValueRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored)
    } catch (_) {}
    return defaultVal
  })

  // Keep localStorage in sync whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn(`[useLocalStorage] Could not save "${key}":`, err)
    }
  }, [key, value])

  const setValue = useCallback((updater) => {
    setValueRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }, [])

  return [value, setValue]
}
