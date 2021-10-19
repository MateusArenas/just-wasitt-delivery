import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useContext } from 'react';
import { useWindowDimensions, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, Image } from 'react-native';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Refresh from '../../components/Refresh';
import useService from '../../hooks/useService';
import api from '../../services/api';
import { TabExploreParamList } from '../../types';
import * as Cart from '../../services/cart';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import useRootNavigation from '../../hooks/useRootNavigation';
import { useTheme } from '@react-navigation/native';
import AuthContext from '../../contexts/auth';
import Product from '../../models/Product';
import IconButton from '../../components/IconButton';
import { MaterialTopTabView } from '@react-navigation/material-top-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { StoreDate } from '../../services/store';
import CardLink from '../../components/CardLink';
import { forModalPresentationIOS } from '@react-navigation/stack/lib/typescript/src/TransitionConfigs/CardStyleInterpolators';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function Categories({
  navigation,
  route,
} : StackScreenProps<TabExploreParamList, 'Categories'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const { user } = useContext(AuthContext)
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const { category } = route.params

  const { width } = useWindowDimensions()
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme()
  
  const HomeService = {
    index: async function ({ city, category }) {
      try {
        const response = await api.get(`/city/${city}/categories/${category}`)
        return Promise.resolve(response as AxiosResponse<Array<any>>)
      } catch(err) { 
        return Promise.reject(err as AxiosError<{ message: '' }>)
      } 
    }
  }

  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<any>(HomeService, 'index', { 
    city: 'undefined', 
    category: category === 'main' ? 'undefined' : category
  })
  
  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.replace('Main')}/>
  if (error === 'NOT_FOUND') return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>
  return (
      <PullToRefreshView
        offset={top}
        refreshing={loading === 'REFRESHING'}
        onRefresh={() => onRefresh('index', { 
            city: 'undefined', 
            category: category === 'main' ? 'undefined' : category
        })}
        style={{ flex: 1, backgroundColor: colors.background }}
        >
          <FlatList style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
            scrollIndicatorInsets={{ top, bottom }}
            data={response?.data}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item: category, index }) => (
              <View style={{ flex: 1 }}>
                <CardLink style={{ backgroundColor: colors.card }}
                  border={false}
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
                          border={(response?.data?.length-1) !== index}
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
                    renderItem={({ item: product }) => 
                      <View style={{ width: width }}>
                        <Product store={category?.store?.name} data={product} onPress={() => navigation.navigate('Product', { id: product?._id, store: category?.store?.name })}/>
                        
                        <View style={{ paddingHorizontal: 10, backgroundColor: colors.card, flexDirection: 'row' }}>
                          {[].concat(
                            product?.categories?.map(item => ({ 
                              _id: item?._id, name: `#${item?.name}`,
                              onPress: () => navigation.navigate('Category', { store: category?.store?.name, id: item?._id })
                            }))).concat( 
                              product?.promotions?.map(item => ({ 
                              _id: item?._id, name: `%${item?.name}`,
                              onPress: () => navigation.navigate('Promotion', { store: category?.store?.name, id: item?._id })
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
