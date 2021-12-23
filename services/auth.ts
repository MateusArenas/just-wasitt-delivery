import AsyncStorage from '@react-native-async-storage/async-storage'

import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import apollo from './apollo'
import { StoreDate } from "./store"

interface errorData { error: string }

export interface userAndressData {
  state?: string
  city?: string
  district?: string
  street?: string
  houseNumber?: string
  complement?: string
  ceep?: string
}

export interface userData extends userAndressData {
  self?: boolean
  _id: string
  uri: string
  name: string
  email: string
  password: string
  phoneNumber?: string
  stores: Array<StoreDate>
}

interface authenticateResponseData { 
  user: userData
  token: string
}
export async function authenticate (body: { email: string, password: string }) {
  try {
    const response = await api.post(`/authenticate`, body)
    if (response?.data) await saveToken(response?.data?.token)
    return Promise.resolve(response as AxiosResponse<authenticateResponseData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function register (body: { email: string, password: string, name: string }) {
  try {
    const response = await api.post(`/register`, body)
    if (response?.data) await saveToken(response?.data?.token)
    return Promise.resolve(response as AxiosResponse<authenticateResponseData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function saveToken (token: string) {
  api.defaults.headers.authorization = `Bearer ${token}`
  await AsyncStorage.setItem('token', token)
}

export function useCanToken () {
  return !!api.defaults.headers.authorization
}

export function getToken () {
  return api.defaults.headers.authorization
}