import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { CategoryData } from "./category"
import { PromotionData } from "./promotion"
import { StoreDate } from "./store"

interface errorData { error: string }

export interface ProductData {
  self?: boolean
  _id: string
  user: string & userData
  store: string & StoreDate //_id
  name: string
  categories: Array<string & CategoryData>
  promotions: Array<string & PromotionData>
  price: number
  about: string
  uri: string
}

export async function index ({ store, params } : { store: string, params: any }) {
  try {
    const response = await api.get(`/store/${store}/products`, { params })
    return Promise.resolve(response as AxiosResponse<Array<ProductData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function search ({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.get(`/store/${store}/products/${id}`)
    return Promise.resolve(response as AxiosResponse<Array<ProductData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function create ({ store, body } : {store: string, body: ProductData}) {
  try {
    const response = await api.post(`/store/${store}/products`, body)
    return Promise.resolve(response as AxiosResponse<Array<ProductData>>)
  } catch(err) {  
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function update ({ id, store, body } : { id: string, store: string, body: ProductData}) {
  try {
    const response = await api.put(`/store/${store}/products/${id}`, body)
    return Promise.resolve(response as AxiosResponse<Array<ProductData>>)
  } catch(err) {  
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function remove ({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.delete(`/store/${store}/products/${id}`)
    return Promise.resolve(response as AxiosResponse<Array<ProductData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

