import { AxiosResponse } from 'axios'
import * as LocalStorage from './local'
import * as StoreService from './store'

interface errorData { error: string }
export interface SavedData { 
  _id: string // store_id
  store: string & StoreService.StoreDate
  // createdAt?: string
}

const VERSION = '1.0'

export async function index ({ userId } : { userId: string }) : Promise<AxiosResponse<Array<SavedData>>> {
  try {
    const data = await LocalStorage.index(`/${VERSION}/${userId}/saved`)
    const params = { ids: data?.map(item => item?.store) }
    
    const response = await StoreService.index(params)
    response.data = data?.map(item => 
      ({...item, store: response?.data?.find(_item => _item?._id === item?.store ) || { '_id': item?.store } })
    )
    return Promise.resolve(response as any)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function find ({ _id, userId } : {  _id: string, userId: string }) : Promise<SavedData> {
  try {
    const data = await LocalStorage.find(`/${VERSION}/${userId}/saved`, _id)
    return Promise.resolve(data)
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function save ({ params, userId } : { params: SavedData, userId: string } ) : Promise<boolean> {
  try {
    await LocalStorage.save(`/${VERSION}/${userId}/saved`, params)
    return Promise.resolve(true)
  } catch(err) {
    return Promise.reject(false)
  } 
}


export async function clear ({ userId } : { userId: string } ) : Promise<boolean> {
  try {
    await LocalStorage.clear(`/${VERSION}/${userId}/saved`)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function remove ({ _id, userId } : { _id: string, userId: string }) : Promise<boolean> {
  try {
    await LocalStorage.remove(`/${VERSION}/${userId}/saved`, _id)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}
