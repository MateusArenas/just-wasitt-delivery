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
import { NavigationProp, RouteProp, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import RadioButton from '../../components/RadioButton';
import useSteeps from '../../hooks/useSteeps'
import useService from '../../hooks/useService';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import Card from '../../components/Card';
import InputCount from '../../components/InputCount';
import { useDebounceHandler, useDebounceState } from '../../hooks/useDebounce';
import SnackBar from '../../components/SnackBar'
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
  const [actionItems, setActionItems] = useState([])

  const rootNavigation = useRootNavigation()
  const [selecteds, setSelecteds] = React.useState<Array<string>>([])
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
            label={editMode ? selecteds.length > 0 ? 'Fazer' : 'Tudo' : 'Editar'}
            fontSize={18}
            color={colors.primary}
            onPress={() => (editMode && selecteds.length === 0) ? 
              setSelecteds(data?.bundles?.map(item => item?._id))
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
                        color={'red'}
                      />
                    }
                    color={'red'}
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
          setSelecteds([])
        }}/> 
      : props.canGoBack && <HeaderBackButton {...props} />,
    });
  }, [setEditMode, editMode, setSelecteds, selecteds, response]))

  function onSelected (id: string) {
    if (selecteds?.find(item => item === id)) {
      setSelecteds(selecteds => selecteds?.filter(item => item !== id))
    } else {
      setSelecteds(selecteds => [...selecteds, id])
    }
  }

  async function onClear (selecteds: Array<string>) {
    try {
      selecteds.map(onRemove)
      setSelecteds([])
      setEditMode(false)
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
      })
      rootNavigation.refresh('Root')
    } catch (err) {}
  }

  const onOpen = id => navigation.navigate('Product', { store, id })
  
  const onUpdate = (_item, quantity) => onService(async () => {
    try {
      const body = { ..._item, product: _item?.product?._id, quantity }
      await BundleService.update({ store, userId: user?._id, body })
      const bundles = data?.bundles?.map(item => item?._id === _item?._id ? ({..._item, quantity}) : item)

      return [{ ...data, bundles }]
    } catch (err) {}
  }, true)

  const onBulkCreate = React.useCallback((items) => {
    onService('save', items)
    setActionItems([])
    SnackBarRef.current?.close()
  }, [onService, setActionItems, SnackBarRef])

  const build_cart = (item) : CartService.cartData => {
    const product = typeof item?.product !== 'string' ? item?.product?._id : item?.product
    return ({ ...item, store, product }) 
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

  const [totalPrice, setTotalPrice] = React.useState<number>(0)
  useEffect(() => {
    setTotalPrice(
      products?.map(item => 
        (
          item.product?.price - 
          (
            (Math.max(...item?.product?.promotions?.map(item => item?.percent), 0) / 100 )
            * item.product?.price
          )
        ) 
        * item.quantity)?.reduce((acc, cur) => acc + cur, 0)
      )
  } ,[products])

  if (loading) return <Loading />
  if (!response.network) return <Refresh onPress={() => navigation.replace('Bag')}/>
  if (!response.ok) return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <View style={{ flex: 1, paddingBottom: bottom }}>
      <PullToRefreshView
        offset={top}
        disabled={disabled}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
          <FlatList style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: top, paddingBottom: bottom+extraBottom }}
            scrollIndicatorInsets={{ top, bottom: bottom+extraBottom }}
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
                borderBottomWidth: 1, borderColor: colors.border
              }}>
                <TextButton 
                  label={'Compartilhar'}
                  color={colors.primary}
                  fontSize={16}
                  onPress={() => navigation.navigate('Store', { store })}
                />
                <TextButton 
                  label={'Adicionar'}
                  color={colors.primary}
                  fontSize={16}
                  onPress={() => navigation.navigate('Store', { store })}
                />
              </View>
            }            
            data={data?.bundles}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item }) => (
              <CartProduct 
                editMode={editMode}
                selected={(!!selecteds?.find(id => id === item?._id) && editMode)}
                onPress={() => editMode ? onSelected(item?._id) 
                  : navigation.navigate('Product', { store, id: item?.product?._id })
                }
                onChangeQuantity={quantity => onUpdate(item, quantity)}
                product={item?.product}
                quantity={item?.quantity}
                comment={item?.comment}
              /> 
            )}
          />
          {/* <SnackBar 
            containerStyle={{ borderTopWidth: 1, borderColor: colors.border }}
            messageColor={colors.text}
            backgroundColor={colors.card}
            ref={SnackBarRef}
            position="bottom"
            autoHidingTime={5000}
            textMessage={actionItems?.map(i => `${i.quantity}x ${i.product?.name}`)?.join(', ')} 
            onClose={() => setActionItems([])}
            actionHandler={() => onBulkCreate(actionItems?.map(build_cart))} 
            actionText="DESFAZER"
            accentColor={colors.primary}
          /> */}
      </PullToRefreshView>
      
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
      </View>
    </View>
  )
}


