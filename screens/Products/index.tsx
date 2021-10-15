import { StackScreenProps, useHeaderHeight } from "@react-navigation/stack";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Text, useWindowDimensions, Animated, FlatList, StyleProp, ViewStyle } from 'react-native';
import { View } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Card from "../../components/Card";
import IconButton from "../../components/IconButton";
import useService from "../../hooks/useService";
import { RootStackParamList } from "../../types";
import * as ProductService from '../../services/product';
import { ProductData } from '../../services/product'
import useRootNavigation from "../../hooks/useRootNavigation";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import Refresh from "../../components/Refresh";
import Product from "../../models/Product";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useScrollToTop, useTheme } from "@react-navigation/native";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBar";
import KeyboardSpacer from '../../components/KeyboardSpacer';
import { useCollapsibleSubHeader, CollapsibleSubHeaderAnimator } from 'react-navigation-collapsible';
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../services/api";
import { AxiosError } from "axios";
import { PullToRefreshView } from "../../components/PullToRefreshView";

export default function Products ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Products'>)  {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const ref = React.useRef<FlatList>(null)
  
  useScrollToTop(ref)
  
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const { store } = route.params

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
  const [products, setProducts] = React.useState<Array<ProductData>>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { name: search, skip: (pageNumber-1)*5, limit: 5 }
      const response = await api.get(`/store/${store}/products`, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))
      
      setProducts(state => 
        shouldRefresh ? response?.data
        : [...state, ...response?.data]
      )
      setNotFound(response?.data?.length > 0 ? false : true)
  
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
  }, [page, total, search, setPage, setProducts, setTotal, setNetwork, setNotFound, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    loadPage(1, true)
  }, [search])

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
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
  }, [navigation, colors]))

  if (!network) return <Refresh onPress={() => navigation.replace('Products', { store })}/>

  return (
    <View style={{ flex: 1 }}>
        <PullToRefreshView
          offset={containerPaddingTop-10}
          disabled={refreshing}
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <FlatList ref={ref}
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
        {/* <Text>{products?.length}</Text> */}
          <SearchBar placeholder={'Buscar por nome de produtos'}
            value={name}
            onChangeText={setName}
          />
        </View>
      </CollapsibleSubHeaderAnimator>
    </View>
  )
}

