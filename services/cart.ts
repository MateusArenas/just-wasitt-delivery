import { AxiosResponse } from 'axios'
import React from 'react'
import AuthContext from '../contexts/auth'
import { CategoryData } from './category'
import * as LocalStorage from './local'
import * as ProductService from './product'
import * as StoreService from './store'
import { StoreDate } from './store'

interface errorData { error: string }
export interface cartData { 
  _id: string
  store: string & StoreDate
  product: ProductService.ProductData & any
  comment?: string
  quantity: number
}

const VERSION = '2.2'

export async function all ({ userId } : { userId: string }) : Promise<Array<Array<cartData>>> {
  try {
    const data = await LocalStorage.all(`/${VERSION}/${userId}/store`)
    const response = await Promise.all(data?.filter(item => !!item[0]?.store)?.map(async (localData, _index) => {

      const store = localData[0]?.store

      const response = await index({ store, userId })

      const data = localData?.map((item, _index) => response?.data[_index])
      return data?.filter(item => !!item)
    }))

    return Promise.resolve(response as Array<Array<cartData>>)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function index ({ store, userId } : { store: string, userId: string }) : Promise<AxiosResponse<Array<cartData>>> {
  try {
    const data = await LocalStorage.index(`/${VERSION}/${userId}/store/${store}/carts`)
    const params = { ids: data?.map(item => item?.product), store }
  
    
    const response = await ProductService.index({ store, params })
    const { data: [_store] } = await StoreService.index({ name: store })

    //exclui os produtos q n existem mais e adiciona o obj produto
    response.data = data?.filter(item => response?.data?.find(({ _id }) => _id === item?.product ))?.map(item => 
      ({...item, store: _store, product: response?.data?.find(_item => _item?._id === item?.product ) || { '_id': item?.product } })
    )
    
    return Promise.resolve(response as any)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function find ({ store, _id, userId } : { store: string, _id: string, userId: string }) : Promise<cartData> {
  try {
    const data = await LocalStorage.find(`/${VERSION}/${userId}/store/${store}/carts`, _id)
    return Promise.resolve(data)
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function save ({ store, userId, params } : { store: string, userId: string, params: cartData | Array<cartData> } ) : Promise<boolean> {
  try {
    await LocalStorage.save(`/${VERSION}/${userId}/store/${store}/carts`, params)
    return Promise.resolve(true)
  } catch(err) {
    return Promise.reject(false)
  } 
}


export async function clear ({ store, userId } : { store: string, userId: string } ) : Promise<boolean> {
  try {
    await LocalStorage.clear(`/${VERSION}/${userId}/store/${store}/carts`)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function remove ({ store, _id, userId } : {store: string, _id: string, userId: string }) : Promise<boolean> {
  try {
    await LocalStorage.remove(`/${VERSION}/${userId}/store/${store}/carts`, _id)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}
