/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

 import { Ionicons, MaterialIcons } from '@expo/vector-icons';
 import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
 import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
 import * as React from 'react';
 import { Image, View } from 'react-native'
 
 import Colors from '../../constants/Colors';
 import useColorScheme from '../../hooks/useColorScheme';
 import { BottomTabParamList, RootStackParamList } from '../../types';
 import TabCartNavigator from './TabCartNavigator';
 import TabExploreNavigator from './TabExploreNavigator';
 import TabHomeNavigator from './TabHomeNavigator';
 import TabStoreMainNavigator from './TabStoreMainNavigator';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import useRootNavigation from '../../hooks/useRootNavigation';
import IconButton from '../../components/IconButton';
import AuthContext from '../../contexts/auth';
import { writeAndress } from '../../utils';
import { TextInput } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
 
 const BottomTab = createBottomTabNavigator<BottomTabParamList>();
 
 export default function BottomTabNavigator({
  navigation,
  route
 }: StackScreenProps<RootStackParamList, 'Root'>) {
  const { signed, andress } = React.useContext(AuthContext)
  const { colors, dark } = useTheme();

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []))

   return (
     <BottomTab.Navigator
       initialRouteName="TabHome"
       tabBarOptions={{ 
          keyboardHidesTabBar: true,
          style: { backgroundColor: 'transparent' },
          activeTintColor: colors.primary, 
          labelStyle: { marginBottom: 3 },
          // showLabel: false
        }}
        tabBar={props => (
          <BlurView style={[{
            position: 'absolute',
            bottom: 0, left: 0, right: 0
          }]} intensity={100} tint={dark ? 'dark' : 'light'} >
            <BottomTabBar {...props}/>
          </BlurView>
        )}
        >
        <BottomTab.Screen
          name="TabHome"
          component={TabHomeNavigator}
          options={{
            title: 'Home',
            tabBarLabel: () => <></>,
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
       <BottomTab.Screen
         name="TabExplore"
         component={TabExploreNavigator}
         options={{
           title: 'Explorar',
           tabBarLabel: () => <></>,
           tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
         }}
       />
       <BottomTab.Screen
         name="TabCart"
         component={TabCartNavigator}
         options={{
           title: 'Carrinho',
           tabBarLabel: () => <></>,
           tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
         }}
       />
       <BottomTab.Screen
         name="TabStoreMain"
         component={TabStoreMainNavigator}
         options={{
           title: 'Perfil',
           tabBarLabel: () => <></>,
           tabBarIcon: ({ color }) => <TabBarIcon name="account-circle" color={color} />,
         }}
       />
     </BottomTab.Navigator>
   );
 }
 
 // You can explore the built-in icon families and icons on the web at:
 // https://icons.expo.fyi/
 function TabBarIcon(props: { name: React.ComponentProps<typeof MaterialIcons>['name']; color: string }) {
  //  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
   return <MaterialIcons size={24} {...props} />;
 }
 