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
import { writeAndress } from '../../utils';
import Categories from '../../screens/Categories';
import Search from '../../screens/Search';
import Products from '../../screens/Products';
import Product from '../../screens/Product';
import Store from '../../screens/Store';
import Category from '../../screens/Category';
import { BlurView } from 'expo-blur';


const Stack = createStackNavigator<TabExploreParamList>()

function TabExploreNavigator({ 
  navigation 
} : StackScreenProps<BottomTabParamList, 'TabExplore'>) {
  const { colors, dark } = useTheme();
  const HeaderHeigth = useHeaderHeight()

  return (
    <Stack.Navigator headerMode="screen"
      screenOptions={{ 
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
      <Stack.Screen
        name="Main"
        component={ExploreScreen}
        options={{ 
          title: 'Explorar',
        }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{ title: 'Pesquisar' }}
      />
      <Stack.Screen
        name="Categories"
        component={Categories}
        options={({ route }) => ({ title: `#${route.params?.category}` })}
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
        options={{ 
          title: 'Publicações',
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

export default TabExploreNavigator