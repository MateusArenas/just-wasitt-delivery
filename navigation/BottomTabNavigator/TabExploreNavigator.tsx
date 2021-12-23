import * as React from 'react';

import { createStackNavigator, HeaderTitle, StackScreenProps, useHeaderHeight } from "@react-navigation/stack"
import { BottomTabParamList, TabExploreParamList } from "../../types"

import ExploreScreen from '../../screens/Explore'
import { Button, TouchableWithoutFeedback } from 'react-native';
import IconButton from '../../components/IconButton';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import useRootNavigation from '../../hooks/useRootNavigation';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from '../../components/Themed';
import AuthContext from '../../contexts/auth';
import { buildTitle, writeAndress } from '../../utils';
import Categories from '../../screens/Categories';
import Search from '../../screens/Search';
import Products from '../../screens/Products';
import Product from '../../screens/Product';
import Store from '../../screens/Store';
import Category from '../../screens/Category';
import { BlurView } from 'expo-blur';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSetSnackBottomOffset } from '../../hooks/useSnackbar';
import StoreInfo from '../../screens/StoreInfo';
import Promotion from '../../screens/Promotion';
import Offers from '../../screens/Offers';
import Followers from '../../screens/Followers';
import Feedbacks from '../../screens/Feedbacks';
import NewFeedback from '../../screens/NewFeedback';
import Bag from '../../screens/Bag';
import Checkout from '../../screens/Checkout';
import Saved from '../../screens/Saved';
import Favorite from '../../screens/Favorite';

const Stack = createStackNavigator<TabExploreParamList>()

function TabExploreNavigator({ 
  navigation 
} : StackScreenProps<BottomTabParamList, 'TabExplore'>) {
  const { colors, dark } = useTheme();
  const HeaderHeigth = useHeaderHeight()

  const bottom = React.useContext(BottomTabBarHeightContext) || 0

  const setBottomOffset = useSetSnackBottomOffset()
  useFocusEffect(React.useCallback(() => {
    setBottomOffset(bottom)
    
    // return function cleanup () {
    //   setBottomOffset(0)
    // }
  }, [bottom,setBottomOffset]))

  return (
    <Stack.Navigator headerMode="screen"
      screenOptions={{ 
        cardStyle: { flex: 1, backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerStyle: { elevation: 0, borderColor: colors.border, borderBottomWidth: .2 },
        headerBackTitleVisible: false,
        headerBackImage: ({ tintColor }) => <MaterialIcons name="chevron-left" size={24*1.5} color={tintColor} />,
        headerTransparent: true,
        headerBackground: ({ style }) => (
          <BlurView style={[style, { flex: 1 }]} intensity={100} tint={dark ? 'dark' : 'light'} />
        ),
      }}
    >
      <Stack.Screen name="Main" component={ExploreScreen} options={{ title: 'Explorar' }} />
      <Stack.Screen name="Search" component={Search} options={{ title: 'Pesquisar' }} />

      <Stack.Screen name="Categories" component={Categories} options={({ route }) => ({ title: `#${route.params?.category}` })} />

      <Stack.Screen name="Store" component={Store} options={({ route }) => ({  title: buildTitle(route.params?.store) })} />
      <Stack.Screen name="StoreInfo" component={StoreInfo} options={({ route }) => ({ title: buildTitle(route.params?.store) })} />
      <Stack.Screen name="Product" component={Product} options={({ route }) => ({ title: buildTitle(route.params?.slug) })} />
      <Stack.Screen name="Products" component={Products} options={({ route }) => ({ title: buildTitle('Catálogo') })} />
      <Stack.Screen name="Category" component={Category} options={({ route }) => ({ title: buildTitle(route.params?.slug) })} />
      <Stack.Screen name="Promotion" component={Promotion} options={({ route }) => ({ title: buildTitle(route.params?.slug) })} />
      <Stack.Screen name="Offers" component={Offers} options={({ route }) => ({ title: buildTitle(route.params?.store) })} />
      <Stack.Screen name="Followers" component={Followers} options={{ title: buildTitle('Seguidores') }} />
      <Stack.Screen name="Feedbacks" component={Feedbacks} options={{ title: buildTitle('Feedbacks') }} />
      <Stack.Screen name="NewFeedback" component={NewFeedback} options={{ title: buildTitle('Novo Feedback') }} />
      <Stack.Screen name="Bag" component={Bag} options={{ title: buildTitle('Sacola') }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ title: buildTitle('Checagem') }} />
      <Stack.Screen name="Saved" component={Saved} options={{ title: buildTitle('Salvos') }} />
      <Stack.Screen name="Favorite" component={Favorite} options={{ title: buildTitle('Favoritos') }} />

    </Stack.Navigator>
  );
}

export default TabExploreNavigator