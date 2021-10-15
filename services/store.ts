import { AxiosError, AxiosResponse } from "axios"
import api from "./api"
import { userData } from "./auth"
import { CategoryData } from "./category"
import { FeedbackData } from "./feedback"
import { FollowerData } from "./follower"
import { ProductData } from "./product"
import { PromotionData } from "./promotion"

interface errorData { error: string }

export interface StoreDate {
  self?: boolean
  otherStores?: Array<{ _id: string, name: string }>,
  _id: string,
  name: string,
  user: string & userData,
  products: Array<string & ProductData>,
  categories: Array<string & CategoryData>,
  promotions: Array<string & PromotionData>,
  followers: Array<string & FollowerData>
  feedbacks: Array<string & FeedbackData>
  uri: string,
  about: string,
  phoneNumber: string,
  whatsappNumber: string,
  delivery: boolean,
  deliveryTimeMin: string,
  deliveryTimeMax: string,
  minDeliveryBuyValue: number,
  deliveryAbout: string,
  pickup: boolean,
  deliveryPrice: number,
  paymentMoney: boolean,
  paymentDebt: boolean,
  paymentCredit: boolean,
  paymentMealTicket: boolean,

  monday: boolean,
  mondayStart: string,
  mondayEnd: string,

  tuesday: boolean,
  tuesdayStart: string, 
  tuesdayEnd: string, 

  wednesday: boolean,
  wednesdayStart: string,
  wednesdayEnd: string,

  thursday: boolean,
  thursdayStart: string, 
  thursdayEnd: string, 

  friday: boolean,
  fridayStart: string, 
  fridayEnd: string, 

  saturday: boolean,
  saturdayStart: string, 
  saturdayEnd: string, 

  sunday: boolean,
  sundayStart: string,
  sundayEnd: string,

  cnpj: string,
  
  debtPayments: Array<string>,
  creditPayments: Array<string>,
  mealTicketPayments: Array<string>,

  state?: string
  city?: string
  district?: string
  street?: string
  houseNumber?: string
  complement?: string
  ceep?: string
}

export async function index ({ ...params } : { name: string }) {
  try {
    const response = await api.get(`/store`, { params })
    return Promise.resolve(response as AxiosResponse<Array<StoreDate>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function search ({ id } : { id: string }) {
  try {
    const response = await api.get(`/stores/${id}`)
    return Promise.resolve(response as AxiosResponse<StoreDate>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function userStores () {
  try {
    const response = await api.get('/manage')
    return Promise.resolve(response as AxiosResponse<Array<StoreDate>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

export async function userStore (store: string) {
  try {
    const response = await api.get(`/manage`, { params: { store } })
    return Promise.resolve(response as AxiosResponse<Array<StoreDate>>)
  } catch(err) { 
    return Promise.reject(err as AxiosError<errorData>)
  } 
}

