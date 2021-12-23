import React, {  useContext, useEffect, useState, useReducer } from 'react';
import ProductModel from '../../models/Product';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FlatList, Image, View, Text, ScrollView, StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, StyleProp, ViewStyle, Insets, ScrollViewProps, LayoutChangeEvent } from 'react-native';
import { useFocusEffect, useIsFocused, useRoute, useTheme } from '@react-navigation/native';
import InputTextArea from '../../components/InputTextArea';
import { MaterialIcons } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import { formatedMoney } from '../../utils';
import { ProductData } from '../../services/product';
import useProductPrice, { useProductAdditionals, useProductValue } from '../../hooks/useProductPrice';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import { BlurView } from 'expo-blur';
import InputCount from '../../components/InputCount';
import TextButton from '../../components/TextButton';
import CardLink from '../../components/CardLink';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import useUri from '../../hooks/useUri';
import { useFavorite } from '../../hooks/useFavorite';
import useMediaQuery from '../../hooks/useMediaQuery';
import { MaskService } from 'react-native-masked-text';
import IconButton from '../../components/IconButton';
import { useHeaderHeight } from '@react-navigation/stack';
import { Hoverable, Pressable, } from 'react-native-web-hover'

interface ProductTemplateProps extends ScrollViewProps {
    // ref?: React.MutableRefObject<ScrollView>
    store: string
    data: ProductData
    bundle: any
    state: any
    up: boolean
    onRemove: (id?: string) => any
    onUpdate: (item: { quantity: number, comment: string }) => any
    onSave: (item: { quantity: number, comment: string }) => any
    onChangeComment: (comment: string) => any
    onChangeQuantity: (quantity: number) => any
    onChangeAddQuantity: (id: string, item: any) => any
    handleCategory: (item: any) => any
    handlePromotion: (item: any) => any
    handleProduct: (item: any) => any
    handleStore: (item: any) => any
    onLayoutControll?: (event: LayoutChangeEvent) => void
    extraBottom?: number
}

