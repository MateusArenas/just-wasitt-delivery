import * as React from 'react';
import { BottomTabBarHeightContext, BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { BottomTabParamList, RootStackParamList, TabStoreMainParamList } from "../../types"
import { MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator, HeaderBackButton, HeaderTitle, StackScreenProps } from '@react-navigation/stack';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import IconButton from '../../components/IconButton';
import useRootNavigation from '../../hooks/useRootNavigation';
import AuthContext from '../../contexts/auth';
import { Text, View } from '../../components/Themed';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import Account from '../../screens/Account';
import ContainerButton from '../../components/ContainerButton';
import Store from '../../screens/Store';
import Product from '../../screens/Product';
import Category from '../../screens/Category';
import useService from '../../hooks/useService';
import { StoreDate } from '../../services/store';
import * as ManageService from '../../services/manage'
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import Products from '../../screens/Products';
import Bag from '../../screens/Bag';
import Followers from '../../screens/Followers';
import Feedbacks from '../../screens/Feedbacks';
import NewFeedback from '../../screens/NewFeedback';
import Saved from '../../screens/Saved';
import Favorite from '../../screens/Favorite';
import { FlatList } from 'react-native-gesture-handler';
import CardLink from '../../components/CardLink';
import Checkout from '../../screens/Checkout';
import { BlurView } from 'expo-blur';
import { useSetSnackBottomOffset } from '../../hooks/useSnackbar';
import Promotion from '../../screens/Promotion';
import StoreInfo from '../../screens/StoreInfo';
import Offers from '../../screens/Offers';
import Categories from '../../screens/Categories';
import { buildTitle } from '../../utils';

const Stack = createStackNavigator<TabStoreMainParamList>();

function TabAccountNavigator({ 
  navigation, 
  route
} : BottomTabScreenProps<BottomTabParamList, 'TabStoreMain'>) {  
  const { colors, dark } = useTheme();

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
      headerMode={'screen'} mode={'card'}
      screenOptions={{ 
        cardStyle: { flex: 1, backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerStyle: { elevation: 0, shadowColor: 'transparent', borderBottomWidth: null },
        headerBackTitleVisible: false,
        headerBackImage: ({ tintColor }) => <MaterialIcons name="chevron-left" size={24*1.5} color={tintColor} />,
        headerTransparent: true,
        headerBackground: ({ style }) => (
          <View style={{ flex: 1, zIndex: 2 }} >
            <BlurView style={{ flex: 1, zIndex: 2, borderColor: "rgba(0,0,0,.2)", borderTopWidth: 1 }} 
              intensity={100} tint={dark ? 'dark' : 'light'} 
            />
            <View style={[
              { position: 'absolute', width: '100%', height: '100%' },
              { backgroundColor: colors.card, opacity: .9 }
            ]} />
          </View>
        ),
      }}
    >
      <Stack.Screen name="Account" component={Account} options={{ title: 'Conta' }} />

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
  )
}

export default TabAccountNavigator