interface CartProductProps {
  product: ProductService.ProductData
  quantity: number
  comment: string
  onPress?: () => any
  onChangeQuantity?: (quantity: number) => any
  selected?: boolean
  editMode?: boolean
}
const CartProduct: React.FC<CartProductProps> = ({
  product,
  quantity: initialQuantity=1,
  comment,
  onChangeQuantity,
  onPress,
  editMode,
  selected,
}) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  const [quantity, setQuantity] = useState(initialQuantity)

  useEffect(() => { setQuantity(initialQuantity) }, [initialQuantity])
  
  const onChangeValue = q => {
    setQuantity(q)
    useDebounceHandler(onChangeQuantity, 2000)(q)
  }
  // useEffect(useDebounceHandler(() => onUpdate(quantity), 2000), [quantity])
  console.log(quantity, 'TTT', initialQuantity);
  
  return (
      <View style={{ 
        width, 
        padding: 10,
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: editMode && selected ? colors.card : colors.background,
        borderBottomWidth: 1, borderColor: colors.border
      }}>
        {editMode && <IconButton 
          name={selected ? 'check-circle-outline' : 'circle'}
          size={24}
          color={selected ? colors.primary : colors.border}
          onPress={onPress}
        />}
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={onPress}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Image source={{ uri: product?.uri }} style={{ 
                  margin: 10,
                  height: 75, width: 75, 
                  backgroundColor: colors.border, borderRadius: 4,
                  borderWidth: 1, borderColor: colors.border
                }}/>
                <View style={{ flex: 1, alignItems: 'stretch', padding: 10 }}>
                  <Text numberOfLines={1} style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>{product?.name}</Text>
                  <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '500', opacity: .8 }}>{comment ? comment : product?.about}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    {product?.promotions?.length > 0 && 
                    <Text numberOfLines={1} style={{ marginRight: 5, color: colors.primary, fontSize: 14, fontWeight: '500', opacity: .8 }}>{
                      MaskService.toMask('money', 
                    (( product?.price - 
                      (
                        (Math.max(...product?.promotions?.map(item => item?.percent), 0) / 100 )
                        * product?.price
                      )
                    ) 
                    * quantity) as unknown as string, {
                        precision: 2,
                        separator: ',',
                        delimiter: '.',
                        unit: 'R$ ',
                        suffixUnit: ''
                      })
                    }</Text>}

                    <Text numberOfLines={1} style={{ 
                      textDecorationLine: product?.promotions?.length > 0 ? 'line-through' : 'none', 
                      fontSize: 14, 
                      color: colors.text, fontWeight: '500', opacity: .8 
                    }}>{
                      MaskService.toMask('money', (product?.price * quantity) as unknown as string, {
                        precision: 2,
                        separator: ',',
                        delimiter: '.',
                        unit: 'R$ ',
                        suffixUnit: ''
                      })
                    }</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

        <View style={{ height: '100%' }}>
          <View style={{ flex: 1 }}>
            <InputCount
              value={quantity}
              onChangeValue={onChangeValue}
              tintColor={colors.primary}
            />
          </View>
        </View>
      </View>
  )
}

