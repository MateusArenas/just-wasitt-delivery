import { getFocusedRouteNameFromRoute, useFocusEffect } from '@react-navigation/native';
import { HeaderTitle, StackHeaderTitleProps, StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import IconButton from '../../components/IconButton';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import useRootNavigation from '../../hooks/useRootNavigation';
import { SearchTitles } from '../../navigation/SearchTabNavigator';
import { RootStackParamList, TabExploreParamList } from '../../types';

// import { Container } from './styles';

export default function Search ({ 
  navigation,
  route
} : StackScreenProps<TabExploreParamList, 'Search'>) {
  const rootNavigation = useRootNavigation()

  useFocusEffect(
    React.useCallback(() => {
      navigation.dangerouslyGetParent()?.setOptions({ title: `Pesquisar ${SearchTitles[route.name as any]}` })
    }, [navigation])
  )

  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }} >
      <Text>SEARCH</Text>
      <TouchableOpacity onPress={() => rootNavigation.navigate('Store', { name: 'Cagaio' })} >
        <Text >Go to store screen!</Text>
      </TouchableOpacity>
    </View>
  )
}

