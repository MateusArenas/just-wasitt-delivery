import { useFocusEffect, useTheme } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, useWindowDimensions, ScrollView, Keyboard } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList, TabStoreMainParamList } from '../../types';
import useLoadScreen from '../../hooks/useLoadScreen';
import * as OrderService from '../../services/order';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Refresh from '../../components/Refresh';
import { ProductData } from '../../services/product';
import { useHeaderHeight } from '@react-navigation/stack';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { writePrice } from '../../utils';
import TextButton from '../../components/TextButton';

import pt from 'date-fns/locale/pt-BR'
import {
  parseISO,
  format,
  formatRelative,
  formatDistance,
  intervalToDuration,
  formatDuration,
  isValid,
  addDays
} from 'date-fns'

import { zonedTimeToUtc } from 'date-fns-tz'
// import { Container } from './styles';

export default function Order ({ 
  navigation,
  route,
} : DrawerScreenProps<RootStackParamList, 'Order'>) {
  const top = useHeaderHeight()
  const bottom = React.useContext(BottomTabBarHeightContext) || 0
  const rootNavigation = useRootNavigation()
  
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const { store, id } = route.params

  const { 
    disabled,
    loading,
    response,
    refreshing,
    onLoading,
    onRefresh,
    onService,
  } = useLoadScreen<OrderService.OrderData>(async () => await OrderService.search({ store, id }))
  React.useEffect(() => { onLoading() }, [])
  const data = response?.data[0]

  
  const [expireAt, setExpireAt] = React.useState('carregando...')
  const expiredDistance = React.useCallback(() => {   
    if (data?.createdAt !== null) {
      if (isValid(new Date(data?.createdAt))) {
        const start = zonedTimeToUtc(parseISO(new Date()?.toISOString()), 'America/Sao_Paulo')
        // const start = zonedTimeToUtc(parseISO(new Date()?.toISOString()), 'America/Sao_Paulo')
        const end = zonedTimeToUtc(parseISO(new Date(data?.createdAt)?.toISOString()), 'America/Sao_Paulo')
        // const end = zonedTimeToUtc(parseISO(addDays(new Date(data?.createdAt), 1)?.toISOString()), 'America/Sao_Paulo')
        setExpireAt(formatDistance(start, addDays(end, 1), { locale: pt }))
      }
    }
  }, [setExpireAt, data, pt])
  React.useEffect(() => {
    expiredDistance()
    const interval = setInterval(() => {
      expiredDistance()
    }, 10000);
    return () => clearInterval(interval);
  }, [expiredDistance])



  function priceOff(price: number, percents: Array<number> = []) {
    return price - (Math.max(...percents?.map(item => item / 100)) * price)
  }

  async function onSubmit () {
    try {
      await OrderService.update({ store, id, body: { ...data, expireAt: null } })
      Keyboard.dismiss()
      rootNavigation.refresh('Root')
      navigation.goBack()
    } catch (err) {}
  }

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {data?.expireAt !== null && 
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Concluir'}
            fontSize={14}
            color={colors.primary}
            onPress={onSubmit}
          />}
        </View>
      ),
    });
  }, [onSubmit, data]))

  if (loading) return <Loading />
  if (!response?.network) return <Refresh onPress={() => navigation.replace('Order', { store, id })}/>
  if (!response?.ok) return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}
      contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
      scrollIndicatorInsets={{ top, bottom }}
    >
        {data?.expireAt !== null && <TouchableOpacity onPress={() => {}}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.card, padding: 10,
            borderRadius: 4, marginBottom: 10
          }}>
            
            <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Expira em`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{expireAt}</Text>
              </View>

            </View>
            
          </View>
        </TouchableOpacity>}

      <TouchableOpacity onPress={() => navigation.navigate('Store', { store })}>
          <View style={{ 
            flex: 1, alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.card, padding: 10,
            borderRadius: 4, marginBottom: 10
          }}>
            <View style={{ borderRadius: 50, borderWidth: 2, borderColor: colors.primary }}>
              <MaterialIcons style={{ padding: 10 }}
                name="store"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ marginTop: 5, textAlign: 'center', color: colors.text, fontSize: 12 }}
              numberOfLines={1}>{data?.store?.name}</Text>

              <Text style={{ marginTop: 5, textAlign: 'center', color: colors.text, fontSize: 12 }}
              numberOfLines={1}>{data?._id}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Store', { store })}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.card, padding: 10,
            borderRadius: 4, marginBottom: 10
          }}>
            
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
              numberOfLines={1}>{`Nome`}</Text>

              <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
              numberOfLines={1}>{data?.name}</Text>
            </View>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
              numberOfLines={1}>{`Contato`}</Text>

              <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
              numberOfLines={1}>{data?.phoneNumber}</Text>
            </View>
            
          </View>
        </TouchableOpacity>

        {data?.bag?.bundles?.map(item => (
          <TouchableOpacity onPress={() => navigation.navigate('Product', { store, id: item?.product?._id })}>
            <View style={{ 
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: colors.card, padding: 10,
              borderRadius: 4, marginBottom: 10
            }}>
              <View style={{ borderRadius: 50, borderWidth: 2, borderColor: colors.primary }}>
                <MaterialIcons style={{ padding: 10 }}
                  name="local-offer"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`${item?.quantity}x - ${item?.product?.name}`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                  numberOfLines={1}
                  children={
                    `( ${
                      writePrice(
                        priceOff(item?.product?.price, item?.product?.promotions?.map(({ percent }) => percent))
                      )
                    } )`
                  }
                />
              </View>

              <View style={{ padding: 10 }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                  numberOfLines={1}
                  children={
                    `Total: ${
                      writePrice(
                        priceOff(item?.product?.price, item?.product?.promotions?.map(({ percent }) => percent)) * item?.quantity
                      )
                    } `
                  }
                />
              </View>

            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => {}}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.card, padding: 10,
            borderRadius: 4, marginBottom: 10
          }}>
            
            <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Subtotal`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{
                  data?.bag?.bundles?.map(({ product, quantity }) => 
                  priceOff(product?.price, product?.promotions?.map(({ percent }) => percent)) * quantity
                  )?.reduce((cur,acc) => cur+acc, 0)
                }</Text>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Entrega`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{
                  data?.deliveryPrice ? data?.deliveryPrice : 0
                }</Text>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Subtotal`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{
                  data?.bag?.bundles?.map(({ product, quantity }) => 
                  priceOff(product?.price, product?.promotions?.map(({ percent }) => percent)) * quantity
                  )?.reduce((cur,acc) => cur+acc, 0)
                }</Text>
              </View>
            </View>

            <View style={{ width: '100%', height: 1, backgroundColor: colors.border, borderRadius: 2 }} />

            <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ marginTop: 5, color: colors.text, fontSize: 14 }}
              numberOfLines={1}>{`Total`}</Text>

              <Text style={{ marginTop: 5, color: colors.text, fontSize: 14 }}
              numberOfLines={1}>{
                data?.bag?.bundles?.map(({ product, quantity }) => 
                  priceOff(product?.price, product?.promotions?.map(({ percent }) => percent)) * quantity
                )?.reduce((cur,acc) => cur+acc, 0) + (data?.deliveryPrice ? data?.deliveryPrice : 0)
              }</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.card, padding: 10,
            borderRadius: 4, marginBottom: 10
          }}>
            
            <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Forma de pagamento`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{
                  data?.paymentMoney ? 'Dinheiro' 
                  : data?.paymentDebt ? 'Debito'
                  : data?.paymentCredit ? 'Crédito'
                  : data?.paymentMealTicket ? 'Vale Refeição'
                  : 'Não Informado'
                }</Text>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Troco`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{
                  writePrice(data?.thingValue ? data?.thingValue : 0)
                }</Text>
              </View>

            </View>

          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.card, padding: 10,
            borderRadius: 4, marginBottom: 10
          }}>
            
            <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Rua`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{data?.street}</Text>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Número`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{data?.houseNumber}</Text>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Bairro`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{data?.district}</Text>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{`Cidade`}</Text>

                <Text style={{ marginTop: 5, color: colors.text, fontSize: 12 }}
                numberOfLines={1}>{data?.city}</Text>
              </View>

            </View>
            
          </View>
        </TouchableOpacity>

    </ScrollView>
  )
}
