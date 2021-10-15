import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Text } from '../../components/Themed';
import Colors from '../../constants/Colors';
import useRootNavigation from '../../hooks/useRootNavigation';
import { CheckoutStackParamList } from '../../types';

// import { Container } from './styles';

function Checkout({ 
  navigation,
  route
} : StackScreenProps<CheckoutStackParamList, 'Main'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
      <Text lightColor={Colors.light.colors.text} darkColor={Colors.dark.colors.text} >{'Checkout' + route.params.store}</Text>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('Sender')}>
        <Text lightColor={Colors.light.colors.text} darkColor={Colors.dark.colors.text} >To Sender</Text>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default Checkout;