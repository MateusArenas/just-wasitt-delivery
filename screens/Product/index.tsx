import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState, useReducer } from 'react';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Refresh from '../../components/Refresh';
import { useThemeColor } from '../../components/Themed';
import * as ProductService from '../../services/product';
import { RootStackParamList } from '../../types'; 
import * as BundleService from '../../services/bundle'
import * as BagService from '../../services/bag'
import useService from '../../hooks/useService';
import useUri from '../../hooks/useUri';
import ProductModel from '../../models/Product';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FlatList, Image, View, Text, ScrollView, StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { useFocusEffect, useIsFocused, useRoute, useTheme } from '@react-navigation/native';
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
import { useDebounceHandler } from '../../hooks/useDebounce';
import useProductPrice, { useProductAdditionals, useProductValue } from '../../hooks/useProductPrice';
import ProductCard from '../../components/ProductCard';
import useLoadScreen from '../../hooks/useLoadScreen';
import SnackBar from '../../components/SnackBar';
import SnackBarContext from '../../contexts/snackbar';
import { setSnackBottomOffset, setSnackExtraBottomOffset, useSnackbar, useSnackbarHeight } from '../../hooks/useSnackbar';


const initialState = { 
  quantity: 1, 
  comment: '', 
  components: []
};

function reducer(state: Partial<BundleService.bundleData>, action) {
  switch (action.type) {
    case 'init':
      return { ...state, ...action?.payload };
    // case 'quantity':
    //   return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Product({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Product'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)
  const [extraSnackBottom, setExtraSnackBottom] = React.useState(0)

  const [state, dispatch] = useReducer(reducer, initialState);

  const [height, setHeight] = React.useState<number>(0)
  const ref = React.useRef<ScrollView>(null);
  const { user } = useContext(AuthContext)
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const { colors, dark } = useTheme()

  const [up, setUp] = useState(false)

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
                      { key: 2, icon: 'sim-card-alert', color: colors.notification, title: 'Denunciar', onPress: () => {} },
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
                    { key: 2, icon: 'delete', color: colors.notification, title: 'Remover', onPress: async function onRemove () {
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


  const BundleResponse = useService<BundleService.bundleData>(BundleService, 
    'search', { store, userId: user?._id, id: data?._id }
  , [user, data])
 
  const BagResponse = useService<BagService.bagData>(BagService)

  useFocusEffect(useCallback(() => { 
    BagResponse?.onService('search', { id: store, userId: user?._id }) 
  }, [user]))

  useEffect(() => { 
    BagResponse?.onService('search', { id: store, userId: user?._id }) 
  }, [up, user])

  const totalPrice = BagResponse?.response?.data[0]?.bundles?.map(bundle => {
    return useProductPrice(bundle) * bundle?.quantity
  })?.reduce((acc, cur) => acc + cur, 0) 
  const totalQuantity = BagResponse?.response?.data[0]?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0


  const local = BundleResponse?.response?.data[0]

  useEffect(() => {
    (async () => {
      try {
        if (data) {
          // load initial
          dispatch({ type: 'init', payload: {
            ...state, 
            product: id,
            store: data?.store?._id,
            user: user?._id,
            quantity: 1, comment: '',
            components: data?.products?.map(item => ({
              quantity: 0,
              product: item?._id,
              components: item?.products?.map(subItem => ({
                quantity: 0,
                product: subItem?._id,
              }))
            }))
          } })
          //load cart

          if (local) {
            dispatch({ type: 'init', payload: {
              ...state, 
              ...local,
              components: local?.components?.map(item => ({
                ...item,
                product: item?.product?._id,
                components: item?.components?.map(subItem => ({
                  ...subItem,
                  product: subItem?.product?._id,
                }))
              }))
            } })
          }
          
        }
      } catch (err) {}
    })()
  } ,[user, data, dispatch, local])

  const saveToCart = async ({ quantity, comment }) => {
    try {
      await BundleService.create({ store, userId: user?._id, body: { 
        _id: id, 
        store: data?.store?._id,
        product: id, 
        user: user?._id, 
        components: state?.components,
        quantity, 
        comment,
      } })
      setUp(false)
      dispatch({ type: 'init', payload: { ...state, quantity, comment } })
      // navigation.replace('Store', { store })
    } catch (err) {}
  }

  const onRemove = async () => {
    if (data?._id) await BundleService.remove({ store, id: data?._id, userId: user?._id })
    // navigation.replace('Store', { store })
  }

  const onUpdate = async ({ quantity, comment }) => {
    try {
      await BundleService.update({ store, userId: user?._id, body: { 
        _id: id, 
        store: data?.store?._id,
        product: id, 
        user: user?._id, 
        components: state?.components,
        quantity, 
        comment,
      } })
      setUp(false)
      // setState(state => ({ ...state, quantity, comment }))
      dispatch({ type: 'init', payload: { ...state, quantity, comment } })
    } catch (err) {}
  }

  const bundle = {
    ...state,
    product: data,
    components: state?.components?.map(byItem => ({
      ...byItem,
      product: data?.products?.find(item => item?._id === byItem?.product),
      components: byItem?.components?.map(subItem => ({
        ...subItem,
        product: data?.products?.find(item => item?._id === byItem?.product)
          ?.products?.find(item => item?._id === subItem?.product)
      })) 
    }))
  }

  const additionals = useProductAdditionals(bundle)
  const value = useProductValue(bundle?.product)
  const total = useProductPrice(bundle) * bundle?.quantity

  function handleComment (comment) {
    setUp(local?.comment !== comment)
    dispatch({ type: 'init', payload: { comment } })
  }

  function handleQuantity (quantity) {
    setUp(local?.quantity !== quantity)
    dispatch({ type: 'init', payload: { quantity } })
  }

  function handleAddQuantity (id: string, body: Partial<BundleService.componentData>) {
    setUp(true)

    dispatch({ type: 'init', payload: { ...state, components: [
        ...state?.components?.map(item => 
          item?.product !== id ? item : { ...item, ...body }
        )
      ] 
    } })
  }

  // const Snackbar = useContext(SnackBarContext)

  // useFocusEffect(useCallback(() => {
  //   if (extraBottom) Snackbar?.open({
  //     onPress: () => navigation.navigate('Bag', { store }),
  //     messageColor: colors.text,
  //     position: "bottom",
  //     bottom: ((extraBottom/2) + 20),
  //     icon: 'shopping-bag',
  //     iconColor: colors.text,
  //     textMessage: formatedMoney(totalPrice),
  //     indicatorIcon: true,
  //     actionText: `${totalQuantity}`,
  //     accentColor: colors.primary,
  //   })
  //   return () => Snackbar?.close()
  // }, [totalPrice, totalQuantity,extraBottom]))

  const setExtraBottomOffset = setSnackExtraBottomOffset()

  useFocusEffect(React.useCallback(() => {
    if (extraBottom) setExtraBottomOffset((extraBottom+20)+((extraSnackBottom/2)+20))
    return function cleanup () {
      setExtraBottomOffset(0)
    }
  }, [setExtraBottomOffset, extraBottom, extraSnackBottom]))

  function formatedMoney (value: number = 0) : string {
    const moneyOptions = {
      precision: 2,
      separator: ',',
      delimiter: '.',
      unit: 'R$ ',
      suffixUnit: ''
    }
    return  MaskService.toMask('money', (value ? value : 0) as unknown as string, moneyOptions)
  }

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
                focusable
                keyboardDismissMode={'none'}
                keyboardShouldPersistTaps={'handled'}
                style={{ flex: 1 }}
                contentContainerStyle={[
                  { marginTop: top, paddingBottom: top+bottom+(extraBottom/2)+(extraSnackBottom) },
                  { flexGrow: 1, backgroundColor: colors.card }
                ]}
                scrollIndicatorInsets={{ top, bottom: bottom+(extraBottom/2)+(extraSnackBottom) }}
              >

                <ProductModel data={data} store={store} onPress={Keyboard.dismiss} />

                <View style={{ paddingHorizontal: 10, flexDirection: 'row' }}>
                  {[].concat(
                    data?.categories?.map(item => ({ 
                      _id: item?._id, name: `#${item?.name}`,
                      onPress: () => navigation.navigate('Category', { store, id: item?._id })
                    }))).concat( 
                    data?.promotions?.map(item => ({ 
                      _id: item?._id, name: `%${item?.name}`,
                      onPress: () => navigation.navigate('Promotion', { store, id: item?._id })
                    }))
                  )?.map(item => (
                    <TouchableOpacity key={item?._id} onPress={item?.onPress}>
                      <Text style={{
                        fontSize: 14, fontWeight: '500',
                        color: colors.primary, 
                        paddingVertical: 10, paddingRight: 10
                      }}>
                        {item?.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {data?.store?.delivery && 
                  <View style={{  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    <Text style={{ 
                      alignSelf: 'baseline',
                      padding: 10,fontWeight: '500', 
                      fontSize: 16, color: colors.text 
                    }}>{formatedMoney(data?.store?.deliveryPrice)}</Text>
                  </View>
                }

            <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16, padding: 10 }}>Adicione ao produto</Text>
            {data?.products?.map(item => (
              <View>
                <ProductCard 
                  uri={item?.uri}
                  name={item?.name}
                  about={item?.about}
                  onPress={() => navigation.push('Product', { store, id: item?._id })}
                  price={useProductValue(item)}
                  subPrice={item?.price}
                  maxCount={item?.spinOff ? 1 : 99}
                  count={state?.components?.find(({ product }) => product === item?._id)?.quantity}
                  onChangeCount={quantity => handleAddQuantity(item?._id, { product: item?._id, quantity })}
                  onContentPress={() => navigation.push('Product', { store, id: item?._id })}
                  onImagePress={() => navigation.push('Product', { store, id: item?._id })}
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
                        onPress={() => navigation.push('Product', { store, id: subItem?._id })}
                        count={state?.components?.find(({ product }) => product === item?._id)?.components?.find(({ product }) => product === subItem?._id)?.quantity}
                        onChangeCount={quantity => 
                          handleAddQuantity(item?._id, { 
                            components: state?.components?.find(_item => _item?.product === item?._id)
                            ?.components?.map(_item => 
                              (_item?.product !== subItem?._id) ? _item 
                              : { ..._item, quantity }
                            )
                          })
                        }
                        onContentPress={() => navigation.push('Product', { store, id: subItem?._id })}
                        onImagePress={() => navigation.push('Product', { store, id: subItem?._id })}
                      />
                    </View> 
                  ))}
                </View>}
              </View>
            ))}

            <Text style={{ color: colors.text, fontWeight: '500', fontSize: 16, padding: 10 }}>{'Observações'}</Text>
            <InputTextArea onFocus={() => {
              setTimeout(() => {
                ref?.current?.scrollToEnd({ animated: true })
              }, 250)
            }}
            style={{ paddingBottom: 20 }}
              placeholderTextColor={colors.text}
              placeholder={'Ex: tirar a cebola, maionese à parte...'}
              maxLength={66}
              value={state?.comment}  
              onChangeText={handleComment}
            />

        </ScrollView>

      </PullToRefreshView>
      <SnackBar visible
        onLayout={e => setExtraSnackBottom(e?.nativeEvent?.layout?.height)}
        messageColor={colors.text}
        dark={dark}
        position={"bottom"}
        bottom={bottom+(extraBottom/2)+20}
        icon={'shopping-bag'}
        iconColor={colors.text}
        textDirection={'row'}
        textMessage={formatedMoney(totalPrice)}
        textSubMessage={!data?.store?.minDeliveryBuyValue ? undefined : (" / " + 
        formatedMoney(data?.store?.minDeliveryBuyValue))}
        indicatorIcon
        onPress={() => navigation.navigate('Bag', { store })}
        actionText={`${totalQuantity}`}
        accentColor={colors.primary}
      />
      <View style={{ position: 'absolute', bottom,  width: '100%', padding: '5%', zIndex: 99999 }} 
        onLayout={({ nativeEvent: { layout: { height } } }) => setExtraBottom(height)} 
      >
        <BlurView style={{ width: '100%', borderRadius: 4, overflow: 'hidden' }} 
          intensity={100} tint={dark ? 'dark' : 'light'}
        >
          <CardLink touchable={false} border={false}
            tintColor={colors.primary}
            title={formatedMoney(total / state?.quantity)}
            subTitleStyle={{ textDecorationLine: !(!data?.single && total > additionals) && data?.offset ? 'line-through' : 'none' }}
            subTitle={ (!additionals) ? undefined : formatedMoney(data?.single ? value+additionals : additionals)}
            color={colors.text}
            center={
              <View style={{ flex: 1, alignItems: 'center' }}>
                <InputCount minValue={1} value={state?.quantity} onChangeValue={handleQuantity} />
              </View>
            }
            right={
              <View style={{ width: '33.33%', alignItems: 'flex-end', padding: 10 }}>
                <TextButton style={{ padding: 0 }} textTransform={'uppercase'}
                  label={!state?._id ? 'Adicionar' : up ? 'Salvar' : 'Remover'}
                  color={(!state?._id || up) ? colors.primary : colors.notification}
                  fontSize={16}
                  disabled={!data?.single && (total / state?.quantity) > additionals}
                  onPress={() => 
                    !state?._id ? saveToCart({ quantity: state?.quantity, comment: state?.comment }) 
                    : up ? onUpdate({ quantity: state?.quantity, comment: state?.comment })
                    : onRemove()
                  }
                />

                <Text style={{ 
                  color: colors.text, fontSize: 14,
                  fontWeight: '500',
                }}>{formatedMoney(total)}
                </Text>
              </View>
            }
          />
        </BlurView>
      <KeyboardSpacer topSpacing={-(bottom+(extraBottom))} />
      </View>
    </View>
  )
}

export default Product



