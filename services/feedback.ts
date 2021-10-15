import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { StoreDate } from "./store"

interface errorData { error: string }

export interface FeedbackData {
  self?: boolean
  _id: string
  message: string
  replies: Array<string & FeedbackData>
  reply: string & FeedbackData
  user: string & userData
  store: string & StoreDate //_id
}

export async function index ({ store, params } : { store: string, params: any }) {
  try {
    const response = await api.get(`/store/${store}/feedbacks`, { params })
    return Promise.resolve(response as AxiosResponse<FeedbackData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function search ({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.get(`/store/${store}/feedbacks/${id}`)
    return Promise.resolve(response as AxiosResponse<FeedbackData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function create ({ store, body } : { store: string, body: any }) {
  try {
    const response = await api.post(`/store/${store}/feedbacks`, body)
    return Promise.resolve(response as AxiosResponse<FeedbackData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function update ({ store, id, body } : { store: string, id: string, body: any }) {
  try {
    const response = await api.put(`/store/${store}/feedbacks/${id}`, body)
    return Promise.resolve(response as AxiosResponse<FeedbackData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function remove({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.delete(`/store/${store}/feedbacks/${id}`)
    return Promise.resolve(response as AxiosResponse<FeedbackData>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}
