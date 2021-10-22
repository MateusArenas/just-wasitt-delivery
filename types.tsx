/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: { screen?: keyof BottomTabParamList };
  NotFound: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Andress: { id?: string };
  Phone: undefined;
  Account: undefined;

  Bag: { store: string };
  Checkout: { store: string };

  Saved: undefined
  Favorite: undefined
  
  Orders: { store: string };
  Order: { store: string, id: string };
  
  Followers: { store: string };
  Feedbacks: { store: string };
  Store: { store: string };
  Offers: { store: string };
  StoreInfo: { store: string };
  Promotion: { store: string, id: string };
  Category: { store: string, id: string };
  Products: { store: string };
  Product: { store: string, id: string };

  MakeStore: { id?: string };

  NewFeedback: { store: string, reply?: string };

  MakePromotion: { store: string, id?: string };

  MakeCategory: { store: string, id?: string };

  MakeProduct: { store: string, id?: string };

  NewStore: undefined;
  EditStore: { id: string };

  EditAccount: { id: string };
};

export type BottomTabParamList = {
  TabHome: { screen?: keyof TabHomeParamList, category: string };
  TabExplore: { screen?: keyof TabExploreParamList };
  TabCart: { screen?: keyof TabCartParamList };
  TabStoreMain: { screen?: keyof TabStoreMainParamList, store?: string };
};

export type TabExploreParamList = {
  Main: undefined;
  Search: { screen?: keyof SearchTabParamList };

  Categories: { category: string };

  Store: { store: string };
  Promotion: { store: string, id: string };
  Category: { store: string, id: string };
  Products: { store: string };
  Product: { store: string, id: string };
};

export type TabHomeParamList = {
  Main: { category: string };
};

export type TabCartParamList = {
  Main: undefined;
  Bag: { store: string };
  Checkout: { store: string };
  Saved: undefined
  Favorite: undefined

  Feedbacks: { store: string };
  NewFeedback: { store: string, reply?: string };
  Followers: { store: string };
  Store: { store: string };
  Promotion: { store: string, id: string };
  Category: { store: string, id: string };
  Products: { store: string };
  Product: { store: string, id: string };
};

export type TabStoreMainParamList = {
  Main: undefined;
  Account: undefined;
  Saved: undefined
  Favorite: undefined

  Bag: { store: string };
  Checkout: { store: string };

  Feedbacks: { store: string };
  NewFeedback: { store: string, reply?: string };
  Followers: { store: string };
  Store: { store: string };
  Promotion: { store: string, id: string };
  Category: { store: string, id: string };
  Products: { store: string };
  Product: { store: string, id: string };
};

export type CheckoutStackParamList = {
  Main: { store: string };
  Sender: { store: string };
};

export type SearchTabParamList = {
  Products: undefined;
  Stores: undefined;
  Categories: undefined;
};