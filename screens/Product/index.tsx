import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, {  useContext, useEffect, useState, useReducer } from 'react';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import { RootStackParamList } from '../../types'; 
import * as BundleService from '../../services/bundle'
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { FlatList, Image, View, Text, ScrollView, StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { useFocusEffect, useIsFocused, useRoute, useTheme } from '@react-navigation/native';
import IconButton from '../../components/IconButton';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import AuthContext from '../../contexts/auth';
import { useBottomTabBarHeight, BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useScrollToTop } from '@react-navigation/native';
import { MaskService } from 'react-native-masked-text';
import useProductPrice, { useProductAdditionals, useProductValue } from '../../hooks/useProductPrice';
import SnackBar from '../../components/SnackBar';
import { useSetSnackExtraBottomOffset, useSnackbar } from '../../hooks/useSnackbar';
import { useBag, useBundle } from '../../hooks/useBag';
import { gql, NetworkStatus, useQuery } from '@apollo/client';
import BottomHalfModalBoard from '../../components/BottomHalfModalBoard';
import HeaderSubTitle from '../../components/HeaderSubTitle';
import ProductTemplate from '../../templates/Product';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import { buildTitle, formatedMoney } from '../../utils';


const initialState = { 
  quantity: 1, 
  comment: '', 
  components: []
};

function reducer(state: Partial<BundleService.bundleData>, action) {
  switch (action.type) {
    case 'init':
      return { ...state, ...action?.payload };
    case 'set':
      return { ...action?.payload };
    // case 'quantity':
    //   return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

const PRODUCT = gql`
query CurrentProduct($slug: String!) {
  product(match: { slug: $slug }) {
    slug, _id, uri, name, about, self, price, offset, single,

    products { slug, _id, uri, name, about, price, offset, single
      promotions { _id, name, percent, slug  }
    }
    promotions { _id, name, percent, slug }
    categories { _id, name, slug }
    # services, coupons, saleOffers,
    store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
  }
}
`;

function Product({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Product'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(0)
  const [extraSnackBottom, setExtraSnackBottom] = React.useState(0)

  const [state, dispatch] = useReducer(reducer, initialState);

  const [height, setHeight] = React.useState<number>(0)
  const ref = React.useRef<ScrollView>(null);
  const { user } = useContext(AuthContext)
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const { colors, dark } = useTheme()

  const [up, setUp] = useState(false)

  const { store, slug } = route.params

  const { loading, error, data, refetch, networkStatus } = useQuery(
    PRODUCT, 
    { 
      variables: { 
        slug,
      },
      notifyOnNetworkStatusChange: true,
      // pollInterval: 500,
    }
  )
  
  useScrollToTop(ref);

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle onPress={() => navigation.navigate('Store', { store })}>{store}</HeaderSubTitle>
          <HeaderTitle {...props} >{data?.product?.name}</HeaderTitle>
        </View>
      ,
      headerRight: ({ tintColor }: any) => (
        <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 10 }}>
          <IconButton 
            badgeEnable={!!totalQuantity} badge={{ 
              number: totalQuantity, 
              color: 'white', 
              background: colors.notification, 
              overlay: colors.background 
            }}
            name="shopping-bag" 
            size={24} 
            color={colors.text} 
            onPress={() => navigation.navigate('Bag', { store })} 
          />
          <IconButton 
            name="more-horiz" 
            size={24} 
            color={colors.text} 
            onPress={() => BottomHalfModal.show(modalize => 
              <BottomHalfModalBoard rendered={{ data: data?.product?.self }}
                boardData={[
                  { icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => {} },
                  { icon: 'link', color: colors.text, title: 'Link', onPress: () => {} },
                  { icon: 'store', color: colors.text, title: store, onPress: () => navigation.navigate('Store', { store }) },
                ]}
                data={[
                  { icon: 'add-circle-outline', color: colors.primary, title: 'Criar', onPress: () => navigation.navigate('MakeProduct', { store })},
                  { icon: 'edit', color: colors.text, title: 'Editar', onPress: () => {navigation.navigate('MakeProduct', { store, slug }); console.log({ store, id: data?.product?._id });}},
                  { icon: 'delete', color: colors.notification, title: 'Remover', onPress: () => {} },
                ]}
                onClose={modalize?.current?.close}
              />
            )} 
          />
        </View>
      ),
    });
  }, [data]))


  const bagResponse = useBag(//select
    data => data?.find(item => (item?._id === store && item?.user === user?._id) )
  )

  const totalPrice = bagResponse?.data?.product?.bundles?.map(bundle => {
    return useProductPrice(bundle) * bundle?.quantity
  })?.reduce((acc, cur) => acc + cur, 0) 

  const totalQuantity = bagResponse?.data?.product?.bundles?.map(cart => cart?.quantity)?.reduce((acc, cur) => acc + cur, 0) | 0

  const bundleResponse = useBundle(
    items => items?.find(item => (item?._id === store && item?.user === user?._id) )
    ?.bundles?.find(item => (item?._id === data?.product?._id && item?.user === user?._id) )
  ) 

  useEffect(() => {
    (async () => {
      try {
        if (data) {
          // load initial
          dispatch({ type: 'set', payload: {
            product: data?.product?._id,
            store: data?.product?.store?._id,
            user: user?._id,
            quantity: 1, comment: '',
            components: data?.product?.products?.map(item => ({
              quantity: 0,
              product: item?._id,
              components: item?.products?.map(subItem => ({
                quantity: 0,
                product: subItem?._id,
              }))
            }))
          } })

          console.log('mateus', bundleResponse?.data?.product?._id);
          
          if (bundleResponse?.data) {
            dispatch({ type: 'set', payload: {
              ...initialState,
              // ...bundleResponse?.data,
              _id: bundleResponse?.data?.product?._id,
              quantity: bundleResponse?.data?.product?.quantity, 
              comment: bundleResponse?.data?.product?.comment,
              components: bundleResponse?.data?.product?.components?.map(item => ({
                ...item,
                product: item?.product?._id,
                components: item?.components?.map(subItem => ({
                  ...subItem,
                  product: subItem?.product?._id,
                }))
              }))
            } })
          } else {
            dispatch({ type: 'init', payload: { _id: undefined } })
          }
          
        }
      } catch (err) {}
    })()
  } ,[user, data, bundleResponse?.data])

  const bundle = React.useMemo(() => ({
    ...state,
    user: user?._id,
    store: data?.product?.store,
    product: data?.product,
    components: state?.components?.map(byItem => ({
      ...byItem,
      product: data?.product?.products?.find(item => item?._id === byItem?.product),
      components: byItem?.components?.map(subItem => ({
        ...subItem,
        product: data?.product?.products?.find(item => item?._id === byItem?.product)
          ?.products?.find(item => item?._id === subItem?.product)
      })) 
    }))
  }), [state, data])

  const saveToCart = async ({ quantity, comment }) => {
    console.log('on save');
    try {
      await bundleResponse?.onCreateBundle({ store, userId: user?._id }, { 
        _id: data?.product?._id, 
        store: data?.product?.store?._id,
        product: data?.product?._id, 
        user: user?._id, 
        components: state?.components,
        quantity, 
        comment,
      })

      setUp(false)
      dispatch({ type: 'init', payload: { _id: data?.product?._id, quantity, comment } })
    } catch (err) {}
  }
  
  const snackbar = useSnackbar()

  const onRemove = async () => {
    try {
      await bundleResponse?.onRemoveBundle({ store, userId: user?._id, id: data?.product?._id })
      dispatch({ type: 'init', payload: { _id: undefined, quantity: 1, comment: '' } })
      setUp(false)
      snackbar?.open({
        visible: true,
        autoHidingTime: 5000,
        messageColor: colors.text,
        position: "bottom",
        badge: bundleResponse?.data?.product?.quantity,
        badgeColor: 'white',
        badgeBackgroundColor: colors.notification,
        textMessage: data?.product?.name,
        actionHide: true,
        actionHandler: () => onRestore([bundleResponse?.data]),
        actionText: "DESFAZER",
        accentColor: colors.primary,
      })      
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
        await bundleResponse.onCreateBundle({  store, userId: user?._id }, body )
        return item
      })) 
    } catch (err) {}
  }

  const onUpdate = async ({ quantity, comment }) => {
    try {
      await bundleResponse?.onUpdateBundle({ store, userId: user?._id }, { 
        _id: data?.product?._id, 
        store: data?.product?.store?._id,
        product: data?.product?._id, 
        user: user?._id, 
        components: state?.components,
        quantity, 
        comment,
      })
      setUp(false)
      dispatch({ type: 'init', payload: { _id: data?.product?._id, quantity, comment } })
    } catch (err) {}
  }

  function handleComment (comment) {
    setUp(bundleResponse.data?.product?.comment !== comment)
    dispatch({ type: 'init', payload: { comment } })
  }

  function handleQuantity (quantity) {
    setUp(bundleResponse.data?.product?.quantity !== quantity)
    dispatch({ type: 'init', payload: { quantity } })
  }

  function handleAddQuantity (id: string, body: Partial<BundleService.componentData>) {
    setUp(true)
    dispatch({ type: 'init', payload: { ...state, components: [
        ...state?.components?.map(item => 
          item?.product !== id ? item : { ...item, ...body }
        )
      ] 
    } })
  }

  const setExtraBottomOffset = useSetSnackExtraBottomOffset()

  useFocusEffect(React.useCallback(() => {
    if (extraBottom) setExtraBottomOffset(((extraBottom/2)+20)+((extraSnackBottom/2)+20))
    return function cleanup () {
      setExtraBottomOffset(0)
    }
  }, [setExtraBottomOffset, extraBottom, extraSnackBottom]))

  if (networkStatus === NetworkStatus.loading && loading) return <Loading />
  if ((error || !data?.product) && networkStatus !== NetworkStatus.loading) return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        offset={top}
        disabled={(networkStatus === NetworkStatus.refetch && loading)}
        refreshing={(networkStatus === NetworkStatus.refetch && loading)}
        onRefresh={refetch}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
          <NotFound 
            title={error?.message} 
            redirectText={`Go to home screen!`}
          />
        </ScrollView>
      </PullToRefreshView>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        offset={top}
        disabled={(networkStatus === NetworkStatus.refetch && loading)}
        refreshing={(networkStatus === NetworkStatus.refetch && loading)}
        onRefresh={refetch}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ProductTemplate ref={ref} 
          extraBottom={extraBottom}
          focusable
          keyboardDismissMode={'none'}
          keyboardShouldPersistTaps={'handled'}
          style={{ flex: 1 }}
          contentContainerStyle={[
            { marginTop: top, paddingBottom: top+bottom+extraBottom+(extraSnackBottom) },
            { flexGrow: 1 }
          ]}
          scrollIndicatorInsets={{ top, bottom: bottom+extraBottom+(extraSnackBottom) }}
          store={store}
          state={state}
          bundle={bundle}
          data={data?.product}
          handleProduct={params => navigation.push('Product', params)}
          handleCategory={params => navigation.navigate('Category', params)}
          handlePromotion={params => navigation.navigate('Promotion', params)}
          handleStore={params => navigation.navigate('Store', params)}
          onChangeQuantity={handleQuantity}
          onChangeAddQuantity={handleAddQuantity}
          onChangeComment={handleComment}
          up={up}
          onSave={saveToCart}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onLayoutControll={({ nativeEvent: { layout: { height } } }) => setExtraBottom(height)}
        />

      </PullToRefreshView>
      <KeyboardSpacer topSpacing={-(bottom+extraBottom+extraSnackBottom)} />
      {/* <SnackBar visible 
        onLayout={e => setExtraSnackBottom(e?.nativeEvent?.layout?.height)}
        messageColor={colors.text}
        dark={dark}
        position={"bottom"}
        bottom={bottom+(extraBottom)}
        icon={'shopping-bag'}
        iconColor={colors.text}
        textDirection={'row'}
        textMessage={formatedMoney(totalPrice)}
        textSubMessage={!data?.product?.store?.minDeliveryBuyValue ? undefined : (" / " + 
        formatedMoney(data?.product?.store?.minDeliveryBuyValue))}
        indicatorIcon
        onPress={() => navigation.navigate('Bag', { store })}
        actionText={`${totalQuantity}`}
        accentColor={colors.primary}
      /> */}
    </View>
  )
}

export default Product



