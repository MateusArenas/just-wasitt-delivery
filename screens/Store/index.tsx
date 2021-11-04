import { StackNavigationOptions, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import IconButton from '../../components/IconButton';
import { RootStackParamList } from '../../types';
import useRootNavigation from '../../hooks/useRootNavigation';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useFocusEffect, useIsFocused, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import useLoadScreen from '../../hooks/useLoadScreen';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { TouchableOpacity, View, Image, Text, useWindowDimensions, LayoutChangeEvent } from 'react-native';
import NotFound from '../../components/NotFound';
import { StoreDate } from '../../services/store';
import ScrollableTabString from '../../components/ScrollableTabString';
import { CategoryData } from '../../services/category';
import * as BagService from '../../services/bag'
import useService from '../../hooks/useService';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import ContainerButton from '../../components/ContainerButton';
import ProfileCard from '../../components/ProfileCard';
import ProfileStatistic from '../../components/ProfileStatistic';
import AuthContext from '../../contexts/auth';
import { getDay } from 'date-fns';
import useStoreStatus from '../../hooks/useStoreStatus';
import Product from '../../models/Product';
import * as StoreService from '../../services/store';
import * as ManageService from '../../services/manage'
import * as FollowerService from '../../services/follower';
import * as SavedService from '../../services/saved';
import CardLink from '../../components/CardLink';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import { MaskService } from 'react-native-masked-text';
import useProductPrice from '../../hooks/useProductPrice';
import SnackBarContext from '../../contexts/snackbar';
import SnackBar from '../../components/SnackBar';
import { useSetSnackBottomOffset, useSetSnackExtraBottomOffset, useSnackbar, useSnackbarHeight } from '../../hooks/useSnackbar';
import { useBag } from '../../hooks/useBag';


function Store({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Store'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)
  
  const { width } = useWindowDimensions()
  const { user, signed } = useContext(AuthContext)
  const { store } = route?.params
  const { colors, dark } = useTheme();
  const [index, setIndex] = useState(0)

  const bagResponse = useBag(//select
    data => data?.find(item => (item?._id === store && item?.user === user?._id) )
  )

  // function additionals (data, c) {
  //   return (c?.length > 0) ?
  //   c?.map(({ product: {_id}, quantity, components }) => {  
  //     const product = data?.products?.find(item => item?._id === _id)

  //     const subAdditionals = (components?.length > 0) ? 
  //       components?.map(({ product: { _id: sub_id }, quantity: subQuantity, components }) => {  
  //       const subProduct = product?.products?.find(item => item?._id === sub_id)
  //       return ( subProduct?.price 
  //         - 
  //         (
  //           (Math.max(...subProduct?.promotions?.map(item => item?.percent), 0) / 100 )
  //           * subProduct?.price
  //         )
  //       ) * subQuantity
  //     })?.reduce((acc, cur) => acc + cur, 0) : 0

  //     return (( product?.price 
  //       - 
  //       (
  //         (Math.max(...product?.promotions?.map(item => item?.percent), 0) / 100 )
  //         * product?.price
  //       )
  //     ) * quantity) + (quantity > 0 ? subAdditionals : 0)
  //   })?.reduce((acc, cur) => acc + cur, 0)
  //   : 0
  // }
  
  const totalPrice = bagResponse.data?.bundles?.map(bundle => {
    return useProductPrice(bundle) * bundle?.quantity
  })?.reduce((acc, cur) => acc + cur, 0) 
  const totalQuantity = bagResponse.data?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0

  const rootNavigation = useRootNavigation()

  const { 
    response, 
    loading,
    refreshing, 
    onRefresh,
    onLoading,
    disabled
  } = useLoadScreen<StoreService.StoreDate>(async () => await StoreService.index({ name: store }))

  useEffect(() => { onLoading(); }, [])
  const data = response?.data[0]

  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          {!!data?.self && <IconButton 
            name={'add-circle-outline'}
            size={24} 
            color={colors.text} 
            onPress={() => BottomHalfModal.show(modalize => 
              <FlatList 
              ListHeaderComponent={
                <View>
                  <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {[
                      { key: 0, icon: 'local-offer', title: 'Produto', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                      { key: 1, icon: 'tag', title: 'Categoria', onPress: () => rootNavigation.navigate('MakeCategory', { store: route.params?.store })},
                      { key: 2, icon: 'anchor', title: 'Promoção', onPress: () => rootNavigation.navigate('MakePromotion', { store: route.params?.store })},
                    ].map(item => (
                      <View style={{ 
                        padding: 10, paddingTop: 0,
                        flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                        marginHorizontal: 5, alignItems: 'center', 
                      }}>
                        <IconButton style={{ padding: 20 }}
                          name={item?.icon as any}
                          size={24}
                          color={colors.primary}
                          onPress={item?.onPress}
                          onPressed={modalize?.current?.close}
                        />
                        <Text style={{ color: colors.primary, fontSize: 12, 
                          position: 'absolute', bottom: 10
                        }}>{item?.title}</Text>
                      </View>
                    ))}
                  </View>
  
                  <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {[
                      { key: 0, icon: 'group-work', title: 'Adicionais', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                      // { key: 0, icon: 'work', title: 'Serviço', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                      { key: 1, icon: 'local-attraction', title: 'Cupom', onPress: () => rootNavigation.navigate('MakeCategory', { store: route.params?.store })},
                      { key: 2, icon: 'local-fire-department', title: 'Liquidação', onPress: () => rootNavigation.navigate('MakePromotion', { store: route.params?.store })},
                    ].map(item => (
                      <View style={{ 
                        padding: 10, paddingTop: 0,
                        flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                        marginHorizontal: 5, alignItems: 'center', 
                      }}>
                        <IconButton style={{ padding: 20 }}
                          name={item?.icon as any}
                          size={24}
                          color={colors.primary}
                          onPress={item?.onPress}
                          onPressed={modalize?.current?.close}
                        />
                        <Text style={{ color: colors.primary, fontSize: 12, 
                          position: 'absolute', bottom: 10
                        }}>{item?.title}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {[
                      { key: 0, icon: 'work', title: 'Serviço', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                      // { key: 0, icon: 'work', title: 'Serviço', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                      { key: 1, icon: 'delivery-dining', title: 'Entrega', onPress: () => rootNavigation.navigate('MakeCategory', { store: route.params?.store })},
                      { key: 2, icon: 'pause', title: 'Pausa', onPress: () => rootNavigation.navigate('MakePromotion', { store: route.params?.store })},
                    ].map(item => (
                      <View style={{ 
                        padding: 10, paddingTop: 0,
                        flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                        marginHorizontal: 5, alignItems: 'center', 
                      }}>
                        <IconButton style={{ padding: 20 }}
                          name={item?.icon as any}
                          size={24}
                          color={colors.primary}
                          onPress={item?.onPress}
                          onPressed={modalize?.current?.close}
                        />
                        <Text style={{ color: colors.primary, fontSize: 12, 
                          position: 'absolute', bottom: 10
                        }}>{item?.title}</Text>
                      </View>
                    ))}
                  </View>
                  {/* 
                  <Text style={{ 
                    padding: 10, textAlign: 'center', opacity: .5, 
                    fontSize: 12, color: colors.text 
                  }}>{'Escolha uma das opções a cima a ser adicionada'}</Text> */}
                </View>
              }
              data={[]}
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={item => `${item?.key}`}
              renderItem={({ item, index }) => 
                <CardLink style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius: index === 1 ? 10 : 0, borderBottomRightRadius: index === 1 ? 10 : 0,
                    marginTop: index === 0 ? 10 : 0, marginBottom: index === 1 ? 10 : 0,
                    marginHorizontal: 10,
                  }}
                  border={index !== 1}
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
          />}
          <IconButton 
            name={data?.self ? "menu" : "more-horiz"} 
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
                  { key: 0, icon: 'account-circle', color: colors.text, title: 'Conta', onPress: () => navigation.navigate('Account')},
                  { key: 1, icon: 'business', color: colors.text, title: 'Pedidos', onPress: () => navigation.navigate('Orders', { store: route.params?.store })},
                  { key: 2, icon: 'delete', color: 'red', title: 'Remover', onPress: async function onRemove () {
                    try {
                      await ManageService.remove({ id: data?._id  })
                      navigation.replace('Account')
                    } catch(err) {
                
                    }
                  } },
                ] : []
              }
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={(item, index) => `${item?.key}-${index}`}
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
                    title={'Sobre'}
                    right={
                      <MaterialIcons style={{ padding: 20 }}
                        name={'info-outline'}
                        size={24}
                        color={colors.text}
                      />
                    }
                    color={colors.text}
                    onPress={() => navigation.navigate('StoreInfo', { store: route?.params?.store })}
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
  }, [navigation, data, user, BottomHalfModal]))

  // const Snackbar = useContext(SnackBarContext)

  // useFocusEffect(useCallback(() => {
  //   Snackbar?.open({
  //     onPress: () => navigation.navigate('Bag', { store }),
  //     messageColor: colors.text,
  //     position: "bottom",
  //     icon: 'shopping-bag',
  //     iconColor: colors.text,
  //     textMessage: MaskService.toMask('money', (totalPrice ? totalPrice : 0) as unknown as string, {
  //       precision: 2,
  //       separator: ',',
  //       delimiter: '.',
  //       unit: 'R$ ',
  //       suffixUnit: ''
  //     }),
  //     indicatorIcon: true,
  //     // onClose: () => setActionItems([]),
  //     actionText: `${totalQuantity}`,
  //     accentColor: colors.primary,
  //   })

  //   return () => Snackbar?.close()

  // }, [totalPrice, totalQuantity]))

  const setExtraBottomOffset = useSetSnackExtraBottomOffset()

  useFocusEffect(React.useCallback(() => {
    if (extraBottom) setExtraBottomOffset((extraBottom/2)+20)
    return function cleanup () {
      setExtraBottomOffset(0)
    }
  }, [setExtraBottomOffset, extraBottom]))

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

  
  if (loading) return <Loading />
  if (!response.network) return <Refresh onPress={() => navigation.replace('Store', { store })}/>
  if (!response.ok) return <NotFound title={`This store doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1 }} >
      <PullToRefreshView 
        offset={top}
        style={{ flex: 1 }}
        disabled={disabled}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <ScrollableTabString 
          contentContainerStyle={{ paddingTop: top, paddingBottom: bottom+extraBottom }}
          scrollIndicatorInsets={{ top, bottom }}
          headerTransitionWhenScroll={true}
          showsVerticalScrollIndicator
          scrollEventThrottle={16} 
          indexValue={index}
          onPressTab={(item, index) => setIndex(index)}
          isParent
          headerComponent={() => <Main store={data}/>}
          dataSections={data?.categories}
          dataTabs={data?.categories}
          renderSection={(item: CategoryData & { key?: string, items?: StoreDate['promotions'] }) => (
            <View style={{  }} >
              <CardLink style={{ backgroundColor: colors.card }} border={false}
                title={item.name}
                color={colors.text}
                onPress={() => navigation.navigate('Category', { store: store, id: item._id, })}
              />
              {item?.products?.map(item => (
                <View style={{ backgroundColor: colors.card }}>
                  <Product horizontal
                    store={store}
                    data={item}
                    height={width/3.25} 
                    onPress={() => navigation.navigate('Product', { id: item?._id, store })}
                  />
                </View>
              ))}
            </View>
          )}
          TabListHeaderComponent={
            <IconButton style={{ paddingHorizontal: 20 }}
              name={'search'}
              color={colors.text}
              size={24}
              onPress={() => navigation.navigate('Products', { store })}
            />
          }
          TabContainerComponet={props => 
            <BlurView {...props} style={{ borderBottomWidth: 1, borderColor: colors.border }} 
              intensity={100} tint={dark ? 'dark' : 'light'} 
            />
          }
          tabTopComponent={
            <View style={{ backgroundColor: colors.card, height: top, justifyContent: 'center' }}>
              <TabTop store={data}/>
            </View>
          }
          renderTabName={(item: CategoryData, _index: number) => (
            <TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text 
                  style={{ 
                    color: colors.text,
                    fontSize: 16, 
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    margin: 4,
                  }}
                >{item?.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          tabNamesContentContainerStyle={{ backgroundColor: colors.card, paddingLeft: 10, zIndex: 2 }}
          selectedTabStyle={{ minHeight: 48, borderBottomColor: colors.text, borderBottomWidth: 2, padding: 10, paddingBottom: 8 , opacity: 1 }}
          unselectedTabStyle={{ minHeight: 48, opacity: .8, padding: 10 } as any}
        />
        
      </PullToRefreshView>
        <SnackBar visible
          onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)}
          messageColor={colors.text}
          dark={dark}
          position={"bottom"}
          bottom={bottom}
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

      {/* {(totalQuantity > 0) && 
      <View style={{ position: 'absolute', bottom,  width: '100%', padding: '5%' }} 
        onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
      >
        <BlurView style={{ width: '100%', borderRadius: 4, overflow: 'hidden' }} 
          intensity={100} tint={dark ? 'dark' : 'light'}
        >
          <CardLink border={false}
            left={
              <MaterialIcons style={{ padding: 10 }} name="shopping-bag" size={24} color={colors.text} />
            }
            tintColor={colors.primary}
            title={
              !totalPrice ? undefined :
              MaskService.toMask('money', totalPrice as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              })
            }
            color={colors.text}
            rightLabel={!totalQuantity ? undefined : totalQuantity}
            onPress={() => navigation.navigate('Bag', { store })}
          />
        </BlurView>
      </View>} */}
    </View>
  )
}


const Main: React.FC<{ store: StoreDate} & { onLayout?: (event: LayoutChangeEvent) => void }> = ({ store: data, onLayout }) => {
  const { width } = useWindowDimensions()
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Store'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'Store'>>()
  const { store } = route.params

  const days = [
    { day: 'Domingo', start: data?.sundayStart, end: data?.sundayEnd, open: data?.saturday },
    { day: 'Segunda-feira', start: data?.mondayStart, end: data?.mondayEnd, open: data?.monday },
    { day: 'Terça-feira', start: data?.tuesdayStart, end: data?.tuesdayEnd, open: data?.tuesday },
    { day: 'Quarta-feira', start: data?.wednesdayStart, end: data?.wednesdayEnd, open: data?.wednesday },
    { day: 'Quinta-feira', start: data?.thursdayStart, end: data?.thursdayEnd, open: data?.thursday },
    { day: 'Sexta-feira', start: data?.fridayStart, end: data?.fridayEnd, open: data?.friday },
    { day: 'Sábado', start: data?.saturdayStart, end: data?.saturdayEnd, open: data?.saturday },
  ]

  const current = days[getDay(Date.now())]

  const isOpen = useStoreStatus(current)

  return (
  <View style={{ backgroundColor: colors.card }}>

    <ProfileCard style={{ padding: 0 }}
      uri={data?.uri}
      statusColor={isOpen ? colors.primary : 'red'}
      status={isOpen ? 'ABERTO' : 'FECHADO'}
      title={`${data?.city} - ${data?.state}`}
      about={data?.about}
      onPress={() => rootNavigation.navigate('StoreInfo', { store })}
      onPressIn={() => rootNavigation.navigate('Offers', { store })}
    />
    <ProfileStatistic 
      data={[
        { 
          title: 'publicações', 
          numbers: Number(data?.products?.length | 0) + Number(data?.combos?.length | 0) + Number(data?.works?.length | 0), 
          disabled: true, 
          onPress: () => navigation.navigate('Products', { store }) 
        },
        { 
          title: 'seguidores', 
          numbers: Number(data?.followers?.length), 
          disabled: data?.followers?.length === 0, 
          onPress: () => navigation.navigate('Followers', { store }) 
        },
        { 
          title: 'feedbacks', 
          numbers: Number(data?.feedbacks?.length), 
          disabled: data?.feedbacks?.length === 0, 
          onPress: () => navigation.navigate('Feedbacks', { store }) 
        },
      ]}
    />

  </View>
  )
}

const TabTop: React.FC<{ store: StoreDate }> = ({ store: data }) => {
  const rootNavigation = useRootNavigation()
  const { user, signed } = useContext(AuthContext)
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Store'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'Store'>>()
  const { store } = route.params
  
  const [follower, setFollower] = useState({ checked: false, loading: false })
  const following = !!data?.followers?.find(item => item?.user === user?._id)

  useEffect(() => {
    setFollower(state => ({ ...state, checked: following }))
  }, [setFollower, following])

  async function onFollower () {
    setFollower(state => ({ ...state, loading: true }))
    try {
      if (follower?.checked) {
        await FollowerService.remove({ store, id: user?._id })
        setFollower(state => ({ ...state, checked: false }))
      } else {
        await FollowerService.create({ store, body: {} })
        setFollower(state => ({ ...state, checked: true }))
      }
    } catch (err) {
    } finally { setFollower(state => ({ ...state, loading: false })) }
  }

  const [saved, setSaved] = useState({ checked: false, loading: false })

  useEffect(() => {
    (async () => {
      try {
        const response = await SavedService.find({ _id: data?._id, userId: user?._id })
        setSaved(state => ({ ...state, checked: !!response }))
      } catch (err) {}
    })()
  }, [setSaved, user, data])

  async function onSaved () {
    setSaved(state => ({ ...state, loading: true }))
    try {
      if (saved?.checked) {
        const response = await SavedService.remove({ _id: data?._id, userId: user?._id })
        setSaved(state => ({ ...state, checked: !response }))
      } else {
        const response = await SavedService.save({ params: { store: data?._id, _id: data?._id }, userId: user?._id })
        setSaved(state => ({ ...state, checked: !!response }))
      }
    } catch (err) {
    } finally { setSaved(state => ({ ...state, loading: false })) }
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

      {!!data?.self && <View style={{ flex: 1, padding: 10, paddingVertical: 5 }}>
        <ContainerButton border transparent
          title={'Editar Loja'}
          loading={false}
          onSubimit={() => rootNavigation.navigate('MakeStore', { id: data?._id })}
        />
      </View>}

      {!data?.self && !!signed && <View style={{ flex: 1, padding: 10 }}>
        <ContainerButton border transparent
          color={follower?.checked ? 'red' : colors.text}
          title={follower?.checked ? 'Deixar' : 'Seguir'}
          loading={follower?.loading}
          onSubimit={onFollower}
        />
      </View>}

      {!data?.self && <View style={{ flex: 1, padding: 10 }}>
        <ContainerButton border transparent
          title={'Feedback'}
          loading={false}
          onSubimit={() => navigation.navigate('NewFeedback', { store })}
        />
      </View>}
    
      {!data?.self && <IconButton style={{}}
        name={saved?.checked ? "bookmark" : "bookmark-border"}
        size={24}
        color={colors.text}
        onPress={onSaved}
      />}

    </View>

  )
}

export default Store;

