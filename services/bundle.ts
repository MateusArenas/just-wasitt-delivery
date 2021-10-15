import { AxiosResponse } from 'axios'
import * as LocalStorage from './local'
import * as ProductService from './product'
import * as StoreService from './store'
import { StoreDate } from './store'

interface errorData { error: string }
export interface bundleData { 
  _id: string
  store: string & StoreDate
  user: any
  product: ProductService.ProductData & any
  quantity: number
  comment?: string
}

const VERSION = '3.2'

export async function index ({ store: storeName, userId } : { store: string, userId: string }) : Promise<AxiosResponse<Array<bundleData>>> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    const data = await Promise.all(localData?.bundles?.map(async bundle => {
      const { data: store } = await StoreService.search({ id: bundle?.store })
      const { data: product } = await ProductService.search({ store: store?.name, id: bundle?.product })
      return ({ ...bundle, store, product })
    }))
    
    return Promise.resolve(data as any)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function search ({ store: storeName, id, userId } : { store: string, id: string, userId: string }) : Promise<bundleData> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    const bundle = localData?.bundles?.find(item => item?._id === id)

    const { data: store } = await StoreService.search({ id: localData?.store })
    const { data: product } = await ProductService.search({ store: store?.name, id: bundle?.product })

    return Promise.resolve({ ...bundle, store, product })
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function create ({ store: storeName, userId, body } : { store: string, userId: string, body: Partial<bundleData> } ) : Promise<boolean> {
  try {
    const key = `/${VERSION}/${userId}/bag/stores`
    const localData = await LocalStorage.find(key, storeName)

    if (localData) {
      await LocalStorage.update(key, ({ ...localData, bundles: [...localData?.bundles, body] }))
    } else {
      await LocalStorage.create(key, ({ _id: storeName, user: userId, store: body?.store, bundles: [body] }))
    }

    return Promise.resolve(true)
  } catch(err) {
    return Promise.reject(false)
  } 
}

export async function update ({ store: storeName, userId, body } : { store: string, userId: string, body: Partial<bundleData> } ) : Promise<boolean> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    if(localData) {
      const bundle = localData?.bundles?.find(item => item?._id === body?._id)
      const bundles = [...localData?.bundles?.filter(item => item?._id !== bundle?._id), { ...bundle, ...body }]
  
      await LocalStorage.update(`/${VERSION}/${userId}/bag/stores`, ({ ...localData, bundles }))
    } else {
      Promise.resolve(false)
    }
    return Promise.resolve(true)
  } catch(err) {
    return Promise.reject(false)
  } 
}

export async function clear ({ store: storeName, userId } : { store: string, userId: string } ) : Promise<boolean> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    await LocalStorage.update(`/${VERSION}/${userId}/bag/stores`, ({ ...localData, bundles: [] }))
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function remove ({ store: storeName, id, userId } : { store: string, id: string, userId: string }) : Promise<boolean> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    const bundle = localData?.bundles?.find(item => item?._id === id)
    const bundles = localData?.bundles?.filter(item => item?._id !== bundle?._id)

    await LocalStorage.update(`/${VERSION}/${userId}/bag/stores`, ({ ...localData, bundles }))
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}
