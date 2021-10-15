import * as React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { BottomTabParamList, TabStoreMainParamList } from "../../types"
import { MaterialIcons } from '@expo/vector-icons';
import OrderScreen from '../../screens/Order';
import StoreMain from '../../screens/StoreMain';
import { HeaderBackButton, HeaderTitle, useHeaderHeight } from '@react-navigation/stack';
import { DrawerContent, DrawerItem } from '@react-navigation/drawer';
import { DrawerActions, StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { SafeAreaView, TouchableWithoutFeedback, View } from 'react-native';
import IconButton from '../../components/IconButton';
import useRootNavigation from '../../hooks/useRootNavigation';

const Drawer = createDrawerNavigator<TabStoreMainParamList>();

function TabAccountNavigator({ 
  navigation, 
  route
} : BottomTabScreenProps<BottomTabParamList, 'TabStoreMain'>) {
  const rootNavigation = useRootNavigation()
  const headerHeigth = useHeaderHeight()
  const { colors } = useTheme();


  useFocusEffect(React.useCallback(() => {
    rootNavigation.setOptions({
      headerShown: false,
    });
  }, [rootNavigation]))

  return (
    <Drawer.Navigator
      initialRouteName="Main" 
      drawerPosition="right"
      drawerType="slide"
      drawerStyle={{ width: '50%', borderColor: colors.border, borderLeftWidth: 1 }}
      overlayColor={'transparent'}
      screenOptions={{ 
        headerShown: true, 
        headerLeft: props => <HeaderBackButton {...props} onPress={() => navigation.dispatch(StackActions.replace('Root'))}/>,
        headerRight: ({ tintColor }) => 
        <IconButton onPress={() => navigation.dispatch(DrawerActions.toggleDrawer)} name="menu" size={24} color={tintColor} />
      }}
      drawerContent={props => (
        <>
        <View style={{ 
          width: '100%', 
          height: 64, 
          borderBottomWidth: 1,
          borderColor: colors.border, 
          alignItems: 'flex-start', 
          justifyContent: 'center',
          padding: 20
        }}>
          <TouchableWithoutFeedback onPress={() => navigation.dispatch(DrawerActions.jumpTo('Main'))}>
            <HeaderTitle children={'ArenasFood'} />
          </TouchableWithoutFeedback>
        </View>
        <DrawerContent {...props}/>
        </>
      )}
      drawerContentOptions={{

      }}
    >
      <Drawer.Screen
        name="Main"
        component={StoreMain}
        initialParams={{ store: 'ArenasFood' }}
        options={{ 
          title: 'loja', 
          drawerIcon: props => <MaterialIcons {...props} name="store" />,

          headerTitle: null,
          headerTintColor: colors.text,
          headerStyle: { borderBottomColor: colors.border },

          headerLeft: ({ tintColor }) => (
            <IconButton 
              name="expand-more" color={tintColor} size={24}
              onPress={() => rootNavigation.navigate('Andress')} 
              label="ArenasFood" 
            />
          ),
          headerRight: ({ tintColor }: any) => (
            <SafeAreaView style={{ display: 'flex', flexDirection: 'row', }}>
            <IconButton onPress={() => rootNavigation.navigate('StoreOptions', { store: 'ArenasFood' })} name="add" size={24} color={tintColor} />
            <IconButton onPress={() => navigation.dispatch(DrawerActions.toggleDrawer)} name="menu" size={24} color={tintColor} />
            </SafeAreaView>
          ),
        }}
      />
      <Drawer.Screen 
        name="Order" 
        component={OrderScreen} 
        options={{ 
          title: 'Pedidos', 
          drawerIcon: props => <MaterialIcons {...props} name="assessment" />,
        }}
      />
    </Drawer.Navigator>
  );
}

export default TabAccountNavigator

