import { Linking } from "react-native"
import { MaskService } from "react-native-masked-text"
import { AndressData } from "../services/andress"

export function buildTitle (route: string) {
  return `${route} • Wasitt`
}

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



export const memorize = callback => {
	const cache = {};
	
	return (...args) => {
		const argString = JSON.stringify(args)

		if (!cache[argString]) {
			cache[argString] = callback(...args);
		}
		
		return cache[argString]
	}
}

//example for using memorize
// const factorial = memorize(n => {
// 	if (n === 0) return 1;
// 	else return (factorial(n-1) * n)
// })

// console.time();
// console.log(factorial(100));
// console.timeEnd();


export function formatedMoney (value: number = 0) : string {
  const moneyOptions = {
    precision: 2,
    separator: ',',
    delimiter: '.',
    unit: 'R$ ',
    suffixUnit: ''
  }
  return  MaskService.toMask('money', (value ? value : 0) as unknown as string, moneyOptions)
}