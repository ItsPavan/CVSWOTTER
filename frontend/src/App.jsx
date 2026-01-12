import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { setAuthToken } from './lib/api'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'

import { ConfigProvider, theme } from 'antd';

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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#D17D08',
          colorInfo: '#D17D08',
          colorBgBase: '#1E0903',
          colorBgContainer: '#381004',
          colorTextBase: '#F5F5F5',
          colorTextSecondary: '#D0C0B0',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 16,
        },
        components: {
          Button: {
            colorPrimary: '#D17D08',
            algorithm: true,
            fontWeight: 700,
          },
          Card: {
            colorBgContainer: '#381004',
            colorBorderSecondary: 'rgba(209, 125, 8, 0.2)',
          },
          Input: {
            colorBgContainer: '#2d0a0a',
            activeBorderColor: '#D17D08',
            hoverBorderColor: '#F8B24F',
          }
        }
      }}
    >
      <div className="min-h-screen bg-[#1E0903] text-[#F5F5F5] font-sans antialiased selection:bg-[#D17D08] selection:text-white">
        <Navbar session={session} />
        <main className="container mx-auto p-4">
          {!session ? <Auth /> : <Dashboard />}
        </main>
      </div>
    </ConfigProvider>
  )
}
export default App
