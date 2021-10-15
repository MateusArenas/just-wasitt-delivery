import React, { memo } from 'react';
import { Text,Image, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { writeMaxTextSize, writePrice } from '../../utils';
import { useThemeColor } from '../Themed';
import useUri from '../../hooks/useUri'
import { useTheme } from '@react-navigation/native';
interface CardProps {
  onPress?: any
  name?: string
  about?: string
  price?: number
  quantity?: string
  uri?: string
  reverse?: boolean
  size?: 'large' | 'regular' | 'small'
  vertical?: boolean
  centered?: boolean 
  ballonColor?: string
  maxTextSize?: number
  style?: StyleProp<ViewStyle>
}
const Card: React.FC<CardProps> = ({
  onPress,
  name,
  about,
  price,
  quantity,
  uri: productUri,
  reverse,
  size='large',
  vertical=false,
  centered=false,
  ballonColor='red',
  maxTextSize=16,
  style,
}) => {
  const { colors } = useTheme()
  const uri = useUri({ 
    defaultSource: require('../../assets/images/default-product.jpg'),
    uri: productUri ? productUri : 'https://static.baratocoletivo.com.br/2020/1028/g_958c2f8650.jpg'
  })
  const ImagebackgroundColor = useThemeColor({ light: 'rgba(0,0,0,.2)', dark: 'rgba(255,255,255,.2)' }, 'background');

  return (
      <TouchableWithoutFeedback onPress={onPress} >
        <View style={[styles.container, { flexDirection: vertical ? !reverse ? 'column' : 'column-reverse' : !reverse ? 'row' : 'row-reverse', padding: !vertical ? 10 : 5 }, style]}>
          <View style={[quantity ? styles.quantity : {}, { backgroundColor: ballonColor }]}>
            <Text style={[textSize[size], { color: 'white' }]}>{quantity}</Text>
          </View>
          <View style={styles.container}>
            <Image resizeMode={'cover'}
              style={[{ backgroundColor: colors.background, borderRadius: 2 }, imageSize[size]]}
              source={{ uri }}
            />
          </View>

          <View style={[styles.container, { alignItems: centered? 'center' : 'flex-start', justifyContent: 'space-between', paddingLeft: 10 }]}>
            <Text numberOfLines={1} style={[textSize[size], { fontSize: 16, color: colors.text, fontWeight: '500' }]}>{writeMaxTextSize(name, maxTextSize)}</Text>
            <Text numberOfLines={1} style={[textSize[size], { fontSize: 14, color: colors.text, opacity: .5, fontWeight: '500' }]}>{writeMaxTextSize(about, maxTextSize)}</Text>
            <Text numberOfLines={1} style={[textSize[size], { fontSize: 14, color: colors.text, fontWeight: '500', opacity: .8 }]}>{writePrice(price)}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
  },
  quantity: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
})

export default memo(Card)


const imageSize = {
  large: {
    width: 140,
    height: 86,
  }, 
  regular: {
    width: 140/1.5,
    height: 86/1.5,
  },
  small: {
    width: 130/3,
    height: 86/3,
  },
}

const textSize = {
  large: {
    fontSize: 14
  }, 
  regular: {
    fontSize: 14
  },
  small: {
    fontSize: 10
  },
}