/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

 import { Ionicons, MaterialIcons } from '@expo/vector-icons';
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 import { createStackNavigator } from '@react-navigation/stack';
 import * as React from 'react';
 
 import Colors from '../../constants/Colors';
 import useColorScheme from '../../hooks/useColorScheme';
 import { BottomTabParamList } from '../../types';
 import TabCartNavigator from './TabCartNavigator';
 import TabExploreNavigator from './TabExploreNavigator';
 import TabHomeNavigator from './TabHomeNavigator';
 import TabStoreMainNavigator from './TabStoreMainNavigator';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import useRootNavigation from '../../hooks/useRootNavigation';
import IconButton from '../../components/IconButton';
 
 const BottomTab = createBottomTabNavigator<BottomTabParamList>();
 
 export default function BottomTabNavigator() {
  const { colors } = useTheme();

  const rootNavigation = useRootNavigation()

  useFocusEffect(React.useCallback(() => {
    rootNavigation.setOptions({
      headerTintColor: colors.text,
      headerTitle: '',
      headerLeft: ({ tintColor }) => (
        <IconButton 
          name="expand-more" color={tintColor} size={24}
          onPress={() => rootNavigation.navigate('Andress')} 
          label="Estr. do Carneiro" 
        />
      ),
      headerRight: ({ tintColor }) => (
        <IconButton onPress={() => rootNavigation.navigate('Account')} name="account-circle" size={24} color={tintColor} />
      ),
    });
  }, [rootNavigation]))
 
   return (
     <BottomTab.Navigator
       initialRouteName="TabExplore"
       tabBarOptions={{ 
          activeTintColor: colors.primary, 
          labelStyle: { marginBottom: 3 },
          // showLabel: false
        }}>
        <BottomTab.Screen
          name="TabHome"
          component={TabHomeNavigator}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
       <BottomTab.Screen
         name="TabExplore"
         component={TabExploreNavigator}
         options={{
           title: 'Explorar',
           tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
         }}
       />
       <BottomTab.Screen
         name="TabCart"
         component={TabCartNavigator}
         options={{
           title: 'Carrinho',
           tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
         }}
       />
       <BottomTab.Screen
         name="TabStoreMain"
         component={TabStoreMainNavigator}
         options={{
           title: 'Minha Loja',
           tabBarIcon: ({ color }) => <TabBarIcon name="store" color={color} />,
         }}
       />
     </BottomTab.Navigator>
   );
 }
 
 // You can explore the built-in icon families and icons on the web at:
 // https://icons.expo.fyi/
 function TabBarIcon(props: { name: React.ComponentProps<typeof MaterialIcons>['name']; color: string }) {
   return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
 }3
 