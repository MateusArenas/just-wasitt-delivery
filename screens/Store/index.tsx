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
import { HeaderStore, HeaderStoreMain } from './Header';
import { getDay } from 'date-fns';
import useStoreStatus from '../../hooks/useStoreStatus';
import Product from '../../models/Product';
import * as StoreService from '../../services/store';
import * as FollowerService from '../../services/follower';
import * as SavedService from '../../services/saved';
import CardLink from '../../components/CardLink';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import { MaskService } from 'react-native-masked-text';

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
  
  const ServiceCart = useService<BagService.bagData>(BagService, 'search', { id: store, userId: user?._id }, [user])
  useFocusEffect(useCallback(() => { ServiceCart.onService('search', { id: store, userId: user?._id }) }, [user]))
  const totalPrice = ServiceCart?.response?.data[0]?.bundles?.map(({ product, quantity }) => 
    ( product?.price - 
      (
        (Math.max(...product?.promotions?.map(item => item?.percent), 0) / 100 )
        * product?.price
      )
    ) * quantity
  )?.reduce((acc, cur) => acc + cur, 0) 
  const totalQuantity = ServiceCart?.response?.data[0]?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0

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

  const Options = HeaderStore({ navigation, route })
  const OptionsMain = HeaderStoreMain({ navigation, route }) 

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions(!!data?.self ? OptionsMain : Options);
  }, [data]))

  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      // headerTitle: ({ tintColor, children }) => (
      //   <IconButton style={{ padding: 0 }}
      //     label={children} 
      //     name="expand-more" color={colors.text} size={24}
      //     onPress={() => BottomHalfModal.show(modalize => 
      //       <FlatList 
      //         data={data?.otherStores?.map(({ _id, name: store }) => ({
      //           key: _id,
      //           color: colors.text,
      //           title: store,
      //           onPress: () => navigation.replace('Store', { store })
      //         })) || []}
      //         keyExtractor={(item, index) => `${item?.key}-${index}`}
      //         renderItem={({ item }) => 
      //           <CardLink 
      //             title={item?.title}
      //             color={item?.color}
      //             onPress={item?.onPress}
      //             onPressed={modalize?.current?.close}
      //           />
      //         }
      //         ListFooterComponent={
      //           <View>
      //             {!!data?.self && 
      //               <CardLink 
      //                 title={'Criar Loja'}
      //                 color={colors.primary}
      //                 onPress={() => rootNavigation.navigate('NewStore')}
      //                 onPressed={modalize?.current?.close}
      //               />
      //             }
      //           </View>
      //         }
      //       />
      //     )} 
      //   />
      // )
    });
  }, [navigation, data, user, BottomHalfModal]))

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

      {(ServiceCart?.response?.data?.length > 0 && totalPrice) && 
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
              MaskService.toMask('money', totalPrice as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              })
            }
            color={colors.text}
            rightLabel={totalQuantity}
            onPress={() => navigation.navigate('Bag', { store })}
          />
        </BlurView>
      </View>}
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

    <SwiperFlatList horizontal
      style={{ backgroundColor: colors.card }}
      nestedScrollEnabled
      PaginationComponent={() => null}
      index={0}
      showPagination
      data={data?.promotions}
      // data={[{ uri: 'https://i.pinimg.com/originals/44/10/b3/4410b3605284deaed85c4e89ab2f4b5c.jpg' }, { uri: 'https://i.pinimg.com/originals/40/21/73/402173fd8d2200ec9c808dd28fee757d.jpg' }]}
      renderItem={({ item }) => 
        <TouchableOpacity onPress={() => navigation.navigate('Promotion', { store, id: item?._id })}>
          <View style={{ 
            width: width-20, height: 160, 
            padding: 10, paddingRight: 5, paddingBottom: 0,
            marginVertical: 10, marginBottom: 0, 
          }}>
            <Image style={{ 
              width: '100%', height: '100%',
              backgroundColor: colors.background, borderRadius: 4, 
            }}
              source={{ uri: item?.uri ? item?.uri : 'https://i.pinimg.com/originals/44/10/b3/4410b3605284deaed85c4e89ab2f4b5c.jpg' }}
            />
          </View>
        </TouchableOpacity>
      }
    />

    <ProfileCard style={{ padding: 0 }}
      uri={data?.uri}
      statusColor={isOpen ? colors.primary : 'red'}
      status={isOpen ? 'ABERTO' : 'FECHADO'}
      title={`${data?.city} - ${data?.state}`}
      about={data?.about}
      onPress={() => rootNavigation.navigate('StoreInfo', { store })}
    />
    <ProfileStatistic 
      data={[
        { 
          title: 'produtos', 
          numbers: Number(data?.products?.length), 
          disabled: data?.products?.length === 0, 
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

