import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useContext } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text } from 'react-native';
import { FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
// import { Product2 } from '../../components/Product';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Refresh from '../../components/Refresh';
import useService from '../../hooks/useService';
import api from '../../services/api';
import { RootStackParamList, TabExploreParamList } from '../../types';
import * as FollowerService from '../../services/follower';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import useRootNavigation from '../../hooks/useRootNavigation';
import { useTheme } from '@react-navigation/native';
import AuthContext from '../../contexts/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function Followers({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'Followers'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const { store } = route.params
  const { colors } = useTheme()

  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<FollowerService.FollowerData>(FollowerService, 'index', { store, params: {} })

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.replace('Followers')}/>
  if (error === 'NOT_FOUND') return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>
  return (
      <PullToRefreshView
        offset={top}
        refreshing={loading === 'REFRESHING'}
        onRefresh={() => onRefresh('index', { store, params: {} })}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
          <FlatList style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
            scrollIndicatorInsets={{ top, bottom }}
            data={response?.data}
            ItemSeparatorComponent={() => <View style={{ height: 1, width: '100%', backgroundColor: colors.border }}/>}
            renderItem={({ item } : { item: FollowerService.FollowerData }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <MaterialIcons style={{ padding: 10 }}
                  name="account-circle"
                  size={24}
                  color={colors.text}
                />
                <Text style={{ flex: 1,  }}>{item?.name}</Text>
              </View>
            )}
          />
      </PullToRefreshView>
  )
}