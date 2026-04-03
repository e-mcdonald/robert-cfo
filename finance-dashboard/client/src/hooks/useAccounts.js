import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/accounts')
      setAccounts(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return { accounts, loading, error, refetch: fetch }
}
