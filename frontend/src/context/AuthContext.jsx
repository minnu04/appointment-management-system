import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('camp-token'))
  const [loading, setLoading] = useState(true)

  const syncSession = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)

    if (nextToken) {
      localStorage.setItem('camp-token', nextToken)
    } else {
      localStorage.removeItem('camp-token')
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await authApi.me()
        setUser(data.user)
      } catch (error) {
        localStorage.removeItem('camp-token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const login = async (payload) => {
    const { data } = await authApi.login(payload)
    syncSession(data.token, data.user)
    toast.success('Logged in successfully')
    return data
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    toast.success(data.message)
    return data
  }

  const verifyOtp = async (payload) => {
    const { data } = await authApi.verifyOtp(payload)
    syncSession(data.token, data.user)
    toast.success(data.message)
    return data
  }

  const resendOtp = async (payload) => {
    const { data } = await authApi.resendOtp(payload)
    toast.success(data.message)
    return data
  }

  const logout = () => {
    syncSession(null, null)
    toast.success('Logged out')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}