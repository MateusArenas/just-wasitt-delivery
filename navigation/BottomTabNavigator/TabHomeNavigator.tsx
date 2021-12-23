import * as React from 'react';

import { createStackNavigator, HeaderTitle, StackScreenProps } from "@react-navigation/stack"
import { BottomTabParamList, RootStackParamList, TabHomeParamList } from "../../types"

import HomeScreen from '../../screens/Home'
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AuthContext from '../../contexts/auth';
import { TouchableWithoutFeedback, Image, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSetSnackBottomOffset } from '../../hooks/useSnackbar';
import Store from '../../screens/Store';
import Product from '../../screens/Product';
import Feedbacks from '../../screens/Feedbacks';
import NewFeedback from '../../screens/NewFeedback';
import Bag from '../../screens/Bag';
import Checkout from '../../screens/Checkout';
import Favorite from '../../screens/Favorite';
import Saved from '../../screens/Saved';
import Followers from '../../screens/Followers';
import Products from '../../screens/Products';
import Offers from '../../screens/Offers';
import Category from '../../screens/Category';
import StoreInfo from '../../screens/StoreInfo';
import Promotion from '../../screens/Promotion';
import Categories from '../../screens/Categories';
import { buildTitle } from '../../utils';

const Stack = createStackNavigator<TabHomeParamList>()

function TabHomeNavigator({ 
  navigation,
  route
} : StackScreenProps<BottomTabParamList, 'TabHome'>) {

  const bottom = React.useContext(BottomTabBarHeightContext) || 0

  const setBottomOffset = useSetSnackBottomOffset()
  useFocusEffect(React.useCallback(() => {
    setBottomOffset(bottom)

    // return function cleanup () {
    //   setBottomOffset(0)
    // }
  }, [bottom, setBottomOffset]))

  const InputRef = React.useRef<TextInput>()
  const [category, setCategory] = React.useState(
    route.params?.category === 'main' || !route.params?.category ? 
    'main' : route.params?.category
  )
  const { andress } = React.useContext(AuthContext)
  const { colors, dark } = useTheme();

  return (
    <Stack.Navigator headerMode="screen"
      initialRouteName="Main"
      screenOptions={{ 
        cardStyle: { flex: 1, backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerStyle: { elevation: 0, shadowColor: 'transparent', borderBottomWidth: .2, borderColor: colors.border },
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
        component={HomeScreen}
        initialParams={{ category: route.params?.category }}
        options={{ 
          title: 'Wassit',
        }}
      />

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

export default TabHomeNavigator