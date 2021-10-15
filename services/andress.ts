import { AxiosResponse } from 'axios'
import * as LocalStorage from './local'
interface errorData { error: string }
export interface AndressData {
  _id: string
  state: string
  city: string
  district: string
  street: string
  houseNumber: string
  complement: string
  ceep: string
}
const VERSION = '1.9'

export async function index ({ userId }): Promise<AxiosResponse<Array<AndressData>>> {
  try {
    const response = { data: null }
    response.data = await LocalStorage.index(`/${VERSION}/${userId}/andress`)
    return Promise.resolve(response as AxiosResponse<Array<AndressData>>)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function search ({ userId, id } : { userId: string, id: string }): Promise<AxiosResponse<AndressData>> {
  try {
    const response = { data: null }
    response.data = await LocalStorage.find(`/${VERSION}/${userId}/andress`, id)
    return Promise.resolve(response as AxiosResponse<AndressData>)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function create ({ userId, body } : { userId: string, body: Partial<AndressData> }): Promise<AxiosResponse<AndressData>> {
  try {
    const response = { data: null }
    response.data = await LocalStorage.create(`/${VERSION}/${userId}/andress`, body)
    return Promise.resolve(response as AxiosResponse<AndressData>)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function remove ({ userId, id } : { userId: string, id: string}): Promise<boolean> {
  try {
    await LocalStorage.remove(`/${VERSION}/${userId}/andress`, id)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

