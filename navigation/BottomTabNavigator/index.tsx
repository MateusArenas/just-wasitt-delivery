/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

 import { Ionicons, MaterialIcons } from '@expo/vector-icons';
 import { createBottomTabNavigator, BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
 import { createDrawerNavigator, DrawerContent, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
 import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
 import * as React from 'react';
 import { Image, Text, View } from 'react-native'
 
 import Colors from '../../constants/Colors';
 import useColorScheme from '../../hooks/useColorScheme';
 import { BottomTabParamList, RootStackParamList } from '../../types';
 import TabCartNavigator from './TabCartNavigator';
 import TabExploreNavigator from './TabExploreNavigator';
 import TabHomeNavigator from './TabHomeNavigator';
 import TabStoreMainNavigator from './TabStoreMainNavigator';
import { getPathFromState, NavigationRouteContext, useFocusEffect, useNavigationState, useRoute, useTheme } from '@react-navigation/native';
import useRootNavigation from '../../hooks/useRootNavigation';
import IconButton from '../../components/IconButton';
import AuthContext from '../../contexts/auth';
import { formatedMoney, writeAndress } from '../../utils';
import { TextInput } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import SnackBarContext from '../../contexts/snackbar';
import { useSetSnackBottomOffset } from '../../hooks/useSnackbar';
import BottomTabBar from '../Navigators/TabBarNavigator';
import useMediaQuery from '../../hooks/useMediaQuery';
import { useBag } from '../../hooks/useBag';
import useProductPrice from '../../hooks/useProductPrice';
import Badge from '../../components/Badge';
 
 const BottomTab = createBottomTabNavigator<BottomTabParamList>();
 const Drawer = createDrawerNavigator<BottomTabParamList>();

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

  const bottom = React.useContext(BottomTabBarHeightContext) || 0

  const setBottomOffset = useSetSnackBottomOffset()
  useFocusEffect(React.useCallback(() => {
    setBottomOffset(bottom)

    return function cleanup () {
      setBottomOffset(0)
    }
  }, [bottom, setBottomOffset]))

  const { isDesktop } = useMediaQuery()

  const [showerLabel, setShowerLabel] = React.useState(false)

  const { user } = React.useContext(AuthContext)

  const rootNavigation = useRootNavigation();

  function getRootRoute (state) {
    const route = state?.routes[state?.index || 0];
    return state?.routes?.length > 0 ? 
      route?.state ? getRootRoute(route?.state) 
      : route 
    : state;
  }

  const rootRoute = useNavigationState(getRootRoute)
  const store = rootRoute?.params?.store;

  const bagResponse = useBag(//select
    data => data?.find(item => (item?._id === store && item?.user === user?._id) )
  )
  
  const totalPrice = bagResponse.data?.bundles?.map(bundle => {
    return useProductPrice(bundle) * bundle?.quantity
  })?.reduce((acc, cur) => acc + cur, 0) 
  const totalQuantity = bagResponse.data?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0


  if (isDesktop) {
    return (
      <Drawer.Navigator drawerType='permanent'
        initialRouteName="TabHome"
        openByDefault
        drawerPosition="left"
        drawerStyle={[{ width: 'auto' }]}
        drawerContent={props => (
          <View style={[{ flex: 1 }, props?.style]}>
            <DrawerContentScrollView {...props} style={{}}>
              <DrawerItem to={null} 
                style={props?.itemStyle} 
                labelStyle={props?.labelStyle}
                inactiveTintColor={props?.inactiveTintColor}
                label={'Menu'}
                icon={({ color }) => <TabBarIcon name={'menu'} color={color} />}
                onPress={() => setShowerLabel(shower => !shower)}
              />
              <DrawerItemList {...props} />
            </DrawerContentScrollView>
            {!!store && <DrawerItem to={null} 
              style={props?.itemStyle} 
              labelStyle={props?.labelStyle}
              inactiveTintColor={props?.inactiveTintColor}
              label={formatedMoney(totalPrice)}
              icon={({ color }) => <TabBarIcon name='shopping-bag' color={color} badge={totalQuantity} />}
              onPress={() => navigation.navigate('Bag', { store })}
            />}
          </View>
        )}
        drawerContentOptions={{
          style: {
            backgroundColor: colors.background,
            borderRightWidth: 1, borderColor: colors.border,
          },
          contentContainerStyle: { 
            flexGrow: 1, 
          },
          labelStyle: [{ }, !showerLabel && { display: 'none' }],
          itemStyle: [!showerLabel && { width: 40 }],
          activeBackgroundColor: colors.border,
          activeTintColor: colors.primary,
          // inactiveTintColor: colors.text,
        }}
      >
        <Drawer.Screen
          name="TabHome"
          component={TabHomeNavigator}
          options={{
            title: 'Home',
            drawerIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
       <Drawer.Screen
         name="TabExplore"
         component={TabExploreNavigator}
         options={{
           title: 'Explorar',
          //  drawerLabel: () => null,
           drawerIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
         }}
       />
       <Drawer.Screen
         name="TabCart"
         component={TabCartNavigator}
         options={{
           title: 'Carrinho',
          //  drawerLabel: () => null,
           drawerIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
         }}
       />
       <Drawer.Screen
         name="TabStoreMain"
         component={TabStoreMainNavigator}
         options={{
           title: 'Perfil',
          //  drawerLabel: () => null,
           drawerIcon: ({ color }) => <TabBarIcon name="account-circle" color={color} />,
         }}
       />
      </Drawer.Navigator>
    )
  }

   return (
     <BottomTab.Navigator
       initialRouteName="TabHome"
       sceneContainerStyle={{ flex: 1 }}
       tabBarOptions={{ 
          keyboardHidesTabBar: true,
          style: { backgroundColor: 'transparent', elevation: 0, shadowColor: 'transparent', borderTopWidth: null },
          activeTintColor: colors.primary, 
          labelStyle: { marginBottom: 3 },
          adaptive: true,
        }}
        // sceneContainerStyle={{ paddingLeft: 20 }}
        tabBar={props => (
          <View style={[{ position: 'absolute', zIndex: 2, bottom: 0, left: 0, right: 0,
            // width: 'fit-content' 
           }]}>
            {/* <View style={[
              { position: 'absolute', width: '100%', height: '100%', top: 0, zIndex: 99 },
              { backgroundColor: colors.border, opacity: 1 }
            ]} /> */}
            <BlurView style={{ zIndex: 2 }} 
            intensity={100} tint={dark ? 'dark' : 'light'} >
              
              <BottomTabBar {...props} vertical={false} />
              
            </BlurView>
          </View>
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
 const TabBarIcon : React.FC<{
  name: React.ComponentProps<typeof MaterialIcons>['name']
  color: string, 
  badge?: number
 }> = ({ badge=0, ...props }) => {
   const { colors } = useTheme()
  //  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
   return (
     <View>
        {!!badge && (
          <Badge value={badge}
            backgroundColor={colors.notification}
            overflowColor={colors.background}
          />
        )}
        <MaterialIcons size={24} {...props} />
     </View>
  );
 }

 
