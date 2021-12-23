import { gql } from "@apollo/client";


export const MAKE_EDIT_PROMOTION = gql`
query MakeEditPromotion(
  $storeName: String!
  $slug: String!,
  $offset: Int!,
  $limit: Int!,
  $regex: [String]
  $search: String
) {

  store (match: { name: $storeName }) { _id }

  totalCount(
    model: "product", 
    match: { store: { name: $storeName } },
  )

  products (
    match: { store: { name: $storeName }, name: $search }, 
    options: { skip: $offset, limit: $limit, regex: $regex } 
  ) { 
    _id, uri, name, about, price, offset, single, slug,
    promotions { _id, name, percent  }
  }

  promotion(match: { store: { name: $storeName }, slug: $slug } ) {
    _id, name, self, percent, slug,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice },
    products { _id }
  }
}
`;

export const MAKE_ADD_PROMOTION = gql`
query MakeAddPromotion(
  $storeName: String!
  $offset: Int!,
  $limit: Int!,
  $regex: [String]
  $search: String
) {

  store (match: { name: $storeName }) { _id }

  totalCount(
    model: "product", 
    match: { store: { name: $storeName } },
  )

  products (
    match: { store: { name: $storeName }, name: $search }, 
    options: { skip: $offset, limit: $limit, regex: $regex } 
  ) { 
    _id, uri, name, about, price, offset, single,
    promotions { _id, percent  }
  }
}
`;

export const CREATE_PROMOTION = gql`
# Increments a back-end counter and gets its resulting value
mutation CreatePromotion ($input: PromotionInput) {
  createPromotion(input: $input) {
    _id, name, self, percent,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
    products { _id }
  }
}
`;

export const EDIT_PROMOTION = gql`
# Increments a back-end counter and gets its resulting value
mutation UpdatePromotion ($id: ID!, $input: PromotionInput) {
  updatePromotion(_id: $id, input: $input) {
    _id, name, self, percent,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
    products { _id }
  }
}
`;