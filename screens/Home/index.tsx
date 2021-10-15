import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList, TabHomeParamList } from '../../types';

// import { Container } from './styles';

export default function Home ({ 
  navigation,
} : StackScreenProps<TabHomeParamList, 'Main'>) {
  const rootNavigation = useRootNavigation()

  return (
    <View style={{ flex: 1, backgroundColor: 'green' }} >
      <Text>Home</Text>
      <TouchableOpacity onPress={() => rootNavigation.navigate('Store', { store: 'Cagaio' })} >
        <Text >Go to store screen!</Text>
      </TouchableOpacity>
    </View>
  )
}
