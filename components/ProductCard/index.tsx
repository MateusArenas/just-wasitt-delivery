import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleProp, ViewStyle } from 'react-native';
import { MaskService } from 'react-native-masked-text';
import useUri from '../../hooks/useUri';
import InputCount from '../InputCount';

interface ProductCardProps {
    minimize?: boolean
    uri?: string
    name?: string
    about?: string
    price?: number
    subPrice?: number
    onPress?: () => any
    onContentPress?: () => any
    onImagePress?: () => any
    count: number
    onChangeCount?: (count: number) => any
    maxCount?: number
    minCount?: number
    disabled?: boolean
    style?: StyleProp<ViewStyle>
  }
  const ProductCard: React.FC<ProductCardProps> = ({
    minimize=false,
    uri: currentUri,
    name,
    about,
    price=0,
    subPrice=0,
    onPress,
    onContentPress,
    onImagePress,
    count=0,
    onChangeCount,
    maxCount=99,
    minCount=0,
    disabled=false,
    style,
  }) => {
    const { colors } = useTheme()
    
    const uri = useUri({ 
      defaultSource: require('../../assets/images/default-product.jpg'),
      uri: currentUri || 'https://static.baratocoletivo.com.br/2020/1028/g_958c2f8650.jpg'
    })
    
    return (
        <View style={[{ 
          // padding: 10,
          flex: 1,
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: minimize ? colors.background : 'transparent',
        }, style]}>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {!minimize ? 
                    <TouchableOpacity disabled={disabled} onPress={onImagePress}>
                        <Image source={{ uri }} style={{ 
                            margin: 10, marginLeft: 0,
                            height: 75, width: 75, 
                            backgroundColor: colors.border, borderRadius: 4,
                            // borderWidth: 1, borderColor: colors.border
                        }}/> 
                    </TouchableOpacity>
                    :
                <></>
                    // <MaterialIcons name={'subdirectory-arrow-right'} size={24} color={colors.text} />
                }

                    <View style={{ flex: 1, alignItems: 'stretch', padding: 10 }}>
                        <TouchableOpacity disabled={disabled} onPress={onContentPress}>
                          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{name}</Text>
                        </TouchableOpacity>
                        {!!about && <Text numberOfLines={minimize ? 10 : 1} style={{ color: colors.text, fontSize: 14,  opacity: .8 }}>{about}</Text>}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        {(!!subPrice && price !== subPrice) && 
                        <Text numberOfLines={1} style={{ marginRight: 5, color: colors.text, fontSize: 16, fontWeight: 'bold', opacity: .8 }}>{
                            MaskService.toMask('money', price as unknown as string, {
                                precision: 2,
                                separator: ',',
                                delimiter: '.',
                                unit: 'R$ ',
                                suffixUnit: ''
                            })
                        }</Text>}
    
                        <Text numberOfLines={1} style={{ 
                            textDecorationLine: (!!subPrice && price !== subPrice) ? 'line-through' : 'none', 
                            fontSize: 14, 
                            color: colors.text, fontWeight: 'bold', opacity: .8 
                        }}>{
                            MaskService.toMask('money', subPrice as unknown as string, {
                                precision: 2,
                                separator: ',',
                                delimiter: '.',
                                unit: 'R$ ',
                                suffixUnit: ''
                            })
                        }</Text>
                        </View>
                    </View>

                </View>


              {!disabled && <View>
                <InputCount minValue={minCount} maxValue={maxCount}
                  value={count}
                  disabled={disabled}
                  onChangeValue={onChangeCount}
                  tintColor={colors.text}
                />
              </View>}
        </View>
    )
  }

  export default React.memo(ProductCard)