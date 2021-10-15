import { AxiosResponse } from 'axios'
import { bundleData } from './bundle'
import * as LocalStorage from './local'
import * as ProductService from './product'
import * as StoreService from './store'
import { StoreDate } from './store'

interface errorData { error: string }
export interface bagData { 
  _id: string
  store: string & StoreDate
  user: any
  bundles: Array<bundleData>
}

const VERSION = '3.2'

export async function index ({ userId } : { userId: string }) : Promise<AxiosResponse<Array<bagData>>> {
  try {
    const localData = await LocalStorage.index(`/${VERSION}/${userId}/bag/stores`)

    const data = await Promise.all(localData?.map(async item => {
      const { data: store } = await StoreService.search({ id: item?.store })

      const bundles = await Promise.all(item?.bundles?.map(async bundle => {
        const { data: product } = await ProductService.search({ store: store?.name, id: bundle?.product })
        return ({ ...bundle, product })
      }))

      return ({ ...item, store, bundles })
    }))
    
    return Promise.resolve(data as any)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function search ({ id, userId } : { id: string, userId: string }) : Promise<bagData> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, id)
    
    const { data: store } = await StoreService.search({ id: localData?.store })

    const bundles = await Promise.all(localData?.bundles?.map(async bundle => {
      const { data: product } = await ProductService.search({ store: store?.name, id: bundle?.product })
      return ({ ...bundle, product })
    }))

    return Promise.resolve({ ...localData, store, bundles })
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function create ({ userId, body } : { userId: string, body: Partial<bagData> } ) : Promise<boolean> {
  try {
    await LocalStorage.create(`/${VERSION}/${userId}/bag/stores`, body)
    return Promise.resolve(true)
  } catch(err) {
    return Promise.reject(false)
  } 
}

export async function update ({ userId, body } : { userId: string, body: bagData } ) : Promise<boolean> {
  try {
    await LocalStorage.update(`/${VERSION}/${userId}/bag/stores`, body)
    return Promise.resolve(true)
  } catch(err) {
    return Promise.reject(false)
  } 
}

export async function clear ({ store, userId } : { store: string, userId: string } ) : Promise<boolean> {
  try {
    await LocalStorage.clear(`/${VERSION}/${userId}/bag/stores`)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function remove ({ id, userId } : { id: string, userId: string }) : Promise<boolean> {
  try {
    await LocalStorage.remove(`/${VERSION}/${userId}/bag/stores`, id)
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}