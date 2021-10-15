import { useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList, StoreMainStackParamList } from '../../types';

// import { Container } from './styles';

export default function Order ({ 
  navigation,
} : DrawerScreenProps<StoreMainStackParamList, 'Order'>) {
  const rootNavigation = useRootNavigation()

  return (
    <View style={{ flex: 1, backgroundColor: 'green' }} >
      <Text>Order</Text>
      <TouchableOpacity onPress={() => rootNavigation.navigate('Store', { store: 'Cagaio' })} >
        <Text >Go to store screen!</Text>
      </TouchableOpacity>
    </View>
  )
}
