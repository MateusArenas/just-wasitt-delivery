import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { StoreDate } from "./store"

interface errorData { error: string }

export async function search () {
  try {
    const response = await api.get(`/users`)
    return Promise.resolve(response as AxiosResponse<userData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function update ({ body } : { body: Partial<userData> }) {
  try {
    const response = await api.put(`/users`, body)
    return Promise.resolve(response as AxiosResponse<userData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function remove() {
  try {
    const response = await api.delete(`/users`)
    return Promise.resolve(response as AxiosResponse<userData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}
