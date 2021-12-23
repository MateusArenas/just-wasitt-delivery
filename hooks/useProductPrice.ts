import { bundleData } from "../services/bundle"
import { ProductData } from "../services/product"

export default function useProductPrice(data: bundleData, notPromotion?: boolean) : number {
    const additionals = useProductAdditionals(data)
 
   const value = useProductValue(data?.product, notPromotion)
 
   const teto = (
     (data?.product?.offset / 100 )
     * value
   )
 
   const total = data?.product?.single ? value+additionals 
   : additionals <= (value+teto) ? value
   : value+(additionals-(value+teto))

   return total
}

export function useProductValue (product: ProductData, notPromotion?: boolean) {
    return (product?.promotions?.length > 0 && !notPromotion) ? (product?.price - (
        (Math.max(...product?.promotions?.map(item => item?.percent), 0) / 100 )
        * product?.price
    )) : product?.price
}


export function useProductAdditionals (data: bundleData) {
    return (data?.components?.length > 0) ?
    data?.components?.map(({ product, quantity, components: byComponents }) => {  
     const byProduct = data?.product?.products?.find(item => item?._id === product?._id)
 
     const subAdditionals = byComponents?.map(({ product: sub, quantity: subQuantity }) => {  
       const subProduct = byProduct?.products?.find(item => item?._id === sub?._id)
       return ( subProduct?.price - 
         (
           (Math.max(...subProduct?.promotions?.map(item => item?.percent), 0) / 100 )
           * subProduct?.price
         )
       ) * subQuantity
     })?.reduce((acc, cur) => acc + cur, 0)
 
     return (( byProduct?.price - 
       (
         (Math.max(...byProduct?.promotions?.map(item => item?.percent), 0) / 100 )
         * byProduct?.price
       )
     ) * quantity) + (quantity > 0 ? subAdditionals : 0)
   })?.reduce((acc, cur) => acc + cur, 0)
   : 0
}