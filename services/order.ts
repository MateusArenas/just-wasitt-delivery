import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { bagData } from "./bag"
import { StoreDate } from "./store"

interface errorData { error: string }

export interface OrderData {
  _id: string
  store: string & StoreDate
  user: string & userData
  bag: string & bagData

  name: string
  phoneNumber: string

  ceep: string
  city: string
  district: string
  street: string
  houseNumber: string
  complement: string
  state: string

  delivery: boolean
  deliveryTimeMin: string
  deliveryTimeMax: string
  deliveryPrice: number
  pickup: boolean

  paymentMoney: boolean
  
  thing: boolean
  thingValue: number
  paymentDebt: boolean
  paymentCredit: boolean
  paymentMealTicket: boolean

  expireAt: Date
  createdAt: Date
  updatedAt: Date
}

export async function index ({ store, params } : { store: string, params?: any }) {
  try {
    const response = await api.get(`/store/${store}/orders`, { params })
    return Promise.resolve(response as AxiosResponse<Array<OrderData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function search ({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.get(`/store/${store}/orders/${id}`)
    return Promise.resolve(response as AxiosResponse<Array<OrderData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function create ({ store, body } : {store: string, body: Partial<OrderData>}) {
  try {
    console.log('url', `/store/${store}/orders`, body)
    const response = await api.post(`/store/${store}/orders`, body)
    console.log('response', response?.data)
    return Promise.resolve(response as AxiosResponse<Array<OrderData>>)
  } catch(err) {  
    console.log('response error', err)

    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function update ({ id, store, body } : { id: string, store: string, body: Partial<OrderData>}) {
  try {
    const response = await api.put(`/store/${store}/orders/${id}`, body)
    return Promise.resolve(response as AxiosResponse<Array<OrderData>>)
  } catch(err) {  
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function remove ({ store, id } : { store: string, id: string }) {
  try {
    const response = await api.delete(`/store/${store}/orders/${id}`)
    return Promise.resolve(response as AxiosResponse<Array<OrderData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

