import * as React from 'react';

import { createStackNavigator, StackScreenProps } from "@react-navigation/stack"
import { TabCartParamList } from "../../types"

import CartScreen from '../../screens/Cart'
import IconButton from '../../components/IconButton';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import useRootNavigation from '../../hooks/useRootNavigation';
import Bag from '../../screens/Bag';
import Store from '../../screens/Store';
import Product from '../../screens/Product';
import Category from '../../screens/Category';
import Followers from '../../screens/Followers';
import Feedbacks from '../../screens/Feedbacks';
import NewFeedback from '../../screens/NewFeedback';
import Saved from '../../screens/Saved';
import Favorite from '../../screens/Favorite';
import Checkout from '../../screens/Checkout';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSetSnackBottomOffset } from '../../hooks/useSnackbar';


const Stack = createStackNavigator<TabCartParamList>()

function TabCartNavigator() {
  const { colors, dark } = useTheme()
  const bottom = React.useContext(BottomTabBarHeightContext) || 0

  const setBottomOffset = useSetSnackBottomOffset()
  useFocusEffect(React.useCallback(() => {
    setBottomOffset(bottom)

    // return function cleanup () {
    //   setBottomOffset(0)
    // }
  }, [bottom, setBottomOffset]))

  return (
    <Stack.Navigator 
      headerMode={'screen'}
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
      <Stack.Screen
        name="Main"
        component={CartScreen}
        options={{ 
          title: 'Pedidos',
        }}
      />
      <Stack.Screen
        name="Bag"
        component={Bag}
        options={({ route }) => ({ 
          title: 'Sacola',
        })}
      />

      <Stack.Screen 
        name="Checkout" 
        component={Checkout} 
        options={{
          title: 'Checagem'
        }}
      />
      
      <Stack.Screen 
        name="Store" 
        component={Store} 
        options={({ navigation, route } : StackScreenProps<TabCartParamList, 'Store'> ) => ({
          title: route.params.store,
        })} 
      />

      <Stack.Screen 
        name="Favorite" 
        component={Favorite} 
        options={{
          title: 'Favoritos'
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
        name="NewFeedback" 
        component={NewFeedback} 
        options={{
          title: 'Novo Feedback'
        }}
      />
      <Stack.Screen 
        name="Product" 
        component={Product}
        options={{ 
          title: 'Produto'
        }}
      />
      <Stack.Screen 
        name="Category" 
        component={Category}
        options={{ 
          title: 'Categoria',
        }}
      />
    </Stack.Navigator>
  );
}

export default TabCartNavigator