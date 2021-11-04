import { AxiosResponse } from 'axios'
import * as LocalStorage from './local'
import * as ProductService from './product'
import * as StoreService from './store'
import { StoreDate } from './store'

export interface componentData {
  components?: Array<componentData>
  product: ProductService.ProductData & any
  quantity: number
}

interface errorData { error: string }
export interface bundleData { 
  _id: string
  store: StoreDate & string
  user: any
  product: ProductService.ProductData & any
  components: Array<componentData>
  quantity: number
  comment?: string
}

const VERSION = '5.2'

export async function index ({ store: storeName, userId } : { store: string, userId: string }) : Promise<AxiosResponse<Array<bundleData>>> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    // const data = await Promise.all(localData?.bundles?.map(async bundle => {
    //   const { data: store } = await StoreService.search({ id: bundle?.store })
    //   const { data: product } = await ProductService.search({ store: store?.name, id: bundle?.product })
    //   return ({ ...bundle, store, product })
    // }))

    const data = await Promise.all(localData?.bundles?.map(async bundle => 
      await search({ store: storeName, id: bundle?._id, userId })
    ))
    
    return Promise.resolve(data as any)
  } catch(err) { 
    return Promise.reject(err as errorData)
  } 
}

export async function search ({ store: storeName, id, userId } : { store: string, id: string, userId: string }) : Promise<bundleData> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    const bundle = localData?.bundles?.find(item => item?._id === id) as bundleData

    
    const { data: _store } = await StoreService.search({ id: localData?.store })
    const store = (_store as unknown as  StoreDate)
    const { data: _product } = await ProductService.search({ store: store?.name, id: bundle?.product })
    const product = (_product as unknown as  ProductService.ProductData)

    
    const components = bundle?.components?.map(component => {
      const byProduct = product?.products?.find(item => item?._id === component?.product)
      const components = component?.components?.map(item => ({
        ...item,
        product: byProduct?.products?.find(subProduct => subProduct?._id === item?.product)
      }))
       return ({
         ...component,
         product: byProduct,
        components,
       })
    })

    // const components = await Promise.all(localData?.bundles?.map(async (bundle: bundleData) => {
    //   const { data: product } = await ProductService.search({ store: store?.name, id: bundle?.product })

    //   const components = bundle?.components?.map(component => {
    //     const byProduct = product?.products?.find(item => item?._id === component?.product)
    //     const components = byProduct?.products?.map(subItem => ({
    //       ...subItem,
    //       product: byProduct?.products?.find(item => item?._id === subItem?.product)
    //     }))
    //     return ({
    //       ...component,
    //       product: byProduct,
    //       components
    //     })
    //   })

    //   return ({ ...bundle, product, components })
    // }))



    return Promise.resolve({ ...bundle, store, product, components })
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function create ({ store: storeName, userId, body } : { store: string, userId: string, body: Partial<bundleData> } ) : Promise<bundleData> {
  try {
    const key = `/${VERSION}/${userId}/bag/stores`
    const localData = await LocalStorage.find(key, storeName)

    if (localData) {
      await LocalStorage.update(key, ({ ...localData, bundles: [...localData?.bundles, body] }))
    } else {
      await LocalStorage.create(key, ({ _id: storeName, user: userId, store: body?.store, bundles: [body] }))
    }

    const data = await search({ store: storeName, userId, id: body?._id })
    return Promise.resolve(data)
  } catch(err) {
    return Promise.reject(null)
  } 
}

export async function update ({ store: storeName, userId, body } : { store: string, userId: string, body: Partial<bundleData> } ) : Promise<bundleData> {
  try {
    const localData = await LocalStorage.find(`/${VERSION}/${userId}/bag/stores`, storeName)

    if(localData) {
      const bundle = localData?.bundles?.find(item => item?._id === body?._id)
      const bundles = [...localData?.bundles?.filter(item => item?._id !== bundle?._id), { ...bundle, ...body }]
  
      await LocalStorage.update(`/${VERSION}/${userId}/bag/stores`, ({ ...localData, bundles }))
    } else {
      Promise.resolve(null)
    }

    const data = await search({ store: storeName, userId, id: body?._id })
    return Promise.resolve(data)
  } catch(err) {
    return Promise.reject(null)
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
