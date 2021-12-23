import { AxiosResponse } from 'axios'
import React from 'react'
import AuthContext from '../contexts/auth'
import { CategoryData } from './category'
import * as LocalStorage from './local'
import * as ProductService from './product'

interface errorData { error: string }
export interface favoriteData { 
  _id: string
  product: string & ProductService.ProductData
  store: string
}

const VERSION = '2.2'

export async function all ({ userId } : { userId: string }) : Promise<Array<Array<favoriteData>>> {
  try {
    const data = await LocalStorage.all(`/${VERSION}/${userId}/favorite/store`)
    const response = await Promise.all(data?.map(async (localData, _index) => {
      const store = localData[0]?.store
      const response = await index({ store, userId })
      return localData?.map((item, _index) => response?.data[_index])
    }))
    return Promise.resolve(response as Array<Array<favoriteData>>)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function index ({ store, userId } : { store: string, userId: string }) : Promise<AxiosResponse<Array<favoriteData>>> {
  try {
    const data = await LocalStorage.index(`/${VERSION}/${userId}/favorite/store/${store}`)
    // const params = { ids: data?.map(item => item?.product), store }
    
    // const response = await ProductService.index({ store, params })
    // response.data = data?.map(item => 
    //   ({...item, product: response?.data?.find(_item => _item?._id === item?.product ) || { '_id': item?.product } })
    // )

    const response = await Promise.all(data?.map(async item => await find({ userId, store, _id: item?._id })))

    return Promise.resolve(response as any)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function find ({ store, _id, userId } : { store: string, _id: string, userId: string }) : Promise<favoriteData> {
  try {
    const data = await LocalStorage.find(`/${VERSION}/${userId}/favorite/store/${store}`, _id)

    const response = await ProductService.search({ store, id: _id })

    return Promise.resolve({...data, product: response?.data })
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function save ({ params, userId } : { params: favoriteData, userId: string } ) : Promise<favoriteData> {
  try {
    const { store } = Array.isArray(params) ? params[0] : params
    await LocalStorage.save(`/${VERSION}/${userId}/favorite/store/${store}`, params)

    const response = await find({ userId, store: params?.store, _id: params?._id })

    return Promise.resolve(response)
  } catch(err) {
    return Promise.reject(null)
  } 
}


export async function clear ({ store, userId } : { store: string, userId: string } ) : Promise<boolean> {
  try {
    await LocalStorage.clear(`/${VERSION}/${userId}/favorite/store/${store}`)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function remove ({ store, _id, userId } : {store: string, _id: string, userId: string }) : Promise<boolean> {
  try {
    await LocalStorage.remove(`/${VERSION}/${userId}/favorite/store/${store}`, _id)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}
