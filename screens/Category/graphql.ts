import { gql } from "@apollo/client";


export const CATEGORY = gql`
query CurrentCategory(
  $name: String,
  $slug: ID!,
  $offset: Int!,
  $limit: Int!,
  $regex: [String],
) {
  totalCount(
    model: "product", 
    match: { categories: { slug: $slug }, name: $name },
    options: { regex: $regex, model: { categories: "Category" } } 
  )

  products (
    match: { categories: { slug: $slug }, name: $name }, 
    options: { 
      skip: $offset, 
      limit: $limit, 
      regex: $regex,
      model: { categories: "Category" }
    } 
  ) { 
    _id, uri, name, about, price, offset, single, slug,
    promotions { _id, name, percent  }
  }

  category(match: { slug: $slug } ) {
    _id, name, self, slug,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
  }
}
`;


export const REMOVE_CATEGORY = gql`
# Increments a back-end counter and gets its resulting value
mutation RemoveCategory ($id: ID!) {
  deleteCategory(_id: $id) {
    _id
  }
}
`;