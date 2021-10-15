import { writePrice } from "../utils"
import { OrderData } from "../services/order"

export default function useOrder(order : OrderData) {

  function priceOff(price: number, percents: Array<number>) {
    return price - (Math.max(...percents?.map(item => item / 100)) * price)
  }

const totalPrice = order?.bag?.bundles?.map(({ product, quantity }) => 
  priceOff(product?.price, product?.promotions?.map(({ percent }) => percent)) * quantity
)?.reduce((cur,acc) => cur+acc, 0)

return `*${order?.store?.name}*

*Nome: ${order?.name}*
*Contato: ${order?.phoneNumber}*

*Código do pedido: ${order?._id}*
${Array.isArray(order?.bag?.bundles) && order?.bag?.bundles?.map(_item => `
*${_item?.quantity}x - ${_item?.product?.name}*${!!_item?.comment ? `\n*Observação: ${_item?.comment}*` : ''}
*( ${writePrice(priceOff(_item?.product?.price, _item?.product?.promotions?.map(({ percent }) => percent)))} )*
                                        *${writePrice(priceOff(_item?.product?.price, _item?.product?.promotions?.map(({ percent }) => percent)) * _item?.quantity)}*
*_________________________________________*
`).join('\n')}

*Subtotal:*               *${writePrice(totalPrice)}*
*Entrega:*                *${writePrice(order?.deliveryPrice)}*
*Subtotal:*               *${writePrice(totalPrice + order?.deliveryPrice)}*

${
  order?.paymentMoney ? `
  *Pagamento no:*
  *Dinheiro:*              *${writePrice(totalPrice + order?.deliveryPrice)}*
  ${order?.thing ? `*Troco:*              *${writePrice(order?.thingValue - (totalPrice + order?.deliveryPrice))}*` : ''}
  ` : order?.paymentCredit ? `
  *Pagamento no:*
  *Crédito:*              *${writePrice(totalPrice + order?.deliveryPrice)}*
  ` : order?.paymentDebt ? `
  *Pagamento no:*
  *Débito:*              *${writePrice(totalPrice + order?.deliveryPrice)}*
  ` : order?.paymentMealTicket ? `
  *Pagamento no:*
  *Vale alimentação:*              *${writePrice(totalPrice + order?.deliveryPrice)}*
  ` : ''
}

${order?.delivery ? 
`*Endereço da Entrega*

*Rua: ${order?.street}*
*Número: ${order?.houseNumber}*
*Bairro: ${order?.district}*
*Cidade: ${order?.city}*` :
`*Local de Retirada*
*Rua xxx, xxx, n? xxxxxx*
`}

*_________________________________________*

        *Tecnologia: www.imenu.com.br*
`
}