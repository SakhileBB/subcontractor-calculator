'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Transaction {
  paylinkID: string
  status: string
  createdAt: string
  amount: number
  description: string
  externalTransactionID: string
}

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('/api/ikhokha')
        setTransactions(res.data)
        setLoading(false)
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load transactions'
        setError(errorMessage)
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const totalSales = transactions.reduce((sum, t) => sum + t.amount, 0) / 100

  const productMap = transactions.reduce((acc: Record<string, number>, tx) => {
    const key = tx.description || 'No Description'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const sortedProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 iKhokha Sales Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <p className="text-lg mb-4">
            Total Sales: <strong>R{totalSales.toFixed(2)}</strong>
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">Top Selling Products</h2>
          <ul className="list-disc list-inside">
            {sortedProducts.slice(0, 10).map(([desc, count]) => (
              <li key={desc}>
                {desc} — {count} sale{Number(count) > 1 ? 's' : ''}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">Least Selling Products</h2>
          <ul className="list-disc list-inside">
            {sortedProducts.slice(-5).map(([desc, count]) => (
              <li key={desc}>
                {desc} — {count} sale{Number(count) > 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
