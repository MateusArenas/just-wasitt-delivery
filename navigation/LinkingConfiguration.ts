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
            path: './',
            initialRouteName: 'Main',
            screens: {
              Main: '',
              Categories: { path: 'categories/:category', exact: true },
              Store: { path: 'store/:store', exact: true },
              StoreInfo: {  path: 'store/:store/info', exact: true },
              Product: { path: 'store/:store/product/:slug', exact: true },
              Products: { path: 'store/:store/products', exact: true },
              Category: { path: 'store/:store/category/:slug', exact: true },
              Promotion: { path: 'store/:store/promotion/:slug', exact: true },
              Offers: { path: 'store/:store/offers', exact: true },
              Followers: { path: 'store/:store/followers', exact: true },
              Feedbacks: { path: 'store/:store/feedbacks', exact: true },
              NewFeedback: { path: 'store/:store/new-feedback/:reply?', exact: true },
              Bag: { path: 'store/:store/bag', exact: true },
              Checkout: { path: 'store/:store/checkout', exact: true },
              Saved: 'saved',
              Favorite: 'favorite',
            }
          },
          TabExplore: {
            path: '././',
            initialRouteName: 'Main',
            screens: {
              Main: 'explore',
              Categories: 'categories/:category',
              Store: 'store/:store',
              StoreInfo: 'store/:store/info',
              Product: 'store/:store/product/:slug',
              Products: 'store/:store/products',
              Category: 'store/:store/category/:slug',
              Promotion: 'store/:store/promotion/:slug',
              Offers: 'store/:store/offers',
              Followers: 'store/:store/followers',
              Feedbacks: 'store/:store/feedbacks',
              NewFeedback: 'store/:store/new-feedback/:reply?',
              Bag: 'store/:store/bag',
              Checkout: 'store/:store/checkout',
              Saved: 'saved',
              Favorite: 'favorite',
            }
          },
          TabCart: {
            path: './././',
            initialRouteName: 'Main',
            screens: {
              Main: 'cart',
              Categories: 'categories/:category',
              Store: 'store/:store',
              StoreInfo: 'store/:store/info',
              Product: 'store/:store/product/:slug',
              Products: 'store/:store/products',
              Category: 'store/:store/category/:slug',
              Promotion: 'store/:store/promotion/:slug',
              Offers: 'store/:store/offers',
              Followers: 'store/:store/followers',
              Feedbacks: 'store/:store/feedbacks',
              NewFeedback: 'store/:store/new-feedback/:reply?',
              Bag: 'store/:store/bag',
              Checkout: 'store/:store/checkout',
              Saved: { path: 'saved', exact: true },
              Favorite: { path: 'favorite', exact: true },
            }
          },
          TabStoreMain: {
            path: '././././',
            initialRouteName: 'Account',
            screens: {
              Account: { path: 'account', exact: true },
              Categories: 'categories/:category',
              Store: 'store/:store',
              StoreInfo: 'store/:store/info',
              Product: 'store/:store/product/:slug',
              Products: 'store/:store/products',
              Category: 'store/:store/category/:slug',
              Promotion: 'store/:store/promotion/:slug',
              Offers: 'store/:store/offers',
              Followers: 'store/:store/followers',
              Feedbacks: 'store/:store/feedbacks',
              NewFeedback: 'store/:store/new-feedback/:reply?',
              Bag: 'store/:store/bag',
              Checkout: 'store/:store/checkout',
              Saved: 'saved',
              Favorite: 'favorite',
            }
          },
        },
      },
      MakeStore: {
        path: 'make-store/:id?',
        parse: { id: String },
      },
      MakePromotion: {
        path: 'store/:store/make/promotion/:slug?',
        parse: { store: String, slug: String },
      },
      MakeCategory: {
        path: 'store/:store/make/category/:slug?',
        parse: { store: String, slug: String },
      },
      MakeProduct: {
        path: 'store/:store/make/product/:slug?',
        parse: { store: String, slug: String },
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
      Andress: {
        path: 'andress/:id?',
        parse: { id: String },
      },
      Phone: 'phone',
      SignIn: 'signin',
      SignUp: 'signup',
      NotFound: '*',
    },
  },
} as LinkingOptions


