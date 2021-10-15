import { useFocusEffect, useTheme } from '@react-navigation/native';
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useRef } from 'react';
import CheckoutScreen from '../screens/Checkout';
import SenderScreen from '../screens/Sender';
import { CheckoutStackParamList, RootStackParamList } from '../types';

const Stack = createStackNavigator<CheckoutStackParamList>();

export default function CheckoutStackNavigator ({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Checkout'>) {
  const { colors } = useTheme();
  const { store } = route.params
  return (
    <Stack.Navigator mode={'modal'}
      initialRouteName="Main" 
      headerMode={'screen'}
      screenOptions={{ 
        cardStyle: { flex: 1, backgroundColor: 'transparent' },
        headerTitleAlign: 'center',
        headerStyle: { borderBottomColor: colors.primary },
      }}
      > 
      <Stack.Screen 
        name="Main" 
        component={CheckoutScreen} 
        options={{ 
          title: 'Checkout',
          headerLeft: () => null, 
        }}
        initialParams={{ store }}
      />
      <Stack.Screen 
        name="Sender" 
        component={SenderScreen} 
        initialParams={{ store }}
      />
    </Stack.Navigator>
  )
}

