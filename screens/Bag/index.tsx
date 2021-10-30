import { useFocusEffect } from '@react-navigation/core';
import { HeaderBackButton, HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View, Text, Image, TouchableOpacity } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList } from '../../types';
import * as BagService from '../../services/bag';
import * as BundleService from '../../services/bundle';
import * as StoreService from '../../services/store';
import * as ProductService from '../../services/product';
import IconButton from '../../components/IconButton';
import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import RadioButton from '../../components/RadioButton';
import useSteeps from '../../hooks/useSteeps'
import useService from '../../hooks/useService';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import Card from '../../components/Card';
import InputCount from '../../components/InputCount';
import { useDebounceHandler, useDebounceState } from '../../hooks/useDebounce';
import { writeAndress, writePrice } from '../../utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextInputLabel from '../../components/TextInputLabel';
import AuthContext from '../../contexts/auth';
import CustomTopTabBar from '../../components/CustomTopTabBar';
import { TabView } from 'react-native-tab-view';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import usePersistedState from '../../hooks/usePersistedState';
import { MaterialIcons } from '@expo/vector-icons';
import InputCheck from '../../components/InputCheck';
import useOrder from '../../hooks/useOrder';
import { ScrollView } from 'react-native-gesture-handler';
import ContainerButton from '../../components/ContainerButton';
import TextButton from '../../components/TextButton';
import { userAndressData } from '../../services/auth';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import CardLink from '../../components/CardLink';
import useLoadScreen from '../../hooks/useLoadScreen';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaskService } from 'react-native-masked-text';
import useProductPrice from '../../hooks/useProductPrice';
import ProductCard from '../../components/ProductCard';
import SnackBarContext from '../../contexts/snackbar';
import SnackBar from '../../components/SnackBar';
import { setSnackExtraBottomOffset, useSnackbar, useSnackbarHeight } from '../../hooks/useSnackbar';


const initialState = { 
  selecteds: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'init':
      return { ...state, ...action?.payload };
    case 'select':
      return { ...state, 
        selecteds: state?.selecteds?.find(id => action?.payload === id) 
        ? state?.selecteds?.filter(id => action?.payload !== id) 
        : [ ...state?.selecteds, action?.payload ]
      };
    case 'setSelecteds':
      return { ...state, selecteds: action?.payload };
    default:
      throw new Error();
  }
}

