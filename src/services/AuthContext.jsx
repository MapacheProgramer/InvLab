import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getSession,
  loginUser,
  logoutUser,
  onAuthChange,
  registerUser,
} from '../services/authService'
import { getOrCreateCompany } from '../services/companyService'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [companyData, setCompanyData] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const user = session?.user || null

  const loadCompany = async (currentUser) => {
    if (!currentUser) {
      setCompanyData(null)
      return
    }

    const data = await getOrCreateCompany(currentUser)
    setCompanyData(data)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const currentSession = await getSession()
        setSession(currentSession)

        if (currentSession?.user) {
          await loadCompany(currentSession.user)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setAuthLoading(false)
      }
    }

    init()

    const { data } = onAuthChange(async (newSession) => {
      try {
        setSession(newSession)

        if (newSession?.user) {
          await loadCompany(newSession.user)
        } else {
          setCompanyData(null)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setAuthLoading(false)
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const login = async ({ email, password }) => {
    await loginUser({ email, password })
  }

  const register = async ({ email, password, fullName }) => {
    await registerUser({ email, password, fullName })
  }

  const logout = async () => {
    await logoutUser()
    setCompanyData(null)
  }

  const value = useMemo(
    () => ({
      session,
      user,
      companyData,
      companyId: companyData?.companyId || null,
      company: companyData?.company || null,
      role: companyData?.role || null,
      authLoading,
      login,
      register,
      logout,
    }),
    [session, user, companyData, authLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}