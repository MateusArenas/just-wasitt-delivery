/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */
 import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';


export default {
  // prefixes: [Linking.makeUrl('/')],
  prefixes: ['https://wasitt.com', 'exps://wasitt.com'],
  config: {
    initialRouteName: 'Root',
    screens: {
      Root: {
        initialRouteName: 'TabHome',
        screens: {
          TabHome: {
            path: 'home',
            initialRouteName: 'Main',
            screens: {
              Main: {
                path: ':category',
                parse: { category: String },
              }
            },
          },
          TabExplore: {
            path: 'explore',
            initialRouteName: 'Main',
            screens: {
              Main: '',
              Categories: {
                path: 'categories/:category',
                parse: { category: String },
              },
              Search: {
                path: 'search',
                initialRouteName: 'Products',
                screens: {
                  Products: 'products',
                  Stores: 'stores',
                  Categories: 'categories',
                }
              }
            },
          },
          TabCart: {
            path: 'cart',
            screens: {
              Main: '',
              Saved: 'saved',
              Favorite: 'favorite',
              Bag: {
                path: 'store/:store/bag',
                parse: { store: String },
              },
              Checkout: {
                path: 'store/:store/checkout',
                parse: { store: String },
              },
              Store: {
                path: 'store/:store',
                parse: { store: String },
              },
              Followers: {
                path: 'store/:store/followers',
                parse: { store: String },
              },
              Feedbacks: {
                path: 'store/:store/feedbacks',
                parse: { store: String },
              },
              NewFeedback: {
                path: 'store/:store/new-feedback/:reply?',
                parse: { store: String, reply: String },
              },
              Category: {
                path: 'store/:store/category/:id',
                parse: { store: String, id: String },
              },
              Product: {
                path: 'store/:store/product/:id',
                parse: { store: String, id: String },
              },
            },
          },
          TabStoreMain: {
            path: 'main',
            initialRouteName: 'Account',
            screens: {
              Account: 'account',
              Saved: 'saved',
              Favorite: 'favorite',
              Store: {
                path: 'store/:store',
                parse: { store: String },
              },
              Followers: {
                path: 'store/:store/followers',
                parse: { store: String },
              },
              Feedbacks: {
                path: 'store/:store/feedbacks',
                parse: { store: String },
              },
              NewFeedback: {
                path: 'store/:store/new-feedback/:reply?',
                parse: { store: String, reply: String },
              },
              Category: {
                path: 'store/:store/category/:id',
                parse: { store: String, id: String },
              },
              Products: {
                path: 'store/:store/products',
                parse: { store: String },
              },
              Product: {
                path: 'store/:store/product/:id',
                parse: { store: String, id: String },
                // parse: {
                //   store: String,
                //   name: name => name.replace(/^-/g, ' '),
                // },
                // stringify: {
                //   store: String,
                //   name: name => name.replace(/\s/g, '-'),
                // },
              },
              Bag: {
                path: 'store/:store/bag',
                parse: { store: String },
              },
              Checkout: {
                path: 'store/:store/checkout',
                parse: { store: String },
              },
            },
          },
        },
      },
      Store: {
        path: 'store/:store',
        parse: { store: String },
      },
      Offers: {
        path: 'store/:store/offers',
        parse: { store: String },
      },
      Followers: {
        path: 'store/:store/followers',
        parse: { store: String },
      },
      Feedbacks: {
        path: 'store/:store/feedbacks',
        parse: { store: String },
      },
      StoreInfo: {
        path: 'store/:store/info',
        parse: { store: String },
      },
      Promotion: {
        path: 'store/:store/promotion/:id',
        parse: { store: String, id: String },
      },
      Category: {
        path: 'store/:store/category/:id',
        parse: { store: String, id: String },
      },
      Products: {
        path: 'store/:store/products',
        parse: { store: String },
      },
      Product: {
        path: 'store/:store/product/:id',
        parse: { store: String, id: String },
      },
      NewFeedback: {
        path: 'store/:store/new-feedback/:reply?',
        parse: { store: String, reply: String },
      },
      MakeStore: {
        path: 'make-store/:id?',
        parse: { id: String },
      },
      MakeCategory: {
        path: 'store/:store/make-category/:id?',
        parse: { store: String, id: String },
      },
      MakeProduct: {
        path: 'store/:store/make-product/:id?',
        parse: { store: String, id: String },
      },
      EditAccount: {
        path: 'manage/edit-account/:id',
        parse: { id: String },
      },
      Orders: {
        path: 'store/:store/orders',
        parse: { store: String },
      },
      Order: {
        path: 'store/:store/orders/:id?',
        parse: { store: String, id: String },
      },
      Bag: {
        path: 'store/:store/bag',
        parse: { store: String },
      },
      Checkout: {
        path: 'store/:store/checkout',
        parse: { store: String },
      },
      Andress: {
        path: 'andress/:id?',
        parse: { id: String },
      },
      Saved: 'saved',
      Favorite: 'favorite',
      Account: 'account',
      Phone: 'phone',
      SignIn: 'signin',
      SignUp: 'signup',
      NotFound: '*',
    },
  },
} as LinkingOptions

