/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme, useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import Colors from '../constants/Colors';
import AccountScreen from '../screens/Account';
import AndressScreen from '../screens/Andress';

import NotFoundScreen from '../screens/NotFoundScreen';
import PhoneScreen from '../screens/Phone';
import Product from '../screens/Product';
import Store from '../screens/Store';
import StoreOptionsScreen from '../screens/StoreOptions';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';
import CheckoutStackNavigator from './CheckoutStackNavigation';
import LinkingConfiguration from './LinkingConfiguration';
import CreateBottomHalfModal from './Views/Modal';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
      <ThemeProvider theme={Colors[colorScheme === 'dark' ? 'dark' : 'light']}>
        <NavigationContainer
          linking={LinkingConfiguration}
          theme={Colors[colorScheme === 'dark' ? 'dark' : 'light']}
        >
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

const ProductModalStack = CreateBottomHalfModal(Product)
const CheckoutModalStack = CreateBottomHalfModal(CheckoutStackNavigator)
const AndressModalStack = CreateBottomHalfModal(AndressScreen)
const PhoneModalStack = CreateBottomHalfModal(PhoneScreen)
const AccountModalStack = CreateBottomHalfModal(AccountScreen)
const StoreOptionsModal = CreateBottomHalfModal(StoreOptionsScreen, { adjustToContentHeight: true, modalHeight: undefined })
const ProductOptionsModal = CreateBottomHalfModal(StoreOptionsScreen, { adjustToContentHeight: true, modalHeight: undefined })

const modal = {
  options: { 
    headerShown: false,
    cardStyle: { backgroundColor: 'transparent' }
  }
}

function RootNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator 
      headerMode={'screen'}
      mode={'modal'}
      screenOptions={{ 
        cardStyle: { backgroundColor: colors.background, flex: 1 }, 
      }}
      initialRouteName={'Root'}
    >
      <Stack.Screen name="Root" component={BottomTabNavigator} />
      <Stack.Screen 
        name="Store" 
        component={Store}
      />
      <Stack.Screen {...modal} name="Product" component={ProductModalStack} />
      <Stack.Screen {...modal} name="Checkout" component={CheckoutModalStack} />
      <Stack.Screen {...modal} name="Andress" component={AndressModalStack} />
      <Stack.Screen {...modal} name="Phone" component={PhoneModalStack} />
      <Stack.Screen {...modal} name="Account" component={AccountModalStack} />
      <Stack.Screen {...modal} name="StoreOptions" component={StoreOptionsModal} />
      <Stack.Screen {...modal} name="ProductOptions" component={ProductOptionsModal} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
