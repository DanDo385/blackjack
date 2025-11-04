'use client'
import { useEffect, useState } from 'react'

/**
 * useLocalStorageNumber - Hook for persisting numbers in localStorage
 * 
 * @param key - localStorage key
 * @param initial - initial value
 * @returns [value, setValue] tuple
 */
export function useLocalStorageNumber(key: string, initial: number) {
  const [value, setValue] = useState<number>(initial)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) {
        const parsed = Number(raw)
        if (Number.isFinite(parsed)) {
          setValue(parsed)
        }
      }
    } catch (error) {
      // Ignore localStorage errors
      console.warn(`Failed to read ${key} from localStorage:`, error)
    }
  }, [key])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(key, String(value))
    } catch (error) {
      // Ignore localStorage errors
      console.warn(`Failed to write ${key} to localStorage:`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}

