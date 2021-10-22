import { AxiosError } from "axios";
import React, { createContext, useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import { authenticate, register, saveToken, useCanToken, userAndressData, userData } from "../services/auth";
import * as Andress from "../services/andress";
import api from "../services/api";
import Loading from "../components/Loading";

interface errorData {
  message: string
}

interface AuthContextData {
  signed: boolean
  users: Array<userData>
  user: userData
  visitor: userData
  token: string
  error: errorData
  loading: boolean
  refresh: boolean
  signIn: (email?: string, password?: string, refresh?: boolean) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => any
  removeSign: (_id: string) => any 
  setPhoneNumber: React.Dispatch<React.SetStateAction<userData['phoneNumber']>>
  phoneNumber: userData['phoneNumber']
  setName: React.Dispatch<React.SetStateAction<string>>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const VERSION = '1.0'

export const AuthProvider: React.FC = ({ children }) => {
  const [users, setUsers] = usePersistedState<Array<userData>>(`${VERSION}-users-wasit`, [])
  const [user, setUser] = usePersistedState<userData | null>(`${VERSION}-user-wasit`, null)
  const [token, setToken] = usePersistedState<string | null>(`${VERSION}-token-wasit`, null)
  const signed = (!!user && !!user?._id && useCanToken())  

  const [phoneNumber, setPhoneNumber] = usePersistedState<userData['phoneNumber']>(`${VERSION}-local-phoneNumber-wasit`, null)
  const [name, setName] = usePersistedState<string>(`${VERSION}-local-name-wasit`, null)
  const visitor: userData = {
    name,
    phoneNumber,
    _id: undefined,
    email: undefined,
    password: undefined,
    stores: undefined,
    uri: undefined,
  }
  
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refresh, setRefresh] = React.useState<boolean>(false)
  const [error, setError] = React.useState<errorData>({} as errorData)

  React.useEffect(() => { // automatic signIn in init app, to set api header auth
    if (!!user && !useCanToken()) { signIn(user?.email, user?.password); console.log('ppg- entered') }
  }, [user])

  function signVisitor (refresh?: boolean) {
    refresh ? setRefresh(true) : setLoading(true)
    setUser(visitor)
    setUsers(_users => [..._users.filter(_user => _user?._id !== visitor?._id)])
    saveToken(null)
    setToken(null)
    refresh ? setRefresh(false) : setLoading(false)
  }

  console.log('all users', [...users, visitor]);

  async function signIn (email?: string, password?: string, refresh?: boolean) {
    try {
      if (!email && !password) return signVisitor(refresh)
      refresh ? setRefresh(true) : setLoading(true)
      const response = await authenticate({ email, password })
      if (!response?.data) setError({ message: 'Erro de conexão!' })
      const { data: { token, user } } = response
      setUser({...user, password, email })
      setUsers(_users => [..._users.filter(_user => _user._id !== user._id), user])
      setToken(token)
    } catch(err) { 
      if (!err?.response?.data) setError({ message: 'Erro de conexão ao servidor!' })
      setError({ message: err?.response?.data?.error })
    } finally {
      refresh ? setRefresh(false) : setLoading(false)
    }
  }

  async function signUp (email: string, password: string, name: string) {
    try {
      setLoading(true)
      const response = await register({ email, password, name })
      if (!response?.data) setError({ message: 'Erro de conexão!' })
      const { data: { token, user } } = response
      setUser({...user, password, email })
      setUsers(users => [...users.filter(item => item?._id !== user?._id), user])
      setToken(token)
    } catch(err) { 
      if (!err?.response?.data) setError({ message: 'Erro de conexão ao servidor!' })
      setError({ message: err?.response?.data?.error })
    } finally {
      setLoading(false)
    }
  }

  function signOut () {
    setLoading(true)
    setUser(null)
    setToken(null)
    setLoading(false)
  }

  function removeSign (_id: string) {
    if(!!_id) {
      setLoading(true)
      setUser(user => user._id === _id ? null : user)
      setUsers(users => [...users?.filter(item => item?._id !== _id)])
      setToken(null)
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <AuthContext.Provider value={{ 
      token, 
      users: [...users, visitor], 
      user: user?._id ? user : visitor,
      visitor, 
      signed, 
      error, 
      loading, 
      refresh, 
      signIn, 
      signUp, 
      signOut,
      removeSign,
      phoneNumber,
      setPhoneNumber,
      setName,
    }} >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext