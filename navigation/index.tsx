import { NavigationContainer, DefaultTheme, DarkTheme, useTheme } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton, HeaderTitle, StackNavigationOptions, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName, SafeAreaView, View, Text, Share } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import Colors from '../constants/Colors';
import AccountScreen from '../screens/Account';
import AndressScreen from '../screens/Andress';
import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import Loading from '../components/Loading';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import { AuthProvider } from '../contexts/auth';
import BottomHalfModalContext, { BottomHalfModalProvider } from '../contexts/BottomHalfModal';
import Store from '../screens/Store';
import Category from '../screens/Category';
import Product from '../screens/Product';
import { MaterialIcons } from '@expo/vector-icons';
import StoreInfo from '../screens/StoreInfo';
import EditAccount from '../screens/EditAccount';
import Bag from '../screens/Bag';
import Products from '../screens/Products';
import Followers from '../screens/Followers';
import Feedbacks from '../screens/Feedbacks';
import NewFeedback from '../screens/NewFeedback';
import Saved from '../screens/Saved';
import Favorite from '../screens/Favorite';
import MakeCategory from '../screens/MakeCategory';
import MakeProduct from '../screens/MakeProduct';
import Checkout from '../screens/Checkout';
import { AndressProvider } from '../contexts/andress';
import { BlurView } from 'expo-blur';
import Promotion from '../screens/Promotion';
import MakePromotion from '../screens/MakePromotion';
import MakeStore from '../screens/MakeStore';
import Order from '../screens/Order';
import Orders from '../screens/Orders';
import Offers from '../screens/Offers';
import { SnackBarProvider } from '../contexts/snackbar';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
      <ThemeProvider theme={Colors[colorScheme === 'dark' ? 'dark' : 'light']}>
        <AuthProvider>
          <AndressProvider>
            <NavigationContainer
              linking={LinkingConfiguration}
              theme={Colors[colorScheme === 'dark' ? 'dark' : 'light']}
              fallback={Loading}
            >
              <SnackBarProvider>
                <BottomHalfModalProvider>
                  <RootNavigator />
                </BottomHalfModalProvider>
              </SnackBarProvider>
            </NavigationContainer>
          </AndressProvider>
        </AuthProvider>
      </ThemeProvider>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { colors, dark } = useTheme();
  return (
    <Stack.Navigator initialRouteName={'Root'}
      headerMode={'screen'} mode={'modal'}
      screenOptions={{  
        headerTintColor: colors.text,
        cardStyle: { backgroundColor: colors.background, flex: 1 },
        headerStyle: { elevation: 0, shadowColor: 'transparent', borderBottomWidth: null },
        headerBackTitleVisible: false,
        headerBackImage: ({ tintColor }) => <MaterialIcons name="chevron-left" size={24*1.5} color={tintColor} />,
        headerTransparent: true,
        headerBackground: ({ style }) => (
          <BlurView style={[style, { flex: 1 }]} intensity={100} tint={dark ? 'dark' : 'light'} />
        ),
      }}
    >
      <Stack.Screen name="Root" options={{ headerShown: false }} component={BottomTabNavigator} />
      
      <Stack.Screen 
        name="Store" 
        component={Store} 
        options={({ navigation, route } : StackScreenProps<RootStackParamList, 'Store'> ) => ({
          title: route.params.store,
        })} 
      />

      <Stack.Screen 
        name="Offers" 
        component={Offers} 
        options={({ navigation, route } : StackScreenProps<RootStackParamList, 'Offers'> ) => ({
          title: route.params.store,
        })} 
      />

      <Stack.Screen 
        name="StoreInfo" 
        component={StoreInfo}
        options={({ navigation, route } : StackScreenProps<RootStackParamList, 'StoreInfo'> ) => ({
          title: route.params.store,
        })} 
      />

      <Stack.Screen 
        name="Product" 
        component={Product}
        options={{ 
          title: 'Produto'
        }}
      />

      <Stack.Screen 
        name="Promotion" 
        component={Promotion}
        options={{ 
          title: 'Promoção',
        }}
      />

      <Stack.Screen 
        name="Category" 
        component={Category}
        options={{ 
          title: 'Categoria',
        }}
      />

      <Stack.Screen 
        name="Products" 
        component={Products}
        options={({ navigation, route } : StackScreenProps<RootStackParamList, 'Products'> ) => ({ 
          title: 'Publicações',
        })}
      />


      <Stack.Screen name="Andress" component={AndressScreen}/>
      <Stack.Screen name="Account" component={AccountScreen} />
      
      {/* <Stack.Screen 
        name="Checkout" 
        component={CheckoutStackNavigator} 
        options={{
          title: 'Checkout'
        }}
      /> */}

      <Stack.Screen 
        name="Followers" 
        component={Followers} 
        options={{
          title: 'Seguidores'
        }}
      />

      <Stack.Screen 
        name="Feedbacks" 
        component={Feedbacks} 
        options={{
          title: 'Feedbacks'
        }}
      />

      <Stack.Screen 
        name="Orders" 
        component={Orders} 
        options={{
          title: 'Pedidos'
        }}
      />

      <Stack.Screen 
        name="Order" 
        component={Order} 
        options={{
          title: 'Pedido'
        }}
      />

      <Stack.Screen 
        name="Bag" 
        component={Bag} 
        options={{
          title: 'Sacola'
        }}
      />

      <Stack.Screen 
        name="Checkout" 
        component={Checkout} 
        options={{
          title: 'Checagem'
        }}
      />

      <Stack.Screen 
        name="Saved" 
        component={Saved} 
        options={{
          title: 'Salvos'
        }}
      />

      <Stack.Screen 
        name="Favorite" 
        component={Favorite} 
        options={{
          title: 'Favoritos'
        }}
      />

      <Stack.Screen 
        name="NewFeedback" 
        component={NewFeedback} 
        options={{
          title: 'Novo Feedback'
        }}
      />

      <Stack.Screen 
        name="MakeStore" 
        component={MakeStore}
        options={{ 
          title: 'Customizar Loja',
        }}
      />

      <Stack.Screen 
        name="MakePromotion" 
        component={MakePromotion}
        options={{ 
          title: 'Customizar Promoção',
        }}
      />

      <Stack.Screen 
        name="MakeCategory" 
        component={MakeCategory}
        options={{ 
          title: 'Customizar Categoria',
        }}
      />

      <Stack.Screen 
        name="MakeProduct" 
        component={MakeProduct}
        options={{ 
          title: 'Customizar Produto',
        }}
      />

      <Stack.Screen 
        name="EditAccount" 
        component={EditAccount}
        options={{ 
          title: 'Editar Conta',
        }}
      />

      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
