import * as React from 'react';
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { BottomTabParamList, RootStackParamList, TabStoreMainParamList } from "../../types"
import { MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator, HeaderBackButton, HeaderTitle, StackScreenProps } from '@react-navigation/stack';
import { StackActions, useTheme } from '@react-navigation/native';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import IconButton from '../../components/IconButton';
import useRootNavigation from '../../hooks/useRootNavigation';
import AuthContext from '../../contexts/auth';
import { Text } from '../../components/Themed';
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

const Stack = createStackNavigator<TabStoreMainParamList>();

function TabAccountNavigator({ 
  navigation, 
  route
} : BottomTabScreenProps<BottomTabParamList, 'TabStoreMain'>) {  
  const { colors, dark } = useTheme();

  return (
    <Stack.Navigator initialRouteName="Account" 
      headerMode={'screen'} mode={'card'}
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
        name="Account"
        component={Account}
        options={({ route, navigation } : StackScreenProps<TabStoreMainParamList, 'Account'>) => ({ 
          title: 'Conta', 
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
        name="Store"
        component={Store}
        options={({ route, navigation }) => ({ 
          title: route.params?.store, 
        })}
      />
      <Stack.Screen 
        name="Product" 
        component={Product}
        options={{
          title: 'Produto',
        }}
      />
      <Stack.Screen 
        name="Products" 
        component={Products}
        options={({ navigation, route } : StackScreenProps<RootStackParamList, 'Products'> ) => ({ 
          title: 'Todos Produtos',
        })}
      />
      
      <Stack.Screen 
        name="Category" 
        component={Category}
        options={{ 
          title: 'Categoria',
        }}
      />
    </Stack.Navigator>
  )
}

export default TabAccountNavigator

