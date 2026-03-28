'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Users</h1>
      {users.map((u: any) => (
        <p key={u.id}>{u.name} — {u.email}</p>
      ))}
    </main>
  )
}