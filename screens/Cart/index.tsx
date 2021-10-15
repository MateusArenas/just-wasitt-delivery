import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { View, Text } from '../../components/Themed';
import Colors from '../../constants/Colors';
import useRootNavigation from '../../hooks/useRootNavigation';

// import { Container } from './styles';

const Cart: React.FC = () => {
  const rootNavigation = useRootNavigation()

  return (
    <View style={{ flex: 1, backgroundColor: 'red' }} >
      <Text>CART</Text>      
      <TouchableWithoutFeedback onPress={() => rootNavigation.navigate('Checkout', { store: 'Cagaio' })}>
        <Text lightColor={Colors.light.colors.text} darkColor={Colors.dark.colors.text} >To Sender</Text>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default Cart;