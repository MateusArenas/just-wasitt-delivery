import { gql } from "@apollo/client";


export const MAKE_EDIT_PRODUCT = gql`
query MakeEditProduct(
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
    options: { 
      skip: $offset, 
      limit: $limit, 
      regex: $regex, 			
    } 
  ) { 
    _id, uri, name, about, price, offset, single,
    promotions { _id, name, percent  }
  }

  promotions (
    match: { store: { name: $storeName } }, 
    # options: { skip: $offset, limit: $limit } 
  ) { _id, name, percent  }

  categories (
    match: { store: { name: $storeName } }, 
    # options: { skip: $offset, limit: $limit } 
  ) { _id, name  }

  product(match: { store: { name: $storeName }, slug: $slug }) {
    _id, uri, name, about, price, offset, single,
    promotions { _id, name, percent  }, 
    categories { _id, name },
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice },
    products { _id }
  }
}
`;

export const MAKE_ADD_PRODUCT = gql`
query MakeAddProduct(
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

  promotions (
    match: { store: { name: $storeName } }, 
  ) { _id, name, percent  }

  categories (
    match: { store: { name: $storeName } }, 
  ) { _id, name  }

}
`;

export const CREATE_PRODUCT = gql`
# Increments a back-end counter and gets its resulting value
mutation CreateProduct ($input: ProductInput) {
  createProduct(input: $input) {
    _id, name, self, 
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
    products { _id }
  }
}
`;

export const EDIT_PRODUCT = gql`
# Increments a back-end counter and gets its resulting value
mutation UpdateProduct ($id: ID!, $input: ProductInput) {
  updateProduct(_id: $id, input: $input) {
    _id, name, self, 
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
    products { _id }
  }
}
`;