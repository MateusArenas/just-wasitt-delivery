import { StackScreenProps, useHeaderHeight } from "@react-navigation/stack";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Animated, Text, TextInput, useWindowDimensions } from 'react-native';
import { View, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Card from "../../components/Card";
import IconButton from "../../components/IconButton";
import useService from "../../hooks/useService";
import { RootStackParamList } from "../../types";
import * as PromotionService from '../../services/promotion';
import { ProductData } from '../../services/product'
import useRootNavigation from "../../hooks/useRootNavigation";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import Refresh from "../../components/Refresh";
import Product from "../../models/Product";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useScrollToTop, useTheme } from "@react-navigation/native";
import BottomHalfModalContext from '../../contexts/BottomHalfModal'
import AuthContext from "../../contexts/auth";
import CardLink from "../../components/CardLink";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import KeyboardSpacer from "../../components/KeyboardSpacer";
import { CollapsibleSubHeaderAnimator, useCollapsibleSubHeader } from "react-navigation-collapsible";
import SearchBar from "../../components/SearchBar";
import { useDebounce } from "../../hooks/useDebounce";
import { PromotionData } from "../../services/promotion";
import api from "../../services/api";
import { PullToRefreshView } from "../../components/PullToRefreshView";
import { MaterialIcons } from "@expo/vector-icons";

