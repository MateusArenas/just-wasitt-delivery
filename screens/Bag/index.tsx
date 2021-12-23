import { useFocusEffect } from '@react-navigation/core';
import { HeaderBackButton, HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View, Text, Image, TouchableOpacity } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList } from '../../types';
import * as BagService from '../../services/bag';
import * as StoreService from '../../services/store';
import IconButton from '../../components/IconButton';
import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
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
import { useSetSnackExtraBottomOffset, useSnackbar, useSnackbarHeight } from '../../hooks/useSnackbar';
import { useBag, useBundle } from '../../hooks/useBag';
import HeaderSubTitle from '../../components/HeaderSubTitle';
import useMediaQuery from '../../hooks/useMediaQuery';
import BottomHalfModalBoard from '../../components/BottomHalfModalBoard';
import BagTemplate from '../../templates/Bag';

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
  const [topExtraBottom, setTopExtraBottom] = React.useState(0)

  const [selecteds, setSelecteds] = React.useState([]);

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

  const [editMode, setEditMode] = React.useState(false)
  
  const { data, loading, missing, refreshing, onRefresh } = useBag(//select
    data => data?.find(item => (item?._id === store && item?.user === user?._id) )
  )

  const { onCreateBundle, onRemoveBundle , onUpdateBundle } = useBundle()

  useEffect(() => { setProducts(data?.bundles) } ,[data])
    
  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle onPress={() => navigation.navigate('Store', { store })}>{store}</HeaderSubTitle>
          <HeaderTitle {...props} >{"Sacola"}</HeaderTitle>
        </View>
      ,
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          <TextButton 
            label={'Avançar'}
            fontSize={18}
            color={colors.text}
            disabled={!data?.bundles?.length}
            onPress={() => navigation.navigate('Checkout', { store })}
          />
        </View>
      ),
    });
  }, [setEditMode, editMode, selecteds, data]))

  const snackbar = useSnackbar()

  async function onClear (selecteds: Array<string>) {
    try {
      const items = selecteds?.map(id => products?.find(item => item?._id === id))
      await Promise.all(selecteds.map(id => onRemoveBundle({ store, id, userId: user?._id })))
      setSelecteds([])
      setEditMode(false)
      snackbar?.open({
        visible: true,
        autoHidingTime: 5000,
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
        actionHide: true,
        actionHandler: () => onRestore(items),
        actionText: "DESFAZER",
        accentColor: colors.primary,
      })
    } catch (err) {}
  }
  
  const onUpdate = async (_item, quantity) => {
    try {
      await onUpdateBundle({ store, userId: user?._id}, {
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
        } )
    } catch (err) {}
  }
  
  const onRestore = async (items) => {//arrumar
    try {
      await Promise.all(items?.map(async item => {
        const body = ({
          ...item,
          product: item?.product?._id,
          store: item?.store?._id,
          components: item?.components?.map(byItem => ({
            ...byItem,
            product: byItem?.product?._id,
            components: item?.components?.map(subItem => ({
              ...subItem,
              product: subItem?.product?._id,
            }))
          })),
        })
        await onCreateBundle({  store, userId: user?._id }, body )
        return item
      })) 
    } catch (err) {}
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

  const totalQuantity = data?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0

  if (loading) return <Loading />
  // if (!response.network) return <Refresh onPress={() => navigation.replace('Bag')}/>
  if (missing) return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1, paddingBottom: bottom }}>
      <PullToRefreshView
        offset={top}
        disabled={editMode || loading || refreshing}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
          <BagTemplate store={store}
            data={data}
            onClear={onClear}
            onUpdate={onUpdate}
            editMode={editMode}
            onEditMode={setEditMode}
            extraBottom={extraBottom}
            handleProduct={params => navigation.navigate('Product', params)}
            handleStore={params => navigation.navigate('Store', params)}
            selecteds={selecteds}
            onSelecteds={setSelecteds}
            totalPrice={totalPrice}
          />
      </PullToRefreshView>
    </View>
  )
}

