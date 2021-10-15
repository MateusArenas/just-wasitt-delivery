import { AxiosError } from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import * as AndressService from "../services/andress";
import { getAndress } from "../utils";
import AuthContext from "./auth";

interface errorData {
  message: string
}

interface AndressContextData {
  andresses: Array<AndressService.AndressData>
  andress: AndressService.AndressData
  selected: boolean
  
  error: errorData
  loading: boolean
  refresh: boolean
  
  selectIn: (id: string, refresh?: boolean) => Promise<any>
  selectOut: () => any 

  selectUp: (andress: AndressService.AndressData) => Promise<any>
  selectDown: (id: string) => any
}

const AndressContext = createContext<AndressContextData>({} as AndressContextData)

const VERSION = '1.9'

export const AndressProvider: React.FC = ({ children }) => {
  const { user, signed } = useContext(AuthContext)
  const userId = user?._id

  const [andress, setAndress] = useState<AndressService.AndressData>(null)
  const [andresses, setAndresses] = useState<Array<AndressService.AndressData>>(null)
  const [selected, setSelected] = usePersistedState<string>(`${VERSION}-${userId}-selected-andress`, null)
  
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refresh, setRefresh] = React.useState<boolean>(false)
  const [error, setError] = React.useState<errorData>({} as errorData)

  React.useEffect(() => {
    (async () => {
      const response = await AndressService.index({ userId })
      const data = signed ? [...response?.data, getAndress(user)] : response?.data
      setAndress(data?.find(item => item?._id === selected))
      setAndresses(data)
    })()
  }, [setAndress, setAndresses, selected, user, signed])

  async function selectIn (id: string, refresh?: boolean) {
    if (signed && user?._id === id) return selectInForSigned(id, refresh)
    try {
      refresh ? setRefresh(true) : setLoading(true)
      const response = await AndressService.search({ userId, id })
      if (!response?.data) setError({ message: 'Erro de conexão!' })
      const { data } = response
      setAndress(data)
      setAndresses(items => [...items?.filter(item => item?._id !== data?._id), data])
      setSelected(data?._id)
    } catch(err) { 
      if (!err?.response?.data) setError({ message: 'Erro de conexão ao servidor!' })
      setError({ message: err?.response?.data?.error })
    } finally {
      refresh ? setRefresh(false) : setLoading(false)
    }
  }

  function selectInForSigned (id: string, refresh?: boolean) {
    try {
      refresh ? setRefresh(true) : setLoading(true)
      const data = andresses?.find(item => item?._id === id)
      setAndress(data)
      setAndresses(items => [...items?.filter(item => item?._id !== data?._id), data])
      setSelected(data?._id)
    } finally {
      refresh ? setRefresh(false) : setLoading(false)
    }
  }

  async function selectUp (body: AndressService.AndressData) {
    try {
      setLoading(true)
      const response = await AndressService.create({ userId, body })
      if (!response?.data) setError({ message: 'Erro de conexão!' })
      const { data } = response
      setAndress(data)
      setAndresses(items => [...items?.filter(item => item?._id !== data?._id), data])
      setSelected(data?._id)
    } catch(err) { 
      if (!err?.response?.data) setError({ message: 'Erro de conexão ao servidor!' })
      setError({ message: err?.response?.data?.error })
    } finally {
      setLoading(false)
    }
  }

  async function selectOut () {
    setLoading(true)
    setAndress(null)
    setSelected(null)
    setLoading(false)
  }

  async function selectDown (id: string) {
    if(!!id) {
      setLoading(true)
      setAndress(item => item?._id === id ? null : item)
      setAndresses(items => [...items?.filter(item => item?._id !== id)])
      setSelected(item => item === id ? null : item)
      setLoading(false)
    }
  }

  return (
    <AndressContext.Provider value={{ 
      error, 
      loading, 
      refresh, 
      selectUp, 
      selectIn, 
      selectOut,
      selectDown,
      andress, 
      andresses,
      selected: (!!selected && !!andress), 
    }} >
      {children}
    </AndressContext.Provider>
  )
}

export default AndressContext