import * as React from 'react';

import { createStackNavigator } from "@react-navigation/stack"
import { TabCartParamList } from "../../types"

import CartScreen from '../../screens/Cart'
import IconButton from '../../components/IconButton';
import { useFocusEffect } from '@react-navigation/native';
import useRootNavigation from '../../hooks/useRootNavigation';

const TabCartStack = createStackNavigator<TabCartParamList>()

function TabCartNavigator() {

  const rootNavigation = useRootNavigation()

  useFocusEffect(React.useCallback(() => {
    rootNavigation.setOptions({
      headerShown: true,
    });
  }, [rootNavigation]))
  
  return (
    <TabCartStack.Navigator headerMode={'none'}>
      <TabCartStack.Screen
        name="Main"
        component={CartScreen}
        options={{ 
          title: 'Carrinho',
          headerRight: ({ tintColor }) => (
            <IconButton onPress={() => {}} name="more-vert" size={24} color={tintColor} />
          ),
        }}
      />
    </TabCartStack.Navigator>
  );
}

export default TabCartNavigator