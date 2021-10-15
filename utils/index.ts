import { Linking } from "react-native"
import { AndressData } from "../services/andress"

export const getAndress = (params: Partial<AndressData>) : AndressData => ({
  _id: params?._id,
  ceep: params?.ceep,
  district: params?.district,
  street: params?.street,
  houseNumber: params?.houseNumber,
  complement: params?.complement,
  city: params?.city,
  state: params.state,
})

export function capitalizeFisrtLetter (text: string | number) : string {
  return (typeof text === 'number') ? String(text)
  : text?.charAt(0)?.toUpperCase() + text?.slice(1)
} 

export function writePrice (price: number) : string {
  return `R$ ${Number(price).toFixed(2)}`
} 

export function writeAndress (andress: Partial<AndressData>) : string { //Estr. do Carneiro n53
  if (andress) return `${andress?.street?.substr(0, 15)}, n${andress?.houseNumber}`
  else return ''
}

export function writeMaxTextSize(text: string, size: number) : string {
  if (text?.length > size) return text?.substring(0, size)
  else return text
}

export function WhatsApp(text, phone) {
  // Linking.openURL(`whatsapp://send?text=${text}&phone=${phone}`);
  Linking.canOpenURL(`whatsapp://send?text=${text}`).then(supported => {
    if (supported) {
      return Linking.openURL(
        `whatsapp://send?phone=${phone}&text=${text}`
      );
    } else {
      return Linking.openURL(
        `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
      );
    }
  })
}

interface createOrderObj {
  name: string
  phone?: string
  andress: any
  isDelivery: boolean
  paymentForms: Array<any>
  totalPrice: number
  deliveryPrice: number
  items: Array<any>
}

export function createOrder({
  name,
  phone,
  andress,
  isDelivery,
  paymentForms,
  totalPrice,
  deliveryPrice,
  items,
} : createOrderObj) {

const code = `#1238127312hwhbscbhs!!###`

const order = `*Habibs*

*Nome: ${name}*
*Contato: ${phone}*

*Código do pedido: ${code}*
${Array.isArray(items) && items?.map(_item => `
*${_item?.quantity}x - ${_item?.name}*${_item?.comment && `\n*Observação: ${_item?.comment}*`}
*( R$ ${_item?.originalPrice?.toFixed(2)} )*
                                        *R$ ${_item?.price.toFixed(2)}*
*_________________________________________*
`).join('\n')}

*Subtotal:*               *R$ ${totalPrice?.toFixed(2)}*
*Entrega:*                *R$ ${deliveryPrice?.toFixed(2)}*
*Subtotal:*               *R$ ${(totalPrice + deliveryPrice).toFixed(2)}*

${paymentForms?.map(_paymentForm => `
${_paymentForm?.type === 'money' ? `
*Pagamento no:*
*Dinheiro:*              *R$ ${_paymentForm?.value.toFixed(2)}*
${_paymentForm?.thing ? 
`*Troco para:*          *R$ ${_paymentForm?.thing.toFixed(2)}*
*Troco:*                 *R$ ${(_paymentForm?.thing - _paymentForm?.value).toFixed(2)}*` : 
'*( Não preciso de troco )*' 
}`: ''}
${_paymentForm?.type === 'card' ? `
*Pagamento no:*
*Cartão:*              *R$ ${_paymentForm?.value.toFixed(2)}*
`: ''
}`).join('')}

${isDelivery ? 
`*Endereço da Entrega*

*Rua: ${andress?.street}*
*Número: ${andress?.number}*
*Bairro: ${andress?.district}*
*Cidade: ${andress?.city}*` :
`*Local de Retirada*
*Rua xxx, xxx, n? xxxxxx*
`}

*_________________________________________*

        *Tecnologia: www.imenu.com.br*
`

  return order
}