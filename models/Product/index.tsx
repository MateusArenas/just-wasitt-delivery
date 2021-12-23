import { NavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import IconButton from '../../components/IconButton';
import useUri from '../../hooks/useUri';
import { ProductData } from '../../services/product';
import { RootStackParamList } from '../../types';
import { MaskService } from 'react-native-masked-text';
import * as FavoriteService from '../../services/favorite'
import AuthContext from '../../contexts/auth';
import { BlurView } from 'expo-blur';
import { useProductValue } from '../../hooks/useProductPrice';
import { useFavorite } from '../../hooks/useFavorite';
import { Hoverable, Pressable, } from 'react-native-web-hover'

interface ProductProps {
  store: string
  data: ProductData
  height?: string | number
  horizontal?: boolean
  reverse?: boolean
  onPress?: () => any
  style?: StyleProp<ViewStyle>
}

const Product: React.FC<ProductProps> = ({ data, height=250, horizontal, reverse, onPress, store, style }) => {
  const { colors, dark } = useTheme()
  const { user } = useContext(AuthContext)
  const uri = useUri({ 
    defaultSource: require('../../assets/images/default-product.jpg'),
    uri: data?.uri ? data?.uri : 'https://static.baratocoletivo.com.br/2020/1028/g_958c2f8650.jpg'
  })

  const { 
    data: favorite, 
    onChangeFavorite
  } = useFavorite(favorites => favorites?.find(item => item?._id === data?._id))

  return (
    <Pressable style={({ hovered }) => [{ 
        flexDirection: horizontal ? reverse ? 'row' : 'row-reverse' : reverse ? 'column-reverse' : 'column' ,
      }, horizontal ? { padding: 10 } : {}, style, 
      hovered && { backgroundColor: colors.border }
      ]}>
        <View style={[{ flex: 1, }, horizontal && { marginRight: 10 }]}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 1 }}>
            <IconButton style={{ shadowColor: colors.border, elevation: 1 }}
              name={favorite ? "favorite" : "favorite-outline"}
              size={24}
              color={colors.text}
              onPress={() => onChangeFavorite({ store, product: data?._id, _id: data?._id})}
            />
          </View>
          <TouchableOpacity onPress={onPress}>
            <Image style={{ height, borderRadius: 2, width: '100%', backgroundColor: colors.background }} source={{ uri }} />
          </TouchableOpacity>
        </View>

        <View style={[ horizontal ? { flex: 1 } : {},{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          
            <View style={{ flex: 1, padding: 10 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity onPress={onPress}>
                    <Text style={[styles.title, { color: colors.text, fontSize: horizontal ? 18 : 16 }]} numberOfLines={horizontal ? 2 : 1}>{data?.name}</Text>
                  </TouchableOpacity>
                  {/* {!horizontal && <IconButton style={{ padding: 0 }}
                    name={favorite ? "favorite" : "favorite-outline"}
                    size={24}
                    color={colors.text}
                    onPress={() => onChangeFavorite({ store, product: data?._id, _id: data?._id})}
                  />} */}
                </View>
                <Text style={[styles.describe, { color: colors.text, flex: 1, alignItems: 'center' }]} numberOfLines={horizontal ? 1 : 99}>{data?.about ? data?.about : ' '}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  {data?.promotions?.length > 0 && <Text style={[styles.subTitle, { fontSize: horizontal ? 18 : 16, color: colors.text, marginRight: 10 }]} numberOfLines={1}>{
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
                    styles.subTitle, { color: colors.text, fontSize: horizontal ? 18 : 16 }, 
                    data?.promotions?.length > 0 ? { fontSize: horizontal ? 16 : 14, textDecorationLine: 'line-through', opacity: .5 } : {}
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
      </Pressable>
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