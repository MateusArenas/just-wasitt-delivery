import { HeaderTitle, StackNavigationOptions, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import IconButton from '../../components/IconButton';
import { RootStackParamList } from '../../types';
import useRootNavigation from '../../hooks/useRootNavigation';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useFocusEffect, useIsFocused, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import {  View, Image, Text, useWindowDimensions, LayoutChangeEvent, TextInput } from 'react-native';
import NotFound from '../../components/NotFound';
import { StoreDate } from '../../services/store';
import ScrollableTabString from '../../components/ScrollableTabString';
import { CategoryData } from '../../services/category';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import ContainerButton from '../../components/ContainerButton';
import ProfileCard from '../../components/ProfileCard';
import ProfileStatistic from '../../components/ProfileStatistic';
import AuthContext from '../../contexts/auth';
import { getDay } from 'date-fns';
import useStoreStatus from '../../hooks/useStoreStatus';
import Product from '../../models/Product';
import * as FollowerService from '../../services/follower';
import CardLink from '../../components/CardLink';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaskService } from 'react-native-masked-text';
import useProductPrice from '../../hooks/useProductPrice';
import SnackBar from '../../components/SnackBar';
import { useSetSnackBottomOffset, useSetSnackExtraBottomOffset, useSnackbar, useSnackbarHeight } from '../../hooks/useSnackbar';
import { useBag } from '../../hooks/useBag';
import { useSaved } from '../../hooks/useSaved';
import { gql, NetworkStatus, useQuery, useSubscription } from '@apollo/client';
import BottomHalfModalBoard from '../../components/BottomHalfModalBoard';
import { STORE_NAME } from './graphql';
import { TouchableOpacity } from 'react-native-gesture-handler';
import StoreTemplate from '../../templates/Store';

const COMMENTS_SUBSCRIPTION = gql`
  subscription OnNewUser {
    newUser {
      _id
    }
  }
`;

function Store({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Store'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)
  
  const { width } = useWindowDimensions()
  const { user, signed } = useContext(AuthContext)
  // const { store } = route?.params
  const store = route?.params?.store

  const { colors, dark } = useTheme();
  const [index, setIndex] = useState(0)

  const bagResponse = useBag(//select
    data => data?.find(item => (item?._id === store && item?.user === user?._id) )
  )
  
  const totalPrice = bagResponse.data?.bundles?.map(bundle => {
    return useProductPrice(bundle) * bundle?.quantity
  })?.reduce((acc, cur) => acc + cur, 0) 
  const totalQuantity = bagResponse.data?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0

  const rootNavigation = useRootNavigation()

  const { loading, error, data: curentStore, refetch, networkStatus } = useQuery(
    STORE_NAME, 
    { 
      variables: { 
        matchName: store
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      // pollInterval: 500,
    }
  )

  const { data: ws } = useSubscription(
    COMMENTS_SUBSCRIPTION
  );
  
  useEffect(() => {
    console.log({ ws });
  }, [ws])
  
  const data = curentStore?.store

  useEffect(() => {
    console.log((networkStatus === NetworkStatus.refetch && loading));
    
  }, [(networkStatus === NetworkStatus.refetch && loading)])

  function handleOptions () {
    return BottomHalfModal.show(modalize => (
        <BottomHalfModalBoard 
          boardData={[
            { key: 0, icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => navigation.navigate('Store', { store })},
            { key: 1, icon: 'link', color: colors.text, title: 'Link', onPress: () => navigation.navigate('Store', { store })},
            { key: 2, icon: 'sim-card-alert', color: 'red', title: 'Denunciar', onPress: () => {} },
          ]}
          data={[
            { key: 0, icon: 'account-circle', color: colors.text, title: 'Conta', onPress: () => navigation.navigate('Account')},
            { key: 1, icon: 'business', color: colors.text, title: 'Pedidos', onPress: () => navigation.navigate('Orders', { store: route.params?.store })},
            { key: 2, icon: 'delete', color: colors.notification, hover: colors.notification, title: 'Remover', onPress: () => {} },
          ]}
          rendered={{ data: data?.self }}
          onClose={modalize?.current?.close}
        />
      )
    )
  }

  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: store,
      headerRight: ({ tintColor }) => (
        <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10 }}>
          {!!data?.self && <IconButton 
            name={'add-circle-outline'}
            size={24} 
            color={colors.text} 
            onPress={() => BottomHalfModal.show(modalize => 
              <BottomHalfModalBoard 
                boardData={[
                  { key: 0, icon: 'local-offer', title: 'Produto', length: data?.products?.length, onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                  { key: 1, icon: 'tag', title: 'Categoria', length: data?.categories?.length, onPress: () => rootNavigation.navigate('MakeCategory', { store: route.params?.store })},
                  { key: 2, icon: 'anchor', title: 'Promoção', length: data?.promotions?.length, onPress: () => rootNavigation.navigate('MakePromotion', { store: route.params?.store })},
                  { key: 3, icon: 'work', title: 'Serviço', length: data?.services?.length, disabled: true, onPress: () => {} },
                  { key: 4, icon: 'local-attraction', title: 'Cupom', length: data?.coupons?.length, disabled: true, onPress: () => {} },
                  { key: 5, icon: 'local-fire-department', title: 'Liquidação', length: data?.saleOffers?.length, disabled: true, onPress: () => {} },
                ]}
                onClose={modalize?.current?.close}
              />
            )} 
          />}
          <IconButton 
            name={"more-horiz"} 
            size={24} 
            color={colors.text} 
            onPress={handleOptions} 
          />
        </View>
      ),
    });
  }, [navigation, data, user, BottomHalfModal]))

  const setExtraBottomOffset = useSetSnackExtraBottomOffset()

  useFocusEffect(React.useCallback(() => {
    if (extraBottom) setExtraBottomOffset((extraBottom/2)+20)
    return function cleanup () {
      setExtraBottomOffset(0)
    }
  }, [setExtraBottomOffset, extraBottom]))

  
  if (networkStatus === NetworkStatus.loading && loading) return <Loading />
  // if (!response.network) return <Refresh onPress={() => navigation.replace('Store', { store })}/>
  // if (!response.ok) return <NotFound title={`This store doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1 }} >
      <PullToRefreshView 
        offset={top}
        style={{ flex: 1 }}
        disabled={(networkStatus === NetworkStatus.refetch && loading)}
        refreshing={(networkStatus === NetworkStatus.refetch && loading)}
        onRefresh={() => refetch({ matchName: store })}
      >
        <StoreTemplate handleOptions={handleOptions}
          store={store}
          data={curentStore}
          handleBag={params => navigation.navigate('Bag', params)}
          handleCategory={params => navigation.navigate('Category', params)}
          handlePromotion={params => navigation.navigate('Promotion', params)}
          handleProduct={params => navigation.navigate('Product', params)}
          handleProducts={params => navigation.navigate('Products', params)}
        />
      </PullToRefreshView>
    </View>
  )
}

export default Store;

