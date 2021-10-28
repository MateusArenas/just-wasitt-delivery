import { NavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import IconButton from '../../components/IconButton';
import useUri from '../../hooks/useUri';
import { ProductData } from '../../services/product';
import { RootStackParamList } from '../../types';
import { MaskService } from 'react-native-masked-text';
import * as FavoriteService from '../../services/favorite'
import AuthContext from '../../contexts/auth';
import { BlurView } from 'expo-blur';
import { useProductValue } from '../../hooks/useProductPrice';

interface ProductProps {
  store: string
  data: ProductData
  height?: string | number
  horizontal?: boolean
  reverse?: boolean
  onPress?: () => any
}

const Product: React.FC<ProductProps> = ({ data, height=250, horizontal, reverse, onPress, store }) => {
  const { colors, dark } = useTheme()
  const { user } = useContext(AuthContext)
  const uri = useUri({ 
    defaultSource: require('../../assets/images/default-product.jpg'),
    uri: data?.uri ? data?.uri : 'https://static.baratocoletivo.com.br/2020/1028/g_958c2f8650.jpg'
  })

  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const response = await FavoriteService.find({ _id: data?._id, userId: user?._id, store })
        console.log('vers', response);
        setFavorite(!!response)
      } catch (err) {

      }
    })()
  } ,[user, data, setFavorite])

  const onSave = async () => {
    try {
      const response = await FavoriteService.save({ params: { store, product: data._id, _id: data?._id }, userId: user?._id })
      setFavorite(!!response)
    } catch (err) { }
  }

  const onRemove = async () => {
    if (!data?._id) return
    try {
      await FavoriteService.remove({ store, _id: data?._id, userId: user?._id })
      setFavorite(false)
    } catch (err) { }
  }

  return (
    <View style={{ 
      flexDirection: horizontal ? reverse ? 'row' : 'row-reverse' : reverse ? 'column-reverse' : 'column' 
    }}>
      <View style={{ flex: 1, padding: horizontal ? 10 : 0 }}>
        <TouchableWithoutFeedback onPress={onPress}>
          <Image style={{ height, borderRadius: 2, width: '100%', backgroundColor: colors.background }} source={{ uri }} />
        </TouchableWithoutFeedback>
      </View>

      <View style={[ horizontal ? { flex: 1 } : {},{ backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, padding: 10 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableWithoutFeedback onPress={onPress}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={horizontal ? 2 : 1}>{data?.name}</Text>
                </TouchableWithoutFeedback>
                <IconButton style={{ padding: 0 }}
                  name={favorite ? "favorite" : "favorite-outline"}
                  size={24}
                  color={colors.text}
                  onPress={favorite ? onRemove : onSave}
                />
              </View>
              <Text style={[styles.describe, { color: colors.text, flex: 1 }]} numberOfLines={horizontal ? 1 : 99}>{data?.about ? data?.about : ' '}</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
                {data?.promotions?.length > 0 && <Text style={[styles.subTitle, { fontSize: 16, color: colors.text, marginRight: 10 }]} numberOfLines={1}>{
                  MaskService.toMask('money', 
                  useProductValue(data) as unknown as string, 
                  {
                    precision: 2,
                    separator: ',',
                    delimiter: '.',
                    unit: 'R$ ',
                    suffixUnit: ''
                  })  
                }</Text>}
                {!!data?.price && <Text style={[
                  styles.subTitle, { color: colors.text, fontSize: 16 }, 
                  data?.promotions?.length > 0 ? { fontSize: 14, textDecorationLine: 'line-through' } : {}
                ]} numberOfLines={1}>{
                  MaskService.toMask('money', data?.price as unknown as string, {
                    precision: 2,
                    separator: ',',
                    delimiter: '.',
                    unit: 'R$ ',
                    suffixUnit: ''
                  })  
                }</Text>}
              </View>
          </View>

      </View>
    </View>
  )
}

export default Product;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 10,
  },
  describe: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
    paddingVertical: 10,
    paddingTop: 0,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    // paddingHorizontal: 10,
    // paddingBottom: 10,
  }
})