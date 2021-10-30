// import AsyncStorage from "@react-native-community/async-storage"
import AsyncStorage from '@react-native-async-storage/async-storage'

interface errorData { error: string }
export interface localData { _id: string }

export const generateId = ():string => String(Date.now())

export async function all (key: string) : Promise<Array<any | localData>> {
  try {
    const allKeys = await AsyncStorage.getAllKeys()
    const keys = allKeys.filter(k => k.includes(key))
    const items = await AsyncStorage.multiGet(keys)
    const data = items.map(([_key, _item]) => [...JSON.parse(_item)])
    return Promise.resolve(data)
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function index (key: string) : Promise<Array<any | localData>> {
  try {
    const response = await AsyncStorage.getItem(key);
    const data = JSON.parse(response)
    if (!data) return []
    return Promise.resolve(data)
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function find (key: string, _id: string) : Promise<any | localData> {
  try {
    const data = await index(key);
    const findItem = data?.find(item => item?._id === _id)
    return Promise.resolve(findItem)
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function save (key: string, body: any) : Promise<boolean> {
  try {
    const findItem = await find(key, body._id)
    if (!findItem) !Array.isArray(body) ? await create(key, body) : bulk_create(key, body)
    else await update(key, body) 
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function create (key: string, body: any) : Promise<any | localData> {
  try {
    const data = await index(key);
    if (!body?._id) body._id = generateId()
    await AsyncStorage.setItem(key, JSON.stringify([...data, body]))
    return Promise.resolve(body)
  } catch(err) { 
    return Promise.reject(err)
  } 
}

export async function update (key: string, body: any) : Promise<boolean> {
  try {
    const data = await index(key);
    const newData = data?.map(item => item?._id === body?._id ? ({...item, ...body}) : item )
    await AsyncStorage.setItem(key, JSON.stringify(newData))
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function bulk_create (key: string, items: Array<any>) : Promise<boolean> {
  try {
    const data = await index(key);
    items?.forEach((item, index) => item._id = generateId()+index)
    await AsyncStorage.setItem(key, JSON.stringify([...data, ...items]))
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function clear (key: string) : Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify([]))
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}

export async function remove (key: string, _id: string) : Promise<boolean> {
  try {
    const data = await index(key);
    const response = [...data?.filter(item => item?._id !== _id)]
    await AsyncStorage.setItem(key, JSON.stringify(response))
    return Promise.resolve(true)
  } catch(err) { 
    return Promise.reject(false)
  } 
}
