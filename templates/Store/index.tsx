import { StackNavigationOptions, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import IconButton from '../../components/IconButton';
import { RootStackParamList } from '../../types';
import useRootNavigation from '../../hooks/useRootNavigation';
import { NavigationProp, RouteProp, useFocusEffect, useIsFocused, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import {  View, Image, Text, useWindowDimensions, LayoutChangeEvent, TextInput, ScrollView, FlatList, TouchableWithoutFeedback, TouchableOpacity, Platform } from 'react-native';
import { StoreDate } from '../../services/store';
import ScrollableTabString from '../../components/ScrollableTabString';
import { CategoryData } from '../../services/category';
import ContainerButton from '../../components/ContainerButton';
import ProfileStatistic from '../../components/ProfileStatistic';
import AuthContext from '../../contexts/auth';
import { getDay } from 'date-fns';
import useStoreStatus from '../../hooks/useStoreStatus';
import Product from '../../models/Product';
import * as FollowerService from '../../services/follower';
import CardLink from '../../components/CardLink';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import useProductPrice from '../../hooks/useProductPrice';
import SnackBar from '../../components/SnackBar';
import { useSetSnackBottomOffset, useSetSnackExtraBottomOffset, useSnackbar, useSnackbarHeight } from '../../hooks/useSnackbar';
import { useBag } from '../../hooks/useBag';
import { useSaved } from '../../hooks/useSaved';
import { formatedMoney } from '../../utils';
import useMediaQuery from '../../hooks/useMediaQuery';
import { Hoverable, Pressable, } from 'react-native-web-hover'

interface StoreTemplateProps {
    store?: string
    data?: { store?: StoreDate }
    handleBag: (item: any) => any
    handleCategory: (item: any) => any
    handlePromotion: (item: any) => any
    handleProduct: (item: any) => any
    handleProducts: (item: any) => any
    handleOptions: () => any
}

const StoreTemplate = React.forwardRef<ScrollView, StoreTemplateProps>(({ 
  store,
  data,
  handleBag,
  handleProduct,
  handleProducts,
  handleCategory,
  handlePromotion,
  handleOptions,
  ...props
}, forwardRef) => {
  const ref = React.useRef<ScrollView>(null);
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)
  
  const { width } = useWindowDimensions()
  const { user, signed } = useContext(AuthContext)
  const { colors, dark } = useTheme();
  const [index, setIndex] = useState(0)

  React.useImperativeHandle(forwardRef, () => ref?.current, [ref]);

  const bagResponse = useBag(//select
    data => data?.find(item => (item?._id === store && item?.user === user?._id) )
  )
  
  const totalPrice = bagResponse.data?.bundles?.map(bundle => {
    return useProductPrice(bundle) * bundle?.quantity
  })?.reduce((acc, cur) => acc + cur, 0) 
  const totalQuantity = bagResponse.data?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0
  
  const setExtraBottomOffset = useSetSnackExtraBottomOffset()

  useFocusEffect(React.useCallback(() => {
    if (extraBottom) setExtraBottomOffset((extraBottom/2)+20)
    return function cleanup () {
      setExtraBottomOffset(0)
    }
  }, [setExtraBottomOffset, extraBottom]))

  const { isDesktop } = useMediaQuery()
  const web = Platform.OS === 'web';

  return (
    <View style={[{ flex: 1 }, web && { paddingTop: top, paddingBottom: bottom  }]} >
        <ScrollableTabString {...props}
          contentContainerStyle={[
            { marginTop: top, paddingBottom: top+bottom+extraBottom }, 
            { flexGrow: 1 },
            isDesktop && { paddingHorizontal: '10%' },
            web && { marginTop: 0, paddingBottom: extraBottom }
          ]}
          scrollIndicatorInsets={{ top, bottom }}
          headerTransitionWhenScroll={true}
          showsVerticalScrollIndicator
          scrollEventThrottle={16} 
          indexValue={index}
          onPressTab={(item, index, selected) => {
            setIndex(index)
            if (index === selected) {
              handleCategory({ store, slug: item?.slug })
            }
          }}
          isParent
          headerComponent={() => (
            <Main store={data?.store} 
                size={isDesktop ? 'large' : 'medium'} 
                isDescktop={isDesktop} 
                handleOptions={handleOptions}
            />
          )}
          dataSections={data?.store?.categories}
          dataTabs={data?.store?.categories}
          renderSection={(item: CategoryData & { key?: string, items?: StoreDate['promotions'] }, i) => (
            <View style={{ paddingTop: i===0 ? 10 : 0 }}>
              <CardLink style={{ 
                marginHorizontal: 10, 
                borderRadius: 4, borderWidth: 1, borderColor: colors.border,
                minHeight: 36
              }} border={false} 
                titleFontWeight={'500'}
                title={"# " +item.name}
                rightLabel={item?.products?.length}
                color={colors.text}
                onPress={() => handleCategory({ store: store, slug: item?.slug, })}
              />

              <FlatList scrollEnabled={false} style={[isDesktop && { paddingTop: 10 }]}
                data={item?.products}
                numColumns={isDesktop ? 3 : 1}
                renderItem={({ item: subItem }) => (
                    <View style={isDesktop && [{ width: '33.33%', padding: 10 }]}>
                        <Product horizontal reverse style={[
                            isDesktop && { 
                                borderWidth: 1, borderRadius: 4, borderColor: colors.border
                            }
                        ]}
                            store={store}
                            data={subItem}
                            height={120} 
                            onPress={() => handleProduct({ slug: subItem?.slug, store })}
                        />
                    </View>
                )}
              />
            </View>
          )}
          TabListHeaderComponent={
              <View style={{ paddingRight: 10 }}>
                  <IconButton style={{ padding: 10, alignItems: 'center' }}
                    name={'search'}
                    color={colors.text}
                    size={24}
                    onPress={() => handleProducts({ store })}
                  />
              </View>
          }
          tabNamesContainerStyle={[
              { margin: 10, paddingHorizontal: 10, borderRadius: 4, overflow: 'hidden' },
              { margin: 0, borderRadius: 0, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.background },
            //   isDesktop && { borderWidth: 1, borderColor: colors.border },
          ]}
          TabNamesContainer={({ style, ...more }) => 
            <View {...more} 
              style={[style]} 
            //   intensity={100} tint={dark ? 'dark' : 'light'} 
            />
          }
          // tabTopComponent={
          //   <View style={{ backgroundColor: colors.card, height: top, justifyContent: 'center' }}>
          //     <TabTop store={data}/>
          //   </View>
          // }
          
          renderTabName={({ item, index, selected, props: { style, onLayout, onPress } }) => (
            <Pressable onLayout={onLayout} style={({ hovered }) => [
                style, hovered && { backgroundColor: colors.border }
            ]}>
                <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={onPress} >
                  <View style={[{ 
                      flex: 1, alignItems: 'center', justifyContent: 'center', 
                      flexDirection: 'row', opacity: (selected===index) ? 1 : .5,
                  }]}>
                      <Text 
                      style={{ 
                          color: colors.text, padding: 10,
                          fontSize: 16, 
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          marginHorizontal: 2,
                      }}
                      >{item?.name}</Text>
                  </View>
              </TouchableOpacity>
            </Pressable>
          )}
          
          tabNamesContentContainerStyle={{ zIndex: 2, paddingRight: 10, minHeight: 36 }}
          selectedTabStyle={{ borderRadius: 4, borderWidth: 1, borderColor: colors.border }}
          unselectedTabStyle={{  }}
        />
        
        <SnackBar visible={!isDesktop}
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
          onPress={() => handleBag({ store })}
          actionText={`${totalQuantity}`}
          accentColor={colors.primary}
        />
    </View>
  )
})


const Main: React.FC<{ store: StoreDate} & { 
    onLayout?: (event: LayoutChangeEvent) => void 
    size?: "small" | "medium" | "large",
    isDescktop?: boolean
    handleOptions: () => any
}> = ({ store: data, onLayout, size, isDescktop=false, handleOptions }) => {
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Store'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'Store'>>()
  const store = route?.params?.store

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
  <View style={[{ flexGrow: 1 }, isDescktop && { paddingHorizontal: 30, paddingVertical: 30 }]}>

    <View style={[{ flexDirection: 'row' }]}>
        <View style={[{ padding: 10, paddingRight: 0 }, isDescktop && { flexGrow: 1, flexShrink: 1, flexBasis: 0, padding: 10 }]}>
            <View style={{ width: isDescktop ? 150 : 80, height: isDescktop ? 150 : 80, margin: 'auto', borderRadius: 200, overflow: 'hidden' }}>
                <TouchableOpacity style={{ width: '100%', height: '100%' }}>
                    <Image source={{ uri: 'data:image/png;base64,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' }} 
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    />
                </TouchableOpacity>
            </View>
        </View>

        <View style={[
            { flexGrow: 1, alignItems: 'center'}, 
            isDescktop && { flexBasis: 30, flexGrow: 2, flexShrink: 2, alignItems: 'flex-start' }
        ]}>

            {isDescktop && <View style={[
                { flexDirection: 'row', alignItems: 'center', flexShrink: 1, justifyContent: 'flex-start', width: '100%' },
            ]}>
                <Text numberOfLines={1} style={{ padding: 10, fontSize: isDescktop ? 28 : 18, fontWeight: '500', color: colors.text }}>{data?.name}</Text>
                <TabTop store={data}/>
                {/* <IconButton 
                    name={'more-horiz'}
                    size={24}
                    color={colors.text}
                    onPress={handleOptions}
                /> */}
            </View>}

            <ProfileStatistic style={{ flex: 1 }}
                itemContentContainerStyle={[{ padding: 0, paddingVertical: 10 }, isDescktop && { flexDirection: 'row', padding: 10 }]}
                contentContainerStyle={{ alignItems: 'center' }}
                data={[
                    { 
                    title: 'produtos', 
                    numbers: data?.products?.length,
                    // + Number(data?.works?.length | 0), 
                    disabled: false, 
                    onPress: () => navigation.navigate('Products', { store }) 
                    },
                    { 
                    title: 'seguidores', 
                    numbers: data?.followers?.length, 
                    disabled: data?.followers?.length === 0, 
                    onPress: () => navigation.navigate('Followers', { store }) 
                    },
                    { 
                    title: 'feedbacks', 
                    numbers: data?.feedbacks?.length, 
                    disabled: data?.feedbacks?.length === 0, 
                    onPress: () => navigation.navigate('Feedbacks', { store }) 
                    },
                ]}
            />

            {isDescktop && <View style={{ flex: 1 }}>
                <Text numberOfLines={4} style={[
                    { padding: 10, fontSize: 16, fontWeight: '500', color: colors.text, opacity: .8 }
                ]}>{data?.about}</Text>
            </View>}
        </View>
    </View>

    {/* {!isDescktop && <Text numberOfLines={1} style={[
        { padding: 10, fontSize: 18, fontWeight: 'bold', color: colors.text }
    ]}>{data?.name}</Text>} */}

    {!isDescktop && <View style={{ flex: 1, flexDirection: 'row' }}>    
        {!!data?.about && <Text numberOfLines={4} style={[
            { padding: 10, fontSize: 16, fontWeight: '500', color: colors.text, opacity: .8 }
        ]}>{data?.about}</Text>}
    </View>}
    {!isDescktop && <TabTop store={data}/>}

  </View>
  )
}

const TabTop: React.FC<{ store: StoreDate }> = ({ store: data }) => {
  const rootNavigation = useRootNavigation()
  const { user, signed } = useContext(AuthContext)
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Store'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'Store'>>()
  const store = route?.params?.store
  
  const [follower, setFollower] = useState({ checked: false, loading: false })
  const following = !!data?.followers?.find(item => item?.user?._id === user?._id)

  const { 
    data: saved, 
    onChangeSaved 
  } = useSaved(saveds => saveds?.find(item => item?._id === data?._id))

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

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

      {!!data?.self && <View style={{ flex: 1, padding: 10, paddingVertical: 10 }}>
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

      <View style={{ flex: 1, padding: 10, paddingVertical: 10 }}>
        <ContainerButton border transparent
          title={'Sobre'}
          loading={false}
          onSubimit={() => rootNavigation.navigate('StoreInfo', { store })}
        />
      </View>
      
    
      {!data?.self && <IconButton style={{}}
        name={saved ? "bookmark" : "bookmark-border"}
        size={24}
        color={colors.text}
        onPress={() => onChangeSaved({ store: data?._id, _id: data?._id })}
      />}

    </View>

  )
}

export default StoreTemplate;