const ProductTemplate = React.forwardRef<ScrollView, ProductTemplateProps>(({
    store, data, state, bundle,
    onChangeComment=()=>{},
    onChangeQuantity=()=>{},
    onChangeAddQuantity=()=>{},
    handleCategory=()=>{}, 
    handleProduct=()=>{}, 
    handlePromotion=()=>{}, 
    handleStore=()=>{},
    up, onSave, onUpdate, onRemove,
    onLayoutControll,
    extraBottom,
    ...props
}, forwardRef) => {
  const ref = React.useRef<ScrollView>(null);
  const { colors, dark } = useTheme()
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const additionals = useProductAdditionals(bundle)
  const value = useProductValue(bundle?.product)
  const total = useProductPrice(bundle) * bundle?.quantity

  React.useImperativeHandle(forwardRef, () => ref?.current, [ref]);

  const uri = useUri({ 
    defaultSource: require('../../assets/images/default-product.jpg'),
    uri: data?.uri ? data?.uri : 'https://static.baratocoletivo.com.br/2020/1028/g_958c2f8650.jpg'
  })

  const { isDesktop } = useMediaQuery()

  const { 
    data: favorite, 
    onChangeFavorite
  } = useFavorite(favorites => favorites?.find(item => item?._id === data?._id))

  
  const ProductInfoContainner: React.FC<{ style?: StyleProp<ViewStyle> }> = React.useCallback((props) => {
    if (isDesktop) return (
        <ScrollView {...props} nestedScrollEnabled
            contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
            focusable
            keyboardDismissMode={'none'}
            keyboardShouldPersistTaps={'handled'}
        />
    )
    return <View {...props}/>;
  }, [isDesktop])
  

  return (
        <View style={{ flex: 1 }}>
            <ScrollView ref={ref} {...props}  
                horizontal={isDesktop} style={[props?.style, isDesktop && { padding: 10 }]}
                contentContainerStyle={[
                    props?.contentContainerStyle, 
                    isDesktop && { padding: 20, paddingBottom: top+bottom+extraBottom, justifyContent: 'center' }
                ]}
            >

                {/* <ProductModel data={data} store={store} onPress={Keyboard.dismiss} /> */}

                <View style={[{ flex: 1 }, isDesktop && { padding: 10, position: 'relative' }]}>
                    <View style={[{ flex: 1, height: isDesktop ? 350 : 250 }]}>
                        <View style={[{ position: 'absolute', bottom: 0, left: 0, zIndex: 1}, isDesktop && { padding: 10 }]}>
                            <IconButton style={{ shadowColor: colors.border, elevation: 1 }}
                                name={favorite ? "favorite" : "favorite-outline"}
                                size={24}
                                color={colors.text}
                                onPress={() => onChangeFavorite({ store, product: data?._id, _id: data?._id})}
                            />
                        </View>
                        <Image source={{ uri }} 
                            style={{ height: '100%', borderRadius: 2, width: '100%', backgroundColor: colors.background }} 
                        />
                    </View>
                        {isDesktop && <ProductControll 
                            style={{ position: 'relative', paddingHorizontal: 0 }}
                            styleInner={{ backgroundColor: colors.border }}
                            comment={state?.commet}
                            quantity={state?.quantity}
                            exist={!!state?._id}
                            offset={data?.offset}
                            single={data?.single}
                            onChangeQuantity={onChangeQuantity}
                            onRemove={onRemove}
                            onSave={onSave}
                            onUpdate={onUpdate}
                            value={value}
                            additionals={additionals}
                            total={total}
                            up={up}
                        />}
                    
                </View>

                <View style={[{ flex: 1, padding: 10 }]}>

                <Text style={[styles.title, { color: colors.text, paddingBottom: 10 }]} numberOfLines={2}>{data?.name}</Text>

                <Text style={[styles.describe, { color: colors.text, paddingBottom: 0 }]} numberOfLines={2}>{data?.about ? data?.about : ' '}</Text>

              <View style={{ flexDirection: 'row' }}>
                    {[].concat(
                    data?.categories?.map(item => ({ 
                        _id: item?._id, name: `#${item?.name}`,
                        onPress: () => handleCategory({ store, slug: item?.slug })
                    }))).concat( 
                    data?.promotions?.map(item => ({ 
                        _id: item?._id, name: `%${item?.name}`,
                        onPress: () => handlePromotion({ store, slug: item?.slug })
                    }))
                    )?.map(item => (
                    <Hoverable>{({ hovered }) => (
                        <TouchableOpacity key={item?._id} onPress={item?.onPress}>
                            <Text style={[
                                { fontSize: 14, fontWeight: '500', color: colors.text }, 
                                { paddingVertical: 0, paddingRight: 10 },
                                hovered && { textDecorationLine: 'underline' }
                            ]}>
                            {item?.name}
                            </Text>
                        </TouchableOpacity>
                    )}</Hoverable>
                    ))}
                </View>

                {data?.store?.delivery &&
                <Text style={[styles.describe, { color: colors.text, paddingBottom: 0 }]}>{
                    `Entrega: ${formatedMoney(data?.store?.deliveryPrice)} há ` +
                    `${data?.store?.deliveryTimeMin || '00:00'}-${data?.store?.deliveryTimeMax || '00:00'} min`
                }</Text>}              
              
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                {data?.promotions?.length > 0 && <Text style={[styles.subTitle, { color: colors.text, marginRight: 10 }]} numberOfLines={1}>{
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
                    styles.subTitle, { color: colors.text}, 
                  data?.promotions?.length > 0 ? { textDecorationLine: 'line-through', opacity: .5 } : {}
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

          
            {/* <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, opacity: .5 }}>Entrega</Text>
                {data?.store?.delivery && 
                    <View style={{  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <MaterialIcons style={{ paddingVertical: 10 }} 
                        name={"delivery-dining"}
                        size={24}
                        color={colors.text}
                        />
                    <Text style={{ alignSelf: 'center', flex: 1, padding: 10, fontWeight: '500', fontSize: 16, color: colors.text }}>{
                        (data?.store?.deliveryTimeMin && data?.store?.deliveryTimeMax) ?
                        `${data?.store?.deliveryTimeMin}-${data?.store?.deliveryTimeMax} min`
                        : `${data?.store?.deliveryTimeMin ? 
                            `${data?.store?.deliveryTimeMin} min` 
                            : data?.store?.deliveryTimeMax ? 
                            `${data?.store?.deliveryTimeMax} min` 
                            : 'XX:XX min'}`
                    }</Text>
                    <Text style={{ 
                        alignSelf: 'center',
                        padding: 10, fontWeight: '500',
                        fontSize: 16, color: colors.text 
                    }}>{formatedMoney(data?.store?.deliveryPrice)}</Text>
                    </View>
                } */}

            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, opacity: .5 }}>Produtos adicionais</Text>
            <ProductInfoContainner style={[isDesktop && { flex: 1 }]}>
                {data?.products?.map(item => (
                    <View>
                    <ProductCard 
                        uri={item?.uri}
                        name={item?.name}
                        about={item?.about}
                        onPress={() => handleProduct({ store, slug: item?.slug })}
                        price={useProductValue(item)}
                        subPrice={item?.price}
                        maxCount={item?.spinOff ? 1 : 99}
                        count={state?.components?.find(({ product }) => product === item?._id)?.quantity}
                        onChangeCount={quantity => onChangeAddQuantity(item?._id, { product: item?._id, quantity })}
                        onContentPress={() => handleProduct({ store, slug: item?.slug })}
                        onImagePress={() => handleProduct({ store, slug: item?.slug })}
                    /> 
                    {state?.components?.find(({ product }) => product === item?._id)?.quantity > 0 &&
                    <View style={{ paddingLeft: 30 }}>
                        {item?.products.map(subItem => (
                        <View style={{ paddingLeft: 20 }}>
                            <MaterialIcons style={{ position: 'absolute', padding: 10 }}
                            name={'subdirectory-arrow-right'} 
                            size={24} color={colors.text} 
                            />
                            <ProductCard minimize 
                            uri={subItem?.uri}
                            name={subItem?.name}
                            about={subItem?.about}
                            price={useProductValue(subItem)}
                            subPrice={subItem?.price}
                            maxCount={state?.components?.find(({ product }) => product === item?._id)?.quantity}
                            onPress={() => handleProduct({ store, slug: subItem?.slug })}
                            count={state?.components?.find(({ product }) => product === item?._id)?.components?.find(({ product }) => product === subItem?._id)?.quantity}
                            onChangeCount={quantity => 
                                onChangeAddQuantity(item?._id, { 
                                components: state?.components?.find(_item => _item?.product === item?._id)
                                ?.components?.map(_item => 
                                    (_item?.product !== subItem?._id) ? _item 
                                    : { ..._item, quantity }
                                )
                                })
                            }
                            onContentPress={() => handleProduct({ store, slug: subItem?.slug })}
                            onImagePress={() => handleProduct({ store, slug: subItem?.slug })}
                            />
                        </View> 
                        ))}
                    </View>}
                    </View>
                ))}
            </ProductInfoContainner>

            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, opacity: .5 }}>{'Observações'}</Text>
                <InputTextArea 
                    onFocus={() => {  setTimeout(() => { ref?.current?.scrollToEnd({ animated: true }) }, 250) }}
                    cursorPointered={!isDesktop}
                    style={{ minHeight: 120 }}
                    containerStyle={[ isDesktop && { 
                        backgroundColor: colors.border,
                        paddingVertical: 0, marginVertical: 10,
                        borderWidth: 1, borderColor: colors.border, 
                        borderRadius: 4,
                    }]}
                    placeholderTextColor={colors.text}
                    placeholder={'Ex: tirar a cebola, maionese à parte...'}
                    maxLength={66}
                    value={state?.comment}  
                    onChangeText={onChangeComment}
                />
          </View>


        {/* <View style={{ flex: 1 }}>

        </View> */}


        </ScrollView>

        {!isDesktop && <ProductControll 
            comment={state?.commet}
            quantity={state?.quantity}
            exist={!!state?._id}
            offset={data?.offset}
            single={data?.single}
            onChangeQuantity={onChangeQuantity}
            onRemove={onRemove}
            onSave={onSave}
            onUpdate={onUpdate}
            value={value}
            additionals={additionals}
            total={total}
            up={up}
            onLayout={onLayoutControll}
            bottom={bottom}
        />}
      
    </View>
  )
})