export interface BagState {
  name?: string
  phoneNumber?: string
  andress?: userAndressData
  delivery: 'pickup' | 'delivery'
  payment: 'money' | 'debt' | 'credit' | 'mealTicket'
  thing: boolean
  money: number
}
export default function Bag({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Bag'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)

  const [{ selecteds }, dispatch] = React.useReducer(reducer, initialState);

  const { signed, andress, phoneNumber, user } = useContext(AuthContext)
  const { colors, dark } = useTheme()
  const { store } = route.params
  const layout = useWindowDimensions()
  const [products, setProducts] = useState<BagService.bagData['bundles']>([])
  const key = `local-${store}-bag-wasit.2.1`
  const [state, setState] = usePersistedState<BagState>(key,{ 
    delivery: 'pickup', 
    payment: 'money', 
    thing: false,
    money: 0,
  })

  const SnackBarRef = useRef(null)

  const rootNavigation = useRootNavigation()
  const [editMode, setEditMode] = React.useState(false)
  
  const { 
    disabled,
    loading,
    response,
    refreshing,
    onLoading,
    onRefresh,
    onService,
  } = useLoadScreen<BagService.bagData>(async () => await BagService.search({ id: store, userId: user?._id }))
  useEffect(() => { if(!!user) onLoading() }, [user])
  const data: BagService.bagData = response?.data[0]

  useEffect(() => { setProducts(data?.bundles) } ,[response, setProducts])

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useEffect(() => {
    if (loading) setEditMode(false)
  }, [loading])


  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <HeaderTitle {...props}
          children={
            (editMode && selecteds?.length) ?  
              selecteds?.length === 1 ? `${selecteds?.length} item selecionado` 
              : `${selecteds?.length} items selecionados` 
            : props.children
          }
        />
      ,
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          {data?.bundles?.length > 0 &&
          <TextButton 
            label={editMode ? (selecteds.length > 0)? 'Fazer' : 'Tudo' : 'Editar'}
            fontSize={18}
            color={colors.primary}
            onPress={() => (editMode && selecteds.length === 0) ? 
              dispatch({type: 'setSelecteds', payload: data?.bundles?.map(item => item?._id) })
              : setEditMode(true)
            }
            onPressed={() => (editMode && selecteds.length > 0) &&  BottomHalfModal.show(modalize => 
              <FlatList 
              data={[]}
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={(item, index) => `${item?.key}-${index}`}
              renderItem={({ item, index }) => 
                <CardLink style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius: index === 0 ? 10 : 0, borderBottomRightRadius: index === 0 ? 10 : 0,
                    marginTop: index === 0 ? 10 : 0, marginBottom: index === 0 ? 10 : 0,
                    marginHorizontal: 10,
                  }}
                  border={index !== 0}
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
                    title={'Remover'}
                    right={
                      <MaterialIcons style={{ padding: 20 }}
                        name={'delete'}
                        size={24}
                        color={colors.notification}
                      />
                    }
                    color={colors.notification}
                    onPress={() => onClear(selecteds)}
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
          />}
        </View>
      ),
      headerLeft: props => editMode 
      ? <HeaderBackButton {...props} label={'Sair'} onPress={() => {
          setEditMode(false)
          dispatch({type: 'setSelecteds', payload: [] })
        }}/> 
      : props.canGoBack && <HeaderBackButton {...props} />,
    });
  }, [setEditMode, editMode, selecteds, response]))

  const snackbar = useSnackbar()
  const snackbarHeight = useSnackbarHeight()

  async function onClear (selecteds: Array<string>) {
    try {
      selecteds.map(onRemove)
      dispatch({type: 'setSelecteds', payload: [] })
      setEditMode(false)
      snackbar?.open({
        visible: true,
        autoHidingTime: 10000,
        messageColor: colors.text,
        position: "bottom",
        badge: selecteds?.map(id => 
          data?.bundles?.find(item => item?._id === id)?.quantity
        )?.reduce((acc, val) => acc+val, 0),
        badgeColor: 'white',
        badgeBackgroundColor: colors.notification,
        textMessage: selecteds?.map(id => {
          const find = data?.bundles?.find(item => item?._id === id)
          return `${find?.product?.name}`
        })?.join(', '),
        textSubMessage: !data?.store?.minDeliveryBuyValue ? undefined : (" / " + 
        MaskService.toMask('money', data?.store?.minDeliveryBuyValue as unknown as string, {
          precision: 2,
          separator: ',',
          delimiter: '.',
          unit: 'R$ ',
          suffixUnit: ''
        })),
        // onClose: () => setActionItems([]),
        actionHide: true,
        actionHandler: () => onBulkCreate(selecteds),
        actionText: "DESFAZER",
        accentColor: colors.primary,
      })
    } catch (err) {}
  }



  async function onRemove (_id :string ) {
    try {
      await onService(async () => {
        try {
          await BundleService.remove({ store, id: _id, userId: user?._id })
          const bundles = data?.bundles?.filter(item => item?._id !== _id)
          return [{ ...data, bundles }]
        } catch (err) {}
      }, true)
      // rootNavigation.refresh('Root')
    } catch (err) {}
  }

  
  const onUpdate = (_item, quantity) => onService(async () => {
    try {
      await BundleService.update({ store, userId: user?._id, body: {
        ..._item,
        quantity,
        product: _item?.product?._id,
        components: _item?.components?.map(byItem => ({
          ...byItem,
          product: byItem?.product?._id,
          components: byItem?.components?.map(subItem => ({
            ...subItem,
            product: subItem?.product?._id,
          }))
        }))
      } })
      const bundles = data?.bundles?.map(item => item?._id === _item?._id ? ({..._item, quantity}) : item)

      return [{ ...data, bundles }]
    } catch (err) {}
  }, true)

  async function onBulkCreate (items) {
    
    const bundles = await Promise.all(items?.map(async item => {

      const find = data?.bundles?.find(_item => _item?._id === item)
      const body = ({
        ...find,
        product: find?.product?._id,
        store: find?.store?._id,
        components: find?.components?.map(byItem => ({
          ...byItem,
          product: byItem?.product?._id,
          components: find?.components?.map(subItem => ({
            ...subItem,
            product: subItem?.product?._id,
          }))
        })),
      })

      await BundleService.create({  store, userId: user?._id, body })

      return find
    })) 
    onRefresh()
  }

  useEffect(() => { 
    if(user) {
      setState(state => 
        ({...state, 
          name: user?.name ? user?.name : '', 
          phoneNumber: user?.phoneNumber, 
          andress: {
            ceep: user?.ceep,
            state: user?.state,
            city: user?.city,
            street: user?.street,
            houseNumber: user?.houseNumber,
            district: user?.district,
            complement: user?.complement,
          }
        })
      ) 
    }
  } ,[user, setState])

  const totalPrice = products?.map(item => useProductPrice(item) * item?.quantity)?.reduce((acc, cur) => acc + cur, 0)

  const setExtraBottomOffset = setSnackExtraBottomOffset()

  useFocusEffect(React.useCallback(() => {
    if (extraBottom) setExtraBottomOffset(extraBottom+20)
    return function cleanup () {
      setExtraBottomOffset(0)
    }
  }, [setExtraBottomOffset, extraBottom]))

  // useFocusEffect(useCallback(() => {
  //   Snackbar?.open({
  //     visible: true,
  //     messageColor: colors.text,
  //     position: "bottom",
  //     icon: 'shopping-bag',
  //     iconColor: colors.text,
  //     textDirection: 'row',
  //     textMessage: formatedMoney(totalPrice),
  //     textSubMessage: !data?.store?.minDeliveryBuyValue ? undefined : (" / " + 
  //     formatedMoney(data?.store?.minDeliveryBuyValue)),
  //     actionHandler: () => navigation.navigate('Checkout', { store }),
  //     actionText: "AVANÇAR",
  //     accentColor: colors.primary,
  //   })
  //   return () => Snackbar?.close()
  // }, [totalPrice]))

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
  if (!response.network) return <Refresh onPress={() => navigation.replace('Bag')}/>
  if (!response.ok) return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1, paddingBottom: bottom }}>
      <PullToRefreshView
        offset={top}
        disabled={editMode || disabled}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
          <FlatList style={{ flex: 1 }}
            contentContainerStyle={[
              { flexGrow: 1, backgroundColor: colors.card },
              { marginTop: top, paddingBottom: bottom+snackbarHeight },
            ]}
            scrollIndicatorInsets={{ top, bottom: bottom+snackbarHeight }}
            ListEmptyComponent={
              <View style={{ padding: 10,flex: 1, width: '100%'  }}>
                  <ContainerButton border transparent
                    title={'Adicionar items'}
                    loading={false}
                    onSubimit={() => navigation.navigate('Store', { store })}
                  />
              </View>
            }
            ListHeaderComponentStyle={{ width: '100%' }}
            ListHeaderComponent={
              <View style={{ 
                padding: 10,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <TextButton 
                  label={'Compartilhar'}
                  color={colors.text}
                  fontSize={16}
                  onPress={() => navigation.navigate('Store', { store })}
                />
                <TextButton 
                  label={'Adicionar'}
                  color={colors.text}
                  fontSize={16}
                  onPress={() => navigation.navigate('Store', { store })}
                />
              </View>
            }            
            ListFooterComponentStyle={{ flex: 1 }}
            ListFooterComponent={
              <TouchableOpacity disabled={!editMode} 
                onPress={() => setEditMode(false)} 
                style={{ flex: 1 }}
              />
            }
            data={data?.bundles}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item }) => (
                  <View>
                    <TouchableOpacity disabled={!editMode} onPress={() => dispatch({type: 'select', payload: item?._id })}>
                      <View style={[
                        { flexDirection: 'row', alignItems: 'center' },
                        { backgroundColor: (selecteds?.find(id => id === item?._id) && editMode) ? colors?.border : 'transparent'}
                      ]}>
                        {editMode && <IconButton 
                          name={!!selecteds?.find(id => id === item?._id) ? 'check-circle-outline' : 'circle'}
                          size={24}
                          color={!!selecteds?.find(id => id === item?._id) ? colors.primary : colors.border}
                          onPress={() => dispatch({type: 'select', payload: item?._id })}
                        />}

                        <ProductCard
                          disabled={editMode}
                          uri={item?.product?.uri}
                          name={item?.product?.name}
                          about={item?.comment}
                          price={useProductPrice(item)}
                          subPrice={useProductPrice(item, true)}
                          count={item?.quantity}
                          onChangeCount={quantity => onUpdate(item, quantity)}
                          onContentPress={() => navigation.navigate('Product', { store, id: item?.product?._id })}
                          onImagePress={() => navigation.navigate('Product', { store, id: item?.product?._id })}
                        /> 

                      </View>
                    </TouchableOpacity>
                    {item?.quantity > 0 &&
                    <View style={{ paddingLeft: 30 }}>
                      {item?.components.map(byItem => (
                        <View style={{ paddingLeft: 20 }}>
                          <MaterialIcons style={{ position: 'absolute', padding: 10 }}
                            name={'subdirectory-arrow-right'} 
                            size={24} color={colors.text} 
                          />
                          <ProductCard minimize 
                            maxCount={byItem?.product?.spinOff ? 1 : 99}
                            name={byItem?.product?.name}
                            about={byItem?.components?.map((subItem,index) => 
                              `+ (${subItem?.quantity}) ${subItem?.product?.name} ${(index !== byItem?.components?.length-1) ? '\n' : ''}`
                            )?.reduce((acc, cur) => acc + cur, '')}
                            price={useProductPrice(byItem)}
                            subPrice={useProductPrice(byItem, true)}
                            onContentPress={() => navigation.navigate('Product', { store, id: item?.product?._id })}
                            onChangeCount={quantity => onUpdate({...item, 
                              components: item?.components?.map(_item => 
                                (_item?.product?._id !== byItem?.product?._id) ? _item 
                                : { ..._item, quantity }
                              ),
                            }, item?.quantity)}
                            count={byItem?.quantity}
                          />
                        </View> 
                      ))}
                    </View>}
                  </View>
            )}
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
        actionHandler={() => navigation.navigate('Checkout', { store })}
        actionText={"AVANÇAR"}
        accentColor={colors.primary}
      />
      
      {/* <View style={{ position: 'absolute', bottom,  width: '100%', padding: '5%' }} 
        onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
      >
        <BlurView style={{ width: '100%', borderRadius: 4, overflow: 'hidden' }} 
          intensity={100} tint={dark ? 'dark' : 'light'}
        >
          <CardLink titleDirection={'row'} border={false}
            tintColor={colors.primary}
            color={colors.text}
            title={
              totalPrice ? MaskService.toMask('money', totalPrice as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }) : 'xxx'
            }
            subTitle={!data?.store?.minDeliveryBuyValue ? undefined : (" / " + 
              MaskService.toMask('money', data?.store?.minDeliveryBuyValue as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }))
            }
            left={
              <MaterialIcons style={{ padding: 10 }} name={'shopping-bag'} size={24} color={colors.text} />
            }
            rightLabel={'Fazer pedido'}
            onPress={() => navigation.navigate('Checkout', { store })}
          />
        </BlurView>
      </View> */}
    </View>
  )
}

