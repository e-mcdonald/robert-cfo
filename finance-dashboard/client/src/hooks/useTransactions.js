import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useTransactions(params = {}) {
  const [data, setData] = useState({ transactions: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/transactions', { params })
      setData(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [JSON.stringify(params)])

  return { ...data, loading, error, refetch: fetch }
}

export function useTransactionSummary() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/transactions/summary')
      .then(res => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { summary, loading }
}
