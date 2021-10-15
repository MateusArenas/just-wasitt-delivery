/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */
 import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    initialRouteName: 'Root',
    screens: {
      Root: {
        screens: {
          TabHome: {
            screens: {
              Main: 'home',
            },
          },
          TabExplore: {
            screens: {
              Main: 'explore',
              Search: {
                path: 'search',
                initialRouteName: 'Products',
                screens: {
                  Products: 'products',
                  Stores: 'stores'
                }
              }
            },
          },
          TabCart: {
            screens: {
              Main: 'cart',
            },
          },
          TabStoreMain: {
            path: 'main',
            parse: { main: String },
            initialRouteName: 'Main',
            screens: {
              Main: {
                path: 'store/:store/menu/:section',
                parse: { store: String, section: String },
              },
              Order: 'order',
            },
          },
        },
      },
      Store: {
        path: 'store/:store/menu/:section',
        parse: { store: String, section: String },
      },
      StoreOptions: {
        path: 'store/:store/options',
        parse: { store: String },
      },
      Product: {
        path: 'store/:store/product/:category/:name',
        parse: { store: String, category: String, name: String },
      },
      ProductOptions: {
        path: 'store/:store/product-options/:category/:name',
        parse: { store: String, category: String, name: String },
      },
      Checkout: {
        path: 'store/:store/checkout',
        parse: { store: String },
        initialRouteName: 'Main',
        screens: {
          Main: '',
          Sender: 'sender',
        }
      },
      Andress: 'andress',
      Account: 'account',
      Phone: 'phone',
      NotFound: '*',
    },
  },
} as LinkingOptions
