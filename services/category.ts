import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { ProductData } from "./product"
import { StoreDate } from "./store"

interface errorData { error: string }

export interface CategoryData {
  self?: boolean
  otherCategories?: Array<{ _id: string, name: string }>
  _id: string
  user: string & userData
  store: string & StoreDate
  name: string
  products: Array<string & ProductData>
}

export async function index ({ store, ...params } : { store: string, params: any }) {
  try {
    const response = await api.get(`/store/${store}/categories`, { params })
    return Promise.resolve(response as AxiosResponse<Array<CategoryData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function search ({ store, id, params } : { store: string, id: string, params: any }) {
  try {
    const response = await api.get(`/store/${store}/categories/${id}`, { params })
    return Promise.resolve(response as AxiosResponse<Array<CategoryData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}


export async function create ({ store, body }: { store: string, body: CategoryData }) {
  try {
    const response = await api.post(`/store/${store}/categories`, body)
    return Promise.resolve(response as AxiosResponse<Array<CategoryData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function update ({ id, store, body }: { id: string, store: string, body: CategoryData }) {
  try {
    const response = await api.put(`/store/${store}/categories/${id}`, body)
    return Promise.resolve(response as AxiosResponse<Array<CategoryData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function remove ({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.delete(`/store/${store}/categories/${id}`)
    return Promise.resolve(response as AxiosResponse<Array<CategoryData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

