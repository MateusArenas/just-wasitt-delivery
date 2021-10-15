import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Refresh from '../../components/Refresh';
import { useThemeColor } from '../../components/Themed';
import * as ProductService from '../../services/product';
import { RootStackParamList } from '../../types'; 
import * as Cart from '../../services/cart'
import * as BundleService from '../../services/bundle'
import useService from '../../hooks/useService';
import useUri from '../../hooks/useUri';
import ProductModel from '../../models/Product';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FlatList, View, Text, ScrollView, StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { useFocusEffect, useRoute, useTheme } from '@react-navigation/native';
import IconButton from '../../components/IconButton';
import InputCount from '../../components/InputCount';
import InputTextArea from '../../components/InputTextArea';
import * as CategoryService from '../../services/category';
import { writePrice } from '../../utils';
import { MaterialIcons } from '@expo/vector-icons';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import AuthContext from '../../contexts/auth';
import CardLink from '../../components/CardLink';
import KeyboardSpacer from '../../components/KeyboardSpacer'
import { useBottomTabBarHeight, BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import TextButton from '../../components/TextButton';
import { useScrollToTop } from '@react-navigation/native';
import { MaskService } from 'react-native-masked-text';
import { BlurView } from 'expo-blur';

function Product({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Product'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)

  const [height, setHeight] = React.useState<number>(0)
  const ref = React.useRef<ScrollView>(null);
  const { user } = useContext(AuthContext)
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const { colors, dark } = useTheme()
  const [state, setState] = useState<Cart.cartData>({ quantity: 1 } as Cart.cartData)
  const [comment, setComment] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const { store, id } = route.params

  useScrollToTop(ref);

  const { 
    response, 
    loading, 
    onRefresh,
    error, 
    refreshed
  } = useService<ProductService.ProductData>(ProductService, 'search', { store, id })

  const data = response?.data[0]

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: store,
      headerTitle: props => <HeaderTitle {...props} onPress={() => navigation.navigate('Store', { store })} />,
      headerRight: ({ tintColor }: any) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          <IconButton 
            name="more-horiz" 
            size={24} 
            color={colors.text} 
            onPress={() => BottomHalfModal.show(modalize => 
              <FlatList 
                ListHeaderComponentStyle={{ padding: 5 }}
                ListHeaderComponent={
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {[
                      { key: 0, icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                      { key: 1, icon: 'link', color: colors.text, title: 'Link', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                      { key: 2, icon: 'sim-card-alert', color: 'red', title: 'Denunciar', onPress: () => {} },
                    ].map(item => (
                      <View style={{ 
                        padding: 10, paddingTop: 0,
                        flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                        marginHorizontal: 5, alignItems: 'center', 
                      }}>
                        <IconButton style={{ padding: 20 }}
                          name={item?.icon as any}
                          size={24}
                          color={item?.color}
                          onPress={item?.onPress}
                          onPressed={modalize?.current?.close}
                        />
                        <Text style={{ color: item?.color, fontSize: 12, 
                          position: 'absolute', bottom: 10
                        }}>{item?.title}</Text>
                      </View>
                    ))}
                  </View>
                  // <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{'Produto'}</Text>
                }
                data={
                  data?.self ? [
                    { key: 0, icon: 'add-circle-outline', color: colors.primary, title: 'Criar', onPress: () => navigation.navigate('MakeProduct', { store })},
                    { key: 1, icon: 'edit', color: colors.text, title: 'Editar', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                    { key: 2, icon: 'delete', color: 'red', title: 'Remover', onPress: async function onRemove () {
                      try {
                        await ProductService.remove({ store, id })
                        navigation.replace('Store', { store })
                      } catch(err) {
                  
                      }
                    } },
                  ] : []
                }
                contentContainerStyle={{ flexGrow: 1 }}
                keyExtractor={item => `${item?.key}`}
                renderItem={({ item, index }) => 
                  <CardLink style={{
                      backgroundColor: colors.card,
                      borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                      borderBottomLeftRadius: index === 2 ? 10 : 0, borderBottomRightRadius: index === 2 ? 10 : 0,
                      marginTop: index === 0 ? 10 : 0, marginBottom: index === 2 ? 10 : 0,
                      marginHorizontal: 10,
                    }}
                    border={index !== 2}
                    titleContainerStyle={{ padding: 10 }}
                    title={item?.title}
                    right={
                      <MaterialIcons style={{ padding: 20 }}
                        name={item?.icon as any}
                        size={24}
                        color={item?.color}
                      />
                    }
                    color={item?.color}
                    onPress={item?.onPress}
                    onPressed={modalize?.current?.close}
                  />
                }
                ListFooterComponent={
                  <View>
                    <CardLink border={false}
                      style={{ margin: 10, borderRadius: 10, backgroundColor: colors.card  }}
                      titleContainerStyle={{ padding: 10 }}
                      title={store}
                      right={
                        <MaterialIcons style={{ padding: 20 }}
                          name={'store'}
                          size={24}
                          color={colors.text}
                        />
                      }
                      color={colors.text}
                      onPress={() => navigation.navigate('Store', { store })}
                      onPressed={modalize?.current?.close}
                    />
                    <CardLink border={false}
                      style={{ margin: 10, borderRadius: 10, backgroundColor: colors.card  }}
                      titleContainerStyle={{ alignItems: 'center' , padding: 10 }}
                      title={'Cancelar'}
                      right={null}
                      color={colors.text}
                      onPress={modalize?.current?.close}
                    />
                  </View>
                }
              />
            )} 
          />
        </View>
      ),
    });
  }, [data]))

  useEffect(() => {
    (async () => {
      try {
        if (data) {
          const cartProduct = await BundleService.search({ store, userId: user?._id, id: data?._id })
          setState(state => ({...state, ...cartProduct }))
          setQuantity(cartProduct.quantity)
          setComment(cartProduct.comment)
        }
      } catch (err) {}
    })()
  } ,[data, setState, setQuantity, setComment])

  const saveToCart = async ({ quantity, comment }) => {
    try {
      console.log('save', { quantity, comment });
      await BundleService.create({ store, userId: user?._id, body: { 
        _id: id, 
        store: data?.store?._id,
        product: id, 
        user: user?._id, 
        quantity, 
        comment,
      } })
      setState(state => ({ ...state, quantity, comment }))
      navigation.replace('Store', { store })
    } catch (err) {}
  }

  const onRemove = async () => {
    if (data?._id) await BundleService.remove({ store, id: data?._id, userId: user?._id })
    navigation.replace('Store', { store })
  }

  const onUpdate = useCallback(async ({ quantity, comment }) => {
    try {
      console.log('uppp', { quantity, comment });
      await BundleService.update({ store, userId: user?._id, body: { 
        _id: id, 
        store: data?.store?._id,
        product: id, 
        user: user?._id, 
        quantity, 
        comment,
      } })
      setState(state => ({ ...state, quantity, comment }))
    } catch (err) {}
  }, [data, setState])

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.replace('Product', { store, id })}/>
  if (error === 'NOT_FOUND') return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        offset={top}
        disabled={!refreshed}
        refreshing={loading === 'REFRESHING'}
        onRefresh={() => onRefresh('search', { store, id })}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
              <ScrollView ref={ref} 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: top, paddingBottom: bottom+extraBottom }}
                scrollIndicatorInsets={{ top, bottom: bottom+extraBottom }}
              >
                <ProductModel data={data} store={store} onPress={Keyboard.dismiss} />


                {data?.store?.delivery && 
                  <View style={{  backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <MaterialIcons style={{ padding: 10, paddingRight: 0 }} 
                      name={"delivery-dining"}
                      size={24}
                      color={colors.text}
                      />
                    <Text style={{ alignSelf: 'baseline', flex: 1, padding: 10, fontWeight: '500', fontSize: 16, color: colors.text }}>{
                      (data?.store?.deliveryTimeMin && data?.store?.deliveryTimeMax) ?
                      `${data?.store?.deliveryTimeMin}-${data?.store?.deliveryTimeMax} min`
                      : `${data?.store?.deliveryTimeMin ? 
                            `${data?.store?.deliveryTimeMin} min` 
                          : data?.store?.deliveryTimeMax ? 
                            `${data?.store?.deliveryTimeMax} min` 
                          : 'XX:XX min'}`
                    }</Text>
                    <Text style={{ alignSelf: 'baseline',padding: 10,fontWeight: '500', fontSize: 16, color: colors.text }}>{
                      MaskService.toMask('money', (data?.store?.deliveryPrice | 0) as unknown as string, 
                      {
                        precision: 2,
                        separator: ',',
                        delimiter: '.',
                        unit: 'R$ ',
                        suffixUnit: ''
                      }) 
                    }</Text>
                  </View>
                }
                <CardLink border={data?.store?.delivery ? 'top' : false} style={{ backgroundColor: colors.card }}
                  title={'Categorias'}
                  color={colors.text}
                  onPressed={Keyboard.dismiss}
                  left={
                    <MaterialIcons style={{ padding: 10 }} 
                      name={"tag"}
                      size={24}
                      color={colors.text}
                    />
                  }
                  right={
                    <MaterialIcons style={{ padding: 10 }} 
                      name={"expand-more"}
                      size={24}
                      color={colors.border}
                    />
                  }
                  onPress={() => BottomHalfModal.show(modalize => 
                    <FlatList 
                      ListHeaderComponentStyle={{ 
                        width: '100%', padding: 10, 
                        alignItems: 'center', justifyContent: 'center',
                        borderBottomWidth: 1, borderColor: colors.border,
                      }}
                      ListHeaderComponent={
                        <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{'Categorias'}</Text>
                      }
                      data={data?.categories?.map(category => 
                        ({ key: category?._id, title: category?.name, onPress: () => navigation.navigate('Category', { store, id: category?._id })  })
                      )}
                      keyExtractor={(item, index) => `${item?.key}-${index}`}
                      renderItem={({ item, index }) => 
                      <CardLink border={(data?.categories?.length-1) !== index}
                          left={
                            <MaterialIcons style={{ padding: 20 }}
                              name={'tag'}
                              size={24}
                              color={colors.text}
                            />
                          }
                          titleContainerStyle={{ paddingVertical: 10 }}
                          title={item?.title}
                          color={colors.text}
                          onPress={item?.onPress}
                          onPressed={modalize?.current?.close}
                        />
                      }
                    />
                  )} 
                />

                {data?.promotions?.length > 0 && 
                <CardLink border={'top'} style={{ backgroundColor: colors.card }}
                  title={'Promoções'}
                  color={colors.text}
                  onPressed={Keyboard.dismiss}
                  left={
                    <MaterialIcons style={{ padding: 10 }} 
                      name={"anchor"}
                      size={24}
                      color={colors.text}
                    />
                  }
                  right={
                    <MaterialIcons style={{ padding: 10 }} 
                      name={"expand-more"}
                      size={24}
                      color={colors.border}
                    />
                  }
                  onPress={() => BottomHalfModal.show(modalize => 
                    <FlatList 
                      ListHeaderComponentStyle={{ 
                        width: '100%', padding: 10, 
                        alignItems: 'center', justifyContent: 'center',
                        borderBottomWidth: 1, borderColor: colors.border,
                      }}
                      ListHeaderComponent={
                        <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{'Promoções'}</Text>
                      }
                      data={data?.promotions?.map(promotion => 
                        ({ key: promotion?._id, title: promotion?.name, onPress: () => navigation.navigate('Promotion', { store, id: promotion?._id })  })
                      )}
                      keyExtractor={(item, index) => `${item?.key}-${index}`}
                      renderItem={({ item, index }) => 
                        <CardLink border={(data?.promotions?.length-1) !== index}
                          left={
                            <MaterialIcons style={{ padding: 20 }}
                              name={'anchor'}
                              size={24}
                              color={colors.text}
                            />
                          }
                          titleContainerStyle={{ paddingVertical: 10 }}
                          title={item?.title}
                          color={colors.text}
                          onPress={item?.onPress}
                          onPressed={modalize?.current?.close}
                        />
                      }
                    />
                  )} 
                />}

          <View style={{ backgroundColor: colors.card }}>
            <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16, padding: 10 }}>Observações</Text>

            <InputTextArea onFocus={() => ref?.current?.scrollToEnd({ animated: true })}
              placeholderTextColor={colors.text}
              placeholder={'Ex: tirar a cebola, maionese à parte...'}
              maxLength={66}
              value={comment}  
              onChangeText={comment => setComment(comment)}
            />
          </View>
        </ScrollView>

      </PullToRefreshView>
      <BlurView 
        style={{ 
          position: 'absolute', bottom, width: '100%',
          borderTopWidth: 1, borderColor: colors.border
        }} 
        intensity={100} tint={dark ? 'dark' : 'light'}
        onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
      >
        <CardLink touchable={false} border={false}
          tintColor={colors.primary}
          title={writePrice(data?.price * state?.quantity)}
          color={colors.text}
          center={
            <View style={{ flex: 1, alignItems: 'center' }}>
              <InputCount value={quantity} onChangeValue={quantity => setQuantity(quantity)}>
                <Text style={[styles.totalPrice, { color: (quantity !== state?.quantity) ? colors.primary : colors.text }]}>{quantity}</Text>
              </InputCount>
            </View>
          }
          right={
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TextButton textTransform={'uppercase'}
                label={!state?._id ? 'Adicionar' : (quantity !== state?.quantity || comment !== state?.comment) ? 'Salvar' : 'Remover'}
                color={(!state?._id || (quantity !== state?.quantity || comment !== state?.comment)) ? colors.primary : 'red'}
                fontSize={16}
                onPress={() => 
                  !state?._id ? saveToCart({ quantity, comment }) 
                  : (quantity !== state?.quantity || comment !== state?.comment) ? onUpdate({ quantity, comment })
                  : onRemove()
                }
              />
            </View>
          }
        />
      </BlurView>
      <KeyboardSpacer topSpacing={-(bottom+extraBottom)} />
    </View>
  )
}

export default Product

const styles = StyleSheet.create({
  totalPrice: {
    fontSize: 16,
    fontWeight: '500',
  }
})

