import { useState, useEffect } from 'react'
import { api } from '../api/client'


function TagList() {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await api.getTags()
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>
  if (!data) return <div>No data</div>

  return (
    <div>
      <h2>TagList</h2>
      <ul>
        {data.map((item: any, idx: number) => (
          <li key={idx}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  )
}

export default TagList
