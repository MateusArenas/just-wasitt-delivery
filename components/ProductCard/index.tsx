import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { MaskService } from 'react-native-masked-text';
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
  }
  const ProductCard: React.FC<ProductCardProps> = ({
    minimize=false,
    uri,
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
  }) => {
    const { colors } = useTheme()
    
    
    return (
        <View style={{ 
          // padding: 10,
          flex: 1,
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: minimize ? colors.card : 'transparent',
        }}>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {!minimize ? 
                    <TouchableOpacity disabled={disabled} onPress={onImagePress}>
                        <Image source={{ uri }} style={{ 
                            margin: 10,
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
                          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>{name}</Text>
                        </TouchableOpacity>
                        {!!about && <Text numberOfLines={minimize ? 10 : 1} style={{ color: colors.text, fontSize: 14,  opacity: .8 }}>{about}</Text>}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        {(!!subPrice && price !== subPrice) && 
                        <Text numberOfLines={1} style={{ marginRight: 5, color: colors.text, fontSize: 16, fontWeight: '500', opacity: .8 }}>{
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
                            color: colors.text, fontWeight: '500', opacity: .8 
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


              <View>
                <InputCount minValue={minCount} maxValue={maxCount}
                  value={count}
                  disabled={disabled}
                  onChangeValue={onChangeCount}
                  tintColor={colors.text}
                />
              </View>
        </View>
    )
  }

  export default React.memo(ProductCard)