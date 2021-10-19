import { useFocusEffect } from '@react-navigation/core';
import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList } from '../../types';
import * as BagService from '../../services/bag';
import * as OrderService from '../../services/order';
import * as StoreService from '../../services/store';
import * as ProductService from '../../services/product';
import IconButton from '../../components/IconButton';
import { NavigationProp, RouteProp, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import RadioButton from '../../components/RadioButton';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import { useDebounceHandler, useDebounceState } from '../../hooks/useDebounce';
import SnackBar from '../../components/SnackBar'
import { writeAndress, writePrice } from '../../utils';
import TextInputLabel from '../../components/TextInputLabel';
import AuthContext from '../../contexts/auth';
import CustomTopTabBar from '../../components/CustomTopTabBar';
import { TabView } from 'react-native-tab-view';
import usePersistedState from '../../hooks/usePersistedState';
import { MaterialIcons } from '@expo/vector-icons';
import InputCheck from '../../components/InputCheck';
import useOrder from '../../hooks/useOrder';
import { ScrollView } from 'react-native-gesture-handler';
import { userAndressData } from '../../services/auth';
import AndressContext from '../../contexts/andress';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import CardLink from '../../components/CardLink';
import { MaskService } from 'react-native-masked-text';
import useLoadScreen from '../../hooks/useLoadScreen';
import api from '../../services/api';
import { OrderData } from '../../services/order';

export default function Checkout({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Checkout'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)

  const { signed, phoneNumber, user } = useContext(AuthContext)
  
  const { colors, dark } = useTheme()
  const { store } = route.params
  const layout = useWindowDimensions()
  const [products, setProducts] = useState<BagService.bagData['bundles']>([])
  const key = `local-${store}-bag-wasit.2.1`
  const [state, setState] = usePersistedState<OrderData>(key,{ 
    pickup: true, 
    paymentMoney: true, 
    thing: false,
    thingValue: 0,
  } as OrderData)

  const [totalPrice, setTotalPrice] = React.useState<number>(0)
  const [deliveryPrice, setDeliveyPrice] = React.useState<number>(0)

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

  useEffect(() => { 
    if(user) {
      setState(state => 
        ({...state, 
          store: data?.store?._id,
          bag: {
            _id: data?._id,
            store: data?.store?._id,          
            user: user?._id,
            bundles: data?.bundles?.map(item => ({
              _id: item?._id,
              product: item?.product,
              store: item?.store?._id,
              user: user?._id,
              quantity: item?.quantity,
              comment: item?.comment,
            }))
          },
          name: user?.name ? user?.name : '', 
          phoneNumber: user?.phoneNumber, 
          ceep: user?.ceep,
          state: user?.state,
          city: user?.city,
          street: user?.street,
          houseNumber: user?.houseNumber,
          district: user?.district,
          complement: user?.complement,
        })
      ) 
    }
  } ,[data, user, setState])

  useEffect(() => { setProducts(data?.bundles) } ,[data, setProducts])

  const minDeliveryBuyValue = data?.store?.minDeliveryBuyValue | 0

  
  useEffect(() => {
    setTotalPrice(
      products?.map(item => 
        (
          item.product?.price - 
          (
            (Math.max(...item?.product?.promotions?.map(item => item?.percent), 0) / 100 )
            * item.product?.price
          )
        ) * item.quantity)?.reduce((acc, cur) => acc + cur, 0)
    )
  } ,[setTotalPrice, products])
          
  const onSubimit = async () => {
    try {
      const { data } = await OrderService.create({ store, body: state })
      const order = useOrder(state)
      Linking.canOpenURL(`whatsapp://send?text=${order}`).then(supported => {
        if (supported) {
          return Linking.openURL(
            `whatsapp://send?phone=${'5511982262837'}&text=${order}`
          );
        } else {
          return Linking.openURL(
            `https://api.whatsapp.com/send?phone=${'5511982262837'}&text=${order}`
          );
        }
      })
    } catch(err) {
      console.log(err);
    }
  }

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerStyle: { elevation: 0, shadowColor: 'transparent', borderBottomWidth: null },
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row' }}>
         <IconButton
          name="store"
          size={24}
          color={colors.text}
          onPress={() => navigation.navigate('Store', { store })}        
         />
         <IconButton 
          name="more-vert"
          size={24}
          color={colors.text}
          onPress={() => {}}        
         />
        </View>
      ),
    });
  }, [onSubimit, state, response, totalPrice]))

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'delivery', title: 'Entrega' },
    { key: 'payment', title: 'Pagamento' },
  ])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'delivery':
        return <CheckoutRoute setDeliveyPrice={setDeliveyPrice} data={data?.store} state={state} onChangeState={setState} />
      case 'payment':
        return <SenderRoute data={data?.store} state={state} onChangeState={setState} />
      default:
        return null;
    }
  }, [state, setState, setProducts, response])

  if (loading ) return <Loading />
  if (!response.network) return <Refresh onPress={() => navigation.replace('Checkout', { store })}/>
  if (!response.ok) return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => <CustomTopTabBar {...props}/>}
      />
      <View style={{ position: 'absolute', bottom,  width: '100%', padding: '5%' }} 
        onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
      >
        <BlurView style={{ width: '100%', borderRadius: 4, overflow: 'hidden' }}
          intensity={100} tint={dark ? 'dark' : 'light'}
        >
          <CardLink titleDirection={'row'} border={false}
            tintColor={colors.primary}
            color={colors.text}
            title={
              totalPrice ? MaskService.toMask('money', (totalPrice + (deliveryPrice | 0)) as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }) : 'xxx'
            }
            subTitle={!minDeliveryBuyValue ? undefined : (" / " + 
              MaskService.toMask('money', (minDeliveryBuyValue | 0) as unknown as string, {
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
            rightLabel={'Enviar pedido'}
            onPress={onSubimit}
          />
        </BlurView>
      </View>
    </View>
  )
}

const CheckoutRoute: React.FC<{
  data: StoreService.StoreDate
  state: any
  onChangeState: (state: any) => any
  setDeliveyPrice: React.Dispatch<React.SetStateAction<number>>
}> = ({
  state, onChangeState, data, setDeliveyPrice
}) => {
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)
  
  const { andress, andresses, selected, selectIn } = useContext(AndressContext)

  const route = useRoute<RouteProp<RootStackParamList, 'Bag'>>()
  const { store } = route.params
  const { colors } = useTheme()
  const { phoneNumber, setPhoneNumber, setName,signed, user } = useContext(AuthContext)
  const rootNavigation = useRootNavigation()
  const radioData = Object.values(Object.assign(
    !!data?.pickup && {
      0: { 
        label: 'Retirada', 
        key: 'pickup',
        about: 'Confira o nosso endereço em...', 
        value: 0 
      }
    },
    !!data?.delivery && {
      1: { 
        label: 'Entrega', 
        key: 'delivery',
        about: [
          !!data?.deliveryPrice ? `+ ${writePrice(data?.deliveryPrice)}` : '',
          !!data?.deliveryAbout ? data?.deliveryAbout : ''
        ].join('\n'),
        value: data?.deliveryPrice
      }
    }
  ))

  useEffect(() => {
    const deliveryPrice = radioData[radioData?.findIndex(item => state[item?.key])]?.value
    setDeliveyPrice(deliveryPrice ? deliveryPrice : 0)
  } ,[setDeliveyPrice, state])

  return (
    <ScrollView focusable 
      style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      contentContainerStyle={{ paddingBottom: bottom+extraBottom }}
    >
      <TextInputLabel 
        label={'Name*'}
        color={colors.text} 
        placeholder="Name" 
        value={state?.name} 
        onChangeText={name => {
          onChangeState({...state, name })
          if (!signed) setName(name)
        }}
      />
      <RadioButton 
        data={radioData}
        index={radioData?.findIndex(item => state[item?.key])}
        onChangeIndex={index => onChangeState({...state, ...{ pickup: false, delivery: false }, [radioData[index]?.key]: true })}
        // activeIcon={'check'}
        // deactiveIcon={'check-box-outline-blank'}
      />
      {state?.delivery && <TextInputLabel type={'fake'}
        onFocus={() => rootNavigation.navigate('Andress', { id: andress?._id })}
        label={'Endereço*'}
        color={colors.text} 
        placeholder="Endereço" 
        value={selected ? writeAndress(andress) : 'Selecionar endereço'} 
        onChangeText={() => {}}
      />}
      {state?.delivery && <TextInputLabel 
        type={'cel-phone'}
        label={'Telefone*'}
        color={colors.text} 
        placeholder="Telefone" 
        value={state?.phoneNumber} 
        onChangeText={phoneNumber => {
          onChangeState({...state, phoneNumber })
          if (!signed) setPhoneNumber(phoneNumber)
        }}
      />}
    </ScrollView>
  )
}


const SenderRoute: React.FC<{
  data: StoreService.StoreDate
  state: any
  onChangeState: (state: any) => any
}> = ({
  state, onChangeState, data
}) => {
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)

  const { setName, signed } = useContext(AuthContext)
  const { colors } = useTheme()
  const radioData: Array<any> = Object.values(Object.assign(
    {},
    !!data?.paymentMoney && { 0: 
      { 
        label: 'Dinheiro',
        key: 'paymentMoney', 
        expandComponent: (
          <>
            <InputCheck 
              label="Troco"
              check={state?.thing}
              onPress={() => onChangeState({...state, thing: !state?.thing })}
            />
            {state?.thing && <TextInputLabel 
              type={'money'}
              includeRawValueInChangeText={true}
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }}
              label={'Troco para*'}
              color={colors.text} 
              placeholder="Troco para..." 
              value={state?.thingValue as any} 
              onChangeText={(_, rawText) => onChangeState({...state, thingValue: Number(rawText) })}
            />}
          </>
        )
      } 
    },
    !!data?.paymentMealTicket && { 1: { label: 'Vale alimentação', key: 'paymentMealTicket' } },
    !!data?.paymentDebt && { 2: { label: 'Débito', key: 'paymentDebt' } }, 
    !!data?.paymentCredit && { 3: { label: 'Crédito', key: 'paymentCredit' } },
  ))
  

  return (
    <ScrollView focusable 
      style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      contentContainerStyle={{ paddingBottom: bottom+extraBottom }}
    >
      <RadioButton 
        data={radioData}
        index={radioData?.findIndex(item => state[item?.key])}
        onChangeIndex={index => onChangeState({
          ...state, 
          ...{
            paymentMoney: false,
            paymentMealTicket: false,
            paymentDebt: false,
            paymentCredit: false
          },
          [radioData[index]?.key]: true
        })}
      />
    </ScrollView>
  )
}