export default function Promotion ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Promotion'>)  {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const FlatListRef = React.useRef<FlatList>(null)
  const InputRef = React.useRef<TextInput>(null)
  
  useScrollToTop(FlatListRef)
  
  const { user } = useContext(AuthContext)
  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const { width } = useWindowDimensions()
  const { store, id } = route.params
  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  const [name, setName] = useState('')

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
  const [promotion, setPromotion] = React.useState<PromotionData>({} as PromotionData)
  const [products, setProducts] = React.useState<Array<ProductData>>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { search, skip: (pageNumber-1)*5, limit: 5 }
      const response = await api.get(`/store/${store}/promotions/${id}`, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))

      setPromotion(response?.data)
      setProducts(state => 
        shouldRefresh ? response?.data?.products
        : [...state, ...response?.data?.products]
      )
      setNotFound(response?.data?.products?.length > 0 ? false : true)
  
      setPage(pageNumber + 1)
    } catch ({ response }) {
      if (response?.status === 404) {
        setNotFound(true)
        setProducts([])
      }
      if (!response) setNetwork(false)
    } finally {
      setLoading(false)
    }
  }, [page, total, search, setPage, setPromotion, setProducts, setTotal, setNetwork, setNotFound, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    loadPage(1, true)
  }, [search])

  async function onRemove () {
    try {
      await PromotionService.remove({ store, id })
      navigation.replace('Store', { store })
    } catch(err) {

    }
  }

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: promotion?.name,
      // headerTitle: ({ tintColor, children }) => (
      //   <IconButton style={{ padding: 0 }}
      //     label={children} 
      //     name="expand-more" color={colors.text} size={24}
      //     onPress={() => BottomHalfModal.show(modalize => 
      //       <FlatList 
      //         data={[
      //           ...promotion?.otherPromotions?.map(({ _id, name }) => ({
      //             key: _id,
      //             color: colors.text,
      //             title: name,
      //             onPress: () => navigation.replace('Promotion', { store, id: _id })
      //           })) || [],
      //           { key: 'footer', color: colors.primary, title: 'Criar Promoção', onPress: () => rootNavigation.navigate('MakePromotion', { store })},
      //         ]}
      //         keyExtractor={(item, index) => `${item?.key}-${index}`}
      //         renderItem={({ item }) => 
      //           <CardLink 
      //             title={item?.title}
      //             color={item?.color}
      //             onPress={item?.onPress}
      //             onPressed={modalize?.current?.close}
      //           />
      //         }
      //       />  
      //     )} 
      //   />
      // ),
      headerRight: ({tintColor}) => (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <IconButton 
            name="more-horiz"
            size={24}
            color={colors.text}
            onPress={() => BottomHalfModal.show(modalize => 
              <FlatList 
              ListHeaderComponentStyle={{ padding: 5 }}
              ListHeaderComponent={
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  {[
                    { key: 1, icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                    { key: 1, icon: 'link', color: colors.text, title: 'Link', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                    { key: 2, icon: 'sim-card-alert', color: 'red', title: 'Denunciar', onPress: async function onRemove () {
                      try {
                        // await ProductService.remove({ store, id })
                        // navigation.replace('Store', { store })
                      } catch(err) {
                  
                      }
                    } },
                  ].map(item => (
                    <View style={{ 
                      padding: 10, paddingTop: 0,
                      flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                      marginHorizontal: 5, alignItems: 'center', 
                    }}>
                      <IconButton style={{ padding: 20 }}
                        name={item?.icon as any}
                        size={24}
                        color={item?.color}
                        onPress={item?.onPress}
                        onPressed={modalize?.current?.close}
                      />
                      <Text style={{ color: item?.color, fontSize: 12, 
                        position: 'absolute', bottom: 10
                      }}>{item?.title}</Text>
                    </View>
                  ))}
                </View>
                // <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{'Produto'}</Text>
              }
              data={
                promotion?.self ? [
                  { key: 0, icon: 'add-circle-outline', color: colors.primary, title: 'Criar', onPress: () => navigation.navigate('MakePromotion', { store })},
                  { key: 1, icon: 'edit', color: colors.text, title: 'Editar', onPress: () => navigation.navigate('MakePromotion', { store, id })},
                  { key: 2, icon: 'delete', color: 'red', title: 'Remover', onPress: async function onRemove () {
                    try {
                      await PromotionService.remove({ store, id })
                      navigation.replace('Store', { store })
                    } catch(err) {
                
                    }
                  } },
                ] : []
              }
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={item => `${item?.key}`}
              renderItem={({ item, index }) => 
                <CardLink style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius: index === 2 ? 10 : 0, borderBottomRightRadius: index === 2 ? 10 : 0,
                    marginTop: index === 0 ? 10 : 0, marginBottom: index === 2 ? 10 : 0,
                    marginHorizontal: 10,
                  }}
                  border={index !== 2}
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
                    title={store}
                    right={
                      <MaterialIcons style={{ padding: 20 }}
                        name={'store'}
                        size={24}
                        color={colors.text}
                      />
                    }
                    color={colors.text}
                    onPress={() => navigation.navigate('Store', { store })}
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
          />
        </View>
      ),
    });
  }, [navigation, promotion]))

  if (!network) return <Refresh onPress={() => navigation.replace('Promotion', { store, id })}/>
  
  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
          offset={containerPaddingTop-10}
          disabled={refreshing}
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <FlatList ref={FlatListRef}
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
            ListFooterComponent={(loading && products?.length > 0) && <Loading />}
            onEndReached={() => loadPage()}
            onEndReachedThreshold={0.1}
            onScroll={onScroll}
            contentContainerStyle={{ flexGrow: 1, paddingTop: containerPaddingTop, paddingBottom: bottom }}
            scrollIndicatorInsets={{ top: containerPaddingTop, bottom }}
            data={products}
            numColumns={2}
            columnWrapperStyle={{ flex: 1 }}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item } : { item: ProductData }) => (
              <View style={{ width: (width/2) - 2, padding: 2 }}>
                <Product 
                  store={store}
                  data={{...item, about: null}}
                  height={width/3} 
                  onPress={() => navigation.navigate('Product', { id: item?._id, store })}
                  />
              </View>
            )}
            />
        </PullToRefreshView>
      <KeyboardSpacer topSpacing={-bottom} />
      <CollapsibleSubHeaderAnimator translateY={translateY}>
        <View style={{ padding: 20, marginTop: top }}>
          <SearchBar placeholder={'Buscar por nome de produtos'}
            value={name}
            onChangeText={setName}
          />
        </View>
      </CollapsibleSubHeaderAnimator>
    </View>
  )
}
