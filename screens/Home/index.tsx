import { useFocusEffect, useScrollToTop, useTheme } from '@react-navigation/native';
import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableWithoutFeedback,TouchableOpacity, Image, useWindowDimensions, SafeAreaView, ScrollView, FlatList } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList, TabHomeParamList } from '../../types';
import { useCollapsibleHeader, UseCollapsibleOptions } from 'react-navigation-collapsible';
import useUri from '../../hooks/useUri';
import IconButton from '../../components/IconButton';
import ContainerButton from '../../components/ContainerButton';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import useService from '../../hooks/useService';
import { AxiosError, AxiosResponse } from 'axios';
import { Pagination, SwiperFlatList } from 'react-native-swiper-flatlist';
import { writeAndress, writePrice } from '../../utils'
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import { ProductData } from '../../services/product';
import { StoreDate } from '../../services/store';
import * as Cart from '../../services/cart'
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Post from '../../models/Post';
import CardLink from '../../components/CardLink';
import Product from '../../models/Product';
import AuthContext from '../../contexts/auth';
import TextButton from '../../components/TextButton';
import AndressContext from '../../contexts/andress';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { CategoryData } from '../../services/category';
// import { Container } from './styles';

export default function Home ({ 
  navigation,
  route
} : StackScreenProps<TabHomeParamList, 'Main'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const ref = useRef<FlatList>(null)
  const [innerScrollTop, setInnerScrollTop] = React.useState(0)

  const { users, user, signed, visitor } = useContext(AuthContext)
  const { andress, andresses, selected, selectIn } = useContext(AndressContext)

  const BottomHalfModal = useContext(BottomHalfModalContext)
  const { category } = route.params

  const { width } = useWindowDimensions()
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme()

  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [network, setNetwork] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [categories, setCategories] = React.useState<Array<CategoryData>>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { skip: (pageNumber-1)*5, limit: 5 }
      const city = 'undefined'
      const tag = category === 'main' ? 'undefined' : category
      const response = await api.get(`/city/${city}/categories/${tag}`, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))
      
      setCategories(state => 
        shouldRefresh ? response?.data
        : [...state, ...response?.data]
      )
      setNotFound(response?.data?.length > 0 ? false : true)
  
      setPage(pageNumber + 1)
    } catch ({ response }) {
      if (response?.status === 404) {
        setNotFound(true)
        setCategories([])
      }
      if (!response) setNetwork(false)
    } finally {
      setLoading(false)
    }
  }, [page, total, setPage, setCategories, setTotal, setNetwork, setNotFound, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    loadPage(1, true)
  }, [])
  
  // const HomeService = {
  //   index: async function ({ city, category }) {
  //     try {
  //       const response = await api.get(`/city/${city}/categories/${category}`)
  //       return Promise.resolve(response as AxiosResponse<Array<any>>)
  //     } catch(err) { 
  //       return Promise.reject(err as AxiosError<{ message: '' }>)
  //     } 
  //   }
  // }

  // const { 
  //   response, 
  //   loading, 
  //   refreshed,
  //   error, 
  //   onService, 
  //   onRefresh 
  // } = useService<any>(HomeService, 'index', { 
  //   city: 'undefined', 
  //   category: category === 'main' ? 'undefined' : category
  // })


  useScrollToTop(ref)

  React.useEffect(() => {
    const unsubscribe = navigation.dangerouslyGetParent()?.addListener('tabPress', (e) => {
      if (innerScrollTop <= 2 && loading) {
        ref.current?.scrollToOffset({ offset: 0, animated: true })
        onRefresh()
        // e?.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation, innerScrollTop, onRefresh, loading]);

  const onScroll = React.useCallback(event => {
    setInnerScrollTop(event?.nativeEvent?.contentOffset?.y);
  }, [setInnerScrollTop])


  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: selected ? writeAndress(andress) : 'Selecionar endereço',
      headerTitleAlign: 'left',
      headerTitle: ({ tintColor, ...props }) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          <IconButton style={{ paddingLeft: 0 }}
            label={props?.children} 
            name="expand-more" color={colors.text} size={24}
            onPress={() => BottomHalfModal.show(modalize => 
              <FlatList 
                data={andresses?.map(item => ({
                  _id: item?._id,
                  title: writeAndress(item),
                  onPress: () => selectIn(item?._id)
                })) || []}
                keyExtractor={(item, index) => `${item?._id}-${index}`}
                renderItem={({ item, index }) => 
                  <CardLink border={signed ? index !== 1 : index !== 0}
                    title={item?.title}
                    color={colors.text}
                    onPress={item?.onPress}
                    onPressed={modalize?.current?.close}
                    right={
                      <MaterialIcons style={{ padding: 10 }}
                        name={item?._id === andress?._id  ? "check-circle" : "circle"}
                        size={24}
                        color={item?._id === andress?._id ? colors.primary : colors.border}
                      />
                    }
                  />
                }
                ListFooterComponent={
                  <View style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, padding: 10 }}>
                        <ContainerButton transparent border
                          title={'Usar localização'}
                          loading={false}
                          onSubimit={() => rootNavigation.navigate('Andress')}
                          onSubimiting={modalize?.current?.close}
                        />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {selected && <View style={{ flex: 1, padding: 10 }}>
                        <ContainerButton transparent border
                          title={'Editar endereço'}
                          loading={false}
                          onSubimit={() => {
                            andress?._id === user?._id ? signed && rootNavigation.navigate('EditAccount', { id: user?._id })
                            : rootNavigation.navigate('Andress', { id: andress?._id })
                          }}
                          onSubimiting={modalize?.current?.close}
                        />
                      </View>}
                      <View style={{ flex: 1, padding: 10 }}>
                        <ContainerButton transparent border
                          title={'Novo endereço'}
                          loading={false}
                          onSubimit={() => rootNavigation.navigate('Andress')}
                          onSubimiting={modalize?.current?.close}
                        />
                      </View>
                    </View>
                  </View>
                }
              />
            )} 
          />
        </View>
      ),
      // headerRight: ({ tintColor }) => (
      //   <View style={{ flexDirection: 'row' }}>
      //     <IconButton style={{ padding: 20 }}
      //       name={'check'}
      //       size={24}
      //       color={colors.primary}
      //       onPress={onSubmit}
      //     />
      //   </View>
      // ),
    });
  }, [navigation, selected, andresses, andress, selectIn, rootNavigation]))


  // if (loading) return <Loading />
  if (!network) return <Refresh onPress={() => navigation.replace('Main')}/>
  // if (error === 'NOT_FOUND') return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>
  return (
    <PullToRefreshView
      offset={top}
      disabled={refreshing}
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshing={refreshing}
      onRefresh={() => onRefresh()}
      >
        <FlatList ref={ref}
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
          ListFooterComponent={(loading && categories?.length > 0) && <Loading />}
          onEndReached={() => loadPage()}
          onEndReachedThreshold={0.1}
          contentContainerStyle={{ flexGrow: 1, paddingTop: top, paddingBottom: bottom }}
          scrollIndicatorInsets={{ top, bottom }}
          onScroll={e => onScroll(e)}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          data={categories}
          keyExtractor={(item, index) => `${item?._id}-${index}`}
          renderItem={({ item: category, index }) => (
            <View style={{ flex: 1 }}>
                <CardLink style={{ backgroundColor: colors.card }} border={false}
                  title={category?.store?.name}
                  subTitle={'mauá - SP'}
                  color={colors.text}
                  left={
                    <Image style={{ 
                      margin: 10,
                      height: 45, width: 45, 
                      borderRadius: 40, 
                      borderWidth: 1, borderColor: colors.border, 
                      backgroundColor: colors.border 
                    }} source={{ uri: 'https://static-images.ifood.com.br/image/upload/t_high/logosgde/e28dd736-aa7e-438b-be05-123e27b621bd/202103031043_txRd_i.jpg' }}/>
                  }
                  onPress={() => navigation.navigate('Store', { store: category?.store?.name })}
                />
                <View>        
                  <SwiperFlatList horizontal
                    PaginationComponent={(props) => (
                        <CardLink style={{ backgroundColor: colors.card }} 
                          border={(categories?.length-1) !== index}
                          subTitle={category?.name}
                          onPress={() => navigation.navigate('Category', { id: category?._id, store: category?.store?.name })}
                          color={colors.text}
                          rightLabel={(props.paginationIndex+1) + ' / ' + props.size}
                          center={
                            <View style={{ flex: 1, alignItems: 'center' }}>
                              <Pagination 
                                {...props} 
                                paginationStyle={{ position: 'relative', margin:0, alignItems: 'center' }} 
                                paginationStyleItem={{ width: 6, height: 6, marginHorizontal: 4, marginVertical: 0 }} 
                                paginationActiveColor={colors.primary}
                                paginationDefaultColor={colors.border}
                              />
                            </View>
                          }
                        />
                    )}
                    index={0}
                    showPagination
                    data={category?.products}
                    renderItem={({ item }) => 
                      <View style={{ width: width }}>
                        <Product store={category?.store?.name} data={item} onPress={() => navigation.navigate('Product', { id: item?._id, store: category?.store?.name })}/>
                      </View>
                    }
                  />
              </View>
            </View>
          )}
        />
    </PullToRefreshView>
  )
}