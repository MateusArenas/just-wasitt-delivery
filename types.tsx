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
  Promotion: { store: string, slug: string };
  Category: { store: string, slug: string };
  Products: { store: string };
  Product: { store: string, slug: string };

  MakeStore: { id?: string };

  NewFeedback: { store: string, reply?: string };

  MakePromotion: { store: string, slug?: string };

  MakeCategory: { store: string, slug?: string };

  MakeProduct: { store: string, slug?: string };

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
  StoreInfo: { store: string };
  Product: { store: string, slug: string };
  Products: { store: string };
  Category: { store: string, slug: string };
  Promotion: { store: string, slug: string };
  Offers: { store: string };
  Followers: { store: string };
  Feedbacks: { store: string };
  NewFeedback: { store: string, reply?: string };
  Bag: { store: string };
  Checkout: { store: string };
  Saved: undefined
  Favorite: undefined
};

export type TabHomeParamList = {
  Main: { category: string };

  Categories: { category: string };

  Store: { store: string };
  StoreInfo: { store: string };
  Product: { store: string, slug: string };
  Products: { store: string };
  Category: { store: string, slug: string };
  Promotion: { store: string, slug: string };
  Offers: { store: string };
  Followers: { store: string };
  Feedbacks: { store: string };
  NewFeedback: { store: string, reply?: string };
  Bag: { store: string };
  Checkout: { store: string };
  Saved: undefined
  Favorite: undefined
};

export type TabCartParamList = {
  Main: undefined;

  Categories: { category: string };

  Store: { store: string };
  StoreInfo: { store: string };
  Product: { store: string, slug: string };
  Products: { store: string };
  Category: { store: string, slug: string };
  Promotion: { store: string, slug: string };
  Offers: { store: string };
  Followers: { store: string };
  Feedbacks: { store: string };
  NewFeedback: { store: string, reply?: string };
  Bag: { store: string };
  Checkout: { store: string };
  Saved: undefined
  Favorite: undefined
};

export type TabStoreMainParamList = {
  Main: undefined;
  Account: undefined;

  Categories: { category: string };

  Store: { store: string };
  StoreInfo: { store: string };
  Product: { store: string, slug: string };
  Products: { store: string };
  Category: { store: string, slug: string };
  Promotion: { store: string, slug: string };
  Offers: { store: string };
  Followers: { store: string };
  Feedbacks: { store: string };
  NewFeedback: { store: string, reply?: string };
  Bag: { store: string };
  Checkout: { store: string };
  Saved: undefined
  Favorite: undefined
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