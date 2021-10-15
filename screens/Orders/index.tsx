import { useFocusEffect, useTheme } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
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
import { MaskService } from 'react-native-masked-text';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { CollapsibleSubHeaderAnimator, useCollapsibleSubHeader } from 'react-navigation-collapsible';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import SearchBar from '../../components/SearchBar';

// import { Container } from './styles';

export default function Orders ({ 
  navigation,
  route,
} : DrawerScreenProps<RootStackParamList, 'Orders'>) {
  const top = useHeaderHeight()
  const bottom = React.useContext(BottomTabBarHeightContext) || 0
  
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const { store } = route.params

  const [name, setName] = React.useState('')

  const search = useDebounce(name, 250)

  const {
    onScroll,
    containerPaddingTop,
    scrollIndicatorInsetTop,
    translateY,
  } = useCollapsibleSubHeader()

  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [network, setNetwork] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [orders, setOrders] = React.useState<Array<OrderService.OrderData>>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { name: search, skip: (pageNumber-1)*5, limit: 5 }
      const response = await api.get(`/store/${store}/orders`, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))
      
      setOrders(state => 
        shouldRefresh ? response?.data
        : [...state, ...response?.data]
      )
      setNotFound(response?.data?.length > 0 ? false : true)
  
      setPage(pageNumber + 1)
    } catch ({ response }) {
      if (response?.status === 404) {
        setNotFound(true)
        setOrders([])
      }
      if (!response) setNetwork(false)
    } finally {
      setLoading(false)
    }
  }, [page, total, search, setPage, setOrders, setTotal, setNetwork, setNotFound, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    loadPage(1, true)
  }, [search])

  function priceOff(price: number, percents: Array<number> = []) {
    return price - (Math.max(...percents?.map(item => item / 100)) * price)
  }

  if (!network) return <Refresh onPress={() => navigation.replace('Orders', { store })}/>

  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        offset={containerPaddingTop-10}
        disabled={refreshing}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <FlatList   
          style={{ padding: 2 }}
          ListEmptyComponent={
            loading ? <Loading /> :
            notFound && <View style={{ 
              flex: 1, alignItems: 'center', justifyContent: 'center'
            }}>
              <Text style={{ 
                textAlign: 'center', textAlignVertical: 'center',
                fontSize: 18, 
                color: colors.text, opacity: .5,
              }}>{'Nenhum resultado'}</Text>
            </View>
          }
          ListFooterComponentStyle={{ padding: 20 }}
          ListFooterComponent={(loading && orders?.length > 0) && <Loading />}
          onEndReached={() => loadPage()}
          onEndReachedThreshold={0.1}
          onScroll={onScroll}
          contentContainerStyle={{ flexGrow: 1, paddingTop: containerPaddingTop, paddingBottom: bottom }}
          scrollIndicatorInsets={{ top: containerPaddingTop, bottom }}
          data={orders}
          renderItem={({ item } : { item: OrderService.OrderData }) => (
            <View style={{ width }}>
              <TouchableOpacity onPress={() => navigation.navigate('Order', { store, id: item?._id })}>
                <View style={{ 
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
                  padding: 10,
                }}>
                  <View style={{  borderRadius: 50, borderWidth: 2, borderColor: colors.primary }}>
                    <MaterialIcons style={{ padding: 10 }}
                      name="business"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
    
                  <View style={{ flex: 1, padding: 10 }}>
                    <Text style={{ color: colors.text, fontSize: 12 }}
                    numberOfLines={1}>{`${item?.name}`}</Text>
                    
                    <Text style={{ color: colors.text, fontSize: 12 }}
                    numberOfLines={1}>{`# ${item?._id}`}</Text>
    
                    {isValid(new Date(item?.createdAt)) && <Text style={{ color: colors.text, fontSize: 12, opacity: .5 }}
                    numberOfLines={1}>{
                      formatRelative(
                        zonedTimeToUtc(parseISO(new Date(item?.createdAt)?.toISOString()), 'America/Sao_Paulo'),
                        zonedTimeToUtc(parseISO(new Date()?.toISOString()), 'America/Sao_Paulo')
                      , { locale: pt })
                    }</Text>}
                  </View>
    
                  <View style={{ padding: 10, alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.text, fontSize: 12 }}
                    numberOfLines={1}>{
                      MaskService.toMask('money', item?.bag?.bundles?.map(({ product, quantity }) => 
                        priceOff(product?.price, product?.promotions?.map(({ percent }) => percent)) * quantity
                      )?.reduce((cur,acc) => cur+acc, 0) as unknown as string, 
                      {
                        precision: 2,
                        separator: ',',
                        delimiter: '.',
                        unit: 'R$ ',
                        suffixUnit: '' 
                      })
                    }</Text>
    
                    <Text style={{ color: colors.text, fontSize: 12, opacity: .5 }}
                    numberOfLines={1}>{'Pendente'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      </PullToRefreshView>
      <KeyboardSpacer topSpacing={-bottom} />
      <CollapsibleSubHeaderAnimator translateY={translateY}>
        <View style={{ padding: 20, marginTop: top }}>
          <SearchBar placeholder={'Buscar por nome de cliente'}
            value={name}
            onChangeText={setName}
          />
        </View>
      </CollapsibleSubHeaderAnimator>
    </View>
  )
}
