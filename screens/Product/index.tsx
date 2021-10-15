import { CommonActions } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Themed';
import Colors from '../../constants/Colors';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList } from '../../types';

// import { Container } from './styles';
const textProps = {
  lightColor: Colors.light.colors.text,
  darkColor:  Colors.dark.colors.text
}
function Product({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Product'>) {
  const rootNavigation = useRootNavigation()
  const { store, category, name } = route.params
  const [data, setData] = useState(null)

  useEffect(() => {
    try {

    } catch (err) {
      rootNavigation.navigate('NotFound')
    }
  } , [setData])

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
          // disabled={!CommonActions.canGoBack()}
          onPress={() => {}}
        >
          <Text {...textProps} >{JSON.stringify(route.params)}</Text>
        </TouchableOpacity>
    </View>
  )
}

export default Product