export default ProductTemplate

interface ProductControllProps   {
    onChangeQuantity: (quantity: number) => any
    onRemove: (id?: string) => any
    onUpdate: (item: { quantity: number, comment: string }) => any
    onSave: (item: { quantity: number, comment: string }) => any
    exist: boolean
    up: boolean
    offset: number
    single: boolean
    quantity: number
    comment: string
    value: number
    total: number
    additionals: number
    onLayout?: (event: LayoutChangeEvent) => void
    style?: StyleProp<ViewStyle>
    styleInner?: StyleProp<ViewStyle>
    bottom?: number
}

const ProductControll: React.FC<ProductControllProps> = ({
    onLayout, 
    total,
    value,
    additionals,
    single,
    comment,
    quantity,
    offset,
    onChangeQuantity,
    exist,
    up,
    onSave,
    onUpdate,
    onRemove,
    style,
    styleInner,
    bottom=0,
}) => {
    const { colors, dark } = useTheme()

  return (
<View style={[{ 
          position: 'absolute', bottom,  
          width: '100%', padding: 10, 
          zIndex: 99999
        }, style]} 
        onLayout={onLayout} 
      >
        <View style={[{ 
            width: '100%', borderRadius: 4, overflow: 'hidden',
            borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card
        }, styleInner]} 
        >
            <CardLink touchable={false} border={false} 
                titleFontWeight={'bold'}
                tintColor={colors.primary}
                title={formatedMoney(total / quantity)}
                subTitleStyle={{ fontWeight: 'bold', textDecorationLine: !(!single && total > additionals) && offset ? 'line-through' : 'none' }}
                subTitle={ (!additionals) ? undefined : formatedMoney(single ? value+additionals : additionals)}
                color={colors.text}
                center={
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <InputCount numberFontWeight={"bold"} minValue={1} value={quantity} onChangeValue={onChangeQuantity} />
                </View>
                }
                right={
                <View style={{ width: '33.33%', alignItems: 'flex-end', padding: 10 }}>
                    <TextButton style={{ padding: 0 }} textTransform={'uppercase'} fontWeight="bold"
                    label={
                        !exist ? 'Adicionar' 
                        : up ? 'Salvar' 
                        : 'Remover'
                    }
                    color={(!exist || up) ? colors.primary : colors.notification}
                    fontSize={16}
                    disabled={!single && (total / quantity) > additionals}
                    onPress={() => 
                        !exist ? onSave({ quantity, comment }) 
                        : up ? onUpdate({ quantity, comment })
                        : onRemove()
                    }
                    />

                    <Text style={{ 
                    color: colors.text, fontSize: 14,
                    fontWeight: 'bold',
                    }}>{formatedMoney(total)}
                    </Text>
                </View>
                }
            />
        </View>
      </View>
  )
}


const styles = StyleSheet.create({
    title: {
      fontSize: 18,
      fontWeight: 'bold',
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
      fontSize: 18,
      fontWeight: 'bold',
      // paddingHorizontal: 10,
      // paddingBottom: 10,
    }
  })