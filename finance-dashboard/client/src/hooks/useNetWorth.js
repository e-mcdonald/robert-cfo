import { useState, useEffect, useRef } from 'react'
import api from '../lib/api'

export function useNetWorth() {
  const [netWorth, setNetWorth] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/networth'), api.get('/networth/history')])
      .then(([nw, hist]) => {
        setNetWorth(nw.data)
        setHistory(hist.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { netWorth, history, loading }
}

export function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === null || target === undefined) return
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return value
}
