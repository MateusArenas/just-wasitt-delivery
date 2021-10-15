import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { CategoryData } from "./category"
import { ProductData } from "./product"
import { StoreDate } from "./store"

interface errorData { error: string }

export async function products (params: any) {
  try {
    const response = await api.get(`/products`, { params })
    return Promise.resolve(response as AxiosResponse<Array<ProductData>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}


