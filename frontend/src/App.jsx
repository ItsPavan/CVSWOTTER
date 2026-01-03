import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { setAuthToken } from './lib/api'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setAuthToken(session.access_token)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setAuthToken(session.access_token)
      else setAuthToken(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar session={session} />
      <main className="container mx-auto p-4">
        {!session ? <Auth /> : <Dashboard />}
      </main>
    </div>
  )
}
export default App
