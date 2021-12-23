import { gql } from "@apollo/client";

export const STORE_NAME = gql`
query CurrentStore($matchName: String!) {
  store(match: { name: $matchName }, options: { regex: ["name"], flag: { name: "i" } }) {
    _id, uri, name, about, self, city, state, 
    followers { _id }, feedbacks { _id }, products { _id }
    categories { _id, name, slug,
      products { _id, uri, name, about, price, offset, single, slug,
        promotions { _id, name, percent, slug  }
      }
    }
    promotions { _id }
    # services, coupons, saleOffers,
    minDeliveryBuyValue, 
    monday, mondayStart, mondayEnd, tuesday, tuesdayStart, tuesdayEnd 
    wednesday, wednesdayStart, wednesdayEnd, thursday, thursdayStart, thursdayEnd, 
    friday, fridayStart, fridayEnd, saturday, saturdayStart, saturdayEnd 
    sunday, sundayStart, sundayEnd
  }
}
`;