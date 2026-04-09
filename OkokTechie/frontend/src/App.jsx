import { useState, useEffect } from 'react'
import Chat from './components/Chat'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const [page, setPage] = useState('chat')

  useEffect(() => {
    if (window.location.pathname === '/admin') setPage('admin')
  }, [])

  return page === 'admin' ? (
    <AdminDashboard onBack={() => { window.history.pushState({}, '', '/'); setPage('chat') }} />
  ) : (
    <Chat onAdmin={() => { window.history.pushState({}, '', '/admin'); setPage('admin') }} />
  )
}
