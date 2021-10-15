/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
  Andress: undefined;
  Phone: undefined;
  Account: undefined;
  Store: { store: string };
  Product: { store: string, category: string, name: string };
  Checkout: { store: string };
  StoreOptions: { store: string };
  ProductOptions: { store: string, category: string, name: string };
};

export type BottomTabParamList = {
  TabHome: undefined;
  TabExplore: undefined;
  TabCart: undefined;
  TabStoreMain: undefined;
};

export type TabExploreParamList = {
  Main: undefined;
  Search: undefined;
};

export type TabHomeParamList = {
  Main: undefined;
};

export type ProductStackParamList = {
  Main: { store: string, category: string, name: string };
};

export type CheckoutStackParamList = {
  Main: { store: string };
  Sender: { store: string };
};

export type TabCartParamList = {
  Main: undefined;
};

export type TabStoreMainParamList = {
  Main: { store: string };
  Order: undefined;
};

export type SearchTabParamList = {
  Products: undefined;
  Stores: undefined
};