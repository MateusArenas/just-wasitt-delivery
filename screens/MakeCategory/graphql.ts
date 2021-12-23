import { gql } from "@apollo/client";


export const MAKE_EDIT_CATEGORY = gql`
query MakeEditCategory(
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
    _id, uri, name, about, price, offset, single,
    promotions { _id, name, percent  }
  }

  category(match: { store: { name: $storeName }, slug: $slug } ) {
    _id, name, self,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice },
    products { _id }
  }
}
`;

export const MAKE_ADD_CATEGORY = gql`
query MakeAddCategory(
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
    _id, uri, name, about, price, offset, single, spinOff,
    promotions { _id, percent  }
  }
}
`;

export const CREATE_CATEGORY = gql`
# Increments a back-end counter and gets its resulting value
mutation CreateCategory ($input: CategoryInput) {
  createCategory(input: $input) {
    _id, name, self,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
  }
}
`;

export const EDIT_CATEGORY = gql`
# Increments a back-end counter and gets its resulting value
mutation UpdateCategory ($id: ID!, $input: CategoryInput) {
  updateCategory(_id: $id, input: $input) {
    _id, name, self,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
  }
}
`;